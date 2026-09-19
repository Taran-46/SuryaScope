"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  TrendingDown
} from "lucide-react";

export function InstallerLeadsSection() {
  return (
    <section id="site-visits" className="py-24 bg-graphite-950 text-white relative overflow-hidden">
      {/* Background Architectural Grid Accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 hairline-b border-graphite-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>INSTALLER PARTNER NETWORK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-white">
              Smarter Site Visits for Solar Installers.
            </h2>
          </div>
          <p className="text-sm font-sans text-graphite-400 max-w-md mt-4 md:mt-0">
            Eliminate non-viable physical roof surveys. Receive pre-verified cadastral CAD geometry & structural feasibility reports directly.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Pillar 1 */}
          <div className="bg-graphite-900/90 rounded-2xl p-8 border border-graphite-800 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-6">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-sans text-white mb-3">
                Pre-Verified CAD Geometry
              </h3>
              <p className="text-xs font-sans text-graphite-400 leading-relaxed mb-6">
                Access 3D pitch angles, azimuth vectors, shade contours, and usable panel surface area before dispatching field survey technicians.
              </p>
            </div>
            <div className="pt-4 hairline-t border-graphite-800 flex items-center justify-between text-xs font-mono text-cyan-400 font-semibold">
              <span>Cadastral Mesh Accuracy</span>
              <span>94% Score</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-graphite-900/90 rounded-2xl p-8 border border-graphite-800 flex flex-col justify-between hover:border-solar-500/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-solar-950 border border-solar-800 flex items-center justify-center text-solar-400 mb-6">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-sans text-white mb-3">
                Qualified High-Intent Homeowners
              </h3>
              <p className="text-xs font-sans text-graphite-400 leading-relaxed mb-6">
                Connect with property owners who have already evaluated their system capacity, PM Surya Ghar subsidy, and estimated payback period.
              </p>
            </div>
            <div className="pt-4 hairline-t border-graphite-800 flex items-center justify-between text-xs font-mono text-solar-400 font-semibold">
              <span>Conversion Rate Boost</span>
              <span>+3.4x Higher</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-graphite-900/90 rounded-2xl p-8 border border-graphite-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-6">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-sans text-white mb-3">
                70% Lower Survey Costs
              </h3>
              <p className="text-xs font-sans text-graphite-400 leading-relaxed mb-6">
                Stop wasting engineering time on unviable roofs. Focus field teams only on properties with verified solar exposure and structural fit.
              </p>
            </div>
            <div className="pt-4 hairline-t border-graphite-800 flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
              <span>Acquisition Savings</span>
              <span>-70% Cost</span>
            </div>
          </div>

        </div>

        {/* Partner Portal Callout Bar */}
        <div className="bg-gradient-to-r from-graphite-900 via-graphite-900 to-cyan-950 rounded-2xl p-8 border border-graphite-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold font-sans text-white mb-1">
                Are you a certified solar installer?
              </h4>
              <p className="text-xs font-sans text-graphite-400">
                Join Suryascope&apos;s installer network to receive pre-audited rooftop leads in your postal region.
              </p>
            </div>
          </div>

          <Link href="/login">
            <Button className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-md transition-all">
              <span>Partner Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
