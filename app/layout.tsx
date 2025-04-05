import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { auth } from "@/lib/auth";
import Providers from "@/app/auth-providers";

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
  const session = isAuthEnabled ? await auth() : null;

  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className={inter.className}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
