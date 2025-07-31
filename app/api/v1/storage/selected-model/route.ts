import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ServerStorageServiceFactory } from '@/lib/storage-server';
import { StorageType } from '@/types/chat';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();

    const enableAuth = process.env.ENABLE_AUTH === 'true';
    if (enableAuth && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storageType = (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL;
    const connectionUrl = process.env.DATABASE_URL;

    const userId = session?.user?.id || (enableAuth ? undefined : 'default-user');

    const storageService = ServerStorageServiceFactory.createService({
      storageType,
      userId,
      connectionUrl,
    });

    const selectedModel = await storageService.getSelectedModel();

    return NextResponse.json({ selectedModel });
  } catch (error) {
    logger.error('Error fetching selected model', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    const enableAuth = process.env.ENABLE_AUTH === 'true';
    if (enableAuth && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { selectedModel } = await request.json();

    const storageType = (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL;
    const connectionUrl = process.env.DATABASE_URL;

    const userId = session?.user?.id || (enableAuth ? undefined : 'default-user');

    const storageService = ServerStorageServiceFactory.createService({
      storageType,
      userId,
      connectionUrl,
    });

    await storageService.saveSelectedModel(selectedModel);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error saving selected model', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
