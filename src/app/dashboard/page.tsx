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
          src="/2.jpeg" 
          alt="Welcome Graphics Lab Illustration" 
          fill 
          style={{ objectFit: "cover", objectPosition: "bottom", zIndex: 0 }} 
          priority 
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)",
          zIndex: 1
        }} />

        {/* Text Content */}
        <div style={{ flex: 1, zIndex: 10, padding: "48px 64px", color: "#ffffff" }}>
          <h1 style={{
            fontSize: "42px",
            fontWeight: 700,
            letterSpacing: "-1px",
            margin: "0 0 16px 0",
            lineHeight: "1.2",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
          }}>
            {greeting}
          </h1>
          <p style={{ 
            fontSize: "16px", 
            opacity: 0.9, 
            maxWidth: "500px", 
            lineHeight: "1.5", 
            textShadow: "0 2px 10px rgba(0,0,0,0.5)" 
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
          justifyContent: "flex-end",
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
              objectFit: "cover", 
              objectPosition: "center -5px", 
              zIndex: 0 
            }} 
          />

          {/* Glass Overlay for Text Readability */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            padding: "30px 40px",
            background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
            zIndex: 1
          }} />
          
          <h2 style={{
            position: "relative",
            margin: 0,
            fontSize: "36px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1px",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 2
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
