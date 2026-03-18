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

export function useSession(): AppSession {
  const [session, setSession] = useState<AppSession>(DEFAULT_SESSION);

  useEffect(() => {
    const adminRaw = localStorage.getItem('graphicsLabAdminSession');
    if (adminRaw) {
      try {
        const { email, role, name } = JSON.parse(adminRaw);
        const resolvedRole: UserRole =
          email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL ? 'SUPERADMIN' : (role ?? 'MANAGER');
        setSession({ mode: 'admin', role: resolvedRole, name: name ?? '', email: email ?? '', isLoaded: true });
        return;
      } catch {
        localStorage.removeItem('graphicsLabAdminSession');
      }
    }

    const userRaw = localStorage.getItem('graphicsLabCommentUser');
    const { name = '', email = '' } = userRaw ? JSON.parse(userRaw) : {};
    setSession({ mode: 'user', role: 'USER', name, email, isLoaded: true });
  }, []);

  return session;
}

export function clearAdminSession() {
  localStorage.removeItem('graphicsLabAdminSession');
  localStorage.removeItem('graphicsLabUserMode');
}

export function clearUserSession() {
  localStorage.removeItem('graphicsLabUserMode');
  localStorage.removeItem('graphicsLabCommentUser');
}
