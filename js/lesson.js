/* Lesson page controller */
(function () {
  const CFM = window.CFM, $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(location.search).get("id") || "1-1";
  const idx = Math.max(0, CFM.LESSONS.findIndex((l) => l.id === id)), lesson = CFM.LESSONS[idx], unit = CFM.UNITS.find((u) => u.id === lesson.unit);
  const next = CFM.LESSONS[idx + 1], mode = lesson.mode, isGame = mode === "game";
  document.title = `${lesson.title} — CodeForMe Kids`;

  /* ---- header / story ---- */
  $("l-badge").textContent = unit.id; $("l-badge").style.background = unit.color;
  $("l-num").textContent = `Unit ${unit.id} · Lesson ${idx + 1} of ${CFM.LESSONS.length}`;
  $("l-title").textContent = lesson.title; $("l-story").innerHTML = lesson.story; $("l-goal").innerHTML = lesson.goal;
  $("l-vocab").innerHTML = (lesson.vocab || []).map((v) => `<span>${v}</span>`).join("");
  $("l-hint").innerHTML = "💡 " + lesson.hint;
  $("hint-btn").onclick = () => $("l-hint").classList.toggle("show");
  if (idx > 0) { $("prev-btn").href = "lesson.html?id=" + CFM.LESSONS[idx - 1].id; $("prev-btn").textContent = "← Previous"; }
  if (next) { $("next-btn").href = "lesson.html?id=" + next.id; }

  /* ---- console / status ---- */
  const con = $("console");
  const log = (t, cls) => { if (con.querySelector(".muted")) con.textContent = ""; const s = document.createElement("div"); if (cls) s.className = cls; s.textContent = t; con.appendChild(s); con.scrollTop = con.scrollHeight; };
  const status = (t, k) => { $("status").textContent = t; $("status").className = "status " + (k || ""); };
  CFM.py.stdout = (s, isErr) => log(s, isErr ? "err" : "");
  CFM.py.onError = (m) => { log("⚠️ " + m, "err"); status("Error", "err"); };

  /* ---- workspace per mode ---- */
  let blocks = null, editor = null, world = null;
  const ws = $("workspace"), canvas = $("stage-canvas");
  const needsPlan = !!lesson.planFirst;
  if (isGame) { canvas.width = 480; canvas.height = 360; $("speed-wrap").style.display = "none"; $("stop-btn").style.display = ""; }
  else { world = CFM.RobotWorld(canvas); world.load(lesson); }

  if (mode === "blocks" || mode === "blocks-text") {
    $("ws-title").textContent = mode === "blocks" ? "Your blocks" : "Blocks ⇄ Python";
    blocks = CFM.BlockEditor(ws, { allowed: lesson.allowed, showText: mode === "blocks-text" });
  } else if (mode === "translate") {
    $("ws-title").textContent = "Blocks → Python";
    ws.innerHTML = `<div class="split"><div class="left" id="lk"></div><div id="ed"></div></div>`;
    CFM.BlockEditor($("lk"), { locked: true, program: lesson.starterBlocks });
    editor = CFM.makeEditor($("ed"));
  } else {
    $("ws-title").textContent = "Python code";
    ws.innerHTML = `<div id="ed"></div>`; editor = CFM.makeEditor($("ed"), {}); $("ed").classList.add("tall");
  }
  if (editor) editor.set(lesson.starter || "");
  if (mode === "pseudo-translate") { $("pseudo-show").style.display = "block"; $("pseudo-show").innerHTML = `<b>PLAN</b>\n` + lesson.pseudo.replace(/</g, "&lt;").replace(/^(REPEAT|IF|WHILE)/gm, "<b>$1</b>"); }
  if (needsPlan) $("plan-wrap").style.display = "block";
  if (mode === "translate" || mode === "pseudo-translate") { /* translation lessons */ }

  const getCode = () => (blocks ? blocks.toPython() : editor.get());
  const planLines = () => $("plan").value.split("\n").filter((l) => l.trim()).length;

  /* ---- challenge checklist ---- */
  const reqs = (lesson.require || []).map((r) => ({ ...r }));
  if (needsPlan) reqs.unshift({ label: "Write a plan (2+ lines)", test: () => planLines() >= 2 });
  function checks() { const code = getCode(); return reqs.map((r) => ({ label: r.label, ok: r.test ? r.test() : r.re.test(code) })); }
  function paintChecks() { const cs = checks(); $("l-checks").innerHTML = cs.map((c) => `<li class="${c.ok ? "ok" : ""}">${c.label}</li>`).join(""); return cs; }
  if (blocks) blocks.onChange(paintChecks); if (editor) editor.onChange(paintChecks); $("plan").addEventListener("input", paintChecks); paintChecks();

  /* ---- run ---- */
  let running = false;
  async function run() {
    if (running) return;
    const code = getCode();
    if (blocks && blocks.isEmpty()) { log("Drag some blocks into the workspace first! 🧱", "err"); return; }
    if (editor && !code.replace(/#.*/g, "").trim()) { log("Type some code first! ⌨️", "err"); return; }
    if (needsPlan && planLines() < 2) { log("✏️ Write your plan first (at least 2 lines) — real programmers always do!", "err"); $("plan").focus(); return; }
    running = true; $("run-btn").disabled = true; con.textContent = ""; status("Running…");
    if (world) world.reset(); else { canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); }
    let res;
    try { res = await CFM.py.run(code, world ? world.api : {}); } catch (e) { res = { ok: false, message: "Something went wrong: " + e }; }
    let solved = res.ok;
    if (world) {
      await world.replay(+$("speed").value);
      if (res.ok) { const r = world.result(); solved = r.solved; if (!r.solved) { log(r.message, "err"); status("Not yet", "err"); } }
    }
    if (!res.ok) { log("⚠️ " + res.message, "err"); status("Error", "err"); solved = false; }
    if (solved) {
      const missing = checks().filter((c) => !c.ok);
      if (missing.length) { log("Nice — but the challenge also asks you to: " + missing.map((m) => m.label.toLowerCase()).join(", ") + ".", "err"); status("Almost!", "err"); }
      else if (isGame) { status("Playing 🎮", "ok"); log("Your game is running! Click the game screen, then play with the arrow keys. 🎮", "good"); showWin(true); }
      else { status("Solved! 🎉", "ok"); showWin(); }
    }
    running = false; $("run-btn").disabled = false;
  }

  let winShown = false;
  function showWin(delayed) {
    CFM.markDone(lesson.id); if (next) $("next-btn").style.display = "";
    if (winShown) return; winShown = true;
    if (delayed) return setTimeout(() => { CFM.confetti(); popup(delayed); }, 6000);
    CFM.confetti(); popup(delayed);
  }
  function popup(delayed) {
    const m = document.createElement("div"); m.className = "modal-bg show";
    const last = !next;
    m.innerHTML = `<div class="modal"><h2>${last ? "You did it, coder! 🏆" : "Level complete! 🎉"}</h2><p>${last ? "You went from blocks to real Python, planned with pseudocode, and built your own game. That's real programming!" : "Great job on <b>" + lesson.title + "</b>."}</p>
      <div class="vocab" style="justify-content:center;margin-bottom:16px">${(lesson.vocab || []).map((v) => `<span>${v}</span>`).join("")}</div>
      <div class="actions" style="justify-content:center">${last ? `<a class="btn btn-sun" href="playground.html">Open the Playground →</a>` : `<a class="btn btn-sun" href="lesson.html?id=${next.id}">Next lesson →</a>`}<button class="btn btn-ghost" id="stay">${delayed ? "Keep playing" : "Stay here"}</button></div></div>`;
    document.body.appendChild(m); m.querySelector("#stay").onclick = () => m.remove();
  }

  $("run-btn").onclick = run;
  $("stop-btn").onclick = () => { CFM.py.stop(); status("Stopped"); };
  $("reset-btn").onclick = () => {
    if (!confirm("Start this lesson over?")) return;
    CFM.py.stop(); if (blocks) blocks.clear(); if (editor) editor.set(lesson.starter || ""); if (world) world.reset(); else canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    con.innerHTML = '<span class="muted">Run your program to see messages here.</span>'; status("Ready", "ok");
  };
  document.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); run(); } });

  CFM.py.ready.then(() => { $("run-btn").disabled = false; status("Ready", "ok"); }).catch(() => { status("Python failed to load", "err"); log("Couldn't load the Python engine. Check your internet connection and reload the page.", "err"); });
})();
