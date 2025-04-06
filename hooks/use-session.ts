"use client";

import { Session } from "next-auth";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useEffect } from "react";

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();

  // This is a workaround to ensure that the session is updated on the client side
  // On next standalone, the session is not updated automatically
  useEffect(() => {
    update();
  }, []);

  return {
    session: session as Session | null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    error: status === "unauthenticated" ? "Not authenticated" : undefined,
  };
}
