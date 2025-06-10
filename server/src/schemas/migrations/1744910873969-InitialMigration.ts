import { Kysely, sql } from 'kysely';
import { LoggingRepository } from 'src/repositories/logging.repository';

const lastMigrationSql = sql<{ name: string }>`SELECT "name" FROM "migrations" ORDER BY "timestamp" DESC LIMIT 1;`;
const tableExists = sql<{ result: string | null }>`select to_regclass('migrations') as "result"`;
const logger = LoggingRepository.create();

export async function up(db: Kysely<any>): Promise<void> {
  const { rows } = await tableExists.execute(db);
  const hasTypeOrmMigrations = !!rows[0]?.result;
  if (hasTypeOrmMigrations) {
    const {
      rows: [lastMigration],
    } = await lastMigrationSql.execute(db);
    logger.log('Database has up to date TypeORM migrations, skipping initial Kysely migration');
    return;
  }

  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS "unaccent";`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`.execute(db);
  await sql`CREATE OR REPLACE FUNCTION uuid_v7(p_timestamp timestamp with time zone default clock_timestamp())
  RETURNS uuid
  VOLATILE LANGUAGE SQL
  AS $$
    select encode(
      set_bit(
        set_bit(
          overlay(uuid_send(gen_random_uuid())
                  placing substring(int8send(floor(extract(epoch from p_timestamp) * 1000)::bigint) from 3)
                  from 1 for 6
          ),
          52, 1
        ),
        53, 1
      ),
      'hex')::uuid;
  $$;`.execute(db);
  await sql`CREATE OR REPLACE FUNCTION updated_at()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    DECLARE
        clock_timestamp TIMESTAMP := clock_timestamp();
    BEGIN
        new."updatedAt" = clock_timestamp;
        new."updateId" = uuid_v7(clock_timestamp);
        return new;
    END;
  $$;`.execute(db);
  await sql`CREATE OR REPLACE FUNCTION f_concat_ws(text, text[])
  RETURNS text
  PARALLEL SAFE IMMUTABLE LANGUAGE SQL
  AS $$SELECT array_to_string($2, $1)$$;`.execute(db);
  await sql`CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS text
  PARALLEL SAFE STRICT IMMUTABLE LANGUAGE SQL
    RETURN unaccent('unaccent', $1)`.execute(db);
}

export async function down(): Promise<void> {
  // not implemented
}
