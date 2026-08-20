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
 */

import React, { useEffect, useState } from "react";
import { Home } from "lucide-react";
import RealtyValuation from "./components/RealtyValuation";

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
              <div>
                <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  PTAH <span style={{ color: "var(--brand-accent)" }}>Realty</span>
                </h1>
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                  CMA &middot; Reports &middot; Listing Distribution
                </p>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <RealtyValuation />
      </main>

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
