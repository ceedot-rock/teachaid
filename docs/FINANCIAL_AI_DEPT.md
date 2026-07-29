# TEACHAiD · Financial AI Dept (school bursar)

## Model

1. **Collect** — Payment Links → platform Stripe (`acct` platform).  
2. **Unlock** — `/api/pro-verify` (device access only).  
3. **Ledger** — period rows: who is owed what.  
4. **Settle** — `/api/settle-payout` → Transfer to creator Express `acct_…`.  
5. **Payout** — Stripe pays creator’s bank from their connected balance.

## Locked splits

| Stream | Creator | Platform |
|--------|---------|----------|
| Curriculum (accepted, ongoing) | 70% | 30% |
| Chaternity join $1/mo | 90% | 10% Fund |
| Submit review $3 | 0% | 100% |

## API

### Onboard creator
`POST /api/connect-onboard`  
`{ "action": "create", "email": "creator@…", "country": "US" }`  
→ `{ ok, account_id, url }` — open `url` for Express KYC.

### Settle (admin)
`POST /api/settle-payout`  
Headers: `X-Admin-Token: $SETTLE_ADMIN_TOKEN` (if set)  
`{ "account_id": "acct_…", "amount_cents": 900, "period": "2026-08", "memo": "…" }`  
→ `{ ok, transfer_id }`

Requires `STRIPE_SECRET_KEY` with **transfer** permission (restricted keys often cannot transfer).

## Platform Stripe status (verified via connector)

- Account: live, `charges_enabled`, `payouts_enabled`, `transfers` capability **active**
- Bank on file: yes
- Connected accounts: **0** until first Express onboard after Connect platform profile is approved

## One Dashboard step only you can finish

Connect **platform profile** (buyers purchase from you · Education · Express onboarding):

https://dashboard.stripe.com/connect/accounts/overview  
https://dashboard.stripe.com/settings/connect/platform-profile

Until Stripe approves the platform profile, `POST /v1/accounts` type=express may fail. Code is ready; approval is the gate.

## Monthly run (agent or human)

1. Export / sum ledger for period  
2. Confirm platform available balance ≥ sum of transfers  
3. For each creator: `settle-payout`  
4. Mark ledger rows `paid` + transfer_id  
