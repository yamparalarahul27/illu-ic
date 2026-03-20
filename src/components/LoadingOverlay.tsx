"use client";

export default function LoadingOverlay() {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid rgba(255,255,255,0.2)",
        borderTop: "3px solid #ffffff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
