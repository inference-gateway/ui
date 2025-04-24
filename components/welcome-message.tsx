'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Session } from 'next-auth';

export interface WelcomeMessageProps {
  session?: Session | null;
}

export default function WelcomeMessage({ session }: WelcomeMessageProps) {
  if (!session) {
    return null;
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Welcome, {session?.user?.name}!</span>
      <Button
        onClick={handleLogout}
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground h-7 w-7"
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
