import { SystemMetadataRepository } from 'src/repositories/system-metadata.repository';
import { RepositoryInterface } from 'src/types';
import { clearConfigCache } from 'src/utils/config';
import { Mocked, vitest } from 'vitest';

export const newSystemMetadataRepositoryMock = (): Mocked<RepositoryInterface<SystemMetadataRepository>> => {
  clearConfigCache();
  return {
    readFile: vitest.fn(),
  };
};
