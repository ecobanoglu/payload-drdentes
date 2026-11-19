import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_feature_split_background" ADD VALUE 'shifting';
  ALTER TYPE "public"."enum__pages_v_blocks_feature_split_background" ADD VALUE 'shifting';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "background" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "background" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_pages_blocks_feature_split_background";
  CREATE TYPE "public"."enum_pages_blocks_feature_split_background" AS ENUM('none', 'dark', 'primary');
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "background" SET DEFAULT 'none'::"public"."enum_pages_blocks_feature_split_background";
  ALTER TABLE "pages_blocks_feature_split" ALTER COLUMN "background" SET DATA TYPE "public"."enum_pages_blocks_feature_split_background" USING "background"::"public"."enum_pages_blocks_feature_split_background";
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "background" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "background" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum__pages_v_blocks_feature_split_background";
  CREATE TYPE "public"."enum__pages_v_blocks_feature_split_background" AS ENUM('none', 'dark', 'primary');
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "background" SET DEFAULT 'none'::"public"."enum__pages_v_blocks_feature_split_background";
  ALTER TABLE "_pages_v_blocks_feature_split" ALTER COLUMN "background" SET DATA TYPE "public"."enum__pages_v_blocks_feature_split_background" USING "background"::"public"."enum__pages_v_blocks_feature_split_background";`)
}
