# One-time setup (then only git pull)

You should not need to Download ZIP every time.

## 1. Create a GitHub access token (once)

1. Open https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Name: `wedding-os-mac`
4. Expiration: 90 days (or longer)
5. Check scope: **repo**
6. Generate and **copy the token** (starts with `ghp_`)

## 2. Clone the repo (once)

In Terminal:

```bash
cd ~/Documents
git clone https://github.com/indiaroseclifton/wedding-os.git
cd wedding-os/web
```

When asked for username: `indiaroseclifton`  
When asked for password: **paste the token** (not your Apple password)

## 3. Copy your env (once)

```bash
# from wherever your working .env is now
cp ~/Downloads/wedding-os-main/web/.env ~/Documents/wedding-os/web/.env
cp ~/Documents/wedding-os/web/.env ~/Documents/wedding-os/web/.env.local
```

Adjust paths if your folders differ.

```bash
npm install
npm run dev
```

## 4. Every time new code is uploaded

```bash
cd ~/Documents/wedding-os
git pull
cd web
npm install
npm run dev
```

That is it. No more ZIP downloads.

## If git pull asks for a password again

Use the same token, or save it in Keychain when macOS offers.
