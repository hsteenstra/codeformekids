/* Robot grid world: runs the program instantly (recording every action), then replays it with animation. */
(function () {
  const CFM = (window.CFM = window.CFM || {});
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]; // 0=N 1=E 2=S 3=W
  const MAX_ACTIONS = 600;

  CFM.RobotWorld = function (canvas) {
    const ctx = canvas.getContext("2d");
    let level = null, grid = [], W = 0, H = 0, goal = null, st = null, log = [], anim = 0;
    const w = { canvas, log: () => log };

    w.load = function (lv) {
      level = lv; grid = lv.map.map((r) => r.split("")); H = grid.length; W = Math.max(...grid.map((r) => r.length));
      canvas.width = 560; canvas.height = Math.max(240, Math.min(460, Math.round(560 * H / W)));
      goal = null; let start = { x: 1, y: 1 };
      grid.forEach((row, y) => row.forEach((ch, x) => { if (ch === "S") start = { x, y }; if (ch === "G") goal = { x, y }; }));
      w.start = start; w.reset();
    };
    const gemKeys = () => { const s = new Set(); grid.forEach((row, y) => row.forEach((ch, x) => { if (ch === "*") s.add(x + "," + y); })); return s; };
    w.totalGems = () => gemKeys().size;
    w.reset = function () {
      cancelAnimationFrame(anim); log = [];
      st = { x: w.start.x, y: w.start.y, dir: level.dir == null ? 1 : level.dir, gems: gemKeys(), say: "" };
      w.draw(st);
    };
    const wall = (x, y) => y < 0 || y >= H || x < 0 || x >= W || (grid[y][x] || "#") === "#";
    const snap = (type, extra) => { const e = Object.assign({ type, x: st.x, y: st.y, dir: st.dir, gems: new Set(st.gems), say: st.say }, extra); log.push(e); if (log.length > MAX_ACTIONS) throw new Error("CFM:Your robot took too many steps. Is a loop running forever?"); };
    const bump = (msg) => { snap("bump"); throw new Error("CFM:" + msg); };
    const ahead = (turn) => { const d = (st.dir + turn + 4) % 4; return !wall(st.x + DX[d], st.y + DY[d]); };

    /* The commands kids can use */
    w.api = {
      move() { if (!ahead(0)) bump("Ouch! The robot bumped into a wall."); st.x += DX[st.dir]; st.y += DY[st.dir]; st.say = ""; snap("move"); },
      turn_left() { st.dir = (st.dir + 3) % 4; st.say = ""; snap("turn"); },
      turn_right() { st.dir = (st.dir + 1) % 4; st.say = ""; snap("turn"); },
      collect() { const k = st.x + "," + st.y; if (!st.gems.has(k)) bump("There's no gem here to collect!"); st.gems.delete(k); snap("collect"); },
      say(t) { st.say = String(t); snap("say"); if (CFM.py) CFM.py.stdout(String(t)); },
      path_ahead: () => ahead(0), path_left: () => ahead(3), path_right: () => ahead(1),
      on_gem: () => st.gems.has(st.x + "," + st.y),
      at_goal: () => !!goal && st.x === goal.x && st.y === goal.y,
    };

    ["move", "turn_left", "turn_right", "collect", "path_ahead", "path_left", "path_right", "on_gem", "at_goal"].forEach((n) => {
      const f = w.api[n]; w.api[n] = (...a) => { if (a.length) throw new Error(`CFM:${n}() doesn't need anything inside the ( ) — leave it empty.`); return f(); };
    });

    w.result = function () {
      const done = !goal || (st.x === goal.x && st.y === goal.y), gemsOk = level.needGems === false || st.gems.size === 0;
      if (done && gemsOk) return { solved: true };
      if (!gemsOk && !done) return { solved: false, message: "Not yet: the robot needs to collect every gem AND reach the flag." };
      return { solved: false, message: gemsOk ? "So close! The robot stopped before reaching the flag 🚩" : `The robot left ${st.gems.size} gem${st.gems.size > 1 ? "s" : ""} behind. Collect them all!` };
    };

    /* ---------- drawing ---------- */
    function tileSize() { return Math.min((canvas.width - 20) / W, (canvas.height - 20) / H); }
    w.draw = function (s, fx) {
      fx = fx || {};
      const T = tileSize(), ox = (canvas.width - T * W) / 2, oy = (canvas.height - T * H) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#e9f0f5"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const ch = grid[y][x] || "#", px = ox + x * T, py = oy + y * T;
        if (ch === "#") { ctx.fillStyle = "#4f7191"; ctx.beginPath(); ctx.roundRect(px + 2, py + 2, T - 4, T - 4, T * .16); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.fillRect(px + 8, py + 8, T - 16, T * .12); continue; }
        ctx.fillStyle = (x + y) % 2 ? "#ffffff" : "#f5f9fc"; ctx.fillRect(px, py, T, T);
        if (ch === "G") { ctx.fillStyle = "#d6f3e6"; ctx.fillRect(px, py, T, T); ctx.strokeStyle = "#5b6b7b"; ctx.lineWidth = T * .05; ctx.beginPath(); ctx.moveTo(px + T * .38, py + T * .82); ctx.lineTo(px + T * .38, py + T * .18); ctx.stroke(); ctx.fillStyle = "#ef8a6b"; ctx.beginPath(); ctx.moveTo(px + T * .38, py + T * .18); ctx.lineTo(px + T * .78, py + T * .34); ctx.lineTo(px + T * .38, py + T * .5); ctx.fill(); }
        if (s.gems.has(x + "," + y)) { const cx = px + T / 2, cy = py + T / 2, r = T * .26 * (fx.pop && fx.pop === x + "," + y ? 1.3 : 1); ctx.fillStyle = "#62c3a0"; ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath(); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx - r * .5, cy - r * .1); ctx.lineTo(cx, cy - r * .1); ctx.fill(); }
      }
      const rx = fx.x != null ? fx.x : s.x, ry = fx.y != null ? fx.y : s.y, cx = ox + rx * T + T / 2, cy = oy + ry * T + T / 2;
      // facing arrow on the tile
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.dir * Math.PI / 2); ctx.fillStyle = "rgba(246,196,83,.9)"; ctx.beginPath(); ctx.moveTo(0, -T * .47); ctx.lineTo(T * .13, -T * .34); ctx.lineTo(-T * .13, -T * .34); ctx.fill(); ctx.restore();
      CFM.drawRobot(ctx, cx, cy - T * .04, T * .86, s.dir);
      if (s.say) { const t = s.say.slice(0, 30); ctx.font = `700 ${Math.max(12, T * .2)}px Nunito, sans-serif`; const tw = ctx.measureText(t).width + 18, bx = Math.min(Math.max(cx - tw / 2, 4), canvas.width - tw - 4), by = cy - T * .78; ctx.fillStyle = "#fff"; ctx.strokeStyle = "#7497af"; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(bx, by - 24, tw, 28, 10); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#24313d"; ctx.textAlign = "center"; ctx.fillText(t, bx + tw / 2, by - 5); }
    };
    window.addEventListener("cfm-robot-changed", () => st && w.draw(st));

    /* Replay the recorded log. speed 1 = normal. Resolves when finished (or cancelled). */
    w.replay = function (speed) {
      return new Promise((resolve) => {
        cancelAnimationFrame(anim);
        const base = { x: w.start.x, y: w.start.y, dir: level.dir == null ? 1 : level.dir, gems: gemKeys(), say: "" };
        let i = 0, prev = base, t0 = null; const dur = 380 / speed;
        const step = (ts) => {
          if (i >= log.length) { w.draw(prev); return resolve(); }
          if (t0 == null) t0 = ts;
          const e = log[i], k = Math.min(1, (ts - t0) / dur);
          if (e.type === "move") w.draw(k < 1 ? Object.assign({}, e, { gems: prev.gems }) : e, { x: prev.x + (e.x - prev.x) * k, y: prev.y + (e.y - prev.y) * k });
          else if (e.type === "bump") { const sh = Math.sin(k * 20) * .06; w.draw(e, { x: e.x + DX[e.dir] * sh, y: e.y + DY[e.dir] * sh }); }
          else w.draw(e, { pop: e.type === "collect" && k < .5 ? e.x + "," + e.y : null });
          if (k >= 1) { prev = e; i++; t0 = null; }
          anim = requestAnimationFrame(step);
        };
        anim = requestAnimationFrame(step);
        w.cancel = () => { cancelAnimationFrame(anim); resolve(); };
      });
    };
    return w;
  };
})();
