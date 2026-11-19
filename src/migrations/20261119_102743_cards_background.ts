import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cards_background" AS ENUM('none', 'muted');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_background" AS ENUM('none', 'muted');
  ALTER TABLE "pages_blocks_cards" ADD COLUMN "background" "enum_pages_blocks_cards_background" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_cards" ADD COLUMN "background" "enum__pages_v_blocks_cards_background" DEFAULT 'none';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards" DROP COLUMN "background";
  ALTER TABLE "_pages_v_blocks_cards" DROP COLUMN "background";
  DROP TYPE "public"."enum_pages_blocks_cards_background";
  DROP TYPE "public"."enum__pages_v_blocks_cards_background";`)
}
