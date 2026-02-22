"use client";

/**
 * ModelPicker — compact inline model selector for the AgentStatePanel.
 * Fits within the sidebar card as a single line: "Model: [select ▾]"
 */

import { useState, useEffect, useCallback } from "react";

interface ModelInfo {
  provider: string;
  id: string;
  name: string;
  reasoning: boolean;
}

interface ModelsData {
  models: ModelInfo[];
  current: { provider: string; id: string } | null;
}

interface ModelPickerProps {
  threadId?: string;
  isStreaming?: boolean;
  onModelChanged?: (model: { provider: string; id: string; name: string }) => void;
}

/** Shorten model display names for the dropdown */
function shortName(model: ModelInfo): string {
  // Strip common prefixes, keep it short
  let name = model.name || model.id;
  // "Claude Sonnet 4 (20250514)" → "Sonnet 4"
  name = name
    .replace(/^Claude\s+/i, "")
    .replace(/^GPT-/i, "GPT-")
    .replace(/\s*\(.*\)$/, "")
    .replace(/-\d{8}$/, "");
  return name;
}

export function ModelPicker({ threadId, isStreaming = false, onModelChanged }: ModelPickerProps) {
  const [data, setData] = useState<ModelsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModels = useCallback(async () => {
    if (!threadId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/models?threadId=${encodeURIComponent(threadId)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => { loadModels(); }, [loadModels]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || !data) return;

    const [provider, ...rest] = value.split("/");
    const modelId = rest.join("/");

    try {
      setSwitching(true);
      setError(null);
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, modelId, threadId: threadId ?? "default" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Switch failed");
      }
      const result = await res.json();
      setData({ models: result.models, current: result.current });
      if (result.success && result.model) onModelChanged?.(result.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Switch failed");
    } finally {
      setSwitching(false);
    }
  };

  // ─── Render states ───────────────────────────────────────────

  if (!threadId) {
    return <div className="opacity-50">Model: start chat…</div>;
  }

  if (loading) {
    return (
      <div className="opacity-50 animate-pulse">
        Model: …
      </div>
    );
  }

  if (error) {
    return (
      <div className="opacity-50" title={error}>
        Model: <span className="text-red-400">error</span>
      </div>
    );
  }

  if (!data?.models.length) {
    return <div className="opacity-50">Model: none available</div>;
  }

  // Single model — read-only
  if (data.models.length === 1) {
    const m = data.models[0];
    return (
      <div className="opacity-70">
        Model: <span className="text-blue-400">{shortName(m)}</span>
        {m.reasoning && " 🧠"}
      </div>
    );
  }

  // Multi-model — dropdown
  const currentValue = data.current ? `${data.current.provider}/${data.current.id}` : "";
  const disabled = isStreaming || switching;

  // Group by provider
  const groups: Record<string, ModelInfo[]> = {};
  for (const m of data.models) {
    (groups[m.provider] ??= []).push(m);
  }

  return (
    <div className="flex items-center gap-1.5 opacity-70 min-h-11 max-w-full">
      <span className="shrink-0">{switching ? "🔄" : "Model:"}</span>
      <select
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className={[
          "bg-transparent rounded-md text-xs font-mono px-2 h-9",
          "focus:outline-none min-w-0 max-w-[62vw] sm:max-w-[280px] truncate",
          "border",
          "text-blue-400",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        style={{
          WebkitAppearance: "none",
          MozAppearance: "none",
          appearance: "none",
          borderColor: "var(--border)",
        }}
        title={disabled ? (isStreaming ? "Wait for response" : "Switching…") : "Switch model"}
      >
        {Object.keys(groups).sort().map((provider) => (
          <optgroup key={provider} label={provider}>
            {groups[provider].map((m) => (
              <option key={`${m.provider}/${m.id}`} value={`${m.provider}/${m.id}`}>
                {shortName(m)}{m.reasoning ? " 🧠" : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span className="text-[10px] opacity-50">▾</span>
    </div>
  );
}
