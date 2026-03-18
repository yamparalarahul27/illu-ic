"use client";

interface AuthPopupProps {
  onSubmit: (data: { name: string; email: string; team: string }) => void;
  onClose: () => void;
}

export default function AuthPopup({ onSubmit, onClose }: AuthPopupProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      team: (form.elements.namedItem("team") as HTMLInputElement).value,
    };
    onSubmit(data);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div style={{ position: "relative", backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--text-secondary)", lineHeight: 1, padding: "4px" }}
        >
          &times;
        </button>

        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Before you comment</h3>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 24px" }}>Tell us who you are — only needed once.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input name="name" placeholder="Full Name" required style={inputStyle} />
          <input name="email" type="email" placeholder="Email Address" required style={inputStyle} />
          <input name="team" placeholder="Team Name" required style={inputStyle} />
          <button type="submit" style={{ height: "48px", background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: "4px", fontSize: "16px" }}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: "48px", padding: "0 16px", borderRadius: "12px",
  border: "1px solid var(--border-color)", background: "var(--input-bg)",
  color: "var(--text-primary)", fontSize: "16px", outline: "none", width: "100%",
  boxSizing: "border-box",
};
