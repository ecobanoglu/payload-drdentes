import { useTranslations } from 'next-intl'
import React from 'react'

/*
 * Ürün vitrini hero'sunun "animasyonlu arayüz" modu: bilgisayar, tablet ve telefon
 * illüstrasyonu (tek SVG, 600×400). Ekranlardaki arayüz temsilidir ve verilerden çizilir.
 *
 * Animasyonlar tamamen CSS'tir (globals.css, `[data-devices]` altında):
 * - Cihazlar sırayla belirir, ardından hafifçe süzülür (`data-showcase-card` + `data-float`).
 * - Bilgisayar: randevu blokları sırayla yukarıdan aşağı açılır; "şimdi" şeridi yavaşça
 *   aşağı kayar; üst bardaki etkin sekme nabız gibi parlar.
 * - Tablet: form değerleri soldan sağa yazılır gibi dolar, onay kutuları belirir.
 * - Telefon: diş şemasındaki işaretli dişler sırayla yanıp söner, tedavi listesi dolar.
 * Döngüler aynı sürede (`--dv-cycle`) tekrarlanır; öğelerin gecikmesi `--d` ile verilir.
 * "Hareketi azalt" açıksa hiçbiri çalışmaz; arayüz dolu görünür.
 */

/** Gecikme stili (CSS değişkeni `--d`, saniye) */
const delay = (seconds: number) => ({ '--d': `${seconds.toFixed(2)}s` }) as React.CSSProperties

/** Sabit sözde rastgele uzunluklar: sunucu ve tarayıcıda aynı çizim (hydration uyumu) */
const LENGTHS = [
  0.62, 0.36, 0.48, 0.81, 0.17, 0.93, 0.55, 0.29, 0.74, 0.08, 0.67, 0.41, 0.86, 0.22, 0.59, 0.97,
  0.33, 0.71, 0.12, 0.5, 0.78, 0.04, 0.45, 0.89, 0.26, 0.64, 0.15, 0.83, 0.38, 0.69,
]
/** `min` ile `max` arasında, `seed` sırasına göre sabit bir uzunluk */
const pick = (seed: number, min: number, max: number) =>
  min + LENGTHS[seed % LENGTHS.length] * (max - min)

// ─────────────────────────── Bilgisayar: randevu takvimi ───────────────────────────

/** Takvim sütunları (hekimler): blok rengi ve etiket tonu */
const COLUMNS = [
  { fill: '#1E3A8A', label: '#3A4FA0' },
  { fill: '#2F55C8', label: '#5873D3' },
  { fill: '#8EAEF5', label: '#A7BFF7' },
  { fill: '#4F7BEA', label: '#6F93EE' },
  { fill: '#14B8A6', label: '#4CCBBD' },
  { fill: '#3B4A7A', label: '#5E6E9E' },
]
/** Sütun genişliği ve ilk sütunun x konumu */
const COL_STEP = 58.333
const COL_X = 152
/** Randevular: [sütun, y, yükseklik] */
const APPOINTMENTS: [number, number, number][] = [
  [0, 73, 40],
  [1, 73, 60],
  [3, 73, 50],
  [4, 73, 62],
  [5, 73, 62],
  [2, 79, 32],
  [0, 171, 58],
  [1, 171, 73],
  [3, 171, 60],
  [4, 171, 32],
  [5, 171, 30],
  [2, 183, 20],
  [4, 207, 30],
]

