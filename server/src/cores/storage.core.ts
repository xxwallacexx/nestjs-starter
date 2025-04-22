import { randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { APP_MEDIA_LOCATION } from 'src/constants';
import { StorageFolder } from 'src/enum';
import { StorageRepository } from 'src/repositories/storage.repository';

let instance: StorageCore | null;

export class StorageCore {
  private constructor(private storageRepository: StorageRepository) {}

  static create(storageRepository: StorageRepository) {
    if (!instance) {
      instance = new StorageCore(storageRepository);
    }

    return instance;
  }

  static reset() {
    instance = null;
  }

  static getFolderLocation(folder: StorageFolder, userId: string) {
    return join(StorageCore.getBaseFolder(folder), userId);
  }

  static getBaseFolder(folder: StorageFolder) {
    return join(APP_MEDIA_LOCATION, folder);
  }

  static isAppPath(path: string) {
    const resolvedPath = resolve(path);
    const resolvedAppMediaLocation = resolve(APP_MEDIA_LOCATION);
    const normalizedPath = resolvedPath.endsWith('/') ? resolvedPath : resolvedPath + '/';
    const normalizedAppMediaLocation = resolvedAppMediaLocation.endsWith('/')
      ? resolvedAppMediaLocation
      : resolvedAppMediaLocation + '/';
    return normalizedPath.startsWith(normalizedAppMediaLocation);
  }

  ensureFolders(input: string) {
    this.storageRepository.mkdirSync(dirname(input));
  }

  removeEmptyDirs(folder: StorageFolder) {
    return this.storageRepository.removeEmptyDirs(StorageCore.getBaseFolder(folder));
  }

  static getNestedFolder(folder: StorageFolder, ownerId: string, filename: string): string {
    return join(StorageCore.getFolderLocation(folder, ownerId), filename.slice(0, 2), filename.slice(2, 4));
  }

  static getNestedPath(folder: StorageFolder, ownerId: string, filename: string): string {
    return join(this.getNestedFolder(folder, ownerId, filename), filename);
  }

  static getTempPathInDir(dir: string): string {
    return join(dir, `${randomUUID()}.tmp`);
  }
}
