"use client";

import { useState, useEffect } from "react";

const SONGS = [
  "Robbers",
  "Sweater Weather",
  "About You",
  "Cherry Flavoured",
  "Chocolate",
  "Scary Love",
  "Somebody Else",
  "Start Gazing",
  "Afraid",
  "Compass",
  "The Beach",
  "Nervous",
  "Radio",
  "Summertime Sadness",
  "Doing Time",
  "Born to Die",
];

export default function LoadingOverlay() {
  const [queue, setQueue] = useState<string[]>(() => [...SONGS].sort(() => Math.random() - 0.5));
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => {
          const next = i + 1;
          if (next >= SONGS.length) {
            setQueue([...SONGS].sort(() => Math.random() - 0.5));
            return 0;
          }
          return next;
        });
        setVisible(true);
      }, 300);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(12px)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "32px",
    }}>
      <div className="spinner-container">
        <svg viewBox="0 0 50 50" className="spinner">
          <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
        </svg>
        <div className="bg-circle" />
      </div>

      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ♪ now playing
        </span>
        <p style={{
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "15px",
          margin: 0,
          letterSpacing: "-0.3px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          minWidth: "220px",
          textAlign: "center",
        }}>
          {queue[index]}
        </p>
      </div>

      <style jsx>{`
        .spinner-container {
          position: relative;
          width: 64px;
          height: 64px;
        }
        .spinner {
          animation: rotate 2s linear infinite;
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 2;
        }
        .spinner .path {
          stroke: #7c3aed;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }
        .bg-circle {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 5px solid rgba(167,139,250,0.2);
          z-index: 1;
        }
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }
        @keyframes dash {
          0%   { stroke-dasharray: 1, 150; stroke-dashoffset: 0; stroke: #ddd6fe; }
          50%  { stroke-dasharray: 90, 150; stroke-dashoffset: -35; stroke: #a78bfa; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; stroke: #7c3aed; }
        }
      `}</style>
    </div>
  );
}
