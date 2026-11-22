import React from 'react'

import { toGraph, type JsonLdNode } from '@/lib/utilities/structuredData'

/**
 * Yapılandırılmış veriyi (JSON-LD) sayfaya ekler. Birden fazla şema tek `@graph` içinde basılır.
 * İçerik panelden gelebildiği için `<` kaçışlanır (script içine HTML enjeksiyonu önlenir).
 */
export function JsonLd({ nodes }: { nodes: JsonLdNode[] }) {
  if (nodes.length === 0) return null
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(toGraph(nodes)).replace(/</g, '\\u003c') }}
    />
  )
}
