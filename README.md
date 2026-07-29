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
- **Certified teacher per textbook** (Mira, Nova, Bit, Codex) — grounded in that book only  
- **Grades throughout**: score, grasping, needs review  
- **Chapter lock**: only the certified teacher can pass you to the next chapter  
- Explain / Continue / Pass check · pace · voice  

## Voice tiers

| Tier | Voices |
|------|--------|
| **Basic** (default) | Strong on-device teacher voices: Auto, Soft, Clear, Warm |
| **Pro** | Choose neural models: OpenAI HD (Nova/Shimmer/…) or ElevenLabs; premium browser fallback |

Unlock Pro on-device via **Voice** in the top bar (or `?pro=1`).

## Server env (Vercel team: nektaronbase-cells-projects)

| Name | Required | Notes |
|------|----------|--------|
| `XAI_API_KEY` | yes for teachers | Text teacher via api.x.ai |
| `XAI_MODEL` | optional | default `grok-3-mini` |
| `OPENAI_API_KEY` | Pro neural TTS | OpenAI `tts-1-hd` |
| `OPENAI_TTS_MODEL` | optional | default `tts-1-hd` |
| `ELEVENLABS_API_KEY` | optional Pro | ElevenLabs TTS |
| `ELEVENLABS_VOICE_ID` | optional | default Rachel-style id |

```bash
npx vercel env add XAI_API_KEY --scope nektaronbase-cells-projects
npx vercel --prod --scope nektaronbase-cells-projects
```

Built as a Progressive Web App (PWA). SPLabs brand assets used for social meta.
