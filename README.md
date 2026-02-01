# 🎯 Rival - AI Competitor Intelligence

**Know what your competitors are doing — without checking.**

Live: https://rival.jdms.nl  
GitHub: https://github.com/joeystdio/rival

## Features

- **Track Competitors** — Add competitor websites and URLs to monitor
- **Daily Monitoring** — Automatic crawling detects changes to pages
- **AI Analysis** — Gemini-powered insights explain what changed and why it matters
- **Change Timeline** — See all changes across competitors in one view
- **Email Alerts** — Get notified when competitors make significant changes
- **Admin Panel** — Super admin can manage all users, plans, and billing

## Tech Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** SSO via auth.jdms.nl
- **AI:** Google Gemini for change analysis
- **Payments:** Stripe (subscriptions)
- **Hosting:** Docker + Traefik on VPS

## Pricing Plans

| Plan | Price | Competitors | URLs/Competitor |
|------|-------|-------------|-----------------|
| Free | $0 | 2 | 2 |
| Starter | $19/mo | 5 | 5 |
| Pro | $39/mo | 15 | 10 |
| Business | $79/mo | Unlimited | Unlimited |

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/rival
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=AIza...
CRON_SECRET=your-secret-for-cron-jobs
```

## API Endpoints

### Crawl API
```bash
# Trigger daily crawl (for cron job)
curl -X POST https://rival.jdms.nl/api/crawl \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"

# Crawl specific URL
curl -X POST https://rival.jdms.nl/api/crawl \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"urlId": "uuid"}'
```

### Stripe Webhook
Configure in Stripe Dashboard: `https://rival.jdms.nl/api/stripe/webhook`

Events to enable:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## Cron Setup

Add to crontab or scheduler:
```
# Run daily crawl at 6 AM UTC
0 6 * * * curl -X POST https://rival.jdms.nl/api/crawl -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy with Docker
docker compose up -d --build
```

## Admin Access

Super admins (configured in `/lib/auth.ts`):
- joey@jdms.nl
- joe@jdms.nl

Access admin panel at `/admin` after logging in.

## License

MIT
