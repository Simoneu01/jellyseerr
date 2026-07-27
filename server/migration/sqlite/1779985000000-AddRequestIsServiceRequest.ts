import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequestIsServiceRequest1779985000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media_request" ADD COLUMN "isServiceRequest" boolean NOT NULL DEFAULT (0)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media_request" DROP COLUMN "isServiceRequest"`
    );
  }
}
