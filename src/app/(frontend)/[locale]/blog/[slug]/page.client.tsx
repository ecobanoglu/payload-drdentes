'use client'
import { useHeaderTheme } from '@/lib/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  // Başlık bandı açık zeminli: header en üstteyken de koyu yazılı (açık tema)
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])
  return <React.Fragment />
}

export default PageClient
