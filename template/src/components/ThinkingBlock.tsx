"use client";

/**
 * ThinkingBlock
 *
 * Collapsible component that shows reasoning/thinking status and details.
 */

import { useState, useEffect } from "react";

interface ThinkingBlockProps {
  isActive: boolean;
  thinkingLevel: string;
}

function levelLabel(level: string): string {
  if (level === "xhigh") return "max";
  return level;
}

export function ThinkingBlock({ isActive, thinkingLevel }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);

  // Auto-expand when thinking starts
  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  const badgeText = isActive ? "Thinking..." : `Reasoning ready (${levelLabel(thinkingLevel)})`;

  return (
    <div
      className="rounded-lg overflow-hidden text-xs"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-h-11"
        style={{ background: "transparent", color: "var(--foreground)" }}
      >
        <span className={isActive ? "animate-pulse" : "opacity-80"}>🧠</span>
        <span className="font-semibold">{badgeText}</span>
        <span
          className="ml-auto transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div
          className="px-4 pb-3 opacity-60 italic text-[11px] leading-relaxed"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="pt-2">
            Reasoning events are streamed through AG-UI
            {" "}
            <code className="text-purple-400">THINKING_*</code>
            {" "}
            messages. Current level: <span className="text-purple-300 not-italic">{levelLabel(thinkingLevel)}</span>.
          </p>
        </div>
      )}
    </div>
  );
}
