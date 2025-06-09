import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsAndOtherTables1749477408598 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "sessions" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "token" character varying NOT NULL,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updateId" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "deviceType" character varying NOT NULL DEFAULT '',
      "deviceOS" character varying NOT NULL DEFAULT '',
      "userId" uuid NOT NULL,
      "pinExpiresAt" timestamp with time zone,
      "expiresAt" timestamp with time zone,
      CONSTRAINT "PK_48cb6b5c20faa63157b3c1baf7f" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE INDEX "IDX_sessions_update_id" ON "sessions" ("updateId")`);
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE`,
    );

    await queryRunner.query(`CREATE TABLE "api_keys" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "name" character varying NOT NULL,
      "key" character varying NOT NULL,
      "permissions" character varying[] NOT NULL,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updateId" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "userId" uuid NOT NULL,
      CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE INDEX "IDX_api_keys_update_id" ON "api_keys" ("updateId")`);
    await queryRunner.query(
      `ALTER TABLE "api_keys" ADD CONSTRAINT "FK_6c2e267ae764a9413b863a29342" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON UPDATE CASCADE ON DELETE CASCADE`,
    );

    await queryRunner.query(`CREATE TABLE "system_metadata" (
      "key" character varying NOT NULL,
      "value" jsonb NOT NULL,
      CONSTRAINT "PK_fa94f6857470fb5b81ec6084465" PRIMARY KEY ("key")
    )`);

    await queryRunner.query(`CREATE TABLE "version_history" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "version" character varying NOT NULL,
      CONSTRAINT "PK_5db259cbb09ce82c0d13cfd1b23" PRIMARY KEY ("id")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "version_history"`);
    await queryRunner.query(`DROP TABLE "system_metadata"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
