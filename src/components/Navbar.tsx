"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";
import SidebarMenuView from "./navbar/SidebarMenuView";
import SidebarProfileView from "./navbar/SidebarProfileView";
import SidebarMediaView from "./navbar/SidebarMediaView";

export default function Navbar() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<"menu" | "profile" | "saved" | "downloads">("menu");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [savedMedia, setSavedMedia] = useState<any[]>([]);
  const [downloadedItems, setDownloadedItems] = useState<any[]>([]);

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
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("graphicsLabUserEmail");
      if (storedEmail) setEditEmail(storedEmail);

      const storedTeam = localStorage.getItem("graphicsLabUserTeam");
      if (storedTeam) setEditTeam(storedTeam);
    }
  }, []);

  useEffect(() => {
    if (displayName && !editName) {
      setEditName(displayName);
    }
  }, [displayName]);

  const handleUpdateProfile = () => {
    if (editName.trim()) {
      localStorage.setItem("graphicsLabUserName", editName.trim());
      setDisplayName(editName.trim());
    }
    localStorage.setItem("graphicsLabUserEmail", editEmail.trim());
    localStorage.setItem("graphicsLabUserTeam", editTeam.trim());
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingTeam(false);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
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
    const allIllustrations = JSON.parse(localStorage.getItem("graphicsLabIllustrations") || "[]");
    const bookmarkedIds = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    const saved = allIllustrations.filter((ill: any) => bookmarkedIds.includes(ill.id));
    setSavedMedia(saved);
    setDownloadedItems(JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]"));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      syncSidebarData();
      window.addEventListener("storage", syncSidebarData);
      return () => window.removeEventListener("storage", syncSidebarData);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("graphicsLabTheme");
      if (storedTheme === "dark") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  return (
    <>
      {isLoading && <LoadingOverlay message="Navigating..." />}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 2000, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span
            className="logo"
            onClick={() => handleNavigation("/dashboard")}
            style={{ cursor: "pointer" }}
          >
            GRAPHICS LAB
          </span>
        </div>

        {mounted && displayName && (
          <div
            onClick={() => setIsSidebarOpen(true)}
            style={{
              width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#7c3aed",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </header>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9999, transition: "opacity 0.3s ease" }}
        />
      )}

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "320px",
        backgroundColor: "var(--background)", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
        zIndex: 10000, transform: isSidebarOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column", padding: "32px 24px"
      }}>
        {sidebarView === "menu" ? (
          <SidebarMenuView
            onClose={handleCloseSidebar}
            onNavigate={setSidebarView}
            onSyncData={syncSidebarData}
            isDarkMode={isDarkMode}
            mounted={mounted}
            onToggleDarkMode={toggleDarkMode}
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
