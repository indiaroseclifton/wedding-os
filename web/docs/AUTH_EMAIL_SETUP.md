# Real email login (optional — later)

Demo login (Alex / Jordan) stays the default so the app works offline without email setup.

## When you want magic-link email

1. Create a [Resend](https://resend.com) account and API key.
2. Add to `web/.env`:

```bash
DEMO_AUTH=0
AUTH_SECRET=generate-a-long-random-string
AUTH_URL=http://localhost:3000
RESEND_API_KEY=re_...
EMAIL_FROM="Wedding OS <onboarding@yourdomain.com>"
```

3. Wire Auth.js (NextAuth v5) with the Resend provider in `src/lib/auth/auth.ts` (scaffold already referenced by session helpers when `DEMO_AUTH=0`).
4. Run `npx prisma migrate dev` if users should live in Postgres.
5. Restart `npm run dev`.

Until those keys exist, keep:

```bash
DEMO_AUTH=1
```

That uses the one-click demo users and is correct for local product work.
