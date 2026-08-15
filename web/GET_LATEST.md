# Get the latest code on your Mac

```bash
cd ~/Documents/wedding-os-fresh
git pull
cd web
npm install
npm run dev
```

If that folder is missing:

```bash
cd ~/Documents
git clone https://github.com/indiaroseclifton/wedding-os.git wedding-os-fresh
cd wedding-os-fresh/web
cp ../.env .env 2>/dev/null || true
npm install
DEMO_AUTH=1 npm run dev
```

## This pull — P0 hardening

- Settings → **Reset sample data** (confirm, wipe, reseed)
- Payments stay linked to a vendor (`vendorId`)
- Handoff refresh asks before overwrite + shows last-refreshed
- Smoke checklist: `web/docs/SMOKE_CHECKLIST.md`

## Upload progress

- [x] Login + dashboard shell
- [x] Phase 1 collaboration core
- [x] Phase 2 Waves 1–3
- [x] P0 hardening
- [ ] Phase 3 — Neon / real auth / deploy
