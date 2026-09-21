/* Curriculum, part 1: robot lessons (units 1-4). Part 2 (games) is in lessons-game.js */
(function () {
  const CFM = (window.CFM = window.CFM || {});
  const b = CFM.b;
  CFM.UNITS = [
    { id: 1, title: "Meet Your Robot", sub: "Drag blocks to steer your robot", color: "#5b8def", tag: "Blocks" },
    { id: 2, title: "Blocks ⇄ Python", sub: "See your blocks turn into real text code", color: "#f0a020", tag: "Blocks → Text" },
    { id: 3, title: "Plan Like a Pro", sub: "Pseudocode: think first, code second", color: "#9b8bd6", tag: "Pseudocode" },
    { id: 4, title: "Python Power Tools", sub: "Loops, decisions, functions & variables", color: "#3fb58a", tag: "Python" },
    { id: 5, title: "Game Maker", sub: "Use text code to build your own games", color: "#e8735a", tag: "Games" },
  ];
  const L = (CFM.LESSONS = CFM.LESSONS || []);
  const HALL = ["#######", "#S...G#", "#######"];
  const STAIRS = ["######", "#S.###", "##..##", "###..#", "####G#", "######"];

  L.push(
    { id: "1-1", unit: 1, title: "Hello, Robot!", blurb: "Your very first program.", mode: "blocks",
      story: `<p>Meet your robot! Robots don't think for themselves — they only do exactly what you tell them. A list of instructions is called a <b>program</b>.</p>`,
      goal: "Get the robot to the flag 🚩. Drag <b>move forward</b> blocks into the workspace (or click them), then press <b>Run</b>.",
      hint: "The flag is 4 steps away. Use 4 “move forward” blocks!", vocab: ["program", "instruction"],
      map: HALL, dir: 1, allowed: ["move"] },
    { id: "1-2", unit: 1, title: "Take a Turn", blurb: "Robots can turn, too.", mode: "blocks",
      story: `<p>Walls are in the way! Your robot needs to <b>turn</b> to change direction. The yellow arrow under it shows which way it's facing.</p>`,
      goal: "Move 2, turn right, then move 2 more.",
      hint: "Order matters! Blocks run from top to bottom.", vocab: ["sequence", "turn"],
      map: ["#####", "#S..#", "###.#", "###G#", "#####"], dir: 1, allowed: ["move", "turn_left", "turn_right"] },
    { id: "1-3", unit: 1, title: "Gem Collector", blurb: "Grab every gem on the way.", mode: "blocks",
      story: `<p>Some shiny gems 💎 are lying around. A robot has to be standing <i>on</i> a gem to collect it.</p>`,
      goal: "Collect the gem, then reach the flag.", hint: "Move onto the gem's tile first, then use “collect gem”.", vocab: ["action"],
      map: ["#######", "#S.*.G#", "#######"], dir: 1, allowed: ["move", "turn_left", "turn_right", "collect"] },
    { id: "1-4", unit: 1, title: "Repeat After Me", blurb: "Loops save you tons of blocks.", mode: "blocks",
      story: `<p>This staircase needs the same pattern again and again. Instead of dragging 12 blocks, use a <b>loop</b>: put the pattern inside <b>repeat</b> and pick how many times!</p>`,
      goal: "Climb the stairs using a repeat block.", hint: "One step is: move, turn right, move, turn left. Repeat it 3 times.", vocab: ["loop", "repeat"],
      map: STAIRS, dir: 1, allowed: ["move", "turn_left", "turn_right", "repeat"], require: [{ re: /for /, label: "Use a repeat block" }] },

    { id: "2-1", unit: 2, title: "Watch the Code Appear", blurb: "Blocks are secretly text code.", mode: "blocks-text",
      story: `<p>Here's a secret: every block is a piece of <b>text code</b>. Real programmers type it instead of dragging. This robot code is written in a language called <b>Python</b>.</p><p>Build your program and watch the Python appear on the right! 👉</p>`,
      goal: "Reach the flag, then look at the Python your blocks made.", hint: "Move 3, turn right, move 2.", vocab: ["Python", "code", "syntax"],
      map: ["######", "#S...#", "####.#", "####G#", "######"], dir: 1, allowed: ["move", "turn_left", "turn_right", "repeat"] },
    { id: "2-2", unit: 2, title: "Translate It!", blurb: "You be the translator.", mode: "translate",
      story: `<p>Now it's your turn to translate. On the left are blocks. Type the <b>same program in Python</b> on the right. Each block is one line, like <code>move()</code>.</p><p>Python is picky: spell commands exactly, keep the <code>( )</code>, and put <b>one command per line</b>.</p>`,
      goal: "Type the Python that matches the blocks, then Run.", hint: "Block → line: “move forward” is <code>move()</code>, “turn right” is <code>turn_right()</code>, “turn left” is <code>turn_left()</code>.", vocab: ["translate", "command"],
      map: ["######", "#S..##", "###.##", "###.G#", "######"], dir: 1, allowed: [],
      starterBlocks: [b("move"), b("move"), b("turn_right"), b("move"), b("move"), b("turn_left"), b("move")], starter: "" },
    { id: "2-3", unit: 2, title: "Loops in Python", blurb: "The for loop.", mode: "translate",
      story: `<p>The <b>repeat</b> block becomes a <code>for</code> loop:</p><pre class="mono" style="display:block;padding:10px">for i in range(5):\n    move()</pre><p>Two things to notice: the line ends with a <b>colon</b> <code>:</code>, and the lines inside the loop are pushed in by 4 spaces (press <b>Tab</b>). This is called <b>indentation</b>.</p>`,
      goal: "Translate the repeat block into a Python for loop.", hint: "for i in range(5):  ← then Tab, then move()", vocab: ["for loop", "indentation", "colon"],
      map: ["########", "#S....G#", "########"], dir: 1, allowed: [], starterBlocks: [b("repeat", 5, [b("move")])], starter: "", require: [{ re: /for /, label: "Use a for loop" }] },
    { id: "2-4", unit: 2, title: "Write It Yourself", blurb: "No blocks. Just you and Python.", mode: "text",
      story: `<p>No more training wheels! Climb the staircase again, but this time write the whole program in Python — with a <code>for</code> loop.</p>`,
      goal: "Reach the flag with a Python for loop.", hint: "One stair = move(), turn_right(), move(), turn_left(). Do it 3 times.", vocab: ["text code"],
      map: STAIRS, dir: 1, starter: "# Climb the stairs!\n", require: [{ re: /for /, label: "Use a for loop" }] },

    { id: "3-1", unit: 3, title: "What is Pseudocode?", blurb: "Plans written in plain words.", mode: "pseudo-translate",
      story: `<p><b>Pseudocode</b> (say “SOO-doh-code”) is a plan written in everyday words — no strict spelling rules. Programmers write pseudocode first so they know what they're building, then translate it into real code.</p>`,
      goal: "Translate the pseudocode plan into Python.", hint: "REPEAT 3 TIMES → for i in range(3): … The indented lines go inside the loop.", vocab: ["pseudocode", "plan"],
      pseudo: "REPEAT 3 TIMES:\n    walk forward\n    pick up the gem\nWalk forward to the flag",
      map: ["#######", "#S***G#", "#######"], dir: 1, starter: "", require: [{ re: /for /, label: "Use a for loop" }] },
    { id: "3-2", unit: 3, title: "Plan First, Then Code", blurb: "Write your own pseudocode.", mode: "text", planFirst: true,
      story: `<p>Now <b>you</b> write the plan. In the yellow box, describe in plain words what the robot should do. Then translate it to Python below. Planning first makes bugs (mistakes) much easier to avoid!</p>`,
      goal: "Write a plan (2+ lines), then code it: collect the gem, then reach the flag.", hint: "Plan example: walk 4 steps… pick up gem… turn right… walk to flag.", vocab: ["algorithm", "bug"],
      map: ["#######", "#S.*..#", "#####.#", "#####G#", "#######"], dir: 1, starter: "" },
    { id: "3-3", unit: 3, title: "Decisions: if", blurb: "Let the robot choose.", mode: "text", planFirst: true,
      story: `<p>Robots can look around! <code>on_gem()</code> is a question the robot answers with <b>True</b> or <b>False</b>. With an <code>if</code>, the robot only acts when the answer is True:</p><pre class="mono" style="display:block;padding:10px">if on_gem():\n    collect()</pre>`,
      goal: "Plan it, then: walk to the flag and collect gems ONLY when standing on one.", hint: "for i in range(7):  move()  then  if on_gem():  collect()", vocab: ["if", "condition", "True / False"],
      map: ["##########", "#S.*.**.G#", "##########"], dir: 1, starter: "", require: [{ re: /if /, label: "Use an if" }, { re: /for |while /, label: "Use a loop" }] },
    { id: "3-4", unit: 3, title: "Follow the Path", blurb: "while + if / else.", mode: "text", planFirst: true,
      story: `<p>This path twists and turns. Let the robot decide as it goes:</p><pre class="mono" style="display:block;padding:10px">while not at_goal():\n    if path_ahead():\n        move()\n    else:\n        turn_right()</pre><p>A <code>while</code> loop keeps going <i>until</i> something changes. <code>else</code> is what to do when the <code>if</code> is False.</p>`,
      goal: "Write a plan, then a program that gets the robot to the flag — without counting steps!", hint: "Type the code from the story, and try running it. Then explain each line in your plan.", vocab: ["while", "else"],
      map: ["#######", "#S....#", "#####.#", "#G....#", "#######"], dir: 1, starter: "", require: [{ re: /while /, label: "Use a while loop" }, { re: /else/, label: "Use else" }] },

    { id: "4-1", unit: 4, title: "Make Your Own Command", blurb: "Functions with def.", mode: "text",
      story: `<p>A <b>function</b> is a mini-program with a name. You <b>define</b> it once with <code>def</code>, then <b>call</b> it as often as you like.</p><pre class="mono" style="display:block;padding:10px">def step():\n    move()\n    turn_right()\n    move()\n    turn_left()\n\nstep()</pre>`,
      goal: "Define a function for one stair, then call it 3 times to climb.", hint: "Define first, call after. Don't forget the colon and indentation!", vocab: ["function", "define", "call"],
      map: STAIRS, dir: 1, starter: "# Define your own command:\ndef step():\n    # what does one stair look like?\n    pass\n\n# Now use it!\n", require: [{ re: /def \w+\(\)/, label: "Define a function" }] },
    { id: "4-2", unit: 4, title: "Count Your Gems", blurb: "Variables remember things.", mode: "text",
      story: `<p>A <b>variable</b> is a labelled box that remembers a value. Make one with <code>=</code> and change it with <code>+=</code>:</p><pre class="mono" style="display:block;padding:10px">gems = 0\ngems += 1\nsay("I have " + str(gems))</pre>`,
      goal: "Collect every gem, count them in a variable, and make the robot <code>say</code> the total at the end.", hint: "gems = 0 at the top. Add 1 each time you collect. Use say(...) at the end.", vocab: ["variable", "value", "string"],
      map: ["##########", "#S*.**..G#", "##########"], dir: 1, starter: "gems = 0\n\n", require: [{ re: /\+=\s*1/, label: "Count with +=" }, { re: /say\(/, label: "Use say()" }] },
    { id: "4-3", unit: 4, title: "Robot Show-Off", blurb: "Combine everything.", mode: "text", planFirst: true,
      story: `<p>Time to combine <b>loops, decisions, functions and variables</b>. Plan first, then code.</p>`,
      goal: "Collect all 4 gems AND reach the flag. Use at least one function and one loop.", hint: "Make a function for the repeating shape. Use a loop to call it.", vocab: ["decompose", "reuse"],
      map: ["########", "#S*.*..#", "######.#", "#G*.*..#", "########"], dir: 1, starter: "" }
  );
})();
