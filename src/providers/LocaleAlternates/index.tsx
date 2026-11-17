'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import type { LocalizedPaths } from '@/utilities/localizedPaths'

/**
 * Mevcut sayfanın diğer dillerdeki karşılıklarını header'daki dil değiştiriciye taşır.
 *
 * Neden gerekli? Header layout'ta render edilir ve hangi sayfada olduğunu bilmez.
 * Slug'lar dile göre değiştiği için (`/tr/hakkimizda` ↔ `/en/about`) sayfa bu bilgiyi
 * `<SetLocaleAlternates>` ile buraya yazar, dil değiştirici buradan okur.
 */
type ContextValue = {
  paths: LocalizedPaths | null
  setPaths: (paths: LocalizedPaths | null) => void
}

const LocaleAlternatesContext = createContext<ContextValue>({
  paths: null,
  setPaths: () => {},
})

/** Layout'ta bir kez sarmalanır; sayfa değişince içerik `SetLocaleAlternates` ile güncellenir. */
export function LocaleAlternatesProvider({ children }: { children: React.ReactNode }) {
  const [paths, setPaths] = useState<LocalizedPaths | null>(null)

  return (
    <LocaleAlternatesContext.Provider value={{ paths, setPaths }}>
      {children}
    </LocaleAlternatesContext.Provider>
  )
}

/** Sayfanın diğer dillerdeki yollarını okur. `null` ise sayfa bir eşleme bildirmemiştir. */
export const useLocaleAlternates = () => useContext(LocaleAlternatesContext).paths

/**
 * Sayfa içinde render edilir (görünmez). Sayfanın dil karşılıklarını context'e yazar,
 * sayfadan çıkılınca temizler.
 */
export function SetLocaleAlternates({ paths }: { paths: LocalizedPaths }) {
  const { setPaths } = useContext(LocaleAlternatesContext)

  useEffect(() => {
    setPaths(paths)
    return () => setPaths(null)
    // paths içeriği değişirse güncelle (nesne kimliği her render'da değişebilir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(paths), setPaths])

  return null
}
