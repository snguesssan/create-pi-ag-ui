"use client";

/**
 * ToolRenderers — Inline tool call rendering in the chat.
 *
 * Uses CopilotKit's `useRenderToolCall` to display React components
 * for each tool call as it executes and after completion.
 */

import { useRenderToolCall } from "@copilotkit/react-core";
import { useState } from "react";

export function ToolRenderers() {
  // ── toggleTheme ──
  useRenderToolCall({
    name: "toggleTheme",
    description: "Switch between light and dark UI theme",
    parameters: [
      { name: "theme", type: "string" as const, description: "Target theme", required: false },
    ],
    render: ({ status, args }) => {
      const target = (args as { theme?: string })?.theme ?? "toggle";
      return (
        <ToolCard
          icon="🎨"
          title="Toggle Theme"
          detail={target === "toggle" ? "Switching theme…" : `Switching to ${target}`}
          status={status}
        />
      );
    },
  });

  // ── showNotification ──
  useRenderToolCall({
    name: "showNotification",
    description: "Display a notification message to the user",
    parameters: [
      { name: "message", type: "string" as const, description: "Message", required: true },
      { name: "type", type: "string" as const, description: "Type", required: false },
    ],
    render: ({ status, args }) => {
      const { message, type } = args as { message?: string; type?: string };
      const icon = type === "success" ? "✅" : type === "warning" ? "⚠️" : type === "error" ? "❌" : "ℹ️";
      return (
        <ToolCard icon={icon} title="Notification" detail={message ?? "…"} status={status} />
      );
    },
  });

  // ── addBookmark ──
  useRenderToolCall({
    name: "addBookmark",
    description: "Save an item to bookmarks",
    parameters: [
      { name: "title", type: "string" as const, description: "Title", required: true },
      { name: "url", type: "string" as const, description: "URL", required: false },
    ],
    render: ({ status, args }) => {
      const { title, url } = args as { title?: string; url?: string };
      return (
        <ToolCard
          icon="🔖"
          title="Bookmark"
          detail={url ? `${title} — ${url}` : title ?? "…"}
          status={status}
        />
      );
    },
  });

  // ── copyToClipboard ──
  useRenderToolCall({
    name: "copyToClipboard",
    description: "Copy text to clipboard",
    parameters: [
      { name: "text", type: "string" as const, description: "Text", required: true },
    ],
    render: ({ status, args }) => {
      const text = (args as { text?: string })?.text ?? "";
      const preview = text.length > 80 ? text.slice(0, 80) + "…" : text;
      return <ToolCard icon="📋" title="Copy to Clipboard" detail={preview} status={status} />;
    },
  });

  // ── openUrl ──
  useRenderToolCall({
    name: "openUrl",
    description: "Open a URL in a new tab",
    parameters: [
      { name: "url", type: "string" as const, description: "URL", required: true },
    ],
    render: ({ status, args }) => {
      const url = (args as { url?: string })?.url ?? "";
      return (
        <ToolCard icon="🔗" title="Open URL" status={status}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
          >
            {url}
          </a>
        </ToolCard>
      );
    },
  });

  // ── showDataTable ──
  useRenderToolCall({
    name: "showDataTable",
    description: "Display a data table to the user",
    parameters: [
      { name: "title", type: "string" as const, description: "Table title", required: true },
      { name: "columns", type: "string" as const, description: "Comma-separated column names", required: true },
      { name: "rows", type: "string" as const, description: "JSON array of row arrays", required: true },
    ],
    render: ({ status, args }) => {
      const { title, columns: colStr, rows: rowStr } = args as {
        title?: string;
        columns?: string;
        rows?: string;
      };
      const cols = colStr?.split(",").map((s) => s.trim()) ?? [];
      let rows: string[][] = [];
      try {
        rows = JSON.parse(rowStr ?? "[]");
      } catch {
        /* invalid JSON — show empty */
      }

      return (
        <div className="my-2 rounded-lg border border-white/10 overflow-hidden" style={{ background: "var(--msg-assistant)" }}>
          <div className="px-3 py-2 text-sm font-medium border-b border-white/10 flex items-center gap-2">
            <span>📊</span>
            <span>{title ?? "Data Table"}</span>
            <StatusBadge status={status} />
          </div>
          <IndeterminateProgress status={status} />
          {cols.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {cols.map((col, i) => (
                      <th key={i} className="px-3 py-1.5 text-left text-xs font-semibold opacity-60">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-white/5 last:border-0">
                      {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    },
  });

  // ── switchModel ──
  useRenderToolCall({
    name: "switchModel",
    description: "Switch to a different AI model",
    parameters: [
      { name: "model", type: "string" as const, description: "Model identifier", required: true },
      { name: "threadId", type: "string" as const, description: "Thread ID", required: false },
    ],
    render: ({ status, args, result }) => {
      const { model, threadId } = args as { model?: string; threadId?: string };
      return (
        <ToolCard
          icon="🔄"
          title="Switch Model"
          detail={`${model}${threadId && threadId !== "default" ? ` (thread: ${threadId})` : ""}`}
          status={status}
        >
          {status === "complete" && result && (
            <div className="px-3 py-2 text-xs opacity-70">
              {String(result)}
            </div>
          )}
        </ToolCard>
      );
    },
  });

  // ── Backend coding tools ──────────────────────────────────────────

  // ── read ──
  useRenderToolCall({
    name: "read",
    description: "Read a file from the server filesystem",
    parameters: [
      { name: "path", type: "string" as const, description: "File path", required: true },
      { name: "offset", type: "number" as const, description: "Line offset", required: false },
      { name: "limit", type: "number" as const, description: "Max lines", required: false },
    ],
    render: ({ status, args, result }) => {
      const { path, offset, limit } = args as { path?: string; offset?: number; limit?: number };
      const label = [path, offset ? `offset:${offset}` : "", limit ? `limit:${limit}` : ""]
        .filter(Boolean)
        .join(" ");
      return (
        <ToolCard icon="📄" title="Read File" detail={label} status={status}>
          {status === "complete" && result && (
            <CodeBlock content={String(result)} />
          )}
        </ToolCard>
      );
    },
  });

  // ── bash ──
  useRenderToolCall({
    name: "bash",
    description: "Execute a bash command on the server",
    parameters: [
      { name: "command", type: "string" as const, description: "Command", required: true },
      { name: "timeout", type: "number" as const, description: "Timeout in seconds", required: false },
    ],
    render: ({ status, args, result }) => {
      const { command } = args as { command?: string };
      return (
        <div className="my-2 rounded-lg border border-white/10 overflow-hidden" style={{ background: "var(--msg-assistant)" }}>
          <div className="px-3 py-2 text-sm font-medium border-b border-white/10 flex items-center gap-2">
            <span>💻</span>
            <span>Bash</span>
            <StatusBadge status={status} />
          </div>
          <IndeterminateProgress status={status} />
          {command && (
            <div className="px-3 py-1.5 font-mono text-xs border-b border-white/5" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span className="opacity-50 mr-2">$</span>{command}
            </div>
          )}
          {status === "complete" && result && (
            <CodeBlock content={String(result)} terminal />
          )}
        </div>
      );
    },
  });

  // ── edit ──
  useRenderToolCall({
    name: "edit",
    description: "Edit a file by replacing text",
    parameters: [
      { name: "path", type: "string" as const, description: "File path", required: true },
      { name: "oldText", type: "string" as const, description: "Text to find", required: true },
      { name: "newText", type: "string" as const, description: "Replacement text", required: true },
    ],
    render: ({ status, args }) => {
      const { path, oldText, newText } = args as { path?: string; oldText?: string; newText?: string };
      return (
        <ToolCard icon="✏️" title="Edit File" detail={path} status={status}>
          {(oldText || newText) && (
            <DiffBlock oldText={oldText ?? ""} newText={newText ?? ""} />
          )}
        </ToolCard>
      );
    },
  });

  // ── write ──
  useRenderToolCall({
    name: "write",
    description: "Write content to a file",
    parameters: [
      { name: "path", type: "string" as const, description: "File path", required: true },
      { name: "content", type: "string" as const, description: "File content", required: true },
    ],
    render: ({ status, args }) => {
      const { path, content } = args as { path?: string; content?: string };
      return (
        <ToolCard icon="📝" title="Write File" detail={path} status={status}>
          {content && (
            <CodeBlock content={content} />
          )}
        </ToolCard>
      );
    },
  });

  return null;
}

// ─── Shared UI components ─────────────────────────────────────────

function isRunningStatus(status: string): boolean {
  return status === "running" || status === "executing" || status === "inProgress";
}

function IndeterminateProgress({ status }: { status: string }) {
  if (!isRunningStatus(status)) return null;

  return (
    <div className="agui-indeterminate-track mx-3 mb-2">
      <div className="agui-indeterminate-bar" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "complete") {
    return <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">✓ done</span>;
  }
  if (isRunningStatus(status)) {
    return <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 animate-pulse">running…</span>;
  }
  return null;
}

function ToolCard({
  icon,
  title,
  detail,
  status,
  children,
}: {
  icon: string;
  title: string;
  detail?: string;
  status: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="my-2 rounded-lg border border-white/10 overflow-hidden"
      style={{ background: "var(--msg-assistant)" }}
    >
      <div className="px-3 py-2 text-sm flex items-start gap-2">
        <span className="text-base">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            <StatusBadge status={status} />
          </div>
          {detail && <div className="text-xs opacity-60 mt-0.5 truncate">{detail}</div>}
        </div>
      </div>
      <IndeterminateProgress status={status} />
      {children && <div className="border-t border-white/5">{children}</div>}
    </div>
  );
}

// ─── Coding tool UI components ────────────────────────────────────

const MAX_PREVIEW_LINES = 30;

function CodeBlock({ content, terminal }: { content: string; terminal?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const lines = content.split("\n");
  const truncated = !expanded && lines.length > MAX_PREVIEW_LINES;
  const displayContent = truncated ? lines.slice(0, MAX_PREVIEW_LINES).join("\n") : content;

  return (
    <div className="relative">
      <pre
        className="px-3 py-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words max-h-80 overflow-y-auto"
        style={{ background: terminal ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.2)" }}
      >
        {displayContent}
      </pre>
      {truncated && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-3 py-1 text-xs text-center opacity-50 hover:opacity-80 cursor-pointer border-t border-white/5"
          style={{ background: "rgba(0,0,0,0.2)" }}
        >
          ▾ Show all {lines.length} lines
        </button>
      )}
    </div>
  );
}

function DiffBlock({ oldText, newText }: { oldText: string; newText: string }) {
  return (
    <pre
      className="px-3 py-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words max-h-60 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.2)" }}
    >
      {oldText.split("\n").map((line, i) => (
        <div key={`old-${i}`} style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}>
          <span className="opacity-50 select-none mr-2">-</span>{line}
        </div>
      ))}
      {newText.split("\n").map((line, i) => (
        <div key={`new-${i}`} style={{ color: "#4ade80", background: "rgba(74,222,128,0.08)" }}>
          <span className="opacity-50 select-none mr-2">+</span>{line}
        </div>
      ))}
    </pre>
  );
}
