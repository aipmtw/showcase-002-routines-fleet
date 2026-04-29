import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "能跑 · 能重建 · 能監看 · AIA × Claude Code Showcase",
  description:
    "Reliability · Reproducibility · Observability. Live fleet observability across all Claude Code Routines showcases. One Supabase, one cron, many vertical news sites.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        <header className="border-b-4 border-slate-900 bg-white">
          <div className="max-w-screen-2xl mx-auto px-8 md:px-12 py-8 md:py-10">
            <div className="flex items-baseline justify-between flex-wrap gap-6 mb-6">
              <div>
                <div className="text-[10px] md:text-xs font-mono font-bold tracking-[0.18em] uppercase text-slate-500 mb-3">
                  AIA × Claude Code Showcase
                </div>
                <h1 className="font-bold tracking-tight text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-none">
                  能跑 · 能重建 · 能監看
                </h1>
              </div>
              <nav className="flex gap-6 text-base font-semibold text-slate-700">
                <a
                  href="https://github.com/caotunspring/showcase-001-genesis-daily-news"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-900 hover:underline underline-offset-4 decoration-2"
                  title="001-B · build.md (重建手冊)"
                >
                  build.md
                </a>
                <a
                  href="https://github.com/caotunspring/showcase-002-routines-fleet"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-900 hover:underline underline-offset-4 decoration-2"
                >
                  source
                </a>
              </nav>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-10 md:gap-x-14 gap-y-3 text-base md:text-lg">
              <span className="flex items-baseline gap-2.5">
                <span className="font-mono text-xl md:text-2xl font-extrabold text-emerald-700">1</span>
                <span className="font-bold text-slate-900">Reliability</span>
                <span className="text-slate-500">· 能跑</span>
              </span>
              <span className="flex items-baseline gap-2.5">
                <span className="font-mono text-xl md:text-2xl font-extrabold text-emerald-700">2</span>
                <span className="font-bold text-slate-900">Reproducibility</span>
                <span className="text-slate-500">· 能重建</span>
              </span>
              <span className="flex items-baseline gap-2.5">
                <span className="font-mono text-xl md:text-2xl font-extrabold text-emerald-700">3</span>
                <span className="font-bold text-slate-900">Observability</span>
                <span className="text-slate-500">· 能監看</span>
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600 bg-slate-50">
          <div className="max-w-screen-2xl mx-auto px-8 md:px-12">
            <div className="text-base">
              <span className="mr-3">Reliability · Reproducibility · Observability</span>
              ·
              <span className="ml-3">AIA × Claude Code Showcase 002</span>
            </div>
            <div className="mt-2 text-xs md:text-sm text-slate-500">
              Presented by <span className="font-semibold text-slate-700">馬克路思科技 Markluce AI</span> × <span className="font-semibold text-slate-700">Claude Opus 4.7</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
