"use client";

import type { RunMetrics } from "@samy-clivolt/pi-ag-ui/types";

interface MetricsCardProps {
  runMetrics: RunMetrics;
  estimatedTokens: number;
  estimatedCostUsd: number;
}

export function MetricsCard({ runMetrics, estimatedTokens, estimatedCostUsd }: MetricsCardProps) {
  return (
    <div
      className="rounded p-2 text-[10px] space-y-1"
      style={{
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="font-semibold opacity-70">📈 Metrics (Estimated)</div>
      <div className="opacity-70">
        Tokens: <span className="text-green-400">{formatInt(estimatedTokens)}</span>
      </div>
      <div className="opacity-70">
        Cost: <span className="text-green-400">${estimatedCostUsd.toFixed(6)}</span>
      </div>
      <div className="opacity-45">
        in/out: {formatInt(runMetrics.estimatedInputTokens)} / {formatInt(runMetrics.estimatedOutputTokens)} • {runMetrics.estimationMode}
      </div>
    </div>
  );
}

function formatInt(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(value)));
}
