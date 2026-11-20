'use client'

import { ChevronRight } from 'lucide-react'
import React from 'react'

import { Link, usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utilities/ui'

/** Yan listedeki tek özellik: başlık + dil öneksiz sayfa yolu */
export type FeatureSidebarItem = { id: string; title: string; href: string }

/**
 * Özellik sayfasının yan listesi (tarayıcı bileşeni: bulunulan sayfayı adresten anlar).
 *
 * - Geniş ekranda kaydırırken başlığın altında sabit kalır (sticky); liste uzunsa kendi içinde kayar.
 * - Bulunulan özellik ana renkte, zeminli ve `aria-current="page"` ile işaretlenir.
 * - Diğerlerinin üzerine gelince zemin belirir ve ok hafifçe ileri kayar.
 */
export function FeatureSidebar({
  heading,
  items,
}: {
  heading: string
  items: FeatureSidebarItem[]
}) {
  // Dil öneksiz geçerli yol (ör. /ozellikler/hasta-yonetimi)
  const pathname = usePathname()

  return (
    <nav
      aria-label={heading}
      className="rounded-2xl border border-border bg-background p-4 lg:sticky lg:top-28 lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto"
    >
      <p className="px-3 pt-1 pb-3 text-xs font-semibold tracking-wider text-black/50 uppercase dark:text-white/50">
        {heading}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isCurrent = pathname === item.href
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isCurrent
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-black/70 hover:bg-muted hover:text-foreground dark:text-white/70',
                )}
              >
                <span>{item.title}</span>
                <ChevronRight
                  aria-hidden
                  className={cn(
                    'size-4 shrink-0 transition-transform rtl:rotate-180',
                    isCurrent ? 'opacity-100' : 'opacity-40 group-hover:translate-x-0.5 group-hover:opacity-100',
                  )}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
