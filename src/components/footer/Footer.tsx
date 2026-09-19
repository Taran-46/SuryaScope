"use client";

import * as React from "react";
import { SuryascopeLogo } from "@/components/brand/SuryascopeLogo";
import { Compass, ShieldCheck, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-graphite-950 text-white pt-16 pb-12 hairline-t border-graphite-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 hairline-b border-graphite-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="mb-4">
              <SuryascopeLogo size="lg" darkBackground={true} />
            </div>
            <p className="text-xs font-sans text-graphite-400 leading-relaxed max-w-sm mb-6">
              Rooftop solar pre-feasibility platform. Know your roof&apos;s solar potential, estimated savings and payback before scheduling a physical site visit.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-graphite-900 px-3 py-1.5 rounded-full border border-graphite-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Solar Irradiance Engine Active • 94% Model Confidence</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <span className="text-xs font-mono font-semibold text-graphite-300 uppercase tracking-wider block mb-4">
                Platform
              </span>
              <ul className="space-y-2.5 text-xs text-graphite-400 font-sans">
                <li><a href="#suitability" className="hover:text-white transition-colors">Roof Suitability</a></li>
                <li><a href="#saved-sites" className="hover:text-white transition-colors">Saved Sites</a></li>
                <li><a href="#site-visits" className="hover:text-white transition-colors">Installer Qualified Leads</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Feasibility Simulator</a></li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-mono font-semibold text-graphite-300 uppercase tracking-wider block mb-4">
                Architecture
              </span>
              <ul className="space-y-2.5 text-xs text-graphite-400 font-sans">
                <li><span className="text-graphite-500">3D Roof Segmentation</span></li>
                <li><span className="text-graphite-500">Shading Vector Models</span></li>
                <li><span className="text-graphite-500">Utility Tariff Engine</span></li>
                <li><span className="text-graphite-500">Cadastral Mapping</span></li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-mono font-semibold text-graphite-300 uppercase tracking-wider block mb-4">
                Hackathon Demo
              </span>
              <ul className="space-y-2.5 text-xs text-graphite-400 font-sans">
                <li className="flex items-center gap-1">
                  <span className="text-solar-400">SURYASCOPE v0.1</span>
                </li>
                <li><span className="text-graphite-500">Light-First Climate Tech</span></li>
                <li><span className="text-graphite-500">React Three Fiber</span></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-graphite-500 font-mono">
          <p>© {new Date().getFullYear()} SURYASCOPE. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for Hackathon • Rooftop Solar Pre-Feasibility Intelligence</p>
        </div>

      </div>
    </footer>
  );
}
