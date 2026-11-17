import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cards_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cards_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_header_cta_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "pages_blocks_cards_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cards_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cards_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "_pages_v_blocks_cards_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cards_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cards_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "header_locales" (
  	"cta_enabled" boolean,
  	"cta_link_type" "enum_header_cta_link_type" DEFAULT 'reference',
  	"cta_link_new_tab" boolean,
  	"cta_link_url" varchar,
  	"cta_link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_pricing" ADD COLUMN "footnote" varchar;
  ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN "footnote" varchar;
  ALTER TABLE "pricing_plans_locales" ADD COLUMN "price_note" varchar;
  ALTER TABLE "card_sets_cards_locales" ADD COLUMN "points" varchar;
  ALTER TABLE "contact_info" ADD COLUMN "support_phone" varchar;
  ALTER TABLE "contact_info" ADD COLUMN "whatsapp" varchar;
  ALTER TABLE "contact_info" ADD COLUMN "company_name" varchar;
  ALTER TABLE "contact_info" ADD COLUMN "tax_info" varchar;
  ALTER TABLE "contact_info_locales" ADD COLUMN "brand_note" varchar;
  ALTER TABLE "contact_info_locales" ADD COLUMN "bank_info" varchar;
  ALTER TABLE "pages_blocks_cards_links" ADD CONSTRAINT "pages_blocks_cards_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_links" ADD CONSTRAINT "_pages_v_blocks_cards_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_locales" ADD CONSTRAINT "header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_cards_links_order_idx" ON "pages_blocks_cards_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_links_parent_id_idx" ON "pages_blocks_cards_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_links_locale_idx" ON "pages_blocks_cards_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cards_links_order_idx" ON "_pages_v_blocks_cards_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_links_parent_id_idx" ON "_pages_v_blocks_cards_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_links_locale_idx" ON "_pages_v_blocks_cards_links" USING btree ("_locale");
  CREATE UNIQUE INDEX "header_locales_locale_parent_id_unique" ON "header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_locales_parent_id_idx" ON "header_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_cards_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_links" CASCADE;
  DROP TABLE "header_locales" CASCADE;
  ALTER TABLE "pages_blocks_pricing" DROP COLUMN "footnote";
  ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN "footnote";
  ALTER TABLE "pricing_plans_locales" DROP COLUMN "price_note";
  ALTER TABLE "card_sets_cards_locales" DROP COLUMN "points";
  ALTER TABLE "contact_info" DROP COLUMN "support_phone";
  ALTER TABLE "contact_info" DROP COLUMN "whatsapp";
  ALTER TABLE "contact_info" DROP COLUMN "company_name";
  ALTER TABLE "contact_info" DROP COLUMN "tax_info";
  ALTER TABLE "contact_info_locales" DROP COLUMN "brand_note";
  ALTER TABLE "contact_info_locales" DROP COLUMN "bank_info";
  DROP TYPE "public"."enum_pages_blocks_cards_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cards_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cards_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cards_links_link_appearance";
  DROP TYPE "public"."enum_header_cta_link_type";`)
}
