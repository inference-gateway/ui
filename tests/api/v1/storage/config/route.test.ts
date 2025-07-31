import { GET } from '@/app/api/v1/storage/config/route';
import { NextResponse } from 'next/server';

jest.mock('next/server');

const mockJson = jest.fn();
const mockNextResponse = {
  json: mockJson,
};

(NextResponse.json as jest.Mock).mockReturnValue(mockNextResponse);

describe('/api/v1/storage/config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('GET', () => {
    it('should return local storage config by default', async () => {
      delete process.env.STORAGE_TYPE;
      delete process.env.STORAGE_CONNECTION_URL;

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith({
        type: 'local',
      });
    });

    it('should return postgres storage config with connection URL', async () => {
      process.env.STORAGE_TYPE = 'postgres';
      process.env.STORAGE_CONNECTION_URL = 'postgresql://user:pass@localhost:5432/db';

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith({
        type: 'postgres',
        connectionUrl: 'postgresql://user:pass@localhost:5432/db',
      });
    });

    it('should return postgres storage config without connection URL if not set', async () => {
      process.env.STORAGE_TYPE = 'postgres';
      delete process.env.STORAGE_CONNECTION_URL;

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith({
        type: 'postgres',
      });
    });

    it('should handle custom storage type', async () => {
      process.env.STORAGE_TYPE = 'custom-storage';
      process.env.STORAGE_CONNECTION_URL = 'custom://connection-string';

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith({
        type: 'custom-storage',
        connectionUrl: 'custom://connection-string',
      });
    });

    it('should return local storage config when STORAGE_TYPE is empty string', async () => {
      process.env.STORAGE_TYPE = '';
      process.env.STORAGE_CONNECTION_URL = 'postgresql://user:pass@localhost:5432/db';

      await GET();

      expect(NextResponse.json).toHaveBeenCalledWith({
        type: 'local',
        connectionUrl: 'postgresql://user:pass@localhost:5432/db',
      });
    });
  });
});