/** Bilgisayar ekranındaki randevu takvimi */
const LaptopScreen = () => (
  <g clipPath="url(#dv-lap-screen)">
    {/* Üst menü: sekmeler, etkin sekme (turkuaz), sağda kullanıcı simgeleri */}
    <rect x="124" y="30" width="382" height="13" fill="#1E3A8A" />
    {[
      [130, 22, '#2F55C8'],
      [156, 26, '#4F7BEA'],
      [186, 20, '#2F55C8'],
      [210, 22, '#2F55C8'],
      [236, 26, '#2F55C8'],
      [266, 22, '#2F55C8'],
      [292, 8, '#2F55C8'],
    ].map(([x, w, fill]) => (
      <rect key={x} x={x} y="34" width={w} height="5" rx="2.5" fill={fill as string} />
    ))}
    <rect data-dv="pulse" x="310" y="33" width="34" height="7" rx="3.5" fill="#14B8A6" />
    {[446, 456, 466].map((cx) => (
      <circle key={cx} cx={cx} cy="36.5" r="2.6" fill="#4F7BEA" />
    ))}
    <rect x="478" y="35.5" width="22" height="2" rx="1" fill="#8EAEF5" />

    {/* Araç çubuğu: arama, tarih, görünüm düğmeleri */}
    <rect x="130" y="48" width="60" height="9" rx="2" fill="#FFF" stroke="#CBD5E1" strokeWidth="0.6" />
    <rect x="134" y="51.6" width="40" height="2.2" rx="1.1" fill="#CBD5E1" />
    <rect x="194" y="48" width="28" height="9" rx="2" fill="#FFF" stroke="#CBD5E1" strokeWidth="0.6" />
    <rect x="225" y="48" width="9" height="9" rx="2" fill="#4F7BEA" />
    <rect x="324" y="50" width="50" height="3.5" rx="1.75" fill="#8EAEF5" />
    <rect x="392" y="48" width="18" height="9" rx="2" fill="#1E3A8A" />
    {[
      [412, 14],
      [428, 20],
      [450, 12],
      [464, 18],
      [476, 10],
      [488, 10],
    ].map(([x, w]) => (
      <rect key={x} x={x} y="48" width={w} height="9" rx="2" fill="#E3ECFE" />
    ))}

    {/* Sütun başlıkları */}
    <rect x="130" y="62" width="370" height="9" fill="#F4F7FE" />
    {COLUMNS.map((_, c) => (
      <rect key={c} x={167.2 + COL_STEP * c} y="65.5" width="24" height="2" rx="1" fill="#8EAEF5" />
    ))}

    {/* Saat ızgarası: yatay çizgiler, saat etiketleri, sütun çizgileri */}
    {Array.from({ length: 19 }, (_, i) => (
      <line key={i} x1="130" y1={72 + i * 10} x2="500" y2={72 + i * 10} stroke="#E8EDF4" strokeWidth="0.5" />
    ))}
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x="133" y={74 + i * 20} width="12" height="1.8" rx="0.9" fill="#CBD5E1" />
    ))}
    {Array.from({ length: 7 }, (_, i) => (
      <line key={i} x1={150 + COL_STEP * i} y1="62" x2={150 + COL_STEP * i} y2="252" stroke="#E8EDF4" strokeWidth="0.5" />
    ))}

    {/* "Şimdi" şeridi: zaman geçiyormuş gibi yavaşça aşağı kayar */}
    <rect data-dv="now" x="130" y="152" width="370" height="16" fill="#CCF3EE" opacity="0.6" />

    {/* Randevu blokları: sırayla yukarıdan aşağı açılır */}
    {APPOINTMENTS.map(([c, y, h], i) => {
      const x = COL_X + COL_STEP * c
      const { fill, label } = COLUMNS[c]
      const rows = Math.ceil((h - 6) / 7)
      return (
        <g key={i} data-dv="grow-y" style={delay(0.3 + i * 0.22)}>
          <rect x={x} y={y} width="54.3" height={h} rx="2.5" fill={fill} />
          {Array.from({ length: rows }, (_, r) => (
            <React.Fragment key={r}>
              <rect x={x + 3} y={y + 3 + r * 7} width="10" height="1.6" rx="0.8" fill={label} />
              <rect x={x + 3} y={y + 5.7 + r * 7} width={pick(i * 7 + r, 25, 40)} height="1.8" rx="0.9" fill="#FFF" />
            </React.Fragment>
          ))}
        </g>
      )
    })}
  </g>
)

// ─────────────────────────── Tablet: hasta kartı ───────────────────────────

/** Form bölümleri: başlık y konumu ve satırların y konumları */
const FORM_SECTIONS = [
  { y: 234, rows: [241, 250, 259, 268] },
  { y: 280, rows: [287, 296, 305] },
  { y: 318, rows: [325, 334, 343, 352] },
]
/** Onaylı alanlar: [satır y, sütun x] */
const CHECKS = new Set(['241:61', '259:131', '268:61', '296:131', '305:61', '325:131', '334:61', '352:131'])
/** Her bölümün ilk alanının genel sırası (satır başına 2 alan): animasyon gecikmesi için */
const SECTION_OFFSETS = FORM_SECTIONS.map((_, i) =>
  FORM_SECTIONS.slice(0, i).reduce((sum, section) => sum + section.rows.length * 2, 0),
)

