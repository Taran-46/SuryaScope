"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Vector3 } from "three";
import { RotateCcw } from "lucide-react";

export interface Annotation {
  id: string;
  position: [number, number, number];
  label: string;
  value: string;
}

export type ViewMode = "telemetry" | "satellite" | "cad";

export interface RoofSceneProps {
  className?: string;
  annotations?: Annotation[];
  initialMode?: ViewMode;
}

const ROOF_DIMENSIONS = {
  width: 11,
  depth: 9,
  height: 0.5,
  pitch: 0.35,
};

const PANEL_DIMENSIONS = {
  width: 1.5,
  height: 0.95,
  thickness: 0.04,
  gap: 0.12,
};

// 2D Architectural Blueprint Fallback (when WebGL is unavailable or fails)
function ArchitecturalBlueprintFallback() {
  return (
    <div className="relative w-full h-[380px] lg:h-[440px] bg-graphite-950 text-white flex flex-col items-center justify-between p-6 rounded-2xl overflow-hidden border border-graphite-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full flex items-center justify-between relative z-10 hairline-b border-graphite-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-solar-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-graphite-300">
            2D Architectural Solar Blueprint
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-solar-400">
          WebGL Fallback Active
        </span>
      </div>

      {/* Blueprint Visual Diagram */}
      <div className="relative z-10 w-full max-w-sm my-auto aspect-[4/3] flex flex-col items-center justify-center p-2">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bp-grid)" rx="8" />

          {/* Roof Contour */}
          <polygon points="60,200 200,80 340,200 200,260" fill="rgba(230,161,0,0.08)" stroke="#e6a100" strokeWidth="1.5" />
          <line x1="200" y1="80" x2="200" y2="260" stroke="#e6a100" strokeWidth="1" strokeDasharray="4 2" />

          {/* Solar Panel Array Grid */}
          <g fill="rgba(13,27,42,0.9)" stroke="#ffd14d" strokeWidth="1">
            <rect x="110" y="140" width="32" height="22" rx="1.5" />
            <rect x="147" y="140" width="32" height="22" rx="1.5" />
            <rect x="184" y="140" width="32" height="22" rx="1.5" />
            <rect x="221" y="140" width="32" height="22" rx="1.5" />
            <rect x="258" y="140" width="32" height="22" rx="1.5" />

            <rect x="110" y="167" width="32" height="22" rx="1.5" />
            <rect x="147" y="167" width="32" height="22" rx="1.5" />
            <rect x="184" y="167" width="32" height="22" rx="1.5" />
            <rect x="221" y="167" width="32" height="22" rx="1.5" />
            <rect x="258" y="167" width="32" height="22" rx="1.5" />

            <rect x="128.5" y="194" width="32" height="22" rx="1.5" />
            <rect x="165.5" y="194" width="32" height="22" rx="1.5" />
            <rect x="202.5" y="194" width="32" height="22" rx="1.5" />
            <rect x="239.5" y="194" width="32" height="22" rx="1.5" />
          </g>

          <circle cx="340" cy="40" r="12" fill="#ffd14d" opacity="0.8" />
        </svg>
      </div>

      <div className="w-full flex items-center justify-between relative z-10 text-[11px] font-mono text-graphite-400">
        <span>South-Facing 24° Pitch</span>
        <span className="text-emerald-400">14 Solar Panels (4.8 kW)</span>
      </div>
    </div>
  );
}

