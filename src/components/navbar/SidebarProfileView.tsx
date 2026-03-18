"use client";

interface SidebarProfileViewProps {
  displayName: string;
  mounted: boolean;
  editName: string;
  editEmail: string;
  editTeam: string;
  isEditingName: boolean;
  isEditingEmail: boolean;
  isEditingTeam: boolean;
  showSuccessMsg: boolean;
  onEditNameChange: (val: string) => void;
  onEditEmailChange: (val: string) => void;
  onEditTeamChange: (val: string) => void;
  onToggleEditName: () => void;
  onToggleEditEmail: () => void;
  onToggleEditTeam: () => void;
  onUpdateProfile: () => void;
  onBack: () => void;
}

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer", color: "#6b7280" }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

export default function SidebarProfileView(props: SidebarProfileViewProps) {
  const {
    displayName, mounted, editName, editEmail, editTeam,
    isEditingName, isEditingEmail, isEditingTeam, showSuccessMsg,
    onEditNameChange, onEditEmailChange, onEditTeamChange,
    onToggleEditName, onToggleEditEmail, onToggleEditTeam,
    onUpdateProfile, onBack
  } = props;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", flex: 1, textAlign: "center", paddingRight: "28px" }}>Profile</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#7c3aed",
            color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: 700, boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
          }}>
            {mounted && displayName ? displayName.charAt(0).toUpperCase() : ""}
          </div>
          <button style={{ background: "none", border: "none", color: "#7c3aed", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Add photo</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "var(--input-bg)", borderRadius: "8px", border: isEditingName ? "1px solid #7c3aed" : "1px solid transparent" }}>
              {isEditingName ? (
                <input type="text" value={editName} onChange={(e) => onEditNameChange(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }} autoFocus />
              ) : (
                <span style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>{editName || displayName}</span>
              )}
              <div onClick={onToggleEditName}><EditIcon /></div>
            </div>
          </div>

          {/* Email Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email ID</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "var(--input-bg)", borderRadius: "8px", border: isEditingEmail ? "1px solid #7c3aed" : "1px solid transparent" }}>
              {isEditingEmail ? (
                <input type="email" value={editEmail} onChange={(e) => onEditEmailChange(e.target.value)} placeholder="Enter email" style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }} autoFocus />
              ) : (
                <span style={{ color: editEmail ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>{editEmail || "Not provided"}</span>
              )}
              <div onClick={onToggleEditEmail}><EditIcon /></div>
            </div>
          </div>

          {/* Team Name Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Add team name</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "var(--input-bg)", borderRadius: "8px", border: isEditingTeam ? "1px solid #7c3aed" : "1px solid transparent" }}>
              {isEditingTeam ? (
                <input type="text" value={editTeam} onChange={(e) => onEditTeamChange(e.target.value)} placeholder="Enter team name" style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }} autoFocus />
              ) : (
                <span style={{ color: editTeam ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>{editTeam || "No team assigned"}</span>
              )}
              <div onClick={onToggleEditTeam}><EditIcon /></div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {showSuccessMsg && (
            <div style={{ color: "#10b981", fontSize: "13px", fontWeight: 600, textAlign: "center", padding: "8px", backgroundColor: "#d1fae5", borderRadius: "6px" }}>
              Profile successfully updated
            </div>
          )}
          <button
            onClick={onUpdateProfile}
            style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#7c3aed", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "15px", textAlign: "center", transition: "background 0.2s ease", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d28d9"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#7c3aed"}
          >
            Update profile
          </button>
        </div>
      </div>
    </>
  );
}
