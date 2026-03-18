"use client";

import Image from "next/image";

interface DashboardCardProps {
  title: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  imageStyle?: React.CSSProperties;
  onClick?: () => void;
}

export default function DashboardCard({ title, backgroundImage, backgroundGradient, imageStyle, onClick }: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: "20px", padding: "40px",
        minHeight: "300px", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "flex-end", background: "var(--card-bg)",
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
        cursor: "pointer",
      }}
      className="dashboard-card"
      >
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={`${title} Card Design`}
            fill
            style={imageStyle || { objectFit: "contain", objectPosition: "center", zIndex: 0 }}
          />
        ) : backgroundGradient ? (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: backgroundGradient, zIndex: 0 }} />
        ) : null}

        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 40px",
          background: "linear-gradient(to top, var(--card-bg), transparent)", zIndex: 1
        }} />

        <h2 style={{
          position: "relative", margin: 0, fontSize: "28px", fontWeight: 700,
          color: "var(--text-primary)", letterSpacing: "-1px", zIndex: 2,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <span>{title}</span>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "40px", height: "40px", borderRadius: "50%",
            backgroundColor: "#7c3aed", color: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </h2>
      </div>
    </div>
  );
}
