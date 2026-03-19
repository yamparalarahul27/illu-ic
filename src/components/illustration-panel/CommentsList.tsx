"use client";

import { useState } from "react";
import { Comment } from "@/types/illustration";

interface CommentsListProps {
  comments: Comment[];
  replies: Record<number, Comment[]>;
  successMessage: string;
  userInfo: { name: string; email: string; team: string } | null;
  canResolve: boolean;
  onAddComment: () => void;
  onEdit: (comment: Comment) => void;
  onDelete: (id: number) => void;
  onReply: (parentId: number, text: string) => Promise<void>;
  onReplyAuthNeeded: (parentId: number) => void;
  onResolve: (id: number, resolved: boolean) => Promise<void>;
}

export default function CommentsList({
  comments, replies, successMessage, userInfo, canResolve,
  onAddComment, onEdit, onDelete, onReply, onReplyAuthNeeded, onResolve,
}: CommentsListProps) {
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReplyClick = (commentId: number) => {
    if (!userInfo) {
      onReplyAuthNeeded(commentId);
      return;
    }
    setReplyingToId(commentId);
    setReplyText("");
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(parentId, replyText.trim());
    setReplyText("");
    setReplyingToId(null);
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Comments ({comments.length})
        </h3>
        <button
          onClick={onAddComment}
          style={{ background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "20px", padding: "8px 16px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
        >
          Add Comment
        </button>
      </div>

      {successMessage && (
        <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          {successMessage}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {comments.map(comment => (
          <div key={comment.id}>
            {/* Parent comment */}
            <div style={{
              backgroundColor: "var(--card-bg)",
              padding: "16px",
              borderRadius: "12px",
              border: `1px solid ${comment.resolved ? "#86efac" : "var(--border-color)"}`,
              borderLeft: `4px solid ${comment.resolved ? "#22c55e" : "var(--border-color)"}`,
              transition: "border-color 0.2s ease",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>
                    {comment.user_name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {comment.user_team} • {new Date(comment.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {comment.resolved && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "#16a34a", backgroundColor: "#dcfce7", padding: "3px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Resolved
                    </span>
                  )}
                  <button onClick={() => onEdit(comment)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "2px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => onDelete(comment.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>

              {/* Comment text */}
              <p style={{
                margin: "0 0 12px",
                fontSize: "14px",
                lineHeight: "1.6",
                color: comment.resolved ? "var(--text-secondary)" : "var(--text-primary)",
                textDecoration: comment.resolved ? "line-through" : "none",
              }}>
                {comment.text}
              </p>

              {/* Footer actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Reply */}
                <button
                  onClick={() => replyingToId === comment.id ? setReplyingToId(null) : handleReplyClick(comment.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                  {replyingToId === comment.id ? "Cancel" : `Reply${(replies[comment.id]?.length ?? 0) > 0 ? ` (${replies[comment.id].length})` : ""}`}
                </button>

                {/* Resolve button — admins only */}
                {canResolve && (
                  comment.resolved ? (
                    <button
                      onClick={() => onResolve(comment.id, false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "6px 14px", borderRadius: "20px",
                        background: "var(--input-bg)", color: "var(--text-secondary)",
                        border: "1px solid var(--border-color)", fontWeight: 700, fontSize: "12px",
                        cursor: "pointer", transition: "background 0.15s ease",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#e5e7eb"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--input-bg)"; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Resolved
                    </button>
                  ) : (
                    <button
                      onClick={() => onResolve(comment.id, true)}
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "6px 14px", borderRadius: "20px",
                        background: "#22c55e", color: "#fff",
                        border: "none", fontWeight: 700, fontSize: "12px",
                        cursor: "pointer", boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(34,197,94,0.4)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(34,197,94,0.3)"; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Resolve
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Inline reply form */}
            {replyingToId === comment.id && (
              <div style={{ marginLeft: "24px", marginTop: "8px", display: "flex", gap: "8px" }}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user_name}...`}
                  autoFocus
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "14px", resize: "none", height: "72px", outline: "none" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={submitting || !replyText.trim()}
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "#7c3aed", color: "#fff", border: "none", fontWeight: 700, fontSize: "13px", cursor: submitting || !replyText.trim() ? "not-allowed" : "pointer", opacity: submitting || !replyText.trim() ? 0.6 : 1 }}
                  >
                    {submitting ? "…" : "Send"}
                  </button>
                  <button
                    onClick={() => setReplyingToId(null)}
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "var(--input-bg)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {(replies[comment.id]?.length ?? 0) > 0 && (
              <div style={{ marginLeft: "24px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px", borderLeft: "2px solid var(--border-color)", paddingLeft: "12px" }}>
                {replies[comment.id].map(reply => (
                  <div key={reply.id} style={{ backgroundColor: "var(--card-bg)", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>{reply.user_name}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "8px" }}>
                          {reply.user_team} • {new Date(reply.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <button onClick={() => onDelete(reply.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.5" }}>{reply.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
