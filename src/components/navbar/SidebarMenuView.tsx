"use client";

interface SidebarMenuViewProps {
  onClose: () => void;
  onNavigate: (view: "profile" | "saved" | "downloads" | "latest") => void;
  onSyncData: () => void;
  isAdmin?: boolean;
  onNavigateToAdmin?: () => void;
  isAdminMode?: boolean;
  onLogout?: () => void;
  onLogin?: () => void;
}

export default function SidebarMenuView({ onClose, onNavigate, onSyncData, isAdmin, onNavigateToAdmin, isAdminMode, onLogout, onLogin }: SidebarMenuViewProps) {
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
        <div onClick={() => onNavigate("profile")} style={menuItemStyle}>Profile</div>

        {isAdmin && onNavigateToAdmin && (
          <div
            onClick={() => { onClose(); onNavigateToAdmin(); }}
            style={{ ...menuItemStyle, backgroundColor: "#ede9fe", color: "#7c3aed", fontWeight: 700 }}
          >
            <span style={{ marginRight: "8px" }}>🔑</span> Admin Dashboard
          </div>
        )}

        <div onClick={() => { onSyncData(); onNavigate("saved"); }} style={menuItemStyle}>Saved Media</div>
        <div onClick={() => { onSyncData(); onNavigate("downloads"); }} style={menuItemStyle}>Downloads</div>
        <div onClick={() => onNavigate("latest")} style={menuItemStyle}>Latest Assets</div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {isAdminMode ? (
            <div onClick={onLogout} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#ef4444", cursor: "pointer", fontWeight: 600, textAlign: "center", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fecaca"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}>Log out</div>
          ) : (
            <div onClick={onLogin} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#dcfce7", color: "#16a34a", cursor: "pointer", fontWeight: 600, textAlign: "center", transition: "background 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#bbf7d0"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dcfce7"}>Log in</div>
          )}
        </div>
      </div>
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "12px",
  backgroundColor: "var(--input-bg)",
  cursor: "pointer",
  fontWeight: 500,
  color: "var(--text-primary)",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center"
};
