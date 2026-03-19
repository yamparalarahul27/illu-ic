"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";
import SidebarMenuView from "./navbar/SidebarMenuView";
import SidebarProfileView from "./navbar/SidebarProfileView";
import SidebarMediaView from "./navbar/SidebarMediaView";
import { useSession, clearAdminSession, clearUserSession } from "@/hooks/useSession";
import { can, ROLE_CONFIG } from "@/lib/permissions";

export default function Navbar() {
  const router = useRouter();
  const session = useSession();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<"menu" | "profile" | "saved" | "downloads">("menu");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [savedMedia, setSavedMedia] = useState<any[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<any[]>([]);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTeam, setEditTeam] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [isAdminOverride, setIsAdminOverride] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("graphicsLabTheme");
    if (storedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (session.isLoaded) {
      setEditName(session.name);
      setEditEmail(session.email);
      const storedTeam = localStorage.getItem("graphicsLabUserTeam");
      if (storedTeam) setEditTeam(storedTeam);
    }
  }, [session.isLoaded, session.name, session.email]);

  const syncSidebarData = () => {
    const allIllustrations = JSON.parse(localStorage.getItem("graphicsLabIllustrations") || "[]");
    const bookmarkedIds = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    setSavedMedia(allIllustrations.filter((ill: any) => bookmarkedIds.includes(ill.id)));
    setDownloadedItems(JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]"));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      syncSidebarData();
      window.addEventListener("storage", syncSidebarData);
      return () => window.removeEventListener("storage", syncSidebarData);
    }
  }, []);

  const handleUpdateProfile = () => {
    if (editName.trim()) {
      localStorage.setItem("graphicsLabUserName", editName.trim());
    }
    localStorage.setItem("graphicsLabUserEmail", editEmail.trim());
    localStorage.setItem("graphicsLabUserTeam", editTeam.trim());
    setIsEditingName(false); setIsEditingEmail(false); setIsEditingTeam(false);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleLogout = () => {
    clearAdminSession();
    localStorage.setItem("graphicsLabUserMode", "true");
    setIsAdminOverride(false);
  };

  const handleLogin = () => {
    clearUserSession();
    localStorage.removeItem("graphicsLabUserMode");
    handleCloseSidebar();
    router.push("/");
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setSidebarView("menu"), 300);
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("graphicsLabTheme", next ? "dark" : "light");
  };

  const handleNavigation = (href: string) => {
    setIsLoading(true);
    setTimeout(() => { router.push(href); setIsLoading(false); }, 500);
  };

  const displayName = session.isLoaded ? session.name : "";
  const roleCfg = session.role && ROLE_CONFIG[session.role];
  const isAdminMode = mounted && (isAdminOverride !== null ? isAdminOverride : (session.isLoaded && session.mode === "admin"));

  return (
    <>
      {isLoading && <LoadingOverlay message="Navigating..." />}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 2000, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="logo" onClick={() => handleNavigation("/dashboard")} style={{ cursor: "pointer" }}>
            GRAPHICS LAB
          </span>
          {/* Role badge for admins */}
          {isAdminMode && roleCfg && (
            <span style={{
              padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
              backgroundColor: roleCfg.bg, color: roleCfg.color, letterSpacing: "0.04em",
            }}>
              {roleCfg.label.toUpperCase()}
            </span>
          )}
        </div>

        {mounted && (
          <div
            onClick={() => setIsSidebarOpen(true)}
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              backgroundColor: isAdminMode ? "#7c3aed" : "#6b7280",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: displayName ? "16px" : "20px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "transform 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {displayName ? displayName.charAt(0).toUpperCase() : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
        )}
      </header>

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9999 }} />
      )}

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "320px",
        backgroundColor: "var(--background)", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
        zIndex: 10000, transform: isSidebarOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column", padding: "32px 24px",
      }}>
        {sidebarView === "menu" ? (
          <SidebarMenuView
            onClose={handleCloseSidebar}
            onNavigate={setSidebarView}
            onSyncData={syncSidebarData}
            isDarkMode={isDarkMode}
            mounted={mounted}
            onToggleDarkMode={toggleDarkMode}
            isAdmin={can.seeAdminDashboard(session.role)}
            onNavigateToAdmin={() => handleNavigation("/admin")}
            isAdminMode={isAdminMode}
            onLogout={handleLogout}
            onLogin={handleLogin}
          />
        ) : sidebarView === "profile" ? (
          <SidebarProfileView
            displayName={displayName}
            mounted={mounted}
            editName={editName}
            editEmail={editEmail}
            editTeam={editTeam}
            isEditingName={isEditingName}
            isEditingEmail={isEditingEmail}
            isEditingTeam={isEditingTeam}
            showSuccessMsg={showSuccessMsg}
            onEditNameChange={setEditName}
            onEditEmailChange={setEditEmail}
            onEditTeamChange={setEditTeam}
            onToggleEditName={() => setIsEditingName(!isEditingName)}
            onToggleEditEmail={() => setIsEditingEmail(!isEditingEmail)}
            onToggleEditTeam={() => setIsEditingTeam(!isEditingTeam)}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setSidebarView("menu")}
          />
        ) : (
          <SidebarMediaView
            title={sidebarView === "saved" ? "Saved Media" : "Downloads"}
            items={sidebarView === "saved" ? savedMedia : downloadedItems}
            isDarkMode={isDarkMode}
            onBack={() => setSidebarView("menu")}
          />
        )}
      </div>
    </>
  );
}
