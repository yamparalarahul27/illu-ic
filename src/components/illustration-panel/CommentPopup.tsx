"use client";

interface CommentPopupProps {
  commentText: string;
  onCommentChange: (text: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function CommentPopup({ commentText, onCommentChange, onSubmit, onCancel, isEditing }: CommentPopupProps) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div style={{ backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>{isEditing ? "Edit Comment" : "Add Comment"}</h3>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <textarea
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="What's on your mind?"
            required
            style={{ height: "150px", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px", resize: "none" }}
          />
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="button" onClick={onCancel} style={{ flex: 1, height: "48px", background: "none", border: "1px solid var(--border-color)", color: "var(--text-primary)", borderRadius: "12px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ flex: 1, height: "48px", background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>{isEditing ? "Save Changes" : "Submit Comment"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
