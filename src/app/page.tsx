"use client";

import * as React from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { Hero } from "@/components/hero/Hero";
import { BenefitsSection } from "@/components/benefits/BenefitsSection";
import { PreFeasibilityDemo } from "@/components/demo/PreFeasibilityDemo";
import { SolarEconomicsSection } from "@/components/economics/SolarEconomicsSection";
import { Footer } from "@/components/footer/Footer";
import { AssessmentFlowModal } from "@/components/assessment/AssessmentFlowModal";

export default function Home() {
  const [assessmentModalOpen, setAssessmentModalOpen] = React.useState(false);
  const [initialAddress, setInitialAddress] = React.useState("1248 Solar Way, Palo Alto, CA");

  const handleOpenAssessment = (addressPreset?: string) => {
    if (addressPreset) {
      setInitialAddress(addressPreset);
    }
    setAssessmentModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-solar-200 selection:text-graphite-950">
      {/* Navigation Header */}
      <Navbar onOpenAnalysis={() => handleOpenAssessment()} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero onOpenAnalysis={() => handleOpenAssessment()} />

        {/* 3 Concise Product Benefits */}
        <BenefitsSection />

        {/* Financial Pre-Feasibility & ROI Section: WILL SOLAR PAY OFF? */}
        <div id="economics" className="bg-white hairline-t hairline-b py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <SolarEconomicsSection systemSizeKw={4.8} />
          </div>
        </div>

        {/* Interactive Pre-Feasibility Address Search Simulator */}
        <PreFeasibilityDemo onOpenAnalysis={(addr) => handleOpenAssessment(addr)} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Assessment Flow Modal (Input -> Cinematic Analysis -> Results with Roof Breakdown & Economics) */}
      <AssessmentFlowModal
        isOpen={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        initialAddress={initialAddress}
      />
    </div>
  );
}
