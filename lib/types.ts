export interface CompanyOverview {
  name: string;
  ticker: string;
  sector: string;
  industry: string;
  description: string;
  country: string;
  employees: number | null;
  website: string;
  exchange: string;
}

export interface FinancialMetrics {
  currentPrice: number | null;
  marketCap: number | null;
  peRatio: number | null;
  forwardPE: number | null;
  priceToBook: number | null;
  dividendYield: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  profitMargin: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
  freeCashFlow: number | null;
  analystRating: string | null;
  targetPrice: number | null;
}

export interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}

export type InvestmentVerdict = "INVEST" | "WATCH" | "PASS";

export interface InvestmentReport {
  ticker: string;
  companyName: string;
  generatedAt: string;
  companySummary: string;
  latestNews: NewsArticle[];
  financialMetrics: FinancialMetrics;
  bullCase: string[];
  bearCase: string[];
  riskAnalysis: string;
  verdict: InvestmentVerdict;
  confidenceScore: number;
  aiReasoning: string;
}

export interface AgentState {
  query: string;
  ticker: string;
  companyOverview: CompanyOverview | null;
  financialMetrics: FinancialMetrics | null;
  news: NewsArticle[];
  report: InvestmentReport | null;
  error: string | null;
}

export interface ResearchRequest {
  query: string;
}

export interface ResearchResponse {
  success: boolean;
  report?: InvestmentReport;
  error?: string;
}
