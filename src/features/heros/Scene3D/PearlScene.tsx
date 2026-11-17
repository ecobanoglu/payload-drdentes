'use client'

import {
  Environment,
  Float,
  Lightformer,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Sparkles,
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React, { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import type { ScenePalette } from './palettes'

export type SceneQuality = 'high' | 'low'

type Props = {
  palette: ScenePalette
  /** high: ışık kıran cam malzeme; low: hafif malzeme (mobil / zayıf GPU) */
  quality: SceneQuality
  /** Hero'nun kaydırılma oranı (0 = en üst, 1 = hero tamamen geçildi) */
  scrollProgress: RefObject<number>
  /** RTL dillerde form metnin karşı tarafına (sola) yerleşir */
  direction: 'ltr' | 'rtl'
  /** Sürekli animasyon (hareketi azalt açıksa false) */
  animate: boolean
}

/** Ana formun etrafında süzülen küçük kürelerin konumları ve boyutları */
const SATELLITES: { position: [number, number, number]; scale: number; speed: number }[] = [
  { position: [1.55, 0.9, 0.4], scale: 0.16, speed: 1.4 },
  { position: [-1.35, -0.8, 0.6], scale: 0.11, speed: 1.8 },
  { position: [1.1, -1.25, -0.4], scale: 0.08, speed: 2.2 },
]

/**
 * "İnci" sahnesi: ışığı kıran organik bir form, etrafında süzülen küreler ve ışık parçacıkları.
 *
 * Etkileşim:
 * - Fare/parmak hareketi formu hafifçe döndürür (paralaks).
 * - Sayfa kaydırıldıkça form yukarı kayar ve küçülür.
 * Tüm hareketler `damp` ile yumuşatılır; kare hızından bağımsızdır.
 */
export function PearlScene({ palette, quality, scrollProgress, direction, animate }: Props) {
  const group = useRef<THREE.Group>(null)
  const { viewport } = useThree()

  // Yerleşim sahnenin görünen alanına (viewport, sahne birimi) göre hesaplanır:
  // - Yatay ekran: form metnin karşı tarafında (LTR'de sağ, RTL'de sol), dikeyde ortada
  // - Dikey ekran (mobil): form üst yarıda ve ekran genişliğinin ~%70'i kadar; metin altta kalır
  const isLandscape = viewport.aspect > 1
  const side = direction === 'rtl' ? -1 : 1
  const baseX = isLandscape ? side * viewport.width * 0.24 : 0
  const baseY = isLandscape ? 0 : viewport.height * 0.2
  // Formun çapı 2.5 birim (yarıçap 1.25)
  const baseScale = isLandscape
    ? Math.min(1, viewport.height / 3.6)
    : (viewport.width * 0.7) / 2.5

  // Cam malzemenin arkasında göreceği renk (saydam canvas'ta siyah görünmesin diye)
  const transmissionBackground = useMemo(() => new THREE.Color(palette.base), [palette.base])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    const progress = scrollProgress.current ?? 0
    const time = animate ? state.clock.elapsedTime : 0

    // Paralaks + kaydırmaya bağlı eğilme + yavaş kendi ekseninde dönüş
    const targetRotX = state.pointer.y * 0.25 + progress * 0.9
    const targetRotY = state.pointer.x * 0.45 + time * 0.12
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetRotX, 3, delta)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 3, delta)

    // Kaydırdıkça yukarı kayma ve küçülme
    g.position.x = THREE.MathUtils.damp(g.position.x, baseX, 4, delta)
    g.position.y = THREE.MathUtils.damp(g.position.y, baseY + progress * 1.6, 4, delta)
    const targetScale = baseScale * (1 - progress * 0.3)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, targetScale, 4, delta))
  })

  return (
    <>
      {/* Ortam ışığı sahnede üretilir (HDR dosyası indirilmez); bir kez hesaplanır */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color={palette.light} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color={palette.accent} position={[-5, 0, 2]} scale={[2, 6, 1]} />
        <Lightformer form="ring" intensity={2} color={palette.light} position={[4, -1, 4]} scale={2} />
      </Environment>
      <ambientLight intensity={0.25} />

      <group ref={group}>
        <Float speed={animate ? 1.2 : 0} rotationIntensity={0.3} floatIntensity={0.6}>
          <mesh>
            <icosahedronGeometry args={[1.25, quality === 'high' ? 24 : 12]} />
            {quality === 'high' ? (
              <MeshTransmissionMaterial
                color={palette.primary}
                samples={6}
                resolution={512}
                thickness={1.2}
                roughness={0.08}
                ior={1.45}
                chromaticAberration={0.06}
                anisotropy={0.2}
                distortion={0.35}
                distortionScale={0.4}
                temporalDistortion={animate ? 0.12 : 0}
                background={transmissionBackground}
                backside
              />
            ) : (
              <MeshDistortMaterial
                color={palette.primary}
                roughness={0.15}
                metalness={0.1}
                distort={0.28}
                speed={animate ? 1.5 : 0}
              />
            )}
          </mesh>
        </Float>

        {SATELLITES.map((satellite, index) => (
          <Float key={index} speed={animate ? satellite.speed : 0} floatIntensity={1.2}>
            <mesh position={satellite.position} scale={satellite.scale}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color={palette.accent} roughness={0.2} metalness={0.6} />
            </mesh>
          </Float>
        ))}
      </group>

      <Sparkles
        count={quality === 'high' ? 60 : 25}
        scale={[9, 5, 3]}
        size={2.2}
        speed={animate ? 0.35 : 0}
        color={palette.accent}
        opacity={0.6}
      />
    </>
  )
}
