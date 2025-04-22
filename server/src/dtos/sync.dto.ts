import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { SyncEntityType, SyncRequestType } from 'src/enum';
import { Optional } from 'src/validation';

export class SyncUserV1 {
  id!: string;
  name!: string;
  email!: string;
  deletedAt!: Date | null;
}

export class SyncUserDeleteV1 {
  userId!: string;
}

export type SyncItem = {
  [SyncEntityType.UserV1]: SyncUserV1;
  [SyncEntityType.UserDeleteV1]: SyncUserDeleteV1;
};

const responseDtos = [
  //
  SyncUserV1,
  SyncUserDeleteV1,
];

export const extraSyncModels = responseDtos;

export class SyncStreamDto {
  @IsEnum(SyncRequestType, { each: true })
  @ApiProperty({ enumName: 'SyncRequestType', enum: SyncRequestType, isArray: true })
  types!: SyncRequestType[];
}

export class SyncAckDto {
  @ApiProperty({ enumName: 'SyncEntityType', enum: SyncEntityType })
  type!: SyncEntityType;
  ack!: string;
}

export class SyncAckSetDto {
  @IsString({ each: true })
  acks!: string[];
}

export class SyncAckDeleteDto {
  @IsEnum(SyncEntityType, { each: true })
  @ApiProperty({ enumName: 'SyncEntityType', enum: SyncEntityType, isArray: true })
  @Optional()
  types?: SyncEntityType[];
}
