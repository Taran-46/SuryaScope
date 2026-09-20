"use client";

import * as React from "react";
import {
  AiAssessmentPayload,
  AiReportSections,
  generateLocalAiReport
} from "@/lib/ai/aiAssessmentEngine";
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Calendar,
  AlertCircle
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
      shading: payload?.shading || "Low (Obstacles Deducted)",
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
  const verdict = activeReport.siteVisitVerdict;

  return (
    <section className="space-y-6 pt-4">
      
      {/* Section Header */}
      <div className="pb-3 hairline-b flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-700 font-semibold block mb-1">
            EXECUTIVE AUDIT SUMMARY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-sans text-graphite-950 tracking-tight">
            AI Feasibility Verdict
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md border bg-graphite-900 text-white border-graphite-800">
          <Cpu className="w-3.5 h-3.5 text-solar-400" />
          <span>
            {activeReport.isFallback
              ? "Deterministic Pre-Audit Engine"
              : "Gemini / AI Verified"}
          </span>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="architectural-card rounded-2xl p-6 sm:p-8 border border-graphite-200 bg-white shadow-xl space-y-6 relative">
        
        {loading && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-solar-100 text-solar-900 text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-solar-600" />
            <span>Analyzing...</span>
          </div>
        )}

        {/* 1. PHYSICAL SITE VISIT VERDICT CARD (HIGH VISIBILITY) */}
        <div className={`rounded-xl p-5 border ${
          verdict.status === "DIRECT_FEASIBLE"
            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
            : verdict.status === "VISIT_RECOMMENDED"
            ? "bg-amber-50/80 border-amber-300 text-amber-950"
            : "bg-red-50/80 border-red-300 text-red-950"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
            <div className="flex items-center gap-2.5">
              {verdict.status === "DIRECT_FEASIBLE" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : verdict.status === "VISIT_RECOMMENDED" ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <h3 className="font-bold font-sans text-base sm:text-lg">
                {verdict.title}
              </h3>
            </div>

            <span className={`text-[11px] font-mono px-3 py-1 rounded-full font-bold self-start sm:self-auto border ${verdict.badgeClass}`}>
              {verdict.status === "DIRECT_FEASIBLE"
                ? "LOW RISK • READY TO BID"
                : verdict.status === "VISIT_RECOMMENDED"
                ? "SURVEY RECOMMENDED"
                : "SITE SURVEY MANDATORY"}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-sans mt-3 leading-relaxed opacity-90">
            {verdict.summary}
          </p>

          <ul className="mt-3 space-y-1 text-xs font-mono opacity-80 list-disc list-inside">
            {verdict.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* 2. EXECUTIVE SUMMARY BRIEF */}
        <div className="p-4 rounded-xl bg-graphite-50 border border-graphite-200 text-xs sm:text-sm font-sans text-graphite-800 leading-relaxed">
          <strong className="text-graphite-950 font-semibold font-mono uppercase text-xs block mb-1">
            Executive Summary:
          </strong>
          {activeReport.executiveSummary}
        </div>

        {/* 3. 4 KEY METRIC TAKEAWAYS (CLEAN CARDS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeReport.keyFindings.map((kf, i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-graphite-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-graphite-500 font-semibold block">
                {kf.label}
              </span>
              <span className="text-xl sm:text-2xl font-bold font-sans text-graphite-950 block">
                {kf.value}
              </span>
              <span className="text-[11px] text-graphite-600 font-sans block line-clamp-2 leading-tight">
                {kf.subtext}
              </span>
            </div>
          ))}
        </div>

        {/* 4. CLEAR ACTION STEPS (NO THEORY) */}
        <div className="pt-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-graphite-700 block mb-3">
            Recommended Action Steps
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeReport.actionSteps.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-graphite-200 bg-graphite-50/50 flex items-start gap-2.5 text-xs font-sans text-graphite-700">
                <span className="w-5 h-5 rounded-full bg-solar-500 text-graphite-950 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
