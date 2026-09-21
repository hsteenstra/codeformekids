/* Shared: header/footer, robot avatar + builder, progress, code editor, confetti */
(function () {
  const CFM = (window.CFM = window.CFM || {});

  /* ---------- Progress ---------- */
  CFM.getProgress = () => { try { return JSON.parse(localStorage.getItem("cfmk_progress") || "{}"); } catch (e) { return {}; } };
  CFM.markDone = (id) => { const p = CFM.getProgress(); p[id] = true; try { localStorage.setItem("cfmk_progress", JSON.stringify(p)); } catch (e) {} };

  /* ---------- Robot look ---------- */
  const DEFAULT_ROBOT = { name: "Bolt", color: "#7497af", eyes: "dots", antenna: "ball" };
  CFM.COLORS = ["#7497af", "#f6c453", "#ef8a6b", "#62c3a0", "#9b8bd6", "#e879a8", "#5b8def", "#8c9aa8"];
  CFM.getRobot = () => { try { return Object.assign({}, DEFAULT_ROBOT, JSON.parse(localStorage.getItem("cfmk_robot") || "{}")); } catch (e) { return { ...DEFAULT_ROBOT }; } };
  CFM.setRobot = (r) => { try { localStorage.setItem("cfmk_robot", JSON.stringify(r)); } catch (e) {} };

  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function shade(hex, amt) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, v + amt)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }

  /* Draw the kid's robot centered at (cx, cy) inside a size x size box. dir: 0N 1E 2S 3W (eyes look that way) */
  CFM.drawRobot = function (ctx, cx, cy, size, dir, cfg) {
    cfg = cfg || CFM.getRobot();
    const s = size / 100, c = cfg.color;
    ctx.save(); ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(s, s);
    ctx.fillStyle = "rgba(0,0,0,.13)"; ctx.beginPath(); ctx.ellipse(50, 94, 26, 5, 0, 0, 7); ctx.fill();
    // arms + feet
    ctx.fillStyle = shade(c, -35); rr(ctx, 12, 58, 12, 22, 6); ctx.fill(); rr(ctx, 76, 58, 12, 22, 6); ctx.fill();
    rr(ctx, 32, 82, 14, 10, 4); ctx.fill(); rr(ctx, 54, 82, 14, 10, 4); ctx.fill();
    // body
    ctx.fillStyle = shade(c, -12); rr(ctx, 26, 54, 48, 32, 10); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.globalAlpha = .85; ctx.font = "700 15px monospace"; ctx.textAlign = "center"; ctx.fillText("</>", 50, 76); ctx.globalAlpha = 1;
    // head
    ctx.fillStyle = c; rr(ctx, 20, 18, 60, 42, 14); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.28)"; rr(ctx, 25, 22, 50, 8, 4); ctx.fill();
    // antenna
    ctx.strokeStyle = shade(c, -40); ctx.lineWidth = 4; ctx.lineCap = "round";
    if (cfg.antenna !== "none") { ctx.beginPath(); ctx.moveTo(50, 18); ctx.lineTo(50, 8); ctx.stroke(); }
    if (cfg.antenna === "ball") { ctx.fillStyle = "#f6c453"; ctx.beginPath(); ctx.arc(50, 7, 5.5, 0, 7); ctx.fill(); }
    if (cfg.antenna === "bolt") { ctx.fillStyle = "#f6c453"; ctx.beginPath(); ctx.moveTo(53, 0); ctx.lineTo(45, 9); ctx.lineTo(50, 9); ctx.lineTo(47, 17); ctx.lineTo(56, 6); ctx.lineTo(51, 6); ctx.closePath(); ctx.fill(); }
    if (cfg.antenna === "heart") { ctx.fillStyle = "#e0566f"; ctx.beginPath(); ctx.moveTo(50, 13); ctx.bezierCurveTo(38, 4, 44, -2, 50, 4); ctx.bezierCurveTo(56, -2, 62, 4, 50, 13); ctx.fill(); }
    // eyes (look toward direction)
    const ox = dir === 1 ? 3 : dir === 3 ? -3 : 0, oy = dir === 0 ? -2 : dir === 2 ? 2 : 0;
    ctx.fillStyle = "#1f2a36";
    if (cfg.eyes === "visor") { rr(ctx, 27, 31, 46, 16, 8); ctx.fill(); ctx.fillStyle = "#62e0c0"; rr(ctx, 33 + ox, 36 + oy, 34, 6, 3); ctx.fill(); }
    else if (cfg.eyes === "happy") { ctx.strokeStyle = "#1f2a36"; ctx.lineWidth = 4.5; [36, 64].forEach((x) => { ctx.beginPath(); ctx.arc(x + ox, 44 + oy, 7, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }); }
    else { [36, 64].forEach((x) => { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, 38, 8.5, 0, 7); ctx.fill(); ctx.fillStyle = "#1f2a36"; ctx.beginPath(); ctx.arc(x + ox, 38 + oy, 4.5, 0, 7); ctx.fill(); }); }
    ctx.strokeStyle = "#1f2a36"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(50, 47, 6, .2 * Math.PI, .8 * Math.PI); ctx.stroke();
    ctx.restore();
  };
  window.__drawRobot = (ctx, x, y, size) => CFM.drawRobot(ctx, x, y, size, 2);

  function paintChip() { document.querySelectorAll("canvas.robot-chip").forEach((cv) => { const g = cv.getContext("2d"); g.clearRect(0, 0, cv.width, cv.height); CFM.drawRobot(g, cv.width / 2, cv.height / 2 + 2, cv.width * .95, 2); }); }
  CFM.paintChips = paintChip;

  /* ---------- Header / footer ---------- */
  const page = document.body.dataset.page;
  const nav = (id, href, label, cls) => `<a href="${href}" class="${cls || ""} ${page === id ? "active" : ""}">${label}</a>`;
  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `<div class="header-inner">
      <a class="logo" href="index.html"><span class="logo-mark">&lt;/&gt;</span> CodeForMe <span class="logo-kids">Kids</span></a>
      <nav class="site-nav">${nav("home", "index.html", "Home", "hide-sm")}${nav("learn", "learn.html", "Learn")}${nav("playground", "playground.html", "Playground")}
        <button class="chip-btn" id="my-robot-btn" title="Customize your robot"><canvas class="robot-chip" width="68" height="68"></canvas><span id="robot-name-chip"></span></button></nav></div>`;
  }
  const footer = document.getElementById("site-footer");
  if (footer) footer.innerHTML = `<div class="container site-footer"> © <a href="https://codeforme.org" target="_blank" rel="noopener">CodeForMe • 2026</a></div>`;

  /* ---------- Robot builder modal ---------- */
  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.innerHTML = `<div class="modal" role="dialog" aria-label="Build your robot"><h2>Build your robot 🤖</h2>
    <canvas id="rb-preview" width="180" height="180" style="background:var(--accent-light);border-radius:50%;margin-bottom:8px"></canvas><div><input class="name" id="rb-name" maxlength="12" placeholder="Robot name"></div><br>
    <div class="swatches" id="rb-colors"></div>
    <div class="opt-row"><span class="lab">Eyes</span><span id="rb-eyes"></span></div>
    <div class="opt-row"><span class="lab">Antenna</span><span id="rb-antenna"></span></div>
    <button class="btn btn-primary" id="rb-done">Done!</button></div>`;
  document.body.appendChild(modal);
  let draft = CFM.getRobot();
  function renderBuilder() {
    const cv = modal.querySelector("#rb-preview"), g = cv.getContext("2d"); g.clearRect(0, 0, 180, 180); CFM.drawRobot(g, 90, 92, 150, 2, draft);
    modal.querySelector("#rb-colors").innerHTML = CFM.COLORS.map((c) => `<span class="swatch ${c === draft.color ? "sel" : ""}" data-c="${c}" style="background:${c}"></span>`).join("");
    const opts = (key, list) => list.map((o) => `<button class="opt ${draft[key] === o ? "sel" : ""}" data-k="${key}" data-v="${o}">${o}</button>`).join("");
    modal.querySelector("#rb-eyes").innerHTML = opts("eyes", ["dots", "visor", "happy"]);
    modal.querySelector("#rb-antenna").innerHTML = opts("antenna", ["ball", "bolt", "heart", "none"]);
  }
  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t.dataset.c) draft.color = t.dataset.c;
    else if (t.dataset.k) draft[t.dataset.k] = t.dataset.v;
    else if (t.id === "rb-done" || t === modal) { draft.name = modal.querySelector("#rb-name").value.trim() || "Bolt"; CFM.setRobot(draft); modal.classList.remove("show"); refreshChip(); window.dispatchEvent(new Event("cfm-robot-changed")); return; }
    else return;
    renderBuilder();
  });
  function refreshChip() { const n = document.getElementById("robot-name-chip"); if (n) n.textContent = CFM.getRobot().name; paintChip(); }
  CFM.openRobotBuilder = () => { draft = CFM.getRobot(); modal.querySelector("#rb-name").value = draft.name; renderBuilder(); modal.classList.add("show"); };
  const btn = document.getElementById("my-robot-btn"); if (btn) btn.addEventListener("click", CFM.openRobotBuilder);
  refreshChip();

  /* ---------- Confetti ---------- */
  CFM.confetti = function () {
    const cols = ["#f6c453", "#ef8a6b", "#62c3a0", "#9b8bd6", "#7497af", "#e879a8"];
    for (let i = 0; i < 60; i++) { const d = document.createElement("i"); d.className = "confetti"; d.style.left = Math.random() * 100 + "vw"; d.style.background = cols[i % cols.length]; d.style.animationDelay = Math.random() * .6 + "s"; d.style.borderRadius = i % 3 ? "2px" : "50%"; document.body.appendChild(d); setTimeout(() => d.remove(), 2800); }
  };

  /* ---------- Code editor with syntax highlighting ---------- */
  const KW = /\b(def|for|while|if|elif|else|in|return|and|or|not|True|False|None|import|from|global|pass|break|continue)\b/g;
  const FN = /\b(move|turn_left|turn_right|collect|say|path_ahead|path_left|path_right|on_gem|at_goal|print|range|len|str|int|clear|rect|circle|line|text|key_down|on_tick|random_int|robot_face|stop)\b/g;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function highlight(src) {
    return src.split("\n").map((ln) => {
      const m = ln.match(/^(.*?)(#.*)$/); let code = ln, cm = "";
      if (m && (m[1].match(/["']/g) || []).length % 2 === 0) { code = m[1]; cm = `<span class="tk-c">${esc(m[2])}</span>`; }
      const parts = code.split(/("[^"]*"|'[^']*')/);
      return parts.map((p, i) => i % 2 ? `<span class="tk-s">${esc(p)}</span>` : esc(p).replace(KW, '<span class="tk-k">$1</span>').replace(FN, '<span class="tk-f">$1</span>').replace(/\b(\d+)\b/g, '<span class="tk-n">$1</span>')).join("") + cm;
    }).join("\n") + "\n";
  }
  CFM.makeEditor = function (host, opts) {
    opts = opts || {};
    host.classList.add("editor"); if (opts.readonly) host.classList.add("readonly");
    host.innerHTML = `<pre class="gutter"></pre><div class="layers"><pre class="hl"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" ${opts.readonly ? "readonly" : ""}></textarea></div>`;
    const ta = host.querySelector("textarea"), hl = host.querySelector(".hl"), gut = host.querySelector(".gutter"), subs = [];
    const paint = () => { hl.innerHTML = highlight(ta.value); gut.textContent = ta.value.split("\n").map((_, i) => i + 1).join("\n"); };
    ta.addEventListener("input", () => { paint(); subs.forEach((f) => f(ta.value)); });
    ta.addEventListener("scroll", () => { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; gut.scrollTop = ta.scrollTop; });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("    ", s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input")); }
      if (e.key === "Enter") { // auto-indent
        const s = ta.selectionStart, ls = ta.value.lastIndexOf("\n", s - 1) + 1, line = ta.value.slice(ls, s);
        let ind = (line.match(/^ */) || [""])[0]; if (/:\s*$/.test(line)) ind += "    ";
        e.preventDefault(); ta.setRangeText("\n" + ind, s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input"));
      }
    });
    paint();
    return { get: () => ta.value, set: (v) => { ta.value = v; paint(); subs.forEach((f) => f(v)); }, onChange: (f) => subs.push(f), focus: () => ta.focus() };
  };
  CFM.highlight = highlight;
})();
