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
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
  Eye,
  SlidersHorizontal
} from "lucide-react";
import { SolarEconomicsSection, SolarResourceData } from "@/components/economics/SolarEconomicsSection";
import { AiRoofAssessmentSection } from "@/components/ai/AiRoofAssessmentSection";
import { PropertyLocationMap } from "@/components/map/PropertyLocationMap";
import { RooftopSatelliteScanner } from "@/components/scanner/RooftopSatelliteScanner";

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
  monthlyBill?: number;
  currency?: "INR" | "USD";
}

export function ResultsView({
  onBackToInput,
  address = "1248 Solar Way, Palo Alto, CA",
  geocodedLocation,
  geocodeStatus = "IDLE",
  solarResourceData,
  onLocationChange,
  monthlyBill,
  currency,
}: ResultsViewProps) {
  const [measuredUsableArea, setMeasuredUsableArea] = React.useState(61.7);
  const [measuredCapacityKw, setMeasuredCapacityKw] = React.useState(4.8);

  const handleMeasurementsChange = React.useCallback((usableArea: number, capacityKw: number) => {
    setMeasuredUsableArea(usableArea);
    setMeasuredCapacityKw(capacityKw);
  }, []);

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
                    ? `COORDINATES: ${geocodedLocation.latitude.toFixed(4)}° N, ${geocodedLocation.longitude.toFixed(4)}° E`
                    : "GEOSPATIAL AUDIT"}
                </span>
                <span className="text-graphite-300">•</span>
                <span className="text-xs font-mono text-graphite-600 line-clamp-1 max-w-xl">
                  {geocodedLocation?.displayName || address}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-graphite-950">
                Your Roof Solar Assessment
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
                  HIGH SOLAR POTENTIAL
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Metrics Display (Strong Visual Hierarchy) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8 pt-2">
            
            {/* Metric 1: Usable Area */}
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-bold font-sans text-graphite-950 tracking-tight">
                {measuredUsableArea} <span className="text-xl sm:text-2xl font-normal text-graphite-500 font-mono">m²</span>
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Measured Usable Area
              </span>
            </div>

            {/* Metric 2: Recommended Capacity */}
            <div className="flex flex-col border-l border-graphite-200 pl-6">
              <span className="text-4xl sm:text-5xl font-bold font-sans text-solar-600 tracking-tight">
                {measuredCapacityKw} <span className="text-xl sm:text-2xl font-normal text-solar-500 font-mono">kW</span>
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Measured Capacity
              </span>
            </div>

            {/* Metric 3: Solar Exposure */}
            <div className="flex flex-col border-l border-graphite-200 pl-6">
              <span className="text-4xl sm:text-5xl font-bold font-sans text-emerald-700 tracking-tight">
                94%
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Annual Sun Exposure
              </span>
            </div>

            {/* Metric 4: Shading */}
            <div className="flex flex-col border-l border-graphite-200 pl-6">
              <span className="text-4xl sm:text-5xl font-bold font-sans text-graphite-950 tracking-tight">
                Low
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Obstacles Deducted
              </span>
            </div>

            {/* Metric 5: Primary Orientation */}
            <div className="flex flex-col border-l border-graphite-200 pl-6 col-span-2 md:col-span-1">
              <span className="text-3xl sm:text-4xl font-bold font-sans text-graphite-950 tracking-tight leading-tight">
                South-East
              </span>
              <span className="text-xs font-mono text-graphite-500 uppercase tracking-wider font-semibold mt-1">
                Optimal Pitch (135°)
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================
          STEP 1: LOCATION & GEOSPATIAL PROPERTY MAP
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 font-semibold block mb-1">
              STEP 1 — LOCATION CONTEXT
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
          STEP 2: REAL ROOFTOP SCANNER & SOLAR HEATMAP
         ======================================================== */}
      <RooftopSatelliteScanner
        latitude={geocodedLocation?.latitude || 37.4419}
        longitude={geocodedLocation?.longitude || -122.1430}
        address={geocodedLocation?.displayName || address}
        onMeasurementsChange={handleMeasurementsChange}
      />

      {/* ========================================================
          STEP 3: EXECUTIVE FEASIBILITY VERDICT & AI AUDIT
         ======================================================== */}
      <AiRoofAssessmentSection
        payload={{
          address: geocodedLocation?.displayName || address,
          suitabilityScore: 96,
          suitabilityLabel: "Highly Suitable",
          roofAreaSqM: Math.round((measuredUsableArea / 0.72) * 10) / 10,
          usableAreaSqM: measuredUsableArea,
          orientation: "South-East 135°",
          shading: "Low (Obstacles Masked)",
          solarExposurePercent: 94,
          recommendedCapacityKw: measuredCapacityKw,
          annualGenerationKwh: Math.round(measuredCapacityKw * (solarResourceData?.specificYieldKwhPerKw || 1400)),
          installationCostInr: Math.round(measuredCapacityKw * 41666),
          subsidyInr: Math.min(78000, Math.round(measuredCapacityKw * 18000)),
          annualSavingsInr: Math.round(measuredCapacityKw * (solarResourceData?.specificYieldKwhPerKw || 1400) * 6.5),
          paybackYears: Number(
            (
              (measuredCapacityKw * 41666 - Math.min(78000, measuredCapacityKw * 18000)) /
              (measuredCapacityKw * (solarResourceData?.specificYieldKwhPerKw || 1400) * 6.5)
            ).toFixed(1)
          ),
        }}
      />

      {/* ========================================================
          STEP 4: SOLAR ECONOMICS & PAYOFF (AUTO-CALCULATED)
         ======================================================== */}
      <SolarEconomicsSection
        initialMonthlyBill={monthlyBill}
        currency={currency}
        initialRoofSpaceSqM={measuredUsableArea}
        solarResourceData={solarResourceData}
      />

    </div>
  );
}
