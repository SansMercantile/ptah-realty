import React, { useState, useRef, useEffect } from 'react';
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
  LogOut,
  ChevronDown,
  Sliders,
  History,
  Coins,
  Bell,
  Puzzle,
  CreditCard
} from 'lucide-react';

export type ActiveTab = 'suburb' | 'search' | 'cma' | 'listings' | 'media' | 'pdf' | 'portals' | 'sales' | 'prospecting' | 'kyc' | 'crm';

interface HeaderProps {
  activeTab: ActiveTab | null;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAccommodation: () => void;
  onOpenCMAEngine: () => void;
  onOpenMediaManagement: () => void;
  onOpenPDFReport: () => void;
  onOpenPortalSync: () => void;
  onOpenDocuments: () => void;
  onOpenUserSettings: (tab?: 'profile' | 'password' | 'billing' | 'language' | 'apps' | 'preferences') => void;
  onOpenSearchHistoryModal: () => void;
  onOpenCreditsModal: () => void;
  onOpenBalanceDetails?: () => void;
  dataCredits?: number;
  ficaCredits?: number;
  trustCredits?: number;
  prepaidBalance?: number;
  userEmail: string;
  onLogout: () => void;
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
  onOpenUserSettings,
  onOpenSearchHistoryModal,
  onOpenCreditsModal,
  onOpenBalanceDetails,
  dataCredits = 250,
  ficaCredits = 0,
  trustCredits = 15,
  prepaidBalance = 1250,
  userEmail,
  onLogout,
  selectedPropertyAddress
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const totalCombinedCredits = dataCredits + ficaCredits + trustCredits;
  const initials = userEmail
    .split(/[@.]/)[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'PR';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NOTIFICATIONS_LIST = [
    {
      id: 'notif-1',
      title: 'New Deeds Office Transfer',
      desc: '3 Richmond Road transfer registered at R 7,450,000.',
      time: '12m ago',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'KYC FICA Pre-Check Completed',
      desc: 'Stephan Fridolin Muller identity & bureau clearance verified.',
      time: '1h ago',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'Property24 Sync Successful',
      desc: '5 Richmond Road listing updated with 3D cadastre tour.',
      time: '3h ago',
      unread: false
    }
  ];

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md select-none border-b border-slate-800 z-30 shrink-0 relative">
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
            id="nav-tab-listings"
            onClick={() => onSelectTab('listings')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'listings'
                ? 'bg-[#006980] text-white shadow-sm ring-1 ring-cyan-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>My Listings</span>
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
            <span>FICA Compliance</span>
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

        {/* Right Section: Credits Badge, Quick Search, Notifications & User Dropdown */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Balance & Combined Available Credits Badge */}
          <div 
            id="header-balance-badge"
            onClick={onOpenBalanceDetails || onOpenCreditsModal}
            className="hidden xl:flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 border border-cyan-500/40 hover:border-cyan-400 px-3 py-1 rounded text-xs cursor-pointer transition-all shadow-xs group"
            title="Click to view detailed available funds for all credits & billing"
          >
            <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Coins className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Balance:</span>
              <span className="text-cyan-300 font-mono font-bold text-xs">{totalCombinedCredits} Credits</span>
            </div>
          </div>

          {/* Notifications Button & Popover */}
          <div className="relative" ref={notificationsRef}>
            <button
              id="btn-notifications-header"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors relative"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-900 flex items-center justify-between">
                  <span>Notifications & Alerts</span>
                  <span className="text-[10px] text-cyan-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {NOTIFICATIONS_LIST.map((n) => (
                    <div key={n.id} className="p-2.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Search trigger */}
          <button
            onClick={() => onSelectTab('search')}
            className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors text-xs"
            title="Quick Cadastre Search"
          >
            <Search className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden lg:inline">Quick Search</span>
          </button>

          {/* User Profile Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="btn-user-profile-dropdown"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#006980] border border-cyan-400 flex items-center justify-center text-cyan-100 font-bold text-[10px]">
                {initials}
              </div>
              <span className="font-semibold text-slate-200 text-xs hidden sm:inline">
                {userEmail}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180 text-cyan-300' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div 
                id="user-profile-dropdown-menu"
                className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1.5 z-50 animate-fade-in text-xs font-medium"
              >
                {/* User Header Summary */}
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
                  <div className="font-bold text-slate-900 text-xs truncate">{userEmail}</div>
                  <span className="inline-block mt-1 bg-cyan-100 text-cyan-800 font-bold text-[9px] px-1.5 py-0.2 rounded">
                    Principal Property Practitioner (PPRA)
                  </span>
                </div>

                {/* Dropdown Items */}
                <div className="py-1">
                  {/* 1. Settings (Contains Profile, Change Password, Billing & Credits, Language, Apps & Extensions, Preferences) */}
                  <button
                    id="dropdown-item-settings"
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onOpenUserSettings('profile');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-50 flex items-center gap-2.5 text-slate-700 hover:text-cyan-900 transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-[#006980]" />
                    <div>
                      <div className="font-bold text-xs text-slate-900">Settings</div>
                      <div className="text-[10px] text-slate-500 font-normal">Profile, Security, Language & Hub</div>
                    </div>
                  </button>

                  {/* 2. Billing & Credits Direct Link */}
                  <button
                    id="dropdown-item-billing"
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onOpenUserSettings('billing');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-50 flex items-center gap-2.5 text-slate-700 hover:text-cyan-900 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>Billing & Credits</span>
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                          {totalCombinedCredits}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">Plans, Invoices & Top-ups</div>
                    </div>
                  </button>

                  {/* 3. Search History */}
                  <button
                    id="dropdown-item-history"
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onOpenSearchHistoryModal();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-50 flex items-center gap-2.5 text-slate-700 hover:text-cyan-900 transition-colors"
                  >
                    <History className="w-4 h-4 text-cyan-700" />
                    <div>
                      <div className="font-semibold text-xs text-slate-800">Search History & Audit Log</div>
                      <div className="text-[10px] text-slate-500 font-normal">72-Hour NCA & POPIA records</div>
                    </div>
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 my-1"></div>

                {/* Sign Out */}
                <button
                  id="dropdown-item-signout"
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-xs">Sign Out</span>
                </button>
              </div>
            )}
          </div>
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
