'use client';

import { Session } from 'next-auth';
import { useSession as useNextAuthSession } from 'next-auth/react';

export function useSession() {
  const { data: session, status } = useNextAuthSession();

  return {
    session: session as Session | null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    error: status === 'unauthenticated' ? 'Not authenticated' : undefined,
  };
}
