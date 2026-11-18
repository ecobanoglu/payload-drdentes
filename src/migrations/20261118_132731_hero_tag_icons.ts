import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_hero_showcase_features_icon" ADD VALUE 'appointment';
  ALTER TYPE "public"."enum_pages_hero_showcase_features_icon" ADD VALUE 'receipt';
  ALTER TYPE "public"."enum_pages_hero_showcase_features_icon" ADD VALUE 'send';
  ALTER TYPE "public"."enum_pages_hero_showcase_features_icon" ADD VALUE 'network';
  ALTER TYPE "public"."enum_pages_hero_showcase_features_icon" ADD VALUE 'reportChart';
  ALTER TYPE "public"."enum__pages_v_version_hero_showcase_features_icon" ADD VALUE 'appointment';
  ALTER TYPE "public"."enum__pages_v_version_hero_showcase_features_icon" ADD VALUE 'receipt';
  ALTER TYPE "public"."enum__pages_v_version_hero_showcase_features_icon" ADD VALUE 'send';
  ALTER TYPE "public"."enum__pages_v_version_hero_showcase_features_icon" ADD VALUE 'network';
  ALTER TYPE "public"."enum__pages_v_version_hero_showcase_features_icon" ADD VALUE 'reportChart';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_showcase_features" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "pages_hero_showcase_features" ALTER COLUMN "icon" SET DEFAULT 'check'::text;
  DROP TYPE "public"."enum_pages_hero_showcase_features_icon";
  CREATE TYPE "public"."enum_pages_hero_showcase_features_icon" AS ENUM('users', 'calendar', 'invoice', 'wallet', 'sms', 'support', 'reports', 'security', 'cloud', 'mobile', 'clinic', 'check');
  ALTER TABLE "pages_hero_showcase_features" ALTER COLUMN "icon" SET DEFAULT 'check'::"public"."enum_pages_hero_showcase_features_icon";
  ALTER TABLE "pages_hero_showcase_features" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_pages_hero_showcase_features_icon" USING "icon"::"public"."enum_pages_hero_showcase_features_icon";
  ALTER TABLE "_pages_v_version_hero_showcase_features" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "_pages_v_version_hero_showcase_features" ALTER COLUMN "icon" SET DEFAULT 'check'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_showcase_features_icon";
  CREATE TYPE "public"."enum__pages_v_version_hero_showcase_features_icon" AS ENUM('users', 'calendar', 'invoice', 'wallet', 'sms', 'support', 'reports', 'security', 'cloud', 'mobile', 'clinic', 'check');
  ALTER TABLE "_pages_v_version_hero_showcase_features" ALTER COLUMN "icon" SET DEFAULT 'check'::"public"."enum__pages_v_version_hero_showcase_features_icon";
  ALTER TABLE "_pages_v_version_hero_showcase_features" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__pages_v_version_hero_showcase_features_icon" USING "icon"::"public"."enum__pages_v_version_hero_showcase_features_icon";`)
}
