"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sun,
  ArrowLeft,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Sparkles,
  CheckCircle2,
  KeyRound
} from "lucide-react";

import { setCurrentUser, UserSession } from "@/lib/storage/savedAssessments";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<"homeowner" | "installer">("homeowner");
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    setTimeout(() => {
      const user: UserSession = {
        email: email || (role === "homeowner" ? "homeowner@suryascope.com" : "installer@suryascope.com"),
        role,
        name: email ? email.split("@")[0] : (role === "homeowner" ? "Homeowner" : "Installer"),
      };
      setCurrentUser(user);

      setLoading(false);
      setSuccessMsg(
        mode === "signin"
          ? `Welcome back! Signed in as ${role === "homeowner" ? "Homeowner" : "Verified Solar Installer"}.`
          : `Account created successfully! Welcome to Suryascope.`
      );
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }, 600);
  };

  const handleDemoSignIn = (demoRole: "homeowner" | "installer") => {
    const demoEmail = demoRole === "homeowner" ? "sarah.homeowner@suryascope.com" : "contact@apexsolar.in";
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword("••••••••••••");
    setLoading(true);
    setSuccessMsg("");

    setTimeout(() => {
      const user: UserSession = {
        email: demoEmail,
        role: demoRole,
        name: demoRole === "homeowner" ? "Sarah Jenkins" : "Apex Solar Systems",
      };
      setCurrentUser(user);

      setLoading(false);
      setSuccessMsg(`Authenticated as ${demoRole === "homeowner" ? "Sarah Jenkins (Homeowner)" : "Apex Solar Systems (Verified Installer)"}`);
      setTimeout(() => {
        router.push("/");
      }, 800);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-graphite-950 flex flex-col justify-between relative overflow-hidden selection:bg-solar-200 selection:text-graphite-950">
      
      {/* Background Grid Pattern & Sunlight Glow */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-solar-100/50 via-solar-50/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-graphite-950 flex items-center justify-center text-solar-400 group-hover:scale-105 transition-transform duration-200 shadow-sm">
            <Sun className="h-4.5 w-4.5 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-graphite-950 tracking-tight text-base font-sans">
              SURYASCOPE
            </span>
            <span className="text-[10px] uppercase font-mono font-medium tracking-wider px-1.5 py-0.5 rounded bg-graphite-100 text-graphite-600 border border-graphite-200">
              Auth
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-graphite-600 hover:text-graphite-950 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-graphite-200 bg-white shadow-2xs hover:border-graphite-400 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 my-8">
        <div className="w-full max-w-md architectural-card rounded-2xl p-8 sm:p-10 shadow-2xl border border-graphite-200 bg-white relative">
          
          {/* Top Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-graphite-100 rounded-xl mb-8 border border-graphite-200">
            <button
              type="button"
              onClick={() => setRole("homeowner")}
              className={`py-2 text-xs font-mono font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
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
              className={`py-2 text-xs font-mono font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                role === "installer"
                  ? "bg-white text-graphite-950 shadow-xs border border-graphite-200"
                  : "text-graphite-600 hover:text-graphite-950"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-solar-600" />
              <span>Solar Installer</span>
            </button>
          </div>

          {/* Form Header Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-sans tracking-tight text-graphite-950 mb-1">
              {mode === "signin"
                ? role === "homeowner"
                  ? "Access your Roof Assessment"
                  : "Installer Partner Portal"
                : "Create your Suryascope account"}
            </h1>
            <p className="text-xs font-sans text-graphite-600">
              {role === "homeowner"
                ? "Manage rooftop solar feasibility audits & financial reports."
                : "Receive pre-qualified rooftop solar leads with verified CAD geometry."}
            </p>
          </div>

          {/* Success Notification */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-sans flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-graphite-700 uppercase font-semibold mb-1.5">
                Work or Personal Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "homeowner" ? "name@domain.com" : "partner@solarcompany.in"}
                  className="w-full pl-10 pr-4 py-3 text-sm font-sans bg-white border border-graphite-300 rounded-lg text-graphite-950 focus:outline-none focus:border-solar-500 focus:ring-1 focus:ring-solar-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-graphite-700 uppercase font-semibold">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to your email!")}
                    className="text-[11px] font-mono text-solar-700 hover:text-solar-800 underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 text-sm font-sans bg-white border border-graphite-300 rounded-lg text-graphite-950 focus:outline-none focus:border-solar-500 focus:ring-1 focus:ring-solar-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-graphite-950 hover:bg-graphite-900 text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm shadow-md transition-all mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-solar-400 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In to Account" : "Create Free Account"}</span>
                  <ArrowRight className="w-4 h-4 text-solar-400" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Sign-In Buttons */}
          <div className="mt-8 pt-6 hairline-t">
            <span className="block text-[10px] font-mono text-graphite-500 uppercase tracking-wider text-center mb-3 font-semibold">
              Instant Hackathon Demo Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn("homeowner")}
                className="px-3 py-2 rounded-lg bg-solar-50 text-solar-900 border border-solar-300 hover:bg-solar-100 text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-solar-600" />
                <span>Demo Homeowner</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn("installer")}
                className="px-3 py-2 rounded-lg bg-graphite-900 text-white border border-graphite-800 hover:bg-graphite-850 text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo Installer</span>
              </button>
            </div>
          </div>

          {/* Toggle Signin / Signup */}
          <div className="mt-6 text-center text-xs font-sans text-graphite-600">
            {mode === "signin" ? (
              <p>
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-bold text-solar-700 hover:underline"
                >
                  Sign up free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
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
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs font-mono text-graphite-500 z-10 hairline-t">
        <p>© {new Date().getFullYear()} SURYASCOPE Auth Engine • Protected by Cadastral Encryption</p>
      </footer>

    </div>
  );
}
