import { getTranslations } from 'next-intl/server'
import React from 'react'

import type { FeatureDetailBlock as FeatureDetailBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { getDocumentPath } from '@/lib/utilities/pagePath'
import { FeatureSidebar, type FeatureSidebarItem } from './FeatureSidebar.client'

/**
 * "Özellik sayfası" bloğunun görünümü.
 *
 * - Geniş ekranda (lg) 4 sütunlu ızgara: sol 3 sütunda içerik görseli (üstte, çerçevesiz ve kendi boyutunda) ve
 *   açıklama metni; sağ 1 sütunda diğer özelliklerin listesi (kaydırırken üstte sabit kalır).
 * - Dar ekranda alt alta: önce içerik, sonra liste.
 * - Liste, seçilen kart grubundaki başlığı ve bağlantısı olan kartlardan oluşur; adresler
 *   dil öneksiz tam yoldur (ör. /ozellikler/hasta-yonetimi), dil öneki bağlantıda eklenir.
 */
export async function FeatureDetailBlockComponent({
  media,
  body,
  sidebarHeading,
  sidebarCardSet,
}: FeatureDetailBlockProps) {
  const t = await getTranslations('FeatureDetail')

  // Kart grubundan yan liste öğeleri: yalnızca bağlantılı ve bu dilde başlığı olan kartlar
  const items: FeatureSidebarItem[] =
    sidebarCardSet && typeof sidebarCardSet === 'object'
      ? (sidebarCardSet.cards ?? []).flatMap((card, index) => {
          const link = card.enableLink ? card.link : null
          if (!card.title || !link) return []
          const href =
            link.type === 'reference' && typeof link.reference?.value === 'object'
              ? getDocumentPath(link.reference.relationTo, link.reference.value)
              : link.url
          return href ? [{ id: card.id ?? String(index), title: card.title, href }] : []
        })
      : []

  const image = media && typeof media === 'object' ? media : null

  return (
    <section className="container">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-12">
        {/* Sol 3/4: içerik görseli + metin */}
        <div className="min-w-0 lg:col-span-3">
          {image && (
            // Görsel çerçevesiz ve kendi boyutunda (büyütülmez, yalnızca sığmazsa küçülür)
            <div className="mb-10">
              <Media
                resource={image}
                pictureClassName="block"
                imgClassName="mx-auto block h-auto w-auto max-w-full"
                // Görsel kendi genişliğinde gösterildiği için tarayıcı o genişliğe uygun dosyayı seçer
                size={image.width ? `(min-width: 768px) ${image.width}px, 100vw` : '100vw'}
              />
            </div>
          )}
          {body && (
            <RichText
              data={body}
              enableGutter={false}
              className="max-w-none text-muted-foreground prose-headings:text-foreground"
            />
          )}
        </div>

        {/* Sağ 1/4: diğer özellikler */}
        {items.length > 0 && (
          <aside className="lg:col-span-1">
            <FeatureSidebar heading={sidebarHeading || t('otherFeatures')} items={items} />
          </aside>
        )}
      </div>
    </section>
  )
}
