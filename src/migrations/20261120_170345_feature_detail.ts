import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_feature_detail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"body" jsonb,
  	"sidebar_heading" varchar,
  	"sidebar_card_set_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_detail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"body" jsonb,
  	"sidebar_heading" varchar,
  	"sidebar_card_set_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_feature_detail" ADD CONSTRAINT "pages_blocks_feature_detail_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_detail" ADD CONSTRAINT "pages_blocks_feature_detail_sidebar_card_set_id_card_sets_id_fk" FOREIGN KEY ("sidebar_card_set_id") REFERENCES "public"."card_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_detail" ADD CONSTRAINT "pages_blocks_feature_detail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_detail" ADD CONSTRAINT "_pages_v_blocks_feature_detail_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_detail" ADD CONSTRAINT "_pages_v_blocks_feature_detail_sidebar_card_set_id_card_sets_id_fk" FOREIGN KEY ("sidebar_card_set_id") REFERENCES "public"."card_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_detail" ADD CONSTRAINT "_pages_v_blocks_feature_detail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_feature_detail_order_idx" ON "pages_blocks_feature_detail" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_detail_parent_id_idx" ON "pages_blocks_feature_detail" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_detail_path_idx" ON "pages_blocks_feature_detail" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_detail_locale_idx" ON "pages_blocks_feature_detail" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_detail_media_idx" ON "pages_blocks_feature_detail" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_detail_sidebar_card_set_idx" ON "pages_blocks_feature_detail" USING btree ("sidebar_card_set_id");
  CREATE INDEX "_pages_v_blocks_feature_detail_order_idx" ON "_pages_v_blocks_feature_detail" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_detail_parent_id_idx" ON "_pages_v_blocks_feature_detail" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_detail_path_idx" ON "_pages_v_blocks_feature_detail" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_detail_locale_idx" ON "_pages_v_blocks_feature_detail" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_detail_media_idx" ON "_pages_v_blocks_feature_detail" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_detail_sidebar_card_set_idx" ON "_pages_v_blocks_feature_detail" USING btree ("sidebar_card_set_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_feature_detail" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_detail" CASCADE;`)
}
