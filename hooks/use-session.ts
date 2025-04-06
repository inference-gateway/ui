"use client";

import { Session } from "next-auth";
import { useSession as useNextAuthSession } from "next-auth/react";
import { useEffect } from "react";

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();

  useEffect(() => {
    // Only update once when mounted
    update();
  }, []); // Empty dependency array ensures it only runs once

  return {
    session: session as Session | null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    error: status === "unauthenticated" ? "Not authenticated" : undefined,
  };
}
