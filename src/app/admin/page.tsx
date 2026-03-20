"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import {
  getAllAdmins, getPendingRequests, approveRequest, rejectRequest,
  addAdminDirectly, updateAdminRole, toggleAdminStatus,
} from "@/lib/admin";
import { ADMIN_ROLES, UserRole, ROLE_CONFIG } from "@/lib/permissions";
import AssetRequestsPanel from "@/app/dashboard/components/AssetRequestsPanel";

type Tab = "users" | "requests" | "add" | "asset-requests";

interface AdminUser { id: string; email: string; name: string; role: string; status: string; created_at: string; }
interface AdminRequest { id: number; name: string; email: string; team: string; reason: string; status: string; created_at: string; }

const inputStyle: React.CSSProperties = {
  height: "44px", padding: "0 14px", borderRadius: "10px",
  border: "1px solid var(--border-color)", background: "var(--input-bg)",
  color: "var(--text-primary)", fontSize: "15px", outline: "none",
};

export default function AdminDashboard() {
  const router = useRouter();
  const session = useSession();
  const [tab, setTab] = useState<Tab>("users");
  const [toast, setToast] = useState("");

  // Users tab
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Requests tab
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [approveRoles, setApproveRoles] = useState<Record<number, UserRole>>({});
  const [actionId, setActionId] = useState<number | null>(null);

  // Add tab
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("MANAGER");
  const [isAdding, setIsAdding] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    const { data } = await getAllAdmins();
    setAdmins((data as AdminUser[]) || []);
    setLoadingAdmins(false);
  }, []);

  const loadRequests = useCallback(async () => {
    setLoadingReqs(true);
    const { data } = await getPendingRequests();
    setRequests((data as AdminRequest[]) || []);
    setLoadingReqs(false);
  }, []);

  useEffect(() => {
    if (!session.isLoaded) return;
    if (session.role !== "SUPERADMIN") {
      router.replace("/dashboard");
      return;
    }
    loadAdmins();
    loadRequests();
  }, [session.isLoaded, session.role, router, loadAdmins, loadRequests]);

  if (!session.isLoaded || session.role !== "SUPERADMIN") {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div style={spinnerStyle} /></div>;
  }

  // ── HANDLERS ──────────────────────────────────────────────────────────────

  const handleRoleChange = async (adminId: string, role: UserRole) => {
    await updateAdminRole(adminId, role);
    setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, role } : a));
    showToast("Role updated");
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    const next = admin.status === "active" ? "inactive" : "active";
    await toggleAdminStatus(admin.id, next);
    setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, status: next } : a));
    showToast(`${admin.name} ${next === "active" ? "activated" : "deactivated"}`);
  };

  const handleApprove = async (req: AdminRequest) => {
    setActionId(req.id);
    const role = approveRoles[req.id] ?? "MANAGER";
    const { error } = await approveRequest(req.id, req.email, req.name, role);
    if (!error) {
      showToast(`${req.name} approved as ${role}`);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      loadAdmins();
    } else { showToast("Error approving"); }
    setActionId(null);
  };

  const handleReject = async (req: AdminRequest) => {
    setActionId(req.id);
    const { error } = await rejectRequest(req.id);
    if (!error) {
      showToast(`${req.name}'s request rejected`);
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } else { showToast("Error rejecting"); }
    setActionId(null);
  };

  const handleAddAdmin = async () => {
    if (!newEmail.trim()) return;
    setIsAdding(true);
    const { error } = await addAdminDirectly(newEmail.trim(), newName.trim() || newEmail.trim(), newRole);
    if (!error) {
      showToast(`${newName || newEmail} added as ${newRole}`);
      setNewEmail(""); setNewName(""); setNewRole("MANAGER");
      loadAdmins();
    } else { showToast("Error adding admin"); }
    setIsAdding(false);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "100px 24px 60px" }}>

      {toast && (
        <div style={{ position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1f2937", color: "#fff", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, fontSize: "14px", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Admin Dashboard</h1>
          <span style={{ padding: "4px 12px", borderRadius: "20px", backgroundColor: ROLE_CONFIG.SUPERADMIN.bg, color: ROLE_CONFIG.SUPERADMIN.color, fontSize: "12px", fontWeight: 700 }}>Super Admin</span>
        </div>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14px" }}>Manage admins, requests, and access.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", backgroundColor: "var(--input-bg)", padding: "4px", borderRadius: "14px", width: "fit-content" }}>
        {([["users", "Users"], ["requests", "Requests"], ["asset-requests", "Asset Requests"], ["add", "Add Admin"]] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "8px 20px", borderRadius: "10px", border: "none", fontWeight: 600,
            fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease",
            backgroundColor: tab === key ? "var(--background)" : "transparent",
            color: tab === key ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: tab === key ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
          }}>
            {label}{key === "requests" && requests.length > 0 ? ` (${requests.length})` : ""}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab === "users" && (
        <div>
          {loadingAdmins ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}><div style={spinnerStyle} /></div>
          ) : admins.length === 0 ? (
            <EmptyState icon="👥" title="No admins yet" subtitle="Add your first admin using the Add Admin tab." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {admins.map(admin => (
                <div key={admin.id} style={{ backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border-color)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#7c3aed", fontSize: "16px", flexShrink: 0 }}>
                      {(admin.name || admin.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "15px" }}>{admin.name}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{admin.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <select
                      value={admin.role ?? "MANAGER"}
                      onChange={e => handleRoleChange(admin.id, e.target.value as UserRole)}
                      style={{ ...inputStyle, height: "36px", fontSize: "13px", paddingRight: "8px" }}
                    >
                      {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button
                      onClick={() => handleToggleStatus(admin)}
                      style={{
                        height: "36px", padding: "0 16px", borderRadius: "8px", fontSize: "13px",
                        fontWeight: 600, border: "1px solid", cursor: "pointer",
                        backgroundColor: admin.status === "active" ? "#fef2f2" : "#f0fdf4",
                        color: admin.status === "active" ? "#ef4444" : "#16a34a",
                        borderColor: admin.status === "active" ? "#fecaca" : "#bbf7d0",
                      }}
                    >
                      {admin.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REQUESTS TAB ── */}
      {tab === "requests" && (
        <div>
          {loadingReqs ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}><div style={spinnerStyle} /></div>
          ) : requests.length === 0 ? (
            <EmptyState icon="🎉" title="No pending requests" subtitle="All admin access requests have been reviewed." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {requests.map(req => (
                <div key={req.id} style={{ backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border-color)", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#7c3aed", flexShrink: 0 }}>
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "15px" }}>{req.name}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{req.email}{req.team ? ` · ${req.team}` : ""}</div>
                      </div>
                    </div>
                    {req.reason && (
                      <div style={{ backgroundColor: "var(--input-bg)", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "8px" }}>
                        "{req.reason}"
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, minWidth: "160px" }}>
                    <select
                      value={approveRoles[req.id] ?? "MANAGER"}
                      onChange={e => setApproveRoles(p => ({ ...p, [req.id]: e.target.value as UserRole }))}
                      style={{ ...inputStyle, height: "36px", fontSize: "13px", width: "100%" }}
                    >
                      {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleReject(req)} disabled={actionId === req.id} style={{ flex: 1, height: "36px", borderRadius: "8px", border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#ef4444", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>Reject</button>
                      <button onClick={() => handleApprove(req)} disabled={actionId === req.id} style={{ flex: 1, height: "36px", borderRadius: "8px", border: "none", backgroundColor: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>
                        {actionId === req.id ? "…" : "Approve"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ASSET REQUESTS TAB ── */}
      {tab === "asset-requests" && <AssetRequestsPanel />}

      {/* ── ADD ADMIN TAB ── */}
      {tab === "add" && (
        <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "20px", border: "1px solid var(--border-color)", padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 20px" }}>Add Admin Directly</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "480px" }}>
            <input type="text" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Email Address" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} />
            <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} style={inputStyle}>
              {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              onClick={handleAddAdmin}
              disabled={isAdding || !newEmail.trim()}
              style={{
                height: "48px", borderRadius: "12px", backgroundColor: "#7c3aed", color: "#fff",
                border: "none", fontWeight: 700, fontSize: "15px",
                cursor: isAdding || !newEmail.trim() ? "not-allowed" : "pointer",
                opacity: isAdding || !newEmail.trim() ? 0.6 : 1,
              }}
            >
              {isAdding ? "Adding…" : "Add Admin"}
            </button>
          </div>

          <div style={{ marginTop: "32px", padding: "16px", backgroundColor: "var(--input-bg)", borderRadius: "12px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            <strong style={{ color: "var(--text-primary)" }}>Role permissions:</strong><br />
            <strong>MANAGER</strong> — review &amp; comment<br />
            <strong>CREATOR</strong> — upload, delete, update, assign name tags, comment<br />
            <strong>QA</strong> — review &amp; comment<br />
            <strong>DEVELOPER</strong> — review &amp; comment
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
    </main>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 0", backgroundColor: "var(--card-bg)", borderRadius: "20px", border: "1px solid var(--border-color)" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>{icon}</div>
      <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>{title}</h2>
      <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14px" }}>{subtitle}</p>
    </div>
  );
}

const spinnerStyle: React.CSSProperties = {
  width: "36px", height: "36px", border: "3px solid var(--border-color)",
  borderTopColor: "#7c3aed", borderRadius: "50%",
  animation: "spin 0.8s linear infinite", display: "inline-block",
};
