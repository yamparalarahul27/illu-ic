"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";

function DashboardContent() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");

  const [displayName, setDisplayName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      
      {/* Profile Icon Header Button */}
      <div 
        onClick={() => setIsSidebarOpen(true)}
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "#7c3aed",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 100,
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {mounted && displayName ? displayName.charAt(0).toUpperCase() : ""}
      </div>

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
        
        {/* Left Card: White - Graphics */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          padding: "40px",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end", // Text back to bottom
          background: "#ffffff", // Changed to white
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
            background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)", // White overlay from bottom
            zIndex: 1
          }} />
          
          <h2 style={{
            position: "relative",
            margin: 0,
            fontSize: "28px", // Reduced from 36px
            fontWeight: 700,
            color: "#000000",
            letterSpacing: "-1px",
            textShadow: "0 2px 10px rgba(255,255,255,0.8)",
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

        {/* Right Card: White - Icons */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          padding: "40px",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end", // Text back to bottom
          background: "#ffffff", // Changed to white
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
            background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)",
            zIndex: 1
          }} />
          
          <h2 style={{
            position: "relative",
            margin: 0,
            fontSize: "28px", // Reduced from 36px
            fontWeight: 700,
            color: "#000000",
            letterSpacing: "-1px",
            textShadow: "0 2px 10px rgba(255,255,255,0.8)",
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

      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 999,
            transition: "opacity 0.3s ease"
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "320px",
        backgroundColor: "#ffffff",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
        zIndex: 1000,
        transform: isSidebarOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        padding: "32px 24px"
      }}>
        {/* Sidebar Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#000000" }}>Account</h3>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: "28px", 
              cursor: "pointer", 
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              padding: 0
            }}
          >
            &times;
          </button>
        </div>

        {/* Sidebar Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
          <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f9fafb", cursor: "pointer", fontWeight: 500, color: "#000000", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}>Profile</div>
          <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f9fafb", cursor: "pointer", fontWeight: 500, color: "#000000", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}>Settings</div>
          
          <div style={{ marginTop: "auto", padding: "16px", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#ef4444", cursor: "pointer", fontWeight: 600, textAlign: "center", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fecaca"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}>Log out</div>
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
