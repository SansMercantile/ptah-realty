import React, { useState, useEffect } from 'react';
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
import CRMApp from './crm/CRMApp';
import { LoginScreen } from './components/LoginScreen';
import { PROPERTIES_DATA } from './services/mockData';
import { PropertyRecord, AccommodationDetails } from './types';
import { getCurrentUser, logout, listProperties, createProperty, type AuthUser } from './services/api';

export function App() {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [properties, setProperties] = useState<PropertyRecord[]>(PROPERTIES_DATA);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(PROPERTIES_DATA[0]); // Default 5 Richmond Road
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  
  // Navigation & Modals State
  const [activeNavTab, setActiveNavTab] = useState<ActiveTab | null>(null);
  const [isAccommodationModalOpen, setIsAccommodationModalOpen] = useState(false);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isSectionalModalOpen, setIsSectionalModalOpen] = useState(false);
  const [isCMAEngineOpen, setIsCMAEngineOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isPDFReportOpen, setIsPDFReportOpen] = useState(false);
  const [isPortalSyncOpen, setIsPortalSyncOpen] = useState(false);

  // Owner Contact Modal State
  const [isContactOwnerModalOpen, setIsContactOwnerModalOpen] = useState(false);
  const [contactOwnerProperty, setContactOwnerProperty] = useState<PropertyRecord | null>(null);
  const [contactOwnerTab, setContactOwnerTab] = useState<'call' | 'email' | 'whatsapp'>('call');

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
    return <LoginScreen onLogin={setUser} />;
  }

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'cma') {
      setIsCMAEngineOpen(true);
      setActiveNavTab(null);
    } else if (tab === 'media') {
      setIsMediaModalOpen(true);
      setActiveNavTab(null);
    } else if (tab === 'pdf') {
      setIsPDFReportOpen(true);
      setActiveNavTab(null);
    } else if (tab === 'portals') {
      setIsPortalSyncOpen(true);
      setActiveNavTab(null);
    } else {
      setActiveNavTab(tab);
    }
  };

  const handleCloseNavModal = () => {
    setActiveNavTab(null);
  };

  const handleSelectProperty = (prop: PropertyRecord) => {
    setSelectedProperty(prop);
    setIsSidebarOpen(true);
  };

  const handleOpenKYCForOwner = (ownerName: string, ownerId: string) => {
    setKycTarget({ name: ownerName, id: ownerId });
    setActiveNavTab('kyc');
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
        onOpenAccommodation={() => setIsAccommodationModalOpen(true)}
        onOpenCMAEngine={() => setIsCMAEngineOpen(true)}
        onOpenMediaManagement={() => setIsMediaModalOpen(true)}
        onOpenPDFReport={() => setIsPDFReportOpen(true)}
        onOpenPortalSync={() => setIsPortalSyncOpen(true)}
        onOpenDocuments={() => setIsDocumentsModalOpen(true)}
        userEmail={user.email}
        onLogout={() => { logout(); setUser(null); }}
        selectedPropertyAddress={selectedProperty?.address}
      />
      {/* Main Workspace Area (Google Maps & Cadastral Vector Canvas + Property Title Panel) */}
      <main className={`flex-1 overflow-hidden relative ${activeNavTab === 'crm' ? 'overflow-y-auto' : 'flex flex-row'}`}>
        {activeNavTab === 'crm' ? (
          <CRMApp />
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
        />

        {/* Right Collapsible Property & Title Information Sidebar */}
        {isSidebarOpen && (
          <PropertyPanel
            property={selectedProperty}
            onClose={() => setIsSidebarOpen(false)}
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
    </div>
  );
}

export default App;
