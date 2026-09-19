"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  MapPin,
  ArrowRight,
  Sun,
  Zap,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Compass
} from "lucide-react";
import dynamic from "next/dynamic";
import { DEMO_SCENARIOS, ANALYSIS_STEPS, ScenarioType } from "./assessmentData";
import { ResultsView } from "@/components/results/ResultsView";

const RoofScene = dynamic(
  () => import("@/components/hero/RoofScene").then((mod) => mod.RoofScene),
  {
    loading: () => (
      <div className="w-full h-full min-h-[400px] bg-graphite-900 flex items-center justify-center text-graphite-400 font-mono text-xs">
        Loading 3D Engine...
      </div>
    ),
    ssr: false,
  }
);

interface AssessmentFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress?: string;
  initialBill?: number;
}

import { AlertCircle } from "lucide-react";

export type GeocodeStatus = "IDLE" | "LOADING" | "SUCCESS" | "NO_RESULT" | "ERROR";

export interface GeocodedLocation {
  displayName: string;
  latitude: number;
  longitude: number;
}

type FlowStep = "INPUT" | "ANALYZING" | "RESULTS";

export function AssessmentFlowModal({
  isOpen,
  onClose,
  initialAddress = "Palo Alto, California",
  initialBill = 240,
}: AssessmentFlowModalProps) {
  const [step, setStep] = React.useState<FlowStep>("INPUT");
  const [address, setAddress] = React.useState(initialAddress);
  const [monthlyBill, setMonthlyBill] = React.useState(initialBill);
  const [selectedScenario, setSelectedScenario] = React.useState<ScenarioType>("GOOD");
  
  // Geocoding State
  const [geocodeStatus, setGeocodeStatus] = React.useState<GeocodeStatus>("IDLE");
  const [geocodeError, setGeocodeError] = React.useState<string | null>(null);
  const [resolvedLocation, setResolvedLocation] = React.useState<GeocodedLocation | null>(null);

  // Analysis progress
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = React.useState(0);
  const [progressPercent, setProgressPercent] = React.useState(0);

  // Sync initial props
  React.useEffect(() => {
    if (isOpen) {
      setAddress(initialAddress);
      setMonthlyBill(initialBill);
      setGeocodeStatus("IDLE");
      setGeocodeError(null);
    }
  }, [isOpen, initialAddress, initialBill]);

  // Handle scenario preset select in input stage
  const handleSelectPreset = (scen: ScenarioType) => {
    setSelectedScenario(scen);
    setAddress(DEMO_SCENARIOS[scen].address);
    setMonthlyBill(DEMO_SCENARIOS[scen].monthlyBill);
    setGeocodeStatus("IDLE");
    setGeocodeError(null);
  };

  // Start analysis flow with server-side geocoding lookup
  const handleStartAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!address || !address.trim()) {
      setGeocodeStatus("ERROR");
      setGeocodeError("Please enter a valid property address or location name.");
      return;
    }

    setGeocodeStatus("LOADING");
    setGeocodeError(null);

    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 404 || data.error?.includes("No geocoding match")) {
          setGeocodeStatus("NO_RESULT");
        } else {
          setGeocodeStatus("ERROR");
        }
        setGeocodeError(data.error || "Could not resolve geographic location for this address.");
        return;
      }

      setGeocodeStatus("SUCCESS");
      setResolvedLocation({
        displayName: data.displayName,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      // Proceed to step 2 (ANALYZING)
      setStep("ANALYZING");
      setCurrentAnalysisIndex(0);
      setProgressPercent(0);
    } catch (err: any) {
      console.warn("Geocoding API call error:", err);
      setGeocodeStatus("ERROR");
      setGeocodeError("Network connection issue while resolving address coordinates. Please try again.");
    }
  };

  // Run progress timer during ANALYZING step
  React.useEffect(() => {
    if (step !== "ANALYZING") return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setStep("RESULTS");
          }, 400);
          return 100;
        }
        const next = prev + 3;
        // Update analysis step index
        const stepIdx = Math.min(
          Math.floor((next / 100) * ANALYSIS_STEPS.length),
          ANALYSIS_STEPS.length - 1
        );
        setCurrentAnalysisIndex(stepIdx);
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [step]);

  // Dynamic annotations for 3D scanning stage
  const scanningAnnotations = [
    {
      id: "area",
      position: [-3.8, 4.2, -1.8] as [number, number, number],
      label: "Usable Roof Area",
      value: "61.7 m²",
    },
    {
      id: "exposure",
      position: [3.8, 4.5, -1.2] as [number, number, number],
      label: "Solar Exposure",
      value: "High (94%)",
    },
    {
      id: "capacity",
      position: [-1.2, 4.8, 2.2] as [number, number, number],
      label: "System Capacity",
      value: "4.8 kW",
    },
    {
      id: "orientation",
      position: [3.5, 3.2, 2.5] as [number, number, number],
      label: "Orientation",
      value: "South-East 135°",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-graphite-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-graphite-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-white hairline-b flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-solar-500 flex items-center justify-center text-graphite-950 font-bold">
              <Sun className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-graphite-950 tracking-tight text-sm font-sans">
              SURYASCOPE
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-graphite-100 text-graphite-600 border border-graphite-200">
              Pre-Feasibility Audit Engine
            </span>
          </div>

          {/* Breadcrumb Steps Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className={step === "INPUT" ? "text-solar-600 font-bold" : "text-graphite-400"}>
              1. Input
            </span>
            <ChevronRight className="w-3 h-3 text-graphite-300" />
            <span className={step === "ANALYZING" ? "text-solar-600 font-bold" : "text-graphite-400"}>
              2. Analysis
            </span>
            <ChevronRight className="w-3 h-3 text-graphite-300" />
            <span className={step === "RESULTS" ? "text-solar-600 font-bold" : "text-graphite-400"}>
              3. Results
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-graphite-400 hover:text-graphite-950 hover:bg-graphite-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto">
          
          {/* ========================================================
              STEP 1: PROPERTY INPUT
             ======================================================== */}
          {step === "INPUT" && (
            <div className="p-8 sm:p-12 max-w-2xl mx-auto flex flex-col justify-center min-h-[480px]">
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-100 text-solar-900 border border-solar-300 text-xs font-mono uppercase tracking-wider mb-3">
                  <MapPin className="w-3.5 h-3.5 text-solar-600" />
                  <span>PRE-FEASIBILITY AUDIT</span>
                </div>
                <h2 className="text-3xl font-bold font-sans text-graphite-950 tracking-tight mb-2">
                  Enter property details.
                </h2>
                <p className="text-sm font-sans text-graphite-600">
                  Provide your address and electricity bill to evaluate rooftop solar suitability.
                </p>
              </div>

              {/* Demo Scenario Presets */}
              <div className="mb-6 p-3 bg-graphite-50 rounded-xl border border-graphite-200">
                <span className="block text-[11px] font-mono text-graphite-500 uppercase mb-2 font-semibold text-center">
                  Select Demo Property Scenario:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset("GOOD")}
                    className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all text-center ${
                      selectedScenario === "GOOD"
                        ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs"
                        : "bg-white text-graphite-700 border-graphite-200 hover:border-emerald-400"
                    }`}
                  >
                    High Potential (96%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset("MODERATE")}
                    className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all text-center ${
                      selectedScenario === "MODERATE"
                        ? "bg-solar-500 text-graphite-950 border-solar-500 font-bold shadow-xs"
                        : "bg-white text-graphite-700 border-graphite-200 hover:border-solar-400"
                    }`}
                  >
                    Moderate (74%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset("POOR")}
                    className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all text-center ${
                      selectedScenario === "POOR"
                        ? "bg-graphite-900 text-white border-graphite-900 font-bold shadow-xs"
                        : "bg-white text-graphite-700 border-graphite-200 hover:border-graphite-400"
                    }`}
                  >
                    Sub-Optimal (48%)
                  </button>
                </div>
              </div>

              {/* Geocoding Error Alert */}
              {(geocodeStatus === "NO_RESULT" || geocodeStatus === "ERROR") && geocodeError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-sans flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5 font-mono uppercase text-[10px] text-red-800">
                      Location Geocoding Notice
                    </span>
                    <span>{geocodeError}</span>
                  </div>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleStartAnalysis} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-graphite-700 uppercase font-semibold mb-2">
                    Property Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-400" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 1248 Solar Way, Palo Alto, CA"
                      className="w-full pl-10 pr-4 py-3 text-sm font-sans bg-white border border-graphite-300 rounded-lg text-graphite-950 focus:outline-none focus:border-solar-500 focus:ring-1 focus:ring-solar-500 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono text-graphite-700 uppercase font-semibold">
                      Monthly Electricity Bill
                    </label>
                    <span className="text-sm font-bold font-mono text-solar-600">
                      ${monthlyBill} / month
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="800"
                    step="10"
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="w-full h-2 bg-graphite-200 rounded-lg appearance-none cursor-pointer accent-solar-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-graphite-400 mt-1">
                    <span>$50</span>
                    <span>$400</span>
                    <span>$800+</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={geocodeStatus === "LOADING"}
                  className="w-full bg-graphite-950 hover:bg-graphite-900 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all text-sm"
                >
                  {geocodeStatus === "LOADING" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-solar-400" />
                      <span>Resolving Location Coordinates...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyse My Roof</span>
                      <ArrowRight className="w-4 h-4 text-solar-400" />
                    </>
                  )}
                </Button>
              </form>

            </div>
          )}

          {/* ========================================================
              STEP 2: CINEMATIC ANALYSIS PROGRESS
             ======================================================== */}
          {step === "ANALYZING" && (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[520px]">
              
              {/* Left Column: Progress Steps */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-100 text-solar-900 text-xs font-mono uppercase tracking-wider mb-4">
                    <RefreshCw className="w-3.5 h-3.5 text-solar-600 animate-spin" />
                    <span>SOLAR SCAN IN PROGRESS</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold font-sans text-graphite-950 mb-1">
                    Analysing {resolvedLocation?.displayName ? resolvedLocation.displayName.split(",")[0] : address}
                  </h2>
                  {resolvedLocation && (
                    <p className="text-xs font-mono text-cyan-600 font-semibold mb-2">
                      Coordinates: {resolvedLocation.latitude.toFixed(4)}° N, {resolvedLocation.longitude.toFixed(4)}° W
                    </p>
                  )}
                  <p className="text-xs font-mono text-graphite-500 mb-8">
                    Calculating structural geometry & hourly solar irradiance...
                  </p>

                  {/* Progress Ticker Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between text-xs font-mono font-semibold mb-2">
                      <span className="text-graphite-700">Analysis Progress</span>
                      <span className="text-solar-600">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-graphite-100 rounded-full overflow-hidden hairline-box">
                      <div
                        className="h-full bg-gradient-to-r from-solar-500 to-solar-400 transition-all duration-150 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* 6 Sequential Steps Checklist */}
                  <div className="space-y-3">
                    {ANALYSIS_STEPS.map((s, idx) => {
                      const isDone = idx < currentAnalysisIndex;
                      const isCurrent = idx === currentAnalysisIndex;

                      return (
                        <div
                          key={s.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg transition-all ${
                            isCurrent
                              ? "bg-solar-50 border border-solar-200"
                              : isDone
                              ? "opacity-75"
                              : "opacity-40"
                          }`}
                        >
                          <div className="mt-0.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isCurrent ? (
                              <div className="w-4 h-4 border-2 border-solar-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-graphite-300" />
                            )}
                          </div>
                          <div>
                            <span
                              className={`block text-xs font-sans font-semibold ${
                                isCurrent ? "text-graphite-950" : "text-graphite-700"
                              }`}
                            >
                              {s.label}
                            </span>
                            <span className="text-[10px] font-mono text-graphite-500">
                              {s.detail}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Roof Scanning Viewport */}
              <div className="lg:col-span-7 h-full min-h-[420px] rounded-xl border border-graphite-200 bg-white overflow-hidden relative shadow-lg">
                <RoofScene annotations={scanningAnnotations} />

                {/* Scanning Beam Visual Overlay */}
                <div className="absolute top-4 right-4 z-10 bg-graphite-950/85 backdrop-blur-md border border-graphite-800 text-white px-3 py-1.5 rounded-md text-[10px] font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-solar-400 animate-ping" />
                  <span>CADASTRE MESH SCAN ACTIVE</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              STEP 3: SURYASCOPE RESULTS EXPERIENCE
             ======================================================== */}
          {step === "RESULTS" && (
            <div className="relative">
              <ResultsView
                onBackToInput={() => setStep("INPUT")}
                address={address}
                geocodedLocation={resolvedLocation}
                geocodeStatus={geocodeStatus}
              />

              {/* Bottom Sticky Action Bar */}
              <div className="p-6 bg-white hairline-t flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-30">
                <Button
                  onClick={() => setStep("INPUT")}
                  variant="outline"
                  className="w-full sm:w-auto border-graphite-300 text-graphite-900 flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4 text-graphite-500" />
                  <span>Modify Property Input</span>
                </Button>

                <Button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-graphite-950 hover:bg-graphite-900 text-white px-7 py-2.5 text-xs font-medium rounded-lg flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Done & Return to Home</span>
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
