"use client";

/**
 * ChatUI
 *
 * Main chat interface using CopilotKit's chat component.
 * Demonstrates:
 * - Streaming text messages
 * - Tool call visualization (useRenderToolCall)
 * - Reasoning/thinking display
 * - Activity messages
 * - Feedback (thumbs up/down)
 */

import { useAgentState } from "@/lib/agent-state-context";
import { CopilotChat, AssistantMessage as CopilotAssistantMessage } from "@copilotkit/react-ui";
import type { AssistantMessageProps } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import type { Message } from "@ag-ui/core";
import { useState, useCallback, useEffect, useRef } from "react";
import { MessageSkeleton } from "./chat/MessageSkeleton";
import { StreamingIndicator, type StreamingIndicatorState } from "./chat/StreamingIndicator";

type ChatInlineError = {
  message: string;
  operation?: string;
  timestamp: number;
  onDismiss: () => void;
  onRetry?: () => void;
};

type FriendlyError = {
  title: string;
  userMessage: string;
  hint?: string;
  technicalDetail?: string;
};

function formatChatError(error: Pick<ChatInlineError, "message" | "operation" | "timestamp">): FriendlyError {
  const rawMessage = (error.message ?? "").trim();
  const lower = rawMessage.toLowerCase();

  const technicalDetail = [
    error.operation ? `operation=${error.operation}` : "",
    rawMessage || "no-message",
  ]
    .filter(Boolean)
    .join(" | ");

  if (/api[\s_-]?key|anthropic_api_key|openai_api_key|google_api_key|no api key|missing key|unauthorized|forbidden|authentication|401/.test(lower)) {
    return {
      title: "Clé API manquante ou invalide",
      userMessage: "Ajoutez une clé API valide dans votre environnement, puis relancez la requête.",
      hint: "Astuce : vérifiez votre fichier .env.local et redémarrez le serveur si nécessaire.",
      technicalDetail,
    };
  }

  if (/timeout|timed out|etimedout|econnreset|network|fetch failed|gateway timeout|503/.test(lower)) {
    return {
      title: "La requête a expiré",
      userMessage: "Le service a mis trop de temps à répondre. Vous pouvez réessayer.",
      hint: "Si le problème persiste, vérifiez votre connexion réseau et l'état du provider.",
      technicalDetail,
    };
  }

  if (!rawMessage) {
    return {
      title: "Erreur inconnue",
      userMessage: "Une erreur inattendue est survenue. Réessayez dans quelques instants.",
      technicalDetail,
    };
  }

  return {
    title: "Impossible de terminer la requête",
    userMessage: "Une erreur est survenue pendant l'exécution. Vous pouvez réessayer.",
    technicalDetail,
  };
}

function isRunningStatus(status: string): boolean {
  return status === "running" || status === "executing" || status === "inProgress";
}

function useStableVisibility(
  active: boolean,
  { showDelayMs = 120, minVisibleMs = 220 }: { showDelayMs?: number; minVisibleMs?: number } = {},
): boolean {
  const [visible, setVisible] = useState(false);
  const visibleSinceRef = useRef<number | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (active) {
      if (visible) return;
      showTimerRef.current = setTimeout(() => {
        visibleSinceRef.current = Date.now();
        setVisible(true);
      }, showDelayMs);
      return;
    }

    if (!visible) return;
    const elapsed = visibleSinceRef.current ? Date.now() - visibleSinceRef.current : 0;
    const delay = Math.max(0, minVisibleMs - elapsed);

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      visibleSinceRef.current = null;
    }, delay);
  }, [active, visible, showDelayMs, minVisibleMs]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return visible;
}

function AssistantMessageWithSkeleton(props: AssistantMessageProps) {
  const showSkeleton = useStableVisibility(props.isLoading, {
    showDelayMs: 120,
    minVisibleMs: 200,
  });

  if (showSkeleton) {
    return <MessageSkeleton />;
  }

  return <CopilotAssistantMessage {...props} />;
}

