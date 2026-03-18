"use client";

import { Comment } from "@/types/illustration";

interface CommentsListProps {
  comments: Comment[];
  successMessage: string;
  onAddComment: () => void;
  onEdit: (comment: Comment) => void;
  onDelete: (id: number) => void;
}

export default function CommentsList({ comments, successMessage, onAddComment, onEdit, onDelete }: CommentsListProps) {
  return (
    <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Comments ({comments.length})</h3>
        <button
          onClick={onAddComment}
          style={{ background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "20px", padding: "8px 16px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
        >
          Add Comment
        </button>
      </div>

      {successMessage && <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{successMessage}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {comments.map(comment => (
          <div key={comment.id} style={{ backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>{comment.user_name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{comment.user_team} • {new Date(comment.timestamp).toLocaleDateString()}</div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => onEdit(comment)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button onClick={() => onDelete(comment.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", lineHeight: "1.5" }}>{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
