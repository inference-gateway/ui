"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg max-w-md w-full space-y-6 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col items-center space-y-2">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          <h1 className="text-3xl font-bold text-center text-neutral-800 dark:text-white">
            Sign In Error
          </h1>
          <p className="text-center text-neutral-600 dark:text-neutral-300">
            There was an error signing in with your provider
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
