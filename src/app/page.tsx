"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleGetStarted = () => {
    if (!name.trim()) return;
    localStorage.setItem("graphicsLabUserName", name.trim());
    // Route to Dashboard. Pass name via URL parameter.
    router.push(`/dashboard?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "24px", 
        alignItems: "center",
        maxWidth: "400px",
        width: "100%",
        padding: "40px",
        borderRadius: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            Onboarding
          </h1>
          <p style={{ fontSize: "12px", opacity: 0.6, textTransform: "uppercase" }}>
            Please enter your details to continue
          </p>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", opacity: 0.5 }}>Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name" 
              style={{ 
                padding: "12px 16px", 
                border: "1px solid #000", 
                borderRadius: "4px",
                fontSize: "14px",
                outline: "none",
                width: "100%",
                color: "var(--foreground)",
                background: "transparent"
              }} 
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", opacity: 0.5 }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
              style={{ 
                padding: "12px 16px", 
                border: "1px solid #000", 
                borderRadius: "4px",
                fontSize: "14px",
                outline: "none",
                width: "100%",
                color: "var(--foreground)",
                background: "transparent"
              }} 
            />
          </div>
        </div>

        <button 
          onClick={handleGetStarted}
          disabled={!name.trim()}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "14px",
            backgroundColor: name.trim() ? "#7c3aed" : "rgba(124, 58, 237, 0.5)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            cursor: name.trim() ? "pointer" : "not-allowed",
            letterSpacing: "1px",
            transition: "all 0.2s ease"
          }}
        >
          Get Started
        </button>
      </div>
    </main>
  );
}
