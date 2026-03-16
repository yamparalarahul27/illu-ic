"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [displayName, setDisplayName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Fetch the name from searchParams (if available) or localStorage
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name");
    
    if (nameParam) {
      const name = nameParam.trim();
      setDisplayName(name);
      localStorage.setItem("graphicsLabUserName", name);
    } else {
      const storedName = localStorage.getItem("graphicsLabUserName");
      if (storedName) {
        setDisplayName(storedName);
      } else {
        setDisplayName("");
      }
    }
  }, [pathname]); 

  return (
    <>
      <header style={{ justifyContent: "space-between", position: "sticky", top: 0, zIndex: 2000 }}>
        <span className="logo">GRAPHICS LAB</span>
        {mounted && displayName && (
          <div 
            onClick={() => setIsSidebarOpen(true)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </header>

      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 9999,
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
        zIndex: 10000,
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
          <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f9fafb", cursor: "pointer", fontWeight: 500, color: "#000000", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}>Saved Media</div>
          
          <div style={{ marginTop: "auto", padding: "16px", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#ef4444", cursor: "pointer", fontWeight: 600, textAlign: "center", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fecaca"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}>Log out</div>
        </div>
      </div>
    </>
  );
}
