/**
 * Türkçe içeriği sözlükle diğer dillere çeviren saf fonksiyonlar (veritabanına dokunmaz).
 * `translate-locales.ts` betiği ve testler tarafından kullanılır.
 *
 * - Metin eşleştirme: tam → sadeleştirilmiş (boşluk/tırnak farkları yok sayılır) →
 *   çok satırlıysa satır satır. Bulunamayan metinler `missing` listesine eklenir.
 * - Alan tanımına göre çeviri: yalnızca dile göre ayrılan (localized) metin ve zengin metin
 *   alanları çevrilir; dile göre ayrılan dizi/blok satırlarının kimlikleri çıkarılır.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionSlug, Field, GlobalSlug } from 'payload'

/** Türkçe metin → çeviri */
export type Dictionary = Record<string, string>

/** Çeviri yazılan diller */
export const TARGET_LOCALES = ['en', 'ar'] as const
export type TargetLocale = (typeof TARGET_LOCALES)[number]

/** Türkçe metni olduğu gibi diğer dillere kopyalanan sayfalar (yasal metinler) */
export const COPY_AS_IS_SLUGS = new Set([
  'kisisel-verilerin-islenmesine-iliskin-aydinlatma',
  'acik-riza-beyani',
])
/** Çevrilen koleksiyonlar (sayfalar ayrıca işlenir) ve global'ler */
export const TRANSLATED_COLLECTIONS: CollectionSlug[] = ['card-sets', 'faqs', 'pricing-plans', 'forms']
export const TRANSLATED_GLOBALS: GlobalSlug[] = ['header', 'footer', 'contact-info']

/** Metin olsa da çevrilmeyen alanlar (kimlik, adres, iletişim) */
export const KEEP_FIELDS = new Set(['id', 'url', 'email', 'phone', 'supportPhone', 'whatsapp', 'slug', 'iban'])

/** Eşleştirme için metni sadeleştirir (Unicode, boşluk ve tırnak farkları yok sayılır) */
export const normalize = (text: string) =>
  text
    .normalize('NFC')
    .replace(/[\s​]+/g, ' ')
    .replace(/[“”"'’‘]/g, '"')
    .trim()
    .toLowerCase()

/** Çevrilmeyen (harf içermeyen, adres/yol olan) metin mi */
export const isNonTranslatable = (text: string) =>
  !/\p{L}/u.test(text) || /^(https?:\/\/|mailto:|tel:|\/|#)/.test(text.trim())

/** İngilizce metinden URL slug'ı üretir (ör. "Appointment Management" → "appointment-management") */
export const toSlug = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Dile göre ayrılan satırdan kimliği çıkarır (diğerlerinde satır aynen kalır) */
export const withoutRowId = (row: Record<string, unknown>, localized: boolean) => {
  if (!localized || !row || typeof row !== 'object') return row
  const { id: _id, ...rest } = row
  return rest
}

/** Depodaki sözlük dosyasını yükler: `data/translations/{locale}.json` */
export const loadDictionary = (locale: TargetLocale): Dictionary => {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  return JSON.parse(fs.readFileSync(path.resolve(dirname, `../data/translations/${locale}.json`), 'utf8'))
}

/**
 * Bir dil için çevirici üretir. `missing`: sözlükte bulunamayan metinler (metin → bulunduğu yer).
 */
export const createTranslator = (dictionary: Dictionary) => {
  const normalized = new Map(Object.entries(dictionary).map(([tr, value]) => [normalize(tr), value]))
  const missing = new Map<string, string>()

  /** Tek satırın karşılığı (yoksa undefined) */
  const lookup = (text: string) => dictionary[text] ?? dictionary[text.trim()] ?? normalized.get(normalize(text))

  /** Metni çevirir; bulunamazsa eksiklere ekler ve Türkçe metni döndürür */
  const translateText = (text: string, where: string): string => {
    if (isNonTranslatable(text)) return text
    const direct = lookup(text)
    if (direct !== undefined) return direct
    if (text.includes('\n')) {
      const lines = text.split('\n').map((line) => (line.trim() === '' || isNonTranslatable(line) ? line : lookup(line)))
      if (lines.every((line) => line !== undefined)) return lines.join('\n')
    }
    missing.set(text, where)
    return text
  }

  /** Lexical zengin metindeki metin düğümlerini çevirir (yapı, biçim, bağlantılar korunur) */
  const translateRichText = (node: unknown, where: string): unknown => {
    if (Array.isArray(node)) return node.map((item) => translateRichText(item, where))
    if (!node || typeof node !== 'object') return node
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      out[key] = key === 'text' && typeof value === 'string' ? translateText(value, where) : translateRichText(value, where)
    }
    return out
  }

  /**
   * Belge verisini alan tanımlarına göre gezip dile göre ayrılan metinleri çevirir.
   * `inLocalized`: üst alanlardan biri dile göre ayrılıyorsa içindeki her şey o dile aittir.
   * `copy`: metinler çevrilmeden kopyalanır (yasal sayfalar); satır kimlikleri yine çıkarılır.
   */
  const translateFields = (
    fields: Field[],
    data: Record<string, unknown> | null | undefined,
    inLocalized: boolean,
    where: string,
    copy = false,
  ): Record<string, unknown> => {
    if (!data || typeof data !== 'object') return data as unknown as Record<string, unknown>
    const out: Record<string, unknown> = { ...data }

    for (const field of fields) {
      // Adsız düzen alanları (row, collapsible, adsız sekmeler) aynı veri üzerinde
      if (!('name' in field) || !field.name) {
        if (field.type === 'tabs') {
          for (const tab of field.tabs) {
            if ('name' in tab && tab.name) {
              const localized = inLocalized || Boolean(tab.localized)
              out[tab.name] = translateFields(tab.fields, out[tab.name] as Record<string, unknown>, localized, `${where}.${tab.name}`, copy)
            } else {
              Object.assign(out, translateFields(tab.fields, out, inLocalized, where, copy))
            }
          }
        } else if ('fields' in field && Array.isArray(field.fields)) {
          Object.assign(out, translateFields(field.fields, out, inLocalized, where, copy))
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
              ? value.map((item) => (typeof item === 'string' ? translateText(item, at) : item))
              : typeof value === 'string'
                ? translateText(value, at)
                : value
          }
          break
        case 'richText':
          if (localized && !copy) out[name] = translateRichText(value, at)
          break
        case 'group':
          out[name] = translateFields(field.fields, value as Record<string, unknown>, localized, at, copy)
          break
        // Dile göre ayrılan dizi/blok satırlarının kimliği her dilde ayrıdır: Türkçe satır kimliği
        // kopyalanmaz (veritabanı yenisini üretir). Ortak (dile göre ayrılmayan) satırlar korunur.
        case 'array':
          out[name] = (value as Record<string, unknown>[]).map((row, i) =>
            withoutRowId(translateFields(field.fields, row, localized, `${at}[${i}]`, copy), localized),
          )
          break
        case 'blocks':
          out[name] = (value as Record<string, unknown>[]).map((row, i) => {
            const block = (field.blocks ?? []).find((b) => b.slug === row.blockType)
            const translated = block ? translateFields(block.fields, row, localized, `${at}[${i}]`, copy) : row
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

  return { translateText, translateRichText, translateFields, missing }
}

export type Translator = ReturnType<typeof createTranslator>
