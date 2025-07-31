import logger from '@/lib/logger';
import { StorageType, type StorageOptions, type StorageService } from '@/types/chat';
import { LocalStorageService } from './storage-local';
import { SupabaseStorageService } from './storage-supabase';

export class StorageServiceFactory {
  static createService(options?: StorageOptions): StorageService {
    logger.debug('Creating storage service', {
      storageType: options?.storageType || 'default (local)',
    });

    switch (options?.storageType) {
      case StorageType.SUPABASE:
        return new SupabaseStorageService(options);
      case StorageType.LOCAL:
      default:
        return new LocalStorageService(options);
    }
  }
}
