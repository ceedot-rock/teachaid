/**
 * Lower-division gen-ed rubric (US community college / CSU-GE style).
 * Used by curriculum audit to score TEACHAiD coverage.
 */
module.exports = {
  version: "2026-teac-ge-v1",
  notes:
    "Mapped to common US lower-division GE (CSU GE / IGETC-style buckets). " +
    "TEACHAiD modules are intro-course proxies, not always full 3-credit lab sequences.",
  buckets: [
    {
      id: "A2_writing",
      label: "Written communication",
      required: true,
      exemplarTopics: [
        "thesis",
        "paragraph structure",
        "revision",
        "citation",
        "audience",
        "argument",
      ],
    },
    {
      id: "A1_oral",
      label: "Oral communication",
      required: true,
      exemplarTopics: ["audience", "structure", "delivery", "nerves", "persuasion"],
    },
    {
      id: "A3_critical",
      label: "Critical thinking",
      required: true,
      exemplarTopics: ["claims", "evidence", "fallacies", "sources", "steelman"],
    },
    {
      id: "B4_quant",
      label: "Quantitative reasoning",
      required: true,
      exemplarTopics: [
        "linear equations",
        "functions",
        "graphs",
        "mean median",
        "probability",
        "data literacy",
      ],
    },
    {
      id: "B1_phys_sci",
      label: "Physical science",
      required: true,
      exemplarTopics: ["atoms", "energy", "forces", "scientific method", "chemistry"],
    },
    {
      id: "B2_life_sci",
      label: "Life science",
      required: true,
      exemplarTopics: ["cell", "DNA", "evolution", "physiology", "ecology"],
    },
    {
      id: "C1_arts",
      label: "Arts",
      required: true,
      exemplarTopics: ["elements of art", "design principles", "context", "music basics"],
    },
    {
      id: "C2_humanities",
      label: "Humanities",
      required: true,
      exemplarTopics: ["literature", "close reading", "religion", "philosophy"],
    },
    {
      id: "D_social",
      label: "Social sciences",
      required: true,
      exemplarTopics: ["psychology", "economics", "history", "society"],
    },
    {
      id: "E_lifelong",
      label: "Lifelong learning / self-development",
      required: true,
      exemplarTopics: ["health", "wellness", "college success", "finance basics"],
    },
    {
      id: "F_ethnic",
      label: "Ethnic studies / diversity (emerging)",
      required: false,
      exemplarTopics: ["identity", "power", "pluralism", "global cultures"],
    },
    {
      id: "lang",
      label: "Language other than English",
      required: false,
      exemplarTopics: ["greetings", "present tense", "culture", "vocabulary"],
    },
    {
      id: "cs_digital",
      label: "Computer / digital literacy (institutional)",
      required: false,
      exemplarTopics: ["programming", "AI", "cybersecurity", "data", "digital literacy"],
    },
  ],
};
