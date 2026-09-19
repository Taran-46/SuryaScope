"use client";

import * as React from "react";
import {
  Bookmark,
  MapPin,
  Zap,
  TrendingUp,
  Calendar,
  ArrowRight,
  Trash2,
  Building,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSavedAssessments,
  SavedAssessment,
  getCurrentUser
} from "@/lib/storage/savedAssessments";

interface SavedSitesSectionProps {
  onOpenAnalysis?: (address?: string) => void;
}

export function SavedSitesSection({ onOpenAnalysis }: SavedSitesSectionProps) {
  const [savedSites, setSavedSites] = React.useState<SavedAssessment[]>([]);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  const loadSites = React.useCallback(() => {
    const sites = getSavedAssessments();
    setSavedSites(sites);
    const user = getCurrentUser();
    setUserEmail(user?.email || null);
  }, []);

  React.useEffect(() => {
    loadSites();
    // Listen for storage updates
    window.addEventListener("storage", loadSites);
    return () => window.removeEventListener("storage", loadSites);
  }, [loadSites]);

  const handleDeleteSite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const existing = getSavedAssessments();
      const filtered = existing.filter((s) => s.id !== id);
      localStorage.setItem("suryascope_saved_assessments", JSON.stringify(filtered));
      setSavedSites(filtered);
    } catch (err) {
      console.warn("Failed to delete saved assessment:", err);
    }
  };

  return (
    <section id="saved-sites" className="py-20 bg-graphite-50/60 hairline-t hairline-b relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-100 border border-solar-300 text-solar-900 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
              <Bookmark className="w-3.5 h-3.5 text-solar-600" />
              <span>SAVED PROPERTIES & AUDITS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-sans text-graphite-950 tracking-tight">
              Your Saved Roof Audits
            </h2>
            <p className="text-sm font-sans text-graphite-600 mt-1">
              Revisit and manage pre-feasibility solar assessments saved to your session.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-xs font-mono text-graphite-500 bg-white border border-graphite-200 px-3 py-1.5 rounded-lg shadow-2xs">
                Account: <strong className="text-graphite-900">{userEmail}</strong>
              </span>
            )}
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-solar-500 text-graphite-950 shadow-2xs">
              {savedSites.length} Saved {savedSites.length === 1 ? "Property" : "Properties"}
            </span>
          </div>
        </div>

        {/* Saved Sites Grid or Clean Empty State */}
        {savedSites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSites.map((site) => {
              const symbol = site.currency === "USD" ? "$" : "₹";
              return (
                <div
                  key={site.id}
                  onClick={() => onOpenAnalysis && onOpenAnalysis(site.address)}
                  className="architectural-card rounded-2xl p-6 border border-graphite-200 bg-white shadow-md hover:shadow-xl hover:border-solar-500/60 transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-graphite-100 flex items-center justify-center text-solar-600 group-hover:bg-solar-500 group-hover:text-graphite-950 transition-colors">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-graphite-400 uppercase block">
                            Audit #{site.id.slice(-6)}
                          </span>
                          <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Pre-Feasibility Ready
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSite(site.id, e)}
                        title="Remove from saved"
                        className="p-1.5 rounded-lg text-graphite-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Property Address */}
                    <div className="mb-6">
                      <div className="flex items-start gap-1.5 text-xs text-graphite-950 font-bold font-sans line-clamp-2 leading-snug">
                        <MapPin className="w-3.5 h-3.5 text-solar-600 shrink-0 mt-0.5" />
                        <span>{site.address}</span>
                      </div>
                      <span className="text-[10px] font-mono text-graphite-400 block mt-1 pl-5">
                        Coords: {site.latitude.toFixed(4)}° N, {site.longitude.toFixed(4)}° W
                      </span>
                    </div>

                    {/* 3 Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-graphite-50 rounded-xl border border-graphite-100 text-center mb-6">
                      <div>
                        <span className="block text-[9px] font-mono text-graphite-400 uppercase">Capacity</span>
                        <span className="text-sm font-bold font-mono text-solar-600">
                          {site.systemSizeKw} kW
                        </span>
                      </div>
                      <div className="border-x border-graphite-200">
                        <span className="block text-[9px] font-mono text-graphite-400 uppercase">Savings/Yr</span>
                        <span className="text-sm font-bold font-mono text-emerald-600">
                          {symbol}{site.annualSavings?.toLocaleString() || "43,680"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-graphite-400 uppercase">Payback</span>
                        <span className="text-sm font-bold font-mono text-graphite-900">
                          {site.paybackYears} Yrs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-4 hairline-t flex items-center justify-between">
                    <span className="text-[10px] font-mono text-graphite-400">
                      Saved: {new Date(site.createdAt).toLocaleDateString()}
                    </span>

                    <span className="text-xs font-mono font-bold text-graphite-950 group-hover:text-solar-600 transition-colors flex items-center gap-1">
                      <span>Open Audit</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="architectural-card rounded-2xl p-10 sm:p-14 border border-graphite-200 bg-white text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-solar-50 border border-solar-200 flex items-center justify-center text-solar-600 mx-auto mb-4">
              <Bookmark className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold font-sans text-graphite-950 mb-2">
              No saved property audits yet
            </h3>
            <p className="text-xs sm:text-sm font-sans text-graphite-600 max-w-md mx-auto mb-6 leading-relaxed">
              When you evaluate a roof and click <strong>&quot;Save Assessment&quot;</strong>, your audits will be stored here for instant review across sessions.
            </p>

            <Button
              onClick={() => onOpenAnalysis && onOpenAnalysis()}
              className="bg-graphite-950 hover:bg-graphite-900 text-white text-xs font-semibold px-6 py-3 rounded-lg shadow-sm"
            >
              <span>Analyze a Roof Now</span>
              <ArrowRight className="w-3.5 h-3.5 ml-2 text-solar-400" />
            </Button>
          </div>
        )}

      </div>
    </section>
  );
}
