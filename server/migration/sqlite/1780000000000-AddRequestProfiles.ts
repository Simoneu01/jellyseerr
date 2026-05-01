import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequestProfiles1780000000000 implements MigrationInterface {
  name = 'AddRequestProfiles1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media_profile_status" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "requestProfileId" integer NOT NULL, "status" integer NOT NULL DEFAULT (1), "serviceId" integer, "externalServiceId" integer, "externalServiceSlug" varchar, "mediaId" integer, CONSTRAINT "FK_media_profile_status_media" FOREIGN KEY ("mediaId") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_media_profile_status_media" ON "media_profile_status" ("mediaId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_media_profile_status_profile" ON "media_profile_status" ("requestProfileId")`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_media_profile_status_unique" ON "media_profile_status" ("requestProfileId", "mediaId")`
    );
    await queryRunner.query(
      `ALTER TABLE "media_request" ADD COLUMN "requestProfileId" integer`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_media_profile_status_unique"`
    );
    await queryRunner.query(
      `DROP INDEX "IDX_media_profile_status_profile"`
    );
    await queryRunner.query(
      `DROP INDEX "IDX_media_profile_status_media"`
    );
    await queryRunner.query(`DROP TABLE "media_profile_status"`);

    await queryRunner.query(
      `CREATE TABLE "temporary_media_request" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "status" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "type" varchar NOT NULL, "is4k" boolean NOT NULL DEFAULT (0), "serverId" integer, "profileId" integer, "rootFolder" varchar, "languageProfileId" integer, "tags" text, "isAutoRequest" boolean NOT NULL DEFAULT (0), "mediaId" integer, "requestedById" integer, "modifiedById" integer)`
    );
    await queryRunner.query(
      `INSERT INTO "temporary_media_request" SELECT "id","status","createdAt","updatedAt","type","is4k","serverId","profileId","rootFolder","languageProfileId","tags","isAutoRequest","mediaId","requestedById","modifiedById" FROM "media_request"`
    );
    await queryRunner.query(`DROP TABLE "media_request"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_media_request" RENAME TO "media_request"`
    );
  }
}
