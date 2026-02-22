"use client";

/**
 * PiAgentProvider
 *
 * Wraps children with CopilotKit pointed at the local Next.js API route,
 * which hosts the CopilotKit runtime + our PiAgUiAgent (AbstractAgent).
 */

import { CopilotKit } from "@copilotkit/react-core";
import { type ReactNode } from "react";

interface PiAgentProviderProps {
  children: ReactNode;
  threadId?: string;
}

export function PiAgentProvider({ children, threadId }: PiAgentProviderProps) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="pi-agent"
      threadId={threadId}
    >
      {children}
    </CopilotKit>
  );
}
