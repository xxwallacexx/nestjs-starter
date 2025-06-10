import { Expression, KyselyConfig, sql } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import { parse } from 'pg-connection-string';
import postgres, { Notice } from 'postgres';
import { DatabaseSslMode } from 'src/enum';
import { DatabaseConnectionParams } from 'src/types';

export const asUuid = (id: string | Expression<string>) => sql<string>`${id}::uuid`;

export const anyUuid = (ids: string[]) => sql<string>`any(${`{${ids}}`}::uuid[])`;

export const asVector = (embedding: number[]) => sql<string>`${`[${embedding}]`}::vector`;

export const unnest = (array: string[]) => sql<Record<string, string>>`unnest(array[${sql.join(array)}]::text[])`;

export const removeUndefinedKeys = <T extends object>(update: T, template: unknown) => {
  for (const key in update) {
    if ((template as T)[key] === undefined) {
      delete update[key];
    }
  }

  return update;
};

type Ssl = 'require' | 'allow' | 'prefer' | 'verify-full' | boolean | object;

const isValidSsl = (ssl?: string | boolean | object): ssl is Ssl =>
  typeof ssl !== 'string' || ssl === 'require' || ssl === 'allow' || ssl === 'prefer' || ssl === 'verify-full';

export const asPostgresConnectionConfig = (params: DatabaseConnectionParams) => {
  if (params.connectionType === 'parts') {
    return {
      host: params.host,
      port: params.port,
      username: params.username,
      password: params.password,
      database: params.database,
      ssl: params.ssl === DatabaseSslMode.Disable ? false : params.ssl,
    };
  }

  const { host, port, user, password, database, ...rest } = parse(params.url);
  let ssl: Ssl | undefined;
  if (rest.ssl) {
    if (!isValidSsl(rest.ssl)) {
      throw new Error(`Invalid ssl option: ${rest.ssl}`);
    }
    ssl = rest.ssl;
  }

  return {
    host: host ?? undefined,
    port: port ? Number(port) : undefined,
    username: user,
    password,
    database: database ?? undefined,
    ssl,
  };
};

export const getKyselyConfig = (
  params: DatabaseConnectionParams,
  options: Partial<postgres.Options<Record<string, postgres.PostgresType>>> = {},
): KyselyConfig => {
  const config = asPostgresConnectionConfig(params);

  return {
    dialect: new PostgresJSDialect({
      postgres: postgres({
        onnotice: (notice: Notice) => {
          if (notice['severity'] !== 'NOTICE') {
            console.warn('Postgres notice:', notice);
          }
        },
        max: 10,
        types: {
          date: {
            to: 1184,
            from: [1082, 1114, 1184],
            serialize: (x: Date | string) => (x instanceof Date ? x.toISOString() : x),
            parse: (x: string) => new Date(x),
          },
          bigint: {
            to: 20,
            from: [20, 1700],
            parse: (value: string) => Number.parseInt(value),
            serialize: (value: number) => value.toString(),
          },
        },
        connection: {
          TimeZone: 'UTC',
        },
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        ssl: config.ssl,
        ...options,
      }),
    }),
    log(event) {
      if (event.level === 'error') {
        console.error('Query failed :', {
          durationMs: event.queryDurationMillis,
          error: event.error,
          sql: event.query.sql,
          params: event.query.parameters,
        });
      }
    },
  };
};
