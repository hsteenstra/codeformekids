/* Free playground: robot maze maker (blocks or Python) + game sandbox */
(function () {
  const CFM = window.CFM, $ = (id) => document.getElementById(id);
  const canvas = $("stage-canvas"), ws = $("workspace"), con = $("console");
  const log = (t, cls) => { if (con.querySelector(".muted")) con.textContent = ""; const s = document.createElement("div"); if (cls) s.className = cls; s.textContent = t; con.appendChild(s); con.scrollTop = con.scrollHeight; };
  const status = (t, k) => { $("status").textContent = t; $("status").className = "status " + (k || ""); };
  CFM.py.stdout = (s, e) => log(s, e ? "err" : ""); CFM.py.onError = (m) => { log("⚠️ " + m, "err"); status("Error", "err"); };

  const PRESETS = {
    room: ["##########", "#S.......#", "#........#", "#........#", "#.......G#", "##########"],
    gems: ["##########", "#S.*..*..#", "#.##.##..#", "#*.....*.#", "#..##.##G#", "##########"],
    snake: ["#########", "#S.....##", "#######.#", "#.....*.#", "#.#######", "#G......#", "#########"],
    stairs: ["#######", "#S.####", "##.*###", "###..##", "####.*#", "#####G#", "#######"],
  };
  const EXAMPLES = {
    "Catch the stars": `from game import *

x = 240
star_x = 100
star_y = 0
score = 0

def tick():
    global x, star_x, star_y, score
    if key_down("ArrowLeft"):
        x -= 6
    if key_down("ArrowRight"):
        x += 6
    star_y += 3
    if distance(x, 300, star_x, star_y) < 40:
        score += 1
        star_y = 0
        star_x = random_int(20, 460)
    if star_y > 380:
        star_y = 0
        star_x = random_int(20, 460)
    clear("#e7eef3")
    circle(star_x, star_y, 14, "#f6c453")
    robot_face(x, 300, 70)
    text(12, 28, "Score: " + str(score))

on_tick(tick)
`,
    "Dodge the rocks": `from game import *

x = 240
rock_x = 200
rock_y = 0
lives = 3

def tick():
    global x, rock_x, rock_y, lives
    if lives <= 0:
        clear("#24313d")
        text(150, 190, "GAME OVER", "#ffffff", 36)
        return
    if key_down("ArrowLeft"):
        x -= 6
    if key_down("ArrowRight"):
        x += 6
    rock_y += 5
    if distance(x, 300, rock_x, rock_y) < 40:
        lives -= 1
        rock_y = 0
        rock_x = random_int(20, 460)
    if rock_y > 380:
        rock_y = 0
        rock_x = random_int(20, 460)
    clear("#e7eef3")
    circle(rock_x, rock_y, 22, "#8c9aa8")
    robot_face(x, 300, 70)
    text(12, 28, "Lives: " + str(lives))

on_tick(tick)
`,
    "Bouncing ball": `from game import *

x = 100
y = 100
dx = 4
dy = 3

def tick():
    global x, y, dx, dy
    x += dx
    y += dy
    if x < 20 or x > WIDTH - 20:
        dx = -dx
    if y < 20 or y > HEIGHT - 20:
        dy = -dy
    clear("#24313d")
    circle(x, y, 20, "#ef8a6b")

on_tick(tick)
`,
    "Draw a scene": `from game import *

clear("#bfe3f5")
rect(0, 270, 480, 90, "#62c3a0")
circle(400, 60, 34, "#f6c453")
for i in range(5):
    rect(20 + i * 90, 240, 30, 40, "#8b6b4a")
    circle(35 + i * 90, 225, 28, "#3fb58a")
robot_face(240, 235, 90)
text(16, 34, "My world", "#24313d", 26)
`,
  };
  $("examples").innerHTML = Object.keys(EXAMPLES).map((k) => `<option>${k}</option>`).join("");

  /* ---------- state ---------- */
  let tool = "robot", world = CFM.RobotWorld(canvas), blocks = null, editor = null, custom = PRESETS.room.map((r) => r.split(""));
  const level = () => ({ map: custom.map((r) => r.join("")), dir: 1, needGems: false });
  world.load(level());

  function buildWorkspace() {
    const cm = $("code-mode").value; blocks = editor = null; const keep = window.__lastPy || "";
    if (tool === "game") { ws.innerHTML = '<div id="ed"></div>'; editor = CFM.makeEditor($("ed")); $("ed").classList.add("tall"); editor.set(EXAMPLES[$("examples").value]); return; }
    if (cm === "blocks") blocks = CFM.BlockEditor(ws, { allowed: ["move", "turn_left", "turn_right", "collect", "say", "repeat", "if", "ifelse", "while"], showText: true });
    else { ws.innerHTML = '<div id="ed"></div>'; editor = CFM.makeEditor($("ed")); $("ed").classList.add("tall"); editor.set(keep || "# Free play! Try changing the 3.\nfor i in range(3):\n    move()\n"); }
  }
  function setTool(t) {
    tool = t; CFM.py.stop(); $("tab-robot").classList.toggle("sel", t === "robot"); $("tab-game").classList.toggle("sel", t === "game");
    $("robot-tools").style.display = t === "robot" ? "" : "none"; $("game-tools").style.display = t === "game" ? "" : "none";
    $("code-mode").style.display = t === "robot" ? "" : "none"; $("speed-wrap").style.display = t === "robot" ? "" : "none"; $("stop-btn").style.display = t === "game" ? "" : "none";
    if (t === "game") { canvas.width = 480; canvas.height = 360; canvas.getContext("2d").clearRect(0, 0, 480, 360); } else world.load(level());
    buildWorkspace();
  }
  $("tab-robot").onclick = () => setTool("robot"); $("tab-game").onclick = () => setTool("game");
  $("examples").onchange = () => editor.set(EXAMPLES[$("examples").value]);
  $("code-mode").onchange = () => { if (blocks) window.__lastPy = "# Your blocks, as Python:\n" + blocks.toPython() + "\n"; buildWorkspace(); };
  $("preset").onchange = () => { custom = PRESETS[$("preset").value].map((r) => r.split("")); world.load(level()); };

  /* ---------- map editor ---------- */
  const TILES = [["#", "🧱"], [".", "⬜"], ["*", "💎"], ["G", "🚩"], ["S", "🤖"]]; let brush = "#", editing = false;
  $("tiles").innerHTML = TILES.map(([c, e]) => `<button class="tile-btn ${c === brush ? "sel" : ""}" data-c="${c}" title="${c}">${e}</button>`).join("");
  $("tiles").onclick = (e) => { const c = e.target.dataset.c; if (!c) return; brush = c; $("tiles").querySelectorAll(".tile-btn").forEach((b) => b.classList.toggle("sel", b.dataset.c === c)); };
  $("edit-btn").onclick = () => { editing = !editing; $("edit-help").style.display = editing ? "" : "none"; $("edit-btn").textContent = editing ? "✅ Done editing" : "✏️ Edit map"; canvas.style.cursor = editing ? "crosshair" : ""; };
  canvas.addEventListener("click", (e) => {
    if (!editing || tool !== "robot") return;
    const r = canvas.getBoundingClientRect(), px = (e.clientX - r.left) * canvas.width / r.width, py = (e.clientY - r.top) * canvas.height / r.height;
    const H = custom.length, W = custom[0].length, T = Math.min((canvas.width - 20) / W, (canvas.height - 20) / H), ox = (canvas.width - T * W) / 2, oy = (canvas.height - T * H) / 2;
    const x = Math.floor((px - ox) / T), y = Math.floor((py - oy) / T);
    if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) return; // keep the outer wall
    if (brush === "S" || brush === "G") custom.forEach((row) => row.forEach((ch, i) => { if (ch === brush) row[i] = "."; }));
    custom[y][x] = brush; world.load(level());
  });

  /* ---------- run ---------- */
  let running = false;
  async function run() {
    if (running) return; const code = blocks ? blocks.toPython() : editor.get();
    if (blocks && blocks.isEmpty()) return log("Drag some blocks in first! 🧱", "err");
    running = true; $("run-btn").disabled = true; con.textContent = ""; status("Running…");
    if (tool === "robot") world.reset();
    const res = await CFM.py.run(code, tool === "robot" ? world.api : {});
    if (tool === "robot") { await world.replay(+$("speed").value); if (res.ok) { const r = world.result(); if (r.solved) { log("🎉 Robot reached the flag!", "good"); CFM.confetti(); } } }
    if (!res.ok) { log("⚠️ " + res.message, "err"); status("Error", "err"); } else status(res.game ? "Playing 🎮" : "Done", "ok");
    running = false; $("run-btn").disabled = false;
  }
  $("run-btn").onclick = run; $("stop-btn").onclick = () => { CFM.py.stop(); status("Stopped"); };
  document.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); run(); } });
  buildWorkspace();
  CFM.py.ready.then(() => { $("run-btn").disabled = false; status("Ready", "ok"); }).catch(() => { status("Python failed to load", "err"); log("Couldn't load the Python engine. Check your internet connection and reload.", "err"); });
})();
