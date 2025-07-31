import logger from '@/lib/logger';
import { type StorageOptions, type StorageService, StorageType } from '@/types/chat';
import { LocalStorageService } from './storage-local';

export class StorageServiceFactory {
  static createService(options?: StorageOptions): StorageService {
    const storageType = options?.storageType || StorageType.LOCAL;

    logger.debug('Creating storage service', {
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
        // TODO: Implement PostgresStorageService
        // Expected connectionUrl format: postgresql://username:password@host:port/database
        logger.warn('PostgreSQL storage not yet implemented, falling back to local storage', {
          storageType,
          hasConnectionUrl: !!options?.connectionUrl,
        });
        return new LocalStorageService(options);
      default:
        logger.warn('Unknown storage type, falling back to local storage', {
          storageType,
        });
        return new LocalStorageService(options);
    }
  }
}
