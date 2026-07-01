import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { NewsArticle } from "./types";

export const tavilySearchTool = tool(
  async ({ query }: { query: string }): Promise<string> => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error("TAVILY_API_KEY is not set");

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: false,
      }),
    });

    if (!response.ok) throw new Error(`Tavily API error: ${response.statusText}`);

    const data = await response.json();

    const articles: NewsArticle[] = (data.results ?? []).map(
      (r: { title: string; content: string; url: string; published_date?: string }) => ({
        title:       r.title,
        summary:     r.content.slice(0, 300),
        url:         r.url,
        publishedAt: r.published_date ?? new Date().toISOString(),
        source:      new URL(r.url).hostname.replace("www.", ""),
      })
    );

    return JSON.stringify(articles);
  },
  {
    name: "tavily_news_search",
    description:
      "Search for the latest news and developments about a company or stock ticker. Returns recent articles with titles, summaries, and URLs.",
    schema: z.object({
      query: z.string().describe("Search query, e.g. 'Apple AAPL latest news 2024'"),
    }),
  }
);
