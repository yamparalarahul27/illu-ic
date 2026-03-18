"use client";

interface AuthPopupProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AuthPopup({ onSubmit }: AuthPopupProps) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div style={{ backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>Verify Identity</h3>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input name="name" placeholder="Full Name" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />
          <input name="email" type="email" placeholder="Email Address" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />
          <input name="team" placeholder="Team Name" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />
          <button type="submit" style={{ height: "48px", background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: "8px" }}>Continue</button>
        </form>
      </div>
    </div>
  );
}
