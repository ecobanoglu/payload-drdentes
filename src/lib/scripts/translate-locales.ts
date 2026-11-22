/**
 * Türkçe içeriği İngilizce (en) ve Arapça (ar) dillerine yazar.
 *
 * Çeviriler `data/translations/{en,ar}.json` sözlüklerinden gelir (Türkçe metin → çeviri):
 * kaynak sitenin (drdentes.com.tr) İngilizce/Arapça sayfalarından eşleştirilenler + elle
 * yapılan çeviriler.
 *
 * Kapsam: sayfalar, kart grupları, SSS, paketler, formlar, üst menü, alt menü, iletişim
 * bilgileri. Blog yazıları ve kullanıcı etkileşimleri çevrilmez (tüm dillerde Türkçe kayıtlar
 * gösterilir; bkz. SHARED_CONTENT_LOCALE). KVKK sayfaları (Aydınlatma Metni, Açık Rıza Beyanı)
 * Türkçe metin ve Türkçe slug ile diğer dillere kopyalanır (yasal metnin geçerli sürümü Türkçe).
 *
 * Nasıl çalışır:
 * - Türkçe belgeyi okur, Payload alan tanımlarını gezer ve yalnızca dile göre ayrılan
 *   (localized) metin alanlarını ve zengin metinleri sözlükle çevirir. Dile göre ayrılmayan
 *   alanlar olduğu gibi kalır (onlara yazmak Türkçe değeri de değiştirirdi).
 * - Sayfa slug'ları her iki dilde İngilizce başlıktan üretilir (ana sayfa `home` kalır).
 * - Sözlükte karşılığı olmayan metin varsa hiçbir şey yazılmaz, eksikler listelenir.
 * - Türkçe içerik okunur, değiştirilmez. Tekrar çalıştırılabilir; her seferinde en/ar içeriğin
 *   üzerine yazar (bu dillerde panelden yapılan değişiklikler kaybolur).
 *
 * Kullanım:
 *   node node_modules/payload/bin.js run src/lib/scripts/translate-locales.ts          (rapor)
 *   APPLY=1 node node_modules/payload/bin.js run src/lib/scripts/translate-locales.ts  (yazar)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { HOME_SLUG } from '@/lib/utilities/constants'
import {
  COPY_AS_IS_SLUGS,
  createTranslator,
  loadDictionary,
  TARGET_LOCALES,
  toSlug,
  TRANSLATED_COLLECTIONS,
  TRANSLATED_GLOBALS,
  type TargetLocale,
  type Translator,
} from './lib/translateContent'

const payload = await getPayload({ config })
const APPLY = process.env.APPLY === '1'
const TARGETS = TARGET_LOCALES
const COLLECTIONS = TRANSLATED_COLLECTIONS
const GLOBALS = TRANSLATED_GLOBALS
const context = { disableRevalidate: true }

/** Dil başına çevirici (sözlük + eksik listesi) */
const translators = Object.fromEntries(
  TARGETS.map((locale) => [locale, createTranslator(loadDictionary(locale))]),
) as Record<TargetLocale, Translator>

/** Koleksiyon / global alan tanımları */
const collectionFields = (slug: string) => payload.config.collections.find((c) => c.slug === slug)!.fields
const globalFields = (slug: string) => payload.config.globals.find((g) => g.slug === slug)!.fields
const hasDrafts = (slug: string) => Boolean(payload.config.collections.find((c) => c.slug === slug)?.versions?.drafts)

/** Sistem alanları: güncellemede gönderilmez */
const SYSTEM_KEYS = ['id', 'createdAt', 'updatedAt', 'breadcrumbs', '_status', 'parent']
const stripSystem = (doc: Record<string, unknown>) => {
  const out = { ...doc }
  for (const key of SYSTEM_KEYS) delete out[key]
  return out
}

// ─────────────────────────── Hazırlık (çeviriler hesaplanır, henüz yazılmaz) ───────────────────────────

type Job = { label: string; run: () => Promise<unknown> }
const jobs: Job[] = []

