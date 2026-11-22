// @vitest-environment node
/**
 * Çeviri motoru (translate-locales betiğinin saf fonksiyonları):
 * metin eşleştirme, alan tanımına göre çeviri, satır kimlikleri ve slug üretimi.
 */
import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  createTranslator,
  isNonTranslatable,
  normalize,
  toSlug,
  withoutRowId,
} from '@/lib/scripts/lib/translateContent'

/** Testlerde kullanılan küçük sözlük */
const dictionary = {
  'Randevu Yönetimi': 'Appointment Management',
  'Sınırsız Hekim': 'Unlimited Dentists',
  'Kurulum ücreti YOK': 'NO setup fee',
  'Hasta arşivi': 'Patient archive',
  'Periyodik kontroller': 'Periodic check-ups',
  '"Güvenilmez" hasta': '"Unreliable" patient',
  Gönder: 'Send',
}

describe('metin çevirisi', () => {
  it('tam eşleşmeyi çevirir', () => {
    const t = createTranslator(dictionary)
    expect(t.translateText('Randevu Yönetimi', 'x')).toBe('Appointment Management')
    expect(t.missing.size).toBe(0)
  })

  it('boşluk ve tırnak farklarını yok sayar', () => {
    const t = createTranslator(dictionary)
    expect(t.translateText('  Randevu   Yönetimi ', 'x')).toBe('Appointment Management')
    expect(t.translateText('“Güvenilmez” hasta', 'x')).toBe('"Unreliable" patient')
  })

  it('çok satırlı metni sözlükte yoksa satır satır çevirir', () => {
    const t = createTranslator(dictionary)
    expect(t.translateText('Hasta arşivi\nPeriyodik kontroller', 'x')).toBe('Patient archive\nPeriodic check-ups')
  })

  it('bir satırı bile eksikse tüm metni eksik sayar ve Türkçeyi korur', () => {
    const t = createTranslator(dictionary)
    const text = 'Hasta arşivi\nBilinmeyen satır'
    expect(t.translateText(text, 'sayfa.alan')).toBe(text)
    expect(t.missing.get(text)).toBe('sayfa.alan')
  })

  it('adres, yol ve sayıları çevirmeye çalışmaz', () => {
    const t = createTranslator({})
    for (const value of ['https://dtsanal.com/', '/blog', 'mailto:a@b.c', '1.500 ₺', '#bolum']) {
      expect(t.translateText(value, 'x')).toBe(value)
    }
    expect(t.missing.size).toBe(0)
  })

  it('isNonTranslatable ve normalize beklendiği gibi', () => {
    expect(isNonTranslatable('2.500')).toBe(true)
    expect(isNonTranslatable('Kapasite')).toBe(false)
    expect(normalize('  A​  “b” ')).toBe('a "b"')
  })
})

