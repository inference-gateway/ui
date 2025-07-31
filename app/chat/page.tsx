import PageClient from './page-client';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import logger from '@/lib/logger';
import type { StorageConfig } from '@/types/chat';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const isAuthEnabled = process.env.ENABLE_AUTH === 'true';
  const session = await auth();

  if (isAuthEnabled && !session) {
    logger.debug('[Auth] No session found, redirecting to signin page');
    redirect('/auth/signin');
  }

  if (isAuthEnabled && session?.error === 'TokenExpiredError') {
    logger.debug('[Auth] Token expired, redirecting to signin page');
    redirect('/auth/signin?error=Session expired, please sign in again');
  }

  const storageConfig: StorageConfig = {
    type: process.env.STORAGE_TYPE || 'local',
    ...(process.env.DATABASE_URL && { connectionUrl: process.env.DATABASE_URL }),
  };

  logger.debug('Server-side storage configuration', {
    storageType: storageConfig.type,
    hasConnectionUrl: !!storageConfig.connectionUrl,
    userId: session?.user?.id,
  });

  return <PageClient session={session} storageConfig={storageConfig} />;
}
