import React, { useState, useMemo } from 'react';
import {
  Users,
  UploadCloud,
  MapPin,
  Mail,
  Smartphone,
  Megaphone,
  Share2,
  FileSpreadsheet,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  BarChart2,
  Menu,
  Eye,
  Gift,
  RefreshCw,
  Clock,
  Home,
  Check,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { Lead, PropertyListing, ShowHouseRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TopStatsOverview } from './TopStatsOverview';

// High-End Luxury Editorial Assets -- ported over from the AI Studio demo
// design (see chat) to match its exact Dashboard visual treatment.
import luxuryVillaImg from '../assets/images/luxury_estate_hero_1787979917947.jpg';
import youngBuyerImg from '../assets/images/age_bracket_young_1787979933078.jpg';
import midBuyerImg from '../assets/images/age_bracket_mid_1787979946226.jpg';
import seniorPatronImg from '../assets/images/age_bracket_senior_1787979958991.jpg';

interface DashboardViewProps {
  leads: Lead[];
  listings: PropertyListing[];
  showHouses: ShowHouseRecord[];
  onOpenQuickListings: () => void;
  onSelectLead: (lead: Lead) => void;
  onNavigateView: (view: 'dashboard' | 'pipeline' | 'calendar' | 'automations' | 'reporting' | 'scrum') => void;
  onAddShowHouse: (showHouse: ShowHouseRecord) => void;
  onUpdateShowHouse: (showHouse: ShowHouseRecord) => void;
  onQuickWhatsApp: (lead: Lead) => void;
  onOpenCampaigns?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  listings,
  showHouses,
  onOpenQuickListings,
  onSelectLead,
  onNavigateView,
  onAddShowHouse,
  onUpdateShowHouse,
  onQuickWhatsApp,
  onOpenCampaigns,
}) => {
  // Calendar state for August 2026 (matching system date 2026-08-27 / 28)
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 7, 28)); // August 2026
  
  // Show House Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [showHouseSearch, setShowHouseSearch] = useState('');
  const [closedShowHouseSearch, setClosedShowHouseSearch] = useState('');

  // Dialog states for dashboard actions
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSyncSuccess, setCalendarSyncSuccess] = useState(false);
  const [isPortfolioShareOpen, setIsPortfolioShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Filtered show houses
  const openShowHouses = showHouses.filter(
    (sh) =>
      sh.status === 'opened' &&
      (sh.propertyName.toLowerCase().includes(showHouseSearch.toLowerCase()) ||
        sh.ownerName.toLowerCase().includes(showHouseSearch.toLowerCase()))
  );

  const closedShowHouses = showHouses.filter(
    (sh) =>
      sh.status === 'closed' &&
      (sh.propertyName.toLowerCase().includes(closedShowHouseSearch.toLowerCase()) ||
        sh.ownerName.toLowerCase().includes(closedShowHouseSearch.toLowerCase()))
  );

  // Handle Start Show House
  const handleStartShowHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) return;

    const property = listings.find((p) => p.id === selectedPropertyId);
    const client = leads.find((l) => l.id === selectedClientId);

    if (!property) return;

    const newShowHouse: ShowHouseRecord = {
      id: `sh-${Date.now()}`,
      propertyId: property.id,
      propertyName: property.title,
      propertyLocation: property.location,
      ownerName: property.ownerName || client?.name || 'Direct Principal',
      clientName: client ? client.name : undefined,
      startDate: '2026-08-30 14:00',
      endDate: '2026-08-30 17:00',
      status: 'opened',
      agentInCharge: 'privjapan (Senior Principal)',
      attendeeCount: 0,
      notes: 'Scheduled via CRM Dashboard',
    };

    onAddShowHouse(newShowHouse);
    setSelectedPropertyId('');
    setSelectedClientId('');
  };

  const handleSyncGoogleCalendar = () => {
    setIsSyncingCalendar(true);
    setTimeout(() => {
      setIsSyncingCalendar(false);
      setCalendarSyncSuccess(true);
      setTimeout(() => setCalendarSyncSuccess(false), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Row with Title & Quick Action Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-wide text-rose-500/90 dark:text-rose-400 font-bold">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real Estate CRM Command Center & Client Intelligence
          </p>
        </div>

        {/* Action Pills Bar (matching Screenshot 3) */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => onNavigateView('pipeline')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>MY CLIENTS</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>FILE IMPORT</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('show-house-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>SHOW HOUSE</span>
          </button>

          <button
            onClick={() => onNavigateView('automations')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>EMAIL</span>
          </button>

          <button
            onClick={() => {
              if (leads[0]) onQuickWhatsApp(leads[0]);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>SMS</span>
          </button>

          <button
            onClick={() => {
              if (onOpenCampaigns) {
                onOpenCampaigns();
              } else {
                onNavigateView('automations');
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-700 transition cursor-pointer shadow-xs"
            title="Launch Omnichannel Marketing Hub (Canva, Mailchimp, Zapier & AI)"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>CAMPAIGNS</span>
            <span className="text-[9px] px-1 py-0.2 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-full font-extrabold uppercase">
              AI
            </span>
          </button>

          <button
            onClick={() => setIsPortfolioShareOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-500" />
            <span>PORTFOLIO SHARING</span>
          </button>

          <button
            onClick={() => onNavigateView('scrum')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
            <span>DEAL TRACKER</span>
          </button>
        </div>
      </div>

      {/* Top-Level Executive Statistics Section with Sparklines & Interactive
          Drilldown -- brought over from the AI Studio demo (see chat). */}
      <TopStatsOverview
        leads={leads}
        onNavigateView={onNavigateView}
        onSelectLead={onSelectLead}
        onQuickWhatsApp={onQuickWhatsApp}
      />

      {/* Row 1: Quick Listings Card + Client Type + Client Status + Client Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Quick Listing Card - Luxury Editorial Design (matching AI
            Studio demo -- see chat) */}
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl p-4 bg-slate-900 text-white border border-slate-800 dark:border-slate-750 flex flex-col justify-between overflow-hidden group shadow-lg min-h-[220px]">
            {/* Background luxury subtle glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Tag & Live Active Count */}
            <div className="flex items-center justify-between z-10 mb-2.5">
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[10px] font-semibold text-amber-300 tracking-wider uppercase">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>PRIME PORTFOLIO</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span>{listings.filter((l) => l.status === 'show_house' || l.status === 'active').length} Active</span>
              </div>
            </div>

            {/* Luxury Architectural Imagery Window */}
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-800/80 my-1 group-hover:border-amber-500/30 transition duration-500">
              <img
                src={luxuryVillaImg}
                alt="Luxury Architectural Estate"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-medium text-amber-200/90 uppercase tracking-wider block">
                    Exclusive Mandates
                  </span>
                  <span className="text-xs font-serif font-bold text-white tracking-wide truncate block max-w-[140px]">
                    Clifton & Bishopscourt
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-300 bg-slate-950/70 px-1.5 py-0.5 rounded border border-slate-800">
                  R42.5M+
                </span>
              </div>
            </div>

            {/* Quick Listing Action CTA */}
            <div className="w-full mt-2.5 z-10">
              <button
                onClick={onOpenQuickListings}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide transition duration-200 cursor-pointer shadow-md hover:shadow-amber-500/20 flex items-center justify-center space-x-1.5 active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>QUICK LISTING</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        </div>

        {/* CLIENT TYPE Widget (Screenshot 3 & 4) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                <Users className="w-3.5 h-3.5" />
                <span>CLIENT TYPE</span>
              </div>
              <span title="Breakdown of leads by relationship type">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                  {leads.length} Clients
                </span>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  WITHIN YOUR CRM
                </span>
              </div>

              <button
                onClick={() => onNavigateView('pipeline')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>My Clients</span>
              </button>
            </div>

            {/* Type items grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-2 text-center">
              {[
                { label: 'Buyer', count: leads.filter((l) => l.buyerType === 'Cash Buyer' || l.buyerType === 'First-Time Buyer').length },
                { label: 'Seller', count: 0 },
                { label: 'Tenant', count: leads.filter((l) => l.buyerType === 'Tenant').length },
                { label: 'Landlord', count: 0 },
                { label: 'Agent', count: 0 },
                { label: 'Buyer and Seller', count: 0 },
              ].map((item) => {
                const pct = leads.length ? Math.round((item.count / leads.length) * 100) : 0;
                return (
                  <div key={item.label} className="border-l border-slate-200 dark:border-slate-800 first:border-l-0 px-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.count}</div>
                    <div className="text-[10px] text-slate-400">{pct}%</div>
                    <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 underline truncate">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom unknown bar */}
          <div className="mt-4 pt-2">
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full w-full" />
            </div>
            <div className="text-right text-[10px] uppercase font-bold text-slate-400 mt-1">
              {leads.length} UNKNOWN
            </div>
          </div>
        </div>

        {/* CLIENT STATUS (Circular Gauges) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CLIENT STATUS</span>
            </div>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center justify-around my-auto py-2">
            {/* Validated Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white border-2 border-slate-800 shadow-xs">
                <div className="text-center">
                  <span className="text-xs font-bold block">{leads.length}</span>
                  <span className="text-[9px] text-slate-400 block">100%</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 underline mt-2">
                Validated
              </span>
            </div>

            {/* Obtained Consent Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-14 h-14 rounded-full bg-slate-850 dark:bg-slate-800 flex items-center justify-center text-white border-2 border-slate-700/60 shadow-xs">
                <div className="text-center">
                  <span className="text-xs font-bold block">0</span>
                  <span className="text-[9px] text-slate-400 block">0%</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 underline mt-2 text-center max-w-[80px]">
                Obtained Consent
              </span>
            </div>
          </div>
        </div>

        {/* CLIENT SOURCE (Circular Gauges) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>CLIENT SOURCE</span>
            </div>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="grid grid-cols-3 gap-1 my-auto py-2">
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white text-[11px] font-bold">
                <div className="text-center">
                  <span>0</span>
                  <span className="block text-[8px] text-slate-400 font-normal">0%</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1.5 text-center">
                File Import
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white text-[11px] font-bold">
                <div className="text-center">
                  <span>0</span>
                  <span className="block text-[8px] text-slate-400 font-normal">0%</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1.5 text-center">
                Show House
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-cyan-500/40">
                <div className="text-center">
                  <span>{leads.length}</span>
                  <span className="block text-[8px] text-slate-400 font-normal">100%</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1.5 text-center">
                TVA Import
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Demographics Mini-Cards (Gender + Awaiting Verification + Events Scheduled) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MTD | YTD Closed Sales Performance Card (replaces the old
            Male/Female breakdown -- ported over from the AI Studio demo
            design, see chat) */}
        <div
          id="mtd-ytd-sales-card"
          className="bg-white dark:bg-slate-850 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Award className="w-3.5 h-3.5" />
              <span>CLOSED SALES METRICS</span>
            </div>
            {/* MTD | YTD Badge */}
            <div className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-750 text-white text-[10px] font-mono font-extrabold tracking-wider">
              MTD <span className="text-cyan-400 font-bold">|</span> YTD
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto py-1">
            {/* MTD Closed Sales */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                MTD Closed Sales
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                R42.5M
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUpRight className="w-3 h-3" />
                <span>3 Deals • Aug '26</span>
              </div>
            </div>

            {/* YTD Sales */}
            <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                YTD Sales Volume
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                R186.5M
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                14 Deals • R13.9M Comm.
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium truncate">
              Target: R220M YTD
            </span>
            <button
              onClick={() => onNavigateView('reporting')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5"
            >
              <span>View Audit</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Clients Awaiting Verification */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">0</span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">Clients</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              AWAITING VERIFICATION
            </span>
          </div>

          <div className="text-right">
            <UploadCloud className="w-6 h-6 text-slate-300 dark:text-slate-600 ml-auto mb-1" />
            <button
              onClick={() => onNavigateView('pipeline')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 underline"
            >
              Verify Clients
            </button>
          </div>
        </div>

        {/* Scheduled Today & Calendar */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">0</span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">Events</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              SCHEDULED TODAY
            </span>
            <span className="text-[10px] text-slate-400">0 % EVENTS COMPLETE</span>
          </div>

          <div className="text-right">
            <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600 ml-auto mb-1" />
            <button
              onClick={() => onNavigateView('calendar')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 underline"
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Client Age Brackets + LSM & Attractiveness + Likelihood to Buy/Sell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CLIENT AGE BRACKETS - Luxury Demographic Personas (ported over
            from the AI Studio demo design, see chat) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                <Users className="w-3.5 h-3.5" />
                <span>DEMOGRAPHIC INTELLIGENCE</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Age Brackets
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  bracket: '18 - 29',
                  pct: '22%',
                  label: 'Next-Gen UHNW',
                  persona: 'Tech Innovators & Founders',
                  img: youngBuyerImg,
                  accent: 'border-amber-400/40 text-amber-500 dark:text-amber-400',
                },
                {
                  bracket: '30 - 39',
                  pct: '12%',
                  label: 'Executive Leaders',
                  persona: 'Corporate Partners & Ex-pats',
                  img: youngBuyerImg,
                  accent: 'border-sky-400/40 text-sky-500 dark:text-sky-400',
                },
                {
                  bracket: '40 - 59',
                  pct: '22%',
                  label: 'Private Wealth',
                  persona: 'Principals & Family Offices',
                  img: midBuyerImg,
                  accent: 'border-emerald-400/40 text-emerald-500 dark:text-emerald-400',
                },
                {
                  bracket: '60+',
                  pct: '44%',
                  label: 'Legacy Trustees',
                  persona: 'Portfolio Patriarchs & Matriarchs',
                  img: seniorPatronImg,
                  accent: 'border-purple-400/40 text-purple-500 dark:text-purple-400',
                },
              ].map((item) => (
                <div
                  key={item.bracket}
                  className="group relative flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750/80 hover:border-slate-300 dark:hover:border-slate-650 transition duration-200 shadow-2xs hover:shadow-xs"
                >
                  {/* Luxury Portrait Frame */}
                  <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-slate-300 via-amber-200/50 to-slate-400 dark:from-slate-700 dark:via-amber-500/30 dark:to-slate-600 shadow-xs mb-2 overflow-hidden group-hover:scale-105 transition duration-300">
                    <img
                      src={item.img}
                      alt={item.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center rounded-full"
                    />
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                  </div>

                  {/* Demographic Tier Labels */}
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 text-center truncate max-w-full leading-tight">
                    {item.label}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 text-center truncate max-w-full mb-2">
                    {item.persona}
                  </span>

                  {/* Sleek Dark Badge with Bracket & Percentage */}
                  <div className="w-full flex items-center justify-between px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-semibold shadow-2xs border border-slate-800">
                    <span className="text-slate-300">{item.bracket}</span>
                    <span className={item.accent.split(' ')[1] || 'text-cyan-400'}>{item.pct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Primary Core Segment</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">60+ Trustees (44%)</span>
          </div>
        </div>

        {/* LSM AND SUBURB ATTRACTIVENESS Bar Chart (Screenshot 3 & 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>LSM & SUBURB ATTRACTIVENESS</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center justify-between mt-3 mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Number of Clients
              </span>
              <Menu className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between px-4 pt-4 border-b border-l border-slate-200 dark:border-slate-700 relative">
              {/* Y-axis guide labels */}
              <div className="absolute -left-5 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono text-slate-400">
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>

              {/* Group 0-3 */}
              <div className="flex items-end space-x-1.5 h-full">
                <div className="w-6 bg-gradient-to-t from-rose-800 to-rose-600 rounded-t-sm transition-all duration-300 hover:brightness-110" style={{ height: '0%' }} title="LSM: 0" />
                <div className="w-6 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-sm transition-all duration-300 hover:brightness-110" style={{ height: '20%' }} title="Suburb Attractiveness: 2" />
              </div>

              {/* Group 4-7 */}
              <div className="flex items-end space-x-1.5 h-full">
                <div className="w-6 bg-gradient-to-t from-rose-800 to-rose-600 rounded-t-sm transition-all duration-300 hover:brightness-110" style={{ height: '20%' }} title="LSM: 2" />
                <div className="w-6 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-sm transition-all duration-300 hover:brightness-110" style={{ height: '0%' }} title="Suburb Attractiveness: 0" />
              </div>

              {/* Group 8-10 */}
              <div className="flex items-end space-x-1.5 h-full">
                <div className="w-6 bg-gradient-to-t from-rose-800 to-rose-600 rounded-t-sm transition-all duration-300 hover:brightness-110" style={{ height: '30%' }} title="LSM: 3" />
                <div className="w-6 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-sm transition-all duration-300 hover:brightness-110" style={{ height: '50%' }} title="Suburb Attractiveness: 5" />
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between px-6 pt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>0-3</span>
              <span>4-7</span>
              <span>8-10</span>
            </div>
            <div className="text-center text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
              Score Tier
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-gradient-to-tr from-rose-800 to-rose-600 rounded-xs inline-block shadow-2xs" />
              <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">LSM Score</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-gradient-to-tr from-cyan-700 to-cyan-500 rounded-xs inline-block shadow-2xs" />
              <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">Suburb Attractiveness</span>
            </div>
          </div>
        </div>

        {/* CLIENT LIKELIHOOD TO BUY AND SELL Bar Chart (Screenshot 3 & 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>CLIENT LIKELIHOOD TO BUY & SELL</span>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex items-center justify-between mt-3 mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Number of Clients
              </span>
              <Menu className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between px-2 pt-4 border-b border-l border-slate-200 dark:border-slate-700 relative">
              {/* Y-axis guide */}
              <div className="absolute -left-5 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono text-slate-400">
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>

              {/* Very Unlikely */}
              <div className="flex items-end space-x-1 h-full">
                <div className="w-3.5 bg-gradient-to-t from-rose-800 to-rose-600 rounded-t-sm" style={{ height: '30%' }} title="Buy: 3" />
                <div className="w-3.5 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-sm" style={{ height: '20%' }} title="Sell: 2" />
              </div>

              {/* Unlikely */}
              <div className="flex items-end space-x-1 h-full">
                <div className="w-3.5 bg-gradient-to-t from-rose-800 to-rose-600 rounded-t-sm" style={{ height: '0%' }} />
                <div className="w-3.5 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-sm" style={{ height: '0%' }} />
              </div>

              {/* Somewhat Likely */}
              <div className="flex items-end space-x-1 h-full">
                <div className="w-3.5 bg-gradient-to-t from-rose-800 to-rose-600 rounded-t-sm" style={{ height: '0%' }} />
                <div className="w-3.5 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-sm" style={{ height: '10%' }} title="Sell: 1" />
              </div>

              {/* Likely */}
              <div className="flex items-end space-x-1 h-full">
                <div className="w-3.5 bg-gradient-to-t from-rose-800 to-rose-600 rounded-t-sm" style={{ height: '0%' }} />
                <div className="w-3.5 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-sm" style={{ height: '10%' }} title="Sell: 1" />
              </div>

              {/* Highly Likely */}
              <div className="flex items-end space-x-1 h-full">
                <div className="w-3.5 bg-gradient-to-t from-rose-800 to-rose-600 rounded-t-sm" style={{ height: '0%' }} />
                <div className="w-3.5 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-sm" style={{ height: '30%' }} title="Sell: 3" />
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between px-1 pt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              <span className="text-center leading-tight">Very<br />Unlikely</span>
              <span className="text-center leading-tight">Unlikely</span>
              <span className="text-center leading-tight">Somewhat<br />Likely</span>
              <span className="text-center leading-tight">Likely</span>
              <span className="text-center leading-tight">Highly<br />Likely</span>
            </div>
            <div className="text-center text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
              Propensity Tier
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-gradient-to-tr from-rose-800 to-rose-600 rounded-xs inline-block shadow-2xs" />
              <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">Likelihood To Buy</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-gradient-to-tr from-cyan-700 to-cyan-500 rounded-xs inline-block shadow-2xs" />
              <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">Likelihood To Sell</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: SHOW HOUSE SELECT & CURRENT SHOW HOUSES (Matching Screenshot 2) */}
      <div id="show-house-section" className="space-y-4 pt-2">
        {/* SHOW HOUSE SELECT Card */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>SHOW HOUSE SELECT</span>
            </div>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <form onSubmit={handleStartShowHouse} className="mt-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              SELECT A CLIENT AND THE PROPERTY ON SHOW:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="flex items-center space-x-3">
                <label className="text-xs text-slate-600 dark:text-slate-300 w-24 shrink-0 font-medium">
                  Select Client
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="">--Select--</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <label className="text-xs text-slate-600 dark:text-slate-300 w-24 shrink-0 font-medium">
                  Select Property
                </label>
                <select
                  required
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="">--Select--</option>
                  {listings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.suburb} - {formatCurrency(p.price)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                START SHOW HOUSE
              </button>
            </div>
          </form>
        </div>

        {/* CURRENT SHOW HOUSES Card (Opened) */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CURRENT SHOW HOUSES</span>
            </div>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              CURRENT OPENED SHOW HOUSES:
            </span>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span>Show</span>
                <select className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <option>10</option>
                  <option>25</option>
                </select>
              </div>

              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <span>Search:</span>
                <input
                  type="text"
                  value={showHouseSearch}
                  onChange={(e) => setShowHouseSearch(e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-3 font-semibold">Continue</th>
                  <th className="py-2 px-3 font-semibold">Owner</th>
                  <th className="py-2 px-3 font-semibold">Property Name</th>
                  <th className="py-2 px-3 font-semibold">Start Date</th>
                  <th className="py-2 px-3 font-semibold">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {openShowHouses.length > 0 ? (
                  openShowHouses.map((sh) => (
                    <tr key={sh.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3">
                        <button
                          onClick={() => {
                            onUpdateShowHouse({ ...sh, status: 'closed' });
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition"
                        >
                          Mark Closed
                        </button>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {sh.ownerName}
                      </td>
                      <td className="py-2 px-3 text-cyan-600 dark:text-cyan-400 font-semibold">
                        {sh.propertyName}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{sh.startDate}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{sh.endDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CURRENT CLOSED SHOW HOUSES Card */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CURRENT CLOSED SHOW HOUSES</span>
            </div>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              CURRENT CLOSED SHOW HOUSES:
            </span>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <span>Show</span>
                <select className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <option>10</option>
                  <option>25</option>
                </select>
              </div>

              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <span>Search:</span>
                <input
                  type="text"
                  value={closedShowHouseSearch}
                  onChange={(e) => setClosedShowHouseSearch(e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Owner</th>
                  <th className="py-2 px-3 font-semibold">Property Name</th>
                  <th className="py-2 px-3 font-semibold">Start Date</th>
                  <th className="py-2 px-3 font-semibold">End Date</th>
                  <th className="py-2 px-3 font-semibold">Attendees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {closedShowHouses.length > 0 ? (
                  closedShowHouses.map((sh) => (
                    <tr key={sh.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Closed
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {sh.ownerName}
                      </td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {sh.propertyName}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{sh.startDate}</td>
                      <td className="py-2 px-3 text-slate-500">{sh.endDate}</td>
                      <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {sh.attendeeCount || 0} Registered
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 5: MY EVENTS (Screenshot 5 Calendar) */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Header with Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>MY EVENTS</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBirthdayModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>BIRTHDAY CAMPAIGN</span>
            </button>

            <button
              onClick={handleSyncGoogleCalendar}
              disabled={isSyncingCalendar}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
              <span>{calendarSyncSuccess ? 'SYNCED TO GOOGLE!' : 'SYNC EVENTS WITH GOOGLE CALENDAR'}</span>
            </button>

            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Calendar Navigation & Month Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))}
              className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonthDate(new Date(2026, 7, 28))}
              className="px-3 py-1 rounded text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              today
            </button>
          </div>

          <h2 className="text-xl font-light text-slate-800 dark:text-white tracking-wide">
            August 2026
          </h2>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['month', 'week', 'day'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-3 py-1 text-xs font-semibold rounded capitalize transition ${
                  calendarView === view
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid for August 2026 */}
        <div className="border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden">
          {/* Day Names */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-400 text-center py-2">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* Week 1: Jul 26 - Aug 1 */}
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">26</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">27</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">28</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">29</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">30</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">31</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">1</div>

            {/* Week 2: Aug 2 - 8 */}
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">2</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">3</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">4</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">5</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">6</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">7</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">8</div>

            {/* Week 3: Aug 9 - 15 */}
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">9</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">10</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">11</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">12</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">13</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">14</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">15</div>

            {/* Week 4: Aug 16 - 22 */}
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">16</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">17</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">18</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">19</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">20</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">21</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">
              <span>22</span>
              <div className="mt-1 p-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] truncate">
                VIP Private Tour
              </div>
            </div>

            {/* Week 5: Aug 23 - 29 (Current Week!) */}
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">
              <span>23</span>
              <div className="mt-1 p-1 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] truncate">
                Show House Bantry
              </div>
            </div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">24</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">25</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">26</div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">27</div>
            {/* Today: August 28 highlighted (yellowish/gold background like in Screenshot 5) */}
            <div className="h-20 p-1 font-bold text-slate-900 dark:text-white bg-amber-50/80 dark:bg-amber-950/40 ring-1 ring-amber-400">
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">28 Today</span>
              <div className="mt-1 p-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-medium truncate">
                15:00 Clifton Inspection
              </div>
            </div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">29</div>

            {/* Week 6: Aug 30 - Sep 5 */}
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">
              <span>30</span>
              <div className="mt-1 p-1 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold truncate">
                14:00 Show House (Clifton)
              </div>
            </div>
            <div className="h-20 p-1 font-semibold text-slate-700 dark:text-slate-300">31</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">1</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">2</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">3</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">4</div>
            <div className="h-20 p-1 text-slate-300 dark:text-slate-600">5</div>
          </div>
        </div>
      </div>

      {/* Birthday Campaign Modal */}
      {isBirthdayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-black rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Automated Birthday Campaign
                </h3>
              </div>
              <button onClick={() => setIsBirthdayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Automatically send personalized luxury champagne & birthday wishes to VIP clients in your CRM on their special day via WhatsApp & Email.
            </p>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <span className="font-bold">Next upcoming milestone:</span>
              <p>Sophia Mokoena • September 4 • VIP Tier</p>
            </div>
            <button
              onClick={() => setIsBirthdayModalOpen(false)}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
            >
              Activate Automated Campaign
            </button>
          </div>
        </div>
      )}

      {/* File Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-black rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Client & Leads File Import
                </h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Upload CSV, Excel, or Property24 XML leads export to batch import contacts directly into Ptah CRM.
            </p>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center text-xs text-slate-500">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span>Drag & drop CSV file here or click to browse</span>
            </div>
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="w-full py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Sharing Modal */}
      {isPortfolioShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-black rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Portfolio Sharing Link
                </h3>
              </div>
              <button onClick={() => setIsPortfolioShareOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Share your curated luxury portfolio link directly with high-net-worth buyers:
            </p>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
              <span className="truncate">https://ptahrealty.com/portfolio/exclusive</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText('https://ptahrealty.com/portfolio/exclusive');
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              {shareCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <span>Copy Portfolio Share Link</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
