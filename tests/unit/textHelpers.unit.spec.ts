// @vitest-environment node
/**
 * Metin ve renk yardımcıları: başlık biçimlendirme (Türkçe ı/İ, vurgu kelimeleri) ve
 * hero zemininin açık/koyu ayrımı.
 */
import { describe, expect, it } from 'vitest'

import { isLightColor } from '@/lib/utilities/color'
import { toTitleCase, toTitleCaseTokens } from '@/lib/utilities/titleCase'

describe('toTitleCase', () => {
  it('Türkçede ı/İ dönüşümünü doğru yapar ve bağlaçları küçük bırakır', () => {
    expect(toTitleCase('SINIRSIZ Hekim ve Kullanıcı', 'tr')).toBe('Sınırsız Hekim ve Kullanıcı')
    expect(toTitleCase('ücretsiz güncelleme', 'tr')).toBe('Ücretsiz Güncelleme')
  })

  it('İngilizcede bağlaçları küçük bırakır, ilk kelimeyi büyütür', () => {
    expect(toTitleCase('the best of the web', 'en')).toBe('The Best of the Web')
  })
})

describe('toTitleCaseTokens', () => {
  it('tamamı büyük harfle yazılmış kelimeleri vurgu olarak işaretler', () => {
    const tokens = toTitleCaseTokens('Kurulum ücreti YOK', 'tr').filter((t) => t.text.trim())
    expect(tokens).toEqual([
      { text: 'Kurulum', emphasis: false },
      { text: 'Ücreti', emphasis: false },
      { text: 'Yok', emphasis: true },
    ])
  })

  it('büyük/küçük harf ayrımı olmayan dilde vurgu üretmez', () => {
    const tokens = toTitleCaseTokens('بدون رسوم تثبيت', 'ar')
    expect(tokens.some((t) => t.emphasis)).toBe(false)
  })
})

describe('isLightColor', () => {
  it('açık ve koyu zeminleri ayırır', () => {
    expect(isLightColor('#F7FAFD')).toBe(true)
    expect(isLightColor('#fff')).toBe(true)
    expect(isLightColor('#111c44')).toBe(false)
    expect(isLightColor('#1d1e1f')).toBe(false)
  })

  it('geçersiz değerde koyu varsayar', () => {
    expect(isLightColor('mavi')).toBe(false)
    expect(isLightColor('')).toBe(false)
  })
})
