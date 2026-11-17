import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_card_sets_cards_icon" AS ENUM('sparkles', 'smile', 'shieldCheck', 'heartPulse', 'stethoscope', 'syringe', 'scan', 'clock', 'calendar', 'award', 'users', 'globe');
  CREATE TYPE "public"."enum_card_sets_cards_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_card_sets_variant" AS ENUM('features', 'services');
  CREATE TABLE "pages_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"card_set_id" integer,
  	"columns" "enum_pages_blocks_cards_columns" DEFAULT '3',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"card_set_id" integer,
  	"columns" "enum__pages_v_blocks_cards_columns" DEFAULT '3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "card_sets_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_card_sets_cards_icon",
  	"image_id" integer,
  	"enable_link" boolean
  );
  
  CREATE TABLE "card_sets_cards_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"link_type" "enum_card_sets_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "card_sets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"variant" "enum_card_sets_variant" DEFAULT 'features' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "card_sets_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "card_sets_id" integer;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_card_set_id_card_sets_id_fk" FOREIGN KEY ("card_set_id") REFERENCES "public"."card_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_card_set_id_card_sets_id_fk" FOREIGN KEY ("card_set_id") REFERENCES "public"."card_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "card_sets_cards" ADD CONSTRAINT "card_sets_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "card_sets_cards" ADD CONSTRAINT "card_sets_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."card_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "card_sets_cards_locales" ADD CONSTRAINT "card_sets_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."card_sets_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "card_sets_rels" ADD CONSTRAINT "card_sets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."card_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "card_sets_rels" ADD CONSTRAINT "card_sets_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "card_sets_rels" ADD CONSTRAINT "card_sets_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_cards_order_idx" ON "pages_blocks_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_parent_id_idx" ON "pages_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_path_idx" ON "pages_blocks_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_locale_idx" ON "pages_blocks_cards" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cards_card_set_idx" ON "pages_blocks_cards" USING btree ("card_set_id");
  CREATE INDEX "_pages_v_blocks_cards_order_idx" ON "_pages_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_parent_id_idx" ON "_pages_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_path_idx" ON "_pages_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_locale_idx" ON "_pages_v_blocks_cards" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cards_card_set_idx" ON "_pages_v_blocks_cards" USING btree ("card_set_id");
  CREATE INDEX "card_sets_cards_order_idx" ON "card_sets_cards" USING btree ("_order");
  CREATE INDEX "card_sets_cards_parent_id_idx" ON "card_sets_cards" USING btree ("_parent_id");
  CREATE INDEX "card_sets_cards_image_idx" ON "card_sets_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX "card_sets_cards_locales_locale_parent_id_unique" ON "card_sets_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "card_sets_cards_locales_parent_id_idx" ON "card_sets_cards_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "card_sets_name_idx" ON "card_sets" USING btree ("name");
  CREATE INDEX "card_sets_updated_at_idx" ON "card_sets" USING btree ("updated_at");
  CREATE INDEX "card_sets_created_at_idx" ON "card_sets" USING btree ("created_at");
  CREATE INDEX "card_sets_rels_order_idx" ON "card_sets_rels" USING btree ("order");
  CREATE INDEX "card_sets_rels_parent_idx" ON "card_sets_rels" USING btree ("parent_id");
  CREATE INDEX "card_sets_rels_path_idx" ON "card_sets_rels" USING btree ("path");
  CREATE INDEX "card_sets_rels_locale_idx" ON "card_sets_rels" USING btree ("locale");
  CREATE INDEX "card_sets_rels_pages_id_idx" ON "card_sets_rels" USING btree ("pages_id","locale");
  CREATE INDEX "card_sets_rels_posts_id_idx" ON "card_sets_rels" USING btree ("posts_id","locale");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_card_sets_fk" FOREIGN KEY ("card_sets_id") REFERENCES "public"."card_sets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_card_sets_id_idx" ON "payload_locked_documents_rels" USING btree ("card_sets_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "card_sets_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "card_sets_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "card_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "card_sets_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_cards" CASCADE;
  DROP TABLE "card_sets_cards" CASCADE;
  DROP TABLE "card_sets_cards_locales" CASCADE;
  DROP TABLE "card_sets" CASCADE;
  DROP TABLE "card_sets_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_card_sets_fk";
  
  DROP INDEX "payload_locked_documents_rels_card_sets_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "card_sets_id";
  DROP TYPE "public"."enum_pages_blocks_cards_columns";
  DROP TYPE "public"."enum__pages_v_blocks_cards_columns";
  DROP TYPE "public"."enum_card_sets_cards_icon";
  DROP TYPE "public"."enum_card_sets_cards_link_type";
  DROP TYPE "public"."enum_card_sets_variant";`)
}
