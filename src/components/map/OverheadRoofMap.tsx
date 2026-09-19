"use client";

import * as React from "react";
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Layers,
  CheckCircle2,
  Compass,
  Maximize2
} from "lucide-react";

interface OverheadRoofMapProps {
  latitude: number;
  longitude: number;
  displayName?: string;
  onLocationChange?: (lat: number, lon: number) => void;
}

export function OverheadRoofMap({
  latitude,
  longitude,
  displayName = "Selected Roof Location",
  onLocationChange,
}: OverheadRoofMapProps) {
  const [currentLat, setCurrentLat] = React.useState(latitude);
  const [currentLon, setCurrentLon] = React.useState(longitude);
  const [zoomLevel, setZoomLevel] = React.useState<number>(18); // Zoom 18 = ~100m roof view
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [hasMoved, setHasMoved] = React.useState(false);

  // Sync initial props
  React.useEffect(() => {
    setCurrentLat(latitude);
    setCurrentLon(longitude);
    setHasMoved(false);
  }, [latitude, longitude]);

  // Compute bounding box delta based on zoom level (Roof-level perspective)
  // Zoom 19 = 0.0006, Zoom 18 = 0.0012, Zoom 17 = 0.0025, Zoom 16 = 0.005
  const delta = React.useMemo(() => {
    switch (zoomLevel) {
      case 19:
        return 0.0006;
      case 17:
        return 0.0025;
      case 16:
        return 0.005;
      case 18:
      default:
        return 0.0012;
    }
  }, [zoomLevel]);

  // Esri World Imagery Satellite Tile / Export URL
  const satelliteUrl = React.useMemo(() => {
    const minLon = (currentLon - delta).toFixed(6);
    const minLat = (currentLat - delta).toFixed(6);
    const maxLon = (currentLon + delta).toFixed(6);
    const maxLat = (currentLat + delta).toFixed(6);

    return `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${minLon},${minLat},${maxLon},${maxLat}&bboxSR=4326&imageSR=4326&size=800,500&f=image`;
  }, [currentLat, currentLon, delta]);

  // Pan controls
  const handlePan = (dLat: number, dLon: number) => {
    const step = delta * 0.35;
    const newLat = Number((currentLat + dLat * step).toFixed(6));
    const newLon = Number((currentLon + dLon * step).toFixed(6));
    setCurrentLat(newLat);
    setCurrentLon(newLon);
    setHasMoved(true);
    if (onLocationChange) {
      onLocationChange(newLat, newLon);
    }
  };

  // Reset to original geocoded location
  const handleReset = () => {
    setCurrentLat(latitude);
    setCurrentLon(longitude);
    setHasMoved(false);
    if (onLocationChange) {
      onLocationChange(latitude, longitude);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-graphite-200 bg-graphite-950 overflow-hidden shadow-xl relative text-white">
      
      {/* Top Header Bar */}
      <div className="px-5 py-3 bg-graphite-900/90 backdrop-blur-md border-b border-graphite-800 flex items-center justify-between text-xs font-mono z-20 relative">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-solar-400">OVERHEAD SATELLITE ROOF VIEW</span>
          <span className="text-graphite-500">|</span>
          <span className="text-graphite-300 font-sans truncate max-w-xs sm:max-w-sm">
            {displayName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-solar-500/20 text-solar-400 border border-solar-500/30 text-[10px] uppercase font-bold">
            Esri High-Res Imagery
          </span>
        </div>
      </div>

      {/* Main Satellite Viewport */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-graphite-950 overflow-hidden flex items-center justify-center">
        
        {/* Loading Spinner Indicator */}
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-graphite-950 z-10 text-graphite-400 font-mono text-xs gap-2">
            <div className="w-4 h-4 border-2 border-solar-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading High-Res Aerial Roof Photograph...</span>
          </div>
        )}

        {/* Satellite Imagery Tile */}
        <img
          key={satelliteUrl}
          src={satelliteUrl}
          alt="Overhead Roof Satellite View"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Center Target Reticle / Rooftop Pin Marker */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          {/* Target Reticle Lines */}
          <div className="w-24 h-24 border border-solar-400/40 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 rounded-full bg-solar-400 shadow-lg shadow-solar-500" />
          </div>

          {/* Floating Location Pin Marker */}
          <div className="absolute flex flex-col items-center -translate-y-8 animate-bounce">
            <div className="px-2 py-1 rounded bg-graphite-950/90 text-solar-400 text-[10px] font-mono border border-solar-500/50 shadow-xl flex items-center gap-1 font-bold whitespace-nowrap">
              <MapPin className="w-3 h-3 text-solar-400 shrink-0" />
              <span>Target Roof Center</span>
            </div>
            <div className="w-2 h-2 bg-solar-500 rotate-45 -mt-1 shadow-md" />
          </div>
        </div>

        {/* Map Coordinates Floating Pill */}
        <div className="absolute top-4 left-4 z-20 bg-graphite-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-graphite-800 text-[10px] font-mono flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-solar-400" />
          <span>
            {currentLat.toFixed(5)}° N, {currentLon.toFixed(5)}° W
          </span>
          {hasMoved && (
            <span className="px-1.5 py-0.2 rounded bg-solar-500 text-graphite-950 font-bold uppercase">
              Adjusted
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(19, z + 1))}
            title="Zoom In"
            className="w-8 h-8 rounded-lg bg-graphite-950/90 hover:bg-graphite-900 border border-graphite-800 flex items-center justify-center text-white shadow-md transition-all active:scale-95"
          >
            <ZoomIn className="w-4 h-4 text-solar-400" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(16, z - 1))}
            title="Zoom Out"
            className="w-8 h-8 rounded-lg bg-graphite-950/90 hover:bg-graphite-900 border border-graphite-800 flex items-center justify-center text-white shadow-md transition-all active:scale-95"
          >
            <ZoomOut className="w-4 h-4 text-solar-400" />
          </button>
        </div>

        {/* Directional N / S / E / W Fine-Tuning D-Pad */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center bg-graphite-950/90 backdrop-blur-md p-1.5 rounded-xl border border-graphite-800 shadow-xl">
          <span className="text-[9px] font-mono text-graphite-400 uppercase mb-1 font-bold">
            Fine-Tune Roof
          </span>
          <button
            type="button"
            onClick={() => handlePan(1, 0)}
            title="Pan North"
            className="p-1 rounded hover:bg-graphite-800 text-solar-400 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePan(0, -1)}
              title="Pan West"
              className="p-1 rounded hover:bg-graphite-800 text-solar-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-2 h-2 rounded-full bg-solar-500" />
            <button
              type="button"
              onClick={() => handlePan(0, 1)}
              title="Pan East"
              className="p-1 rounded hover:bg-graphite-800 text-solar-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => handlePan(-1, 0)}
            title="Pan South"
            className="p-1 rounded hover:bg-graphite-800 text-solar-400 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Reset Pin Button */}
        {hasMoved && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute bottom-4 left-4 z-20 bg-solar-500 hover:bg-solar-400 text-graphite-950 font-mono text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pin to Address</span>
          </button>
        )}

      </div>

      {/* Bottom Guidance Footnote */}
      <div className="px-5 py-2.5 bg-graphite-900 border-t border-graphite-800 text-[11px] font-sans text-graphite-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Confirm target marker is positioned directly over your property&apos;s rooftop.</span>
        </div>
        <span className="font-mono text-solar-400 text-[10px] hidden sm:inline">
          Aerial Imagery Scale: ~1:500
        </span>
      </div>

    </div>
  );
}
