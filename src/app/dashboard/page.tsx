"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function DashboardContent() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name");
  const displayName = nameParam ? nameParam.trim() : "";
  const greeting = displayName ? `Hi ${displayName}! Welcome to Graphics Lab.` : `Hi! Welcome to Graphics Lab.`;

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Top Banner */}
      <div style={{
        width: "100%",
        minHeight: "260px",
        padding: "48px 64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "24px",
        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        marginBottom: "40px",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
        gap: "40px"
      }}>
        <div style={{ flex: 1, zIndex: 10 }}>
          <h1 style={{
            fontSize: "42px",
            fontWeight: 700,
            letterSpacing: "-1px",
            margin: "0 0 16px 0",
            lineHeight: "1.2"
          }}>
            {greeting}
          </h1>
          <p style={{ fontSize: "16px", opacity: 0.7, maxWidth: "500px", lineHeight: "1.5" }}>
            Explore your tools and categories below to start creating amazing visual assets.
          </p>
        </div>
        
        {/* Welcome Illustration Image */}
        <div style={{ 
          position: "relative", 
          width: "350px", 
          height: "350px", 
          flexShrink: 0, 
          marginTop: "-60px", 
          marginBottom: "-60px",
          marginRight: "-40px",
          pointerEvents: "none"
        }}>
          <Image 
            src="/welcome-illustration.png" 
            alt="Welcome Graphics Lab Illustration" 
            fill 
            style={{ objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.1))" }} 
            priority 
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px"
      }}>
        
        {/* Left Card: Pink - Graphics */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          padding: "40px",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)", // Vibrant fallback
          boxShadow: "0 20px 40px -10px rgba(251, 194, 235, 0.4)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          cursor: "pointer",
        }}
        className="dashboard-card"
        >
          {/* Glass Overlay for Text Readability */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            padding: "30px 40px",
            background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)"
          }} />
          
          <h2 style={{
            position: "relative",
            margin: 0,
            fontSize: "36px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1px",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            Graphics
          </h2>
        </div>

        {/* Right Card: Purple - Icons */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px",
          padding: "40px",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", // Vibrant fallback
          boxShadow: "0 20px 40px -10px rgba(224, 195, 252, 0.4)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          cursor: "pointer",
        }}
        className="dashboard-card"
        >
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            padding: "30px 40px",
            background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)"
          }} />
          
          <h2 style={{
            position: "relative",
            margin: 0,
            fontSize: "36px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1px",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            Icons
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
