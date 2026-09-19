"use client";

import * as React from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { Hero } from "@/components/hero/Hero";
import { BenefitsSection } from "@/components/benefits/BenefitsSection";
import { PreFeasibilityDemo } from "@/components/demo/PreFeasibilityDemo";
import { SolarEconomicsSection } from "@/components/economics/SolarEconomicsSection";
import { InstallerLeadsSection } from "@/components/installer/InstallerLeadsSection";
import { SavedSitesSection } from "@/components/saved/SavedSitesSection";
import { Footer } from "@/components/footer/Footer";
import { AssessmentFlowModal } from "@/components/assessment/AssessmentFlowModal";

export default function Home() {
  const [assessmentModalOpen, setAssessmentModalOpen] = React.useState(false);
  const [initialAddress, setInitialAddress] = React.useState("1248 Solar Way, Palo Alto, CA");
  const [initialBill, setInitialBill] = React.useState<number>(240);

  const handleOpenAssessment = (addressPreset?: string, billPreset?: number) => {
    if (addressPreset) {
      setInitialAddress(addressPreset);
    }
    if (billPreset) {
      setInitialBill(billPreset);
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

        {/* 3 Concise Product Benefits (id="suitability") */}
        <BenefitsSection />

        {/* Dedicated Saved Properties & Audits Section (id="saved-sites") */}
        <SavedSitesSection onOpenAnalysis={(addr) => handleOpenAssessment(addr)} />

        {/* Financial Pre-Feasibility & ROI Section: WILL SOLAR PAY OFF? (id="economics") */}
        <div id="economics" className="bg-white hairline-t hairline-b py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <SolarEconomicsSection
              onOpenAnalysis={(bill) => handleOpenAssessment(undefined, bill)}
            />
          </div>
        </div>

        {/* Installer Leads Section (id="site-visits") */}
        <InstallerLeadsSection />

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
        initialBill={initialBill}
      />
    </div>
  );
}
