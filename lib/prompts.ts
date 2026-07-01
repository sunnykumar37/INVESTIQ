export const SYSTEM_PROMPT = `You are INVESTIQ, an elite AI investment research analyst with deep expertise in equity analysis, financial modeling, and market intelligence. You provide institutional-grade investment research in a clear, structured format that both retail and professional investors can understand.

Your analysis is data-driven, objective, balanced, risk-aware, and written in professional but accessible language.

You NEVER provide financial advice. Your reports are for informational and educational purposes only.`;

export const REPORT_SYSTEM_PROMPT = `You are a JSON-only financial analysis API. You output exclusively valid JSON objects with no markdown, no prose, no code fences, and no explanation outside the JSON structure. Every response must be parseable by JSON.parse().`;

export function buildReportPrompt(
  ticker: string,
  companyOverview: string,
  financialMetrics: string,
  newsContext: string
): string {
  return `Analyze the following data for ${ticker} and return a JSON object.

COMPANY OVERVIEW:
${companyOverview}

FINANCIAL METRICS:
${financialMetrics}

LATEST NEWS:
${newsContext}

Return this exact JSON structure with no additional text:
{
  "companySummary": "2-3 sentence overview of what the company does and its market position",
  "bullCase": ["point 1", "point 2", "point 3"],
  "bearCase": ["point 1", "point 2", "point 3"],
  "riskAnalysis": "2-3 sentences covering key risks",
  "verdict": "INVEST",
  "confidenceScore": 72,
  "aiReasoning": "3-4 sentences explaining the verdict referencing specific data points"
}

Rules:
- verdict must be exactly one of: INVEST, WATCH, PASS
- confidenceScore must be an integer 0-100
- bullCase and bearCase must each contain exactly 3 strings
- output only the JSON object, nothing else`;
}

export function buildTickerPrompt(query: string): string {
  return `The user is searching for a publicly listed company using this query: "${query}"

Determine the most likely stock ticker symbol for this company on a major exchange (NYSE, NASDAQ, etc.).

Rules:
- If the query already looks like a ticker (1-5 uppercase letters), return it as-is
- If it's a company name, return the primary US-listed ticker
- Return ONLY the ticker symbol in uppercase, nothing else
- If you cannot determine a ticker, return "UNKNOWN"

Examples:
- "Apple" → AAPL
- "Tesla" → TSLA
- "Microsoft Corporation" → MSFT
- "NVDA" → NVDA`;
}
