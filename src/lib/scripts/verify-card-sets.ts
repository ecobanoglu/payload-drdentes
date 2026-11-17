/**
 * Kart Grupları + "Cards" bloğu uçtan uca doğrulama betiği.
 *
 * Senaryo:
 *  1. TR'de 3 kartlı "Özellikler" grubu oluşturulur; 2 kart EN'e çevrilir.
 *  2. Bu grubu kullanan bir sayfa (TR + EN) yayınlanır → TR'de 3, EN'de 2 kart görünmeli.
 *  3. Çevirmen (yalnızca EN) kart başlığını çevirebilmeli; ama kart ekleyememeli,
 *     ikon değiştirememeli ve TR'yi düzenleyememeli.
 *  4. Kart grubu güncellenince sayfa da güncellenmeli (tek yerden yönetim).
 * Sonunda tüm test kayıtları silinir.
 *
 * Kullanım (geliştirme sunucusu açıkken):
 *   npm run payload run src/lib/scripts/verify-card-sets.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const BASE = process.env.VERIFY_BASE_URL || 'http://localhost:3000'
const context = { disableRevalidate: true }

let failures = 0
/** Sonucu yazdırır; beklenenle uyuşmazsa hatayı sayar. */
const check = (label: string, ok: boolean, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` → ${detail}` : ''}`)
}

/** Sayfa HTML'ini getirir. */
const html = async (path: string) => (await fetch(BASE + path)).text()

const payload = await getPayload({ config })
const cleanup: (() => Promise<unknown>)[] = []

try {
  // 1) Kart grubu (TR) + kısmi EN çeviri
  const set = await payload.create({
    collection: 'card-sets',
    locale: 'tr',
    context,
    data: {
      name: 'Özellikler (test)',
      variant: 'features',
      cards: [
        { icon: 'smile', title: 'Estetik gülüş', description: 'Doğal görünümlü sonuçlar.' },
        { icon: 'shieldCheck', title: 'Güvenli tedavi', description: 'Steril ortam.' },
        { icon: 'clock', title: 'Hızlı randevu', description: 'Aynı gün muayene.' },
      ],
    },
  })
  cleanup.push(() => payload.delete({ collection: 'card-sets', id: set.id, context }))
  const [c1, c2, c3] = set.cards!

  await payload.update({
    collection: 'card-sets',
    id: set.id,
    locale: 'en',
    context,
    data: {
      cards: [
        { id: c1!.id, icon: 'smile', title: 'Aesthetic smile' },
        { id: c2!.id, icon: 'shieldCheck', title: 'Safe treatment' },
        { id: c3!.id, icon: 'clock' }, // EN'e çevrilmedi
      ],
    },
  })

  // 2) Grubu kullanan sayfa
  const block = (heading: string) => ({
    blockType: 'cards' as const,
    heading,
    cardSet: set.id,
    columns: '3' as const,
  })
  const page = await payload.create({
    collection: 'pages',
    locale: 'tr',
    context,
    data: {
      title: 'Kart Test',
      slug: 'kart-test',
      hero: { type: 'none' },
      layout: [block('Neden biz?')],
      _status: 'published',
    },
  })
  cleanup.unshift(() => payload.delete({ collection: 'pages', id: page.id, context }))
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    context,
    data: { title: 'Card Test', slug: 'card-test', hero: { type: 'none' }, layout: [block('Why us?')], _status: 'published' },
  })

  console.log('\n1) Sayfada kartlar')
  const tr = await html('/tr/kart-test')
  check('TR: bölüm başlığı', tr.includes('Neden biz?'))
  check('TR: 3 kart', ['Estetik gülüş', 'Güvenli tedavi', 'Hızlı randevu'].every((t) => tr.includes(t)))
  const en = await html('/en/card-test')
  check('EN: bölüm başlığı', en.includes('Why us?'))
  check('EN: çevrilen 2 kart', ['Aesthetic smile', 'Safe treatment'].every((t) => en.includes(t)))
  check('EN: çevrilmemiş kart gizli', !en.includes('Hızlı randevu') && !en.includes('Quick'))

  console.log('\n2) Çevirmen kısıtlaması')
  const translator = await payload.create({
    collection: 'users',
    disableVerificationEmail: true,
    data: {
      email: `translator-test-${Date.now()}@example.com`,
      password: 'Test-12345!',
      name: 'Çevirmen Test',
      roles: ['translator'],
      translatorLocales: ['en'],
      _verified: true,
    },
  })
  cleanup.push(() => payload.delete({ collection: 'users', id: translator.id }))

  await payload.update({
    collection: 'card-sets',
    id: set.id,
    locale: 'en',
    user: translator,
    overrideAccess: false,
    context,
    data: {
      cards: [
        { id: c1!.id, icon: 'award', title: 'Beautiful smile' }, // ikon değişikliği yok sayılmalı
        { id: c2!.id, icon: 'shieldCheck', title: 'Safe treatment' },
        { id: c3!.id, icon: 'clock', title: 'Fast appointment' },
        { icon: 'users', title: 'Translator added card' }, // yeni kart yok sayılmalı
      ],
    },
  })
  const enSet = await payload.findByID({ collection: 'card-sets', id: set.id, locale: 'en', fallbackLocale: false })
  check('Çevirmen başlığı çevirebildi', enSet.cards?.[0]?.title === 'Beautiful smile')
  check('Çevrilmemiş kart çevrildi', enSet.cards?.[2]?.title === 'Fast appointment')
  check('İkon değişmedi (ortak alan)', enSet.cards?.[0]?.icon === 'smile', String(enSet.cards?.[0]?.icon))
  check('Kart eklenemedi (yapı ortak)', enSet.cards?.length === 3, String(enSet.cards?.length))

  let trDenied = false
  try {
    await payload.update({
      collection: 'card-sets',
      id: set.id,
      locale: 'tr',
      user: translator,
      overrideAccess: false,
      context,
      data: { name: 'değiştirilmemeli' },
    })
  } catch {
    trDenied = true
  }
  check('Çevirmen TR düzenleyemez', trDenied)

  console.log('\n3) Tek yerden güncelleme')
  await payload.update({
    collection: 'card-sets',
    id: set.id,
    locale: 'tr',
    context,
    data: { cards: [{ id: c1!.id, icon: 'smile', title: 'Doğal gülüş tasarımı' }, { id: c2!.id, icon: 'shieldCheck', title: 'Güvenli tedavi' }, { id: c3!.id, icon: 'clock', title: 'Hızlı randevu' }] },
  })
  const trAfter = await html('/tr/kart-test')
  check('Sayfa güncel başlığı gösteriyor', trAfter.includes('Doğal gülüş tasarımı'))
} finally {
  for (const run of cleanup) await run()
  console.log('\nTest kayıtları silindi.')
}

console.log(failures === 0 ? '\nTÜM KONTROLLER BAŞARILI' : `\n${failures} KONTROL BAŞARISIZ`)
process.exit(failures === 0 ? 0 : 1)
