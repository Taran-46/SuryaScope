"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows, Environment } from "@react-three/drei";
import { Vector3, Clock } from "three";
import { Activity, Compass, Sun, Zap, Info, Layers, CheckCircle2 } from "lucide-react";

interface RoofSceneProps {
  className?: string;
  annotations?: Annotation[];
}

interface Annotation {
  id: string;
  position: [number, number, number];
  label: string;
  value: string;
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

// Target light vector
const SUN_POSITION = new Vector3(25, 45, 20);

// Architectural 2D Blueprint Fallback (when WebGL is unavailable or fails)
function ArchitecturalBlueprintFallback() {
  return (
    <div className="relative w-full h-full min-h-[480px] bg-graphite-950 text-white flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl overflow-hidden border border-graphite-800">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full flex items-center justify-between relative z-10 hairline-b border-graphite-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-solar-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-graphite-300">
            2D Architectural Solar Blueprint
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-graphite-900 border border-graphite-800 text-solar-400">
          WebGL Fallback Active
        </span>
      </div>

      {/* Blueprint Visual Diagram */}
      <div className="relative z-10 w-full max-w-md my-auto aspect-[4/3] flex flex-col items-center justify-center p-4">
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

          {/* Sun Ray Vectors */}
          <line x1="330" y1="40" x2="250" y2="120" stroke="rgba(255,209,77,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="340" cy="30" r="10" fill="#ffd14d" opacity="0.8" />
        </svg>

        {/* Floating Callout Overlay Cards */}
        <div className="absolute top-2 left-2 bg-graphite-900/90 border border-solar-500/40 px-3 py-1.5 rounded-lg shadow-lg text-left">
          <span className="block text-[9px] font-mono text-graphite-400 uppercase">Usable Area</span>
          <span className="text-xs font-bold text-solar-400">61.7 m²</span>
        </div>

        <div className="absolute top-2 right-2 bg-graphite-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-lg text-right">
          <span className="block text-[9px] font-mono text-graphite-400 uppercase">Solar Exposure</span>
          <span className="text-xs font-bold text-emerald-400">High (94%)</span>
        </div>

        <div className="absolute bottom-2 left-2 bg-graphite-900/90 border border-graphite-700 px-3 py-1.5 rounded-lg shadow-lg text-left">
          <span className="block text-[9px] font-mono text-graphite-400 uppercase">Orientation</span>
          <span className="text-xs font-bold text-white">South-Facing 24°</span>
        </div>

        <div className="absolute bottom-2 right-2 bg-graphite-900/90 border border-solar-500/40 px-3 py-1.5 rounded-lg shadow-lg text-right">
          <span className="block text-[9px] font-mono text-graphite-400 uppercase">Potential</span>
          <span className="text-xs font-bold text-solar-400">4.8 kW System</span>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="w-full flex items-center justify-between relative z-10 text-[11px] font-mono text-graphite-400">
        <span>Cadastral Mesh Loaded</span>
        <span className="text-emerald-400">Pre-Feasibility Audit Verified</span>
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
    console.warn("WebGL Scene render notice (switching to 2D vector fallback):", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 3D House Model
function ArchitecturalHouse({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Subtle pointer parallax tilt (NO continuous full spinning)
      const targetRotationY = mousePos.current.x * 0.25;
      const targetRotationX = mousePos.current.y * 0.12;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Foundation Base */}
      <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOF_DIMENSIONS.width + 1.2, 0.8, ROOF_DIMENSIONS.depth + 1.2]} />
        <meshStandardMaterial color="#262622" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Main Structure / Walls */}
      <mesh position={[0, 1.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOF_DIMENSIONS.width, 2.8, ROOF_DIMENSIONS.depth]} />
        <meshStandardMaterial color="#f4f4f2" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Eaves */}
      <mesh position={[0, 2.85, 0]} receiveShadow castShadow>
        <boxGeometry args={[ROOF_DIMENSIONS.width + 0.4, 0.15, ROOF_DIMENSIONS.depth + 0.4]} />
        <meshStandardMaterial color="#40403b" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* South Pitch (Main Solar Facing Roof) */}
      <mesh
        position={[0, 3.5, -ROOF_DIMENSIONS.depth / 4]}
        rotation={[-Math.PI / 6, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[ROOF_DIMENSIONS.width + 0.2, ROOF_DIMENSIONS.depth / 2 + 0.6]} />
        <meshStandardMaterial color="#2b2b27" roughness={0.4} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* North Pitch */}
      <mesh
        position={[0, 3.5, ROOF_DIMENSIONS.depth / 4]}
        rotation={[Math.PI / 6, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[ROOF_DIMENSIONS.width + 0.2, ROOF_DIMENSIONS.depth / 2 + 0.6]} />
        <meshStandardMaterial color="#353530" roughness={0.5} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Ridge Cap */}
      <mesh position={[0, 4.15, 0]}>
        <boxGeometry args={[ROOF_DIMENSIONS.width + 0.25, 0.1, 0.2]} />
        <meshStandardMaterial color="#171715" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Solar Array Grid */}
      <SolarArrayGrid />

      {/* Skylight Accent */}
      <mesh position={[3.2, 3.8, 0.8]} rotation={[Math.PI / 6, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.1, 1.4]} />
        <meshPhysicalMaterial
          color="#0f2b48"
          roughness={0.1}
          metalness={0.9}
          transmission={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

// Solar Panel Array Grid
function SolarArrayGrid() {
  const cols = 5;
  const rows = 3;
  const startX = -ROOF_DIMENSIONS.width / 2 + 1.4;
  const startZ = -ROOF_DIMENSIONS.depth / 2 + 1.1;

  const panels = React.useMemo(() => {
    const list = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
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
      <mesh castShadow receiveShadow>
        <boxGeometry args={[PANEL_DIMENSIONS.width, PANEL_DIMENSIONS.thickness, PANEL_DIMENSIONS.height]} />
        <meshStandardMaterial color="#52524c" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh
        position={[0, PANEL_DIMENSIONS.thickness / 2 + 0.002, 0]}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[PANEL_DIMENSIONS.width - 0.06, 0.005, PANEL_DIMENSIONS.height - 0.06]} />
        <meshPhysicalMaterial
          color={hovered ? "#e6a100" : "#0d1b2a"}
          emissive={hovered ? "#e6a100" : "#000000"}
          emissiveIntensity={hovered ? 0.35 : 0}
          roughness={0.15}
          metalness={0.85}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>
    </group>
  );
}

// Floating Data Labels (3D HTML overlay)
function FloatingDataLabels({ annotations }: { annotations: Annotation[] }) {
  return (
    <group>
      {annotations.map((ann) => (
        <Html
          key={ann.id}
          position={ann.position}
          center
          distanceFactor={7}
          zIndexRange={[100, 0]}
        >
          <div className="group cursor-pointer select-none transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-graphite-200/80 rounded-lg shadow-lg hover:shadow-xl hover:border-solar-500/50 transition-all">
              <div className="w-2 h-2 rounded-full bg-solar-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-graphite-500 leading-tight">
                  {ann.label}
                </span>
                <span className="text-xs font-bold text-graphite-950 font-sans leading-tight">
                  {ann.value}
                </span>
              </div>
            </div>
          </div>
        </Html>
      ))}
    </group>
  );
}

// Lighting setup
function SolarEnvironment({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
  const lightRef = React.useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.x = 25 + mousePos.current.x * 10;
      lightRef.current.position.z = 20 + mousePos.current.y * 10;
    }
  });

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={[25, 45, 20]}
        intensity={2.8}
        color="#fff9ea"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />
      <ambientLight color="#ffffff" intensity={0.65} />
      <hemisphereLight color="#fff9ea" groundColor="#353530" intensity={0.6} />
      <Environment preset="city" background={false} />
    </>
  );
}

