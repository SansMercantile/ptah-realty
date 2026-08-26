import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  TrendingUp, 
  Users, 
  Calendar, 
  PieChart, 
  BarChart3, 
  Layers, 
  Search,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { SUBURBS_LIST, SUBURB_GROUPS, SUBURB_DEMOGRAPHICS_DATA, PROVINCES_LIST } from '../../services/mockData';
import { SuburbStatistics } from '../../types';

interface SuburbAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuburbForMap?: (suburbName: string) => void;
}

export const SuburbAnalyticsModal: React.FC<SuburbAnalyticsModalProps> = ({
  isOpen,
  onClose,
  onSelectSuburbForMap
}) => {
  const [activeTab, setActiveTab] = useState<'Statistical' | 'Demographics' | 'Province'>('Statistical');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('GREEN POINT, CITY OF CAPE TOWN');
  const [suburbSearchQuery, setSuburbSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Atlantic Seaboard Prime');
  
  // Statistical settings matching CMA Info
  const [propertyType, setPropertyType] = useState<'Full Title' | 'Sectional Title'>('Full Title');
  const [calcBasis, setCalcBasis] = useState<'Median' | 'Average'>('Median');
  const [startYear, setStartYear] = useState<number>(2017);
  const [endYear, setEndYear] = useState<number>(2026);

  if (!isOpen) return null;

  const currentStats: SuburbStatistics = 
    SUBURB_DEMOGRAPHICS_DATA[selectedSuburb] || 
    SUBURB_DEMOGRAPHICS_DATA['GREEN POINT, CITY OF CAPE TOWN'];

  const filteredSuburbs = SUBURBS_LIST.filter(s => 
    s.toLowerCase().includes(suburbSearchQuery.toLowerCase())
  );

  const filteredTrends = currentStats.historicalAnnualTrends.filter(
    t => t.year >= startYear && t.year <= endYear
  );

  const formatZarMillions = (val: number) => {
    return `R ${(val / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="suburb-analytics-modal"
        className="bg-white text-slate-800 w-full max-w-5xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-200" />
            <h2 className="font-bold text-sm tracking-tight">
              Suburb & Demographic Analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-100 hover:text-white hover:bg-teal-700/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Left Navigation & Main Panel */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="w-full md:w-56 bg-slate-50 p-2.5 border-r border-slate-200 flex flex-col gap-0.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
              Modules
            </span>

            <button
              onClick={() => setActiveTab('Statistical')}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all ${
                activeTab === 'Statistical'
                  ? 'bg-[#006980] text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 ${activeTab === 'Statistical' ? 'text-cyan-200' : 'text-slate-500'}`} />
              <span>Statistical Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('Demographics')}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all ${
                activeTab === 'Demographics'
                  ? 'bg-[#006980] text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === 'Demographics' ? 'text-cyan-200' : 'text-slate-500'}`} />
              <span>Demographics & Age</span>
            </button>

            <button
              onClick={() => setActiveTab('Province')}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all ${
                activeTab === 'Province'
                  ? 'bg-[#006980] text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${activeTab === 'Province' ? 'text-cyan-200' : 'text-slate-500'}`} />
              <span>Province Analytics</span>
            </button>

            {/* Quick Suburb Selector */}
            <div className="mt-3 pt-2.5 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1 px-1">
                Select Suburb
              </span>
              <div className="relative mb-1.5">
                <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter suburbs..."
                  value={suburbSearchQuery}
                  onChange={(e) => setSuburbSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {filteredSuburbs.map(suburb => (
                  <button
                    key={suburb}
                    onClick={() => {
                      setSelectedSuburb(suburb);
                      onSelectSuburbForMap && onSelectSuburbForMap(suburb);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] font-medium truncate transition-colors ${
                      selectedSuburb === suburb
                        ? 'bg-cyan-50 text-cyan-900 border border-cyan-300 font-bold'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {suburb}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3.5">
            {/* Current Suburb Header */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Selected Location</span>
                <h3 className="text-sm font-bold text-cyan-900">
                  {selectedSuburb}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Total Properties</span>
                  <span className="font-bold text-slate-800">{currentStats.totalProperties.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Freehold</span>
                  <span className="font-bold text-emerald-700">{currentStats.freeholdCount.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Sectional Title</span>
                  <span className="font-bold text-indigo-700">{currentStats.sectionalTitleCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* TAB 1: STATISTICAL ANALYSIS */}
            {activeTab === 'Statistical' && (
              <div className="space-y-3">
                {/* Controls Bar */}
                <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  {/* Property Type Radio */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">Property Type:</span>
                    <label className="flex items-center gap-1 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="propType"
                        checked={propertyType === 'Full Title'}
                        onChange={() => setPropertyType('Full Title')}
                        className="accent-cyan-600"
                      />
                      <span>Full Title</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="propType"
                        checked={propertyType === 'Sectional Title'}
                        onChange={() => setPropertyType('Sectional Title')}
                        className="accent-cyan-600"
                      />
                      <span>Sectional Title</span>
                    </label>
                  </div>

                  {/* Median vs Average */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">Calculation:</span>
                    <label className="flex items-center gap-1 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="calcBasis"
                        checked={calcBasis === 'Median'}
                        onChange={() => setCalcBasis('Median')}
                        className="accent-cyan-600"
                      />
                      <span>Median Price</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="calcBasis"
                        checked={calcBasis === 'Average'}
                        onChange={() => setCalcBasis('Average')}
                        className="accent-cyan-600"
                      />
                      <span>Average Price</span>
                    </label>
                  </div>

                  {/* Year Range */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-medium">Range:</span>
                    <select
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
                    >
                      {[2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="text-slate-400">to</span>
                    <select
                      value={endYear}
                      onChange={(e) => setEndYear(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
                    >
                      {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Trends Chart */}
                <div className="bg-white p-3.5 rounded border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-700" />
                      Historical Price Growth (ZAR)
                    </h4>
                    <span className="text-xs text-cyan-800 font-semibold">
                      {propertyType} ({calcBasis})
                    </span>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredTrends} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={11}
                          tickFormatter={formatZarMillions}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '4px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: any) => [`R ${Number(val).toLocaleString('en-ZA')}`, 'Price']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey={propertyType === 'Full Title' 
                            ? (calcBasis === 'Median' ? 'medianPriceFreehold' : 'averagePriceFreehold') 
                            : (calcBasis === 'Median' ? 'medianPriceSectional' : 'averagePriceSectional')} 
                          name={`${propertyType} ${calcBasis} Price`}
                          stroke="#0284c7" 
                          strokeWidth={2.5} 
                          dot={{ r: 4, fill: '#0369a1' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sales Volume Bar Chart */}
                <div className="bg-white p-3.5 rounded border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                      Annual Registered Sales Volume
                    </h4>
                  </div>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredTrends} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '4px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="salesVolumeFreehold" name="Freehold Transfers" fill="#059669" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="salesVolumeSectional" name="Sectional Title Transfers" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DEMOGRAPHICS */}
            {activeTab === 'Demographics' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Current Owners Age Distribution */}
                  <div className="bg-white p-3.5 rounded border border-slate-200 shadow-2xs">
                    <h4 className="font-bold text-xs text-slate-800 mb-2.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-700" />
                      Age of Current Owners
                    </h4>

                    <div className="space-y-2">
                      {currentStats.ageDistribution.map(item => (
                        <div key={item.bracket}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-700 font-medium">{item.bracket}</span>
                            <span className="text-cyan-900 font-bold">{item.ownersCount} ({item.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div 
                              className="bg-cyan-600 h-full rounded-full transition-all" 
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ownership Duration */}
                  <div className="bg-white p-3.5 rounded border border-slate-200 shadow-2xs">
                    <h4 className="font-bold text-xs text-slate-800 mb-2.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      Period of Ownership
                    </h4>

                    <div className="space-y-2">
                      {currentStats.ownershipDuration.map(item => (
                        <div key={item.durationBracket}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-700 font-medium">{item.durationBracket}</span>
                            <span className="text-emerald-800 font-bold">{item.count} ({item.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div 
                              className="bg-emerald-600 h-full rounded-full transition-all" 
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Buyers vs Sellers Demographics Comparison */}
                <div className="bg-white p-3.5 rounded border border-slate-200 shadow-2xs">
                  <h4 className="font-bold text-xs text-slate-800 mb-2.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-700" />
                    Buyer vs Seller Age Profile (Recent 12 Months)
                  </h4>

                  <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
                    {currentStats.buyerAgeDemographics.map(d => (
                      <div key={d.bracket} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                        <span className="font-bold text-slate-800 block mb-1.5 text-xs">{d.bracket}</span>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-emerald-700">Buyers:</span>
                            <span className="font-bold text-emerald-900">{d.buyersPercent}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-rose-700">Sellers:</span>
                            <span className="font-bold text-rose-900">{d.sellersPercent}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROVINCE ANALYTICS */}
            {activeTab === 'Province' && (
              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded border border-slate-200 shadow-2xs">
                  <h4 className="font-bold text-xs text-slate-800 mb-2.5">
                    South African Provinces Property Index
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {PROVINCES_LIST.map(province => (
                      <div 
                        key={province}
                        className="bg-slate-50 p-2.5 rounded border border-slate-200 hover:border-cyan-600 transition-colors"
                      >
                        <span className="font-bold text-cyan-900 block">{province}</span>
                        <span className="text-slate-500 text-[11px]">Deeds Office Online • Realtime sync</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Source: CMA Info Deeds Office Aggregation Engine (2004 - 2026)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#006980] hover:bg-teal-700 text-white font-semibold rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
