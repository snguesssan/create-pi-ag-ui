"use client";

/**
 * FrontendTools
 *
 * Registers all frontend-side tools (CopilotKit actions) that Pi can invoke.
 * These are defined here and sent to the agent via AG-UI's tool mechanism.
 *
 * AG-UI Features demonstrated:
 * - Frontend-defined tools (useCopilotAction)
 * - Shared readable state (useCopilotReadable)
 * - Human-in-the-loop confirmation
 */

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useState, useRef, useEffect } from "react";

function normalizeUserInputResponse(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "User cancelled input";
}

function formatCompletedUserInput(result: unknown): string {
  if (typeof result === "string" && result.trim().length > 0) {
    return result.trim();
  }
  return "User cancelled input";
}

export function FrontendTools() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // ── Shared readable state (agent can see this) ──
  useCopilotReadable({
    description: "Current UI theme",
    value: theme,
  });

  useCopilotReadable({
    description: "User's bookmarked items",
    value: bookmarks,
  });

  useCopilotReadable({
    description: "Number of unread notifications",
    value: notifications.length,
  });

  // ── Tool: Show notification ──
  useCopilotAction({
    name: "showNotification",
    description: "Display a notification message to the user in the UI",
    parameters: [
      {
        name: "message",
        type: "string",
        description: "The notification message to display",
        required: true,
      },
      {
        name: "type",
        type: "string",
        description: "Notification type: info, success, warning, error",
        required: false,
      },
    ],
    handler: async ({ message, type }) => {
      const icon =
        type === "success" ? "✅" :
        type === "warning" ? "⚠️" :
        type === "error" ? "❌" : "ℹ️";
      const notif = `${icon} ${message}`;
      setNotifications((prev) => [...prev, notif]);

      // Auto-dismiss after 30s
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n !== notif));
      }, 30000);

      return `Notification shown: "${message}"`;
    },
  });

  // ── Tool: Toggle theme ──
  useCopilotAction({
    name: "toggleTheme",
    description: "Switch between light and dark UI theme",
    parameters: [
      {
        name: "theme",
        type: "string",
        description: "Target theme: 'light' or 'dark'",
        required: false,
      },
    ],
    handler: async ({ theme: targetTheme }) => {
      const newTheme = targetTheme === "light" ? "light" : targetTheme === "dark" ? "dark" : theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
      if (newTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
      return `Theme switched to ${newTheme}`;
    },
  });

  // ── Tool: Add bookmark ──
  useCopilotAction({
    name: "addBookmark",
    description: "Save an item to the user's bookmarks for later reference",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Title of the bookmark",
        required: true,
      },
      {
        name: "url",
        type: "string",
        description: "Optional URL associated with the bookmark",
        required: false,
      },
    ],
    handler: async ({ title, url }) => {
      const entry = url ? `${title} (${url})` : title;
      setBookmarks((prev) => [...prev, entry]);
      return `Bookmarked: "${entry}"`;
    },
  });

  // ── Tool: Confirm action (human-in-the-loop with inline UI) ──
  useCopilotAction({
    name: "confirmAction",
    description: "Ask the user to confirm or deny an action before proceeding. Use for important or irreversible operations.",
    parameters: [
      {
        name: "action",
        type: "string",
        description: "Description of the action that needs confirmation",
        required: true,
      },
      {
        name: "importance",
        type: "string",
        description: "Importance level: low, medium, high, critical",
        required: false,
      },
    ],
    renderAndWaitForResponse: ({ args, respond, status }) => {
      const { action, importance } = args as { action?: string; importance?: string };
      const icon =
        importance === "critical" ? "🔴" :
        importance === "high" ? "🟠" :
        importance === "medium" ? "🟡" : "🔵";

      if (status === "complete") {
        return <div className="text-xs opacity-50 italic my-1">✓ Resolved</div>;
      }

      return (
        <div className="my-3 rounded-xl border-2 border-white/15 overflow-hidden" style={{ background: "var(--msg-assistant)" }}>
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 text-sm font-medium">
            <span>{icon}</span>
            <span>Confirmation Required</span>
            {importance && <span className="text-xs opacity-50">({importance})</span>}
          </div>
          <div className="px-4 py-3">
            <p className="text-sm mb-3">{action ?? "Do you want to proceed?"}</p>
            <div className="flex gap-2">
              <button
                onClick={() => respond?.("User confirmed the action")}
                className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                ✓ Confirm
              </button>
              <button
                onClick={() => respond?.("User denied the action")}
                className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors border border-white/20 hover:bg-white/10"
              >
                ✕ Deny
              </button>
            </div>
          </div>
        </div>
      );
    },
  });

  // ── Tool: Get user input (inline UI) ──
  useCopilotAction({
    name: "getUserInput",
    description: "Prompt the user for text input when you need additional information",
    parameters: [
      {
        name: "question",
        type: "string",
        description: "The question to ask the user",
        required: true,
      },
      {
        name: "placeholder",
        type: "string",
        description: "Placeholder text for the input field",
        required: false,
      },
    ],
    renderAndWaitForResponse: ({ args, respond, status, result }) => {
      const { question, placeholder } = args as { question?: string; placeholder?: string };

      if (status === "complete") {
        const answer = formatCompletedUserInput(result);
        return (
          <div className="my-2 rounded-lg border border-white/10 px-3 py-2 text-xs" style={{ background: "var(--msg-assistant)" }}>
            <div className="opacity-70">✓ Input received</div>
            <div className="mt-1 text-cyan-300 break-words">“{answer}”</div>
          </div>
        );
      }

      return (
        <UserInputInline
          question={question ?? "Please provide input:"}
          placeholder={placeholder}
          onSubmit={(value) => respond?.(normalizeUserInputResponse(value))}
          onCancel={() => respond?.("User cancelled input")}
        />
      );
    },
  });

  // ── Tool: Show data table ──
  useCopilotAction({
    name: "showDataTable",
    description: "Display a data table to the user. The table will be rendered inline in the chat.",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Title of the table",
        required: true,
      },
      {
        name: "columns",
        type: "string",
        description: "Comma-separated column names (e.g. 'Name,Age,City')",
        required: true,
      },
      {
        name: "rows",
        type: "string",
        description: 'JSON array of row arrays (e.g. \'[["Alice",30,"Paris"],["Bob",25,"London"]]\')',
        required: true,
      },
    ],
    handler: async ({ title, rows }) => {
      let parsed: unknown[] = [];
      try {
        parsed = JSON.parse(rows);
      } catch {
        return "Invalid rows JSON";
      }
      return `Table "${title}" displayed with ${parsed.length} rows`;
    },
  });

  // ── Tool: Open URL ──
  useCopilotAction({
    name: "openUrl",
    description: "Open a URL in a new browser tab",
    parameters: [
      {
        name: "url",
        type: "string",
        description: "The URL to open",
        required: true,
      },
    ],
    handler: async ({ url }) => {
      window.open(url, "_blank");
      return `Opened ${url} in new tab`;
    },
  });

  // ── Tool: Copy to clipboard ──
  useCopilotAction({
    name: "copyToClipboard",
    description: "Copy text content to the user's clipboard",
    parameters: [
      {
        name: "text",
        type: "string",
        description: "The text to copy to clipboard",
        required: true,
      },
    ],
    handler: async ({ text }) => {
      try {
        await navigator.clipboard.writeText(text);
        return "Text copied to clipboard successfully";
      } catch {
        return "Failed to copy to clipboard";
      }
    },
  });

  // ── Tool: Switch AI model ──
  useCopilotAction({
    name: "switchModel",
    description: "Switch to a different AI model for the conversation. Use when the user asks to change models (e.g., 'switch to Claude Haiku', 'use GPT-4o', 'change to a faster model').",
    parameters: [
      {
        name: "model",
        type: "string",
        description: "Model identifier in format 'provider/modelId' (e.g., 'anthropic/claude-haiku-4-5-latest') or just 'modelId' (e.g., 'claude-haiku-4-5-latest', 'gpt-4o')",
        required: true,
      },
      {
        name: "threadId",
        type: "string",
        description: "Thread ID (optional, defaults to 'default')",
        required: false,
      },
    ],
    handler: async ({ model, threadId = "default" }) => {
      try {
        // Parse model string - could be "provider/modelId" or just "modelId"
        let provider: string, modelId: string;
        
        if (model.includes("/")) {
          const parts = model.split("/");
          provider = parts[0];
          modelId = parts.slice(1).join("/");
        } else {
          // Try to infer provider from common model names
          modelId = model;
          if (model.includes("claude")) {
            provider = "anthropic";
          } else if (model.includes("gpt")) {
            provider = "openai";
          } else if (model.includes("gemini")) {
            provider = "google";
          } else {
            provider = "anthropic"; // default fallback
          }
        }

        const response = await fetch('/api/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, modelId, threadId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to switch model');
        }

        const result = await response.json();
        
        if (result.success && result.model) {
          return `Successfully switched to ${result.model.name} (${result.model.provider}/${result.model.id}). Your next message will use this model.`;
        } else {
          return "Model switch completed, but response format was unexpected.";
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return `Failed to switch model: ${message}`;
      }
    },
  });

  // ── Render notifications overlay ──
  return (
    <>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3" style={{ maxWidth: "400px" }}>
          {notifications.map((notif, i) => (
            <div
              key={i}
              className="animate-slide-in rounded-xl px-5 py-4 shadow-2xl text-base font-medium flex items-start gap-3"
              style={{
                background: "var(--accent)",
                color: "#ffffff",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <span className="flex-1">{notif}</span>
              <button
                onClick={() => setNotifications((prev) => prev.filter((_, idx) => idx !== i))}
                className="opacity-70 hover:opacity-100 text-lg leading-none cursor-pointer"
                style={{ color: "#ffffff" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bookmarks sidebar indicator */}
      {bookmarks.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-40 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold cursor-pointer"
          style={{ background: "var(--accent)" }}
          title={bookmarks.join("\n")}
          onClick={() => alert(`Bookmarks:\n${bookmarks.map((b, i) => `${i + 1}. ${b}`).join("\n")}`)}
        >
          🔖 {bookmarks.length}
        </div>
      )}
    </>
  );
}

// ─── Inline Input Component ─────────────────────────────────────

function UserInputInline({
  question,
  placeholder,
  onSubmit,
  onCancel,
}: {
  question: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [showEmptyHint, setShowEmptyHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedValue = value.trim();
  const canSubmit = trimmedValue.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (!canSubmit) {
      setShowEmptyHint(true);
      return;
    }
    onSubmit(trimmedValue);
  };

  return (
    <div className="my-3 rounded-xl border-2 border-white/15 overflow-hidden" style={{ background: "var(--msg-assistant)" }}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 text-sm font-medium">
        <span>💬</span>
        <span>Input Required</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm mb-3">{question}</p>
        <div className="flex gap-2 items-start flex-wrap sm:flex-nowrap">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (showEmptyHint) setShowEmptyHint(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder ?? "Type your answer…"}
            className="flex-1 min-w-[180px] px-3 py-2 rounded-lg text-sm border border-white/20 bg-black/30 focus:outline-none focus:border-white/40"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="px-4 py-2 min-h-10 rounded-lg text-sm font-medium transition-opacity"
            style={{
              background: "var(--accent)",
              color: "#fff",
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Send
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 min-h-10 rounded-lg text-sm cursor-pointer border border-white/20 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
        {showEmptyHint && (
          <p className="mt-2 text-[11px] text-yellow-300/80">
            Please enter a value or press Cancel.
          </p>
        )}
      </div>
    </div>
  );
}