export function RoofScene({ className, annotations }: RoofSceneProps) {
  const [webglAvailable, setWebglAvailable] = React.useState<boolean | null>(null);
  const mousePos = React.useRef({ x: 0, y: 0 });

  const defaultAnnotations: Annotation[] = [
    { id: "area", position: [-3.8, 4.2, -1.8], label: "Usable Roof Area", value: "61.7 m²" },
    { id: "exposure", position: [3.8, 4.5, -1.2], label: "Solar Exposure", value: "High (94%)" },
    { id: "capacity", position: [-1.2, 4.8, 2.2], label: "Est. Potential", value: "4.8 kW" },
    { id: "orientation", position: [3.5, 3.2, 2.5], label: "Roof Orientation", value: "South-Facing 24°" },
  ];

  const activeAnnotations = annotations || defaultAnnotations;

  // Detect genuine WebGL capability
  React.useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglAvailable(false);
        return;
      }
      // Check if WebGL context creation actually succeeds without error
      const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // SwiftShader / Software Renderer in headless browser triggers 2D fallback cleanly
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
        className={`relative w-full h-full min-h-[480px] lg:min-h-[560px] cursor-grab active:cursor-grabbing ${className}`}
        onMouseMove={handleMouseMove}
      >
        <Canvas
          camera={{ position: [16, 14, 16], fov: 32 }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ outline: "none" }}
        >
          <SolarEnvironment mousePos={mousePos} />
          <ArchitecturalHouse mousePos={mousePos} />
          <ContactShadows position={[0, -0.4, 0]} opacity={0.3} scale={24} blur={1.8} far={8} />
          <FloatingDataLabels annotations={activeAnnotations} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minZoom={0.7}
            maxZoom={2.2}
            minPolarAngle={0.4}
            maxPolarAngle={Math.PI / 2 - 0.1}
            autoRotate={false}
          />
        </Canvas>

        {/* Interactive Helper Overlay */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-graphite-200 text-[11px] font-mono text-graphite-600 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-solar-500 animate-pulse" />
          <span>Interactive 3D Rooftop • Move cursor to adjust light vector</span>
        </div>
      </div>
    </WebGLErrorBoundary>
  );
}