import React from 'react'

import type { Page } from '@/payload-types'

import { HighImpactHero } from '@/features/heros/HighImpact'
import { LowImpactHero } from '@/features/heros/LowImpact'
import { MediumImpactHero } from '@/features/heros/MediumImpact'
import { Scene3DHero } from '@/features/heros/Scene3D'
import { ShowcaseHero } from '@/features/heros/Showcase'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
  scene3d: Scene3DHero,
  showcase: ShowcaseHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
