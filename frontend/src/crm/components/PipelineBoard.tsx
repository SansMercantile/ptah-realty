import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  Mail, 
  Clock, 
  Building, 
  Flame, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  DollarSign,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { Lead, LeadSource, LeadStatus, UrgencyLevel } from '../types';
import { formatCurrency, formatShortCurrency, formatRelativeTime } from '../utils/formatters';

interface PipelineBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onOpenQuickWhatsApp: (lead: Lead) => void;
}

const PIPELINE_COLUMNS: { id: LeadStatus; label: string; color: string; badgeBg: string }[] = [
  { id: 'new', label: 'New / Inbound', color: 'border-blue-500 text-blue-700 dark:text-blue-400', badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { id: 'contacted', label: 'Attempted / Contacted', color: 'border-purple-500 text-purple-700 dark:text-purple-400', badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { id: 'qualified', label: 'Qualified / Needs Set', color: 'border-amber-500 text-amber-700 dark:text-amber-400', badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { id: 'viewing_scheduled', label: 'Viewing Scheduled', color: 'border-cyan-500 text-cyan-700 dark:text-cyan-400', badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  { id: 'offer_submitted', label: 'Offer / Negotiation', color: 'border-orange-500 text-orange-700 dark:text-orange-400', badgeBg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  { id: 'deal_won', label: 'Deal Won / Closed', color: 'border-emerald-600 text-emerald-700 dark:text-emerald-400', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  leads,
  onSelectLead,
  onUpdateLeadStatus,
  onOpenQuickWhatsApp,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.propertyLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery);

      const matchesSource = selectedSource === 'all' || lead.source === selectedSource;
      const matchesUrgency = selectedUrgency === 'all' || lead.urgency === selectedUrgency;
      const matchesAgent = selectedAgent === 'all' || lead.assignedAgent.name.includes(selectedAgent);

      return matchesSearch && matchesSource && matchesUrgency && matchesAgent;
    });
  }, [leads, searchQuery, selectedSource, selectedUrgency, selectedAgent]);

  // Source badges styling helper
  const getSourceBadge = (source: LeadSource) => {
    switch (source) {
      case 'Property 24':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Property 24
          </span>
        );
      case 'Private Property':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            Private Property
          </span>
        );
      case 'Ptah Realty Website':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Ptah Website
          </span>
        );
      case 'Facebook / Instagram Ads':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Meta Ads
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {source}
          </span>
        );
    }
  };

  // High-level pipeline stats
  const totalPipelineValue = useMemo(() => {
    return filteredLeads.reduce((acc, lead) => acc + (lead.dealValue || lead.propertyPrice || 0), 0);
  }, [filteredLeads]);

  const urgentLeadsCount = useMemo(() => {
    return filteredLeads.filter((l) => l.urgency === 'urgent' && l.status === 'new').length;
  }, [filteredLeads]);

  return (
    <div className="space-y-4">
      {/* Top Controls & Metrics Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Leads:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{filteredLeads.length}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Pipeline Value:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{formatShortCurrency(totalPipelineValue)}</span>
            </div>
            {urgentLeadsCount > 0 && (
              <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/60 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-medium">
                <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
                <span className="font-bold">{urgentLeadsCount} Urgent Uncontacted Leads!</span>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'kanban' 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Kanban Stages
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'list' 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Table List View
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, Property 24 ref, location, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Source Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer font-medium"
            >
              <option value="all">All Lead Sources</option>
              <option value="Property 24">Property 24</option>
              <option value="Private Property">Private Property</option>
              <option value="Ptah Realty Website">Ptah Website</option>
              <option value="Facebook / Instagram Ads">Meta Ads</option>
              <option value="Competitor Syndication">Competitor Syndication</option>
              <option value="Direct Call / Walk-in">Direct Call / Walk-in</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer font-medium"
            >
              <option value="all">All Urgency</option>
              <option value="urgent">🔥 Urgent Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.id);
            const columnValue = columnLeads.reduce((acc, l) => acc + (l.dealValue || l.propertyPrice || 0), 0);

            return (
              <div
                key={col.id}
                className="bg-slate-100/80 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col min-w-[280px] xl:min-w-0 transition-colors"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${col.id === 'deal_won' ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-500 dark:bg-slate-400'}`} />
                    <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 tracking-wide">{col.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Sub-value total */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 px-1 flex justify-between items-center">
                  <span>Value:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatShortCurrency(columnValue)}</span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 scrollbar-thin">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {columnLeads.length === 0 ? (
                      <motion.div
                        key={`empty-${col.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-28 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs italic bg-white/50 dark:bg-slate-800/30"
                      >
                        No leads in stage
                      </motion.div>
                    ) : (
                      columnLeads.map((lead) => {
                        const nextStage = PIPELINE_COLUMNS[PIPELINE_COLUMNS.findIndex((c) => c.id === lead.status) + 1]?.id;
                        const prevStage = PIPELINE_COLUMNS[PIPELINE_COLUMNS.findIndex((c) => c.id === lead.status) - 1]?.id;

                        return (
                          <motion.div
                            key={lead.id}
                            layout
                            layoutId={`lead-card-${lead.id}`}
                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94, y: -12 }}
                            transition={{
                              duration: 0.26,
                              ease: [0.16, 1, 0.3, 1],
                              layout: { duration: 0.28, ease: 'easeOut' }
                            }}
                            onClick={() => onSelectLead(lead)}
                            className="group bg-white dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer relative"
                          >
                            {/* Lead Score & Urgency indicator */}
                            <div className="flex items-center justify-between mb-2">
                              {getSourceBadge(lead.source)}

                              <div className="flex items-center space-x-1.5">
                                {lead.urgency === 'urgent' && (
                                  <span className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                                    <Flame className="w-2.5 h-2.5 mr-0.5" /> HOT
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                    lead.leadScore >= 90
                                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                      : lead.leadScore >= 75
                                      ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                  }`}
                                  title={`Lead Score: ${lead.leadScore}/100`}
                                >
                                  Score: {lead.leadScore}
                                </span>
                              </div>
                            </div>

                            {/* Client Name & Reference */}
                            <div className="mb-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition line-clamp-1">
                                  {lead.name}
                                </h4>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{lead.referenceNumber}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                                <span>{lead.propertyTitle}</span>
                              </p>
                            </div>

                            {/* Property Price / Budget */}
                            <div className="flex items-center justify-between text-xs py-1.5 my-1.5 border-y border-slate-100 dark:border-slate-700/60">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">Budget:</span>
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(lead.propertyPrice)}</span>
                            </div>

                            {/* Pending Tasks Count */}
                            {lead.tasks.filter((t) => t.status === 'pending').length > 0 && (
                              <div className="flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300 mb-2 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>{lead.tasks.filter((t) => t.status === 'pending').length} tasks pending</span>
                                </span>
                              </div>
                            )}

                            {/* Quick Stage Stepper & Actions */}
                            <div className="flex items-center justify-between pt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                {prevStage && (
                                  <button
                                    onClick={() => onUpdateLeadStatus(lead.id, prevStage)}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                                    title="Move to Previous Stage"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {nextStage && (
                                  <button
                                    onClick={() => onUpdateLeadStatus(lead.id, nextStage)}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[10px] font-semibold flex items-center space-x-0.5 transition"
                                    title="Advance to Next Stage"
                                  >
                                    <span>Advance</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => onOpenQuickWhatsApp(lead)}
                                  className="p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                                  title="1-Click WhatsApp Quick Message"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                                  title="Call Lead"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => onSelectLead(lead)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                                  title="Open Full Details"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Lead & Contact</th>
                  <th className="p-3.5">Portal Source</th>
                  <th className="p-3.5">Property of Interest</th>
                  <th className="p-3.5">Budget / Value</th>
                  <th className="p-3.5">Pipeline Stage</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Assigned Agent</th>
                  <th className="p-3.5">Received</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                      No leads match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                    >
                      {/* Name & Contact */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {lead.phone} • {lead.email}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="p-3.5">{getSourceBadge(lead.source)}</td>

                      {/* Property */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{lead.propertyTitle}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{lead.propertyLocation}</div>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(lead.propertyPrice)}
                      </td>

                      {/* Stage Selector */}
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 font-medium"
                        >
                          {PIPELINE_COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Score */}
                      <td className="p-3.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                            lead.leadScore >= 90
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : lead.leadScore >= 75
                              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {lead.leadScore}
                        </span>
                      </td>

                      {/* Agent */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center space-x-2">
                          <img
                            src={lead.assignedAgent.avatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <span className="truncate max-w-[120px] font-medium">{lead.assignedAgent.name}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {formatRelativeTime(lead.inquiryDate)}
                      </td>

                      {/* Quick Actions */}
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onOpenQuickWhatsApp(lead)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
                            title="Quick WhatsApp message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition cursor-pointer"
                            title="Call Lead"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
