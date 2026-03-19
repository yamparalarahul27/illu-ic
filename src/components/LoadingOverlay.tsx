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
  const [albumArt, setAlbumArt] = useState<string | null>(null);

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

  // Fetch album art from iTunes when song changes
  useEffect(() => {
    const song = queue[index];
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song)}&media=music&limit=1`)
      .then(r => r.json())
      .then(data => {
        const raw = data.results?.[0]?.artworkUrl100;
        if (raw) {
          setAlbumArt(raw.replace("100x100bb", "500x500bb"));
        } else {
          setAlbumArt(null);
        }
      })
      .catch(() => setAlbumArt(null));
  }, [index]);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(16px)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "28px",
    }}>

      {/* Vinyl */}
      <div className="vinyl" style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.96)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}>
        {/* Outer vinyl disc */}
        <div className="vinyl-disc">
          {/* Groove rings */}
          <div className="vinyl-grooves" />

          {/* Album art label */}
          <div className="vinyl-label" style={{
            backgroundImage: albumArt ? `url(${albumArt})` : "none",
            backgroundColor: albumArt ? "transparent" : "#2d1b69",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
            {!albumArt && (
              <div style={{ fontSize: "22px" }}>♪</div>
            )}
          </div>

          {/* Center hole */}
          <div className="vinyl-hole" />

          {/* Sheen overlay */}
          <div className="vinyl-sheen" />
        </div>
      </div>

      {/* Song info */}
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
        .vinyl {
          width: 200px;
          height: 200px;
          position: relative;
        }
        .vinyl-disc {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: #111;
          position: relative;
          animation: spin 4s linear infinite;
          box-shadow: 0 0 0 2px #222, 0 16px 48px rgba(0,0,0,0.6);
          overflow: hidden;
        }
        .vinyl-grooves {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: repeating-radial-gradient(
            circle at center,
            transparent 0px,
            transparent 3px,
            rgba(255,255,255,0.03) 3px,
            rgba(255,255,255,0.03) 4px
          );
        }
        .vinyl-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.08);
          overflow: hidden;
        }
        .vinyl-hole {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(0,0,0,0.8);
          z-index: 10;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.15);
        }
        .vinyl-sheen {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.07) 0%,
            transparent 50%,
            rgba(255,255,255,0.03) 100%
          );
          pointer-events: none;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
