import { useState, useEffect } from 'react';
import logger from '@/lib/logger';
import type { StorageConfig } from '@/types/chat';

export function useStorageConfig() {
  const [config, setConfig] = useState<StorageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorageConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/v1/storage/config');
        if (!response.ok) {
          throw new Error(`Failed to fetch storage config: ${response.statusText}`);
        }
        
        const storageConfig: StorageConfig = await response.json();
        
        logger.debug('Storage configuration loaded', storageConfig);
        setConfig(storageConfig);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error('Failed to load storage configuration', { error: errorMessage });
        setError(errorMessage);
        
        // Fallback to local storage
        setConfig({ type: 'local' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageConfig();
  }, []);

  return { config, isLoading, error };
}