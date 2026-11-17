import type { Metadata } from 'next'

import { cn } from '@/lib/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Noto_Sans_Arabic } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/features/Footer/Component'
import { Header } from '@/features/Header/Component'
import { getDirection, ogLocales, type Locale } from '@/lib/i18n/config'
import { routing } from '@/lib/i18n/routing'
import { Providers } from '@/lib/providers'
import { LocaleAlternatesProvider } from '@/lib/providers/LocaleAlternates'
import { SmoothScrollProvider } from '@/lib/providers/SmoothScroll'
import { InitTheme } from '@/lib/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/lib/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import '../globals.css'
import { getServerSideURL } from '@/lib/utilities/getURL'

/**
 * Arapça font. Geist Arapça karakter içermediği için font yığınında Geist'ten sonra gelir;
 * tarayıcı yalnızca Arapça karakterler için bu fonta geçer. `preload: false` sayesinde
 * diğer dillerde hiç indirilmez (unicode-range ile yalnızca gerektiğinde yüklenir).
 */
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
})

/** Tüm dilleri build sırasında statik olarak üretir (/tr, /en, /es, /ar, /el). */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Args = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Site tarafının kök layout'u. URL'deki dile göre:
 * - `<html lang>` ve `dir` (Arapça için `rtl`) ayarlanır,
 * - next-intl arayüz metinleri client'a aktarılır,
 * - desteklenmeyen dil kodunda 404 döner.
 */
export default async function RootLayout({ children, params }: Args) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Statik render için dili bu istek boyunca sabitler (next-intl)
  setRequestLocale(locale)

  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, notoSansArabic.variable)}
      lang={locale}
      dir={getDirection(locale)}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <NextIntlClientProvider>
          <Providers>
            {/* Yumuşak kaydırma (Lenis) + GSAP ScrollTrigger; yalnızca site tarafında */}
            <SmoothScrollProvider>
            <LocaleAlternatesProvider>
              <AdminBar
                adminBarProps={{
                  preview: isEnabled,
                }}
              />

              <Header locale={locale} />
              {children}
              <Footer locale={locale} />
            </LocaleAlternatesProvider>
            </SmoothScrollProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

/** Dile göre varsayılan metadata (Open Graph dili dahil). Sayfalar bunu kendi değerleriyle ezer. */
export async function generateMetadata({ params }: Omit<Args, 'children'>): Promise<Metadata> {
  const { locale } = await params

  return {
    metadataBase: new URL(getServerSideURL()),
    openGraph: mergeOpenGraph({ locale: ogLocales[locale as Locale] }),
    twitter: {
      card: 'summary_large_image',
    },
  }
}
