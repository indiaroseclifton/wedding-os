# Upload status — P0 hardening on main

## On GitHub now
- Login (demo)
- Dashboard + sample seed
- Tasks, guests, seating, vendors, handoffs, decisions
- Budget, music, notes, payments, traditions, events, day-of
- Neon / Prisma schema (not the runtime store yet)

## P0 (this pull)
- Settings: Reset sample data (wipe `.data` + reseed)
- Payments: `vendorId` + name fallback
- Handoffs: refresh confirm + last-refreshed stamp
- `web/docs/SMOKE_CHECKLIST.md`

## Not in this demo slice
- Live polls with ranked voting UI
- Full AR/3D floor plan
- Production Auth.js email magic links
- Phase 3 Neon as the default store

## Update on Mac
```bash
cd ~/Documents/wedding-os-fresh
git pull
cd web
npm install
npm run dev
```
