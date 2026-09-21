/* Scratch-style block editor that writes real Python as you build. */
(function () {
  const CFM = (window.CFM = window.CFM || {});
  const CONDS = [["path_ahead()", "path ahead"], ["path_left()", "path to the left"], ["path_right()", "path to the right"], ["on_gem()", "on a gem"], ["at_goal()", "at the goal"], ["not path_ahead()", "no path ahead"], ["not on_gem()", "not on a gem"], ["not at_goal()", "not at the goal"]];
  const DEFS = {
    move: { cls: "motion", label: "move forward", py: () => "move()" },
    turn_left: { cls: "motion", label: "turn left ⟲", py: () => "turn_left()" },
    turn_right: { cls: "motion", label: "turn right ⟳", py: () => "turn_right()" },
    collect: { cls: "action", label: "collect gem 💎", py: () => "collect()" },
    say: { cls: "say", label: "say", input: "text", def: "Hi!", py: (v) => `say("${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")` },
    repeat: { cls: "loop", label: "repeat", after: "times", input: "number", def: 3, c: 1, head: (v) => `for i in range(${Math.max(0, parseInt(v) || 0)}):` },
    while: { cls: "loop", label: "repeat while", select: 1, def: "not at_goal()", c: 1, head: (v) => `while ${v}:` },
    if: { cls: "logic", label: "if", select: 1, def: "path_ahead()", c: 1, head: (v) => `if ${v}:` },
    ifelse: { cls: "logic", label: "if", select: 1, def: "path_ahead()", c: 2, head: (v) => `if ${v}:` },
  };
  let uid = 1, drag = null;

  const findParent = (list, b) => { const i = list.indexOf(b); if (i >= 0) return { list, i }; for (const x of list) for (const k of ["kids", "kids2"]) if (x[k]) { const r = findParent(x[k], b); if (r) return r; } return null; };
  const inside = (b, list) => b.kids === list || b.kids2 === list || [...(b.kids || []), ...(b.kids2 || [])].some((k) => inside(k, list));
  const clone = (b) => ({ id: uid++, t: b.t, v: b.v, kids: (b.kids || []).map(clone), kids2: (b.kids2 || []).map(clone) });
  const make = (t) => { const d = DEFS[t]; return { id: uid++, t, v: d.def, kids: [], kids2: [] }; };

  function toPython(list, ind) {
    ind = ind || 0; const pad = "    ".repeat(ind), out = [];
    list.forEach((b) => {
      const d = DEFS[b.t];
      if (!d.c) return out.push(pad + d.py(b.v));
      out.push(pad + d.head(b.v)); out.push(...(b.kids.length ? toPython(b.kids, ind + 1).split("\n") : [pad + "    pass"]));
      if (d.c === 2) { out.push(pad + "else:"); out.push(...(b.kids2.length ? toPython(b.kids2, ind + 1).split("\n") : [pad + "    pass"])); }
    });
    return out.join("\n");
  }

  CFM.BlockEditor = function (host, opts) {
    const allowed = opts.allowed || ["move", "turn_left", "turn_right"], locked = !!opts.locked;
    let program = (opts.program || []).map(clone), listeners = [];
    host.innerHTML = `<div class="blocks-area ${opts.showText ? "with-text" : ""} ${locked ? "locked" : ""}">
      ${locked ? "" : `<div class="palette"><h4>Blocks</h4></div>`}
      <div class="ws"><div class="blk motion" style="--c:#8c9aa8;cursor:default;margin-bottom:8px">when ▶ Run is clicked</div><div class="root slot"></div></div>
      ${opts.showText ? `<div class="text-preview"><div class="cap">Your blocks, written in Python</div><div class="pyprev"></div></div>` : ""}</div>`;
    const pal = host.querySelector(".palette"), root = host.querySelector(".root"), area = host.querySelector(".blocks-area");
    const prev = opts.showText ? CFM.makeEditor(host.querySelector(".pyprev"), { readonly: true }) : null;
    const emit = () => { const py = toPython(program); if (prev) prev.set(py || "# (drag some blocks in!)"); listeners.forEach((f) => f(py)); };

    function inputs(b, el, d) {
      if (d.input) { const i = document.createElement("input"); i.type = d.input; i.value = b.v; if (d.input === "number") { i.min = 1; i.max = 30; } i.disabled = locked; i.addEventListener("input", () => { b.v = i.value; emit(); }); i.addEventListener("mousedown", (e) => e.stopPropagation()); el.appendChild(i); }
      if (d.select) { const s = document.createElement("select"); s.innerHTML = CONDS.map(([v, l]) => `<option value="${v}" ${v === b.v ? "selected" : ""}>${l}</option>`).join(""); s.disabled = locked; s.addEventListener("change", () => { b.v = s.value; emit(); }); el.appendChild(s); }
      if (d.after) el.append(" " + d.after);
    }
    function head(b, d, isPalette) {
      const el = document.createElement("div"); el.className = `blk ${d.cls} ${d.c ? "cb-head" : ""}`; el.append(d.label + (d.input || d.select ? " " : ""));
      inputs(b, el, d);
      if (!isPalette && !locked) { const x = document.createElement("button"); x.className = "x"; x.textContent = "✕"; x.title = "Delete"; x.onclick = () => { const p = findParent(program, b); p.list.splice(p.i, 1); render(); }; el.appendChild(x); }
      if (!locked) { el.draggable = true; el.addEventListener("dragstart", (e) => { e.stopPropagation(); drag = isPalette ? { fresh: b.t } : { b }; e.dataTransfer.setData("text/plain", "block"); e.dataTransfer.effectAllowed = "copyMove"; }); el.addEventListener("dragend", () => { drag = null; clearMarks(); }); }
      return el;
    }
    function slot(list) {
      const s = document.createElement("div"); s.className = "slot"; s._list = list; list.forEach((b) => s.appendChild(renderBlock(b))); wire(s); return s;
    }
    function renderBlock(b) {
      const d = DEFS[b.t]; if (!d.c) return head(b, d);
      const wrap = document.createElement("div"); wrap.className = `cblock ${d.cls}`; wrap.appendChild(head(b, d));
      const body = document.createElement("div"); body.className = "cb-body"; body.appendChild(slot(b.kids)); wrap.appendChild(body);
      if (d.c === 2) { const e = document.createElement("div"); e.className = `blk ${d.cls} else-label`; e.textContent = "else"; wrap.appendChild(e); const b2 = document.createElement("div"); b2.className = "cb-body"; b2.appendChild(slot(b.kids2)); wrap.appendChild(b2); }
      const f = document.createElement("div"); f.className = "cb-foot"; wrap.appendChild(f); return wrap;
    }
    function clearMarks() { area.querySelectorAll(".drop-on").forEach((e) => e.classList.remove("drop-on")); area.querySelectorAll(".drop-line").forEach((e) => e.remove()); }
    function indexAt(container, y) { const kids = [...container.children].filter((c) => !c.classList.contains("drop-line")); let i = 0; for (const k of kids) { const r = k.getBoundingClientRect(); if (y > r.top + r.height / 2) i++; else break; } return i; }
    function wire(c) {
      if (locked) return;
      c.addEventListener("dragover", (e) => {
        if (!drag) return; e.preventDefault(); e.stopPropagation();
        if (drag.b && (c._list === undefined || inside(drag.b, c._list))) return;
        clearMarks(); c.classList.add("drop-on"); const line = document.createElement("div"); line.className = "drop-line";
        const idx = indexAt(c, e.clientY), kids = [...c.children]; c.insertBefore(line, kids[idx] || null);
      });
      c.addEventListener("drop", (e) => {
        if (!drag) return; e.preventDefault(); e.stopPropagation();
        const list = c._list; let at = Math.min(indexAt(c, e.clientY), list.length); clearMarks();
        if (drag.fresh) list.splice(at, 0, make(drag.fresh));
        else { if (inside(drag.b, list)) return; const p = findParent(program, drag.b); if (p.list === list && p.i < at) at--; p.list.splice(p.i, 1); list.splice(at, 0, drag.b); }
        drag = null; render();
      });
    }

    function render() { root.innerHTML = ""; root._list = program; program.forEach((b) => root.appendChild(renderBlock(b))); emit(); }
    root._list = program; wire(root);

    if (pal) allowed.forEach((t) => { const d = DEFS[t], b = make(t), el = head(b, d, true); el.title = "Drag me, or click to add"; el.addEventListener("click", (e) => { if (e.target.closest("input,select")) return; program.push(make(t)); render(); }); pal.appendChild(el); });

    const api = {
      toPython: () => toPython(program),
      isEmpty: () => program.length === 0,
      clear: () => { program = []; render(); },
      setProgram: (p) => { program = p.map(clone); render(); },
      onChange: (f) => listeners.push(f),
    };
    render();
    return api;
  };

  /* Helper for lesson data: b("repeat", 3, [b("move")]) */
  CFM.b = (t, v, kids, kids2) => ({ t, v: v == null ? DEFS[t].def : v, kids: kids || [], kids2: kids2 || [] });
})();
