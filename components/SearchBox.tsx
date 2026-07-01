"use client";

import { useState, type FormEvent } from "react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const EXAMPLE_TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"];

export default function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a company name or ticker symbol.");
      return;
    }
    setError("");
    onSearch(trimmed);
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center glass rounded-2xl p-1.5 glow-brand focus-within:border-brand-600/50 transition-all duration-300">
          <div className="pl-3 pr-2 text-gray-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(""); }}
            placeholder="Search by company name or ticker (e.g. Apple, TSLA)"
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-sm sm:text-base py-3 px-2 outline-none"
            disabled={isLoading}
            autoFocus
          />

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-brand-600 hover:bg-brand-500 disabled:bg-surface-600 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 whitespace-nowrap"
          >
            {isLoading ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-400 pl-2 animate-fade-in">{error}</p>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
        <span className="text-xs text-gray-600">Try:</span>
        {EXAMPLE_TICKERS.map((ticker) => (
          <button
            key={ticker}
            onClick={() => { setQuery(ticker); setError(""); }}
            disabled={isLoading}
            className="text-xs font-mono text-brand-400 hover:text-brand-300 bg-brand-900/30 hover:bg-brand-900/50 border border-brand-800/50 px-2.5 py-1 rounded-lg transition-all duration-150 disabled:opacity-50"
          >
            {ticker}
          </button>
        ))}
      </div>
    </div>
  );
}
