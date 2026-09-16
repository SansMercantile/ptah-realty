import React, { useState } from 'react';
import {
  LayoutDashboard,
  Home,
  PlusCircle,
  Eye,
  FileText,
  BarChart3,
  TrendingUp,
  Award,
  Briefcase,
  Layers,
  FolderOpen,
  Compass,
  ArrowRightLeft,
  Building,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Target,
  Megaphone,
  Zap,
  Kanban,
  Calendar,
  X,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ConnectorCategory } from '../types';

interface EnterpriseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView?: string;
  onNavigateView?: (view: any) => void;
  onOpenAddListing?: (type: 'sale' | 'rent') => void;
  onOpenPreViewFlyer?: () => void;
  onOpenListingInsights?: () => void;
  onOpenDeals?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenCdpa?: () => void;
  onOpenCurrenciesDirect?: () => void;
  onOpenLoomInsights?: () => void;
  onOpenPtahKyc?: () => void;
  onOpenNcinoKyc?: () => void;
  onOpenResourceCentre?: () => void;
  onOpenVirtualAgent?: () => void;
  onOpenProfileSecurity?: () => void;
  onOpenCampaigns?: () => void;
  onOpenMarketing?: () => void;
  onOpenBusinessPlan?: () => void;
  onOpenSettings?: () => void;
  onOpenQuickListings?: () => void;
  listingsCount?: number;
  activeDealsCount?: number;
  unreadNotificationsCount?: number;
}

