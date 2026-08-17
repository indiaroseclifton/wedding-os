# Wedding OS — product brief

Read this before the README. The README route list is stale.

One desk for one wedding. Not four apps. Not The Knot with nicer type.

Most planners sell **one wedding**: 12–18 months, two venues, a processional, 80 chairs, a last dance, then a blog post about thank-yous. This desk follows the *shape* of the day, does the coordination after hire, and stays useful after the date.

## Thesis

Couples are not shopping. They are coordinating. Browse → shortlist → book is table stakes. The product is what happens after: one packet per vendor, one guest list that seats and feeds, one week view that says what to do, DIY that scales to headcount, a day that is not forced down an aisle.

Design is part of the product. Moss, ivory, clay. Serif titles. Photograph covers. Quiet type. If a new surface looks like a SaaS checklist tab, it failed.

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
| Home `/dashboard` | One next action. Days to the next date. | `this-week.ts`, `smart-home.ts` |
| Planning | Vision, 37 coordinator decisions, checklist, traditions, DIY | Shape re-seeds checklist |
| DIY studio | Hire vs make, floral canvas, tablescape, playbooks, week-of | Stem model + shopping rules |
| Guests | List, RSVP, dietary, travel | Households, plus-ones |
| Seating + floor | Tables, `seatIndex`, room fixtures | Hidden for `us` |
| Vendors | Card with category *face* (cover + fields), ledger, checklists | `lib/vendor-face.ts` |
| Send | One living packet per vendor. Public `/v/[token]` | `/p` is archive. Extra notes land on Send. |
| Budget / payments | Envelopes, deposit/progress/final, print statement | No Stripe. Shape reweights envelopes. |
| The day | Run of show, cue book, day-of board | Templates follow shape + enter |
| Guest site `/w/[token]` | Invite **or** announcement | `siteMode` / `us` → announce, no RSVP |
| Florist board `/b/[token]` | The pictures, not the brief | Same board they edit. Print is that page. |
| Calendar `/c/[token]` | ICS subscribe | Dues + day |
| After `/after` | The 90 days | Clock, today’s card, seed from guests |
| Thank-yous `/thanks` | The list After walks | Same stack |

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