// Sayfalar: üst sayfalar önce (alt sayfaların yolu üst sayfanın o dildeki slug'ından üretilir)
const { docs: pages } = await payload.find({
  collection: 'pages',
  locale: 'tr',
  depth: 0,
  draft: false,
  limit: 500,
  pagination: false,
})
const depthOf = (page: (typeof pages)[number]): number => {
  const parentId = typeof page.parent === 'object' ? page.parent?.id : page.parent
  const parent = pages.find((p) => p.id === parentId)
  return parent ? depthOf(parent) + 1 : 0
}
const orderedPages = [...pages].sort((a, b) => depthOf(a) - depthOf(b))
const pageFields = collectionFields('pages')

for (const locale of TARGETS) {
  const usedSlugs = new Map<string, number>()
  for (const page of orderedPages) {
    const copyAsIs = COPY_AS_IS_SLUGS.has(page.slug ?? '')
    const source = stripSystem(page as unknown as Record<string, unknown>)
    const data = translators[locale].translateFields(pageFields, source, false, `pages/${page.slug}`, copyAsIs)

    // Slug: ana sayfa sabit, yasal sayfalar Türkçe slug, diğerleri İngilizce başlıktan
    let slug = page.slug ?? ''
    if (!copyAsIs && slug !== HOME_SLUG) {
      const english = translators.en.translateText(page.title, `pages/${page.slug}.title(slug)`)
      slug = toSlug(english) || slug
    }
    const parentKey = `${typeof page.parent === 'object' ? page.parent?.id : (page.parent ?? '')}/${slug}`
    if (usedSlugs.has(parentKey)) slug = `${slug}-${page.id}`
    usedSlugs.set(parentKey, page.id as number)

    jobs.push({
      label: `${locale} sayfa ${page.slug} → ${slug}`,
      run: () =>
        payload.update({
          collection: 'pages',
          id: page.id,
          locale,
          draft: false,
          depth: 0,
          context,
          data: { ...data, slug, _status: 'published' } as never,
        }),
    })
  }
}

// Diğer koleksiyonlar
for (const collection of COLLECTIONS) {
  const { docs } = await payload.find({ collection, locale: 'tr', depth: 0, limit: 500, pagination: false })
  const fields = collectionFields(collection)
  for (const locale of TARGETS) {
    for (const doc of docs) {
      const data = translators[locale].translateFields(fields, stripSystem(doc as unknown as Record<string, unknown>), false, `${collection}/${doc.id}`)
      jobs.push({
        label: `${locale} ${collection}/${doc.id}`,
        run: () =>
          payload.update({
            collection,
            id: doc.id,
            locale,
            depth: 0,
            context,
            ...(hasDrafts(collection) ? { draft: false } : {}),
            data: { ...data, ...(hasDrafts(collection) ? { _status: 'published' } : {}) } as never,
          }),
      })
    }
  }
}

// Global'ler
for (const slug of GLOBALS) {
  const doc = await payload.findGlobal({ slug, locale: 'tr', depth: 0 })
  for (const locale of TARGETS) {
    const data = translators[locale].translateFields(globalFields(slug), stripSystem(doc as unknown as Record<string, unknown>), false, `globals/${slug}`)
    delete data.globalType
    jobs.push({
      label: `${locale} global ${slug}`,
      run: () => payload.updateGlobal({ slug, locale, depth: 0, context, data: data as never }),
    })
  }
}

// ─────────────────────────── Rapor / uygulama ───────────────────────────

for (const locale of TARGETS) {
  console.log(`${locale}: eksik çeviri ${translators[locale].missing.size}`)
  for (const [text, where] of [...translators[locale].missing].slice(0, 200)) {
    console.log(`   - ${where}: ${JSON.stringify(text).slice(0, 140)}`)
  }
}
console.log(`Yazılacak kayıt: ${jobs.length}`)

if (TARGETS.some((locale) => translators[locale].missing.size > 0)) {
  console.log('Eksik çeviriler tamamlanmadan hiçbir şey yazılmadı.')
} else if (!APPLY) {
  console.log('Rapor modu: yazmak için APPLY=1 ile çalıştırın.')
} else {
  for (const job of jobs) {
    await job.run()
    console.log(`✓ ${job.label}`)
  }
  console.log('Tamamlandı.')
}
