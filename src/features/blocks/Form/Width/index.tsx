import * as React from 'react'

/**
 * Form alanı kapsayıcısı. Genişlik artık üst düzende (Form Component, flex-wrap) uygulanır;
 * burada ayrıca sınırlanırsa alan iki kez daralırdı. `width` prop'u uyumluluk için korunur.
 */
export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className }) => {
  return <div className={className}>{children}</div>
}
