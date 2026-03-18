"use client";

import Image from "next/image";
import { Illustration } from "@/types/illustration";

interface IllustrationCardProps {
  illustration: Illustration;
  onClick: (id: number) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  commentCount?: number;
}

export default function IllustrationCard({ illustration, onClick, isSelected, isSelectionMode, commentCount = 0 }: IllustrationCardProps) {
  return (
    <div
      onClick={() => onClick(illustration.id)}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: "16px",
        backgroundColor: "var(--card-bg)",
        overflow: "hidden",
        boxShadow: isSelected
          ? "0 0 0 3px #7c3aed, 0 4px 20px rgba(124,58,237,0.15)"
          : "0 4px 20px rgba(0,0,0,0.08)",
        border: isSelected ? "2px solid #7c3aed" : "2px solid transparent",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.2s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transform: isSelected ? "scale(0.97)" : "none"
      }}
      className="illustration-card"
    >
      {/* Checkbox overlay in selection mode */}
      {isSelectionMode && (
        <div style={{
          position: "absolute", top: "12px", left: "12px", zIndex: 10,
          width: "24px", height: "24px", borderRadius: "6px",
          backgroundColor: isSelected ? "#7c3aed" : "rgba(255,255,255,0.85)",
          border: `2px solid ${isSelected ? "#7c3aed" : "#d1d5db"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.12)"
        }}>
          {isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
      )}

      {/* Comment notification badge */}
      {!isSelectionMode && commentCount > 0 && (
        <div style={{
          position: "absolute", top: "10px", right: "10px", zIndex: 10,
          display: "flex", alignItems: "center", gap: "4px",
          backgroundColor: "#7c3aed",
          borderRadius: "12px",
          padding: "3px 8px",
          boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
          animation: "commentPop 0.3s ease"
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span style={{ color: "white", fontSize: "11px", fontWeight: 700, lineHeight: 1 }}>
            {commentCount}
          </span>
        </div>
      )}

      <div style={{
        position: "relative",
        flex: 1,
        backgroundColor: "var(--input-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        <Image
          src={illustration.image_url || illustration.image}
          alt={illustration.name}
          fill
          style={{ objectFit: "contain", padding: "24px", transition: "transform 0.3s ease" }}
          className="illustration-img"
        />
      </div>

      <div style={{
        padding: "16px",
        backgroundColor: "var(--card-bg)",
        borderTop: "1px solid var(--border-color)"
      }}>
        <h3 style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {illustration.name}
        </h3>
      </div>
    </div>
  );
}
