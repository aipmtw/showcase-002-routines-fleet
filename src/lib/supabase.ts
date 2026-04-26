import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Fleet dashboard reads the shared `showcases-shared` Supabase project
 * (ref: vdjsjdkswhbtvpsmujlg) where ALL showcase siblings (003, 004,
 * future) write `routine_runs` rows tagged with their `project` value.
 *
 * Anon-key only. RLS policy `public read routine_runs` makes that safe.
 *
 * Returns null if env not configured (e.g. first Vercel build before
 * env push). Callers must handle null gracefully — DO NOT crash.
 */
export function supabasePublic(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type RoutineRun = {
  id: string;
  project: string;
  run_id: string;
  source_type: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "succeeded" | "degraded" | "failed";
  items_produced: number | null;
  news_date: string;
  failure_reason: string | null;
  notes: string | null;
};

/**
 * Static map: which project lives at which production URL.
 * Add a new entry when a 5th showcase joins the fleet.
 *
 * The displayName is what we render in the dashboard cards;
 * the homeUrl is where the project's "today" page lives;
 * the runUrlPrefix takes a run_id and produces a deep-link.
 */
export const PROJECT_DIRECTORY: Record<
  string,
  { displayName: string; homeUrl: string; runUrlPrefix: string; tagline: string }
> = {
  "showcase-003-daily-news": {
    displayName: "Daily News · AI coding",
    homeUrl: "https://daily.aipm.com.tw",
    runUrlPrefix: "https://daily.aipm.com.tw/runs/",
    tagline: "Anthropic / TechCrunch AI / HN",
  },
  "showcase-004-daily-mfg-news": {
    displayName: "Daily News · 半導體供應鏈",
    homeUrl: "https://daily-mfg.aipm.com.tw",
    runUrlPrefix: "https://daily-mfg.aipm.com.tw/runs/",
    tagline: "udn-money / cna-tech / technews-tw",
  },
};
