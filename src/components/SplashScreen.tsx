"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { submitAdminRequest } from "@/lib/admin";

type Screen = "splash" | "auth" | "admin-request" | "admin-pending";

export default function SplashScreen() {
  const [logoVisible, setLogoVisible] = useState(false);
  const [screen, setScreen] = useState<Screen>("splash");
  const [isRendered, setIsRendered] = useState(true);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", team: "", reason: "" });
  const [adminError, setAdminError] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already identified
    const stored = localStorage.getItem("graphicsLabCommentUser");
    if (stored) {
      setIsRendered(false);
      return;
    }

    // Logo fade in
    const logoIn = setTimeout(() => setLogoVisible(true), 100);
    // After 2.5s, show auth buttons
    const showAuth = setTimeout(() => setScreen("auth"), 2500);

    return () => { clearTimeout(logoIn); clearTimeout(showAuth); };
  }, []);

  const handleProceed = () => {
    // User picks a name/email — reuse existing comment auth via localStorage prompt
    // We'll show a simple inline form
    setScreen("auth");
  };

  const handleProceedSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const team = (form.elements.namedItem("team") as HTMLInputElement).value;
    localStorage.setItem("graphicsLabCommentUser", JSON.stringify({ name, email, team }));
    setIsRendered(false);
  };

  const handleAdminSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdminSubmitting(true);
    setAdminError("");
    const { error } = await submitAdminRequest(adminForm);
    if (error) {
      setAdminError("Failed to send request. Please try again.");
      setAdminSubmitting(false);
    } else {
      // Save basic info so they can still browse
      localStorage.setItem("graphicsLabCommentUser", JSON.stringify({
        name: adminForm.name,
        email: adminForm.email,
        team: adminForm.team
      }));
      setScreen("admin-pending");
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

      {/* Auth choice screen */}
      {screen === "auth" && (
        <div style={{
          width: "100%", maxWidth: "420px", padding: "0 24px",
          display: "flex", flexDirection: "column", gap: "24px",
          animation: "fadeUp 0.4s ease"
        }}>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "15px", margin: 0 }}>
            Welcome to Graphics Lab. How would you like to continue?
          </p>

          <form onSubmit={handleProceedSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input name="name" placeholder="Full Name" required
              style={inputStyle} />
            <input name="email" type="email" placeholder="Email Address" required
              style={inputStyle} />
            <input name="team" placeholder="Team Name" required
              style={inputStyle} />
            <button type="submit" style={primaryBtn}>
              Proceed
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>or</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
          </div>

          <button onClick={() => setScreen("admin-request")} style={secondaryBtn}>
            🔑 Join as Admin
          </button>
        </div>
      )}

      {/* Admin request form */}
      {screen === "admin-request" && (
        <div style={{
          width: "100%", maxWidth: "420px", padding: "0 24px",
          display: "flex", flexDirection: "column", gap: "20px",
          animation: "fadeUp 0.4s ease"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827", textAlign: "center" }}>
              Request Admin Access
            </h2>
            <p style={{ margin: "8px 0 0", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
              Your request will be reviewed by the web admin.
            </p>
          </div>
          <form onSubmit={handleAdminSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input placeholder="Full Name" required value={adminForm.name}
              onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle} />
            <input type="email" placeholder="Email Address" required value={adminForm.email}
              onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle} />
            <input placeholder="Team Name" required value={adminForm.team}
              onChange={e => setAdminForm(f => ({ ...f, team: e.target.value }))}
              style={inputStyle} />
            <textarea placeholder="Why do you need admin access?" required value={adminForm.reason}
              onChange={e => setAdminForm(f => ({ ...f, reason: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, height: "auto", padding: "12px 16px", resize: "none" }} />
            {adminError && (
              <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>{adminError}</p>
            )}
            <button type="submit" disabled={adminSubmitting} style={primaryBtn}>
              {adminSubmitting ? "Sending..." : "Send Request"}
            </button>
            <button type="button" onClick={() => setScreen("auth")}
              style={{ ...secondaryBtn, marginTop: 0 }}>
              ← Back
            </button>
          </form>
        </div>
      )}

      {/* Pending approval screen */}
      {screen === "admin-pending" && (
        <div style={{
          textAlign: "center", maxWidth: "360px", padding: "0 24px",
          display: "flex", flexDirection: "column", gap: "16px", alignItems: "center",
          animation: "fadeUp 0.4s ease"
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            backgroundColor: "#ede9fe", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "28px"
          }}>
            ⏳
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>
            Request Sent!
          </h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
            Your admin access request has been submitted. You&apos;ll be notified once it&apos;s approved. In the meantime, you can browse as a regular user.
          </p>
          <button onClick={() => setIsRendered(false)} style={primaryBtn}>
            Browse Library
          </button>
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

const inputStyle: React.CSSProperties = {
  height: "48px", padding: "0 16px", borderRadius: "12px",
  border: "1px solid #e5e7eb", background: "#f9fafb",
  color: "#111827", fontSize: "15px", outline: "none",
  width: "100%", boxSizing: "border-box"
};

const primaryBtn: React.CSSProperties = {
  height: "48px", background: "#7c3aed", color: "#ffffff",
  border: "none", borderRadius: "12px", fontWeight: 700,
  cursor: "pointer", fontSize: "15px", width: "100%",
  transition: "opacity 0.2s ease"
};

const secondaryBtn: React.CSSProperties = {
  height: "48px", background: "transparent", color: "#7c3aed",
  border: "1.5px solid #7c3aed", borderRadius: "12px", fontWeight: 600,
  cursor: "pointer", fontSize: "15px", width: "100%"
};
