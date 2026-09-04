import React from 'react';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  UserCheck, 
  Search, 
  FileText, 
  Calculator, 
  Sparkles, 
  Home, 
  Image as ImageIcon, 
  Globe, 
  Share2, 
  LogOut,
  Layers,
  ChevronDown,
  Settings,
  Languages,
  CircleHelp,
  Puzzle
} from 'lucide-react';

export type ActiveTab = 'suburb' | 'search' | 'cma' | 'media' | 'pdf' | 'portals' | 'sales' | 'prospecting' | 'kyc' | 'crm';

interface HeaderProps {
  activeTab: ActiveTab | null;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAccommodation: () => void;
  onOpenCMAEngine: () => void;
  onOpenMediaManagement: () => void;
  onOpenPDFReport: () => void;
  onOpenPortalSync: () => void;
  onOpenDocuments: () => void;
  userEmail: string;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenLanguageSettings: () => void;
  selectedPropertyAddress?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAccommodation,
  onOpenCMAEngine,
  onOpenMediaManagement,
  onOpenPDFReport,
  onOpenPortalSync,
  onOpenDocuments,
  selectedPropertyAddress,
  userEmail,
  onLogout,
  onOpenSettings,
  onOpenLanguageSettings
}) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md select-none border-b border-slate-800 z-30 shrink-0">
      {/* Top Main Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b1623] border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => onSelectTab('cma')}
            className="flex items-center gap-1.5 bg-[#006980] hover:bg-[#007d99] px-2.5 py-1 rounded text-white font-black tracking-wider text-xs shadow-inner cursor-pointer transition-colors"
          >
            <Building2 className="w-4 h-4 text-cyan-300" />
            <span>PTAH<span className="text-cyan-300 font-extrabold ml-1">REALTY</span></span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline border-l border-slate-800 pl-2.5">
            Real Estate Intelligence & Multi-Portal Distribution Dashboard
          </span>
        </div>

        {/* Primary Functional Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            id="nav-tab-cma"
            onClick={() => onSelectTab('cma')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'cma'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-300" />
            <span>CMA Engine</span>
          </button>

          <button
            id="nav-tab-media"
            onClick={() => onSelectTab('media')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'media'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
            <span>Visual Assets</span>
          </button>

          <button
            id="nav-tab-pdf"
            onClick={() => onSelectTab('pdf')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'pdf'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>PDF Reports</span>
          </button>

          <button
            id="nav-tab-portals"
            onClick={() => onSelectTab('portals')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'portals'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-300" />
            <span>Portal Sync</span>
          </button>

          <button
            id="nav-tab-suburb"
            onClick={() => onSelectTab('suburb')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'suburb'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-300" />
            <span>Suburbs</span>
          </button>

          <button
            id="nav-tab-search"
            onClick={() => onSelectTab('search')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'search'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-cyan-300" />
            <span>Search</span>
          </button>

          <button
            id="nav-tab-sales"
            onClick={() => onSelectTab('sales')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'sales'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
            <span>Transfers</span>
          </button>

          <button
            id="nav-tab-prospecting"
            onClick={() => onSelectTab('prospecting')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'prospecting'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Prospecting</span>
          </button>

          <button
            id="nav-tab-kyc"
            onClick={() => onSelectTab('kyc')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'kyc'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>KYC</span>
          </button>

          <button
            id="nav-tab-crm"
            onClick={() => onSelectTab('crm')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'crm'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5 text-emerald-300" />
            <span>CRM</span>
          </button>
        </nav>

        {/* User Profile & Quick Actions */}
        <div className="relative flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((open) => !open)}
            className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-white"
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="menu"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-900 border border-cyan-700 flex items-center justify-center text-cyan-200 font-bold text-[10px]">
              RR
            </div>
            <span className="font-semibold text-slate-200 text-xs">{userEmail}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isAccountMenuOpen && (
            <div className="absolute right-0 top-8 z-50 w-52 rounded border border-slate-700 bg-slate-900 py-1 shadow-xl" role="menu">
              <button onClick={onOpenSettings} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800" role="menuitem">
                <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
              </button>
              <button onClick={onOpenLanguageSettings} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800" role="menuitem">
                <Languages className="w-3.5 h-3.5 text-slate-400" /> Language
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800" role="menuitem">
                <CircleHelp className="w-3.5 h-3.5 text-slate-400" /> Support
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800" role="menuitem">
                <Puzzle className="w-3.5 h-3.5 text-slate-400" /> Apps and Extensions
              </button>
              <div className="my-1 border-t border-slate-800" />
              <button onClick={onLogout} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-300 hover:bg-slate-800" role="menuitem">
                <LogOut className="w-3.5 h-3.5" /> Log out
              </button>
            </div>
          )}

          <button
            id="btn-logout"
            onClick={onLogout}
            className="text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors text-xs"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Log out</span>
          </button>
        </div>
      </div>

      {/* Sub-Header Action Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-[11px] text-slate-400 font-medium">Selected Subject Cadastre:</span>
          <span className="font-bold text-cyan-300 text-xs truncate max-w-[320px]">
            {selectedPropertyAddress || 'THREE ANCHOR BAY / GREEN POINT CADASTRE'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-action-cma"
            onClick={onOpenCMAEngine}
            className="px-2 py-1 bg-[#006980] hover:bg-cyan-600 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
          >
            <Calculator className="w-3 h-3 text-cyan-200" />
            <span>CMA Valuation Engine</span>
          </button>

          <button
            id="btn-action-media"
            onClick={onOpenMediaManagement}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 transition-colors border border-slate-700 shadow-xs"
          >
            <ImageIcon className="w-3 h-3 text-cyan-400" />
            <span>Media Studio</span>
          </button>

          <button
            id="btn-action-pdf"
            onClick={onOpenPDFReport}
            className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>Generate PDF</span>
          </button>

          <button
            id="btn-action-portals"
            onClick={onOpenPortalSync}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
          >
            <Globe className="w-3 h-3 text-indigo-200" />
            <span>Portal Syndication</span>
          </button>

          <button
            id="btn-action-update-accommodation"
            onClick={onOpenAccommodation}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 transition-colors border border-slate-700 shadow-xs"
          >
            <Home className="w-3 h-3 text-emerald-400" />
            <span>Accommodation</span>
          </button>

          <button
            id="btn-action-documents"
            onClick={onOpenDocuments}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1 transition-colors border border-slate-700 shadow-xs"
          >
            <FileText className="w-3 h-3 text-slate-300" />
            <span>Deeds</span>
          </button>
        </div>
      </div>
    </header>
  );
};
