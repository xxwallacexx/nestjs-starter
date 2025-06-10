import { UpdatedAtTrigger, UpdateIdColumn } from 'src/decorators';
import { Permission } from 'src/enum';
import { UserTable } from 'src/schemas/tables/user.table';
import {
  Column,
  CreateDateColumn,
  ForeignKeyColumn,
  PrimaryGeneratedColumn,
  Table,
  UpdateDateColumn,
} from 'src/sql-tools';

@Table('api_keys')
@UpdatedAtTrigger('api_keys_updated_at')
export class APIKeyTable {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  key!: string;

  @Column({ array: true, type: 'character varying' })
  permissions!: Permission[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @UpdateIdColumn({ indexName: 'IDX_api_keys_update_id' })
  updateId?: string;

  @ForeignKeyColumn(() => UserTable, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  userId!: string;
}
