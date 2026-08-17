# Happy-path smoke checklist

Sign in as Alex. About 10 minutes. The live door for vendors is **Send**, not Handoffs.

## 0. Start

- [ ] Sign in as **Alex**
- [ ] Dashboard → **Load sample data** (first time) or skip if already seeded
- [ ] Dashboard shows the week and sample vendors — no error banner

## 1. Vision

- [ ] **Planning → My vision** — walk or pin one picture
- [ ] Set a cover. Save.
- [ ] Board → **Make the link**. Open `/b/…`. The picture is there.

## 2. Guests + kitchen

- [ ] **Guests** lists the sample people
- [ ] Holding and plates both show, and they are not the same number if someone said no
- [ ] **Dietary** plates match the guest list
- [ ] Add one guest from **Add one** — the form looks like Settings, not a white CMS card

## 3. Guest site

- [ ] **Guest site** header says “Open guest page”, not Preview
- [ ] Open it. Hero is the Vision cover, not the desk photo
- [ ] If shape is Just us, RSVP is off

## 4. Send (the packet)

- [ ] **Vendors → Send** — booked vendors (including anyone marked Hired) are ready to send
- [ ] Open a florist or venue. **Make their link** (or Send packet if mail is on)
- [ ] Copy the `/v/…` link. Open it signed out. Packet loads.
- [ ] If mail is off, the button does not claim it emailed anyone

## 5. Payments

- [ ] **Payments** — venue deposit exists
- [ ] Add a payment by **selecting a vendor**
- [ ] Mark **Paid** — outstanding drops

## 6. Settings reset

- [ ] **Settings → Reset sample data**
- [ ] Cancel leaves data alone
- [ ] Confirm → guests back to the original sample

## 7. After + party

- [ ] **After** loads the 90-day clock
- [ ] **People** invite creates a **copyable** link even if email is off

## Fail if

- Send treats a Start vendor as “still shopping”
- Preview / Open guest page 404s for the couple
- A Send button says “Sent” when Resend is not connected
- Guest site hero is the Settings desk photo
- Add guest is a white `bg-white` / `bg-slate-900` form
- Moodboard or Floorplan still appear as real nav items (they are redirects)

## After a clean pass

The walkthrough does not lie. Safe to keep building Phase 2 (site editor as a letter, phone seating).
