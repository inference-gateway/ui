import logger from '@/lib/logger';
import { type StorageOptions, type StorageService, StorageType } from '@/types/chat';
import { LocalStorageService } from './storage-local';
import { ApiStorageService } from './storage-api';

/**
 * Client-side storage factory that supports both local storage and API-based storage.
 * For PostgreSQL storage, it uses API routes to communicate with the server.
 */
export class StorageServiceFactory {
  static createService(options?: StorageOptions): StorageService {
    const storageType = options?.storageType || StorageType.LOCAL;

    logger.debug('Creating client storage service', {
      storageType,
      userId: options?.userId,
    });

    switch (storageType) {
      case StorageType.LOCAL:
      case 'local':
        return new LocalStorageService(options);
      case StorageType.POSTGRES:
      case 'postgres':
        logger.debug('Using API-based storage for PostgreSQL backend');
        return new ApiStorageService(options);
      default:
        logger.warn('Unknown storage type, falling back to local storage', {
          storageType,
        });
        return new LocalStorageService(options);
    }
  }
}
