import { Duration } from 'luxon';
import { readFileSync } from 'node:fs';
import { SemVer } from 'semver';

export const POSTGRES_VERSION_RANGE = '>=14.0.0';

export const NEXT_RELEASE = 'NEXT_RELEASE';
export const LIFECYCLE_EXTENSION = 'x-lifecycle';
export const DEPRECATED_IN_PREFIX = 'This property was deprecated in ';
export const ADDED_IN_PREFIX = 'This property was added in ';

export const JOBS_ASSET_PAGINATION_SIZE = 1000;
export const JOBS_LIBRARY_PAGINATION_SIZE = 10_000;

export const SALT_ROUNDS = 10;

export const IWorker = 'IWorker';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));
export const serverVersion = new SemVer(version);

export const APP_MEDIA_LOCATION = process.env.MEDIA_LOCATION || './upload';

export const AUDIT_LOG_MAX_DURATION = Duration.fromObject({ days: 100 });
export const ONE_HOUR = Duration.fromObject({ hours: 1 });

export const LOGIN_URL = '/auth/login?autoLaunch=0';

export const excludePaths = ['/.well-known/fat', '/custom.css', '/favicon.ico'];
