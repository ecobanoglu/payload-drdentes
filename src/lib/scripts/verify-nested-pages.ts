/**
 * İç içe sayfaların uçtan uca doğrulama betiği.
 *
 * Senaryo (TR + EN):
 *  1. "Hizmetler / Services" üst sayfası ve altında "İmplant / Implants" sayfası oluşturulur.
 *  2. Tam yollar, eksik yolla gelince doğru adrese yönlendirme, breadcrumb, hreflang ve
 *     sitemap kontrol edilir.
 *  3. Üst sayfanın TR slug'ı değiştirilir → alt sayfanın yolu otomatik güncellenmeli,
 *     eski adres yeni adrese yönlenmeli.
 * Sonunda test sayfaları silinir.
 *
 * Kullanım (geliştirme sunucusu açıkken):
 *   npm run payload run src/lib/scripts/verify-nested-pages.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { buildCollectionSitemap } from '@/lib/utilities/localizedSitemap'

const BASE = process.env.VERIFY_BASE_URL || 'http://localhost:3000'
const context = { disableRevalidate: true }

/** Adresi yönlendirmeyi takip etmeden ister; durum kodu, hedef ve HTML döner. */
const get = async (path: string) => {
  const res = await fetch(BASE + encodeURI(path), { redirect: 'manual' })
  return {
    status: res.status,
    location: decodeURI(res.headers.get('location') ?? ''),
    html: res.status === 200 ? await res.text() : '',
  }
}

let failures = 0
/** Sonucu yazdırır; beklenenle uyuşmazsa hatayı sayar. */
const check = (label: string, ok: boolean, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` → ${detail}` : ''}`)
}

const payload = await getPayload({ config })

/** Test için sade bir sayfa verisi */
const pageData = (title: string, slug: string) => ({
  title,
  slug,
  hero: { type: 'none' as const },
  layout: [{ blockType: 'content' as const, columns: [] }],
  _status: 'published' as const,
})

const created: number[] = []

try {
  // 1) TR: Hizmetler > İmplant
  const parent = await payload.create({
    collection: 'pages',
    locale: 'tr',
    context,
    data: pageData('Hizmetler', 'hizmetler-test'),
  })
  created.push(parent.id)
  const child = await payload.create({
    collection: 'pages',
    locale: 'tr',
    context,
    data: { ...pageData('İmplant', 'implant-test'), parent: parent.id },
  })
  created.push(child.id)

  // EN çevirileri (önce üst, sonra alt sayfa)
  await payload.update({ collection: 'pages', id: parent.id, locale: 'en', context, data: pageData('Services', 'services-test') })
  await payload.update({ collection: 'pages', id: child.id, locale: 'en', context, data: pageData('Implants', 'implants-test') })

  console.log('\n1) Adresler')
  const tr = await get('/tr/hizmetler-test/implant-test')
  check('/tr/hizmetler-test/implant-test', tr.status === 200, String(tr.status))
  const en = await get('/en/services-test/implants-test')
  check('/en/services-test/implants-test', en.status === 200, String(en.status))
  const parentPage = await get('/tr/hizmetler-test')
  check('/tr/hizmetler-test (üst sayfa)', parentPage.status === 200, String(parentPage.status))

  console.log('\n2) Yönlendirme, breadcrumb, hreflang, sitemap')
  const short = await get('/tr/implant-test')
  check(
    'Eksik yol asıl adrese yönlenir',
    [307, 308].includes(short.status) && short.location.endsWith('/tr/hizmetler-test/implant-test'),
    `${short.status} ${short.location}`,
  )
  check('Breadcrumb görünür', tr.html.includes('aria-current="page"') && tr.html.includes('Hizmetler'))
  check('BreadcrumbList JSON-LD', tr.html.includes('"@type":"BreadcrumbList"'))
  check(
    'hreflang EN iç içe yol',
    tr.html.includes('hrefLang="en" href="http://localhost:3000/en/services-test/implants-test"'),
  )
  // Sitemap HTTP'de önbellekli (`pages-sitemap` etiketi) ve bu betik önbellek temizlemeyi
  // kapattığı için üretim fonksiyonu doğrudan çağrılır
  const sitemap = (await buildCollectionSitemap('pages'))
    .flatMap((entry) => [entry.loc, ...(entry.alternateRefs ?? []).map((ref) => ref.href)])
    .join(' ')
  check('Sitemap TR iç içe yol', sitemap.includes('/tr/hizmetler-test/implant-test'))
  check('Sitemap EN iç içe yol', sitemap.includes('/en/services-test/implants-test'))

  console.log('\n3) Üst sayfa slug değişikliği')
  await payload.update({
    collection: 'pages',
    id: parent.id,
    locale: 'tr',
    context,
    data: { slug: 'tedaviler-test' },
  })
  const moved = await get('/tr/tedaviler-test/implant-test')
  check('/tr/tedaviler-test/implant-test (yeni yol)', moved.status === 200, String(moved.status))
  const old = await get('/tr/hizmetler-test/implant-test')
  check(
    'Eski yol yeni adrese yönlenir',
    [307, 308].includes(old.status) && old.location.endsWith('/tr/tedaviler-test/implant-test'),
    `${old.status} ${old.location}`,
  )
  const enStill = await get('/en/services-test/implants-test')
  check('EN yolu etkilenmez', enStill.status === 200, String(enStill.status))
} finally {
  for (const id of created.reverse()) {
    await payload.delete({ collection: 'pages', id, context })
  }
  console.log('\nTest sayfaları silindi.')
}

console.log(failures === 0 ? '\nTÜM KONTROLLER BAŞARILI' : `\n${failures} KONTROL BAŞARISIZ`)
process.exit(failures === 0 ? 0 : 1)
