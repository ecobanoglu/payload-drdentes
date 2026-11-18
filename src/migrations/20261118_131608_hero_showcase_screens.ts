import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_showcase_features_icon" AS ENUM('users', 'calendar', 'invoice', 'wallet', 'sms', 'support', 'reports', 'security', 'cloud', 'mobile', 'clinic', 'check');
  CREATE TYPE "public"."enum_pages_hero_showcase_screens" AS ENUM('animated', 'images');
  CREATE TYPE "public"."enum__pages_v_version_hero_showcase_features_icon" AS ENUM('users', 'calendar', 'invoice', 'wallet', 'sms', 'support', 'reports', 'security', 'cloud', 'mobile', 'clinic', 'check');
  CREATE TYPE "public"."enum__pages_v_version_hero_showcase_screens" AS ENUM('animated', 'images');
  ALTER TABLE "pages_hero_showcase_features" ADD COLUMN "icon" "enum_pages_hero_showcase_features_icon" DEFAULT 'check';
  ALTER TABLE "pages_locales" ADD COLUMN "hero_showcase_screens" "enum_pages_hero_showcase_screens" DEFAULT 'animated';
  ALTER TABLE "_pages_v_version_hero_showcase_features" ADD COLUMN "icon" "enum__pages_v_version_hero_showcase_features_icon" DEFAULT 'check';
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_showcase_screens" "enum__pages_v_version_hero_showcase_screens" DEFAULT 'animated';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_showcase_features" DROP COLUMN "icon";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_showcase_screens";
  ALTER TABLE "_pages_v_version_hero_showcase_features" DROP COLUMN "icon";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_showcase_screens";
  DROP TYPE "public"."enum_pages_hero_showcase_features_icon";
  DROP TYPE "public"."enum_pages_hero_showcase_screens";
  DROP TYPE "public"."enum__pages_v_version_hero_showcase_features_icon";
  DROP TYPE "public"."enum__pages_v_version_hero_showcase_screens";`)
}
