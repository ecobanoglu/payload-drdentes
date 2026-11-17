/**
 * 3D hero renk paletleri.
 *
 * Hem admin paneli (seçim listesi) hem de sahne bu dosyayı kullanır; saf TS'dir,
 * Payload config'ine ve client bileşenlerine güvenle import edilebilir.
 */

export type ScenePalette = {
  /** Admin panelinde görünen ad */
  label: string
  /** Sahne yüklenmeden önce ve arkasında görünen CSS arka planı (poster) */
  background: string
  /** Gradyanın orta tonu; cam formun "arkasında gördüğü" düz renk (saydam canvas siyah görünmesin) */
  base: string
  /** Ana formun rengi */
  primary: string
  /** Uydu küreler ve ışık parçacıkları */
  accent: string
  /** Ortam ışığının tonu */
  light: string
}

export const scenePalettes = {
  aqua: {
    label: 'Turkuaz (klinik)',
    background:
      'radial-gradient(120% 90% at 75% 40%, #0e4a4f 0%, #062a2e 45%, #03161a 100%)',
    base: '#0a3a3f',
    primary: '#bdf3ec',
    accent: '#5eead4',
    light: '#e0fbff',
  },
  pearl: {
    label: 'İnci (nötr)',
    background:
      'radial-gradient(120% 90% at 75% 40%, #2a3344 0%, #151b27 50%, #0a0e16 100%)',
    base: '#222a3a',
    primary: '#f1f5f9',
    accent: '#cbd5e1',
    light: '#ffffff',
  },
  gold: {
    label: 'Altın (premium)',
    background:
      'radial-gradient(120% 90% at 75% 40%, #4a3510 0%, #261b08 50%, #120c03 100%)',
    base: '#3a2a0c',
    primary: '#fde9b6',
    accent: '#fbbf24',
    light: '#fff7e0',
  },
} satisfies Record<string, ScenePalette>

export type ScenePaletteKey = keyof typeof scenePalettes

export const defaultScenePalette: ScenePaletteKey = 'aqua'

/** Admin panelindeki seçim listesi */
export const scenePaletteOptions = (Object.keys(scenePalettes) as ScenePaletteKey[]).map(
  (value) => ({ label: scenePalettes[value].label, value }),
)

/** Kayıtlı değeri palete çevirir; bilinmeyen/boş değerde varsayılan palet döner. */
export const getScenePalette = (key?: string | null): ScenePalette =>
  scenePalettes[(key as ScenePaletteKey) in scenePalettes ? (key as ScenePaletteKey) : defaultScenePalette]
