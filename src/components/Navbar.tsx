"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [displayName, setDisplayName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<"menu" | "profile">("menu");
  
  // Profile Form States
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTeam, setEditTeam] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

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

  useEffect(() => {
    // Populate form state when displayName loads
    if (displayName && !editName) {
      setEditName(displayName);
    }
  }, [displayName]);

  const handleUpdateProfile = () => {
    // Save to local storage
    if (editName.trim()) {
      localStorage.setItem("graphicsLabUserName", editName.trim());
      setDisplayName(editName.trim());
    }
    // Turn off edit modes
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingTeam(false);
    // Show success message
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    // Optional: reset view to menu after close transition
    setTimeout(() => setSidebarView("menu"), 300);
  };

  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer", color: "#6b7280" }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

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
        {sidebarView === "menu" ? (
          <>
            {/* Sidebar Header - Menu View */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
              <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#000000" }}>Account</h3>
              <button 
                onClick={handleCloseSidebar}
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
              <div onClick={() => setSidebarView("profile")} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f9fafb", cursor: "pointer", fontWeight: 500, color: "#000000", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}>Profile</div>
              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f9fafb", cursor: "pointer", fontWeight: 500, color: "#000000", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}>Settings</div>
              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f9fafb", cursor: "pointer", fontWeight: 500, color: "#000000", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}>Saved Media</div>
              
              <div style={{ marginTop: "auto", padding: "16px", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#ef4444", cursor: "pointer", fontWeight: 600, textAlign: "center", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fecaca"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}>Log out</div>
            </div>
          </>
        ) : (
          <>
            {/* Sidebar Header - Profile View */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <button 
                onClick={() => setSidebarView("menu")}
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "16px", 
                  cursor: "pointer", 
                  color: "#000000",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  padding: 0
                }}
              >
                &lt; Back
              </button>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#000000", flex: 1, textAlign: "center", paddingRight: "44px" }}>Profile</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1, overflowY: "auto" }}>
              
              {/* Profile Avatar / Photo Upload Placeholder */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "#7c3aed",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                }}>
                  {mounted && displayName ? displayName.charAt(0).toUpperCase() : ""}
                </div>
                <button style={{ background: "none", border: "none", color: "#7c3aed", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Add photo</button>
              </div>

              {/* Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Name Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", border: isEditingName ? "1px solid #7c3aed" : "1px solid transparent" }}>
                    {isEditingName ? (
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "#000000", fontSize: "14px", fontWeight: 500 }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ color: "#000000", fontSize: "14px", fontWeight: 500 }}>{editName || displayName}</span>
                    )}
                    <div onClick={() => setIsEditingName(!isEditingName)}>
                      <EditIcon />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email ID</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", border: isEditingEmail ? "1px solid #7c3aed" : "1px solid transparent" }}>
                    {isEditingEmail ? (
                      <input 
                        type="email" 
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Enter email"
                        style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "#000000", fontSize: "14px", fontWeight: 500 }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ color: editEmail ? "#000000" : "#9ca3af", fontSize: "14px", fontWeight: 500 }}>{editEmail || "Not provided"}</span>
                    )}
                    <div onClick={() => setIsEditingEmail(!isEditingEmail)}>
                      <EditIcon />
                    </div>
                  </div>
                </div>

                {/* Team Name Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Add team name</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", border: isEditingTeam ? "1px solid #7c3aed" : "1px solid transparent" }}>
                    {isEditingTeam ? (
                      <input 
                        type="text" 
                        value={editTeam} 
                        onChange={(e) => setEditTeam(e.target.value)}
                        placeholder="Enter team name"
                        style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "#000000", fontSize: "14px", fontWeight: 500 }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ color: editTeam ? "#000000" : "#9ca3af", fontSize: "14px", fontWeight: 500 }}>{editTeam || "No team assigned"}</span>
                    )}
                    <div onClick={() => setIsEditingTeam(!isEditingTeam)}>
                      <EditIcon />
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Area */}
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {showSuccessMsg && (
                  <div style={{ color: "#10b981", fontSize: "13px", fontWeight: 600, textAlign: "center", padding: "8px", backgroundColor: "#d1fae5", borderRadius: "6px" }}>
                    Profile successfully updated
                  </div>
                )}
                <button 
                  onClick={handleUpdateProfile}
                  style={{ 
                    padding: "16px", 
                    borderRadius: "12px", 
                    backgroundColor: "#7c3aed", 
                    color: "#ffffff", 
                    border: "none",
                    cursor: "pointer", 
                    fontWeight: 600, 
                    fontSize: "15px",
                    textAlign: "center", 
                    transition: "background 0.2s ease",
                    boxShadow: "0 4px 12px rgba(124,58,237,0.3)"
                  }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d28d9"} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#7c3aed"}
                >
                  Update profile
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}
