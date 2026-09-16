import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Send,
  AlertCircle,
  Search,
  Filter,
  Users,
  Building,
  CheckCircle2,
  FileText,
  UserCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Lead, ClientDocumentRequestSession, ClientDocumentRequestItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ClientPortalSummaryWidgetProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
  onUpdateLead?: (lead: Lead) => void;
}

export const ClientPortalSummaryWidget: React.FC<ClientPortalSummaryWidgetProps> = ({
  leads,
  onSelectLead,
  onUpdateLead,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'partial' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all active client document portal sessions across all leads
  const portalData = useMemo(() => {
    const list: {
      lead: Lead;
      session: ClientDocumentRequestSession;
      totalItems: number;
      uploadedItems: number;
      pendingItems: number;
      percentComplete: number;
      lastActivity: string;
    }[] = [];

    leads.forEach((lead) => {
      if (lead.documentRequests && lead.documentRequests.length > 0) {
        lead.documentRequests.forEach((session) => {
          const totalItems = session.items.length;
          const uploadedItems = session.items.filter((it) => it.status === 'uploaded' || it.status === 'accepted').length;
          const pendingItems = totalItems - uploadedItems;
          const percentComplete = totalItems > 0 ? Math.round((uploadedItems / totalItems) * 100) : 0;

          list.push({
            lead,
            session,
            totalItems,
            uploadedItems,
            pendingItems,
            percentComplete,
            lastActivity: session.requestedAt,
          });
        });
      }
    });

    return list;
  }, [leads]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const totalActivePortals = portalData.length;
    const completedPortals = portalData.filter((p) => p.session.status === 'completed' || p.percentComplete === 100).length;
    const partialPortals = portalData.filter((p) => (p.session.status === 'partial' || (p.uploadedItems > 0 && p.percentComplete < 100))).length;
    const pendingPortals = portalData.filter((p) => p.session.status === 'pending' && p.uploadedItems === 0).length;

    const totalDocsRequested = portalData.reduce((sum, p) => sum + p.totalItems, 0);
    const totalDocsUploaded = portalData.reduce((sum, p) => sum + p.uploadedItems, 0);
    const overallUploadRate = totalDocsRequested > 0 ? Math.round((totalDocsUploaded / totalDocsRequested) * 100) : 0;

    return {
      totalActivePortals,
      completedPortals,
      partialPortals,
      pendingPortals,
      totalDocsRequested,
      totalDocsUploaded,
      overallUploadRate,
    };
  }, [portalData]);

  // Filtered portal list
  const filteredPortals = useMemo(() => {
    return portalData.filter((item) => {
      // Filter by status
      if (filterStatus === 'completed' && !(item.session.status === 'completed' || item.percentComplete === 100)) {
        return false;
      }
      if (filterStatus === 'partial' && !(item.session.status === 'partial' || (item.uploadedItems > 0 && item.percentComplete < 100))) {
        return false;
      }
      if (filterStatus === 'pending' && !(item.session.status === 'pending' && item.uploadedItems === 0)) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesClient = item.lead.name.toLowerCase().includes(query);
        const matchesProp = item.lead.propertyTitle.toLowerCase().includes(query);
        const matchesRef = item.lead.referenceNumber.toLowerCase().includes(query);
        const matchesAgent = item.lead.assignedAgent?.name.toLowerCase().includes(query);
        return matchesClient || matchesProp || matchesRef || matchesAgent;
      }

      return true;
    });
  }, [portalData, filterStatus, searchQuery]);

  const handleCopyLink = (shareUrl: string, id: string) => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendReminder = (item: typeof portalData[0]) => {
    const message = encodeURIComponent(
      `Hi ${item.lead.name}, this is Ptah Real Estate following up on your secure document portal for ${item.lead.propertyTitle}. You have ${item.pendingItems} compliance documents awaiting submission: ${item.session.shareUrl}`
    );
    window.open(`https://wa.me/${item.lead.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      {/* Widget Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/80 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                Client Document Portal Summary
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Live FICA / Conveyancing Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time monitoring of active secure client upload links and compliance dossier progress.
            </p>
          </div>
        </div>

        {/* Global Compliance Progress Bar */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Upload Progress</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {stats.totalDocsUploaded} / {stats.totalDocsRequested} Docs ({stats.overallUploadRate}%)
            </div>
          </div>
          <div className="w-20 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.overallUploadRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Active Portals</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalActivePortals}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Shared with VIP clients</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-950 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="font-semibold">Completed Dossiers</span>
            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedPortals}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">100% verified & conveyancer ready</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-amber-100 dark:border-amber-950 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 mb-1">
            <span className="font-semibold">Partial / In Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.partialPortals}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Awaiting remaining items</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-rose-100 dark:border-rose-950 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 mb-1">
            <span className="font-semibold">Awaiting Client</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{stats.pendingPortals}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Zero uploads submitted yet</p>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Search */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-800">
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Portals ({stats.totalActivePortals})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'completed'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed ({stats.completedPortals})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('partial')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'partial'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Partial ({stats.partialPortals})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pending ({stats.pendingPortals})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, property, agent..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Portals Table */}
      <div className="overflow-x-auto">
        {filteredPortals.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No client portals match this filter</p>
            <p className="text-xs text-slate-400 mt-1">
              Active portals appear here automatically once created from any lead's profile.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3">Client & Reference</th>
                <th className="px-4 py-3">Property Transaction</th>
                <th className="px-4 py-3">Assigned Agent</th>
                <th className="px-4 py-3">Upload Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredPortals.map((item) => {
                const isCompleted = item.session.status === 'completed' || item.percentComplete === 100;
                const isPartial = !isCompleted && item.uploadedItems > 0;
                const isPending = !isCompleted && item.uploadedItems === 0;

                return (
                  <tr
                    key={item.session.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {/* Client & Reference */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.lead.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.lead.referenceNumber} • {item.lead.buyerType}
                      </div>
                    </td>

                    {/* Property */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-white line-clamp-1 max-w-xs">
                        {item.lead.propertyTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatCurrency(item.lead.propertyPrice)} • {item.lead.propertyLocation}
                      </div>
                    </td>

                    {/* Assigned Agent */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-2">
                        {item.lead.assignedAgent?.avatar && (
                          <img
                            src={item.lead.assignedAgent.avatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                        )}
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.lead.assignedAgent?.name?.split(' ')[0] || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Upload Progress */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1 w-32">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.uploadedItems} / {item.totalItems}
                          </span>
                          <span className="text-slate-400 font-medium">{item.percentComplete}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isPartial
                                ? 'bg-amber-500'
                                : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                            style={{ width: `${item.percentComplete}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      {isCompleted ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Completed</span>
                        </span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>In Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(item.session.shareUrl, item.session.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Copy Client Upload Link"
                        >
                          {copiedId === item.session.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendReminder(item)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition cursor-pointer"
                          title="Send WhatsApp Follow-up Reminder"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {onSelectLead && (
                          <button
                            type="button"
                            onClick={() => onSelectLead(item.lead)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-[11px] font-semibold transition cursor-pointer"
                          >
                            <span>Open Lead</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
