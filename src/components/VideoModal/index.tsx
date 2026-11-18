'use client'

import { useLenis } from 'lenis/react'
import { Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utilities/ui'
import { getYouTubeEmbedUrl, getYouTubeId } from '@/lib/utilities/youtube'

type Props = {
  /** YouTube video adresi (watch, youtu.be, shorts…) */
  url: string
  /** Buton metni; boşsa "Tanıtım Videosu" */
  label?: string | null
  className?: string
}

/**
 * "Tanıtım videosu" butonu + açılır pencere (shadcn Dialog + YouTube).
 *
 * - Esc, ✕ butonu veya karartmaya tıklama ile kapanır; odak pencere içinde kalır.
 * - Video (iframe) yalnızca pencere açıkken eklenir: sayfa açılışında YouTube yüklenmez,
 *   pencere kapanınca oynatma durur.
 * - Pencere açıkken Lenis yumuşak kaydırması durdurulur, sayfa arkada kaymaz.
 */
export function VideoModal({ url, label, className }: Props) {
  const t = useTranslations('Video')
  const [open, setOpen] = useState(false)
  const lenis = useLenis()
  const id = getYouTubeId(url)
  const title = label || t('play')

  // Açıkken yumuşak kaydırmayı durdur, kapanınca devam ettir
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    return () => lenis?.start()
  }, [open, lenis])

  if (!id) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          'group inline-flex h-10 items-center gap-3 rounded-md pe-4 text-sm font-medium cursor-pointer transition-colors',
          className,
        )}
      >
        <span className="relative inline-flex size-10 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5 transition-transform group-hover:scale-105">
          {/* Dikkat çeken yumuşak dalga (hareketi azalt ayarında kapalı) */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-white/40 motion-safe:animate-ping"
          />
          <Play aria-hidden className="relative size-4 translate-x-px fill-current" />
        </span>
        {title}
      </DialogTrigger>

      <DialogContent
        closeLabel={t('close')}
        overlayClassName="bg-black/80 backdrop-blur-sm"
        aria-describedby={undefined}
        data-lenis-prevent
        // Pencere yalnızca videodan oluşur: kenarlık/iç boşluk yok, ✕ butonu videonun üstünde
        className="w-[min(92vw,64rem)] max-w-none gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-none [&>[data-slot=dialog-close]]:-top-12 [&>[data-slot=dialog-close]]:end-0 [&>[data-slot=dialog-close]]:inline-flex [&>[data-slot=dialog-close]]:size-10 [&>[data-slot=dialog-close]]:items-center [&>[data-slot=dialog-close]]:justify-center [&>[data-slot=dialog-close]]:rounded-full [&>[data-slot=dialog-close]]:bg-white/10 [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:opacity-100 [&>[data-slot=dialog-close]]:hover:bg-white/20 [&>[data-slot=dialog-close]_svg]:size-5"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
          {open && (
            <iframe
              src={getYouTubeEmbedUrl(id)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="size-full border-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
