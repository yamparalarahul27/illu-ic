"use client";

import { Illustration } from "@/types/illustration";

interface IllustrationPreviewProps {
  illustration: Illustration;
  isDarkPreview: boolean;
  onTogglePreview: (isDark: boolean) => void;
  pngSize?: "1x" | "2x" | "3x";
}

export default function IllustrationPreview({ illustration, isDarkPreview, onTogglePreview, pngSize = "1x" }: IllustrationPreviewProps) {
  const sizeMap = { "1x": "25%", "2x": "40%", "3x": "56%" };
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", backgroundColor: isDarkPreview ? "#1e1b4b" : "var(--card-bg)", borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", transition: "background-color 0.3s ease" }}>
      {illustration.dark_image_url && (
        <div style={{
          position: "absolute", top: "12px", right: "12px", display: "flex",
          backgroundColor: "var(--background)", padding: "4px", borderRadius: "20px",
          border: "1px solid var(--border-color)", zIndex: 10, gap: "2px"
        }}>
          {/* Sun (Light) button */}
          <button
            onClick={() => onTogglePreview(false)}
            title="Light"
            style={{
              width: "32px", height: "32px", borderRadius: "16px", border: "none",
              backgroundColor: !isDarkPreview ? "#7c3aed" : "transparent",
              color: !isDarkPreview ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer", transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          </button>
          {/* Moon (Dark) button */}
          <button
            onClick={() => onTogglePreview(true)}
            title="Dark"
            style={{
              width: "32px", height: "32px", borderRadius: "16px", border: "none",
              backgroundColor: isDarkPreview ? "#7c3aed" : "transparent",
              color: isDarkPreview ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer", transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      )}
      <img
        src={(isDarkPreview && illustration.dark_image_url) ? illustration.dark_image_url : (illustration.image_url || illustration.image)}
        alt={illustration.name}
        style={{ width: sizeMap[pngSize], height: "auto", objectFit: "contain", transition: "width 0.2s ease" }}
      />
    </div>
  );
}
