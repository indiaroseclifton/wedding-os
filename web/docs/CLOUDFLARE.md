# Cloudflare preview (v2)

Vercel stays on production. This is the working preview so a push to `v2` updates a public URL.

Do this once. After that, every push to `v2` rebuilds. No download.

## Connect the repo (do this in the browser)

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages** → **Create** → **Import a repository**.
3. GitHub: `indiaroseclifton/wedding-os`.
4. Settings:
   - Project name: `vowfolk-v2`
   - Production branch: `v2`
   - Root directory: `web`
   - Build command: `npx @opennextjs/cloudflare build`
   - Deploy command: `npx @opennextjs/cloudflare deploy`
5. Environment variables:
   - `DEMO_AUTH` = `1`
   - `DATA_BACKEND` = `file`
6. Save. First build takes a few minutes.

The URL will look like:

`https://vowfolk-v2.<your-subdomain>.workers.dev`

Floor Planner:

`https://vowfolk-v2.<your-subdomain>.workers.dev/studio/floor-planner`

## After that

Push to `v2`. Refresh the Workers URL. That is the loop.

File data on Workers is throwaway. Fine for looking at the build. Not for real guest lists.
