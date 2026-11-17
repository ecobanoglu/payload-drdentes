/**
 * E-posta altyapısını (Resend + şablonlar) test eder.
 *
 * Alıcı verilmezse ilk super-admin kullanıcının e-posta adresine gönderir.
 * Resend'de alan adı doğrulanmadıysa (`onboarding@resend.dev`), yalnızca Resend
 * hesabının sahibine gönderim yapılabilir.
 *
 * Kullanım:
 *   npm run payload run src/scripts/send-test-email.ts
 *   npm run payload run src/scripts/send-test-email.ts -- alici@ornek.com
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { renderEmailLayout } from '@/email/layout'

const payload = await getPayload({ config })

/** Komut satırından verilen alıcı ya da ilk super-admin'in adresi */
const resolveRecipient = async (): Promise<string | undefined> => {
  const fromArgs = process.argv.find((arg) => arg.includes('@'))
  if (fromArgs) return fromArgs

  const { docs } = await payload.find({
    collection: 'users',
    where: { roles: { contains: 'super-admin' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0]?.email
}

const to = await resolveRecipient()
if (!to) {
  console.error('Alıcı bulunamadı. Kullanım: ... send-test-email.ts -- alici@ornek.com')
  process.exit(1)
}

try {
  const result = await payload.sendEmail({
    to,
    subject: 'Dr. Dentes – e-posta testi / اختبار البريد',
    html:
      renderEmailLayout({
        locale: 'tr',
        heading: 'E-posta altyapısı çalışıyor',
        bodyHtml: '<p>Bu bir test e-postasıdır. Resend entegrasyonu başarıyla kuruldu.</p>',
        footer: 'Bu e-posta send-test-email.ts betiğiyle gönderildi.',
      }) +
      renderEmailLayout({
        locale: 'ar',
        heading: 'اختبار البريد الإلكتروني',
        bodyHtml: '<p>هذا بريد تجريبي لعرض الاتجاه من اليمين إلى اليسار.</p>',
      }),
  })
  console.log('Gönderildi:', JSON.stringify(result))
  // Resend hata nesnesi döndürebilir (ör. doğrulanmamış alan adı)
  const failed = result && typeof result === 'object' && 'statusCode' in result
  process.exit(failed ? 1 : 0)
} catch (error) {
  console.error('Gönderim hatası:', error instanceof Error ? error.message : error)
  process.exit(1)
}
