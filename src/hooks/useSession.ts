"use client";

import { useState, useEffect } from 'react';
import { UserRole, SUPER_ADMIN_EMAIL } from '@/lib/permissions';

export interface AppSession {
  mode: 'admin' | 'user';
  role: UserRole;
  name: string;
  email: string;
  isLoaded: boolean;
}

const DEFAULT_SESSION: AppSession = {
  mode: 'user', role: 'USER', name: '', email: '', isLoaded: false,
};

function readSession(): AppSession {
  if (typeof window === 'undefined') return DEFAULT_SESSION;

  const adminRaw = localStorage.getItem('graphicsLabAdminSession');
  if (adminRaw) {
    try {
      const { email, role, name } = JSON.parse(adminRaw);
      const resolvedRole: UserRole =
        email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL ? 'SUPERADMIN' : (role ?? 'MANAGER');
      return { mode: 'admin', role: resolvedRole, name: name ?? '', email: email ?? '', isLoaded: true };
    } catch {
      localStorage.removeItem('graphicsLabAdminSession');
    }
  }

  const userRaw = localStorage.getItem('graphicsLabCommentUser');
  const { name = '', email = '' } = userRaw ? JSON.parse(userRaw) : {};
  return { mode: 'user', role: 'USER', name, email, isLoaded: true };
}

export function useSession(): AppSession {
  const [session, setSession] = useState<AppSession>(DEFAULT_SESSION);

  useEffect(() => {
    setSession(readSession());

    const onStorage = () => setSession(readSession());
    window.addEventListener('graphicsLabSessionChange', onStorage);
    return () => window.removeEventListener('graphicsLabSessionChange', onStorage);
  }, []);

  return session;
}

export function notifySessionChange() {
  window.dispatchEvent(new Event('graphicsLabSessionChange'));
}

export function clearAdminSession() {
  localStorage.removeItem('graphicsLabAdminSession');
  localStorage.removeItem('graphicsLabUserMode');
}

export function clearUserSession() {
  localStorage.removeItem('graphicsLabUserMode');
  localStorage.removeItem('graphicsLabCommentUser');
}
