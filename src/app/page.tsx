"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EntryScreen() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Returning session — already handled by SplashScreen redirect,
    // but guard here too for direct /  navigation without splash
    const adminSession = localStorage.getItem('graphicsLabAdminSession');
    const userMode = localStorage.getItem('graphicsLabUserMode');
    if (adminSession || userMode) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLaunchApp = () => {
    localStorage.setItem('graphicsLabUserMode', 'true');
    router.push('/dashboard');
  };

  const handleAdminLogin = () => {
    router.push('/admin/login');
  };

  if (!mounted) return null;

  return (
    <main style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", backgroundColor: "var(--background)", padding: "24px",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "32px",
      }}>
        {/* Tagline */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", margin: 0, letterSpacing: "0.02em" }}>
            Welcome to Graphics Lab
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "6px 0 0", opacity: 0.6 }}>
            How would you like to continue?
          </p>
        </div>

        {/* Buttons */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Launch App */}
          <button
            onClick={handleLaunchApp}
            style={{
              width: "100%", height: "56px", borderRadius: "16px",
              backgroundColor: "#7c3aed", color: "#ffffff",
              border: "none", fontWeight: 700, fontSize: "16px",
              cursor: "pointer", letterSpacing: "0.01em",
              boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.3)"; }}
          >
            Launch App
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", opacity: 0.6 }}>or</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
          </div>

          {/* Login as Admin */}
          <button
            onClick={handleAdminLogin}
            style={{
              width: "100%", height: "56px", borderRadius: "16px",
              backgroundColor: "var(--input-bg)", color: "var(--text-primary)",
              border: "1.5px solid var(--border-color)", fontWeight: 600, fontSize: "16px",
              cursor: "pointer", letterSpacing: "0.01em",
              transition: "border-color 0.2s ease, background-color 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.backgroundColor = "#f5f3ff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.backgroundColor = "var(--input-bg)"; }}
          >
            🔑 Login as Admin
          </button>
        </div>
      </div>
    </main>
  );
}
