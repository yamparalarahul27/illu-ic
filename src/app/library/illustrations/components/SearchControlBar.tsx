"use client";

import Link from "next/link";

interface SearchControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: "light" | "dark" | "all";
  onFilterChange: (mode: "light" | "dark" | "all") => void;
  onUploadClick: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedIdsCount: number;
  onBulkDelete: () => void;
}

export default function SearchControlBar({
  searchQuery, onSearchChange, filterMode, onFilterChange, onUploadClick,
  isSelectionMode, onToggleSelectionMode, selectedIdsCount, onBulkDelete
}: SearchControlBarProps) {

  return (
    <div style={{
      position: "sticky",
      top: "60px",
      zIndex: 1000,
      backgroundColor: "var(--background)",
      padding: "24px 0",
      display: "flex",
      alignItems: "center",
      gap: "16px"
    }}>
      {/* Back Link */}
      <Link
        href="/dashboard"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "48px", height: "48px", borderRadius: "50%",
          backgroundColor: "var(--input-bg)", color: "var(--text-primary)",
          textDecoration: "none", transition: "background-color 0.2s ease", flexShrink: 0
        }}
        className="back-btn"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </Link>

      {/* Search Input */}
      <div style={{ position: "relative", flex: 1, height: "48px" }}>
        <div style={{
          position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)",
          color: "var(--text-secondary)", pointerEvents: "none"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search illustrations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%", height: "100%", padding: "0 16px 0 48px",
            borderRadius: "24px", border: "1px solid var(--border-color)",
            backgroundColor: "var(--input-bg)", color: "var(--text-primary)",
            fontSize: "16px", outline: "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
        />
      </div>

      {isSelectionMode ? (
        /* Selection mode bar */
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            {selectedIdsCount} selected
          </span>
          <button
            onClick={onToggleSelectionMode}
            style={{
              height: "44px", padding: "0 20px", borderRadius: "22px",
              border: "1px solid var(--border-color)", background: "var(--input-bg)",
              color: "var(--text-primary)", fontWeight: 600, cursor: "pointer", fontSize: "15px"
            }}
          >
            Cancel
          </button>
          <button
            onClick={onBulkDelete}
            disabled={selectedIdsCount === 0}
            style={{
              height: "44px", padding: "0 20px", borderRadius: "22px",
              backgroundColor: "#ef4444", color: "#ffffff",
              fontWeight: 600, border: "none", fontSize: "15px",
              cursor: selectedIdsCount === 0 ? "not-allowed" : "pointer",
              opacity: selectedIdsCount === 0 ? 0.5 : 1,
              transition: "opacity 0.2s ease"
            }}
          >
            Delete Selected
          </button>
        </div>
      ) : (
        /* Normal mode buttons */
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
          {/* Trash icon to enter selection mode */}
          <button
            onClick={onToggleSelectionMode}
            title="Select illustrations to delete"
            style={{
              width: "48px", height: "48px", borderRadius: "50%",
              border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)",
              color: "var(--text-secondary)", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>

          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            style={{
              display: "flex", alignItems: "center", height: "48px", padding: "0 28px",
              borderRadius: "24px", backgroundColor: "#7c3aed", color: "#ffffff",
              fontWeight: 600, fontSize: "16px", border: "none", cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(124, 58, 237, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.2)";
            }}
          >
            Upload
          </button>
        </div>
      )}
    </div>
  );
}

