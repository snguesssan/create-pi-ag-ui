"use client";

/**
 * ThinkingPicker — compact inline thinking-level selector.
 * Same visual style as ModelPicker.
 */

import { useState, useEffect, useCallback } from "react";

type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

interface ThinkingData {
  levels: ThinkingLevel[];
  current: ThinkingLevel;
}

interface ThinkingPickerProps {
  threadId?: string;
  isStreaming?: boolean;
  onChanged?: (level: ThinkingLevel) => void;
}

const LABELS: Record<ThinkingLevel, string> = {
  off: "Off",
  minimal: "Minimal",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Max",
};

export function ThinkingPicker({ threadId, isStreaming = false, onChanged }: ThinkingPickerProps) {
  const [data, setData] = useState<ThinkingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!threadId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/thinking?threadId=${encodeURIComponent(threadId)}`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => { load(); }, [load]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value as ThinkingLevel;
    if (!level) return;
    try {
      setSwitching(true);
      setError(null);
      const res = await fetch("/api/thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, threadId: threadId ?? "default" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      const result = await res.json();
      setData({ levels: result.levels, current: result.level });
      onChanged?.(result.level);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSwitching(false);
    }
  };

  if (!threadId) return <span className="opacity-50">start chat…</span>;
  if (loading) return <span className="opacity-40 animate-pulse">…</span>;
  if (error) return <span className="text-red-400 opacity-50" title={error}>err</span>;
  if (!data || data.levels.length <= 1) {
    return <span className="text-purple-400">{LABELS[data?.current ?? "off"]}</span>;
  }

  const disabled = isStreaming || switching;

  return (
    <select
      value={data.current}
      onChange={handleChange}
      disabled={disabled}
      className={[
        "bg-transparent rounded-md text-xs font-mono px-2 h-9",
        "focus:outline-none min-w-0",
        "border",
        "text-purple-400",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
      style={{
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
        borderColor: "var(--border)",
      }}
      title={disabled ? "Wait…" : "Thinking level"}
    >
      {data.levels.map((l) => (
        <option key={l} value={l}>{LABELS[l]}</option>
      ))}
    </select>
  );
}
