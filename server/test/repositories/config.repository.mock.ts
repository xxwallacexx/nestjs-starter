import { AppEnvironment, AppWorker } from 'src/enum';
import { ConfigRepository, EnvData } from 'src/repositories/config.repository';
import { RepositoryInterface } from 'src/types';
import { Mocked, vitest } from 'vitest';

const envData: EnvData = {
  port: 2283,
  environment: AppEnvironment.PRODUCTION,

  buildMetadata: {},
  bull: {
    config: {
      connection: {},
      prefix: 'bull',
    },
    queues: [{ name: 'queue-1' }],
  },

  cls: {
    config: {},
  },

  database: {
    config: {
      connectionType: 'parts',
      database: 'fat',
      host: 'database',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
    },

    skipMigrations: false,
  },

  licensePublicKey: {
    client: 'client-public-key',
    server: 'server-public-key',
  },

  network: {
    trustedProxies: [],
  },

  otel: {
    metrics: {
      hostMetrics: false,
      apiMetrics: {
        enable: false,
        ignoreRoutes: [],
      },
    },
  },

  redis: {
    host: 'redis',
    port: 6379,
    db: 0,
  },

  resourcePaths: {
    lockFile: 'build-lock.json',
    web: {
      root: '/build/www',
      indexHtml: '/build/www/index.html',
    },
  },

  storage: {
    ignoreMountCheckErrors: false,
  },

  telemetry: {
    apiPort: 8081,
    microservicesPort: 8082,
    metrics: new Set(),
  },

  workers: [AppWorker.API, AppWorker.MICROSERVICES],

  noColor: false,
};

export const mockEnvData = (config: Partial<EnvData>) => ({ ...envData, ...config });
export const newConfigRepositoryMock = (): Mocked<RepositoryInterface<ConfigRepository>> => {
  return {
    getEnv: vitest.fn().mockReturnValue(mockEnvData({})),
    getWorker: vitest.fn().mockReturnValue(AppWorker.API),
  };
};
