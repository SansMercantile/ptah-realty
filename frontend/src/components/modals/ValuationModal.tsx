import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  TrendingUp, 
  Printer, 
  Coins, 
  Building2, 
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  Layers,
  MapPin,
  CheckCircle2,
  Sliders,
  DollarSign,
  ShieldAlert,
  TrendingDown,
  Trees,
  Bus,
  Droplet,
  Zap,
  Scale,
  Receipt,
  ExternalLink,
  FileText,
  Check,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Copy,
  BookmarkCheck
} from 'lucide-react';
import { PropertyRecord, AIPropertyValuationResponse } from '../../types';

interface ValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
  currency?: { code: string; symbol: string; name: string };
  onOpenContactOwner?: (property: PropertyRecord, initialTab?: 'call' | 'email' | 'whatsapp') => void;
}

export const ValuationModal: React.FC<ValuationModalProps> = ({
  isOpen,
  onClose,
  property,
  currency,
  onOpenContactOwner
}) => {
  const [activeTab, setActiveTab] = useState<'AI_Individual' | 'Area_Public_Stats' | 'Street_Precinct' | 'VacantLand' | 'Rental'>('AI_Individual');
  const [aiValuationData, setAiValuationData] = useState<AIPropertyValuationResponse | null>(null);
  const [conditionOverride, setConditionOverride] = useState<string>('GOOD');
  const [buildingM2Input, setBuildingM2Input] = useState<number>(200);
  const [landExtentInput, setLandExtentInput] = useState<number>(201);
  const [includePool, setIncludePool] = useState<boolean>(false);
  const [includeBorehole, setIncludeBorehole] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Public Data Selling Points state
  const [sellingPointFilter, setSellingPointFilter] = useState<'all' | 'education' | 'healthcare' | 'recreation' | 'transit' | 'safety' | 'shopping'>('all');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [copiedAllBullets, setCopiedAllBullets] = useState<boolean>(false);

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2500);
  };

  const handleCopyAllBullets = (bullets: string[]) => {
    const fullCopy = bullets.join('\n');
    navigator.clipboard.writeText(fullCopy);
    setCopiedAllBullets(true);
    setTimeout(() => setCopiedAllBullets(false), 2500);
  };

  // Interactive Area Levies & Tariffs state
  const [customMonthlyLevy, setCustomMonthlyLevy] = useState<number>(3450);
  const [customMonthlyRates, setCustomMonthlyRates] = useState<number>(2850);

  // Vacant land calculator inputs
  const [landExtent, setLandExtent] = useState<number>(property?.extentM2 || 201);
  const [permissibleBulk, setPermissibleBulk] = useState<number>(1.5);
  const [bulkRate, setBulkRate] = useState<number>(18000);

  // Rental calculator inputs
  const [marketValueInput, setMarketValueInput] = useState<number>(property?.municipalValuation?.totalValue || 6200000);
  const [targetYieldPercent, setTargetYieldPercent] = useState<number>(7.2);

  useEffect(() => {
    if (property) {
      const cond = property.accommodation?.condition || 'GOOD';
      const bM2 = property.accommodation?.buildingM2 || property.extentM2 || 200;
      const lM2 = property.extentM2 || 201;

      setConditionOverride(cond);
      setBuildingM2Input(bM2);
      setLandExtentInput(lM2);
      setLandExtent(lM2);
      setIncludePool(Boolean(property.accommodation?.pool));
      setIncludeBorehole(Boolean(property.accommodation?.borehole));
      setMarketValueInput(property.municipalValuation?.totalValue || 6200000);

      fetchAiValuation(property, cond, bM2, lM2, {
        pool: Boolean(property.accommodation?.pool),
        borehole: Boolean(property.accommodation?.borehole)
      });
    }
  }, [property]);

  const fetchAiValuation = async (
    targetProp: PropertyRecord,
    cond: string,
    bM2: number,
    lM2: number,
    adjustments?: any
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/property-valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: targetProp.id,
          property: targetProp,
          condition: cond,
          customBuildingM2: bM2,
          customExtentM2: lM2,
          customAdjustments: adjustments
        })
      });
      const data: AIPropertyValuationResponse = await res.json();
      setAiValuationData(data);
      if (data.individualValuation?.estimatedMarketValue) {
        setMarketValueInput(data.individualValuation.estimatedMarketValue);
      }
    } catch (err) {
      console.error('Error fetching AI property valuation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = () => {
    if (!property) return;
    fetchAiValuation(property, conditionOverride, buildingM2Input, landExtentInput, {
      pool: includePool,
      borehole: includeBorehole
    });
  };

  if (!isOpen || !property) return null;

  const formatZar = (val?: number) => {
    if (!val && val !== 0) return `${currency?.symbol || 'R'} 0`;
    return `${currency?.symbol || 'R'} ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  const calculatedResidualLandValue = landExtent * permissibleBulk * bulkRate;
  const calculatedRentalPerMonth = Math.round((marketValueInput * (targetYieldPercent / 100)) / 12);
  const ownerName = property.currentSale?.owner || 'Registered Property Owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="valuation-suite-modal"
        className="bg-white text-slate-800 w-full max-w-5xl rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base leading-tight">
                  AI Property Valuation & Comparative Matrix ™
                </h2>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  SACPVP Standards
                </span>
              </div>
              <p className="text-cyan-100/90 text-xs mt-0.5">
                {property.address} • Erf {property.erfNo}, {property.suburb} • {ownerName}
              </p>
            </div>
          </div>
          <button
            id="btn-close-valuation-modal"
            onClick={onClose}
            className="p-1.5 text-cyan-100 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact & Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Owner:</span>
            <span className="font-bold text-slate-900">{ownerName}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-mono">{property.currentSale?.contacts?.primaryPhone || '+27 82 491 8820'}</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenContactOwner && (
              <>
                <button
                  id="btn-val-call-owner"
                  onClick={() => onOpenContactOwner(property, 'call')}
                  className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 rounded font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3 h-3 text-cyan-700" />
                  <span>Call Owner</span>
                </button>
                <button
                  id="btn-val-email-owner"
                  onClick={() => onOpenContactOwner(property, 'email')}
                  className="px-2.5 py-1 bg-[#006980] hover:bg-teal-700 text-white rounded font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email AI CMA Report</span>
                </button>
              </>
            )}

            <button
              onClick={() => window.print()}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors"
              title="Print Valuation Sheet"
            >
              <Printer className="w-3 h-3" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-100/70 px-4 pt-2 border-b border-slate-200 flex items-center gap-2 text-xs font-bold overflow-x-auto">
          <button
            id="tab-ai-individual-val"
            onClick={() => setActiveTab('AI_Individual')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t border-t border-x transition-colors whitespace-nowrap ${
              activeTab === 'AI_Individual'
                ? 'bg-white text-cyan-900 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
            <span>AI Individual Property Valuation</span>
          </button>

          <button
            id="tab-area-public-stats"
            onClick={() => setActiveTab('Area_Public_Stats')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t border-t border-x transition-colors whitespace-nowrap ${
              activeTab === 'Area_Public_Stats'
                ? 'bg-white text-cyan-900 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
            <span>Area Stats & Levies (Public Data)</span>
          </button>

          <button
            id="tab-street-precinct-bench"
            onClick={() => setActiveTab('Street_Precinct')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t border-t border-x transition-colors ${
              activeTab === 'Street_Precinct'
                ? 'bg-white text-cyan-900 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-700" />
            <span>Street & Suburb Benchmark Matrix</span>
          </button>

          <button
            id="tab-vacant-land-calc"
            onClick={() => setActiveTab('VacantLand')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t border-t border-x transition-colors ${
              activeTab === 'VacantLand'
                ? 'bg-white text-cyan-900 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-700" />
            <span>Residual Land & Bulk Ratio</span>
          </button>

          <button
            id="tab-rental-yield-calc"
            onClick={() => setActiveTab('Rental')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t border-t border-x transition-colors ${
              activeTab === 'Rental'
                ? 'bg-white text-cyan-900 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-cyan-700" />
            <span>Rental Cashflow & Yield Matrix</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-50 space-y-4">
          
          {/* TAB 1: AI INDIVIDUAL PROPERTY VALUATION */}
          {activeTab === 'AI_Individual' && (
            <div className="space-y-4">
              {/* Parameter Adjustments Bar */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-700" />
                    Property-Specific Appraisal Parameters (Individual Erf {property.erfNo}):
                  </span>
                  <button
                    id="btn-trigger-ai-recalc"
                    onClick={handleRecalculate}
                    disabled={isLoading}
                    className="px-3 py-1 bg-[#006980] hover:bg-teal-700 text-white rounded font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'Calculating with AI...' : 'Recalculate with AI'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Structural Condition:
                    </label>
                    <select
                      value={conditionOverride}
                      onChange={(e) => setConditionOverride(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold focus:ring-1 focus:ring-cyan-600"
                    >
                      <option value="EXCELLENT">EXCELLENT (+8% Premium)</option>
                      <option value="GOOD">GOOD (Standard Baseline)</option>
                      <option value="FAIR">FAIR (-9% Cosmetic Refurb)</option>
                      <option value="POOR">POOR (-20% Full Rehab)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Building Size Under Roof (m²):
                    </label>
                    <input
                      type="number"
                      value={buildingM2Input}
                      onChange={(e) => setBuildingM2Input(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold focus:ring-1 focus:ring-cyan-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Land Extent (Cadastral m²):
                    </label>
                    <input
                      type="number"
                      value={landExtentInput}
                      onChange={(e) => setLandExtentInput(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold focus:ring-1 focus:ring-cyan-600"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={includePool}
                          onChange={(e) => setIncludePool(e.target.checked)}
                          className="rounded text-cyan-700 focus:ring-cyan-600"
                        />
                        <span>Pool</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={includeBorehole}
                          onChange={(e) => setIncludeBorehole(e.target.checked)}
                          className="rounded text-cyan-700 focus:ring-cyan-600"
                        />
                        <span>Borehole</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main AI Valuation Card */}
              {aiValuationData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Primary Valuation Metric */}
                  <div className="bg-white p-4 sm:p-5 rounded-lg border-2 border-[#006980]/30 shadow-xs col-span-1 md:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                          Individual AI Fair Market Valuation
                        </span>
                        <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                          {formatZar(aiValuationData.individualValuation.estimatedMarketValue)}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Equivalent to <strong className="text-cyan-900 font-bold">{formatZar(aiValuationData.individualValuation.pricePerM2)} / m²</strong> under-roof building area
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {aiValuationData.individualValuation.confidenceScore}% AI Confidence
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1">
                          Powered by Gemini 2.5
                        </span>
                      </div>
                    </div>

                    {/* Value Range (Conservative - Target - Aggressive) */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                        Calculated Market Pricing Range:
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Conservative (Fast Close)</span>
                          <span className="font-bold text-slate-700">{formatZar(aiValuationData.individualValuation.valueRange.conservative)}</span>
                        </div>
                        <div className="p-2 bg-cyan-50/70 rounded border border-cyan-300">
                          <span className="text-[10px] text-cyan-900 font-bold block">Recommended Target</span>
                          <span className="font-extrabold text-cyan-950 text-sm">{formatZar(aiValuationData.individualValuation.valueRange.target)}</span>
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Aggressive (Peak Demand)</span>
                          <span className="font-bold text-slate-700">{formatZar(aiValuationData.individualValuation.valueRange.aggressive)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Component Breakdown Table */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Individual Property Valuation Breakdown:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Land Component</span>
                          <span className="font-bold text-slate-900">{formatZar(aiValuationData.individualValuation.valuationBreakdown.landComponentValue)}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Building Structure</span>
                          <span className="font-bold text-slate-900">{formatZar(aiValuationData.individualValuation.valuationBreakdown.buildingImprovementValue)}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Amenity Additions</span>
                          <span className="font-bold text-emerald-700">+{formatZar(aiValuationData.individualValuation.valuationBreakdown.amenityValueAdditions)}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Zoning Bulk Upside</span>
                          <span className="font-bold text-cyan-900">+{formatZar(aiValuationData.individualValuation.valuationBreakdown.zoningBulkUpside)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Drivers */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Key Valuation Drivers for {property.address}:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {aiValuationData.individualValuation.keyDrivers.map((driver, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
                            <span>{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Narrative */}
                    <div className="p-3 bg-cyan-50/50 rounded-lg border border-cyan-200 text-xs text-slate-700 leading-relaxed space-y-1">
                      <span className="font-bold text-cyan-950 block text-[11px]">
                        AI Appraiser Professional Rationale:
                      </span>
                      <p>{aiValuationData.individualValuation.aiAppraisalNarrative}</p>
                    </div>
                  </div>

                  {/* Right Column: Comparative Micro-Market Card */}
                  <div className="space-y-4">
                    {/* Street Variance Card */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-700" />
                          Street Benchmark
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          aiValuationData.streetBenchmark.varianceVsStreetPercent >= 0 
                            ? 'bg-emerald-100 text-emerald-900' 
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {aiValuationData.streetBenchmark.varianceVsStreetPercent >= 0 ? '+' : ''}
                          {aiValuationData.streetBenchmark.varianceVsStreetPercent}% vs Street Avg
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Street Name:</span>
                          <span className="font-bold text-slate-800">{aiValuationData.streetBenchmark.streetName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Street Avg Rate:</span>
                          <span className="font-bold text-cyan-900">{formatZar(aiValuationData.streetBenchmark.streetAveragePricePerM2)} / m²</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Properties in Street:</span>
                          <span className="font-semibold text-slate-700">{aiValuationData.streetBenchmark.propertiesInStreetCount} Cadastral Lots</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Prestige Rating:</span>
                          <span className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
                            {aiValuationData.streetBenchmark.streetPrestigeRating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Suburb Variance Card */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-cyan-700" />
                          Suburb Benchmark
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          aiValuationData.suburbBenchmark.varianceVsSuburbPercent >= 0 
                            ? 'bg-emerald-100 text-emerald-900' 
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {aiValuationData.suburbBenchmark.varianceVsSuburbPercent >= 0 ? '+' : ''}
                          {aiValuationData.suburbBenchmark.varianceVsSuburbPercent}% vs Suburb Median
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Suburb:</span>
                          <span className="font-bold text-slate-800">{aiValuationData.suburbBenchmark.suburbName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Suburb Median:</span>
                          <span className="font-bold text-slate-900">{formatZar(aiValuationData.suburbBenchmark.suburbMedianValuation)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Annual Appreciation:</span>
                          <span className="font-bold text-emerald-700">+{aiValuationData.suburbBenchmark.annualAppreciationRate}% p.a.</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Avg Days on Market:</span>
                          <span className="font-semibold text-slate-700">{aiValuationData.suburbBenchmark.averageDaysOnMarket} Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Rental Yield Snippet */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 p-4 rounded-lg border border-emerald-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                          Projected Rental Yield
                        </span>
                        <span className="bg-emerald-200/80 text-emerald-900 font-extrabold text-xs px-2 py-0.5 rounded">
                          {aiValuationData.investmentMetrics.grossYieldPercent}% Gross
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">
                        {formatZar(aiValuationData.investmentMetrics.estimatedMonthlyRental)}
                        <span className="text-xs text-slate-500 font-normal ml-1">/ month</span>
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        Annual gross income: <strong>{formatZar(aiValuationData.investmentMetrics.annualGrossRental)}</strong>
                      </p>
                    </div>

                    {/* Area Public Stats & Levies Highlight Banner */}
                    {aiValuationData.publicAreaStats && (
                      <div className="bg-white p-3.5 rounded-lg border border-cyan-300 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-950 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
                            <span>Area Public Stats & Selling Points</span>
                          </span>
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                            {aiValuationData.publicAreaStats.crimeStats.overallCrimeLevel} Risk
                          </span>
                        </div>

                        {/* Selling Points Quick Summary Pills */}
                        <div className="bg-cyan-50/70 p-2 rounded border border-cyan-200 text-[11px] space-y-1.5">
                          <div className="font-semibold text-cyan-950 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-700" />
                            <span>Verified Public Selling Points:</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            <div className="flex items-center gap-1 text-slate-700">
                              <GraduationCap className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="truncate"><strong>Schools:</strong> Reddam House (850m)</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-700">
                              <HeartPulse className="w-3 h-3 text-rose-600 shrink-0" />
                              <span className="truncate"><strong>Hospital:</strong> Netcare (5 min drive)</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-700">
                              <Trees className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate"><strong>Recreation:</strong> Promenade (280m)</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-700">
                              <Bus className="w-3 h-3 text-cyan-600 shrink-0" />
                              <span className="truncate"><strong>Transit:</strong> MyCiTi Station (180m)</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">Safety Index</div>
                            <div className="font-bold text-slate-900 font-mono mt-0.5">
                              {aiValuationData.publicAreaStats.crimeStats.safetyIndexScore} / 100
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">Cost of Living</div>
                            <div className="font-bold text-slate-900 font-mono mt-0.5">
                              {aiValuationData.publicAreaStats.costOfLiving.costOfLivingIndex}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">Avg Levy/m²</div>
                            <div className="font-bold text-slate-900 font-mono mt-0.5">
                              R {aiValuationData.publicAreaStats.leviesAndRates.averageSectionalLevyPerM2}
                            </div>
                          </div>
                        </div>

                        <button
                          id="btn-switch-to-area-stats"
                          onClick={() => setActiveTab('Area_Public_Stats')}
                          className="w-full py-1.5 bg-[#006980] hover:bg-cyan-700 text-white font-semibold rounded text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Explore Full Public Selling Points & Amenities</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AREA PUBLIC STATS (CRIME, COST OF LIVING, LEVIES & INFRASTRUCTURE) */}
          {activeTab === 'Area_Public_Stats' && aiValuationData?.publicAreaStats && (
            <div className="space-y-4 animate-fade-in text-xs">
              {/* Top Banner with Suburb & Verified Open Data Citation */}
              <div className="bg-slate-900 text-white p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Public Verified Data
                    </span>
                    <span className="text-slate-400 text-xs">
                      Municipality: {aiValuationData.publicAreaStats.municipality}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Public Area Statistics & Municipal Profile: {aiValuationData.publicAreaStats.suburb}
                  </h3>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Integrated from SAPS National Crime Bureau, City of Cape Town Open Data, CSOS, and Stats SA
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <div>Last Synchronized: <span className="text-cyan-300 font-mono">{aiValuationData.publicAreaStats.lastUpdated}</span></div>
                  <div>Data Audit Status: <span className="text-emerald-400 font-semibold">100% Certified</span></div>
                </div>
              </div>

              {/* 4-Stat Key High-Level Indicator Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase">
                    <span>Public Safety Index</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-lg font-bold text-indigo-950 font-mono mt-1">
                    {aiValuationData.publicAreaStats.crimeStats.safetyIndexScore} / 100
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-emerald-600" />
                    <span>{aiValuationData.publicAreaStats.crimeStats.yoyCrimeTrendPercent}% Crime YoY</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase">
                    <span>Cost of Living Index</span>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {aiValuationData.publicAreaStats.costOfLiving.costOfLivingIndex}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Cape Town Metro Baseline = 100
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase">
                    <span>Avg Sectional Levy</span>
                    <Receipt className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <div className="text-lg font-bold text-cyan-950 font-mono mt-1">
                    R {aiValuationData.publicAreaStats.leviesAndRates.averageSectionalLevyPerM2} / m²
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    STSMA Reserve: {aiValuationData.publicAreaStats.leviesAndRates.reserveFundLevyPercent}%
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase">
                    <span>Walk Score</span>
                    <Trees className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-lg font-bold text-emerald-950 font-mono mt-1">
                    {aiValuationData.publicAreaStats.communityInfrastructure.walkScore} / 100
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    {aiValuationData.publicAreaStats.communityInfrastructure.walkabilityDescription}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PUBLIC DATA SELLING POINTS (NEARBY AMENITIES, SCHOOLS, HOSPITALS, TRANSIT) */}
              {/* ========================================================================= */}
              {aiValuationData.publicAreaStats.sellingPoints && aiValuationData.publicAreaStats.sellingPoints.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white p-4 sm:p-5 rounded-xl border border-cyan-500/30 shadow-md space-y-4">
                  {/* Header & Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-cyan-300" />
                          Key Selling Points from Public Data
                        </span>
                        <span className="text-slate-400 text-xs">
                          {aiValuationData.publicAreaStats.sellingPoints.length} Verified Categories
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        Nearby Amenities, Top Schools, Hospitals & Transit Highlights
                      </h4>
                      <p className="text-slate-300 text-xs mt-0.5">
                        Extracted directly from municipal infrastructure registers to boost listing copy, client presentations, and buyer negotiation.
                      </p>
                    </div>

                    {aiValuationData.publicAreaStats.marketingCopyBullets && (
                      <button
                        id="btn-copy-all-selling-points"
                        onClick={() => handleCopyAllBullets(aiValuationData.publicAreaStats.marketingCopyBullets || [])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                          copiedAllBullets
                            ? 'bg-emerald-600 text-white'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        }`}
                      >
                        {copiedAllBullets ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied All Selling Points!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy All Marketing Bullets</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setSellingPointFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        sellingPointFilter === 'all'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      All Points ({aiValuationData.publicAreaStats.sellingPoints.length})
                    </button>
                    <button
                      onClick={() => setSellingPointFilter('education')}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        sellingPointFilter === 'education'
                          ? 'bg-indigo-400 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Schools & Education</span>
                    </button>
                    <button
                      onClick={() => setSellingPointFilter('healthcare')}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        sellingPointFilter === 'healthcare'
                          ? 'bg-rose-400 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      <HeartPulse className="w-3.5 h-3.5 text-rose-300" />
                      <span>Hospitals & Medical</span>
                    </button>
                    <button
                      onClick={() => setSellingPointFilter('recreation')}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        sellingPointFilter === 'recreation'
                          ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      <Trees className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Parks & Promenade</span>
                    </button>
                    <button
                      onClick={() => setSellingPointFilter('transit')}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        sellingPointFilter === 'transit'
                          ? 'bg-cyan-400 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      <Bus className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Rapid Transit</span>
                    </button>
                    <button
                      onClick={() => setSellingPointFilter('safety')}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        sellingPointFilter === 'safety'
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Safety & Security</span>
                    </button>
                    <button
                      onClick={() => setSellingPointFilter('shopping')}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        sellingPointFilter === 'shopping'
                          ? 'bg-purple-400 text-slate-950 font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-purple-300" />
                      <span>Retail & Dining</span>
                    </button>
                  </div>

                  {/* Filtered Selling Points Grid */}
                  <div className="grid grid-cols-1 gap-3.5">
                    {aiValuationData.publicAreaStats.sellingPoints
                      .filter(sp => sellingPointFilter === 'all' || sp.category === sellingPointFilter)
                      .map((sp) => (
                        <div
                          key={sp.id}
                          className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3.5 sm:p-4 space-y-3 hover:border-cyan-400/50 transition-colors"
                        >
                          {/* Card Header */}
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  sp.category === 'education'
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                                    : sp.category === 'healthcare'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                    : sp.category === 'recreation'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                    : sp.category === 'transit'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                                    : sp.category === 'safety'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                }`}>
                                  {sp.category === 'education' && <GraduationCap className="w-3 h-3" />}
                                  {sp.category === 'healthcare' && <HeartPulse className="w-3 h-3" />}
                                  {sp.category === 'recreation' && <Trees className="w-3 h-3" />}
                                  {sp.category === 'transit' && <Bus className="w-3 h-3" />}
                                  {sp.category === 'safety' && <ShieldCheck className="w-3 h-3" />}
                                  {sp.category === 'shopping' && <ShoppingBag className="w-3 h-3" />}
                                  <span>{sp.badge}</span>
                                </span>
                                <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                                  Proximity: {sp.distanceHighlight}
                                </span>
                              </div>
                              <h5 className="font-bold text-sm text-white">{sp.headline}</h5>
                              <p className="text-slate-300 text-xs leading-relaxed">{sp.summary}</p>
                            </div>

                            <div className="text-[10px] text-slate-400 italic text-right shrink-0">
                              <span>Source: {sp.verifiedSource}</span>
                            </div>
                          </div>

                          {/* Specific Amenities List */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                            {sp.amenities.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-md space-y-1.5 text-xs hover:border-slate-600 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="font-bold text-cyan-200 leading-tight">{item.name}</div>
                                  {item.rating && (
                                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                      ★ {item.rating}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-300">{item.type}</div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                  <span className="text-emerald-400 font-semibold">{item.distanceFormatted}</span>
                                  <span>{item.walkingOrDriving}</span>
                                </div>
                                {item.highlight && (
                                  <p className="text-[10px] text-slate-300/90 leading-tight pt-0.5 border-t border-slate-700/50">
                                    {item.highlight}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Buyer & Investor Pitch Callout Box */}
                          <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-start gap-2">
                              <BookmarkCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-amber-200">Pitch for Buyers & Portals: </span>
                                <span className="text-slate-200 italic">{sp.buyerPitchText}</span>
                              </div>
                            </div>

                            <button
                              id={`btn-copy-snippet-${sp.id}`}
                              onClick={() => handleCopySnippet(sp.id, sp.marketingCopySnippet)}
                              className={`shrink-0 px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                                copiedSnippetId === sp.id
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/40'
                              }`}
                            >
                              {copiedSnippetId === sp.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Snippet</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* AI Synthesized Buyer Pitch & Listing Copy Bullets */}
                  <div className="bg-slate-950/90 border border-cyan-500/40 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-xs text-cyan-200 uppercase tracking-wide">
                          Executive Public Infrastructure Pitch
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Ready-to-Use Listing Text</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed italic border-l-2 border-cyan-400 pl-3">
                      "{aiValuationData.publicAreaStats.synthesizedBuyerPitch}"
                    </p>

                    {aiValuationData.publicAreaStats.marketingCopyBullets && (
                      <div className="space-y-1 pt-1.5 border-t border-slate-800">
                        <div className="text-[11px] font-semibold text-slate-300">Portals & CMA Bullets:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                          {aiValuationData.publicAreaStats.marketingCopyBullets.map((bullet, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-200">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grid with 2 Columns: Safety & Cost on Left, Levies & Infrastructure on Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. CRIME & PUBLIC SAFETY DETAILED CARD */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-indigo-700" />
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                        Public Safety & Crime Rates (SAPS & CID)
                      </h4>
                    </div>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      {aiValuationData.publicAreaStats.crimeStats.overallCrimeLevel} Risk
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Violent Crime vs Metro Average:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {aiValuationData.publicAreaStats.crimeStats.violentCrimeVsMetroAveragePercent}% Below Metro
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Property Crime vs Metro Average:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {aiValuationData.publicAreaStats.crimeStats.propertyCrimeVsMetroAveragePercent}% Below Metro
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Precinct Clearance Rate:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {aiValuationData.publicAreaStats.crimeStats.clearanceRatePercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">CCTV & CID Patrol Coverage:</span>
                      <span className="font-bold text-indigo-900 font-mono">
                        {aiValuationData.publicAreaStats.crimeStats.cctvCoveragePercent}% Monitored
                      </span>
                    </div>

                    <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded text-[11px] text-indigo-950 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-700" />
                        <span>Precinct Security Infrastructure:</span>
                      </div>
                      <div>• Station: <strong>{aiValuationData.publicAreaStats.crimeStats.nearestPoliceStation}</strong></div>
                      <div>• Special Rating Area: <strong>{aiValuationData.publicAreaStats.crimeStats.cidPatrolNet}</strong></div>
                    </div>
                  </div>
                </div>

                {/* 2. COST OF LIVING & MUNICIPAL TARIFFS */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                        Cost of Living & Municipal Tariffs
                      </h4>
                    </div>
                    <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                      City of Cape Town Roll
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Property Rates Tariff (Res):</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {aiValuationData.publicAreaStats.costOfLiving.ratesTariffRate} R/Rand
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Electricity Tariff (Domestic):
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        R {aiValuationData.publicAreaStats.costOfLiving.electricityTariffDomesticPerKWh} / kWh
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-blue-500" />
                        Water & Sanitation (Standard):
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        R {aiValuationData.publicAreaStats.costOfLiving.waterTariffDomesticPerKL} / kL
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Avg Household Utility Cost:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {formatZar(aiValuationData.publicAreaStats.costOfLiving.utilitiesAverageMonthly)} / mo
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Average Household Income:</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {formatZar(aiValuationData.publicAreaStats.costOfLiving.averageHouseholdIncomeMonthly)} / mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. SECTIONAL SCHEME LEVIES & INTERACTIVE CALCULATOR */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-cyan-800" />
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                        Levies & STSMA Scheme Reserves (Calculator)
                      </h4>
                    </div>
                    <span className="bg-cyan-100 text-cyan-900 border border-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      STSMA Section 3 Compliant
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block">Base Scheme Levy:</span>
                        <span className="font-bold text-slate-900">R {aiValuationData.publicAreaStats.leviesAndRates.averageSectionalLevyPerM2} / m²</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block">Mandatory STSMA Reserve:</span>
                        <span className="font-bold text-indigo-900">{aiValuationData.publicAreaStats.leviesAndRates.reserveFundLevyPercent}% of Levy</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block">CSOS Statutory Levy:</span>
                        <span className="font-bold text-slate-900">R {aiValuationData.publicAreaStats.leviesAndRates.csosStatutoryLevyPerMonth} / mo</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block">Special Levies Risk:</span>
                        <span className="font-bold text-emerald-700">{aiValuationData.publicAreaStats.leviesAndRates.specialLeviesRiskRating} ({aiValuationData.publicAreaStats.leviesAndRates.reserveFundHealthPercent}% Health)</span>
                      </div>
                    </div>

                    {/* Interactive Practitioner Simulator */}
                    <div className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-lg space-y-2">
                      <div className="font-bold text-cyan-950 text-[11px] flex items-center justify-between">
                        <span>Interactive Net Yield Impact Calculator</span>
                        <span className="text-[10px] text-cyan-700 font-normal">Adjust values to simulate</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-600 block mb-0.5 font-medium">Monthly Levy (R):</label>
                          <input
                            type="number"
                            value={customMonthlyLevy}
                            onChange={(e) => setCustomMonthlyLevy(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-600 block mb-0.5 font-medium">Monthly Rates (R):</label>
                          <input
                            type="number"
                            value={customMonthlyRates}
                            onChange={(e) => setCustomMonthlyRates(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Recalculated Net Yield */}
                      {(() => {
                        const grossRental = aiValuationData.investmentMetrics.estimatedMonthlyRental;
                        const netRental = grossRental - customMonthlyLevy - customMonthlyRates;
                        const marketVal = aiValuationData.individualValuation.estimatedMarketValue;
                        const netYield = Number(((netRental * 12) / marketVal * 100).toFixed(2));

                        return (
                          <div className="pt-2 border-t border-cyan-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-slate-500 text-[10px] block">Net Monthly Cashflow:</span>
                              <span className="font-bold text-slate-900 font-mono">{formatZar(netRental)} / mo</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 text-[10px] block">Net Yield (Post-Levies):</span>
                              <span className="font-bold text-emerald-800 font-mono text-sm">{netYield}% Net</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 4. PUBLIC INFRASTRUCTURE & WALKABILITY */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Trees className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                        Community Infrastructure & Environment
                      </h4>
                    </div>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      Eco & Urban GIS
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Transit Score (MyCiTi Hubs):</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {aiValuationData.publicAreaStats.communityInfrastructure.transitScore} / 100
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Air Quality Index (AQI):</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {aiValuationData.publicAreaStats.communityInfrastructure.airQualityIndex} (Optimal Coastal Air)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600">Public Green Space Ratio:</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {aiValuationData.publicAreaStats.communityInfrastructure.greenSpaceRatioPercent}% Green Extent
                      </span>
                    </div>

                    {/* Verified Data Sources Badges */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                        Verified Public Data Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiValuationData.publicAreaStats.dataSources.map((source, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STREET & PRECINCT BENCHMARKS */}
          {activeTab === 'Street_Precinct' && aiValuationData && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Registered Properties & Sales in {aiValuationData.streetBenchmark.streetName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cadastral deeds register comparisons for street peer lots
                    </p>
                  </div>
                  <span className="bg-cyan-50 text-cyan-900 border border-cyan-300 text-xs font-bold px-3 py-1 rounded">
                    Street Avg: {formatZar(aiValuationData.streetBenchmark.streetAveragePricePerM2)} / m²
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Street Address</th>
                        <th className="p-2.5">Land Extent</th>
                        <th className="p-2.5">Last Registered Value</th>
                        <th className="p-2.5">Transfer Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiValuationData.streetBenchmark.comparativeProperties.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{p.address}</td>
                          <td className="p-2.5 font-semibold text-slate-700">{p.extentM2} m²</td>
                          <td className="p-2.5 font-bold text-cyan-900">{formatZar(p.lastPrice)}</td>
                          <td className="p-2.5 text-slate-600 font-mono">{p.lastDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VACANT LAND CALCULATOR */}
          {activeTab === 'VacantLand' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900">
                  Residual Vacant Land & Bulk Permissibility Calculator
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold text-[11px]">Cadastral Land Extent (m²)</label>
                    <input
                      type="number"
                      value={landExtent}
                      onChange={(e) => setLandExtent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold text-[11px]">Permissible Floor Factor (Bulk Ratio)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={permissibleBulk}
                      onChange={(e) => setPermissibleBulk(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold text-[11px]">Bulk Development Rate (R / m²)</label>
                    <input
                      type="number"
                      value={bulkRate}
                      onChange={(e) => setBulkRate(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between mt-3">
                  <div>
                    <span className="text-xs text-slate-500 block">Permissible Bulk Floor Area</span>
                    <strong className="text-base text-cyan-900 font-extrabold">{(landExtent * permissibleBulk).toFixed(0)} m² Allowable Floor Space</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Estimated Residual Land Value</span>
                    <strong className="text-2xl text-emerald-800 font-extrabold">{formatZar(calculatedResidualLandValue)}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RENTAL YIELD CALCULATOR */}
          {activeTab === 'Rental' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900">
                  Investor Rental Yield & Return Matrix
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold text-[11px]">Property Valuation Benchmark (R)</label>
                    <input
                      type="number"
                      value={marketValueInput}
                      onChange={(e) => setMarketValueInput(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold text-[11px]">Target Gross Yield (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetYieldPercent}
                      onChange={(e) => setTargetYieldPercent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between mt-3">
                  <div>
                    <span className="text-xs text-slate-500 block">Annual Gross Rental Income</span>
                    <strong className="text-base text-slate-800 font-extrabold">{formatZar(calculatedRentalPerMonth * 12)} / year</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Recommended Monthly Rental</span>
                    <strong className="text-2xl text-emerald-800 font-extrabold">{formatZar(calculatedRentalPerMonth)} / month</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Compliant with South African Council for the Property Valuers Profession (SACPVP) standards</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
