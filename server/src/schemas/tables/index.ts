import { APIKeyTable } from 'src/schemas/tables/api-key.table';
import { SessionTable } from 'src/schemas/tables/session.table';
import { SystemMetadataTable } from 'src/schemas/tables/system-metadata.table';
import { UserTable } from 'src/schemas/tables/user.table';
import { VersionHistoryTable } from 'src/schemas/tables/version-history.table';

export const tables = [APIKeyTable, SessionTable, SystemMetadataTable, UserTable, VersionHistoryTable];
