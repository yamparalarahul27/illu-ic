"use client";

import React from "react";
import TagSelector from "@/components/TagSelector";

interface UploadModalProps {
  uploadStep: "method" | "light" | "ask-dark" | "dark" | "complete";
  setUploadStep: (step: "method" | "light" | "ask-dark" | "dark" | "complete") => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  darkFileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onFinalize: () => void;
  canAssignTag?: boolean;
  nameTag?: string;
  onNameTagChange?: (tag: string) => void;
  availableTags?: string[];
  onNewTag?: (tag: string) => void;
}

export default function UploadModal({ uploadStep, setUploadStep, fileInputRef, darkFileInputRef, onClose, onFinalize, canAssignTag, nameTag = "", onNameTagChange, availableTags = [], onNewTag }: UploadModalProps) {
  const canPublish = !canAssignTag || !!nameTag;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <div style={{
        backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px",
        width: "100%", maxWidth: "450px", boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        display: "flex", flexDirection: "column", gap: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            {uploadStep === "method" && "Select Upload Method"}
            {uploadStep === "light" && "Upload Light Version"}
            {uploadStep === "ask-dark" && "Add Dark Version?"}
            {uploadStep === "dark" && "Upload Dark Version"}
            {uploadStep === "complete" && "Ready to Publish"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "24px" }}>&times;</button>
        </div>

        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
          Upload in <b>SVG</b> for the best quality and resolution.
        </p>

        {uploadStep === "method" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => setUploadStep("light")}
              style={{ height: "56px", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "14px", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px", cursor: "pointer" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Upload from computer</span>
            </button>
            <div style={{ height: "56px", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "14px", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px", opacity: 0.6, cursor: "default" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Upload from Zoho Drive</span>
              <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: "#7c3aed", backgroundColor: "#ede9fe", padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.5px" }}>WIP</span>
            </div>
          </div>
        )}

        {uploadStep === "light" && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ height: "160px", border: "2px dashed var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer", backgroundColor: "var(--input-bg)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M12 5v14M5 12h14"></path></svg>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Choose Light illustration</span>
          </div>
        )}

        {uploadStep === "ask-dark" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px", backgroundColor: "#f0fdf4", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #bbf7d0" }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
               <span style={{ color: "#166534", fontSize: "14px", fontWeight: 600 }}>Light version uploaded</span>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setUploadStep("complete")} style={{ flex: 1, height: "48px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "none", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer" }}>No dark version</button>
              <button onClick={() => setUploadStep("dark")} style={{ flex: 1, height: "48px", borderRadius: "12px", background: "#7c3aed", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer" }}>Add dark version</button>
            </div>
          </div>
        )}

        {uploadStep === "dark" && (
          <div
            onClick={() => darkFileInputRef.current?.click()}
            style={{ height: "160px", border: "2px dashed var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer", backgroundColor: "var(--input-bg)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Choose Dark illustration</span>
          </div>
        )}

        {uploadStep === "complete" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ textAlign: "center", color: "#16a34a" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ margin: "0 auto 12px" }}><polyline points="20 6 9 17 4 12"></polyline></svg>
              <p style={{ margin: 0, fontWeight: 700 }}>Great! Versions are ready.</p>
            </div>

            {canAssignTag && onNameTagChange && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Label <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <TagSelector
                  value={nameTag}
                  onChange={onNameTagChange}
                  availableTags={availableTags}
                  onNewTag={onNewTag}
                  required={!nameTag}
                />
              </div>
            )}

            <button
              onClick={onFinalize}
              disabled={!canPublish}
              style={{
                height: "48px", borderRadius: "12px", border: "none", fontWeight: 700, cursor: canPublish ? "pointer" : "not-allowed",
                background: canPublish ? "#7c3aed" : "var(--border-color)",
                color: canPublish ? "#ffffff" : "var(--text-secondary)",
                boxShadow: canPublish ? "0 4px 12px rgba(124,58,237,0.3)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Confirm & Publish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
