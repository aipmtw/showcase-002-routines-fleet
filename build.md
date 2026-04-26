# showcase-002-routines-fleet — Full Build Manual

**Target:** zero → live fleet dashboard at `routines-fleet.aipm.com.tw` (Vercel + shared Supabase, read-only).
**Target time:** ~5 minutes if Supabase env in hand · ~10 minutes from cold (incl. anon-key copy from Supabase dashboard).
**Authoring protocol:** inherits `../spec/001/build-md-authoring.md` — snapshot-before-revise, no-magic-string grep, idempotent blocks, positive-confirmation loops.
**Sibling of:** `../showcase-003-daily-news/build.md` (same Vercel + Supabase shape, but read-only and single page).

## Changelog

- **2026-04-26** — initial draft. Scaffolded by Cowork session; this manual is what Claude Code on Mark's machine executes to take it live.

---

## 0. Product at a glance

**`https://routines-fleet.aipm.com.tw`** (custom) / **`showcase-002-routines-fleet.vercel.app`** (Vercel default)
Top-of-fold: 003 + 004 兩條 30-day timeline,每點一個方塊代表一次 routine run,綠/琥珀/紅/藍對應 status。
Below: 三張 leg cards(Reliability / Reproducibility / Observability sibling)。
Data: shared Supabase Postgres (`showcases-shared`, ref `vdjsjdkswhbtvpsmujlg`),anon-key 唯讀。
Automation: 無——這個 repo **本身不跑 routine**,只是讀其他 showcase 的 `routine_runs`。

---

## 1. Pre-flight verification

Run on Mark's machine. Each block must succeed before moving on.

```bash
# 1a — Node 20+ and npm
node --version    # v20.x or higher
npm --version

# 1b — gh CLI authed as the right account
gh auth status    # should show: caotunspring (or aipmtw) · github.com
# If wrong account, run:  gh auth login

# 1c — vercel CLI installed (npm i -g vercel if missing)
npx vercel --version

# 1d — git identity matches
git config user.email   # caotunspring@gmail.com or mark@aipm.com.tw
git config user.name

# 1e — current working directory is THIS repo
pwd                # …/Documents/showcases/showcase-002-routines-fleet
ls package.json    # must exist
```

**Checkpoint 1:** all five blocks return without error → proceed.

---

## 2. Resource naming (decisions to lock first)

| Slot | Value | Why |
|---|---|---|
| GitHub org | `aipmtw` | matches 003/001-B; public submission repo |
| GitHub repo | `showcase-002-routines-fleet` | matches local folder; public visibility |
| Vercel project | `showcase-002-routines-fleet` | matches repo |
| Custom domain | `routines-fleet.aipm.com.tw` | DNS at aipm.com.tw provider |
| Supabase project | `showcases-shared` (ref `vdjsjdkswhbtvpsmujlg`) | reuse — DO NOT create a new project |
| Supabase access | anon key only · `routine_runs` `select using (true)` already set | no new SQL, no new RLS |

**Checkpoint 2:** all values agreed → proceed.

---

## 3. Fetch Supabase anon key (one-time, manual)

Fleet only needs the anon key. **Do NOT touch service-role key.**

1. Open https://supabase.com/dashboard → log in
2. Select the `caotunspring's Org` → `showcases-shared` project (ref starts with `vdjsjdkswhbtvpsmujlg`)
3. Project Settings → API
4. Copy the **anon public** key (starts with `eyJ…`)
5. Have it on clipboard for §7

**Verify the key reads correctly** (optional but recommended):

```bash
ANON="<paste anon key here>"
curl -s "https://vdjsjdkswhbtvpsmujlg.supabase.co/rest/v1/routine_runs?select=project,run_id,status&limit=3" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" | head
# Expected: a JSON array with 3 row objects, each with project / run_id / status keys
```

**Checkpoint 3:** anon key returns 3 rows (or empty array if no runs yet — also acceptable) → proceed.

---

## 4. Local scaffold sanity check

The repo is already scaffolded by the Cowork session. **Important first step on Windows:** if a partial `node_modules/` exists from the Cowork sandbox attempt, delete it before installing — the sandbox couldn't clean it up (Linux mount + Windows perms tangle), and a stale partial install causes ENOTEMPTY errors:

```powershell
# In PowerShell (Windows):
Remove-Item -Recurse -Force node_modules, package-lock.json, .next -ErrorAction SilentlyContinue
```

Or in Git Bash:

```bash
rm -rf node_modules package-lock.json .next
```

Then verify and install:

