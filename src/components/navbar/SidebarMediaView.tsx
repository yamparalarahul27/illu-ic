"use client";

interface SidebarMediaViewProps {
  title: string;
  items: any[];
  isDarkMode: boolean;
  onBack: () => void;
}

export default function SidebarMediaView({ title, items, isDarkMode, onBack }: SidebarMediaViewProps) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", display: "flex", alignItems: "center", padding: "4px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", flex: 1, textAlign: "center", paddingRight: "24px" }}>
          {title}
        </h3>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {items.map((item, idx) => (
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
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            No items found.
          </div>
        )}
      </div>
    </>
  );
}
