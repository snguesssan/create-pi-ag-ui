"use client";

import { useEffect } from "react";

interface MobileSidebarDrawerProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * MobileSidebarDrawer
 *
 * Right-side drawer used under lg breakpoint.
 * - closes on overlay click
 * - closes on Escape
 * - locks body scroll while open
 */
export function MobileSidebarDrawer({
  open,
  title = "Panels",
  onClose,
  children,
}: MobileSidebarDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close side panel"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <aside
        className="absolute right-0 top-0 h-full w-[min(90vw,360px)] flex flex-col"
        style={{
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.35)",
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="px-3 pb-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md px-3 min-h-11 text-sm font-medium"
            style={{ border: "1px solid var(--border)" }}
          >
            Fermer
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {children}
        </div>
      </aside>
    </div>
  );
}
