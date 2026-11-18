'use client'

import { Check } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import React, { useRef } from 'react'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap'
import { cn } from '@/lib/utilities/ui'

/*
 * Ürün vitrini hero'sunun "animasyonlu arayüz" modu.
 *
 * Cihaz çerçeveleri ve ekranlar CSS ile çizilir; ekranlardaki veriler temsilidir.
 * Tüm ölçüler container query birimleriyle (cqw) verilir: cihaz büyüyüp küçüldükçe
 * içindeki arayüz oranını koruyarak ölçeklenir.
 *
 * Her ekranın kendi döngüsel GSAP zaman çizelgesi vardır; hero ekrandan çıkınca durur,
 * geri gelince devam eder. "Hareketi azalt" açıksa animasyon yoktur, ekranlar dolu görünür.
 */

/** Uygulamanın ana rengi (orijinal arayüzdeki mavi üst bar) */
const APP_BLUE = '#1f6fb2'

// ─────────────────────────── Bilgisayar: randevu takvimi ───────────────────────────

/** Takvim sütunlarındaki hekimler ve randevu renkleri */
const DOCTORS = [
  { name: 'Ece E.', color: '#2e9e3e' },
  { name: 'Feride B.', color: '#1c3faa' },
  { name: 'Hüseyin E.', color: '#7b2cbf' },
  { name: 'Mehmet Y.', color: '#c0189b' },
  { name: 'Ömer Ç.', color: '#0f7c80' },
  { name: 'Tayfun A.', color: '#b3122f' },
]

/** Görünen saat aralığı: 09:00–17:00 (8 saat) */
const DAY_START = 9
const DAY_HOURS = 8
/** Öğle arası (saat, ondalıklı) */
const LUNCH = { start: 12.5, end: 13.5 }

/** Temsili randevular: [sütun, başlangıç saati, süre (saat), hasta] */
const APPOINTMENTS: [number, number, number, string][] = [
  [0, 9, 1, 'Ali TAŞKIN'],
  [0, 10.25, 0.75, 'Sevgi KAYA'],
  [0, 13.5, 1.5, 'Ayşe DEMİR'],
  [0, 15.25, 1, 'Can ÖZ'],
  [1, 9, 0.75, 'Mert ACAR'],
  [1, 9.75, 1.25, 'Zeynep ŞEN'],
  [1, 13.5, 0.75, 'Ece TUNA'],
  [1, 14.25, 1, 'Hakan EREN'],
  [1, 15.5, 1.25, 'Derya AK'],
  [2, 9.5, 1, 'Hilal YILDIZ'],
  [2, 11, 1, 'Ozan KILIÇ'],
  [2, 14, 1.5, 'Burak ÇAM'],
  [3, 9, 1.25, 'Selin AY'],
  [3, 10.5, 1, 'Emre TOK'],
  [3, 13.5, 1, 'İrem GÜL'],
  [3, 14.75, 1.25, 'Kerem SOY'],
  [4, 9.25, 1, 'Deniz UÇAR'],
  [4, 10.5, 1.5, 'Murat ÖZTÜRK'],
  [4, 13.5, 1, 'Leyla ŞAHİN'],
  [4, 14.75, 0.75, 'Tuna ER'],
  [4, 15.75, 1, 'Arda KAN'],
  [5, 9, 1, 'Gizem ARI'],
  [5, 10.25, 1.25, 'Okan DAĞ'],
  [5, 13.75, 1, 'Nazlı İNCE'],
  [5, 15, 1.5, 'Berk ALP'],
]

/** Ondalıklı saati "09:30" biçimine çevirir */
const formatHour = (hour: number) =>
  `${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.round((hour % 1) * 60)).padStart(2, '0')}`

/** Saati takvim gövdesinde yüzde konuma çevirir */
const hourToPercent = (hour: number) => ((hour - DAY_START) / DAY_HOURS) * 100

