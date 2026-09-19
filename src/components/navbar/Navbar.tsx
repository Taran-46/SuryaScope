"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, ShieldCheck, Sun, Layers, LogIn } from "lucide-react";

interface NavbarProps {
  onOpenAnalysis?: () => void;
}

export function Navbar({ onOpenAnalysis }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md hairline-b shadow-xs py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-graphite-950 flex items-center justify-center text-solar-400 group-hover:scale-105 transition-transform duration-200 shadow-sm">
            <Sun className="h-4.5 w-4.5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-graphite-950 tracking-tight text-base font-sans">
                SURYASCOPE
              </span>
              <span className="text-[10px] uppercase font-mono font-medium tracking-wider px-1.5 py-0.5 rounded bg-graphite-100 text-graphite-600 border border-graphite-200">
                Pre-Feasibility
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide uppercase font-mono text-graphite-600">
          <a
            href="#suitability"
            className="hover:text-graphite-950 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-solar-500" />
            Roof Suitability
          </a>
          <a
            href="#economics"
            className="hover:text-graphite-950 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-solar-500" />
            Solar Economics
          </a>
          <a
            href="#site-visits"
            className="hover:text-graphite-950 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-solar-500" />
            Installer Leads
          </a>
        </nav>

        {/* CTA & Login Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-graphite-300 hover:bg-graphite-100 text-graphite-900 rounded-md px-3 py-2 text-xs font-medium tracking-wide font-sans flex items-center gap-1.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-graphite-600" />
              <span>Sign In</span>
            </Button>
          </Link>

          <Button
            onClick={onOpenAnalysis}
            size="sm"
            className="bg-graphite-950 hover:bg-graphite-900 text-white rounded-md px-4 py-2 text-xs font-medium tracking-wide font-sans shadow-sm flex items-center gap-2 transition-all hover:gap-2.5"
          >
            <span>Analyse my roof</span>
            <ArrowRight className="w-3.5 h-3.5 text-solar-400" />
          </Button>
        </div>
      </div>
    </header>
  );
}
