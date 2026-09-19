"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Sun,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  Building2,
  CheckCircle2,
  KeyRound,
  ShieldCheck
} from "lucide-react";
import { setCurrentUser, UserSession } from "@/lib/storage/savedAssessments";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserSession) => void;
  title?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign In to Save your Assessment",
}: AuthModalProps) {
  const [role, setRole] = React.useState<"homeowner" | "installer">("homeowner");
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    setTimeout(() => {
      const user: UserSession = {
        email: email || "user@suryascope.com",
        role,
        name: email ? email.split("@")[0] : "Homeowner",
      };
      setCurrentUser(user);
      setLoading(false);
      setSuccessMsg("Successfully signed in!");

      setTimeout(() => {
        if (onSuccess) onSuccess(user);
        onClose();
      }, 600);
    }, 600);
  };

  const handleDemoSignIn = (demoRole: "homeowner" | "installer") => {
    setRole(demoRole);
    const demoEmail = demoRole === "homeowner" ? "sarah.homeowner@suryascope.com" : "contact@apexsolar.in";
    setEmail(demoEmail);
    setPassword("••••••••••••");
    setLoading(true);

    setTimeout(() => {
      const user: UserSession = {
        email: demoEmail,
        role: demoRole,
        name: demoRole === "homeowner" ? "Sarah Jenkins" : "Apex Solar Installer",
      };
      setCurrentUser(user);
      setLoading(false);
      setSuccessMsg(`Authenticated as ${user.name}`);

      setTimeout(() => {
        if (onSuccess) onSuccess(user);
        onClose();
      }, 500);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-graphite-200 overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-graphite-400 hover:text-graphite-950 hover:bg-graphite-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-graphite-950 flex items-center justify-center text-solar-400 mx-auto mb-3 shadow-md">
            <Sun className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-graphite-950">
            {title}
          </h2>
          <p className="text-xs font-sans text-graphite-600 mt-1">
            Access your property solar reports anytime across devices.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-graphite-100 rounded-xl mb-6 border border-graphite-200">
          <button
            type="button"
            onClick={() => setRole("homeowner")}
            className={`py-1.5 text-xs font-mono font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === "homeowner"
                ? "bg-white text-graphite-950 shadow-xs border border-graphite-200"
                : "text-graphite-600 hover:text-graphite-950"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-solar-600" />
            <span>Homeowner</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("installer")}
            className={`py-1.5 text-xs font-mono font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === "installer"
                ? "bg-white text-graphite-950 shadow-xs border border-graphite-200"
                : "text-graphite-600 hover:text-graphite-950"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-solar-600" />
            <span>Installer</span>
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-sans flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-graphite-700 uppercase font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-sans bg-white border border-graphite-300 rounded-lg text-graphite-950 focus:outline-none focus:border-solar-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-700 uppercase font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs font-sans bg-white border border-graphite-300 rounded-lg text-graphite-950 focus:outline-none focus:border-solar-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-graphite-950 hover:bg-graphite-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-xs shadow-md transition-all mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === "signin" ? "Sign In & Save" : "Create Account & Save"}</span>
                <ArrowRight className="w-4 h-4 text-solar-400" />
              </>
            )}
          </Button>
        </form>

        {/* Quick Demo Sign-In Buttons */}
        <div className="mt-6 pt-4 hairline-t">
          <span className="block text-[10px] font-mono text-graphite-500 uppercase tracking-wider text-center mb-2 font-semibold">
            Quick One-Click Hackathon Access:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn("homeowner")}
              className="px-2.5 py-1.5 rounded-lg bg-solar-50 text-solar-900 border border-solar-300 hover:bg-solar-100 text-[11px] font-mono font-medium transition-all flex items-center justify-center gap-1"
            >
              <KeyRound className="w-3 h-3 text-solar-600" />
              <span>Demo User</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn("installer")}
              className="px-2.5 py-1.5 rounded-lg bg-graphite-900 text-white border border-graphite-800 hover:bg-graphite-850 text-[11px] font-mono font-medium transition-all flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Demo Installer</span>
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mt-4 text-center text-xs font-sans text-graphite-600">
          {mode === "signin" ? (
            <p>
              New user?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-bold text-solar-700 hover:underline"
              >
                Create free account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-bold text-solar-700 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
