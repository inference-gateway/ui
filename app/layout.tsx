import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { auth } from "@/lib/auth";
import { AuthProvider, AppProviders } from "@/app/auth-providers";
import logger from "@/lib/logger";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inference Gateway UI",
  description: "A conversational UI for OpenAI-compatible APIs",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthEnabled = process.env.AUTH_ENABLED === "true";
  let session = null;
  try {
    session = isAuthEnabled ? await auth() : null;
  } catch (error) {
    logger.error("Error fetching session:", error);
    throw new Error("Failed to fetch session");
  }

  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={inter.className}>
        <AuthProvider session={session}>
          <AppProviders>{children}</AppProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
