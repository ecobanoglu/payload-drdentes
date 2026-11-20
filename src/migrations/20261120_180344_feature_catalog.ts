import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_feature_catalog_groups_icon" AS ENUM('patient', 'calendar', 'wallet', 'chart', 'document', 'settings', 'sparkles');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_catalog_groups_icon" AS ENUM('patient', 'calendar', 'wallet', 'chart', 'document', 'settings', 'sparkles');
  CREATE TABLE "pages_blocks_feature_catalog_groups_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"items" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_catalog_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_feature_catalog_groups_icon"
  );
  
  CREATE TABLE "pages_blocks_feature_catalog" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_catalog_groups_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"items" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_catalog_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_feature_catalog_groups_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_catalog" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_feature_catalog_groups_sections" ADD CONSTRAINT "pages_blocks_feature_catalog_groups_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_catalog_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_catalog_groups" ADD CONSTRAINT "pages_blocks_feature_catalog_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_catalog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_catalog" ADD CONSTRAINT "pages_blocks_feature_catalog_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_catalog_groups_sections" ADD CONSTRAINT "_pages_v_blocks_feature_catalog_groups_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_catalog_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_catalog_groups" ADD CONSTRAINT "_pages_v_blocks_feature_catalog_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_catalog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_catalog" ADD CONSTRAINT "_pages_v_blocks_feature_catalog_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_feature_catalog_groups_sections_order_idx" ON "pages_blocks_feature_catalog_groups_sections" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_catalog_groups_sections_parent_id_idx" ON "pages_blocks_feature_catalog_groups_sections" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_catalog_groups_sections_locale_idx" ON "pages_blocks_feature_catalog_groups_sections" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_catalog_groups_order_idx" ON "pages_blocks_feature_catalog_groups" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_catalog_groups_parent_id_idx" ON "pages_blocks_feature_catalog_groups" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_catalog_groups_locale_idx" ON "pages_blocks_feature_catalog_groups" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_catalog_order_idx" ON "pages_blocks_feature_catalog" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_catalog_parent_id_idx" ON "pages_blocks_feature_catalog" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_catalog_path_idx" ON "pages_blocks_feature_catalog" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_catalog_locale_idx" ON "pages_blocks_feature_catalog" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_catalog_groups_sections_order_idx" ON "_pages_v_blocks_feature_catalog_groups_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_catalog_groups_sections_parent_id_idx" ON "_pages_v_blocks_feature_catalog_groups_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_catalog_groups_sections_locale_idx" ON "_pages_v_blocks_feature_catalog_groups_sections" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_catalog_groups_order_idx" ON "_pages_v_blocks_feature_catalog_groups" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_catalog_groups_parent_id_idx" ON "_pages_v_blocks_feature_catalog_groups" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_catalog_groups_locale_idx" ON "_pages_v_blocks_feature_catalog_groups" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_catalog_order_idx" ON "_pages_v_blocks_feature_catalog" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_catalog_parent_id_idx" ON "_pages_v_blocks_feature_catalog" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_catalog_path_idx" ON "_pages_v_blocks_feature_catalog" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_catalog_locale_idx" ON "_pages_v_blocks_feature_catalog" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_feature_catalog_groups_sections" CASCADE;
  DROP TABLE "pages_blocks_feature_catalog_groups" CASCADE;
  DROP TABLE "pages_blocks_feature_catalog" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_catalog_groups_sections" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_catalog_groups" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_catalog" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_feature_catalog_groups_icon";
  DROP TYPE "public"."enum__pages_v_blocks_feature_catalog_groups_icon";`)
}
