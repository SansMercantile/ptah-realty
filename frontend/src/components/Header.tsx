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
  CreditCard,
  Zap,
  Check,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { LANGUAGES_DATA } from './modals/UserSettingsModal';

export type ActiveTab = 'suburb' | 'search' | 'cma' | 'listings' | 'media' | 'portals' | 'sales' | 'prospecting' | 'kyc' | 'crm';

interface HeaderProps {
  activeTab: ActiveTab | null;
  onSelectTab: (tab: ActiveTab) => void;
  onQuickSearch?: () => void;
  onOpenAccommodation: () => void;
  onOpenCMAEngine: () => void;
  onOpenMediaManagement: () => void;
  onOpenPDFReport: () => void;
  onOpenPortalSync: () => void;
  onOpenDocuments: () => void;
  onOpenUserSettings: (tab?: 'profile' | 'password' | 'billing' | 'apps' | 'preferences') => void;
  onOpenSearchHistoryModal: () => void;
  onOpenCreditsModal: () => void;
  onOpenBalanceDetails?: () => void;
  onOpenCRMNotifications?: () => void;
  onOpenQuickListing?: () => void;
  onGoHome?: () => void;
  dataCredits?: number;
  ficaCredits?: number;
  trustCredits?: number;
  prepaidBalance?: number;
  userEmail: string;
  onLogout: () => void;
  selectedPropertyAddress?: string;
  // Practice jurisdiction country code (e.g. 'ZA', 'US', 'GB') -- the
  // real, live value from App.tsx's countryId, kept in sync with
  // UserSettingsModal's country selector via onJurisdictionChange.
  currentCountryCode?: string;
  // Signs out and returns to the marketing landing page -- explicit
  // owner-approved addition to this otherwise change-gated header (see
  // notice below). Used by both the "Marketing Portal" button and the
  // "Sign Out" dropdown item.
  onExitToLandingPage?: () => void;
}

