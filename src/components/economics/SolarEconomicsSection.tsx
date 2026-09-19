"use client";

import * as React from "react";
import {
  formatINR,
  formatIndianNumber,
  calculateSolarEconomics,
  SolarCalculationResult
} from "./solarCalculator";
import {
  TrendingUp,
  DollarSign,
  Zap,
  ShieldCheck,
  Info,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  HelpCircle,
  Check
} from "lucide-react";

export interface SolarResourceData {
  annualSolarResource: number;
  specificYieldKwhPerKw: number;
  unit: string;
  source: string;
  dataYear: string;
  isEstimate: boolean;
  fallbackReason?: string;
}

interface SolarEconomicsSectionProps {
  systemSizeKw?: number;
  solarResourceData?: SolarResourceData | null;
}

export function SolarEconomicsSection({
  systemSizeKw = 4.8,
  solarResourceData,
}: SolarEconomicsSectionProps) {
  const [animatedProgress, setAnimatedProgress] = React.useState(0);
  const [showAssumptionsDrawer, setShowAssumptionsDrawer] = React.useState(false);

  // Calculate economics using transparent calculation engine
  const economics: SolarCalculationResult = React.useMemo(() => {
    const specificYield = solarResourceData?.specificYieldKwhPerKw || 1400;
    return calculateSolarEconomics({
      systemSizeKw,
      costPerKw: 41666, // ₹2,00,000 / 4.8 kW
      subsidyAmount: 78000, // PM Surya Ghar subsidy
      annualGenerationPerKw: specificYield,
      electricityTariffPerKwh: 6.5,
      analysisYears: 10,
      solarResourceGhi: solarResourceData?.annualSolarResource,
      isEstimate: solarResourceData?.isEstimate ?? true,
      solarSource: solarResourceData?.source || "Regional Climatological Fallback",
    });
  }, [systemSizeKw, solarResourceData]);

  // Trigger chart entrance animation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(1);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Compute SVG chart coordinates for 10-year cumulative cashflow
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 50;
  const paddingY = 30;

  const minCash = -economics.netInvestmentCost * 1.1; // e.g. -135,000
  const maxCash = economics.annualSavingsInr * 10 * 1.1; // e.g. +480,000
  const cashRange = maxCash - minCash;

  const points = economics.cumulativeCashflow.map((pt, i) => {
    const x = paddingX + (i / 10) * (chartWidth - 2 * paddingX);
    const normalizedY = (pt.netCash - minCash) / cashRange;
    const y = chartHeight - paddingY - normalizedY * (chartHeight - 2 * paddingY);
    return { x, y, year: pt.year, netCash: pt.netCash };
  });

  const svgPathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  // Find zero crossing Y coordinate
  const zeroY = chartHeight - paddingY - ((0 - minCash) / cashRange) * (chartHeight - 2 * paddingY);

  // Break-even point (approx year 4.2)
  const breakEvenX = paddingX + (economics.paybackYears / 10) * (chartWidth - 2 * paddingX);

  return (
    <section className="space-y-8 pt-6">
      
      {/* Section Title & Transparency Badges */}
      <div className="pb-4 hairline-b flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-solar-600 font-semibold block mb-1">
            FINANCIAL PRE-FEASIBILITY & ROI
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-sans text-graphite-950 tracking-tight">
            WILL SOLAR PAY OFF?
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Data Measured vs Estimate Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-md bg-graphite-100 border border-graphite-200 text-graphite-800 font-medium">
            <Zap className="w-3.5 h-3.5 text-solar-500" />
            <span>
              {economics.measured.solarResourceIsMeasured
                ? `Measured (${economics.measured.solarSource})`
                : `Estimate (${economics.measured.solarSource})`}
            </span>
          </div>

          {/* Roof Geometry Status Pill */}
          <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-md bg-solar-50 border border-solar-200 text-solar-950 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-solar-600" />
            <span>Preliminary Geometry</span>
          </div>
        </div>
      </div>

      {/* Visual Focal Point: Estimated Payback Hero Banner */}
      <div className="architectural-card rounded-2xl p-8 sm:p-10 border border-solar-400 bg-gradient-to-br from-solar-50/80 via-white to-solar-100/30 shadow-xl relative overflow-hidden">
        
        {/* Glow Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-solar-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Main Hero Payback Focal Point */}
          <div className="md:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-500 text-graphite-950 font-mono text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>PRIMARY ROI FOCAL POINT</span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-6xl sm:text-7xl font-bold font-sans tracking-tight text-graphite-950 leading-none">
                {economics.paybackYears}
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-solar-600">
                Years
              </span>
            </div>

            <span className="text-sm font-sans font-bold text-graphite-900 tracking-wide uppercase">
              Estimated payback period
            </span>

            <p className="text-xs font-sans text-graphite-600 mt-3 leading-relaxed max-w-md">
              Your system breaks even in <strong className="text-graphite-900">{economics.paybackYears} years</strong>. Every unit generated afterwards represents net profit for 20+ remaining operating years.
            </p>
          </div>

          {/* Quick Net Financial Summary */}
          <div className="md:col-span-6 bg-white/90 backdrop-blur-md rounded-xl p-6 border border-graphite-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 hairline-b text-xs font-mono">
              <span className="text-graphite-500">Gross Installation Cost</span>
              <span className="font-bold text-graphite-950">{formatINR(economics.installationCost)}</span>
            </div>

            <div className="flex justify-between items-center pb-3 hairline-b text-xs font-mono text-emerald-700">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Govt. Assistance (PM Surya Ghar)
              </span>
              <span className="font-bold">- {formatINR(economics.subsidyAmount)}</span>
            </div>

            <div className="flex justify-between items-center pt-1 text-sm font-mono font-bold text-graphite-950">
              <span>Estimated Net Investment</span>
              <span className="text-base text-solar-600">{formatINR(economics.netInvestmentCost)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 6 Key Financial & Technical Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Metric 1: System Size */}
        <div className="architectural-card rounded-xl p-5 border border-graphite-200">
          <span className="block text-[10px] font-mono uppercase text-graphite-500 font-semibold mb-1">
            System Size
          </span>
          <span className="text-2xl font-bold font-sans text-graphite-950">
            {economics.derived.systemSizeKw} kW
          </span>
          <span className="block text-[10px] font-mono text-solar-700 font-semibold mt-1">
            {economics.derived.panelCount} x 540W Panels
          </span>
        </div>

        {/* Metric 2: Installation Cost */}
        <div className="architectural-card rounded-xl p-5 border border-graphite-200">
          <span className="block text-[10px] font-mono uppercase text-graphite-500 font-semibold mb-1">
            Installation Cost
          </span>
          <span className="text-2xl font-bold font-sans text-graphite-950">
            {formatINR(economics.installationCost)}
          </span>
          <span className="block text-[10px] font-mono text-graphite-400 mt-1">Turnkey Estimate</span>
        </div>

        {/* Metric 3: Govt Assistance */}
        <div className="architectural-card rounded-xl p-5 border border-emerald-200 bg-emerald-50/40">
          <span className="block text-[10px] font-mono uppercase text-emerald-800 font-semibold mb-1">
            Govt Assistance
          </span>
          <span className="text-2xl font-bold font-sans text-emerald-700">
            {formatINR(economics.subsidyAmount)}
          </span>
          <span className="block text-[10px] font-mono text-emerald-600 mt-1">PM Surya Ghar</span>
        </div>

        {/* Metric 4: Net Investment */}
        <div className="architectural-card rounded-xl p-5 border border-solar-300 bg-solar-50/30">
          <span className="block text-[10px] font-mono uppercase text-solar-900 font-semibold mb-1">
            Net Investment
          </span>
          <span className="text-2xl font-bold font-sans text-solar-600">
            {formatINR(economics.netInvestmentCost)}
          </span>
          <span className="block text-[10px] font-mono text-solar-800 mt-1">Out-of-Pocket</span>
        </div>

        {/* Metric 5: Annual Generation */}
        <div className="architectural-card rounded-xl p-5 border border-graphite-200">
          <span className="block text-[10px] font-mono uppercase text-graphite-500 font-semibold mb-1">
            Annual Generation
          </span>
          <span className="text-2xl font-bold font-sans text-graphite-950">
            {formatIndianNumber(economics.annualGenerationKwh)} <span className="text-xs font-mono text-graphite-500 font-normal">kWh</span>
          </span>
          <span className="block text-[10px] font-mono text-graphite-400 mt-1">
            {economics.derived.specificYieldKwhPerKw} kWh/kW/yr
          </span>
        </div>

        {/* Metric 6: Annual Savings */}
        <div className="architectural-card rounded-xl p-5 border border-emerald-200">
          <span className="block text-[10px] font-mono uppercase text-emerald-800 font-semibold mb-1">
            Annual Savings
          </span>
          <span className="text-2xl font-bold font-sans text-emerald-600">
            {formatINR(economics.annualSavingsInr)}
          </span>
          <span className="block text-[10px] font-mono text-emerald-600 mt-1">/ Year Savings</span>
        </div>

      </div>

      {/* Cumulative Savings Chart */}
      <div className="architectural-card rounded-2xl p-6 sm:p-8 border border-graphite-200 bg-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 hairline-b">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-lg font-bold font-sans text-graphite-950">
                10-Year Cumulative Cashflow & Break-Even Curve
              </h3>
            </div>
            <p className="text-xs font-mono text-graphite-500 mt-0.5">
              Net cumulative financial position over 10 operating years
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 rounded" />
              <span>Cumulative Net Cash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-solar-500" />
              <span>Break-Even ({economics.paybackYears} Yrs)</span>
            </div>
          </div>
        </div>

        {/* SVG Cumulative Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[650px] relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto text-graphite-900"
            >
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1={paddingX} y1={zeroY} x2={chartWidth - paddingX} y2={zeroY} stroke="#d4d4ce" strokeWidth="1.5" strokeDasharray="4 4" />
              
              {points.map((pt) => (
                <g key={pt.year}>
                  <line x1={pt.x} y1={paddingY} x2={pt.x} y2={chartHeight - paddingY} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
                  <text x={pt.x} y={chartHeight - 8} fill="#73736c" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    Yr {pt.year}
                  </text>
                </g>
              ))}

              <text x={paddingX + 5} y={zeroY - 6} fill="#16a34a" fontSize="10" fontFamily="monospace" fontWeight="bold">
                ₹0 (Break-Even Threshold)
              </text>

              <path
                d={`${svgPathD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`}
                fill="url(#savingsGradient)"
                style={{
                  opacity: animatedProgress,
                  transition: "opacity 600ms ease-out",
                }}
              />

              <path
                d={svgPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 2000,
                  strokeDashoffset: animatedProgress === 1 ? 0 : 2000,
                  transition: "stroke-dashoffset 1200ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />

              <circle
                cx={breakEvenX}
                cy={zeroY}
                r="6"
                fill="#e6a100"
                stroke="#ffffff"
                strokeWidth="2"
                className="animate-pulse"
              />
              <text x={breakEvenX} y={zeroY - 12} fill="#e6a100" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                Break-Even ({economics.paybackYears} Yrs)
              </text>

              {points.map((pt) => (
                <circle
                  key={pt.year}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill={pt.netCash >= 0 ? "#10b981" : "#0d0d0b"}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          TRANSPARENT ASSUMPTIONS & ENGINE INSPECTION DRAWER
         ======================================================== */}
      <div className="architectural-card rounded-2xl border border-graphite-200 bg-white overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => setShowAssumptionsDrawer(!showAssumptionsDrawer)}
          className="w-full px-6 py-4 bg-graphite-50 hover:bg-graphite-100/80 transition-colors flex items-center justify-between text-left font-mono"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-solar-600" />
            <span className="font-bold text-sm text-graphite-950 uppercase tracking-wide">
              CALCULATION ENGINE & EXPLICIT ASSUMPTIONS INSPECTOR
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-graphite-500 font-sans">
            <span>{showAssumptionsDrawer ? "Hide Formulas & Parameters" : "View Formulas & Parameters"}</span>
            {showAssumptionsDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAssumptionsDrawer && (
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in hairline-t bg-white">
            
            {/* 4 Category Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              
              {/* Category 1: Measured Data */}
              <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-3">
                <span className="font-bold text-cyan-900 uppercase block tracking-wider font-mono">
                  1. MEASURED DATA
                </span>
                <div className="space-y-1.5 text-cyan-950">
                  <div className="flex justify-between">
                    <span className="text-cyan-800">Coordinates:</span>
                    <span className="font-bold">
                      {economics.measured.latitude ? `${economics.measured.latitude.toFixed(4)}° N, ${economics.measured.longitude?.toFixed(4)}° W` : "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-800">Solar Resource (GHI):</span>
                    <span className="font-bold">
                      {economics.measured.solarResourceGhi ? `${economics.measured.solarResourceGhi} kWh/m²/yr` : "Fallback used"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-800">Data Source:</span>
                    <span className="font-bold">{economics.measured.solarSource}</span>
                  </div>
                </div>
              </div>

              {/* Category 2: Derived Calculations */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <span className="font-bold text-emerald-900 uppercase block tracking-wider font-mono">
                  2. DERIVED CALCULATIONS
                </span>
                <div className="space-y-1.5 text-emerald-950">
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Specific Yield:</span>
                    <span className="font-bold">{economics.derived.specificYieldKwhPerKw} kWh/kW/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-800">System Capacity:</span>
                    <span className="font-bold">{economics.derived.systemSizeKw} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Module Count:</span>
                    <span className="font-bold">{economics.derived.panelCount} Panels ({economics.derived.requiredRoofAreaSqM} m²)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Annual Offset:</span>
                    <span className="font-bold">{economics.derived.electricityOffsetPercent}% of bill</span>
                  </div>
                </div>
              </div>

              {/* Category 3: Explicit Assumptions */}
              <div className="p-4 rounded-xl bg-solar-50/50 border border-solar-200 space-y-3">
                <span className="font-bold text-solar-900 uppercase block tracking-wider font-mono">
                  3. EXPLICIT ASSUMPTIONS (PARAMETERS)
                </span>
                <div className="space-y-1.5 text-solar-950">
                  <div className="flex justify-between">
                    <span className="text-solar-800">Module Wattage:</span>
                    <span className="font-bold">{economics.assumptions.panelWattageW} W Monocrystalline</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-solar-800">System Performance Ratio:</span>
                    <span className="font-bold">{(economics.assumptions.performanceRatio * 100).toFixed(0)}% (19% losses)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-solar-800">Assumed Tariff:</span>
                    <span className="font-bold">₹{economics.assumptions.electricityTariffInrPerKwh}/kWh (3% annual escalation)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-solar-800">Benchmark Cost:</span>
                    <span className="font-bold">₹{economics.assumptions.costPerKwInr.toLocaleString()}/kW</span>
                  </div>
                </div>
              </div>

              {/* Category 4: Unavailable Data & Notice */}
              <div className="p-4 rounded-xl bg-graphite-100 border border-graphite-200 space-y-3">
                <span className="font-bold text-graphite-900 uppercase block tracking-wider font-mono">
                  4. UNAVAILABLE DATA & NOTICES
                </span>
                <p className="text-[11px] font-sans text-graphite-700 leading-relaxed">
                  {economics.unavailableData.roofGeometryNotice}
                </p>
                {economics.unavailableData.solarResourceNotice && (
                  <p className="text-[11px] font-sans text-solar-900 font-semibold leading-relaxed">
                    {economics.unavailableData.solarResourceNotice}
                  </p>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Mandatory Footnote */}
      <div className="p-4 rounded-xl bg-graphite-100 border border-graphite-200 flex items-start gap-3 text-xs font-sans text-graphite-600">
        <AlertCircle className="w-4 h-4 text-graphite-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Note:</strong> Financial projections are deterministic estimates using explicit assumptions (e.g. ₹6.50/kWh assumed tariff, 81% system efficiency). Final savings depend on physical roof geometry and utility bill verification.
        </p>
      </div>

    </section>
  );
}
