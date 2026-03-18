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

export async function sendOTP(email: string) {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  const { error } = await supabase
    .from('admin_otps')
    .upsert([{ email: email.toLowerCase().trim(), code, expires_at }], { onConflict: 'email' });

  if (!error) {
    // [DEBUG] Log OTP to console for testing without email service
    console.log(`[AUTH] OTP for ${email}: ${code}`);
    
    // In a real app, you'd trigger an EmailJS or similar service here
    /*
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      otp_code: code,
      to_email: email,
    });
    */
  }

  return { error, code };
}

export async function verifyOTP(email: string, code: string, name: string) {
  const { data, error } = await supabase
    .from('admin_otps')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('code', code)
    .single();

  if (error || !data) {
    return { error: "Invalid or expired code" };
  }

  const now = new Date();
  if (new Date(data.expires_at) < now) {
    return { error: "Code has expired" };
  }

  // OTP is valid, add to admins
  const { error: adminError } = await supabase
    .from('admins')
    .upsert([{ email: email.toLowerCase().trim(), name }], { onConflict: 'email' });

  if (adminError) return { error: adminError };

  // Delete OTP after successful verification
  await supabase.from('admin_otps').delete().eq('email', email.toLowerCase().trim());

  return { success: true };
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
