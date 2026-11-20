'use client'

import { useEffect } from 'react'

import { useHeaderTheme } from '@/lib/providers/HeaderTheme'

/**
 * Koyu sayfa başlık bandı varken site header'ını (en üstteyken) açık renkli yapar.
 * Her çizimde uygulanır: sayfanın kendi "light" ayarından sonra çalışıp onu geçersiz kılar
 * (ana sayfa hero'su ile aynı yöntem).
 */
export function DarkHeaderTheme() {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return null
}
