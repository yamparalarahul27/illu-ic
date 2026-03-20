"use client";

interface CopyToastProps {
  visible: boolean;
  type: "success" | "error";
  message?: string;
  isDark?: boolean;
}

export default function CopyToast({ visible, type, message, isDark = false }: CopyToastProps) {
  if (!visible) return null;

  const isSuccess = type === "success";
  const color = isSuccess ? "#16a34a" : "#dc2626";
  const bg = isDark
    ? (isSuccess ? "#14532d" : "#7f1d1d")
    : (isSuccess ? "#f0fdf4" : "#fef2f2");
  const border = isSuccess
    ? (isDark ? "#166534" : "#86efac")
    : (isDark ? "#991b1b" : "#fca5a5");
  const textColor = isDark ? "#ffffff" : color;

  return (
    <>
      <div style={{
        position: "fixed",
        bottom: "32px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        backgroundColor: bg,
        border: `1.5px solid ${border}`,
        borderRadius: "12px",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        animation: "toastSlideUp 0.2s ease-out",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        <div style={{
          width: "22px", height: "22px", borderRadius: "50%",
          backgroundColor: color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {isSuccess ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: "14px", fontWeight: 600, color: textColor }}>
          {message ?? (isSuccess ? "Copied to clipboard!" : "Failed to copy")}
        </span>
      </div>
      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
