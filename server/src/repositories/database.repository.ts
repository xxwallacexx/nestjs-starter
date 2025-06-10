import { Injectable } from '@nestjs/common';
import AsyncLock from 'async-lock';
import { FileMigrationProvider, Kysely, Migrator, sql } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { POSTGRES_VERSION_RANGE } from 'src/constants';
import { DB } from 'src/db';
import { GenerateSql } from 'src/decorators';
import { DatabaseLock } from 'src/enum';
import { ConfigRepository } from 'src/repositories/config.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseRepository {
  private readonly asyncLock = new AsyncLock();

  constructor(
    @InjectKysely() private db: Kysely<DB>,
    private logger: LoggingRepository,
    private configRepository: ConfigRepository,
  ) {
    this.logger.setContext(DatabaseRepository.name);
  }

  async shutdown() {
    await this.db.destroy();
  }

  @GenerateSql()
  async getPostgresVersion(): Promise<string> {
    const { rows } = await sql<{ server_version: string }>`SHOW server_version`.execute(this.db);
    return rows[0].server_version;
  }

  getPostgresVersionRange(): string {
    return POSTGRES_VERSION_RANGE;
  }

  async runMigrations(options?: { transaction?: 'all' | 'none' | 'each' }): Promise<void> {
    const { database } = this.configRepository.getEnv();

    this.logger.log('Running migrations, this may take a while');

    const tableExists = sql<{ result: string | null }>`select to_regclass('migrations') as "result"`;
    const { rows } = await tableExists.execute(this.db);
    const hasTypeOrmMigrations = !!rows[0]?.result;
    if (hasTypeOrmMigrations) {
      // eslint-disable-next-line unicorn/prefer-module
      const dist = resolve(`${__dirname}/..`);

      this.logger.debug('Running typeorm migrations');
      const dataSource = new DataSource({
        type: 'postgres',
        entities: [],
        subscribers: [],
        migrations: [`${dist}/migrations` + '/*.{js,ts}'],
        migrationsRun: false,
        synchronize: false,
        connectTimeoutMS: 10_000, // 10 seconds
        parseInt8: true,
        ...(database.config.connectionType === 'url'
          ? { url: database.config.url }
          : {
              host: database.config.host,
              port: database.config.port,
              username: database.config.username,
              password: database.config.password,
              database: database.config.database,
            }),
      });
      await dataSource.initialize();
      await dataSource.runMigrations(options);
      await dataSource.destroy();
      this.logger.debug('Finished running typeorm migrations');
    }

    this.logger.debug('Running kysely migrations');
    const migrator = new Migrator({
      db: this.db,
      migrationLockTableName: 'kysely_migrations_lock',
      migrationTableName: 'kysely_migrations',
      provider: new FileMigrationProvider({
        fs: { readdir },
        path: { join },
        // eslint-disable-next-line unicorn/prefer-module
        migrationFolder: join(__dirname, '..', 'schemas/migrations'),
      }),
    });

    const { error, results } = await migrator.migrateToLatest();

    for (const result of results ?? []) {
      if (result.status === 'Success') {
        this.logger.log(`Migration "${result.migrationName}" succeeded`);
      }

      if (result.status === 'Error') {
        this.logger.warn(`Migration "${result.migrationName}" failed`);
      }
    }

    if (error) {
      this.logger.error(`Kysely migrations failed: ${error}`);
      throw error;
    }

    this.logger.debug('Finished running kysely migrations');
  }

  async withLock<R>(lock: DatabaseLock, callback: () => Promise<R>): Promise<R> {
    let res;
    await this.asyncLock.acquire(DatabaseLock[lock], async () => {
      await this.db.connection().execute(async (connection) => {
        try {
          await this.acquireLock(lock, connection);
          res = await callback();
        } finally {
          await this.releaseLock(lock, connection);
        }
      });
    });

    return res as R;
  }

  tryLock(lock: DatabaseLock): Promise<boolean> {
    return this.db.connection().execute(async (connection) => this.acquireTryLock(lock, connection));
  }

  isBusy(lock: DatabaseLock): boolean {
    return this.asyncLock.isBusy(DatabaseLock[lock]);
  }

  async wait(lock: DatabaseLock): Promise<void> {
    await this.asyncLock.acquire(DatabaseLock[lock], () => {});
  }

  private async acquireLock(lock: DatabaseLock, connection: Kysely<DB>): Promise<void> {
    await sql`SELECT pg_advisory_lock(${lock})`.execute(connection);
  }

  private async acquireTryLock(lock: DatabaseLock, connection: Kysely<DB>): Promise<boolean> {
    const { rows } = await sql<{
      pg_try_advisory_lock: boolean;
    }>`SELECT pg_try_advisory_lock(${lock})`.execute(connection);
    return rows[0].pg_try_advisory_lock;
  }

  private async releaseLock(lock: DatabaseLock, connection: Kysely<DB>): Promise<void> {
    await sql`SELECT pg_advisory_unlock(${lock})`.execute(connection);
  }
}
