import React, { useState } from 'react';
import {
  X,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Filter,
  Search,
  Kanban,
  Table as TableIcon,
  Download,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { RealEstateDeal } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DealsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: RealEstateDeal[];
  onUpdateDealStatus?: (dealId: string, status: RealEstateDeal['status']) => void;
}

export const DealsHubModal: React.FC<DealsHubModalProps> = ({
  isOpen,
  onClose,
  deals: initialDeals,
  onUpdateDealStatus,
}) => {
  const [deals, setDeals] = useState<RealEstateDeal[]>(initialDeals);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'registered' | 'under_offer' | 'pending' | 'collapsed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleESelected, setScheduleESelected] = useState<string[]>(['deal-101', 'deal-104']);
  const [isScheduleEMode, setIsScheduleEMode] = useState(false);
  const [scheduleEExported, setScheduleEExported] = useState(false);

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

  const filteredDeals = deals.filter((deal) => {
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    const matchesSearch =
      deal.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.dealNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleScheduleE = (dealId: string) => {
    if (scheduleESelected.includes(dealId)) {
      setScheduleESelected(scheduleESelected.filter((id) => id !== dealId));
    } else {
      setScheduleESelected([...scheduleESelected, dealId]);
    }
  };

  const handleExportScheduleE = () => {
    setScheduleEExported(true);
    setTimeout(() => setScheduleEExported(false), 3000);
  };

  const totalRegisteredCommission = deals
    .filter((d) => d.status === 'registered')
    .reduce((acc, d) => acc + d.agentCommission, 0);

  const totalActivePipelineCommission = deals
    .filter((d) => d.status === 'active' || d.status === 'under_offer' || d.status === 'pending')
    .reduce((acc, d) => acc + d.agentCommission, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Manage Active Deals & Schedule E</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Ptah Real Estate (Waterfall)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conveyancing tracking, deeds office lodge milestones, commission splits, and Schedule E reconciliation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsScheduleEMode(!isScheduleEMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                isScheduleEMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isScheduleEMode ? 'Exit Schedule E Mode' : 'Select Deals for Schedule E'}</span>
              {scheduleESelected.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-black">
                  {scheduleESelected.length}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner matching screenshot */}
        <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Notice: Deals which have been in a registered or collapsed status for more than 30 days are automatically archived.</span>
          </div>
          <span className="font-semibold text-[11px]">PPRA Compliant Conveyancing</span>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] text-slate-500 font-medium">Earned Agent Commission YTD</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(totalRegisteredCommission)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">From registered property transfers</p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] text-slate-500 font-medium">Pending Pipeline Commission</p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {formatCurrency(totalActivePipelineCommission)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Under offer and pending bond approval</p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] text-slate-500 font-medium">Active Deals in Progress</p>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {deals.filter((d) => d.status !== 'collapsed').length} Deals
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Across Pretoria & Johannesburg Deeds Offices</p>
          </div>
        </div>

        {/* Toolbar: Filters, Search & View Toggle */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Status Filters */}
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            {(['all', 'active', 'under_offer', 'pending', 'registered', 'collapsed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search & Switcher */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search address, deal #, attorney..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-56"
              />
            </div>

            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
                title="Kanban View"
              >
                <Kanban className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 text-xs">
          
          {/* Table View */}
          {viewMode === 'table' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 text-xs">
                  <tr>
                    {isScheduleEMode && <th className="px-3 py-2.5 w-10 text-center">Select</th>}
                    <th className="px-3 py-2.5">Deal #</th>
                    <th className="px-3 py-2.5">Property & Address</th>
                    <th className="px-3 py-2.5">Sales Date</th>
                    <th className="px-3 py-2.5">Sale Price</th>
                    <th className="px-3 py-2.5">Gross Comm</th>
                    <th className="px-3 py-2.5">Agent Share (70%)</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Conveyancer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDeals.map((deal) => {
                    const isChecked = scheduleESelected.includes(deal.id);
                    return (
                      <tr
                        key={deal.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                          isChecked && isScheduleEMode ? 'bg-blue-50/60 dark:bg-blue-950/40' : ''
                        }`}
                      >
                        {isScheduleEMode && (
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleScheduleE(deal.id)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                        )}
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                          {deal.dealNumber}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-900 dark:text-white">{deal.propertyTitle}</p>
                          <p className="text-[11px] text-slate-500">{deal.address}</p>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                          <div>{deal.salesDate}</div>
                          {deal.transferDate && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Reg: {deal.transferDate}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(deal.salePrice)}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                          {formatCurrency(deal.grossCommission)}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(deal.agentCommission)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              deal.status === 'registered'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : deal.status === 'active'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : deal.status === 'under_offer'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : deal.status === 'pending'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {deal.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-500">
                          <p className="truncate max-w-[140px]">{deal.attorney}</p>
                          <p className="text-[10px] text-slate-400">Deeds: {deal.deedsOffice}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Kanban Board View */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['active', 'under_offer', 'pending', 'registered'] as const).map((stage) => {
                const stageDeals = deals.filter((d) => d.status === stage);
                return (
                  <div key={stage} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {stage.replace('_', ' ')}
                      </h4>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {stageDeals.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[11px] text-blue-600 dark:text-blue-400">
                              {deal.dealNumber}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(deal.agentCommission)}
                            </span>
                          </div>
                          <p className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {deal.propertyTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{deal.address}</p>
                          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                            <span>Sale: {formatCurrency(deal.salePrice)}</span>
                            <span>{deal.salesDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Schedule E Export Drawer / Bar */}
        {isScheduleEMode && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/80 border-t border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="font-bold text-blue-950 dark:text-blue-200">
                  {scheduleESelected.length} Deals selected for Schedule E Submission
                </p>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300">
                  Calculates official PPRA trust commission distribution, agency royalty, and VAT certificates.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportScheduleE}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center space-x-2"
            >
              {scheduleEExported ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{scheduleEExported ? 'Schedule E Generated!' : 'Generate & Export Schedule E'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
