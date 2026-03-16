"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";

function DashboardContent() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");

  const [displayName, setDisplayName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (nameParam) {
      const name = nameParam.trim();
      setDisplayName(name);
      localStorage.setItem("graphicsLabUserName", name);
    } else {
      // Look for the name in local storage if it's lost from the URL
      const storedName = localStorage.getItem("graphicsLabUserName");
      if (storedName) {
        setDisplayName(storedName);
      }
    }
  }, [nameParam]);

  const greetingPrefix = mounted && displayName ? `Hi ${displayName}! Welcome to ` : `Hi! Welcome to `;

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Top Banner */}
      <div style={{
        position: "relative",
        width: "100%",
        minHeight: "260px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "24px",
        overflow: "hidden",
        marginBottom: "40px",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
      }}>
        {/* Background Image spanning the entire layout */}
        <Image 
          src="/ill_welcome_banner.png" 
          alt="Welcome Graphics Lab Illustration" 
          fill 
          style={{ objectFit: "cover", objectPosition: "center", zIndex: 0 }} 
          priority 
        />

        {/* Text Content */}
        <div style={{ flex: 1, zIndex: 10, padding: "48px 64px", color: "#000000" }}>
          <h1 style={{
            fontSize: "42px",
            fontWeight: 700,
            letterSpacing: "-1px",
            margin: "0 0 16px 0",
            lineHeight: "1.2",
            textShadow: "0 2px 15px rgba(255,255,255,0.8)"
          }}>
            {greetingPrefix}
            <span style={{ color: "#7c3aed" }}>Graphics Lab.</span>
          </h1>
          <p style={{ 
            fontSize: "16px", 
            opacity: 0.9, 
            maxWidth: "500px", 
            lineHeight: "1.5", 
            textShadow: "0 2px 10px rgba(255,255,255,0.8)" 
          }}>
            Explore all the illustration of Crpko app here
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px"
      }}>
        
        {/* Left Card: Graphics */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          padding: "40px",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end", // Text back to bottom
          background: "var(--card-bg)", 
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
          cursor: "pointer",
        }}
        className="dashboard-card"
        >
          {/* Background Image */}
          <Image 
            src="/ill_graphic_card_design.png" 
            alt="Graphics Card Design" 
            fill 
            style={{ 
              objectFit: "contain", 
              objectPosition: "center", // Center it to prevent edge cutoffs
              zIndex: 0,
              paddingBottom: "40px", // Give it a little push up to avoid text overlapping
              transform: "scale(1.1)" // Increased by 10%
            }} 
          />

          {/* Glass Overlay for Text Readability */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            padding: "30px 40px",
            background: "linear-gradient(to top, var(--card-bg), transparent)", 
            zIndex: 1
          }} />
          
          <h2 style={{
            position: "relative",
            margin: 0,
            fontSize: "28px", // Reduced from 36px
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-1px",
            textShadow: "0 2px 10px var(--card-bg)",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>Graphics</span>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </h2>
        </div>

        {/* Right Card: Icons */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          padding: "40px",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end", // Text back to bottom
          background: "var(--card-bg)", 
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
          cursor: "pointer",
        }}
        className="dashboard-card"
        >
          {/* Background Image */}
          <Image 
            src="/ill_icons_card_design.png" 
            alt="Icons Card Design" 
            fill 
            style={{ 
              objectFit: "contain", 
              objectPosition: "center", // Strictly center it horizontally and vertically
              zIndex: 0,
              padding: "20px", // Provide uniform padding around the edges
              transform: "scale(1.15)" // Maintain slight upscale for premium feel
            }} 
          />

          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            padding: "30px 40px",
            background: "linear-gradient(to top, var(--card-bg), transparent)",
            zIndex: 1
          }} />
          
          <h2 style={{
            position: "relative",
            margin: 0,
            fontSize: "28px", // Reduced from 36px
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-1px",
            textShadow: "0 2px 10px var(--card-bg)",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>Icons</span>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </h2>
        </div>

      </div>

      {/* Embedded CSS for hover effects */}
      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-card:hover {
          transform: translateY(-8px);
        }
        .dashboard-card:nth-child(1):hover {
          box-shadow: 0 30px 60px -15px rgba(251, 194, 235, 0.6) !important;
        }
        .dashboard-card:nth-child(2):hover {
          box-shadow: 0 30px 60px -15px rgba(224, 195, 252, 0.6) !important;
        }
      `}} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <main style={{ flex: 1, display: "flex", width: "100%" }}>
      <Suspense fallback={<div style={{ padding: "40px" }}>Loading Dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
