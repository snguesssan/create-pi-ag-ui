"use client";

/**
 * Main page — Pi AG-UI Frontend
 *
 * Combines:
 * - CopilotKit provider (AG-UI connection)
 * - Frontend tools (actions)
 * - Chat UI
 * - Agent state panel
 */

import { useEffect, useState } from "react";
import { PiAgentProvider } from "@/components/PiAgentProvider";
import { FrontendTools } from "@/components/FrontendTools";
import { ToolRenderers } from "@/components/ToolRenderers";
import { ChatUI } from "@/components/ChatUI";
import { AgentStatePanel } from "@/components/AgentStatePanel";
import { AgentExtrasPanel } from "@/components/AgentExtrasPanel";
import { ChatToolbar } from "@/components/ChatToolbar";
import { ThreadSwitcher } from "@/components/ThreadSwitcher";
import { MobileSidebarDrawer } from "@/components/layout/MobileSidebarDrawer";
import { AgentStateProvider } from "@/lib/agent-state-context";

function SidebarContent() {
  return (
    <>
      <AgentStatePanel />
      <AgentExtrasPanel />

      {/* AG-UI Features Info */}
      <div
        className="rounded-lg p-4 text-xs space-y-2"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-sm font-bold mb-3 opacity-70">
          ✨ AG-UI Features
        </h3>
        <ul className="space-y-1 opacity-60">
          <li>✅ Streaming chat (CHUNK)</li>
          <li>✅ Frontend tools + inline UI</li>
          <li>✅ Shared state (snapshot + delta)</li>
          <li>✅ Human-in-the-loop (React)</li>
          <li>✅ Reasoning/Thinking UI</li>
          <li>✅ Activity events</li>
          <li>✅ Custom events</li>
          <li>✅ Generative UI (tool renders)</li>
          <li>✅ Middleware (log, metrics, filter)</li>
          <li>⬜ Backend coding tools</li>
        </ul>
      </div>

      {/* Instructions */}
      <div
        className="rounded-lg p-4 text-xs space-y-2"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="text-sm font-bold mb-3 opacity-70">
          🧪 Try these
        </h3>
        <ul className="space-y-1 opacity-60 list-disc pl-4">
          <li>&quot;Show me a success notification&quot;</li>
          <li>&quot;Switch to light theme&quot;</li>
          <li>&quot;Show a table of 3 planets&quot;</li>
          <li>&quot;Ask me to confirm something&quot;</li>
          <li>&quot;Ask me a question&quot;</li>
        </ul>
      </div>
    </>
  );
}

const THREADS_STORAGE_KEY = "pi-ag-ui:thread-list";
const ACTIVE_THREAD_STORAGE_KEY = "pi-ag-ui:active-thread";

function createThreadId(): string {
  return `thread_${Math.random().toString(36).slice(2, 8)}`;
}

export default function Home() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [threads, setThreads] = useState<string[]>(["default"]);
  const [activeThreadId, setActiveThreadId] = useState<string>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawThreads = window.localStorage.getItem(THREADS_STORAGE_KEY);
    const rawActiveThread = window.localStorage.getItem(ACTIVE_THREAD_STORAGE_KEY);

    if (rawThreads) {
      try {
        const parsed = JSON.parse(rawThreads) as unknown;
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((value): value is string => typeof value === "string" && value.length > 0)
            .slice(0, 12);
          const withDefault = cleaned.includes("default") ? cleaned : ["default", ...cleaned];
          setThreads(withDefault);

          const nextActive = rawActiveThread && withDefault.includes(rawActiveThread)
            ? rawActiveThread
            : withDefault[0] ?? "default";
          setActiveThreadId(nextActive);
          return;
        }
      } catch {
        // fallback below
      }
    }

    setThreads(["default"]);
    setActiveThreadId("default");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    window.localStorage.setItem(ACTIVE_THREAD_STORAGE_KEY, activeThreadId);
  }, [threads, activeThreadId]);

  const handleCreateThread = () => {
    const newThreadId = createThreadId();
    setThreads((previous) => [newThreadId, ...previous.filter((thread) => thread !== newThreadId)].slice(0, 12));
    setActiveThreadId(newThreadId);
  };

  const handleSelectThread = (threadId: string) => {
    setThreads((previous) => (previous.includes(threadId) ? previous : [threadId, ...previous].slice(0, 12)));
    setActiveThreadId(threadId);
  };

  return (
    <PiAgentProvider threadId={activeThreadId}>
      {/* Single coagent state hook — feeds AgentStateContext for all consumers */}
      <AgentStateProvider>
        {/* Invisible components — register CopilotKit actions & renderers */}
        <FrontendTools />
        <ToolRenderers />

        <div className="h-[100dvh] lg:h-screen flex overflow-hidden">
          {/* Main chat area */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Header */}
            <header
              className="px-4 sm:px-6 pb-3 sm:pb-4 flex flex-wrap items-center gap-3"
              style={{
                borderBottom: "1px solid var(--border)",
                paddingTop: "max(0.75rem, env(safe-area-inset-top))",
              }}
            >
              <div className="text-2xl">π</div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold truncate">Pi AG-UI</h1>
                <p className="text-xs opacity-50 hidden sm:block">
                  Agent-User Interaction Protocol
                </p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <ThreadSwitcher
                  threads={threads}
                  activeThreadId={activeThreadId}
                  onSelectThread={handleSelectThread}
                  onCreateThread={handleCreateThread}
                />

                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden rounded-md px-3 min-h-11 text-xs font-mono"
                  style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                >
                  Panels
                </button>
              </div>
            </header>

            {/* Toolbar — model + thinking pickers */}
            <ChatToolbar />

            {/* Chat */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatUI />
            </div>
          </div>

          {/* Desktop sidebar */}
          <aside
            className="hidden lg:flex w-80 xl:w-96 p-4 flex-col gap-4 overflow-y-auto"
            style={{ borderLeft: "1px solid var(--border)" }}
          >
            <SidebarContent />
          </aside>
        </div>

        {/* Mobile sidebar drawer */}
        <MobileSidebarDrawer
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          title="Agent panels"
        >
          <SidebarContent />
        </MobileSidebarDrawer>
      </AgentStateProvider>
    </PiAgentProvider>
  );
}
