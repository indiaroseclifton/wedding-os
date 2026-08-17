# Claude / agents — Vowfolk

You are working on **Vowfolk** (`indiaroseclifton/wedding-os`). Read **`PRODUCT.md` first**, then this file. Ignore the README module table; it is stale.

Owner builds in conversation and ships to `main`. The live product is a Next.js desk, not a docs site.

## What this is

One couple desk for one wedding. Rooms share guests, vendors, date, floor, run of show. **Do not extract rooms into standalone apps.** Do not add a chat/LLM concierge. “What next” is deterministic (`web/src/lib/this-week.ts`, `planner-decisions.ts`).

## Before you write code

1. Read `PRODUCT.md` (thesis, Shape, After, what we are not).
2. Open the kernel for the room you are touching (table below).
3. Match design: moss/ivory/clay, serif titles, photograph covers, `glass-panel`. If it looks like generic SaaS, rewrite.
4. Shape-aware: if you add a room or default that assumes an aisle, 80 chairs, or a 12-month checklist, gate it with `shapeOf` / `enterOf` / `roomVisible` from `web/src/lib/shape.ts`.

## Kernels (start here, not by grepping the whole tree)

| Concern | Files |
|---|---|
| Shape + write-through | `web/src/lib/shape.ts`, `shape-checklists.ts`, `shape-schedule.ts`, `web/src/lib/data/apply-shape.ts` |
| Workspace meta | `web/src/lib/preferences.ts`, `web/src/lib/data/store.ts` (`getWorkspaceMeta`) |
| Send / vendor door | `web/src/lib/send/`, `web/src/app/v/`, `web/src/lib/send/resolve-portal.ts` (`/p` → `/v`) |
| Vendor card face | `web/src/lib/vendor-face.ts`, `web/src/components/VendorHero.tsx`, `VendorFace.tsx`, `VendorLog.tsx` |
| Seating | `web/src/app/(app)/seating/`, guest `seatIndex` in store |
| DIY | `web/src/lib/data/diy-playbooks.ts`, `web/src/components/diy/` |
| Week / home | `web/src/lib/this-week.ts`, `web/src/lib/smart-home.ts` |
| Cues | `web/src/lib/dj-cues.ts` + `cueHidden()` |
| Budget | `web/src/lib/budget-envelopes.ts`, `envelopesForShape()` |
| Nav | `web/src/lib/rooms.ts`, `visual-rooms.ts` — filter with `roomVisible` |
| Data I/O | `web/src/lib/data/store-io.ts` — file JSON, Prisma is fallback |

App routes live in `web/src/app/(app)/`. Public tokens: `web/src/app/v/`, `w/`, `c/`.

## Data & auth

- Default: `DATA_BACKEND=file`, JSON in `web/.data/`. Do not assume Postgres is live.
- Couple APIs: `requireCoupleApi`. Vendors/guests use unguessable tokens, not accounts.
- Demo users Alex / Jordan when `DEMO_AUTH=1`.
- Prisma schema is **behind** the file store. Guest `seatIndex`, DIY, floor, send are not fully modeled in Prisma. Don’t “fix” that unless asked.

## Hard rules

- **One desk.** Expand in place. No new deployable product, no `/elope` app.
- **No invented features:** no Grok chat, no 3D floor, no collision engine, no stem checkout, no Stripe, no vendor inbox, no AI thank-you letters, no stationery store, no legal name-change filing.
- **No aisle defaults.** Ceremony language is not “bride processional” unless `enterHow === "one-then"`. Name change is optional.
- **Don’t wipe user work.** Shape reset keeps checked checklist items and money.
- **Don’t kill design for density.** Pretty is a requirement. Category faces, covers, serif.
- **Client/server:** no `fs` or store-io in client components. Phosphor icons: `@phosphor-icons/react/ssr` in server components.
- **Print** = `window.print()`. ICS is enough for calendar.

## After (do not pretend it exists)

`/thanks` is a stub. The After *season* (90-day clock, two-week pre-gifts, Home transformation) is specified in `PRODUCT.md` and is **not shipped**. Don’t advertise it in UI copy as if it works.

## How to change things

- New couple field → `WorkspacePrefs` + `getWorkspaceMeta` return + `/api/workspace` POST. Then apply if it must write through.
- New checklist titles → `CHECKLIST_ACTIONS` in `checklist-actions.ts` or they have no CTA.
- New vendor category face → `FACES` in `vendor-face.ts`.
- New shape behavior → `shape.ts` first, then `apply-shape.ts`.

## Verify

```bash
cd web
npx tsc --noEmit
DATA_BACKEND=file DEMO_AUTH=1 npm run build
```

Vercel deploys from `web/`. A green build is required; a 200 is not proof the page renders.

## Voice in the product

Short. Specific. Coordinator, not cheerleader. “Who files the license.” not “Start your journey.”
