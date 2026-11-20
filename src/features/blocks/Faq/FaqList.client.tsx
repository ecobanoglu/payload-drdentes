'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import React from 'react'

/** Listede gösterilmeye hazır soru (cevap sunucuda RichText olarak çizilmiş gelir) */
export type FaqListItem = {
  id: string
  question: string
  answer?: React.ReactNode
}

/**
 * SSS soru listesi (1centre "Have questions? Find answers." düzeni).
 *
 * - Kategori sekmesi yok: tüm sorular tek listede, üstten/alttan ince çizgilerle ayrılır.
 * - Aynı anda tek soru açık kalır; ilk soru açık başlar (yeniden tıklanınca kapanır).
 * - Sağdaki yuvarlak "+" düğmesi açıkken marka mavisine döner ve 45° dönerek "×" olur.
 * - Açık olmayan sorular hafif soluk; üzerine gelince tam renk (açık soru her zaman tam renk).
 * - Klavye ve ekran okuyucu desteği Radix Accordion'dan gelir.
 */
export function FaqList({ items }: { items: FaqListItem[] }) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue={items[0]?.id}
      className="border-t border-black/[0.08] dark:border-white/10"
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          data-reveal-item
          className="border-b border-black/[0.08] dark:border-white/10"
        >
          <AccordionPrimitive.Header asChild>
            <h3>
              <AccordionPrimitive.Trigger className="group flex w-full items-center gap-4 py-5 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:gap-6 sm:py-6">
                {/* Soru: kapalıyken %80 opak, açıkken / üzerine gelince tam renk */}
                <span className="min-w-0 flex-1 text-base font-medium leading-snug tracking-[-0.01em] text-foreground/80 transition-colors group-hover:text-foreground group-data-[state=open]:text-foreground sm:text-[1.0625rem]">
                  {item.question}
                </span>
                {/* Aç/kapa düğmesi: açıkken marka mavisi zemin + "×" */}
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-black/[0.05] text-foreground transition-colors duration-300 group-hover:bg-black/[0.09] group-data-[state=open]:bg-brand group-data-[state=open]:text-white dark:bg-white/10 dark:group-hover:bg-white/15"
                >
                  <Plus className="size-3.5 transition-transform duration-300 group-data-[state=open]:rotate-45" />
                </span>
              </AccordionPrimitive.Trigger>
            </h3>
          </AccordionPrimitive.Header>
          {item.answer && (
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              {/* Cevap: okunabilir satır uzunluğu (≈72 karakter), düğmenin altına taşmaz */}
              <div className="max-w-[72ch] pb-6 pe-2 text-[0.9375rem] leading-relaxed text-black/60 sm:pb-7 sm:pe-12 dark:text-white/60">
                {item.answer}
              </div>
            </AccordionPrimitive.Content>
          )}
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}
