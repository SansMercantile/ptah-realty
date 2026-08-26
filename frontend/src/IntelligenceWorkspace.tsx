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
import { DocumentsModal } from './components/modals/DocumentsModal';
import { CMAEngineModal } from './components/modals/CMAEngineModal';
import { MediaManagementModal } from './components/modals/MediaManagementModal';
import { PDFReportModal } from './components/modals/PDFReportModal';
import { PortalSyncModal } from './components/modals/PortalSyncModal';
import { PROPERTIES_DATA } from './services/mockData';
import { PropertyRecord, AccommodationDetails } from './types';
import { apiFetch } from './lib/api';

export function IntelligenceWorkspace() {
  const [properties, setProperties] = useState<PropertyRecord[]>(PROPERTIES_DATA);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(PROPERTIES_DATA[0]); // Default 5 Richmond Road
  
  // Navigation & Modals State
  const [activeNavTab, setActiveNavTab] = useState<ActiveTab | null>(null);
  const [isAccommodationModalOpen, setIsAccommodationModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isSectionalModalOpen, setIsSectionalModalOpen] = useState(false);
  const [isCMAEngineOpen, setIsCMAEngineOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isPDFReportOpen, setIsPDFReportOpen] = useState(false);
  const [isPortalSyncOpen, setIsPortalSyncOpen] = useState(false);
  
  // KYC quick launch target
  const [kycTarget, setKycTarget] = useState<{ name: string; id: string }>({ name: '', id: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch initial properties from server if available
  useEffect(() => {
    apiFetch('/api/v1/realty/properties')
      .then(res => res.json())
      .then(data => {
        if (data.properties && data.properties.length > 0) {
          setProperties(data.properties);
        }
      })
      .catch(err => console.log('Using local dataset cache'));
  }, []);

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
        selectedPropertyAddress={selectedProperty?.address}
      />

      {/* Main Workspace Area (Google Maps & Cadastral Vector Canvas + Property Title Panel) */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* Cadastral Map View */}
        <CadastralMap
          properties={properties}
          selectedProperty={selectedProperty}
          onSelectProperty={handleSelectProperty}
          isSidebarOpen={isSidebarOpen}
          onOpenCMAEngine={() => setIsCMAEngineOpen(true)}
          onOpenPDFReport={() => setIsPDFReportOpen(true)}
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
            onOpenValuation={() => setIsCMAEngineOpen(true)}
            onOpenCMAEngine={() => setIsCMAEngineOpen(true)}
            onOpenMediaManagement={() => setIsMediaModalOpen(true)}
            onOpenPDFReport={() => setIsPDFReportOpen(true)}
            onOpenPortalSync={() => setIsPortalSyncOpen(true)}
          />
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
    </div>
  );
}

export default IntelligenceWorkspace;
