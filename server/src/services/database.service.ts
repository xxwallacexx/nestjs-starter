import { Injectable } from '@nestjs/common';
import semver from 'semver';
import { OnEvent } from 'src/decorators';
import { BootstrapEventPriority, DatabaseLock } from 'src/enum';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class DatabaseService extends BaseService {
  @OnEvent({ name: 'app.bootstrap', priority: BootstrapEventPriority.DatabaseService })
  async onBootstrap() {
    const version = await this.databaseRepository.getPostgresVersion();
    const current = semver.coerce(version);
    const postgresRange = this.databaseRepository.getPostgresVersionRange();
    if (!current || !semver.satisfies(current, postgresRange)) {
      throw new Error(
        `Invalid PostgreSQL version. Found ${version}, but needed ${postgresRange}. Please use a supported version.`,
      );
    }

    await this.databaseRepository.withLock(DatabaseLock.Migrations, async () => {
      const { database } = this.configRepository.getEnv();
      if (!database.skipMigrations) {
        await this.databaseRepository.runMigrations();
      }
    });
  }
}
