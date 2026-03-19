"use client";

import { useState, useEffect, useRef } from "react";

export type SortBy = "newest" | "oldest" | "az" | "za";

export interface ViewFilters {
  confirmed: boolean;
  inProgress: boolean;
  underReview: boolean;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  appliedSortBy: SortBy;
  appliedViewFilters: ViewFilters;
  onApply: (sortBy: SortBy, viewFilters: ViewFilters) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];

const VIEW_OPTIONS: { key: keyof ViewFilters; label: string }[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "inProgress", label: "In Progress" },
  { key: "underReview", label: "Under Review" },
];

export default function FilterSidebar({ isOpen, onClose, appliedSortBy, appliedViewFilters, onApply }: FilterSidebarProps) {
  const [sortBy, setSortBy] = useState<SortBy>(appliedSortBy);
  const [viewFilters, setViewFilters] = useState<ViewFilters>(appliedViewFilters);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSortBy(appliedSortBy);
      setViewFilters(appliedViewFilters);
    }
  }, [isOpen, appliedSortBy, appliedViewFilters]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onClose]);

  const toggleView = (key: keyof ViewFilters) =>
    setViewFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const handleApply = () => { onApply(sortBy, viewFilters); onClose(); };

  const handleReset = () => {
    setSortBy("newest");
    setViewFilters({ confirmed: false, inProgress: false, underReview: false });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: "128px",
        right: "20px",
        zIndex: 2100,
        width: "480px",
        backgroundColor: "var(--background)",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
        animation: "filterDropIn 0.18s ease-out",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Filters & Sort</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={handleReset} style={{ background: "none", border: "none", fontSize: "13px", fontWeight: 600, color: "#7c3aed", cursor: "pointer", padding: 0 }}>
            Reset
          </button>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--text-secondary)", lineHeight: 1, padding: 0 }}>
            &times;
          </button>
        </div>
      </div>

      {/* Body — two columns */}
      <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Sort */}
        <div>
          <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Sort
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {SORT_OPTIONS.map(opt => (
              <div
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${sortBy === opt.value ? "#7c3aed" : "var(--border-color)"}`, backgroundColor: sortBy === opt.value ? "#f5f3ff" : "var(--input-bg)", cursor: "pointer", transition: "all 0.15s ease" }}
              >
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0, border: `2px solid ${sortBy === opt.value ? "#7c3aed" : "var(--border-color)"}`, backgroundColor: sortBy === opt.value ? "#7c3aed" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {sortBy === opt.value && <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#fff" }} />}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 500, color: sortBy === opt.value ? "#7c3aed" : "var(--text-primary)", userSelect: "none" }}>
                  {opt.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* View */}
        <div>
          <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            View
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {VIEW_OPTIONS.map(opt => {
              const active = viewFilters[opt.key];
              return (
                <div
                  key={opt.key}
                  onClick={() => toggleView(opt.key)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${active ? "#7c3aed" : "var(--border-color)"}`, backgroundColor: active ? "#f5f3ff" : "var(--input-bg)", cursor: "pointer", transition: "all 0.15s ease" }}
                >
                  <div style={{ width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0, border: `2px solid ${active ? "#7c3aed" : "var(--border-color)"}`, backgroundColor: active ? "#7c3aed" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {active && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: active ? "#7c3aed" : "var(--text-primary)", userSelect: "none" }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Apply */}
      <div style={{ padding: "0 20px 18px" }}>
        <button
          onClick={handleApply}
          style={{ width: "100%", height: "44px", borderRadius: "12px", backgroundColor: "#7c3aed", color: "#fff", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Apply Filter
        </button>
      </div>

      <style>{`
        @keyframes filterDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
