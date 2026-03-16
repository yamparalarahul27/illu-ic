"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Mock data for illustrations to populate the grid
const ILLUSTRATIONS = [
  { id: 1, name: "Finance Dashboard", image: "/ill_graphic_card_design.png" },
  { id: 2, name: "Onboarding Flow", image: "/ill_icons_card_design.png" },
  { id: 3, name: "Welcome Banner", image: "/ill_welcome_banner.png" },
  { id: 4, name: "Marketing Graphics", image: "/ill_graphic_card_design.png" },
  { id: 5, name: "App Interface", image: "/ill_icons_card_design.png" },
  { id: 6, name: "User Profile", image: "/ill_welcome_banner.png" },
  { id: 7, name: "Data Charts", image: "/ill_graphic_card_design.png" },
  { id: 8, name: "Empty States", image: "/ill_icons_card_design.png" },
];

export default function IllustrationsLibrary() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIllustrations = ILLUSTRATIONS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px" }}>
      
      {/* Search Bar Row (Sticky) */}
      <div style={{
        position: "sticky",
        top: "60px", // Just below the navbar
        zIndex: 1000,
        backgroundColor: "var(--background)",
        padding: "24px 0",
        display: "flex",
        alignItems: "center",
        gap: "16px"
      }}>
        {/* Back Link */}
        <Link 
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
            textDecoration: "none",
            transition: "background-color 0.2s ease"
          }}
          className="back-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>

        {/* Search Input Container */}
        <div style={{
          position: "relative",
          flex: 1,
          height: "48px",
        }}>
          <div style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-secondary)",
            pointerEvents: "none"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Search illustrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              padding: "0 16px 0 48px",
              borderRadius: "24px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            className="search-input"
          />
        </div>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "16px 0 32px", color: "var(--text-primary)" }}>
        Illustrations Library
      </h1>

      {/* Grid Layout for Square Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "24px"
      }}>
        {filteredIllustrations.length > 0 ? (
          filteredIllustrations.map((illustration) => (
            <div 
              key={illustration.id}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                borderRadius: "16px",
                backgroundColor: "var(--card-bg)",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column"
              }}
              className="illustration-card"
            >
              {/* Image Container (Takes up most of the card) */}
              <div style={{ 
                position: "relative", 
                flex: 1, 
                backgroundColor: "var(--input-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                <Image 
                  src={illustration.image} 
                  alt={illustration.name} 
                  fill 
                  style={{ objectFit: "contain", padding: "24px", transition: "transform 0.3s ease" }}
                  className="illustration-img"
                />
              </div>

              {/* Title Section (Fixed at bottom) */}
              <div style={{
                padding: "16px",
                backgroundColor: "var(--card-bg)",
                borderTop: "1px solid var(--border-color)"
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: "15px", 
                  fontWeight: 600, 
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {illustration.name}
                </h3>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "64px 0", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "18px", fontWeight: 500 }}>No illustrations found.</p>
            <p style={{ marginTop: "8px" }}>Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Embedded Styles for hover effects */}
      <style dangerouslySetInnerHTML={{__html: `
        .illustration-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
        }
        .illustration-card:hover .illustration-img {
          transform: scale(1.05);
        }
        
        @media (min-width: 768px) {
          main > div:first-of-type {
            top: 64px; /* Adjust for taller header on larger screens */
          }
        }
      `}} />
    </main>
  );
}
