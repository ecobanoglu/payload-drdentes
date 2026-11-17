'use client'

import React from 'react'

import { defaultTheme, themeLocalStorageKey } from '../ThemeSelector/types'

/**
 * Sayfa boyanmadan önce `<html data-theme>` değerini ayarlayan betik (tema yanıp sönmesini önler).
 * Sıra: kayıtlı tercih (localStorage) → işletim sistemi tercihi → varsayılan tema.
 */
const themeScript = `
(function () {
  function getImplicitPreference() {
    var mql = window.matchMedia('(prefers-color-scheme: dark)')
    if (typeof mql.matches === 'boolean') return mql.matches ? 'dark' : 'light'
    return null
  }
  function themeIsValid(theme) {
    return theme === 'light' || theme === 'dark'
  }
  var themeToSet = '${defaultTheme}'
  var preference = window.localStorage.getItem('${themeLocalStorageKey}')
  if (themeIsValid(preference)) {
    themeToSet = preference
  } else {
    var implicitPreference = getImplicitPreference()
    if (implicitPreference) themeToSet = implicitPreference
  }
  document.documentElement.setAttribute('data-theme', themeToSet)
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
