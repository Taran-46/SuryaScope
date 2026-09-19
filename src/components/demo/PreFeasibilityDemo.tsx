"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Sparkles, Check, ArrowRight, Sun, DollarSign, Calendar, Zap, RefreshCw } from "lucide-react";

interface PreFeasibilityDemoProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenAnalysis?: (address?: string) => void;
}

export function PreFeasibilityDemo({ isOpen, onClose, onOpenAnalysis }: PreFeasibilityDemoProps) {
  const [address, setAddress] = React.useState("Palo Alto, California");
  const [monthlyBill, setMonthlyBill] = React.useState(220);
  const [calculating, setCalculating] = React.useState(false);
  const [hasResult, setHasResult] = React.useState(true);

  const presets = [
    { label: "Suburban Villa", address: "Palo Alto, California", bill: 220, capacity: "5.2 kW", payback: "3.9 yrs", score: "96/100" },
    { label: "Urban Single House", address: "Austin, Texas", bill: 180, capacity: "4.2 kW", payback: "4.1 yrs", score: "92/100" },
    { label: "Coastal Residence", address: "Miami, Florida", bill: 310, capacity: "7.8 kW", payback: "3.4 yrs", score: "98/100" },
  ];

  const handleRunAnalysis = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onOpenAnalysis) {
      onOpenAnalysis(address);
    } else {
      setCalculating(true);
      setTimeout(() => {
        setCalculating(false);
        setHasResult(true);
      }, 400);
    }
  };

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setAddress(preset.address);
    setMonthlyBill(preset.bill);
    if (onOpenAnalysis) {
      onOpenAnalysis(preset.address);
    } else {
      handleRunAnalysis();
    }
  };

  // Calculations based on monthly bill
  const estimatedSystemKw = (monthlyBill / 45).toFixed(1);
  const estimatedAnnualSavings = Math.round(monthlyBill * 10.8);
  const estimatedPaybackYears = (12000 / estimatedAnnualSavings).toFixed(1);

  return (
    <section id="demo" className="py-24 bg-background relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite-900 text-white text-xs font-mono uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-solar-400" />
            <span>INSTANT ASSESSMENT SIMULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-graphite-950 mb-4">
            Test your property&apos;s solar feasibility.
          </h2>
          <p className="text-base font-sans text-graphite-600 max-w-xl mx-auto">
            Select a sample property or enter an address to preview Suryascope&apos;s pre-feasibility analysis.
          </p>
        </div>

        {/* Interactive Search Card */}
        <div className="max-w-4xl mx-auto architectural-card rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-xs font-mono text-graphite-500 mr-2">Sample Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-all ${
                  address === p.address
                    ? "bg-graphite-950 text-white border-graphite-950 shadow-xs"
                    : "bg-white text-graphite-700 border-graphite-200 hover:border-solar-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Address Form */}
          <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter street address, city, state..."
                className="w-full pl-10 pr-4 py-3 text-sm font-sans bg-white border border-graphite-300 rounded-lg text-graphite-950 focus:outline-none focus:border-solar-500 focus:ring-1 focus:ring-solar-500 transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 bg-white border border-graphite-300 rounded-lg px-3 py-2 sm:w-48">
              <span className="text-xs font-mono text-graphite-500 font-semibold">$</span>
              <input
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                placeholder="Monthly Bill"
                className="w-full text-sm font-sans font-semibold text-graphite-950 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-graphite-400 uppercase">/mo</span>
            </div>

            <Button
              type="submit"
              disabled={calculating}
              className="bg-solar-500 hover:bg-solar-600 text-graphite-950 font-semibold px-6 py-3 text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {calculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-graphite-950" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Analyse Roof</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Feasibility Result Preview Card */}
          {hasResult && (
            <div className="bg-graphite-950 text-white rounded-xl p-6 sm:p-8 hairline-box shadow-2xl animate-fade-in space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 hairline-b border-graphite-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-graphite-400">
                      Pre-Feasibility Audit Status: Highly Suitable
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-sans text-white">{address}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[10px] font-mono text-graphite-400 uppercase">Suitability Index</span>
                    <span className="text-lg font-bold font-mono text-solar-400">96 / 100</span>
                  </div>
                </div>
              </div>

              {/* Generated Feasibility Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-1.5 text-graphite-400 text-xs font-mono mb-1">
                    <Zap className="w-3.5 h-3.5 text-solar-400" />
                    <span>Est. System Size</span>
                  </div>
                  <span className="text-2xl font-bold font-sans text-white">{estimatedSystemKw} kWp</span>
                  <span className="block text-[11px] text-graphite-400 font-mono mt-0.5">14 High-Eff Panels</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-graphite-400 text-xs font-mono mb-1">
                    <Sun className="w-3.5 h-3.5 text-solar-400" />
                    <span>Usable Roof Area</span>
                  </div>
                  <span className="text-2xl font-bold font-sans text-white">61.7 m²</span>
                  <span className="block text-[11px] text-emerald-400 font-mono mt-0.5">South-Facing (94% Exposure)</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-graphite-400 text-xs font-mono mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Annual Savings</span>
                  </div>
                  <span className="text-2xl font-bold font-sans text-emerald-400">${estimatedAnnualSavings.toLocaleString()}</span>
                  <span className="block text-[11px] text-graphite-400 font-mono mt-0.5">Offset ~82% Bill</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-graphite-400 text-xs font-mono mb-1">
                    <Calendar className="w-3.5 h-3.5 text-solar-400" />
                    <span>Est. Payback</span>
                  </div>
                  <span className="text-2xl font-bold font-sans text-white">{estimatedPaybackYears} Years</span>
                  <span className="block text-[11px] text-graphite-400 font-mono mt-0.5">IRR ~19.4%</span>
                </div>
              </div>

              {/* Action Button to launch full interactive 3D audit */}
              <div className="pt-4 border-t border-graphite-800 flex justify-end">
                <Button
                  onClick={() => onOpenAnalysis && onOpenAnalysis(address)}
                  className="bg-solar-500 hover:bg-solar-600 text-graphite-950 font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
                >
                  <span>Launch 3D Cadastre Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
