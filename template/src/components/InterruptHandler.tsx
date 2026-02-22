"use client";

/**
 * InterruptHandler — Handles LangGraph-style interrupts from the agent.
 *
 * Replaces window.confirm() and window.prompt() with styled React components
 * rendered inline in the chat via CopilotKit's interrupt mechanism.
 */

import { useLangGraphInterrupt } from "@copilotkit/react-core";
import { useState } from "react";

export function InterruptHandler() {
  useLangGraphInterrupt({
    // The handler is called when an interrupt arrives, render shows UI
    render: ({ event, resolve }) => {
      const value = event.value as {
        type?: "confirm" | "input";
        question?: string;
        importance?: string;
        placeholder?: string;
      };

      if (value?.type === "confirm") {
        return (
          <ConfirmDialog
            question={value.question ?? "Do you want to proceed?"}
            importance={value.importance}
            onResolve={resolve}
          />
        );
      }

      if (value?.type === "input") {
        return (
          <InputDialog
            question={value.question ?? "Please provide input:"}
            placeholder={value.placeholder}
            onResolve={resolve}
          />
        );
      }

      // Fallback — generic confirm
      return (
        <ConfirmDialog
          question={typeof value === "string" ? value : JSON.stringify(value)}
          onResolve={resolve}
        />
      );
    },
  });

  return null;
}

// ─── Confirm Dialog ──────────────────────────────────────────────

function ConfirmDialog({
  question,
  importance,
  onResolve,
}: {
  question: string;
  importance?: string;
  onResolve: (value: string) => void;
}) {
  const [resolved, setResolved] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const icon =
    importance === "critical" ? "🔴" :
    importance === "high" ? "🟠" :
    importance === "medium" ? "🟡" : "🔵";

  const handle = (confirmed: boolean) => {
    const result = confirmed ? "User confirmed the action" : "User denied the action";
    setAnswer(result);
    setResolved(true);
    onResolve(result);
  };

  return (
    <div className="my-3 rounded-xl border-2 border-white/15 overflow-hidden" style={{ background: "var(--msg-assistant)" }}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 text-sm font-medium">
        <span>{icon}</span>
        <span>Confirmation Required</span>
        {importance && <span className="text-xs opacity-50">({importance})</span>}
      </div>
      <div className="px-4 py-3">
        <p className="text-sm mb-3">{question}</p>
        {!resolved ? (
          <div className="flex gap-2">
            <button
              onClick={() => handle(true)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              ✓ Confirm
            </button>
            <button
              onClick={() => handle(false)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors border border-white/20 hover:bg-white/10"
            >
              ✕ Deny
            </button>
          </div>
        ) : (
          <div className="text-xs opacity-60 italic">{answer}</div>
        )}
      </div>
    </div>
  );
}

// ─── Input Dialog ────────────────────────────────────────────────

function InputDialog({
  question,
  placeholder,
  onResolve,
}: {
  question: string;
  placeholder?: string;
  onResolve: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const [resolved, setResolved] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const submit = () => {
    const result = value.trim() || "User cancelled input";
    setAnswer(result);
    setResolved(true);
    onResolve(result);
  };

  const cancel = () => {
    setAnswer("User cancelled input");
    setResolved(true);
    onResolve("User cancelled input");
  };

  return (
    <div className="my-3 rounded-xl border-2 border-white/15 overflow-hidden" style={{ background: "var(--msg-assistant)" }}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 text-sm font-medium">
        <span>💬</span>
        <span>Input Required</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm mb-3">{question}</p>
        {!resolved ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={placeholder ?? "Type your answer…"}
              autoFocus
              className="flex-1 px-3 py-1.5 rounded-lg text-sm border border-white/20 bg-black/30 focus:outline-none focus:border-white/40"
            />
            <button
              onClick={submit}
              className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Send
            </button>
            <button
              onClick={cancel}
              className="px-3 py-1.5 rounded-lg text-sm cursor-pointer border border-white/20 hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-xs opacity-60 italic">{answer}</div>
        )}
      </div>
    </div>
  );
}
