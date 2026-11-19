'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ── 1. Realistic Procedural Fertilizer Bag ────────────────────
function FertilizerBag({ onHover }: { onHover: (hovered: boolean) => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 1.06 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
  });

  return (
    <Float speed={2.2} rotationIntensity={0.35} floatIntensity={0.6} position={[-1.7, 0.4, 0.3]}>
      <group
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
      >
        {/* Main Bag Body - Organic curved sack */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.35, 1.8, 0.45, 4, 4, 2]} />
          <meshStandardMaterial
            color="#14532d" // deep forest agritech green
            roughness={0.45}
            metalness={0.08}
          />
        </mesh>

        {/* Top Pleated Sealed Edge */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[1.4, 0.12, 0.2]} />
          <meshStandardMaterial color="#166534" roughness={0.6} />
        </mesh>

        {/* Stitching Line across top */}
        <mesh position={[0, 0.91, 0.12]}>
          <boxGeometry args={[1.36, 0.02, 0.02]} />
          <meshStandardMaterial color="#fef08a" roughness={0.3} />
        </mesh>

        {/* Central Quality Brand Badge / Label */}
        <mesh position={[0, 0.1, 0.235]}>
          <planeGeometry args={[1.05, 0.95]} />
          <meshStandardMaterial
            color="#fef9c3" // warm cream label
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>

        {/* NPK Green Ribbon on Label */}
        <mesh position={[0, 0.35, 0.24]}>
          <planeGeometry args={[0.95, 0.22]} />
          <meshStandardMaterial color="#15803d" roughness={0.4} />
        </mesh>

        {/* Golden Certification Seal */}
        <mesh position={[0.32, -0.15, 0.24]}>
          <circleGeometry args={[0.16, 24]} />
          <meshStandardMaterial
            color="#eab308"
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>

        {/* Bottom reinforced base */}
        <mesh position={[0, -0.92, 0]}>
          <boxGeometry args={[1.3, 0.08, 0.42]} />
          <meshStandardMaterial color="#0f3d21" roughness={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

// ── 2. Realistic Procedural Crop Protection Bottle ───────────
function PesticideBottle({ onHover }: { onHover: (hovered: boolean) => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 1.08 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
  });

  return (
    <Float speed={2.8} rotationIntensity={0.45} floatIntensity={0.7} position={[1.7, -0.3, 0.6]}>
      <group
        ref={meshRef}
        rotation={[0, -0.2, 0.08]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
      >
        {/* Main Bottle Cylindrical Flask */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.44, 1.45, 24]} />
          <meshStandardMaterial
            color="#0284c7" // vibrant agrochemical blue
            roughness={0.2}
            metalness={0.15}
          />
        </mesh>

        {/* Ergonomic Grip Indentations */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.12, 24]} />
          <meshStandardMaterial color="#0369a1" roughness={0.3} />
        </mesh>

        {/* Front Product Label */}
        <mesh position={[0, -0.05, 0.42]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.65, 0.85]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>

        {/* Safety Hazard Warning Diamond */}
        <mesh position={[0, -0.25, 0.43]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.18, 0.18]} />
          <meshStandardMaterial color="#f97316" roughness={0.2} />
        </mesh>

        {/* Bottle Shoulder / Neck Taper */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.18, 0.38, 0.28, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.15} />
        </mesh>

        {/* Neck Spout */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.16, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} />
        </mesh>

        {/* Child-Resistant Ribbed White Cap */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

// ── 3. Sprouting Plant & Soil Mound ───────────────────────────
function GrowingPlantMound() {
  const stemRef = useRef<THREE.Group>(null);
  const leaf1Ref = useRef<THREE.Mesh>(null);
  const leaf2Ref = useRef<THREE.Mesh>(null);
  const leaf3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Subtle organic wind oscillation
    if (stemRef.current) {
      stemRef.current.rotation.z = Math.sin(t * 1.5) * 0.04;
    }
    if (leaf1Ref.current) {
      leaf1Ref.current.rotation.z = -0.55 + Math.sin(t * 2.0) * 0.05;
    }
    if (leaf2Ref.current) {
      leaf2Ref.current.rotation.z = 0.55 + Math.cos(t * 1.8) * 0.05;
    }
    if (leaf3Ref.current) {
      leaf3Ref.current.rotation.x = Math.sin(t * 1.4) * 0.06;
    }
  });

  return (
    <group position={[0, -1.6, 0]}>
      {/* Nutrient-Rich Soil Base Mound */}
      <mesh receiveShadow>
        <sphereGeometry args={[1.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#382013" // rich Bengal alluvial soil
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* Soil Texture Clods / Organic Rings */}
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.5, 24]} />
        <meshStandardMaterial color="#2c180e" roughness={0.95} />
      </mesh>

      {/* Sprouting Crop Stem & Foliage */}
      <group ref={stemRef} position={[0, 1.55, 0]}>
        {/* Main Growing Stem */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.045, 0.08, 0.9, 12]} />
          <meshStandardMaterial color="#4ade80" roughness={0.3} metalness={0.05} />
        </mesh>

        {/* Leaf 1 - Right curved */}
        <mesh ref={leaf1Ref} position={[0.2, 0.5, 0]} rotation={[0, 0, -0.55]}>
          <coneGeometry args={[0.09, 0.65, 8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.35} />
        </mesh>

        {/* Leaf 2 - Left curved */}
        <mesh ref={leaf2Ref} position={[-0.2, 0.55, 0]} rotation={[0, 0, 0.55]}>
          <coneGeometry args={[0.08, 0.6, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.35} />
        </mesh>

        {/* Leaf 3 - Forward curved */}
        <mesh ref={leaf3Ref} position={[0, 0.7, 0.15]} rotation={[0.45, 0, 0]}>
          <coneGeometry args={[0.07, 0.55, 8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.35} />
        </mesh>

        {/* Apical Shoot / Bud with Golden Dewdrop */}
        <mesh position={[0, 0.92, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#eab308"
            emissiveIntensity={0.6}
            roughness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}

// ── 4. Instanced Pollen & Micro Dewdrop Particles ─────────────
function Particles({ count = 45 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const list: Array<{ position: [number, number, number]; scale: number; speed: number }> = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 9;
      const y = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6;
      const scale = 0.4 + Math.random() * 0.7;
      const speed = 0.4 + Math.random() * 0.6;
      list.push({ position: [x, y, z], scale, speed });
    }
    return list;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      const [x, y, z] = p.position;
      dummy.position.set(
        x + Math.sin(time * p.speed + i) * 0.25,
        y + Math.cos(time * p.speed * 0.8 + i) * 0.35,
        z + Math.sin(time * 0.5 + i) * 0.2
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial
        color="#fef08a" // golden harvest pollen glow
        emissive="#f59e0b"
        emissiveIntensity={0.8}
        roughness={0.2}
      />
    </instancedMesh>
  );
}

// ── 5. Main 3D Stage with Cinematic Lighting & Mouse Parallax ──
function SceneContent({ onHover }: { onHover: (hovered: boolean) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Mobile-first responsive scaling based on 3D viewport width
  const responsiveScale = Math.min(1.0, Math.max(0.68, viewport.width / 5.2));

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smooth subtle mouse parallax
    const targetY = state.pointer.x * 0.35;
    const targetX = -state.pointer.y * 0.2;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      0.06
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      0.06
    );
  });

  return (
    <group ref={groupRef} scale={responsiveScale}>
      {/* ── Cinematic 3-Point Agritech Lighting ── */}
      {/* 1. Warm Golden Sun Key Light */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={2.0}
        color="#fffbeb"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* 2. Soft Sky Ambient Fill */}
      <ambientLight intensity={0.7} color="#dcfce7" />

      {/* 3. Golden Harvest Rim Light from behind */}
      <directionalLight
        position={[-3, 4, -4]}
        intensity={1.4}
        color="#fef08a"
      />

      {/* 4. Soft Emerald Ground Bounce */}
      <pointLight position={[0, -1, 2]} intensity={0.8} color="#22c55e" distance={6} />

      {/* ── Soft Ground Contact Shadow ── */}
      <ContactShadows
        position={[0, -1.62, 0]}
        opacity={0.65}
        scale={8}
        blur={2}
        far={3}
        color="#052e16"
      />

      {/* ── 3D Interactive Objects ── */}
      <FertilizerBag onHover={onHover} />
      <PesticideBottle onHover={onHover} />
      <GrowingPlantMound />
      <Particles count={32} />
    </group>
  );
}

// ── High-Performance CSS Fallback for Low-End Mobile & Slow Connections ──
export function HeroSceneFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Radiant ambient glow */}
      <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-gradient-to-tr from-leaf/25 via-harvest/20 to-transparent blur-3xl pointer-events-none" />

      {/* Floating 3D Graphic Mockup */}
      <div className="relative z-10 flex flex-col items-center animate-float">
        {/* Fertilizer Bag & Crop Protection Visual */}
        <div className="relative w-48 sm:w-56 h-60 sm:h-68 rounded-3xl bg-gradient-to-b from-[#166534] via-[#14532d] to-[#0f3d21] p-4 shadow-2xl border-2 border-leaf/40 flex flex-col items-center justify-between">
          {/* Top Pleated Seal */}
          <div className="w-full h-4 rounded-t-lg bg-green-900 border-b border-harvest/50 flex items-center justify-center">
            <div className="w-3/4 h-0.5 bg-yellow-200/60" />
          </div>

          {/* Central Quality Badge */}
          <div className="w-full py-4 px-2 rounded-2xl bg-amber-50/95 text-forest text-center shadow-md">
            <span className="text-xs font-bold uppercase tracking-widest text-leaf block">NPK 19:19:19</span>
            <span className="text-base sm:text-lg font-extrabold block text-forest">AHAMMED</span>
            <span className="text-[10px] font-semibold text-gray-600 block">Premium Agri Nutrition</span>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-harvest text-forest text-[10px] font-black">
              ★ 100% GENUINE
            </div>
          </div>

          {/* Bottom Root Mound */}
          <div className="text-center text-xs text-white/80 font-bold flex items-center gap-1.5 pb-1">
            <span>🌱</span>
            <span>Bengal High Yield Formula</span>
          </div>
        </div>

        {/* Floating Granules & Leaf Sparkles */}
        <div className="absolute -top-4 -right-4 w-7 h-7 rounded-full bg-harvest/80 animate-ping opacity-40" />
        <div className="absolute top-1/2 -left-6 text-2xl animate-bounce">🌿</div>
        <div className="absolute -bottom-3 right-4 text-xl">🌾</div>
      </div>
    </div>
  );
}

// ── 6. Exported HeroScene Container with Optimization & Fallback ──
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isInView, setIsInView] = useState(true);
  const [isCursorPointer, setIsCursorPointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check device capability & connection
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    };

    const isLowConcurrency = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 3;
    const isSlowConnection =
      nav.connection?.effectiveType === '2g' ||
      nav.connection?.saveData === true;

    // Detect WebGL capability
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      hasWebGL = false;
    }

    if (!hasWebGL || isLowConcurrency || isSlowConnection) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // IntersectionObserver: Pause rendering when hero is off-screen
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  if (isSupported === false) {
    return <HeroSceneFallback />;
  }

  if (isSupported === null) {
    return <HeroSceneFallback />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${isCursorPointer ? 'cursor-pointer' : 'cursor-default'}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 42 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1.5, 1.5)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        frameloop={isInView ? 'always' : 'never'}
        className="w-full h-full"
      >
        <SceneContent onHover={setIsCursorPointer} />
      </Canvas>
    </div>
  );
}
