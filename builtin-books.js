/* TEACHAiD built-in textbooks — foundations, Coding 101, college gen-ed */
/* Each book: title, teacher, teacherBlurb, avatar, track, order, tag, card, ch:[{n,h,t}] */
(function (global) {
  function fin(msg) {
    return (
      '<div class="done-box"><p>' +
      (msg || "You finished this book.") +
      '</p><button class="btn" onclick="finishBook()">Finish book → Home</button></div>'
    );
  }
  function idea(title, body) {
    return (
      '<div class="callout idea"><div class="callout-title">' +
      title +
      "</div>" +
      body +
      "</div>"
    );
  }
  function trybox(title, body) {
    return (
      '<div class="callout try"><div class="callout-title">' +
      title +
      "</div>" +
      body +
      "</div>"
    );
  }
  function teach(name, body) {
    return (
      '<div class="callout teacher"><div class="callout-title">Your book teacher · ' +
      name +
      "</div>" +
      body +
      "</div>"
    );
  }
  function ch(n, h, t) {
    return { n: n, h: h, t: t };
  }

  var BUILTIN_BOOKS = {
    /* ========== Foundations (path into Coding 101) ========== */
    s1: {
      title: "Counting",
      teacher: "Mira",
      teacherBlurb: "Friendly tutor for Counting — walks the pages with you.",
      avatar: "M",
      track: "foundations",
      order: 1,
      tag: "BOOK 01",
      card: "What counting is, numbers as names, and zero",
      ch: [
        ch(
          "Hello",
          "<h2>Hello</h2><div class='meta'>No prior knowledge needed</div><p>This is the first book. We start with <strong>counting</strong>.</p>" +
            teach("Mira", "Mira is below when you want company — she teaches only this book."),
          "Chapter: Hello. This is the first book. Audience: complete beginners. Topic: counting. Encourage the learner. No prior knowledge needed."
        ),
        ch(
          "What is counting?",
          "<h2>What is counting?</h2><p>Counting matches things to names:</p><p style='text-align:center;font-size:1.5rem;letter-spacing:.2em;margin:12px 0'>🍎 🍎 🍎</p><p style='text-align:center;color:#a1a1aa'>one · two · three</p>" +
            idea("Simple idea", "Counting answers: How many?"),
          "Chapter: What is counting? Counting matches things to number-names. Example: three apples → one, two, three. Core idea: counting answers 'How many?'"
        ),
        ch(
          "Numbers",
          "<h2>Numbers as names</h2><p>The number <strong>5</strong> is the name for any group of five things.</p><div class='widget'><div class='widget-title'>Make a number</div><input type='range' id='dr' min='0' max='12' value='3' oninput='updDots()'><div class='big' id='bn'>3</div><div class='dots' id='db'></div></div>",
          "Chapter: Numbers as names. A number is a name for a size of group. Example: 5 names any group of five things (apples, stars, steps). Interactive idea: move a slider to build groups of dots."
        ),
        ch(
          "Zero",
          "<h2>Zero</h2><p>What if there are no apples? We still need a name.</p><p style='text-align:center;font-size:1.4rem;color:#f59e0b;margin:12px 0'><strong>0</strong> · zero</p>" +
            idea("Important", "Zero means none. It is a real number."),
          "Chapter: Zero. When there are no items, we still need a name: 0, zero. Zero means none. Zero is a real number, not 'nothing to ignore'."
        ),
        ch(
          "Game",
          "<h2>Game · How many?</h2><div class='widget'><div class='widget-title'>Get <strong>5 correct</strong> to finish</div><p style='text-align:center;color:#a1a1aa;font-size:.85rem'>Score: <strong id='gs' style='color:#a3ff12'>0</strong> / <span id='gNeed'>5</span> correct &nbsp;·&nbsp; tries: <span id='gt'>0</span></p><div class='items' id='gi'></div><div class='game-btns' id='gb'></div><div class='msg' id='gm'></div><div id='gDone' class='done-box hidden'><p>✓ Counting game complete!</p><button class='btn' onclick='finishBook()'>Finish book → Home</button><button class='btn secondary' style='margin-top:8px' onclick='gReset()'>Play again</button></div><button class='btn secondary' id='gSkip' style='margin-top:10px' onclick='gSkipGame()'>Skip game · finish book</button></div>",
          "Chapter: Game — How many? Practice: count items and pick the correct number. Goal: 5 correct answers. Wrong answers show the right count. This checks understanding of counting and zero-friendly counts."
        ),
      ],
    },
    s2: {
      title: "Positive & Negative",
      teacher: "Nova",
      teacherBlurb: "Number-line tutor — patient with positives and negatives.",
      avatar: "N",
      track: "foundations",
      order: 2,
      tag: "BOOK 02",
      card: "Number line and negative numbers",
      ch: [
        ch(
          "Welcome",
          "<h2>Welcome</h2><p>You can count 0, 1, 2, 3… Now numbers can also go the other way: <strong>negative numbers</strong>.</p>",
          "Chapter: Welcome. Learner already knows 0,1,2,3… Now introduce numbers that go the other way: negative numbers."
        ),
        ch(
          "Positive",
          "<h2>Positive numbers</h2><p style='text-align:center;color:#22c55e;letter-spacing:.12em;margin:12px 0'>1 · 2 · 3 · 4 · 5 · …</p><p>Amounts greater than zero.</p>",
          "Chapter: Positive numbers. 1,2,3,4,5… are positive. They are amounts greater than zero."
        ),
        ch(
          "Number line",
          "<h2>The number line</h2><p>Zero in the middle. Positive right. Negative left.</p><div class='widget'><div class='widget-title'>Move</div><input type='range' id='lr' min='-8' max='8' value='2' oninput='updLine()'><div class='big' id='lb' style='color:#22c55e'>2</div></div>",
          "Chapter: The number line. Zero in the middle. Positive numbers to the right. Negative numbers to the left. Interactive: move along the line."
        ),
        ch(
          "Negative",
          "<h2>Negative numbers</h2><ul><li>+3 = three steps right · −3 = three steps left</li><li>+5° above zero · −5° below</li><li>+2 dollars you have · −2 you owe</li></ul>",
          "Chapter: Negative numbers. +3 means three steps right; −3 three steps left. Examples: temperature above/below zero; money you have vs money you owe."
        ),
        ch(
          "Check",
          "<h2>Quick check</h2><div class='widget'><p style='margin-bottom:8px'>Which is a negative number?</p><button class='btn secondary' style='margin-bottom:8px' onclick='this.style.borderColor=\"#ef4444\"'>7</button><button class='btn secondary' style='margin-bottom:8px' onclick='this.style.borderColor=\"#22c55e\";this.textContent=\"−4 ✓\"'>−4</button><button class='btn secondary' onclick='this.style.borderColor=\"#ef4444\"'>0</button>" +
            fin("When ready, finish this book.") +
            "</div>",
          "Chapter: Quick check. Question: which is negative? Options 7, −4, 0. Correct answer is −4. Zero is not positive or negative."
        ),
      ],
    },
    s3: {
      title: "How Computers Count",
      teacher: "Bit",
      teacherBlurb: "Bits tutor — makes on/off feel simple.",
      avatar: "B",
      track: "foundations",
      order: 3,
      tag: "BOOK 03",
      card: "Bits (0 and 1)",
      ch: [
        ch(
          "Welcome",
          "<h2>Welcome</h2><p>Computers count with only two states: <strong>off</strong> and <strong>on</strong>.</p>",
          "Chapter: Welcome. Computers count with two states: off and on."
        ),
        ch(
          "Bits",
          "<h2>Bits</h2><p>One two-state piece is a <strong>bit</strong>.</p><ul><li><strong>0</strong> = off</li><li><strong>1</strong> = on</li></ul><div class='widget'><div class='widget-title'>Tap to flip</div><div class='bits' id='dbits'></div></div>",
          "Chapter: Bits. A bit is one two-state piece. 0 means off. 1 means on. Learner can flip bits."
        ),
        ch(
          "Counting",
          "<h2>Counting with bits</h2><p style='font-family:ui-monospace,monospace;text-align:center;line-height:1.8;font-size:.9rem'>000 → 0 &nbsp; 001 → 1 &nbsp; 010 → 2<br>011 → 3 &nbsp; 100 → 4 &nbsp; 101 → 5</p>" +
            idea("Key idea", "Computers store patterns of bits. Those patterns are our numbers."),
          "Chapter: Counting with bits. Patterns: 000=0, 001=1, 010=2, 011=3, 100=4, 101=5. Key idea: computers store bit patterns; those patterns stand for numbers."
        ),
        ch(
          "Game",
          "<h2>Game · Make the number</h2><div class='widget'><div class='widget-title'>Match <strong>3 targets</strong> to finish</div><p style='text-align:center'>Target: <strong id='bt' style='color:#00ffd1;font-size:1.3rem'>5</strong> &nbsp;·&nbsp; won: <strong id='bw' style='color:#a3ff12'>0</strong>/3</p><div class='bits' id='gbits'></div><p style='text-align:center;color:#a1a1aa'>Current: <strong id='bv' style='color:#e4e4e7'>0</strong></p><div class='msg' id='bm'></div><div id='bDone' class='done-box hidden'><p>✓ Bits game complete!</p><button class='btn' onclick='finishBook()'>Finish path → Home</button><button class='btn secondary' style='margin-top:8px' onclick='bReset()'>Play again</button></div><button class='btn secondary' id='bSkip' style='margin-top:10px' onclick='bSkipGame()'>Skip game · finish</button></div>" +
            trybox("Coding 101 path", "Next: Integers to Codes, then Variables, Decisions, Loops, and more."),
          "Chapter: Game — Make the number. Flip 4 bits (values 8,4,2,1) to match a target number. Goal: 3 successful matches. Practices binary place values."
        ),
      ],
    },

    /* ========== Coding 101 ========== */
    c1: {
      title: "Integers to Codes",
      teacher: "Codex",
      teacherBlurb: "Integers & codes tutor — maps ideas step by step.",
      avatar: "C",
      track: "coding101",
      order: 1,
      tag: "CODE 01",
      tagStyle: "background:rgba(147,197,253,.12);color:#93c5fd",
      card: "Why codes need positive integers",
      ch: [
        ch(
          "Welcome",
          "<h2>From Integers to Codes</h2><p>Most codes speak <strong>positive integers</strong>. This book shows why and how we map any integer to a positive one.</p>" +
            teach("Codex", "Coding 101 book 1 of 8 — foundations of how programs name data."),
          "Chapter: Welcome. Most codes use positive integers. This book shows why and how to map any integer to a positive one. Coding 101 sequence."
        ),
        ch(
          "Integers",
          "<h2>Integers</h2><p>Whole numbers: … −2, −1, 0, 1, 2 …</p><p>Positive > 0. Negative < 0. Zero is neither.</p>",
          "Chapter: Integers. Whole numbers … −2,−1,0,1,2… Positive greater than 0. Negative less than 0. Zero is neither."
        ),
        ch(
          "Mapping",
          "<h2>Map any integer → positive</h2><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>n > 0 → 2n<br>n ≤ 0 → −2n + 1</p><div class='widget'><div class='widget-title'>Try</div><input type='range' id='mr' min='-8' max='8' value='-3' oninput='updMap()'><p style='text-align:center;margin-top:8px' id='mo'></p></div>",
          "Chapter: Map any integer to a positive integer. Rule: if n>0 then map=2n; if n≤0 then map=−2n+1. Interactive: try different n."
        ),
        ch(
          "Why",
          "<h2>Why it matters</h2><p>Data becomes sequences of positive integers, then those integers are encoded.</p>" +
            idea("Pattern", "Transform → positive integers → integer code.") +
            trybox("Next in Coding 101", "Open <strong>What is a Program?</strong> after this book.") +
            fin("Coding 101 · book 1 complete"),
          "Chapter: Why it matters. Pipeline: transform data → positive integers → encode those integers. Next Coding 101 book: What is a Program?"
        ),
      ],
    },
    c2: {
      title: "What is a Program?",
      teacher: "Ada",
      teacherBlurb: "Programs & recipes — plain language first.",
      avatar: "A",
      track: "coding101",
      order: 2,
      tag: "CODE 02",
      tagStyle: "background:rgba(147,197,253,.12);color:#93c5fd",
      card: "Instructions a computer can follow",
      ch: [
        ch(
          "Welcome",
          "<h2>What is a program?</h2><p>A <strong>program</strong> is a precise list of instructions for a computer — like a recipe that never assumes “you know what I mean.”</p>" +
            teach("Ada", "Coding 101 book 2 — Ada teaches only this book."),
          "Chapter: Welcome. A program is a precise list of instructions for a computer. Compare to a recipe that must not skip steps. Coding 101 book 2."
        ),
        ch(
          "Input → process → output",
          "<h2>The basic pattern</h2><p style='text-align:center;font-family:ui-monospace,monospace;margin:12px 0'>input → process → output</p><ul><li><strong>Input</strong>: data you give (numbers, text, clicks)</li><li><strong>Process</strong>: steps the program runs</li><li><strong>Output</strong>: what you get back (display, file, sound)</li></ul>" +
            idea("Remember", "Every useful program takes something in, changes it, and shows a result."),
          "Chapter: Input → process → output. Input is data given. Process is the steps. Output is the result. Core pattern of programs."
        ),
        ch(
          "Algorithms",
          "<h2>Algorithms (the idea)</h2><p>An <strong>algorithm</strong> is a clear method to solve a problem — independent of any one language.</p><p>Example: “To find the larger of two numbers, compare them; keep the bigger one.”</p>",
          "Chapter: Algorithms. An algorithm is a clear method to solve a problem, not tied to one programming language. Example: compare two numbers and keep the larger."
        ),
        ch(
          "Bugs",
          "<h2>Bugs are normal</h2><p>A <strong>bug</strong> is when the program does the wrong thing (or crashes). Finding bugs is <strong>debugging</strong>.</p>" +
            idea("Mindset", "Mistakes are data. Fix one small thing, run again."),
          "Chapter: Bugs. A bug is incorrect or crashing behavior. Debugging finds and fixes bugs. Encourage calm iterative fixing."
        ),
        ch(
          "Check",
          "<h2>Quick check</h2><p>Which best matches a program?</p><ul><li>A vague hope the computer “gets it”</li><li><strong>A step-by-step list a machine can follow</strong></li><li>Only pictures with no rules</li></ul>" +
            trybox("Next", "Variables & Values") +
            fin("Coding 101 · book 2 complete"),
          "Chapter: Quick check. A program is a step-by-step list a machine can follow. Next: Variables & Values."
        ),
      ],
    },
    c3: {
      title: "Variables & Values",
      teacher: "Val",
      teacherBlurb: "Names for values — boxes with labels.",
      avatar: "V",
      track: "coding101",
      order: 3,
      tag: "CODE 03",
      tagStyle: "background:rgba(147,197,253,.12);color:#93c5fd",
      card: "Store numbers and names in memory",
      ch: [
        ch(
          "Welcome",
          "<h2>Variables</h2><p>A <strong>variable</strong> is a named place that holds a <strong>value</strong>. Think: a labeled box.</p>" +
            teach("Val", "Coding 101 book 3."),
          "Chapter: Welcome. A variable is a named place that holds a value — like a labeled box. Coding 101 book 3."
        ),
        ch(
          "Assign",
          "<h2>Assignment</h2><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>score = 10<br>name = \"Mira\"</p><p>The name is on the left. The value is on the right. Reading <code>score</code> later means “whatever is in that box now.”</p>",
          "Chapter: Assignment. score = 10 stores 10 in score. name = \"Mira\" stores text. Reading the name retrieves the current value."
        ),
        ch(
          "Types",
          "<h2>Simple types</h2><ul><li><strong>Number</strong> — 3, 0, −2, 3.14</li><li><strong>Text (string)</strong> — \"hello\"</li><li><strong>True/false (boolean)</strong> — true or false</li></ul>" +
            idea("Why types matter", "You add numbers; you join strings. Mixing them without care causes bugs."),
          "Chapter: Simple types. Numbers, strings (text), booleans (true/false). Operations depend on type; careless mixing causes bugs."
        ),
        ch(
          "Update",
          "<h2>Values can change</h2><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>score = 10<br>score = score + 1<br>// score is now 11</p><p>Same name, new value. That’s why they’re called <em>variables</em>.</p>",
          "Chapter: Update. Variables can change: score = score + 1 makes score 11 if it was 10. Same name, new value."
        ),
        ch(
          "Check",
          "<h2>Quick check</h2><p>After <code>x = 5</code> then <code>x = x * 2</code>, what is x?</p><p style='text-align:center;font-size:1.3rem;color:#a3e635;margin:12px 0'><strong>10</strong></p>" +
            trybox("Next", "Text & Strings") +
            fin("Coding 101 · book 3 complete"),
          "Chapter: Quick check. After x=5 and x=x*2, x is 10. Next: Text & Strings."
        ),
      ],
    },
    c4: {
      title: "Text & Strings",
      teacher: "Tess",
      teacherBlurb: "Words in code — quotes, join, length.",
      avatar: "T",
      track: "coding101",
      order: 4,
      tag: "CODE 04",
      tagStyle: "background:rgba(147,197,253,.12);color:#93c5fd",
      card: "Work with words and messages",
      ch: [
        ch(
          "Welcome",
          "<h2>Strings</h2><p>A <strong>string</strong> is text in a program — letters, spaces, punctuation — usually written in quotes.</p>" +
            teach("Tess", "Coding 101 book 4."),
          "Chapter: Welcome. A string is text in a program, usually in quotes. Coding 101 book 4."
        ),
        ch(
          "Quotes",
          "<h2>Quotes mark text</h2><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>\"hello\"<br>'hi there'</p><p>Without quotes, <code>hello</code> looks like a variable name. With quotes, it is the word itself.</p>",
          "Chapter: Quotes. \"hello\" is a string value. Without quotes, hello is treated as a variable name."
        ),
        ch(
          "Join",
          "<h2>Joining strings</h2><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>\"Hi, \" + name<br>// if name is \"Ada\" → \"Hi, Ada\"</p>" +
            idea("Concatenation", "Putting strings end-to-end is joining (or concatenating) them."),
          "Chapter: Join. Concatenation puts strings end to end, e.g. \"Hi, \" + name. If name is Ada, result is Hi, Ada."
        ),
        ch(
          "Length",
          "<h2>Length</h2><p>The <strong>length</strong> of a string is how many characters it has (including spaces).</p><p><code>\"cat\"</code> has length <strong>3</strong>. <code>\"a b\"</code> has length <strong>3</strong>.</p>",
          "Chapter: Length. Length counts characters including spaces. \"cat\" length 3; \"a b\" length 3."
        ),
        ch(
          "Check",
          "<h2>Quick check</h2><p>What is <code>\"go\" + \"!\"</code>?</p><p style='text-align:center;font-size:1.3rem;color:#a3e635;margin:12px 0'><strong>\"go!\"</strong></p>" +
            trybox("Next", "Decisions (if)") +
            fin("Coding 101 · book 4 complete"),
          "Chapter: Quick check. \"go\" + \"!\" is \"go!\". Next: Decisions (if)."
        ),
      ],
    },
    c5: {
      title: "Decisions (if)",
      teacher: "Branch",
      teacherBlurb: "Yes/no forks — if and else.",
      avatar: "R",
      track: "coding101",
      order: 5,
      tag: "CODE 05",
      tagStyle: "background:rgba(147,197,253,.12);color:#93c5fd",
      card: "Choose different paths with conditions",
      ch: [
        ch(
          "Welcome",
          "<h2>Decisions</h2><p>Programs often must <strong>choose</strong>: if something is true, do A; otherwise do B.</p>" +
            teach("Branch", "Coding 101 book 5."),
          "Chapter: Welcome. Programs choose paths: if true do A, else do B. Coding 101 book 5."
        ),
        ch(
          "Conditions",
          "<h2>Conditions</h2><p>A <strong>condition</strong> is a true/false question:</p><ul><li><code>score >= 70</code></li><li><code>name == \"Ada\"</code></li><li><code>ready == true</code></li></ul>" +
            idea("Compare carefully", "== asks “are these equal?”  = assigns a value."),
          "Chapter: Conditions. Conditions are true/false tests: score >= 70, name == \"Ada\". == tests equality; = assigns."
        ),
        ch(
          "If / else",
          "<h2>if / else</h2><p style='font-family:ui-monospace,monospace;font-size:.85rem;margin:12px 0'>if score >= 70:<br>&nbsp;&nbsp;print(\"pass\")<br>else:<br>&nbsp;&nbsp;print(\"keep practicing\")</p><p>Only one branch runs.</p>",
          "Chapter: if/else. If condition true, run the if body; otherwise the else body. Only one branch runs."
        ),
        ch(
          "Else if",
          "<h2>More than two paths</h2><p>Chain checks: if… else if… else… for grades A/B/C or weather cases.</p><p>Order matters — first true condition wins.</p>",
          "Chapter: Else if. Chain if / else if / else for multiple cases. First matching condition wins; order matters."
        ),
        ch(
          "Check",
          "<h2>Quick check</h2><p>If <code>n = 3</code> and the program says “if n > 5 print Big else print Small”, what prints?</p><p style='text-align:center;font-size:1.3rem;color:#a3e635;margin:12px 0'><strong>Small</strong></p>" +
            trybox("Next", "Loops") +
            fin("Coding 101 · book 5 complete"),
          "Chapter: Quick check. n=3 is not > 5 so else runs: Small. Next: Loops."
        ),
      ],
    },
    c6: {
      title: "Loops",
      teacher: "Loop",
      teacherBlurb: "Repeat without copy-paste.",
      avatar: "L",
      track: "coding101",
      order: 6,
      tag: "CODE 06",
      tagStyle: "background:rgba(147,197,253,.12);color:#93c5fd",
      card: "Repeat steps while a condition holds",
      ch: [
        ch(
          "Welcome",
          "<h2>Loops</h2><p>A <strong>loop</strong> runs the same steps again and again — while a condition is true, or a fixed number of times.</p>" +
            teach("Loop", "Coding 101 book 6."),
          "Chapter: Welcome. A loop repeats steps while a condition is true or a fixed number of times. Coding 101 book 6."
        ),
        ch(
          "While",
          "<h2>while</h2><p style='font-family:ui-monospace,monospace;font-size:.85rem;margin:12px 0'>n = 3<br>while n > 0:<br>&nbsp;&nbsp;print(n)<br>&nbsp;&nbsp;n = n - 1</p><p>Prints 3, then 2, then 1. Then stops.</p>" +
            idea("Progress", "Something inside the loop must move toward the end — or it never stops."),
          "Chapter: while. While condition is true, run the body. Example counts down from 3. Body must progress toward stopping."
        ),
        ch(
          "For",
          "<h2>for (counted loops)</h2><p>Often you want “do this 5 times” or “for each item.” A <strong>for</strong> loop is built for that pattern.</p><p style='font-family:ui-monospace,monospace;font-size:.85rem;text-align:center;margin:12px 0'>for i in 1..5: print(i)</p>",
          "Chapter: for. For loops repeat a fixed number of times or over each item. Example: for i in 1..5 print i."
        ),
        ch(
          "Avoid infinity",
          "<h2>Infinite loops</h2><p>If the condition never becomes false, the loop never ends. Always ask: “What makes this stop?”</p>",
          "Chapter: Avoid infinity. Infinite loops never end because the condition stays true. Always know what makes the loop stop."
        ),
        ch(
          "Check",
          "<h2>Quick check</h2><p>A loop that prints while <code>x < 3</code> starting at x=0 and doing x=x+1 each time prints how many times?</p><p style='text-align:center;font-size:1.3rem;color:#a3e635;margin:12px 0'><strong>3</strong> (x=0,1,2)</p>" +
            trybox("Next", "Functions") +
            fin("Coding 101 · book 6 complete"),
          "Chapter: Quick check. while x<3 from 0 with +1 runs for x=0,1,2 → 3 times. Next: Functions."
        ),
      ],
    },
    c7: {
      title: "Functions",
      teacher: "Finn",
      teacherBlurb: "Named mini-programs you can reuse.",
      avatar: "F",
      track: "coding101",
      order: 7,
      tag: "CODE 07",
      tagStyle: "background:rgba(147,197,253,.12);color:#93c5fd",
      card: "Package steps under a name",
      ch: [
        ch(
          "Welcome",
          "<h2>Functions</h2><p>A <strong>function</strong> is a named bundle of steps. Call the name; the steps run. You can reuse it anytime.</p>" +
            teach("Finn", "Coding 101 book 7."),
          "Chapter: Welcome. A function is a named bundle of steps you can call and reuse. Coding 101 book 7."
        ),
        ch(
          "Define & call",
          "<h2>Define and call</h2><p style='font-family:ui-monospace,monospace;font-size:.85rem;margin:12px 0'>function greet(name):<br>&nbsp;&nbsp;print(\"Hi, \" + name)<br><br>greet(\"Ada\")</p><p><strong>Define</strong> once. <strong>Call</strong> as many times as you need.</p>",
          "Chapter: Define and call. Define function greet(name) that prints Hi + name. Call greet(\"Ada\"). Define once, call many times."
        ),
        ch(
          "Parameters",
          "<h2>Parameters & arguments</h2><p><strong>Parameters</strong> are placeholders in the definition (<code>name</code>). <strong>Arguments</strong> are the real values you pass in (<code>\"Ada\"</code>).</p>",
          "Chapter: Parameters & arguments. Parameters are placeholders in the definition; arguments are values passed when calling."
        ),
        ch(
          "Return",
          "<h2>Return a value</h2><p style='font-family:ui-monospace,monospace;font-size:.85rem;margin:12px 0'>function double(n):<br>&nbsp;&nbsp;return n * 2<br><br>x = double(5)  // x is 10</p>" +
            idea("Output of a function", "return sends a value back to the caller."),
          "Chapter: Return. return sends a value back. double(5) returns 10. Caller can store the result."
        ),
        ch(
          "Check",
          "<h2>Quick check</h2><p>Why use functions? (pick the best)</p><ul><li>To make the computer slower on purpose</li><li><strong>To reuse clear steps without copy-paste</strong></li><li>To avoid using variables forever</li></ul>" +
            trybox("Next", "Lists & Capstone") +
            fin("Coding 101 · book 7 complete"),
          "Chapter: Quick check. Functions reuse clear steps without copy-paste. Next: Lists & Capstone."
        ),
      ],
    },
    c8: {
      title: "Lists & Capstone",
      teacher: "Lista",
      teacherBlurb: "Collections + put Coding 101 together.",
      avatar: "G",
      track: "coding101",
      order: 8,
      tag: "CODE 08",
      tagStyle: "background:rgba(147,197,253,.12);color:#93c5fd",
      card: "Groups of values + final practice",
      ch: [
        ch(
          "Welcome",
          "<h2>Lists</h2><p>A <strong>list</strong> (or array) holds an ordered group of values under one name.</p><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>scores = [90, 70, 85]</p>" +
            teach("Lista", "Coding 101 book 8 — last book of the class."),
          "Chapter: Welcome. A list/array is an ordered group of values, e.g. scores = [90, 70, 85]. Coding 101 final book."
        ),
        ch(
          "Index",
          "<h2>Index (position)</h2><p>Positions usually start at <strong>0</strong>.</p><ul><li><code>scores[0]</code> → first item (90)</li><li><code>scores[1]</code> → second (70)</li></ul>" +
            idea("Zero-based", "The first slot is index 0 — same idea as bits counting from patterns."),
          "Chapter: Index. Positions start at 0. scores[0] is first item. Zero-based indexing is common in programming."
        ),
        ch(
          "Loop lists",
          "<h2>Loop over a list</h2><p>Use a loop to visit each item: total a sum, find a max, print each name.</p><p style='font-family:ui-monospace,monospace;font-size:.85rem;margin:12px 0'>total = 0<br>for s in scores:<br>&nbsp;&nbsp;total = total + s</p>",
          "Chapter: Loop lists. Loop over each item to sum, find max, or print. Example: total scores with for loop."
        ),
        ch(
          "Capstone",
          "<h2>Capstone · put it together</h2><p>A tiny program uses everything from Coding 101:</p><ol><li><strong>Variables</strong> store input</li><li><strong>Decisions</strong> branch on a condition</li><li><strong>Loops</strong> repeat work</li><li><strong>Functions</strong> name clean steps</li><li><strong>Lists</strong> hold many values</li></ol>" +
            idea("You can build", "Example idea: grade a list of scores — pass if average ≥ 70."),
          "Chapter: Capstone. Combine variables, decisions, loops, functions, lists. Example: average a list of scores; pass if average >= 70."
        ),
        ch(
          "Graduate",
          "<h2>Coding 101 complete</h2><p>You covered codes, programs, variables, strings, if/else, loops, functions, and lists.</p>" +
            trybox("What next?", "College track: Algebra, English, Stats, and more — or load your own materials in Curriculum.") +
            fin("🎓 Coding 101 complete"),
          "Chapter: Graduate. Coding 101 complete: codes, programs, variables, strings, decisions, loops, functions, lists. Next: college courses or custom curriculum."
        ),
      ],
    },

    /* ========== College gen-ed ========== */
    col_alg: {
      title: "College Algebra",
      teacher: "Alma",
      teacherBlurb: "Equations & graphs — steady and clear.",
      avatar: "A",
      track: "college",
      order: 1,
      tag: "MATH",
      tagStyle: "background:rgba(251,191,36,.12);color:#fbbf24",
      card: "Linear equations, functions, graphs",
      ch: [
        ch(
          "Welcome",
          "<h2>College Algebra</h2><p>This course builds fluency with <strong>equations</strong>, <strong>functions</strong>, and <strong>graphs</strong> — tools used across STEM and business.</p>" +
            teach("Alma", "Alma teaches only College Algebra."),
          "Chapter: Welcome. College Algebra: equations, functions, graphs for STEM and business. Teacher Alma."
        ),
        ch(
          "Linear equations",
          "<h2>Linear equations</h2><p>Form: <strong>ax + b = c</strong>. Goal: isolate x with inverse operations.</p><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>2x + 3 = 11<br>2x = 8<br>x = 4</p>" +
            idea("Balance", "Whatever you do to one side, do to the other."),
          "Chapter: Linear equations. Form ax+b=c. Isolate x with inverse ops. Example: 2x+3=11 → x=4. Balance both sides."
        ),
        ch(
          "Slope & line",
          "<h2>Slope-intercept form</h2><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>y = mx + b</p><ul><li><strong>m</strong> = slope (rise/run)</li><li><strong>b</strong> = y-intercept (where it hits the y-axis)</li></ul>",
          "Chapter: Slope-intercept. y=mx+b. m is slope (rise/run); b is y-intercept."
        ),
        ch(
          "Functions",
          "<h2>Functions</h2><p>A <strong>function</strong> assigns each allowed input exactly one output. Notation: <strong>f(x)</strong>.</p><p>Example: f(x) = 2x + 1 → f(3) = 7.</p>",
          "Chapter: Functions. Each allowed input maps to exactly one output. f(x)=2x+1; f(3)=7."
        ),
        ch(
          "Quadratics intro",
          "<h2>Quadratics (intro)</h2><p>Form: <strong>ax² + bx + c = 0</strong> (a ≠ 0). Graph is a parabola.</p><p>Solutions can use factoring, completing the square, or the quadratic formula.</p>" +
            fin("College Algebra · core complete — keep practicing with Alma"),
          "Chapter: Quadratics intro. ax²+bx+c=0, a≠0. Graph is parabola. Solve by factoring, completing square, or quadratic formula."
        ),
      ],
    },
    col_stat: {
      title: "Intro Statistics",
      teacher: "Sam",
      teacherBlurb: "Data, averages, and honest claims.",
      avatar: "S",
      track: "college",
      order: 2,
      tag: "MATH",
      tagStyle: "background:rgba(251,191,36,.12);color:#fbbf24",
      card: "Describing data and basic probability",
      ch: [
        ch(
          "Welcome",
          "<h2>Intro Statistics</h2><p>Statistics turns raw numbers into <strong>useful summaries</strong> — and checks whether claims are fair.</p>" +
            teach("Sam", "Sam teaches only Intro Statistics."),
          "Chapter: Welcome. Statistics summarizes data and checks fairness of claims. Teacher Sam."
        ),
        ch(
          "Mean median mode",
          "<h2>Center of data</h2><ul><li><strong>Mean</strong> — average (sum ÷ count)</li><li><strong>Median</strong> — middle value when sorted</li><li><strong>Mode</strong> — most common value</li></ul>" +
            idea("Outliers", "A huge outlier pulls the mean more than the median."),
          "Chapter: Mean median mode. Mean is average; median is middle when sorted; mode is most common. Outliers affect mean more than median."
        ),
        ch(
          "Spread",
          "<h2>Spread</h2><p><strong>Range</strong> = max − min. <strong>Variance / standard deviation</strong> describe how scattered values are around the mean.</p>",
          "Chapter: Spread. Range is max-min. Variance and standard deviation measure scatter around the mean."
        ),
        ch(
          "Probability basics",
          "<h2>Probability basics</h2><p>Probability of an event is from <strong>0</strong> (impossible) to <strong>1</strong> (certain).</p><p>Fair coin: P(heads) = 1/2. Fair six-sided die: P(6) = 1/6.</p>",
          "Chapter: Probability basics. Probability from 0 to 1. Fair coin P(heads)=1/2. Fair die P(6)=1/6."
        ),
        ch(
          "Samples",
          "<h2>Samples vs population</h2><p>We often study a <strong>sample</strong> to learn about a larger <strong>population</strong>. Bias in how you sample breaks the claim.</p>" +
            fin("Intro Statistics · core complete"),
          "Chapter: Samples vs population. Samples estimate populations. Biased sampling invalidates claims."
        ),
      ],
    },
    col_eng: {
      title: "English Composition",
      teacher: "Wren",
      teacherBlurb: "Clear paragraphs, thesis, revision.",
      avatar: "W",
      track: "college",
      order: 3,
      tag: "ENGL",
      tagStyle: "background:rgba(244,114,182,.12);color:#f9a8d4",
      card: "Thesis, structure, and revision",
      ch: [
        ch(
          "Welcome",
          "<h2>English Composition</h2><p>College writing is <strong>clear claims + evidence + structure</strong>. Wren coaches one essay skill at a time.</p>" +
            teach("Wren", "Wren teaches only English Composition."),
          "Chapter: Welcome. Composition: clear claims, evidence, structure. Teacher Wren."
        ),
        ch(
          "Thesis",
          "<h2>Thesis statement</h2><p>A <strong>thesis</strong> is one sentence that states your main claim. It is specific and arguable — not just a topic label.</p>" +
            idea("Weak vs strong", "Weak: “Social media is interesting.” Strong: “Campus programs should limit phone use in first-year seminars because…”"),
          "Chapter: Thesis. One sentence main claim: specific and arguable, not a vague topic label."
        ),
        ch(
          "Paragraphs",
          "<h2>Paragraphs that work</h2><ul><li><strong>Topic sentence</strong> — what this paragraph does</li><li><strong>Evidence</strong> — quote, fact, example</li><li><strong>Explanation</strong> — why the evidence supports the thesis</li></ul>",
          "Chapter: Paragraphs. Topic sentence, evidence, explanation linking evidence to thesis."
        ),
        ch(
          "Revision",
          "<h2>Revision is writing</h2><p>First drafts are for discovery. Revision cuts fluff, fixes logic, and sharpens the thesis.</p><p>Read aloud. Cut empty intensifiers. One idea per paragraph.</p>",
          "Chapter: Revision. Revision is core writing work: cut fluff, fix logic, sharpen thesis. Read aloud; one idea per paragraph."
        ),
        ch(
          "Cite",
          "<h2>Cite your sources</h2><p>Give credit. Common styles: MLA, APA, Chicago. When in doubt, cite. Plagiarism is presenting others’ words or ideas as yours.</p>" +
            fin("English Composition · core complete"),
          "Chapter: Cite. Credit sources (MLA/APA/Chicago). Plagiarism is presenting others’ work as yours."
        ),
      ],
    },
    col_hist: {
      title: "US History Survey",
      teacher: "Helen",
      teacherBlurb: "Causes, turning points, primary sources.",
      avatar: "H",
      track: "college",
      order: 4,
      tag: "HIST",
      tagStyle: "background:rgba(251,146,60,.12);color:#fdba74",
      card: "Founding through modern America (overview)",
      ch: [
        ch(
          "Welcome",
          "<h2>US History Survey</h2><p>We study <strong>change over time</strong>: causes, conflicts, and how people argued about freedom and power.</p>" +
            teach("Helen", "Helen teaches only this survey."),
          "Chapter: Welcome. US History survey: change over time, causes, conflicts, freedom and power. Teacher Helen."
        ),
        ch(
          "Colonies & Revolution",
          "<h2>Colonies & Revolution</h2><p>British colonies, imperial conflict, Declaration of Independence (1776), war, and a fragile new nation.</p>" +
            idea("Question", "What did “liberty” mean — and for whom?"),
          "Chapter: Colonies & Revolution. British colonies, conflict, 1776 Declaration, war, new nation. Whose liberty?"
        ),
        ch(
          "Constitution",
          "<h2>Constitution & early republic</h2><p>Constitutional Convention, federalism, Bill of Rights, and early party conflicts. Compromise and debate built the system — and left deep exclusions.</p>",
          "Chapter: Constitution. Convention, federalism, Bill of Rights, early parties. Compromises and exclusions."
        ),
        ch(
          "Civil War era",
          "<h2>Civil War & Reconstruction</h2><p>Slavery, sectional crisis, Civil War, Emancipation, Reconstruction amendments — and backlash that reshaped rights for generations.</p>",
          "Chapter: Civil War era. Slavery, war, emancipation, Reconstruction amendments, and backlash affecting rights."
        ),
        ch(
          "Modern US",
          "<h2>20th–21st century threads</h2><p>Industrialization, world wars, civil rights movements, Cold War, globalization, and digital life. Use <strong>primary sources</strong> (speeches, laws, letters) alongside textbooks.</p>" +
            fin("US History Survey · core complete"),
          "Chapter: Modern US. Industrialization, world wars, civil rights, Cold War, globalization, digital era. Use primary sources."
        ),
      ],
    },
    col_bio: {
      title: "Intro Biology",
      teacher: "Bea",
      teacherBlurb: "Cells, DNA, and how life works.",
      avatar: "B",
      track: "college",
      order: 5,
      tag: "SCI",
      tagStyle: "background:rgba(52,211,153,.12);color:#6ee7b7",
      card: "Cell, genetics, evolution basics",
      ch: [
        ch(
          "Welcome",
          "<h2>Intro Biology</h2><p>Biology studies living systems — from molecules to ecosystems.</p>" +
            teach("Bea", "Bea teaches only Intro Biology."),
          "Chapter: Welcome. Biology studies living systems from molecules to ecosystems. Teacher Bea."
        ),
        ch(
          "Cell",
          "<h2>The cell</h2><p>The cell is the basic unit of life. <strong>Prokaryotes</strong> (bacteria) lack a nucleus; <strong>eukaryotes</strong> (plants, animals, fungi) have a nucleus and organelles.</p>",
          "Chapter: The cell. Basic unit of life. Prokaryotes lack nucleus; eukaryotes have nucleus and organelles."
        ),
        ch(
          "DNA",
          "<h2>DNA & genes</h2><p><strong>DNA</strong> stores hereditary information. A <strong>gene</strong> is a stretch of DNA that helps build a product (often a protein). <strong>Mutation</strong> changes the sequence.</p>" +
            idea("Central idea", "Information → structure → function."),
          "Chapter: DNA & genes. DNA stores heredity. Genes help build products (often proteins). Mutation changes sequence."
        ),
        ch(
          "Energy",
          "<h2>Energy flow</h2><p>Organisms need energy. <strong>Photosynthesis</strong> captures light into chemical energy. <strong>Cellular respiration</strong> releases energy from food molecules (simplified).</p>",
          "Chapter: Energy flow. Photosynthesis captures light energy; cellular respiration releases energy from food."
        ),
        ch(
          "Evolution",
          "<h2>Evolution (intro)</h2><p><strong>Natural selection</strong>: heritable variation + differential survival/reproduction → populations change over generations.</p>" +
            fin("Intro Biology · core complete"),
          "Chapter: Evolution intro. Natural selection: heritable variation plus differential reproduction changes populations over generations."
        ),
      ],
    },
    col_chem: {
      title: "Intro Chemistry",
      teacher: "Kai",
      teacherBlurb: "Atoms, bonds, and reactions — step by step.",
      avatar: "K",
      track: "college",
      order: 6,
      tag: "SCI",
      tagStyle: "background:rgba(52,211,153,.12);color:#6ee7b7",
      card: "Atomic structure and chemical change",
      ch: [
        ch(
          "Welcome",
          "<h2>Intro Chemistry</h2><p>Chemistry studies matter — what it is made of and how it changes.</p>" +
            teach("Kai", "Kai teaches only Intro Chemistry."),
          "Chapter: Welcome. Chemistry studies matter and its changes. Teacher Kai."
        ),
        ch(
          "Atoms",
          "<h2>Atoms</h2><ul><li><strong>Protons</strong> (+) in nucleus — define the element</li><li><strong>Neutrons</strong> (0) in nucleus</li><li><strong>Electrons</strong> (−) outside nucleus — chemistry in action</li></ul>",
          "Chapter: Atoms. Protons define element; neutrons in nucleus; electrons outside drive chemistry."
        ),
        ch(
          "Periodic table",
          "<h2>Periodic table</h2><p>Elements ordered by atomic number. Columns (groups) share similar properties. Metals, nonmetals, and metalloids behave differently.</p>",
          "Chapter: Periodic table. Ordered by atomic number; groups share properties; metals/nonmetals/metalloids differ."
        ),
        ch(
          "Bonds",
          "<h2>Chemical bonds</h2><p><strong>Ionic</strong> bonds: electrons transferred (e.g. NaCl). <strong>Covalent</strong> bonds: electrons shared (e.g. H₂O). Bonding explains structure and properties.</p>",
          "Chapter: Bonds. Ionic = transfer electrons; covalent = share. Bonding explains structure and properties."
        ),
        ch(
          "Reactions",
          "<h2>Reactions & conservation</h2><p>Reactants → products. Mass is conserved: balance equations so atom counts match on both sides.</p>" +
            fin("Intro Chemistry · core complete"),
          "Chapter: Reactions. Reactants to products; mass conserved; balance equations for atom counts."
        ),
      ],
    },
    col_psych: {
      title: "Intro Psychology",
      teacher: "Pia",
      teacherBlurb: "Mind, behavior, and careful methods.",
      avatar: "P",
      track: "college",
      order: 7,
      tag: "SOC SCI",
      tagStyle: "background:rgba(167,139,250,.12);color:#c4b5fd",
      card: "Brain, learning, and social behavior",
      ch: [
        ch(
          "Welcome",
          "<h2>Intro Psychology</h2><p>Psychology is the science of <strong>mind and behavior</strong> — using evidence, not only intuition.</p>" +
            teach("Pia", "Pia teaches only Intro Psychology."),
          "Chapter: Welcome. Psychology is science of mind and behavior using evidence. Teacher Pia."
        ),
        ch(
          "Methods",
          "<h2>Research methods</h2><ul><li><strong>Experiment</strong> — manipulate a variable; can support cause</li><li><strong>Correlation</strong> — measures link; not the same as cause</li><li><strong>Ethics</strong> — consent, harm minimization</li></ul>" +
            idea("Slogan", "Correlation ≠ causation."),
          "Chapter: Methods. Experiments can support cause; correlation is not causation; ethics require consent and less harm."
        ),
        ch(
          "Brain basics",
          "<h2>Brain & nervous system</h2><p>Neurons communicate with electrical and chemical signals. Different brain regions support sensation, movement, memory, and emotion — in networks, not isolated “boxes only.”</p>",
          "Chapter: Brain basics. Neurons use electrical/chemical signals; regions and networks support sensation, movement, memory, emotion."
        ),
        ch(
          "Learning",
          "<h2>Learning</h2><p><strong>Classical conditioning</strong> associates stimuli. <strong>Operant conditioning</strong> links behavior to consequences. <strong>Observational learning</strong> copies models.</p>",
          "Chapter: Learning. Classical conditioning associates stimuli; operant links behavior to consequences; observational learning copies models."
        ),
        ch(
          "Social",
          "<h2>Social psychology (taste)</h2><p>People influence each other: conformity, obedience, stereotypes, and helping. Context shapes behavior more than we admit.</p>" +
            fin("Intro Psychology · core complete"),
          "Chapter: Social. Conformity, obedience, stereotypes, helping; context shapes behavior."
        ),
      ],
    },
    col_econ: {
      title: "Intro Microeconomics",
      teacher: "Eli",
      teacherBlurb: "Trade-offs, markets, and incentives.",
      avatar: "E",
      track: "college",
      order: 8,
      tag: "SOC SCI",
      tagStyle: "background:rgba(167,139,250,.12);color:#c4b5fd",
      card: "Scarcity, supply & demand, elasticity",
      ch: [
        ch(
          "Welcome",
          "<h2>Intro Microeconomics</h2><p>Microeconomics studies choices of individuals and firms under <strong>scarcity</strong>.</p>" +
            teach("Eli", "Eli teaches only Intro Microeconomics."),
          "Chapter: Welcome. Microeconomics: individual and firm choices under scarcity. Teacher Eli."
        ),
        ch(
          "Trade-offs",
          "<h2>Trade-offs & opportunity cost</h2><p><strong>Opportunity cost</strong> is the next-best alternative you give up. Every choice has one.</p>",
          "Chapter: Trade-offs. Opportunity cost is the next-best alternative forgone."
        ),
        ch(
          "Supply & demand",
          "<h2>Supply & demand</h2><p>Demand curves slope down (higher price → less quantity demanded, other things equal). Supply slopes up. <strong>Equilibrium</strong> is where they meet.</p>",
          "Chapter: Supply & demand. Demand down-sloping, supply up-sloping; equilibrium at intersection."
        ),
        ch(
          "Elasticity",
          "<h2>Elasticity (intro)</h2><p><strong>Price elasticity of demand</strong> measures how much quantity responds to price. Necessities tend to be less elastic than luxuries (roughly).</p>",
          "Chapter: Elasticity. Price elasticity of demand: quantity response to price. Necessities often less elastic than luxuries."
        ),
        ch(
          "Market fails",
          "<h2>When markets struggle</h2><p>Externalities (pollution), public goods, monopoly power, and information gaps can justify careful policy — trade-offs still apply.</p>" +
            fin("Intro Microeconomics · core complete"),
          "Chapter: Market fails. Externalities, public goods, monopoly, asymmetric info; policy involves trade-offs."
        ),
      ],
    },
    col_speak: {
      title: "Public Speaking",
      teacher: "Cam",
      teacherBlurb: "Structure, delivery, and nerves as fuel.",
      avatar: "C",
      track: "college",
      order: 9,
      tag: "COMM",
      tagStyle: "background:rgba(56,189,248,.12);color:#7dd3fc",
      card: "Plan and deliver a clear talk",
      ch: [
        ch(
          "Welcome",
          "<h2>Public Speaking</h2><p>Speaking well is a skill: clear message, audience focus, and practiced delivery.</p>" +
            teach("Cam", "Cam teaches only Public Speaking."),
          "Chapter: Welcome. Public speaking: message, audience, practiced delivery. Teacher Cam."
        ),
        ch(
          "Audience",
          "<h2>Know your audience</h2><p>What do they already know? What do they care about? What action or understanding should they leave with?</p>",
          "Chapter: Audience. Assess prior knowledge, interests, and desired takeaway or action."
        ),
        ch(
          "Structure",
          "<h2>Speech structure</h2><ol><li><strong>Hook</strong> — open with a question, story, or bold fact</li><li><strong>Thesis</strong> — one clear point</li><li><strong>2–3 points</strong> with examples</li><li><strong>Close</strong> — restate and land</li></ol>",
          "Chapter: Structure. Hook, thesis, 2–3 supported points, strong close."
        ),
        ch(
          "Delivery",
          "<h2>Delivery</h2><p>Eye contact, pace, pauses, and volume. Notes are cues — not a script to read robotically. Practice out loud.</p>",
          "Chapter: Delivery. Eye contact, pace, pauses, volume; notes as cues; practice aloud."
        ),
        ch(
          "Nerves",
          "<h2>Nerves</h2><p>Adrenaline is normal. Breathe low and slow. Start with a practiced first sentence. The goal is connection, not perfection.</p>" +
            fin("Public Speaking · core complete"),
          "Chapter: Nerves. Adrenaline normal; breathe; own the first sentence; connection over perfection."
        ),
      ],
    },
    col_crit: {
      title: "Critical Thinking",
      teacher: "Quinn",
      teacherBlurb: "Arguments, evidence, and fallacies.",
      avatar: "Q",
      track: "college",
      order: 10,
      tag: "PHIL",
      tagStyle: "background:rgba(56,189,248,.12);color:#7dd3fc",
      card: "Reason carefully; spot weak claims",
      ch: [
        ch(
          "Welcome",
          "<h2>Critical Thinking</h2><p>Critical thinking is careful, fair evaluation of claims — including your own.</p>" +
            teach("Quinn", "Quinn teaches only Critical Thinking."),
          "Chapter: Welcome. Critical thinking: careful fair evaluation of claims including your own. Teacher Quinn."
        ),
        ch(
          "Claims & reasons",
          "<h2>Claims & reasons</h2><p>A good argument: <strong>claim</strong> + <strong>reasons</strong> + <strong>evidence</strong>. Ask: Does the reason support the claim? Is the evidence solid?</p>",
          "Chapter: Claims & reasons. Argument = claim + reasons + evidence. Check support and evidence quality."
        ),
        ch(
          "Fallacies",
          "<h2>Common fallacies</h2><ul><li><strong>Ad hominem</strong> — attack the person, not the claim</li><li><strong>Straw man</strong> — misrepresent then “defeat”</li><li><strong>False dilemma</strong> — only two options when more exist</li><li><strong>Post hoc</strong> — after, therefore because</li></ul>",
          "Chapter: Fallacies. Ad hominem, straw man, false dilemma, post hoc (after therefore because)."
        ),
        ch(
          "Sources",
          "<h2>Evaluating sources</h2><p>Who wrote this? What’s the evidence? What’s missing? Are they selling something? Prefer primary data and transparent methods.</p>",
          "Chapter: Sources. Authorship, evidence, omissions, incentives; prefer primary data and transparent methods."
        ),
        ch(
          "Steelman",
          "<h2>Steelman, then decide</h2><p>State the other side in its strongest form before you disagree. Then judge on reasons and evidence.</p>" +
            fin("Critical Thinking · core complete"),
          "Chapter: Steelman. Restate opposing view at its strongest before critiquing; decide on reasons and evidence."
        ),
      ],
    },
  };

  var TRACKS = [
    {
      id: "foundations",
      label: "Start here · Foundations",
      blurb: "Counting → number line → bits",
    },
    {
      id: "coding101",
      label: "Coding 101",
      blurb: "From codes to programs, variables, decisions, loops, functions, lists",
    },
    {
      id: "college",
      label: "College · basic courses",
      blurb: "Algebra, stats, writing, history, sciences, psych, econ, speaking, thinking",
    },
  ];

  global.BUILTIN_BOOKS = BUILTIN_BOOKS;
  global.BUILTIN_TRACKS = TRACKS;
})(typeof window !== "undefined" ? window : globalThis);
