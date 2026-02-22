"use client";

/**
 * ActivityPanel
 *
 * Displays current and recent agent activities (tool executions, compaction).
 * Consumes ACTIVITY_SNAPSHOT / ACTIVITY_DELTA events via the shared agent state.
 */

interface Activity {
  id: string;
  tool: string;
  status: string;
  startedAt: number;
}

interface ActivityPanelProps {
  activities: Activity[];
}

export function ActivityPanel({ activities }: ActivityPanelProps) {
  if (!activities || activities.length === 0) return null;

  return (
    <div
      className="rounded-lg p-4 text-xs font-mono space-y-2"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <h3 className="text-sm font-bold mb-3 opacity-70">⚡ Activities</h3>

      <div className="space-y-2">
        {activities.map((activity) => (
          <div key={activity.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusIcon status={activity.status} />
              <span className="flex-1 truncate" title={activity.tool}>
                {activity.tool}
              </span>
              <span className="opacity-40 text-[10px]">
                {formatElapsed(activity.startedAt)}
              </span>
            </div>

            {isRunningStatus(activity.status) && (
              <div className="agui-indeterminate-track ml-5">
                <div className="agui-indeterminate-bar" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function isRunningStatus(status: string): boolean {
  return status === "running" || status === "executing" || status === "inProgress";
}

function StatusIcon({ status }: { status: string }) {
  if (isRunningStatus(status)) {
    return <span className="animate-spin text-blue-400">⟳</span>;
  }

  switch (status) {
    case "complete":
      return <span className="text-green-400">✓</span>;
    case "error":
      return <span className="text-red-400">✗</span>;
    default:
      return <span className="opacity-40">•</span>;
  }
}

function formatElapsed(startedAt: number): string {
  const elapsed = Date.now() - startedAt;
  if (elapsed < 1000) return "now";
  if (elapsed < 60000) return `${Math.floor(elapsed / 1000)}s`;
  return `${Math.floor(elapsed / 60000)}m`;
}
