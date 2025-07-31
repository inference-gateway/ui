import logger from '@/lib/logger';
import { type StorageOptions, type StorageService, StorageType } from '@/types/chat';
import { LocalStorageService } from './storage-local';
import { PostgresStorageService } from './storage-postgres';

/**
 * Server-side storage factory that can create both local and PostgreSQL storage services.
 * This should only be used in server-side code (API routes, server components).
 */
export class ServerStorageServiceFactory {
  static createService(options?: StorageOptions): StorageService {
    const storageType = options?.storageType || StorageType.LOCAL;

    logger.debug('Creating server storage service', {
      storageType,
      userId: options?.userId,
      hasConnectionUrl: !!options?.connectionUrl,
    });

    switch (storageType) {
      case StorageType.LOCAL:
      case 'local':
        return new LocalStorageService(options);
      case StorageType.POSTGRES:
      case 'postgres':
        if (!options?.connectionUrl) {
          logger.error('PostgreSQL storage requires connectionUrl, falling back to local storage', {
            storageType,
            hasConnectionUrl: !!options?.connectionUrl,
          });
          return new LocalStorageService(options);
        }

        try {
          return new PostgresStorageService(options);
        } catch (error) {
          logger.error(
            'Failed to create PostgreSQL storage service, falling back to local storage',
            {
              storageType,
              hasConnectionUrl: !!options?.connectionUrl,
              error: error instanceof Error ? error.message : error,
            }
          );
          return new LocalStorageService(options);
        }
      default:
        logger.warn('Unknown storage type, falling back to local storage', {
          storageType,
        });
        return new LocalStorageService(options);
    }
  }
}
