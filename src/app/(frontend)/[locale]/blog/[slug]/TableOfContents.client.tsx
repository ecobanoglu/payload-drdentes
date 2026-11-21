'use client'

import React, { useEffect, useState } from 'react'

import type { TocHeading } from '@/lib/utilities/headingAnchors'
import { cn } from '@/lib/utilities/ui'

/**
 * Yazının "İçindekiler" listesi (h3 ana madde, h4 girintili alt madde).
 *
 * - Bağlantıya tıklanınca ilgili başlığa yumuşak kaydırılır ve adres `#kimlik` olarak güncellenir.
 * - Kaydırırken o an okunan bölüm (ekranın üst kısmını geçen son başlık) ana renkle vurgulanır.
 */
export function TableOfContents({
  heading,
  headings,
  className,
}: {
  heading: string
  headings: TocHeading[]
  className?: string
}) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Okunan bölümü bul: üst menünün biraz altındaki çizgiyi geçmiş son başlık
  useEffect(() => {
    const elements = headings
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element))
    if (elements.length === 0) return

    const update = () => {
      const line = 160
      let current: string | null = null
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= line) current = element.id
        else break
      }
      setActiveId(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [headings])

  /** Başlığa yumuşak kaydırır; hareket azaltma tercihine uyar */
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
    setActiveId(id)
  }

  return (
    <nav aria-label={heading} className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <p className="px-2 pt-1 pb-3 text-xs font-semibold tracking-wider text-black/50 uppercase dark:text-white/50">
        {heading}
      </p>
      <ol className="space-y-0.5 border-s border-border">
        {headings.map((item) => {
          const isActive = item.id === activeId
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => handleClick(event, item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  // Sol çizgi üzerinde etkin maddeyi gösteren işaret (-ms-px: çizginin üstüne biner)
                  '-ms-px block border-s-2 py-1.5 pe-2 text-sm leading-snug transition-colors',
                  item.level === 3 ? 'ps-3' : 'ps-6 text-[0.8125rem]',
                  isActive
                    ? 'border-primary font-medium text-primary'
                    : 'border-transparent text-black/60 hover:border-black/30 hover:text-foreground dark:text-white/60 dark:hover:border-white/30',
                )}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
