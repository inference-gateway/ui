'use client';

import { useSession } from '@/hooks/use-session';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomeMessage() {
  const { session, isAuthenticated } = useSession();

  if (!isAuthenticated || !session?.user?.name) {
    return null;
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Welcome, {session.user.name}!</span>
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
