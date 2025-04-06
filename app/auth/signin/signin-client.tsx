"use client";

import { signIn } from "next-auth/react";
import { Key, Lock } from "lucide-react";
import { ProviderConfig } from "@/lib/auth";
import { useEffect, useState } from "react";
import logger from "@/lib/logger";

interface SigninClientProps {
  providers: ProviderConfig[];
}

export function SigninClient({ providers }: SigninClientProps) {
  const [, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  logger.debug("[SigninClient] Mounted:", providers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-xl max-w-md w-full space-y-8 border border-neutral-200/50 dark:border-neutral-700/50 transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
            <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-center text-neutral-800 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-center text-neutral-500 dark:text-neutral-400">
            Sign in to continue to your account
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() =>
                signIn(provider.id, {
                  callbackUrl: "/",
                  error: "/auth/error",
                })
              }
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
            >
              <Key className="h-5 w-5" />
              Continue with {provider.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
