"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Compass,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Activity
} from "lucide-react";
import dynamic from "next/dynamic";
import { ROOF_SEGMENTS, RoofSegmentData } from "./roofSegmentsData";
import { SolarEconomicsSection, SolarResourceData } from "@/components/economics/SolarEconomicsSection";
import { AiRoofAssessmentSection } from "@/components/ai/AiRoofAssessmentSection";
import { PropertyLocationMap } from "@/components/map/PropertyLocationMap";

const RoofScene = dynamic(
  () => import("@/components/hero/RoofScene").then((mod) => mod.RoofScene),
  {
    loading: () => (
      <div className="w-full h-full min-h-[480px] bg-graphite-950 flex items-center justify-center text-graphite-400 font-mono text-xs">
        Loading 3D Roof Segmentation...
      </div>
    ),
    ssr: false,
  }
);

export interface GeocodedLocation {
  displayName: string;
  latitude: number;
  longitude: number;
}

interface ResultsViewProps {
  onBackToInput?: () => void;
  address?: string;
  geocodedLocation?: GeocodedLocation | null;
  geocodeStatus?: "IDLE" | "LOADING" | "SUCCESS" | "NO_RESULT" | "ERROR";
  solarResourceData?: SolarResourceData | null;
  onLocationChange?: (latitude: number, longitude: number) => void;
}

