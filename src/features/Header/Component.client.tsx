'use client'
import { useHeaderTheme } from '@/lib/providers/HeaderTheme'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { useLenis } from 'lenis/react'
import React, { useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { cn } from '@/lib/utilities/ui'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

/** Header'ın sayfa akışındaki yüksekliği (px); bu kadar kaydırılınca "yapışkan" moda geçilir */
const HEADER_HEIGHT = 104
/** Yön değişimini algılamak için en az kaydırma (px); küçük titreşimler yok sayılır */
const SCROLL_DELTA = 6

/**
 * Header'ın kaydırma durumu:
 * - `top`: sayfanın en üstü; header akıştaki yerinde, şeffaf (hero'nun üstünde)
 * - `hidden`: aşağı kaydırılıyor; header yukarı kayarak gizlenir
 * - `pinned`: yukarı kaydırılıyor; header üstte sabit, zeminli ve kompakt görünür
 */
type ScrollState = 'top' | 'hidden' | 'pinned'

/**
 * Kaydırma yönünü izleyip header durumunu döndürür. Lenis yumuşak kaydırması pencereyi
 * kaydırdığı için yerel `scroll` olayı yeterlidir; olay `requestAnimationFrame` ile seyreltilir.
 */
function useHeaderScrollState(): ScrollState {
  const [state, setState] = useState<ScrollState>('top')
  const lastY = useRef(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      if (y <= HEADER_HEIGHT) {
        setState('top')
      } else if (Math.abs(y - lastY.current) >= SCROLL_DELTA) {
        setState(y > lastY.current ? 'hidden' : 'pinned')
      } else {
        return
      }
      lastY.current = y
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return state
}

/**
 * Site header'ı.
 *
 * - Sayfanın en üstünde akıştaki yerindedir; hero'lar altına girer (koyu hero → açık yazı).
 * - Aşağı kaydırınca gizlenir, yukarı kaydırınca üstte yapışkan olarak belirir
 *   (buzlu zemin, alt çizgi, daha az iç boşluk). Yapışkan modda sayfanın kendi teması kullanılır.
 * - Yer tutucu kutu sayesinde header sabitlendiğinde sayfa içeriği kaymaz.
 */
export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  // Header teması state'te tutulur: context'in tarayıcıdaki ilk değeri sunucu HTML'inden
  // farklı olabileceği için (html[data-theme]) ilk render sunucuyla aynı (null) yapılır.
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const scrollState = useHeaderScrollState()
  const isTop = scrollState === 'top'
  // Yumuşak kaydırma örneği ("Hareketi azalt" açıksa yoktur)
  const lenis = useLenis()

  /**
   * Logo tıklaması: ana sayfadayken aynı adrese gezinme bir şey yapmadığı için sayfa en üste
   * (hero'ya) kaydırılır. Diğer sayfalarda bağlantı normal çalışır (ana sayfaya gider).
   * Yeni sekmede açma (Ctrl/Cmd/Shift tıklaması, orta tuş) engellenmez.
   */
  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    event.preventDefault()
    if (lenis) lenis.scrollTo(0)
    else window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Sayfanın istediği tema (ör. koyu hero → "dark") hydration sonrası uygulanır;
  // koyu hero'su olmayan sayfaya geçince tema sıfırlanır
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (headerTheme !== theme) setTheme(headerTheme ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  // Hero teması yalnızca en üstte geçerli; yapışkan şerit sayfanın temasıyla çizilir
  const appliedTheme = isTop ? theme : null

  return (
    // Yer tutucu: header akıştan çıktığında (fixed) içerik yukarı kaymasın
    <div className="relative z-30" style={{ height: HEADER_HEIGHT }}>
      <header
        {...(appliedTheme ? { 'data-theme': appliedTheme } : {})}
        // En üstteyken işaretlenir: koyu hero'lu sayfada ilk çizimden itibaren koyu tema (globals.css)
        {...(isTop ? { 'data-header-top': '' } : {})}
        className={cn(
          'inset-x-0 top-0 transition-[transform,background-color,box-shadow,padding] duration-300 ease-out',
          isTop
            ? 'absolute'
            : 'fixed border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-md',
          scrollState === 'hidden' && '-translate-y-full',
        )}
      >
        <div
          className={cn(
            'container flex justify-between transition-[padding] duration-300',
            isTop ? 'py-8' : 'py-3',
          )}
        >
          <Link href="/" className="flex items-center" onClick={handleLogoClick}>
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <HeaderNav data={data} />
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    </div>
  )
}
