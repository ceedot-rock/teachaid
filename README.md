# TEACHAiD

Interactive school app for complete beginners — learn by doing, ask anything (text + voice).

## Live app

Open the Vercel deployment URL for this repo.

## Local

```bash
npx serve .
```

Teacher chat needs the API (`/api/chat`) with `XAI_API_KEY` — use `vercel dev` or deploy.

## Tests

Shared logic lives in `lib/` (grades, mastery certificates, curriculum parse). Run:

```bash
npm test
```

Covers: grade gates (70% pass min), grade trailer parsing, chapter unlock, mastery cert rules (**91%+ final pass**), curriculum JSON/sanitize, catalog, and **student referral** (1 month each, 4/year cap).

## Install as app

1. Open the live URL on your phone or computer  
2. Browser menu → **Add to Home Screen** / **Install app**  
3. TEACHAiD runs full-screen like a native app  

## Contents

- **Foundations**: Counting → Positive & Negative → How Computers Count  
- **Programming 101** (8 books): Integers to Codes → Program → Variables → Strings → Decisions → Loops → Functions → Lists & Capstone  
- **College 101s** (26+): gen-ed, **AI 101**, AI/Human Cohesion, Cybersecurity, Data & Digital Literacy, Finance, Networking, Art, Literature, Intro to Law, and more  
- **Student Campus**: share comments, quiz/test/chapter scores (and mastery) with classmates via Share / share codes  
- **Student referral**: every account gets a **Student ID** (`TA-XXXXXXXX`); when a friend applies it, **both get 1 month free Pro** (referrer max **4 / calendar year**)  
- **Curriculum tab**: **Create new** or **Add to existing** — upload `.txt` / `.md` / paste → Grok builds or appends chapters (on-device)  
- Games with a clear finish (not infinite loops)  
- Learning Journal (saved on device)  
- **Certified teacher per textbook** — grounded in that book only  
- **Grades throughout**: score, grasping, needs review  
- **Chapter lock**: only the certified teacher can pass you to the next chapter  
- **Certificate of Course Mastery**: issued when the teacher passes you on the **final chapter** at **91%+** (stored on device; print/PDF)  
- Explain / Continue / Pass check · pace · voice  

## Load document API

`POST /api/curriculum` with JSON:

```json
{
  "mode": "create",
  "text": "…lesson materials…",
  "filename": "optional.txt",
  "titleHint": "optional title",
  "audience": "complete beginners"
}
```

**Append** (add chapters to an existing book):

```json
{
  "mode": "append",
  "text": "…new materials…",
  "existing": {
    "title": "My book",
    "teacher": "Sage",
    "chapters": [{ "n": "Intro", "t": "…" }]
  }
}
```

Create returns `{ mode, book, source }`. Append returns `{ mode, chapters, source }`.  
Needs `XAI_API_KEY` (same as teacher chat).  


## Voice tiers

| Tier | Voices |
|------|--------|
| **Basic** (default) | Strong on-device teacher voices: Auto, Soft, Clear, Warm |
| **Pro** | **Grok / xAI SpaceXAI** neural voices (Eve, Ara, Leo, Rex, …); on-device fallback |

Unlock Pro on-device via **Voice** in the top bar (or `?pro=1`).

## Server env (Vercel team: nektaronbase-cells-projects)

| Name | Required | Notes |
|------|----------|--------|
| `XAI_API_KEY` | yes for teachers | Text teacher via api.x.ai |
| `XAI_MODEL` | optional | default `grok-3-mini` |
| `XAI_API_KEY` | teachers + **Pro Grok TTS** | same key for chat + `/v1/tts` |

```bash
npx vercel env add XAI_API_KEY --scope nektaronbase-cells-projects
npx vercel --prod --scope nektaronbase-cells-projects
```

Built as a Progressive Web App (PWA). SPLabs brand assets used for social meta.
