"use client";

import Image from "next/image";

interface WelcomeBannerProps {
  greetingPrefix: string;
}

export default function WelcomeBanner({ greetingPrefix }: WelcomeBannerProps) {
  return (
    <div style={{
      position: "relative", width: "100%", minHeight: "260px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderRadius: "24px", overflow: "hidden", marginBottom: "40px",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
    }}>
      <Image
        src="/ill_welcome_banner.png"
        alt="Welcome Graphics Lab Illustration"
        fill
        style={{ objectFit: "cover", objectPosition: "center", zIndex: 0 }}
        priority
      />
      <div style={{ flex: 1, zIndex: 10, padding: "48px 64px", color: "var(--text-primary)" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 700, letterSpacing: "-1px", margin: "0 0 16px 0", lineHeight: "1.2" }}>
          {greetingPrefix}
          <span style={{ color: "#7c3aed" }}>Graphics Lab.</span>
        </h1>
        <p style={{ fontSize: "16px", opacity: 0.9, maxWidth: "500px", lineHeight: "1.5" }}>
          Explore all the illustration of Crpko app here
        </p>
      </div>
    </div>
  );
}
