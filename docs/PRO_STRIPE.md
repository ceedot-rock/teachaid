# TEACHAiD Pro — Stripe

## Live payment link

| Field | Value |
|-------|--------|
| Product | TEACHAiD Pro Voice |
| Product ID | `prod_UyUru4Pptkt1SY` |
| Price | $9.00 one-time |
| Price ID | `price_1TyXryK8JsmXFzvI3KHJwoJi` |
| Payment Link | https://buy.stripe.com/aFa6oIaZv69iclD9kA6wE03 |
| Success redirect | `https://teachaid.vercel.app/?pro_session={CHECKOUT_SESSION_ID}` |

## Vercel env

| Name | Purpose |
|------|---------|
| `STRIPE_RESTRICTED_KEY` or `STRIPE_SECRET_KEY` | Verify checkout sessions |
| `TEACHAID_PRO_PRICE_ID` | optional lock to `price_1TyXryK8JsmXFzvI3KHJwoJi` |
| `OPENAI_API_KEY` | Neural TTS for Pro models |
| `ELEVENLABS_API_KEY` | Optional ElevenLabs |

## Flow

1. User clicks **Get Pro** → Stripe Payment Link  
2. After pay → redirect with `pro_session=cs_…`  
3. App calls `GET /api/pro-verify?session_id=cs_…`  
4. On `ok: true` → store Pro unlock in `localStorage`  
