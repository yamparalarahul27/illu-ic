"use client";

import { useState } from "react";
import Image from "next/image";
import { Illustration } from "@/types/illustration";
import { STATUS_CONFIG, AssetStatus } from "@/lib/permissions";
import { formatIllustrationName } from "@/lib/formatName";

interface IllustrationCardProps {
  illustration: Illustration;
  onClick: (id: number) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  commentCount?: number;
  isDarkView?: boolean;
  onEditClick?: (illustration: Illustration) => void;
}

export default function IllustrationCard({ illustration, onClick, isSelected, isSelectionMode, commentCount = 0, isDarkView = false, onEditClick }: IllustrationCardProps) {
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [pngSize, setPngSize] = useState<"1x" | "2x" | "3x">("1x");
  const [svgCopied, setSvgCopied] = useState(false);

  const statusCfg = illustration.status ? STATUS_CONFIG[illustration.status as AssetStatus] : null;
  const displayName = formatIllustrationName(illustration.name, isDarkView);
  const imageSrc = isDarkView && illustration.dark_image_url
    ? illustration.dark_image_url
    : (illustration.image_url || illustration.image);
  const devName = isDarkView && illustration.dark_image_url
    ? illustration.name.replace(/_light$/i, "_dark")
    : illustration.name;

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDownloadPopup(true);
  };

  const handleCopySVG = async () => {
    try {
      let svgText: string;
      if (imageSrc.startsWith("data:image/svg+xml")) {
        svgText = atob(imageSrc.split(",")[1]);
      } else {
        const res = await fetch(imageSrc);
        svgText = await res.text();
      }
      await navigator.clipboard.writeText(svgText);
      setSvgCopied(true);
      setTimeout(() => setSvgCopied(false), 2000);
    } catch {
      alert("Failed to copy SVG. Please try again.");
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${devName}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement("a");
      link.download = `${devName}.svg`;
      link.href = imageSrc;
      link.click();
    }
    saveDownload();
  };

  const handleDownloadPNG = () => {
    const canvas = document.createElement("canvas");
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const scale = parseInt(pngSize);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement("a");
        link.download = `${devName}_${pngSize}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        saveDownload();
      }
    };
  };

  const saveDownload = () => {
    const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
    if (!storedDownloads.some((i: any) => i.id === illustration.id)) {
      localStorage.setItem("graphicsLabDownloaded", JSON.stringify([illustration, ...storedDownloads]));
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <>
      <div
        onClick={() => onClick(illustration.id)}
        style={{
          position: "relative", aspectRatio: "1 / 1", borderRadius: "16px",
          backgroundColor: "var(--card-bg)", overflow: "hidden",
          boxShadow: isSelected ? "0 0 0 3px #7c3aed, 0 4px 20px rgba(124,58,237,0.15)" : "0 4px 20px rgba(0,0,0,0.08)",
          border: isSelected ? "2px solid #7c3aed" : "2px solid transparent",
          transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.2s ease",
          cursor: "pointer", display: "flex", flexDirection: "column",
          transform: isSelected ? "scale(0.97)" : "none",
        }}
        className="illustration-card"
      >
        {/* Checkbox in selection mode */}
        {isSelectionMode && (
          <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 10, width: "24px", height: "24px", borderRadius: "6px", backgroundColor: isSelected ? "#7c3aed" : "rgba(255,255,255,0.85)", border: `2px solid ${isSelected ? "#7c3aed" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
            {isSelected && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
        )}

        {/* Comment badge */}
        {!isSelectionMode && commentCount > 0 && (
          <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10, display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#7c3aed", borderRadius: "12px", padding: "3px 8px", boxShadow: "0 2px 8px rgba(124,58,237,0.35)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span style={{ color: "white", fontSize: "11px", fontWeight: 700, lineHeight: 1 }}>{commentCount}</span>
          </div>
        )}

        {/* Image */}
        <div style={{ position: "relative", flex: 1, backgroundColor: isDarkView ? "#1f2937" : "var(--input-bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transition: "background-color 0.3s ease" }}>
          <Image
            src={imageSrc}
            alt={displayName}
            fill
            style={{ objectFit: "contain", padding: "16px", transition: "transform 0.3s ease" }}
            className="illustration-img"
          />

          {/* Edit button — bottom-left of image */}
          {!isSelectionMode && onEditClick && (
            <button
              onClick={e => { e.stopPropagation(); onEditClick(illustration); }}
              title="Edit asset"
              style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 10, width: "32px", height: "32px", borderRadius: "8px", backgroundColor: isDarkView ? "rgba(31,41,55,0.9)" : "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", transition: "background-color 0.2s ease" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkView ? "#1f2937" : "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isDarkView ? "rgba(31,41,55,0.9)" : "rgba(255,255,255,0.9)"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDarkView ? "#e5e7eb" : "#374151"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}

          {/* Download button — bottom-right of image */}
          {!isSelectionMode && (
            <button
              onClick={handleDownloadClick}
              title="Download"
              style={{ position: "absolute", bottom: "10px", right: "10px", zIndex: 10, width: "32px", height: "32px", borderRadius: "8px", backgroundColor: isDarkView ? "rgba(31,41,55,0.9)" : "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", transition: "background-color 0.2s ease" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkView ? "#1f2937" : "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isDarkView ? "rgba(31,41,55,0.9)" : "rgba(255,255,255,0.9)"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isDarkView ? "#e5e7eb" : "#374151"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px", backgroundColor: "var(--card-bg)", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
            {displayName}
          </h3>
          {statusCfg && (
            <div title={statusCfg.label} style={{ flexShrink: 0, width: "8px", height: "8px", borderRadius: "50%", backgroundColor: statusCfg.color }} />
          )}
        </div>
      </div>

      {/* Download popup */}
      {showDownloadPopup && (
        <div
          onClick={(e) => { e.stopPropagation(); setShowDownloadPopup(false); }}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: "var(--background)", borderRadius: "20px", padding: "28px", width: "320px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{displayName}</h3>
              <button
                onClick={() => setShowDownloadPopup(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Size preview */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "160px", backgroundColor: isDarkView ? "#1f2937" : "var(--input-bg)", borderRadius: "14px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={displayName}
                style={{
                  width: `${48 * parseInt(pngSize)}px`,
                  height: `${48 * parseInt(pngSize)}px`,
                  objectFit: "contain",
                  transition: "width 0.25s ease, height 0.25s ease",
                }}
              />
            </div>

            {/* SVG options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={handleCopySVG}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--card-bg)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--input-bg)"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                {svgCopied ? <span style={{ color: "#16a34a" }}>Copied!</span> : "Copy SVG"}
              </button>
              <button
                onClick={handleDownloadSVG}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--card-bg)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--input-bg)"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download SVG
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", backgroundColor: "var(--border-color)" }} />

            {/* PNG options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Download PNG</span>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["1x", "2x", "3x"] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setPngSize(size)}
                    style={{ flex: 1, padding: "8px", borderRadius: "10px", border: `1.5px solid ${pngSize === size ? "#7c3aed" : "var(--border-color)"}`, backgroundColor: pngSize === size ? "#ede9fe" : "var(--input-bg)", color: pngSize === size ? "#7c3aed" : "var(--text-secondary)", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.15s ease" }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                onClick={handleDownloadPNG}
                style={{ padding: "12px 16px", borderRadius: "12px", backgroundColor: "#7c3aed", color: "#fff", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#6d28d9"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#7c3aed"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download {pngSize} PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
