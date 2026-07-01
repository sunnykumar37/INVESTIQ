# INVESTIQ — AI Investment Research Agent

> An AI-powered investment research assistant that generates institutional-grade research reports for any publicly listed company in seconds.

---

## Project Description

INVESTIQ is a full-stack AI application that accepts a company name or stock ticker as input and returns a structured investment research report. It orchestrates a multi-step AI pipeline using LangGraph, fetches real-time financial data from Finnhub, retrieves the latest news via Tavily, and generates a comprehensive analysis using Groq's LLaMA 3.3 70B model.

The output includes a company summary, bull and bear cases, risk analysis, financial metrics, latest news, an investment verdict (INVEST / WATCH / PASS), and an AI confidence score.

---

## Features

- **Ticker Resolution** — Converts any company name into a stock ticker using the LLM
- **Real-Time Financial Data** — 14+ metrics from Finnhub (P/E, market cap, ROE, revenue growth, etc.)
- **Latest News** — Tavily search fetches the 5 most recent articles about the company
- **AI Report Generation** — Groq LLaMA 3.3 70B produces a structured JSON investment report
- **Robust JSON Parsing** — Multi-layer fallback ensures the LLM response is always valid
- **Investment Verdict** — Clear INVEST / WATCH / PASS recommendation with confidence score
- **Research Timer** — Displays how long the full pipeline took to complete
- **Sources Panel** — Shows which APIs contributed to the report
- **Professional UI** — Dark theme, animated loading states, fully responsive

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 15 (App Router), TypeScript |
| Styling      | Tailwind CSS                        |
| AI Workflow  | LangGraph 0.2, LangChain            |
| LLM          | Groq API (LLaMA 3.3 70B)           |
| Finance Data | Finnhub API                         |
| News Search  | Tavily Search API                   |

---

## System Architecture

```
User Input (company name or ticker)
         │
         ▼
┌──────────────────────────────────────────────────────┐
│                  LangGraph Pipeline                   │
│                                                       │
│  [Node 1] resolve_ticker                              │
│      └─ Groq LLM: "Apple" → "AAPL"                  │
│                    │                                  │
│  [Node 2] fetch_financials                            │
│      └─ Finnhub: profile + metrics + recommendations │
│                    │                                  │
│  [Node 3] fetch_news                                  │
│      └─ Tavily: 5 latest news articles                │
│                    │                                  │
│  [Node 4] generate_report                             │
│      └─ Groq LLaMA 3.3 70B → structured JSON report  │
└──────────────────────────────────────────────────────┘
         │
         ▼
  Investment Report (typed JSON)
         │
         ▼
  Next.js API Route → React Frontend
```

Each node returns a `Partial<AgentState>`. Conditional edges short-circuit the graph on any error, preventing wasted API calls downstream.

---

## Folder Structure

```
INVESTIQ/
├── app/
│   ├── api/research/route.ts   # POST endpoint — runs LangGraph pipeline
│   ├── page.tsx                # Landing page + dashboard
│   ├── layout.tsx              # Root layout with metadata
│   └── globals.css             # Tailwind + custom utility classes
├── components/
│   ├── Header.tsx              # Sticky navigation bar
│   ├── SearchBox.tsx           # Search input with validation
│   ├── Loading.tsx             # Animated pipeline progress indicator
│   ├── ReportCard.tsx          # Full report display component
│   └── Footer.tsx              # Footer with powered-by credits
├── lib/
│   ├── graph.ts                # LangGraph StateGraph definition
│   ├── agent.ts                # Graph node implementations
│   ├── tools.ts                # LangChain Tavily search tool
│   ├── finance.ts              # Finnhub API data fetching
│   ├── prompts.ts              # LLM prompt templates
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Formatting and utility functions
├── .env.local                  # API keys (never commit)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Installation Guide

### Prerequisites

- Node.js 18+
- npm
- API keys for Groq, Tavily, and Finnhub (all free tiers available)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/investiq.git
cd investiq
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable          | Required | Description                          | Get it at                          |
|-------------------|----------|--------------------------------------|------------------------------------|
| `GROQ_API_KEY`    | Yes      | Groq LLM inference API key           | https://console.groq.com           |
| `TAVILY_API_KEY`  | Yes      | Tavily web search API key            | https://tavily.com                 |
| `FINNHUB_API_KEY` | Yes      | Finnhub financial data API key       | https://finnhub.io                 |

All three services offer a free tier sufficient for development and demo use.

---

## How to Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npx tsc --noEmit
```

---

## APIs Used

### Groq API
- **Model:** `llama-3.3-70b-versatile`
- **Used for:** Ticker resolution and investment report generation
- **Key feature:** `response_format: { type: "json_object" }` enforces valid JSON output
- **Free tier:** Generous rate limits for development

### Finnhub API
- **Endpoints used:**
  - `GET /stock/profile2` — Company name, exchange, industry, country, employees
  - `GET /stock/metric?metric=all` — P/E, P/B, ROE, margins, growth rates, 52-week range
  - `GET /quote` — Current price
  - `GET /stock/recommendation` — Analyst consensus (Strong Buy → Strong Sell)
  - `GET /stock/price-target` — Mean analyst price target
- **Free tier:** 60 API calls/minute

### Tavily Search API
- **Used for:** Fetching the 5 most recent news articles about the company
- **Free tier:** 1,000 searches/month

---

## LangGraph Workflow

The pipeline is defined as a `StateGraph` using the `Annotation.Root` API (LangGraph 0.2+):

```
__start__
    │
resolve_ticker ──(error)──► __end__
    │
fetch_financials ──(error)──► __end__
    │
fetch_news ──────────────────────────► generate_report ──► __end__
```

- **Error short-circuit:** Any node that sets `state.error` causes the graph to terminate immediately via conditional edges
- **News resilience:** `fetch_news` failures are non-fatal — the pipeline continues with an empty news array
- **State reducers:** All fields use "last write wins" reducers so each node only needs to return the fields it updates

---

## Screenshots

| Landing Page | Research Report |
|---|---|
| ![Landing](public/screenshot-landing.png) | ![Report](public/screenshot-report.png) |

---

## Deployment Guide (Vercel)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

### 3. Add environment variables

In the Vercel dashboard → Project Settings → Environment Variables, add:

- `GROQ_API_KEY`
- `TAVILY_API_KEY`
- `FINNHUB_API_KEY`

### 4. Set function timeout

In `app/api/research/route.ts`, the `maxDuration` is set to `30` seconds (free tier). Upgrade to Vercel Pro and set it to `60` for more headroom.

### Deploy to other platforms

```bash
npm run build
npm start
```

Ensure all three environment variables are set on your platform.

---

## Future Improvements

- **Portfolio tracking** — Save and compare multiple company reports
- **Historical analysis** — Show how the AI verdict has changed over time
- **PDF export** — Download the report as a formatted PDF
- **Watchlist** — Bookmark companies for quick re-analysis
- **Sector comparison** — Compare a company against its sector peers
- **Earnings calendar** — Highlight upcoming earnings dates in the report
- **Multi-language support** — Generate reports in the user's preferred language
- **Streaming responses** — Stream the AI report generation in real time

---

## License

MIT License — free to use, modify, and distribute.

---

*Built as a take-home assignment for AI Product Development Engineer Intern position.*
