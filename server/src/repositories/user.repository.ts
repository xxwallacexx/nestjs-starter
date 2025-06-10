import { Injectable } from '@nestjs/common';
import { Insertable, Kysely, Updateable } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { columns } from 'src/database';
import { DB } from 'src/db';
import { DummyValue, GenerateSql } from 'src/decorators';
import { UserTable } from 'src/schemas/tables/user.table';
import { asUuid } from 'src/utils/database';

export interface UserListFilter {
  withDeleted?: boolean;
}

export interface UserFindOptions {
  withDeleted?: boolean;
}

@Injectable()
export class UserRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.BOOLEAN] })
  get(userId: string, options: UserFindOptions) {
    options = options || {};
    return this.db
      .selectFrom('users')
      .select(columns.userAdmin)
      .where('users.id', '=', userId)
      .$if(!options.withDeleted, (eb) => eb.where('users.deletedAt', 'is', null))
      .executeTakeFirst();
  }

  @GenerateSql()
  getAdmin() {
    return this.db
      .selectFrom('users')
      .select(columns.userAdmin)
      .where('users.isAdmin', '=', true)
      .where('users.deletedAt', 'is', null)
      .executeTakeFirst();
  }

  @GenerateSql({ params: [DummyValue.EMAIL] })
  getByEmail(email: string) {
    return this.db
      .selectFrom('users')
      .select(columns.userAdmin)
      .where('email', '=', email)
      .where('users.deletedAt', 'is', null)
      .executeTakeFirst();
  }

  @GenerateSql(
    { name: 'with deleted', params: [{ withDeleted: true }] },
    { name: 'without deleted', params: [{ withDeleted: false }] },
  )
  getList({ withDeleted }: UserListFilter = {}) {
    return this.db
      .selectFrom('users')
      .select(columns.userAdmin)
      .$if(!withDeleted, (eb) => eb.where('users.deletedAt', 'is', null))
      .orderBy('createdAt', 'desc')
      .execute();
  }

  async create(dto: Insertable<UserTable>) {
    return this.db.insertInto('users').values(dto).returning(columns.userAdmin).executeTakeFirstOrThrow();
  }

  update(id: string, dto: Updateable<UserTable>) {
    return this.db
      .updateTable('users')
      .set(dto)
      .where('users.id', '=', asUuid(id))
      .where('users.deletedAt', 'is', null)
      .returning(columns.userAdmin)
      .executeTakeFirstOrThrow();
  }
}
