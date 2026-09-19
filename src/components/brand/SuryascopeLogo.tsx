"use client";

import * as React from "react";

interface SuryascopeLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  darkBackground?: boolean;
}

export function SuryascopeLogo({
  className = "",
  iconOnly = false,
  size = "md",
  darkBackground = false,
}: SuryascopeLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Hexagonal Web SVG Icon (from Stitch reference) */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm" fill="none">
          {/* Outer Cyan Hexagon Mesh Lines */}
          <polygon
            points="100,10 178,55 178,145 100,190 22,145 22,55"
            stroke="#00b4d8"
            strokeWidth="5"
            fill="none"
          />

          {/* Cyan Outer Spoke Rays */}
          <line x1="100" y1="10" x2="100" y2="0" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
          <line x1="178" y1="55" x2="190" y2="48" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
          <line x1="178" y1="145" x2="190" y2="152" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
          <line x1="100" y1="190" x2="100" y2="200" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
          <line x1="22" y1="145" x2="10" y2="152" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
          <line x1="22" y1="55" x2="10" y2="48" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />

          {/* Inner Cyan Secondary Concentric Ring */}
          <polygon
            points="100,32 158,65 158,135 100,168 42,135 42,65"
            stroke="#00b4d8"
            strokeWidth="4"
            fill="none"
          />

          {/* Diagonal Cross Rays Connecting Layers */}
          <line x1="100" y1="10" x2="100" y2="190" stroke="#00b4d8" strokeWidth="3" opacity="0.8" />
          <line x1="22" y1="55" x2="178" y2="145" stroke="#00b4d8" strokeWidth="3" opacity="0.8" />
          <line x1="22" y1="145" x2="178" y2="55" stroke="#00b4d8" strokeWidth="3" opacity="0.8" />

          {/* Inner Amber/Gold Concentric Solar Maze Circles & Rays */}
          <circle cx="100" cy="100" r="48" stroke="#f59e0b" strokeWidth="4.5" fill="none" />
          <circle cx="100" cy="100" r="32" stroke="#f59e0b" strokeWidth="4.5" fill="none" />
          <circle cx="100" cy="100" r="18" stroke="#f59e0b" strokeWidth="5" fill="none" />

          {/* Radial Solar Ray Segment Dividers */}
          <g stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round">
            <line x1="100" y1="52" x2="100" y2="32" />
            <line x1="100" y1="148" x2="100" y2="168" />
            <line x1="148" y1="100" x2="168" y2="100" />
            <line x1="52" y1="100" x2="32" y2="100" />

            <line x1="134" y1="66" x2="148" y2="52" />
            <line x1="66" y1="134" x2="52" y2="148" />
            <line x1="134" y1="134" x2="148" y2="148" />
            <line x1="66" y1="66" x2="52" y2="52" />

            <line x1="100" y1="68" x2="100" y2="82" />
            <line x1="100" y1="118" x2="100" y2="132" />
            <line x1="118" y1="100" x2="132" y2="100" />
            <line x1="68" y1="100" x2="82" y2="100" />
          </g>
        </svg>
      </div>

      {/* Brand Name Text (SURYA in Gold, SCOPE in Electric Cyan) */}
      {!iconOnly && (
        <div className={`font-sans tracking-wider font-extrabold ${textSizes[size]}`}>
          <span className="text-solar-500">SURYA</span>
          <span className={darkBackground ? "text-cyan-400" : "text-cyan-600"}>SCOPE</span>
        </div>
      )}
    </div>
  );
}
