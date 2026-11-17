/**
 * Dil bazlı yayınlama (experimental.localizeStatus) doğrulama betiği.
 *
 * Senaryo:
 *  1. Sayfa TR'de yayınlanır.
 *  2. EN çevirisi taslak olarak kaydedilir → TR hâlâ yayında kalmalı, EN yayında olmamalı.
 *  3. EN yayınlanır → iki dil de yayında olmalı.
 * Her adımda front-end (http://localhost:3000) yanıt kodları da kontrol edilir.
 * Sonunda test sayfası silinir.
 *
 * Kullanım (geliştirme sunucusu açıkken):
 *   npm run payload run src/lib/scripts/verify-locale-publishing.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const BASE = process.env.VERIFY_BASE_URL || 'http://localhost:3000'
const context = { disableRevalidate: true }

/** Front-end'de bir adresin HTTP durum kodunu döner. */
const status = async (path: string) => (await fetch(BASE + path, { redirect: 'manual' })).status

/** Sonucu okunur biçimde yazdırır; beklenenle uyuşmazsa hatayı işaretler. */
let failures = 0
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = actual === expected
  if (!ok) failures++
  console.log(`${ok ? '✓' : '✗'} ${label}: ${String(actual)}${ok ? '' : ` (beklenen: ${String(expected)})`}`)
}

const payload = await getPayload({ config })

/** Sayfanın verilen dildeki yayın durumu (`_status`) */
const statusIn = async (id: number, locale: 'tr' | 'en') =>
  (await payload.findByID({ collection: 'pages', id, locale, fallbackLocale: false, draft: false }))
    ._status

const page = await payload.create({
  collection: 'pages',
  locale: 'tr',
  context,
  data: {
    title: 'Doğrulama Sayfası',
    slug: 'dogrulama-sayfasi',
    hero: { type: 'none' },
    layout: [{ blockType: 'content', columns: [] }],
    _status: 'published',
  },
})

try {
  console.log('\n1) TR yayınlandı')
  check('TR durumu', await statusIn(page.id, 'tr'), 'published')
  check('/tr/dogrulama-sayfasi', await status('/tr/dogrulama-sayfasi'), 200)

  console.log('\n2) EN taslak olarak kaydedildi')
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    draft: true,
    context,
    data: {
      title: 'Verification Page',
      slug: 'verification-page',
      hero: { type: 'none' },
      layout: [{ blockType: 'content', columns: [] }],
      _status: 'draft',
    },
  })
  check('TR durumu (değişmemeli)', await statusIn(page.id, 'tr'), 'published')
  check('/tr/dogrulama-sayfasi', await status('/tr/dogrulama-sayfasi'), 200)
  check('/en/verification-page (yayında değil)', await status('/en/verification-page'), 404)

  console.log('\n3) EN yayınlandı')
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    context,
    data: { _status: 'published' },
  })
  check('EN durumu', await statusIn(page.id, 'en'), 'published')
  check('TR durumu', await statusIn(page.id, 'tr'), 'published')
  check('/en/verification-page', await status('/en/verification-page'), 200)
  check('/tr/dogrulama-sayfasi', await status('/tr/dogrulama-sayfasi'), 200)
  check('/ar/dogrulama-sayfasi (çevrilmedi)', await status('/ar/dogrulama-sayfasi'), 404)
} finally {
  await payload.delete({ collection: 'pages', id: page.id, context })
  console.log('\nTest sayfası silindi.')
}

console.log(failures === 0 ? '\nTÜM KONTROLLER BAŞARILI' : `\n${failures} KONTROL BAŞARISIZ`)
process.exit(failures === 0 ? 0 : 1)
