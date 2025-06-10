import { ColumnType } from 'kysely';
import { UpdatedAtTrigger, UpdateIdColumn } from 'src/decorators';
import { UserStatus } from 'src/enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  Table,
  UpdateDateColumn,
} from 'src/sql-tools';

type Timestamp = ColumnType<Date, Date | string, Date | string>;
type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S, I | undefined, U> : ColumnType<T, T | undefined, T>;

@Table('users')
@UpdatedAtTrigger('users_updated_at')
@Index({
  name: 'IDX_users_updated_at_asc_id_asc',
  columns: ['updatedAt', 'id'],
})
export class UserTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @Column({ default: '' })
  name!: Generated<string>;

  @Column({ type: 'boolean', default: false })
  isAdmin!: Generated<boolean>;

  @Column({ unique: true })
  email!: string;

  @Column({ default: '' })
  password!: Generated<string>;

  @Column({ type: 'boolean', default: true })
  shouldChangePassword!: Generated<boolean>;

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Timestamp>;

  @DeleteDateColumn()
  deletedAt!: Timestamp | null;

  @Column({ type: 'character varying', default: UserStatus.ACTIVE })
  status!: Generated<UserStatus>;

  @UpdateIdColumn()
  updateId!: Generated<string>;
}
