/* Runs kid Python in the browser (Pyodide). Robot/game functions are injected as plain builtins. */
(function () {
  const CFM = (window.CFM = window.CFM || {});
  const RUNNER = `
import sys, json
def _cfm_run(code, ns, limit):
    try:
        compiled = compile(code, "<kid>", "exec")
    except SyntaxError as e:
        return json.dumps({"kind": "SyntaxError", "line": e.lineno or 0, "msg": e.msg})
    count = [0]
    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<kid>":
            return None
        def local(frame, event, arg):
            if event == "line":
                count[0] += 1
                if count[0] > limit:
                    raise RuntimeError("CFM:Your program ran for too long. Is there a loop that never ends?")
            return local
        return local
    sys.settrace(tracer)
    try:
        exec(compiled, ns)
    except BaseException as e:
        tb, line = e.__traceback__, 0
        while tb:
            if tb.tb_frame.f_code.co_filename == "<kid>":
                line = tb.tb_lineno
            tb = tb.tb_next
        return json.dumps({"kind": type(e).__name__, "line": line, "msg": str(e)})
    finally:
        sys.settrace(None)
    return json.dumps({"kind": "ok"})
`;
  let pyodide = null, tickTimer = null;
  const py = (CFM.py = { stdout: () => {}, onError: () => {}, failed: false });

  py.ready = (async function boot() {
    try {
      if (typeof loadPyodide !== "function") throw new Error("no pyodide");
      pyodide = await loadPyodide();
      pyodide.setStdout({ batched: (s) => py.stdout(s) });
      pyodide.setStderr({ batched: (s) => py.stdout(s, true) });
      pyodide.FS.writeFile("/home/pyodide/game.py", await (await fetch("py/game.py")).text());
      pyodide.runPython(RUNNER);
      return pyodide;
    } catch (e) { console.error(e); py.failed = true; throw e; }
  })();
  py.ready.catch(() => {});

  /* Turn a Python error into something a kid can act on. */
  py.friendly = function (r) {
    const m = r.msg || "", at = r.line ? ` (line ${r.line})` : "";
    if (m.includes("CFM:")) return m.slice(m.indexOf("CFM:") + 4).replace(/\n[\s\S]*/, "").trim() + at;
    if (r.kind === "SyntaxError" || r.kind === "IndentationError") return `Python can't read line ${r.line || "?"}: ${m}. Check colons ( : ), quotes, brackets and spaces.`;
    if (r.kind === "NameError") { const w = (m.match(/'(.+?)'/) || [])[1]; return `Python doesn't know the word "${w}"${at}. Did you spell it right? Did you make it first?`; }
    if (r.kind === "TypeError" && /argument/.test(m)) return `A command got the wrong number of things inside ( )${at}: ${m}`;
    return `${r.kind}: ${m}${at}`;
  };

  py.stop = function () { if (tickTimer) { clearInterval(tickTimer); tickTimer = null; } };

  /* run(code, {name: fn, ...}) -> {ok:true} | {ok:false, message, line} */
  py.run = async function (code, extras, opts) {
    opts = opts || {};
    const p = await py.ready; py.stop();
    p.runPython("import sys\nsys.modules.pop('game', None)");
    const ns = p.runPython("dict(__name__='__main__')");
    Object.entries(extras || {}).forEach(([k, v]) => ns.set(k, v));
    const res = JSON.parse(p.globals.get("_cfm_run")(code, ns, opts.limit || 200000));
    ns.destroy();
    if (res.kind !== "ok") return { ok: false, message: py.friendly(res), line: res.line };
    const hasTick = p.runPython("'game' in sys.modules and sys.modules['game']._has_tick()");
    if (hasTick) {
      const ms = p.runPython("sys.modules['game']._tick_interval_ms()");
      tickTimer = setInterval(() => {
        try { p.runPython("sys.modules['game']._dispatch_tick()"); }
        catch (e) { py.stop(); const s = String(e); const lm = s.match(/File "<kid>", line (\d+)/g); const last = lm ? lm[lm.length - 1].match(/\d+/)[0] : 0; const en = (s.trim().split("\n").pop() || "").split(": "); py.onError(py.friendly({ kind: en[0], msg: en.slice(1).join(": "), line: +last })); }
      }, ms);
      return { ok: true, game: true };
    }
    return { ok: true };
  };

  /* Keyboard state for key_down() */
  window.__keys = new Set();
  window.addEventListener("keydown", (e) => {
    if (/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName)) return;
    window.__keys.add(e.key); if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
  });
  window.addEventListener("keyup", (e) => window.__keys.delete(e.key));
  window.addEventListener("blur", () => window.__keys.clear());
})();
