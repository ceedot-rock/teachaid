# TEACHAiD hosting (Fly.io + agentmagnet.xyz)

## Live now
- App: https://teachaid.fly.dev
- Health: https://teachaid.fly.dev/health

## Custom domain
Target: **https://teachaid.agentmagnet.xyz**

At your DNS host for `agentmagnet.xyz` (registrar / DNS panel — not yet on Cloudflare for this account), add:

| Type | Name | Value |
|------|------|--------|
| **A** | `teachaid` | `66.241.125.100` |
| **AAAA** | `teachaid` | `2a09:8280:1::159:2600:0` |

Then cert auto-issues:
```bash
flyctl certs check teachaid.agentmagnet.xyz --app teachaid
```

Optional apex/www: point separately if you want the root domain on TEACHAiD or a landing page.

## Deploy
```bash
export FLY_API_TOKEN=…   # from ~/.env_secrets
cd projects/teachaid
flyctl deploy --config fly.toml --remote-only --app teachaid
```

## Secrets (names only)
- `XAI_API_KEY` (required for teachers)
- `STRIPE_RESTRICTED_KEY` or `STRIPE_SECRET_KEY`
- `TEACHAID_PUBLIC_URL` (set to https://teachaid.agentmagnet.xyz after DNS works)
- optional: `TEACHAID_PRO_PRICE_ID`, `SETTLE_ADMIN_TOKEN`

## Stripe return URLs
Payment Links currently return to teachaid.vercel.app — update in Stripe Dashboard to the new host when you cut over.
