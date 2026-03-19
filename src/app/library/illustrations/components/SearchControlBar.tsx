"use client";

import Link from "next/link";
import { UserRole, can } from "@/lib/permissions";

interface SearchControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  isFilterActive: boolean;
  isDarkView: boolean;
  onToggleDarkView: () => void;
  onUploadClick: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedIdsCount: number;
  onBulkDelete: () => void;
  role: UserRole;
}

export default function SearchControlBar({
  searchQuery, onSearchChange, onFilterClick, isFilterActive, isDarkView, onToggleDarkView,
  onUploadClick, isSelectionMode, onToggleSelectionMode, selectedIdsCount, onBulkDelete, role,
}: SearchControlBarProps) {
  const canUpload = can.upload(role);
  const canDelete = can.delete(role);
  const isAdmin = can.seeAdminUI(role);

  return (
    <div style={{ position: "sticky", top: "60px", zIndex: 1000, backgroundColor: "var(--background)", padding: "24px 0", display: "flex", alignItems: "center", gap: "16px" }}>
      {/* Back */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", textDecoration: "none", flexShrink: 0 }} className="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </Link>

      {/* Search */}
      <div style={{ position: "relative", flex: 1, height: "48px" }}>
        <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search illustrations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: "100%", height: "100%", padding: "0 16px 0 48px", borderRadius: "24px", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px", outline: "none" }}
        />
      </div>

      {isSelectionMode ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{selectedIdsCount} selected</span>
          <button onClick={onToggleSelectionMode} style={{ height: "44px", padding: "0 20px", borderRadius: "22px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer", fontSize: "15px" }}>Cancel</button>
          <button onClick={onBulkDelete} disabled={selectedIdsCount === 0} style={{ height: "44px", padding: "0 20px", borderRadius: "22px", backgroundColor: "#ef4444", color: "#fff", fontWeight: 600, border: "none", fontSize: "15px", cursor: selectedIdsCount === 0 ? "not-allowed" : "pointer", opacity: selectedIdsCount === 0 ? 0.5 : 1 }}>Delete Selected</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
          {/* Light / Dark view toggle */}
          <button
            onClick={onToggleDarkView}
            title={isDarkView ? "Switch to Light view" : "Switch to Dark view"}
            style={{ display: "flex", alignItems: "center", gap: "6px", height: "48px", padding: "0 16px", borderRadius: "24px", border: `1px solid ${isDarkView ? "#6b7280" : "var(--border-color)"}`, backgroundColor: isDarkView ? "#1f2937" : "var(--input-bg)", color: isDarkView ? "#f9fafb" : "var(--text-secondary)", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0 }}
          >
            {isDarkView ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                Dark
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                Light
              </>
            )}
          </button>

          {/* Filter — visible to all */}
          <button
            onClick={onFilterClick}
            title="Filter & Sort"
            style={{ width: "48px", height: "48px", borderRadius: "50%", border: `1px solid ${isFilterActive ? "#7c3aed" : "var(--border-color)"}`, backgroundColor: isFilterActive ? "#ede9fe" : "var(--input-bg)", color: isFilterActive ? "#7c3aed" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>

          {/* Delete (bulk) — CREATOR + SUPERADMIN */}
          {canDelete && (
            <button onClick={onToggleSelectionMode} title="Select to delete" style={{ width: "48px", height: "48px", borderRadius: "50%", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          )}

          {/* Upload — CREATOR + SUPERADMIN */}
          {canUpload && (
            <button
              onClick={onUploadClick}
              style={{ display: "flex", alignItems: "center", height: "48px", padding: "0 28px", borderRadius: "24px", backgroundColor: "#7c3aed", color: "#fff", fontWeight: 600, fontSize: "16px", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(124,58,237,0.2)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(124,58,237,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,58,237,0.2)"; }}
            >
              Upload
            </button>
          )}

          {/* Admin-mode indicator for roles that can see admin UI but not upload/delete */}
          {isAdmin && !canUpload && (
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", padding: "6px 12px", borderRadius: "20px", border: "1px solid var(--border-color)", whiteSpace: "nowrap" }}>
              Admin View
            </span>
          )}
        </div>
      )}
    </div>
  );
}
