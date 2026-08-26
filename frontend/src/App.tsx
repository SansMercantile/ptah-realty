/**
 * PTAH Realty -- standalone app shell.
 * Mirrors Ptah's own slate/amber console styling (see the main Ptah repo's
 * ConsolePage.tsx) so this mini-app reads as part of the same product
 * family while living in its own repo.
 *
 * Multi-tenant branding (Phase 1a, 2026-08-19): fetches GET /branding on
 * load, resolved server-side by request domain (see backend tenancy.py).
 * When a tenant has its own logo configured, that logo becomes the
 * primary mark in the header with a small "Powered by Ptah" attribution
 * alongside it; the default Sans Mercantile installation (no logo_url
 * set) keeps today's PTAH Realty branding unchanged. Footer format
 * matches the convention used across other Sans Mercantile applications
 * (see e.g. the main Ptah repo's LandingPage.tsx footer).
 *
 * Auth (Phase 1c, 2026-08-22): every route except /branding now requires
 * a session (see backend auth.py). Gates the main app behind Login until
 * a valid stored session exists -- see lib/api.ts for session storage
 * and the apiFetch() wrapper the rest of the app uses.
 */

import React, { useEffect, useState } from "react";
import { Home, LogOut } from "lucide-react";
import RealtyValuation from "./components/RealtyValuation";
import IntelligenceWorkspace from "./IntelligenceWorkspace";
import Login from "./components/Login";
import { getStoredAuth, logout, StoredUser } from "./lib/api";

interface Branding {
  display_name: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  powered_by_ptah: boolean;
}

const DEFAULT_BRANDING: Branding = {
  display_name: "Sans Mercantile",
  logo_url: null,
  primary_color: "#f59e0b",
  accent_color: "#f59e0b",
  powered_by_ptah: true,
};

export default function App() {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [workspace, setWorkspace] = useState<"intelligence" | "valuation">("intelligence");

  useEffect(() => {
    fetch("/api/v1/realty/branding")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBranding(data);
      })
      .catch(() => {
        // Network hiccup or unregistered domain -- keep the default
        // branding rather than leaving the header/footer blank.
      });

    const stored = getStoredAuth();
    setUser(stored?.user ?? null);
    setAuthChecked(true);
  }, []);

  const hasTenantLogo = Boolean(branding.logo_url);

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans"
      style={{ "--brand-primary": branding.primary_color, "--brand-accent": branding.accent_color } as React.CSSProperties}
    >
      <header className="border-b border-slate-200 dark:border-slate-900 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          {hasTenantLogo ? (
            <>
              <div className="w-9 h-9">
                <img src={branding.logo_url!} alt={branding.display_name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  {branding.display_name}
                </h1>
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                  CMA &middot; Reports &middot; Listing Distribution
                </p>
              </div>
              {branding.powered_by_ptah && (
                <div className="flex items-center gap-1.5 opacity-70">
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-wider">
                    Powered by
                  </span>
                  <div className="w-4 h-4">
                    <img src="/logo.svg" alt="Ptah" className="w-full h-full" />
                  </div>
                  <span className="text-[10px] font-display font-semibold text-slate-600 dark:text-slate-500">
                    Ptah
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="w-9 h-9">
                <img src="/logo.svg" alt="Ptah" className="w-full h-full" />
              </div>
              <div className="flex-1">
                <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  PTAH <span style={{ color: "var(--brand-accent)" }}>Realty</span>
                </h1>
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                  CMA &middot; Reports &middot; Listing Distribution
                </p>
              </div>
            </>
          )}
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-500 hidden sm:block">
                {user.name}
              </span>
              <button
                onClick={logout}
                title="Log out"
                className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded px-2 py-1 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {!authChecked ? null : user ? (
        <>
          <div className="border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950 px-6 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-end gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Workspace</span>
              <button
                onClick={() => setWorkspace("intelligence")}
                className={"rounded px-3 py-1 text-[11px] font-mono transition-colors " + (workspace === "intelligence" ? "bg-cyan-700 text-white" : "border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400")}
              >
                Realty Intelligence
              </button>
              <button
                onClick={() => setWorkspace("valuation")}
                className={"rounded px-3 py-1 text-[11px] font-mono transition-colors " + (workspace === "valuation" ? "bg-amber-500 text-slate-950" : "border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400")}
              >
                Valuation & Publishing
              </button>
            </div>
          </div>
          {workspace === "intelligence" ? <IntelligenceWorkspace /> : (
            <main className="max-w-7xl mx-auto px-6 py-8">
              <RealtyValuation />
            </main>
          )}
        </>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Login tenantDisplayName={branding.display_name} onLogin={() => setUser(getStoredAuth()?.user ?? null)} />
        </main>
      )}

      <footer className="border-t border-slate-200 dark:border-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-600 gap-2">
          <span className="flex items-center gap-1.5">
            <Home className="w-3 h-3" />
            &copy; {new Date().getFullYear()} {branding.display_name}
          </span>
          <div className="flex items-center gap-4 uppercase tracking-wider">
            {branding.powered_by_ptah && <span>Powered by Ptah</span>}
            <span className="text-slate-400 dark:text-slate-700">Sans Mercantile Constellation Group</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
