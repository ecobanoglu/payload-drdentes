import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_scene_palette" AS ENUM('aqua', 'pearl', 'gold');
  CREATE TYPE "public"."enum__pages_v_version_hero_scene_palette" AS ENUM('aqua', 'pearl', 'gold');
  ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'scene3d';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'scene3d';
  ALTER TABLE "pages_locales" ADD COLUMN "hero_scene_palette" "enum_pages_hero_scene_palette" DEFAULT 'aqua';
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_scene_palette" "enum__pages_v_version_hero_scene_palette" DEFAULT 'aqua';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_scene_palette";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_scene_palette";
  DROP TYPE "public"."enum_pages_hero_scene_palette";
  DROP TYPE "public"."enum__pages_v_version_hero_scene_palette";`)
}
