import { SigninClient } from './signin-client';
import { getEnabledProviders } from '@/lib/auth';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const isAuthEnabled = process.env.ENABLE_AUTH === 'true';
  if (!isAuthEnabled) {
    logger.debug('[Auth] Authentication is disabled, redirecting to chat');
    redirect('/chat');
  }

  try {
    const session = await auth();

    if (session && !session.error) {
      logger.debug('[Auth] Valid session found, redirecting to chat');
      redirect('/chat');
    }
  } catch (error) {
    logger.error('[Auth] Error getting session in signin page:', error);
    throw error;
  }

  const providers = getEnabledProviders();
  return <SigninClient providers={providers} />;
}
