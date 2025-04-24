import PageClient from './page-client';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await auth();

  if (!session) {
    logger.debug('[Auth] No session found, redirecting to signin page');
    redirect('/auth/signin');
  }

  if (session.error === 'TokenExpiredError') {
    logger.debug('[Auth] Token expired, redirecting to signin page');
    redirect('/auth/signin?error=Session expired, please sign in again');
  }

  return <PageClient />;
}
