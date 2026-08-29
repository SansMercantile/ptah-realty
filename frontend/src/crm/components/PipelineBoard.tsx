import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Phone, 
  MessageSquare, 
  Clock, 
  Building, 
  Flame, 
  ChevronRight, 
  ChevronLeft, 
  DollarSign, 
  Move, 
  ArrowDown, 
  TrendingUp, 
  Award, 
  Users, 
  X, 
  Check,
  Zap,
  Target,
  CheckSquare,
  Square,
  UserCheck,
  Layers,
  Download,
  ShieldCheck
} from 'lucide-react';
import { Lead, LeadSource, LeadStatus } from '../types';
import { formatCurrency, formatShortCurrency, formatRelativeTime, exportLeadsToCSV } from '../utils/formatters';
import { INITIAL_AGENTS } from '../data/mockData';

interface PipelineBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onOpenQuickWhatsApp: (lead: Lead) => void;
  onBulkReassignAgent?: (leadIds: string[], agent: typeof INITIAL_AGENTS[0]) => void;
  onBulkChangeStatus?: (leadIds: string[], status: LeadStatus) => void;
}

export const PIPELINE_COLUMNS: { id: LeadStatus; label: string; color: string; badgeBg: string }[] = [
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
  onBulkReassignAgent,
  onBulkChangeStatus,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');

  // Multi-Select state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [showBulkReassignModal, setShowBulkReassignModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkTargetAgentEmail, setBulkTargetAgentEmail] = useState(INITIAL_AGENTS[0]?.email || '');
  const [bulkTargetStatus, setBulkTargetStatus] = useState<LeadStatus>('contacted');

  // Click and Drop state
  const [pickedUpLead, setPickedUpLead] = useState<Lead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<LeadStatus | null>(null);
  const [quickMoveLeadId, setQuickMoveLeadId] = useState<string | null>(null);

  // Clear pickedUpLead on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPickedUpLead(null);
        setQuickMoveLeadId(null);
        setShowBulkReassignModal(false);
        setShowBulkStatusModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDropLead = (leadId: string, targetStatus: LeadStatus) => {
    onUpdateLeadStatus(leadId, targetStatus);
    setPickedUpLead(null);
    setQuickMoveLeadId(null);
    setDraggedLeadId(null);
    setDragOverColumnId(null);
  };

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

  // Selected leads list and total valuation
  const selectedLeads = useMemo(() => {
    return leads.filter((l) => selectedLeadIds.includes(l.id));
  }, [leads, selectedLeadIds]);

  const selectedTotalValuation = useMemo(() => {
    return selectedLeads.reduce((acc, l) => acc + (l.dealValue || l.propertyPrice || 0), 0);
  }, [selectedLeads]);

  // Multi-select actions
  const handleToggleLeadSelect = (leadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredLeads.map((l) => l.id);
    const allSelected = filteredIds.every((id) => selectedLeadIds.includes(id));
    if (allSelected) {
      // Unselect filtered
      setSelectedLeadIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedLeadIds([]);
  };

  const handleExecuteBulkReassign = () => {
    const targetAgent = INITIAL_AGENTS.find((a) => a.email === bulkTargetAgentEmail) || INITIAL_AGENTS[0];
    if (onBulkReassignAgent) {
      onBulkReassignAgent(selectedLeadIds, targetAgent);
    }
    setShowBulkReassignModal(false);
    setSelectedLeadIds([]);
  };

  const handleExecuteBulkStatusChange = () => {
    if (onBulkChangeStatus) {
      onBulkChangeStatus(selectedLeadIds, bulkTargetStatus);
    } else {
      selectedLeadIds.forEach((id) => onUpdateLeadStatus(id, bulkTargetStatus));
    }
    setShowBulkStatusModal(false);
    setSelectedLeadIds([]);
  };

  const handleExecuteMassExport = () => {
    exportLeadsToCSV(selectedLeads.length > 0 ? selectedLeads : filteredLeads);
  };

  // High-level pipeline stats
  const totalPipelineValue = useMemo(() => {
    return leads.reduce((acc, lead) => acc + (lead.dealValue || lead.propertyPrice || 0), 0);
  }, [leads]);

  const urgentLeadsCount = useMemo(() => {
    return leads.filter((l) => l.urgency === 'urgent' && (l.status === 'new' || l.status === 'contacted')).length;
  }, [leads]);

  const wonLeads = useMemo(() => {
    return leads.filter((l) => l.status === 'deal_won');
  }, [leads]);

  const wonValue = useMemo(() => {
    return wonLeads.reduce((acc, l) => acc + (l.dealValue || l.propertyPrice || 0), 0);
  }, [wonLeads]);

  const conversionRate = useMemo(() => {
    if (leads.length === 0) return 0;
    return Math.round((wonLeads.length / leads.length) * 100);
  }, [leads.length, wonLeads.length]);

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

  const isAllFilteredSelected = filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeadIds.includes(l.id));

  return (
    <div className="space-y-4 relative">
      {/* 1. ELEVATED LEAD METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Pipeline Value */}
        <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 dark:border-slate-700/40 shadow-lg relative overflow-hidden transition hover:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Pipeline Value</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatShortCurrency(totalPipelineValue)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Est. Commission (5%):</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatShortCurrency(totalPipelineValue * 0.05)}</span>
          </div>
        </div>

        {/* Metric 2: HOT / High-Intent Leads Card (HOT TAG AT TOP RIGHT CORNER) */}
        <div 
          onClick={() => setSelectedUrgency(selectedUrgency === 'urgent' ? 'all' : 'urgent')}
          className={`bg-white dark:bg-black rounded-2xl p-4 border shadow-xs relative overflow-hidden transition cursor-pointer hover:shadow-md ${
            selectedUrgency === 'urgent' 
              ? 'border-red-500 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20' 
              : 'border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800'
          }`}
        >
          {/* THE HOT TAG PLACED AT THE TOP RIGHT CORNER OF THE METRIC CARD */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-600 dark:bg-red-500 text-white font-bold text-[10px] shadow-xs tracking-wider animate-pulse">
              <Flame className="w-3 h-3 fill-current" />
              <span>HOT</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>High-Intent Inquiries</span>
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">
            {urgentLeadsCount} Leads
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">SLA Requirement:</span>
            <span className="font-semibold text-red-700 dark:text-red-300">Under 15m callback</span>
          </div>
        </div>

        {/* Metric 3: Active Agency Leads & Inflow */}
        <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 dark:border-slate-700/40 shadow-lg relative overflow-hidden transition hover:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Agency Leads</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {filteredLeads.length} <span className="text-sm font-normal text-slate-400">/ {leads.length}</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">New Inbound Today:</span>
            <span className="font-bold text-blue-700 dark:text-blue-400">{leads.filter(l => l.status === 'new').length} Inquiries</span>
          </div>
        </div>

        {/* Metric 4: Closed Deals & Conversion */}
        <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 dark:border-slate-700/40 shadow-lg relative overflow-hidden transition hover:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Closed & Won Deals</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {wonLeads.length} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">({conversionRate}%)</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Deeds Registered:</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">{formatShortCurrency(wonValue)}</span>
          </div>
        </div>
      </div>

      {/* 2. CLICK-AND-DROP ACTIVE BANNER */}
      {pickedUpLead && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-emerald-900 text-white p-3.5 rounded-2xl shadow-xl border border-emerald-500/50 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center space-x-3 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div>
              <span className="font-bold text-emerald-300">Click-and-Drop Active:</span>{' '}
              <span>Moving <strong>{pickedUpLead.name}</strong> ({pickedUpLead.propertyTitle})</span>
              <span className="text-emerald-300/80 ml-2 hidden sm:inline">
                Current: <em>{PIPELINE_COLUMNS.find(c => c.id === pickedUpLead.status)?.label}</em>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-emerald-200 hidden md:inline">Click any column below to drop, or jump:</span>
            <select
              value={pickedUpLead.status}
              onChange={(e) => handleDropLead(pickedUpLead.id, e.target.value as LeadStatus)}
              className="bg-emerald-950 text-white text-xs px-3 py-1.5 rounded-xl border border-emerald-700 font-semibold cursor-pointer focus:outline-none"
            >
              {PIPELINE_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  Drop into: {c.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setPickedUpLead(null)}
              className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold text-white transition cursor-pointer flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. FLOATING BULK OPERATIONS TOOLBAR (APPEARS WHEN LEADS ARE SELECTED) */}
      <AnimatePresence>
        {selectedLeadIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="sticky top-4 z-30 bg-slate-900/95 dark:bg-emerald-950/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white">
                    {selectedLeadIds.length} Lead{selectedLeadIds.length > 1 ? 's' : ''} Selected
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                    Valuation: {formatCurrency(selectedTotalValuation)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 dark:text-emerald-200/80 mt-0.5">
                  Perform bulk administrative changes across all checked prospects simultaneously.
                </p>
              </div>
            </div>

            {/* Bulk Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Reassign Agent */}
              <button
                onClick={() => setShowBulkReassignModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reassign Agent</span>
              </button>

              {/* 2. Bulk Change Status */}
              <button
                onClick={() => setShowBulkStatusModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Bulk Change Status</span>
              </button>

              {/* 3. Mass Export to CSV */}
              <button
                onClick={handleExecuteMassExport}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Mass Export ({selectedLeadIds.length}) CSV</span>
              </button>

              {/* Clear */}
              <button
                onClick={handleClearSelection}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
                title="Deselect All"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. CONTROLS & FILTER STRIP */}
      <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/50 dark:border-slate-700/40 shadow-lg transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search bar */}
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

          {/* Filters & Bulk Select All Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Multi-Select All in View Button */}
            <button
              onClick={handleSelectAllFiltered}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                isAllFilteredSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isAllFilteredSelected ? 'Deselect View' : `Select View (${filteredLeads.length})`}</span>
            </button>

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

            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer font-medium"
            >
              <option value="all">All Urgencies</option>
              <option value="urgent">🔥 Urgent Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'kanban' 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  viewMode === 'list' 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Table List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PIPELINE VIEW (KANBAN OR TABLE) */}
      {viewMode === 'kanban' ? (
        // Fixed breakpoint column counts (md:2, lg:3, xl:6) left each
        // column at whatever 1/N share of the container that produced --
        // combined with min-w-[280px] xl:min-w-0 (min-width zeroed right
        // at the breakpoint that turns on 6 columns) and `main` capped at
        // max-w-7xl (1280px), that crushed every column to ~195px
        // regardless of actual screen width. There are always exactly 6
        // pipeline stages, so this stays a fixed 6-column template (not
        // auto-fit, which would wrap onto multiple rows on medium-width
        // screens instead of the intended single horizontally-scrollable
        // row) -- minmax(260px, 1fr) gives every column a real floor and
        // lets them share whatever room `main` actually has (now
        // max-w-[1920px], see CRMApp.tsx) instead of a fixed count
        // fighting a fixed cap. overflow-x-auto is the fallback below
        // that floor.
        <div className="grid gap-4 overflow-x-auto pb-4" style={{ gridTemplateColumns: 'repeat(6, minmax(260px, 1fr))' }}>
          {PIPELINE_COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.id);
            const columnValue = columnLeads.reduce((acc, l) => acc + (l.dealValue || l.propertyPrice || 0), 0);
            const isDropTargetActive = pickedUpLead !== null;
            const isDragOver = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverColumnId(col.id);
                }}
                onDragLeave={() => {
                  setDragOverColumnId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const leadId = e.dataTransfer.getData('text/plain');
                  if (leadId) {
                    handleDropLead(leadId, col.id);
                  }
                }}
                onClick={() => {
                  if (pickedUpLead && pickedUpLead.status !== col.id) {
                    handleDropLead(pickedUpLead.id, col.id);
                  }
                }}
                className={`rounded-2xl border p-3 flex flex-col min-w-[260px] backdrop-blur-lg transition-all ${
                  isDragOver
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-400'
                    : isDropTargetActive && pickedUpLead?.status !== col.id
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700/60'
                    : 'bg-white/40 dark:bg-black/40 border-white/50 dark:border-slate-700/30'
                }`}
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
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 px-1 flex justify-between items-center">
                  <span>Value:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatShortCurrency(columnValue)}</span>
                </div>

                {/* CLICK-AND-DROP TARGET BUTTON */}
                {pickedUpLead && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropLead(pickedUpLead.id, col.id);
                    }}
                    className={`w-full py-2 px-2.5 rounded-xl border-2 border-dashed font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer mb-2.5 shadow-xs ${
                      pickedUpLead.status === col.id
                        ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                        : 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 animate-pulse scale-[1.01]'
                    }`}
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{pickedUpLead.status === col.id ? 'Current Stage' : `Drop ${pickedUpLead.name.split(' ')[0]} Here`}</span>
                  </button>
                )}

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
                        {pickedUpLead ? 'Click to drop here' : 'No leads in stage'}
                      </motion.div>
                    ) : (
                      columnLeads.map((lead) => {
                        const nextStage = PIPELINE_COLUMNS[PIPELINE_COLUMNS.findIndex((c) => c.id === lead.status) + 1]?.id;
                        const prevStage = PIPELINE_COLUMNS[PIPELINE_COLUMNS.findIndex((c) => c.id === lead.status) - 1]?.id;
                        const isPickedUp = pickedUpLead?.id === lead.id;
                        const isDragging = draggedLeadId === lead.id;
                        const isSelected = selectedLeadIds.includes(lead.id);

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
                            draggable={true}
                            // framer-motion's motion.div types onDragStart/
                            // onDragEnd for its own pointer-based drag
                            // gesture (MouseEvent | PointerEvent |
                            // TouchEvent), not native HTML5 drag-and-drop --
                            // but draggable=true still fires real browser
                            // dragstart/dragend events with a real
                            // DataTransfer at runtime regardless of what
                            // TS infers here, so this is a type-only `any`
                            // to unblock that mismatch, not a behavior change.
                            onDragStart={(e: any) => {
                              e.dataTransfer.setData('text/plain', lead.id);
                              setDraggedLeadId(lead.id);
                            }}
                            onDragEnd={() => {
                              setDraggedLeadId(null);
                            }}
                            onClick={() => onSelectLead(lead)}
                            className={`group bg-white/70 dark:bg-slate-800/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-800/80 border rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/30'
                                : isPickedUp
                                ? 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20'
                                : isDragging
                                ? 'opacity-40 border-dashed border-emerald-500'
                                : 'border-white/60 dark:border-slate-700/50 hover:border-emerald-500 dark:hover:border-emerald-500'
                            }`}
                          >
                            {/* THE HOT TAG MOVED TO TOP RIGHT CORNER OF THE CARD */}
                            {lead.urgency === 'urgent' && (
                              <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                                <span className="inline-flex items-center space-x-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 dark:bg-red-500 text-white shadow-xs animate-pulse">
                                  <Flame className="w-2.5 h-2.5 fill-current" />
                                  <span>HOT</span>
                                </span>
                              </div>
                            )}

                            {/* Top row: Multi-Select Checkbox, Source badge & Score */}
                            <div className="flex items-center justify-between mb-2 pr-12">
                              <div className="flex items-center space-x-2">
                                <div
                                  onClick={(e) => handleToggleLeadSelect(lead.id, e)}
                                  className="cursor-pointer p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                  title={isSelected ? 'Deselect Lead' : 'Select Lead for Bulk Action'}
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950/60" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-400 hover:text-emerald-600 transition" />
                                  )}
                                </div>
                                {getSourceBadge(lead.source)}
                              </div>

                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  lead.leadScore >= 90
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                    : lead.leadScore >= 75
                                    ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                }`}
                                title={`Lead Quality Score: ${lead.leadScore}/100`}
                              >
                                {lead.leadScore} pts
                              </span>
                            </div>

                            {/* Client Name & Property Title */}
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

                            {/* Action Strip: Click-and-Drop Button & Quick Moves */}
                            <div className="flex items-center justify-between pt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                              {/* Left: Click-and-Drop Grab button */}
                              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setPickedUpLead(isPickedUp ? null : lead)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer ${
                                    isPickedUp
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                                  }`}
                                  title="Click to Pick Up and Drop into any Stage"
                                >
                                  <Move className="w-2.5 h-2.5" />
                                  <span>{isPickedUp ? 'Selected' : 'Move'}</span>
                                </button>

                                {prevStage && (
                                  <button
                                    onClick={() => onUpdateLeadStatus(lead.id, prevStage)}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                                    title="Move to Previous Stage"
                                  >
                                    <ChevronLeft className="w-3 h-3" />
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

                              {/* Right: Quick actions */}
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
        <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleSelectAllFiltered}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                      title="Select / Deselect all in view"
                    />
                  </th>
                  <th className="p-3.5">Lead & Contact</th>
                  <th className="p-3.5">Portal Source</th>
                  <th className="p-3.5">Property of Interest</th>
                  <th className="p-3.5">Budget / Value</th>
                  <th className="p-3.5">Pipeline Stage (Click to Move)</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Assigned Agent</th>
                  <th className="p-3.5">Received</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                      No leads match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group ${
                        isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/30' : ''
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleLeadSelect(lead.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                        />
                      </td>

                      {/* Name & Contact */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                            {lead.name}
                          </span>
                          {lead.urgency === 'urgent' && (
                            <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                              <Flame className="w-2.5 h-2.5 fill-current" />
                              <span>HOT</span>
                            </span>
                          )}
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
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 font-medium cursor-pointer"
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL: BULK REASSIGN AGENT */}
      {showBulkReassignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-black rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Bulk Reassign Agent</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reassign {selectedLeadIds.length} selected lead{selectedLeadIds.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkReassignModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Target Real Estate Agent:
                </label>
                <div className="space-y-2">
                  {INITIAL_AGENTS.map((agent) => (
                    <div
                      key={agent.email}
                      onClick={() => setBulkTargetAgentEmail(agent.email)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        bulkTargetAgentEmail === agent.email
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 ring-2 ring-emerald-400/40'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={agent.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{agent.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{agent.email}</div>
                        </div>
                      </div>
                      {bulkTargetAgentEmail === agent.email && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  All communication logs, scheduled calendar viewings, and WhatsApp history will be preserved and reassigned seamlessly.
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowBulkReassignModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkReassign}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Reassignment</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 7. MODAL: BULK CHANGE STATUS */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-black rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Bulk Change Stage</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Move {selectedLeadIds.length} selected lead{selectedLeadIds.length > 1 ? 's' : ''} to a new status
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Target Pipeline Stage:
                </label>
                <div className="space-y-2">
                  {PIPELINE_COLUMNS.map((col) => (
                    <div
                      key={col.id}
                      onClick={() => setBulkTargetStatus(col.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        bulkTargetStatus === col.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 ring-2 ring-emerald-400/40'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.id === 'deal_won' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">{col.label}</span>
                      </div>
                      {bulkTargetStatus === col.id && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowBulkStatusModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkStatusChange}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Apply Status Transition</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
