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

- **Real GE-aligned path**: Bridge → Programming sequence → lower-division gen-ed (see `docs/CURRICULUM_ALIGNMENT.md`)  
- **Foundations**: Counting → Positive & Negative → How Computers Count  
- **Programming 101** (8 books): full intro CS sequence units  
- **College GE**: writing, oral, critical thinking, quant, physical/life science (incl. Physics, Env Sci), arts, humanities, social science, **Spanish**, **College Success**, **Health**, diversity, plus AI/tech electives  
- Audit: `npm run curriculum-audit`  
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


## Pricing (Stripe live)

| Plan | Price | Link |
|------|-------|------|
| **Basic** | Free | app |
| **Trial** | **$0.99** · 7-day gated Pro | https://buy.stripe.com/9B68wQgjPapydpHcwM6wE05 |
| **Pro** | **$9 / month** | https://buy.stripe.com/14A3cw7Nj8hqfxP7cs6wE04 |
| **Submit a class** | **$3** review fee; royalties if accepted (Stripe payout) | https://buy.stripe.com/8x2aEYffLdBK5XfeEU6wE06 |

Pricing page: `/pricing.html` · details: [`docs/PRO_STRIPE.md`](docs/PRO_STRIPE.md)

### Voice tiers

| Tier | Voices |
|------|--------|
| **Basic** (default) | On-device: Auto, Soft, Clear, Warm |
| **Trial** | Gated Pro (message cap / day) for 7 days |
| **Pro** | **Grok / xAI** neural voices while subscribed |

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
