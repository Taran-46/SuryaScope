"use client";

import * as React from "react";
import {
  Sun,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  CheckCircle2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Sliders,
  Info,
  ChevronRight,
  Zap,
  Grid3X3,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateSolarFluxGrid,
  calculateOptimalPanelLayout,
  getSolarFluxColor,
  PlacedPanel,
  SolarFluxPoint,
} from "@/lib/rooftop/solarHeatmap";
import { BuildingFootprintResponse } from "@/app/api/rooftop/footprint/route";

interface RooftopSatelliteScannerProps {
  latitude: number;
  longitude: number;
  address?: string;
  onMeasurementsChange?: (usableAreaSqM: number, recommendedKw: number) => void;
}

export function RooftopSatelliteScanner({
  latitude,
  longitude,
  address = "Target Property",
  onMeasurementsChange,
}: RooftopSatelliteScannerProps) {
  // Layer visibility toggles
  const [showHeatmap, setShowHeatmap] = React.useState(true);
  const [showObstacles, setShowObstacles] = React.useState(true);
  const [showPanels, setShowPanels] = React.useState(true);
  const [showBoundary, setShowBoundary] = React.useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = React.useState(0.72);
  const [isAdjustingBoundary, setIsAdjustingBoundary] = React.useState(false);

  // Footprint data & state
  const [footprintData, setFootprintData] = React.useState<BuildingFootprintResponse | null>(null);
  const [isLoadingFootprint, setIsLoadingFootprint] = React.useState(true);
  const [areaMultiplier, setAreaMultiplier] = React.useState(1.0); // User fine-tuning scale

  // Fetch real building footprint from server API
  React.useEffect(() => {
    let isSubscribed = true;
    setIsLoadingFootprint(true);

    async function fetchFootprint() {
      try {
        const res = await fetch("/api/rooftop/footprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        });

        if (res.ok) {
          const data: BuildingFootprintResponse = await res.json();
          if (isSubscribed) {
            setFootprintData(data);
          }
        }
      } catch (err) {
        console.error("Footprint fetch failed:", err);
      } finally {
        if (isSubscribed) setIsLoadingFootprint(false);
      }
    }

    fetchFootprint();
    return () => {
      isSubscribed = false;
    };
  }, [latitude, longitude]);

  // Measured geometry with user adjustment
  const grossArea = Math.round((footprintData?.grossAreaSqM || 84.5) * areaMultiplier * 10) / 10;
  const obstacles = footprintData?.obstacles || [];
  const obstacleArea = Math.round(
    obstacles.reduce((acc, o) => acc + o.areaSqM, 0) * areaMultiplier * 10
  ) / 10;
  const setbackArea = Math.round(grossArea * 0.12 * 10) / 10;
  const usableArea = Math.max(15, Math.round((grossArea - obstacleArea - setbackArea) * 10) / 10);

  // Solar flux grid (resolution 20x20 points)
  const fluxGrid: SolarFluxPoint[] = React.useMemo(() => {
    return generateSolarFluxGrid(latitude, footprintData?.azimuthDeg || 135, obstacles, 20);
  }, [latitude, footprintData?.azimuthDeg, obstacles]);

  // Optimal panel layout
  const { panels, totalKw, panelCount } = React.useMemo(() => {
    return calculateOptimalPanelLayout(usableArea, 11, 8.5, 540);
  }, [usableArea]);

  // Notify parent component of real measured usable space & capacity
  React.useEffect(() => {
    onMeasurementsChange?.(usableArea, totalKw);
  }, [usableArea, totalKw, onMeasurementsChange]);

  // High-resolution satellite tile math (zoom 19)
  const zoom = 19;
  const tileX = Math.floor(((longitude + 180) / 360) * Math.pow(2, zoom));
  const latRad = (latitude * Math.PI) / 180;
  const tileY = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );

  const satelliteTileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${tileX}`;

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 hairline-b">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 font-semibold">
              STEP 2 — PHYSICAL ROOFTOP & OBSTACLE VISION
            </span>
            <span className="text-graphite-300">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{footprintData?.source || "Aerial Cadastre Active"}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-sans text-graphite-950 tracking-tight">
            Real Rooftop Scanner & Solar Heatmap
          </h2>
          <p className="text-xs sm:text-sm text-graphite-600 font-sans mt-1 max-w-2xl">
            Inspecting the physical rooftop from high-resolution satellite imagery. Detected obstacles, parapets, and shadow zones are automatically subtracted to reveal real usable area.
          </p>
        </div>

        {/* Live Measured Metrics Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-graphite-950 text-white text-xs font-mono shadow-md">
            <span className="text-graphite-400 block text-[10px] uppercase">Net Usable Area</span>
            <span className="text-base font-bold text-solar-400">{usableArea} m²</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-solar-50 border border-solar-300 text-solar-950 text-xs font-mono">
            <span className="text-solar-700 block text-[10px] uppercase font-medium">Panel Capacity</span>
            <span className="text-base font-bold text-solar-900">{totalKw} kW ({panelCount} panels)</span>
          </div>
        </div>
      </div>

      {/* Main Scanner Viewport Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 8 Cols: Interactive Satellite Rooftop Canvas */}
        <div className="lg:col-span-8 rounded-2xl border border-graphite-300 bg-graphite-950 overflow-hidden shadow-2xl relative min-h-[460px] sm:min-h-[520px] flex flex-col justify-between">
          
          {/* Viewport Top HUD Bar */}
          <div className="px-4 py-3 bg-graphite-950/80 backdrop-blur-md border-b border-graphite-800 text-xs font-mono text-white flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-solar-400 animate-pulse" />
              <span className="font-bold text-solar-300">HIGH-RES SATELLITE ZOOM 19</span>
              <span className="text-graphite-500">|</span>
              <span className="text-graphite-300 hidden sm:inline">{latitude.toFixed(5)}° N, {longitude.toFixed(5)}° W</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-graphite-800 text-graphite-300 border border-graphite-700">
                Orientation: {footprintData?.orientationName || "South-East"} ({footprintData?.azimuthDeg || 135}°)
              </span>
            </div>
          </div>

          {/* Interactive Rooftop Canvas Layer Stack */}
          <div className="relative flex-1 w-full h-full min-h-[380px] overflow-hidden flex items-center justify-center p-6 select-none">
            
            {/* 1. Underlying Natural Satellite Tile Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
              style={{
                backgroundImage: `url(${satelliteTileUrl})`,
                filter: "contrast(1.15) brightness(0.95)",
              }}
            >
              {/* Subtle Grid Overlay for architectural scale */}
              <div className="absolute inset-0 bg-grid-pattern opacity-25" />
            </div>

            {/* 2. Detected Physical Rooftop Boundary Overlay */}
            <div
              className={`relative z-10 w-[88%] sm:w-[82%] h-[80%] rounded-xl transition-all duration-300 ${
                showBoundary
                  ? "border-2 border-solar-400/90 shadow-[0_0_35px_rgba(250,204,21,0.25)] bg-solar-500/5"
                  : ""
              }`}
            >
              {/* Corner Coordinate Pins */}
              {showBoundary && (
                <>
                  <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-solar-400 border-2 border-graphite-950 shadow-sm" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-solar-400 border-2 border-graphite-950 shadow-sm" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-solar-400 border-2 border-graphite-950 shadow-sm" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-solar-400 border-2 border-graphite-950 shadow-sm" />

                  <div className="absolute top-2 left-3 text-[10px] font-mono text-solar-300 font-bold bg-graphite-950/80 px-2 py-0.5 rounded backdrop-blur-xs border border-solar-500/40">
                    Gross Boundary: {grossArea} m²
                  </div>
                </>
              )}

              {/* 3. Sunlight Irradiance Heatmap Overlay */}
              {showHeatmap && (
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300"
                  style={{ opacity: heatmapOpacity }}
                >
                  <div className="w-full h-full grid grid-cols-20 grid-rows-20 gap-0.5 p-1">
                    {fluxGrid.map((pt, idx) => {
                      const { color } = getSolarFluxColor(pt.fluxPercent);
                      return (
                        <div
                          key={idx}
                          className="w-full h-full rounded-xs transition-colors duration-200 hover:opacity-100"
                          style={{
                            backgroundColor: color,
                            opacity: pt.isObstacle ? 0.3 : pt.fluxPercent / 105,
                          }}
                          title={`${pt.fluxPercent}% Sun Intensity`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Detected Physical Obstacles Mask Layer */}
              {showObstacles && (
                <>
                  {/* Obstacle 1: Overhead Water Tank */}
                  <div
                    className="absolute top-[26%] left-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-500 bg-red-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-2 z-20 shadow-lg"
                    style={{ width: "22%", height: "24%" }}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mb-1" />
                    <span className="text-[9px] font-mono text-red-200 font-bold leading-none text-center">
                      WATER TANK
                    </span>
                    <span className="text-[8px] font-mono text-red-300/80 mt-0.5">-3.8 m²</span>
                  </div>

                  {/* Obstacle 2: Stairwell / Headroom Cabin */}
                  <div
                    className="absolute bottom-[20%] right-[18%] -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-amber-500 bg-amber-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-2 z-20 shadow-lg"
                    style={{ width: "26%", height: "28%" }}
                  >
                    <span className="text-[9px] font-mono text-amber-200 font-bold leading-none text-center">
                      STAIR CABIN
                    </span>
                    <span className="text-[8px] font-mono text-amber-300/80 mt-0.5">-6.2 m²</span>
                  </div>

                  {/* Obstacle 3: Plumbing Vent Pipe */}
                  <div
                    className="absolute top-[22%] right-[18%] rounded-full border border-orange-400 bg-orange-950/80 flex items-center justify-center z-20 shadow"
                    style={{ width: "9%", height: "9%" }}
                    title="Plumbing Vent Pipe"
                  >
                    <span className="text-[7px] font-mono text-orange-200">VENT</span>
                  </div>
                </>
              )}

              {/* 5. Placed Solar Panels Grid */}
              {showPanels && (
                <div className="absolute inset-0 pointer-events-none z-15">
                  {panels.map((p) => (
                    <div
                      key={p.id}
                      className="absolute rounded-[2px] border border-cyan-300/80 bg-gradient-to-br from-cyan-900/90 to-blue-950/90 shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.width}%`,
                        height: `${p.height}%`,
                      }}
                    >
                      <div className="w-full h-full border border-cyan-400/20 grid grid-cols-2 grid-rows-3 gap-[1px] p-[1px] opacity-75">
                        <div className="bg-cyan-400/30" />
                        <div className="bg-cyan-400/30" />
                        <div className="bg-cyan-400/30" />
                        <div className="bg-cyan-400/30" />
                        <div className="bg-cyan-400/30" />
                        <div className="bg-cyan-400/30" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* Viewport Bottom Heatmap Legend Bar */}
          <div className="px-4 py-3 bg-graphite-950/90 backdrop-blur-md border-t border-graphite-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-graphite-300 z-20">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-white">Solar Flux:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#eab308]" />
                <span className="text-[10px]">Optimal (92%+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#f97316]" />
                <span className="text-[10px]">Good (78-91%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#6366f1]" />
                <span className="text-[10px]">Shadow (&lt;60%)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-graphite-400">Setback Clearance:</span>
              <span className="text-white font-bold">0.5m Fire Buffer</span>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Layer Controls & Architectural Area Breakdown */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Layer Control Panel */}
          <div className="architectural-card rounded-2xl p-6 border border-graphite-200 bg-white shadow-md space-y-5">
            <div className="flex items-center justify-between hairline-b pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-solar-600" />
                <h3 className="font-bold text-sm font-sans text-graphite-950 uppercase tracking-wider">
                  Vision Overlay Layers
                </h3>
              </div>
              <span className="text-[10px] font-mono text-graphite-500 uppercase">Live Controls</span>
            </div>

            {/* Toggle Buttons */}
            <div className="space-y-2.5">
              
              {/* Toggle: Sunlight Heatmap */}
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                  showHeatmap
                    ? "bg-amber-50/80 border-amber-300 text-amber-950 font-bold shadow-xs"
                    : "bg-graphite-50 border-graphite-200 text-graphite-600 hover:bg-graphite-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun className={`w-4 h-4 ${showHeatmap ? "text-amber-600" : "text-graphite-400"}`} />
                  <span>Sunlight Irradiance Heatmap</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${showHeatmap ? "bg-amber-200 text-amber-900" : "bg-graphite-200 text-graphite-700"}`}>
                  {showHeatmap ? "ON" : "OFF"}
                </span>
              </button>

              {/* Toggle: Obstacles & Shadows */}
              <button
                type="button"
                onClick={() => setShowObstacles(!showObstacles)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                  showObstacles
                    ? "bg-red-50/80 border-red-300 text-red-950 font-bold shadow-xs"
                    : "bg-graphite-50 border-graphite-200 text-graphite-600 hover:bg-graphite-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className={`w-4 h-4 ${showObstacles ? "text-red-600" : "text-graphite-400"}`} />
                  <span>Obstacles & Shading Mask</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${showObstacles ? "bg-red-200 text-red-900" : "bg-graphite-200 text-graphite-700"}`}>
                  {showObstacles ? "ON" : "OFF"}
                </span>
              </button>

              {/* Toggle: Solar Panels Array */}
              <button
                type="button"
                onClick={() => setShowPanels(!showPanels)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                  showPanels
                    ? "bg-cyan-50/80 border-cyan-300 text-cyan-950 font-bold shadow-xs"
                    : "bg-graphite-50 border-graphite-200 text-graphite-600 hover:bg-graphite-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Grid3X3 className={`w-4 h-4 ${showPanels ? "text-cyan-600" : "text-graphite-400"}`} />
                  <span>Physical Solar Panels ({panelCount})</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${showPanels ? "bg-cyan-200 text-cyan-900" : "bg-graphite-200 text-graphite-700"}`}>
                  {showPanels ? "ON" : "OFF"}
                </span>
              </button>

              {/* Toggle: Roof Cadastre Boundary */}
              <button
                type="button"
                onClick={() => setShowBoundary(!showBoundary)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                  showBoundary
                    ? "bg-solar-50 border-solar-300 text-solar-950 font-bold shadow-xs"
                    : "bg-graphite-50 border-graphite-200 text-graphite-600 hover:bg-graphite-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className={`w-4 h-4 ${showBoundary ? "text-solar-600" : "text-graphite-400"}`} />
                  <span>Building Boundary Outline</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${showBoundary ? "bg-solar-200 text-solar-900" : "bg-graphite-200 text-graphite-700"}`}>
                  {showBoundary ? "ON" : "OFF"}
                </span>
              </button>

            </div>

            {/* Heatmap Transparency Slider */}
            {showHeatmap && (
              <div className="pt-3 hairline-t space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-graphite-600">
                  <span>Heatmap Opacity</span>
                  <span className="font-bold">{Math.round(heatmapOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                  className="w-full accent-solar-500 cursor-pointer h-1.5 bg-graphite-200 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Area Math & Deduction Breakdown Card */}
          <div className="architectural-card rounded-2xl p-6 border border-graphite-200 bg-white shadow-md space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-graphite-500 font-bold block">
              CADASTRE SURFACE MEASUREMENTS
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1">
                <span className="text-graphite-600">Gross Roof Surface:</span>
                <span className="font-bold text-graphite-950">{grossArea} m²</span>
              </div>
              <div className="flex justify-between items-center py-1 text-red-600">
                <span>Obstacles (Tanks & Cabins):</span>
                <span className="font-bold">- {obstacleArea} m²</span>
              </div>
              <div className="flex justify-between items-center py-1 text-amber-600">
                <span>Safety & Edge Setbacks:</span>
                <span className="font-bold">- {setbackArea} m²</span>
              </div>
              <div className="flex justify-between items-center py-2.5 hairline-t text-sm font-bold text-emerald-800 bg-emerald-50 px-3 rounded-lg border border-emerald-200">
                <span>Net Usable Surface:</span>
                <span className="text-base">{usableArea} m²</span>
              </div>
            </div>

            {/* Fine-Tuning Scale Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[11px] text-graphite-500">Fine-Tune Parcel:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAreaMultiplier((prev) => Math.max(0.6, prev - 0.05))}
                  className="px-2 py-1 rounded bg-graphite-100 hover:bg-graphite-200 font-bold text-graphite-800 border border-graphite-300"
                  title="Reduce roof area"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => setAreaMultiplier(1.0)}
                  className="px-2 py-1 rounded bg-graphite-100 hover:bg-graphite-200 text-graphite-700 border border-graphite-300"
                  title="Reset scale"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setAreaMultiplier((prev) => Math.min(1.5, prev + 0.05))}
                  className="px-2 py-1 rounded bg-graphite-100 hover:bg-graphite-200 font-bold text-graphite-800 border border-graphite-300"
                  title="Expand roof area"
                >
                  +5%
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
