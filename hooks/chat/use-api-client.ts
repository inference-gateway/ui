'use client';

import { InferenceGatewayClient } from '@inference-gateway/sdk';
import { useEffect, useState } from 'react';

/**
 * A hook that creates and manages the API client with authentication
 */
export function useApiClient(accessToken?: string) {
  const [client, setClient] = useState<InferenceGatewayClient | null>(null);

  useEffect(() => {
    const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return window.fetch(input, {
        ...init,
        headers,
      });
    };

    const newClient = new InferenceGatewayClient({
      baseURL: '/api/v1',
      fetch: fetchWithAuth,
    });

    setClient(newClient);
  }, [accessToken]);

  return client;
}
