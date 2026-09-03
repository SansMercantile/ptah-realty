import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Home, 
  Phone, 
  Mail,
  MessageSquare,
  FileText, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Sparkles,
  Edit3,
  RefreshCw,
  MapPin,
  ShieldCheck,
  Building2,
  DollarSign,
  Zap
} from 'lucide-react';
import { PropertyRecord, AIPropertyValuationResponse, OwnerContactDetails } from '../types';
import { getIndividualValuation } from '../services/api';

interface PropertyPanelProps {
  property: PropertyRecord | null;
  onClose?: () => void;
  onOpenQuickListing?: () => void;
  onOpenAccommodation: () => void;
  onOpenSectionalUnits?: (property: PropertyRecord) => void;
  onOpenKYCForOwner: (ownerName: string, ownerId: string) => void;
  onOpenValuation: () => void;
  onOpenCMAEngine?: () => void;
  onOpenMediaManagement?: () => void;
  onOpenPDFReport?: () => void;
  onOpenPortalSync?: () => void;
  onOpenContactOwner?: (property: PropertyRecord, initialTab?: 'call' | 'email' | 'whatsapp') => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  property,
  onClose,
  onOpenQuickListing,
  onOpenAccommodation,
  onOpenSectionalUnits,
  onOpenKYCForOwner,
  onOpenValuation,
  onOpenCMAEngine,
  onOpenMediaManagement,
  onOpenPDFReport,
  onOpenPortalSync,
  onOpenContactOwner
}) => {
  const [showFullId, setShowFullId] = useState(false);
  const [openSections, setOpenSections] = useState({
    aiValuation: true,
    ownerContacts: true,
    propertyInfo: true,
    saleInfo: true,
    municipalValuation: true,
    servitudes: false,
    accommodation: true,
    renovations: false
  });

  // State for AI-driven individual property valuation
  const [aiValuation, setAiValuation] = useState<AIPropertyValuationResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (property) {
      fetchIndividualPropertyValuation(property);
    }
  }, [property?.id]);

  const fetchIndividualPropertyValuation = async (targetProp: PropertyRecord) => {
    setIsAiLoading(true);
    try {
      const data = await getIndividualValuation(
        targetProp,
        targetProp.accommodation?.condition || 'GOOD',
        targetProp.accommodation?.buildingM2 || targetProp.extentM2,
        targetProp.extentM2,
        {
          pool: Boolean(targetProp.accommodation?.pool),
          borehole: Boolean(targetProp.accommodation?.borehole)
        }
      );
      setAiValuation(data);
    } catch (err) {
      console.error('Error loading AI valuation for property:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

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

  // Jurisdiction-aware currency symbol: detects the property's country
  // from its deedsOffice/province fields (set per-city in
  // jurisdictionsData.ts) so switching jurisdiction in the header/Settings
  // shows £/$/A$/AED, not a hardcoded Rand, once that city's demo
  // properties are on screen.
  const formatZar = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '-';
    let symbol = 'R ';
    if (property?.deedsOffice?.includes('UK') || property?.province?.includes('ENGLAND') || property?.province?.includes('LONDON')) {
      symbol = '£';
    } else if (property?.deedsOffice?.includes('MIAMI') || property?.deedsOffice?.includes('LOS ANGELES') || property?.province?.includes('FLORIDA') || property?.province?.includes('CALIFORNIA') || property?.province?.includes('NEW YORK')) {
      symbol = '$';
    } else if (property?.deedsOffice?.includes('NSW') || property?.deedsOffice?.includes('SYDNEY') || property?.province?.includes('NEW SOUTH WALES')) {
      symbol = 'A$';
    } else if (property?.deedsOffice?.includes('DUBAI') || property?.deedsOffice?.includes('DLD') || property?.province?.includes('DUBAI')) {
      symbol = 'AED ';
    }
    if (amount === 0) return `${symbol}0`;
    return `${symbol}${amount.toLocaleString('en-US')}`;
  };

  const formatMaskedId = (idString: string) => {
    if (showFullId) return idString;
    if (idString.length > 6) {
      return idString.substring(0, 6) + '*******';
    }
    return idString;
  };

  // Contacts resolution
  const contacts: OwnerContactDetails = property.contacts || property.currentSale?.contacts || {
    primaryPhone: '+27 82 491 8820',
    secondaryPhone: '+27 21 434 2200',
    email: 'owner@deedsregistry.co.za',
    representativeName: property.currentSale?.owner || 'Registered Property Owner',
    postalAddress: `${property.address}, ${property.suburb}`,
    preferredChannel: 'PHONE',
    verifiedStatus: 'VERIFIED'
  };

  const streetName = property.address.replace(/^\d+[\s\w-]*\s+/, '').trim() || 'Richmond Road';

  return (
    <aside 
      id="property-title-panel"
      className="w-80 sm:w-96 lg:w-[410px] bg-slate-50 text-slate-800 border-l border-slate-300 flex flex-col h-full overflow-y-auto select-text shadow-md z-20 shrink-0"
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
            Street: {streetName}
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

        {/* Quick Listing Creator Direct Action Banner */}
        {onOpenQuickListing && (
          <button
            id="btn-panel-quick-listing"
            onClick={onOpenQuickListing}
            className="w-full py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-lg text-xs flex items-center justify-between transition-all shadow-xs ring-1 ring-emerald-400/40 group"
            title="Quick Listing Creator: Streamlines mandate creation with auto-filled property details, asking price, commission rate, and 1-click syndication"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
              <span>Quick Listing Creator</span>
            </span>
            <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded text-emerald-200 font-mono">
              1-Click Syndicate
            </span>
          </button>
        )}

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

        {/* SECTION A: AI INDIVIDUAL PROPERTY VALUATION */}
        <div>
          <button
            id="accordion-ai-valuation"
            onClick={() => toggleSection('aiValuation')}
            className="w-full px-3 py-1.5 bg-gradient-to-r from-cyan-900 to-[#006980] hover:from-cyan-950 hover:to-teal-800 flex items-center justify-between font-bold text-white transition-colors text-left shadow-2xs"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>AI Individual Property Valuation</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan-400/20 text-cyan-100 border border-cyan-300/40 px-1.5 py-0.2 rounded font-semibold">
                Per Property
              </span>
              {openSections.aiValuation ? <ChevronUp className="w-3.5 h-3.5 text-white" /> : <ChevronDown className="w-3.5 h-3.5 text-white" />}
            </div>
          </button>

          {openSections.aiValuation && (
            <div className="p-3 bg-white space-y-2.5 text-[11px]">
              {isAiLoading && !aiValuation ? (
                <div className="p-4 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-cyan-700 animate-spin mx-auto" />
                  <p className="text-slate-600 font-semibold text-xs">Computing AI valuation for {property.address}...</p>
                </div>
              ) : aiValuation ? (
                <>
                  {/* Valuation Top Banner */}
                  <div className="p-3 bg-gradient-to-br from-cyan-50 to-slate-50 rounded-lg border border-cyan-200 space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-900 tracking-wider block">
                          AI Fair Market Valuation
                        </span>
                        <div className="text-2xl font-extrabold text-slate-900">
                          {formatZar(aiValuation.individualValuation.estimatedMarketValue)}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          Rate: <strong className="text-cyan-950">{formatZar(aiValuation.individualValuation.pricePerM2)} / m²</strong> under-roof
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                          {aiValuation.individualValuation.confidenceScore}% Confidence
                        </span>
                        <span className="block text-[9px] text-slate-400 mt-1">
                          Erf {property.erfNo} Specific
                        </span>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-cyan-100 text-center text-[10px]">
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-slate-500 block">Conservative</span>
                        <span className="font-bold text-slate-700">{formatZar(aiValuation.individualValuation.valueRange.conservative)}</span>
                      </div>
                      <div className="bg-cyan-100/60 p-1 rounded border border-cyan-300">
                        <span className="text-cyan-900 font-bold block">Target</span>
                        <span className="font-extrabold text-cyan-950">{formatZar(aiValuation.individualValuation.valueRange.target)}</span>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-slate-500 block">Aggressive</span>
                        <span className="font-bold text-slate-700">{formatZar(aiValuation.individualValuation.valueRange.aggressive)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro-Market & Street Comparison -- streetBenchmark/suburbBenchmark
                      aren't computed by the backend yet (property-valuation always
                      returns null for both), so each falls back to a placeholder
                      instead of crashing. */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {aiValuation.streetBenchmark ? (
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 text-[10px] block font-semibold">Street Baseline ({streetName})</span>
                        <div className="font-bold text-slate-800 text-xs">
                          {formatZar(aiValuation.streetBenchmark.streetAveragePricePerM2)} / m²
                        </div>
                        <span className={`text-[10px] font-bold ${aiValuation.streetBenchmark.varianceVsStreetPercent >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {aiValuation.streetBenchmark.varianceVsStreetPercent >= 0 ? '+' : ''}
                          {aiValuation.streetBenchmark.varianceVsStreetPercent}% vs Street Avg
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50 rounded border border-dashed border-slate-300 flex items-center justify-center">
                        <span className="text-slate-400 text-[10px]">Street baseline unavailable</span>
                      </div>
                    )}

                    {aiValuation.suburbBenchmark ? (
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 text-[10px] block font-semibold">Suburb Median ({property.suburb})</span>
                        <div className="font-bold text-slate-800 text-xs">
                          {formatZar(aiValuation.suburbBenchmark.suburbMedianValuation)}
                        </div>
                        <span className={`text-[10px] font-bold ${aiValuation.suburbBenchmark.varianceVsSuburbPercent >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {aiValuation.suburbBenchmark.varianceVsSuburbPercent >= 0 ? '+' : ''}
                          {aiValuation.suburbBenchmark.varianceVsSuburbPercent}% vs Suburb Median
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50 rounded border border-dashed border-slate-300 flex items-center justify-center">
                        <span className="text-slate-400 text-[10px]">Suburb median unavailable</span>
                      </div>
                    )}
                  </div>

                  {/* Key Valuation Drivers */}
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-700 block">
                      AI Property Drivers:
                    </span>
                    <ul className="space-y-1 text-[10px] text-slate-600">
                      {aiValuation.individualValuation.keyDrivers.slice(0, 3).map((driver, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-700 shrink-0 mt-0.5" />
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      id="btn-panel-open-full-cma"
                      onClick={onOpenValuation}
                      className="flex-1 py-1.5 px-2.5 bg-[#006980] hover:bg-teal-700 text-white rounded font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Open Full Valuation Matrix</span>
                    </button>
                    <button
                      id="btn-panel-recalc-ai"
                      onClick={() => fetchIndividualPropertyValuation(property)}
                      disabled={isAiLoading}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded transition-colors"
                      title="Recalculate AI Valuation"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* SECTION B: OWNER CONTACTS & DIRECT OUTREACH */}
        <div>
          <button
            id="accordion-owner-contacts"
            onClick={() => toggleSection('ownerContacts')}
            className="w-full px-3 py-1.5 bg-slate-200 hover:bg-slate-300 flex items-center justify-between font-bold text-slate-800 transition-colors text-left"
          >
            <span className="flex items-center gap-1.5 text-cyan-900">
              <Phone className="w-3.5 h-3.5 text-cyan-700" />
              <span>Owner Contacts & Outreach</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                Direct Options
              </span>
              {openSections.ownerContacts ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
            </div>
          </button>

          {openSections.ownerContacts && (
            <div className="p-3 bg-white space-y-3 text-[11px]">
              {/* Owner Card */}
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Registered Owner</span>
                  {property.isEstimated ? (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                      Estimated -- Not Verified
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                      Verified Deeds Contact
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {property.currentSale.owner}
                </div>
                {contacts.representativeName && contacts.representativeName !== property.currentSale.owner && (
                  <div className="text-[10px] text-slate-600">
                    Contact Rep: <strong className="text-slate-800">{contacts.representativeName}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons: Call, Email, WhatsApp */}
              <div className="grid grid-cols-3 gap-1.5">
                {/* CALL BUTTON */}
                <button
                  id="btn-contact-call-action"
                  onClick={() => onOpenContactOwner ? onOpenContactOwner(property, 'call') : window.open(`tel:${contacts.primaryPhone}`)}
                  className="py-2 px-2 bg-[#006980] hover:bg-teal-700 text-white rounded font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>

                {/* EMAIL BUTTON */}
                <button
                  id="btn-contact-email-action"
                  onClick={() => onOpenContactOwner ? onOpenContactOwner(property, 'email') : window.open(`mailto:${contacts.email}`)}
                  className="py-2 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>

                {/* WHATSAPP BUTTON */}
                <button
                  id="btn-contact-wa-action"
                  onClick={() => onOpenContactOwner ? onOpenContactOwner(property, 'whatsapp') : null}
                  className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Number and Email text lines */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium text-slate-500">Phone:</span>
                  <a href={`tel:${contacts.primaryPhone}`} className="font-mono text-cyan-900 font-bold hover:underline">
                    {contacts.primaryPhone}
                  </a>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium text-slate-500">Email:</span>
                  <a href={`mailto:${contacts.email}`} className="font-mono text-cyan-900 font-bold hover:underline truncate max-w-[200px]">
                    {contacts.email}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

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
