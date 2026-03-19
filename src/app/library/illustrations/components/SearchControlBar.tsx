"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserRole, can } from "@/lib/permissions";

export type CardSize = "small" | "normal" | "large";

const SIZE_OPTIONS: { size: CardSize; icon: React.ReactNode }[] = [
  { size: "small", icon: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <rect x="0" y="0" width="4" height="4" rx="0.8"/><rect x="5.5" y="0" width="4" height="4" rx="0.8"/><rect x="11" y="0" width="4" height="4" rx="0.8"/>
      <rect x="0" y="5.5" width="4" height="4" rx="0.8"/><rect x="5.5" y="5.5" width="4" height="4" rx="0.8"/><rect x="11" y="5.5" width="4" height="4" rx="0.8"/>
      <rect x="0" y="11" width="4" height="4" rx="0.8"/><rect x="5.5" y="11" width="4" height="4" rx="0.8"/><rect x="11" y="11" width="4" height="4" rx="0.8"/>
    </svg>
  )},
  { size: "normal", icon: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <rect x="0" y="0" width="6.5" height="6.5" rx="1.2"/><rect x="8.5" y="0" width="6.5" height="6.5" rx="1.2"/>
      <rect x="0" y="8.5" width="6.5" height="6.5" rx="1.2"/><rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1.2"/>
    </svg>
  )},
  { size: "large", icon: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <rect x="0" y="0" width="15" height="6.5" rx="1.5"/>
      <rect x="0" y="8.5" width="15" height="6.5" rx="1.5"/>
    </svg>
  )},
];

function SizeDropdown({ cardSize, onCardSizeChange }: { cardSize: CardSize; onCardSizeChange: (s: CardSize) => void }) {
  const [open, setOpen] = useState(false);
  const current = SIZE_OPTIONS.find(o => o.size === cardSize)!;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Card size"
        style={{ width: "48px", height: "48px", borderRadius: "50%", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        {current.icon}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 999 }} />
          <div style={{ position: "absolute", top: "56px", right: 0, zIndex: 1000, backgroundColor: "var(--background)", border: "1px solid var(--border-color)", borderRadius: "14px", padding: "6px", display: "flex", flexDirection: "column", gap: "2px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            {SIZE_OPTIONS.map(({ size, icon }) => (
              <button
                key={size}
                onClick={() => { onCardSizeChange(size); setOpen(false); }}
                style={{ width: "44px", height: "44px", borderRadius: "10px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: cardSize === size ? "#ede9fe" : "transparent", color: cardSize === size ? "#7c3aed" : "var(--text-secondary)", transition: "background 0.15s" }}
              >
                {icon}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface SearchControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  isFilterActive: boolean;
  onUploadClick: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedIdsCount: number;
  onBulkDelete: () => void;
  role: UserRole;
  cardSize: CardSize;
  onCardSizeChange: (size: CardSize) => void;
}

export default function SearchControlBar({
  searchQuery, onSearchChange, onFilterClick, isFilterActive,
  onUploadClick, isSelectionMode, onToggleSelectionMode, selectedIdsCount, onBulkDelete, role,
  cardSize, onCardSizeChange,
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

          {/* Card size dropdown */}
          <SizeDropdown cardSize={cardSize} onCardSizeChange={onCardSizeChange} />

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
