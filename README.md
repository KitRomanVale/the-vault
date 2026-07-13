# The Vault 🔒

A gentle project tracker for brains that lose track of what they love.

Everything you're making — writing, crafts, code, tiny gardens — kept safe in one place so you never forget it exists. Built for ADHD-friendly workflows: pick projects by how much energy you have, break things into tiny steps, log even the smallest progress, and get a little celebration when you finish something.

No accounts. No tracking. Your data lives in your browser, optionally synced through your own Cloudflare account.

## Features

- **Energy-based filtering** — tag projects as low/medium/high energy, then ask "what can I do with the spoons I have right now?"
- **"Pick for me"** — can't decide? Let the app hand you one thing, with the actual next action to start on
- **Two project modes** — open-ended ("worked on it" streak counter) or stepped (checklist + progress bar)
- **Next tiny step** — an optional "just do this one small thing" field per project
- **"Why this matters"** — an optional mood field for when motivation dips
- **Progress logs** — one-line journal entries per project; even "opened it and stared" counts
- **Gentle celebrations** — encouraging toasts when you log/finish things (toggleable in the ⋯ menu)
- **Search, filters, and sorting** — by status, recently touched, or neglected longest
- **Drag-and-drop reordering** — works with mouse and touch
- **Cross-device sync** — optional, self-hosted on Cloudflare's free tier, with per-project conflict-safe merging
- **Backup/restore** — export and import your whole vault as a JSON file
- **PWA** — add to your phone's home screen, works offline
- **MCP server** — let an AI assistant read and update your vault (add projects, log progress, check off steps)

## Quick start (no sync)

The app is a single HTML file. Host `the-vault.html` anywhere static (Cloudflare Pages, GitHub Pages, Netlify…) along with `manifest.json` and the `icon-*.png` files, or just open it locally in a browser. Data persists in localStorage.

## Cross-device sync setup (optional)

Sync uses a small Cloudflare Worker + KV namespace in **your own** Cloudflare account (free tier is far more than enough for personal use).

Requirements: [Node.js](https://nodejs.org) 18+, a free [Cloudflare](https://dash.cloudflare.com) account.

```bash
cd vault-worker
npm install
npx wrangler login

# Create your KV namespace
npx wrangler kv namespace create VAULT_KV
# → copy the returned id into wrangler.jsonc, replacing the existing "id" value
# → also change "name" in wrangler.jsonc if you want a different worker URL

# Set your access token (make it long and random — it protects your data)
npx wrangler secret put AUTH_TOKEN

# Deploy
npx wrangler deploy
```

Then in the app: **⋯ menu → Sync**, paste your Worker URL (e.g. `https://vault-sync.<your-subdomain>.workers.dev`) and the same token, on every device you want synced.

Sync is local-first: your device's copy is the source of truth, the server is a mirror. Devices merge per-project (most recent edit per project wins), deletions propagate via tombstones, and the app polls quietly every 25 seconds while open.

## MCP server (AI assistant integration)

The Worker also exposes an [MCP](https://modelcontextprotocol.io) endpoint at `/mcp`, so AI assistants (Claude Desktop/Code, or anything MCP-compatible) can work with your vault: list projects, get details, add projects, log progress, add/check steps, and mark things finished.

Configure your MCP client with:

- **URL:** `https://<your-worker>.workers.dev/mcp`
- **Auth:** `Authorization: Bearer <your token>` header, or `?secret=<your token>` in the URL for clients that can't send custom headers

## Architecture

```
the-vault.html          Single-file React app (no build step)
manifest.json           PWA manifest
icon-*.png              App icons
logo-header.png         In-app header logo
vault-worker/           Cloudflare Worker: sync API + MCP server
  src/index.js          GET/PUT /vault (KV-backed) + /mcp endpoint
  wrangler.jsonc        Worker config — put your own KV namespace id here
```

Deliberate choices: no build step, no framework CLI, no database — one HTML file and one small Worker. The whole thing runs on Cloudflare's free tier.

## Costs

Free for personal use. Cloudflare's free tier includes 100k Worker requests/day and 100k KV reads/day; the app's 25-second polling uses roughly 4% of that per always-open device.
