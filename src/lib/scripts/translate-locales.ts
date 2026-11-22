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
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload, type Field, type GlobalSlug, type CollectionSlug } from 'payload'

import { HOME_SLUG } from '@/lib/utilities/constants'

const payload = await getPayload({ config })
const dirname = path.dirname(fileURLToPath(import.meta.url))
const APPLY = process.env.APPLY === '1'
const TARGETS = ['en', 'ar'] as const
type Target = (typeof TARGETS)[number]
const context = { disableRevalidate: true }

/** Türkçe metni olduğu gibi diğer dillere kopyalanan sayfalar (yasal metinler) */
const COPY_AS_IS_SLUGS = new Set([
  'kisisel-verilerin-islenmesine-iliskin-aydinlatma',
  'acik-riza-beyani',
])
/** Çevrilecek koleksiyonlar (sayfalar ayrıca işlenir) ve global'ler */
const COLLECTIONS: CollectionSlug[] = ['card-sets', 'faqs', 'pricing-plans', 'forms']
const GLOBALS: GlobalSlug[] = ['header', 'footer', 'contact-info']
/** Metin olsa da çevrilmeyen alanlar (adres, iletişim, kimlik) */
const KEEP_FIELDS = new Set(['id', 'url', 'email', 'phone', 'supportPhone', 'whatsapp', 'slug', 'iban'])

// ─────────────────────────── Sözlük ───────────────────────────

