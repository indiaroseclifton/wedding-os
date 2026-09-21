# Vowfolk — product brief

Read this before the README. The README route list is stale.

Plan it. Make it. Celebrate it. Not another all-in-one planner with AI.

The wedding-*planning* market is saturated. The wedding-*making* market is not. Studio is the flagship — flowers, tables, décor, signs, boxes — then Plan, People, and the day still run the rest.

Most planners sell **one wedding**: 12–18 months, two venues, a processional, 80 chairs, a last dance, then a blog post about thank-yous. This desk follows the *shape* of the day, helps you *make* what you want, and stays useful after the date.

## Thesis

Couples are not shopping. They are making and coordinating. Browse → shortlist → book is table stakes. The product is Studio (quantities, sources, boxes) plus what happens after hire: one packet, one guest list that seats, one week, a day that is not forced down an aisle, and ninety days of thank-yous.

Design is the product. Cream `#FAF7F2`, sage `#B7C2AE`, blush `#F6DBD6`, charcoal `#272727`. Playfair headings, Lora italic, Inter body. Settings can still change theme, type, glass, and motion. If a new surface looks like a SaaS checklist tab, it failed.

## Shape (shipped)

Stored on workspace meta: `shape`, `enterHow`, optional `gatheringDate`.

| Shape | Meaning | Desk changes |
|---|---|---|
| `us` | Just us | Hide seating, floor, dietary, party. License-first checklist. Announcement site, not RSVP. Photo/travel budget. |
| `small` | Under ~40, one room | Hide wedding-party room. Dinner in the same space. |
| `weekend` | Ceremony + dinner + night | Full desk. Default if unset. |
| `two` | Marry, then gather | Two dates. Home counts down to the next. |

**Enter:** together / one-then / already / none. This retires “bride processional” as the default cue. First-look copy must not talk about an aisle if there isn’t one.

Write-through lives in `web/src/lib/data/apply-shape.ts`. Onboard applies defaults. Settings can reset checklist + day plan without wiping checked items or money.

## Rooms (what exists)

One couple workspace. File JSON under `web/.data/` is the source of truth (`DATA_BACKEND=file`). Prisma exists and is behind.

| Room | Job | Kernel |
|---|---|---|
| Home `/dashboard` | One next action. Days to the next date. | `this-week.ts` |
| Plan `/planning` | Vision, decisions, vendors, packets, budget, after | Shape re-seeds checklist |
| People `/guests` | List, RSVP, letter, seating | Households, plus-ones |
| Studio `/studio` | Make it: flowers, tables, décor, signs, boxes | Scale + 15%, sources, inventory |
| The day `/day-of` | Call sheet | Shape + enter |
| After `/after` | 90 days + what we made | Thanks + box fate |

Public, unguessable tokens: `/v` vendor packet, `/w` guest site, `/b` florist board, `/c` calendar, `/ros` run of show. Couple tools use `requireCoupleApi`.

`HIRED` and `BOOKED` both count as booked for Send. Start writes `BOOKED`. Email is optional — if Resend is off, the UI says copy the link. It does not pretend mail left.

## What we are not

- Not a vendor marketplace (directory is a helper, hire writes into *our* card).
- Not HoneyBook (no vendor inbox product).
- Not AllSeated / Prismm (no 3D collision floor).
- Not Bloom & Song (no stem commerce).
- Not Zola stationery (we will not print thank-you cards).
- Not a Grok/chat concierge. “What next” is a rule engine (`this-week.ts`, `planner-decisions.ts`).
- Not four standalone apps. Expand rooms. Share guests, date, vendors, floor, ROS.

## After (shipped as a room)

The industry mentions “thank-yous in three months” and then sells cards. This desk walks the 90 days.

- Gifts **before** the day: thank within **two weeks**.
- Gifts **on/after** the day: thank within **three months of the wedding**.
- Thank presence, not only SKUs. Cash has no registry line.
- Home still talks like planning until the season cut lands. Open `/after` after the date.

Name change is a branch (keep / hyphen / change). Hidden if they keep the name. Lives at `/legal`. After lists it as a beat.

## Design rules

- Tokens: moss, ivory, clay, paper, ink. `glass-panel`, serif headlines, 11px uppercase tracking for labels.
- Category covers on vendor cards. Shape cards are photographs + one line, not a quiz.
- Mobile ~390px must work. Touch targets 44px.
- Print is `window.print()` + print CSS, not a PDF service.
- No confetti. No “AI slop” gradients. No gendered defaults (bride processional, Mrs.) unless the couple asked.

## Pricing (intent, `/pricing`)

Desk free · Studio later · Planner later. Do not split the product into four SKUs to match four rooms.

## Demo

Alex & Jordan, `DEMO_AUTH=1`, Atlanta, default shape `weekend` unless they run onboard. Seed via dashboard. Sample data is a product, not a leftover.

## How to talk about it

To a couple: “The desk follows your day — including if there is no aisle — and stays after hire.”  
To an agent: read `CLAUDE.md`, then this file, then the kernels in `web/src/lib/`.

## Approved Studio direction — September 2026

The user explicitly requested a focused Studio app for DIY weddings, advanced visualization and optional AI, with established providers for stationery and websites. This supersedes earlier restrictions on Studio 3D previews and a scoped AI assistant. Keep Studio inside this deployment with shared wedding records; a separate service or SKU is not implied. Preserve post-audit planning and data fixes.

Implemented scope and integration setup are documented in `web/docs/STUDIO_INTEGRATIONS.md`; visual direction is in `web/docs/studio-surface.md`. Dimension-based mockups, manual venue photo alignment and approximate AI concepts must remain clearly distinguished. Do not imply live provider connections, website/RSVP synchronization or paid AI activation until verified with configured accounts.
