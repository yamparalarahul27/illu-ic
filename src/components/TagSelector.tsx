"use client";

import { useState } from "react";

interface TagSelectorProps {
  value: string;
  onChange: (tag: string) => void;
  availableTags: string[];
  onNewTag?: (tag: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function TagSelector({ value, onChange, availableTags, onNewTag, required, disabled }: TagSelectorProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "__ADD_NEW__") {
      setIsAddingNew(true);
    } else {
      onChange(e.target.value);
    }
  };

  const handleConfirmNew = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    onNewTag?.(trimmed);
    setIsAddingNew(false);
    setNewTagInput("");
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewTagInput("");
  };

  const isEmpty = !value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ position: "relative" }}>
        <select
          value={isAddingNew ? "__ADD_NEW__" : value}
          onChange={handleSelectChange}
          disabled={disabled}
          style={{
            width: "100%", height: "48px", padding: "0 40px 0 16px",
            borderRadius: "12px",
            border: `1.5px solid ${required && isEmpty ? "#fca5a5" : "var(--border-color)"}`,
            backgroundColor: "var(--input-bg)", color: isEmpty ? "var(--text-secondary)" : "var(--text-primary)",
            fontSize: "15px", outline: "none", appearance: "none", cursor: "pointer",
            fontWeight: isEmpty ? 400 : 600,
          }}
        >
          <option value="">Select a label...</option>
          {availableTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
          <option value="__ADD_NEW__">＋ Add new label...</option>
        </select>
        {/* Custom dropdown arrow */}
        <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-secondary)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {required && isEmpty && (
        <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>A label is required before publishing.</span>
      )}

      {isAddingNew && (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={newTagInput}
            onChange={e => setNewTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleConfirmNew(); if (e.key === "Escape") handleCancelNew(); }}
            placeholder="New label name..."
            autoFocus
            style={{ flex: 1, height: "44px", padding: "0 14px", borderRadius: "10px", border: "1.5px solid #7c3aed", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
          />
          <button
            onClick={handleConfirmNew}
            style={{ height: "44px", padding: "0 16px", borderRadius: "10px", backgroundColor: "#7c3aed", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "14px" }}
          >
            Add
          </button>
          <button
            onClick={handleCancelNew}
            style={{ height: "44px", padding: "0 14px", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
