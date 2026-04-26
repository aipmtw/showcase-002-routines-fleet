<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (16.2.4) has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Fleet-specific rules

- This repo is **read-only** against `routine_runs`. Never add writes; never import service-role key.
- The page at `src/app/page.tsx` is the *entire product*. Do not add other routes unless explicitly asked.
- The siblings (003 / 004) own their own data. Do not query their `news_items` rows from here — fleet is about **runs**, not items.
- Build must succeed without env vars set (graceful empty state). The Vercel first-deploy walks through `npm run build` before env are pushed.
