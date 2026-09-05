import React, { useState, useEffect } from 'react';
import { usePersistedState } from './hooks/usePersistedState';
import { Header, ActiveTab } from './components/Header';
import { CadastralMap } from './components/CadastralMap';
import { PropertyPanel } from './components/PropertyPanel';
import { SuburbAnalyticsModal } from './components/modals/SuburbAnalyticsModal';
import { PropertySearchModal } from './components/modals/PropertySearchModal';
import { SalesTransfersModal } from './components/modals/SalesTransfersModal';
import { ProspectingModal } from './components/modals/ProspectingModal';
import { KYCModal } from './components/modals/KYCModal';
import { AccommodationModal } from './components/modals/AccommodationModal';
import { SectionalTitleModal } from './components/modals/SectionalTitleModal';
import { ValuationModal } from './components/modals/ValuationModal';
import { ContactOwnerModal } from './components/modals/ContactOwnerModal';
import { DocumentsModal } from './components/modals/DocumentsModal';
import { CMAEngineModal } from './components/modals/CMAEngineModal';
import { MediaManagementModal } from './components/modals/MediaManagementModal';
import { PDFReportModal } from './components/modals/PDFReportModal';
import { PortalSyncModal } from './components/modals/PortalSyncModal';
import { MyListingsModal, INITIAL_MY_LISTINGS, type ListingDealRecord } from './components/modals/MyListingsModal';
import { QuickListingModal } from './components/dealView/QuickListingModal';
import { UserSettingsModal, SettingsTabType } from './components/modals/UserSettingsModal';
import { BalanceDetailsModal } from './components/modals/BalanceDetailsModal';
import { CreditsTopUpModal } from './components/modals/CreditsTopUpModal';
import { SearchHistoryModal } from './components/modals/SearchHistoryModal';
import CRMApp from './crm/CRMApp';
import { LoginScreen } from './components/LoginScreen';
import { MarketingLandingPage } from './components/landing/MarketingLandingPage';
import { PROPERTIES_DATA } from './services/mockData';
import { getJurisdictionByCode } from './services/jurisdictionsData';
import { PropertyRecord, AccommodationDetails } from './types';
import { getCurrentUser, logout, listProperties, createProperty, type AuthUser } from './services/api';

