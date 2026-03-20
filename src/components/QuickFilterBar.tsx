"use client";

import { ViewFilters } from "@/app/library/illustrations/components/FilterSidebar";

interface QuickFilterBarProps {
  viewFilters: ViewFilters;
  onChange: (filters: ViewFilters) => void;
  visible: boolean;
}

const CHIPS: { key: keyof ViewFilters; label: string; color: string; bg: string; activeBg: string }[] = [
  { key: "confirmed",   label: "Confirmed",    color: "#15803d", bg: "#f0fdf4", activeBg: "#16a34a" },
  { key: "inProgress",  label: "In Progress",  color: "#1d4ed8", bg: "#eff6ff", activeBg: "#2563eb" },
  { key: "underReview", label: "Under Review", color: "#92400e", bg: "#fffbeb", activeBg: "#d97706" },
];

export default function QuickFilterBar({ viewFilters, onChange, visible }: QuickFilterBarProps) {
  if (!visible) return null;

  const toggle = (key: keyof ViewFilters) =>
    onChange({ ...viewFilters, [key]: !viewFilters[key] });

  return (
    <div style={{
      position: "sticky",
      top: "60px",
      zIndex: 1500,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 0 10px",
      backgroundColor: "var(--background)",
      borderBottom: "1px solid var(--border-color)",
      marginBottom: "8px",
    }}>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
        Filter
      </span>
      {CHIPS.map(({ key, label, color, bg, activeBg }) => {
        const active = viewFilters[key];
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 14px",
              borderRadius: "999px",
              border: `1.5px solid ${active ? activeBg : "var(--border-color)"}`,
              backgroundColor: active ? activeBg : "var(--input-bg)",
              color: active ? "#fff" : color,
              fontSize: "12px", fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
              boxShadow: active ? `0 2px 8px ${activeBg}55` : "none",
            }}
          >
            <span style={{
              width: "7px", height: "7px", borderRadius: "50%",
              backgroundColor: active ? "#fff" : activeBg,
              flexShrink: 0,
              transition: "background-color 0.15s ease",
            }} />
            {label}
          </button>
        );
      })}

      {Object.values(viewFilters).some(Boolean) && (
        <button
          onClick={() => onChange({ confirmed: false, inProgress: false, underReview: false })}
          style={{
            padding: "5px 12px", borderRadius: "999px",
            border: "1.5px solid var(--border-color)",
            backgroundColor: "transparent",
            color: "var(--text-secondary)",
            fontSize: "12px", fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
