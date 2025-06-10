import { RegisterQueueOptions } from '@nestjs/bullmq';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { QueueOptions } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Request, Response } from 'express';
import { RedisOptions } from 'ioredis';
import { CLS_ID, ClsModuleOptions } from 'nestjs-cls';
import { OpenTelemetryModuleOptions } from 'nestjs-otel/lib/interfaces';
import { join, resolve } from 'node:path';
import { parse } from 'pg-connection-string';
import { Notice } from 'postgres';
import { IWorker } from 'src/constants';
import { Telemetry } from 'src/decorators';
import { EnvDto } from 'src/dtos/env.dto';
import { AppEnvironment, AppHeader, AppTelemetry, AppWorker, LogLevel, QueueName } from 'src/enum';
import { DatabaseConnectionParams } from 'src/types';
import { setDifference } from 'src/utils/set';

type Ssl = 'require' | 'allow' | 'prefer' | 'verify-full' | boolean | object;
type PostgresConnectionConfig = {
  host?: string;
  password?: string;
  user?: string;
  port?: number;
  database?: string;
  client_encoding?: string;
  ssl?: Ssl;
  application_name?: string;
  fallback_application_name?: string;
  options?: string;
};

export interface EnvData {
  host?: string;
  port: number;
  environment: AppEnvironment;
  configFile?: string;
  logLevel?: LogLevel;

  buildMetadata: {
    build?: string;
    buildUrl?: string;
    buildImage?: string;
    buildImageUrl?: string;
    repository?: string;
    repositoryUrl?: string;
    sourceRef?: string;
    sourceCommit?: string;
    sourceUrl?: string;
    thirdPartySourceUrl?: string;
    thirdPartyBugFeatureUrl?: string;
    thirdPartyDocumentationUrl?: string;
    thirdPartySupportUrl?: string;
  };

  bull: {
    config: QueueOptions;
    queues: RegisterQueueOptions[];
  };

  cls: {
    config: ClsModuleOptions;
  };

  database: {
    config: DatabaseConnectionParams;
    skipMigrations: boolean;
  };

  licensePublicKey: {
    client: string;
    server: string;
  };

  network: {
    trustedProxies: string[];
  };

  otel: OpenTelemetryModuleOptions;

  resourcePaths: {
    lockFile: string;
    web: {
      root: string;
      indexHtml: string;
    };
  };

  redis: RedisOptions;

  telemetry: {
    apiPort: number;
    microservicesPort: number;
    metrics: Set<AppTelemetry>;
  };

  storage: {
    ignoreMountCheckErrors: boolean;
  };

  workers: AppWorker[];

  noColor: boolean;
  nodeVersion?: string;
}

const productionKeys = {
  client:
    'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF2LzdTMzJjUkE1KysxTm5WRHNDTQpzcFAvakpISU1xT0pYRm5oNE53QTJPcHorUk1mZGNvOTJQc09naCt3d1FlRXYxVTJjMnBqelRpUS8ybHJLcS9rCnpKUmxYd2M0Y1Vlc1FETUpPRitQMnFPTlBiQUprWHZDWFlCVUxpdENJa29Md2ZoU0dOanlJS2FSRGhkL3ROeU4KOCtoTlJabllUMWhTSWo5U0NrS3hVQ096YXRQVjRtQ0RlclMrYkUrZ0VVZVdwOTlWOWF6dkYwRkltblRXcFFTdwpjOHdFWmdPTWg0c3ZoNmFpY3dkemtQQ3dFTGFrMFZhQkgzMUJFVUNRTGI5K0FJdEhBVXRKQ0t4aGI1V2pzMXM5CmJyWGZpMHZycGdjWi82RGFuWTJxZlNQem5PbXZEMkZycmxTMXE0SkpOM1ZvN1d3LzBZeS95TWNtelRXWmhHdWgKVVFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tDQo=',
  server:
    'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFvcG5ZRGEwYS9kVTVJZUc3NGlFRQpNd2RBS2pzTmN6TGRDcVJkMVo5eTVUMndqTzdlWUlPZUpUc2wzNTBzUjBwNEtmU1VEU1h2QzlOcERwYzF0T0tsCjVzaEMvQXhwdlFBTENva0Y0anQ4dnJyZDlmQ2FYYzFUcVJiT21uaGl1Z0Q2dmtyME8vRmIzVURpM1UwVHZoUFAKbFBkdlNhd3pMcldaUExmbUhWVnJiclNLbW45SWVTZ3kwN3VrV1RJeUxzY2lOcnZuQnl3c0phUmVEdW9OV1BCSApVL21vMm1YYThtNHdNV2hpWGVoaUlPUXFNdVNVZ1BlQ3NXajhVVngxQ0dsUnpQREEwYlZOUXZlS1hXVnhjRUk2ClVMRWdKeTJGNDlsSDArYVlDbUJmN05FcjZWUTJXQjk1ZXZUS1hLdm4wcUlNN25nRmxjVUF3NmZ1VjFjTkNUSlMKNndJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tDQo=',
};