export function App() {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  // Shows the marketing landing page before the real login screen (and
  // again on sign-out, via Header's "Sign Out"/"Marketing Portal") --
  // purely a pre-auth UI state, never bypasses real authentication.
  const [showLandingPage, setShowLandingPage] = useState(true);

  // Jurisdiction (Country -> Province/State -> City/Town). Defaults to
  // South Africa -> Western Cape -> Cape Town, the real-backend-connected
  // jurisdiction; switching away shows that jurisdiction's own rich demo
  // dataset (jurisdictionsData.ts) instead, since there's no real backend
  // data for other countries/cities yet -- see handleJurisdictionChange.
  const [countryId, setCountryId] = useState('ZA');
  const [provinceId, setProvinceId] = useState('WC');
  const [cityId, setCityId] = useState('CPT');

  // Luxury theme (Settings > Preferences > Appearance) -- remaps the
  // app's brand accent color app-wide via a data-theme attribute on
  // <html> (see index.css for the actual color overrides). index.html
  // applies whatever was last saved before React even paints, so this
  // just needs to keep localStorage and the attribute in sync from here
  // on for changes made during the session.
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('ptah_theme') || 'emerald');
  useEffect(() => {
    if (theme === 'emerald') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('ptah_theme', theme);
  }, [theme]);

  const [properties, setProperties] = useState<PropertyRecord[]>(PROPERTIES_DATA);
  const [selectedProperty, setSelectedProperty] = usePersistedState<PropertyRecord | null>('selectedProperty', PROPERTIES_DATA[0]); // Default 5 Richmond Road
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  
  // Navigation & Modals State
  // usePersistedState (sessionStorage-backed) so an F5 reload keeps the
  // user exactly where they were -- which nav tab/modal was open -- instead
  // of always resetting to the cadastre map, which is what plain useState
  // defaulting to null/false on every mount was doing.
  const [activeNavTab, setActiveNavTab] = usePersistedState<ActiveTab | null>('activeNavTab', null);
  const [isAccommodationModalOpen, setIsAccommodationModalOpen] = usePersistedState('isAccommodationModalOpen', false);
  const [isValuationModalOpen, setIsValuationModalOpen] = usePersistedState('isValuationModalOpen', false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = usePersistedState('isDocumentsModalOpen', false);
  const [isSectionalModalOpen, setIsSectionalModalOpen] = usePersistedState('isSectionalModalOpen', false);
  const [isCMAEngineOpen, setIsCMAEngineOpen] = usePersistedState('isCMAEngineOpen', false);
  const [isMediaModalOpen, setIsMediaModalOpen] = usePersistedState('isMediaModalOpen', false);
  const [isPDFReportOpen, setIsPDFReportOpen] = usePersistedState('isPDFReportOpen', false);
  const [isPortalSyncOpen, setIsPortalSyncOpen] = usePersistedState('isPortalSyncOpen', false);
  const [isMyListingsOpen, setIsMyListingsOpen] = usePersistedState('isMyListingsOpen', false);
  // Listings pipeline data now lives here (not inside MyListingsModal) so
  // the Quick Listing shortcut -- CRM header only, see chat -- can add to
  // it from the CRM tab without My Listings needing to be open.
  const [listings, setListings] = useState<ListingDealRecord[]>(INITIAL_MY_LISTINGS);
  const [isQuickListingOpen, setIsQuickListingOpen] = usePersistedState('isQuickListingOpen', false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = usePersistedState('isUserSettingsOpen', false);
  const [userSettingsInitialTab, setUserSettingsInitialTab] = usePersistedState<SettingsTabType>('userSettingsInitialTab', 'profile');
  const [isBalanceDetailsOpen, setIsBalanceDetailsOpen] = usePersistedState('isBalanceDetailsOpen', false);
  const [isCreditsTopUpOpen, setIsCreditsTopUpOpen] = usePersistedState('isCreditsTopUpOpen', false);
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = usePersistedState('isSearchHistoryOpen', false);

  // Credits/billing balance -- shared between the header's Balance badge,
  // BalanceDetailsModal, CreditsTopUpModal and UserSettingsModal's Billing
  // tab so a top-up in any one of them is reflected everywhere at once.
  //
  // These start at 0, not a fake pre-loaded balance -- there is no
  // backend credits ledger yet (no persisted balance per user, no
  // deduction tied to real actions, no server-verified top-up). This
  // state is local-session-only and resets on reload; a "top up"
  // success handler changing these numbers is cosmetic, not a real
  // purchase, until that backend exists. See conversation notes on
  // 2026-09-02 for what a real implementation needs.
  const [dataCredits, setDataCredits] = useState(0);
  const [ficaCredits, setFicaCredits] = useState(0);
  const [trustCredits, setTrustCredits] = useState(0);
  const [prepaidBalance, setPrepaidBalance] = useState(0);
  const handleTopUpSuccess = (nextData: number, nextFica: number, nextTrust: number, nextPrepaid?: number) => {
    setDataCredits(nextData);
    setFicaCredits(nextFica);
    setTrustCredits(nextTrust);
    if (nextPrepaid !== undefined) setPrepaidBalance(nextPrepaid);
  };

  // Bumped each time the header's "Connectors" dropdown item is clicked --
  // CRMApp watches this prop and opens its Settings/Connectors modal in
  // response. A counter (rather than a boolean) so clicking it again while
  // already on the CRM tab still re-triggers the effect even though the
  // "value" a boolean would've held (true) wouldn't have changed.
  const [crmOpenConnectorsSignal, setCrmOpenConnectorsSignal] = useState(0);
  const handleOpenCRMConnectors = () => {
    setActiveNavTab('crm');
    setCrmOpenConnectorsSignal((n) => n + 1);
  };

  // Same signal pattern, for the main header's notification bell -- the
  // CRM's own Task Reminders + Notifications bell (Navbar's "Alerts"
  // button) is now redundant with this one and has been removed there
  // (see Navbar.tsx); clicking the main header's bell while on the CRM
  // tab opens CRM's own NotificationDrawer via this bridge instead.
  const [crmOpenNotificationsSignal, setCrmOpenNotificationsSignal] = useState(0);
  const handleOpenCRMNotifications = () => {
    setCrmOpenNotificationsSignal((n) => n + 1);
  };

  // My Listings <-> CRM bridge: jump from a listing (MyListingsModal) to
  // the CRM leads for it, and back from a CRM lead to its linked listing.
  // Same signal+payload pattern as the notifications bridge above (a
  // plain string payload wouldn't re-fire the CRM-side effect on a
  // repeat click of the same listing).
  const [crmViewListingSignal, setCrmViewListingSignal] = useState(0);
  const [crmViewListingId, setCrmViewListingId] = useState<string | null>(null);
  const handleViewLeadsForListing = (listingId: string) => {
    setIsMyListingsOpen(false);
    setActiveNavTab('crm');
    setCrmViewListingId(listingId);
    setCrmViewListingSignal((n) => n + 1);
  };
  const [highlightListingId, setHighlightListingId] = useState<string | null>(null);
  const handleViewListingInMain = (listingId: string) => {
    setActiveNavTab(null);
    setHighlightListingId(listingId);
    setIsMyListingsOpen(true);
  };

  // Consolidated Quick Search: the main header's Quick Search button used
  // to always switch to the cadastre 'search' tab. The CRM had its own
  // separate command palette (leads/tasks/sync/actions) behind its own
  // Quick Search button. Per explicit request, that CRM-only entry point
  // is now removed -- the single header button opens whichever search
  // makes sense for the active tab (see handleQuickSearch below), reusing
  // this same signal pattern rather than lifting CRM's lead/task/sync
  // state out of CRMApp (which only loads that data while actually
  // mounted on the CRM tab).
  const [crmOpenCommandPaletteSignal, setCrmOpenCommandPaletteSignal] = useState(0);

  // Full-app context + task execution for the CRM's AI Copilot
  // (AiAdvisorDrawer.tsx) -- so it can answer questions grounded in
  // what's actually on screen right now (not just CRM lead data) and
  // act on requests like "open my listings" or "take me to search"
  // rather than just describing what the user could click. Built fresh
  // on every render (cheap -- plain field reads, no computation) so the
  // AI always sees current state, not a stale snapshot from mount time.
  // Task execution is allowlisted server-side (api/crm_ai.py's prompt)
  // AND re-checked client-side in AiAdvisorDrawer before anything here
  // runs -- this handler only ever receives task types both sides have
  // already approved.
  const appContext = {
    activeTab: activeNavTab,
    selectedProperty: selectedProperty ? {
      id: selectedProperty.id,
      address: selectedProperty.address,
      suburb: selectedProperty.suburb,
      municipality: selectedProperty.municipality,
    } : null,
    totalProperties: properties.length,
    totalListings: listings.length,
    jurisdiction: { countryId, provinceId, cityId },
  };

  const handleCRMAiTask = (task: { type: string; target?: string }) => {
    switch (task.type) {
      case 'navigate':
        if (task.target) handleSelectTab(task.target as ActiveTab);
        break;
      case 'open_settings':
        setIsUserSettingsOpen(true);
        break;
      case 'open_search':
        handleQuickSearch();
        break;
    }
  };


  // Owner Contact Modal State
  const [isContactOwnerModalOpen, setIsContactOwnerModalOpen] = usePersistedState('isContactOwnerModalOpen', false);
  const [contactOwnerProperty, setContactOwnerProperty] = usePersistedState<PropertyRecord | null>('contactOwnerProperty', null);
  const [contactOwnerTab, setContactOwnerTab] = usePersistedState<'call' | 'email' | 'whatsapp'>('contactOwnerTab', 'call');

  // KYC quick launch target
  const [kycTarget, setKycTarget] = useState<{ name: string; id: string }>({ name: '', id: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load real properties from the backend once authenticated. If the
  // tenant has none yet (brand new), seed it with this demo's rich Cape
  // Town dataset as real records -- so the app has real, valuable data
  // from day one instead of only-ever-local mock state.
  //
  // BUG FIX (2026-08-27): this used to call setProperties(real) +
  // setSelectedProperty(real[0]) unconditionally, replacing the rich
  // local PROPERTIES_DATA wholesale and yanking the selection to
  // whatever the backend's newest-created property happened to be
  // (list_properties sorts by created_at desc) -- causing a jarring
  // "flash" from a fully-populated demo listing to a barely-populated
  // one the instant this effect resolved. Two separate problems, fixed
  // together: (1) the backend's flatter Property schema round-trips
  // lossily (see services/api.ts's docstring -- no cadastral polygon, no
  // Property24 listing/photos, no owner ID), so it should never *replace*
  // the rich local seed data for display; (2) selection should never be
  // silently reassigned out from under whatever the user (or the demo
  // default) already has open. Now: merge additively (only add backend
  // properties not already represented locally, matched by
  // address+suburb) and never touch selectedProperty here.
  useEffect(() => {
    if (!user) return;
    setIsLoadingProperties(true);
    (async () => {
      try {
        let real = await listProperties();
        if (real.length === 0) {
          for (const p of PROPERTIES_DATA) {
            await createProperty(p);
          }
          real = await listProperties();
        }
        const localKeys = new Set(PROPERTIES_DATA.map(p => `${p.address}|${p.suburb}`.toLowerCase()));
        const newFromBackend = real.filter(r => !localKeys.has(`${r.address}|${r.suburb}`.toLowerCase()));
        if (newFromBackend.length > 0) {
          setProperties([...PROPERTIES_DATA, ...newFromBackend]);
        }
      } catch (err) {
        console.error('Failed to load real properties, staying on local dataset:', err);
      } finally {
        setIsLoadingProperties(false);
      }
    })();
  }, [user]);

  if (!user) {
    // Marketing landing page shows first; its CTAs (including the demo
    // "instant login" buttons, which are purely cosmetic in that file --
    // no real auth call, see MarketingLandingPage.tsx/LoginModal.tsx)
    // all funnel through one onEnterApp callback, which here just
    // reveals the REAL login screen rather than pretending anyone is
    // authenticated. Nothing about actual authentication changes -- only
    // LoginScreen's real onLogin can ever set `user`.
    if (showLandingPage) {
      return <MarketingLandingPage onEnterApp={() => setShowLandingPage(false)} />;
    }
    return <LoginScreen onLogin={setUser} />;
  }

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'cma') {
      setIsCMAEngineOpen(true);
      setActiveNavTab(null);
    } else if (tab === 'media') {
      setIsMediaModalOpen(true);
      setActiveNavTab(null);
    } else if (tab === 'portals') {
      setIsPortalSyncOpen(true);
      setActiveNavTab(null);
    } else if (tab === 'listings') {
      setIsMyListingsOpen(true);
      setActiveNavTab(null);
    } else {
      setActiveNavTab(tab);
    }
  };

  // Single Quick Search entry point (header button), context-aware: while
  // on the CRM tab it opens the CRM's own command palette (leads/tasks/
  // sync/actions -- see crmOpenCommandPaletteSignal above); everywhere
  // else it keeps the original behaviour of switching to the cadastre
  // 'search' tab. Replaces the CRM's own separate Quick Search button.
  const handleQuickSearch = () => {
    if (activeNavTab === 'crm') {
      setCrmOpenCommandPaletteSignal((n) => n + 1);
    } else {
      handleSelectTab('search');
    }
  };

  const handleCloseNavModal = () => {
    setActiveNavTab(null);
  };

  // Header logo click -- returns to the plain Cadastre Map view, closing
  // every modal that could currently be sitting on top of it (rather than
  // reusing onSelectTab('cma'), which opens the CMA Engine modal instead
  // of actually landing on the map).
  const handleGoHome = () => {
    setActiveNavTab(null);
    setIsAccommodationModalOpen(false);
    setIsValuationModalOpen(false);
    setIsDocumentsModalOpen(false);
    setIsSectionalModalOpen(false);
    setIsCMAEngineOpen(false);
    setIsMediaModalOpen(false);
    setIsPDFReportOpen(false);
    setIsPortalSyncOpen(false);
    setIsMyListingsOpen(false);
    setIsQuickListingOpen(false);
    setIsUserSettingsOpen(false);
    setIsBalanceDetailsOpen(false);
    setIsCreditsTopUpOpen(false);
    setIsSearchHistoryOpen(false);
  };

  const handleSelectProperty = (prop: PropertyRecord) => {
    setSelectedProperty(prop);
    setIsSidebarOpen(true);
  };

  // Bubbled up from CadastralMap's "Pull Live Property24 Data" button --
  // merges newly-pulled listings into the visible property set (already
  // persisted to the backend by the caller, so this is just what's shown
  // in this session immediately without waiting for a refetch).
  const handleLivePropertiesAdded = (newProps: PropertyRecord[]) => {
    setProperties(prev => {
      const known = new Set(prev.map(p => `${p.address}|${p.suburb}`.toLowerCase()));
      const toAdd = newProps.filter(p => !known.has(`${p.address}|${p.suburb}`.toLowerCase()));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  };

  const handleOpenKYCForOwner = (ownerName: string, ownerId: string) => {
    setKycTarget({ name: ownerName, id: ownerId });
    setActiveNavTab('kyc');
  };

  // Country/Province/City switch from Settings > Profile's Jurisdiction
  // section. The default jurisdiction (ZA/WC/CPT) is real-backend-merged
  // (see the loadProperties effect above); every other jurisdiction has
  // no real backend data behind it, so this swaps in that jurisdiction's
  // own curated demo dataset instead -- currency, legal terminology and
  // property listings all change together.
  const handleJurisdictionChange = (newCountryId: string, newProvinceId: string, newCityId: string) => {
    setCountryId(newCountryId);
    setProvinceId(newProvinceId);
    setCityId(newCityId);
    const jur = getJurisdictionByCode(newCountryId, newProvinceId, newCityId);
    if (jur.city.properties && jur.city.properties.length > 0) {
      setProperties(jur.city.properties);
      setSelectedProperty(jur.city.properties[0]);
    }
  };

  const handleOpenContactOwner = (prop: PropertyRecord, initialTab: 'call' | 'email' | 'whatsapp' = 'call') => {
    setContactOwnerProperty(prop);
    setContactOwnerTab(initialTab);
    setIsContactOwnerModalOpen(true);
  };

  const handleSaveAccommodation = (updated: AccommodationDetails) => {
    if (!selectedProperty) return;
    const updatedProp = {
      ...selectedProperty,
      accommodation: updated
    };
    setSelectedProperty(updatedProp);
    setProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Top Main Navigation */}
      <Header
        activeTab={activeNavTab}
        onSelectTab={handleSelectTab}
        onQuickSearch={handleQuickSearch}
        onOpenAccommodation={() => setIsAccommodationModalOpen(true)}
        onOpenCMAEngine={() => setIsCMAEngineOpen(true)}
        onOpenMediaManagement={() => setIsMediaModalOpen(true)}
        onOpenPDFReport={() => setIsPDFReportOpen(true)}
        onOpenPortalSync={() => setIsPortalSyncOpen(true)}
        onOpenDocuments={() => setIsDocumentsModalOpen(true)}
        onOpenUserSettings={(tab) => {
          setUserSettingsInitialTab(tab || 'profile');
          setIsUserSettingsOpen(true);
        }}
        onOpenSearchHistoryModal={() => setIsSearchHistoryOpen(true)}
        onOpenCreditsModal={() => setIsCreditsTopUpOpen(true)}
        onOpenBalanceDetails={() => setIsBalanceDetailsOpen(true)}
        dataCredits={dataCredits}
        ficaCredits={ficaCredits}
        trustCredits={trustCredits}
        prepaidBalance={prepaidBalance}
        userEmail={user.email}
        onLogout={() => { logout(); setUser(null); }}
        onExitToLandingPage={() => { logout(); setUser(null); setShowLandingPage(true); }}
        selectedPropertyAddress={selectedProperty?.address}
        onOpenCRMNotifications={handleOpenCRMNotifications}
        onOpenQuickListing={() => setIsQuickListingOpen(true)}
        onGoHome={handleGoHome}
        currentCountryCode={countryId}
      />
      {/* Main Workspace Area (Google Maps & Cadastral Vector Canvas + Property Title Panel) */}
      <main className={`flex-1 overflow-hidden relative ${activeNavTab === 'crm' ? '' : 'flex flex-row'}`}>
        {activeNavTab === 'crm' ? (
          <CRMApp
            openConnectorsSignal={crmOpenConnectorsSignal}
            openCommandPaletteSignal={crmOpenCommandPaletteSignal}
            openNotificationsSignal={crmOpenNotificationsSignal}
            onOpenQuickListing={() => setIsQuickListingOpen(true)}
            myListings={listings}
            viewListingSignal={crmViewListingSignal}
            viewListingId={crmViewListingId}
            onViewListingInMain={handleViewListingInMain}
            appContext={appContext}
            onTask={handleCRMAiTask}
          />
        ) : (
          <>
        {/* Cadastral Map View */}
        <CadastralMap
          properties={properties}
          selectedProperty={selectedProperty}
          onSelectProperty={handleSelectProperty}
          isSidebarOpen={isSidebarOpen}
          onOpenCMAEngine={() => setIsCMAEngineOpen(true)}
          onOpenPDFReport={() => setIsPDFReportOpen(true)}
          onOpenContactOwner={handleOpenContactOwner}
          onOpenPortalSync={() => setIsPortalSyncOpen(true)}
          onLivePropertiesAdded={handleLivePropertiesAdded}
        />

        {/* Right Collapsible Property & Title Information Sidebar */}
        {isSidebarOpen && (
          <PropertyPanel
            property={selectedProperty}
            onClose={() => setIsSidebarOpen(false)}
            onOpenQuickListing={() => setIsMyListingsOpen(true)}
            onOpenAccommodation={() => setIsAccommodationModalOpen(true)}
            onOpenSectionalUnits={(prop) => {
              setSelectedProperty(prop);
              setIsSectionalModalOpen(true);
            }}
            onOpenKYCForOwner={handleOpenKYCForOwner}
            onOpenValuation={() => setIsValuationModalOpen(true)}
            onOpenCMAEngine={() => setIsCMAEngineOpen(true)}
            onOpenMediaManagement={() => setIsMediaModalOpen(true)}
            onOpenPDFReport={() => setIsPDFReportOpen(true)}
            onOpenPortalSync={() => setIsPortalSyncOpen(true)}
            onOpenContactOwner={handleOpenContactOwner}
          />
        )}
          </>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Suburb & Demographic Analytics Modal */}
      <SuburbAnalyticsModal
        isOpen={activeNavTab === 'suburb'}
        onClose={handleCloseNavModal}
        onSelectSuburbForMap={(suburb) => {
          const match = properties.find(p => p.suburb.toLowerCase().includes(suburb.toLowerCase().split(',')[0]));
          if (match) setSelectedProperty(match);
        }}
      />

      {/* 2. Property & Cadastre Search Modal */}
      <PropertySearchModal
        isOpen={activeNavTab === 'search'}
        onClose={handleCloseNavModal}
        properties={properties}
        onSelectProperty={handleSelectProperty}
      />

      {/* 3. Sales & Registered Transfers Modal */}
      <SalesTransfersModal
        isOpen={activeNavTab === 'sales'}
        onClose={handleCloseNavModal}
        properties={properties}
        onSelectProperty={handleSelectProperty}
      />

      {/* 4. Prospecting & Lead Generation Engine Modal */}
      <ProspectingModal
        isOpen={activeNavTab === 'prospecting'}
        onClose={handleCloseNavModal}
        onSelectPropertyByAddress={(addr) => {
          const match = properties.find(p => p.address.toLowerCase().includes(addr.toLowerCase()));
          if (match) setSelectedProperty(match);
        }}
      />

      {/* 5. KYC & Deeds Verification Suite Modal */}
      <KYCModal
        isOpen={activeNavTab === 'kyc'}
        onClose={handleCloseNavModal}
        initialOwnerName={kycTarget.name}
        initialOwnerId={kycTarget.id}
        onOpenCreditsModal={() => setIsCreditsTopUpOpen(true)}
      />

      {/* 6. Structural Accommodation Editor Modal */}
      <AccommodationModal
        isOpen={isAccommodationModalOpen}
        onClose={() => setIsAccommodationModalOpen(false)}
        property={selectedProperty}
        onSaveAccommodation={handleSaveAccommodation}
      />

      {/* 7. Sectional Title Scheme Units Modal */}
      <SectionalTitleModal
        isOpen={isSectionalModalOpen}
        onClose={() => setIsSectionalModalOpen(false)}
        property={selectedProperty}
        onOpenKYCForOwner={handleOpenKYCForOwner}
      />

      {/* 8. Comparative Market Analysis (CMA) Engine & Ingestion Pipeline Modal */}
      <CMAEngineModal
        isOpen={isCMAEngineOpen}
        onClose={() => setIsCMAEngineOpen(false)}
        property={selectedProperty}
        onOpenPDFReport={() => {
          setIsCMAEngineOpen(false);
          setIsPDFReportOpen(true);
        }}
        onOpenPortalSync={() => {
          setIsCMAEngineOpen(false);
          setIsPortalSyncOpen(true);
        }}
      />

      {/* 9. Property Media & Visual Asset Management Modal */}
      <MediaManagementModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        property={selectedProperty}
        onOpenPDFReport={() => {
          setIsMediaModalOpen(false);
          setIsPDFReportOpen(true);
        }}
      />

      {/* 10. Client-Facing Automated PDF Report Generator Modal */}
      <PDFReportModal
        isOpen={isPDFReportOpen}
        onClose={() => setIsPDFReportOpen(false)}
        property={selectedProperty}
      />

      {/* 11. Multi-Portal Listing Sync & API Distribution Hub Modal */}
      <PortalSyncModal
        isOpen={isPortalSyncOpen}
        onClose={() => setIsPortalSyncOpen(false)}
        property={selectedProperty}
      />

      {/* 12. Property Documents & Official Deeds Modal */}
      <DocumentsModal
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        property={selectedProperty}
      />

      {/* 13. AI Property Valuation Suite Modal */}
      <ValuationModal
        isOpen={isValuationModalOpen}
        onClose={() => setIsValuationModalOpen(false)}
        property={selectedProperty}
        onOpenContactOwner={handleOpenContactOwner}
      />

      {/* 14. Contact Property Owner & Outreach Modal */}
      <ContactOwnerModal
        isOpen={isContactOwnerModalOpen}
        onClose={() => setIsContactOwnerModalOpen(false)}
        property={contactOwnerProperty || selectedProperty}
        initialTab={contactOwnerTab}
        onOpenKYC={handleOpenKYCForOwner}
      />

      {/* 15. My Listings Portfolio & Deal View Pipeline */}
      <MyListingsModal
        isOpen={isMyListingsOpen}
        onClose={() => setIsMyListingsOpen(false)}
        selectedProperty={selectedProperty}
        onSelectProperty={handleSelectProperty}
        listings={listings}
        setListings={setListings}
        highlightListingId={highlightListingId}
        onViewLeadsForListing={handleViewLeadsForListing}
        onOpenQuickListing={() => setIsQuickListingOpen(true)}
      />

      {/* Quick Listing shortcut lives only in the CRM header now (see
          chat) -- rendered here at the top level, not inside
          MyListingsModal, so it works from the CRM tab regardless of
          whether My Listings is open. Feeds the same `listings` state
          above. */}
      <QuickListingModal
        isOpen={isQuickListingOpen}
        onClose={() => setIsQuickListingOpen(false)}
        selectedProperty={selectedProperty}
        onAddListing={(newListing) => setListings(prev => [newListing, ...prev])}
      />

      {/* 16. User Settings (Profile, Password, Billing, Language, Apps & Extensions) */}
      <UserSettingsModal
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
        initialTab={userSettingsInitialTab}
        dataCredits={dataCredits}
        ficaCredits={ficaCredits}
        trustCredits={trustCredits}
        prepaidBalance={prepaidBalance}
        onTopUpSuccess={handleTopUpSuccess}
        currentCountryId={countryId}
        currentProvinceId={provinceId}
        currentCityId={cityId}
        onJurisdictionChange={handleJurisdictionChange}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* 17. Balance & Available Funds Details Modal */}
      <BalanceDetailsModal
        isOpen={isBalanceDetailsOpen}
        onClose={() => setIsBalanceDetailsOpen(false)}
        dataCredits={dataCredits}
        ficaCredits={ficaCredits}
        trustCredits={trustCredits}
        prepaidBalance={prepaidBalance}
        onTopUpSuccess={handleTopUpSuccess}
        onOpenBillingSettings={() => {
          setIsBalanceDetailsOpen(false);
          setUserSettingsInitialTab('billing');
          setIsUserSettingsOpen(true);
        }}
      />

      {/* 18. Credits Top-Up Modal */}
      <CreditsTopUpModal
        isOpen={isCreditsTopUpOpen}
        onClose={() => setIsCreditsTopUpOpen(false)}
        currentDataCredits={dataCredits}
        currentFicaCredits={ficaCredits}
        currentTrustCredits={trustCredits}
        onTopUpSuccess={handleTopUpSuccess}
      />

      {/* 19. Search History & 72-Hour NCA/POPIA Audit Log */}
      <SearchHistoryModal
        isOpen={isSearchHistoryOpen}
        onClose={() => setIsSearchHistoryOpen(false)}
      />
    </div>
  );
}

export default App;
