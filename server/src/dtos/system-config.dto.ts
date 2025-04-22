import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SystemConfig } from 'src/config';
import { LogLevel, QueueName } from 'src/enum';
import { ConcurrentQueueName } from 'src/types';
import { IsCronExpression, ValidateBoolean } from 'src/validation';

const isLibraryScanEnabled = (config: SystemConfigLibraryScanDto) => config.enabled;
const isEmailNotificationEnabled = (config: SystemConfigSmtpDto) => config.enabled;
const isDatabaseBackupEnabled = (config: DatabaseBackupConfig) => config.enabled;

export class DatabaseBackupConfig {
  @ValidateBoolean()
  enabled!: boolean;

  @ValidateIf(isDatabaseBackupEnabled)
  @IsNotEmpty()
  @IsCronExpression()
  @IsString()
  cronExpression!: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  keepLastAmount!: number;
}

export class SystemConfigBackupsDto {
  @Type(() => DatabaseBackupConfig)
  @ValidateNested()
  @IsObject()
  database!: DatabaseBackupConfig;
}

class JobSettingsDto {
  @IsInt()
  @IsPositive()
  @ApiProperty({ type: 'integer' })
  concurrency!: number;
}

class SystemConfigJobDto implements Record<ConcurrentQueueName, JobSettingsDto> {
  @ApiProperty({ type: JobSettingsDto })
  @ValidateNested()
  @IsObject()
  @Type(() => JobSettingsDto)
  [QueueName.MIGRATION]!: JobSettingsDto;

  @ApiProperty({ type: JobSettingsDto })
  @ValidateNested()
  @IsObject()
  @Type(() => JobSettingsDto)
  [QueueName.BACKGROUND_TASK]!: JobSettingsDto;

  @ApiProperty({ type: JobSettingsDto })
  @ValidateNested()
  @IsObject()
  @Type(() => JobSettingsDto)
  [QueueName.SEARCH]!: JobSettingsDto;

  @ApiProperty({ type: JobSettingsDto })
  @ValidateNested()
  @IsObject()
  @Type(() => JobSettingsDto)
  [QueueName.NOTIFICATION]!: JobSettingsDto;
}

class SystemConfigLibraryScanDto {
  @ValidateBoolean()
  enabled!: boolean;

  @ValidateIf(isLibraryScanEnabled)
  @IsNotEmpty()
  @IsCronExpression()
  @IsString()
  cronExpression!: string;
}

class SystemConfigLoggingDto {
  @ValidateBoolean()
  enabled!: boolean;

  @ApiProperty({ enum: LogLevel, enumName: 'LogLevel' })
  @IsEnum(LogLevel)
  level!: LogLevel;
}

class SystemConfigNewVersionCheckDto {
  @ValidateBoolean()
  enabled!: boolean;
}

class SystemConfigPasswordLoginDto {
  @ValidateBoolean()
  enabled!: boolean;
}

class SystemConfigServerDto {
  @ValidateIf((_, value: string) => value !== '')
  @IsUrl({
    require_tld: false,
    require_protocol: true,
    protocols: ['http', 'https'],
  })
  externalDomain!: string;

  @IsString()
  loginPageMessage!: string;

  @IsBoolean()
  publicUsers!: boolean;
}

class SystemConfigSmtpTransportDto {
  @IsBoolean()
  ignoreCert!: boolean;

  @IsNotEmpty()
  @IsString()
  host!: string;

  @IsNumber()
  @Min(0)
  @Max(65_535)
  port!: number;

  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export class SystemConfigSmtpDto {
  @IsBoolean()
  enabled!: boolean;

  @ValidateIf(isEmailNotificationEnabled)
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  from!: string;

  @IsString()
  replyTo!: string;

  @ValidateIf(isEmailNotificationEnabled)
  @Type(() => SystemConfigSmtpTransportDto)
  @ValidateNested()
  @IsObject()
  transport!: SystemConfigSmtpTransportDto;
}

class SystemConfigNotificationsDto {
  @Type(() => SystemConfigSmtpDto)
  @ValidateNested()
  @IsObject()
  smtp!: SystemConfigSmtpDto;
}

class SystemConfigUserDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ type: 'integer' })
  deleteDelay!: number;
}

export class SystemConfigDto implements SystemConfig {
  @Type(() => SystemConfigBackupsDto)
  @ValidateNested()
  @IsObject()
  backup!: SystemConfigBackupsDto;

  @Type(() => SystemConfigLoggingDto)
  @ValidateNested()
  @IsObject()
  logging!: SystemConfigLoggingDto;

  @Type(() => SystemConfigNewVersionCheckDto)
  @ValidateNested()
  @IsObject()
  newVersionCheck!: SystemConfigNewVersionCheckDto;

  @Type(() => SystemConfigPasswordLoginDto)
  @ValidateNested()
  @IsObject()
  passwordLogin!: SystemConfigPasswordLoginDto;

  @Type(() => SystemConfigJobDto)
  @ValidateNested()
  @IsObject()
  job!: SystemConfigJobDto;

  @Type(() => SystemConfigNotificationsDto)
  @ValidateNested()
  @IsObject()
  notifications!: SystemConfigNotificationsDto;

  @Type(() => SystemConfigServerDto)
  @ValidateNested()
  @IsObject()
  server!: SystemConfigServerDto;

  @Type(() => SystemConfigUserDto)
  @ValidateNested()
  @IsObject()
  user!: SystemConfigUserDto;
}

export function mapConfig(config: SystemConfig): SystemConfigDto {
  return config;
}
