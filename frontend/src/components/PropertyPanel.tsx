import React, { useState } from 'react';
import { 
  Printer, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Home, 
  Phone, 
  FileText, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { PropertyRecord } from '../types';

interface PropertyPanelProps {
  property: PropertyRecord | null;
  onClose?: () => void;
  onOpenAccommodation: () => void;
  onOpenSectionalUnits?: (property: PropertyRecord) => void;
  onOpenKYCForOwner: (ownerName: string, ownerId: string) => void;
  onOpenValuation: () => void;
  onOpenCMAEngine?: () => void;
  onOpenMediaManagement?: () => void;
  onOpenPDFReport?: () => void;
  onOpenPortalSync?: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  property,
  onClose,
  onOpenAccommodation,
  onOpenSectionalUnits,
  onOpenKYCForOwner,
  onOpenValuation,
  onOpenCMAEngine,
  onOpenMediaManagement,
  onOpenPDFReport,
  onOpenPortalSync
}) => {
  const [showFullId, setShowFullId] = useState(false);
  const [openSections, setOpenSections] = useState({
    propertyInfo: true,
    saleInfo: true,
    municipalValuation: true,
    servitudes: false,
    accommodation: true,
    renovations: false
  });

  if (!property) {
    return (
      <aside className="w-80 lg:w-96 bg-white text-slate-600 border-l border-slate-300 flex flex-col items-center justify-center p-6 text-center select-none shadow-sm">
        <Home className="w-10 h-10 text-slate-400 mb-2" />
        <h3 className="font-bold text-slate-800 text-sm">No Property Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Click on any Cadastral lot on the map or use Property Search to view full title deed, valuation, and owner intelligence.
        </p>
      </aside>
    );
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatZar = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '-';
    if (amount === 0) return 'R 0';
    return `R ${amount.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  const formatMaskedId = (idString: string) => {
    if (showFullId) return idString;
    if (idString.length > 6) {
      return idString.substring(0, 6) + '*******';
    }
    return idString;
  };

  return (
    <aside 
      id="property-title-panel"
      className="w-80 sm:w-96 lg:w-[400px] bg-slate-50 text-slate-800 border-l border-slate-300 flex flex-col h-full overflow-y-auto select-text shadow-md z-20 shrink-0"
    >
      {/* Top Title Bar (Classic CMA Dark Teal) */}
      <div className="bg-[#006980] px-3 py-2 text-white flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="text-xs sm:text-sm font-bold tracking-wide truncate uppercase">
            {property.address}
          </h2>
          <p className="text-[11px] text-cyan-100 font-medium truncate">
            {property.suburb} • Erf {property.erfNo}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => window.print()}
            className="p-1 hover:bg-teal-700/80 rounded text-cyan-100 hover:text-white transition-colors"
            title="Print Property Sheet"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-teal-700/80 rounded text-cyan-100 hover:text-white transition-colors text-xs font-bold"
              title="Collapse Panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Street / Scheme Quick Shortcuts */}
      <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex flex-col gap-1 text-[11px]">
        <div className="flex items-center justify-between text-slate-700">
          <span className="font-semibold text-cyan-900 uppercase tracking-tight flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-700" />
            Properties in street: {property.address.split(' ').slice(1).join(' ')}
          </span>
          <span className="text-[10px] bg-cyan-100 text-cyan-900 font-bold px-1.5 py-0.2 rounded border border-cyan-300">
            {property.zoning}
          </span>
        </div>

        {property.isSectionalTitle && (
          <button
            id="btn-open-sectional-units"
            onClick={() => onOpenSectionalUnits && onOpenSectionalUnits(property)}
            className="mt-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-1 rounded text-[11px] font-semibold flex items-center justify-between transition-colors text-left"
          >
            <span className="truncate">SECTIONS IN: {property.schemeName || property.address} ({property.sectionalUnits?.length || 2} Units)</span>
            <ExternalLink className="w-3 h-3 text-indigo-600 shrink-0 ml-1" />
          </button>
        )}
      </div>

      {/* Reported Sale Banner if active */}
      {property.reportedSale && (
        <div className="bg-emerald-50 border-b border-emerald-300 px-3 py-1.5 text-emerald-900 text-xs flex items-center justify-between">
          <div>
            <div className="font-bold flex items-center gap-1 text-emerald-800 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>REPORTED SALE (ACTIVE MLS)</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              {formatZar(property.reportedSale.price)} • {property.reportedSale.date}
            </p>
          </div>
          <span className="text-[10px] bg-emerald-200 text-emerald-900 border border-emerald-400 px-2 py-0.5 rounded uppercase font-bold">
            {property.reportedSale.status}
          </span>
        </div>
      )}

      {/* Ptah-Realty Quick Action Workflow Hub */}
      <div className="bg-slate-900 text-slate-100 p-2.5 border-b border-slate-800 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Ptah Agent Intelligence Hub
          </span>
          <span className="text-slate-400 font-mono">MLS Ready</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {onOpenCMAEngine && (
            <button
              id="btn-panel-cma"
              onClick={onOpenCMAEngine}
              className="py-1.5 px-2 bg-[#006980] hover:bg-cyan-600 text-white font-bold rounded text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs"
            >
              <TrendingUp className="w-3 h-3 text-cyan-200" />
              <span>CMA Engine</span>
            </button>
          )}

          {onOpenPDFReport && (
            <button
              id="btn-panel-pdf"
              onClick={onOpenPDFReport}
              className="py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>PDF Report</span>
            </button>
          )}

          {onOpenMediaManagement && (
            <button
              id="btn-panel-media"
              onClick={onOpenMediaManagement}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
            >
              <Home className="w-3 h-3 text-cyan-400" />
              <span>Media Studio</span>
            </button>
          )}

          {onOpenPortalSync && (
            <button
              id="btn-panel-portals"
              onClick={onOpenPortalSync}
              className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3 h-3 text-indigo-200" />
              <span>Portal Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="divide-y divide-slate-200 text-xs">
        {/* SECTION 1: PROPERTY INFORMATION */}
        <div>
          <button
            id="accordion-property-info"
            onClick={() => toggleSection('propertyInfo')}
            className="w-full px-3 py-1.5 bg-slate-200 hover:bg-slate-300 flex items-center justify-between font-bold text-slate-800 transition-colors text-left"
          >
            <span className="flex items-center gap-1.5 text-cyan-900">
              <span>Property Information</span>
            </span>
            {openSections.propertyInfo ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {openSections.propertyInfo && (
            <div className="p-2.5 bg-white space-y-1 text-[11px]">
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">LPI Code:</span>
                <span className="col-span-2 font-mono text-cyan-900 font-bold select-all">{property.lpiCode}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Deeds Office:</span>
                <span className="col-span-2 font-semibold text-slate-800">{property.deedsOffice}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Erf no:</span>
                <span className="col-span-2 font-bold text-slate-900">{property.erfNo}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Township:</span>
                <span className="col-span-2 text-slate-800">{property.township}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Address:</span>
                <span className="col-span-2 font-semibold text-slate-900">{property.address}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Suburb:</span>
                <span className="col-span-2 text-slate-800">{property.suburb}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Municipality:</span>
                <span className="col-span-2 text-slate-700">{property.municipality}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Province:</span>
                <span className="col-span-2 text-slate-700">{property.province}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">GPS:</span>
                <span className="col-span-2 text-cyan-800 font-mono select-all text-[10px]">{property.gps.formatted}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Extent:</span>
                <span className="col-span-2 font-bold text-emerald-700">{property.extentM2} m²</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Cadastral extent:</span>
                <span className="col-span-2 text-slate-700">{property.cadastralExtentM2} m²</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Type:</span>
                <span className="col-span-2 text-slate-800">{property.accommodation.type}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Usage:</span>
                <span className="col-span-2 text-slate-800">{property.usage}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Zoning:</span>
                <span className="col-span-2 font-semibold text-amber-800">{property.zoning}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">Zoning Desc:</span>
                <span className="col-span-2 text-slate-700">{property.zoningDescription}</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: SALE INFORMATION */}
        <div>
          <button
            id="accordion-sale-info"
            onClick={() => toggleSection('saleInfo')}
            className="w-full px-3 py-1.5 bg-slate-200 hover:bg-slate-300 flex items-center justify-between font-bold text-slate-800 transition-colors text-left"
          >
            <span className="flex items-center gap-1.5 text-cyan-900">
              <span>Sale Information</span>
            </span>
            {openSections.saleInfo ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {openSections.saleInfo && (
            <div className="p-2.5 bg-white space-y-1 text-[11px]">
              <div className="grid grid-cols-3 gap-2 items-start py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Owner:</span>
                <div className="col-span-2">
                  <span className="font-bold text-slate-900 block">{property.currentSale.owner}</span>
                  <button
                    onClick={() => onOpenKYCForOwner(property.currentSale.owner, property.currentSale.ownersId)}
                    className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 rounded text-[10px] font-semibold transition-colors"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-cyan-700" />
                    <span>Run KYC Verification</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Owner's ID:</span>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="font-mono text-slate-800 font-semibold">{formatMaskedId(property.currentSale.ownersId)}</span>
                  <button
                    onClick={() => setShowFullId(!showFullId)}
                    className="text-slate-500 hover:text-cyan-800 p-0.5"
                    title={showFullId ? "Hide ID" : "Show Full ID"}
                  >
                    {showFullId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Sale Price:</span>
                <span className="col-span-2 font-bold text-cyan-900 text-xs">{formatZar(property.currentSale.salePrice)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Sale Date:</span>
                <span className="col-span-2 text-slate-800">{property.currentSale.saleDate}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Reg. Date:</span>
                <span className="col-span-2 text-slate-800">{property.currentSale.registeredDate}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Title Deed:</span>
                <span className="col-span-2 font-mono text-slate-800 font-semibold select-all">{property.currentSale.titleDeed}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Bond Holder:</span>
                <span className="col-span-2 text-slate-800">{property.currentSale.bondHolder || '-'}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Bond Amount:</span>
                <span className="col-span-2 font-semibold text-slate-800">{formatZar(property.currentSale.bondAmount)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">Sale Type:</span>
                <span className="col-span-2 text-slate-700">{property.currentSale.saleType}</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: MUNICIPAL VALUATION */}
        <div>
          <button
            id="accordion-valuation"
            onClick={() => toggleSection('municipalValuation')}
            className="w-full px-3 py-1.5 bg-slate-200 hover:bg-slate-300 flex items-center justify-between font-bold text-slate-800 transition-colors text-left"
          >
            <span className="flex items-center gap-1.5 text-cyan-900">
              <span>Municipal Valuation</span>
            </span>
            {openSections.municipalValuation ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {openSections.municipalValuation && (
            <div className="p-2.5 bg-white space-y-1.5 text-[11px]">
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Total Value:</span>
                <span className="col-span-2 font-bold text-emerald-700 text-xs">{formatZar(property.municipalValuation.totalValue)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Valuation Year:</span>
                <span className="col-span-2 text-slate-800">{property.municipalValuation.valuationYear}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-slate-500">Rates Est.:</span>
                <span className="col-span-2 text-amber-800 font-semibold">{formatZar(property.municipalValuation.ratesEstimateMonthly)} / month</span>
              </div>

              <button
                onClick={onOpenValuation}
                className="w-full mt-2 py-1 bg-slate-100 hover:bg-slate-200 text-cyan-900 border border-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <TrendingUp className="w-3.5 h-3.5 text-cyan-700" />
                <span>Open CMA Valuation Matrix ™</span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION 4: SERVITUDES */}
        <div>
          <button
            id="accordion-servitudes"
            onClick={() => toggleSection('servitudes')}
            className="w-full px-3 py-1.5 bg-slate-200 hover:bg-slate-300 flex items-center justify-between font-bold text-slate-800 transition-colors text-left"
          >
            <span className="flex items-center gap-1.5 text-cyan-900">
              <span>Servitudes : {property.servitudes ? <strong className="text-amber-800">ON</strong> : 'OFF'}</span>
            </span>
            {openSections.servitudes ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {openSections.servitudes && (
            <div className="p-2.5 bg-white text-[11px] text-slate-700">
              {property.servitudes ? (
                <div className="p-2 bg-amber-50 border border-amber-300 rounded text-amber-900">
                  <span className="font-bold block mb-1">Registered Servitude:</span>
                  {property.servitudeDetails || 'Registered Right of Way / Municipal Infrastructure Servitude'}
                </div>
              ) : (
                <p className="text-slate-500">No registered servitudes noted on current title cadastre.</p>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5: ACCOMMODATION RESIDENTIAL / COMMERCIAL */}
        <div>
          <button
            id="accordion-accommodation"
            onClick={() => toggleSection('accommodation')}
            className="w-full px-3 py-1.5 bg-slate-200 hover:bg-slate-300 flex items-center justify-between font-bold text-slate-800 transition-colors text-left"
          >
            <span className="flex items-center gap-1.5 text-cyan-900">
              <span>Accommodation Residential / Commercial</span>
            </span>
            {openSections.accommodation ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {openSections.accommodation && (
            <div className="p-2.5 bg-white space-y-2 text-[11px]">
              <div className="flex items-center justify-between bg-slate-100 p-2 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Condition</span>
                  <span className="font-bold text-emerald-700">{property.accommodation.condition}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Building Size</span>
                  <span className="font-bold text-slate-800">{property.accommodation.buildingM2 || property.extentM2} m²</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Age</span>
                  <span className="font-bold text-slate-800">{property.accommodation.age ? `${property.accommodation.age} yrs` : 'Modern'}</span>
                </div>
              </div>

              {/* Room Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Bed</span>
                  <span className="font-bold text-slate-900 text-xs">{property.accommodation.bedRooms ?? '-'}</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Bath</span>
                  <span className="font-bold text-slate-900 text-xs">{property.accommodation.bathRooms ?? '-'}</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Garage</span>
                  <span className="font-bold text-slate-900 text-xs">{property.accommodation.garages ?? '-'}</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">P/Bay</span>
                  <span className="font-bold text-slate-900 text-xs">{property.accommodation.pBaysCPorts ?? '-'}</span>
                </div>
              </div>

              {/* Features Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {property.accommodation.pool && <span className="bg-cyan-50 text-cyan-900 border border-cyan-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">Pool</span>}
                {property.accommodation.garden && <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">Garden</span>}
                {property.accommodation.alarm && <span className="bg-indigo-50 text-indigo-900 border border-indigo-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">Alarm</span>}
                {property.accommodation.perimSecurity && <span className="bg-indigo-50 text-indigo-900 border border-indigo-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">Perim Security</span>}
                {property.accommodation.borehole && <span className="bg-blue-50 text-blue-900 border border-blue-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">Borehole</span>}
                {property.accommodation.sprinklerSys && <span className="bg-blue-50 text-blue-900 border border-blue-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">Sprinkler</span>}
              </div>

              {property.accommodation.specialFeatures && (
                <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-200">
                  "{property.accommodation.specialFeatures}"
                </p>
              )}

              <button
                id="btn-edit-accommodation"
                onClick={onOpenAccommodation}
                className="w-full mt-2 py-1.5 bg-[#006980] hover:bg-teal-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Accommodation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
