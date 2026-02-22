"use client";

/**
 * AgentStatePanel — Phase 5.4
 * Reads shared Pi agent state from AgentStateContext (one single useCoAgentStateRender).
 */

import { useState } from "react";
import { useAgentState, isRunningStatus } from "@/lib/agent-state-context";
import { MetricsCard } from "./state/MetricsCard";
import { StepTimeline } from "./state/StepTimeline";
import type { ActivityEntry } from "@samy-clivolt/pi-ag-ui/types";

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour12: false });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}

function StatusIcon({ status }: { status: string }) {
  if (isRunningStatus(status)) return <span className="animate-spin text-blue-400">⟳</span>;
  if (status === "complete") return <span className="text-green-400">✓</span>;
  if (status === "error") return <span className="text-red-400">✗</span>;
  return <span className="opacity-40">•</span>;
}

export function AgentStatePanel() {
  const state = useAgentState();
  const [activityFilter, setActivityFilter] = useState<"running" | "recent">("running");

  if (!state) return null;

  const runningActivities = state.activities.filter((a: ActivityEntry) => isRunningStatus(a.status));
  const recentActivities = [...state.activities]
    .filter((a: ActivityEntry) => !isRunningStatus(a.status))
    .sort((a: ActivityEntry, b: ActivityEntry) => (b.endedAt ?? b.startedAt) - (a.endedAt ?? a.startedAt));
  const visibleActivities = activityFilter === "running" ? runningActivities : recentActivities.slice(0, 20);

  return (
    <div
      className="rounded-lg p-3 sm:p-4 text-[11px] sm:text-xs font-mono space-y-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <h3 className="text-sm font-bold mb-3 opacity-70">🤖 Agent State</h3>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: state.isStreaming ? "#22c55e" : "#6b7280" }} />
        <span>{state.isStreaming ? "Streaming..." : "Idle"}</span>
      </div>

      <div className="opacity-70">Messages: <span className="text-green-400">{state.piMessageCount}</span></div>

      <div className="opacity-70">
        Tools:{" "}
        <span className={state.codingToolsEnabled ? "text-green-400" : "text-gray-400"}>
          {state.codingToolsEnabled ? "✅ coding enabled" : "frontend only"}
        </span>
      </div>

      <div className="opacity-70">
        🧠 Thinking:{" "}
        <span className={
          state.thinkingLevel === "high" || state.thinkingLevel === "xhigh"
            ? "text-purple-400"
            : state.thinkingLevel === "off"
              ? "text-gray-400"
              : "text-indigo-300"
        }
        >
          {state.thinkingLevel}
        </span>
      </div>

      {state.threadId && (
        <div className="opacity-70 truncate" title={state.threadId}>
          🧵 Thread:{" "}
          <span className="text-orange-400">
            {state.threadId === "default" ? "default" : `${state.threadId.slice(0, 12)}…`}
          </span>
        </div>
      )}

      {(state.activeSessionCount ?? 0) > 0 && (
        <div className="opacity-70">📊 Sessions: <span className="text-orange-400">{state.activeSessionCount}</span></div>
      )}

      {(state.extensionCount ?? 0) > 0 && (
        <div className="opacity-70">🧩 Extensions: <span className="text-green-400">{state.extensionCount}</span></div>
      )}

      <div className="opacity-70">
        {state.persistenceEnabled
          ? <><span>💾 </span><span className="text-green-400">Persisted</span></>
          : <><span>🧠 </span><span className="text-gray-400">In-Memory</span></>}
      </div>

      {state.sessionId && (
        <div className="opacity-70 truncate" title={state.sessionId}>
          🔑 Session:{" "}
          <span className="text-cyan-400">
            {state.sessionId.slice(0, 12)}{state.sessionId.length > 12 ? "…" : ""}
          </span>
        </div>
      )}

      {state.codingToolsEnabled && state.cwd && (
        <div className="opacity-70 truncate" title={state.cwd}>CWD: <span className="text-cyan-400">{state.cwd}</span></div>
      )}

      {state.currentStep && (
        <div className="opacity-70">Step: <span className="text-yellow-400">{state.currentStep}</span></div>
      )}

      {/* Phase 5.4: Metrics */}
      <MetricsCard
        runMetrics={state.runMetrics}
        estimatedTokens={state.estimatedTokens}
        estimatedCostUsd={state.estimatedCostUsd}
      />

      {/* Phase 5.4: Step timeline */}
      <StepTimeline steps={state.stepTimeline} />

      {/* Phase 5.4: Activities collapsible */}
      <details className="mt-2" open={state.activitySummary.runningCount > 0}>
        <summary className="cursor-pointer opacity-70 hover:opacity-90 py-1">
          ⚡ Activities ({state.activitySummary.runningCount} running • {state.activitySummary.recentCount} recent)
        </summary>

        <div className="mt-2 space-y-2">
          <div className="flex gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setActivityFilter("running")}
              className="px-2.5 py-1 rounded text-[10px] min-h-9"
              style={{
                border: "1px solid var(--border)",
                background: activityFilter === "running" ? "rgba(34, 197, 94, 0.14)" : "transparent",
              }}
            >
              running ({runningActivities.length})
            </button>
            <button
              type="button"
              onClick={() => setActivityFilter("recent")}
              className="px-2.5 py-1 rounded text-[10px] min-h-9"
              style={{
                border: "1px solid var(--border)",
                background: activityFilter === "recent" ? "rgba(59, 130, 246, 0.14)" : "transparent",
              }}
            >
              recent ({recentActivities.length})
            </button>
          </div>

          {visibleActivities.length === 0 ? (
            <div className="text-[10px] opacity-40">
              {activityFilter === "running" ? "No running activities" : "No recent activities"}
            </div>
          ) : (
            <div className="space-y-2">
              {visibleActivities.map((activity: ActivityEntry) => (
                <div key={activity.id} className="text-[10px] opacity-80">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={activity.status} />
                    <span className="truncate flex-1" title={activity.tool}>{activity.tool}</span>
                  </div>
                  <div className="ml-4 opacity-50">
                    {formatTimestamp(activity.startedAt)}
                    {activity.durationMs != null ? ` • ${formatDuration(activity.durationMs)}` : ""}
                    {activity.error ? ` • ${activity.error}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>

      {state.custom && Object.keys(state.custom).length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer opacity-50 hover:opacity-80">Custom state</summary>
          <pre className="mt-1 text-[10px] opacity-50 overflow-auto max-h-32">
            {JSON.stringify(state.custom, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
