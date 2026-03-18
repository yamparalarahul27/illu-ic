"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { sendOTP, verifyOTP } from "@/lib/admin";

type Screen = "splash" | "auth-choice" | "regular-form" | "admin-form" | "admin-otp";

export default function SplashScreen() {
  const [logoVisible, setLogoVisible] = useState(false);
  const [screen, setScreen] = useState<Screen>("splash");
  const [isRendered, setIsRendered] = useState(true);
  const [authForm, setAuthForm] = useState({ name: "", email: "", team: "" });
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already identified
    const stored = localStorage.getItem("graphicsLabCommentUser");
    if (stored) {
      setIsRendered(false);
      return;
    }

    // Logo fade in
    const logoIn = setTimeout(() => setLogoVisible(true), 100);
    // After 2.5s, show auth choice
    const showAuth = setTimeout(() => setScreen("auth-choice"), 2500);

    return () => { clearTimeout(logoIn); clearTimeout(showAuth); };
  }, []);

  const handleRegularSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("graphicsLabCommentUser", JSON.stringify(authForm));
    localStorage.setItem("graphicsLabUserName", authForm.name);
    localStorage.setItem("graphicsLabUserEmail", authForm.email);
    localStorage.setItem("graphicsLabUserTeam", authForm.team);
    setIsRendered(false);
  };

  const handleAdminRequestOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { error: otpError } = await sendOTP(authForm.email);
    if (otpError) {
      setError("Failed to send code. Please check your email.");
      setSubmitting(false);
    } else {
      setScreen("admin-otp");
      setSubmitting(false);
    }
  };

  const handleAdminVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      setError("Please enter a 4-digit code.");
      return;
    }
    setSubmitting(true);
    setError("");
    const { success, error: verifyError } = await verifyOTP(authForm.email, otpCode, authForm.name);
    if (verifyError) {
      setError(typeof verifyError === 'string' ? verifyError : "Verification failed.");
      setSubmitting(false);
    } else {
      localStorage.setItem("graphicsLabCommentUser", JSON.stringify(authForm));
      localStorage.setItem("graphicsLabUserName", authForm.name);
      localStorage.setItem("graphicsLabUserEmail", authForm.email);
      localStorage.setItem("graphicsLabUserTeam", authForm.team);
      setIsRendered(false);
    }
  };

  if (!isRendered) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "#ffffff",
      flexDirection: "column", gap: "40px",
      fontFamily: "var(--font-geist-sans, sans-serif)"
    }}>
      {/* Logo */}
      <div style={{
        transition: "all 1s ease-out",
        opacity: logoVisible ? 1 : 0,
        transform: logoVisible ? "scale(1)" : "scale(1.1)",
        filter: logoVisible ? "none" : "blur(4px)"
      }}>
        <Image
          src="/logo-dark.png"
          alt="Crpko Graphics Logo"
          width={320}
          height={160}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* Auth choices */}
      {screen === "auth-choice" && (
        <div style={formWrapper}>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "15px", margin: "0 0 8px" }}>
            Welcome to Graphics Lab.
          </p>
          <button onClick={() => setScreen("regular-form")} style={primaryBtn}>
            Proceed
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>or</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
          </div>
          <button onClick={() => setScreen("admin-form")} style={secondaryBtn}>
            🔑 Join as Admin
          </button>
        </div>
      )}

      {/* Regular user form */}
      {screen === "regular-form" && (
        <div style={formWrapper}>
          <h2 style={formTitle}>Quick Identification</h2>
          <form onSubmit={handleRegularSubmit} style={formStyle}>
            <input placeholder="Full Name" required value={authForm.name}
              onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle} />
            <input type="email" placeholder="Email Address" required value={authForm.email}
              onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle} />
            <input placeholder="Team Name" required value={authForm.team}
              onChange={e => setAuthForm(f => ({ ...f, team: e.target.value }))}
              style={inputStyle} />
            <button type="submit" style={primaryBtn}>Start Browsing</button>
            <button type="button" onClick={() => setScreen("auth-choice")} style={backBtn}>← Back</button>
          </form>
        </div>
      )}

      {/* Admin request form (Step 1) */}
      {screen === "admin-form" && (
        <div style={formWrapper}>
          <h2 style={formTitle}>Admin Registration</h2>
          <p style={subtitle}>Access code will be sent to your email.</p>
          <form onSubmit={handleAdminRequestOTP} style={formStyle}>
            <input placeholder="Full Name" required value={authForm.name}
              onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle} />
            <input type="email" placeholder="Email Address" required value={authForm.email}
              onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle} />
            <input placeholder="Team Name" required value={authForm.team}
              onChange={e => setAuthForm(f => ({ ...f, team: e.target.value }))}
              style={inputStyle} />
            {error && <p style={errorText}>{error}</p>}
            <button type="submit" disabled={submitting} style={primaryBtn}>
              {submitting ? "Sending..." : "Send Verification Code"}
            </button>
            <button type="button" onClick={() => setScreen("auth-choice")} style={backBtn}>← Back</button>
          </form>
        </div>
      )}

      {/* Admin OTP Verification (Step 2) */}
      {screen === "admin-otp" && (
        <div style={formWrapper}>
          <h2 style={formTitle}>Verify Your Email</h2>
          <p style={subtitle}>Enter the 4-digit code sent to <b>{authForm.email}</b></p>
          <form onSubmit={handleAdminVerifyOTP} style={formStyle}>
            <input
              type="text"
              maxLength={4}
              placeholder="0000"
              required
              value={otpCode}
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
              style={{ ...inputStyle, textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
            />
            {error && <p style={errorText}>{error}</p>}
            <button type="submit" disabled={submitting} style={primaryBtn}>
              {submitting ? "Verifying..." : "Verify & Join"}
            </button>
            <button type="button" onClick={() => setScreen("admin-form")} style={backBtn}>← Back</button>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}

const formWrapper: React.CSSProperties = {
  width: "100%", maxWidth: "420px", padding: "0 24px",
  display: "flex", flexDirection: "column", gap: "20px",
  animation: "fadeUp 0.4s ease"
};

const formTitle: React.CSSProperties = { margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827", textAlign: "center" };
const subtitle: React.CSSProperties = { margin: "-12px 0 0", textAlign: "center", color: "#6b7280", fontSize: "13px" };
const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "12px" };
const inputStyle: React.CSSProperties = {
  height: "52px", padding: "0 16px", borderRadius: "14px",
  border: "1.5px solid #e5e7eb", background: "#f9fafb",
  color: "#111827", fontSize: "16px", outline: "none",
  width: "100%", boxSizing: "border-box", transition: "border-color 0.2s ease"
};

const primaryBtn: React.CSSProperties = {
  height: "52px", background: "#7c3aed", color: "#ffffff",
  border: "none", borderRadius: "14px", fontWeight: 700,
  cursor: "pointer", fontSize: "16px", width: "100%",
  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
  transition: "all 0.2s ease"
};

const secondaryBtn: React.CSSProperties = {
  height: "52px", background: "#f3f4f6", color: "#374151",
  border: "none", borderRadius: "14px", fontWeight: 600,
  cursor: "pointer", fontSize: "16px", width: "100%",
};

const backBtn: React.CSSProperties = {
  background: "none", border: "none", color: "#6b7280",
  fontSize: "14px", cursor: "pointer", fontWeight: 500, marginTop: "4px"
};

const errorText: React.CSSProperties = { color: "#ef4444", fontSize: "13px", margin: "0", textAlign: "center" };