const stagingKeys = {
  client:
    'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFuSUNyTm5jbGpPSC9JdTNtWVVaRQp0dGJLV1c3OGRuajl5M0U2ekk3dU1NUndEckdYWFhkTGhkUDFxSWtlZHh0clVVeUpCMWR4R04yQW91S082MlNGCldrbU9PTmNGQlRBWFZTdjhUNVY0S0VwWnFQYWEwaXpNaGxMaE5sRXEvY1ZKdllrWlh1Z2x6b1o3cG1nbzFSdHgKam1iRm5NNzhrYTFRUUJqOVdLaEw2eWpWRUl2MDdVS0lKWHBNTnNuS2g1V083MjZhYmMzSE9udTlETjY5VnFFRQo3dGZrUnRWNmx2U1NzMkFVMngzT255cHA4ek53b0lPTWRibGsyb09aWWROZzY0Y3l2SzJoU0FlU3NVMFRyOVc5Ckgra0Y5QlNCNlk0QXl0QlVkSmkrK2pMSW5HM2Q5cU9ieFVzTlYrN05mRkF5NjJkL0xNR0xSOC9OUFc0U0s3c0MKRlFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tDQo=',
  server:
    'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUE3Sy8yd3ZLUS9NdU8ydi9MUm5saAoyUy9zTHhDOGJiTEw1UUlKOGowQ3BVZW40YURlY2dYMUpKUmtGNlpUVUtpNTdTbEhtS3RSM2JOTzJmdTBUUVg5Ck5WMEJzVzllZVB0MmlTMWl4VVFmTzRObjdvTjZzbEtac01qd29RNGtGRGFmM3VHTlZJc0dMb3UxVWRLUVhpeDEKUlRHcXVTb3NZVjNWRlk3Q1hGYTVWaENBL3poVXNsNGFuVXp3eEF6M01jUFVlTXBaenYvbVZiQlRKVzBPSytWZgpWQUJvMXdYMkVBanpBekVHVzQ3Vko4czhnMnQrNHNPaHFBNStMQjBKVzlORUg5QUpweGZzWE4zSzVtM00yNUJVClZXcTlRYStIdHRENnJ0bnAvcUFweXVkWUdwZk9HYTRCUlZTR1MxMURZM0xrb2FlRzYwUEU5NHpoYjduOHpMWkgKelFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tDQo=',
};

const WORKER_TYPES = new Set(Object.values(AppWorker));
const TELEMETRY_TYPES = new Set(Object.values(AppTelemetry));

const asSet = <T>(value: string | undefined, defaults: T[]) => {
  const values = (value || '').replaceAll(/\s/g, '').split(',').filter(Boolean);
  return new Set(values.length === 0 ? defaults : (values as T[]));
};

