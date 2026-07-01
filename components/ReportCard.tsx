"use client";

import type { InvestmentReport } from "@/lib/types";
import {
  formatMarketCap,
  formatPercent,
  formatPrice,
  formatRatio,
  formatDate,
  formatDateTime,
  confidenceColor,
  verdictColor,
} from "@/lib/utils";

interface ReportCardProps {
  report: InvestmentReport;
  elapsedSeconds: number;
}

const SOURCES = [
  { name: "Finnhub",      desc: "Financial data & metrics",  url: "https://finnhub.io" },
  { name: "Tavily Search", desc: "Latest news & web search", url: "https://tavily.com" },
  { name: "Groq AI",      desc: "LLaMA 3.3 70B inference",  url: "https://groq.com" },
];

export default function ReportCard({ report, elapsedSeconds }: ReportCardProps) {
  const m = report.financialMetrics;
  const verdictClasses = verdictColor(report.verdict);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-slide-up">

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-brand-400 text-sm font-semibold bg-brand-900/40 px-2.5 py-0.5 rounded-lg border border-brand-800/50">
                {report.ticker}
              </span>
              <span className="text-xs text-gray-500">{formatDate(report.generatedAt)}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100">{report.companyName}</h2>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-2xl">
              {report.companySummary}
            </p>
          </div>
          <div className={`flex-shrink-0 text-center px-6 py-4 rounded-xl border ${verdictClasses}`}>
            <div className="text-2xl font-bold tracking-wider">{report.verdict}</div>
            <div className="text-xs mt-1 opacity-70">Verdict</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-surface-600/50 flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="text-xs text-gray-600">
            Generated at: <span className="text-gray-500">{formatDateTime(report.generatedAt)}</span>
          </span>
          {elapsedSeconds > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-brand-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Research completed in {elapsedSeconds}s
            </span>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">AI Confidence Score</span>
          <span className={`text-2xl font-bold font-mono ${confidenceColor(report.confidenceScore)}`}>
            {report.confidenceScore}
            <span className="text-sm font-normal text-gray-500">/100</span>
          </span>
        </div>
        <div className="w-full bg-surface-600 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-brand-700 to-brand-400 transition-all duration-1000"
            style={{ width: `${report.confidenceScore}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">{report.aiReasoning}</p>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Financial Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Price",          value: formatPrice(m.currentPrice) },
            { label: "Market Cap",     value: formatMarketCap(m.marketCap) },
            { label: "P/E Ratio",      value: formatRatio(m.peRatio) },
            { label: "Forward P/E",    value: formatRatio(m.forwardPE) },
            { label: "P/B Ratio",      value: formatRatio(m.priceToBook) },
            { label: "Dividend Yield", value: formatPercent(m.dividendYield) },
            { label: "52W High",       value: formatPrice(m.fiftyTwoWeekHigh) },
            { label: "52W Low",        value: formatPrice(m.fiftyTwoWeekLow) },
            { label: "Revenue Growth", value: formatPercent(m.revenueGrowth) },
            { label: "Profit Margin",  value: formatPercent(m.profitMargin) },
            { label: "ROE",            value: formatPercent(m.returnOnEquity) },
            { label: "Debt/Equity",    value: formatRatio(m.debtToEquity) },
            { label: "Target Price",   value: formatPrice(m.targetPrice) },
            { label: "Analyst Rating", value: m.analystRating ?? "Not Available" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-700/50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className={`text-sm font-semibold font-mono ${value === "Not Available" ? "text-gray-600" : "text-gray-100"}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🐂</span> Bull Case
          </h3>
          <ul className="space-y-2.5">
            {report.bullCase.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-brand-500 mt-0.5 flex-shrink-0">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🐻</span> Bear Case
          </h3>
          <ul className="space-y-2.5">
            {report.bearCase.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>⚠️</span> Risk Analysis
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">{report.riskAnalysis}</p>
      </div>

      {report.latestNews.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            📰 Latest News
          </h3>
          <div className="space-y-3">
            {report.latestNews.slice(0, 4).map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-surface-700/40 hover:bg-surface-600/40 rounded-xl p-4 transition-colors duration-150 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-brand-300 transition-colors line-clamp-2">
                      {article.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{article.summary}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-600 group-hover:text-brand-400 flex-shrink-0 mt-0.5 transition-colors">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <span>{article.source}</span>
                  <span>·</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          🔗 Sources Used
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SOURCES.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-surface-700/40 hover:bg-surface-600/40 rounded-xl p-3 transition-colors duration-150 group"
            >
              <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-200 group-hover:text-brand-300 transition-colors">
                  {source.name}
                </div>
                <div className="text-xs text-gray-600 truncate">{source.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 pb-4">
        ⚠️ This report is AI-generated for informational purposes only. Not financial advice.
        Always do your own research before investing.
      </p>
    </div>
  );
}
