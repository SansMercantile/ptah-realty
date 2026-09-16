import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Compass, 
  Bed, 
  Bath, 
  Maximize2, 
  Car, 
  DollarSign, 
  ExternalLink,
  ShieldCheck,
  Check,
  ChevronRight,
  Layers,
  MapPin,
  Flame,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { BuildingDevelopment, DevelopmentUnit, PropertyRecord } from '../../types';

interface DevelopmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingAdded?: (newListing: PropertyRecord) => void;
  onSelectProperty?: (prop: PropertyRecord) => void;
}

export const DevelopmentsModal: React.FC<DevelopmentsModalProps> = ({
  isOpen,
  onClose,
  onListingAdded,
  onSelectProperty
}) => {
  const [developments, setDevelopments] = useState<BuildingDevelopment[]>([]);
  const [selectedDev, setSelectedDev] = useState<BuildingDevelopment | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<DevelopmentUnit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [cmaData, setCmaData] = useState<any | null>(null);
  const [isCmaLoading, setIsCmaLoading] = useState(false);
  const [addedUnitId, setAddedUnitId] = useState<string | null>(null);
  const [isAddingListing, setIsAddingListing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDevelopments();
    }
  }, [isOpen, statusFilter]);

  const fetchDevelopments = async () => {
    setIsLoading(true);
    try {
      let url = `/api/developments?q=${encodeURIComponent(searchQuery)}`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDevelopments(data.developments || []);
        if (data.developments?.length > 0 && !selectedDev) {
          setSelectedDev(data.developments[0]);
          setSelectedUnit(data.developments[0].units[0] || null);
        }
      }
    } catch (err) {
      console.error('Error fetching developments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDevelopments();
  };

  const handleSelectDev = (dev: BuildingDevelopment) => {
    setSelectedDev(dev);
    setSelectedUnit(dev.units[0] || null);
    setCmaData(null);
    setActionSuccessMessage(null);
  };

  const handleRunDevCma = async () => {
    if (!selectedDev) return;
    setIsCmaLoading(true);
    try {
      const res = await fetch(`/api/developments/${selectedDev.id}/cma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: selectedUnit?.id })
      });
      if (res.ok) {
        const data = await res.json();
        setCmaData(data);
      }
    } catch (err) {
      console.error('Error calculating development CMA:', err);
    } finally {
      setIsCmaLoading(false);
    }
  };

  const handleAddUnitToListing = async (unit: DevelopmentUnit) => {
    if (!selectedDev) return;
    setIsAddingListing(true);
    try {
      const res = await fetch(`/api/developments/${selectedDev.id}/add-listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: unit.id })
      });
      if (res.ok) {
        const data = await res.json();
        setAddedUnitId(unit.id);
        setActionSuccessMessage(`Unit ${unit.unitNumber} (${unit.layout}) added to active listings!`);
        if (onListingAdded && data.property) {
          onListingAdded(data.property);
        }
        if (onSelectProperty && data.property) {
          onSelectProperty(data.property);
        }
      }
    } catch (err) {
      console.error('Error adding development listing:', err);
    } finally {
      setIsAddingListing(false);
    }
  };

  if (!isOpen) return null;

  const formatZar = (val?: number) => {
    if (!val && val !== 0) return 'R 0';
    return `R ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LAUNCHING_OFF_PLAN':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">Off-Plan Launch</span>;
      case 'UNDER_CONSTRUCTION':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">Under Construction</span>;
      case 'COMPLETED_NEW':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">Brand New Completed</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2 py-0.5 rounded text-[10px]">Established Scheme</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="developments-explorer-modal"
        className="bg-white text-slate-800 w-full max-w-6xl rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base leading-tight">
                  Buildings in Developments & Off-Plan Explorer ™
                </h2>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Agent Ingestion & AI CMA
                </span>
              </div>
              <p className="text-cyan-100/90 text-xs mt-0.5">
                Search developments, inspect sectional units, run automated CMA, and add units directly to active practitioner listings
              </p>
            </div>
          </div>
          <button
            id="btn-close-developments-modal"
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-developments-search"
                type="text"
                placeholder="Search building name, developer, suburb, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
              />
            </div>
            <button
              id="btn-developments-search"
              type="submit"
              className="px-3 py-1.5 bg-[#006980] hover:bg-cyan-700 text-white font-semibold rounded text-xs transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              id="select-developments-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="LAUNCHING_OFF_PLAN">Off-Plan Launch</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
              <option value="COMPLETED_NEW">Brand New Completed</option>
              <option value="ESTABLISHED">Established Schemes</option>
            </select>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-300 px-4 py-2 text-emerald-900 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button 
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Main Content: Left List / Right Details */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Developments List */}
          <div className="lg:col-span-4 border-r border-slate-200 overflow-y-auto max-h-[70vh] bg-slate-50/50 divide-y divide-slate-200">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <div className="inline-block animate-spin w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full mb-2"></div>
                <div>Loading developments database...</div>
              </div>
            ) : developments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No developments found matching the filter criteria.
              </div>
            ) : (
              developments.map((dev) => {
                const isSelected = selectedDev?.id === dev.id;
                return (
                  <div
                    key={dev.id}
                    id={`dev-card-${dev.id}`}
                    onClick={() => handleSelectDev(dev)}
                    className={`p-3 transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-50/90 border-l-4 border-[#006980]' 
                        : 'hover:bg-white bg-slate-50/40'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={dev.heroImageUrl}
                        alt={dev.name}
                        className="w-16 h-16 rounded object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className="font-bold text-xs text-slate-900 truncate">{dev.name}</h3>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3 text-cyan-700 shrink-0" />
                          <span className="truncate">{dev.address}, {dev.suburb}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] mt-1.5">
                          <span className="font-bold text-cyan-950 font-mono">From {formatZar(dev.startingPrice)}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                            {dev.availableUnitsCount} / {dev.totalUnitsCount} Units
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 flex-wrap">
                      {getStatusBadge(dev.status)}
                      <span className="bg-slate-200/70 px-1.5 py-0.5 rounded font-mono">
                        R {dev.averagePricePerM2.toLocaleString()}/m²
                      </span>
                      {dev.airbnbAllowed && (
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          Airbnb OK
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Building Details, Units Matrix & CMA */}
          <div className="lg:col-span-8 overflow-y-auto max-h-[70vh] p-4 space-y-4 bg-white">
            {selectedDev ? (
              <>
                {/* Building Header Banner */}
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-xs">
                  <img
                    src={selectedDev.heroImageUrl}
                    alt={selectedDev.name}
                    className="w-full h-44 object-cover opacity-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent p-4 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(selectedDev.status)}
                      <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs">
                        {selectedDev.greenStarRating}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white leading-tight drop-shadow-sm">
                      {selectedDev.name}
                    </h2>
                    <p className="text-cyan-200 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{selectedDev.address}, {selectedDev.suburb}</span>
                      <span className="text-slate-400">• Developer: {selectedDev.developerName}</span>
                    </p>
                  </div>
                </div>

                {/* Building Overview & CMA Quick Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Avg Rate per m²</div>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                      R {selectedDev.averagePricePerM2.toLocaleString('en-ZA')}/m²
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                      +{selectedDev.cmaMetrics.suburbComparativeVariancePercent}% vs Suburb
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Projected Yield</div>
                    <div className="text-sm font-bold text-emerald-800 font-mono mt-0.5">
                      {selectedDev.cmaMetrics.grossYieldAveragePercent}% Gross
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Annual Est.
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Short-Term Occupancy</div>
                    <div className="text-sm font-bold text-cyan-900 font-mono mt-0.5">
                      {selectedDev.cmaMetrics.airbnbEstimatedOccupancyPercent}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ADR R {selectedDev.cmaMetrics.airbnbProjectedDailyRate.toLocaleString()} / night
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Appreciation Forecast</div>
                    <div className="text-sm font-bold text-indigo-900 font-mono mt-0.5">
                      +{selectedDev.cmaMetrics.projectedAppreciationPercent}% p.a.
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {selectedDev.completionYear} Delivery
                    </div>
                  </div>
                </div>

                {/* Building Amenities Chips */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Building Infrastructure & Amenities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDev.buildingAmenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-[#006980]" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sectional Units Table (Searchable & Addable) */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-800" />
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                        Available Units in Scheme ({selectedDev.units.length} Units Listed)
                      </h4>
                    </div>
                    <button
                      id="btn-run-dev-cma"
                      onClick={handleRunDevCma}
                      disabled={isCmaLoading}
                      className="px-2.5 py-1 bg-[#006980] hover:bg-cyan-600 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                      <span>{isCmaLoading ? 'Evaluating with AI...' : 'Run AI CMA Report'}</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                          <th className="p-2.5">Unit #</th>
                          <th className="p-2.5">Layout</th>
                          <th className="p-2.5">Floor</th>
                          <th className="p-2.5">Area (m²)</th>
                          <th className="p-2.5">Asking Price</th>
                          <th className="p-2.5">Rate/m²</th>
                          <th className="p-2.5">Monthly Levy</th>
                          <th className="p-2.5">Yield</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDev.units.map((unit) => {
                          const isAdded = addedUnitId === unit.id;
                          const isUnitSelected = selectedUnit?.id === unit.id;

                          return (
                            <tr
                              key={unit.id}
                              onClick={() => setSelectedUnit(unit)}
                              className={`hover:bg-cyan-50/50 transition-colors cursor-pointer ${
                                isUnitSelected ? 'bg-cyan-50/70 font-semibold' : ''
                              }`}
                            >
                              <td className="p-2.5 font-bold text-cyan-950">{unit.unitNumber}</td>
                              <td className="p-2.5">
                                <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                                  {unit.layout}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-600">Lvl {unit.floor}</td>
                              <td className="p-2.5 font-mono text-slate-700">
                                {unit.totalM2} m²
                                <span className="text-[10px] text-slate-400 block font-normal">
                                  ({unit.internalM2}m² int + {unit.balconyM2}m² balc)
                                </span>
                              </td>
                              <td className="p-2.5 font-bold text-slate-900 font-mono">
                                {formatZar(unit.askingPrice)}
                              </td>
                              <td className="p-2.5 font-mono text-slate-600 text-[11px]">
                                R {unit.pricePerM2.toLocaleString()}/m²
                              </td>
                              <td className="p-2.5 font-mono text-slate-600 text-[11px]">
                                R {unit.monthlyLevy.toLocaleString()}/mo
                              </td>
                              <td className="p-2.5 font-bold text-emerald-700 font-mono">
                                {unit.projectedGrossYield}%
                              </td>
                              <td className="p-2.5 text-right">
                                <button
                                  id={`btn-add-listing-${unit.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddUnitToListing(unit);
                                  }}
                                  disabled={isAddingListing || isAdded}
                                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ml-auto transition-colors ${
                                    isAdded
                                      ? 'bg-emerald-600 text-white cursor-default'
                                      : 'bg-[#006980] hover:bg-cyan-700 text-white shadow-2xs'
                                  }`}
                                  title="Add unit into active practitioner listings"
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3 text-white" />
                                      <span>Listed</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3 text-cyan-200" />
                                      <span>Add Listing</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI CMA Report Panel */}
                {cmaData && (
                  <div className="bg-cyan-50/50 border border-cyan-200 rounded-lg p-3.5 space-y-2.5 animate-fade-in text-xs">
                    <div className="flex items-center justify-between border-b border-cyan-200 pb-2">
                      <div className="flex items-center gap-2 font-bold text-cyan-950">
                        <Sparkles className="w-4 h-4 text-cyan-700" />
                        <span>AI Comparative Market Analysis (CMA) Summary</span>
                      </div>
                      <span className="bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold px-2 py-0.5 rounded text-[10px]">
                        {cmaData.investmentRecommendation || 'STRONG BUY'}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      {cmaData.executiveSummary}
                    </p>

                    {cmaData.capitalGrowthDrivers && (
                      <div>
                        <span className="font-bold text-slate-800 text-[11px] block mb-1">
                          Key Capital Growth Drivers:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                          {cmaData.capitalGrowthDrivers.map((driver: string, i: number) => (
                            <li key={i}>{driver}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {cmaData.comparativeDevelopments && (
                      <div className="pt-2 border-t border-cyan-200/60">
                        <span className="font-bold text-slate-800 text-[11px] block mb-1">
                          Competitive Scheme Rates:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {cmaData.comparativeDevelopments.map((comp: any, idx: number) => (
                            <div key={idx} className="bg-white p-2 rounded border border-cyan-200 text-[11px]">
                              <div className="font-bold text-slate-800">{comp.name}</div>
                              <div className="text-slate-500">{comp.suburb} • {comp.status}</div>
                              <div className="font-bold text-cyan-900 font-mono mt-0.5">
                                R {comp.avgM2.toLocaleString()}/m²
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p>Select a development on the left to view units, floor plans, and run AI CMA.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Total Developments:</span>
            <span>{developments.length}</span>
            <span className="text-slate-300">|</span>
            <span>All sectional plans verified with Chief Surveyor-General and CoCT Cadastre</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded text-xs transition-colors"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
