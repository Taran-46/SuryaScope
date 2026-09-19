"use client";

import * as React from "react";
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Eye,
  Info
} from "lucide-react";

interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
  displayName?: string;
  onLocationChange?: (lat: number, lon: number) => void;
  isAdjusted?: boolean;
}

export function PropertyLocationMap({
  latitude,
  longitude,
  displayName = "Resolved Property Location",
  onLocationChange,
  isAdjusted = false,
}: PropertyLocationMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerInstanceRef = React.useRef<any>(null);
  const tileLayerRef = React.useRef<any>(null);

  const [mapLayer, setMapLayer] = React.useState<"satellite" | "street">("satellite");
  const [currentLat, setCurrentLat] = React.useState(latitude);
  const [currentLon, setCurrentLon] = React.useState(longitude);
  const [hasPinMoved, setHasPinMoved] = React.useState(isAdjusted);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [mapError, setMapError] = React.useState<string | null>(null);

  // Sync props
  React.useEffect(() => {
    setCurrentLat(latitude);
    setCurrentLon(longitude);
  }, [latitude, longitude]);

  // Dynamically initialize Leaflet map on client side
  React.useEffect(() => {
    let isSubscribed = true;

    async function initLeafletMap() {
      if (!mapContainerRef.current) return;

      try {
        // Dynamically import Leaflet
        const L = await import("leaflet");

        // Load Leaflet CSS dynamically if not present
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!isSubscribed) return;

        // If map instance already exists, update view
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([currentLat, currentLon], 17);
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([currentLat, currentLon]);
          }
          return;
        }

        // Create Leaflet Map Instance
        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLon],
          zoom: 17,
          zoomControl: false,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        // Define Tile Layers
        const esriSatellite = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19, subdomains: ["server", "services"] }
        );

        const osmStreet = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { maxZoom: 19 }
        );

        // Set active layer
        const initialLayer = mapLayer === "satellite" ? esriSatellite : osmStreet;
        initialLayer.addTo(map);
        tileLayerRef.current = initialLayer;

        // Custom Pin Icon
        const customPinIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
            <div style="background:#09090b;color:#facc15;border:1.5px solid #facc15;padding:4px 8px;border-radius:6px;font-size:11px;font-family:monospace;font-weight:bold;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);white-space:nowrap;display:flex;align-items:center;gap:4px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#facc15;display:inline-block;"></span>
              Target Property
            </div>
            <div style="width:10px;height:10px;background:#facc15;transform:rotate(45deg);margin-top:-5px;"></div>
          </div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        // Add Draggable Marker
        const marker = L.marker([currentLat, currentLon], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);

        markerInstanceRef.current = marker;

        // Marker Drag End Event
        marker.on("dragend", (e: any) => {
          const latLng = e.target.getLatLng();
          const newLat = Number(latLng.lat.toFixed(6));
          const newLon = Number(latLng.lng.toFixed(6));

          setCurrentLat(newLat);
          setCurrentLon(newLon);
          setHasPinMoved(true);

          if (onLocationChange) {
            onLocationChange(newLat, newLon);
          }
        });

        // Map Click to Re-position Marker
        map.on("click", (e: any) => {
          const newLat = Number(e.latlng.lat.toFixed(6));
          const newLon = Number(e.latlng.lng.toFixed(6));

          marker.setLatLng([newLat, newLon]);
          setCurrentLat(newLat);
          setCurrentLon(newLon);
          setHasPinMoved(true);

          if (onLocationChange) {
            onLocationChange(newLat, newLon);
          }
        });

        setMapLoaded(true);
      } catch (err: any) {
        console.warn("Leaflet map initialization error:", err);
        setMapError("Could not load interactive location map tiles.");
      }
    }

    initLeafletMap();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Handle Layer Toggle
  const handleToggleLayer = async (newLayer: "satellite" | "street") => {
    setMapLayer(newLayer);
    if (!mapInstanceRef.current) return;

    const L = await import("leaflet");
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const nextTile =
      newLayer === "satellite"
        ? L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 })
        : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 });

    nextTile.addTo(mapInstanceRef.current);
    tileLayerRef.current = nextTile;
  };

  // Zoom Controls
  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  // Reset Location
  const handleResetLocation = () => {
    setCurrentLat(latitude);
    setCurrentLon(longitude);
    setHasPinMoved(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 17);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([latitude, longitude]);
      }
    }
    if (onLocationChange) {
      onLocationChange(latitude, longitude);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-graphite-200 bg-graphite-950 overflow-hidden shadow-xl relative text-white">
      
      {/* Map Header Controls */}
      <div className="px-5 py-3 bg-graphite-900/90 backdrop-blur-md border-b border-graphite-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono z-20 relative">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-solar-400">GEOSPATIAL PROPERTY MAP</span>
          <span className="text-graphite-500">|</span>
          <span className="text-graphite-300 font-sans truncate max-w-xs sm:max-w-md">
            {displayName}
          </span>
        </div>

        {/* Layer Switcher & Pin Status */}
        <div className="flex items-center gap-2">
          {hasPinMoved && (
            <span className="px-2 py-0.5 rounded bg-solar-500 text-graphite-950 font-bold text-[10px] uppercase">
              Location Adjusted
            </span>
          )}

          {/* Satellite vs Street Map Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-graphite-950 rounded-lg border border-graphite-800">
            <button
              type="button"
              onClick={() => handleToggleLayer("satellite")}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all ${
                mapLayer === "satellite"
                  ? "bg-solar-500 text-graphite-950 shadow-xs"
                  : "text-graphite-400 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => handleToggleLayer("street")}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all ${
                mapLayer === "street"
                  ? "bg-solar-500 text-graphite-950 shadow-xs"
                  : "text-graphite-400 hover:text-white"
              }`}
            >
              Street Vector
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-graphite-950 overflow-hidden">
        
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-10 relative" />

        {/* Loading Overlay */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 z-20 bg-graphite-950 flex items-center justify-center text-graphite-400 font-mono text-xs gap-2">
            <div className="w-4 h-4 border-2 border-solar-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Geospatial Property Map...</span>
          </div>
        )}

        {/* Error Fallback */}
        {mapError && (
          <div className="absolute inset-0 z-20 bg-graphite-950/90 flex flex-col items-center justify-center p-6 text-center text-red-400 font-mono text-xs space-y-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span>{mapError}</span>
          </div>
        )}

        {/* Map Coordinates & Guidance Pill */}
        <div className="absolute bottom-4 left-4 z-20 bg-graphite-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-graphite-800 text-[10px] font-mono flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-solar-400" />
          <span>
            {currentLat.toFixed(5)}° N, {currentLon.toFixed(5)}° W
          </span>
          <span className="text-graphite-400">| Drag or click to adjust pin</span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleZoom(1)}
            title="Zoom In"
            className="w-8 h-8 rounded-lg bg-graphite-950/90 hover:bg-graphite-900 border border-graphite-800 flex items-center justify-center text-white shadow-md transition-all"
          >
            <ZoomIn className="w-4 h-4 text-solar-400" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            title="Zoom Out"
            className="w-8 h-8 rounded-lg bg-graphite-950/90 hover:bg-graphite-900 border border-graphite-800 flex items-center justify-center text-white shadow-md transition-all"
          >
            <ZoomOut className="w-4 h-4 text-solar-400" />
          </button>
        </div>

        {/* Reset Pin Button */}
        {hasPinMoved && (
          <button
            type="button"
            onClick={handleResetLocation}
            className="absolute bottom-4 right-4 z-20 bg-solar-500 hover:bg-solar-400 text-graphite-950 font-mono text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pin</span>
          </button>
        )}

      </div>

      {/* Bottom Data Disclaimer */}
      <div className="px-5 py-2.5 bg-graphite-900 border-t border-graphite-800 text-[11px] font-sans text-graphite-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-solar-400 shrink-0" />
          <span>
            <strong>Location Scope:</strong> Map provides geographic property coordinates. Rooftop pitch, orientation & geometry calculated by Suryascope CADASTRE.
          </span>
        </div>
      </div>

    </div>
  );
}
