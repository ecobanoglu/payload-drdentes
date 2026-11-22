// @vitest-environment node
/**
 * Çok dilli adres hesaplama: dil değiştirici, hreflang ve site haritası bu yolları kullanır.
 * Blog yazıları tüm dillerde ortak içerik dilindeki (Türkçe) kayıtla aynı adreste gösterilir.
 */
import { describe, expect, it, vi } from 'vitest'

// Yalnızca saf fonksiyonlar test edilir: Payload yapılandırması yüklenmesin
vi.mock('@payload-config', () => ({ default: {} }))

import { getDocumentPath, getPagePath, pathToSegments } from '@/lib/utilities/pagePath'
import { pathsFromAllLocalesDoc, samePathInAllLocales } from '@/lib/utilities/localizedPaths'

describe('pathsFromAllLocalesDoc: sayfalar', () => {
  it('yalnızca yayınlandığı dillerde, o dilin slug ve breadcrumbs yoluyla döner', () => {
    const paths = pathsFromAllLocalesDoc('pages', {
      slug: { tr: 'randevu-yonetimi', en: 'appointment-management', ar: 'appointment-management' },
      _status: { tr: 'published', en: 'published', ar: 'draft' },
      breadcrumbs: {
        tr: [{ url: '/ozellikler' }, { url: '/ozellikler/randevu-yonetimi' }],
        en: [{ url: '/features' }, { url: '/features/appointment-management' }],
      },
    })
    expect(paths).toEqual({ tr: '/ozellikler/randevu-yonetimi', en: '/features/appointment-management' })
  })

  it('ana sayfa her yayınlandığı dilde kök yoldur', () => {
    const paths = pathsFromAllLocalesDoc('pages', {
      slug: { tr: 'home', en: 'home' },
      _status: { tr: 'published', en: 'published' },
    })
    expect(paths).toEqual({ tr: '/', en: '/' })
  })
})

describe('pathsFromAllLocalesDoc: blog yazıları (ortak içerik)', () => {
  it('Türkçede yayınlanmışsa tüm dillerde aynı yolu döner', () => {
    const paths = pathsFromAllLocalesDoc('posts', {
      slug: { tr: 'bulut-teknolojisi' },
      _status: { tr: 'published' },
    })
    expect(paths).toEqual(samePathInAllLocales('/blog/bulut-teknolojisi'))
    expect(Object.keys(paths)).toEqual(['tr', 'en', 'es', 'ar', 'el'])
  })

  it('Türkçede yayınlanmamışsa hiçbir dilde yol döndürmez', () => {
    const paths = pathsFromAllLocalesDoc('posts', {
      slug: { tr: 'taslak' },
      _status: { tr: 'draft', en: 'published' },
    })
    expect(paths).toEqual({})
  })
})

describe('pagePath', () => {
  it('sayfa yolunu breadcrumbs, slug veya ana sayfadan hesaplar', () => {
    expect(getPagePath({ slug: 'home' })).toBe('/')
    expect(getPagePath({ slug: 'implant', breadcrumbs: [{ url: '/hizmetler' }, { url: '/hizmetler/implant' }] })).toBe('/hizmetler/implant')
    expect(getPagePath({ slug: 'yeni' })).toBe('/yeni')
    expect(getPagePath({ slug: null })).toBeNull()
  })

  it('yazı yolunu blog altında üretir', () => {
    expect(getDocumentPath('posts', { slug: 'x' })).toBe('/blog/x')
    expect(getDocumentPath('posts', {})).toBeNull()
  })

  it('yolu segmentlere böler', () => {
    expect(pathToSegments('/features/sms-system')).toEqual(['features', 'sms-system'])
    expect(pathToSegments('/')).toEqual([])
  })
})
