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

## Wave 18 (done)
- Contract review on the vendor: signed date, refundable, named lead, hours, overtime, delivery, COI
- Nine clauses marked Looks good / Flag / Skip
- Flag count on My vendors

## Wave 19 (done)
- Home is This week: overdue money, RSVPs, addresses, contract flags, ROS holes, DIY day-beats, checklist
- Nav label: This week

## Wave 20 (done)
- Phone shell: sticky header, slide-over menu, bottom tabs (Week / Guests / Vendors / DIY / Day-of)
- Safe-area padding; guest site less top-heavy on small screens

## Wave 21 (done)
- Paper + ink + moss brand: Fraunces + Source Sans 3
- Warm paper canvas; moss primary on login, This week, guest RSVP
- Slate remapped so the rest of the rooms follow

## Wave 22 (done)
- Spotify: search, add to must-play, OAuth, export/update playlist, DJ handoff gets the link
- NWS forecast pull on day-of (US cities)
- Integrations page lists Apple Music, Calendar, Places, Drive, Stripe, registry (next / link-only)

## Wave 23 (done)
- Apple Music: catalog search, MusicKit connect, export library playlist, DJ handoff link

## Wave 24 (done)
- Gathered-garden visual system: landing, login photo, guest hero, DIY photos, empty states

## Wave 25 (done)
- Motion on landing, This week, DIY, and guest site (reduced-motion respected)

## Wave 26 (done)
- Modern product skin: Geist, cool paper, photos as crops, serif only on the guest site

## Wave 27 (done)
- Landing shows a live This week preview. ⌘K jumps rooms / guests / vendors

## Wave 28 (done)
- Cinematic landing, login, and This week — atmosphere + huge type, lists still work

## Wave 29 (done)
- One `.glass` token: landing week, login, This week caption, ⌘K. Reduced transparency respected

## Wave 30 (done)
- Personalized This week (names, city, their cover). Developer sitemap replaced with visual rooms

