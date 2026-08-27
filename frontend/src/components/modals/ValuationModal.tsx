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
  DollarSign
} from 'lucide-react';
import { PropertyRecord, AIPropertyValuationResponse } from '../../types';
import { getIndividualValuation } from '../../services/api';

interface ValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
  onOpenContactOwner?: (property: PropertyRecord, initialTab?: 'call' | 'email' | 'whatsapp') => void;
}

export const ValuationModal: React.FC<ValuationModalProps> = ({
  isOpen,
  onClose,
  property,
  onOpenContactOwner
}) => {
  const [activeTab, setActiveTab] = useState<'AI_Individual' | 'Street_Precinct' | 'VacantLand' | 'Rental'>('AI_Individual');
  const [aiValuationData, setAiValuationData] = useState<AIPropertyValuationResponse | null>(null);
  const [conditionOverride, setConditionOverride] = useState<string>('GOOD');
  const [buildingM2Input, setBuildingM2Input] = useState<number>(200);
  const [landExtentInput, setLandExtentInput] = useState<number>(201);
  const [includePool, setIncludePool] = useState<boolean>(false);
  const [includeBorehole, setIncludeBorehole] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

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
      const data: AIPropertyValuationResponse = await getIndividualValuation(
        targetProp,
        cond,
        bM2,
        lM2,
        adjustments
      );
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
    if (!val && val !== 0) return 'R 0';
    return `R ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
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
        <div className="bg-slate-100/70 px-4 pt-2 border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          <button
            id="tab-ai-individual-val"
            onClick={() => setActiveTab('AI_Individual')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t border-t border-x transition-colors ${
              activeTab === 'AI_Individual'
                ? 'bg-white text-cyan-900 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
            <span>AI Individual Property Valuation</span>
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
                  </div>
                </div>
              )}
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
