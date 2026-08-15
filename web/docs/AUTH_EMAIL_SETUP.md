# Email login (Resend)

Demo buttons (Alex / Jordan) stay on the sign-in page.

## One-time setup

1. In [Resend API Keys](https://resend.com/api-keys), create a key and copy it.
2. In the Vercel project → Settings → Environment Variables, add:

```bash
RESEND_API_KEY=re_...
AUTH_SECRET=generate-a-long-random-string
AUTH_URL=https://wedding-os-taupe.vercel.app
EMAIL_FROM="Wedding OS <onboarding@resend.dev>"
```

3. Redeploy (or push any commit). Until a custom domain is verified in Resend, mail only delivers to the email on the Resend account.

Keep `DEMO_AUTH=1` so the demo buttons still work.

When you want email-only login later:

```bash
DEMO_AUTH=0
```

<!-- redeploy: pick up RESEND_API_KEY -->
