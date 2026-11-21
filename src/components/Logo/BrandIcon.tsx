import React from 'react'

/** Amblemin bir yarısındaki bacak (sol: mavi; sağ yarı aynalanarak yeşil çizilir) */
const LEG =
  'M4 7.3 5.3 6.8 18 19.4 8.4 31.4C7.4 32.9 5.4 33.4 4.3 31.8 4 31.3 4 31 4 30.6 5.2 26.5 6.8 24 6.8 19.5 6.8 15 4.4 12.5 4 10Z'

/** Amblemin üstündeki üçgenin bir yarısı (sol: turuncu; sağ: kırmızı) */
const ROOF = 'M5.3 6.8 18 1.3V19.4Z'

/**
 * Dr.DENTES amblemi: dört renkli diş biçimi (mavi, turuncu, kırmızı, yeşil).
 *
 * Renkler sabittir, her zeminde aynı görünür. Site logosu, admin paneli ve favicon
 * (public/favicon.svg) aynı çizimi kullanır; çizim değişirse favicon dosyaları da yenilenmeli.
 */
export const BrandIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg aria-hidden viewBox="0 0 36 36" width={size} height={size} className={className}>
    <path fill="#24A0DB" d={LEG} />
    <path fill="#F6AE1F" d={ROOF} />
    {/* Sağ yarı: sol yarının yatay aynası */}
    <g transform="matrix(-1 0 0 1 36 0)">
      <path fill="#73B942" d={LEG} />
      <path fill="#E13C35" d={ROOF} />
    </g>
  </svg>
)
