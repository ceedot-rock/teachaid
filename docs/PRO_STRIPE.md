# TEACHAiD — Stripe pricing

## Live products (2026-07-29)

| SKU | Price | Product ID | Price ID | Payment Link |
|-----|-------|------------|----------|--------------|
| **Pro monthly** | **$9 / month** | `prod_UyXkpDGDSqyesD` | `price_1TyaelK8JsmXFzvIP2HcvIMP` | https://buy.stripe.com/14A3cw7Nj8hqfxP7cs6wE04 |
| **Trial 7-day** | **$0.99** one-time | `prod_UyXkr5aySSbt7O` | `price_1TyaenK8JsmXFzvIb9S66YPS` | https://buy.stripe.com/9B68wQgjPapydpHcwM6wE05 |
| **Curriculum submit** | **$3** one-time | `prod_UyXkN5CfZE5vPc` | `price_1TyaepK8JsmXFzvIAJGSbpha` | https://buy.stripe.com/8x2aEYffLdBK5XfeEU6wE06 |
| **Chaternity create** | **$20** one-time | `prod_UyXoI7dO78mtOf` | `price_1TyaiZK8JsmXFzvIRnRRm4Mq` | https://buy.stripe.com/fZueVe0kR2X685n40g6wE07 |
| **Chaternity join** | **$1 / month** | `prod_UyXoFwDjCMYeol` | `price_1TyailK8JsmXFzvIFDWkaK8W` | https://buy.stripe.com/cNibJ26Jf55eclDdAQ6wE08 |

### Chaternities revenue split

Of each **$1/mo** join pass: **90%** room creator · **10% TEACHAiD Fund** (Connect application fee / transfer — wire in payouts ops).

Admittance: creator and/or admins appointed by creator.

### Curriculum royalties (proposal — pending Corey lock)

| Stage | Money |
|-------|--------|
| Submit review fee | **$3** non-refundable (TEACHAiD keeps 100%) |
| Accepted class — ongoing | **70% creator · 30% TEACHAiD** of net revenue attributed to that class |
| Rejected | no royalty · no refund of $3 |

Attribution rules TBD (enrollments, Pro uplift, or flat monthly license). Until Connect is live, accepted creators are paid manually via Stripe dashboard transfer.

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

App verifies via `GET /api/pro-verify?session_id=cs_…` then grants:

| Purchase | Client unlock |
|----------|----------------|
| Pro monthly | Pro tier while subscription active (session stored) |
| Trial $0.99 | `trial_until` = now + 7 days · gated Pro |
| Submit $3 | `curriculum_submit_paid` + optional creator email for royalties |
| Chaternity create $20 | create-room credit on device |
| Chaternity join $1/mo | join pass on device |

## Fulfillment model (current vs optional webhook)

**Current (shipped):** Payment Link → browser return with `session_id` → `/api/pro-verify` → localStorage entitlement.

**Optional later:** `api/stripe-webhook.js`

- Verify `Stripe-Signature` with `STRIPE_WEBHOOK_SECRET`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Map amount/sku → grant Pro/trial/submit/chat (KV or email allowlist)
- Not required for Payment Link flow to work

## Curriculum royalties — process

1. Creator pays **$3** to submit a class for review.  
2. If **accepted**, TEACHAiD routes **royalties** (proposed 70/30) to the creator’s Connect account.  
3. Withdrawals via **Stripe Connect Express**.  
4. Rejection does **not** refund the $3 review fee (stated on pricing page).

### Vercel env

| Name | Purpose |
|------|---------|
| `STRIPE_RESTRICTED_KEY` or `STRIPE_SECRET_KEY` | Verify checkout sessions |
| `TEACHAID_PRO_PRICE_ID` | optional lock — monthly `price_1TyaelK8JsmXFzvIP2HcvIMP` |
| `XAI_API_KEY` | Grok chat + Pro TTS |
| `STRIPE_WEBHOOK_SECRET` | only if webhook route is added |

### Connect (royalties) — ops checklist

- [ ] Enable Stripe Connect (Express)  
- [ ] Creator onboarding link (Express accounts)  
- [ ] Lock royalty % (proposal: curriculum **70/30**, Chaternity **90/10**)  
- [ ] Application fee on join subscriptions for TEACHAiD Fund 10%  
- [ ] Payout schedule  
- [ ] Legal copy for TEACHAiD Fund 10%  
