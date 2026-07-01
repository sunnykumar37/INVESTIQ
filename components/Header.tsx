"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-brand-900/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center glow-brand">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-4 h-4 text-white"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">
            INVESTIQ
          </span>
        </div>

        <p className="hidden sm:block text-xs text-gray-500 font-mono">
          AI Investment Research
        </p>

        <div className="flex items-center gap-2 text-xs text-brand-400">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
          <span className="hidden sm:inline font-mono">Live</span>
        </div>
      </div>
    </header>
  );
}
