import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_hero_type" ADD VALUE 'showcase';
  ALTER TYPE "public"."enum__pages_v_version_hero_type" ADD VALUE 'showcase';
  CREATE TABLE "pages_hero_showcase_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_version_hero_showcase_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_locales" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "hero_showcase_background" varchar DEFAULT '#1d1e1f';
  ALTER TABLE "pages_locales" ADD COLUMN "hero_showcase_laptop_id" integer;
  ALTER TABLE "pages_locales" ADD COLUMN "hero_showcase_tablet_id" integer;
  ALTER TABLE "pages_locales" ADD COLUMN "hero_showcase_phone_id" integer;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_eyebrow" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_showcase_background" varchar DEFAULT '#1d1e1f';
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_showcase_laptop_id" integer;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_showcase_tablet_id" integer;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_showcase_phone_id" integer;
  ALTER TABLE "pages_hero_showcase_features" ADD CONSTRAINT "pages_hero_showcase_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_showcase_features" ADD CONSTRAINT "_pages_v_version_hero_showcase_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_showcase_features_order_idx" ON "pages_hero_showcase_features" USING btree ("_order");
  CREATE INDEX "pages_hero_showcase_features_parent_id_idx" ON "pages_hero_showcase_features" USING btree ("_parent_id");
  CREATE INDEX "pages_hero_showcase_features_locale_idx" ON "pages_hero_showcase_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_hero_showcase_features_order_idx" ON "_pages_v_version_hero_showcase_features" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_showcase_features_parent_id_idx" ON "_pages_v_version_hero_showcase_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_showcase_features_locale_idx" ON "_pages_v_version_hero_showcase_features" USING btree ("_locale");
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_showcase_laptop_id_media_id_fk" FOREIGN KEY ("hero_showcase_laptop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_showcase_tablet_id_media_id_fk" FOREIGN KEY ("hero_showcase_tablet_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_showcase_phone_id_media_id_fk" FOREIGN KEY ("hero_showcase_phone_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_showcase_laptop_id_media_id_fk" FOREIGN KEY ("version_hero_showcase_laptop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_showcase_tablet_id_media_id_fk" FOREIGN KEY ("version_hero_showcase_tablet_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_showcase_phone_id_media_id_fk" FOREIGN KEY ("version_hero_showcase_phone_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_hero_showcase_hero_showcase_laptop_idx" ON "pages_locales" USING btree ("hero_showcase_laptop_id");
  CREATE INDEX "pages_hero_showcase_hero_showcase_tablet_idx" ON "pages_locales" USING btree ("hero_showcase_tablet_id");
  CREATE INDEX "pages_hero_showcase_hero_showcase_phone_idx" ON "pages_locales" USING btree ("hero_showcase_phone_id");
  CREATE INDEX "_pages_v_version_hero_showcase_version_hero_showcase_lap_idx" ON "_pages_v_locales" USING btree ("version_hero_showcase_laptop_id");
  CREATE INDEX "_pages_v_version_hero_showcase_version_hero_showcase_tab_idx" ON "_pages_v_locales" USING btree ("version_hero_showcase_tablet_id");
  CREATE INDEX "_pages_v_version_hero_showcase_version_hero_showcase_pho_idx" ON "_pages_v_locales" USING btree ("version_hero_showcase_phone_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_showcase_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_hero_showcase_features" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_hero_showcase_features" CASCADE;
  DROP TABLE "_pages_v_version_hero_showcase_features" CASCADE;
  ALTER TABLE "pages_locales" DROP CONSTRAINT "pages_locales_hero_showcase_laptop_id_media_id_fk";
  
  ALTER TABLE "pages_locales" DROP CONSTRAINT "pages_locales_hero_showcase_tablet_id_media_id_fk";
  
  ALTER TABLE "pages_locales" DROP CONSTRAINT "pages_locales_hero_showcase_phone_id_media_id_fk";
  
  ALTER TABLE "_pages_v_locales" DROP CONSTRAINT "_pages_v_locales_version_hero_showcase_laptop_id_media_id_fk";
  
  ALTER TABLE "_pages_v_locales" DROP CONSTRAINT "_pages_v_locales_version_hero_showcase_tablet_id_media_id_fk";
  
  ALTER TABLE "_pages_v_locales" DROP CONSTRAINT "_pages_v_locales_version_hero_showcase_phone_id_media_id_fk";
  
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DATA TYPE text;
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum_pages_hero_type";
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact', 'scene3d');
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DEFAULT 'lowImpact'::"public"."enum_pages_hero_type";
  ALTER TABLE "pages_locales" ALTER COLUMN "hero_type" SET DATA TYPE "public"."enum_pages_hero_type" USING "hero_type"::"public"."enum_pages_hero_type";
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DATA TYPE text;
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::text;
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact', 'scene3d');
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DEFAULT 'lowImpact'::"public"."enum__pages_v_version_hero_type";
  ALTER TABLE "_pages_v_locales" ALTER COLUMN "version_hero_type" SET DATA TYPE "public"."enum__pages_v_version_hero_type" USING "version_hero_type"::"public"."enum__pages_v_version_hero_type";
  DROP INDEX "pages_hero_showcase_hero_showcase_laptop_idx";
  DROP INDEX "pages_hero_showcase_hero_showcase_tablet_idx";
  DROP INDEX "pages_hero_showcase_hero_showcase_phone_idx";
  DROP INDEX "_pages_v_version_hero_showcase_version_hero_showcase_lap_idx";
  DROP INDEX "_pages_v_version_hero_showcase_version_hero_showcase_tab_idx";
  DROP INDEX "_pages_v_version_hero_showcase_version_hero_showcase_pho_idx";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_showcase_background";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_showcase_laptop_id";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_showcase_tablet_id";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_showcase_phone_id";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_eyebrow";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_showcase_background";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_showcase_laptop_id";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_showcase_tablet_id";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_showcase_phone_id";`)
}
