# Happy-path smoke checklist

Run this after `git pull` + `cd web && npm run dev` (demo auth: Alex). About 10 minutes. Check each box.

## 0. Start

- [ ] Sign in as **Alex**
- [ ] Dashboard → **Load sample data** (first time) or skip if already seeded
- [ ] Dashboard shows decisions, tasks, and sample vendors — no error banner

## 1. Decisions → follow-up

- [ ] **Decisions** — Priorities is DECIDED; Style is EXPLORING
- [ ] Optional: **Follow-up task** on a decision → task appears on **Tasks**
- [ ] Optional: **Promote to timeline** → item appears on **Timeline**

## 2. Guests + dietary

- [ ] **Guests** lists 5 sample people (Sam, Riley, Morgan, parents, sister)
- [ ] Dietary notes visible (Vegetarian / Nut allergy / Gluten-free)
- [ ] **Dietary** rollup counts those notes for catering

## 3. Payments (vendor id)

- [ ] **Payments** — “Northside Venue” group with **Venue deposit $2,500**
- [ ] Add a payment by **selecting a vendor** from the list (not only typing the name)
- [ ] New row lands in that vendor’s group
- [ ] Mark the deposit **Paid** — paid date stamps; outstanding drops

## 4. Music → DJ handoff refresh

- [ ] **Music** shows must-play / do-not-play from seed
- [ ] **Handoffs** → open **DJ package (draft)**
- [ ] Click **Refresh from Music**
- [ ] Confirm dialog appears if sections already have text
- [ ] Must-play / do-not-play fill from Music
- [ ] **Last refreshed** stamp shows date/time + `from music`

## 5. Catering handoff

- [ ] **Handoffs → New → Catering** (prefill on)
- [ ] Headcount + dietary match **Guests**
- [ ] **Refresh from Guests** → confirm if needed → stamp `from guests`

## 6. Settings reset (P0)

- [ ] **Settings → Reset sample data**
- [ ] First click asks to confirm; Cancel leaves data alone
- [ ] Confirm → “Sample data reset”
- [ ] **Guests** is back to the original 5 (no duplicates)
- [ ] **Payments** still has one Northside Venue deposit
- [ ] **Handoffs** is back to the draft DJ package only

## 7. Party + day-of (spot check)

- [ ] **People / Party** portal loads (party role can see tasks / day-of)
- [ ] **Day-of** check-ins page loads

## Fail if

- Force-seed (without reset) created duplicate guests or vendors
- Reset did not wipe (old extra rows still there)
- Payment grouped only by typed name after a vendor rename
- Refresh overwrote sections with **no** confirm when they had text
- Refresh succeeded but no last-refreshed stamp

## After a clean pass

Phase 1 + 2 happy path is green. Safe to start **Phase 3** (Neon / real auth / deploy).
