import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  Download, 
  Printer, 
  Filter, 
  Building2, 
  Calendar, 
  Coins, 
  FileSpreadsheet 
} from 'lucide-react';
import { PropertyRecord } from '../../types';

interface SalesTransfersModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyRecord[];
  onSelectProperty: (property: PropertyRecord) => void;
}

type SalesTab = 
  | 'Sales'
  | 'Transfer'
  | 'Sales List by Name Search'
  | 'Sales in Str/Scheme/Estate'
  | 'For Sale'
  | 'ShowHouse';

export const SalesTransfersModal: React.FC<SalesTransfersModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSelectProperty
}) => {
  const [activeTab, setActiveTab] = useState<SalesTab>('Sales');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'All' | 'Full Title' | 'Sectional Title'>('All');
  const [periodFilter, setPeriodFilter] = useState<string>('last_12_months');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  if (!isOpen) return null;

  // Filter properties based on criteria
  let salesList = properties.filter(p => {
    if (propertyTypeFilter === 'Full Title' && p.category !== 'Freehold') return false;
    if (propertyTypeFilter === 'Sectional Title' && p.category !== 'Sectional Title') return false;
    
    if (minPrice && p.currentSale.salePrice < Number(minPrice)) return false;
    if (maxPrice && p.currentSale.salePrice > Number(maxPrice)) return false;

    return true;
  });

  const exportCsv = () => {
    const headers = ['Address', 'Erf', 'Suburb', 'Owner', 'Sale Date', 'Reg Date', 'Sale Price (ZAR)', 'Extent (m2)', 'Title Deed', 'Bond'];
    const rows = salesList.map(p => [
      `"${p.address}"`,
      p.erfNo,
      `"${p.suburb}"`,
      `"${p.currentSale.owner}"`,
      p.currentSale.saleDate,
      p.currentSale.registeredDate,
      p.currentSale.salePrice,
      p.extentM2,
      `"${p.currentSale.titleDeed}"`,
      p.currentSale.bondAmount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CMA_Sales_Transfers_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatZar = (val: number) => {
    if (!val) return 'R 0';
    return `R ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="sales-transfers-modal"
        className="bg-white text-slate-800 w-full max-w-6xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-200" />
            <h2 className="font-bold text-sm tracking-tight">
              Sales & Registered Transfers Analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-100 hover:text-white hover:bg-teal-700/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Tabs */}
          <div className="w-full md:w-56 bg-slate-50 p-2.5 border-r border-slate-200 flex flex-col gap-0.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
              Sales Categories
            </span>

            {[
              { id: 'Sales', label: 'Historical Sales' },
              { id: 'Transfer', label: 'Registered Transfers' },
              { id: 'Sales List by Name Search', label: 'Sales by Name Search' },
              { id: 'Sales in Str/Scheme/Estate', label: 'Sales in Street / Scheme' },
              { id: 'For Sale', label: 'Active Market Listings' },
              { id: 'ShowHouse', label: 'Upcoming Showhouses' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SalesTab)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#006980] text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${activeTab === tab.id ? 'text-cyan-200' : 'text-slate-500'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right Main Table & Filters */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3">
            {/* Filter Bar */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Property Type</label>
                <select
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Full Title">Full Title (Freehold)</option>
                  <option value="Sectional Title">Sectional Title</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Period</label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none"
                >
                  <option value="last_6_months">In the last 6 months</option>
                  <option value="last_12_months">In the last 12 months</option>
                  <option value="2026">Whole of 2026</option>
                  <option value="2025">Whole of 2025</option>
                  <option value="all">All Historical Records</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Min Price (R)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Max Price (R)</label>
                <input
                  type="number"
                  placeholder="e.g. 20000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                Found <strong className="text-cyan-900 font-bold">{salesList.length}</strong> registered sales & transfers
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportCsv}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-emerald-800 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Export to CSV / Excel</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-cyan-900 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded border border-slate-300 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-2">Address</th>
                      <th className="p-2">Erf</th>
                      <th className="p-2">Registered Owner</th>
                      <th className="p-2">Sale Date</th>
                      <th className="p-2">Reg. Date</th>
                      <th className="p-2 text-right">Sale Price</th>
                      <th className="p-2 text-right">Extent</th>
                      <th className="p-2">Title Deed</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {salesList.map(item => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => {
                          onSelectProperty(item);
                          onClose();
                        }}
                      >
                        <td className="p-2 font-bold text-slate-900">{item.address}</td>
                        <td className="p-2 text-cyan-800 font-mono font-bold">{item.erfNo}</td>
                        <td className="p-2 text-slate-700 max-w-[160px] truncate">{item.currentSale.owner}</td>
                        <td className="p-2 text-slate-600">{item.currentSale.saleDate}</td>
                        <td className="p-2 text-slate-600">{item.currentSale.registeredDate}</td>
                        <td className="p-2 text-right font-bold text-cyan-900">{formatZar(item.currentSale.salePrice)}</td>
                        <td className="p-2 text-right text-emerald-800 font-medium">{item.extentM2} m²</td>
                        <td className="p-2 font-mono text-slate-600">{item.currentSale.titleDeed}</td>
                        <td className="p-2">
                          <button
                            className="px-2 py-0.5 bg-[#006980] text-white rounded text-[10px] font-semibold hover:bg-teal-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Deeds Office Live Registered Transfers Database</span>
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
