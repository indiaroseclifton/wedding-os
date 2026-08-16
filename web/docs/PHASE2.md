# Phase 2 progress

## Wave 1 (done)
- Decision → task + timeline
- Handoff refresh from Music / Guests
- Party My week
- Seating capacity warnings + print

## Wave 2 (done)
- Payments by vendor; Deposit / Final / Other; paid date
- Day-of hour schedule strip

## Wave 3 (done)
- Traditions → push open items (or one item) to Timeline
- Events rollup: count, budget caps total, expected guests total
- Music guest song requests; Accept adds to must-play (then refresh DJ handoff)

## P0 hardening (done)
- Settings **Reset sample data** wipes `.data` then reseeds (no duplicates)
- Payments store `vendorId` with name fallback; seed attaches venue id
- Handoff refresh confirm + `lastRefreshedAt` / `lastRefreshedFrom` stamp
- Happy-path smoke checklist: `docs/SMOKE_CHECKLIST.md`

## Phase 3
- Demo deploy on Vercel (done)
- Durable store via Neon / `JsonStore` (done)
- Email magic-link login (Resend) (done)
- Custom domain / email-from your domain (later)

## Wave 4 (done)
- Settings: wedding name, couple names, date, city
- Dashboard countdown + your wedding name
- People: email invite links via Resend
- Budget: categories, cap, actuals, delete
- Legal: add items, due dates, push open items to Timeline
