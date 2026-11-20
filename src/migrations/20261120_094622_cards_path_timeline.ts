import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_cards_layout" ADD VALUE 'pathTimeline';
  ALTER TYPE "public"."enum__pages_v_blocks_cards_layout" ADD VALUE 'pathTimeline';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_cards" ALTER COLUMN "layout" SET DEFAULT 'grid'::text;
  DROP TYPE "public"."enum_pages_blocks_cards_layout";
  CREATE TYPE "public"."enum_pages_blocks_cards_layout" AS ENUM('grid', 'scrollStory');
  ALTER TABLE "pages_blocks_cards" ALTER COLUMN "layout" SET DEFAULT 'grid'::"public"."enum_pages_blocks_cards_layout";
  ALTER TABLE "pages_blocks_cards" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_blocks_cards_layout" USING "layout"::"public"."enum_pages_blocks_cards_layout";
  ALTER TABLE "_pages_v_blocks_cards" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_cards" ALTER COLUMN "layout" SET DEFAULT 'grid'::text;
  DROP TYPE "public"."enum__pages_v_blocks_cards_layout";
  CREATE TYPE "public"."enum__pages_v_blocks_cards_layout" AS ENUM('grid', 'scrollStory');
  ALTER TABLE "_pages_v_blocks_cards" ALTER COLUMN "layout" SET DEFAULT 'grid'::"public"."enum__pages_v_blocks_cards_layout";
  ALTER TABLE "_pages_v_blocks_cards" ALTER COLUMN "layout" SET DATA TYPE "public"."enum__pages_v_blocks_cards_layout" USING "layout"::"public"."enum__pages_v_blocks_cards_layout";`)
}
