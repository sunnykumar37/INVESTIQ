"use client";

import { useEffect, useState } from "react";

const PIPELINE_STEPS = [
  { label: "Resolving ticker symbol",    icon: "🔍" },
  { label: "Fetching financial metrics", icon: "📊" },
  { label: "Gathering latest news",      icon: "📰" },
  { label: "Generating AI report",       icon: "🤖" },
];

export default function Loading() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, PIPELINE_STEPS.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-surface-600" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-brand-600 animate-spin [animation-duration:1.5s]" />
        </div>

        <h3 className="text-lg font-semibold text-gray-100 mb-1">Researching…</h3>
        <p className="text-sm text-gray-500 mb-8">Our AI agent is analyzing the company</p>

        <div className="space-y-3 text-left">
          {PIPELINE_STEPS.map((step, index) => {
            const isDone    = index < currentStep;
            const isActive  = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 text-sm transition-all duration-500 ${isPending ? "opacity-30" : "opacity-100"}`}
              >
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-brand-400">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isActive ? (
                    <div className="w-3 h-3 rounded-full bg-brand-400 animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-600" />
                  )}
                </div>
                <span className={isActive ? "text-brand-300" : isDone ? "text-gray-400" : "text-gray-600"}>
                  {step.icon} {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
