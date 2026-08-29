import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Clock,
  Home,
  Check,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Crown,
  X,
  Table2,
  Download,
  Copy,
  Phone
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

interface ChartMenuProps {
  onViewAsTable: () => void;
  onCopyData: () => void;
  onExportCsv: () => void;
}

// Functional dropdown for the small header "..." menu icon on the LSM/
// Suburb Attractiveness and Likelihood to Buy & Sell chart cards -- was
// previously decorative (no onClick at all).
const ChartMenu: React.FC<ChartMenuProps> = ({ onViewAsTable, onCopyData, onExportCsv }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Chart options"
      >
        <Menu className="w-3.5 h-3.5 text-slate-400" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-6 z-20 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-xs animate-fade-in">
          <button
            onClick={() => { setIsOpen(false); onViewAsTable(); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Table2 className="w-3.5 h-3.5 text-slate-400" />
            <span>View as Table</span>
          </button>
          <button
            onClick={() => { setIsOpen(false); onCopyData(); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy Data</span>
          </button>
          <button
            onClick={() => { setIsOpen(false); onExportCsv(); }}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export as CSV</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Downloads a small CSV client-side -- no backend needed for a chart export.
function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface AgeGroupLeadsModalProps {
  bracket: { key: string; label: string; persona: string } | null;
  leads: Lead[];
  onClose: () => void;
  onSelectLead: (lead: Lead) => void;
}

// Popup for the Demographic Intelligence age bracket cards -- shows the
// actual CRM leads that produced that bracket's percentage (matched on
// Lead.ageBracket), not just the illustrative stat.
const AgeGroupLeadsModal: React.FC<AgeGroupLeadsModalProps> = ({ bracket, leads, onClose, onSelectLead }) => {
  if (!bracket) return null;
  const matchingLeads = leads.filter((l) => getAgeGroupKey(l.ageBracket) === bracket.key);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {bracket.label} <span className="text-slate-400 font-normal">({bracket.key})</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{bracket.persona} — {matchingLeads.length} client{matchingLeads.length === 1 ? '' : 's'} in your CRM</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {matchingLeads.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 italic">
              No leads in this age bracket yet.
            </div>
          ) : (
            matchingLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => { onSelectLead(lead); onClose(); }}
                className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{lead.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{lead.propertyTitle}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{lead.phone}</span>
                    <span>•</span>
                    <span>{lead.source}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Maps a free-form Lead.ageBracket string ("35-49", "62", "60+") onto one
// of the four Demographic Intelligence buckets by its lower bound, so the
// card's percentage and its popup are backed by the same real data.
function getAgeGroupKey(ageBracket?: string): string | null {
  if (!ageBracket) return null;
  const match = ageBracket.match(/\d+/);
  if (!match) return null;
  const low = parseInt(match[0], 10);
  if (low >= 60) return '60+';
  if (low >= 40) return '40-59';
  if (low >= 30) return '30-39';
  return '18-29';
}

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
  // Show House Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [showHouseSearch, setShowHouseSearch] = useState('');
  const [closedShowHouseSearch, setClosedShowHouseSearch] = useState('');

  // Dialog states for dashboard actions
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [verificationCardTab, setVerificationCardTab] = useState<'verification' | 'status'>('verification');
  const [isPortfolioShareOpen, setIsPortfolioShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Chart view-mode toggles (View as Table, from the chart menu) and the
  // Demographic Intelligence age-bracket drilldown popup.
  const [lsmViewAsTable, setLsmViewAsTable] = useState(false);
  const [propensityViewAsTable, setPropensityViewAsTable] = useState(false);
  const [selectedAgeBracket, setSelectedAgeBracket] = useState<{ key: string; label: string; persona: string } | null>(null);

  // Real per-bracket lead counts, computed from Lead.ageBracket so the
  // Demographic Intelligence percentages match what the drilldown popup
  // actually shows -- not a static illustrative number.
  const ageBracketCounts = useMemo(() => {
    const counts: Record<string, number> = { '18-29': 0, '30-39': 0, '40-59': 0, '60+': 0 };
    leads.forEach((l) => {
      const key = getAgeGroupKey(l.ageBracket);
      if (key) counts[key] += 1;
    });
    return counts;
  }, [leads]);
  const totalWithAgeBracket = Object.values(ageBracketCounts).reduce((a, b) => a + b, 0);
  const ageBracketPct = (key: string) =>
    totalWithAgeBracket > 0 ? `${Math.round((ageBracketCounts[key] / totalWithAgeBracket) * 100)}%` : '0%';

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

  // handleSyncGoogleCalendar moved to CRMApp.tsx -- the button now lives
  // in the Schedule Calendar tab's header, stacked under "Task Reminders
  // & SLAs", not on the Dashboard.

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

          {/* Birthday Campaign button removed from here -- birthday
              greetings are now one of the objective presets inside the
              Campaigns AI hub (CampaignsHubModal.tsx: "🎁 VIP Birthday
              Greeting"), reached via the CAMPAIGNS AI card below,
              instead of being a separate standalone pill+modal. */}

          {/* Sync Google Calendar button moved to CRMApp.tsx's Schedule
              Calendar tab header, stacked under "Task Reminders & SLAs" --
              per explicit request, calendar sync belongs with the
              calendar, not the Dashboard. */}
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
          <div className="relative rounded-2xl p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 flex flex-col justify-between overflow-hidden group shadow-lg min-h-[220px]">
            {/* Background luxury subtle glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Tag & Live Active Count */}
            <div className="flex items-center justify-between z-10 mb-2.5">
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-800/90 dark:bg-amber-50 border border-slate-700/80 dark:border-amber-200 text-[10px] font-semibold text-amber-300 dark:text-amber-700 tracking-wider uppercase">
                <Crown className="w-3 h-3 text-amber-400 dark:text-amber-600" />
                <span>PRIME PORTFOLIO</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/20 dark:bg-rose-50 border border-rose-500/40 dark:border-rose-300 text-rose-300 dark:text-rose-600 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span>{listings.filter((l) => l.status === 'show_house' || l.status === 'active').length} Active</span>
              </div>
            </div>

            {/* Luxury Architectural Imagery Window -- this photo (and its
                caption/price overlay) keeps its own dark gradient in both
                themes, since it's an overlay on the image itself for
                legibility, not the card's own background surface. */}
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-800/80 dark:border-slate-200 my-1 group-hover:border-amber-500/30 transition duration-500">
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
        <div className="lg:col-span-5 bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
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
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5"
              >
                <span>My Clients</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Type items grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4 pt-2 text-center">
              {[
                { label: 'Buyer', count: leads.filter((l) => l.buyerType === 'Cash Buyer' || l.buyerType === 'First-Time Buyer').length },
                { label: 'Seller', count: 0 },
                { label: 'Tenant', count: leads.filter((l) => l.buyerType === 'Tenant').length },
                { label: 'Landlord', count: 0 },
                { label: 'Agent', count: 0 },
              ].map((item) => {
                const pct = leads.length ? Math.round((item.count / leads.length) * 100) : 0;
                return (
                  <div key={item.label} className="border-l border-slate-200 dark:border-slate-800 first:border-l-0 px-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.count}</div>
                    <div className="text-[10px] text-slate-400">{pct}%</div>
                    <button
                      onClick={() => onNavigateView('pipeline')}
                      className="text-[11px] font-medium text-blue-600 dark:text-blue-400 truncate hover:underline hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
                      title={`View ${item.label} clients in Lead Pipeline`}
                    >
                      {item.label}
                    </button>
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

        {/* CAMPAIGNS AI (whole card clickable -- launches the Omnichannel
            Marketing Hub, matching the AI Quality Index card pattern from
            TopStatsOverview.tsx: group/hover "View" hint, hover border/shadow
            lift, header+content+footer structure) */}
        <div
          onClick={() => {
            if (onOpenCampaigns) {
              onOpenCampaigns();
            } else {
              onNavigateView('automations');
            }
          }}
          className="group relative lg:col-span-2 bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          title="Launch the Omnichannel Marketing Hub"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Megaphone className="w-3.5 h-3.5" />
                <span>CAMPAIGNS</span>
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center">
                <Eye className="w-2.5 h-2.5 mr-0.5" /> View
              </span>
            </div>

            <div className="flex flex-col items-center justify-center pt-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-2 text-center">
                AI Marketing Hub
              </span>
              <span className="text-[10px] text-slate-400 text-center">
                Canva • Mailchimp • Zapier
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-[11px]">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-0.5">
              <span>Launch Hub</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* CLIENT SOURCE (Circular Gauges) */}
        <div className="lg:col-span-2 bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>CLIENT SOURCE</span>
            </div>
            <span title="Breakdown of leads by acquisition channel">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </span>
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
          className="bg-white dark:bg-black rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Award className="w-3.5 h-3.5" />
              <span>CLOSED SALES METRICS</span>
            </div>
            {/* MTD | YTD Badge */}
            <div className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-black text-white text-[10px] font-mono font-extrabold tracking-wider">
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

        {/* Clients Awaiting Verification + Client Status -- restructured
            to match the CLOSED SALES METRICS card's structural design
            (header bar with a two-way toggle badge, content area, and a
            divider-separated footer link) instead of the old flat
            icon+button row, and now also houses Client Status (moved
            here from its own separate top-row card) as the second tab. */}
        <div className="bg-white dark:bg-black rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Clients</span>
            </div>
            {/* Verification | Status Toggle Badge */}
            <div className="flex rounded-md bg-slate-900 dark:bg-slate-750 text-[10px] font-mono font-extrabold tracking-wider overflow-hidden">
              <button
                onClick={() => setVerificationCardTab('verification')}
                className={`px-2 py-0.5 transition ${verificationCardTab === 'verification' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                VERIFY
              </button>
              <span className="text-cyan-400 font-bold self-center">|</span>
              <button
                onClick={() => setVerificationCardTab('status')}
                className={`px-2 py-0.5 transition ${verificationCardTab === 'status' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                STATUS
              </button>
            </div>
          </div>

          {verificationCardTab === 'verification' ? (
            <div className="flex items-center justify-between my-auto py-1">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">0</span>
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">Clients</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Awaiting Verification
                </span>
              </div>
              <UploadCloud className="w-8 h-8 text-slate-200 dark:text-slate-700" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 my-auto py-1">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Validated</span>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {leads.length ? '100%' : '0%'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{leads.length} of {leads.length}</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Obtained Consent</span>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">0%</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">0 of {leads.length}</div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end text-[11px]">
            <button
              onClick={() => onNavigateView('pipeline')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5"
            >
              <span>{verificationCardTab === 'verification' ? 'Verify Clients' : 'View Consent Log'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scheduled Today & Calendar -- footer divider added to match
            CLOSED SALES METRICS' footer link row. */}
        <div className="bg-white dark:bg-black rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between my-auto py-1">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400">0</span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">Events</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Scheduled Today
              </span>
              <span className="text-[10px] text-slate-400">0% Events Complete</span>
            </div>
            <Calendar className="w-8 h-8 text-slate-200 dark:text-slate-700" />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end text-[11px]">
            <button
              onClick={() => onNavigateView('calendar')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5"
            >
              <span>Calendar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Client Age Brackets + LSM & Attractiveness + Likelihood to Buy/Sell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CLIENT AGE BRACKETS - Luxury Demographic Personas (ported over
            from the AI Studio demo design, see chat) */}
        <div className="lg:col-span-4 bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
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
                  bracket: '18-29',
                  label: 'Next-Gen UHNW',
                  persona: 'Tech Innovators & Founders',
                  img: youngBuyerImg,
                  accent: 'border-amber-400/40 text-amber-500 dark:text-amber-400',
                },
                {
                  bracket: '30-39',
                  label: 'Executive Leaders',
                  persona: 'Corporate Partners & Ex-pats',
                  img: youngBuyerImg,
                  accent: 'border-sky-400/40 text-sky-500 dark:text-sky-400',
                },
                {
                  bracket: '40-59',
                  label: 'Private Wealth',
                  persona: 'Principals & Family Offices',
                  img: midBuyerImg,
                  accent: 'border-emerald-400/40 text-emerald-500 dark:text-emerald-400',
                },
                {
                  bracket: '60+',
                  label: 'Legacy Trustees',
                  persona: 'Portfolio Patriarchs & Matriarchs',
                  img: seniorPatronImg,
                  accent: 'border-purple-400/40 text-purple-500 dark:text-purple-400',
                },
              ].map((item) => (
                <button
                  key={item.bracket}
                  onClick={() => setSelectedAgeBracket({ key: item.bracket, label: item.label, persona: item.persona })}
                  className="group relative flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-cyan-400 dark:hover:border-cyan-500 transition duration-200 shadow-2xs hover:shadow-xs text-left cursor-pointer"
                  title={`View ${ageBracketCounts[item.bracket]} client(s) in the ${item.bracket} age bracket`}
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
                    <span className={item.accent.split(' ')[1] || 'text-cyan-400'}>{ageBracketPct(item.bracket)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Primary Core Segment</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              60+ Trustees ({ageBracketPct('60+')})
            </span>
          </div>
        </div>

        {/* LSM AND SUBURB ATTRACTIVENESS Bar Chart (Screenshot 3 & 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>LSM & SUBURB ATTRACTIVENESS</span>
              </div>
              <span title="Living Standards Measure vs. suburb desirability score across your client base">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Number of Clients
              </span>
              <ChartMenu
                onViewAsTable={() => setLsmViewAsTable((v) => !v)}
                onCopyData={() => {
                  const text = 'Score Tier\tLSM Score\tSuburb Attractiveness\n0-3\t0\t2\n4-7\t2\t0\n8-10\t3\t5';
                  navigator.clipboard.writeText(text);
                }}
                onExportCsv={() => downloadCsv('lsm-suburb-attractiveness.csv', [
                  ['Score Tier', 'LSM Score', 'Suburb Attractiveness'],
                  ['0-3', 0, 2],
                  ['4-7', 2, 0],
                  ['8-10', 3, 5],
                ])}
              />
            </div>

            {lsmViewAsTable ? (
              <table className="w-full text-xs mt-2">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left font-semibold py-1.5">Score Tier</th>
                    <th className="text-right font-semibold py-1.5">LSM Score</th>
                    <th className="text-right font-semibold py-1.5">Suburb Attractiveness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[['0-3', 0, 2], ['4-7', 2, 0], ['8-10', 3, 5]].map((row) => (
                    <tr key={row[0]}>
                      <td className="py-1.5 font-semibold text-slate-700 dark:text-slate-200">{row[0]}</td>
                      <td className="py-1.5 text-right text-slate-600 dark:text-slate-300">{row[1]}</td>
                      <td className="py-1.5 text-right text-slate-600 dark:text-slate-300">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
            <div className="flex gap-2">
              {/* Y-axis guide labels -- reserved-width column, not
                  negatively offset, so it can never poke past the card's
                  own left padding (see chat: was misaligned with the
                  header divider above). */}
              <div className="flex flex-col justify-between text-[9px] font-mono text-slate-400 h-44 text-right w-3.5 shrink-0">
                <span>10</span><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Visual Bar Chart -- flex-1 so its left/right edges
                    match the header row's, since neither has extra
                    horizontal padding beyond the card's own p-5. */}
                <div className="h-44 flex items-end justify-around border-b border-l border-slate-200 dark:border-slate-700">
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

                {/* X-axis labels -- justify-around, matching the bars
                    above, so each label sits under its bar group with no
                    independent padding of its own. */}
                <div className="flex justify-around pt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>0-3</span>
                  <span>4-7</span>
                  <span>8-10</span>
                </div>
              </div>
            </div>
            )}
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
        <div className="lg:col-span-4 bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>CLIENT LIKELIHOOD TO BUY & SELL</span>
              </div>
              <span title="Predicted propensity to transact, modeled from engagement and lifecycle signals">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Number of Clients
              </span>
              <ChartMenu
                onViewAsTable={() => setPropensityViewAsTable((v) => !v)}
                onCopyData={() => {
                  const text = 'Propensity Tier\tLikelihood To Buy\tLikelihood To Sell\nVery Unlikely\t3\t2\nUnlikely\t0\t0\nSomewhat Likely\t0\t1\nLikely\t0\t1\nHighly Likely\t0\t3';
                  navigator.clipboard.writeText(text);
                }}
                onExportCsv={() => downloadCsv('client-likelihood-buy-sell.csv', [
                  ['Propensity Tier', 'Likelihood To Buy', 'Likelihood To Sell'],
                  ['Very Unlikely', 3, 2],
                  ['Unlikely', 0, 0],
                  ['Somewhat Likely', 0, 1],
                  ['Likely', 0, 1],
                  ['Highly Likely', 0, 3],
                ])}
              />
            </div>

            {propensityViewAsTable ? (
              <table className="w-full text-xs mt-2">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left font-semibold py-1.5">Propensity Tier</th>
                    <th className="text-right font-semibold py-1.5">To Buy</th>
                    <th className="text-right font-semibold py-1.5">To Sell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    ['Very Unlikely', 3, 2],
                    ['Unlikely', 0, 0],
                    ['Somewhat Likely', 0, 1],
                    ['Likely', 0, 1],
                    ['Highly Likely', 0, 3],
                  ].map((row) => (
                    <tr key={row[0]}>
                      <td className="py-1.5 font-semibold text-slate-700 dark:text-slate-200">{row[0]}</td>
                      <td className="py-1.5 text-right text-slate-600 dark:text-slate-300">{row[1]}</td>
                      <td className="py-1.5 text-right text-slate-600 dark:text-slate-300">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
            <div className="flex gap-2">
              {/* Y-axis guide -- reserved-width column, not negatively
                  offset (see chat: was misaligned with the header
                  divider above). */}
              <div className="flex flex-col justify-between text-[9px] font-mono text-slate-400 h-44 text-right w-3.5 shrink-0">
                <span>10</span><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Visual Bar Chart -- flex-1 so its edges match the
                    header row's (neither has extra horizontal padding). */}
                <div className="h-44 flex items-end justify-around border-b border-l border-slate-200 dark:border-slate-700">
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

                {/* X-axis labels -- justify-around, matching the bars. */}
                <div className="flex justify-around pt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="text-center leading-tight">Very<br />Unlikely</span>
                  <span className="text-center leading-tight">Unlikely</span>
                  <span className="text-center leading-tight">Somewhat<br />Likely</span>
                  <span className="text-center leading-tight">Likely</span>
                  <span className="text-center leading-tight">Highly<br />Likely</span>
                </div>
              </div>
            </div>
            )}
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
        <div className="bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>SHOW HOUSE SELECT</span>
            </div>
            <span title="Start a new show house session by pairing a client with the property on show">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </span>
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
        <div className="bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CURRENT SHOW HOUSES</span>
            </div>
            <span title="Show houses currently open, with a quick action to mark them closed">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </span>
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
        <div className="bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CURRENT CLOSED SHOW HOUSES</span>
            </div>
            <span title="Completed show house sessions, including registered attendee counts">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </span>
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

      {/* Demographic Intelligence Age Bracket Drilldown */}
      <AgeGroupLeadsModal
        bracket={selectedAgeBracket}
        leads={leads}
        onClose={() => setSelectedAgeBracket(null)}
        onSelectLead={onSelectLead}
      />
    </div>
  );
};
