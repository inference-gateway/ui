import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import type { StorageConfig } from '@/types/chat';

export async function GET() {
  try {
    const storageType = process.env.STORAGE_TYPE || 'local';
    const connectionUrl = process.env.DB_CONNECTION_URL;

    logger.debug('Storage config requested', {
      storageType,
      hasConnectionUrl: !!connectionUrl,
    });

    const config: StorageConfig = {
      type: storageType,
      ...(connectionUrl && { connectionUrl }),
    };

    return NextResponse.json(config);
  } catch (error) {
    logger.error('Failed to get storage config', {
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json({ error: 'Failed to get storage configuration' }, { status: 500 });
  }
}
