import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards" ADD COLUMN "mobile_carousel" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "mobile_carousel" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "mobile_carousel" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_cards" ADD COLUMN "mobile_carousel" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "mobile_carousel" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "mobile_carousel" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards" DROP COLUMN "mobile_carousel";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "mobile_carousel";
  ALTER TABLE "pages_blocks_archive" DROP COLUMN "mobile_carousel";
  ALTER TABLE "_pages_v_blocks_cards" DROP COLUMN "mobile_carousel";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "mobile_carousel";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN "mobile_carousel";`)
}
