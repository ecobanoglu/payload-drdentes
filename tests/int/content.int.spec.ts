/**
 * İçerik bütünlüğü (yerel veritabanını yalnızca okur; hiçbir şey yazmaz).
 *
 * - Çeviri sözlüğü: bugünkü Türkçe içeriğin tamamı İngilizce ve Arapçaya eksiksiz çevrilebilmeli.
 *   Türkçe içerik değişip sözlüğe eklenmezse bu test eksik metinleri listeler.
 * - Blog: Türkçede yayınlanmış her yazı ortak içerik dilinde slug ile bulunabilmeli ve her dilde
 *   aynı adrese sahip olmalı.
 * - Sayfalar: her yayınlanmış Türkçe sayfa İngilizce ve Arapçada da yayında olmalı; slug'lar
 *   İngilizce (yasal sayfalar Türkçe slug'ı korur, ana sayfa "home").
 *
 * Not: İngilizce/Arapça içerik `translate-locales` betiğiyle yazılmış olmalı.
 */
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { locales, SHARED_CONTENT_LOCALE } from '@/lib/i18n/config'
import {
  COPY_AS_IS_SLUGS,
  createTranslator,
  loadDictionary,
  TARGET_LOCALES,
  TRANSLATED_COLLECTIONS,
  TRANSLATED_GLOBALS,
} from '@/lib/scripts/lib/translateContent'
import { HOME_SLUG } from '@/lib/utilities/constants'
import { pathsFromAllLocalesDoc } from '@/lib/utilities/localizedPaths'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: await config })
}, 120_000)

/** Koleksiyonun alan tanımları */
const fieldsOf = (slug: string) => payload.config.collections.find((c) => c.slug === slug)!.fields

describe('çeviri sözlüğü', () => {
  it.each(TARGET_LOCALES)('Türkçe içeriğin tamamı %s diline çevrilebiliyor', async (locale) => {
    const translator = createTranslator(loadDictionary(locale))

    const { docs: pages } = await payload.find({ collection: 'pages', locale: 'tr', depth: 0, draft: false, limit: 500, pagination: false })
    for (const page of pages) {
      if (COPY_AS_IS_SLUGS.has(page.slug ?? '')) continue
      translator.translateFields(fieldsOf('pages'), page as unknown as Record<string, unknown>, false, `pages/${page.slug}`)
    }
    for (const collection of TRANSLATED_COLLECTIONS) {
      const { docs } = await payload.find({ collection, locale: 'tr', depth: 0, limit: 500, pagination: false })
      for (const doc of docs) {
        translator.translateFields(fieldsOf(collection), doc as unknown as Record<string, unknown>, false, `${collection}/${doc.id}`)
      }
    }
    for (const slug of TRANSLATED_GLOBALS) {
      const doc = await payload.findGlobal({ slug, locale: 'tr', depth: 0 })
      const fields = payload.config.globals.find((g) => g.slug === slug)!.fields
      translator.translateFields(fields, doc as unknown as Record<string, unknown>, false, `globals/${slug}`)
    }

    // Eksik varsa hangi metnin nerede olduğu test çıktısında görünsün
    expect(Object.fromEntries(translator.missing)).toEqual({})
  }, 120_000)
})

describe('blog: tüm dillerde ortak Türkçe kayıtlar', () => {
  it('Türkçede yayınlanmış her yazı ortak dilde bulunur ve her dilde aynı adrese sahiptir', async () => {
    const { docs } = await payload.find({
      collection: 'posts',
      locale: 'all' as never,
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      select: { slug: true, _status: true },
    })
    const published = docs.filter((doc) => (doc._status as unknown as Record<string, string>)?.[SHARED_CONTENT_LOCALE] === 'published')
    expect(published.length).toBeGreaterThan(0)

    for (const doc of published) {
      const slug = (doc.slug as unknown as Record<string, string>)[SHARED_CONTENT_LOCALE]
      // Sitenin kullandığı sorgu: ortak dil, ziyaretçi yetkisi
      const { docs: found } = await payload.find({
        collection: 'posts',
        locale: SHARED_CONTENT_LOCALE,
        fallbackLocale: false,
        overrideAccess: false,
        draft: false,
        limit: 1,
        where: { slug: { equals: slug } },
      })
      expect(found, `yazı bulunamadı: ${slug}`).toHaveLength(1)

      const paths = pathsFromAllLocalesDoc('posts', doc)
      expect(Object.keys(paths).sort()).toEqual([...locales].sort())
      expect(new Set(Object.values(paths))).toEqual(new Set([`/blog/${slug}`]))
    }
  }, 120_000)

  it('kullanıcı etkileşimleri ortak dilde içerikli kayıt döndürür', async () => {
    const { totalDocs } = await payload.count({
      collection: 'testimonials',
      locale: SHARED_CONTENT_LOCALE,
      where: { answer: { exists: true } },
    })
    expect(totalDocs).toBeGreaterThan(0)
  }, 60_000)
})

describe('sayfalar: İngilizce ve Arapça', () => {
  it.each(TARGET_LOCALES)('Türkçede yayınlanan her sayfa %s dilinde de yayında ve slug kuralına uyuyor', async (locale) => {
    const { docs } = await payload.find({
      collection: 'pages',
      locale: 'all' as never,
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      select: { slug: true, _status: true },
    })
    const problems: string[] = []
    for (const doc of docs) {
      const status = doc._status as unknown as Record<string, string>
      const slugs = doc.slug as unknown as Record<string, string>
      if (status?.tr !== 'published') continue
      const trSlug = slugs.tr
      if (status[locale] !== 'published') problems.push(`${trSlug}: ${locale} yayında değil`)
      const slug = slugs[locale]
      if (trSlug === HOME_SLUG || COPY_AS_IS_SLUGS.has(trSlug)) {
        if (slug !== trSlug) problems.push(`${trSlug}: ${locale} slug'ı "${slug}" (Türkçe slug korunmalı)`)
      } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug ?? '')) {
        problems.push(`${trSlug}: ${locale} slug'ı geçersiz "${slug}"`)
      }
    }
    expect(problems).toEqual([])
  }, 60_000)
})