/** Tablet ekranındaki hasta kartı (form + fotoğraf + etiketler) */
const TabletScreen = () => (
    <g clipPath="url(#dv-tab-screen)">
      {/* Üst menü ve hasta bilgi şeridi */}
      <rect x="34" y="214" width="214" height="9" fill="#1E3A8A" />
      {[39, 57, 75, 93, 111].map((x, i) => (
        <rect key={x} x={x} y="216.8" width="14" height="3.4" rx="1.7" fill={i === 0 ? '#4F7BEA' : '#2F55C8'} />
      ))}
      <rect x="132" y="216.2" width="22" height="4.6" rx="2.3" fill="#14B8A6" />
      {[208, 215, 222].map((cx) => (
        <circle key={cx} cx={cx} cy="218.5" r="1.8" fill="#4F7BEA" />
      ))}
      <rect x="34" y="223" width="214" height="7" fill="#2F55C8" />
      <rect x="39" y="225.6" width="26" height="1.8" rx="0.9" fill="#BCD0FA" />
      {[74, 96, 118, 140].map((x) => (
        <rect key={x} x={x} y="225.6" width="16" height="1.6" rx="0.8" fill="#8EAEF5" />
      ))}
      <rect x="214" y="225.6" width="28" height="1.8" rx="0.9" fill="#FFF" />

      {/* Form: bölüm başlıkları, alanlar; değerler sırayla yazılır, onaylar belirir */}
      {FORM_SECTIONS.map((section, sectionIndex) => (
        <g key={section.y}>
          <rect x="39" y={section.y} width="30" height="2" rx="1" fill="#4F7BEA" />
          <line x1="39" y1={section.y + 4} x2="175" y2={section.y + 4} stroke="#E3ECFE" strokeWidth="0.6" />
          {section.rows.map((y, rowIndex) =>
            [61, 131].map((x, columnIndex) => {
              const index = SECTION_OFFSETS[sectionIndex] + rowIndex * 2 + columnIndex
              return (
                <g key={`${y}:${x}`}>
                  <rect x={x - 22} y={y + 2.4} width="18" height="1.6" rx="0.8" fill="#CBD5E1" />
                  <rect x={x} y={y} width="42" height="6" rx="1.5" fill="#F4F7FE" stroke="#E8EDF4" strokeWidth="0.5" />
                  <rect
                    data-dv="type"
                    style={delay(0.6 + index * 0.18)}
                    x={x + 3}
                    y={y + 2.3}
                    width={pick(index + 11, 15, 29)}
                    height="1.4"
                    rx="0.7"
                    fill="#8EAEF5"
                  />
                  {CHECKS.has(`${y}:${x}`) && (
                    <rect
                      data-dv="pop"
                      style={delay(0.85 + index * 0.18)}
                      x={x + 36}
                      y={y + 0.8}
                      width="5"
                      height="4.4"
                      rx="1"
                      fill="#14B8A6"
                    />
                  )}
                </g>
              )
            }),
          )}
        </g>
      ))}

      {/* Hasta fotoğrafı ve adı */}
      <rect x="182" y="244" width="56" height="62" rx="5" fill="#E3ECFE" />
      <g clipPath="url(#dv-avatar)">
        <circle cx="210" cy="268" r="11" fill="#8EAEF5" />
        <ellipse cx="210" cy="304" rx="22" ry="17" fill="#8EAEF5" />
      </g>
      <rect x="190" y="236" width="40" height="2.4" rx="1.2" fill="#2F55C8" />

      {/* Etiketler ve kısayol düğmeleri: sırayla belirir */}
      {[
        [186, 310, 14, '#4F7BEA'],
        [203, 310, 14, '#2F55C8'],
        [220, 310, 14, '#14B8A6'],
        [182, 321, 26, '#1E3A8A'],
        [212, 321, 26, '#4F7BEA'],
        [182, 330, 26, '#2F55C8'],
        [212, 330, 26, '#14B8A6'],
        [182, 339, 26, '#4F7BEA'],
        [212, 339, 26, '#8EAEF5'],
      ].map(([x, y, w, fill], i) => (
        <rect
          key={`${x}:${y}`}
          data-dv="pop"
          style={delay(1.2 + i * 0.12)}
          x={x}
          y={y}
          width={w}
          height="7"
          rx="2"
          fill={fill as string}
        />
      ))}
    </g>
)

// ─────────────────────────── Telefon: diş şeması ───────────────────────────

