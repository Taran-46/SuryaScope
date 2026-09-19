"use client";

import * as React from "react";
import {
  AiAssessmentPayload,
  AiReportSections,
  generateLocalAiReport
} from "@/lib/ai/aiAssessmentEngine";
import {
  Sparkles,
  Compass,
  DollarSign,
  CheckSquare,
  Award,
  AlertTriangle,
  RefreshCw,
  Cpu,
  FileText
} from "lucide-react";

interface AiRoofAssessmentSectionProps {
  payload?: Partial<AiAssessmentPayload>;
}

export function AiRoofAssessmentSection({ payload }: AiRoofAssessmentSectionProps) {
  const [loading, setLoading] = React.useState(false);
  const [report, setReport] = React.useState<AiReportSections | null>(null);

  const fullPayload: AiAssessmentPayload = React.useMemo(() => {
    return {
      address: payload?.address || "1248 Solar Way, Palo Alto, CA",
      suitabilityScore: payload?.suitabilityScore ?? 96,
      suitabilityLabel: payload?.suitabilityLabel || "Highly Suitable",
      roofAreaSqM: payload?.roofAreaSqM ?? 84.5,
      usableAreaSqM: payload?.usableAreaSqM ?? 61.7,
      orientation: payload?.orientation || "South-East 135°",
      shading: payload?.shading || "Low (0% Obstruction)",
      solarExposurePercent: payload?.solarExposurePercent ?? 94,
      recommendedCapacityKw: payload?.recommendedCapacityKw ?? 4.8,
      annualGenerationKwh: payload?.annualGenerationKwh ?? 6720,
      installationCostInr: payload?.installationCostInr ?? 200000,
      subsidyInr: payload?.subsidyInr ?? 78000,
      annualSavingsInr: payload?.annualSavingsInr ?? 43680,
      paybackYears: payload?.paybackYears ?? 4.2,
    };
  }, [payload]);

  // Fetch report on mount or when payload changes
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchAiReport() {
      try {
        const res = await fetch("/api/ai-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullPayload),
        });

        if (!res.ok) throw new Error("API non-200");
        const data: AiReportSections = await res.json();
        if (isMounted) {
          setReport(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Client fetch error, using local report fallback:", err);
        if (isMounted) {
          setReport(generateLocalAiReport(fullPayload));
          setLoading(false);
        }
      }
    }

    fetchAiReport();

    return () => {
      isMounted = false;
    };
  }, [fullPayload]);

  const activeReport = report || generateLocalAiReport(fullPayload);

  return (
    <section className="space-y-6 pt-6">
      
      {/* Section Header */}
      <div className="pb-4 hairline-b flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-solar-600 font-semibold block mb-1">
            INTELLIGENT REPORT EXPLANATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-sans text-graphite-950 tracking-tight">
            AI Roof Assessment
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md border bg-graphite-900 text-white border-graphite-800">
          <Cpu className="w-3.5 h-3.5 text-solar-400" />
          <span>
            {activeReport.isFallback
              ? "Deterministic Assessment Report (Local)"
              : "AI Satellite Report Model"}
          </span>
        </div>
      </div>

      {/* Main Structured Report Card */}
      <div className="architectural-card rounded-2xl p-8 sm:p-10 border border-graphite-200 bg-white shadow-xl space-y-8 relative">
        
        {/* Loading Overlay Ticker */}
        {loading && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-solar-100 text-solar-900 text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-solar-600" />
            <span>Generating Intelligent Explanation...</span>
          </div>
        )}

        {/* Report Subheader */}
        <div className="flex items-center gap-3 pb-6 hairline-b">
          <div className="w-10 h-10 rounded-lg bg-graphite-950 flex items-center justify-center text-solar-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-sans text-graphite-950">
              Technical Audit Brief — {fullPayload.address}
            </h3>
            <p className="text-xs font-mono text-graphite-500">
              Source of truth: Suryascope Deterministic Cadastral Engine
            </p>
          </div>
        </div>

        {/* 4 Structured Report Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: WHY THIS ROOF SCORED THIS WAY */}
          <div className="architectural-card rounded-xl p-6 border border-graphite-200 bg-graphite-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-solar-900 mb-3">
                <Award className="w-4 h-4 text-solar-600" />
                <span>WHY THIS ROOF SCORED THIS WAY</span>
              </div>
              <p className="text-xs font-sans text-graphite-700 leading-relaxed">
                {activeReport.whyItScored}
              </p>
            </div>
            <div className="pt-4 mt-4 hairline-t text-[11px] font-mono text-graphite-500 flex justify-between">
              <span>Suitability Index:</span>
              <span className="font-bold text-graphite-900">{fullPayload.suitabilityScore}/100</span>
            </div>
          </div>

          {/* Section 2: BEST ROOF SECTION */}
          <div className="architectural-card rounded-xl p-6 border border-graphite-200 bg-graphite-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-900 mb-3">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>BEST ROOF SECTION</span>
              </div>
              <p className="text-xs font-sans text-graphite-700 leading-relaxed">
                {activeReport.bestRoofSection}
              </p>
            </div>
            <div className="pt-4 mt-4 hairline-t text-[11px] font-mono text-graphite-500 flex justify-between">
              <span>Optimal Surface:</span>
              <span className="font-bold text-emerald-700">{fullPayload.usableAreaSqM} m² ({fullPayload.orientation})</span>
            </div>
          </div>

          {/* Section 3: FINANCIAL SUMMARY */}
          <div className="architectural-card rounded-xl p-6 border border-graphite-200 bg-graphite-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-solar-900 mb-3">
                <DollarSign className="w-4 h-4 text-solar-600" />
                <span>FINANCIAL SUMMARY</span>
              </div>
              <p className="text-xs font-sans text-graphite-700 leading-relaxed">
                {activeReport.financialSummary}
              </p>
            </div>
            <div className="pt-4 mt-4 hairline-t text-[11px] font-mono text-graphite-500 flex justify-between">
              <span>Estimated Payback:</span>
              <span className="font-bold text-solar-600">{fullPayload.paybackYears} Years</span>
            </div>
          </div>

          {/* Section 4: WHAT TO DO NEXT */}
          <div className="architectural-card rounded-xl p-6 border border-graphite-200 bg-graphite-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-graphite-900 mb-3">
                <CheckSquare className="w-4 h-4 text-graphite-800" />
                <span>WHAT TO DO NEXT</span>
              </div>
              <div className="text-xs font-sans text-graphite-700 leading-relaxed whitespace-pre-line">
                {activeReport.whatToDoNext}
              </div>
            </div>
            <div className="pt-4 mt-4 hairline-t text-[11px] font-mono text-graphite-500 flex justify-between">
              <span>Action:</span>
              <span className="font-bold text-graphite-900">Physical Site Survey Prep</span>
            </div>
          </div>

        </div>

      </div>

      {/* Mandatory Technical Disclaimer */}
      <div className="p-4 rounded-xl bg-solar-50 border border-solar-200 flex items-start gap-3 text-xs font-sans text-solar-900">
        <AlertTriangle className="w-4 h-4 text-solar-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Mandatory Notice:</strong> This is a preliminary satellite-based assessment. A physical site survey is required before installation.
        </p>
      </div>

    </section>
  );
}