/** Eşleştirme için metni sadeleştirir (Unicode, boşluk ve tırnak farkları yok sayılır) */
const normalize = (text: string) =>
  text
    .normalize('NFC')
    .replace(/[\s​]+/g, ' ')
    .replace(/[“”"'’‘]/g, '"')
    .trim()
    .toLowerCase()

/** Dil sözlüğünü yükler: tam eşleşme + sadeleştirilmiş eşleşme tabloları */
const loadDictionary = (locale: Target) => {
  const raw: Record<string, string> = JSON.parse(
    fs.readFileSync(path.resolve(dirname, `data/translations/${locale}.json`), 'utf8'),
  )
  const normalized = new Map(Object.entries(raw).map(([tr, value]) => [normalize(tr), value]))
  return { raw, normalized }
}
const dictionaries = Object.fromEntries(TARGETS.map((l) => [l, loadDictionary(l)])) as Record<
  Target,
  ReturnType<typeof loadDictionary>
>

/** Çevrilmeyen (harf içermeyen, adres/yol olan) metin mi */
const isNonTranslatable = (text: string) =>
  !/\p{L}/u.test(text) || /^(https?:\/\/|mailto:|tel:|\/|#)/.test(text.trim())

const missing: Record<Target, Map<string, string>> = { en: new Map(), ar: new Map() }

/**
 * Türkçe metni çevirir: tam eşleşme → sadeleştirilmiş eşleşme → (çok satırlıysa) satır satır.
 * Bulunamazsa eksik listesine ekler ve Türkçe metni döndürür.
 */
const translateText = (text: string, locale: Target, where: string): string => {
  if (isNonTranslatable(text)) return text
  const dict = dictionaries[locale]
  const direct = dict.raw[text] ?? dict.normalized.get(normalize(text))
  if (direct !== undefined) return direct
  if (text.includes('\n')) {
    const lines = text.split('\n')
    const out = lines.map((line) =>
      line.trim() === '' || isNonTranslatable(line)
        ? line
        : (dict.raw[line] ?? dict.raw[line.trim()] ?? dict.normalized.get(normalize(line))),
    )
    if (out.every((line) => line !== undefined)) return out.join('\n')
  }
  missing[locale].set(text, where)
  return text
}

/** Lexical zengin metindeki metin düğümlerini çevirir (yapı, biçim, bağlantılar korunur) */
const translateRichText = (node: unknown, locale: Target, where: string): unknown => {
  if (Array.isArray(node)) return node.map((item) => translateRichText(item, locale, where))
  if (!node || typeof node !== 'object') return node
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    out[key] =
      key === 'text' && typeof value === 'string'
        ? translateText(value, locale, where)
        : translateRichText(value, locale, where)
  }
  return out
}

// ─────────────────────────── Alan tanımına göre çeviri ───────────────────────────

/**
 * Belge verisini alan tanımlarına göre gezip dile göre ayrılan metinleri çevirir.
 * `inLocalized`: üst alanlardan biri dile göre ayrılıyorsa (blok listesi gibi) içindeki her şey
 * o dile aittir. Dile göre ayrılmayan alanlar değiştirilmeden kopyalanır.
 */
const translateFields = (
  fields: Field[],
  data: Record<string, unknown> | null | undefined,
  locale: Target,
  inLocalized: boolean,
  where: string,
  /** true: metinler çevrilmeden kopyalanır (yasal sayfalar); satır kimlikleri yine ayıklanır */
  copy = false,
): Record<string, unknown> => {
  if (!data || typeof data !== 'object') return data as unknown as Record<string, unknown>
  const out: Record<string, unknown> = { ...data }

  for (const field of fields) {
    // Adsız düzen alanları (row, collapsible) aynı veri üzerinde
    if (!('name' in field) || !field.name) {
      if (field.type === 'tabs') {
        for (const tab of field.tabs) {
          if ('name' in tab && tab.name) {
            const localized = inLocalized || Boolean(tab.localized)
            out[tab.name] = translateFields(tab.fields, out[tab.name] as Record<string, unknown>, locale, localized, `${where}.${tab.name}`, copy)
          } else {
            Object.assign(out, translateFields(tab.fields, out, locale, inLocalized, where, copy))
          }
        }
      } else if ('fields' in field && Array.isArray(field.fields)) {
        Object.assign(out, translateFields(field.fields, out, locale, inLocalized, where, copy))
      }
      continue
    }

    const name = field.name
    const value = out[name]
    if (value === undefined || value === null) continue
    const localized = inLocalized || Boolean('localized' in field && field.localized)
    const at = `${where}.${name}`

    switch (field.type) {
      case 'text':
      case 'textarea':
        if (localized && !copy && !KEEP_FIELDS.has(name)) {
          out[name] = Array.isArray(value)
            ? value.map((item) => (typeof item === 'string' ? translateText(item, locale, at) : item))
            : typeof value === 'string'
              ? translateText(value, locale, at)
              : value
        }
        break
      case 'richText':
        if (localized && !copy) out[name] = translateRichText(value, locale, at)
        break
      case 'group':
        out[name] = translateFields(field.fields, value as Record<string, unknown>, locale, localized, at, copy)
        break
      // Dile göre ayrılan dizi/blok satırlarının kimliği her dilde ayrıdır: Türkçe satır kimliği
      // kopyalanmaz (veritabanı yenisini üretir). Ortak (dile göre ayrılmayan) satırlar korunur.
      case 'array':
        out[name] = (value as Record<string, unknown>[]).map((row, i) =>
          withoutRowId(translateFields(field.fields, row, locale, localized, `${at}[${i}]`, copy), localized),
        )
        break
      case 'blocks':
        out[name] = (value as Record<string, unknown>[]).map((row, i) => {
          const block = (field.blocks ?? []).find((b) => b.slug === row.blockType)
          const translated = block ? translateFields(block.fields, row, locale, localized, `${at}[${i}]`, copy) : row
          return withoutRowId(translated, localized)
        })
        break
      default:
        // select, number, checkbox, relationship, upload, date, json... değişmez
        break
    }
  }
  return out
}

/** Dile göre ayrılan satırdan kimliği çıkarır (diğerlerinde satır aynen kalır) */
const withoutRowId = (row: Record<string, unknown>, localized: boolean) => {
  if (!localized || !row || typeof row !== 'object') return row
  const { id: _id, ...rest } = row
  return rest
}

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

/** İngilizce metinden URL slug'ı üretir (ör. "Appointment Management" → "appointment-management") */
const toSlug = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

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
    const data = translateFields(pageFields, source, locale, false, `pages/${page.slug}`, copyAsIs)

    // Slug: ana sayfa sabit, yasal sayfalar Türkçe slug, diğerleri İngilizce başlıktan
    let slug = page.slug ?? ''
    if (!copyAsIs && slug !== HOME_SLUG) {
      const english = translateText(page.title, 'en', `pages/${page.slug}.title(slug)`)
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
      const data = translateFields(fields, stripSystem(doc as unknown as Record<string, unknown>), locale, false, `${collection}/${doc.id}`)
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
    const data = translateFields(globalFields(slug), stripSystem(doc as unknown as Record<string, unknown>), locale, false, `globals/${slug}`)
    delete data.globalType
    jobs.push({
      label: `${locale} global ${slug}`,
      run: () => payload.updateGlobal({ slug, locale, depth: 0, context, data: data as never }),
    })
  }
}

// ─────────────────────────── Rapor / uygulama ───────────────────────────

for (const locale of TARGETS) {
  console.log(`${locale}: eksik çeviri ${missing[locale].size}`)
  for (const [text, where] of [...missing[locale]].slice(0, 200)) {
    console.log(`   - ${where}: ${JSON.stringify(text).slice(0, 140)}`)
  }
}
console.log(`Yazılacak kayıt: ${jobs.length}`)

if (missing.en.size || missing.ar.size) {
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
