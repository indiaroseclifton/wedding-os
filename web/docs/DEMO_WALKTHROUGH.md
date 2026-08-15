# Demo walkthrough (Milestone A happy path)

**Goal:** Prove the collaboration core end-to-end in about 10 minutes.

## Prerequisites

```bash
cd web
npm install
npm run dev
```

Sign in as **Alex** or **Jordan** (`DEMO_AUTH=1`).

## Path

1. **Dashboard** → **Load sample data**  
   Creates decisions, guests (with dietary notes), tables, vendors, payments, music, tasks, draft DJ package.

2. **Decisions**  
   Priorities decided; style exploring. Optional: **Follow-up task**.

3. **Guests** → **Dietary**  
   RSVP filters, bulk select. Dietary rollup for catering.

4. **Handoffs → New → Catering**  
   Prefill on → headcount + dietary from guests. Share link or Download .txt.

5. **Music** → **Handoffs → DJ**  
   Prefill from music must-play / do-not-play.

6. **People** → invite link or **Party view**  
   Party portal: tasks, attire, day-of.

7. **Day-of**  
   Check-ins + updates.

## What “done” looks like for Milestone A

- Couple workspace with shared tasks and decisions  
- Guest list that feeds catering handoff  
- Music that feeds DJ handoff  
- Party can participate without the full couple UI  

## Phase 2 (later)

Deeper modules: 3D seating, e-sign contracts, AI media, full multi-event budgets, production auth, Neon as default.
