"use client";

import { Illustration } from "@/types/illustration";

interface IllustrationPreviewProps {
  illustration: Illustration;
  isDarkPreview: boolean;
  onTogglePreview: (isDark: boolean) => void;
}

export default function IllustrationPreview({ illustration, isDarkPreview, onTogglePreview }: IllustrationPreviewProps) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", backgroundColor: isDarkPreview ? "#1e1b4b" : "var(--card-bg)", borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", transition: "background-color 0.3s ease" }}>
      {illustration.dark_image_url && (
        <div style={{
          position: "absolute", top: "12px", right: "12px", display: "flex",
          backgroundColor: "var(--background)", padding: "4px", borderRadius: "20px",
          border: "1px solid var(--border-color)", zIndex: 10
        }}>
          <button
            onClick={() => onTogglePreview(false)}
            style={{
              padding: "6px 16px", borderRadius: "16px", border: "none",
              backgroundColor: !isDarkPreview ? "#7c3aed" : "transparent",
              color: !isDarkPreview ? "#ffffff" : "var(--text-secondary)",
              fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease"
            }}
          >
            Light
          </button>
          <button
            onClick={() => onTogglePreview(true)}
            style={{
              padding: "6px 16px", borderRadius: "16px", border: "none",
              backgroundColor: isDarkPreview ? "#7c3aed" : "transparent",
              color: isDarkPreview ? "#ffffff" : "var(--text-secondary)",
              fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease"
            }}
          >
            Dark
          </button>
        </div>
      )}
      <img
        src={(isDarkPreview && illustration.dark_image_url) ? illustration.dark_image_url : (illustration.image_url || illustration.image)}
        alt={illustration.name}
        style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain", transition: "all 0.3s ease" }}
      />
    </div>
  );
}
