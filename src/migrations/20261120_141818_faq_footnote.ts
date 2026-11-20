import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_faq_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_links_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "pages_blocks_faq_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_faq_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_faq_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "footnote" varchar;
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "footnote" varchar;
  ALTER TABLE "pages_blocks_faq_links" ADD CONSTRAINT "pages_blocks_faq_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_links" ADD CONSTRAINT "_pages_v_blocks_faq_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_faq_links_order_idx" ON "pages_blocks_faq_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_links_parent_id_idx" ON "pages_blocks_faq_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_links_locale_idx" ON "pages_blocks_faq_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_links_order_idx" ON "_pages_v_blocks_faq_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_links_parent_id_idx" ON "_pages_v_blocks_faq_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_links_locale_idx" ON "_pages_v_blocks_faq_links" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_faq_links" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_links" CASCADE;
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "footnote";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "footnote";
  DROP TYPE "public"."enum_pages_blocks_faq_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_faq_links_link_type";`)
}
