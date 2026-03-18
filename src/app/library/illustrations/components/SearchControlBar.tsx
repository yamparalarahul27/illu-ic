"use client";

import Link from "next/link";

interface SearchControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: "light" | "dark" | "all";
  onFilterChange: (mode: "light" | "dark" | "all") => void;
  onUploadClick: () => void;
}

export default function SearchControlBar({ searchQuery, onSearchChange, filterMode, onFilterChange, onUploadClick }: SearchControlBarProps) {
  const cycleFilter = () => {
    if (filterMode === "light") onFilterChange("dark");
    else if (filterMode === "dark") onFilterChange("all");
    else onFilterChange("light");
  };

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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--input-bg)",
          color: "var(--text-primary)",
          textDecoration: "none",
          transition: "background-color 0.2s ease",
          flexShrink: 0
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
          position: "absolute",
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-secondary)",
          pointerEvents: "none"
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
            width: "100%",
            height: "100%",
            padding: "0 16px 0 48px",
            borderRadius: "24px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
            fontSize: "16px",
            outline: "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={cycleFilter}
        title={
          filterMode === "light" ? "Switch to Dark illustrations" :
          filterMode === "dark" ? "Show All illustrations" :
          "Switch to Light illustrations"
        }
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "1px solid var(--border-color)",
          backgroundColor:
            filterMode === "light" ? "#fef3c7" :
            filterMode === "dark" ? "#1e1b4b" :
            "var(--input-bg)",
          color:
            filterMode === "light" ? "#d97706" :
            filterMode === "dark" ? "#818cf8" :
            "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          flexShrink: 0,
          boxShadow:
            filterMode === "light" ? "0 4px 12px rgba(217, 119, 6, 0.15)" :
            filterMode === "dark" ? "0 4px 12px rgba(30, 27, 75, 0.3)" :
            "none"
        }}
      >
        {filterMode === "light" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : filterMode === "dark" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        )}
      </button>

      {/* Upload Button */}
      <button
        onClick={onUploadClick}
        style={{
          display: "flex",
          alignItems: "center",
          height: "48px",
          padding: "0 28px",
          borderRadius: "24px",
          backgroundColor: "#7c3aed",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "16px",
          border: "none",
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
          flexShrink: 0
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
  );
}