const isValidSsl = (ssl?: string | boolean | object): ssl is Ssl =>
  typeof ssl !== 'string' || ssl === 'require' || ssl === 'allow' || ssl === 'prefer' || ssl === 'verify-full';

const getEnv = (): EnvData => {
  const dto = plainToInstance(EnvDto, process.env);
  const errors = validateSync(dto);
  if (errors.length > 0) {
    throw new Error(
      `Invalid environment variables: ${errors.map((error) => `${error.property}=${error.value}`).join(', ')}`,
    );
  }

  const includedWorkers = asSet(dto.WORKERS_INCLUDE, [AppWorker.API, AppWorker.MICROSERVICES]);
  const excludedWorkers = asSet(dto.WORKERS_EXCLUDE, []);
  const workers = [...setDifference(includedWorkers, excludedWorkers)];
  for (const worker of workers) {
    if (!WORKER_TYPES.has(worker)) {
      throw new Error(`Invalid worker(s) found: ${workers.join(',')}`);
    }
  }

  const environment = dto.ENV || AppEnvironment.PRODUCTION;
  const isProd = environment === AppEnvironment.PRODUCTION;
  const buildFolder = dto.BUILD_DATA || '/build';
  const folders = {
    // eslint-disable-next-line unicorn/prefer-module
    dist: resolve(`${__dirname}/..`),
    web: join(buildFolder, 'www'),
  };

  const databaseUrl = dto.DB_URL;

  let redisConfig = {
    host: dto.REDIS_HOSTNAME || 'redis',
    port: dto.REDIS_PORT || 6379,
    db: dto.REDIS_DBINDEX || 0,
    username: dto.REDIS_USERNAME || undefined,
    password: dto.REDIS_PASSWORD || undefined,
    path: dto.REDIS_SOCKET || undefined,
  };

  const redisUrl = dto.REDIS_URL;
  if (redisUrl && redisUrl.startsWith('ioredis://')) {
    try {
      redisConfig = JSON.parse(Buffer.from(redisUrl.slice(10), 'base64').toString());
    } catch (error) {
      throw new Error(`Failed to decode redis options: ${error}`);
    }
  }

  const includedTelemetries =
    dto.TELEMETRY_INCLUDE === 'all'
      ? new Set(Object.values(AppTelemetry))
      : asSet<AppTelemetry>(dto.TELEMETRY_INCLUDE, []);

  const excludedTelemetries = asSet<AppTelemetry>(dto.TELEMETRY_EXCLUDE, []);
  const telemetries = setDifference(includedTelemetries, excludedTelemetries);
  for (const telemetry of telemetries) {
    if (!TELEMETRY_TYPES.has(telemetry)) {
      throw new Error(`Invalid telemetry found: ${telemetry}`);
    }
  }

  const databaseConnection: DatabaseConnectionParams = dto.DB_URL
    ? { connectionType: 'url', url: dto.DB_URL }
    : {
        connectionType: 'parts',
        host: dto.DB_HOSTNAME || 'database',
        port: dto.DB_PORT || 5432,
        username: dto.DB_USERNAME || 'postgres',
        password: dto.DB_PASSWORD || 'postgres',
        database: dto.DB_DATABASE_NAME || 'fat',
        ssl: dto.DB_SSL_MODE || undefined,
      };

  const parts = {
    connectionType: 'parts',
    host: dto.DB_HOSTNAME || 'database',
    port: dto.DB_PORT || 5432,
    username: dto.DB_USERNAME || 'postgres',
    password: dto.DB_PASSWORD || 'postgres',
    database: dto.DB_DATABASE_NAME || 'fat',
  } as const;

  let parsedOptions: PostgresConnectionConfig = parts;
  if (dto.DB_URL) {
    const parsed = parse(dto.DB_URL);
    if (!isValidSsl(parsed.ssl)) {
      throw new Error(`Invalid ssl option: ${parsed.ssl}`);
    }

    parsedOptions = {
      ...parsed,
      ssl: parsed.ssl,
      host: parsed.host ?? undefined,
      port: parsed.port ? Number(parsed.port) : undefined,
      database: parsed.database ?? undefined,
    };
  }

  const driverOptions = {
    ...parsedOptions,
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
        from: [20],
        parse: (value: string) => Number.parseInt(value),
        serialize: (value: number) => value.toString(),
      },
    },
    connection: {
      TimeZone: 'UTC',
    },
  };

  return {
    host: dto.HOST,
    port: dto.PORT || 2283,
    environment,
    configFile: dto.CONFIG_FILE,
    logLevel: dto.LOG_LEVEL,

    buildMetadata: {
      build: dto.BUILD,
      buildUrl: dto.BUILD_URL,
      buildImage: dto.BUILD_IMAGE,
      buildImageUrl: dto.BUILD_IMAGE_URL,
      repository: dto.REPOSITORY,
      repositoryUrl: dto.REPOSITORY_URL,
      sourceRef: dto.SOURCE_REF,
      sourceCommit: dto.SOURCE_COMMIT,
      sourceUrl: dto.SOURCE_URL,
      thirdPartySourceUrl: dto.THIRD_PARTY_SOURCE_URL,
      thirdPartyBugFeatureUrl: dto.THIRD_PARTY_BUG_FEATURE_URL,
      thirdPartyDocumentationUrl: dto.THIRD_PARTY_DOCUMENTATION_URL,
      thirdPartySupportUrl: dto.THIRD_PARTY_SUPPORT_URL,
    },

    bull: {
      config: {
        prefix: 'bull',
        connection: { ...redisConfig },
        defaultJobOptions: {
          attempts: 3,
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
      queues: Object.values(QueueName).map((name) => ({ name })),
    },

    cls: {
      config: {
        middleware: {
          mount: true,
          generateId: true,
          setup: (cls, req: Request, res: Response) => {
            const headerValues = req.headers[AppHeader.CID];
            const headerValue = Array.isArray(headerValues) ? headerValues[0] : headerValues;
            const cid = headerValue || cls.get(CLS_ID);
            cls.set(CLS_ID, cid);
            res.header(AppHeader.CID, cid);
          },
        },
      },
    },

    database: {
      config: databaseConnection,
      skipMigrations: dto.DB_SKIP_MIGRATIONS ?? false,
    },

    licensePublicKey: isProd ? productionKeys : stagingKeys,

    network: {
      trustedProxies: dto.TRUSTED_PROXIES ?? ['linklocal', 'uniquelocal'],
    },

    otel: {
      metrics: {
        hostMetrics: telemetries.has(AppTelemetry.HOST),
        apiMetrics: {
          enable: telemetries.has(AppTelemetry.API),
        },
      },
    },
    redis: redisConfig,
    resourcePaths: {
      lockFile: join(buildFolder, 'build-lock.json'),
      web: {
        root: folders.web,
        indexHtml: join(folders.web, 'index.html'),
      },
    },
    storage: {
      ignoreMountCheckErrors: !!dto.IGNORE_MOUNT_CHECK_ERRORS,
    },
    telemetry: {
      apiPort: dto.API_METRICS_PORT || 8081,
      microservicesPort: dto.MICROSERVICES_METRICS_PORT || 8082,
      metrics: telemetries,
    },
    workers,
    noColor: !!dto.NO_COLOR,
  };
};

let cached: EnvData | undefined;

@Injectable()
@Telemetry({ enabled: false })
export class ConfigRepository {
  constructor(@Inject(IWorker) @Optional() private worker?: AppWorker) {}

  getEnv() {
    if (!cached) {
      cached = getEnv();
    }
    return cached;
  }

  getWorker() {
    return this.worker;
  }
}

export const clearEnvCache = () => (cached = undefined);
