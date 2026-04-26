import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Routines Fleet · Claude Code production scheduler",
  description:
    "Live fleet observability across all Claude Code Routines showcases. One Supabase, one cron, many vertical news sites.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        <header className="border-b-2 border-slate-900">
          <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
            <div className="font-bold tracking-tight text-2xl">
              Routines Fleet
              <span className="text-slate-500 font-normal text-base ml-3">· Claude Code · production scheduler</span>
            </div>
            <nav className="flex gap-6 text-sm font-semibold text-slate-600">
              <a href="https://github.com/aipmtw/showcase-002-routines-fleet" className="hover:text-slate-900 hover:underline underline-offset-4">source</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-600">
          <span className="mr-3">Reliability · Reproducibility · Observability</span>
          ·
          <span className="ml-3">AIA × Claude Code Showcase 002</span>
        </footer>
      </body>
    </html>
  );
}
