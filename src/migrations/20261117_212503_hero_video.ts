import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" ADD COLUMN "hero_video_url" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "hero_video_label" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_video_url" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_video_label" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" DROP COLUMN "hero_video_url";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_video_label";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_video_url";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_video_label";`)
}
