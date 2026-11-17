import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "_verified" boolean;
  ALTER TABLE "users" ADD COLUMN "_verificationtoken" varchar;`)

  // E-posta doğrulama gelmeden önce oluşturulmuş hesaplar doğrulanmış sayılır;
  // aksi halde mevcut kullanıcılar giriş yapamaz.
  await db.execute(sql`UPDATE "users" SET "_verified" = true WHERE "_verified" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "_verified";
  ALTER TABLE "users" DROP COLUMN "_verificationtoken";`)
}
