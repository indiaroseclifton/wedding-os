# Wedding OS

Collaboration-first wedding planning — vendors, guests, seating, handoffs, decisions, and a wedding-party portal.

Built as a Next.js app with a file-backed demo store (and Prisma/Neon ready for Milestone A).

## Quick start

```bash
cd web
cp .env.example .env   # or use your existing .env
npm install
npm run dev
```

Open http://localhost:3000 and sign in as **Alex** or **Jordan** (demo auth).

```bash
DEMO_AUTH=1
DATA_BACKEND=file
```

## Modules

| Area | Routes |
|------|--------|
| Dashboard | `/dashboard` |
| Tasks + workload | `/tasks`, `/workload` |
| Guests + CSV import | `/guests`, `/guests/import` |
| Seating + chart | `/seating` |
| Vendors | `/vendors` |
| Handoffs (DJ / day-of / photo) | `/handoffs` |
| Decisions | `/decisions` |
| Polls | `/polls` |
| People + invites | `/people`, `/invite/[token]` |
| Party portal | `/party` |
| Attire | `/attire` |
| Day-of board | `/day-of` |
| Timeline | `/timeline` |
| Budget, music, moodboard, notes | matching routes |

## Stack

- Next.js (App Router) + TypeScript
- File JSON store under `web/.data/` for demo
- Prisma schema + Neon for Postgres (optional)
- Cookie demo sessions (`DEMO_AUTH=1`)

## Docs

- `web/docs/AUTH_EMAIL_SETUP.md` — optional magic-link email
- `SETUP_ON_MAC.md` — git pull workflow on Mac

## Product thesis (short)

Most stress is coordination — and that’s the selling point. Competitors already let you browse vendors; they drop you after the hire. This app is the full path (browse → shortlist → book) plus the shared workspace competitors skip: decisions, DIY playbooks, and one handoff package per vendor.
