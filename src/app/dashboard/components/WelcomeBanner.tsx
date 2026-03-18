"use client";

import Image from "next/image";

interface WelcomeBannerProps {
  greetingPrefix: string;
}

export default function WelcomeBanner({ greetingPrefix }: WelcomeBannerProps) {
  return (
    <div style={{
      position: "relative", width: "100%", minHeight: "240px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderRadius: "24px", overflow: "hidden", marginBottom: "40px",
      background: "linear-gradient(to left, #ffffff 0%, #7c3aed 100%)",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
    }}>
      <div style={{ flex: 1, zIndex: 10, padding: "48px 64px", color: "#ffffff" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 700, letterSpacing: "-1px", margin: "0 0 16px 0", lineHeight: "1.2", color: "#ffffff" }}>
          {greetingPrefix}
          <span style={{ color: "#ffffff", opacity: 0.9 }}> Graphics Lab.</span>
        </h1>
        <p style={{ fontSize: "16px", opacity: 0.85, maxWidth: "500px", lineHeight: "1.5", color: "#ffffff" }}>
          Explore all the illustration of Crpko app here
        </p>
      </div>
    </div>
  );
}