export function ResultsView({
  onBackToInput,
  address = "1248 Solar Way, Palo Alto, CA",
  geocodedLocation,
  geocodeStatus = "IDLE",
  solarResourceData,
  onLocationChange,
}: ResultsViewProps) {
  const [selectedSegmentId, setSelectedSegmentId] = React.useState<string>("south-east");

  const activeSegment = ROOF_SEGMENTS.find((s) => s.id === selectedSegmentId) || ROOF_SEGMENTS[0];

  // Map 3D Annotations based on active selected segment or overall overview
  const annotationsFor3D = [
    {
      id: "se-segment",
      position: [-1.2, 4.8, 1.8] as [number, number, number],
      label: "South-East Pitch",
      value: "32.4 m² (Rec.)",
    },
    {
      id: "west-segment",
      position: [3.8, 4.5, -1.2] as [number, number, number],
      label: "West Pitch",
      value: "18.2 m² (Opt.)",
    },
    {
      id: "north-segment",
      position: [-3.8, 4.2, -1.8] as [number, number, number],
      label: "North Pitch",
      value: "11.1 m² (Low)",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-16">
      
      {/* ========================================================
          TOP SECTION: ASSESSMENT TITLE, STATUS & PROMINENT METRICS
         ======================================================== */}
      <div className="architectural-card rounded-2xl p-8 sm:p-10 border border-graphite-200 bg-white shadow-xl relative overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-8">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 hairline-b">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 font-semibold">
                  {geocodedLocation
                    ? `COORDINATES: ${geocodedLocation.latitude.toFixed(4)}° N, ${geocodedLocation.longitude.toFixed(4)}° W`
                    : "GEOSPATIAL AUDIT #8492-B"}
                </span>
                <span className="text-graphite-300">•</span>
                <span className="text-xs font-mono text-graphite-600 line-clamp-1 max-w-xl">
                  {geocodedLocation?.displayName || address}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-graphite-950">
                Your Roof Assessment
              </h1>
            </div>

            {/* Primary Status Banner & Solar Resource Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {solarResourceData && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-solar-50 border border-solar-200 text-solar-950 text-xs font-mono">
                  <Sun className="w-4 h-4 text-solar-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-solar-900 leading-none">
                      {solarResourceData.annualSolarResource.toLocaleString()} {solarResourceData.unit}
                    </span>
                    <span className="text-[10px] text-solar-700 block mt-0.5 font-medium">
                      {solarResourceData.source} {solarResourceData.isEstimate ? "(Estimate)" : "(Measured)"}
                    </span>
                  </div>
                </div>
              )}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-900 shadow-sm shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase">
                  GOOD SOLAR POTENTIAL
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Metrics Display (Strong Visual Hierarchy) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8 pt-2">
            
            {/* Metric 1: Usable Area */}
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-bold font-sans text-graphite-950 tracking-tight">
                61.7 <span className="text-xl sm:text-2xl font-normal text-graphite-500 font-mono">m²</span>
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Usable roof area
              </span>
            </div>

            {/* Metric 2: Recommended Capacity */}
            <div className="flex flex-col border-l border-graphite-200 pl-6">
              <span className="text-4xl sm:text-5xl font-bold font-sans text-solar-600 tracking-tight">
                4.8 <span className="text-xl sm:text-2xl font-normal text-solar-500 font-mono">kW</span>
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Recommended capacity
              </span>
            </div>

            {/* Metric 3: Solar Exposure */}
            <div className="flex flex-col border-l border-graphite-200 pl-6">
              <span className="text-4xl sm:text-5xl font-bold font-sans text-emerald-700 tracking-tight">
                High
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Solar exposure (94%)
              </span>
            </div>

            {/* Metric 4: Shading */}
            <div className="flex flex-col border-l border-graphite-200 pl-6">
              <span className="text-4xl sm:text-5xl font-bold font-sans text-graphite-950 tracking-tight">
                Low
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Shading obstruction
              </span>
            </div>

            {/* Metric 5: Primary Orientation */}
            <div className="flex flex-col border-l border-graphite-200 pl-6 col-span-2 md:col-span-1">
              <span className="text-3xl sm:text-4xl font-bold font-sans text-graphite-950 tracking-tight leading-tight">
                South-East
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Primary orientation (135°)
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================
          LOCATION SECTION: INTERACTIVE GEOSPATIAL PROPERTY MAP
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 font-semibold block mb-1">
              STEP 1 — LOCATION & GEOSPATIAL CONTEXT
            </span>
            <h2 className="text-2xl font-bold font-sans text-graphite-950">
              Interactive Property Location Map
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-graphite-600 bg-white border border-graphite-200 rounded-lg px-3 py-1.5 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-solar-500" />
            <span>Toggle Satellite / Street layers or drag pin to fine-tune position</span>
          </div>
        </div>

        <PropertyLocationMap
          latitude={geocodedLocation?.latitude || 37.4419}
          longitude={geocodedLocation?.longitude || -122.1430}
          displayName={geocodedLocation?.displayName || address}
          onLocationChange={onLocationChange}
        />
      </div>

      {/* ========================================================
          3D ROOF ANALYSIS VIEWPORT & INSPECTOR OVERLAY
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-graphite-500 block mb-1">
              INTERACTIVE 3D CADASTRE
            </span>
            <h2 className="text-2xl font-bold font-sans text-graphite-950">
              3D Roof Analysis
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-graphite-600 bg-white border border-graphite-200 rounded-lg px-3 py-1.5 shadow-xs">
            <Eye className="w-3.5 h-3.5 text-solar-500" />
            <span>Hover/Click roof sections to inspect segment properties</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* 3D Roof Viewport */}
          <div className="lg:col-span-8 rounded-2xl border border-graphite-200 bg-white overflow-hidden shadow-xl min-h-[480px] lg:min-h-[540px] relative">
            
            {/* Viewport Header */}
            <div className="px-5 py-3 bg-graphite-50 hairline-b flex items-center justify-between text-xs font-mono text-graphite-600 z-10 relative">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-graphite-900">SEGMENT INSPECTOR</span>
                <span className="text-graphite-400">|</span>
                <span>Active: {activeSegment.name} Pitch</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-solar-100 text-solar-900 font-semibold">
                {activeSegment.area} Usable
              </span>
            </div>

            {/* 3D Scene */}
            <RoofScene annotations={annotationsFor3D} />

            {/* Hover Inspector Card Overlay */}
            <div className="absolute bottom-6 right-6 z-20 max-w-xs w-full bg-graphite-950/90 backdrop-blur-md text-white p-5 rounded-xl border border-graphite-800 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-graphite-800 pb-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-solar-400" />
                  <span className="font-bold text-sm font-sans">{activeSegment.name} Pitch</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${activeSegment.statusBadge}`}>
                  {activeSegment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="block text-graphite-400 text-[10px]">AREA</span>
                  <span className="font-bold text-white text-sm">{activeSegment.area}</span>
                </div>
                <div>
                  <span className="block text-graphite-400 text-[10px]">ORIENTATION</span>
                  <span className="font-bold text-white text-sm">{activeSegment.orientation}</span>
                </div>
                <div>
                  <span className="block text-graphite-400 text-[10px]">EXPOSURE</span>
                  <span className="font-bold text-emerald-400 text-sm">{activeSegment.exposure}</span>
                </div>
                <div>
                  <span className="block text-graphite-400 text-[10px]">SHADING</span>
                  <span className="font-bold text-white text-sm">{activeSegment.shading}</span>
                </div>
              </div>

              <p className="text-[11px] font-sans text-graphite-300 leading-tight pt-1">
                {activeSegment.notes}
              </p>
            </div>

          </div>

          {/* Right Inspection Controls / Segment Picker */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="architectural-card rounded-2xl p-6 border border-graphite-200 space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-graphite-500 uppercase tracking-wider mb-4 font-semibold">
                  <Layers className="w-4 h-4 text-solar-500" />
                  <span>Select Roof Segment</span>
                </div>

                <div className="space-y-3">
                  {ROOF_SEGMENTS.map((seg) => {
                    const isSelected = seg.id === selectedSegmentId;
                    return (
                      <button
                        key={seg.id}
                        onClick={() => setSelectedSegmentId(seg.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-graphite-950 text-white border-graphite-950 shadow-md scale-[1.02]"
                            : "bg-white text-graphite-900 border-graphite-200 hover:border-solar-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold font-sans text-sm">{seg.name} Pitch</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              isSelected
                                ? "bg-solar-500 text-graphite-950 font-bold"
                                : seg.statusBadge
                            }`}
                          >
                            {seg.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono opacity-90 mt-2">
                          <span>{seg.area}</span>
                          <span>{seg.exposure}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 hairline-t text-xs font-mono text-graphite-500 flex items-center justify-between">
                <span>Total Segment Facets: 3</span>
                <span className="text-solar-600 font-semibold">61.7 m² Active Surface</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          ROOF BREAKDOWN SECTION
         ======================================================== */}
      <div className="space-y-6 pt-4">
        
        {/* Section Title */}
        <div className="pb-4 hairline-b flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-graphite-500 block mb-1">
              SEGMENTATION CLASSIFICATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-graphite-950">
              Roof Breakdown
            </h2>
          </div>
          <p className="text-xs font-sans text-graphite-600 max-w-md mt-2 md:mt-0">
            Facets categorized by annual solar irradiance yield and panel layout suitability.
          </p>
        </div>

        {/* 3 Segment Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROOF_SEGMENTS.map((segment) => {
            const isSelected = segment.id === selectedSegmentId;

            return (
              <div
                key={segment.id}
                onClick={() => setSelectedSegmentId(segment.id)}
                className={`architectural-card rounded-2xl p-7 border transition-all cursor-pointer ${
                  isSelected
                    ? "border-solar-500 shadow-xl bg-solar-50/20 ring-1 ring-solar-500/30"
                    : "border-graphite-200 hover:border-graphite-400 shadow-sm"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        segment.status === "Recommended"
                          ? "bg-emerald-500"
                          : segment.status === "Optional"
                          ? "bg-solar-500"
                          : "bg-graphite-400"
                      }`}
                    />
                    <h3 className="text-xl font-bold font-sans text-graphite-950">
                      {segment.name}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded border ${segment.statusBadge}`}>
                    {segment.status}
                  </span>
                </div>

                {/* Area Prominent Display */}
                <div className="mb-6">
                  <span className="text-3xl font-bold font-sans text-graphite-950">
                    {segment.area}
                  </span>
                  <span className="block text-xs font-mono text-graphite-500 uppercase mt-0.5">
                    Segment Area
                  </span>
                </div>

                {/* Property Detail Pills */}
                <div className="space-y-2.5 pt-4 hairline-t text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-graphite-500">Solar Exposure:</span>
                    <span className="font-bold text-graphite-900">{segment.exposure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-graphite-500">Shading Level:</span>
                    <span className="font-semibold text-graphite-900">{segment.shading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-graphite-500">Panel Capacity:</span>
                    <span className="font-bold text-solar-600">{segment.panelCount} Panels</span>
                  </div>
                </div>

                {/* Notes */}
                <p className="text-xs font-sans text-graphite-600 mt-5 pt-4 hairline-t leading-relaxed">
                  {segment.notes}
                </p>
              </div>
            );
          })}
        </div>

      </div>

      {/* ========================================================
          SOLAR ECONOMICS SECTION: WILL SOLAR PAY OFF?
         ======================================================== */}
      <SolarEconomicsSection systemSizeKw={4.8} solarResourceData={solarResourceData} />

      {/* ========================================================
          AI ROOF ASSESSMENT REPORT SECTION
         ======================================================== */}
      <AiRoofAssessmentSection
        payload={{
          address: geocodedLocation?.displayName || address,
          suitabilityScore: 96,
          suitabilityLabel: "Highly Suitable",
          roofAreaSqM: 84.5,
          usableAreaSqM: 61.7,
          orientation: "South-East 135°",
          shading: "Low (0% Obstruction)",
          solarExposurePercent: 94,
          recommendedCapacityKw: 4.8,
          annualGenerationKwh: Math.round(4.8 * (solarResourceData?.specificYieldKwhPerKw || 1400)),
          installationCostInr: 200000,
          subsidyInr: 78000,
          annualSavingsInr: Math.round(4.8 * (solarResourceData?.specificYieldKwhPerKw || 1400) * 6.5),
          paybackYears: Number(
            (122000 / (4.8 * (solarResourceData?.specificYieldKwhPerKw || 1400) * 6.5)).toFixed(1)
          ),
        }}
      />

    </div>
  );
}
