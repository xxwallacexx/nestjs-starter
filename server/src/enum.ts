export enum AuthType {
  PASSWORD = 'password',
  OAUTH = 'oauth',
}

export enum AppCookie {
  ACCESS_TOKEN = 'access_token',
  AUTH_TYPE = 'auth_type',
  IS_AUTHENTICATED = 'is_authenticated',
  SHARED_LINK_TOKEN = 'shared_link_token',
}

export enum AppHeader {
  API_KEY = 'x-api-key',
  USER_TOKEN = 'x-user-token',
  SESSION_TOKEN = 'x-session-token',
  CHECKSUM = 'x-checksum',
  CID = 'x-cid',
}

export enum AppQuery {
  API_KEY = 'apiKey',
  SESSION_KEY = 'sessionKey',
}

export enum DatabaseAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum Permission {
  ALL = 'all',
  ADMIN_USER_CREATE = 'admin.user.create',
  ADMIN_USER_READ = 'admin.user.read',
  ADMIN_USER_UPDATE = 'admin.user.update',
  ADMIN_USER_DELETE = 'admin.user.delete',
}

export enum UserStatus {
  ACTIVE = 'active',
  REMOVING = 'removing',
  DELETED = 'deleted',
}

export enum LogLevel {
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export enum MetadataKey {
  AUTH_ROUTE = 'auth_route',
  ADMIN_ROUTE = 'admin_route',
  SHARED_ROUTE = 'shared_route',
  API_KEY_SECURITY = 'api_key',
  EVENT_CONFIG = 'event_config',
  JOB_CONFIG = 'job_config',
  TELEMETRY_ENABLED = 'telemetry_enabled',
}

export enum CacheControl {
  PRIVATE_WITH_CACHE = 'private_with_cache',
  PRIVATE_WITHOUT_CACHE = 'private_without_cache',
  NONE = 'none',
}

export enum PaginationMode {
  LIMIT_OFFSET = 'limit-offset',
  SKIP_TAKE = 'skip-take',
}

export enum AppEnvironment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  PRODUCTION = 'production',
}

export enum AppWorker {
  API = 'api',
  MICROSERVICES = 'microservices',
}

export enum AppTelemetry {
  HOST = 'host',
  API = 'api',
  IO = 'io',
  REPO = 'repo',
  JOB = 'job',
}

export enum BootstrapEventPriority {
  // Database service should be initialized before anything else, most other services need database access
  DatabaseService = -200,
  // Initialise config after other bootstrap services, stop other services from using config on bootstrap
  SystemConfig = 100,
}

export enum QueueName {
  BACKGROUND_TASK = 'backgroundTask',
  MIGRATION = 'migration',
  SEARCH = 'search',
  NOTIFICATION = 'notifications',
  BACKUP_DATABASE = 'backupDatabase',
}

export enum JobName {
  //backups
  BACKUP_DATABASE = 'database-backup',

  // Notification
  // NOTIFY_SIGNUP = 'notify-signup',
  // SEND_EMAIL = 'notification-send-email',

  // Version check
  // VERSION_CHECK = 'version-check',
}

export enum JobCommand {
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  EMPTY = 'empty',
  CLEAR_FAILED = 'clear-failed',
}

export enum JobStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum QueueCleanType {
  FAILED = 'failed',
}

export enum DatabaseLock {
  Migrations = 200,
  SystemFileMounts = 300,
  StorageTemplateMigration = 420,
  VersionHistory = 500,
  CLIPDimSize = 512,
  Library = 1337,
  GetSystemConfig = 69,
  BackupDatabase = 42,
}

export enum StorageFolder {
  BACKUPS = 'backups',
}

export enum SystemMetadataKey {
  ADMIN_ONBOARDING = 'admin-onboarding',
  SYSTEM_CONFIG = 'system-config',
  SYSTEM_FLAGS = 'system-flags',
  VERSION_CHECK_STATE = 'version-check-state',
}

export enum UserMetadataKey {
  PREFERENCES = 'preferences',
  LICENSE = 'license',
}

export enum SyncRequestType {
  UsersV1 = 'UsersV1',
}

export enum SyncEntityType {
  UserV1 = 'UserV1',
  UserDeleteV1 = 'UserDeleteV1',
}

export enum ManualJobName {
  PERSON_CLEANUP = 'person-cleanup',
  MEMORY_CLEANUP = 'memory-cleanup',
  MEMORY_CREATE = 'memory-create',
  BACKUP_DATABASE = 'backup-database',
}
