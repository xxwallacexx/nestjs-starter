import { CronExpression } from '@nestjs/schedule';
import { LogLevel, QueueName } from 'src/enum';
import { ConcurrentQueueName } from 'src/types';

export interface SystemConfig {
  backup: {
    database: {
      enabled: boolean;
      cronExpression: string;
      keepLastAmount: number;
    };
  };
  job: Record<ConcurrentQueueName, { concurrency: number }>;
  logging: {
    enabled: boolean;
    level: LogLevel;
  };

  passwordLogin: {
    enabled: boolean;
  };
  newVersionCheck: {
    enabled: boolean;
  };

  server: {
    externalDomain: string;
    loginPageMessage: string;
    publicUsers: boolean;
  };
  user: {
    deleteDelay: number;
  };
}

export const defaults = Object.freeze<SystemConfig>({
  backup: {
    database: {
      enabled: true,
      cronExpression: CronExpression.EVERY_DAY_AT_2AM,
      keepLastAmount: 14,
    },
  },
  job: {
    [QueueName.BACKGROUND_TASK]: { concurrency: 5 },
    [QueueName.SEARCH]: { concurrency: 5 },
    [QueueName.MIGRATION]: { concurrency: 5 },
  },
  logging: {
    enabled: true,
    level: LogLevel.LOG,
  },
  passwordLogin: {
    enabled: true,
  },
  newVersionCheck: {
    enabled: true,
  },
  server: {
    externalDomain: '',
    loginPageMessage: '',
    publicUsers: true,
  },
  user: {
    deleteDelay: 7,
  },
});
