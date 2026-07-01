"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import SearchBox from "@/components/SearchBox";
import Loading from "@/components/Loading";
import ReportCard from "@/components/ReportCard";
import Footer from "@/components/Footer";
import type { InvestmentReport, ResearchResponse } from "@/lib/types";

type AppState = "idle" | "loading" | "report" | "error";

export default function HomePage() {
  const [appState, setAppState]         = useState<AppState>("idle");
  const [report, setReport]             = useState<InvestmentReport | null>(null);
  const [errorMsg, setErrorMsg]         = useState<string>("");
  const [lastQuery, setLastQuery]       = useState<string>("");
  const [elapsedSeconds, setElapsed]    = useState<number>(0);
  const startTimeRef                    = useRef<number>(0);

  async function handleSearch(query: string) {
    setAppState("loading");
    setReport(null);
    setErrorMsg("");
    setLastQuery(query);
    setElapsed(0);
    startTimeRef.current = Date.now();

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data: ResearchResponse = await res.json();
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      setElapsed(elapsed);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setAppState("error");
        return;
      }

      setReport(data.report!);
      setAppState("report");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setAppState("error");
    }
  }

  function handleReset() {
    setAppState("idle");
    setReport(null);
    setErrorMsg("");
    setElapsed(0);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className={`text-center mb-10 transition-all duration-500 ${appState !== "idle" ? "mb-6" : ""}`}>
          {appState === "idle" && (
            <>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-brand-400 bg-brand-900/30 border border-brand-800/50 px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Powered by LangGraph + Groq AI
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="text-gray-100">AI Investment</span>
                <br />
                <span className="text-gradient">Research Agent</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                Enter any company name or stock ticker to get an instant, AI-powered
                investment research report with financial analysis and recommendations.
              </p>
            </>
          )}

          <SearchBox onSearch={handleSearch} isLoading={appState === "loading"} />

          {(appState === "report" || appState === "error") && (
            <button
              onClick={handleReset}
              className="mt-4 text-sm text-gray-500 hover:text-brand-400 transition-colors duration-150 underline underline-offset-4"
            >
              ← Search another company
            </button>
          )}
        </div>

        {appState === "loading" && (
          <div className="flex justify-center mt-8">
            <Loading />
          </div>
        )}

        {appState === "error" && (
          <div className="max-w-md mx-auto mt-8 animate-fade-in">
            <div className="glass rounded-2xl p-6 border border-red-900/40 text-center">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="text-base font-semibold text-red-400 mb-2">Research Failed</h3>
              <p className="text-sm text-gray-400 mb-4">{errorMsg}</p>
              {lastQuery && (
                <p className="text-xs text-gray-600">
                  Query: <span className="font-mono text-gray-500">{lastQuery}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {appState === "report" && report && (
          <div className="mt-8">
            <ReportCard report={report} elapsedSeconds={elapsedSeconds} />
          </div>
        )}

        {appState === "idle" && (
          <div className="mt-20 grid sm:grid-cols-3 gap-4 animate-fade-in">
            {[
              {
                icon: "📊",
                title: "Real-Time Financials",
                desc: "Live market data including P/E ratio, market cap, revenue growth, and 14+ key metrics powered by Finnhub.",
              },
              {
                icon: "🤖",
                title: "AI-Powered Analysis",
                desc: "LangGraph orchestrates a multi-step AI pipeline using Groq's LLaMA 3.3 70B model for deep analysis.",
              },
              {
                icon: "📰",
                title: "Latest News",
                desc: "Tavily search fetches the most recent news and developments to inform the investment thesis.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-5 hover:border-brand-800/50 transition-all duration-200">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="text-sm font-semibold text-gray-200 mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
