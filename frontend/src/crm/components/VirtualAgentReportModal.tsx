import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Search,
  Download,
  Share2,
  Building,
  CheckCircle2,
  TrendingUp,
  MapPin,
  FileText,
  DollarSign,
  GraduationCap,
  ShieldAlert,
  Check
} from 'lucide-react';
import { VirtualPropertyReport } from '../types';
import { formatCurrency } from '../utils/formatters';

interface VirtualAgentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: VirtualPropertyReport[];
  onGenerateReport?: (report: VirtualPropertyReport) => void;
}

export const VirtualAgentReportModal: React.FC<VirtualAgentReportModalProps> = ({
  isOpen,
  onClose,
  reports: initialReports,
  onGenerateReport,
}) => {
  const [reports, setReports] = useState<VirtualPropertyReport[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string>(initialReports[0]?.id || '');
  const [searchAddress, setSearchAddress] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleGenerateNewReport = () => {
    if (!searchAddress.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const generated: VirtualPropertyReport = {
        id: `vrep-${Date.now()}`,
        propertyAddress: searchAddress.trim(),
        suburb: searchAddress.split(',')[1]?.trim() || 'Waterfall Suburb',
        erfNumber: `Erf ${Math.floor(1000 + Math.random() * 9000)}`,
        estimatedMarketValueZar: 3650000,
        valuationLowZar: 3400000,
        valuationHighZar: 3950000,
        municipalValuationZar: 2950000,
        lastDeedsTransferPriceZar: 2750000,
        lastTransferDate: '2021-08-14',
        comparableSalesRecent: [
          { address: '12 Karkloof Close', soldPrice: 3550000, saleDate: '2026-01-18', beds: 4 },
          { address: '8 Waterfall Ridge', soldPrice: 3700000, saleDate: '2025-11-20', beds: 4 },
          { address: '22 Cascades Way', soldPrice: 3420000, saleDate: '2025-09-05', beds: 3 },
        ],
        suburbGrowthRateAnnualPercent: 7.4,
        amenitiesNearby: [
          'Waterfall Corner Shopping Centre (1.2km)',
          'Reddam House Waterfall (1.8km)',
          'Netcare Waterfall City Hospital (2.5km)',
        ],
        generatedDate: new Date().toISOString().split('T')[0],
      };

      setReports([generated, ...reports]);
      setSelectedReportId(generated.id);
      setIsGenerating(false);
      setSearchAddress('');
      if (onGenerateReport) onGenerateReport(generated);
    }, 1200);
  };

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Virtual Agent — Property Intel & Deeds Report</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  AI Valuation & CMA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated Deeds Registry historical transfers, municipal roll valuation, and comparative market analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generate Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center gap-2.5 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter property address, erf number, or sectional scheme (e.g. 18 Cascades, Waterfall Heights)..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
            />
          </div>
          <button
            onClick={handleGenerateNewReport}
            disabled={isGenerating || !searchAddress.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shrink-0 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Querying Deeds Registry...' : 'Generate Valuation Report'}</span>
          </button>
        </div>

        {/* 2-Column: Left recent reports, Right active report viewer */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 text-xs">
          
          {/* Recent Reports List */}
          <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 p-3 space-y-2 overflow-y-auto bg-slate-50/40 dark:bg-slate-950/20">
            <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Saved Property Reports
            </p>
            {reports.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className={`w-full p-3 rounded-xl text-left border transition cursor-pointer ${
                  selectedReportId === rep.id
                    ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-500 shadow-2xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <p className="font-bold text-slate-900 dark:text-white truncate text-xs">{rep.propertyAddress}</p>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-slate-500">{rep.suburb}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(rep.estimatedMarketValueZar)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{rep.erfNumber}</span>
                  <span>{rep.generatedDate}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Report Viewer */}
          <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto space-y-6">
            {currentReport ? (
              <div className="space-y-6">
                
                {/* Top Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentReport.propertyAddress}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentReport.suburb} • {currentReport.erfNumber} • Generated {currentReport.generatedDate}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                      <span>{downloaded ? 'Saved!' : 'Export PDF'}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Share CMA'}</span>
                    </button>
                  </div>
                </div>

                {/* Valuation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60">
                    <p className="text-[11px] text-violet-700 dark:text-violet-300 font-bold">Estimated Market Value (CMA)</p>
                    <p className="text-xl font-black text-violet-950 dark:text-violet-100 mt-1">
                      {formatCurrency(currentReport.estimatedMarketValueZar)}
                    </p>
                    <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-0.5">
                      Range: {formatCurrency(currentReport.valuationLowZar)} - {formatCurrency(currentReport.valuationHighZar)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] text-slate-500 font-medium">Municipal Valuation (Rates Roll)</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {formatCurrency(currentReport.municipalValuationZar)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">City of Johannesburg Valuation Roll</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] text-slate-500 font-medium">Last Registered Deeds Transfer</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {formatCurrency(currentReport.lastDeedsTransferPriceZar)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Transferred on {currentReport.lastTransferDate}</p>
                  </div>
                </div>

                {/* Comparable Sales Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Recent Suburb Registered Transfers</h4>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      +{currentReport.suburbGrowthRateAnnualPercent}% Suburb Annual Growth
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-2">Address</th>
                          <th className="px-4 py-2">Bedrooms</th>
                          <th className="px-4 py-2">Sold Price</th>
                          <th className="px-4 py-2 text-right">Transfer Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {currentReport.comparableSalesRecent.map((sale, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">{sale.address}</td>
                            <td className="px-4 py-2 text-slate-500">{sale.beds} Beds</td>
                            <td className="px-4 py-2 font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(sale.soldPrice)}
                            </td>
                            <td className="px-4 py-2 text-right text-slate-500">{sale.saleDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Amenities */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
                    <GraduationCap className="w-4 h-4 text-violet-600" />
                    <span>Nearby Schools, Retail & Healthcare</span>
                  </h4>
                  <ul className="space-y-1">
                    {currentReport.amenitiesNearby.map((am, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{am}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <p className="text-slate-400">Select a report or generate a new one.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
