import { Annotation, StateGraph, END } from "@langchain/langgraph";
import {
  resolveTickerNode,
  fetchFinancialDataNode,
  fetchNewsNode,
  generateReportNode,
} from "./agent";
import type {
  AgentState,
  CompanyOverview,
  FinancialMetrics,
  NewsArticle,
  InvestmentReport,
} from "./types";

const AgentAnnotation = Annotation.Root({
  query:            Annotation<string>({ reducer: (_a, b) => b, default: () => "" }),
  ticker:           Annotation<string>({ reducer: (_a, b) => b, default: () => "" }),
  companyOverview:  Annotation<CompanyOverview | null>({ reducer: (_a, b) => b, default: () => null }),
  financialMetrics: Annotation<FinancialMetrics | null>({ reducer: (_a, b) => b, default: () => null }),
  news:             Annotation<NewsArticle[]>({ reducer: (_a, b) => b, default: () => [] }),
  report:           Annotation<InvestmentReport | null>({ reducer: (_a, b) => b, default: () => null }),
  error:            Annotation<string | null>({ reducer: (_a, b) => b, default: () => null }),
});

function shouldContinue(state: AgentState): string {
  return state.error ? END : "continue";
}

export function buildResearchGraph() {
  const graph = new StateGraph(AgentAnnotation)
    .addNode("resolve_ticker",   resolveTickerNode)
    .addNode("fetch_financials", fetchFinancialDataNode)
    .addNode("fetch_news",       fetchNewsNode)
    .addNode("generate_report",  generateReportNode)
    .addEdge("__start__",        "resolve_ticker")
    .addConditionalEdges("resolve_ticker", shouldContinue, {
      continue: "fetch_financials",
      [END]: END,
    })
    .addConditionalEdges("fetch_financials", shouldContinue, {
      continue: "fetch_news",
      [END]: END,
    })
    .addEdge("fetch_news",       "generate_report")
    .addEdge("generate_report",  END);

  return graph.compile();
}

export async function runResearchPipeline(query: string): Promise<AgentState> {
  const app = buildResearchGraph();

  const finalState = await app.invoke({
    query,
    ticker:           "",
    companyOverview:  null,
    financialMetrics: null,
    news:             [],
    report:           null,
    error:            null,
  });

  return finalState as AgentState;
}
