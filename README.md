# CodeForMe Kids

A free, static learning site: kids start with Scratch-style **blocks**, watch them turn into real **Python**,
plan with **pseudocode**, write text code, and finish by building **games**. Includes a free **Playground**.
Branded to match the existing `codeforme-sandbox` (same colors, fonts, `</>` logo).

## Run it

Needs HTTP (not `file://`) and internet for the Pyodide Python runtime + Google Fonts:

```bash
cd codeforme-kids
python3 -m http.server 8123
```

Open http://localhost:8123. No build step; deploy the folder to any static host.

## The path (19 lessons)

1. **Meet Your Robot** — blocks only (move, turn, collect, repeat)
2. **Blocks ⇄ Python** — live block→Python view, then translate blocks by hand, then write it yourself
3. **Plan Like a Pro** — pseudocode; "write your plan first" gate; if / while / else
4. **Python Power Tools** — functions (`def`), variables, combining everything
5. **Game Maker** — canvas games with `from game import *`; final open project
6. **Playground** — robot map maker (blocks or Python) + game examples

## Files

- `index.html`, `learn.html`, `lesson.html`, `playground.html`
- `css/kids.css` — theme (CSS variables at top)
- `js/common.js` — header, robot builder (My Robot), editor with syntax highlighting, progress (localStorage)
- `js/pyrunner.js` — Pyodide runner, friendly error messages, loop guard
- `js/robotworld.js` — robot grid world (runs code instantly, then animates the recorded steps)
- `js/blocks.js` — drag-and-drop block editor that generates Python
- `js/lessons-robot.js`, `js/lessons-game.js` — all lesson content (edit these to add lessons)
- `py/game.py` — game toolkit (`rect`, `circle`, `text`, `robot_face`, `key_down`, `on_tick`, ...)
