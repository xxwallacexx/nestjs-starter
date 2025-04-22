import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateuserTableWithAdminAndName1744554694809 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
     alter table users
          add column if not exists "name" varchar default '';

      alter table users
          add column if not exists "isAdmin" bool default false;
      
      alter table users
          add column if not exists "isFirstLoggedIn" bool default true;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table users
          drop column "name";

        alter table users
          drop column "isAdmin";
        `);
  }
}
