"use client";
import { useState, useEffect } from 'react';
import { checkIsAdmin } from '@/lib/admin';

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const stored = localStorage.getItem('graphicsLabCommentUser');
        if (!stored) { setIsLoading(false); return; }
        const { email } = JSON.parse(stored);
        if (!email) { setIsLoading(false); return; }
        const result = await checkIsAdmin(email);
        setIsAdmin(result);
      } catch {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    check();
  }, []);

  return { isAdmin, isLoading };
}
