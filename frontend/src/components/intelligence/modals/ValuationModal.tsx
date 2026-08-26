import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  TrendingUp, 
  Printer, 
  CheckCircle2, 
  Coins, 
  Building2, 
  Percent,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PropertyRecord } from '../../types';

interface ValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
}

export const ValuationModal: React.FC<ValuationModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const [activeTab, setActiveTab] = useState<'CMA' | 'VacantLand' | 'Rental'>('CMA');
  const [valuationData, setValuationData] = useState<any>(null);
  const [conditionOverride, setConditionOverride] = useState<string>('GOOD');
  const [isLoading, setIsLoading] = useState(false);

  // Vacant land calculator inputs
  const [landExtent, setLandExtent] = useState<number>(property?.extentM2 || 201);
  const [permissibleBulk, setPermissibleBulk] = useState<number>(1.5);
  const [bulkRate, setBulkRate] = useState<number>(18000);

  // Rental calculator inputs
  const [marketValueInput, setMarketValueInput] = useState<number>(property?.municipalValuation.totalValue || 6200000);
  const [targetYieldPercent, setTargetYieldPercent] = useState<number>(7.2);

  useEffect(() => {
    if (property) {
      setConditionOverride(property.accommodation.condition || 'GOOD');
      setLandExtent(property.extentM2);
      setMarketValueInput(property.municipalValuation.totalValue);
      fetchCmaValuation(property.id, property.accommodation.condition || 'GOOD');
    }
  }, [property]);

  const fetchCmaValuation = async (propId: string, condition: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/valuations/cma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: propId, condition })
      });
      const data = await res.json();
      setValuationData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  const formatZar = (val?: number) => {
    if (!val) return 'R 0';
    return `R ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  const calculatedResidualLandValue = landExtent * permissibleBulk * bulkRate;
  const calculatedRentalPerMonth = Math.round((marketValueInput * (targetYieldPercent / 100)) / 12);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="valuation-suite-modal"
        className="bg-white text-slate-800 w-full max-w-5xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-200" />
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                CMA Valuation Suite & Yield Calculation
              </h2>
              <span className="text-[10px] text-cyan-100 block">
                {property.address} • Erf {property.erfNo}, {property.suburb}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-100 hover:text-white hover:bg-teal-700/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-50 px-3.5 py-1.5 border-b border-slate-200 flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CMA')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === 'CMA' ? 'bg-[#006980] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            CMA Valuation Model ™
          </button>

          <button
            onClick={() => setActiveTab('VacantLand')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === 'VacantLand' ? 'bg-[#006980] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            Vacant Land Value Calculator
          </button>

          <button
            onClick={() => setActiveTab('Rental')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === 'Rental' ? 'bg-[#006980] text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            Rental Yield Calculation
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3">
          {/* TAB 1: CMA VALUATION MODEL */}
          {activeTab === 'CMA' && (
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Condition Rating Adjustment:</span>
                  <select
                    value={conditionOverride}
                    onChange={(e) => {
                      setConditionOverride(e.target.value);
                      fetchCmaValuation(property.id, e.target.value);
                    }}
                    className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="EXCELLENT">EXCELLENT (+15% Premia)</option>
                    <option value="GOOD">GOOD (+5% Vicinity Baseline)</option>
                    <option value="FAIR">FAIR (-8% Renovation Cost)</option>
                    <option value="POOR">POOR (-22% Distressed Discount)</option>
                  </select>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-cyan-900 border border-slate-300 rounded font-semibold flex items-center gap-1.5 transition-colors shadow-2xs text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Print Formal CMA Certificate</span>
                </button>
              </div>

              {/* Valuation Dashboard */}
              {valuationData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Central Estimate */}
                  <div className="bg-white p-4 rounded border border-cyan-400 shadow-2xs col-span-1 md:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
                          Estimated Market Value (CMA Index)
                        </span>
                        <span className="text-[10px] bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded border border-cyan-200 font-bold">
                          {valuationData.confidenceScore} Confidence
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900">
                        {formatZar(valuationData.estimatedMarketValue)}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Statistical Lower Boundary</span>
                          <span className="font-bold text-slate-700">{formatZar(valuationData.valueRange.lowerBound)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Statistical Upper Boundary</span>
                          <span className="font-bold text-slate-700">{formatZar(valuationData.valueRange.upperBound)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                      Calculated using {valuationData.comparableSalesUsed} registered deeds transfers in {property.suburb} adjusted for erf extent ({property.extentM2} m²) and zoning ({property.zoning}).
                    </div>
                  </div>

                  {/* Monthly Rental & Yield Card */}
                  <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
                        Estimated Rental Yield
                      </span>
                      <h4 className="text-xl font-bold text-slate-900">
                        {formatZar(valuationData.estimatedRentalMonthly)}
                        <span className="text-xs text-slate-500 font-normal ml-1">/ month</span>
                      </h4>
                      <div className="mt-2.5 text-xs">
                        <span className="text-slate-500 block text-[10px]">Gross Annualized Yield</span>
                        <span className="font-bold text-emerald-700 text-sm">{valuationData.grossYield}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-2.5 border-t border-slate-100">
                      Municipal valuation: {formatZar(property.municipalValuation.totalValue)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VACANT LAND CALCULATOR */}
          {activeTab === 'VacantLand' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-xs text-slate-800">
                  Residual Vacant Land & Bulk Permissibility Calculator
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Cadastral Land Extent (m²)</label>
                    <input
                      type="number"
                      value={landExtent}
                      onChange={(e) => setLandExtent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Permissible Floor Factor (Bulk Ratio)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={permissibleBulk}
                      onChange={(e) => setPermissibleBulk(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Bulk Development Rate (R / m²)</label>
                    <input
                      type="number"
                      value={bulkRate}
                      onChange={(e) => setBulkRate(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Permissible Bulk Floor Area</span>
                    <strong className="text-sm text-cyan-900 font-bold">{(landExtent * permissibleBulk).toFixed(0)} m² Floor Area</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Estimated Residual Land Value</span>
                    <strong className="text-xl text-emerald-800 font-bold">{formatZar(calculatedResidualLandValue)}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RENTAL YIELD CALCULATOR */}
          {activeTab === 'Rental' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-xs text-slate-800">
                  Investor Rental Yield & Return Matrix
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Property Purchase / Market Value (R)</label>
                    <input
                      type="number"
                      value={marketValueInput}
                      onChange={(e) => setMarketValueInput(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Target Gross Yield (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetYieldPercent}
                      onChange={(e) => setTargetYieldPercent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Annual Gross Rental Income</span>
                    <strong className="text-sm text-slate-800 font-bold">{formatZar(calculatedRentalPerMonth * 12)} / year</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Recommended Monthly Rental</span>
                    <strong className="text-xl text-emerald-800 font-bold">{formatZar(calculatedRentalPerMonth)} / month</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Compliant with South African Council for the Property Valuers Profession (SACPVP) standards</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
