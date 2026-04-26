# HANDOFF — Cowork → Claude Code

**Date:** 2026-04-26 evening
**From:** Cowork session(寫 narrative + scaffold + build.md)
**To:** Claude Code on Mark's Windows machine(執行 auth-bound 步驟)
**Goal:** 把 `showcase-002-routines-fleet` 從 local scaffold 變成 `https://routines-fleet.aipm.com.tw` 上線

---

## 你接手時的狀態

✅ **已完成(Cowork 已做):**
- `../SUBMISSION.md` 寫好(5/7 送件 narrative 主稿)
- 這個資料夾(`showcase-002-routines-fleet/`)scaffold 完成
  - `package.json` / `next.config.ts` / `tsconfig.json` / `postcss.config.mjs` / `.gitignore` / `.env.example` / `AGENTS.md`
  - `src/app/layout.tsx` / `src/app/page.tsx` / `src/app/globals.css`
  - `src/lib/supabase.ts`(含 `PROJECT_DIRECTORY` 常數,003 + 004 的 URL mapping)
  - `README.md`(public-facing)
  - `build.md`(17 節 paste-and-run · 你要執行的就是這個)
- 舊 `../showcase-002-routines/README.md` 加上 `SUPERSEDED` header

⚠️ **未驗證(Cowork sandbox 跑不動):**
- `npm install` + `npm run build` 沒有在 Cowork sandbox 完成(Linux mount + Windows 權限互戕,且每次 install 超出 45s timeout)。**這是你的第一個任務**——build.md §4。

❌ **未執行(需要你的 auth):**
- gh repo create + push
- vercel link / env / deploy
- DNS 綁 `routines-fleet.aipm.com.tw`
- 003 / 004 加 nav link(可選 §12)

---

## Mark 怎麼讓 Claude Code 接手

### Step 1 — 開新 Claude Code session 在這個資料夾

在 Windows 終端機(PowerShell 或 Git Bash):

```bash
cd C:\Users\mark\Documents\showcases\showcase-002-routines-fleet
claude
```

(假設 `claude` CLI 已裝。如果沒,`npm i -g @anthropic-ai/claude-code`。)

### Step 2 — 第一個 prompt(複製貼上)

```
Before anything else, read these three files in order:
  1. ../ai-2-ai/PROTOCOL.md            (workspace AI-to-AI comms rules)
  2. ../ai-2-ai/REGISTER.md            (who else is active)
  3. ../ai-2-ai/2026-04-26/01-cowork-to-any-greeting.md   (greeting from Cowork)

Then add YOUR row to ../ai-2-ai/REGISTER.md following PROTOCOL §6 format,
and ack the greeting by editing its frontmatter.

After that: read HANDOFF.md and build.md in this folder, then walk
build.md from §1 to §11 top-to-bottom. After each Checkpoint, say
"✓ Checkpoint N — <what you verified> — <elapsed>" before moving to
the next section. If anything fails, stop and tell me what failed;
do not skip ahead.

Anon key for §3: I'll paste it when you reach §3 — wait for me there.

Authoritative inputs: package.json, src/, AGENTS.md, build.md.
Don't invent new files; don't change existing scaffold.

When you finish §11, write a reply at
../ai-2-ai/2026-04-26/02-<your-runtime>-to-cowork-fleet-deployed.md
with the live URL, §11 checks, and any gotchas worth feeding back to
build.md §13.
```

### Step 3 — 在 §3 把 Supabase anon key 給它

Claude Code 跑到 §3 會停下來等你。打開 https://supabase.com/dashboard → `caotunspring's Org` → `showcases-shared` → Project Settings → API → 複製 **anon public** key,貼到對話視窗:

```
Anon key: eyJhbGc...<剩下的>
```

### Step 4 — 等它跑完 §1-§9

預計 5-8 分鐘。每個 checkpoint 都會回報。如果它在某個 checkpoint 卡住,問它「what's the actual error?」,通常 1-2 輪就解掉。

### Step 5 — DNS 你來

§10 有兩段:Vercel 那邊 Claude Code 會做(`vercel domains add` + `vercel alias set`),DNS provider(Cloudflare?)那邊**只有你能登入**,加 CNAME `routines-fleet → cname.vercel-dns.com`。

DNS propagate 1-5 分鐘後叫 Claude Code 跑 §10c / §10d 的 `dig` + `curl`。

### Step 6 — §11 最終驗證

7 個 check 全綠就是 done。

### Step 7 —(可選)§12 加 nav link 到 003 / 004

風險最低的版本:**先跳過**。fleet 上線就夠送件用了。等 5/3 dress rehearsal 確認 fleet 穩才回頭加。

---

## 回到 Cowork(我)的時機

跑完 §11 以後,把 fleet URL 給我,我會:
- 更新 `../SUBMISSION.md` 把 4/27-28 那行標 done
- 開始 polish 3 頁 PDF 文案 + 90 秒影片分鏡
- 接續 4/29 polish 001-B 的 build.md

如果 §4 build 失敗,**馬上回來告訴我錯誤訊息**,我這裡修 scaffold,你再 pull。

如果 §10 DNS 卡住超過 30 分鐘,可能是 aipm.com.tw 的 DNS provider 設定問題;那種我這裡看不到後台,你需要直接在 provider UI 修。

---

## Claude Code 不該做的事

- ❌ 改 `../showcase-003-daily-news/` 或 `../showcase-004-daily-mfg-news/` 的任何 production code(§12 的 nav link 例外,且需要你顯式同意)
- ❌ 跑任何 routine / cron / write-path
- ❌ 在 Supabase 後台 alter schema、加 RLS policy、改 user role
- ❌ 把 service-role key 放進這個 repo(只用 anon key)
- ❌ 創新的 Supabase project(reuse `showcases-shared`,ref `vdjsjdkswhbtvpsmujlg`)
- ❌ 新增 `src/app/<其他路由>/` —— fleet 只有一頁

如果 Claude Code 提議偏離 build.md,叫它先讀 `AGENTS.md` 跟這份 HANDOFF.md。

---

## 一頁 cheat sheet(列印放手邊)

```
1. cd …/showcase-002-routines-fleet
2. (Windows 用 PowerShell 或 Git Bash 都行)
3. claude
4. 貼 Step 2 那段 prompt
5. §3 等它叫你貼 anon key
6. §10 DNS 你登 Cloudflare 加 CNAME
7. §11 7 個 check 全綠 → done
8. 回 Cowork 報 fleet URL
```
