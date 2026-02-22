"use client";

/**
 * ChatToolbar — compact bar above chat with model + thinking pickers.
 */

import { useCoAgent } from "@copilotkit/react-core";
import { ModelPicker } from "./ModelPicker";
import { ThinkingPicker } from "./ThinkingPicker";

interface ToolbarState {
  isStreaming: boolean;
  threadId?: string;
}

export function ChatToolbar() {
  const { state } = useCoAgent<ToolbarState>({
    name: "pi-agent",
    initialState: { isStreaming: false, threadId: undefined },
  });

  const isStreaming = Boolean(state?.isStreaming);
  const threadId = state?.threadId;

  return (
    <div
      className="px-3 sm:px-4 py-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="min-h-11 flex items-center">
        <ModelPicker threadId={threadId} isStreaming={isStreaming} />
      </div>

      <div className="min-h-11 flex items-center gap-1.5 opacity-70">
        <span>Thinking:</span>
        <ThinkingPicker threadId={threadId} isStreaming={isStreaming} />
        <span className="text-[10px] opacity-50">▾</span>
      </div>

    </div>
  );
}
