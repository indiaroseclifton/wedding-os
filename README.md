# Vowfolk

One desk for one wedding. Coordination after hire — and a day that is not forced down an aisle.

**Read [`PRODUCT.md`](./PRODUCT.md) for what this is. Agents: read [`CLAUDE.md`](./CLAUDE.md) next.** This README is only how to run it.

## Quick start

```bash
cd web
cp .env.example .env
npm install
DEMO_AUTH=1 DATA_BACKEND=file npm run dev
```

Open http://localhost:3000 and sign in as **Alex** or **Jordan**.

## Stack

- Next.js App Router + TypeScript (`web/`)
- File JSON store in `web/.data/` (`DATA_BACKEND=file`)
- Prisma / Neon optional and not the source of truth
- Cookie demo sessions (`DEMO_AUTH=1`)

## Docs

| File | For |
|---|---|
| [`PRODUCT.md`](./PRODUCT.md) | Thesis, Shape, rooms, After, what we will not build |
| [`CLAUDE.md`](./CLAUDE.md) | Agent map: kernels, rules, verify |
| [`SETUP_ON_MAC.md`](./SETUP_ON_MAC.md) | Pull on a Mac |
| [`web/docs/DEPLOY.md`](./web/docs/DEPLOY.md) | Vercel |
| [`web/docs/AUTH_EMAIL_SETUP.md`](./web/docs/AUTH_EMAIL_SETUP.md) | Magic-link email |

## Point another model at this repo

```
Repo: https://github.com/indiaroseclifton/wedding-os
Read PRODUCT.md then CLAUDE.md. Ignore the old module list if you find one in git history.
Work in web/. Do not invent a chat concierge or a second app.
```
