import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cta_tone" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_tone" AS ENUM('light', 'dark');
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "tone" "enum_pages_blocks_cta_tone" DEFAULT 'light';
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "tone" "enum__pages_v_blocks_cta_tone" DEFAULT 'light';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta" DROP COLUMN "tone";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "tone";
  DROP TYPE "public"."enum_pages_blocks_cta_tone";
  DROP TYPE "public"."enum__pages_v_blocks_cta_tone";`)
}
