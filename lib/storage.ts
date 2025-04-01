import type { StorageOptions, StorageService } from "@/types/chat";
import { LocalStorageService } from "./storage-local";
import { RedisStorageService } from "./storage-redis";

export class StorageServiceFactory {
  static createService(options?: StorageOptions): StorageService {
    switch (options?.storageType) {
      case "redis":
        return new RedisStorageService(options);
      default:
        return new LocalStorageService(options);
    }
  }
}
