import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequestProfiles1780000000000 implements MigrationInterface {
  name = 'AddRequestProfiles1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media_profile_status" ("id" SERIAL NOT NULL, "requestProfileId" integer NOT NULL, "status" integer NOT NULL DEFAULT 1, "serviceId" integer, "externalServiceId" integer, "externalServiceSlug" character varying, "mediaId" integer, CONSTRAINT "PK_media_profile_status" PRIMARY KEY ("id"), CONSTRAINT "FK_media_profile_status_media" FOREIGN KEY ("mediaId") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
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
      `ALTER TABLE "media_request" DROP COLUMN "requestProfileId"`
    );
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
  }
}
