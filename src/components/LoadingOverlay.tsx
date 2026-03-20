"use client";

import { useState, useEffect } from "react";

interface LoadingOverlayProps {
  seconds?: number;
}

export default function LoadingOverlay({ seconds = 1 }: LoadingOverlayProps) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    setCount(seconds);
    if (seconds <= 1) return;
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) { clearInterval(interval); return 1; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Background image */}
      <img
        src="/Burj Khalifa.jpg"
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "16px",
        textAlign: "center",
      }}>
        <p style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.02em",
        }}>
          Your result is coming up in
        </p>
        <span
          key={count}
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1,
            animation: "countPulse 0.4s ease-out",
            display: "block",
          }}
        >
          {count}
        </span>
      </div>

      <style>{`
        @keyframes countPulse {
          from { transform: scale(1.3); opacity: 0.6; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
