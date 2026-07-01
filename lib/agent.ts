import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { fetchCompanyOverview, fetchFinancialMetrics } from "./finance";
import { tavilySearchTool } from "./tools";
import { buildReportPrompt, buildTickerPrompt, SYSTEM_PROMPT, REPORT_SYSTEM_PROMPT } from "./prompts";
import { clampConfidence } from "./utils";
import type { AgentState, InvestmentReport, InvestmentVerdict, NewsArticle } from "./types";

function getLLM() {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
  });
}

function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  const firstBrace = raw.indexOf("{");
  const lastBrace  = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }

  return raw.trim();
}

function parseReportJSON(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const extracted = extractJSON(raw);
    return JSON.parse(extracted) as Record<string, unknown>;
  }
}

function validateVerdict(value: unknown): InvestmentVerdict {
  if (value === "INVEST" || value === "WATCH" || value === "PASS") return value;
  return "WATCH";
}

function validateStringArray(value: unknown, fallback: string): string[] {
  if (Array.isArray(value) && value.length > 0) {
    return (value as unknown[]).map((v) => (typeof v === "string" ? v : fallback));
  }
  return [fallback, fallback, fallback];
}

export async function resolveTickerNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    const llm = getLLM();
    const response = await llm.invoke([new HumanMessage(buildTickerPrompt(state.query))]);
    const ticker = (response.content as string).trim().toUpperCase();

    if (ticker === "UNKNOWN" || ticker.length > 6) {
      return {
        error: `Could not resolve a ticker for "${state.query}". Please try a specific ticker symbol like AAPL or TSLA.`,
      };
    }

    return { ticker };
  } catch (err) {
    return { error: `Ticker resolution failed: ${(err as Error).message}` };
  }
}

export async function fetchFinancialDataNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    const [companyOverview, financialMetrics] = await Promise.all([
      fetchCompanyOverview(state.ticker),
      fetchFinancialMetrics(state.ticker),
    ]);
    return { companyOverview, financialMetrics };
  } catch (err) {
    return { error: `Failed to fetch financial data for ${state.ticker}: ${(err as Error).message}` };
  }
}

export async function fetchNewsNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    const companyName = state.companyOverview?.name ?? state.ticker;
    const searchQuery = `${companyName} ${state.ticker} stock news latest 2024 2025`;
    const rawResult = await tavilySearchTool.invoke({ query: searchQuery });
    const news: NewsArticle[] = JSON.parse(rawResult);
    return { news };
  } catch {
    return { news: [] };
  }
}

export async function generateReportNode(state: AgentState): Promise<Partial<AgentState>> {
  const overviewText = JSON.stringify(state.companyOverview, null, 2);
  const metricsText  = JSON.stringify(state.financialMetrics, null, 2);
  const newsText     = state.news.length > 0
    ? state.news.map((n, i) => `${i + 1}. ${n.title}\n   ${n.summary}`).join("\n\n")
    : "No recent news available.";

  const messages = [
    new SystemMessage(REPORT_SYSTEM_PROMPT),
    new HumanMessage(buildReportPrompt(state.ticker, overviewText, metricsText, newsText)),
  ];

  let parsed: Record<string, unknown> | null = null;
  let lastError = "";

  const llmWithJSON = getLLM().bind({ response_format: { type: "json_object" } });
  try {
    const response = await llmWithJSON.invoke(messages);
    parsed = parseReportJSON(response.content as string);
  } catch (err) {
    lastError = (err as Error).message;
  }

  if (!parsed) {
    try {
      const fallbackLLM = getLLM();
      const response = await fallbackLLM.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(buildReportPrompt(state.ticker, overviewText, metricsText, newsText)),
      ]);
      parsed = parseReportJSON(response.content as string);
    } catch (err) {
      lastError = (err as Error).message;
    }
  }

  if (!parsed) {
    return { error: `Report generation failed: ${lastError}` };
  }

  const report: InvestmentReport = {
    ticker:           state.ticker,
    companyName:      state.companyOverview?.name ?? state.ticker,
    generatedAt:      new Date().toISOString(),
    companySummary:   typeof parsed.companySummary === "string"
                        ? parsed.companySummary
                        : `${state.companyOverview?.name ?? state.ticker} investment analysis.`,
    latestNews:       state.news,
    financialMetrics: state.financialMetrics!,
    bullCase:         validateStringArray(parsed.bullCase,    "Positive outlook based on available data."),
    bearCase:         validateStringArray(parsed.bearCase,    "Risks exist based on available data."),
    riskAnalysis:     typeof parsed.riskAnalysis === "string"
                        ? parsed.riskAnalysis
                        : "Standard market and sector risks apply.",
    verdict:          validateVerdict(parsed.verdict),
    confidenceScore:  clampConfidence(typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 50),
    aiReasoning:      typeof parsed.aiReasoning === "string"
                        ? parsed.aiReasoning
                        : "Analysis based on available financial data and recent news.",
  };

  return { report };
}
