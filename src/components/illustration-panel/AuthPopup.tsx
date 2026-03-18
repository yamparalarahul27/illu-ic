"use client";

import { useState } from "react";
import { submitAdminRequest } from "@/lib/admin";

interface AuthPopupProps {
  onSubmit: (data: { name: string; email: string; team: string }) => void;
}

export default function AuthPopup({ onSubmit }: AuthPopupProps) {
  const [wantsAdmin, setWantsAdmin] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      team: formData.get("team") as string,
    };

    if (wantsAdmin && reason.trim()) {
      await submitAdminRequest({ ...data, reason: reason.trim() });
    }

    setIsSubmitting(false);
    onSubmit(data);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div style={{ backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>Verify Identity</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input name="name" placeholder="Full Name" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />
          <input name="email" type="email" placeholder="Email Address" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />
          <input name="team" placeholder="Team Name" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />

          {/* Request admin access toggle */}
          <div
            onClick={() => setWantsAdmin(!wantsAdmin)}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px", borderRadius: "12px",
              border: `1px solid ${wantsAdmin ? "#7c3aed" : "var(--border-color)"}`,
              backgroundColor: wantsAdmin ? "#f5f3ff" : "var(--input-bg)",
              cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            <div style={{
              width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
              border: `2px solid ${wantsAdmin ? "#7c3aed" : "var(--border-color)"}`,
              backgroundColor: wantsAdmin ? "#7c3aed" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
            }}>
              {wantsAdmin && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: "15px", fontWeight: 500, color: wantsAdmin ? "#7c3aed" : "var(--text-primary)", userSelect: "none" }}>
              Request admin access
            </span>
          </div>

          {wantsAdmin && (
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need admin access?"
              required={wantsAdmin}
              rows={3}
              style={{
                padding: "12px 16px", borderRadius: "12px",
                border: "1px solid var(--border-color)", background: "var(--input-bg)",
                color: "var(--text-primary)", fontSize: "15px", resize: "none",
                outline: "none", lineHeight: "1.5",
              }}
            />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ height: "48px", background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", marginTop: "8px", opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? "Submitting..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
