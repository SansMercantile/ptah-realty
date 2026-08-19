/**
 * PTAH Realty -- standalone app shell.
 * Mirrors Ptah's own slate/amber console styling (see the main Ptah repo's
 * ConsolePage.tsx) so this mini-app reads as part of the same product
 * family while living in its own repo.
 */

import React from "react";
import { Home } from "lucide-react";
import RealtyValuation from "./components/RealtyValuation";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans">
      <header className="border-b border-slate-200 dark:border-slate-900 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9">
            <img src="/logo.svg" alt="Ptah" className="w-full h-full" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">
              PTAH <span className="text-amber-500">Realty</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-600 dark:text-slate-500 uppercase tracking-wider">
              CMA &middot; Reports &middot; Listing Distribution
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <RealtyValuation />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-[10px] font-mono text-slate-500 dark:text-slate-600 flex items-center gap-1.5">
          <Home className="w-3 h-3" />
          Part of the PTAH product family
        </div>
      </footer>
    </div>
  );
}
