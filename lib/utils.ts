export function formatMarketCap(value: number | null): string {
  if (value === null || isNaN(value)) return "Not Available";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export function formatPercent(value: number | null): string {
  if (value === null || isNaN(value)) return "Not Available";
  return `${(value * 100).toFixed(2)}%`;
}

export function formatPrice(value: number | null): string {
  if (value === null || isNaN(value)) return "Not Available";
  return `$${value.toFixed(2)}`;
}

export function formatRatio(value: number | null): string {
  if (value === null || isNaN(value)) return "Not Available";
  return value.toFixed(2);
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    year:   "numeric",
    month:  "short",
    day:    "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

export function clampConfidence(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function confidenceColor(score: number): string {
  if (score >= 70) return "text-brand-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

export function verdictColor(verdict: string): string {
  switch (verdict) {
    case "INVEST": return "text-brand-400 bg-brand-900/40 border-brand-700";
    case "WATCH":  return "text-yellow-400 bg-yellow-900/20 border-yellow-700";
    case "PASS":   return "text-red-400 bg-red-900/20 border-red-700";
    default:       return "text-gray-400 bg-gray-900/20 border-gray-700";
  }
}

export function sanitizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}
