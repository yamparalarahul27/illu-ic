"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface RequestAssetModalProps {
  onClose: () => void;
  prefillName?: string;
}

export default function RequestAssetModal({ onClose, prefillName = "" }: RequestAssetModalProps) {
  const [assetName, setAssetName] = useState(prefillName);
  const [description, setDescription] = useState("");
  const [yourName, setYourName] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const admin = JSON.parse(localStorage.getItem("graphicsLabAdminSession") || "null");
      if (admin?.name) return admin.name;
      const user = JSON.parse(localStorage.getItem("graphicsLabCommentUser") || "null");
      return user?.name || "";
    } catch { return ""; }
  });
  const [yourEmail, setYourEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const admin = JSON.parse(localStorage.getItem("graphicsLabAdminSession") || "null");
      if (admin?.email) return admin.email;
      const user = JSON.parse(localStorage.getItem("graphicsLabCommentUser") || "null");
      return user?.email || "";
    } catch { return ""; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!assetName.trim()) { setError("Asset name is required."); return; }
    setSubmitting(true);
    setError("");
    const { error: dbErr } = await supabase.from("asset_requests").insert({
      asset_name: assetName.trim(),
      description: description.trim() || null,
      requested_by_name: yourName.trim() || null,
      requested_by_email: yourEmail.trim() || null,
      status: "pending",
    });
    setSubmitting(false);
    if (dbErr) { setError("Failed to submit request. Please try again."); return; }
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: "var(--background)", borderRadius: "20px", padding: "32px", width: "440px", maxWidth: "calc(100vw - 40px)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Request an Asset</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Request submitted!</p>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>The team will review your request shortly.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Asset Name *</label>
                <input
                  value={assetName}
                  onChange={e => setAssetName(e.target.value)}
                  placeholder="e.g. Empty wallet illustration"
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "#7c3aed"}
                  onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you need — style, context, use case..."
                  rows={3}
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontSize: "14px", outline: "none", resize: "none", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#7c3aed"}
                  onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Your Name</label>
                  <input
                    value={yourName}
                    onChange={e => setYourName(e.target.value)}
                    placeholder="Name"
                    style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "#7c3aed"}
                    onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Your Email</label>
                  <input
                    value={yourEmail}
                    onChange={e => setYourEmail(e.target.value)}
                    placeholder="email@example.com"
                    style={{ padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "#7c3aed"}
                    onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                  />
                </div>
              </div>
            </div>

            {error && <p style={{ margin: 0, fontSize: "13px", color: "#dc2626", fontWeight: 500 }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ padding: "14px", borderRadius: "12px", backgroundColor: "#7c3aed", color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "15px", opacity: submitting ? 0.7 : 1, transition: "background 0.2s ease" }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#6d28d9"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#7c3aed"; }}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