```bash
# 4a — file inventory (none should be missing)
ls package.json next.config.ts tsconfig.json postcss.config.mjs .gitignore .env.example AGENTS.md README.md build.md
ls src/app/layout.tsx src/app/page.tsx src/app/globals.css src/lib/supabase.ts

# 4b — install
npm install --no-audit --no-fund

# 4c — build (without env — should succeed with amber-warning empty state)
npm run build
# Expected: "✓ Compiled successfully" then "○ /" routed
```

**Checkpoint 4:** `npm run build` exits 0 → proceed. **This is the single most important checkpoint** — nothing in §5+ matters if the build doesn't compile, since Cowork couldn't run it before handoff.

---

## 5. Git init + first commit + push

```bash
# 5a — git init (only if .git missing)
[ -d .git ] || git init -b main

# 5b — stage everything except node_modules / .next (covered by .gitignore)
git add .
git status --short    # eyeball — should NOT include node_modules/ or .next/ or .env.local

# 5c — first commit
git commit -m "init: showcase-002-routines-fleet · zero-to-live scaffold

Single read-only page reading routine_runs across all sibling
showcases (003, 004, future). Companion to:
- showcase-003-daily-news (reliability)
- showcase-001-genesis-daily-news (reproducibility)

This is the observability leg of the 5/7 AIA submission."

# 5d — create remote + push
gh repo create aipmtw/showcase-002-routines-fleet --public --source=. --remote=origin --push
```

**Checkpoint 5:** `gh repo view aipmtw/showcase-002-routines-fleet --web` opens the new public repo with files visible → proceed.

---

## 6. Vercel link

```bash
# 6a — link this folder to a NEW Vercel project (don't reuse 003/004's project)
npx vercel link --yes --project showcase-002-routines-fleet
# If prompted "Which scope?" pick the same Vercel team that hosts 003.
# If "Link to an existing project?" — answer NO, create new.
```

**Verify:**
```bash
cat .vercel/project.json    # must have projectId + orgId
```

**Checkpoint 6:** `.vercel/project.json` exists → proceed.

---

## 7. Push env vars to Vercel (3 environments)

Only 2 vars needed. Loop through production / preview / development.

```bash
# 7a — set anon key into a shell variable (paste from §3)
SUPABASE_URL="https://vdjsjdkswhbtvpsmujlg.supabase.co"
SUPABASE_ANON_KEY="<paste anon key from §3>"

# 7b — push to all 3 environments (idempotent: rm first, then add)
for env in production preview development; do
  for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY; do
    npx vercel env rm "$var" "$env" --yes 2>/dev/null || true
  done
  echo "$SUPABASE_URL"      | npx vercel env add NEXT_PUBLIC_SUPABASE_URL      "$env" >/dev/null
  echo "$SUPABASE_ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$env" >/dev/null
  echo "✓ env pushed to $env"
done
```

**Checkpoint 7:** see three `✓ env pushed to <env>` lines → proceed.

---

## 8. First production deploy

```bash
npx vercel deploy --prod
# Wait ~25-40s. The output shows the Vercel-generated URL like
# https://showcase-002-routines-fleet-<hash>.vercel.app
```

Capture the URL the CLI prints — call it `$DEPLOY_URL`.

```bash
DEPLOY_URL="<paste URL>"
```

**Checkpoint 8:** `npx vercel deploy --prod` exits 0 with a Production URL → proceed.

---

## 9. Smoke test

```bash
# 9a — homepage returns 200
curl -sI "$DEPLOY_URL" | head -1
# Expected: HTTP/2 200

# 9b — page contains the headline (proves SSR worked, not just empty shell)
curl -s "$DEPLOY_URL" | grep -c "看得見的 production scheduler"
# Expected: 1 (or higher)

# 9c — eyeball test
echo "Open in browser: $DEPLOY_URL"
```

In browser, confirm:

- [ ] Header reads "Routines Fleet"
- [ ] Two project cards visible: showcase-003-daily-news and showcase-004-daily-mfg-news
- [ ] Each project shows at least 1 colored dot (or "No runs in the last 30 days" if data is empty)
- [ ] Hover a dot → tooltip with date + status + items
- [ ] Click a dot → opens https://daily.aipm.com.tw/runs/<run_id> in new tab (or whichever sibling)
- [ ] No amber warning banner (if banner shows, env didn't propagate — go back to §7)

**Checkpoint 9:** all browser checks pass → proceed.

---

## 10. Custom domain — `routines-fleet.aipm.com.tw`

```bash
# 10a — register domain on Vercel (queues SSL cert provisioning)
npx vercel domains add routines-fleet.aipm.com.tw
# Output instructs: add CNAME at your DNS provider pointing to cname.vercel-dns.com

# 10b — alias the latest deploy to the new domain
npx vercel alias set "$DEPLOY_URL" routines-fleet.aipm.com.tw
```

**DNS work (manual, at aipm.com.tw provider — likely Cloudflare):**

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `routines-fleet` | `cname.vercel-dns.com` | DNS only (grey cloud) |

Wait 1-5 min for propagation, then:

```bash
# 10c — verify DNS resolves
dig +short routines-fleet.aipm.com.tw    # should return Vercel IP

# 10d — verify HTTPS
curl -sI https://routines-fleet.aipm.com.tw | head -1
# Expected: HTTP/2 200
```

**Checkpoint 10:** `https://routines-fleet.aipm.com.tw` returns 200 with the dashboard rendered → proceed.

---

## 11. Verification checklist (§E · 7 items)

Run all 7 in order, mark each green before declaring done:

```bash
# E.1 — public repo exists
gh repo view aipmtw/showcase-002-routines-fleet --json url,visibility

# E.2 — production deploy alive at default URL
curl -sI https://showcase-002-routines-fleet.vercel.app | head -1

# E.3 — custom domain alive
curl -sI https://routines-fleet.aipm.com.tw | head -1

# E.4 — page renders WITH live data (not empty state)
curl -s https://routines-fleet.aipm.com.tw | grep -E "showcase-(003|004)" | head -3

# E.5 — at least one outbound link to 003 daily news works
curl -sI https://daily.aipm.com.tw | head -1

# E.6 — at least one outbound link to 004 daily-mfg news works
curl -sI https://daily-mfg.aipm.com.tw | head -1

# E.7 — README on GitHub renders the three-leg table
gh browse README.md
# eyeball: the "三個 leg 的角色" table renders
```

**Checkpoint 11:** all 7 green → fleet is live. Update `../SUBMISSION.md` to mark 4/27-28 row as done.

---

## 12. Post-deploy: add "← all projects" nav link to 003 + 004

This is the **only edit to production code in 003/004 for this submission**. Keep it small and reversible.

For 003 (`../showcase-003-daily-news/`):

```tsx
// In src/app/layout.tsx <nav>, add as the LAST <Link>:
<a href="https://routines-fleet.aipm.com.tw" className="hover:text-slate-900 hover:underline underline-offset-4">
  ← all projects
</a>
```

Repeat verbatim in 004's layout. Commit each separately:

```bash
cd ../showcase-003-daily-news
# edit src/app/layout.tsx
git add src/app/layout.tsx
git commit -m "nav: link back to fleet at routines-fleet.aipm.com.tw"
git push

cd ../showcase-004-daily-mfg-news
# repeat
```

Vercel auto-deploys both within ~1 minute.

**Optional / risk-averse:** if you'd rather not touch 003/004 at all, skip §12 entirely. The fleet → 003/004 deep links still work; only the reverse path (003/004 → fleet) is missing. Submission narrative still holds.

---

## 13. Known gotchas

- **First build with no env can show the amber banner.** That's expected — Vercel's preview build runs `npm run build` BEFORE env push. After §7 + §8 a fresh deploy renders live data.
- **Anon key spilled into `git diff`?** Anon keys are designed to be public-readable; not a security incident. Still — rotate via Supabase dashboard if you want.
- **"No runs in last 30 days" on 003 row?** Means the cron didn't fire. Go check 003's `/runs/` page directly. fleet is just a window into truth.
- **`vercel env add` interactive prompt eats the value?** Some shells need the `echo "$VAR" | vercel env add` pattern shown in §7. If still fails, use Vercel dashboard UI manually (Project Settings → Environment Variables).

---

## 14. What's NOT in this manual

- Routine creation (this repo doesn't run a Routine — it just reads them)
- Schema migrations (uses 003's existing `routine_runs`)
- Auth (read-only public dashboard)
- Tests (single-page app, smoke + eyeball is sufficient)
- CI/CD (Vercel auto-deploys on push to main)

---

## 15. If you're a future Claude Code session rebuilding this

1. Walk this manual top-to-bottom
2. Add a `timing/<date>-rebuild.md` row per checkpoint
3. If something fails, capture the error in `evidence/<date>-issue-<n>.md` and fix forward — do not edit history
4. Last checkpoint should read: `Checkpoint 11 — all 7 green — XX min total`

The manual is the contract. If reality disagrees, fix the manual.
