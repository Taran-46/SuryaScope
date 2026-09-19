"use client";

import * as React from "react";
import Link from "next/link";
import { SuryascopeLogo } from "@/components/brand/SuryascopeLogo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  Sun,
  Layers,
  LogIn,
  LogOut,
  User,
  Bookmark
} from "lucide-react";
import { getCurrentUser, setCurrentUser, UserSession } from "@/lib/storage/savedAssessments";

interface NavbarProps {
  onOpenAnalysis?: () => void;
}

export function Navbar({ onOpenAnalysis }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [currentUser, setCurrentUserState] = React.useState<UserSession | null>(null);

  const checkUser = React.useCallback(() => {
    setCurrentUserState(getCurrentUser());
  }, []);

  React.useEffect(() => {
    checkUser();
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("suryascope_saved_updated", checkUser);
    window.addEventListener("storage", checkUser);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("suryascope_saved_updated", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, [checkUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
  };

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
          <SuryascopeLogo size="md" />
          <span className="text-[10px] uppercase font-mono font-medium tracking-wider px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
            Pre-Feasibility
          </span>
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
            href="#saved-sites"
            className="hover:text-graphite-950 transition-colors flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-solar-500" />
            Saved Sites
          </a>
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="hover:text-graphite-950 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 uppercase font-mono text-xs font-medium tracking-wide text-graphite-600"
          >
            <Layers className="w-3.5 h-3.5 text-solar-500" />
            Solar Economics
          </button>
          <a
            href="#site-visits"
            className="hover:text-graphite-950 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-solar-500" />
            Installer Leads
          </a>
        </nav>

        {/* CTA & Login/Logout Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onOpenAnalysis}
            size="sm"
            className="bg-graphite-950 hover:bg-graphite-900 text-white rounded-md px-4 py-2 text-xs font-medium tracking-wide font-sans shadow-sm flex items-center gap-2 transition-all hover:gap-2.5"
          >
            <span>Analyse my roof</span>
            <ArrowRight className="w-3.5 h-3.5 text-solar-400" />
          </Button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-graphite-100 border border-graphite-200 text-xs font-mono text-graphite-800">
                <User className="w-3.5 h-3.5 text-solar-600" />
                <span className="max-w-[120px] truncate font-semibold">
                  {currentUser.name || currentUser.email.split("@")[0]}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-graphite-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 text-graphite-700 rounded-md px-3 py-2 text-xs font-medium font-sans flex items-center gap-1.5 transition-all shadow-2xs group"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5 text-graphite-500 group-hover:text-red-600" />
                <span>Log out</span>
              </Button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}
