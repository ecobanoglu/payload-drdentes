import { ArrowRight, ChevronRight } from 'lucide-react'
import React from 'react'

import type { Media as MediaType, Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { BLOG_PATH } from '@/lib/utilities/constants'
import { getDocumentPath } from '@/lib/utilities/pagePath'

/** Yan listede gösterilen yazı: başlık, adres, görsel ve yayın tarihi */
export type RelatedPostItem = Pick<
  Post,
  'id' | 'slug' | 'title' | 'publishedAt' | 'heroImage' | 'meta'
>

/**
 * Yazı detayının sağındaki "İlişkili Yazılar" listesi.
 *
 * - Her satırda küçük kapak görseli, başlık (en çok 2 satır) ve yayın tarihi.
 * - Kartın altında blog listeleme sayfasına giden "Tüm Yazılar" butonu bulunur.
 * - Dar ekranda içeriğin altına iner.
 */
export function RelatedPostsSidebar({
  heading,
  allPostsLabel,
  locale,
  posts,
}: {
  heading: string
  allPostsLabel: string
  locale: string
  posts: RelatedPostItem[]
}) {
  // Tarihler dile göre kısa biçimde (ör. "21 Kas 2026")
  const formatDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label={heading} className="rounded-2xl border border-border bg-background p-4">
        <p className="px-2 pt-1 pb-3 text-xs font-semibold tracking-wider text-black/50 uppercase dark:text-white/50">
          {heading}
        </p>
        <ul className="space-y-1">
          {posts.map((post) => {
            const href = getDocumentPath('posts', post) ?? '/'
            // Liste görseli: önce kapak görseli, yoksa SEO görseli
            const image = [post.heroImage, post.meta?.image].find(
              (item): item is MediaType => Boolean(item) && typeof item === 'object',
            )

            return (
              <li key={post.id}>
                <Link
                  href={href}
                  className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {image && (
                      <Media fill resource={image} size="80px" imgClassName="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-snug font-medium text-black/80 group-hover:text-primary dark:text-white/80">
                      {post.title}
                    </p>
                    {post.publishedAt && (
                      <time
                        dateTime={post.publishedAt}
                        className="mt-1 block text-xs text-muted-foreground"
                      >
                        {formatDate.format(new Date(post.publishedAt))}
                      </time>
                    )}
                  </div>
                  <ChevronRight
                    aria-hidden
                    className="size-4 shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100 rtl:rotate-180"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      {/* Blog listeleme sayfasına dönüş (dil öneki Link'te eklenir) */}
      <Button asChild variant="outline" size="lg" className="group w-full rounded-xl">
        <Link href={BLOG_PATH}>
          {allPostsLabel}
          <ArrowRight
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
          />
        </Link>
      </Button>
    </div>
  )
}

/** Yazının etiketleri: içeriğin altında yuvarlak "rozet"ler halinde */
export function PostTags({ heading, tags }: { heading: string; tags: string[] }) {
  return (
    <div className="mt-12 border-t border-border pt-6">
      <p className="mb-3 text-xs font-semibold tracking-wider text-black/50 uppercase dark:text-white/50">
        {heading}
      </p>
      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-black/70 dark:text-white/70"
          >
            #{tag}
          </li>
        ))}
      </ul>
    </div>
  )
}