export function ChatUI() {
  const [feedback, setFeedback] = useState<Record<string, "thumbsUp" | "thumbsDown">>({});
  const [chatInProgress, setChatInProgress] = useState(false);
  const [lastIndicatorState, setLastIndicatorState] = useState<Exclude<StreamingIndicatorState, "idle">>("thinking");

  const agentState = useAgentState();
  const isStreaming = agentState?.isStreaming ?? false;
  const activities = agentState?.activities ?? [];

  const hasRunningActivities = activities.some((activity) => isRunningStatus(activity.status));

  const targetIndicatorState: StreamingIndicatorState = hasRunningActivities
    ? "tool-running"
    : (chatInProgress || isStreaming ? "thinking" : "idle");

  const indicatorVisible = useStableVisibility(targetIndicatorState !== "idle", {
    showDelayMs: 250,
    minVisibleMs: 260,
  });

  useEffect(() => {
    if (targetIndicatorState !== "idle") {
      setLastIndicatorState(targetIndicatorState);
    }
  }, [targetIndicatorState]);

  const indicatorState: StreamingIndicatorState = indicatorVisible
    ? (targetIndicatorState === "idle" ? lastIndicatorState : targetIndicatorState)
    : "idle";

  const handleThumbsUp = useCallback((message: Message) => {
    setFeedback((prev) => ({ ...prev, [message.id]: "thumbsUp" }));
    console.log(`[Feedback] 👍 message=${message.id}`);
  }, []);

  const handleThumbsDown = useCallback((message: Message) => {
    setFeedback((prev) => ({ ...prev, [message.id]: "thumbsDown" }));
    console.log(`[Feedback] 👎 message=${message.id}`);
  }, []);

  const renderChatError = useCallback((error: ChatInlineError) => {
    const friendly = formatChatError(error);

    return (
      <div className="my-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
        <div className="font-semibold text-red-300">⚠️ {friendly.title}</div>
        <p className="mt-1 text-red-100/90">{friendly.userMessage}</p>
        {friendly.hint && <p className="mt-1 text-xs text-red-100/70">{friendly.hint}</p>}

        <div className="mt-2 flex items-center gap-2">
          {error.onRetry && (
            <button
              type="button"
              onClick={error.onRetry}
              className="rounded border border-red-300/40 px-2.5 py-1.5 min-h-9 text-xs text-red-100 hover:bg-red-500/20"
            >
              Réessayer
            </button>
          )}
          <button
            type="button"
            onClick={error.onDismiss}
            className="rounded border border-white/20 px-2.5 py-1.5 min-h-9 text-xs text-white/80 hover:bg-white/10"
          >
            Fermer
          </button>
          {friendly.technicalDetail && (
            <span className="ml-auto cursor-help text-[11px] text-white/50" title={friendly.technicalDetail}>
              Détail technique
            </span>
          )}
        </div>
      </div>
    );
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <StreamingIndicator state={indicatorState} className="mx-3 sm:mx-4 mt-2" />

      <CopilotChat
        className="flex-1 min-h-0 agui-mobile-chat"
        instructions="You are Pi, a helpful coding assistant. You can use frontend tools like showing notifications, toggling themes, managing bookmarks, showing data tables, and asking users for confirmation. Be helpful and concise."
        onInProgress={setChatInProgress}
        onThumbsUp={handleThumbsUp}
        onThumbsDown={handleThumbsDown}
        AssistantMessage={AssistantMessageWithSkeleton}
        renderError={renderChatError}
        onError={(errorEvent) => {
          const message = errorEvent.error instanceof Error
            ? errorEvent.error.message
            : typeof errorEvent.error === "string"
              ? errorEvent.error
              : JSON.stringify(errorEvent.error ?? "unknown");
          console.warn("[ChatUI] Copilot error", {
            type: errorEvent.type,
            operation: errorEvent.context?.request?.operation,
            message,
          });
        }}
        labels={{
          title: "Pi Agent",
          initial: "Hi! I'm Pi, your AI assistant. I can help you with tasks and use various tools. Try asking me to:\n\n• Show a notification\n• Toggle the theme\n• Show a table of planets\n• Ask you to confirm something\n• Copy text to clipboard\n\nWhat would you like to do?",
          placeholder: "Ask Pi anything...",
        }}
      />
    </div>
  );
}


