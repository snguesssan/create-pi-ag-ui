"use client";

export type StreamingIndicatorState = "idle" | "thinking" | "tool-running";

interface StreamingIndicatorProps {
  state: StreamingIndicatorState;
  className?: string;
}

export function StreamingIndicator({ state, className }: StreamingIndicatorProps) {
  if (state === "idle") return null;

  const isToolRunning = state === "tool-running";

  return (
    <div
      className={`rounded-lg px-3 py-2 text-xs font-mono ${className ?? ""}`}
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 opacity-90">
        <span className={isToolRunning ? "animate-spin" : "animate-pulse"}>
          {isToolRunning ? "⚙️" : "🧠"}
        </span>
        <span>{isToolRunning ? "Tool execution in progress…" : "Pi is thinking…"}</span>
      </div>

      <div className="agui-indeterminate-track mt-2">
        <div className="agui-indeterminate-bar" />
      </div>
    </div>
  );
}
