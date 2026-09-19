"use client";

import * as React from "react";
import { Compass, TrendingUp, ShieldCheck, ArrowUpRight, BarChart3, CheckCircle2, Layers } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      id: "suitability",
      badge: "ROOF SUITABILITY",
      title: "Understand usable area, orientation and solar exposure.",
      description:
        "High-resolution 3D rooftop segmentation determines unobstructed area, shade contours, and precise sun angle vectors.",
      icon: Compass,
      metrics: [
        { label: "Usable Surface", value: "61.7 m²" },
        { label: "Optimal Pitch", value: "24° South" },
        { label: "Sun Exposure", value: "94% Score" },
      ],
      tagColor: "bg-solar-500/10 text-solar-900 border-solar-300",
    },
    {
      id: "economics",
      badge: "SOLAR ECONOMICS",
      title: "Estimate system size, savings and payback.",
      description:
        "Financial forecasting algorithm maps historical utility rates against projected hourly solar generation to quantify ROI.",
      icon: TrendingUp,
      metrics: [
        { label: "Est. System Size", value: "4.8 kWp" },
        { label: "Annual Generation", value: "6,420 kWh" },
        { label: "Est. Payback", value: "4.2 Years" },
      ],
      tagColor: "bg-emerald-500/10 text-emerald-900 border-emerald-300",
    },
    {
      id: "site-visits",
      badge: "SMARTER SITE VISITS",
      title: "Help installers prioritize qualified leads.",
      description:
        "Eliminate non-viable physical roof inspections with pre-verified structural suitability reports sent directly to installers.",
      icon: ShieldCheck,
      metrics: [
        { label: "Pre-Audit Time", value: "< 2 Mins" },
        { label: "Lead Qualification", value: "Verified" },
        { label: "Site Visit Cost", value: "-70% Savings" },
      ],
      tagColor: "bg-graphite-900 text-white border-graphite-900",
    },
  ];

  return (
    <section className="py-24 bg-white hairline-t hairline-b relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 hairline-b">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-graphite-500 block mb-2">
              PRE-FEASIBILITY METRICS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-graphite-950">
              Architectural precision meets solar potential.
            </h2>
          </div>
          <p className="text-sm font-sans text-graphite-600 max-w-md mt-4 md:mt-0">
            Suryascope aggregates roof geometry, solar irradiance, and financial models into a single pre-feasibility assessment.
          </p>
        </div>

        {/* 3 Columns Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                id={item.id}
                className="architectural-card architectural-card-hover rounded-xl p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Icon Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded border ${item.tagColor}`}
                    >
                      {item.badge}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-graphite-100 flex items-center justify-center text-graphite-900">
                      <IconComponent className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </div>

                  {/* Benefit Title */}
                  <h3 className="text-xl font-bold font-sans text-graphite-950 leading-snug mb-3">
                    {item.title}
                  </h3>

                  {/* Subtext */}
                  <p className="text-xs font-sans text-graphite-600 leading-relaxed mb-8">
                    {item.description}
                  </p>
                </div>

                {/* Micro Metric Breakdown */}
                <div className="pt-6 hairline-t grid grid-cols-3 gap-2 text-center bg-graphite-50/80 rounded-lg p-3">
                  {item.metrics.map((m, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-[10px] font-mono text-graphite-500 uppercase truncate">
                        {m.label}
                      </span>
                      <span className="text-xs font-bold font-sans text-graphite-950 mt-0.5">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
