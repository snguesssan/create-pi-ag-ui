"use client";

interface ThreadSwitcherProps {
  threads: string[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
}

function formatThreadLabel(threadId: string): string {
  if (threadId === "default") return "default";
  if (threadId.length <= 16) return threadId;
  return `${threadId.slice(0, 13)}…`;
}

export function ThreadSwitcher({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
}: ThreadSwitcherProps) {
  return (
    <div className="flex items-center gap-2 min-h-11">
      <span className="hidden sm:inline text-[11px] font-mono opacity-60">Thread</span>

      <select
        value={activeThreadId}
        onChange={(event) => onSelectThread(event.target.value)}
        className="h-9 min-w-[110px] max-w-[180px] rounded-md px-2 text-xs font-mono border bg-transparent focus:outline-none"
        style={{ borderColor: "var(--border)" }}
        title={`Thread actif: ${activeThreadId}`}
      >
        {threads.map((threadId) => (
          <option key={threadId} value={threadId}>
            {formatThreadLabel(threadId)}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onCreateThread}
        className="rounded-md px-2.5 min-h-9 text-xs font-mono"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
        title="Créer un nouveau thread"
      >
        + Thread
      </button>
    </div>
  );
}
