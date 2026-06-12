import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMediaServiceStatus1779984800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "media_service_status" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "mediaId" integer NOT NULL,
        "serviceId" integer NOT NULL,
        "serviceType" varchar NOT NULL,
        "status" integer NOT NULL DEFAULT (0),
        "externalServiceId" integer NULL,
        "externalServiceSlug" varchar NULL,
        "seasonStatuses" text NULL,
        CONSTRAINT "UQ_media_service" UNIQUE ("mediaId", "serviceId"),
        FOREIGN KEY ("mediaId") REFERENCES "media" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_media_service_status_mediaId" ON "media_service_status" ("mediaId")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_media_service_status_serviceId" ON "media_service_status" ("serviceId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "media_service_status"`);
  }
}
