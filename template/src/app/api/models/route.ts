/**
 * API route for model management
 * 
 * GET /api/models - List available models and current model
 * POST /api/models - Switch model for a thread
 */

import { NextRequest, NextResponse } from "next/server";
import { getAvailableModels, switchModel } from "@samy-clivolt/pi-ag-ui";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId") || "default";

    const result = await getAvailableModels(threadId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, modelId, threadId = "default" } = body;

    if (!provider || !modelId) {
      return NextResponse.json(
        { error: "provider and modelId are required" },
        { status: 400 }
      );
    }

    const result = await switchModel(threadId, provider, modelId);
    
    // Also return updated models list and current model
    const modelsData = await getAvailableModels(threadId);
    
    return NextResponse.json({
      ...result,
      ...modelsData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    
    if (message.includes("No active session")) {
      return NextResponse.json(
        { error: "Session not found. Please send a message first to initialize the session." },
        { status: 404 }
      );
    }
    
    if (message.includes("disabled")) {
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    if (message.includes("not found") || message.includes("API key required")) {
      return NextResponse.json(
        { error: message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}