// ---------------------------------------------------------------------
// NOTICE: the owner has explicitly asked that this header (the main
// Ptah app header -- logo, nav tabs, quick search, notifications, user
// dropdown) NOT be modified without their consent. Do not add, remove,
// reposition, or restyle anything in this file -- including via
// automated/background edits -- unless the owner has explicitly asked
// for that specific change in the current request. If a task seems to
// call for a header change, flag it and ask first rather than doing it.
// ---------------------------------------------------------------------

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onQuickSearch,
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
  onOpenCRMNotifications,
  onOpenQuickListing,
  onGoHome,
  dataCredits = 0,
  ficaCredits = 0,
  trustCredits = 0,
  prepaidBalance = 0,
  userEmail,
  onLogout,
  selectedPropertyAddress,
  currentCountryCode,
  onExitToLandingPage
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('ptah_user_language') || 'en-ZA';
  });
  const [isLanguageSubmenuOpen, setIsLanguageSubmenuOpen] = useState(false);
  const [languageToast, setLanguageToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    localStorage.setItem('ptah_user_language', code);
    setLanguageToast(true);
    setTimeout(() => setLanguageToast(false), 2500);
  };

  const activeLanguageObj = LANGUAGES_DATA.find(l => l.code === selectedLanguage) || LANGUAGES_DATA[0];

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

  // On the CRM tab, this bell now IS the CRM's own notifications & task
  // reminders drawer -- CRM's own Navbar used to have a second, redundant
  // bell icon triggering a separate drawer; that's been deleted (see
  // Navbar.tsx) and this bridges to it instead via a signal, same
  // consolidation pattern already used for Quick Search / Connectors
  // (see App.tsx's crmOpenConnectorsSignal). Everywhere else, unchanged:
  // toggles this header's own local dropdown.
  const handleBellClick = () => {
    if (activeTab === 'crm' && onOpenCRMNotifications) {
      onOpenCRMNotifications();
    } else {
      setIsNotificationsOpen((prev) => !prev);
    }
  };

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md select-none border-b border-slate-800 z-30 shrink-0 relative">
      {/* Top Main Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b1623] border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => (onGoHome ? onGoHome() : onSelectTab('cma'))}
            className="flex items-center gap-1.5 bg-[#006980] hover:bg-[#007d99] px-2.5 py-1 rounded text-white font-black tracking-wider text-xs shadow-inner cursor-pointer transition-colors"
            title="Back to Cadastre Map"
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
          {/* Balance & Combined Available Credits -- moved here as the
              first tab (was a badge in the right-hand section). Same
              click behaviour, restyled to match the other nav pills. */}
          <button
            id="header-balance-badge"
            onClick={onOpenBalanceDetails || onOpenCreditsModal}
            className="px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all bg-slate-800/90 hover:bg-slate-700/90 border border-cyan-500/40 hover:border-cyan-400 text-slate-200 shadow-xs group"
            title="Click to view detailed available funds for all credits & billing"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Balance:</span>
            <span className="text-cyan-300 font-mono font-bold text-xs">{totalCombinedCredits} Credits</span>
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

          {/* Quick Listing button removed per explicit request. */}
        </nav>

        {/* Right Section: Quick Search, Notifications & User Dropdown --
            Balance moved into the nav tabs above (first position), so
            it's no longer duplicated here. */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Active practice jurisdiction -- country code only, no
              dropdown, reflects App.tsx's real countryId (kept in sync
              with UserSettingsModal's country selector). Click goes
              straight to Settings > Profile, where jurisdiction lives. */}
          {currentCountryCode && (
            <button
              id="header-jurisdiction-badge"
              onClick={() => onOpenUserSettings('profile')}
              className="px-2 py-1 rounded text-xs font-bold font-mono bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-cyan-400/60 text-cyan-300 transition-all shadow-xs cursor-pointer"
              title="Practice Jurisdiction -- click to change"
            >
              {currentCountryCode.toUpperCase()}
            </button>
          )}

          {/* Notifications Button & Popover -- on the CRM tab this opens
              CRM's own notifications & task reminders drawer instead (see
              handleBellClick above); CRM's own second bell icon that used
              to trigger this same kind of drawer has been removed. */}
          <div className="relative" ref={notificationsRef}>
            <button
              id="btn-notifications-header"
              onClick={handleBellClick}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors relative"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
            </button>

            {isNotificationsOpen && activeTab !== 'crm' && (
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

          {/* Marketing Portal -- signs out and returns to the marketing
              landing page; explicit owner request (see also the Sign Out
              dropdown item below, which does the same thing). */}
          {onExitToLandingPage && (
            <button
              id="btn-header-marketing-landing"
              onClick={onExitToLandingPage}
              className="hidden md:flex items-center gap-1.5 text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/80 px-2 py-1 rounded transition-colors text-xs font-semibold"
              title="Return to Marketing Landing Page & Platform Overview"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Marketing Portal</span>
            </button>
          )}

          {/* Quick Search trigger -- consolidated entry point: on the CRM
              tab this opens the CRM's own command palette (leads/tasks/
              sync/actions, formerly behind a separate button in the CRM's
              own toolbar); everywhere else it switches to the cadastre
              search tab, as before. */}
          <button
            onClick={() => (onQuickSearch ? onQuickSearch() : onSelectTab('search'))}
            className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors text-xs"
            title={activeTab === 'crm' ? 'Search Leads, Tasks & CRM Actions' : 'Quick Cadastre Search'}
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

                  {/* 2. Application & Report Language */}
                  <div className="border-t border-b border-slate-100 bg-slate-50/40">
                    <button
                      id="dropdown-item-header-language-toggle"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLanguageSubmenuOpen(!isLanguageSubmenuOpen);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-cyan-50/70 flex items-center justify-between gap-2 text-slate-700 hover:text-cyan-900 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate">
                            <span>Language:</span>
                            <span className="font-semibold text-cyan-800 flex items-center gap-1 truncate">
                              <span>{activeLanguageObj.flag}</span>
                              <span className="truncate">{activeLanguageObj.name}</span>
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal truncate">
                            Report & Dashboard ({activeLanguageObj.native})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {languageToast && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mr-1 animate-pulse">
                            <Check className="w-3 h-3 text-emerald-600" /> Saved
                          </span>
                        )}
                        <ChevronRight 
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            isLanguageSubmenuOpen ? 'rotate-90 text-cyan-600' : 'text-slate-400'
                          }`} 
                        />
                      </div>
                    </button>

                    {/* Pop-up Dropdown List for Languages */}
                    {isLanguageSubmenuOpen && (
                      <div className="bg-white border-t border-slate-200 px-2 py-2 max-h-56 overflow-y-auto space-y-1 shadow-inner animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-1">
                          <span>Select Language</span>
                          <span className="font-mono text-cyan-700 text-[9px]">{LANGUAGES_DATA.length} Available</span>
                        </div>
                        {LANGUAGES_DATA.map((lang) => {
                          const isSelected = selectedLanguage === lang.code;
                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLanguageChange(lang.code);
                                setIsLanguageSubmenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-50 text-cyan-950 font-bold border border-cyan-300 shadow-2xs'
                                  : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base shrink-0">{lang.flag}</span>
                                <div className="truncate">
                                  <div className="truncate text-xs font-semibold">{lang.name}</div>
                                  <div className="text-[10px] text-slate-400 font-normal truncate">{lang.native}</div>
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-700 shrink-0 font-bold" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Billing & Credits Direct Link */}
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

                  {/* 4. Search History */}
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

                  {/* 5. Support -- opens WhatsApp Business (Sans
                      Mercantile's Meta-provisioned support number) with a
                      pre-filled message, same channel pattern already
                      used for contacting property owners elsewhere in
                      the app. */}
                  <a
                    id="dropdown-item-support"
                    href={`https://wa.me/15553544425?text=${encodeURIComponent('Hi Sans Mercantile, I need help with Ptah Realty.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-50 flex items-center gap-2.5 text-slate-700 hover:text-cyan-900 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-xs text-slate-800">Support</div>
                      <div className="text-[10px] text-slate-500 font-normal">Chat with us on WhatsApp</div>
                    </div>
                  </a>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 my-1"></div>

                {/* Sign Out -- locks the real session (onLogout) and, if
                    wired, returns to the marketing landing page instead
                    of dropping straight to the bare login screen. */}
                <button
                  id="dropdown-item-signout"
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    onLogout();
                    if (onExitToLandingPage) onExitToLandingPage();
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

      {/* Sub-Header Action Bar -- property/cadastre-specific (Selected
          Subject Cadastre, CMA Engine, Media Studio, PDF, Portal Sync,
          Accommodation, Deeds), so it has no meaning on the CRM tab. It
          used to render unconditionally, sitting directly above the CRM's
          own toolbar (Lead Pipeline / Task Reminders / etc.) as
          irrelevant clutter squeezing that content down. Hidden here
          instead so the CRM's own bar comes right after the main nav. */}
      {activeTab !== 'crm' && (
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
      )}
    </header>
  );
};
