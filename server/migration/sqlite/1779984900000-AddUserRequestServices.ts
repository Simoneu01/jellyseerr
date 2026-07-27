import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRequestServices1779984900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "requestServices" text NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "requestServices"`);
  }
}
