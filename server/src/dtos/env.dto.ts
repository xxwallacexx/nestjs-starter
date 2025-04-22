import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { AppEnvironment, LogLevel } from 'src/enum';
import { IsIPRange, Optional, ValidateBoolean } from 'src/validation';

export class EnvDto {
  @IsInt()
  @Optional()
  @Type(() => Number)
  API_METRICS_PORT?: number;

  @IsString()
  @Optional()
  BUILD_DATA?: string;

  @IsString()
  @Optional()
  BUILD?: string;

  @IsString()
  @Optional()
  BUILD_URL?: string;

  @IsString()
  @Optional()
  BUILD_IMAGE?: string;

  @IsString()
  @Optional()
  BUILD_IMAGE_URL?: string;

  @IsString()
  @Optional()
  CONFIG_FILE?: string;

  @IsEnum(AppEnvironment)
  @Optional()
  ENV?: AppEnvironment;

  @IsString()
  @Optional()
  HOST?: string;

  @ValidateBoolean({ optional: true })
  IGNORE_MOUNT_CHECK_ERRORS?: boolean;

  @IsEnum(LogLevel)
  @Optional()
  LOG_LEVEL?: LogLevel;

  @IsInt()
  @Optional()
  @Type(() => Number)
  MICROSERVICES_METRICS_PORT?: number;

  @IsInt()
  @Optional()
  @Type(() => Number)
  PORT?: number;

  @IsString()
  @Optional()
  REPOSITORY?: string;

  @IsString()
  @Optional()
  REPOSITORY_URL?: string;

  @IsString()
  @Optional()
  SOURCE_REF?: string;

  @IsString()
  @Optional()
  SOURCE_COMMIT?: string;

  @IsString()
  @Optional()
  SOURCE_URL?: string;

  @IsString()
  @Optional()
  TELEMETRY_INCLUDE?: string;

  @IsString()
  @Optional()
  TELEMETRY_EXCLUDE?: string;

  @IsString()
  @Optional()
  THIRD_PARTY_SOURCE_URL?: string;

  @IsString()
  @Optional()
  THIRD_PARTY_BUG_FEATURE_URL?: string;

  @IsString()
  @Optional()
  THIRD_PARTY_DOCUMENTATION_URL?: string;

  @IsString()
  @Optional()
  THIRD_PARTY_SUPPORT_URL?: string;

  @IsIPRange({ requireCIDR: false }, { each: true })
  @Transform(({ value }) =>
    value && typeof value === 'string'
      ? value
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : value,
  )
  @Optional()
  TRUSTED_PROXIES?: string[];

  @IsString()
  @Optional()
  WORKERS_INCLUDE?: string;

  @IsString()
  @Optional()
  WORKERS_EXCLUDE?: string;

  @IsString()
  @Optional()
  DB_DATABASE_NAME?: string;

  @IsString()
  @Optional()
  DB_HOSTNAME?: string;

  @IsString()
  @Optional()
  DB_PASSWORD?: string;

  @IsInt()
  @Optional()
  @Type(() => Number)
  DB_PORT?: number;

  @ValidateBoolean({ optional: true })
  DB_SKIP_MIGRATIONS?: boolean;

  @IsString()
  @Optional()
  DB_URL?: string;

  @IsString()
  @Optional()
  DB_USERNAME?: string;

  @IsEnum(['pgvector', 'pgvecto.rs'])
  @Optional()
  DB_VECTOR_EXTENSION?: 'pgvector' | 'pgvecto.rs';

  @IsString()
  @Optional()
  NO_COLOR?: string;

  @IsString()
  @Optional()
  REDIS_HOSTNAME?: string;

  @IsInt()
  @Optional()
  @Type(() => Number)
  REDIS_PORT?: number;

  @IsInt()
  @Optional()
  @Type(() => Number)
  REDIS_DBINDEX?: number;

  @IsString()
  @Optional()
  REDIS_USERNAME?: string;

  @IsString()
  @Optional()
  REDIS_PASSWORD?: string;

  @IsString()
  @Optional()
  REDIS_SOCKET?: string;

  @IsString()
  @Optional()
  REDIS_URL?: string;
}
