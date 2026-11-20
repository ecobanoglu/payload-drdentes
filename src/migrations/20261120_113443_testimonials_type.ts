import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_testimonials_type" AS ENUM('qa', 'announcement');
  ALTER TABLE "testimonials" ADD COLUMN "type" "enum_testimonials_type" DEFAULT 'qa' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" DROP COLUMN "type";
  DROP TYPE "public"."enum_testimonials_type";`)
}
