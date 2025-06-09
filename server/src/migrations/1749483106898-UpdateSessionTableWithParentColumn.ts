import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSessionTableWithParentColumn1749483106898 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
  ALTER TABLE "sessions" ADD "parentId" uuid;
  ALTER TABLE "sessions" ADD CONSTRAINT "FK_afbbabbd7daf5b91de4dca84de8" FOREIGN KEY ("parentId") REFERENCES "sessions" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
  CREATE INDEX "IDX_afbbabbd7daf5b91de4dca84de" ON "sessions" ("parentId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
  DROP INDEX "IDX_afbbabbd7daf5b91de4dca84de";
  ALTER TABLE "sessions" DROP CONSTRAINT "FK_afbbabbd7daf5b91de4dca84de8";
  ALTER TABLE "sessions" DROP COLUMN "parentId";`);
  }
}
