import { supabasePublic, PROJECT_DIRECTORY, type RoutineRun } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const WINDOW_DAYS = 30;

// Build a calendar of dates from min(run) → today, marking each slot as
// either a real run or a gap. Gaps are missed cron triggers — they tell
// the truth about reliability and are visualized as hollow grey squares.
function buildTimeline(runs: RoutineRun[]) {
  if (runs.length === 0) return { slots: [] as Array<{ date: string; run: RoutineRun | null }>, missing: 0 };
  const sorted = [...runs].sort((a, b) => a.news_date.localeCompare(b.news_date));
  const startDate = new Date(`${sorted[0].news_date}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dayMs = 86_400_000;
  const slots: Array<{ date: string; run: RoutineRun | null }> = [];
  for (let t = startDate.getTime(); t <= today.getTime(); t += dayMs) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const run = sorted.find((r) => r.news_date === iso) ?? null;
    slots.push({ date: iso, run });
  }
  const missing = slots.filter((s) => !s.run).length;
  return { slots, missing };
}

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

  const today = new Date().toISOString().slice(0, 10);
  const summary = {
    projects: projects.length,
    runs30d: runs.length,
    succeeded: runs.filter((r) => r.status === "succeeded").length,
    degraded: runs.filter((r) => r.status === "degraded").length,
    failed: runs.filter((r) => r.status === "failed").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <section className="mb-8">
        <div className="text-xs font-mono text-slate-500 mb-2">Today · {today} · Asia/Taipei</div>
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-slate-900">
          看得見的 production scheduler
        </h1>
        <p className="text-base text-slate-700 max-w-3xl leading-relaxed">
          {summary.projects} 個 Claude Code Routine 每天早上各自跑一次,寫入同一個 Supabase。
          底下每一格 = 該專案的某一天運行;<span className="text-emerald-700 font-semibold">綠色</span> 是成功,
          <span className="text-slate-400 font-semibold">空白</span> 是當天 cron 沒打中。
          點任一格進 <code className="font-mono text-xs bg-slate-100 px-1 rounded">/runs/[id]</code> 看當次每一個 LLM 決策的 timestamp。
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="text-slate-700">過去 {WINDOW_DAYS} 天 <span className="font-semibold">{summary.runs30d}</span> 次</span>
          <span className="text-emerald-700"><span className="font-semibold">{summary.succeeded}</span> succeeded</span>
          {summary.degraded > 0 && <span className="text-amber-700"><span className="font-semibold">{summary.degraded}</span> degraded</span>}
          {summary.failed > 0 && <span className="text-rose-700"><span className="font-semibold">{summary.failed}</span> failed</span>}
        </div>
        {/* legend */}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> succeeded</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-amber-500" /> degraded</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-rose-500" /> failed</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm border border-dashed border-slate-300 bg-white" /> gap (no run)</span>
        </div>
      </section>

      {!configured && (
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase env not configured yet. Push <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to see live data.
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {projects.map((project) => {
          const meta = PROJECT_DIRECTORY[project];
          const projectRuns = byProject[project] ?? [];
          const { slots, missing } = buildTimeline(projectRuns);
          // strip the protocol + path for the audit-trail label (per Hybrid URL pattern)
          const vercelHost = `${project}.vercel.app`;
          return (
            <div
              key={project}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="mb-4">
                <div className="flex items-baseline justify-between flex-wrap gap-x-3 gap-y-1 mb-1">
                  <a
                    href={meta.homeUrl}
                    className="text-xl font-semibold text-slate-900 hover:underline underline-offset-4 decoration-2"
                  >
                    {meta.displayName}
                  </a>
                  <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wide">
                    {project}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{meta.tagline}</div>
              </div>

              {slots.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4">No runs yet — waiting for first cron.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 py-2">
                  {slots.map(({ date, run }) =>
                    run ? (
                      <a
                        key={run.id}
                        href={`${meta.runUrlPrefix}${run.run_id}`}
                        title={`${run.news_date} · ${run.status} · ${run.items_produced ?? 0} items · ${run.run_id}`}
                        className={`inline-block w-4 h-4 rounded-sm transition-transform hover:scale-150 ${dotColor(run.status)}`}
                      />
                    ) : (
                      <span
                        key={`gap-${date}`}
                        title={`${date} · no run (cron miss or pre-launch)`}
                        className="inline-block w-4 h-4 rounded-sm border border-dashed border-slate-300 bg-white"
                      />
                    ),
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">{projectRuns.length} runs</span>
                  {missing > 0 && (
                    <span className="text-amber-700" title="days with no routine_runs row in this window">
                      · {missing} gap{missing === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <a href={meta.homeUrl} className="hover:underline hover:text-slate-900 transition-colors">→ today</a>
                  <a href={`${meta.runUrlPrefix}`} className="hover:underline hover:text-slate-900 transition-colors">→ all runs</a>
                </div>
              </div>

              {/* audit-trail label · per Hybrid URL pattern: link goes to clean subdomain, label shows actual vercel.app */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                served from <span className="text-slate-500">{vercelHost}</span>
              </div>
            </div>
          );
        })}
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
