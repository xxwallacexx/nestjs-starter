import { UpdatedAtTrigger, UpdateIdColumn } from 'src/decorators';
import { UserTable } from 'src/schemas/tables/user.table';
import {
  Column,
  CreateDateColumn,
  ForeignKeyColumn,
  PrimaryGeneratedColumn,
  Table,
  UpdateDateColumn,
} from 'src/sql-tools';

@Table({ name: 'sessions', primaryConstraintName: 'PK_48cb6b5c20faa63157b3c1baf7f' })
@UpdatedAtTrigger('sessions_updated_at')
export class SessionTable {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  token!: string;

  @ForeignKeyColumn(() => UserTable, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @UpdateIdColumn({ indexName: 'IDX_sessions_update_id' })
  updateId!: string;

  @Column({ default: '' })
  deviceType!: string;

  @Column({ default: '' })
  deviceOS!: string;
}