describe('alan tanımına göre çeviri', () => {
  /** Payload alan tanımlarını taklit eden örnek şema */
  const fields = [
    { name: 'title', type: 'text', localized: true },
    { name: 'internalName', type: 'text' }, // dile göre ayrılmaz: dokunulmamalı
    { name: 'variant', type: 'select', localized: true, options: ['a'] }, // seçenek: çevrilmez
    { name: 'url', type: 'text', localized: true }, // adres alanı: çevrilmez
    {
      // Dile göre ayrılmayan dizi, içinde dile göre ayrılan alt alan (ör. kart grubu)
      name: 'cards',
      type: 'array',
      fields: [
        { name: 'id', type: 'text' },
        { name: 'title', type: 'text', localized: true },
        { name: 'icon', type: 'select', options: ['x'] },
      ],
    },
    {
      // Dile göre ayrılan blok listesi (ör. sayfa içeriği)
      name: 'layout',
      type: 'blocks',
      localized: true,
      blocks: [
        {
          slug: 'cards',
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'items', type: 'array', fields: [{ name: 'label', type: 'text' }] },
          ],
        },
      ],
    },
    {
      // Adsız düzen alanı: içindeki alanlar aynı veri üzerinde
      type: 'row',
      fields: [{ name: 'subtitle', type: 'textarea', localized: true }],
    },
    { name: 'body', type: 'richText', localized: true },
  ] as unknown as Field[]

  const source = {
    title: 'Randevu Yönetimi',
    internalName: 'Randevu Yönetimi',
    variant: 'a',
    url: 'Randevu Yönetimi',
    subtitle: 'Sınırsız Hekim',
    cards: [{ id: 'kart-1', title: 'Kurulum ücreti YOK', icon: 'x' }],
    layout: [{ id: 'blok-1', blockType: 'cards', heading: 'Gönder', items: [{ id: 'satir-1', label: 'Hasta arşivi' }] }],
    body: {
      root: {
        type: 'root',
        children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Randevu Yönetimi', format: 1 }] }],
      },
    },
  }

  it('yalnızca dile göre ayrılan metinleri çevirir', () => {
    const t = createTranslator(dictionary)
    const out = t.translateFields(fields, source, false, 'test')
    expect(out.title).toBe('Appointment Management')
    expect(out.subtitle).toBe('Unlimited Dentists')
    // Dile göre ayrılmayan alan: başka dile yazılırsa Türkçe değer de değişirdi
    expect(out.internalName).toBe('Randevu Yönetimi')
    expect(out.variant).toBe('a')
    expect(out.url).toBe('Randevu Yönetimi')
    expect(t.missing.size).toBe(0)
  })

  it('ortak dizide satır kimliğini korur, dile göre ayrılan alt alanı çevirir', () => {
    const out = createTranslator(dictionary).translateFields(fields, source, false, 'test')
    expect(out.cards).toEqual([{ id: 'kart-1', title: 'NO setup fee', icon: 'x' }])
  })

  it('dile göre ayrılan blok ve iç dizi satırlarından kimlikleri çıkarır', () => {
    const out = createTranslator(dictionary).translateFields(fields, source, false, 'test')
    const [block] = out.layout as Record<string, unknown>[]
    expect(block).not.toHaveProperty('id')
    expect(block.heading).toBe('Send')
    expect(block.items).toEqual([{ label: 'Patient archive' }])
  })

  it('zengin metinde yalnızca metin düğümlerini çevirir, biçimi korur', () => {
    const out = createTranslator(dictionary).translateFields(fields, source, false, 'test')
    const body = out.body as { root: { children: { children: { text: string; format: number }[] }[] } }
    expect(body.root.children[0].children[0]).toEqual({ type: 'text', text: 'Appointment Management', format: 1 })
  })

  it('kopyalama modunda metinleri çevirmez ama kimlikleri yine çıkarır', () => {
    const out = createTranslator({}).translateFields(fields, source, false, 'test', true)
    expect(out.title).toBe('Randevu Yönetimi')
    const [block] = out.layout as Record<string, unknown>[]
    expect(block).not.toHaveProperty('id')
  })

  it('kaynak veriyi değiştirmez', () => {
    const snapshot = JSON.stringify(source)
    createTranslator(dictionary).translateFields(fields, source, false, 'test')
    expect(JSON.stringify(source)).toBe(snapshot)
  })

  it('eksik metinleri bulundukları yerle raporlar', () => {
    const t = createTranslator({})
    t.translateFields(fields, source, false, 'pages/x')
    expect(t.missing.get('Randevu Yönetimi')).toMatch(/^pages\/x\./)
    expect(t.missing.has('Hasta arşivi')).toBe(true)
  })
})

describe('yardımcılar', () => {
  it('İngilizce başlıktan slug üretir', () => {
    expect(toSlug('Appointment Management')).toBe('appointment-management')
    expect(toSlug('Collection Management / Payment Plan')).toBe('collection-management-payment-plan')
    expect(toSlug('Income & Expense')).toBe('income-and-expense')
    expect(toSlug('  Dr.DENTES Features ')).toBe('dr-dentes-features')
  })

  it('withoutRowId yalnızca dile göre ayrılan satırda kimliği çıkarır', () => {
    expect(withoutRowId({ id: 'a', x: 1 }, true)).toEqual({ x: 1 })
    expect(withoutRowId({ id: 'a', x: 1 }, false)).toEqual({ id: 'a', x: 1 })
  })
})
