"use client";

import type { StepEntry } from "@samy-clivolt/pi-ag-ui/types";

interface StepTimelineProps {
  steps: StepEntry[];
}

export function StepTimeline({ steps }: StepTimelineProps) {
  return (
    <details className="mt-2" open={steps.some((s) => s.status === "running")}>
      <summary className="cursor-pointer opacity-70 hover:opacity-90 py-1">
        🪜 Step timeline ({steps.length})
      </summary>

      <div className="mt-2 space-y-2">
        {steps.length === 0 ? (
          <div className="text-[10px] opacity-40">No steps yet</div>
        ) : (
          steps
            .slice()
            .reverse()
            .map((step) => (
              <div key={step.id} className="text-[10px] opacity-80">
                <div className="flex items-center gap-2">
                  <StatusIcon status={step.status} />
                  <span className="truncate flex-1" title={step.label}>{step.label}</span>
                  <span className="opacity-40">{formatTimestamp(step.startedAt)}</span>
                </div>
                <div className="ml-4 opacity-50">
                  {step.durationMs != null ? formatDuration(step.durationMs) : "running..."}
                  {step.error ? ` • ${step.error}` : ""}
                </div>
              </div>
            ))
        )}
      </div>
    </details>
  );
}

function StatusIcon({ status }: { status: StepEntry["status"] }) {
  if (status === "running") return <span className="animate-spin text-blue-400">⟳</span>;
  if (status === "error") return <span className="text-red-400">✗</span>;
  return <span className="text-green-400">✓</span>;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour12: false });
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60_000) return `${(durationMs / 1000).toFixed(1)}s`;
  return `${Math.round(durationMs / 1000)}s`;
}
