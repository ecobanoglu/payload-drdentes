'use client'

import React from 'react'

import { defaultTheme, themeLocalStorageKey } from '../shared'

/**
 * Sayfa boyanmadan önce çalışan betik. Site her zaman açık temadadır (`<html data-theme>`
 * sunucuda verilir); betik yine de temayı sabitler ve tema seçici varken kaydedilmiş eski
 * seçimi (localStorage) siler.
 */
const themeScript = `
(function () {
  try {
    window.localStorage.removeItem('${themeLocalStorageKey}')
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', '${defaultTheme}')
})();
`

/**
 * Tema betiği, `<head>` içine düz `<script>` olarak yazılır.
 *
 * Betik yalnızca sunucudan gelen ilk HTML'de çalışmalıdır. Dil değişince kök layout
 * tarayıcıda yeniden çizilir; React o sırada çalıştırılabilir bir `<script>` oluşturursa
 * geliştirme modunda "Encountered a script tag…" uyarısı verir (betik zaten çalışmaz).
 * Bu yüzden tarayıcıda oluşturulan kopyanın türü `text/plain` (veri bloğu) yapılır:
 * uyarı çıkmaz, tema zaten ayarlı olduğu için davranış değişmez.
 */
export const InitTheme: React.FC = () => {
  return (
    <script
      id="theme-script"
      // Sunucuda çalıştırılabilir betik, tarayıcıdaki yeniden çizimde veri bloğu
      type={typeof window === 'undefined' ? undefined : 'text/plain'}
      // Hidrasyonda `type` farkı beklenen bir durumdur
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  )
}
