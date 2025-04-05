"use client";

import type { JSX } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Key, Github, Lock } from "lucide-react";

interface AuthProvider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

interface ProviderButtonConfig {
  icon: JSX.Element;
  name: string;
  className: string;
}

type ProviderButtons = {
  [key: string]: ProviderButtonConfig;
};

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<AuthProvider[]>([]);

  useEffect(() => {
    if (session) {
      router.push("/");
    }

    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => setProviders(Object.values(data)))
      .catch(console.error);
  }, [session, router]);

  const providerButtons: ProviderButtons = {
    keycloak: {
      icon: <Key className="h-5 w-5" />,
      name: "Keycloak",
      className: "bg-blue-600 hover:bg-blue-700",
    },
    github: {
      icon: <Github className="h-5 w-5" />,
      name: "GitHub",
      className: "bg-neutral-800 hover:bg-neutral-700",
    },
    google: {
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ),
      name: "Google",
      className: "bg-red-600 hover:bg-red-500",
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg max-w-md w-full space-y-6 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col items-center space-y-2">
          <Lock className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-center text-neutral-800 dark:text-white">
            Sign In
          </h1>
          <p className="text-center text-neutral-600 dark:text-neutral-300">
            Choose your authentication provider to continue
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() =>
                signIn(provider.id, {
                  callbackUrl: "/",
                  error: "/auth/error",
                })
              }
              className={`w-full flex items-center justify-center gap-2 text-white font-medium py-2.5 px-4 rounded-md transition-colors ${
                providerButtons[provider.id].className
              }`}
            >
              {providerButtons[provider.id].icon}
              Sign in with {providerButtons[provider.id].name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
