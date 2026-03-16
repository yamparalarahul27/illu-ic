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
      backdropFilter: "blur(12px)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "32px"
    }}>
      <div className="spinner-container">
        <svg viewBox="0 0 50 50" className="spinner">
          <circle
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          ></circle>
        </svg>
        {/* Decorative background circles for a richer "buffering" feel */}
        <div className="bg-circle"></div>
      </div>
      
      <p style={{ 
        color: "#ffffff", 
        fontWeight: 600, 
        fontSize: "18px", 
        margin: 0, 
        letterSpacing: "0.5px",
        textShadow: "0 2px 4px rgba(0,0,0,0.1)" 
      }}>{message}</p>

      <style jsx>{`
        .spinner-container {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .spinner {
          animation: rotate 2s linear infinite;
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 2;
        }

        .spinner .path {
          stroke: #7c3aed; /* Primary Purple */
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        .bg-circle {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 5px solid rgba(167, 139, 250, 0.2); /* Light Purple Hue */
          z-index: 1;
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
            stroke: #ddd6fe; /* Lightest Purple */
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
            stroke: #a78bfa; /* Medium Purple */
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
            stroke: #7c3aed; /* Darkest Purple */
          }
        }
      `}</style>
    </div>
  );
}
