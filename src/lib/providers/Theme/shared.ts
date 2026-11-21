import type { Theme } from './types'

/** Tema seçici varken seçimin saklandığı localStorage anahtarı (artık yalnızca eski kaydı silmek için) */
export const themeLocalStorageKey = 'payload-theme'

/** Sitenin tek teması: her zaman açık */
export const defaultTheme: Theme = 'light'
