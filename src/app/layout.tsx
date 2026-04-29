import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Showcase · AIA × Claude Code",
  description:
    "Reliability · Reproducibility · Observability. Live fleet observability across all Claude Code Routines showcases. One Supabase, one cron, many vertical news sites.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        <header className="border-b-2 border-slate-900">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="flex items-baseline justify-between flex-wrap gap-4 mb-4">
              <h1 className="font-bold tracking-tight text-3xl md:text-4xl text-slate-900 leading-none">
                Showcase
                <span className="text-slate-500 font-normal text-lg md:text-xl ml-3">· AIA × Claude Code</span>
              </h1>
              <nav className="flex gap-5 text-sm font-semibold text-slate-600">
                <a href="https://github.com/caotunspring/showcase-001-genesis-daily-news" className="hover:text-slate-900 hover:underline underline-offset-4" title="001-B · build.md (reproduction recipe · cold 5m14s / warm 3m38s)">build.md</a>
                <a href="https://github.com/aipmtw/showcase-002-routines-fleet" className="hover:text-slate-900 hover:underline underline-offset-4">source</a>
              </nav>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm">
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-emerald-700">1</span>
                <span className="font-semibold text-slate-900">Reliability</span>
                <span className="text-slate-400">· 能跑</span>
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-emerald-700">2</span>
                <span className="font-semibold text-slate-900">Reproducibility</span>
                <span className="text-slate-400">· 能重建</span>
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold text-emerald-700">3</span>
                <span className="font-semibold text-slate-900">Observability</span>
                <span className="text-slate-400">· 能監看</span>
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-600">
          <div>
            <span className="mr-3">Reliability · Reproducibility · Observability</span>
            ·
            <span className="ml-3">AIA × Claude Code Showcase 002</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Presented by <span className="font-semibold text-slate-700">馬克路思科技 Markluce AI</span> × <span className="font-semibold text-slate-700">Claude Opus 4.7</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
