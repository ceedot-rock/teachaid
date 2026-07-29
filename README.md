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
- Games with a clear finish (not infinite loops)  
- Learning Journal (saved on device)  
- **One teacher per textbook** (Mira, Nova, Bit, Codex) — grounded in that book’s materials only  
- **Explain this chapter** / **Continue** at Slow · My pace · Faster  
- Questions + voice (mic + spoken answers)  

## Server env (Vercel team: nektaronbase-cells-projects)

| Name | Required | Notes |
|------|----------|--------|
| `XAI_API_KEY` | yes for teachers | Space teacher via api.x.ai |
| `XAI_MODEL` | optional | default `grok-3-mini` |

```bash
npx vercel env add XAI_API_KEY --scope nektaronbase-cells-projects
npx vercel --prod --scope nektaronbase-cells-projects
```

Built as a Progressive Web App (PWA). SPLabs brand assets used for social meta.
