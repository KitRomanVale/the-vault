# The Vault — The Friendly Guide 🔒

*A step-by-step guide for setting up and using The Vault, written for people who don't consider themselves "tech people." No experience needed. Every step spelled out.*

---

## What is this, and what will I end up with?

The Vault is a gentle project tracker. It keeps everything you're making — writing, crafts, code, tiny gardens — in one place, so you never forget a project exists. It's built for brains that juggle lots of ideas: you tell it how much energy you have, and it helps you pick something to work on. It celebrates when you finish things. It never nags.

When you're done with this guide you'll have:

1. **The Vault running in your browser** — and on your phone's home screen like a real app
2. *(Optional)* **Sync between your devices** — phone and computer sharing one vault
3. *(Optional)* **An AI assistant connected to it** — so you can say "log some progress on my story" in a chat

You only need Part 1 to get the app running. Part 2 shows you how to use it. Parts 3 and 4 are optional extras you can add later — or never. The app works perfectly without them.

**What it costs:** nothing. The app is free, and the optional sync runs on Cloudflare's free tier, which is thousands of times more capacity than one person can use.

**A word on privacy:** The Vault has no account system and no tracking. Your projects are stored in your own browser. If you set up sync, they're stored in *your own* Cloudflare account — nobody else's. Your Vault's web address is technically public, so anyone who knows the exact address can open the empty app, but your project data is not stored in that website unless you choose to turn on sync.

---

## Part 1: Getting the app running

You have two options. Option A takes one minute and is fine for trying it out. Option B takes about fifteen minutes and is the "real" setup — it gives you a web address you can open on your phone and add to your home screen.

### Option A: Just open the file (quickest)

1. Download the app files: on the GitHub page, click the green **Code** button, then **Download ZIP**
2. Extract the downloaded file:
   - **Windows:** right-click the ZIP, choose **Extract All**, then click **Extract**
   - **Mac:** double-click the ZIP
3. Open the extracted folder, find **`the-vault.html`**, and double-click it

That's it — the app opens in your browser, with a few example projects to play with. Your data saves automatically inside that browser on that computer.

**Limitations of this option:** it only exists on this one computer, in this one browser, and you can't put it on your phone's home screen. That's what Option B fixes.

### Option B: Put it on the web with Cloudflare Pages (recommended)

This gives your Vault a real web address, hosted for free on your own Cloudflare account. Your Vault's web address is technically public: anyone who knows the exact address can open the empty app. Your project data *isn't stored on the website itself*, though — it stays in your browser unless you choose to turn on sync.

**Step 1 — Make a Cloudflare account.** Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) and sign up with your email. The free plan is all you need — you don't have to enter payment details.

**Step 2 — Prepare a folder to upload.** On your computer, make a new empty folder anywhere (your Desktop is fine). Call it whatever you like, e.g. `vault-upload`. From the repository you downloaded, copy these files into it:

- `the-vault.html` — then **rename this copy to `index.html`** (this is important — websites look for a file with exactly this name)
- `manifest.json`
- `icon-180.png`, `icon-192.png`, `icon-512.png`
- `logo-header.png`

To rename it:

- **Windows:** look carefully at the filename. If it appears as **`the-vault.html`**, rename it to **`index.html`**. If it appears as only **`the-vault`**, rename it to **`index`** — Windows is hiding the `.html` ending and will keep it automatically. Click the file once, press F2, type the new name, and press Enter. If Windows asks whether you're sure you want to change the extension, choose **Yes**.
- **Mac:** click **`the-vault.html`** once, press Return, rename it to **`index.html`**, then press Return again.

**Step 3 — Upload it.** In the Cloudflare dashboard:

1. In the left sidebar, click **Workers & Pages**
2. Click **Create**, then choose the **Pages** tab
3. Choose **Upload assets** (sometimes labeled "Direct Upload")
4. Give your project a name — this becomes part of your web address, so something like `my-vault` gives you `my-vault.pages.dev`. If the name is taken, Cloudflare adds a few random letters, which is fine.
5. Drag your `vault-upload` folder into the upload box (or click to browse and select it)
6. Click **Deploy site**

After a few seconds you'll get your address, something like `https://my-vault-abc.pages.dev`. Open it — that's your Vault, live. Bookmark it.

