# Deploy checklist (Vercel)

## Before you deploy

1. Repo is on GitHub: `indiaroseclifton/wedding-os`
2. App runs locally with `DEMO_AUTH=1` and `DATA_BACKEND=file`
3. Optional: Neon database URL works with `npx prisma migrate dev`

## Vercel project

1. Import the GitHub repo in Vercel
2. **Root Directory:** `web`
3. Framework: Next.js (auto)
4. Install / build commands: default (`npm install`, `npm run build`)

## Environment variables

Minimum for demo-style deploy:

```bash
DEMO_AUTH=1
DATA_BACKEND=file
```

Note: file storage on Vercel is **ephemeral**. Data resets when the instance recycles. Fine for a demo; not for production couples.

For durable data:

```bash
DEMO_AUTH=1
DATA_BACKEND=prisma
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
```

Then ensure Prisma client generates on build (`postinstall` or `prisma generate` in build script).

## After deploy

1. Open the Vercel URL
2. Sign in as Alex / Jordan
3. Smoke-test: add guest, create handoff, open share link `/p/...`

## Later

- Custom domain
- `DEMO_AUTH=0` + Resend magic links (`docs/AUTH_EMAIL_SETUP.md`)
- Move remaining file stores onto Prisma models
