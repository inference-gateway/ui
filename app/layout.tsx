import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inference Gateway UI',
  description: 'A conversational UI for OpenAI-compatible APIs',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const isAuthEnabled = process.env.ENABLE_AUTH === 'true';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {isAuthEnabled ? (
            <SessionProvider
              refetchInterval={30}
              refetchOnWindowFocus={true}
              refetchWhenOffline={false}
              basePath="/api/auth"
            >
              {children}
            </SessionProvider>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
