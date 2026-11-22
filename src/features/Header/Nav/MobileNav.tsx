'use client'

import { useLenis } from 'lenis/react'
import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePathname } from '@/lib/i18n/navigation'

/**
 * Dar ekran (lg altı: telefon ve dikey tablet) menüsü: hamburger butonu + üstten açılan panel.
 *
 * - Panel shadcn Dialog'dur: odak içeride kalır, Esc / ✕ / karartmaya tıklama ile kapanır.
 * - Bir bağlantıya tıklayınca ve sayfa değişince kapanır.
 * - Açıkken Lenis yumuşak kaydırması durdurulur (arkadaki sayfa kaymaz).
 * - Buton rengi header temasına uyar (koyu hero üzerinde açık renk).
 */
export const MobileNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const t = useTranslations('Nav')
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const lenis = useLenis()
  const navItems = data?.navItems || []

  // Sayfa değişince panel kapanır
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false)
  }, [pathname])

  // Açıkken yumuşak kaydırmayı durdur, kapanınca devam ettir
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    return () => lenis?.start()
  }, [open, lenis])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={t('open')}
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-secondary-foreground transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none lg:hidden"
      >
        <Menu aria-hidden className="size-6" />
      </DialogTrigger>

      <DialogContent
        closeLabel={t('close')}
        aria-describedby={undefined}
        data-lenis-prevent
        overlayClassName="bg-black/40 backdrop-blur-[2px]"
        // Ortalanmış pencere yerine ekranın üstüne yaslanan, tam genişlikte panel (üstten kayar)
        className="top-0 left-0 max-h-svh w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none rounded-b-2xl border-0 border-b p-0 sm:max-w-none data-[state=closed]:slide-out-to-top-4 data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-top-4 data-[state=open]:zoom-in-100 [&>[data-slot=dialog-close]]:end-4 [&>[data-slot=dialog-close]]:top-5 [&>[data-slot=dialog-close]]:inline-flex [&>[data-slot=dialog-close]]:size-10 [&>[data-slot=dialog-close]]:items-center [&>[data-slot=dialog-close]]:justify-center [&>[data-slot=dialog-close]]:rounded-md [&>[data-slot=dialog-close]_svg]:size-6"
      >
        <DialogTitle className="px-6 pt-7 pb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('title')}
        </DialogTitle>
        <nav className="px-3 pb-6">
          <ul>
            {navItems.map(({ link }, i) => (
              // Bağlantıya tıklanınca panel kapanır (aynı sayfaya gidilse de)
              <li key={i} onClick={() => setOpen(false)}>
                <CMSLink
                  {...link}
                  appearance="inline"
                  className="flex min-h-12 items-center rounded-lg px-3 text-lg font-medium text-foreground transition-colors hover:bg-primary/10"
                />
              </li>
            ))}
          </ul>
          {/* Vurgulu buton (ör. "Giriş Yap"): tam genişlikte */}
          {data?.cta?.enabled && data.cta.link && (
            <div className="mt-4 px-3" onClick={() => setOpen(false)}>
              <CMSLink {...data.cta.link} appearance="default" size="lg" className="w-full" />
            </div>
          )}
        </nav>
      </DialogContent>
    </Dialog>
  )
}
