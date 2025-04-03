import { type StorageOptions, type StorageService } from "@/types/chat";
import { LocalStorageService } from "./storage-local";

export class StorageServiceFactory {
  static createService(options?: StorageOptions): StorageService {
    switch (options?.storageType) {
      default:
        return new LocalStorageService(options);
    }
  }
}
