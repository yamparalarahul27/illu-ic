"use client";

import { useState, useEffect } from "react";

export type SortBy = "newest" | "oldest" | "az" | "za";

export interface ViewFilters {
  confirmed: boolean;
  inProgress: boolean;
  updated: boolean;
  underReview: boolean;
  darkOnly: boolean;
  lightOnly: boolean;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  appliedSortBy: SortBy;
  appliedViewFilters: ViewFilters;
  onApply: (sortBy: SortBy, viewFilters: ViewFilters) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest", label: "Newly Added" },
  { value: "oldest", label: "Date Wise (Oldest First)" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];

const VIEW_OPTIONS: { key: keyof ViewFilters; label: string }[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "inProgress", label: "In Progress" },
  { key: "updated", label: "Updated" },
  { key: "underReview", label: "Under Review" },
  { key: "darkOnly", label: "Only Dark Mode" },
  { key: "lightOnly", label: "Only Light Mode" },
];

export default function FilterSidebar({ isOpen, onClose, appliedSortBy, appliedViewFilters, onApply }: FilterSidebarProps) {
  const [sortBy, setSortBy] = useState<SortBy>(appliedSortBy);
  const [viewFilters, setViewFilters] = useState<ViewFilters>(appliedViewFilters);

  // Sync pending state when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setSortBy(appliedSortBy);
      setViewFilters(appliedViewFilters);
    }
  }, [isOpen, appliedSortBy, appliedViewFilters]);

  const toggleView = (key: keyof ViewFilters) => {
    setViewFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = () => {
    onApply(sortBy, viewFilters);
    onClose();
  };

  const handleReset = () => {
    setSortBy("newest");
    setViewFilters({ confirmed: false, inProgress: false, updated: false, underReview: false, darkOnly: false, lightOnly: false });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 2000, transition: "opacity 0.3s ease" }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "320px",
        backgroundColor: "var(--background)", zIndex: 2100,
        boxShadow: "-4px 0 32px rgba(0,0,0,0.1)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "28px 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>Filters</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleReset}
              style={{ background: "none", border: "none", fontSize: "13px", fontWeight: 600, color: "#7c3aed", cursor: "pointer", padding: 0 }}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-secondary)", lineHeight: 1, padding: 0 }}
            >
              &times;
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Organize */}
          <div>
            <p style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Organize
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {SORT_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", borderRadius: "12px",
                    border: `1px solid ${sortBy === opt.value ? "#7c3aed" : "var(--border-color)"}`,
                    backgroundColor: sortBy === opt.value ? "#f5f3ff" : "var(--input-bg)",
                    cursor: "pointer", transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${sortBy === opt.value ? "#7c3aed" : "var(--border-color)"}`,
                    backgroundColor: sortBy === opt.value ? "#7c3aed" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}>
                    {sortBy === opt.value && (
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ffffff" }} />
                    )}
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 500, color: sortBy === opt.value ? "#7c3aed" : "var(--text-primary)", userSelect: "none" }}>
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* View */}
          <div>
            <p style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              View
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {VIEW_OPTIONS.map(opt => {
                const active = viewFilters[opt.key];
                return (
                  <div
                    key={opt.key}
                    onClick={() => toggleView(opt.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 14px", borderRadius: "12px",
                      border: `1px solid ${active ? "#7c3aed" : "var(--border-color)"}`,
                      backgroundColor: active ? "#f5f3ff" : "var(--input-bg)",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                      border: `2px solid ${active ? "#7c3aed" : "var(--border-color)"}`,
                      backgroundColor: active ? "#7c3aed" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}>
                      {active && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 500, color: active ? "#7c3aed" : "var(--text-primary)", userSelect: "none" }}>
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border-color)" }}>
          <button
            onClick={handleApply}
            style={{
              width: "100%", height: "48px", borderRadius: "14px",
              backgroundColor: "#7c3aed", color: "#ffffff",
              border: "none", fontWeight: 700, fontSize: "16px",
              cursor: "pointer", transition: "opacity 0.2s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </>
  );
}
