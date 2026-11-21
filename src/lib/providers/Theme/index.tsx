'use client'

import React, { createContext, use } from 'react'

import type { ThemeContextType } from './types'

import { defaultTheme } from './shared'

/**
 * Site her zaman açık temadadır: tema seçici yoktur, sistem ayarı dikkate alınmaz.
 * `<html data-theme="light">` sunucuda verilir; bağlam yalnızca mevcut temayı okumak isteyen
 * bileşenler için tutulur (`setTheme` bir şey yapmaz).
 */
const ThemeContext = createContext<ThemeContextType>({
  setTheme: () => null,
  theme: defaultTheme,
})

/** Tema bağlamını sağlar (sabit açık tema) */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext value={{ setTheme: () => null, theme: defaultTheme }}>{children}</ThemeContext>
)

/** Mevcut temayı döner (her zaman "light") */
export const useTheme = (): ThemeContextType => use(ThemeContext)
