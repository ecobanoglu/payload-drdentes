'use client'

import { useLenis } from 'lenis/react'
import { Check, Search, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utilities/ui'
import { catalogIcons, type CatalogIcon } from './icons'

/** Katalog bölümü: ad + özellik maddeleri */
export type CatalogSection = { title: string; items: string[] }
/** Katalog modülü: sayfa içi bağlantı kimliği, ad, ikon ve bölümler */
export type CatalogGroup = {
  id: string
  title: string
  icon: CatalogIcon
  sections: CatalogSection[]
}

/** Sabit header'ın altında kalmasın diye modüle kaydırırken bırakılan üst boşluk (px) */
const SCROLL_OFFSET = 112

/** Aramada kullanılan sade biçim: dile göre küçük harf */
const normalize = (text: string, locale: string) => text.toLocaleLowerCase(locale)

/**
 * Metindeki arama eşleşmelerini vurgular (açık mavi zemin). Küçük/büyük harf duyarsız;
 * eşleşme yoksa metin olduğu gibi döner.
 */
function Highlight({ text, query, locale }: { text: string; query: string; locale: string }) {
  if (!query) return <>{text}</>
  const haystack = normalize(text, locale)
  const parts: React.ReactNode[] = []
  let cursor = 0
  let index = haystack.indexOf(query)
  while (index !== -1) {
    if (index > cursor) parts.push(text.slice(cursor, index))
    parts.push(
      <mark key={index} className="rounded-sm bg-brand/15 px-0.5 text-foreground">
        {text.slice(index, index + query.length)}
      </mark>,
    )
    cursor = index + query.length
    index = haystack.indexOf(query, cursor)
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return <>{parts}</>
}

/**
 * Özellik kataloğu (tarayıcı bileşeni).
 *
 * - Üstte arama kutusu: yazdıkça madde ve bölüm adlarında arar, eşleşmeleri vurgular, eşleşmesi
 *   olmayan bölüm/modülleri gizler ve sonuç sayısını gösterir.
 * - Geniş ekranda solda yapışkan modül menüsü (ikon + ad + madde sayısı); sayfa kaydırıldıkça
 *   ekrandaki modül vurgulanır, tıklayınca o modüle yumuşak kaydırılır. Dar ekranda menü,
 *   içeriğin üstünde yatay kayan etiketler olur.
 * - Her modülde bölümler iki sütunlu "masonry" düzende kartlardır (kart yükseklikleri farklı
 *   olsa da boşluk kalmaz).
 */
export function FeatureCatalog({ groups }: { groups: CatalogGroup[] }) {
  const t = useTranslations('FeatureCatalog')
  const locale = useLocale()
  const lenis = useLenis()
  const [query, setQuery] = useState('')
  // Yazarken arayüz takılmasın: filtreleme bir sonraki boş anda yapılır
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = normalize(deferredQuery.trim(), locale)
  const [activeId, setActiveId] = useState(groups[0]?.id)

  const totalCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.sections.reduce((s, x) => s + x.items.length, 0), 0),
    [groups],
  )

  // Aramaya göre süzülmüş katalog: bölüm adı eşleşirse bölümün tüm maddeleri kalır
  const filtered = useMemo(() => {
    if (!normalizedQuery) return groups
    return groups
      .map((group) => ({
        ...group,
        sections: group.sections
          .map((section) =>
            normalize(section.title, locale).includes(normalizedQuery)
              ? section
              : {
                  ...section,
                  items: section.items.filter((item) =>
                    normalize(item, locale).includes(normalizedQuery),
                  ),
                },
          )
          .filter((section) => section.items.length > 0),
      }))
      .filter((group) => group.sections.length > 0)
  }, [groups, normalizedQuery, locale])

  const resultCount = filtered.reduce(
    (sum, group) => sum + group.sections.reduce((s, x) => s + x.items.length, 0),
    0,
  )

  // Kaydırma takibi: ekranın üst üçte birine giren modül menüde etkin olur
  useEffect(() => {
    const elements = filtered
      .map((group) => document.getElementById(group.id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [filtered])

  /** Menüden modüle yumuşak kaydırma (header payı bırakılarak) */
  const scrollToGroup = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    setActiveId(id)
    if (lenis) lenis.scrollTo(target, { offset: -SCROLL_OFFSET })
    else
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
      })
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-12">
      {/* Modül menüsü: geniş ekranda solda yapışkan liste, dar ekranda yatay etiketler */}
      <nav aria-label={t('modules')} className="lg:col-span-1">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3 hidden px-3 text-xs font-semibold tracking-wider text-black/50 uppercase lg:block dark:text-white/50">
            {t('modules')}
          </p>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
            {filtered.map((group) => {
              const Icon = catalogIcons[group.icon] ?? catalogIcons.sparkles
              const count = group.sections.reduce((sum, section) => sum + section.items.length, 0)
              const isActive = group.id === activeId
              return (
                <li key={group.id} className="shrink-0">
                  <a
                    href={`#${group.id}`}
                    onClick={(event) => scrollToGroup(event, group.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors lg:rounded-lg lg:border-transparent lg:px-3 lg:py-2.5',
                      isActive
                        ? 'border-primary/30 bg-primary/10 font-semibold text-primary'
                        : 'border-border text-black/70 hover:bg-muted hover:text-foreground dark:text-white/70',
                    )}
                  >
                    <Icon aria-hidden className="size-4 shrink-0" />
                    <span className="flex-1">{group.title}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs tabular-nums',
                        isActive ? 'bg-primary/15' : 'bg-muted',
                      )}
                    >
                      {count}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <div className="min-w-0 lg:col-span-3">
        {/* Arama kutusu + sonuç sayısı */}
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              aria-hidden
              className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-black/40 dark:text-white/40"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              className="h-12 w-full rounded-full border border-border bg-background ps-11 pe-11 text-sm outline-none transition-shadow placeholder:text-black/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:placeholder:text-white/40 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('clear')}
                className="absolute end-3 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-muted hover:text-foreground dark:text-white/50"
              >
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-black/60 dark:text-white/60" aria-live="polite">
            {normalizedQuery
              ? t('results', { count: resultCount })
              : t('total', { count: totalCount, modules: groups.length })}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-black/60 dark:text-white/60">
            {t('noResults')}
          </div>
        ) : (
          <div className="space-y-16">
            {filtered.map((group) => {
              const Icon = catalogIcons[group.icon] ?? catalogIcons.sparkles
              const count = group.sections.reduce((sum, section) => sum + section.items.length, 0)
              return (
                <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`}>
                  {/* Modül başlığı: ikon kutusu + ad + madde sayısı */}
                  <div className="mb-6 flex items-center gap-4">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <div>
                      <h2 id={`${group.id}-title`} className="text-2xl font-semibold tracking-tight md:text-3xl">
                        {group.title}
                      </h2>
                      <p className="text-sm text-black/50 dark:text-white/50">
                        {t('featureCount', { count })}
                      </p>
                    </div>
                  </div>

                  {/* Bölüm kartları: iki sütunlu masonry (kartlar sütun içinde bölünmez) */}
                  <div className="gap-4 md:columns-2">
                    {group.sections.map((section, sectionIndex) => (
                      <article
                        key={sectionIndex}
                        className="mb-4 break-inside-avoid rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
                      >
                        <h3 className="mb-4 flex items-center justify-between gap-3 text-base font-semibold">
                          <span>
                            <Highlight text={section.title} query={normalizedQuery} locale={locale} />
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-black/60 tabular-nums dark:text-white/60">
                            {section.items.length}
                          </span>
                        </h3>
                        <ul className="space-y-2.5 text-sm leading-relaxed text-black/70 dark:text-white/70">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex gap-2.5">
                              <span className="mt-0.5 inline-flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check aria-hidden className="size-3" strokeWidth={3} />
                              </span>
                              <span>
                                <Highlight text={item} query={normalizedQuery} locale={locale} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
