import type { CompanyOverview, FinancialMetrics } from "./types";

const BASE = "https://finnhub.io/api/v1";

function apiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY is not set");
  return key;
}

async function get<T>(path: string): Promise<T> {
  const url = `${BASE}${path}&token=${apiKey()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Finnhub request failed [${res.status}]: ${path}`);
  return res.json() as Promise<T>;
}

interface FinnhubProfile {
  name?: string;
  ticker?: string;
  exchange?: string;
  finnhubIndustry?: string;
  country?: string;
  weburl?: string;
  employeeTotal?: number;
  description?: string;
}

interface FinnhubQuote {
  c?: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
}

interface FinnhubMetricData {
  "52WeekHigh"?: number;
  "52WeekLow"?: number;
  peBasicExclExtraTTM?: number;
  forwardPE?: number;
  pbAnnual?: number;
  dividendYieldIndicatedAnnual?: number;
  revenueGrowthTTMYoy?: number;
  epsGrowthTTMYoy?: number;
  netProfitMarginTTM?: number;
  roeTTM?: number;
  "totalDebt/totalEquityAnnual"?: number;
  freeCashFlowTTM?: number;
  marketCapitalization?: number;
}

interface FinnhubMetricResponse {
  metric?: FinnhubMetricData;
}

interface FinnhubRecommendation {
  buy?: number;
  hold?: number;
  sell?: number;
  strongBuy?: number;
  strongSell?: number;
}

interface FinnhubPriceTarget {
  targetMean?: number;
}

function deriveRating(recs: FinnhubRecommendation[]): string | null {
  if (!recs.length) return null;
  const r = recs[0];
  const strongBuy  = r.strongBuy  ?? 0;
  const buy        = r.buy        ?? 0;
  const hold       = r.hold       ?? 0;
  const sell       = r.sell       ?? 0;
  const strongSell = r.strongSell ?? 0;
  const total = strongBuy + buy + hold + sell + strongSell;
  if (total === 0) return null;
  const score = (strongBuy * 5 + buy * 4 + hold * 3 + sell * 2 + strongSell * 1) / total;
  if (score >= 4.5) return "Strong Buy";
  if (score >= 3.5) return "Buy";
  if (score >= 2.5) return "Hold";
  if (score >= 1.5) return "Sell";
  return "Strong Sell";
}

export async function fetchCompanyOverview(ticker: string): Promise<CompanyOverview> {
  const profile = await get<FinnhubProfile>(
    `/stock/profile2?symbol=${encodeURIComponent(ticker)}`
  );

  if (!profile.name) {
    throw new Error(`No company found for ticker: ${ticker}`);
  }

  return {
    name:        profile.name,
    ticker:      ticker.toUpperCase(),
    sector:      profile.finnhubIndustry ?? "N/A",
    industry:    profile.finnhubIndustry ?? "N/A",
    description: profile.description    ?? "No description available.",
    country:     profile.country        ?? "N/A",
    employees:   profile.employeeTotal  ?? null,
    website:     profile.weburl         ?? "",
    exchange:    profile.exchange       ?? "N/A",
  };
}

export async function fetchFinancialMetrics(ticker: string): Promise<FinancialMetrics> {
  const sym = encodeURIComponent(ticker);

  const [quoteRes, metricRes, recRes, targetRes] = await Promise.allSettled([
    get<FinnhubQuote>(`/quote?symbol=${sym}`),
    get<FinnhubMetricResponse>(`/stock/metric?symbol=${sym}&metric=all`),
    get<FinnhubRecommendation[]>(`/stock/recommendation?symbol=${sym}`),
    get<FinnhubPriceTarget>(`/stock/price-target?symbol=${sym}`),
  ]);

  const quote  = quoteRes.status  === "fulfilled" ? quoteRes.value  : {};
  const metric = metricRes.status === "fulfilled" ? (metricRes.value.metric ?? {}) : {};
  const recs   = recRes.status    === "fulfilled" ? recRes.value    : [];
  const target = targetRes.status === "fulfilled" ? targetRes.value : {};

  const dividendYield =
    typeof metric.dividendYieldIndicatedAnnual === "number"
      ? metric.dividendYieldIndicatedAnnual / 100
      : null;

  const marketCap =
    typeof metric.marketCapitalization === "number"
      ? metric.marketCapitalization * 1_000_000
      : null;

  return {
    currentPrice:     (quote as FinnhubQuote).c              ?? null,
    marketCap,
    peRatio:          metric.peBasicExclExtraTTM             ?? null,
    forwardPE:        metric.forwardPE                       ?? null,
    priceToBook:      metric.pbAnnual                        ?? null,
    dividendYield,
    fiftyTwoWeekHigh: metric["52WeekHigh"]                   ?? null,
    fiftyTwoWeekLow:  metric["52WeekLow"]                    ?? null,
    revenueGrowth:    typeof metric.revenueGrowthTTMYoy === "number"
                        ? metric.revenueGrowthTTMYoy / 100
                        : null,
    earningsGrowth:   typeof metric.epsGrowthTTMYoy === "number"
                        ? metric.epsGrowthTTMYoy / 100
                        : null,
    profitMargin:     typeof metric.netProfitMarginTTM === "number"
                        ? metric.netProfitMarginTTM / 100
                        : null,
    debtToEquity:     metric["totalDebt/totalEquityAnnual"]  ?? null,
    returnOnEquity:   typeof metric.roeTTM === "number"
                        ? metric.roeTTM / 100
                        : null,
    freeCashFlow:     typeof metric.freeCashFlowTTM === "number"
                        ? metric.freeCashFlowTTM * 1_000_000
                        : null,
    analystRating:    deriveRating(Array.isArray(recs) ? recs : []),
    targetPrice:      (target as FinnhubPriceTarget).targetMean ?? null,
  };
}
