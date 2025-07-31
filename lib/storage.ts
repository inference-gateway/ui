import logger from '@/lib/logger';
import { type StorageOptions, type StorageService, StorageType } from '@/types/chat';
import { LocalStorageService } from './storage-local';

export class StorageServiceFactory {
  static createService(options?: StorageOptions): StorageService {
    const storageType = options?.storageType || StorageType.LOCAL;
    
    logger.debug('Creating storage service', {
      storageType,
      userId: options?.userId,
    });
    
    switch (storageType) {
      case StorageType.LOCAL:
      case 'local':
        return new LocalStorageService(options);
      // Future storage implementations can be added here:
      // case StorageType.DATABASE:
      // case 'database':
      //   return new DatabaseStorageService(options);
      // case StorageType.SUPABASE:
      // case 'supabase':
      //   return new SupabaseStorageService(options);
      default:
        logger.warn('Unknown storage type, falling back to local storage', {
          storageType,
        });
        return new LocalStorageService(options);
    }
  }
}
