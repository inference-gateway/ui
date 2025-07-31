import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export interface StorageConfig {
  type: string;
  // Future storage configurations can be added here
  // database?: DatabaseConfig;
  // redis?: RedisConfig;
}

export async function GET() {
  try {
    const storageType = process.env.STORAGE_TYPE || 'local';
    
    logger.debug('Storage config requested', { storageType });
    
    const config: StorageConfig = {
      type: storageType,
    };
    
    return NextResponse.json(config);
  } catch (error) {
    logger.error('Failed to get storage config', {
      error: error instanceof Error ? error.message : error,
    });
    
    return NextResponse.json(
      { error: 'Failed to get storage configuration' },
      { status: 500 }
    );
  }
}