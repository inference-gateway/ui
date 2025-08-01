import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ServerStorageServiceFactory } from '@/lib/storage-server';
import { StorageType } from '@/types/chat';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();

    const enableAuth = process.env.AUTH_ENABLE === 'true';
    if (enableAuth && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storageType = (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL;
    const connectionUrl = process.env.DB_CONNECTION_URL;

    const userId = session?.user?.id || (enableAuth ? undefined : 'default-user');

    const storageService = ServerStorageServiceFactory.createService({
      storageType,
      userId,
      connectionUrl,
    });

    const activeChatId = await storageService.getActiveChatId();

    return NextResponse.json({ activeChatId });
  } catch (error) {
    logger.error('Error fetching active chat ID', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    const enableAuth = process.env.AUTH_ENABLE === 'true';
    if (enableAuth && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activeChatId } = await request.json();

    const storageType = (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL;
    const connectionUrl = process.env.DB_CONNECTION_URL;

    const userId = session?.user?.id || (enableAuth ? undefined : 'default-user');

    const storageService = ServerStorageServiceFactory.createService({
      storageType,
      userId,
      connectionUrl,
    });

    await storageService.saveActiveChatId(activeChatId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error saving active chat ID', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
