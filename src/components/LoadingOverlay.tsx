"use client";

import React from "react";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "24px"
    }}>
      <div style={{ display: "flex", gap: "12px" }}>
        <div className="loader-circle" style={{ backgroundColor: "#7c3aed", animationDelay: "0s" }}></div>
        <div className="loader-circle" style={{ backgroundColor: "#a78bfa", animationDelay: "0.2s" }}></div>
        <div className="loader-circle" style={{ backgroundColor: "#ddd6fe", animationDelay: "0.4s" }}></div>
      </div>
      <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "18px", margin: 0, letterSpacing: "0.5px" }}>{message}</p>

      <style jsx>{`
        .loader-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          animation: pulse 1.2s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