// React Error Boundary Wrapper
class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("WebGL Scene notice (using 2D vector fallback):", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 3D House Model with Clean Architectural Shading
function ArchitecturalHouse({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Gentle parallax breathing motion when hovering
      const targetRotationY = mousePos.current.x * 0.15;
      const targetRotationX = mousePos.current.y * 0.08;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.04);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Foundation Base */}
      <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOF_DIMENSIONS.width + 1.2, 0.8, ROOF_DIMENSIONS.depth + 1.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Main Structure / Walls */}
      <mesh position={[0, 1.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOF_DIMENSIONS.width, 2.8, ROOF_DIMENSIONS.depth]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Eaves */}
      <mesh position={[0, 2.85, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOF_DIMENSIONS.width + 0.4, 0.15, ROOF_DIMENSIONS.depth + 0.4]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* South Pitch (Main Solar Facing Roof) */}
      <mesh
        position={[0, 3.5, -ROOF_DIMENSIONS.depth / 4]}
        rotation={[-Math.PI / 6, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[ROOF_DIMENSIONS.width + 0.2, ROOF_DIMENSIONS.depth / 2 + 0.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* North Pitch */}
      <mesh
        position={[0, 3.5, ROOF_DIMENSIONS.depth / 4]}
        rotation={[Math.PI / 6, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[ROOF_DIMENSIONS.width + 0.2, ROOF_DIMENSIONS.depth / 2 + 0.6]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Ridge Cap */}
      <mesh position={[0, 4.15, 0]} castShadow>
        <boxGeometry args={[ROOF_DIMENSIONS.width + 0.25, 0.1, 0.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Solar Array Grid */}
      <SolarArrayGrid />

      {/* Modern Skylight Glass Window */}
      <mesh position={[3.4, 3.8, 0.8]} rotation={[Math.PI / 6, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.08, 1.5]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.8}
          transmission={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

// Solar Panel Array Grid (14 High-Efficiency Monocrystalline Panels)
function SolarArrayGrid() {
  const cols = 5;
  const rows = 3;
  const startX = -ROOF_DIMENSIONS.width / 2 + 1.4;
  const startZ = -ROOF_DIMENSIONS.depth / 2 + 1.1;

  const panels = React.useMemo(() => {
    const list = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip corner to show realistic rooftop setback / obstruction buffer
        if (r === 0 && c === 0) continue;
        const x = startX + c * (PANEL_DIMENSIONS.width + PANEL_DIMENSIONS.gap);
        const z = startZ + r * (PANEL_DIMENSIONS.height + PANEL_DIMENSIONS.gap);
        const pitchAngle = -Math.PI / 6;
        const y = 3.65 + r * (PANEL_DIMENSIONS.height + PANEL_DIMENSIONS.gap) * Math.sin(-pitchAngle);
        list.push({ id: `panel-${r}-${c}`, position: [x, y, z] as [number, number, number] });
      }
    }
    return list;
  }, []);

  return (
    <group>
      {panels.map((p) => (
        <InteractiveSolarPanel key={p.id} position={p.position} rotation={[-Math.PI / 6, 0, 0]} />
      ))}
    </group>
  );
}

// Individual Solar Panel with Hover Highlight
function InteractiveSolarPanel({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <group position={position} rotation={rotation}>
      {/* Aluminum Mounting Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[PANEL_DIMENSIONS.width, PANEL_DIMENSIONS.thickness, PANEL_DIMENSIONS.height]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Photovoltaic Monocrystalline Surface */}
      <mesh
        position={[0, PANEL_DIMENSIONS.thickness / 2 + 0.002, 0]}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[PANEL_DIMENSIONS.width - 0.06, 0.006, PANEL_DIMENSIONS.height - 0.06]} />
        <meshPhysicalMaterial
          color={hovered ? "#f59e0b" : "#0f2744"}
          emissive={hovered ? "#f59e0b" : "#000000"}
          emissiveIntensity={hovered ? 0.45 : 0}
          roughness={0.12}
          metalness={0.85}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.95}
        />
      </mesh>
    </group>
  );
}

// Clean Architectural Sunlight & Ambient Lighting
function SolarLighting() {
  return (
    <>
      {/* Primary Sunlight (South-West Azimuth) */}
      <directionalLight
        position={[18, 30, 16]}
        intensity={2.6}
        color="#fffbf0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0001}
      />
      {/* Soft Ambient Skylight */}
      <ambientLight color="#f8fafc" intensity={1.1} />
      {/* Fill Light for Contrast */}
      <hemisphereLight args={["#ffffff", "#334155", 0.6]} />
    </>
  );
}

export function RoofScene({ className }: RoofSceneProps) {
  const [webglAvailable, setWebglAvailable] = React.useState<boolean | null>(null);
  const mousePos = React.useRef({ x: 0, y: 0 });

  // Detect genuine WebGL capability
  React.useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglAvailable(false);
        return;
      }
      const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (typeof renderer === "string" && (renderer.includes("SwiftShader") || renderer.includes("llvmpipe"))) {
          setWebglAvailable(false);
          return;
        }
      }
      setWebglAvailable(true);
    } catch {
      setWebglAvailable(false);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePos.current = { x, y };
  };

  if (webglAvailable === false) {
    return <ArchitecturalBlueprintFallback />;
  }

  return (
    <WebGLErrorBoundary fallback={<ArchitecturalBlueprintFallback />}>
      <div
        className={`relative w-full h-[380px] lg:h-[430px] cursor-grab active:cursor-grabbing bg-gradient-to-b from-[#0b1329] via-[#0f172a] to-[#0b1329] select-none ${className}`}
        onMouseMove={handleMouseMove}
      >
        {/* Subtle Architectural Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

        {/* Clean Interactive Hint Badge */}
        <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[11px] font-mono shadow-md">
          <RotateCcw className="w-3 h-3 text-solar-400 animate-spin-slow" />
          <span>Drag to rotate 3D view</span>
        </div>

        {/* Subtle Orientation Compass Indicator */}
        <div className="absolute bottom-3.5 left-3.5 z-10 pointer-events-none flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-white text-[11px] font-mono shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300">Azimuth: 180° (True South)</span>
        </div>

        {/* 3D Canvas */}
        <Canvas
          camera={{
            position: [15, 12, 15],
            fov: 34,
          }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ outline: "none" }}
        >
          <SolarLighting />
          <ArchitecturalHouse mousePos={mousePos} />
          <ContactShadows position={[0, -0.4, 0]} opacity={0.5} scale={26} blur={2.2} far={9} />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={12}
            maxDistance={32}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI / 2 - 0.08}
            autoRotate={false}
          />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}