"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { getPendingRequests, approveRequest, rejectRequest, addAdminDirectly } from "@/lib/admin";

interface AdminRequest {
  id: number;
  name: string;
  email: string;
  team: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const { isAdmin, isLoading } = useAdminStatus();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoadingReqs(true);
    const { data } = await getPendingRequests();
    setRequests((data as AdminRequest[]) || []);
    setLoadingReqs(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadRequests();
  }, [isAdmin, loadRequests]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAddAdmin = async () => {
    if (!newEmail.trim()) return;
    setIsAdding(true);
    const { error } = await addAdminDirectly(newEmail.trim(), newName.trim() || newEmail.trim());
    if (!error) {
      showToast(`✅ ${newName || newEmail} added as admin`);
      setNewEmail("");
      setNewName("");
    } else {
      showToast("Error adding admin");
    }
    setIsAdding(false);
  };

  const handleApprove = async (req: AdminRequest) => {
    setActionId(req.id);
    const { error } = await approveRequest(req.id, req.email, req.name);
    if (!error) {
      showToast(`✅ ${req.name} approved as admin`);
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } else {
      showToast("Error approving request");
    }
    setActionId(null);
  };

  const handleReject = async (req: AdminRequest) => {
    setActionId(req.id);
    const { error } = await rejectRequest(req.id);
    if (!error) {
      showToast(`❌ ${req.name}'s request rejected`);
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } else {
      showToast("Error rejecting request");
    }
    setActionId(null);
  };

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <div style={spinnerStyle} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={centerStyle}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
            Access Denied
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            You don&apos;t have admin privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 24px 60px" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)",
          backgroundColor: "#1f2937", color: "#ffffff", padding: "12px 24px",
          borderRadius: "12px", fontWeight: 600, fontSize: "14px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 9999,
          animation: "fadeUp 0.3s ease"
        }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
          Admin Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          Review and approve admin access requests.
        </p>
      </div>

      {/* Add Admin Directly */}
      <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "20px", border: "1px solid var(--border-color)", padding: "24px", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
          Add Admin by Email
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Full Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, minWidth: "160px", height: "44px", padding: "0 16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
            style={{ flex: 2, minWidth: "200px", height: "44px", padding: "0 16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
          />
          <button
            onClick={handleAddAdmin}
            disabled={isAdding || !newEmail.trim()}
            style={{ height: "44px", padding: "0 24px", borderRadius: "10px", backgroundColor: "#7c3aed", color: "#ffffff", fontWeight: 600, border: "none", cursor: isAdding || !newEmail.trim() ? "not-allowed" : "pointer", opacity: isAdding || !newEmail.trim() ? 0.6 : 1, fontSize: "15px", whiteSpace: "nowrap" }}
          >
            {isAdding ? "Adding..." : "Add Admin"}
          </button>
        </div>
      </div>

      {loadingReqs ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 0",
          backgroundColor: "var(--card-bg)", borderRadius: "20px",
          border: "1px solid var(--border-color)"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
            No Pending Requests
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14px" }}>
            All admin access requests have been reviewed.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {requests.map(req => (
            <div key={req.id} style={{
              backgroundColor: "var(--card-bg)", borderRadius: "16px",
              border: "1px solid var(--border-color)", padding: "24px",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              gap: "24px", flexWrap: "wrap"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    backgroundColor: "#ede9fe", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 700, color: "#7c3aed", fontSize: "16px"
                  }}>
                    {req.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "16px" }}>
                      {req.name}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {req.email} · {req.team}
                    </div>
                  </div>
                </div>
                {req.reason && (
                  <div style={{
                    backgroundColor: "var(--input-bg)", borderRadius: "10px",
                    padding: "12px 14px", fontSize: "14px", color: "var(--text-secondary)",
                    lineHeight: "1.5"
                  }}>
                    &ldquo;{req.reason}&rdquo;
                  </div>
                )}
                <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  Requested {new Date(req.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <button
                  onClick={() => handleReject(req)}
                  disabled={actionId === req.id}
                  style={{
                    padding: "10px 20px", borderRadius: "10px",
                    border: "1px solid #fecaca", backgroundColor: "#fef2f2",
                    color: "#ef4444", fontWeight: 600, cursor: "pointer", fontSize: "14px"
                  }}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(req)}
                  disabled={actionId === req.id}
                  style={{
                    padding: "10px 20px", borderRadius: "10px",
                    backgroundColor: "#7c3aed", color: "#ffffff",
                    border: "none", fontWeight: 600, cursor: "pointer", fontSize: "14px"
                  }}
                >
                  {actionId === req.id ? "..." : "Approve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      ` }} />
    </main>
  );
}

const centerStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  minHeight: "100vh"
};

const spinnerStyle: React.CSSProperties = {
  width: "40px", height: "40px", border: "3px solid var(--border-color)",
  borderTopColor: "#7c3aed", borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
};
