"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AssetRequest } from "@/types/assetRequest";

const STATUS_OPTIONS: { value: AssetRequest["status"]; label: string; color: string; bg: string }[] = [
  { value: "pending",      label: "Pending",      color: "#d97706", bg: "#fef3c7" },
  { value: "accepted",     label: "Accepted",     color: "#2563eb", bg: "#dbeafe" },
  { value: "under_review", label: "Under Review", color: "#7c3aed", bg: "#ede9fe" },
  { value: "wip",          label: "WIP",          color: "#0891b2", bg: "#e0f2fe" },
  { value: "addressed",    label: "Addressed",    color: "#16a34a", bg: "#dcfce7" },
];

function statusCfg(status: AssetRequest["status"]) {
  return STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0];
}

function daysAgo(dateStr?: string): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function AssetRequestsPanel() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchAndCleanRequests();
  }, []);

  const fetchAndCleanRequests = async () => {
    setLoading(true);

    // Auto-delete requests older than 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    await supabase.from("asset_requests").delete().lt("created_at", cutoff.toISOString());

    const { data } = await supabase
      .from("asset_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setRequests(data as AssetRequest[]);
      const initialComments: Record<number, string> = {};
      (data as AssetRequest[]).forEach(r => {
        initialComments[r.id] = r.creator_comment || "";
      });
      setComments(initialComments);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: number, status: AssetRequest["status"]) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from("asset_requests").update({ status }).eq("id", id);
  };

  const handleSaveComment = async (id: number) => {
    setSaving(id);
    await supabase.from("asset_requests").update({ creator_comment: comments[id] || "" }).eq("id", id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, creator_comment: comments[id] } : r));
    setSaving(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleting(id);
    await supabase.from("asset_requests").delete().eq("id", id);
    setRequests(prev => prev.filter(r => r.id !== id));
    if (expandedId === id) setExpandedId(null);
    setDeleting(null);
  };

  if (loading) return (
    <div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>Loading requests...</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Info banner */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: "var(--input-bg)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
          Requests are automatically deleted after <strong style={{ color: "var(--text-primary)" }}>30 days</strong>. You can also delete them manually.
        </p>
      </div>

      {requests.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "16px", fontWeight: 500, margin: 0 }}>No asset requests yet.</p>
        </div>
      ) : (
        requests.map(req => {
          const cfg = statusCfg(req.status);
          const isExpanded = expandedId === req.id;
          const age = daysAgo(req.created_at);
          const expiresSoon = age >= 25;

          return (
            <div
              key={req.id}
              style={{ backgroundColor: "var(--card-bg)", borderRadius: "14px", border: `1px solid ${expiresSoon ? "#fca5a5" : "var(--border-color)"}`, overflow: "hidden" }}
            >
              {/* Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {req.asset_name}
                  </p>
                  {req.requested_by_name && (
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {req.requested_by_name}{req.requested_by_email ? ` · ${req.requested_by_email}` : ""}
                    </p>
                  )}
                </div>

                <span style={{ flexShrink: 0, fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", backgroundColor: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>

                <p style={{ margin: 0, fontSize: "11px", color: expiresSoon ? "#ef4444" : "var(--text-secondary)", flexShrink: 0, fontWeight: expiresSoon ? 600 : 400 }}>
                  {expiresSoon ? `Expires in ${30 - age}d` : req.created_at ? new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                </p>

                {/* Delete button */}
                <button
                  onClick={e => handleDelete(e, req.id)}
                  disabled={deleting === req.id}
                  title="Delete request"
                  style={{ flexShrink: 0, background: "none", border: "none", cursor: deleting === req.id ? "not-allowed" : "pointer", padding: "4px", display: "flex", alignItems: "center", color: "#ef4444", opacity: deleting === req.id ? 0.5 : 0.7 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = deleting === req.id ? "0.5" : "0.7"}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "14px", borderTop: "1px solid var(--border-color)" }}>
                  {req.description && (
                    <div style={{ paddingTop: "14px" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</p>
                      <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{req.description}</p>
                    </div>
                  )}

                  {/* Status selector */}
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Change Status</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(req.id, opt.value)}
                          style={{
                            padding: "6px 14px", borderRadius: "20px", border: `2px solid ${req.status === opt.value ? opt.color : "transparent"}`,
                            backgroundColor: opt.bg, color: opt.color, fontSize: "12px", fontWeight: 700, cursor: "pointer",
                            opacity: req.status === opt.value ? 1 : 0.6, transition: "all 0.15s ease",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Creator Comment</p>
                    <textarea
                      value={comments[req.id] || ""}
                      onChange={e => setComments(prev => ({ ...prev, [req.id]: e.target.value }))}
                      placeholder="Add a note for the requester..."
                      rows={3}
                      style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid var(--border-color)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "#7c3aed"}
                      onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                    />
                    <button
                      onClick={() => handleSaveComment(req.id)}
                      disabled={saving === req.id}
                      style={{ marginTop: "8px", padding: "8px 18px", borderRadius: "8px", backgroundColor: "#7c3aed", color: "#fff", border: "none", cursor: saving === req.id ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "13px", opacity: saving === req.id ? 0.7 : 1 }}
                    >
                      {saving === req.id ? "Saving..." : "Save Comment"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
