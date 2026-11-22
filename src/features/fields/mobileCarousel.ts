import type { CheckboxField } from 'payload'

/**
 * "Mobilde yatay kaydır" seçeneği (Kart, Yorum ve Arşiv blokları).
 * Açıksa telefonda (md altı) kartlar alt alta değil, parmakla sağdan sola kaydırılan ve
 * her kartta duran (snap) yatay bir şeritte gösterilir. Tablet ve masaüstünde ızgara değişmez.
 */
export const mobileCarouselField = (overrides: Partial<CheckboxField> = {}): CheckboxField => ({
  name: 'mobileCarousel',
  label: { tr: 'Mobilde yatay kaydır', en: 'Horizontal scroll on mobile' },
  type: 'checkbox',
  defaultValue: false,
  ...overrides,
  admin: {
    description: {
      tr: 'Telefonda kartlar sağdan sola kaydırılan bir şeritte gösterilir (tablet ve masaüstünde ızgara).',
      en: 'On phones, cards are shown in a horizontally swipeable strip (grid on tablet and desktop).',
    },
    ...overrides.admin,
  },
})