export const EnterpriseSidebar: React.FC<EnterpriseSidebarProps> = ({
  isOpen,
  onClose,
  currentView = 'dashboard',
  onNavigateView,
  onOpenAddListing,
  onOpenPreViewFlyer,
  onOpenListingInsights,
  onOpenDeals,
  onOpenLeaderboard,
  onOpenCdpa,
  onOpenCurrenciesDirect,
  onOpenLoomInsights,
  onOpenPtahKyc,
  onOpenNcinoKyc,
  onOpenResourceCentre,
  onOpenVirtualAgent,
  onOpenProfileSecurity,
  onOpenCampaigns,
  onOpenMarketing,
  onOpenBusinessPlan,
  onOpenSettings,
  onOpenQuickListings,
  listingsCount = 6,
  activeDealsCount = 6,
}) => {
  const [listingsExpanded, setListingsExpanded] = useState(true);
  const [dealsExpanded, setDealsExpanded] = useState(true);
  const [rankingExpanded, setRankingExpanded] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Top Header & Branding */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-emerald-500/20">
              PR
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Ptah Real Estate</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">HUB</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Waterfall • South Africa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card matching screenshot (Amanda Mokoena, Candidate Property Practitioner) */}
        <div 
          onClick={onOpenProfileSecurity}
          className="mx-3 mt-3 p-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 transition cursor-pointer group"
          title="View Agent Profile & Security Settings"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Amanda Mokoena"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  Amanda Mokoena
                </p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Candidate Property Practitioner</p>
              <div className="flex items-center space-x-1 mt-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Security Notice: Password age 181d</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter Search */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Jump to tool or view..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs">
          
          {/* Main Views */}
          <button
            onClick={() => { onNavigateView?.('dashboard'); onClose(); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className="w-4 h-4 text-cyan-500" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => { onNavigateView?.('pipeline'); onClose(); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentView === 'pipeline'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Kanban className="w-4 h-4 text-emerald-500" />
              <span>Lead Pipeline (Kanban)</span>
            </div>
          </button>

          <button
            onClick={() => {
              if (onOpenBusinessPlan) {
                onOpenBusinessPlan();
              } else {
                onNavigateView?.('business_plan');
              }
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentView === 'business_plan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Target className="w-4 h-4 text-amber-500" />
              <span>My Business Plan & Targets</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold">
              R 11.53M Gap
            </span>
          </button>

          {/* Section: Listings */}
          <div className="pt-2">
            <button
              onClick={() => setListingsExpanded(!listingsExpanded)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200"
            >
              <div className="flex items-center space-x-1.5">
                <Home className="w-3.5 h-3.5 text-blue-500" />
                <span>Listings Hub</span>
              </div>
              {listingsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {listingsExpanded && (
              <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1">
                <button
                  onClick={() => { onOpenQuickListings?.(); onClose(); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Manage Listings</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">({listingsCount})</span>
                </button>

                <button
                  onClick={() => { onOpenAddListing?.('sale'); onClose(); }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Add Sales Listing (7-Tab)</span>
                </button>

                <button
                  onClick={() => { onOpenAddListing?.('rent'); onClose(); }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Add Rental Listing</span>
                </button>

                <button
                  onClick={() => { onOpenPreViewFlyer?.(); onClose(); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <span className="flex items-center space-x-2">
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Pre-View Listing Flyer</span>
                  </span>
                  <span className="text-[9px] px-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                    Teaser
                  </span>
                </button>

                <button
                  onClick={() => { onOpenListingInsights?.(); onClose(); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <span className="flex items-center space-x-2">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                    <span>Listing Insights & Time to Sell</span>
                  </span>
                  <span className="text-[9px] px-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold uppercase">
                    Charts
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Deals */}
          <div className="pt-2">
            <button
              onClick={() => setDealsExpanded(!dealsExpanded)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-200"
            >
              <div className="flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                <span>Deals & Schedule E</span>
              </div>
              {dealsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {dealsExpanded && (
              <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-1">
                <button
                  onClick={() => { onOpenDeals?.(); onClose(); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Manage Active Deals</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">({activeDealsCount})</span>
                </button>

                <button
                  onClick={() => { onOpenDeals?.(); onClose(); }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Select Deals for Schedule E</span>
                </button>
              </div>
            )}
          </div>

          {/* Ranking & Awards */}
          <button
            onClick={() => { onOpenLeaderboard?.(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Billing Leaderboard & Awards</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold">
              Diamond Club
            </span>
          </button>

          {/* CDPA (Distressed / Bank-assisted Property Sales) */}
          <button
            onClick={() => { onOpenCdpa?.(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
            title="Standard Bank EasySell, Nedbank, FNB QuickSell, ABSA Help-U-Sell"
          >
            <div className="flex items-center space-x-2.5">
              <Building className="w-4 h-4 text-rose-500" />
              <span>CDPA & Bank Assisted Sales</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-semibold">
              5 Banks
            </span>
          </button>

          {/* Ptah Forex Desk (Foreign Currency Assistance) */}
          <button
            onClick={() => {
              if (onOpenCurrenciesDirect) {
                onOpenCurrenciesDirect();
              } else {
                onOpenCdpa?.();
              }
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
            title="Foreign Currency Assistance & Emigration Desk"
          >
            <div className="flex items-center space-x-2.5">
              <ArrowRightLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Ptah Forex Desk</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-semibold">
              Referral
            </span>
          </button>

          {/* LOOM Market Intelligence & Deeds Analytics */}
          <button
            onClick={() => { onOpenLoomInsights?.(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
            title="Quarterly Growth Rates, Deeds Office Registration History, and Suburb Intelligence"
          >
            <div className="flex items-center space-x-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ptah Market Intel & Deeds</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold">
              Live Intel
            </span>
          </button>

          {/* Ptah KYC & Compliance (FICA Clearance) */}
          <button
            onClick={() => { (onOpenPtahKyc || onOpenNcinoKyc)?.(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
            title="Ptah KYC — FICA Regulatory Compliance, Trusts, PEP & Bank Verification"
          >
            <div className="flex items-center space-x-2.5">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Ptah KYC (FICA)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold">
              FICA
            </span>
          </button>

          {/* Resource Centre */}
          <button
            onClick={() => { onOpenResourceCentre?.(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <FolderOpen className="w-4 h-4 text-indigo-500" />
              <span>Resource Centre</span>
            </div>
            <span className="text-[10px] text-slate-400">6 Folders</span>
          </button>

          {/* Virtual Agent Prospecting */}
          <button
            onClick={() => { onOpenVirtualAgent?.(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Virtual Agent (Prospecting)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-semibold">
              150 Credits
            </span>
          </button>

          {/* Media Campaigns */}
          <button
            onClick={() => {
              if (onOpenCampaigns) {
                onOpenCampaigns();
              } else {
                onOpenMarketing?.();
              }
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Megaphone className="w-4 h-4 text-pink-500" />
              <span>Meta Media Campaigns</span>
            </div>
            <span className="text-[10px] text-slate-400">Active</span>
          </button>

          {/* Other Tools */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
            <button
              onClick={() => { onNavigateView?.('calendar'); onClose(); }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Viewing Schedule Calendar</span>
            </button>

            <button
              onClick={() => { onNavigateView?.('automations'); onClose(); }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Email & SLA Automations</span>
            </button>

            <button
              onClick={() => { onNavigateView?.('scrum'); onClose(); }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
            >
              <Target className="w-4 h-4 text-purple-600" />
              <span>Scrum & Sprints</span>
            </button>
          </div>
        </div>

        {/* Bottom Profile & Security Settings Trigger */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <button
            onClick={() => {
              if (onOpenProfileSecurity) {
                onOpenProfileSecurity();
              } else {
                onOpenSettings?.();
              }
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 transition cursor-pointer text-xs"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">Security & Profile Settings</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Security check recommended" />
          </button>
        </div>

      </aside>
    </div>
  );
};
