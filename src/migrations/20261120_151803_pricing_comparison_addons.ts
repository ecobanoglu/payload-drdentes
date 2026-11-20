import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_pricing_comparison_rows_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_comparison_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"hint" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_comparison" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_addons_items_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"price" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_addons_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_addons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_comparison_rows_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_comparison_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"hint" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_comparison" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_addons_items_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_addons_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_addons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_pricing" ADD COLUMN "comparison_heading" varchar;
  ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN "comparison_heading" varchar;
  ALTER TABLE "pages_blocks_pricing_comparison_rows_values" ADD CONSTRAINT "pages_blocks_pricing_comparison_rows_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_comparison_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_comparison_rows" ADD CONSTRAINT "pages_blocks_pricing_comparison_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_comparison"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_comparison" ADD CONSTRAINT "pages_blocks_pricing_comparison_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_addons_items_tiers" ADD CONSTRAINT "pages_blocks_pricing_addons_items_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_addons_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_addons_items" ADD CONSTRAINT "pages_blocks_pricing_addons_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_addons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_addons" ADD CONSTRAINT "pages_blocks_pricing_addons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_comparison_rows_values" ADD CONSTRAINT "_pages_v_blocks_pricing_comparison_rows_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_comparison_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_comparison_rows" ADD CONSTRAINT "_pages_v_blocks_pricing_comparison_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_comparison"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_comparison" ADD CONSTRAINT "_pages_v_blocks_pricing_comparison_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_addons_items_tiers" ADD CONSTRAINT "_pages_v_blocks_pricing_addons_items_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_addons_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_addons_items" ADD CONSTRAINT "_pages_v_blocks_pricing_addons_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_addons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_addons" ADD CONSTRAINT "_pages_v_blocks_pricing_addons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_pricing_comparison_rows_values_order_idx" ON "pages_blocks_pricing_comparison_rows_values" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_comparison_rows_values_parent_id_idx" ON "pages_blocks_pricing_comparison_rows_values" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_comparison_rows_values_locale_idx" ON "pages_blocks_pricing_comparison_rows_values" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_comparison_rows_order_idx" ON "pages_blocks_pricing_comparison_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_comparison_rows_parent_id_idx" ON "pages_blocks_pricing_comparison_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_comparison_rows_locale_idx" ON "pages_blocks_pricing_comparison_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_comparison_order_idx" ON "pages_blocks_pricing_comparison" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_comparison_parent_id_idx" ON "pages_blocks_pricing_comparison" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_comparison_locale_idx" ON "pages_blocks_pricing_comparison" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_addons_items_tiers_order_idx" ON "pages_blocks_pricing_addons_items_tiers" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_addons_items_tiers_parent_id_idx" ON "pages_blocks_pricing_addons_items_tiers" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_addons_items_tiers_locale_idx" ON "pages_blocks_pricing_addons_items_tiers" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_addons_items_order_idx" ON "pages_blocks_pricing_addons_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_addons_items_parent_id_idx" ON "pages_blocks_pricing_addons_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_addons_items_locale_idx" ON "pages_blocks_pricing_addons_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_addons_order_idx" ON "pages_blocks_pricing_addons" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_addons_parent_id_idx" ON "pages_blocks_pricing_addons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_addons_path_idx" ON "pages_blocks_pricing_addons" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_addons_locale_idx" ON "pages_blocks_pricing_addons" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_rows_values_order_idx" ON "_pages_v_blocks_pricing_comparison_rows_values" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_rows_values_parent_id_idx" ON "_pages_v_blocks_pricing_comparison_rows_values" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_rows_values_locale_idx" ON "_pages_v_blocks_pricing_comparison_rows_values" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_rows_order_idx" ON "_pages_v_blocks_pricing_comparison_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_rows_parent_id_idx" ON "_pages_v_blocks_pricing_comparison_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_rows_locale_idx" ON "_pages_v_blocks_pricing_comparison_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_order_idx" ON "_pages_v_blocks_pricing_comparison" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_parent_id_idx" ON "_pages_v_blocks_pricing_comparison" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_comparison_locale_idx" ON "_pages_v_blocks_pricing_comparison" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_addons_items_tiers_order_idx" ON "_pages_v_blocks_pricing_addons_items_tiers" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_addons_items_tiers_parent_id_idx" ON "_pages_v_blocks_pricing_addons_items_tiers" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_addons_items_tiers_locale_idx" ON "_pages_v_blocks_pricing_addons_items_tiers" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_addons_items_order_idx" ON "_pages_v_blocks_pricing_addons_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_addons_items_parent_id_idx" ON "_pages_v_blocks_pricing_addons_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_addons_items_locale_idx" ON "_pages_v_blocks_pricing_addons_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_addons_order_idx" ON "_pages_v_blocks_pricing_addons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_addons_parent_id_idx" ON "_pages_v_blocks_pricing_addons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_addons_path_idx" ON "_pages_v_blocks_pricing_addons" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_addons_locale_idx" ON "_pages_v_blocks_pricing_addons" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_pricing_comparison_rows_values" CASCADE;
  DROP TABLE "pages_blocks_pricing_comparison_rows" CASCADE;
  DROP TABLE "pages_blocks_pricing_comparison" CASCADE;
  DROP TABLE "pages_blocks_pricing_addons_items_tiers" CASCADE;
  DROP TABLE "pages_blocks_pricing_addons_items" CASCADE;
  DROP TABLE "pages_blocks_pricing_addons" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_comparison_rows_values" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_comparison_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_comparison" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_addons_items_tiers" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_addons_items" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_addons" CASCADE;
  ALTER TABLE "pages_blocks_pricing" DROP COLUMN "comparison_heading";
  ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN "comparison_heading";`)
}
