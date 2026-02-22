/**
 * API route for thinking level management
 *
 * GET  /api/thinking — available levels + current
 * POST /api/thinking — change thinking level
 */

import { NextRequest, NextResponse } from "next/server";
import { getThinkingInfo, setThinkingLevel } from "@samy-clivolt/pi-ag-ui";

export async function GET(request: NextRequest) {
  try {
    const threadId = new URL(request.url).searchParams.get("threadId") || "default";
    return NextResponse.json(getThinkingInfo(threadId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { level, threadId = "default" } = await request.json();
    if (!level) {
      return NextResponse.json({ error: "level is required" }, { status: 400 });
    }
    const result = setThinkingLevel(threadId, level);
    // Return updated info too
    const info = getThinkingInfo(threadId);
    return NextResponse.json({ ...result, ...info });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const status = msg.includes("No active session") ? 404 : msg.includes("not available") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
