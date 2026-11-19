import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_feature_split_background" AS ENUM('none', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_split_background" AS ENUM('none', 'dark');
  ALTER TYPE "public"."enum_pages_blocks_feature_split_media_style" ADD VALUE 'phoneScreens';
  ALTER TYPE "public"."enum__pages_v_blocks_feature_split_media_style" ADD VALUE 'phoneScreens';
  ALTER TABLE "pages_blocks_feature_split" ADD COLUMN "background" "enum_pages_blocks_feature_split_background" DEFAULT 'none';
  ALTER TABLE "pages_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_pages_v_blocks_feature_split" ADD COLUMN "background" "enum__pages_v_blocks_feature_split_background" DEFAULT 'none';
  ALTER TABLE "_pages_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id","locale");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id","locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_media_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_media_fk";
  
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "media_style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "media_style" SET DEFAULT 'single'::text;
  DROP TYPE "public"."enum_pages_blocks_feature_split_media_style";
  CREATE TYPE "public"."enum_pages_blocks_feature_split_media_style" AS ENUM('single', 'phonePair');
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "media_style" SET DEFAULT 'single'::"public"."enum_pages_blocks_feature_split_media_style";
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "media_style" SET DATA TYPE "public"."enum_pages_blocks_feature_split_media_style" USING "media_style"::"public"."enum_pages_blocks_feature_split_media_style";
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "media_style" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "media_style" SET DEFAULT 'single'::text;
  DROP TYPE "public"."enum__pages_v_blocks_feature_split_media_style";
  CREATE TYPE "public"."enum__pages_v_blocks_feature_split_media_style" AS ENUM('single', 'phonePair');
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "media_style" SET DEFAULT 'single'::"public"."enum__pages_v_blocks_feature_split_media_style";
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "media_style" SET DATA TYPE "public"."enum__pages_v_blocks_feature_split_media_style" USING "media_style"::"public"."enum__pages_v_blocks_feature_split_media_style";
  DROP INDEX "pages_rels_media_id_idx";
  DROP INDEX "_pages_v_rels_media_id_idx";
  ALTER TABLE "pages_blocks_feature_split" DROP COLUMN "background";
  ALTER TABLE "pages_rels" DROP COLUMN "media_id";
  ALTER TABLE "_pages_v_blocks_feature_split" DROP COLUMN "background";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "media_id";
  DROP TYPE "public"."enum_pages_blocks_feature_split_background";
  DROP TYPE "public"."enum__pages_v_blocks_feature_split_background";`)
}
