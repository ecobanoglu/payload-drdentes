import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_feature_split_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_feature_split_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_feature_split_media_position" AS ENUM('end', 'start');
  CREATE TYPE "public"."enum_pages_blocks_pricing_default_period" AS ENUM('monthly', 'yearly');
  CREATE TYPE "public"."enum_pages_blocks_faq_source" AS ENUM('all', 'category', 'selected');
  CREATE TYPE "public"."enum_pages_blocks_faq_category" AS ENUM('general', 'product', 'pricing', 'security', 'support');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_split_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_split_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_split_media_position" AS ENUM('end', 'start');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_default_period" AS ENUM('monthly', 'yearly');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_source" AS ENUM('all', 'category', 'selected');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_category" AS ENUM('general', 'product', 'pricing', 'security', 'support');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('general', 'product', 'pricing', 'security', 'support');
  CREATE TYPE "public"."enum_pricing_plans_pricing_type" AS ENUM('fixed', 'custom');
  CREATE TYPE "public"."enum_pricing_plans_currency" AS ENUM('TRY', 'EUR', 'USD', 'GBP');
  CREATE TYPE "public"."enum_pricing_plans_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_contact_info_social_platform" AS ENUM('linkedin', 'instagram', 'x', 'facebook', 'youtube');
  CREATE TABLE "pages_blocks_feature_split_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_split_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_feature_split_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_feature_split_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_feature_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"media_position" "enum_pages_blocks_feature_split_media_position" DEFAULT 'end',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"default_period" "enum_pages_blocks_pricing_default_period" DEFAULT 'yearly',
  	"show_toggle" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"source" "enum_pages_blocks_faq_source" DEFAULT 'all',
  	"category" "enum_pages_blocks_faq_category",
  	"limit" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"form_id" integer,
  	"show_contact_info" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_split_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_split_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_feature_split_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_feature_split_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"media_position" "enum__pages_v_blocks_feature_split_media_position" DEFAULT 'end',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"default_period" "enum__pages_v_blocks_pricing_default_period" DEFAULT 'yearly',
  	"show_toggle" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"source" "enum__pages_v_blocks_faq_source" DEFAULT 'all',
  	"category" "enum__pages_v_blocks_faq_category",
  	"limit" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"form_id" integer,
  	"show_contact_info" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"category" "enum_faqs_category" DEFAULT 'general' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"included" boolean DEFAULT true
  );
  
  CREATE TABLE "pricing_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"pricing_type" "enum_pricing_plans_pricing_type" DEFAULT 'fixed',
  	"highlighted" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pricing_plans_locales" (
  	"name" varchar,
  	"description" varchar,
  	"currency" "enum_pricing_plans_currency" DEFAULT 'TRY',
  	"monthly_price" numeric,
  	"yearly_price" numeric,
  	"custom_price_label" varchar,
  	"link_type" "enum_pricing_plans_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL,
  	"badge" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pricing_plans_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "contact_info_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_contact_info_social_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "contact_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_info_locales" (
  	"address" varchar,
  	"working_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "pricing_plans_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "faqs_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "pricing_plans_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "faqs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faqs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pricing_plans_id" integer;
  ALTER TABLE "pages_blocks_feature_split_bullets" ADD CONSTRAINT "pages_blocks_feature_split_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_split_links" ADD CONSTRAINT "pages_blocks_feature_split_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_split" ADD CONSTRAINT "pages_blocks_feature_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_split" ADD CONSTRAINT "pages_blocks_feature_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing" ADD CONSTRAINT "pages_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_split_bullets" ADD CONSTRAINT "_pages_v_blocks_feature_split_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_split_links" ADD CONSTRAINT "_pages_v_blocks_feature_split_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_split" ADD CONSTRAINT "_pages_v_blocks_feature_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_split" ADD CONSTRAINT "_pages_v_blocks_feature_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing" ADD CONSTRAINT "_pages_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_plans_features" ADD CONSTRAINT "pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_plans_locales" ADD CONSTRAINT "pricing_plans_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_plans_rels" ADD CONSTRAINT "pricing_plans_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_plans_rels" ADD CONSTRAINT "pricing_plans_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_plans_rels" ADD CONSTRAINT "pricing_plans_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_info_social" ADD CONSTRAINT "contact_info_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_info_locales" ADD CONSTRAINT "contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_feature_split_bullets_order_idx" ON "pages_blocks_feature_split_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_split_bullets_parent_id_idx" ON "pages_blocks_feature_split_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_split_bullets_locale_idx" ON "pages_blocks_feature_split_bullets" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_split_links_order_idx" ON "pages_blocks_feature_split_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_split_links_parent_id_idx" ON "pages_blocks_feature_split_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_split_links_locale_idx" ON "pages_blocks_feature_split_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_split_order_idx" ON "pages_blocks_feature_split" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_split_parent_id_idx" ON "pages_blocks_feature_split" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_split_path_idx" ON "pages_blocks_feature_split" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_split_locale_idx" ON "pages_blocks_feature_split" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_split_media_idx" ON "pages_blocks_feature_split" USING btree ("media_id");
  CREATE INDEX "pages_blocks_pricing_order_idx" ON "pages_blocks_pricing" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_parent_id_idx" ON "pages_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_path_idx" ON "pages_blocks_pricing" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_locale_idx" ON "pages_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_locale_idx" ON "pages_blocks_faq" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_order_idx" ON "pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_path_idx" ON "pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_locale_idx" ON "pages_blocks_contact" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_form_idx" ON "pages_blocks_contact" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_feature_split_bullets_order_idx" ON "_pages_v_blocks_feature_split_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_split_bullets_parent_id_idx" ON "_pages_v_blocks_feature_split_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_split_bullets_locale_idx" ON "_pages_v_blocks_feature_split_bullets" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_split_links_order_idx" ON "_pages_v_blocks_feature_split_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_split_links_parent_id_idx" ON "_pages_v_blocks_feature_split_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_split_links_locale_idx" ON "_pages_v_blocks_feature_split_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_split_order_idx" ON "_pages_v_blocks_feature_split" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_split_parent_id_idx" ON "_pages_v_blocks_feature_split" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_split_path_idx" ON "_pages_v_blocks_feature_split" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_split_locale_idx" ON "_pages_v_blocks_feature_split" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_split_media_idx" ON "_pages_v_blocks_feature_split" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_pricing_order_idx" ON "_pages_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_parent_id_idx" ON "_pages_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_path_idx" ON "_pages_v_blocks_pricing" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_locale_idx" ON "_pages_v_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_locale_idx" ON "_pages_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_locale_idx" ON "_pages_v_blocks_contact" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_form_idx" ON "_pages_v_blocks_contact" USING btree ("form_id");
  CREATE INDEX "faqs__order_idx" ON "faqs" USING btree ("_order");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_locales_parent_id_idx" ON "faqs_locales" USING btree ("_parent_id");
  CREATE INDEX "pricing_plans_features_order_idx" ON "pricing_plans_features" USING btree ("_order");
  CREATE INDEX "pricing_plans_features_parent_id_idx" ON "pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "pricing_plans_features_locale_idx" ON "pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "pricing_plans__order_idx" ON "pricing_plans" USING btree ("_order");
  CREATE INDEX "pricing_plans_updated_at_idx" ON "pricing_plans" USING btree ("updated_at");
  CREATE INDEX "pricing_plans_created_at_idx" ON "pricing_plans" USING btree ("created_at");
  CREATE UNIQUE INDEX "pricing_plans_locales_locale_parent_id_unique" ON "pricing_plans_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_plans_locales_parent_id_idx" ON "pricing_plans_locales" USING btree ("_parent_id");
  CREATE INDEX "pricing_plans_rels_order_idx" ON "pricing_plans_rels" USING btree ("order");
  CREATE INDEX "pricing_plans_rels_parent_idx" ON "pricing_plans_rels" USING btree ("parent_id");
  CREATE INDEX "pricing_plans_rels_path_idx" ON "pricing_plans_rels" USING btree ("path");
  CREATE INDEX "pricing_plans_rels_locale_idx" ON "pricing_plans_rels" USING btree ("locale");
  CREATE INDEX "pricing_plans_rels_pages_id_idx" ON "pricing_plans_rels" USING btree ("pages_id","locale");
  CREATE INDEX "pricing_plans_rels_posts_id_idx" ON "pricing_plans_rels" USING btree ("posts_id","locale");
  CREATE INDEX "contact_info_social_order_idx" ON "contact_info_social" USING btree ("_order");
  CREATE INDEX "contact_info_social_parent_id_idx" ON "contact_info_social" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_info_locales_locale_parent_id_unique" ON "contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_info_locales_parent_id_idx" ON "contact_info_locales" USING btree ("_parent_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pricing_plans_fk" FOREIGN KEY ("pricing_plans_id") REFERENCES "public"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pricing_plans_fk" FOREIGN KEY ("pricing_plans_id") REFERENCES "public"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pricing_plans_fk" FOREIGN KEY ("pricing_plans_id") REFERENCES "public"."pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_pricing_plans_id_idx" ON "pages_rels" USING btree ("pricing_plans_id","locale");
  CREATE INDEX "pages_rels_faqs_id_idx" ON "pages_rels" USING btree ("faqs_id","locale");
  CREATE INDEX "_pages_v_rels_pricing_plans_id_idx" ON "_pages_v_rels" USING btree ("pricing_plans_id","locale");
  CREATE INDEX "_pages_v_rels_faqs_id_idx" ON "_pages_v_rels" USING btree ("faqs_id","locale");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_pricing_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("pricing_plans_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_split_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_split_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_split_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_split_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_plans_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_plans_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_plans_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_info_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_info_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_feature_split_bullets" CASCADE;
  DROP TABLE "pages_blocks_feature_split_links" CASCADE;
  DROP TABLE "pages_blocks_feature_split" CASCADE;
  DROP TABLE "pages_blocks_pricing" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_split_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_split_links" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_split" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_contact" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "pricing_plans_features" CASCADE;
  DROP TABLE "pricing_plans" CASCADE;
  DROP TABLE "pricing_plans_locales" CASCADE;
  DROP TABLE "pricing_plans_rels" CASCADE;
  DROP TABLE "contact_info_social" CASCADE;
  DROP TABLE "contact_info" CASCADE;
  DROP TABLE "contact_info_locales" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_pricing_plans_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_faqs_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_pricing_plans_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_faqs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faqs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pricing_plans_fk";
  
  DROP INDEX "pages_rels_pricing_plans_id_idx";
  DROP INDEX "pages_rels_faqs_id_idx";
  DROP INDEX "_pages_v_rels_pricing_plans_id_idx";
  DROP INDEX "_pages_v_rels_faqs_id_idx";
  DROP INDEX "payload_locked_documents_rels_faqs_id_idx";
  DROP INDEX "payload_locked_documents_rels_pricing_plans_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "pricing_plans_id";
  ALTER TABLE "pages_rels" DROP COLUMN "faqs_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "pricing_plans_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "faqs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faqs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pricing_plans_id";
  DROP TYPE "public"."enum_pages_blocks_feature_split_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_feature_split_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_feature_split_media_position";
  DROP TYPE "public"."enum_pages_blocks_pricing_default_period";
  DROP TYPE "public"."enum_pages_blocks_faq_source";
  DROP TYPE "public"."enum_pages_blocks_faq_category";
  DROP TYPE "public"."enum__pages_v_blocks_feature_split_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_feature_split_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_feature_split_media_position";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_default_period";
  DROP TYPE "public"."enum__pages_v_blocks_faq_source";
  DROP TYPE "public"."enum__pages_v_blocks_faq_category";
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum_pricing_plans_pricing_type";
  DROP TYPE "public"."enum_pricing_plans_currency";
  DROP TYPE "public"."enum_pricing_plans_link_type";
  DROP TYPE "public"."enum_contact_info_social_platform";`)
}
