"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function Navbar() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<"menu" | "profile" | "saved" | "downloads">("menu");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sidebar data
  const [savedMedia, setSavedMedia] = useState<any[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<any[]>([]);
  
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
    // Populate form state when components load
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("graphicsLabUserEmail");
      if (storedEmail) setEditEmail(storedEmail);

      const storedTeam = localStorage.getItem("graphicsLabUserTeam");
      if (storedTeam) setEditTeam(storedTeam);
    }
  }, []);

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
    
    localStorage.setItem("graphicsLabUserEmail", editEmail.trim());
    localStorage.setItem("graphicsLabUserTeam", editTeam.trim());

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("graphicsLabTheme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("graphicsLabTheme", "light");
    }
  };


  const handleNavigation = (href: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(href);
      setIsLoading(false);
    }, 500);
  };

  const syncSidebarData = () => {
    // Sync Saved Media
    const allIllustrations = JSON.parse(localStorage.getItem("graphicsLabIllustrations") || "[]");
    const bookmarkedIds = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    const saved = allIllustrations.filter((ill: any) => bookmarkedIds.includes(ill.id));
    setSavedMedia(saved);

    // Sync Downloads
    const downloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
    setDownloadedItems(downloads);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      syncSidebarData();
      
      // Listen for local changes (if we're in the same window)
      window.addEventListener("storage", syncSidebarData);
      return () => window.removeEventListener("storage", syncSidebarData);
    }
  }, []);

  useEffect(() => {
    // Check initial dark mode preference
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("graphicsLabTheme");
      if (storedTheme === "dark") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer", color: "#6b7280" }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  return (
    <>
      {isLoading && <LoadingOverlay message="Navigating..." />}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 2000, padding: "0 20px" }}>
        
        {/* Left Section: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span 
            className="logo" 
            onClick={() => handleNavigation("/dashboard")}
            style={{ cursor: "pointer" }}
          >
            GRAPHICS LAB
          </span>
        </div>
        
        {/* Right Section: Profile Icon */}
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
        backgroundColor: "var(--background)",
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
              <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>Account</h3>
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
              <div onClick={() => setSidebarView("profile")} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "var(--input-bg)", cursor: "pointer", fontWeight: 500, color: "var(--text-primary)", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--input-hover)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--input-bg)"}>Profile</div>
              <div onClick={() => { syncSidebarData(); setSidebarView("saved"); }} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "var(--input-bg)", cursor: "pointer", fontWeight: 500, color: "var(--text-primary)", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--input-hover)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--input-bg)"}>Saved Media</div>
              <div onClick={() => { syncSidebarData(); setSidebarView("downloads"); }} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "var(--input-bg)", cursor: "pointer", fontWeight: 500, color: "var(--text-primary)", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--input-hover)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--input-bg)"}>Downloads</div>
              
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Dark Mode Toggle Sidebar Item */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: "12px", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontWeight: 500 }}>
                  <span>Dark Mode</span>
                  {mounted && (
                    <div 
                      onClick={toggleDarkMode}
                      style={{
                        width: "48px",
                        height: "24px",
                        backgroundColor: isDarkMode ? "#7c3aed" : "#e5e7eb",
                        borderRadius: "24px",
                        position: "relative",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        padding: "2px",
                        flexShrink: 0
                      }}
                    >
                      <div style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#ffffff",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "2px",
                        left: isDarkMode ? "26px" : "2px",
                        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }} />
                    </div>
                  )}
                </div>
                
                <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#ef4444", cursor: "pointer", fontWeight: 600, textAlign: "center", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fecaca"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}>Log out</div>
              </div>
            </div>
          </>
        ) : sidebarView === "profile" ? (
          <>
            {/* Sidebar Header - Profile View */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <button 
                onClick={() => setSidebarView("menu")}
                style={{ 
                  background: "none", 
                  border: "none", 
                  cursor: "pointer", 
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", flex: 1, textAlign: "center", paddingRight: "28px" }}>Profile</h3>
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
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "var(--input-bg)", borderRadius: "8px", border: isEditingName ? "1px solid #7c3aed" : "1px solid transparent" }}>
                    {isEditingName ? (
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>{editName || displayName}</span>
                    )}
                    <div onClick={() => setIsEditingName(!isEditingName)}>
                      <EditIcon />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email ID</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "var(--input-bg)", borderRadius: "8px", border: isEditingEmail ? "1px solid #7c3aed" : "1px solid transparent" }}>
                    {isEditingEmail ? (
                      <input 
                        type="email" 
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Enter email"
                        style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ color: editEmail ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>{editEmail || "Not provided"}</span>
                    )}
                    <div onClick={() => setIsEditingEmail(!isEditingEmail)}>
                      <EditIcon />
                    </div>
                  </div>
                </div>

                {/* Team Name Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Add team name</label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "var(--input-bg)", borderRadius: "8px", border: isEditingTeam ? "1px solid #7c3aed" : "1px solid transparent" }}>
                    {isEditingTeam ? (
                      <input 
                        type="text" 
                        value={editTeam} 
                        onChange={(e) => setEditTeam(e.target.value)}
                        placeholder="Enter team name"
                        style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ color: editTeam ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>{editTeam || "No team assigned"}</span>
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
        ) : (
          <>
            {/* Sidebar Header - Saved/Downloads View */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <button 
                onClick={() => setSidebarView("menu")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", display: "flex", alignItems: "center", padding: "4px" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", flex: 1, textAlign: "center", paddingRight: "24px" }}>
                {sidebarView === "saved" ? "Saved Media" : "Downloads"}
              </h3>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(sidebarView === "saved" ? savedMedia : downloadedItems).map((item, idx) => (
                  <div key={idx} style={{ 
                    aspectRatio: "1/1", 
                    backgroundColor: isDarkMode ? "#1e1b4b" : "var(--input-bg)", 
                    borderRadius: "8px", 
                    padding: "12px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    transition: "all 0.3s ease"
                  }}>
                    <img 
                      src={isDarkMode && item.dark_image_url ? item.dark_image_url : (item.image_url || item.image)} 
                      alt={item.name} 
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
                    />
                  </div>
                ))}
              </div>
              {(sidebarView === "saved" ? savedMedia : downloadedItems).length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
                  No items found.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
