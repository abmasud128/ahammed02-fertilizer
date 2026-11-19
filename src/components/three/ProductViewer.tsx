'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

export type ProductType = 'bag' | 'bottle' | 'box';

interface ProductModelProps {
  productType: ProductType;
}

function ProductModel({ productType }: ProductModelProps) {
  if (productType === 'bottle') {
    return (
      <group position={[0, -0.2, 0]}>
        {/* Bottle Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.55, 1.8, 24]} />
          <meshStandardMaterial
            color="#15803d" // Forest green
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>
        {/* Bottle Neck */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.3, 24]} />
          <meshStandardMaterial color="#15803d" roughness={0.25} />
        </mesh>
        {/* Bottle Cap */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.18, 24]} />
          <meshStandardMaterial color="#fef08a" roughness={0.4} />
        </mesh>
        {/* Label wrap */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.51, 0.51, 0.9, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  if (productType === 'box') {
    return (
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial
          color="#166534"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    );
  }

  // Default: 'bag'
  return (
    <group position={[0, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.8, 0.55]} />
        <meshStandardMaterial
          color="#15803d" // Forest green
          roughness={0.45}
          metalness={0.1}
        />
      </mesh>
      {/* Front Label */}
      <mesh position={[0, 0.05, 0.28]}>
        <planeGeometry args={[1.0, 1.1]} />
        <meshStandardMaterial color="#fef9c3" roughness={0.6} />
      </mesh>
    </group>
  );
}

export interface ProductViewerProps {
  productType?: ProductType;
  className?: string;
}

export default function ProductViewer({
  productType = 'bag',
  className = '',
}: ProductViewerProps) {
  return (
    <div
      className={`relative w-[300px] h-[300px] rounded-2xl bg-gradient-to-b from-stone-100/60 to-emerald-50/40 dark:from-stone-900/40 dark:to-emerald-950/20 backdrop-blur-sm border border-emerald-500/10 shadow-inner overflow-hidden ${className}`}
    >
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
            Loading 3D preview...
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 5, 4]} intensity={1.2} />
          <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#86efac" />

          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <ProductModel productType={productType} />
          </Float>

          <OrbitControls
            autoRotate
            autoRotateSpeed={2}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={(2 * Math.PI) / 3}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
