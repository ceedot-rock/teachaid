# TEACHAiD

Interactive school app for complete beginners — learn by doing, ask anything (text + voice).

## Live app

Open the Vercel deployment URL for this repo.

## Local

```bash
npx serve .
```

Teacher chat needs the API (`/api/chat`) with `XAI_API_KEY` — use `vercel dev` or deploy.

## Install as app

1. Open the live URL on your phone or computer  
2. Browser menu → **Add to Home Screen** / **Install app**  
3. TEACHAiD runs full-screen like a native app  

## Contents

- Beginner path: Counting → Positive & Negative → How Computers Count  
- **Curriculum tab**: **Create new** or **Add to existing** — upload `.txt` / `.md` / paste → Grok builds or appends chapters (on-device)  
- Games with a clear finish (not infinite loops)  
- Learning Journal (saved on device)  
- **Certified teacher per textbook** (Mira, Nova, Bit, Codex) — grounded in that book only  
- **Grades throughout**: score, grasping, needs review  
- **Chapter lock**: only the certified teacher can pass you to the next chapter  
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
