# Deploy checklist (Vercel)

## Before you deploy

1. Repo is on GitHub: `indiaroseclifton/wedding-os`
2. App runs locally with `DEMO_AUTH=1` and `DATA_BACKEND=file`
3. Optional: Neon or Prisma Postgres URL works with `npx prisma migrate deploy`

## Vercel project

1. Import the GitHub repo in Vercel
2. **Root Directory:** `web`
3. Framework: Next.js (auto)
4. Install / build commands: default (`npm install`, `npm run build`)

## Environment variables

Minimum for a throwaway demo (data can reset):

```bash
DEMO_AUTH=1
DATA_BACKEND=file
```

For durable data (recommended):

```bash
DEMO_AUTH=1
DATA_BACKEND=prisma
DATABASE_URL=postgresql://...
```

`npm run build` runs `prisma generate` and, when `DATABASE_URL` is set, `prisma migrate deploy`.

## After deploy

1. Open the Vercel URL
2. Sign in as Alex / Jordan
3. Smoke-test: add guest, create handoff, open share link `/p/...`
4. Reload later — the guest should still be there

## Later

- Custom domain
- `DEMO_AUTH=0` + Resend magic links (`docs/AUTH_EMAIL_SETUP.md`)
- Move remaining file stores onto first-class Prisma models
