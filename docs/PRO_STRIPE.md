# TEACHAiD — Stripe pricing

## Live products (2026-07-29)

| SKU | Price | Product ID | Price ID | Payment Link |
|-----|-------|------------|----------|--------------|
| **Pro monthly** | **$9 / month** | `prod_UyXkpDGDSqyesD` | `price_1TyaelK8JsmXFzvIP2HcvIMP` | https://buy.stripe.com/14A3cw7Nj8hqfxP7cs6wE04 |
| **Trial 7-day** | **$0.99** one-time | `prod_UyXkr5aySSbt7O` | `price_1TyaenK8JsmXFzvIb9S66YPS` | https://buy.stripe.com/9B68wQgjPapydpHcwM6wE05 |
| **Curriculum submit** | **$3** one-time | `prod_UyXkN5CfZE5vPc` | `price_1TyaepK8JsmXFzvIAJGSbpha` | https://buy.stripe.com/8x2aEYffLdBK5XfeEU6wE06 |

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

## Curriculum royalties

1. Creator pays **$3** to submit a class for review.  
2. If **accepted**, TEACHAiD routes **royalties** to the creator’s account.  
3. Withdrawals via **Stripe** (Connect Express / payouts — configure Connect account onboarding separately).  
4. Rejection of a submission does **not** refund the $3 review fee (stated on pricing page).

### Vercel env

| Name | Purpose |
|------|---------|
| `STRIPE_RESTRICTED_KEY` or `STRIPE_SECRET_KEY` | Verify checkout sessions |
| `TEACHAID_PRO_PRICE_ID` | optional lock — monthly `price_1TyaelK8JsmXFzvIP2HcvIMP` |
| `XAI_API_KEY` | Grok chat + Pro TTS |

### Connect (royalties) — ops checklist

- [ ] Enable Stripe Connect  
- [ ] Creator onboarding link (Express)  
- [ ] Application fee / royalty % policy  
- [ ] Payout schedule  
