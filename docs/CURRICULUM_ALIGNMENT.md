# TEACHAiD curriculum alignment

**Goal:** Offer a real lower-division educational experience, not a random pile of short lessons.

**References:** Common US community-college / CSU-GE–style buckets (written & oral communication, critical thinking, quantitative reasoning, physical & life science, arts, humanities, social science, lifelong learning), plus language and digital literacy.

## How to read a TEACHAiD course

| Scope label | Meaning |
|-------------|--------|
| **bridge** | Pre-college readiness (foundations) |
| **sequence-unit** | One unit inside Programming / CS 101 (8 units ≈ one intro sequence) |
| **intro-course** | Compressed proxy for a ~3-credit 101 (topic coverage, not full contact hours) |
| **enrichment** | Career / interest elective |

Mastery certificates still require a **final-chapter teacher pass at 91%+**.

## Gen-ed coverage (target)

| Bucket | Status | TEACHAiD offerings |
|--------|--------|-------------------|
| Written communication | Covered | English Composition 101 (+ synthesis / audience) |
| Oral communication | Covered | Public Speaking |
| Critical thinking | Covered | Critical Thinking (+ inductive/deductive) |
| Quantitative | Covered | College Algebra, Intro Statistics, Data Literacy |
| Physical science | Covered | Science 101, Chemistry, **Physics 101** |
| Life science | Covered | Biology, Physiology, **Environmental Science 101** |
| Arts | Covered | Art 101, Music Theory 101 |
| Humanities | Covered | Literature, Religion & Spirituality |
| Social science | Covered | US History, World History, Psych, Econ, Law, **Diversity & Society** |
| Lifelong learning | Covered | **College Success**, **Health & Wellness**, Finance, Networking |
| Language (LOTE) | Covered | **Spanish 101** |
| Digital / CS | Strong | Programming sequence, AI, AI/Human, Cyber, Digital Literacy |

## Gaps we accept (for now)

- Full **wet-lab** science sequences (need facilities)
- Full **4-skill language semester** contact hours
- Upper-division major sequences
- Official transfer articulation agreements (partner-dependent)

## Program narrative for learners

1. **Bridge** — Counting → negatives → bits  
2. **CS path** — Programming 101 (8 books)  
3. **College GE** — Start with College Success + Health, then writing, quant, science, humanities/social, Spanish as needed  
4. **Electives** — AI, cyber, music business, finance depth  

## Audit

```bash
npm run curriculum-audit
```

Scores topic coverage per GE bucket against `lib/ge-rubric.js`.

## Maintenance

When adding a course:

1. Set `geBucket`, `scope`, `creditHint`, `outcomes[]`  
2. Prefer **5–7 chapters** with plain-text teacher notes (`t`) rich enough to teach from  
3. Re-run `npm run curriculum-audit`  
4. Update this table if a required bucket changes status  
