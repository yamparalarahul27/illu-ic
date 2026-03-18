"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateAdminEmail, submitAdminRequest } from "@/lib/admin";

type Screen = "enter_email" | "validating" | "not_found" | "request_form" | "request_sent";

const inputStyle: React.CSSProperties = {
  width: "100%", height: "52px", padding: "0 16px", borderRadius: "14px",
  border: "1.5px solid var(--border-color)", background: "var(--input-bg)",
  color: "var(--text-primary)", fontSize: "16px", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s ease",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("enter_email");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ name: "", team: "", reason: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleValidate = async () => {
    if (!email.trim()) return;
    setScreen("validating");
    setError("");
    const result = await validateAdminEmail(email.trim());
    if (result) {
      localStorage.setItem('graphicsLabAdminSession', JSON.stringify(result));
      router.replace('/dashboard');
    } else {
      setScreen("not_found");
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.reason.trim()) return;
    setSubmitting(true);
    await submitAdminRequest({ name: form.name, email, team: form.team, reason: form.reason });
    setSubmitting(false);
    setScreen("request_sent");
  };

  return (
    <main style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", padding: "24px", backgroundColor: "var(--background)",
    }}>
      <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔑</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>
            Admin Login
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
            Enter your admin email to continue
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: "var(--card-bg)", borderRadius: "24px",
          border: "1px solid var(--border-color)", padding: "32px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>

          {/* ── ENTER EMAIL ── */}
          {(screen === "enter_email" || screen === "validating") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleValidate()}
                disabled={screen === "validating"}
                style={inputStyle}
                autoFocus
              />
              {error && <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>{error}</p>}
              <button
                onClick={handleValidate}
                disabled={!email.trim() || screen === "validating"}
                style={{
                  height: "52px", borderRadius: "14px", backgroundColor: "#7c3aed",
                  color: "#fff", border: "none", fontWeight: 700, fontSize: "16px",
                  cursor: !email.trim() || screen === "validating" ? "not-allowed" : "pointer",
                  opacity: !email.trim() || screen === "validating" ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {screen === "validating" ? "Validating…" : "Continue"}
              </button>
              <button
                onClick={() => router.push("/")}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "14px", cursor: "pointer" }}
              >
                ← Back to entry
              </button>
            </div>
          )}

          {/* ── NOT FOUND ── */}
          {screen === "not_found" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "40px" }}>🚫</div>
              <div>
                <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px", fontSize: "16px" }}>
                  Email not recognised
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
                  <strong>{email}</strong> is not an admin account.
                </p>
              </div>
              <button
                onClick={() => { setScreen("enter_email"); setEmail(""); }}
                style={{
                  height: "48px", borderRadius: "12px", backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)", border: "1px solid var(--border-color)",
                  fontWeight: 600, fontSize: "15px", cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => setScreen("request_form")}
                style={{
                  height: "48px", borderRadius: "12px", backgroundColor: "#7c3aed",
                  color: "#fff", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer",
                }}
              >
                Request Access
              </button>
              <button
                onClick={() => router.push("/")}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}
              >
                ← Back
              </button>
            </div>
          )}

          {/* ── REQUEST FORM ── */}
          {screen === "request_form" && (
            <form onSubmit={handleRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                Request Admin Access
              </h3>
              <input
                placeholder="Full Name"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
              <input
                type="email"
                value={email}
                disabled
                style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
              />
              <input
                placeholder="Team (optional)"
                value={form.team}
                onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
                style={inputStyle}
              />
              <textarea
                placeholder="Why do you need admin access?"
                required
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                rows={3}
                style={{
                  padding: "12px 16px", borderRadius: "14px",
                  border: "1.5px solid var(--border-color)", background: "var(--input-bg)",
                  color: "var(--text-primary)", fontSize: "15px", resize: "none",
                  outline: "none", lineHeight: "1.5", boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: "52px", borderRadius: "14px", backgroundColor: "#7c3aed",
                  color: "#fff", border: "none", fontWeight: 700, fontSize: "16px",
                  cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => setScreen("not_found")}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}
              >
                ← Back
              </button>
            </form>
          )}

          {/* ── REQUEST SENT ── */}
          {screen === "request_sent" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "48px" }}>✅</div>
              <div>
                <p style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px", fontSize: "16px" }}>
                  Request submitted!
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
                  The admin will review your request and get back to you.
                </p>
              </div>
              <button
                onClick={() => { localStorage.setItem('graphicsLabUserMode', 'true'); router.push('/dashboard'); }}
                style={{
                  height: "48px", borderRadius: "12px", backgroundColor: "#7c3aed",
                  color: "#fff", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer",
                }}
              >
                Continue to App
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
