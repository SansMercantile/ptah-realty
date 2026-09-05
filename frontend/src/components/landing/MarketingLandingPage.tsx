import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Calculator, 
  FileText, 
  Globe, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  Search, 
  Layers, 
  Database, 
  FileCheck2, 
  Share2, 
  Kanban, 
  BarChart3, 
  PhoneCall, 
  Mail, 
  Lock, 
  Sliders, 
  Zap, 
  ChevronRight, 
  TrendingUp, 
  Scale, 
  Check, 
  HelpCircle,
  Clock,
  Compass,
  Laptop
} from 'lucide-react';
import { GLOBAL_COUNTRIES_DATA } from '../../services/jurisdictionsData';
import { LoginModal } from './LoginModal';
import { LeadCaptureModal } from './LeadCaptureModal';

interface MarketingLandingPageProps {
  onEnterApp: () => void;
}

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({ onEnterApp }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedPlanForLead, setSelectedPlanForLead] = useState('Principal Pro (R 1,850/mo)');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'cadastre' | 'deeds' | 'cma' | 'kyc' | 'portals'>('cadastre');
  const [previewCountryCode, setPreviewCountryCode] = useState('ZA');

  const activeCountry = GLOBAL_COUNTRIES_DATA.find(c => c.id === previewCountryCode) || GLOBAL_COUNTRIES_DATA[0];

  const handleOpenLeadWithPlan = (planName: string) => {
    setSelectedPlanForLead(planName);
    setIsLeadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006980] to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">PTAH REAL ESTATE</span>
                <span className="text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-1.5 py-0.2 rounded font-mono">
                  OS v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Sovereign Land Registry & Real Estate Intelligence</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Platform Capabilities</a>
            <a href="#tools" className="hover:text-cyan-400 transition-colors">Cadastre & Tools</a>
            <a href="#jurisdictions" className="hover:text-cyan-400 transition-colors">196 Sovereign Jurisdictions</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing & Plans</a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              id="nav-btn-request-demo"
              onClick={() => { setSelectedPlanForLead('Custom Practitioner Demo'); setIsLeadModalOpen(true); }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/60 rounded-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Get Started</span>
            </button>

            <button
              id="nav-btn-signin"
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-[#00bcd4] hover:from-cyan-300 hover:to-cyan-400 rounded-lg shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#006980]/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Regulatory Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-medium shadow-inner">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>196 Sovereign Jurisdictions • Millimeter Spatial Accuracy • Live Title Deeds</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Next-Gen Cadastral Intelligence & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-[#00bcd4]">PropTech OS</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Precision GIS vector parcel boundaries, sovereign land registry lookups, automated Comparative Market Analysis (CMA) engines, and institutional KYC/FICA verification in one integrated workspace.
            </p>

            {/* Primary Action Button Cluster */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                id="hero-btn-launch-app"
                onClick={() => setIsLoginOpen(true)}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-[#008ba3] hover:from-cyan-400 hover:to-[#007387] text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-900/40 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <Laptop className="w-4 h-4" />
                <span>Launch Cadastre Web App</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-btn-request-demo"
                onClick={() => { setSelectedPlanForLead('Enterprise Platform Demo'); setIsLeadModalOpen(true); }}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Request Live Demo & Free Trial</span>
              </button>

              <button
                id="hero-btn-instant-direct"
                onClick={onEnterApp}
                className="w-full sm:w-auto px-5 py-3.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                title="Direct Demo Sandbox Entry"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>1-Click Sandbox Entry</span>
              </button>
            </div>

            {/* Live Trust Metrics Bar */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">196</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Sovereign Nations</div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-teal-400 font-mono">140M+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Indexed Parcels</div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">99.98%</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Spatial Accuracy</div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">45k+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Licensed Practitioners</div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Application Window Mockup */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-cyan-950/50 overflow-hidden">
            {/* Terminal Window Header */}
            <div className="bg-slate-800/90 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-slate-400 font-mono text-[11px] ml-2">ptah://cadastre.workspace/three-anchor-bay/erf-1048</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE DEEDS FEED ACTIVE
                </span>
              </div>
            </div>

            {/* Mockup Workspace Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 min-h-[340px] bg-slate-950">
              {/* Map Canvas Preview */}
              <div className="md:col-span-2 relative p-4 bg-slate-900/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-white">5 Richmond Road, Three Anchor Bay</span>
                    <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-1.5 py-0.5 rounded">ERF 1048</span>
                  </div>
                  <div className="text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                    Extent: <span className="font-bold text-white font-mono">485 m²</span>
                  </div>
                </div>

                {/* Vector polygon representation */}
                <div className="my-6 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 relative overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" /> Spatial Cadastral Coordinates & Boundary
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">GPS: -33.9102, 18.3985</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-500 text-[9px]">LPI CODE</div>
                      <div className="text-cyan-200 font-bold">C01600000000104800000</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-500 text-[9px]">ZONING CODE</div>
                      <div className="text-amber-300 font-bold">SR1 (Single Res 1)</div>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <div className="text-slate-500 text-[9px]">DEEDS OFFICE</div>
                      <div className="text-emerald-300 font-bold">Cape Town Registry</div>
                    </div>
                  </div>
                </div>

                {/* Quick Interactive Map Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button onClick={onEnterApp} className="px-2.5 py-1 rounded bg-[#006980] hover:bg-cyan-600 text-white text-[11px] font-semibold flex items-center gap-1">
                    <Calculator className="w-3 h-3" /> Run Automated CMA
                  </button>
                  <button onClick={onEnterApp} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 border border-slate-700">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verify Owner (FICA/KYC)
                  </button>
                  <button onClick={onEnterApp} className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 border border-slate-700">
                    <FileText className="w-3 h-3 text-amber-400" /> Generate Valuation PDF
                  </button>
                </div>
              </div>

              {/* Sidebar Preview */}
              <div className="p-4 bg-slate-900/70 flex flex-col justify-between text-xs space-y-3">
                <div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Registered Owner Record</div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-white text-sm">Mr Stephan Muller</div>
                    <div className="text-slate-400 text-[11px]">ID: 780412 5089 084</div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> FICA Verified
                      </span>
                      <span className="text-[10px] text-slate-400">Purchased: 2018/11/04</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Valuation & Market Index</div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400 text-[11px]">Estimated Value:</span>
                      <span className="text-base font-extrabold text-cyan-300 font-mono">R 8,450,000</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400 text-[11px]">Confidence Score:</span>
                      <span className="text-xs font-bold text-emerald-400">94.8% High</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-[94.8%]" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={onEnterApp}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-[#006980] hover:from-cyan-400 hover:to-[#005566] text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Full Interactive Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE CAPABILITIES & TOOLS SECTION */}
      <section id="features" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full-Stack Real Estate Operating System</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              All Essential Functions & Tools in One Workspace
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed specifically for Principal Practitioners, Valuers, Conveyancers, and Enterprise Brokerages needing statutory compliance and spatial precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Interactive GIS Vector Cadastre</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time parcel polygon mapping with millimeter Erf boundary vectors, zoning classifications, cadastre numbers, and satellite overlays.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                <span>140M+ Parcels Mapped</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition-all group shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">National Title Deeds Registry</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Live statutory deeds lookup, bond registrations, transfer price histories, Title Deed numbers, and historical ownership lineage.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-teal-400 font-semibold flex items-center gap-1">
                <span>Direct Deeds Gateway Sync</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all group shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Automated CMA & Valuation Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated comparable sales clustering, suburb trend regression, price-per-square-meter indexing, and confidence scoring.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <span>RICS & SACPVP Compliant</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all group shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Institutional KYC / AML & FICA Suite</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated identity verification, PEP & sanctions screening, company CIPC lookups, Trust Deed beneficiary audits, and 72-hr compliance logs.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span>POPIA / GDPR / AML Certified</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all group shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Multi-Portal Listing Syndication</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  One-click distribution to Property24, Private Property, Zillow, Rightmove, Realtor.com, and national MLS networks with live sync logs.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                <span>Global API Integrations</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all group shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Kanban className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Deal Kanban & Transaction CRM</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track deals from mandate to Deeds Office registration with automated commission splits, OTP tracking, and compliance checkpoints.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                <span>End-to-End Pipeline</span>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/50 transition-all group shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-pink-950 text-pink-400 border border-pink-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">AI Copywriting & Media Studio</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate statutory property descriptions in 15+ languages, enhanced floorplan visualizers, high-res drone asset managers, and virtual tours.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-pink-400 font-semibold flex items-center gap-1">
                <span>Multi-Language Copy</span>
              </div>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Client PDF Reports & Digital Agent Cards</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export 24-page branded appraisal reports with statutory disclosures, Deeds transfers, aerial cadastre diagrams, and QR contact cards.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                <span>Custom Agency Branding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE TOOL SANDBOX EXPLORER */}
      <section id="tools" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test Drive the Interactive Cadastre Tools
            </h2>
            <p className="text-sm text-slate-400">
              Click through the live tool tabs below to inspect how Ptah accelerates statutory real estate intelligence.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveInteractiveTab('cadastre')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeInteractiveTab === 'cadastre'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Vector Cadastre GIS</span>
            </button>

            <button
              onClick={() => setActiveInteractiveTab('deeds')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeInteractiveTab === 'deeds'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>2. Title Deeds Inspector</span>
            </button>

            <button
              onClick={() => setActiveInteractiveTab('cma')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeInteractiveTab === 'cma'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>3. Automated CMA Engine</span>
            </button>

            <button
              onClick={() => setActiveInteractiveTab('kyc')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeInteractiveTab === 'kyc'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>4. FICA & KYC Verifier</span>
            </button>

            <button
              onClick={() => setActiveInteractiveTab('portals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeInteractiveTab === 'portals'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>5. Multi-Portal Syndication</span>
            </button>
          </div>

          {/* Interactive Sandbox Window */}
          <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            {activeInteractiveTab === 'cadastre' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-800 font-mono">
                    <Compass className="w-3.5 h-3.5" /> MILLIMETER SPATIAL CADASTRE
                  </div>
                  <h3 className="text-2xl font-bold text-white">Precision Erf & Lot Boundary Vectorization</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    View true statutory boundaries surveyed by official land surveyors. Includes Surveyor-General diagram links, servitude easements, and municipal zoning boundaries.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Sub-meter polygon vertex snapping with street frontage dimensioning.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Integrated Sectional Title Scheme unit outlines & participation quotas.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Instant municipal valuation and zoning allowance checks.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onEnterApp}
                    className="px-5 py-2.5 bg-[#006980] hover:bg-cyan-600 text-white rounded-lg font-bold text-xs flex items-center gap-2"
                  >
                    <span>Open Live Vector Map in App</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-3">
                  <div className="text-slate-400 flex justify-between border-b border-slate-800 pb-2">
                    <span>CADASTRE METADATA INSPECTOR</span>
                    <span className="text-cyan-400">ERF 1048 WC</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-slate-500 block text-[9px]">EXTENT (AREA)</span>
                      <span className="text-white font-bold">485.00 m²</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-slate-500 block text-[9px]">SG DIAGRAM NO</span>
                      <span className="text-cyan-300 font-bold">DGM 4589/1982</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-slate-500 block text-[9px]">ZONING</span>
                      <span className="text-amber-300 font-bold">Single Residential 1</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded">
                      <span className="text-slate-500 block text-[9px]">MUNICIPAL VALUE</span>
                      <span className="text-emerald-400 font-bold">R 7,950,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'deeds' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs text-teal-400 bg-teal-950 px-2.5 py-1 rounded-md border border-teal-800 font-mono">
                    <Database className="w-3.5 h-3.5" /> OFFICIAL TITLE DEEDS REGISTRY
                  </div>
                  <h3 className="text-2xl font-bold text-white">Full Historical Transfer & Bond Lineage</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Access statutory Deeds Office records instantly. Review historical transfer dates, sales amounts, bondholders, and active title deed numbers.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>Direct connection to national deeds office archives.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>Bond registration values & registered financial institutions.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>Audited owner names, ID numbers, and share percentages.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onEnterApp}
                    className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold text-xs flex items-center gap-2"
                  >
                    <span>Run Real-Time Deeds Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2.5">
                  <div className="text-slate-400 flex justify-between border-b border-slate-800 pb-2">
                    <span>OFFICIAL DEED RECORD</span>
                    <span className="text-teal-400">T48291/2018</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Owner:</span>
                      <span className="text-white font-bold">Mr Stephan Muller (100% Share)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Registration Date:</span>
                      <span className="text-cyan-300">2018/11/04</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Purchase Price:</span>
                      <span className="text-emerald-400 font-bold">R 6,250,000</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Bondholder:</span>
                      <span className="text-amber-300">Investec Bank Limited (R 5,000,000)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'cma' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950 px-2.5 py-1 rounded-md border border-amber-800 font-mono">
                    <Calculator className="w-3.5 h-3.5" /> AUTOMATED VALUATION ENGINE
                  </div>
                  <h3 className="text-2xl font-bold text-white">Comparative Market Analysis (CMA)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automate high-precision property valuations with spatial distance weighting, time-adjusted price indexing, and property feature regression.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Cluster comparable sales within 500m - 2km radius.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Adjust for bed/bath accommodation, condition, and pool.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Export 24-page client presentation with 1 click.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onEnterApp}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-2"
                  >
                    <span>Launch CMA Engine</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                  <div className="text-slate-400 flex justify-between border-b border-slate-800 pb-2 text-[11px] font-mono">
                    <span>CMA REGRESSION STATS</span>
                    <span className="text-emerald-400 font-bold">HIGH CONFIDENCE (94.8%)</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valuation Range:</span>
                      <span className="text-white font-mono font-bold">R 8,200,000 — R 8,700,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recommended List Price:</span>
                      <span className="text-cyan-400 font-mono font-bold text-sm">R 8,450,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Suburb Price / m²:</span>
                      <span className="text-amber-300 font-mono">R 17,422 / m²</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'kyc' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> INSTITUTIONAL KYC & AML
                  </div>
                  <h3 className="text-2xl font-bold text-white">Statutory FICA & Anti-Money Laundering</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Verify natural persons, corporate entities, and trust structures in real time. Maintain 72-hour compliance audit trails with downloadable risk certificates.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ID/Passport algorithmic verification and deceased status check.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>PEP (Politically Exposed Persons) & Sanction list screening.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verified residential address proof & contact traces.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onEnterApp}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-2"
                  >
                    <span>Perform Identity Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2.5">
                  <div className="text-slate-400 flex justify-between border-b border-slate-800 pb-2">
                    <span>FICA COMPLIANCE CERTIFICATE</span>
                    <span className="text-emerald-400 font-bold">PASSED (LOW RISK)</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subject Name:</span>
                      <span className="text-white font-bold">Stephan Muller</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">National ID:</span>
                      <span className="text-cyan-300">780412 5089 084 (Valid)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sanctions / PEP:</span>
                      <span className="text-emerald-400 font-bold">Clear (0 Matches)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audit Reference:</span>
                      <span className="text-slate-500">FIC-ZA-2026-98104</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'portals' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950 px-2.5 py-1 rounded-md border border-blue-800 font-mono">
                    <Share2 className="w-3.5 h-3.5" /> MULTI-PORTAL SYNDICATION
                  </div>
                  <h3 className="text-2xl font-bold text-white">Broadcast Listings to Global Portals</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Synchronize your active property mandates across Property24, Private Property, Zillow, Rightmove, and MLS feeds automatically without manual re-entry.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>Instant high-resolution photo and floorplan syndication.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>Price changes & status updates broadcast within 60 seconds.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>Direct lead capture and CRM inquiry routing.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onEnterApp}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-2"
                  >
                    <span>Manage Portal Feeds</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2.5">
                  <div className="text-slate-400 flex justify-between border-b border-slate-800 pb-2">
                    <span>LIVE PORTAL STATUS</span>
                    <span className="text-emerald-400 font-bold">4 CHANNELS SYNCED</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between items-center p-1.5 bg-slate-900 rounded">
                      <span className="text-white font-bold">Property24 (South Africa)</span>
                      <span className="text-emerald-400 text-[10px]">● Active (Ref P24-8902)</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 bg-slate-900 rounded">
                      <span className="text-white font-bold">Private Property</span>
                      <span className="text-emerald-400 text-[10px]">● Active (Ref PP-1048)</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 bg-slate-900 rounded">
                      <span className="text-white font-bold">Zillow MLS Feed</span>
                      <span className="text-cyan-400 text-[10px]">● Ready to Publish</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. 196 SOVEREIGN JURISDICTIONS MATRIX */}
      <section id="jurisdictions" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Multi-National Compliance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              196 Sovereign Jurisdictions Supported
            </h2>
            <p className="text-sm text-slate-400">
              Ptah dynamically adjusts statutory naming, legal identifiers, licensing bodies, and currencies across all 196 global territories.
            </p>
          </div>

          {/* Interactive Country Inspector */}
          <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Select Country / Sovereign Jurisdiction
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={previewCountryCode}
                    onChange={(e) => setPreviewCountryCode(e.target.value)}
                    className="bg-slate-900 text-white font-bold text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {GLOBAL_COUNTRIES_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">STATUTORY AUTHORITY</span>
                <span className="text-xs font-bold text-cyan-300">{activeCountry.complianceAuthorityName || activeCountry.regulatoryBody}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">LEGAL IDENTIFIER</span>
                <span className="text-white font-bold text-sm">{activeCountry.legalIdentifierName}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">LAND REGISTRY AUTHORITY</span>
                <span className="text-teal-300 font-bold text-sm">{activeCountry.landRegistryAuthority}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">LICENSING CREDENTIAL</span>
                <span className="text-amber-300 font-bold text-sm">{activeCountry.ffcLicenseName}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DEFAULT CURRENCY</span>
                <span className="text-emerald-400 font-bold text-sm">{activeCountry.currency.symbol} ({activeCountry.currency.code})</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Statutory Act: <span className="text-slate-200 font-semibold">{activeCountry.statutoryAct || 'National Land Deeds & Property Act'}</span>
              </span>
              <button
                onClick={onEnterApp}
                className="px-4 py-2 bg-[#006980] hover:bg-cyan-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
              >
                <span>Launch {activeCountry.name} Cadastre</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING & SUBSCRIPTIONS */}
      <section id="pricing" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Transparent & Predictable Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Flexible Plans for Practitioners & Brokerages
            </h2>
            <p className="text-sm text-slate-400">
              Zero long-term lock-in. Upgrade or top up pay-as-you-go credits anytime.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3 text-xs font-semibold">
              <span className={billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}>Monthly Billing</span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-12 h-6 bg-slate-800 rounded-full p-1 transition-colors relative border border-slate-700"
              >
                <div
                  className={`w-4 h-4 bg-cyan-400 rounded-full transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6 bg-emerald-400' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                <span>Annual Billing</span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-800">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan 1: Starter Practitioner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Starter Practitioner</h3>
                  <p className="text-xs text-slate-400 mt-1">For independent real estate agents and candidate valuers.</p>
                </div>

                <div className="py-2 border-y border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {billingCycle === 'annual' ? 'R 600' : 'R 750'}
                    </span>
                    <span className="text-xs text-slate-400">/ month (ex VAT)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Approx $40 USD / mo</div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>100 Cadastral & Vector Map Searches / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>25 Title Deeds Lookups included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>10 Automated CMA Valuations / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Standard PDF Export with Watermark</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>1 User Seat</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenLeadWithPlan('Starter Practitioner (R 750/mo)')}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Get Started with Starter
              </button>
            </div>

            {/* Plan 2: Principal Pro (Highlighted) */}
            <div className="bg-gradient-to-b from-slate-900 to-[#002f38] border-2 border-cyan-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-cyan-950/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-[#00bcd4] text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                MOST POPULAR FOR AGENCIES
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>Principal Pro</span>
                    <span className="text-xs text-cyan-300 font-normal">Full OS Suite</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">Complete spatial intelligence, deeds lookups, and multi-portal sync.</p>
                </div>

                <div className="py-2 border-y border-cyan-500/30">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-cyan-300 font-mono">
                      {billingCycle === 'annual' ? 'R 1,480' : 'R 1,850'}
                    </span>
                    <span className="text-xs text-slate-300">/ month (ex VAT)</span>
                  </div>
                  <div className="text-[11px] text-cyan-200/70 mt-0.5">Approx $99 USD / mo</div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300 shrink-0 font-bold" />
                    <span><strong>Unlimited</strong> Cadastral GIS Vector Searches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300 shrink-0 font-bold" />
                    <span><strong>250 Monthly Data Credits</strong> (Deeds & Cadastre)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300 shrink-0 font-bold" />
                    <span><strong>25 FICA & Identity Verifications</strong> included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300 shrink-0 font-bold" />
                    <span>Full Automated CMA Engine & 24-Page PDF Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300 shrink-0 font-bold" />
                    <span>Multi-Portal Syndication (Property24 / Private Property)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300 shrink-0 font-bold" />
                    <span>Digital Agent Card & QR Generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300 shrink-0 font-bold" />
                    <span>Up to 3 Agent Seats included</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenLeadWithPlan('Principal Pro (R 1,850/mo)')}
                className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-400 to-[#00bcd4] hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Start 14-Day Free Pro Trial
              </button>
            </div>

            {/* Plan 3: Enterprise Brokerage */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Enterprise Brokerage</h3>
                  <p className="text-xs text-slate-400 mt-1">For national real estate brands, franchises, and conveyancing firms.</p>
                </div>

                <div className="py-2 border-y border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {billingCycle === 'annual' ? 'R 3,960' : 'R 4,950'}
                    </span>
                    <span className="text-xs text-slate-400">/ month (ex VAT)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Approx $265 USD / mo</div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Unlimited Agent & Principal Seats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>1,500 Monthly Data & Deeds Credits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>150 FICA / AML Institutional Verifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>White-Label Client Reports & Custom Domain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>REST API Access & Direct CRM Webhooks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Dedicated SLA & Priority Technical Support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenLeadWithPlan('Enterprise Brokerage (R 4,950/mo)')}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ABOUT PTAH & DATA GOVERNANCE */}
      <section id="about" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>About Ptah Real Estate Technologies</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Empowering Real Estate with Millimeter Spatial Integrity
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ptah was engineered by land surveyors, conveyancers, and software architects to eliminate the fragmentation between land registries, cadastral GIS mapping, and real estate marketing.
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                By unifying multi-national land registry APIs across 196 countries into a high-performance vector OS, licensed practitioners can evaluate titles, analyze market comparables, screen anti-money laundering risks, and syndicate mandates in seconds.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" /> Bank-Grade Security
                  </div>
                  <p className="text-[11px] text-slate-400">256-bit AES encryption with ISO 27001 data governance.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" /> Statutory Compliance
                  </div>
                  <p className="text-[11px] text-slate-400">Full POPIA, GDPR, and AML/CFT statutory adherence.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>Our Core Operating Commitments</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Statutory Authenticity</span>
                    <span className="text-slate-400 text-[11px]">We pull directly from official national land registries with timestamped audit certificates.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">No Vendor Lock-In</span>
                    <span className="text-slate-400 text-[11px]">Export your listings, valuations, and compliance audits to CSV, GeoJSON, and PDF at any time.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Global Territory Engine</span>
                    <span className="text-slate-400 text-[11px]">Continuous legal updates across 196 countries ensuring compliance with local statutory amendments.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT & GLOBAL HUBS */}
      <section id="contact" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-semibold">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Get in Touch</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Global Practitioner Support & Hubs
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our support team includes licensed conveyancers, cadastral surveyors, and API engineers ready to assist with enterprise integrations and data feeds.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Support & Inquiries</div>
                    <div className="font-bold text-white">support@ptahrealty.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Practitioner Priority Line</div>
                    <div className="font-bold text-white">+27 (0) 21 890 4120 / +27 66 349 6137</div>
                  </div>
                </div>
              </div>

              {/* Global Offices */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="font-bold text-slate-200">Global Operational Hubs:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>🇿🇦 Cape Town (HQ)</div>
                  <div>🇬🇧 London City (Coming soon)</div>
                  <div>🇺🇸 New York (Coming soon)</div>
                  <div>🇸🇬 Singapore Hub (Coming soon)</div>
                </div>
              </div>
            </div>

            {/* Direct Quick Lead Form */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white mb-2">Request an Agency Walkthrough</h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill in your details below and a regional cadastral specialist will contact you with a tailored workspace preview.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Corporate / Agency Email</label>
                  <input
                    type="email"
                    placeholder="john@agency.com"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+27 82 123 4567"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Agency / Brokerage Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ptah Real Estate"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-4 text-xs">
                <label className="block text-slate-300 font-semibold mb-1">How can we help your agency?</label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your team size, required deeds registry feeds, or multi-portal syndication requirements..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Your information is strictly protected under POPIA / GDPR.</span>
                </div>
                <button
                  id="btn-footer-contact-submit"
                  onClick={() => { setSelectedPlanForLead('Custom Agency Request'); setIsLeadModalOpen(true); }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-[#008ba3] hover:from-cyan-400 hover:to-[#007387] text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Submit Inquiry & Open Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-slate-200 text-slate-500 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden p-1">
                <img src="/logo.svg" alt="Ptah Realty" className="w-full h-full" />
              </div>
              <span className="text-slate-900 font-bold text-sm">PTAH REALTY OS</span>
              <span className="text-[10px] text-slate-400 font-mono">196 Sovereign Jurisdictions</span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600 font-mono font-semibold">ALL 196 NATIONAL DEEDS GATEWAYS OPERATIONAL</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Ptah Real Estate & Cadastral Intelligence Technologies. All Rights Reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="#about" className="hover:text-cyan-600">Data Governance</a>
              <a href="#contact" className="hover:text-cyan-600">POPIA & GDPR Disclosures</a>
              <a href="#pricing" className="hover:text-cyan-600">Statutory Licensing</a>
              <button onClick={() => setIsLoginOpen(true)} className="text-cyan-600 hover:underline">Practitioner Login</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          setIsLoginOpen(false);
          onEnterApp();
        }}
        onOpenLeadModal={() => setIsLeadModalOpen(true)}
      />

      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onLaunchAppDirectly={() => {
          setIsLeadModalOpen(false);
          onEnterApp();
        }}
        initialPlan={selectedPlanForLead}
      />
    </div>
  );
};
