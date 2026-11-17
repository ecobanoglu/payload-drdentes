'use client'
import type { CardSet } from '@/payload-types'
import { type RowLabelProps, useRowLabel } from '@payloadcms/ui'

/** Admin panelinde kart satırlarının başlığı: "2. Ücretsiz muayene" (başlık yoksa "Kart 2") */
export const CardRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<NonNullable<CardSet['cards']>[number]>()
  const index = rowNumber !== undefined ? rowNumber + 1 : ''

  return <div>{data?.title ? `${index}. ${data.title}` : `Kart ${index}`}</div>
}
