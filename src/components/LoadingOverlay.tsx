"use client";

import { useState, useEffect, useRef } from "react";
import { playPreview, stopPreview } from "@/lib/musicPlayer";

const SONGS = [
  // The 1975 / Lana Del Rey
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
  // Linkin Park — From Zero
  "The Emptiness Machine",
  "Heavy Is The Crown",
  "Over Each Other",
  "Casualty",
  "Two Faced",
  "Good Things Go",
  // Linkin Park — Hybrid Theory
  "Crawling",
  "In the End",
  "One Step Closer",
  "Papercut",
  "Points of Authority",
  "With You",
  "A Place for My Head",
  // Linkin Park — Meteora
  "Numb",
  "Somewhere I Belong",
  "Faint",
  "Breaking the Habit",
  "Lying from You",
  "From the Inside",
  // Linkin Park — Minutes to Midnight
  "What I've Done",
  "Bleed It Out",
  "Shadow of the Day",
  "Given Up",
  "Leave Out All the Rest",
  "In Pieces",
];

export default function LoadingOverlay() {
  const [queue, setQueue] = useState<string[]>(() => [...SONGS].sort(() => Math.random() - 0.5));
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const currentSongRef = useRef<string>("");

  // Cycle songs every 3 seconds
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
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Stop audio when overlay unmounts
  useEffect(() => {
    return () => stopPreview();
  }, []);

  useEffect(() => {
    const song = queue[index];
    currentSongRef.current = song;

    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song)}&media=music&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (currentSongRef.current !== song) return;

        const result = data.results?.[0];
        if (result) {
          setAlbumArt(result.artworkUrl100.replace("100x100bb", "500x500bb"));
          setArtistName(result.artistName ?? null);
          if (result.previewUrl) playPreview(result.previewUrl);
        } else {
          setAlbumArt(null);
          setArtistName(null);
        }
      })
      .catch(() => { setAlbumArt(null); setArtistName(null); });
  }, [index]);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(20px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}>

        {/* Album art */}
        <div style={{
          width: "200px",
          height: "200px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#1a1a2e",
          boxShadow: albumArt
            ? "0 32px 64px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)"
            : "0 16px 40px rgba(0,0,0,0.4)",
          flexShrink: 0,
          position: "relative",
        }}>
          {albumArt ? (
            <img
              src={albumArt}
              alt="album art"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
          )}
        </div>

        {/* Song info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "200px" }}>

          {/* NOW PLAYING + equalizer bars */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#1db954", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Now Playing
            </span>
            <div className="eq-bars">
              <span className="eq-bar" style={{ animationDelay: "0s" }} />
              <span className="eq-bar" style={{ animationDelay: "0.2s" }} />
              <span className="eq-bar" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>

          {/* Song title */}
          <p style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.3px",
            textAlign: "center",
            lineHeight: 1.3,
          }}>
            {queue[index]}
          </p>

          {/* Artist */}
          {artistName && (
            <p style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
            }}>
              {artistName}
            </p>
          )}

          {/* Progress bar (decorative) */}
          <div style={{ width: "100%", marginTop: "8px" }}>
            <div style={{ height: "3px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
              <div className="progress-bar" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>0:00</span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>—:——</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .eq-bars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 12px;
        }
        .eq-bar {
          display: block;
          width: 3px;
          border-radius: 2px;
          background: #1db954;
          animation: eq 0.8s ease-in-out infinite alternate;
        }
        @keyframes eq {
          from { height: 3px; }
          to   { height: 12px; }
        }
        .progress-bar {
          height: 100%;
          width: 35%;
          border-radius: 2px;
          background: #ffffff;
          animation: progress 1s linear infinite;
        }
        @keyframes progress {
          0%   { width: 30%; }
          100% { width: 65%; }
        }
      `}</style>
    </div>
  );
}