/** Diş yükseklikleri (üst ve alt çene aynı; alt çene alta hizalı) */
const TOOTH_HEIGHTS = [18, 18, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 15, 15, 18, 18]
/** İşaretli dişler: [çene, sıra, renk] */
const MARKED_TEETH: ['upper' | 'lower', number, string][] = [
  ['upper', 3, '#14B8A6'],
  ['upper', 6, '#4F7BEA'],
  ['upper', 10, '#14B8A6'],
  ['lower', 2, '#4F7BEA'],
  ['lower', 5, '#14B8A6'],
  ['lower', 9, '#4F7BEA'],
  ['lower', 12, '#14B8A6'],
]
/** Tedavi listesi: değer genişliği ve rengi */
const TREATMENTS: [number, string][] = [
  [36.5, '#14B8A6'],
  [43.6, '#8EAEF5'],
  [46.5, '#8EAEF5'],
  [37.4, '#14B8A6'],
  [30.1, '#8EAEF5'],
  [41.7, '#8EAEF5'],
  [40.3, '#14B8A6'],
  [45.9, '#8EAEF5'],
]

/** Telefon ekranındaki diş şeması ve tedavi listesi */
const PhoneScreen = () => (
  <g clipPath="url(#dv-ph-screen)">
    {/* Üst bar ve arama */}
    <rect x="436" y="168" width="100" height="14" fill="#1E3A8A" />
    <circle cx="444" cy="175" r="2.4" fill="#4F7BEA" />
    <rect x="472" y="174" width="28" height="2.2" rx="1.1" fill="#FFF" />
    <rect x="510" y="174" width="18" height="2" rx="1" fill="#8EAEF5" />
    <rect x="441" y="186" width="60" height="7" rx="2" fill="#F4F7FE" stroke="#E8EDF4" strokeWidth="0.5" />
    <rect x="444" y="188.8" width="30" height="1.6" rx="0.8" fill="#CBD5E1" />
    <rect x="506" y="186" width="25" height="7" rx="2" fill="#2F55C8" />

    {/* Diş şeması: üst ve alt çene; işaretli dişler sırayla yanıp söner */}
    <rect x="440" y="199" width="92" height="50" rx="4" fill="#F4F7FE" />
    {(['upper', 'lower'] as const).map((jaw) =>
      TOOTH_HEIGHTS.map((h, i) => {
        const x = 443.4 + i * 5.375
        const y = jaw === 'upper' ? 204 : 245 - h
        const markIndex = MARKED_TEETH.findIndex(([j, n]) => j === jaw && n === i)
        const mark = markIndex >= 0 ? MARKED_TEETH[markIndex] : undefined
        return (
          <React.Fragment key={`${jaw}${i}`}>
            <rect x={x} y={y} width="4.6" height={h} rx="1.6" fill="#BCD0FA" />
            {mark && (
              <rect
                data-dv="blink"
                style={delay(0.8 + markIndex * 0.35)}
                x={x}
                y={y}
                width="4.6"
                height={h}
                rx="1.6"
                fill={mark[2]}
              />
            )}
          </React.Fragment>
        )
      }),
    )}

    {/* Tedavi listesi: başlık, satır zeminleri, değerler sırayla dolar */}
    <rect x="440" y="255" width="92" height="7" rx="1.5" fill="#2F55C8" />
    {[443, 473, 503].map((x) => (
      <rect key={x} x={x} y="257.6" width="18" height="1.6" rx="0.8" fill="#BCD0FA" />
    ))}
    {[263, 278, 293, 308].map((y) => (
      <rect key={y} x="440" y={y} width="92" height="7" fill="#F4F7FE" />
    ))}
    {TREATMENTS.map(([w, fill], i) => (
      <React.Fragment key={i}>
        <rect x="443" y={265.8 + i * 7.5} width="16" height="1.5" rx="0.75" fill="#CBD5E1" />
        <rect
          data-dv="type"
          style={delay(1 + i * 0.2)}
          x="464"
          y={265.8 + i * 7.5}
          width={w}
          height="1.5"
          rx="0.75"
          fill={fill}
        />
      </React.Fragment>
    ))}

    {/* Düğmeler ve not alanları */}
    {[
      [441, '#1E3A8A'],
      [454, '#2F55C8'],
      [467, '#4F7BEA'],
      [480, '#14B8A6'],
    ].map(([x, fill]) => (
      <rect key={x} x={x} y="329" width="11" height="8" rx="2" fill={fill as string} />
    ))}
    <rect x="441" y="343" width="34" height="2" rx="1" fill="#4F7BEA" />
    {[348, 359].map((y) => (
      <React.Fragment key={y}>
        <rect x="441" y={y} width="90" height="7" rx="2" fill="#F4F7FE" stroke="#E8EDF4" strokeWidth="0.5" />
        <rect x="444" y={y + 2.8} width="40" height="1.5" rx="0.75" fill="#CBD5E1" />
      </React.Fragment>
    ))}
  </g>
)

