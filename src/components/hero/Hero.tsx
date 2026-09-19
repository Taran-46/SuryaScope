"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Compass, Sun, Zap, CheckCircle2, Shield } from "lucide-react";
import dynamic from "next/dynamic";

const RoofScene = dynamic(
  () => import("./RoofScene").then((mod) => mod.RoofScene),
  {
    loading: () => (
      <div className="relative w-full h-full min-h-[480px] bg-graphite-50 flex items-center justify-center rounded-2xl border border-graphite-200">
        <div className="text-center p-6">
          <div className="w-10 h-10 border-2 border-solar-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-graphite-500 uppercase tracking-wider">
            Loading Rooftop Intelligence...
          </p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

interface HeroProps {
  onOpenAnalysis?: () => void;
}

export function Hero({ onOpenAnalysis }: HeroProps) {
  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-background">
      {/* Background Architectural Grid Accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Top Ambient Sunlight Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-solar-100/40 via-solar-50/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            {/* Above Headline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-mono font-semibold uppercase tracking-wider mb-6 shadow-2xs">
              <Sun className="w-3.5 h-3.5 text-solar-500" />
              <span>ROOFTOP SOLAR INTELLIGENCE</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-sans tracking-tight text-graphite-950 leading-[1.05] mb-6">
              Know your roof <br />
              <span className="text-graphite-500 font-normal">before you install.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-graphite-600 font-sans leading-relaxed mb-8 max-w-xl">
              Understand your roof&apos;s solar potential, estimated savings and payback before scheduling a physical site visit.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
              <Button
                onClick={onOpenAnalysis}
                size="lg"
                className="bg-graphite-950 hover:bg-graphite-900 text-white rounded-lg px-7 py-3.5 text-sm font-semibold tracking-wide font-sans shadow-md flex items-center justify-center gap-2.5 group transition-all"
              >
                <span>Analyse my roof</span>
                <ArrowRight className="w-4 h-4 text-solar-400 group-hover:translate-x-1 transition-transform" />
              </Button>

              <a href="#suitability">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-graphite-300 hover:bg-graphite-100 text-graphite-900 rounded-lg px-6 py-3.5 text-sm font-medium font-sans flex items-center justify-center gap-2"
                >
                  <span>See how it works</span>
                  <ChevronDown className="w-4 h-4 text-graphite-500" />
                </Button>
              </a>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-6 hairline-t w-full flex flex-wrap items-center gap-6 text-xs text-graphite-600 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>94% Accuracy Score</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant Pre-Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No Site Visit Needed</span>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Visualization Viewport */}
          <div className="lg:col-span-6 w-full">
            <div className="relative rounded-2xl border border-graphite-200 bg-white shadow-xl overflow-hidden">
              {/* Header Bar of 3D Viewport */}
              <div className="px-4 py-3 bg-graphite-50 hairline-b flex items-center justify-between text-xs font-mono text-graphite-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-graphite-900">DEMO PROPERTY</span>
                  <span className="text-graphite-400">|</span>
                  <span>CADASTRE #8492-B</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-graphite-200/60 font-mono">24° Pitch</span>
                  <span className="px-2 py-0.5 rounded bg-solar-100 text-solar-900 font-mono">South Facing</span>
                </div>
              </div>

              {/* 3D Scene */}
              <RoofScene />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}