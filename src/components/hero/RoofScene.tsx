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

// Mode Selector Type
export type ViewMode = "telemetry" | "satellite" | "cad";

interface RoofSceneProps {
  className?: string;
  annotations?: Annotation[];
  initialMode?: ViewMode;
}

// Point Cloud Telemetry Particle System (matching Stitch Image 3)
function TelemetryPointCloud() {
  const pointsRef = React.useRef<THREE.Points>(null);

  const [positions, colors] = React.useMemo(() => {
    const count = 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorCyan = new THREE.Color("#00b4d8");
    const colorGold = new THREE.Color("#f59e0b");

    for (let i = 0; i < count; i++) {
      // House boundary & roof surface clustering
      const x = (Math.random() - 0.5) * 22;
      const y = Math.random() * 8 - 0.5;
      const z = (Math.random() - 0.5) * 20;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color variation: roof top is gold, surrounding is cyan
      const isRoofZone = Math.abs(x) < 6 && y > 2.5 && Math.abs(z) < 5;
      const c = isRoofZone ? colorGold : colorCyan;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Solar Zenith Beaming Light Rays (matching Stitch Image 3)
function SolarZenithRays() {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 14, -1]}>
      {/* Central Glowing Sun Sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {/* Outer Halo */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.25} />
      </mesh>

      {/* Downward Beaming Ray Vectors */}
      {[-4, -2, 0, 2, 4].map((offset, idx) => (
        <line key={idx}>
          <bufferGeometry
            attach="geometry"
            onUpdate={(geo) => {
              geo.setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(offset * 2.2, -10, (idx % 2 === 0 ? 1 : -1) * 3),
              ]);
            }}
          />
          <lineBasicMaterial attach="material" color="#f59e0b" opacity={0.6} transparent linewidth={2} />
        </line>
      ))}
    </group>
  );
}

// Cyan Wireframe Lot Mesh Ground (matching Stitch Image 2)
function SatelliteWireframeLot() {
  return (
    <group position={[0, -0.38, 0]}>
      {/* Cyan Triangulated Lot Mesh */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 22, 16, 14]} />
        <meshBasicMaterial color="#00b4d8" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Golden Elevation Irradiance Heat Contours over roof */}
      <mesh position={[0, 4.1, -0.5]} rotation={[-Math.PI / 2.3, 0, 0]}>
        <ringGeometry args={[1.5, 3.8, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 4.2, -0.5]} rotation={[-Math.PI / 2.3, 0, 0]}>
        <ringGeometry args={[0.5, 1.8, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function RoofScene({ className, annotations, initialMode = "telemetry" }: RoofSceneProps) {
  const [webglAvailable, setWebglAvailable] = React.useState<boolean | null>(null);
  const [mode, setMode] = React.useState<ViewMode>(initialMode);
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

  const isTelemetry = mode === "telemetry";
  const isSatellite = mode === "satellite";

  return (
    <WebGLErrorBoundary fallback={<ArchitecturalBlueprintFallback />}>
      <div
        className={`relative w-full h-full min-h-[480px] lg:min-h-[560px] cursor-grab active:cursor-grabbing transition-colors duration-500 ${
          isTelemetry ? "bg-[#070a14]" : isSatellite ? "bg-[#0b1329]" : "bg-white"
        } ${className}`}
        onMouseMove={handleMouseMove}
      >
        {/* Mode Selector HUD Tabs */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-graphite-950/85 backdrop-blur-md border border-graphite-800 text-xs font-mono shadow-xl">
          <button
            onClick={() => setMode("telemetry")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isTelemetry
                ? "bg-cyan-600 text-white font-bold shadow-xs"
                : "text-graphite-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-solar-400" />
            <span>3D Telemetry</span>
          </button>

          <button
            onClick={() => setMode("satellite")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isSatellite
                ? "bg-cyan-600 text-white font-bold shadow-xs"
                : "text-graphite-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Satellite Mesh</span>
          </button>

          <button
            onClick={() => setMode("cad")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              mode === "cad"
                ? "bg-cyan-600 text-white font-bold shadow-xs"
                : "text-graphite-400 hover:text-white"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-solar-400" />
            <span>CAD View</span>
          </button>
        </div>

        {/* HUD Telemetry Overlay Info (matching Stitch Image 3) */}
        {isTelemetry && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none text-right font-mono text-[11px] text-cyan-400 bg-graphite-950/80 backdrop-blur-md border border-cyan-500/30 p-3.5 rounded-xl shadow-2xl space-y-1">
            <div className="flex items-center justify-end gap-2 text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-solar-400 animate-pulse" />
              <span>ANNUAL SOLAR IRRADIANCE</span>
            </div>
            <div className="text-solar-400 font-bold text-xs">MAX: 2100 kWh/m²</div>
            <div className="text-cyan-300">MIN: 800 kWh/m²</div>
            <div className="text-[9px] text-graphite-400 pt-1 border-t border-graphite-800">
              TELEMETRY ACTIVE • CLIMATE SIMULATION V.4.2
            </div>
          </div>
        )}

        {/* Compass Rose Widget (matching Stitch Image 2) */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-3 bg-graphite-950/85 backdrop-blur-md border border-cyan-500/30 px-3.5 py-2 rounded-xl text-white font-mono text-xs shadow-xl">
          <div className="w-8 h-8 rounded-full border border-cyan-400/50 flex items-center justify-center relative">
            <span className="absolute -top-1 text-[9px] text-cyan-300 font-bold">N</span>
            <span className="absolute -bottom-1 text-[9px] text-graphite-400">S</span>
            <span className="absolute -left-1 text-[9px] text-graphite-400">W</span>
            <span className="absolute -right-1 text-[9px] text-graphite-400">E</span>
            <div className="w-0.5 h-4 bg-solar-500 rounded-full rotate-45 transform origin-center" />
          </div>
          <div>
            <span className="block text-[10px] text-cyan-400 font-bold uppercase">Compass Vector</span>
            <span className="text-[11px] text-graphite-300">135° South-East</span>
          </div>
        </div>

        <Canvas
          camera={{
            position: isSatellite ? [0, 22, 0.1] : [16, 14, 16],
            fov: isSatellite ? 38 : 32,
          }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ outline: "none" }}
        >
          <SolarEnvironment mousePos={mousePos} />
          <ArchitecturalHouse mousePos={mousePos} />

          {/* Mode Specific 3D Overlays */}
          {isTelemetry && (
            <>
              <TelemetryPointCloud />
              <SolarZenithRays />
            </>
          )}

          {(isSatellite || isTelemetry) && <SatelliteWireframeLot />}

          <ContactShadows position={[0, -0.4, 0]} opacity={0.4} scale={24} blur={1.8} far={8} />
          <FloatingDataLabels annotations={activeAnnotations} />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={!isSatellite}
            minZoom={0.7}
            maxZoom={2.4}
            minPolarAngle={isSatellite ? 0.01 : 0.4}
            maxPolarAngle={isSatellite ? 0.05 : Math.PI / 2 - 0.1}
            autoRotate={false}
          />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}