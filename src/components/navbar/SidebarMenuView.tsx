"use client";

interface SidebarMenuViewProps {
  onClose: () => void;
  onNavigate: (view: "profile" | "saved" | "downloads") => void;
  onSyncData: () => void;
  isDarkMode: boolean;
  mounted: boolean;
  onToggleDarkMode: () => void;
}

export default function SidebarMenuView({ onClose, onNavigate, onSyncData, isDarkMode, mounted, onToggleDarkMode }: SidebarMenuViewProps) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
        <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>Account</h3>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", padding: 0 }}
        >
          &times;
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
        <div onClick={() => onNavigate("profile")} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "var(--input-bg)", cursor: "pointer", fontWeight: 500, color: "var(--text-primary)", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--input-hover)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--input-bg)"}>Profile</div>
        <div onClick={() => { onSyncData(); onNavigate("saved"); }} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "var(--input-bg)", cursor: "pointer", fontWeight: 500, color: "var(--text-primary)", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--input-hover)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--input-bg)"}>Saved Media</div>
        <div onClick={() => { onSyncData(); onNavigate("downloads"); }} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "var(--input-bg)", cursor: "pointer", fontWeight: 500, color: "var(--text-primary)", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--input-hover)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--input-bg)"}>Downloads</div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: "12px", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontWeight: 500 }}>
            <span>Dark Mode</span>
            {mounted && (
              <div
                onClick={onToggleDarkMode}
                style={{
                  width: "48px", height: "24px",
                  backgroundColor: isDarkMode ? "#7c3aed" : "#e5e7eb",
                  borderRadius: "24px", position: "relative", cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  display: "flex", alignItems: "center", padding: "2px", flexShrink: 0
                }}
              >
                <div style={{
                  width: "20px", height: "20px", backgroundColor: "#ffffff",
                  borderRadius: "50%", position: "absolute", top: "2px",
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
  );
}
