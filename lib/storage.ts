import logger from "@/lib/logger";
import { type StorageOptions, type StorageService } from "@/types/chat";
import { LocalStorageService } from "./storage-local";

export class StorageServiceFactory {
  static createService(options?: StorageOptions): StorageService {
    logger.debug("Creating storage service", {
      storageType: options?.storageType || "default (local)",
    });
    switch (options?.storageType) {
      // TODO - add at least one more storage type for external data persistence
      // Check how is supabase storage implemented - probably a good option.
      default:
        return new LocalStorageService(options);
    }
  }
}
