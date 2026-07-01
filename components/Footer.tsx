"use client";

const POWERED_BY = ["LangGraph", "Groq", "Tavily", "Finnhub", "Next.js"];

export default function Footer() {
  return (
    <footer className="border-t border-surface-600/50 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gradient">INVESTIQ</span>
            <span className="text-xs text-gray-600">v1.0.0</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600">
            {["Next.js 15", "LangGraph", "Groq AI", "Finnhub", "Tailwind CSS"].map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-surface-700/50 border border-surface-600/50"
              >
                {tech}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-600 text-center sm:text-right max-w-xs">
            Not financial advice. For educational purposes only.
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-700">
          <span>Powered by</span>
          {POWERED_BY.map((name, i) => (
            <span key={name} className="flex items-center gap-1.5">
              <span className="text-gray-500 hover:text-brand-500 transition-colors cursor-default">
                {name}
              </span>
              {i < POWERED_BY.length - 1 && <span className="text-gray-800">•</span>}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
