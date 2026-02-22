"use client";

interface MessageSkeletonProps {
  className?: string;
}

export function MessageSkeleton({ className }: MessageSkeletonProps) {
  return (
    <div className={`copilotKitMessage copilotKitAssistantMessage ${className ?? ""}`} aria-hidden="true">
      <div className="w-full max-w-xl space-y-2">
        <div className="h-3 w-11/12 rounded animate-pulse" style={{ background: "var(--border)" }} />
        <div className="h-3 w-8/12 rounded animate-pulse" style={{ background: "var(--border)", animationDelay: "120ms" }} />
        <div className="h-3 w-9/12 rounded animate-pulse" style={{ background: "var(--border)", animationDelay: "220ms" }} />
      </div>
    </div>
  );
}
