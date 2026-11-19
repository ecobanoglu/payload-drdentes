import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cards_layout" AS ENUM('grid', 'scrollStory');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_layout" AS ENUM('grid', 'scrollStory');
  ALTER TABLE "pages_blocks_cards" ADD COLUMN "layout" "enum_pages_blocks_cards_layout" DEFAULT 'grid';
  ALTER TABLE "_pages_v_blocks_cards" ADD COLUMN "layout" "enum__pages_v_blocks_cards_layout" DEFAULT 'grid';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_cards" DROP COLUMN "layout";
  DROP TYPE "public"."enum_pages_blocks_cards_layout";
  DROP TYPE "public"."enum__pages_v_blocks_cards_layout";`)
}
