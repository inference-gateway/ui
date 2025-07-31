import { StorageType, StorageOptions } from '@/types/chat';
import logger from '@/lib/logger';

export function getStorageConfig(): StorageOptions {
  const storageType = (process.env.NEXT_PUBLIC_STORAGE_TYPE as StorageType) || StorageType.LOCAL;

  logger.debug('Storage configuration detected', { storageType });

  const config: StorageOptions = {
    storageType,
  };

  if (storageType === StorageType.SUPABASE) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.warn(
        'Supabase storage type selected but configuration missing, falling back to local storage',
        {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
        }
      );

      return {
        storageType: StorageType.LOCAL,
      };
    }

    config.supabase = {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    };
  }

  return config;
}

export function getStorageConfigWithUserId(userId?: string): StorageOptions {
  const config = getStorageConfig();

  if (userId) {
    config.userId = userId;
  }

  return config;
}
