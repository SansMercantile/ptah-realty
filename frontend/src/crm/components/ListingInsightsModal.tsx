import React, { useState } from 'react';
import {
  X,
  BarChart3,
  TrendingDown,
  Clock,
  Award,
  Download,
  Calendar,
  Filter,
  ArrowDownRight,
  Building,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ListingInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ListingInsightsModal: React.FC<ListingInsightsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'time_to_sell' | 'price_variance' | 'sole_mandates' | 'stock_report'>('time_to_sell');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Data matching the screenshots
  const timeToSellData = [
    { level: 'Agent (Amanda Mokoena)', days: 108, color: 'bg-emerald-500' },
    { level: 'Office (One Waterfall)', days: 78, color: 'bg-blue-500' },
    { level: 'Regional Office (One)', days: 92, color: 'bg-indigo-500' },
    { level: 'Province (Gauteng)', days: 65, color: 'bg-amber-500' },
  ];

  const priceVarianceData = [
    { level: 'Agent', varianceRands: 120000, percent: 3.2, color: 'bg-emerald-500' },
    { level: 'Office (One Waterfall)', varianceRands: 60000, percent: 1.8, color: 'bg-blue-500' },
    { level: 'Province (Gauteng)', varianceRands: 480000, percent: 7.4, color: 'bg-amber-500' },
    { level: 'South Africa (National)', varianceRands: 680000, percent: 9.1, color: 'bg-purple-500' },
  ];

  const soleMandatesAgentRanking = [
    { agent: 'Refilwe Tilo', mandates: 4, office: 'One (Waterfall)' },
    { agent: 'Dian Fritz', mandates: 2, office: 'One (Waterfall)' },
    { agent: 'Mike Lotz', mandates: 1, office: 'One (Waterfall)' },
    { agent: 'Amanda Mokoena', mandates: 1, office: 'One (Waterfall)' },
  ];

  const monthlyMandates = [
    { month: 'Jan', count: 1 },
    { month: 'Feb', count: 2 },
    { month: 'Mar', count: 1 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
    { month: 'Jun', count: 0 },
    { month: 'Jul', count: 0 },
    { month: 'Aug', count: 0 },
    { month: 'Sep', count: 0 },
    { month: 'Oct', count: 0 },
    { month: 'Nov', count: 0 },
    { month: 'Dec', count: 0 },
  ];

  const stockReportItems = [
    { suburb: 'Waterfall Heights', activeStock: 12, avgAskingPrice: 2450000, avgDaysOnMarket: 54, soleMandates: 8 },
    { suburb: 'Barbeque Downs', activeStock: 18, avgAskingPrice: 1520000, avgDaysOnMarket: 42, soleMandates: 11 },
    { suburb: 'Kyalami Hills', activeStock: 9, avgAskingPrice: 2090000, avgDaysOnMarket: 68, soleMandates: 6 },
    { suburb: 'Carlswald', activeStock: 14, avgAskingPrice: 2420000, avgDaysOnMarket: 61, soleMandates: 9 },
    { suburb: 'Woodmead', activeStock: 7, avgAskingPrice: 2510000, avgDaysOnMarket: 75, soleMandates: 4 },
  ];

  // Close on escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = (format: 'CSV' | 'PNG' | 'SVG') => {
    setExportNotice(`Exported chart data as ${format}`);
    setTimeout(() => setExportNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Listing Insights & Mandate Intelligence</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Ptah Regional Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparative benchmarks across Agent, Office, Gauteng Province, and South Africa National averages
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {exportNotice && (
              <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-950 rounded-lg animate-in fade-in">
                {exportNotice}
              </span>
            )}
            <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-800">
              <button
                onClick={() => handleExport('CSV')}
                className="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 cursor-pointer"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport('PNG')}
                className="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 cursor-pointer"
              >
                PNG
              </button>
              <button
                onClick={() => handleExport('SVG')}
                className="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 cursor-pointer"
              >
                SVG
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 px-4 pt-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('time_to_sell')}
            className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'time_to_sell'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Average Time To Sell</span>
          </button>

          <button
            onClick={() => setActiveTab('price_variance')}
            className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'price_variance'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Asking vs. Sold Price Variance</span>
          </button>

          <button
            onClick={() => setActiveTab('sole_mandates')}
            className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'sole_mandates'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Sole Mandates & Agent Ranking</span>
          </button>

          <button
            onClick={() => setActiveTab('stock_report')}
            className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'stock_report'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Stock Inventory Report</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          
          {/* 1. TIME TO SELL */}
          {activeTab === 'time_to_sell' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Average Days on Market to Conclude Sale</h3>
                    <p className="text-xs text-slate-500">Benchmark comparison of Amanda Mokoena against office and provincial peers.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                    Office Avg: 78 Days
                  </span>
                </div>

                {/* Bar chart */}
                <div className="space-y-4 pt-2">
                  {timeToSellData.map((item) => (
                    <div key={item.level} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">{item.level}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{item.days} Days</span>
                      </div>
                      <div className="w-full h-5 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex">
                        <div
                          className={`h-full ${item.color} rounded-lg transition-all duration-700`}
                          style={{ width: `${(item.days / 120) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 text-[11px] font-medium">Fastest Closing Suburb</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Barbeque Downs</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">42 Days Average</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 text-[11px] font-medium">Estate Turnaround</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Waterfall Heights</p>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">54 Days Average</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 text-[11px] font-medium">Gauteng Provincial Benchmark</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">65 Days</p>
                  <p className="text-xs text-slate-400 mt-0.5">Across all agency networks</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRICE VARIANCE */}
          {activeTab === 'price_variance' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Average Initial Asking Price vs. Sold Price Drop (Variance)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Measures realistic initial pricing discipline and discount negotiated off the mandate price.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {priceVarianceData.map((item) => (
                    <div key={item.level} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">{item.level}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            - {formatCurrency(item.varianceRands)}
                          </span>
                          <span className="text-[11px] text-slate-400">({item.percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-5 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex">
                        <div
                          className={`h-full ${item.color} rounded-lg transition-all duration-700`}
                          style={{ width: `${(item.varianceRands / 750000) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. SOLE MANDATES & AGENT RANKING */}
          {activeTab === 'sole_mandates' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Agent Leaderboard Bar Chart */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Office Sole Mandates Ranking (2026 YTD)
                  </h3>
                  <div className="space-y-3">
                    {soleMandatesAgentRanking.map((agent, i) => (
                      <div key={agent.agent} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center space-x-1.5">
                            <span className="w-4 text-slate-400 font-bold">#{i + 1}</span>
                            <span>{agent.agent}</span>
                          </span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {agent.mandates} Mandates
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${(agent.mandates / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Mandates distribution */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Sole Mandates by Month (Amanda Mokoena)
                  </h3>
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {monthlyMandates.map((m) => (
                      <div key={m.month} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[11px] font-bold text-slate-400">{m.month}</p>
                        <p className={`text-sm font-black mt-1 ${m.count > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {m.count}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 4. STOCK INVENTORY REPORT */}
          {activeTab === 'stock_report' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Stock Report by Suburb</h3>
                  <p className="text-xs text-slate-500">Live inventory levels and sole mandate penetration.</p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">Suburb</th>
                      <th className="px-4 py-2.5">Active Stock</th>
                      <th className="px-4 py-2.5">Avg Asking Price</th>
                      <th className="px-4 py-2.5">Avg Days on Market</th>
                      <th className="px-4 py-2.5 text-right">Sole Mandates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stockReportItems.map((item) => (
                      <tr key={item.suburb} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{item.suburb}</td>
                        <td className="px-4 py-2.5">{item.activeStock} Properties</td>
                        <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.avgAskingPrice)}
                        </td>
                        <td className="px-4 py-2.5">{item.avgDaysOnMarket} Days</td>
                        <td className="px-4 py-2.5 text-right font-bold text-purple-600 dark:text-purple-400">
                          {item.soleMandates} ({Math.round((item.soleMandates / item.activeStock) * 100)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
