/* Enrich TEACHAiD catalog toward real lower-division GE experience.
 * Loads after builtin-books.js — adds GE metadata, syllabus-depth chapters, missing cores.
 */
(function (global) {
  var BOOKS = global.BUILTIN_BOOKS;
  if (!BOOKS) return;

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

  /** Strip prior finish boxes when appending deeper units */
  function stripFinish(html) {
    return String(html || "")
      .replace(/<div class=["']done-box["'][\s\S]*?<\/div>/gi, "")
      .replace(/<button[^>]*onclick=["']finishBook\(\)["'][^>]*>[\s\S]*?<\/button>/gi, "");
  }

  function appendChapters(bookId, chapters, finishMsg) {
    var b = BOOKS[bookId];
    if (!b || !b.ch || !chapters || !chapters.length) return;
    b.ch.forEach(function (c) {
      if (c && c.h) c.h = stripFinish(c.h);
    });
    chapters.forEach(function (c) {
      b.ch.push(c);
    });
    var last = b.ch[b.ch.length - 1];
    if (last && last.h && !/finishBook\(\)/.test(last.h)) {
      last.h += fin(finishMsg || b.title + " · unit complete");
    }
  }

  function setMeta(id, meta) {
    var b = BOOKS[id];
    if (!b) return;
    Object.keys(meta).forEach(function (k) {
      b[k] = meta[k];
    });
  }

  /* —— GE metadata for existing books —— */
  var META = {
    s1: {
      geBucket: "bridge",
      scope: "bridge",
      creditHint: "Pre-college numeracy bridge",
      level: "foundations",
      outcomes: [
        "Explain counting as matching objects to number-names",
        "Use zero correctly as a quantity",
        "Represent small quantities concretely and symbolically",
      ],
    },
    s2: {
      geBucket: "bridge",
      scope: "bridge",
      creditHint: "Pre-college numeracy bridge",
      level: "foundations",
      outcomes: [
        "Place positives and negatives on a number line",
        "Interpret negative quantities in real contexts",
      ],
    },
    s3: {
      geBucket: "cs_digital",
      scope: "bridge",
      creditHint: "CS readiness bridge",
      level: "foundations",
      outcomes: [
        "Define a bit and relate patterns of bits to numbers",
        "Convert small binary patterns to decimal",
      ],
    },
    c1: { geBucket: "cs_digital", scope: "sequence-unit", creditHint: "CS 101 unit 1/8", level: "intro", outcomes: ["Map integers for encoding", "Explain why codes use non-negative integers"] },
    c2: { geBucket: "cs_digital", scope: "sequence-unit", creditHint: "CS 101 unit 2/8", level: "intro", outcomes: ["Define program, algorithm, and bug", "Describe input→process→output"] },
    c3: { geBucket: "cs_digital", scope: "sequence-unit", creditHint: "CS 101 unit 3/8", level: "intro", outcomes: ["Assign and update variables", "Distinguish number, string, boolean types"] },
    c4: { geBucket: "cs_digital", scope: "sequence-unit", creditHint: "CS 101 unit 4/8", level: "intro", outcomes: ["Join and measure strings", "Explain quoting vs variable names"] },
    c5: { geBucket: "cs_digital", scope: "sequence-unit", creditHint: "CS 101 unit 5/8", level: "intro", outcomes: ["Write if/else decisions", "Use comparison operators carefully"] },
    c6: { geBucket: "cs_digital", scope: "sequence-unit", creditHint: "CS 101 unit 6/8", level: "intro", outcomes: ["Trace while/for loops", "Avoid infinite loops"] },
    c7: { geBucket: "cs_digital", scope: "sequence-unit", creditHint: "CS 101 unit 7/8", level: "intro", outcomes: ["Define and call functions", "Use parameters and return values"] },
    c8: { geBucket: "cs_digital", scope: "sequence-unit", creditHint: "CS 101 unit 8/8 · capstone", level: "intro", outcomes: ["Index and loop lists", "Combine core CS 101 ideas in a small design"] },
    col_alg: {
      geBucket: "B4_quant",
      scope: "intro-course",
      creditHint: "~3 cr quantitative proxy (compressed)",
      level: "college",
      outcomes: [
        "Solve linear equations and interpret slope-intercept form",
        "Evaluate and graph simple functions",
        "Solve basic quadratic equations and interpret parabolas",
        "Model a short word problem with an equation",
      ],
    },
    col_stat: {
      geBucket: "B4_quant",
      scope: "intro-course",
      creditHint: "~3 cr statistics proxy (compressed)",
      level: "college",
      outcomes: [
        "Compute and choose among mean, median, mode",
        "Describe spread and basic probability",
        "Distinguish sample vs population and avoid causal overclaim",
      ],
    },
    col_eng: {
      geBucket: "A2_writing",
      scope: "intro-course",
      creditHint: "~3 cr composition proxy",
      level: "college",
      outcomes: [
        "Write a specific, arguable thesis",
        "Build evidence-based paragraphs",
        "Revise for clarity and cite sources ethically",
      ],
    },
    col_speak: {
      geBucket: "A1_oral",
      scope: "intro-course",
      creditHint: "~3 cr oral comm proxy",
      level: "college",
      outcomes: [
        "Structure a short speech for an audience",
        "Deliver with appropriate pace and presence",
        "Manage speaking anxiety productively",
      ],
    },
    col_crit: {
      geBucket: "A3_critical",
      scope: "intro-course",
      creditHint: "~3 cr critical thinking proxy",
      level: "college",
      outcomes: [
        "Evaluate claims with reasons and evidence",
        "Identify common fallacies",
        "Steelman opposing views before judging",
      ],
    },
    col_chem: {
      geBucket: "B1_phys_sci",
      scope: "intro-course",
      creditHint: "Physical science intro (non-lab compressed)",
      level: "college",
      outcomes: [
        "Describe atomic structure and bonding",
        "Use conservation of mass in simple reactions",
        "Read basic periodic trends",
      ],
    },
    col_sci: {
      geBucket: "B1_phys_sci",
      scope: "intro-course",
      creditHint: "Scientific literacy core",
      level: "college",
      outcomes: [
        "Apply a flexible scientific method",
        "Evaluate evidence quality and correlation vs causation",
        "Distinguish models, theories, and ethical limits",
      ],
    },
    col_bio: {
      geBucket: "B2_life_sci",
      scope: "intro-course",
      creditHint: "Life science intro (non-lab compressed)",
      level: "college",
      outcomes: [
        "Compare prokaryotic and eukaryotic cells",
        "Explain DNA/gene basics and energy flow",
        "Describe natural selection accurately",
      ],
    },
    col_physio: {
      geBucket: "B2_life_sci",
      scope: "intro-course",
      creditHint: "Human biology / physiology intro",
      level: "college",
      outcomes: [
        "Explain homeostasis with feedback",
        "Map major body systems and their integration",
      ],
    },
    col_art: {
      geBucket: "C1_arts",
      scope: "intro-course",
      creditHint: "Arts GE proxy",
      level: "college",
      outcomes: [
        "Use elements of art and design principles in analysis",
        "Situate artworks in historical/cultural context",
      ],
    },
    col_music: {
      geBucket: "C1_arts",
      scope: "intro-course",
      creditHint: "Arts GE proxy (music)",
      level: "college",
      outcomes: [
        "Read basic staff/rhythm — music basics for analysis",
        "Explain scales, keys, intervals, and simple chords",
      ],
    },
    col_lit: {
      geBucket: "C2_humanities",
      scope: "intro-course",
      creditHint: "Humanities GE proxy",
      level: "college",
      outcomes: [
        "Close-read literary language with evidence",
        "Analyze story and poetry elements",
      ],
    },
    col_relig: {
      geBucket: "C2_humanities",
      scope: "intro-course",
      creditHint: "Humanities GE proxy",
      level: "college",
      outcomes: [
        "Describe major religious/spiritual categories respectfully",
        "Compare practice, community, and pluralism",
      ],
    },
    col_hist: {
      geBucket: "D_social",
      scope: "intro-course",
      creditHint: "US history survey proxy",
      level: "college",
      outcomes: [
        "Trace major eras of US history with causes and consequences",
        "Use primary-source thinking",
      ],
    },
    col_world: {
      geBucket: "D_social",
      scope: "intro-course",
      creditHint: "World history survey proxy",
      level: "college",
      outcomes: [
        "Explain global exchange and empire patterns",
        "Connect early societies to modern global threads",
      ],
    },
    col_psych: {
      geBucket: "D_social",
      scope: "intro-course",
      creditHint: "Psych 101 proxy",
      level: "college",
      outcomes: [
        "Distinguish experimental vs correlational methods",
        "Describe learning and social influence basics",
      ],
    },
    col_econ: {
      geBucket: "D_social",
      scope: "intro-course",
      creditHint: "Microeconomics intro proxy",
      level: "college",
      outcomes: [
        "Apply opportunity cost and supply/demand",
        "Interpret elasticity and basic market failures",
      ],
    },
    col_finance: {
      geBucket: "E_lifelong",
      scope: "intro-course",
      creditHint: "Personal finance / lifelong learning",
      level: "college",
      outcomes: [
        "Build a simple budget and savings habit — core finance basics",
        "Explain credit risk and basic fraud protection",
      ],
    },
    col_law: {
      geBucket: "D_social",
      scope: "intro-course",
      creditHint: "Legal literacy intro (not legal advice)",
      level: "college",
      outcomes: [
        "Identify sources of law and civil vs criminal tracks",
        "Explain due process ideas and when to seek counsel",
      ],
    },
    col_ai: {
      geBucket: "cs_digital",
      scope: "intro-course",
      creditHint: "AI literacy (institutional elective)",
      level: "college",
      outcomes: [
        "Explain ML at a conceptual level",
        "Identify AI failure modes and responsible use",
      ],
    },
    col_aihuman: {
      geBucket: "cs_digital",
      scope: "intro-course",
      creditHint: "Human–AI teamwork literacy",
      level: "college",
      outcomes: [
        "Calibrate trust in AI by risk level",
        "Design human-in-the-loop workflows",
      ],
    },
    col_cyber: {
      geBucket: "cs_digital",
      scope: "intro-course",
      creditHint: "Security hygiene literacy",
      level: "college",
      outcomes: [
        "Apply password/MFA and phishing defenses",
        "Practice safer device and data habits",
      ],
    },
    col_data: {
      geBucket: "B4_quant",
      scope: "intro-course",
      creditHint: "Quantitative / data literacy",
      level: "college",
      outcomes: [
        "Critique misleading charts",
        "Question averages, samples, and causal claims",
      ],
    },
    col_digital: {
      geBucket: "cs_digital",
      scope: "intro-course",
      creditHint: "Information literacy",
      level: "college",
      outcomes: [
        "Search and evaluate digital sources",
        "Create/cite responsibly and manage attention",
      ],
    },
    col_network: {
      geBucket: "E_lifelong",
      scope: "enrichment",
      creditHint: "Career readiness enrichment",
      level: "college",
      outcomes: [
        "Reach out professionally with a clear ask",
        "Maintain a small high-trust network",
      ],
    },
    col_mubiz: {
      geBucket: "enrichment",
      scope: "enrichment",
      creditHint: "Career / industry elective",
      level: "college",
      outcomes: [
        "Distinguish composition vs master rights",
        "Map music revenue paths and deal basics",
      ],
    },
  };

  Object.keys(META).forEach(function (id) {
    setMeta(id, META[id]);
  });

  /* —— Syllabus-depth expansions (core GE) —— */
  appendChapters(
    "col_eng",
    [
      ch(
        "Audience & purpose",
        "<h2>Audience & purpose</h2><p>Before you draft, name <strong>who</strong> reads and <strong>what change</strong> you want: inform, persuade, propose, reflect.</p>" +
          idea("College move", "Same topic, different audience → different evidence and tone."),
        "Chapter: Audience & purpose. Identify reader and purpose (inform, persuade, propose). Adjust evidence and tone by audience."
      ),
      ch(
        "Synthesis",
        "<h2>Synthesis (not summary only)</h2><p>Summary retells. <strong>Synthesis</strong> puts sources in conversation: agree, extend, complicate, or disagree — with citations.</p>" +
          trybox("Practice", "Take two sources on one claim. Write three sentences that put them in dialogue."),
        "Chapter: Synthesis. Move beyond summary; put sources in conversation with citation. Agree, extend, complicate, disagree."
      ),
    ],
    "English Composition · expanded unit complete"
  );

  appendChapters(
    "col_alg",
    [
      ch(
        "Systems",
        "<h2>Systems of equations</h2><p>Two equations, two unknowns. Solve by substitution or elimination. Graphically: intersection point.</p><p style='font-family:ui-monospace,monospace;text-align:center;margin:12px 0'>x + y = 10<br>2x − y = 2<br>→ x = 4, y = 6</p>",
        "Chapter: Systems. Solve 2×2 linear systems by substitution/elimination; intersection interpretation."
      ),
      ch(
        "Word models",
        "<h2>Word problems as models</h2><p>Define variables → write relations → solve → check units and reasonableness. Rate × time = distance is a classic pattern.</p>",
        "Chapter: Word models. Variables, relations, solve, check reasonableness; rate×time patterns."
      ),
    ],
    "College Algebra · expanded unit complete"
  );

  appendChapters(
    "col_stat",
    [
      ch(
        "Normal curve",
        "<h2>Normal curve (intro)</h2><p>Many measurements cluster around a mean in a bell shape. The <strong>68–95–99.7</strong> rule roughly describes spread under a normal model.</p>" +
          idea("Caution", "Not every dataset is normal — look before you leap."),
        "Chapter: Normal curve. Bell shape around mean; 68-95-99.7 rule; not all data are normal."
      ),
      ch(
        "Ethics of data",
        "<h2>Ethics of data</h2><p>Who is counted? Who is missing? How could a chart manipulate? Statistical literacy is civic literacy.</p>",
        "Chapter: Ethics of data. Inclusion/exclusion, manipulation risks; stats as civic skill."
      ),
    ],
    "Intro Statistics · expanded unit complete"
  );

  appendChapters(
    "col_psych",
    [
      ch(
        "Memory",
        "<h2>Memory</h2><p>Encoding, storage, retrieval. Working memory is limited. Sleep and spaced practice strengthen long-term learning — useful for every course you take.</p>",
        "Chapter: Memory. Encoding, storage, retrieval; working memory limits; spaced practice and sleep."
      ),
      ch(
        "Development",
        "<h2>Development (taste)</h2><p>People change across the lifespan: cognitive, social, and emotional strands interact. Context and culture matter as much as milestones.</p>",
        "Chapter: Development. Lifespan cognitive/social/emotional change; culture and context."
      ),
    ],
    "Psych 101 · expanded unit complete"
  );

  appendChapters(
    "col_bio",
    [
      ch(
        "Ecology",
        "<h2>Ecology basics</h2><p>Organisms interact with each other and environments. Energy flows; matter cycles. Human activity is now a major ecological force.</p>",
        "Chapter: Ecology. Interactions, energy flow, matter cycles; human impact."
      ),
      ch(
        "Lab thinking",
        "<h2>Lab thinking (even without a wet lab)</h2><p>Controls, variables, measurement error, and reproducible notes. Science is a practice, not only a pile of facts.</p>",
        "Chapter: Lab thinking. Controls, variables, error, lab notebooks; science as practice."
      ),
    ],
    "Biology 101 · expanded unit complete"
  );

  appendChapters(
    "col_hist",
    [
      ch(
        "Primary sources",
        "<h2>Working with primary sources</h2><p>Ask: Who made this? When? For whom? What is left out? Pair a speech, law, or letter with secondary context.</p>",
        "Chapter: Primary sources. Authorship, audience, omissions; pair with secondary context."
      ),
      ch(
        "Historiography",
        "<h2>Historiography (intro)</h2><p>Historians disagree. Interpretations change as new evidence and questions emerge. Argue with evidence, not nostalgia.</p>",
        "Chapter: Historiography. Interpretations change; argue with evidence."
      ),
    ],
    "US History 101 · expanded unit complete"
  );

  appendChapters(
    "col_crit",
    [
      ch(
        "Inductive & deductive",
        "<h2>Inductive & deductive</h2><p><strong>Deductive:</strong> if premises true and form valid, conclusion must follow. <strong>Inductive:</strong> evidence supports but does not guarantee.</p>",
        "Chapter: Inductive & deductive. Validity vs support; certainty differs."
      ),
    ],
    "Critical Thinking · expanded unit complete"
  );

  /* —— Missing GE cores —— */
  BOOKS.col_success = {
    title: "College Success 101",
    teacher: "Eden",
    teacherBlurb: "Study systems, time, and belonging in college.",
    avatar: "E",
    track: "college",
    order: 0,
    tag: "FYE 101",
    tagStyle: "background:rgba(94,234,212,.12);color:#5eead4",
    card: "First-year skills for a real college path",
    geBucket: "E_lifelong",
    scope: "intro-course",
    creditHint: "First-year experience / student success",
    level: "college",
    outcomes: [
      "Build a weekly time-and-study system",
      "Use active learning and office-hour help-seeking",
      "Navigate academic integrity and campus resources",
    ],
    ch: [
      ch(
        "Welcome",
        "<h2>College Success 101</h2><p>College rewards systems: time, reading, notes, help-seeking, and integrity — not just “trying hard.”</p>" +
          teach("Eden", "Eden coaches College Success 101 only."),
        "Chapter: Welcome. College success = systems for time, study, help, integrity. Teacher Eden."
      ),
      ch(
        "Time",
        "<h2>Time & calendar</h2><p>Map fixed commitments, then protect study blocks. Work in 25–50 minute focus sprints. Sleep is a study tool.</p>" +
          idea("Rule", "If it is not on the calendar, it is a wish."),
        "Chapter: Time. Calendar fixed blocks, protect study, focus sprints, sleep."
      ),
      ch(
        "Active study",
        "<h2>Active study</h2><p>Retrieve, don’t only re-read. Teach a concept out loud. Practice problems beat highlighting. Space reviews across days.</p>",
        "Chapter: Active study. Retrieval practice, teach-back, problems, spaced review."
      ),
      ch(
        "Help & community",
        "<h2>Help & community</h2><p>Office hours, tutoring, disability services, counseling, and study groups. Belonging predicts persistence — build two real connections early.</p>",
        "Chapter: Help & community. Campus resources; belonging and connections."
      ),
      ch(
        "Integrity",
        "<h2>Academic integrity</h2><p>Cite what you use. Don’t submit others’ work as yours — including uncredited AI text when forbidden. When unsure, ask before the deadline.</p>" +
          fin("College Success 101 · complete"),
        "Chapter: Integrity. Citation, no plagiarism, AI policies, ask early."
      ),
    ],
  };

  BOOKS.col_health = {
    title: "Health & Wellness 101",
    teacher: "Hale",
    teacherBlurb: "Sleep, stress, movement, and sustainable habits.",
    avatar: "H",
    track: "college",
    order: 0.5,
    tag: "HLTH 101",
    tagStyle: "background:rgba(52,211,153,.12);color:#6ee7b7",
    card: "Lifelong learning GE · body and mind basics",
    geBucket: "E_lifelong",
    scope: "intro-course",
    creditHint: "Lifelong learning / self-development GE",
    level: "college",
    outcomes: [
      "Explain sleep, stress, and movement basics for students",
      "Build one sustainable habit loop",
      "Identify when to seek professional help",
    ],
    ch: [
      ch(
        "Welcome",
        "<h2>Health & Wellness 101</h2><p>Wellness is skillful care of body and mind — not perfection. Small consistent practices beat extreme streaks.</p>" +
          teach("Hale", "Hale teaches only Health & Wellness 101. Not medical advice."),
        "Chapter: Welcome. Sustainable wellness practices; not medical advice. Teacher Hale."
      ),
      ch(
        "Sleep",
        "<h2>Sleep",
        // fix - broken h2
        "",
        ""
      ),
    ],
  };

  // Fix health book properly - I made an error in sleep chapter. Rewrite whole health book.
  BOOKS.col_health = {
    title: "Health & Wellness 101",
    teacher: "Hale",
    teacherBlurb: "Sleep, stress, movement, and sustainable habits.",
    avatar: "H",
    track: "college",
    order: 0.5,
    tag: "HLTH 101",
    tagStyle: "background:rgba(52,211,153,.12);color:#6ee7b7",
    card: "Lifelong learning GE · body and mind basics",
    geBucket: "E_lifelong",
    scope: "intro-course",
    creditHint: "Lifelong learning / self-development GE",
    level: "college",
    outcomes: [
      "Explain sleep, stress, and movement basics for students",
      "Build one sustainable habit loop",
      "Identify when to seek professional help",
    ],
    ch: [
      ch(
        "Welcome",
        "<h2>Health & Wellness 101</h2><p>Wellness is skillful care of body and mind — not perfection. Small consistent practices beat extreme streaks.</p>" +
          teach("Hale", "Hale teaches only Health & Wellness 101. Not medical advice."),
        "Chapter: Welcome. Sustainable wellness practices; not medical advice. Teacher Hale."
      ),
      ch(
        "Sleep",
        "<h2>Sleep</h2><p>Most adults need consistent sleep timing more than rare long catch-up nights. Light, caffeine timing, and wind-down routines matter.</p>",
        "Chapter: Sleep. Consistency, light/caffeine timing, wind-down; not medical advice."
      ),
      ch(
        "Stress",
        "<h2>Stress skills</h2><p>Short-term stress can mobilize you; chronic overload harms learning. Breath, movement, social support, and boundaries are tools — not failures.</p>",
        "Chapter: Stress. Acute vs chronic; breath, movement, support, boundaries."
      ),
      ch(
        "Movement & fuel",
        "<h2>Movement & fuel</h2><p>Some movement most days beats none. Hydration and regular meals support attention. Extreme diets are not a study strategy.</p>",
        "Chapter: Movement & fuel. Regular movement, hydration, meals; avoid extreme diet as study plan."
      ),
      ch(
        "Habits & help",
        "<h2>Habits & getting help</h2><p>Habit loop: cue → routine → reward. If mood, substances, or harm thoughts overwhelm you, use campus counseling or local emergency resources — you deserve support.</p>" +
          fin("Health & Wellness 101 · complete"),
        "Chapter: Habits & help. Habit loops; seek professional help when overwhelmed."
      ),
    ],
  };

  BOOKS.col_physics = {
    title: "Physics 101",
    teacher: "Newton",
    teacherBlurb: "Motion, forces, energy — conceptual and careful.",
    avatar: "N",
    track: "college",
    order: 5.5,
    tag: "PHYS 101",
    tagStyle: "background:rgba(52,211,153,.12);color:#6ee7b7",
    card: "Physical science GE · forces and energy",
    geBucket: "B1_phys_sci",
    scope: "intro-course",
    creditHint: "Physical science intro (conceptual; compressed)",
    level: "college",
    outcomes: [
      "Use distance, velocity, and acceleration concepts carefully",
      "Apply Newton’s laws qualitatively",
      "Track energy forms and conservation ideas",
    ],
    ch: [
      ch(
        "Welcome",
        "<h2>Physics 101</h2><p>Physics models nature with quantities and relationships. We start conceptual — still precise with units and cause/effect.</p>" +
          teach("Newton", "Newton teaches only Physics 101."),
        "Chapter: Welcome. Physics models nature with quantities; conceptual but unit-careful. Teacher Newton."
      ),
      ch(
        "Motion",
        "<h2>Motion</h2><p><strong>Position</strong> changes over time → velocity. Velocity changes → acceleration. Graphs of x–t and v–t tell different stories.</p>",
        "Chapter: Motion. Position, velocity, acceleration; x-t and v-t graphs."
      ),
      ch(
        "Forces",
        "<h2>Forces & Newton’s laws</h2><ol><li>Inertia — motion stays steady without net force</li><li>F = ma (net force links to acceleration)</li><li>Action–reaction pairs</li></ol>",
        "Chapter: Forces. Newton's three laws qualitatively; net force and acceleration."
      ),
      ch(
        "Energy",
        "<h2>Energy</h2><p>Kinetic, potential, thermal… Energy transfers and transforms; total is conserved in closed accounting if you track all forms.</p>" +
          idea("Power move", "Always ask: where did the energy go?"),
        "Chapter: Energy. Forms, transfer, conservation bookkeeping."
      ),
      ch(
        "Waves & light",
        "<h2>Waves & light (taste)</h2><p>Waves carry energy without carrying the medium along. Light has wave and particle stories — context decides which model helps.</p>",
        "Chapter: Waves & light. Energy transport; dual models of light."
      ),
      ch(
        "Lab sense",
        "<h2>Measurement sense</h2><p>Uncertainty, significant figures as honesty about precision, and isolating variables. A wrong unit ruins a right idea.</p>" +
          fin("Physics 101 · complete"),
        "Chapter: Lab sense. Uncertainty, sig figs as honesty, variables, units."
      ),
    ],
  };

  BOOKS.col_spanish = {
    title: "Spanish 101",
    teacher: "Sol",
    teacherBlurb: "Practical Spanish for real beginners.",
    avatar: "S",
    track: "college",
    order: 3.5,
    tag: "SPAN 101",
    tagStyle: "background:rgba(244,114,182,.12);color:#f9a8d4",
    card: "Language GE · greetings to present tense",
    geBucket: "lang",
    scope: "intro-course",
    creditHint: "LOTE intro proxy (not full 4-skill semester)",
    level: "college",
    outcomes: [
      "Greet and introduce yourself in Spanish",
      "Use high-frequency present-tense patterns",
      "Show basic cultural respect and curiosity",
    ],
    ch: [
      ch(
        "Welcome",
        "<h2>Spanish 101</h2><p>Language learning is practice + patience. We focus on high-frequency phrases you can actually use.</p>" +
          teach("Sol", "Sol teaches only Spanish 101."),
        "Chapter: Welcome. High-frequency Spanish practice for beginners. Teacher Sol."
      ),
      ch(
        "Greetings",
        "<h2>Greetings & courtesy</h2><p><strong>Hola</strong>, <strong>buenos días</strong>, <strong>buenas tardes</strong>, <strong>gracias</strong>, <strong>por favor</strong>, <strong>mucho gusto</strong>. Formal <em>usted</em> vs informal <em>tú</em> depends on context.</p>",
        "Chapter: Greetings. Hola, buenos días/tardes, gracias, por favor, mucho gusto; tú vs usted."
      ),
      ch(
        "Identity",
        "<h2>Who I am</h2><p><strong>Me llamo…</strong> / <strong>Soy de…</strong> / <strong>Estoy bien</strong>. Ser vs estar — identity/origin vs state/location (intro only).</p>",
        "Chapter: Identity. Me llamo, soy de, estoy bien; ser vs estar intro."
      ),
      ch(
        "Present tense",
        "<h2>Present tense patterns</h2><p>Regular -ar verbs: hablar → hablo, hablas, habla… Build: <em>Yo estudio español.</em> Listen for endings.</p>",
        "Chapter: Present tense. Regular -ar patterns; yo estudio español."
      ),
      ch(
        "Classroom & café",
        "<h2>Classroom & café phrases</h2><p>¿Cómo se dice…? ¿Puede repetir? La cuenta, por favor. Numbers 1–20 for prices and times.</p>",
        "Chapter: Classroom & café. Repair phrases, bill please, numbers 1-20."
      ),
      ch(
        "Culture",
        "<h2>Culture & respect</h2><p>Spanish spans many countries. Avoid stereotypes; ask with curiosity. Language opens doors — humility keeps them open.</p>" +
          fin("Spanish 101 · complete"),
        "Chapter: Culture. Diverse Spanish-speaking world; curiosity over stereotypes."
      ),
    ],
  };

  BOOKS.col_env = {
    title: "Environmental Science 101",
    teacher: "Terra",
    teacherBlurb: "Systems, climate basics, and human impact.",
    avatar: "T",
    track: "college",
    order: 5.7,
    tag: "ENV 101",
    tagStyle: "background:rgba(52,211,153,.12);color:#6ee7b7",
    card: "Life/physical science bridge · Earth systems",
    geBucket: "B2_life_sci",
    scope: "intro-course",
    creditHint: "Interdisciplinary science GE proxy",
    level: "college",
    outcomes: [
      "Describe Earth systems and energy flow at intro level",
      "Explain climate change basics without denial or despair clichés",
      "Evaluate a local environmental tradeoff",
    ],
    ch: [
      ch(
        "Welcome",
        "<h2>Environmental Science 101</h2><p>Environmental science links biology, chemistry, earth systems, and society. We study problems and leverage points.</p>" +
          teach("Terra", "Terra teaches only Environmental Science 101."),
        "Chapter: Welcome. Interdisciplinary env-sci; problems and leverage. Teacher Terra."
      ),
      ch(
        "Systems",
        "<h2>Earth systems</h2><p>Atmosphere, hydrosphere, geosphere, biosphere interact. Feedbacks can amplify or stabilize change.</p>",
        "Chapter: Systems. Spheres interact; amplifying vs stabilizing feedbacks."
      ),
      ch(
        "Climate",
        "<h2>Climate basics</h2><p>Weather ≠ climate. Greenhouse gases trap heat. Evidence for warming is multi-method; impacts are uneven across communities.</p>",
        "Chapter: Climate. Weather vs climate; greenhouse effect; multi-method evidence; uneven impacts."
      ),
      ch(
        "Resources",
        "<h2>Resources & pollution</h2><p>Renewable vs nonrenewable. Air, water, and soil quality connect to health and justice.</p>",
        "Chapter: Resources. Renewable vs not; pollution and health/justice."
      ),
      ch(
        "Action",
        "<h2>Tradeoffs & action</h2><p>Every policy has costs and benefits. Personal actions matter; systems and policy multiply impact. Stay curious and evidence-based.</p>" +
          fin("Environmental Science 101 · complete"),
        "Chapter: Action. Tradeoffs; personal plus policy; evidence-based engagement."
      ),
    ],
  };

  BOOKS.col_diversity = {
    title: "Diversity & Society 101",
    teacher: "Justice",
    teacherBlurb: "Identity, power, and living together.",
    avatar: "J",
    track: "college",
    order: 8.5,
    tag: "SOC 101",
    tagStyle: "background:rgba(167,139,250,.12);color:#c4b5fd",
    card: "Social science · pluralism and equity literacy",
    geBucket: "F_ethnic",
    scope: "intro-course",
    creditHint: "Diversity / social science GE proxy",
    level: "college",
    outcomes: [
      "Define identity, power, and intersectionality carefully",
      "Distinguish equality vs equity in examples",
      "Practice pluralistic dialogue without erasing harm",
    ],
    ch: [
      ch(
        "Welcome",
        "<h2>Diversity & Society 101</h2><p>We study how difference, power, and institutions shape opportunity — with rigor and respect.</p>" +
          teach("Justice", "Justice teaches only this course."),
        "Chapter: Welcome. Difference, power, institutions; rigor and respect. Teacher Justice."
      ),
      ch(
        "Identity",
        "<h2>Identity</h2><p>People hold multiple identities (race, gender, class, ability, faith, nationality…). Context can make one more salient. Avoid reducing anyone to a single label.</p>",
        "Chapter: Identity. Multiple identities; context; avoid single-label reduction."
      ),
      ch(
        "Power",
        "<h2>Power & institutions</h2><p>Power is the ability to shape outcomes. Institutions (schools, laws, media, markets) can distribute advantages unevenly across groups over time.</p>",
        "Chapter: Power. Shape outcomes; institutions and uneven advantage."
      ),
      ch(
        "Equity",
        "<h2>Equality & equity</h2><p><strong>Equality</strong> treats everyone the same; <strong>equity</strong> allocates support so people can reach comparable outcomes when starting points differ. Debates are real — define terms.</p>",
        "Chapter: Equity. Equality vs equity; define terms in debate."
      ),
      ch(
        "Dialogue",
        "<h2>Dialogue across difference</h2><p>Listen to understand. Use I-statements. Critique ideas and systems without dehumanizing people. Repair when you miss.</p>" +
          fin("Diversity & Society 101 · complete"),
        "Chapter: Dialogue. Listen, I-statements, critique without dehumanizing, repair."
      ),
    ],
  };

  /* Re-order college track: success first among college */
  if (BOOKS.col_success) BOOKS.col_success.order = 0;
  if (BOOKS.col_health) BOOKS.col_health.order = 1;
  // shift others visually via order fields already set; success/health low numbers bubble first within track sort

  /* —— Tracks: real program pathways —— */
  global.BUILTIN_TRACKS = [
    {
      id: "foundations",
      label: "Bridge · Foundations",
      blurb: "Numeracy & bits — prepare for college quant and CS",
    },
    {
      id: "coding101",
      label: "CS / Programming 101 sequence",
      blurb: "Eight units ≈ one intro programming course path",
    },
    {
      id: "college",
      label: "Lower-division college · GE & electives",
      blurb:
        "Mapped to common US gen-ed buckets (writing, quant, science, arts, social science, lifelong learning, language, digital)",
    },
  ];

  global.TEACHAID_GE_NOTE =
    "TEACHAiD pathways mirror common US lower-division general education. " +
    "Courses are rigorous intro proxies (often compressed). Mastery certificates require a final teacher pass at 91%+.";
})(typeof window !== "undefined" ? window : globalThis);
