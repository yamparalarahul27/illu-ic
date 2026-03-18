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
      background: "linear-gradient(to right, #7c3aed 0%, #9d64f5 30%, #d4b8fb 55%, #f0e6ff 75%, #ffffff 100%)",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
    }}>
      <div style={{ flex: 1, zIndex: 10, padding: "clamp(24px, 4vw, 48px) clamp(24px, 5vw, 64px)", color: "#ffffff", maxWidth: "60%" }}>
        <h1 style={{ fontSize: "clamp(22px, 3.5vw, 42px)", fontWeight: 700, letterSpacing: "-1px", margin: "0 0 16px 0", lineHeight: "1.2", color: "#ffffff", whiteSpace: "nowrap", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          {greetingPrefix}
          <span style={{ color: "#ffffff", opacity: 0.9 }}> Graphics Lab.</span>
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 20px)", opacity: 0.85, maxWidth: "500px", lineHeight: "1.5", color: "#ffffff" }}>
          Explore all the illustration of Crpko app here
        </p>
      </div>
      
      <div style={{
        position: "absolute", right: "0", bottom: "0", top: "0",
        width: "45%", display: "flex", alignItems: "center", justifyContent: "flex-end",
        zIndex: 5, paddingRight: "40px"
      }}>
        <div style={{ position: "relative", width: "100%", height: "90%" }}>
          <Image
            src="/ill_welcome_banner.svg"
            alt="Welcome Illustration"
            fill
            style={{ objectFit: "contain", objectPosition: "right center" }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
