import { supabasePublic, PROJECT_DIRECTORY, type RoutineRun } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const WINDOW_DAYS = 30;

export default async function FleetPage() {
  const supabase = supabasePublic();

  let runs: RoutineRun[] = [];
  let configured = false;

  if (supabase) {
    configured = true;
    const since = new Date();
    since.setDate(since.getDate() - WINDOW_DAYS);
    const { data } = await supabase
      .from("routine_runs")
      .select("id, project, run_id, source_type, started_at, finished_at, status, items_produced, news_date, failure_reason, notes")
      .gte("started_at", since.toISOString())
      .order("started_at", { ascending: false })
      .limit(500);
    runs = (data ?? []) as RoutineRun[];
  }

  const projects = Object.keys(PROJECT_DIRECTORY);
  const byProject = Object.fromEntries(projects.map((p) => [p, [] as RoutineRun[]])) as Record<string, RoutineRun[]>;
  for (const r of runs) {
    if (byProject[r.project]) byProject[r.project].push(r);
  }

  const summary = {
    projects: projects.length,
    runs30d: runs.length,
    succeeded: runs.filter((r) => r.status === "succeeded").length,
    degraded: runs.filter((r) => r.status === "degraded").length,
    failed: runs.filter((r) => r.status === "failed").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          看得見的 production scheduler
        </h1>
        <p className="text-slate-600 max-w-3xl">
          {summary.projects} 個 showcase · 過去 {WINDOW_DAYS} 天 {summary.runs30d} 次 routine run ·{" "}
          <span className="text-emerald-700 font-semibold">{summary.succeeded} succeeded</span>
          {summary.degraded > 0 && <> · <span className="text-amber-700 font-semibold">{summary.degraded} degraded</span></>}
          {summary.failed > 0 && <> · <span className="text-rose-700 font-semibold">{summary.failed} failed</span></>}
          . 每個圓點是一次 Claude Code Routine 觸發,點下去看當次的所有 LLM 決策。
        </p>
      </section>

      {!configured && (
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase env not configured yet. Push <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to see live data.
        </div>
      )}

      <section className="space-y-8 mb-12">
        {projects.map((project) => {
          const meta = PROJECT_DIRECTORY[project];
          const projectRuns = byProject[project] ?? [];
          // chronological left → right
          const ordered = [...projectRuns].sort((a, b) => a.started_at.localeCompare(b.started_at));
          return (
            <div key={project} className="rounded-xl border border-slate-200 p-6">
              <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                <div>
                  <a href={meta.homeUrl} className="text-lg font-semibold text-slate-900 hover:underline underline-offset-4">
                    {meta.displayName}
                  </a>
                  <span className="ml-3 text-xs text-slate-500 font-mono">{project}</span>
                </div>
                <div className="text-xs text-slate-500">{meta.tagline}</div>
              </div>

              {ordered.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No runs in the last {WINDOW_DAYS} days.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {ordered.map((r) => (
                    <a
                      key={r.id}
                      href={`${meta.runUrlPrefix}${r.run_id}`}
                      title={`${r.news_date} · ${r.status} · ${r.items_produced ?? 0} items · ${r.run_id}`}
                      className={`inline-block w-3.5 h-3.5 rounded-sm transition-transform hover:scale-150 ${dotColor(r.status)}`}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-4 text-xs text-slate-500 font-mono">
                <span>{ordered.length} runs</span>
                <a href={meta.homeUrl} className="hover:underline">→ today</a>
                <a href={`${meta.runUrlPrefix}`} className="hover:underline">→ all runs</a>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <a
          href="https://daily.aipm.com.tw"
          className="rounded-xl border border-slate-200 p-6 hover:border-slate-900 transition-colors"
        >
          <div className="text-xs text-slate-500 font-mono mb-2">003 · live</div>
          <div className="text-base font-semibold mb-1">Reliability</div>
          <p className="text-sm text-slate-600">每天 08:00 自己跑。Anthropic / TC AI / HN 三來源,6 則精選。</p>
          <div className="mt-3 text-xs text-slate-500 font-mono">daily.aipm.com.tw →</div>
        </a>
        <a
          href="https://github.com/aipmtw/showcase-001-genesis-daily-news"
          className="rounded-xl border border-slate-200 p-6 hover:border-slate-900 transition-colors"
        >
          <div className="text-xs text-slate-500 font-mono mb-2">001-B · receipt</div>
          <div className="text-base font-semibold mb-1">Reproducibility</div>
          <p className="text-sm text-slate-600">build.md walked 3× on 2026-04-26 · cold 5m14s · warm 3m38s.</p>
          <div className="mt-3 text-xs text-slate-500 font-mono">github.com/aipmtw →</div>
        </a>
        <a
          href="https://daily-mfg.aipm.com.tw"
          className="rounded-xl border border-slate-200 p-6 hover:border-slate-900 transition-colors"
        >
          <div className="text-xs text-slate-500 font-mono mb-2">004 · sibling</div>
          <div className="text-base font-semibold mb-1">Same architecture · different vertical</div>
          <p className="text-sm text-slate-600">半導體供應鏈每日新聞,30 分鐘從 003 fork 出來。</p>
          <div className="mt-3 text-xs text-slate-500 font-mono">daily-mfg.aipm.com.tw →</div>
        </a>
      </section>
    </div>
  );
}

function dotColor(status: string) {
  switch (status) {
    case "succeeded":
      return "bg-emerald-500";
    case "degraded":
      return "bg-amber-500";
    case "failed":
      return "bg-rose-500";
    case "running":
      return "bg-sky-400 animate-pulse";
    default:
      return "bg-slate-300";
  }
}
