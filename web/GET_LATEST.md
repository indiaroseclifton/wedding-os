# Get the latest code on your Mac

1. Stop the server (Ctrl+C in Terminal)
2. Download ZIP from https://github.com/indiaroseclifton/wedding-os
3. Unzip to Downloads
4. Copy your .env into the new web folder:
   `cp /path/to/old/web/.env /path/to/new/web/.env`
5. `cd` into the new `web` folder
6. `npm install && npm run dev`

## Upload progress

- [x] Login + dashboard shell
- [x] Prisma schema + migrate support
- [x] Validation / handoff labels
- [ ] Full data store (store.ts) — in progress
- [ ] Guests, seating, tasks, decisions pages — in progress

Re-download after each batch when I say a batch is ready.
