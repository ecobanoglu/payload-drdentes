import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards" ADD COLUMN "limit" numeric;
  ALTER TABLE "_pages_v_blocks_cards" ADD COLUMN "limit" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cards" DROP COLUMN "limit";
  ALTER TABLE "_pages_v_blocks_cards" DROP COLUMN "limit";`)
}
