import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserShouldChangePassword1744564198621 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "shouldChangePassword" bool default true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "shouldChangePassword"`);
  }
}
