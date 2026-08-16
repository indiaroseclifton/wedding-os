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

## Wave 5 (done)
- Master 12-month planning checklist (venues/photo first → thank-yous after)
- Travel: hotel blocks (courtesy vs guaranteed), airport/shuttle/honeymoon
- Registry links + gift log
- Thank-you tracker with import from gifts

## Wave 6 (done)
- DIY studio: flowers, table decor, signage, lighting playbooks
- Source comparison (grocery / wholesale / farm / florist / faux)
- Recipes, timeline, pitfalls, shopping list from table/guest counts

## Wave 7 (done)
- Vendor directory: browse / filter / profile / shortlist / compare / inquire / book
- Hire lands on My vendors and feeds payments + handoffs
- Demo Atlanta listings (fictional) — coordination remains the wedge

## Wave 8 (done)
- Guest wedding site + self-serve RSVP (name lookup, meal, dietary)
- Vendor portal: live headcount/dietary/music/vendor list + run of show
- Handoff templates for florist, planner, HMU, cake, transport, venue
- Hire vs DIY decision per category

## Wave 9 (done)
- Real inquiry email (copy to you; vendor if the address is real)
- Budget one-number: payments + DIY estimates + other lines
- DIY playbooks: cake, backdrop, favors, welcome bags; Atlanta flower sourcing
- Run of show by audience (couple / party / vendor / guests)

## Wave 16 (done)
- Guest mail: save-the-date, invite, RSVP nudge (10-day second), address nudge
- Household RSVP + custom questions + extra events on the guest site
- Address CSV import
- Floor-plan place cards; catering handoff lists extra events
- ROS rain plan, party assignee, vendor comments + confirm, “got it”
- Day-of packet print, DIY week-of beats + calendar + bar/cake-table
- Hire vs DIY on budget; vendor inquiry thread; shortlist compare

## Wave 17 (done)
- Directory inquire copies onto the vendor when you hire
- Listing shows messages you already sent
- Vendor thread: You / Them + Email again