**Updating later:** when a new version of The Vault comes out, repeat steps 2 and 3 with the new files — go to your Pages project and click **Create new deployment**. Your data is never affected by updates (it doesn't live on the website).

### Putting it on your phone's home screen

Open your Vault's address in your phone's browser, then:

- **iPhone (Safari):** tap the Share button (the square with an arrow), scroll down, tap **Add to Home Screen**, tap **Add**
- **Android (Chrome):** tap the three-dot menu, tap **Add to home screen** (on some phones it says **Install app**), confirm

You'll get a proper app icon, and it opens full-screen like a real app — no browser bars.

---

## Part 2: Using the app

### Adding a project

Tap **+ New project**. You'll be asked:

- **What is it?** — the name. The only required field.
- **A line about it** *(optional)* — a short description
- **Why this matters** *(optional)* — what this project gives you. This shows on the card in quiet italics. It's there for the days motivation dips and you need to remember why you started.
- **Next tiny step** *(optional)* — the one small thing you'd do next. Not a plan, not a commitment — just a door left ajar. It shows on the card as "→ do this."
- **How does it work?** — two flavors of project:
  - **Open-ended**: for ongoing things (a craft, a habit, a garden). You get a **"Worked on it"** button that keeps a running count of every time you show up.
  - **Stepped**: for projects with distinct stages. You get a checklist and a progress bar.
- **Energy it needs** — 🌙 Low spoons / ⚡ Medium / 🔥 High energy. Be honest about what the project *demands*, and later you can filter by what you've *got*.
- **Where's it at?** — Idea (someday), Active (in motion), or Resting (deliberately paused — resting is allowed and honorable)

### The buttons on each project card

- **Worked on it** *(open-ended projects)* — marks the project as touched today and adds one to its flame count. If it was an Idea or Resting, it moves to Active.
- **Steps** *(stepped projects)* — opens the checklist. Type a step and press Enter to add one; tap the box to check it off. When you check the last one, the app asks if you want to mark the whole project finished.
- **Pick up** — marks the project as touched today without increasing the flame count or writing a log. If it was an Idea or Resting, it moves to Active. *"I looked at it, it's alive."*
- **Log** — write a one-line journal note about what you did. *"Wrote 200 words." "Untangled the yarn." "Opened it and stared — still counts."* Your logs appear under "Recent logs" on the card, where you can also edit ✎ or delete ✕ them.
- **Finish** — marks it done. It moves to the Finished shelf at the bottom (from where you can always reopen it).
- **✎ / 🗑** — edit or delete the project. Deleting gives you a 10-second Undo bar, so a misclick is never fatal.

### Finding and arranging things

- **Search box** — filters by title and description as you type
- **Status chips** (Idea / Active / Resting) — tap to show only that status; tap again to turn off
- **Energy chips** (🌙 / ⚡ / 🔥) — "show me only what fits my current energy"
- **Manual / Recent / Neglected** — sorting. *Manual* is your own order; *Recent* puts the most recently touched first; *Neglected* puts the longest-forgotten first (a kind way to check on sleeping projects).
- **Reordering** — in Manual sort, drag the dotted handle (⠿) next to a title to move a project, or use the ∧ / ∨ arrows to nudge it one spot

### "Pick for me" — when deciding is the hard part

Tap **Pick for me** at the top. Tell it how much you have in the tank (low / medium / high), or tap **Surprise me**. It hands you *one* project — no list, no choosing — and if that project has a next step, it tells you exactly where to start: *"Start here: rough outline."* Tap **Start this one** and go.

### Celebrations 🎉

When you pick up a project, log progress, check off a step, or finish something, a short encouraging quote appears in the middle of the screen. Tap anywhere to dismiss it, or let it disappear on its own. If that's not your thing, tap the **⋯** button and switch **Celebrations** off. (This is remembered per device.)

### Backups

Tap **⋯ → Backup** to download your entire vault as a single file (`the-vault-backup-YYYY-MM-DD.json`). Keep it wherever you keep files you care about. **⋯ → Restore** loads one back in — restoring *merges* with what's there (nothing silently disappears), and the restored file's version of a project wins if both exist.

Even if you use sync, an occasional backup file is a nice belt-and-braces habit.

> **You're done.** Everything below this is optional. Your Vault is already fully usable, and you can come back for sync or AI setup whenever you feel ready.

---

## Part 3: Sync between devices *(optional)*

Without sync, each device has its own separate vault. With sync, your phone and computer share one — edit on either, see it on both. This is the only part of the guide that uses the *terminal* (the type-commands-at-your-computer window). It's about 15 minutes, you only do it once, and every command is given to you to copy-paste.

### What you'll need

- A **Cloudflare account** (you have one from Part 1 Option B — if not, sign up now, it's free)
- **Node.js** — a free program that lets your computer run the setup commands. Get it at [nodejs.org](https://nodejs.org): download the big green **LTS** version and install it like any other program, accepting all the defaults.

### Opening a terminal

- **Windows:** press the Windows key, type `powershell`, press Enter. A blue-ish window with white text appears — that's it.
- **Mac:** press Cmd+Space, type `terminal`, press Enter.

You type (or paste) commands at the blinking cursor and press Enter to run them. To paste: right-click in PowerShell, or Cmd+V on Mac.

### Step by step

**1. Go to the worker folder.** In the terminal, type `cd ` (with a space after it), then drag the `vault-worker` folder from the repository onto the terminal window — it fills in the path for you. Press Enter. (Or type the path yourself, in quotes, e.g. `cd "C:\Users\you\Downloads\the-vault\vault-worker"`.)

**2. Install the worker's dependencies:**

```
npm install
```

Lines of text will scroll by for a minute. Warnings are normal. You're fine as long as it ends without the word ERROR in red.

**3. Log in to Cloudflare:**

```
npx wrangler login
```

Your browser opens a Cloudflare page — click **Allow**. Back in the terminal, it should say you're logged in.

**4. Create the storage space** (a small key-value store in your Cloudflare account where the synced vault lives):

```
npx wrangler kv namespace create VAULT_KV
```

The response includes something like:

```
{ "binding": "VAULT_KV", "id": "a1b2c3d4e5f6..." }
```

**Copy that long `id` value** — you need it in the next step.

**5. Put your id in the config file.** In the `vault-worker` folder, open the file **`wrangler.jsonc`** with a plain text editor (right-click → Open with → **Notepad** on Windows, **TextEdit** on Mac). You'll see a line like:

```
{ "binding": "VAULT_KV", "id": "d693c0e33afb4fb8963b3985f895ad6a" }
```

Replace the long id between the quotes with **your** id from step 4. While you're here, you can also change `"name": "vault-sync"` near the top to anything you like — it becomes part of your sync address. Save and close the file.

**6. Set your secret token.** This is the password that protects your synced data — anyone who has it can read your vault, so make it long and random. A password manager's generator is perfect; otherwise mash together 30+ random letters and numbers. Then run:

```
npx wrangler secret put AUTH_TOKEN
```

It asks for the value — paste your token and press Enter. **Note: the terminal won't display anything while you paste — that's a security feature, not a glitch.** Paste once and press Enter.

Keep the token somewhere safe (password manager, notes app you trust) — you'll paste it into the app on each device.

**7. Deploy:**

```
npx wrangler deploy
```

After ~20 seconds it prints your sync address, something like:

```
https://vault-sync.your-name.workers.dev
```

**Copy that address.** Setup done — you never need the terminal again (unless you update the worker someday).

### Connecting the app

On **each** device:

1. Open The Vault
2. Tap **⋯ → Sync** (it says "Set up sync")
3. Paste your **sync address** and your **token**
4. Tap **Connect**

The first device combines its projects with anything already in the sync store. Each later device merges its vault too. Projects that exist on only one device are kept. If the same project was changed on two devices, the most recently updated version wins. From then on it syncs automatically: instantly when you change something, and it quietly checks for other devices' changes every 25 seconds while open.

The ⋯ menu shows sync health at a glance: **"Synced 2m ago"** means all is well. **"Local changes waiting"** means it couldn't reach the server just now (bad wifi, etc.) — your changes are safe on the device and will sync on the next try, automatically.

---

## Part 4: Connecting an AI assistant *(optional, and genuinely optional)*

If you use an AI assistant that supports **MCP** (like Claude), you can let it see and update your vault — "what's in my vault?", "log that I wrote 300 words", "add a step to the garden project." It uses the same sync worker from Part 3, so finish that first.

In your assistant's connector/MCP settings, add a server with:

- **URL:** your sync address + `/mcp` — e.g. `https://vault-sync.your-name.workers.dev/mcp`
- **Authentication:** a header of `Authorization: Bearer YOUR-TOKEN` — or, if your assistant only accepts a plain URL, tack the token on like this: `https://...workers.dev/mcp?secret=YOUR-TOKEN`

Using the Authorization header is safer. Only put the token in the URL when the assistant offers no header option, because URLs may appear in browser history or service logs.

The assistant gets tools to list projects, view details, add projects, log progress, add/check steps, and mark things finished. It cannot delete projects — that stays a human-only power, in the app.

---

## Troubleshooting

**"My projects disappeared!"** — First: don't panic, and don't clear anything. Most likely you opened the app in a *different browser* or in private/incognito mode (each browser keeps its own separate storage). Open it in the browser you normally use. If you use sync, connecting sync on the "empty" browser will pull everything back. If you have a backup file, ⋯ → Restore brings it home.

**The sync button says "Local changes waiting"** — the app couldn't reach your sync worker just now. Your data is safe on the device. Check your internet; it retries automatically. If it persists for days, re-check that your worker address is right (⋯ → Sync).

**`npm` or `npx` says "not recognized" in the terminal** — Node.js isn't installed (or the terminal was open during the install). Install Node.js from [nodejs.org](https://nodejs.org), then close and reopen the terminal.

**`wrangler login` fails with a weird error** — occasionally Cloudflare's login hiccups. Wait ten minutes and try again. Persisting? Log in at dash.cloudflare.com in your browser first, then retry.

**The celebration didn't appear when I finished something** — check ⋯ → Celebrations is set to **On**. (Or enjoy the silence — that's what the toggle is for.)

**I updated the website but see the old version** — your browser cached it. Refresh hard: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac). On a phone, close the app fully and reopen.

**I want to start completely fresh** — your data lives in the browser's storage for the site. Clearing the browser's site data for your Vault address resets it (and remember it may sync back from other devices — disconnect sync first if you truly want a clean slate).

---

Made with care by Kit & Roman Vale, July 2026 🖤
*For the people who make things and forget they made them.*

📜 License & copyright

The Vault's **source code** is released under the [MIT License](LICENSE). You may use, copy, modify, and distribute the code — including for commercial purposes — as long as the original copyright and license notice are kept with it.

The software is provided **“as is”**, without warranty of any kind.

**Copyright © 2026 Kit Vale. All rights reserved for The Vault name, logo, original artwork, and written content.** These brand and creative assets are not included in the MIT License and may not be reused without permission.