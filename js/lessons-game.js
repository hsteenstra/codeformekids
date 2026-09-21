/* Curriculum, part 2: game lessons (unit 5). These run on a canvas with the `game` toolkit. */
(function () {
  const CFM = (window.CFM = window.CFM || {});
  const has = (name) => new RegExp("^\\s*" + name, "m");
  CFM.LESSONS.push(
    { id: "5-1", unit: 5, title: "Draw Your World", blurb: "Shapes, colors & your robot.", mode: "game",
      story: `<p>Games are made of pictures. Text code can draw them! The canvas is measured in <b>pixels</b>: <code>x</code> counts across from the left, <code>y</code> counts <i>down</i> from the top.</p><p><code>from game import *</code> unlocks the drawing tools: <code>rect</code>, <code>circle</code>, <code>text</code> and <code>robot_face</code>.</p>`,
      goal: "Finish the scene: draw a sun with <code>circle(...)</code> and write your name with <code>text(...)</code>.", hint: "circle(400, 60, 35, \"#f6c453\")   and   text(20, 40, \"Hi, I'm Alex!\", \"#24313d\", 24)", vocab: ["pixel", "coordinates", "import"],
      starter: `from game import *

clear("#e7eef3")                     # background color
rect(0, 270, 480, 90, "#62c3a0")     # the ground
# TODO: draw a sun with circle(x, y, radius, color)
# TODO: write your name with text(x, y, "words", color, size)
robot_face(240, 235, 90)             # YOUR robot!
`,
      require: [{ re: has("circle\\("), label: "Draw a circle" }, { re: has("text\\("), label: "Write some text" }] },
    { id: "5-2", unit: 5, title: "Make It Move", blurb: "Game loops & keyboard controls.", mode: "game",
      story: `<p>To make things move, a game runs a function again and again — about 30 times a second. That's the <b>game loop</b>. Each time, we check the keys, change <code>x</code> and <code>y</code>, and redraw.</p><p>Click the game screen first, then use your arrow keys!</p>`,
      goal: "Add the missing arrow keys so your robot moves in all 4 directions.", hint: "Copy the ArrowLeft block. For right use x += speed. For up: y -= speed (y counts down!).", vocab: ["game loop", "global", "input"],
      starter: `from game import *

x = 240
y = 180
speed = 5

def tick():
    global x, y
    if key_down("ArrowLeft"):
        x -= speed
    # TODO: ArrowRight, ArrowUp and ArrowDown too!

    clear("#e7eef3")
    robot_face(x, y, 70)

on_tick(tick)
`,
      require: [{ re: /key_down\("ArrowRight"\)/, label: "Move right" }, { re: /key_down\("ArrowUp"\)/, label: "Move up" }, { re: /key_down\("ArrowDown"\)/, label: "Move down" }] },
    { id: "5-3", unit: 5, title: "Catch the Stars", blurb: "Collisions, score & randomness.", mode: "game",
      story: `<p>Time for a real game! A star falls from the sky. When the robot touches it, you score a point. To check if two things touch, measure the <b>distance</b> between them.</p><p><code>random_int(20, 460)</code> picks a surprise number — so the star lands somewhere different each time.</p>`,
      goal: "Finish the <code>if distance(...)</code> check: add 1 to <code>score</code> and restart the star at the top.", hint: "if distance(x, y, star_x, star_y) < 40:  then  score += 1,  star_y = 0,  star_x = random_int(20, 460)", vocab: ["collision", "score", "random"],
      starter: `from game import *

x = 240
y = 300
star_x = 100
star_y = 0
score = 0

def tick():
    global x, star_x, star_y, score
    if key_down("ArrowLeft"):
        x -= 6
    if key_down("ArrowRight"):
        x += 6

    star_y += 3                      # the star falls

    # TODO: if the star touches the robot -> score += 1, and start the star over at the top

    if star_y > 380:                 # missed it!
        star_y = 0
        star_x = random_int(20, 460)

    clear("#e7eef3")
    circle(star_x, star_y, 14, "#f6c453")
    robot_face(x, y, 70)
    text(12, 28, "Score: " + str(score))

on_tick(tick)
`,
      require: [{ re: has("if\\s+distance\\("), label: "Check distance with if" }, { re: has("score\\s*\\+=\\s*1"), label: "Add to score" }] },
    { id: "5-4", unit: 5, title: "Build Your Own Game!", blurb: "Your idea. Your code.", mode: "game",
      story: `<p>This is your moment. Turn the starter into <b>your own game</b>! Ideas: dodge falling rocks 🪨, collect coins 🪙, chase a ghost 👻, or run a race 🏁.</p><p>Write <b>pseudocode</b> comments first (lines starting with <code>#</code>), then turn them into code. Use at least one function, one <code>if</code>, and a <code>score</code>.</p>`,
      goal: "Make your own game with a <code>def</code>, an <code>if</code>, a <code>score</code> and keyboard controls.", hint: "Stuck? Go back to Catch the Stars and change the star into a rock: touching it makes you LOSE a point!", vocab: ["project", "debug", "iterate"],
      starter: `from game import *

# MY GAME PLAN (pseudocode):
# 1. ...
# 2. ...

x = 240
y = 300
score = 0

def tick():
    global x, y, score
    if key_down("ArrowLeft"):
        x -= 6
    if key_down("ArrowRight"):
        x += 6

    clear("#e7eef3")
    robot_face(x, y, 70)
    text(12, 28, "Score: " + str(score))

on_tick(tick)
`,
      require: [{ re: has("def \\w+\\("), label: "Use a function" }, { re: has("\\s*if "), label: "Use an if" }, { re: /score/, label: "Keep a score" }, { re: /key_down\(/, label: "Keyboard controls" }],
      final: true }
  );
})();
