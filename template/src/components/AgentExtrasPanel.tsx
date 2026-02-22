"use client";

/**
 * AgentExtrasPanel
 * Reads shared thinking state from AgentStateContext.
 */

import { useAgentState } from "@/lib/agent-state-context";
import { ThinkingBlock } from "./ThinkingBlock";

export function AgentExtrasPanel() {
  const state = useAgentState();
  if (!state) return null;

  const thinkingLevel = state.thinkingLevel ?? "off";
  const reasoningEnabled = thinkingLevel !== "off";

  if (!reasoningEnabled && !state.isThinking) return null;

  return <ThinkingBlock isActive={state.isThinking} thinkingLevel={thinkingLevel} />;
}
