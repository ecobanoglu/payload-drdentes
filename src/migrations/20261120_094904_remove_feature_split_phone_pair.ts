import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_split" DROP CONSTRAINT "pages_blocks_feature_split_phone_front_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_feature_split" DROP CONSTRAINT "pages_blocks_feature_split_phone_back_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_feature_split" DROP CONSTRAINT "_pages_v_blocks_feature_split_phone_front_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_feature_split" DROP CONSTRAINT "_pages_v_blocks_feature_split_phone_back_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "media_style" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "media_style" SET DEFAULT 'single'::text;
  -- Elle eklendi: kaldırılan "İki telefon" seçeneğini kullanan kayıtlar (ör. eski sürümler)
  -- "Tek görsel"e çevrilir; yoksa yeni enum'a dönüşüm başarısız olur
  UPDATE "pages_blocks_feature_split" SET "media_style" = 'single' WHERE "media_style" = 'phonePair';
  UPDATE "_pages_v_blocks_feature_split" SET "media_style" = 'single' WHERE "media_style"::text = 'phonePair';
  DROP TYPE "public"."enum_pages_blocks_feature_split_media_style";
  CREATE TYPE "public"."enum_pages_blocks_feature_split_media_style" AS ENUM('single', 'phoneScreens');
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "media_style" SET DEFAULT 'single'::"public"."enum_pages_blocks_feature_split_media_style";
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "media_style" SET DATA TYPE "public"."enum_pages_blocks_feature_split_media_style" USING "media_style"::"public"."enum_pages_blocks_feature_split_media_style";
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "media_style" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "media_style" SET DEFAULT 'single'::text;
  DROP TYPE "public"."enum__pages_v_blocks_feature_split_media_style";
  CREATE TYPE "public"."enum__pages_v_blocks_feature_split_media_style" AS ENUM('single', 'phoneScreens');
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "media_style" SET DEFAULT 'single'::"public"."enum__pages_v_blocks_feature_split_media_style";
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "media_style" SET DATA TYPE "public"."enum__pages_v_blocks_feature_split_media_style" USING "media_style"::"public"."enum__pages_v_blocks_feature_split_media_style";
  DROP INDEX "pages_blocks_feature_split_phone_front_idx";
  DROP INDEX "pages_blocks_feature_split_phone_back_idx";
  DROP INDEX "_pages_v_blocks_feature_split_phone_front_idx";
  DROP INDEX "_pages_v_blocks_feature_split_phone_back_idx";
  ALTER TABLE "pages_blocks_feature_split" DROP COLUMN "phone_front_id";
  ALTER TABLE "pages_blocks_feature_split" DROP COLUMN "phone_back_id";
  ALTER TABLE "_pages_v_blocks_feature_split" DROP COLUMN "phone_front_id";
  ALTER TABLE "_pages_v_blocks_feature_split" DROP COLUMN "phone_back_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_feature_split_media_style" ADD VALUE 'phonePair' BEFORE 'phoneScreens';
  ALTER TYPE "public"."enum__pages_v_blocks_feature_split_media_style" ADD VALUE 'phonePair' BEFORE 'phoneScreens';
  ALTER TABLE "pages_blocks_feature_split" ADD COLUMN "phone_front_id" integer;
  ALTER TABLE "pages_blocks_feature_split" ADD COLUMN "phone_back_id" integer;
  ALTER TABLE "_pages_v_blocks_feature_split" ADD COLUMN "phone_front_id" integer;
  ALTER TABLE "_pages_v_blocks_feature_split" ADD COLUMN "phone_back_id" integer;
  ALTER TABLE "pages_blocks_feature_split" ADD CONSTRAINT "pages_blocks_feature_split_phone_front_id_media_id_fk" FOREIGN KEY ("phone_front_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_split" ADD CONSTRAINT "pages_blocks_feature_split_phone_back_id_media_id_fk" FOREIGN KEY ("phone_back_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_split" ADD CONSTRAINT "_pages_v_blocks_feature_split_phone_front_id_media_id_fk" FOREIGN KEY ("phone_front_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_split" ADD CONSTRAINT "_pages_v_blocks_feature_split_phone_back_id_media_id_fk" FOREIGN KEY ("phone_back_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_feature_split_phone_front_idx" ON "pages_blocks_feature_split" USING btree ("phone_front_id");
  CREATE INDEX "pages_blocks_feature_split_phone_back_idx" ON "pages_blocks_feature_split" USING btree ("phone_back_id");
  CREATE INDEX "_pages_v_blocks_feature_split_phone_front_idx" ON "_pages_v_blocks_feature_split" USING btree ("phone_front_id");
  CREATE INDEX "_pages_v_blocks_feature_split_phone_back_idx" ON "_pages_v_blocks_feature_split" USING btree ("phone_back_id");`)
}
