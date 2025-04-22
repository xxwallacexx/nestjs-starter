import { SystemConfig } from 'src/config';
import { JobName, QueueName, SystemMetadataKey } from 'src/enum';

export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export type RepositoryInterface<T extends object> = Pick<T, keyof T>;

export type TagItem = {
  id: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
  color: string | null;
  parentId: string | null;
};

export interface CropOptions {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type ConcurrentQueueName = Exclude<QueueName, QueueName.BACKUP_DATABASE>;

export type Jobs = { [K in JobItem['name']]: (JobItem & { name: K })['data'] };
export type JobOf<T extends keyof Jobs> = Jobs[T];

export interface IBaseJob {
  force?: boolean;
}

export interface IEntityJob extends IBaseJob {
  id: string;
  source?: 'copy';
  notify?: boolean;
}

export type EmailImageAttachment = {
  filename: string;
  path: string;
  cid: string;
};

export interface IEmailJob {
  to: string;
  subject: string;
  html: string;
  text: string;
  imageAttachments?: EmailImageAttachment[];
}

export interface INotifySignupJob extends IEntityJob {
  tempPassword?: string;
}

export interface JobCounts {
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  waiting: number;
  paused: number;
}

export interface QueueStatus {
  isActive: boolean;
  isPaused: boolean;
}

export type JobItem =
  // Backups
  { name: JobName.BACKUP_DATABASE; data?: IBaseJob };

export type DatabaseConnectionURL = {
  connectionType: 'url';
  url: string;
};

export type DatabaseConnectionParts = {
  connectionType: 'parts';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type DatabaseConnectionParams = DatabaseConnectionURL | DatabaseConnectionParts;

export interface ExtensionVersion {
  availableVersion: string | null;
  installedVersion: string | null;
}

export type VersionCheckMetadata = {
  checkedAt: string;
  releaseVersion: string;
};

export interface SystemMetadata extends Record<SystemMetadataKey, Record<string, any>> {
  [SystemMetadataKey.ADMIN_ONBOARDING]: { isOnboarded: boolean };
  [SystemMetadataKey.SYSTEM_CONFIG]: DeepPartial<SystemConfig>;
  [SystemMetadataKey.VERSION_CHECK_STATE]: VersionCheckMetadata;
}