/**
 * Bilgisayar + tablet + telefon illüstrasyonu. Hero'nun cihaz kutusunu doldurur (oran korunur).
 * Her cihaz ayrı grupta belirir ve süzülür; gruplardaki `transform` iç grupta tutulur, çünkü
 * CSS animasyonu dış grubun `transform` değerini kullanır.
 */
export const DevicesIllustration = () => {
  const t = useTranslations('Showcase')

  return (
    <div className="absolute inset-0" dir="ltr">
      {/* Ekran okuyucular için kısa açıklama; çizim dekoratiftir */}
      <p className="sr-only">{t('caption')}</p>
      <svg
        data-devices
        aria-hidden
        viewBox="0 0 600 400"
        className="size-full overflow-visible"
      >
        <defs>
          <linearGradient id="dv-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9EDF3" />
            <stop offset="1" stopColor="#B9C1CE" />
          </linearGradient>
          <radialGradient id="dv-floor" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#1E2A4A" stopOpacity="0.22" />
            <stop offset="1" stopColor="#1E2A4A" stopOpacity="0" />
          </radialGradient>
          <filter id="dv-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
            <feOffset dy="6" result="o" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.18" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="dv-lap-screen">
            <rect x="124" y="30" width="382" height="226" rx="2" />
          </clipPath>
          <clipPath id="dv-tab-screen">
            <rect x="34" y="214" width="214" height="146" rx="3" />
          </clipPath>
          <clipPath id="dv-ph-screen">
            <rect x="436" y="168" width="100" height="200" rx="10" />
          </clipPath>
          <clipPath id="dv-avatar">
            <rect x="182" y="244" width="56" height="62" rx="5" />
          </clipPath>
        </defs>

        {/* Bilgisayar (zemin gölgesi + ekran + gövde) */}
        <g
          data-showcase-card
          data-float="up"
          style={{ '--reveal-delay': '0.8s', '--float-duration': '3.4s' } as React.CSSProperties}
        >
          <ellipse cx="315" cy="290" rx="250" ry="14" fill="url(#dv-floor)" />
          <rect x="112" y="18" width="406" height="252" rx="12" fill="#1F2937" />
          <rect x="124" y="30" width="382" height="226" rx="2" fill="#FFF" />
          <circle cx="315" cy="24" r="1.8" fill="#4B5563" />
          <LaptopScreen />
          <path d="M86 270 H544 L538 280 Q536 283 530 283 H100 Q94 283 92 280 Z" fill="url(#dv-base)" />
          <rect x="290" y="270" width="50" height="4" rx="2" fill="#AEB6C3" />
        </g>

        {/* Tablet (sağ altta, bilgisayarın önünde) */}
        <g
          data-showcase-card
          data-float="down"
          style={{ '--reveal-delay': '0.98s', '--float-duration': '3.8s', '--float-delay': '0.25s' } as React.CSSProperties}
        >
          <g transform="translate(318 0)" filter="url(#dv-shadow)">
            <rect x="22" y="202" width="238" height="170" rx="14" fill="#1F2937" />
            <rect x="34" y="214" width="214" height="146" rx="3" fill="#FFF" />
            <circle cx="28.5" cy="287" r="1.8" fill="#4B5563" />
            <TabletScreen />
          </g>
        </g>

        {/* Telefon (sol altta) */}
        <g
          data-showcase-card
          data-float="sm-up"
          style={{ '--reveal-delay': '1.16s', '--float-duration': '4.4s', '--float-delay': '0.5s' } as React.CSSProperties}
        >
          <g transform="translate(-388 0)" filter="url(#dv-shadow)">
            <rect x="428" y="156" width="116" height="222" rx="18" fill="#1F2937" />
            <rect x="436" y="168" width="100" height="200" rx="10" fill="#FFF" />
            <rect x="474" y="161" width="24" height="3" rx="1.5" fill="#4B5563" />
            <PhoneScreen />
            <rect x="472" y="371" width="28" height="2.2" rx="1.1" fill="#4B5563" />
          </g>
        </g>
      </svg>
    </div>
  )
}
