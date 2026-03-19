"use client";

import React from "react";
import { Illustration } from "@/types/illustration";

interface EditAssetModalProps {
  illustration: Illustration;
  uploadStep: "light" | "ask-dark" | "dark" | "complete";
  setUploadStep: (step: "light" | "ask-dark" | "dark" | "complete") => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  darkFileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  isDarkView?: boolean;
  uploadError?: string | null;
  onClose: () => void;
  onFinalize: () => void;
}

export default function EditAssetModal({ illustration, uploadStep, setUploadStep, fileInputRef, darkFileInputRef, isUploading, isDarkView = false, uploadError, onClose, onFinalize }: EditAssetModalProps) {
  const displayedName = isDarkView && illustration.dark_image_url
    ? illustration.name.replace(/_light$/i, "_dark")
    : illustration.name;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px",
        width: "100%", maxWidth: "450px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column", gap: "24px", border: "1px solid var(--border-color)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            {uploadStep === "light" && "Upload New Light Version"}
            {uploadStep === "ask-dark" && "Update Dark Version?"}
            {uploadStep === "dark" && "Upload New Dark Version"}
            {uploadStep === "complete" && "Ready to Update"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "24px" }}>&times;</button>
        </div>

        {/* Locked asset name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Asset Name (locked)</span>
          <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{displayedName}</span>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
          Upload in <b>SVG</b> for the best quality and resolution.
        </p>

        {uploadError && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: "13px", color: "#dc2626", fontWeight: 500, lineHeight: 1.4 }}>{uploadError}</span>
          </div>
        )}

        {/* Light upload */}
        {uploadStep === "light" && (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{ height: "160px", border: "2px dashed var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", cursor: isUploading ? "wait" : "pointer", backgroundColor: "var(--input-bg)" }}
          >
            {isUploading ? (
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Uploading…</span>
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M12 5v14M5 12h14"></path></svg>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Choose new Light illustration</span>
              </>
            )}
          </div>
        )}

        {/* Ask dark */}
        {uploadStep === "ask-dark" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px", backgroundColor: "#f0fdf4", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #bbf7d0" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span style={{ color: "#166534", fontSize: "14px", fontWeight: 600 }}>Light version uploaded</span>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setUploadStep("complete")} style={{ flex: 1, height: "48px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "none", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer" }}>
                {illustration.dark_image_url ? "Keep existing dark" : "No dark version"}
              </button>
              <button onClick={() => setUploadStep("dark")} style={{ flex: 1, height: "48px", borderRadius: "12px", background: "#7c3aed", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                {illustration.dark_image_url ? "Update dark version" : "Add dark version"}
              </button>
            </div>
          </div>
        )}

        {/* Dark upload */}
        {uploadStep === "dark" && (
          <div
            onClick={() => !isUploading && darkFileInputRef.current?.click()}
            style={{ height: "160px", border: "2px dashed var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", cursor: isUploading ? "wait" : "pointer", backgroundColor: "var(--input-bg)" }}
          >
            {isUploading ? (
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Uploading…</span>
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Choose new Dark illustration</span>
              </>
            )}
          </div>
        )}

        {/* Complete */}
        {uploadStep === "complete" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ textAlign: "center", color: "#16a34a" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ margin: "0 auto 12px" }}><polyline points="20 6 9 17 4 12"></polyline></svg>
              <p style={{ margin: 0, fontWeight: 700 }}>New versions are ready.</p>
            </div>
            <button
              onClick={onFinalize}
              disabled={isUploading}
              style={{ height: "48px", borderRadius: "12px", border: "none", fontWeight: 700, cursor: isUploading ? "not-allowed" : "pointer", background: isUploading ? "var(--border-color)" : "#7c3aed", color: isUploading ? "var(--text-secondary)" : "#ffffff", boxShadow: isUploading ? "none" : "0 4px 12px rgba(124,58,237,0.3)", transition: "all 0.2s ease" }}
            >
              {isUploading ? "Saving…" : "Confirm & Update"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