function CalendarScreen() {
  const t = useTranslations('Showcase')
  const locale = useLocale()
  // Temsili gün: 1 Aralık (yılın sabit bir günü, dile göre biçimlenir)
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(2026, 11, 1))

  return (
    <div className="flex size-full flex-col bg-white text-neutral-700">
      {/* Üst menü */}
      <div
        className="flex items-center gap-[0.8cqw] px-[1.2cqw] py-[0.7cqw] text-[1.05cqw] font-semibold text-white"
        style={{ background: APP_BLUE }}
      >
        {(['patients', 'appointments', 'expenses', 'reports', 'documents'] as const).map((key) => (
          <span
            key={key}
            className={cn(
              'rounded-[0.3cqw] px-[0.7cqw] py-[0.25cqw]',
              key === 'appointments' ? 'bg-white text-[#1f6fb2]' : 'bg-white/10',
            )}
          >
            {t(key)}
          </span>
        ))}
        <span className="ms-auto flex items-center gap-[0.5cqw] opacity-90">
          <span className="size-[1.6cqw] rounded-full bg-white/30" />
          Feride B.
        </span>
      </div>

      {/* Araç çubuğu */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-[1.2cqw] py-[0.7cqw]">
        <span className="text-[1.5cqw] font-semibold capitalize text-neutral-800">{dateLabel}</span>
        <span className="flex gap-[0.4cqw] text-[1cqw]">
          {(['day', 'week', 'month'] as const).map((key) => (
            <span
              key={key}
              className={cn(
                'rounded-[0.3cqw] px-[0.8cqw] py-[0.3cqw]',
                key === 'day' ? 'bg-neutral-800 text-white' : 'bg-neutral-100',
              )}
            >
              {t(key)}
            </span>
          ))}
          <span
            className="rounded-[0.3cqw] px-[0.8cqw] py-[0.3cqw] text-white"
            style={{ background: APP_BLUE }}
          >
            {t('today')}
          </span>
        </span>
      </div>

      {/* Hekim başlıkları */}
      <div className="grid grid-cols-[6%_repeat(6,1fr)] border-b border-neutral-200 text-center text-[1cqw] font-semibold">
        <span />
        {DOCTORS.map((doctor) => (
          <span key={doctor.name} className="truncate border-s border-neutral-200 py-[0.5cqw]">
            {doctor.name}
          </span>
        ))}
      </div>

      {/* Takvim gövdesi */}
      <div className="relative flex-1">
        {/* Saat çizgileri ve etiketleri */}
        {Array.from({ length: DAY_HOURS }, (_, index) => (
          <div
            key={index}
            className="absolute inset-x-0 border-t border-neutral-100"
            style={{ top: `${(index / DAY_HOURS) * 100}%` }}
          >
            <span className="absolute start-[0.6cqw] top-[0.2cqw] text-[0.9cqw] text-neutral-400">
              {formatHour(DAY_START + index)}
            </span>
          </div>
        ))}
        {/* Öğle arası bandı */}
        <div
          className="absolute end-0 start-[6%] bg-emerald-50"
          style={{
            top: `${hourToPercent(LUNCH.start)}%`,
            height: `${((LUNCH.end - LUNCH.start) / DAY_HOURS) * 100}%`,
          }}
        />
        {/* Sütun ayraçları */}
        <div className="absolute inset-y-0 end-0 start-[6%] grid grid-cols-6">
          {DOCTORS.map((doctor) => (
            <span key={doctor.name} className="border-s border-neutral-100" />
          ))}
        </div>
        {/* Randevular */}
        {APPOINTMENTS.map(([column, start, duration, patient], index) => (
          <div
            key={index}
            data-appointment
            className="absolute origin-top overflow-hidden rounded-[0.35cqw] px-[0.4cqw] py-[0.2cqw] text-[0.85cqw] leading-tight text-white shadow-sm"
            style={{
              background: DOCTORS[column]!.color,
              left: `calc(6% + ${column} * (94% / 6) + 0.25cqw)`,
              width: 'calc(94% / 6 - 0.5cqw)',
              top: `calc(${hourToPercent(start)}% + 0.15cqw)`,
              height: `calc(${(duration / DAY_HOURS) * 100}% - 0.3cqw)`,
            }}
          >
            <span className="block font-semibold opacity-90">
              {formatHour(start)} - {formatHour(start + duration)}
            </span>
            <span className="block truncate">{patient}</span>
          </div>
        ))}
        {/* "Şu an" çizgisi: gövde yüksekliğindeki kutu transform ile kaydırılır (layout tetiklemez) */}
        <div data-now-line className="pointer-events-none absolute inset-y-0 end-0 start-[6%] translate-y-[18%]">
          <div className="relative h-[0.2cqw] bg-red-500">
            <span className="absolute -start-[0.5cqw] -top-[0.4cqw] size-[1cqw] rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── Tablet: hasta kartı ───────────────────────────

/** Hasta kartı: bölüm başlığı ve etiket/değer satırları */
function PatientSection({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="space-y-[1cqw]">
      <p className="text-[2.3cqw] font-semibold text-[#1f6fb2]">{title}</p>
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[38%_1fr] items-center gap-[1cqw] text-[2.1cqw]">
          <span className="text-neutral-500">{label}</span>
          <span
            data-field
            className="truncate rounded-[0.6cqw] border border-neutral-200 bg-neutral-50 px-[1cqw] py-[0.5cqw] font-medium text-neutral-800"
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

function PatientScreen() {
  const t = useTranslations('Showcase')
  const personal: [string, string][] = [
    [t('firstName'), 'Hilal'],
    [t('lastName'), 'YILDIZ'],
    [t('gender'), t('female')],
    [t('birthDate'), '22.01.1993'],
  ]
  const contact: [string, string][] = [
    [t('phone'), '+90 555 123 45 67'],
    [t('email'), 'hilal@ornek.com'],
    [t('country'), t('countryValue')],
  ]
  const actions = [
    { label: t('appointment'), color: 'bg-sky-500' },
    { label: t('treatment'), color: 'bg-violet-500' },
    { label: t('invoice'), color: 'bg-amber-500' },
    { label: t('sms'), color: 'bg-emerald-500' },
  ]

  return (
    <div className="relative flex size-full flex-col bg-white">
      <div
        className="flex items-center justify-between px-[2cqw] py-[1.4cqw] text-[2cqw] font-semibold text-white"
        style={{ background: APP_BLUE }}
      >
        <span>{t('patientCard')}</span>
        <span>Hilal YILDIZ</span>
      </div>
      <div className="grid flex-1 grid-cols-[1fr_34%] gap-[2.4cqw] p-[2.4cqw]">
        <div className="space-y-[2cqw]">
          <PatientSection title={t('personalInfo')} rows={personal} />
          <PatientSection title={t('contactInfo')} rows={contact} />
        </div>
        <div className="flex flex-col items-center gap-[1.6cqw]">
          <div
            data-avatar
            className="flex aspect-square w-full items-center justify-center rounded-[1.4cqw] bg-gradient-to-br from-pink-400 to-rose-500 text-[7cqw] font-semibold text-white"
          >
            HY
          </div>
          <div className="grid w-full grid-cols-2 gap-[1cqw]">
            {actions.map((action) => (
              <span
                key={action.label}
                data-action
                className={cn(
                  'truncate rounded-[0.8cqw] py-[0.8cqw] text-center text-[1.6cqw] font-semibold text-white',
                  action.color,
                )}
              >
                {action.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Kaydedildi bildirimi */}
      <div
        data-toast
        className="absolute bottom-[3cqw] start-1/2 flex -translate-x-1/2 items-center gap-[1cqw] rounded-full bg-emerald-600 px-[2.4cqw] py-[1cqw] text-[1.9cqw] font-semibold text-white shadow-lg"
      >
        <Check aria-hidden className="size-[2.2cqw]" strokeWidth={3} />
        {t('saved')}
      </div>
    </div>
  )
}

// ─────────────────────────── Telefon: diş şeması ───────────────────────────

/** Görünen dişler (FDI numaralandırma): üst ve alt ön bölge */
const UPPER_TEETH = [14, 13, 12, 11, 21, 22, 23, 24]
const LOWER_TEETH = [44, 43, 42, 41, 31, 32, 33, 34]

/** İşaretlenecek dişler ve tedavileri (renk + mesaj anahtarı) */
const TOOTH_TREATMENTS: {
  tooth: number
  color: string
  key: 'filling' | 'rootCanal' | 'implant'
}[] = [
  { tooth: 11, color: '#2563eb', key: 'filling' },
  { tooth: 22, color: '#dc2626', key: 'rootCanal' },
  { tooth: 33, color: '#16a34a', key: 'implant' },
]

/** Tek bir diş: numara + diş şekli; tedavi varsa üstüne renkli işaret biner */
function Tooth({ number, upper }: { number: number; upper: boolean }) {
  const treatment = TOOTH_TREATMENTS.find((item) => item.tooth === number)
  return (
    <div className={cn('flex flex-col items-center gap-[1.5cqw]', !upper && 'flex-col-reverse')}>
      <span className="text-[5cqw] text-neutral-400">{number}</span>
      <span
        className={cn(
          'relative h-[13cqw] w-full border border-neutral-300 bg-neutral-50',
          upper ? 'rounded-b-[45%] rounded-t-[20%]' : 'rounded-t-[45%] rounded-b-[20%]',
        )}
      >
        {treatment && (
          <span
            data-tooth-mark
            className="absolute inset-[18%] rounded-[30%]"
            style={{ background: treatment.color }}
          />
        )}
      </span>
    </div>
  )
}

function DentalScreen() {
  const t = useTranslations('Showcase')

  return (
    <div className="flex size-full flex-col bg-white">
      <div
        className="px-[5cqw] pb-[4cqw] pt-[12cqw] text-[6cqw] font-semibold text-white"
        style={{ background: APP_BLUE }}
      >
        {t('oral')} · Hilal Y.
      </div>
      <div className="space-y-[5cqw] px-[4cqw] py-[6cqw]">
        <div className="grid grid-cols-8 gap-[1.5cqw]">
          {UPPER_TEETH.map((number) => (
            <Tooth key={number} number={number} upper />
          ))}
        </div>
        <div className="grid grid-cols-8 gap-[1.5cqw]">
          {LOWER_TEETH.map((number) => (
            <Tooth key={number} number={number} upper={false} />
          ))}
        </div>
      </div>
      <div className="flex-1 border-t border-neutral-100 px-[4cqw] py-[4cqw]">
        <p className="mb-[3cqw] text-[5.5cqw] font-semibold text-neutral-800">{t('treatments')}</p>
        <ul className="space-y-[2.5cqw]">
          {TOOTH_TREATMENTS.map((item) => (
            <li
              key={item.tooth}
              data-treatment-row
              className="flex items-center gap-[2.5cqw] rounded-[2cqw] bg-neutral-50 px-[3cqw] py-[2.5cqw] text-[5cqw] text-neutral-700"
            >
              <span
                className="size-[3.5cqw] shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              <span className="font-semibold">{item.tooth}</span>
              <span className="truncate">{t(item.key)}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Alt işlem butonu */}
      <div className="px-[4cqw] pb-[6cqw]">
        <span
          data-add-button
          className="block rounded-[3cqw] py-[3cqw] text-center text-[5.5cqw] font-semibold text-white"
          style={{ background: APP_BLUE }}
        >
          + {t('treatment')}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────── Döngü sınırı ───────────────────────────

/** Ekran animasyonlarının kaç tur oynayıp duracağı */
const LOOP_CYCLES = 2

/**
 * Sonsuz tekrarlanan bir zaman çizelgesini sınırlar: LOOP_CYCLES tur sonra `filled` etiketine
 * (ekranın dolu olduğu ana) ilerleyip durur. Dönen nesne hero görünürlüğüne göre
 * duraklatma / devam ettirme yapar; durmuş döngü tekrar görünür olunca bir tur daha oynar.
 */
function limitLoop(timeline: gsap.core.Timeline) {
  let cycles = 0
  let settled = false

  timeline.eventCallback('onRepeat', () => {
    cycles += 1
    if (cycles >= LOOP_CYCLES) {
      settled = true
      timeline.tweenTo('filled')
    }
  })

  return {
    /** Hero görünür oldu: duruyorsa bir tur daha oynat, duraklatılmışsa devam ettir */
    resume() {
      if (settled) {
        settled = false
        cycles = LOOP_CYCLES - 1
        timeline.restart()
      } else {
        timeline.resume()
      }
    },
    /** Hero görünmez oldu: oynuyorsa duraklat */
    pause() {
      if (!settled) timeline.pause()
    },
  }
}

// ─────────────────────────── Cihaz çerçeveleri ───────────────────────────

/**
 * Üç cihaz ve içlerindeki animasyonlu arayüzler. Konumlar ürün vitrinindeki görsellerle aynıdır;
 * `data-showcase-card` sayesinde hero'nun giriş ve süzülme animasyonlarına katılırlar.
 */
export function AnimatedDevices() {
  const t = useTranslations('Showcase')
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)

        // Gecikmeler: her ekran, hero'nun giriş animasyonunda cihazı göründükten sonra başlar

        // Takvim: randevular rastgele sırayla yukarıdan açılır, "şu an" çizgisi ilerler, sonra temizlenir
        const calendar = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 1.4 })
        calendar
          .from(q('[data-appointment]'), {
            scaleY: 0,
            autoAlpha: 0,
            duration: 0.45,
            ease: 'power2.out',
            stagger: { each: 0.09, from: 'random' },
          })
          .fromTo(q('[data-now-line]'), { yPercent: 6 }, { yPercent: 62, duration: 2, ease: 'power1.inOut' }, 0.4)
          .addLabel('filled')
          .to(
            q('[data-appointment]'),
            { autoAlpha: 0, duration: 0.4, stagger: { each: 0.02, from: 'end' } },
            'filled+=4',
          )

        // Hasta kartı: alanlar soldan sağa dolar, fotoğraf ve butonlar belirir, "Kaydedildi" çıkar
        const patient = gsap.timeline({ repeat: -1, repeatDelay: 2, delay: 1.6 })
        patient
          .from(q('[data-field]'), {
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.18,
          })
          .from(
            q('[data-avatar]'),
            { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: 'back.out(1.8)' },
            0.3,
          )
          .from(
            q('[data-action]'),
            { y: 8, autoAlpha: 0, duration: 0.35, stagger: 0.1, ease: 'back.out(2)' },
            '-=0.4',
          )
          .from(
            q('[data-toast]'),
            { y: 20, autoAlpha: 0, duration: 0.4, ease: 'power2.out' },
            '+=0.3',
          )
          .to(q('[data-toast]'), { y: 20, autoAlpha: 0, duration: 0.3 }, '+=2.5')
          .addLabel('filled')
          .to(
            q('[data-field], [data-avatar], [data-action]'),
            { autoAlpha: 0, duration: 0.3 },
            'filled+=0.4',
          )

        // Diş şeması: dişler sırayla işaretlenir, tedavi satırları kayarak gelir
        const dental = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 1.8 })
        dental
          .from(q('[data-tooth-mark]'), {
            scale: 0,
            autoAlpha: 0,
            duration: 0.4,
            ease: 'back.out(2.2)',
            stagger: 0.7,
          })
          .from(
            q('[data-treatment-row]'),
            { x: 16, autoAlpha: 0, duration: 0.4, ease: 'power2.out', stagger: 0.7 },
            0.2,
          )
          .to(
            q('[data-add-button]'),
            { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' },
            '+=0.3',
          )
          .addLabel('filled')
          .to(
            q('[data-tooth-mark], [data-treatment-row]'),
            { autoAlpha: 0, duration: 0.3 },
            'filled+=4',
          )

        // Döngüler sınırlı: her ekran LOOP_CYCLES tur oynar, sonra dolu haliyle durur
        // (sürekli işlemci/GPU kullanımı olmasın). Hero ekrandan çıkıp geri gelince bir tur daha oynar.
        const loops = [calendar, patient, dental].map(limitLoop)
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => loops.forEach((loop) => (self.isActive ? loop.resume() : loop.pause())),
        })
      })
      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className="absolute inset-0" dir="ltr">
      {/* Ekran okuyucular için kısa açıklama; arayüzün kendisi dekoratiftir */}
      <p className="sr-only">{t('caption')}</p>

      {/* Bilgisayar */}
      <div
        data-showcase-card
        data-float="up"
        aria-hidden
        style={{ '--reveal-delay': '0.8s', '--float-duration': '3.2s', '--float-delay': '0s' } as React.CSSProperties}
        className="@container absolute end-0 top-0 w-[86%]"
      >
        <div className="mx-[5%] rounded-t-[2cqw] bg-neutral-900 p-[1.4cqw] pb-[1.8cqw] ring-1 ring-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)]">
          <div className="aspect-[16/10] overflow-hidden rounded-[0.3cqw] will-change-transform">
            <div className="@container size-full">
              <CalendarScreen />
            </div>
          </div>
        </div>
        {/* Gövde (klavye kısmı) */}
        <div className="relative h-[2.6cqw] rounded-b-[2.6cqw] bg-gradient-to-b from-neutral-200 to-neutral-400">
          <span className="absolute start-1/2 top-0 h-[0.9cqw] w-[14%] -translate-x-1/2 rounded-b-[0.8cqw] bg-neutral-400/80" />
        </div>
      </div>

      {/* Tablet */}
      <div
        data-showcase-card
        data-float="down"
        aria-hidden
        style={{ '--reveal-delay': '0.98s', '--float-duration': '3.8s', '--float-delay': '0.25s' } as React.CSSProperties}
        className="@container absolute bottom-[2%] end-[10%] w-[54%]"
      >
        <div className="rounded-[4cqw] bg-neutral-100 p-[3cqw] ring-1 ring-black/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)]">
          <div className="aspect-[16/11] overflow-hidden rounded-[1cqw] ring-1 ring-neutral-200 will-change-transform">
            <div className="@container size-full">
              <PatientScreen />
            </div>
          </div>
        </div>
      </div>

      {/* Telefon */}
      <div
        data-showcase-card
        data-float="sm-up"
        aria-hidden
        style={{ '--reveal-delay': '1.16s', '--float-duration': '4.4s', '--float-delay': '0.5s' } as React.CSSProperties}
        className="@container absolute bottom-[10%] start-[15%] w-[25%]"
      >
        <div className="relative rounded-[16cqw] bg-neutral-900 p-[4cqw] ring-1 ring-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)]">
          {/* Çentik */}
          <span className="absolute start-1/2 top-[4cqw] z-10 h-[5cqw] w-[34%] -translate-x-1/2 rounded-b-[3cqw] bg-neutral-900" />
          <div className="aspect-[9/17] overflow-hidden rounded-[12cqw] will-change-transform">
            <div className="@container size-full">
              <DentalScreen />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
