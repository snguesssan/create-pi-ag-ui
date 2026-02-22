"use client";

/**
 * AgentStateContext
 *
 * Centralises all useCoAgentStateRender({ name: "pi-agent" }) calls into ONE hook.
 * CopilotKit only honours one handler per agent name — all components must read
 * from this shared context instead of registering their own hooks.
 *
 * Usage:
 *   const state = useAgentState();        // full AgentSharedState (or null)
 *   const isStreaming = useIsStreaming();  // convenience bool
 */

import { useCoAgentStateRender } from "@copilotkit/react-core";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  EMPTY_ACTIVITY_SUMMARY,
  EMPTY_RUN_METRICS,
  type ActivityEntry,
  type ActivitySummary,
  type AgentSharedState,
  type RunMetrics,
  type StepEntry,
} from "@samy-clivolt/pi-ag-ui/types";

// ─── Normalisation ────────────────────────────────────────────────────

function normalizeActivities(value: unknown): ActivityEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const a = item as Record<string, unknown>;
      if (typeof a.id !== "string" || typeof a.tool !== "string") return null;
      return {
        id: a.id,
        tool: a.tool,
        status: typeof a.status === "string" ? a.status : "unknown",
        startedAt: typeof a.startedAt === "number" ? a.startedAt : Date.now(),
        endedAt: typeof a.endedAt === "number" ? a.endedAt : null,
        durationMs: typeof a.durationMs === "number" ? a.durationMs : null,
        error: typeof a.error === "string" ? a.error : null,
      };
    })
    .filter((x): x is ActivityEntry => x !== null);
}

function normalizeSteps(value: unknown): StepEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const s = item as Record<string, unknown>;
      if (typeof s.id !== "string") return null;
      return {
        id: s.id,
        label: typeof s.label === "string" ? s.label : s.id,
        status: (s.status === "complete" || s.status === "error") ? s.status : "running" as const,
        startedAt: typeof s.startedAt === "number" ? s.startedAt : Date.now(),
        endedAt: typeof s.endedAt === "number" ? s.endedAt : null,
        durationMs: typeof s.durationMs === "number" ? s.durationMs : null,
        error: typeof s.error === "string" ? s.error : null,
      };
    })
    .filter((x): x is StepEntry => x !== null);
}

function normalizeActivitySummary(value: unknown, activities: ActivityEntry[]): ActivitySummary {
  if (value && typeof value === "object") {
    const s = value as Record<string, unknown>;
    if (typeof s.runningCount === "number" && typeof s.recentCount === "number"
      && typeof s.errorCount === "number" && typeof s.total === "number") {
      return { runningCount: s.runningCount, recentCount: s.recentCount, errorCount: s.errorCount, total: s.total };
    }
  }
  const runningCount = activities.filter((a) => isRunningStatus(a.status)).length;
  const recentCount = activities.length - runningCount;
  return { runningCount, recentCount, errorCount: activities.filter((a) => a.status === "error").length, total: activities.length };
}

function normalizeRunMetrics(value: unknown): RunMetrics {
  if (!value || typeof value !== "object") return { ...EMPTY_RUN_METRICS };
  const m = value as Record<string, unknown>;
  return {
    estimatedInputTokens: typeof m.estimatedInputTokens === "number" ? m.estimatedInputTokens : 0,
    estimatedOutputTokens: typeof m.estimatedOutputTokens === "number" ? m.estimatedOutputTokens : 0,
    estimatedTotalTokens: typeof m.estimatedTotalTokens === "number" ? m.estimatedTotalTokens : 0,
    estimatedCostUsd: typeof m.estimatedCostUsd === "number" ? m.estimatedCostUsd : 0,
    estimationMode: (m.estimationMode === "usage" || m.estimationMode === "hybrid") ? m.estimationMode : "heuristic",
    updatedAt: typeof m.updatedAt === "number" ? m.updatedAt : 0,
  };
}

export function isRunningStatus(status: string): boolean {
  return status === "running" || status === "executing" || status === "inProgress";
}

export function normalizeAgentState(input: Record<string, unknown>): AgentSharedState {
  const activities = normalizeActivities(input.activities);
  const stepTimeline = normalizeSteps(input.stepTimeline);
  const activitySummary = normalizeActivitySummary(input.activitySummary, activities);
  const runMetrics = normalizeRunMetrics(input.runMetrics);

  return {
    isStreaming: Boolean(input.isStreaming),
    model: typeof input.model === "string" ? input.model : undefined,
    thinkingLevel: typeof input.thinkingLevel === "string" ? input.thinkingLevel : "off",
    piMessageCount: typeof input.piMessageCount === "number" ? input.piMessageCount : 0,
    currentStep: typeof input.currentStep === "string" ? input.currentStep : null,
    isThinking: Boolean(input.isThinking),
    activities,
    stepTimeline,
    activitySummary,
    runMetrics,
    estimatedTokens: typeof input.estimatedTokens === "number" ? input.estimatedTokens : runMetrics.estimatedTotalTokens,
    estimatedCostUsd: typeof input.estimatedCostUsd === "number" ? input.estimatedCostUsd : runMetrics.estimatedCostUsd,
    codingToolsEnabled: Boolean(input.codingToolsEnabled),
    cwd: typeof input.cwd === "string" ? input.cwd : null,
    threadId: typeof input.threadId === "string" ? input.threadId : "default",
    activeSessionCount: typeof input.activeSessionCount === "number" ? input.activeSessionCount : 0,
    persistenceEnabled: Boolean(input.persistenceEnabled),
    sessionId: typeof input.sessionId === "string" ? input.sessionId : null,
    extensionCount: typeof input.extensionCount === "number" ? input.extensionCount : 0,
    custom: typeof input.custom === "object" && input.custom ? (input.custom as Record<string, unknown>) : {},
  };
}

// ─── Context ──────────────────────────────────────────────────────────

const AgentStateContext = createContext<AgentSharedState | null>(null);

export function useAgentState(): AgentSharedState | null {
  return useContext(AgentStateContext);
}

// ─── Inner syncer (returned from render callback) ─────────────────────

function AgentStateSyncer({
  raw,
  onSync,
}: {
  raw: Record<string, unknown>;
  onSync: (s: AgentSharedState) => void;
}) {
  useEffect(() => {
    onSync(normalizeAgentState(raw));
  });
  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────

/**
 * Wrap children with this provider to give them access to the shared Pi agent state.
 * Must be inside <CopilotKit>.
 */
export function AgentStateProvider({ children }: { children: React.ReactNode }) {
  const [agentState, setAgentState] = useState<AgentSharedState | null>(null);
  const setRef = useRef(setAgentState);
  setRef.current = setAgentState;

  useCoAgentStateRender({
    name: "pi-agent",
    render: ({ state }: { state: unknown }) => {
      if (state && typeof state === "object") {
        return (
          <AgentStateSyncer
            raw={state as Record<string, unknown>}
            onSync={(s) => setRef.current(s)}
          />
        );
      }
      return null;
    },
  });

  return (
    <AgentStateContext.Provider value={agentState}>
      {children}
    </AgentStateContext.Provider>
  );
}
