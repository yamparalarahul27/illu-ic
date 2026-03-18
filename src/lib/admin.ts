import { supabase } from './supabase';
import { SUPER_ADMIN_EMAIL, UserRole } from './permissions';

// ── Session shape stored in localStorage ──────────────────────────────────────
export interface AdminSessionData {
  email: string;
  name: string;
  role: UserRole;
}

// ── Validate admin email (used on login) ──────────────────────────────────────
export async function validateAdminEmail(email: string): Promise<AdminSessionData | null> {
  const normalized = email.toLowerCase().trim();
  if (normalized === SUPER_ADMIN_EMAIL) {
    return { email: normalized, name: 'Shaina', role: 'SUPERADMIN' };
  }
  const { data, error } = await supabase
    .from('admins')
    .select('id, email, name, role, status')
    .eq('email', normalized)
    .maybeSingle();
  if (error || !data) return null;
  if (data.status === 'inactive') return null;
  return { email: data.email, name: data.name ?? email, role: data.role ?? 'MANAGER' };
}

// ── Admin CRUD ─────────────────────────────────────────────────────────────────
export async function addAdminDirectly(email: string, name: string, role: UserRole = 'MANAGER') {
  const { error } = await supabase
    .from('admins')
    .upsert([{ email: email.toLowerCase().trim(), name, role, status: 'active' }], { onConflict: 'email' });
  return { error };
}

export async function updateAdminRole(adminId: string, role: UserRole) {
  const { error } = await supabase
    .from('admins')
    .update({ role })
    .eq('id', adminId);
  return { error };
}

export async function toggleAdminStatus(adminId: string, status: 'active' | 'inactive') {
  const { error } = await supabase
    .from('admins')
    .update({ status })
    .eq('id', adminId);
  return { error };
}

export async function getAllAdmins() {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// ── Admin requests ─────────────────────────────────────────────────────────────
export async function submitAdminRequest(payload: {
  name: string; email: string; team: string; reason: string;
}) {
  const { error } = await supabase.from('admin_requests').insert([{
    name: payload.name,
    email: payload.email.toLowerCase().trim(),
    team: payload.team,
    reason: payload.reason,
    status: 'pending',
  }]);
  return { error };
}

export async function getPendingRequests() {
  const { data, error } = await supabase
    .from('admin_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function approveRequest(requestId: number, email: string, name: string, role: UserRole = 'MANAGER') {
  await supabase.from('admins').upsert([{ email: email.toLowerCase().trim(), name, role, status: 'active' }], { onConflict: 'email' });
  const { error } = await supabase
    .from('admin_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);
  return { error };
}

export async function rejectRequest(requestId: number) {
  const { error } = await supabase
    .from('admin_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);
  return { error };
}

// ── Illustration status / name tag ─────────────────────────────────────────────
export async function updateIllustrationStatus(id: number, status: string) {
  const { error } = await supabase
    .from('illustrations')
    .update({ status })
    .eq('id', id);
  return { error };
}

export async function updateIllustrationNameTag(id: number, name_tag: string) {
  const { error } = await supabase
    .from('illustrations')
    .update({ name_tag })
    .eq('id', id);
  return { error };
}
