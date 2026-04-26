# showcase-002-routines-fleet

**AIA × Claude Code 送件作品 #2(observability leg)**
**Owner:** Mark Chen <mark@aipm.com.tw>
**Target GitHub:** `aipmtw/showcase-002-routines-fleet` (public)
**Live site:** `https://routines-fleet.aipm.com.tw`
**Companion to:**
- [`showcase-003-daily-news`](https://github.com/aipmtw/showcase-003-daily-news) — the live product (reliability leg)
- [`showcase-001-genesis-daily-news`](https://github.com/aipmtw/showcase-001-genesis-daily-news) — the build manual receipt (reproducibility leg)
- [`showcase-004-daily-mfg-news`](https://github.com/caotunspring/showcase-004-daily-mfg-news) — sibling vertical (proof the pattern transfers)

---

## 一句話

**Routines Fleet 是 003 / 004 / 任意未來 sibling 的 production scheduler 觀測台。** 一頁、一條 SQL、讀同一個 Supabase project,把所有 showcase 的 `routine_runs` 攤成兩條(或 N 條)時間軸。**評審打開這個 URL 是先看到「整個系統」,再 zoom in 看單一產品。**

## 這個 repo 不是

- **不是另一個產品。** 它不抓新聞、不寫 DB、不跑 LLM。它是**唯一一個 read-only 的 showcase**。
- **不是替代 003 的 `/runs/[id]`。** 那一頁是「單次 run zoom-in」;fleet 是「全 fleet × 30 天 zoom-out」。
- **不是 monitoring SaaS。** 沒有 alerting、沒有 SLO、沒有 PagerDuty。它只是**把多租戶 Supabase 的多樣性視覺化**。

## 這個 repo 是

- 一個 Next.js 16 server component,一頁 (`src/app/page.tsx`)
- 連同一個 `showcases-shared` Supabase project(ref `vdjsjdkswhbtvpsmujlg`),用 anon key 唯讀
- 一條 SQL:`select project, run_id, status, started_at, items_produced, news_date from routine_runs where started_at >= now() - 30d`
- 把每個 project 的 run 視覺化成一排小方塊,綠 = succeeded、琥珀 = degraded、紅 = failed、藍 = running
- 點任何一個方塊 → 跳到該 project domain 的 `/runs/[run_id]`

## 三個 leg 的角色

| | repo | URL | Frame |
|---|---|---|---|
| **003** Reliability | `aipmtw/showcase-003-daily-news` | `daily.aipm.com.tw` | 能每天跑 |
| **001-B** Reproducibility | `aipmtw/showcase-001-genesis-daily-news` | (build manual repo) | 可以重建 |
| **002** Observability | **this** | `routines-fleet.aipm.com.tw` | 你看得見它每天都在跑 |

## 為什麼 fleet 是「前門」

評審打開 PDF 上的「Live demo URL」,我們希望第一眼看到的是:**「啊,這不是一個東西,是一個 platform」**。fleet 一頁同時呈現 003 + 004 兩條時間軸,而且全部綠點,這個視覺證據比任何文字 narrative 都強。

從 fleet 點任一綠點 → 跳到該 run 的 `/runs/[id]`,評審就進到 zoom-in 的 routine 透明度頁面;那才是 003 的領域。

## 怎麼用這份 repo

從 0 到 live,4-8 分鐘:

1. 開 `build.md`
2. 從 §1 跑到 §11
3. 最後一節 verification 全綠 → `https://routines-fleet.aipm.com.tw` 起來

## Local dev

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
# open http://localhost:3000
```

頁面在 env 沒設時也能 build,只會顯示 amber 警告——這是刻意設計的,讓首次 Vercel build 不會卡 env。

## 安全邊界

- **唯讀。** 沒有 service-role key、沒有 write path、不能 INSERT/UPDATE/DELETE。
- **跨 project read 透過 anon key + RLS public read policy。** 003/004 的 schema 已經把 `select using (true)` 設好,fleet 不需要任何 schema 變更。
- **不存任何 cookie / session / user state。** 評審來看不留痕跡。

## License

MIT — Mark Chen 2026.
