# TEACHAiD — Stripe pricing

## Live products (2026-07-29)

| SKU | Price | Product ID | Price ID | Payment Link |
|-----|-------|------------|----------|--------------|
| **Pro monthly** | **$9 / month** | `prod_UyXkpDGDSqyesD` | `price_1TyaelK8JsmXFzvIP2HcvIMP` | https://buy.stripe.com/14A3cw7Nj8hqfxP7cs6wE04 |
| **Trial 7-day** | **$0.99** one-time | `prod_UyXkr5aySSbt7O` | `price_1TyaenK8JsmXFzvIb9S66YPS` | https://buy.stripe.com/9B68wQgjPapydpHcwM6wE05 |
| **Curriculum submit** | **$3** one-time | `prod_UyXkN5CfZE5vPc` | `price_1TyaepK8JsmXFzvIAJGSbpha` | https://buy.stripe.com/8x2aEYffLdBK5XfeEU6wE06 |
| **Chaternity create** | **$20** one-time | `prod_UyXoI7dO78mtOf` | `price_1TyaiZK8JsmXFzvIRnRRm4Mq` | https://buy.stripe.com/fZueVe0kR2X685n40g6wE07 |
| **Chaternity join** | **$1 / month** | `prod_UyXoFwDjCMYeol` | `price_1TyailK8JsmXFzvIFDWkaK8W` | https://buy.stripe.com/cNibJ26Jf55eclDdAQ6wE08 |

## Locked revenue splits (Corey 2026-07-29)

| Stream | Split |
|--------|--------|
| Curriculum submit fee $3 | **100% TEACHAiD** (non-refundable review) |
| Accepted curriculum — ongoing | **70% creator · 30% TEACHAiD** |
| Chaternity join $1/mo | **90% creator · 10% TEACHAiD Fund** |

## Settlement model — Financial AI Dept (school bursar)

**Not** instant marketplace auto-split on every charge.

TEACHAiD operates like a **school business office**:

1. **Collect** — All student/creator payments land on the **platform** Stripe account (current Payment Links + pro-verify).
2. **Ledger** — Each SKU and (when known) creator/room id is recorded with owed amounts using the locked splits above.
3. **Settle** — A **Financial AI Dept** process (human + agent) reviews the period ledger, then pays creators via **Stripe Connect Express Transfers** (or dashboard transfer until Connect profile is complete).
4. **Payout cadence** — Default: **monthly** (school-style), not real-time per join.

### Why this model

- Matches “school pays instructors,” not “Uber pays drivers per ride.”
- Lets review/accept curriculum **before** royalties accrue.
- Chaternity 90/10 still holds; Fund 10% is retained on platform until period close.
- Connect is still required for **payout rails**, not for instant destination charges.

### Connect role under this model

| Piece | Role |
|-------|------|
| Platform account | Merchant of record; holds funds |
| Express connected accounts | Creator **payout destinations** only |
| `POST /api/connect-onboard` | Creator opens Express account + Account Link |
| Transfers API / period job | Financial AI Dept settles batch payouts |

Platform profile must be completed once: https://dashboard.stripe.com/connect/accounts/overview  
(Connected accounts list is currently empty — expected until first onboard.)

### Attribution (curriculum)

Until enrollments are metered server-side: royalties may start as **manual period awards** (accepted class × agreed base). Later: Pro uplift / chapter completions attributed to creator materials.

### Legacy (superseded for new sales)

| SKU | Price | Payment Link |
|-----|-------|--------------|
| Pro Voice one-time | $9 once | https://buy.stripe.com/aFa6oIaZv69iclD9kA6wE03 · `prod_UyUru4Pptkt1SY` |

## Public pricing page

https://teachaid.vercel.app/pricing  
(or `/pricing.html`)

## Success redirect

All payment links complete to:

`https://teachaid.vercel.app/?pro_session={CHECKOUT_SESSION_ID}`

App verifies via `GET /api/pro-verify?session_id=cs_…` then grants device entitlements (Pro / trial / submit / chat credits).

**Money settlement is separate** from device unlock — Financial AI Dept owns the ledger → transfer path.

## Fulfillment vs settlement

| Layer | Path |
|-------|------|
| **Access** (shipped) | Payment Link → `session_id` → `/api/pro-verify` → localStorage |
| **Payout** (school model) | Period ledger → Connect Transfer to creator Express account |
| **Optional webhook** | Server-side access + ledger rows (not required for beta) |

## Vercel env

| Name | Purpose |
|------|---------|
| `STRIPE_RESTRICTED_KEY` or `STRIPE_SECRET_KEY` | Verify sessions; Connect onboard needs write-capable secret |
| `TEACHAID_PRO_PRICE_ID` | optional lock |
| `XAI_API_KEY` | Grok chat + Pro TTS |
| `STRIPE_WEBHOOK_SECRET` | only if webhook added |

## Ops checklist

- [x] Lock splits 70/30 and 90/10  
- [x] `api/connect-onboard.js` shipped (Express + Account Link)  
- [ ] Complete Connect **platform profile** in Stripe Dashboard (one-time)  
- [ ] First creator onboard smoke (email → Account Link → Express)  
- [ ] Financial AI Dept period ledger (Notion or KV) + monthly settle run  
- [ ] Legal one-liner for TEACHAiD Fund 10%  
