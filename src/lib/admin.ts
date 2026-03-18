import { supabase } from './supabase';

export async function checkIsAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function submitAdminRequest(payload: {
  name: string;
  email: string;
  team: string;
  reason: string;
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

export async function approveRequest(requestId: number, email: string, name: string) {
  // 1. Insert into admins table
  await supabase.from('admins').upsert([{ email: email.toLowerCase().trim(), name }]);
  // 2. Mark request as approved
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
