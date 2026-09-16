import React, { useState } from 'react';
import {
  X,
  Building2,
  TrendingUp,
  MapPin,
  Search,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Download,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Phone,
  Wallet,
  Home,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

interface LoomInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAddress?: string;
}

export const LoomInsightsModal: React.FC<LoomInsightsModalProps> = ({
  isOpen,
  onClose,
  defaultAddress = 'Midrand, Gauteng',
}) => {
  const [activeTab, setActiveTab] = useState<'quarterly_growth' | 'market_summary' | 'transfer_history'>('quarterly_growth');
  const [searchQuery, setSearchQuery] = useState(defaultAddress);
  const [selectedBranch, setSelectedBranch] = useState('Sandton & Midrand Elite');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | 'full_title' | 'sectional'>('all');
  const [selectedProvince, setSelectedProvince] = useState('Gauteng');

  // Keyboard shortcut (Escape to close)
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Screenshot 1 Data: Quarterly Value Growth Rates (1996 - 2026)
  const quarterlyGrowthData = [
    { year: '1996', fullTitle: 8.2, sectionalTitle: 6.5 },
    { year: '1999', fullTitle: 11.4, sectionalTitle: 9.8 },
    { year: '2002', fullTitle: 19.8, sectionalTitle: 16.2 },
    { year: '2005', fullTitle: 28.5, sectionalTitle: 24.1 },
    { year: '2008', fullTitle: 12.1, sectionalTitle: 10.3 },
    { year: '2011', fullTitle: 6.4, sectionalTitle: 7.2 },
    { year: '2014', fullTitle: 8.9, sectionalTitle: 9.4 },
    { year: '2017', fullTitle: 5.6, sectionalTitle: 6.8 },
    { year: '2020', fullTitle: 4.1, sectionalTitle: 5.2 },
    { year: '2022', fullTitle: 7.3, sectionalTitle: 8.5 },
    { year: '2024', fullTitle: 9.6, sectionalTitle: 11.2 },
    { year: '2025', fullTitle: 12.4, sectionalTitle: 13.8 },
    { year: '2026 (Q3)', fullTitle: 14.8, sectionalTitle: 15.6 },
  ];

  // Screenshot 1 Data: Deeds Reports List
  const recentReports = [
    { id: '1', address: '6 Barnebush Street, Midridge Park', ref: 'T49102/2026', type: 'Full Title', price: 1850000, date: '2026-08-14' },
    { id: '2', address: '61 Central Street, Houghton Estate', ref: 'T38192/2026', type: 'Full Title', price: 6200000, date: '2026-08-11' },
    { id: '3', address: '61 Central Avenue, Illovo', ref: 'T30199/2026', type: 'Sectional Title', price: 2950000, date: '2026-07-29' },
    { id: '4', address: '00991 - The Blyde Crystal Lagoon', ref: 'SS991/2026', type: 'Sectional Title', price: 1350000, date: '2026-07-22' },
    { id: '5', address: '00005 - Maple Wood, Halfway Gardens', ref: 'T19028/2026', type: 'Townhouse', price: 1420000, date: '2026-07-15' },
    { id: '6', address: '35 Westfield Road, Longmeadow', ref: 'T99401/2026', type: 'Commercial', price: 14500000, date: '2026-06-30' },
    { id: '7', address: 'Midline Business Park, 491 James Crescent', ref: 'TOIQ032000003012', type: 'Industrial', price: 22800000, date: '2026-06-18' },
  ];

  // Screenshot 2 Data: Market Status breakdown
  const marketStatusData = [
    { name: 'Available', count: 940, fill: '#10B981' },
    { name: 'Under Offer', count: 312, fill: '#F59E0B' },
    { name: 'Sold (YTD)', count: 230, fill: '#3B82F6' },
  ];

  const provinceData = [
    { name: 'Gauteng', count: 820 },
    { name: 'Western Cape', count: 480 },
    { name: 'KZN', count: 182 },
  ];

  const propertyTypeData = [
    { name: 'House', value: 620, color: '#059669' },
    { name: 'Townhouse', value: 340, color: '#0D9488' },
    { name: 'Apartment', value: 410, color: '#2563EB' },
    { name: 'Farm / Holding', value: 42, color: '#D97706' },
    { name: 'Vacant Land', value: 70, color: '#6366F1' },
  ];

  // Screenshot 3 Data: Confirmed Transfers Summary
  const confirmedTransfers = [
    { category: 'Full Title Houses', count: 412, totalValue: 890000000, avgPrice: 2160000 },
    { category: 'Sectional Schemes', count: 320, totalValue: 460000000, avgPrice: 1437500 },
    { category: 'Agricultural & Farms', count: 14, totalValue: 180000000, avgPrice: 12850000 },
    { category: 'Agricultural Holdings', count: 28, totalValue: 98000000, avgPrice: 3500000 },
    { category: 'Commercial / Other', count: 8, totalValue: 212000000, avgPrice: 26500000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header matching Screenshot 1 */}
        <div className="p-4 sm:px-6 sm:py-4 bg-slate-950 text-white border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white font-black text-sm px-2.5 py-1 rounded-lg tracking-widest uppercase">
              LOOM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white">LOOM Market Intel & Deeds Analytics</h3>
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
                  Deeds Office Direct API
                </span>
              </div>
              <p className="text-xs text-slate-400">Quarterly growth rates, market area insights, and verified transfer histories</p>
            </div>
          </div>

          {/* Search bar & Agent Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter address, erf or scheme..."
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-xs focus:outline-blue-500 w-48 sm:w-60"
              />
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span className="font-mono text-[11px]">063 695 4918</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 pt-3 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('quarterly_growth')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'quarterly_growth'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Quarterly Value Growth Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('market_summary')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'market_summary'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Market Area Summary & Insights</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transfer_history')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'transfer_history'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transfer History & Confirmed Sales</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: QUARTERLY VALUE GROWTH RATES (Screenshot 1) */}
          {activeTab === 'quarterly_growth' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Full Title vs Sectional Title Annual Appreciation (1996 - 2026)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Historical Deeds Registry index across Midrand & Sandton sub-districts</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-slate-900">
                      <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Full Title
                    </span>
                    <span className="flex items-center gap-1 text-slate-900 ml-3">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Sectional Title
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quarterlyGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                      <Tooltip
                        formatter={(val: number) => [`${val}%`, '']}
                        contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="fullTitle" name="Full Title" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="sectionalTitle" name="Sectional Title" stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Deeds Office Reports List (Screenshot 1) */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Recent Deeds Office Property Transfers ({recentReports.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{report.address}</h5>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                            <span>{report.ref}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">{formatCurrency(report.price)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">Lodged: {report.date}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Opening official deeds cadastral report for: ${report.address}`)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARKET AREA SUMMARY & INSIGHTS (Screenshot 2) */}
          {activeTab === 'market_summary' && (
            <div className="space-y-6">
              {/* Filter controls matching Screenshot 2 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Province</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-blue-500"
                  >
                    <option>Gauteng</option>
                    <option>Western Cape</option>
                    <option>KwaZulu-Natal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">City / Town</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-blue-500">
                    <option>Midrand & Centurion</option>
                    <option>Johannesburg & Sandton</option>
                    <option>Cape Town Atlantic Seaboard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Listing Type</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-blue-500">
                    <option>For Sale (Active)</option>
                    <option>For Rent (Active)</option>
                    <option>All Listings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Agency Branch</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-blue-500">
                    <option>Ptah Real Estate Elite - Sandton</option>
                    <option>Ptah Real Estate - Midrand</option>
                    <option>Ptah Real Estate - Camps Bay</option>
                  </select>
                </div>
              </div>

              {/* Metric stats cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Total Listings Analyzed</span>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">1,482</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">+14.2% vs last quarter</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Market Areas Tracked</span>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">18 Suburbs</div>
                  <span className="text-[10px] text-blue-600 font-semibold">98.4% deeds coverage</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Median Asking Price</span>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">R 2,450,000</div>
                  <span className="text-[10px] text-slate-500">Midrand & Sandton Corridor</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Days on Market (DOM)</span>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono">48 Days</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">12 days faster than avg</span>
                </div>
              </div>

              {/* Status and Property Type visual breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h5 className="text-xs font-bold text-slate-900 mb-3">Listings by Market Status</h5>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketStatusData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                          {marketStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h5 className="text-xs font-bold text-slate-900 mb-3">Listings by Property Archetype</h5>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={propertyTypeData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {propertyTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSFER HISTORY & CONFIRMED SALES (Screenshot 3) */}
          {activeTab === 'transfer_history' && (
            <div className="space-y-6">
              <div className="bg-emerald-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono">
                    90 Days Confirmed Deeds Registrations
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Confirmed Deeds Transfer History Dashboard</h4>
                  <p className="text-xs text-emerald-200 mt-0.5">Real-time cadastral settlements registered at the Pretoria & Cape Town Deeds Registries.</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => alert('Exporting verified 90-day Deeds Transfer Registry to Excel...')}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Deeds CSV</span>
                  </button>
                </div>
              </div>

              {/* Summary Table matching Screenshot 3 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Confirmed Transfers per Area (Total Confirmed: 782)
                  </h5>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Total Volume: R 1,840,000,000
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Property Category</th>
                        <th className="py-2.5 px-4 font-semibold text-center">No. of Transfers</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Total Purchase Price</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Average Transfer Price</th>
                        <th className="py-2.5 px-4 font-semibold text-center">Deeds Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {confirmedTransfers.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span>{item.category}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold">{item.count}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(item.totalValue)}</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">{formatCurrency(item.avgPrice)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Registered
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span>LOOM deeds API active</span>
            <span>•</span>
            <span>Last sync: Today at 09:30 UTC+2</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition cursor-pointer"
          >
            Close LOOM Hub
          </button>
        </div>
      </div>
    </div>
  );
};
