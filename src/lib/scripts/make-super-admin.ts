/**
 * Mevcut bir kullanıcıya super-admin rolü verir.
 * Rol alanı eklenmeden önce oluşturulmuş hesaplar için gereklidir
 * (bu hesapların rolü yoktur ve admin paneline giremezler).
 *
 * Kullanım:
 *   npm run payload run src/lib/scripts/make-super-admin.ts -- ornek@eposta.com
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const email = process.argv.find((arg) => arg.includes('@'))

if (!email) {
  console.error('Kullanım: npm run payload run src/lib/scripts/make-super-admin.ts -- <email>')
  process.exit(1)
}

const payload = await getPayload({ config })

const { docs } = await payload.update({
  collection: 'users',
  where: { email: { equals: email.toLowerCase() } },
  data: { roles: ['super-admin'] },
  overrideAccess: true,
})

if (docs.length === 0) {
  console.error(`Kullanıcı bulunamadı: ${email}`)
  process.exit(1)
}

console.log(`${email} artık super-admin.`)
process.exit(0)
