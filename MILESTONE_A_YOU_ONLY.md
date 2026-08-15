# Milestone A — What you do (short)

Most of the code is already written in the repo. You only need accounts + a few commands.

## 1. Free Postgres (about 5 minutes)

1. Open https://neon.tech and sign up
2. Create a project
3. Copy the connection string (starts with `postgresql://`)

## 2. Free email API (about 5 minutes)

1. Open https://resend.com and sign up
2. Create an API key
3. Copy the key (starts with `re_`)

## 3. Run these commands

```bash
cd web
cp .env.example .env.local
```

Open `.env.local` and set:

- `DATABASE_URL` = your Neon URL
- `RESEND_API_KEY` = your Resend key
- `AUTH_SECRET` = run this in terminal and paste: `openssl rand -base64 32`

Then:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init_milestone_a
npm run dev
```

Open http://localhost:3000 — demo login still works (`DEMO_AUTH=1`).

## 4. Turn on real sign-in (when ready)

In `.env.local` change:

```bash
DATA_BACKEND=prisma
DEMO_AUTH=0
```

Restart `npm run dev`, go to `/login`, enter your email, open the magic link.

---

That’s it. You do **not** need to write Auth or database code yourself.

If `npm install` or migrate fails, keep using the demo with `DEMO_AUTH=1` and `DATA_BACKEND=file` until those two accounts work.
