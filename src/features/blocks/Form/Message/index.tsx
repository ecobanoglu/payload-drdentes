import RichText from '@/components/RichText'
import React from 'react'

import { Width } from '../Width'
import { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

/**
 * Formdaki bilgi metni ("Mesaj" alanı; ör. "Kişisel Verilerin İşlenmesine İlişkin Aydınlatma'yı
 * okumak için tıklayın."). Alanlar arasında küçük ve ikincil renkte gösterilir; içindeki
 * bağlantılar altı çizili ve üzerine gelince ana renkte.
 */
export const Message: React.FC<{ message: DefaultTypedEditorState }> = ({ message }) => {
  return (
    <Width width="100">
      {message && (
        <RichText
          data={message}
          enableGutter={false}
          enableProse={false}
          className="text-sm leading-relaxed text-black/70 dark:text-white/70 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-primary/50 [&_a]:underline-offset-2 [&_a:hover]:text-primary [&_p+p]:mt-2"
        />
      )}
    </Width>
  )
}
