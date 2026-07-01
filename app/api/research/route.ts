import { NextRequest, NextResponse } from "next/server";
import { runResearchPipeline } from "@/lib/graph";
import { sanitizeQuery } from "@/lib/utils";
import type { ResearchResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest): Promise<NextResponse<ResearchResponse>> {
  try {
    const body = await req.json();
    const rawQuery: string = body?.query ?? "";

    const query = sanitizeQuery(rawQuery);
    if (!query || query.length < 1) {
      return NextResponse.json(
        { success: false, error: "Please provide a company name or ticker symbol." },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { success: false, error: "Query is too long. Please enter a company name or ticker." },
        { status: 400 }
      );
    }

    const finalState = await runResearchPipeline(query);
    if (finalState.error) {
      return NextResponse.json(
        { success: false, error: finalState.error },
        { status: 422 }
      );
    }

    if (!finalState.report) {
      return NextResponse.json(
        { success: false, error: "Report generation failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, report: finalState.report });
  } catch (err) {
    console.error("[/api/research] Unhandled error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}
