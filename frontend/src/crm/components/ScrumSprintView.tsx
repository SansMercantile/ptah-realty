import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  TrendingUp,
  Plus,
  Move,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Filter,
  Check,
  Award,
  Video,
  Layers,
  FileCheck,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Lead, ScrumSprint, StandupBlocker } from '../types';
import { formatCurrency, formatShortCurrency, formatRelativeTime } from '../utils/formatters';

interface ScrumSprintViewProps {
  leads: Lead[];
  sprint: ScrumSprint;
  onUpdateSprint: (updatedSprint: ScrumSprint) => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
}

interface ScrumColumn {
  id: 'backlog' | 'in_progress' | 'viewing_staged' | 'negotiation' | 'done';
  label: string;
  badgeBg: string;
  description: string;
}

const SCRUM_COLUMNS: ScrumColumn[] = [
  {
    id: 'backlog',
    label: 'Sprint Backlog',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    description: 'Prioritized luxury mandates & high-fit buyer leads for this sprint.',
  },
  {
    id: 'in_progress',
    label: 'In Discovery & Vetting',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'FICA compliance, budget qualification & Zoom discovery underway.',
  },
  {
    id: 'viewing_staged',
    label: 'VIP Tours & Walkthroughs',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    description: '4K Zoom walkthroughs, Matterport 3D reviews & on-site inspections.',
  },
  {
    id: 'negotiation',
    label: 'OTP & Suspensive Terms',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Offer to Purchase drafting, bond pre-approvals & conveyancing.',
  },
  {
    id: 'done',
    label: 'Sprint Done / Conveyanced',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Registered deeds, signed unconditional OTPs or secured mandates.',
  },
];

export const ScrumSprintView: React.FC<ScrumSprintViewProps> = ({
  leads,
  sprint,
  onUpdateSprint,
  onUpdateLead,
  onSelectLead,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [pickedUpLead, setPickedUpLead] = useState<Lead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [newBlockerTitle, setNewBlockerTitle] = useState('');
  const [newBlockerCategory, setNewBlockerCategory] = useState<StandupBlocker['category']>('deeds_office');
  const [newBlockerSeverity, setNewBlockerSeverity] = useState<StandupBlocker['severity']>('high');
  const [newBlockerLeadId, setNewBlockerLeadId] = useState<string>('');

  // Sprints story points and velocity calculations
  const totalSprintPoints = useMemo(() => {
    return leads.reduce((sum, l) => sum + (l.storyPoints || 3), 0);
  }, [leads]);

  const completedSprintPoints = useMemo(() => {
    return leads
      .filter((l) => (l.sprintStage || 'backlog') === 'done')
      .reduce((sum, l) => sum + (l.storyPoints || 3), 0);
  }, [leads]);

  const burnPercentage = useMemo(() => {
    if (totalSprintPoints === 0) return 0;
    return Math.round((completedSprintPoints / totalSprintPoints) * 100);
  }, [completedSprintPoints, totalSprintPoints]);

  const activeBlockers = useMemo(() => {
    return sprint.dailyBlockers.filter((b) => !b.isResolved);
  }, [sprint.dailyBlockers]);

  // Handle stage update via click-and-drop or drag-and-drop
  const handleMoveSprintStage = (leadId: string, newStage: ScrumColumn['id']) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    // Update lead sprintStage
    const updatedLead: Lead = {
      ...lead,
      sprintStage: newStage,
    };
    onUpdateLead(updatedLead);
    setPickedUpLead(null);
    setDraggedLeadId(null);
    setDragOverColumnId(null);
  };

  // Toggle Standup Blocker resolved
  const handleToggleBlocker = (blockerId: string) => {
    const updatedBlockers = sprint.dailyBlockers.map((b) => {
      if (b.id === blockerId) {
        return {
          ...b,
          isResolved: !b.isResolved,
          resolutionNote: !b.isResolved ? 'Resolved during real estate daily standup.' : undefined,
        };
      }
      return b;
    });

    onUpdateSprint({
      ...sprint,
      dailyBlockers: updatedBlockers,
    });
  };

  // Add new standup blocker
  const handleAddBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockerTitle.trim()) return;

    const matchedLead = leads.find((l) => l.id === newBlockerLeadId);
    const newBlocker: StandupBlocker = {
      id: `blk-${Date.now()}`,
      title: newBlockerTitle.trim(),
      category: newBlockerCategory,
      severity: newBlockerSeverity,
      reportedBy: 'Kagiso Mokoena (Broker Principal)',
      reportedAt: new Date().toISOString(),
      isResolved: false,
      leadId: matchedLead?.id,
      leadName: matchedLead?.name,
    };

    onUpdateSprint({
      ...sprint,
      dailyBlockers: [newBlocker, ...sprint.dailyBlockers],
    });

    setNewBlockerTitle('');
    setNewBlockerLeadId('');
    setIsBlockerModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. SPRINT HERO BANNER & METRICS */}
      <div className="bg-white dark:bg-black rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 flex items-center space-x-1">
                <Target className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>Agile Real Estate Sprint {sprint.number}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800">
                ● Active Sprint (Day 5 of 14)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
              {sprint.name}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl mt-1.5 leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-200">Sprint Goal:</strong> {sprint.goal}
            </p>
          </div>

          {/* Quick Action: Log Standup Blocker */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBlockerModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold transition cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Log Standup Blocker</span>
            </button>
          </div>
        </div>

        {/* Sprint Velocity KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Story Points Velocity</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {completedSprintPoints} <span className="text-sm font-normal text-slate-400">/ {totalSprintPoints} pts</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${burnPercentage}%` }}
              />
            </div>
            <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold mt-1">
              {burnPercentage}% Burn Completed
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Target Closed Value</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {formatShortCurrency(sprint.targetValueZar)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              R32.5M in conveyancing pipeline
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Target VIP Walkthroughs</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              14 <span className="text-sm font-normal text-slate-400">/ {sprint.targetViewings}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Zoom 4K & Matterport 3D tours
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 relative">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Active Standup Blockers</div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400">
              {activeBlockers.length} <span className="text-sm font-normal text-slate-400">Bottlenecks</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Deeds Office & FICA audits
            </div>
          </div>
        </div>
      </div>

      {/* 2. DAILY STANDUP BLOCKERS BOARD */}
      <div className="bg-white dark:bg-black rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Standup Bottlenecks & Conveyancing Impediments
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Impediments raised during morning broker standup requiring conveyancer or principal intervention.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {activeBlockers.length} Active / {sprint.dailyBlockers.length} Total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {sprint.dailyBlockers.map((blocker) => (
            <div
              key={blocker.id}
              className={`p-4 rounded-2xl border transition relative ${
                blocker.isResolved
                  ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                  : blocker.severity === 'critical'
                  ? 'bg-red-50/60 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                  : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                    blocker.isResolved
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      : blocker.severity === 'critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {blocker.isResolved ? 'Resolved' : blocker.severity}
                </span>

                <button
                  onClick={() => handleToggleBlocker(blocker.id)}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    blocker.isResolved
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                  title={blocker.isResolved ? 'Reopen Blocker' : 'Resolve Blocker'}
                >
                  <Check className="w-3 h-3" />
                  <span className="text-[10px]">{blocker.isResolved ? 'Reopen' : 'Resolve'}</span>
                </button>
              </div>

              <h4 className={`text-xs font-bold leading-snug mb-1 ${blocker.isResolved ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                {blocker.title}
              </h4>

              {blocker.leadName && (
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center space-x-1">
                  <Building className="w-3 h-3" />
                  <span>Lead: {blocker.leadName}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>By: {blocker.reportedBy.split(' ')[0]}</span>
                <span>{formatRelativeTime(blocker.reportedAt)}</span>
              </div>

              {blocker.resolutionNote && (
                <div className="mt-2 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  ✓ {blocker.resolutionNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. CLICK-AND-DROP ACTIVE BANNER */}
      {pickedUpLead && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-purple-900 text-white p-3.5 rounded-2xl shadow-xl border border-purple-500/50 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center space-x-3 text-xs">
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping shrink-0" />
            <div>
              <span className="font-bold text-purple-300">Scrum Click-and-Drop Active:</span>{' '}
              <span>Moving <strong>{pickedUpLead.name}</strong> ({pickedUpLead.storyPoints || 3} Story Pts)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-purple-200 hidden sm:inline">Click any Scrum column to drop, or jump:</span>
            <select
              value={pickedUpLead.sprintStage || 'backlog'}
              onChange={(e) => handleMoveSprintStage(pickedUpLead.id, e.target.value as ScrumColumn['id'])}
              className="bg-purple-950 text-white text-xs px-3 py-1.5 rounded-xl border border-purple-700 font-semibold cursor-pointer focus:outline-none"
            >
              {SCRUM_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  Drop into: {c.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setPickedUpLead(null)}
              className="px-3 py-1.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-xs font-semibold text-white transition cursor-pointer flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. AGILE SCRUM SPRINT BOARD (CLICK & DROP + DRAG & DROP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {SCRUM_COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => (l.sprintStage || 'backlog') === col.id);
          const colPoints = colLeads.reduce((acc, l) => acc + (l.storyPoints || 3), 0);
          const isDragOver = dragOverColumnId === col.id;
          const isTargetActive = pickedUpLead !== null;

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
                  handleMoveSprintStage(leadId, col.id);
                }
              }}
              onClick={() => {
                if (pickedUpLead && (pickedUpLead.sprintStage || 'backlog') !== col.id) {
                  handleMoveSprintStage(pickedUpLead.id, col.id);
                }
              }}
              className={`rounded-3xl border p-4 flex flex-col min-w-[280px] xl:min-w-0 transition-all ${
                isDragOver
                  ? 'bg-purple-50/70 dark:bg-purple-950/50 border-purple-500 ring-2 ring-purple-400'
                  : isTargetActive && (pickedUpLead?.sprintStage || 'backlog') !== col.id
                  ? 'bg-purple-50/30 dark:bg-purple-950/20 border-purple-400 dark:border-purple-700/60'
                  : 'bg-slate-100/80 dark:bg-black/90 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.id === 'done' ? 'bg-emerald-600' : 'bg-purple-600'}`} />
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">{col.label}</h3>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {colPoints} pts
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {colLeads.length}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
                {col.description}
              </p>

              {/* Click-and-Drop Column Action Button */}
              {pickedUpLead && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveSprintStage(pickedUpLead.id, col.id);
                  }}
                  className={`w-full py-2 px-2.5 rounded-xl border-2 border-dashed font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer mb-3 shadow-xs ${
                    (pickedUpLead.sprintStage || 'backlog') === col.id
                      ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : 'border-purple-500 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/80 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 animate-pulse scale-[1.01]'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                  <span>{(pickedUpLead.sprintStage || 'backlog') === col.id ? 'Current Stage' : `Drop into ${col.label}`}</span>
                </button>
              )}

              {/* Lead Cards List in Scrum Column */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[65vh] pr-1 scrollbar-thin">
                <AnimatePresence mode="popLayout" initial={false}>
                  {colLeads.length === 0 ? (
                    <motion.div
                      key={`scrum-empty-${col.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-28 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 text-xs italic bg-white/50 dark:bg-slate-800/30"
                    >
                      {pickedUpLead ? 'Click to drop here' : 'No items in this sprint stage'}
                    </motion.div>
                  ) : (
                    colLeads.map((lead) => {
                      const isPickedUp = pickedUpLead?.id === lead.id;
                      const isDragging = draggedLeadId === lead.id;

                      return (
                        <motion.div
                          key={`scrum-card-${lead.id}`}
                          layout
                          layoutId={`scrum-lead-${lead.id}`}
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.94 }}
                          draggable={true}
                          // framer-motion's motion.div types onDragStart/
                          // onDragEnd for its own pointer-based drag
                          // gesture (MouseEvent | PointerEvent |
                          // TouchEvent), not native HTML5 drag-and-drop --
                          // but draggable=true still fires real browser
                          // dragstart/dragend events with a real
                          // DataTransfer at runtime regardless of what TS
                          // infers here, so this is a type-only `any` to
                          // unblock that mismatch, not a behavior change.
                          onDragStart={(e: any) => {
                            e.dataTransfer.setData('text/plain', lead.id);
                            setDraggedLeadId(lead.id);
                          }}
                          onDragEnd={() => {
                            setDraggedLeadId(null);
                          }}
                          onClick={() => onSelectLead(lead)}
                          className={`bg-white dark:bg-slate-800 rounded-2xl p-3.5 border shadow-xs hover:shadow-md transition cursor-pointer relative ${
                            isPickedUp
                              ? 'border-purple-500 ring-2 ring-purple-400 bg-purple-50/20 dark:bg-purple-950/20'
                              : isDragging
                              ? 'opacity-40 border-dashed border-purple-500'
                              : 'border-slate-200 dark:border-slate-700/80 hover:border-purple-500 dark:hover:border-purple-500'
                          }`}
                        >
                          {/* TOP RIGHT CORNER HOT TAG */}
                          {lead.urgency === 'urgent' && (
                            <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                              <span className="inline-flex items-center space-x-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs animate-pulse">
                                <Flame className="w-2.5 h-2.5 fill-current" />
                                <span>HOT</span>
                              </span>
                            </div>
                          )}

                          {/* Story Points Badge & Category */}
                          <div className="flex items-center space-x-1.5 mb-2 pr-12">
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800">
                              {lead.storyPoints || 3} Story Pts
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                              {lead.source}
                            </span>
                          </div>

                          {/* Client Name & Property */}
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-purple-600">
                            {lead.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {lead.propertyTitle}
                          </p>

                          {/* Deal Value */}
                          <div className="flex items-center justify-between text-xs py-1.5 my-1.5 border-y border-slate-100 dark:border-slate-700/60">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">Deal Value:</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              {formatCurrency(lead.propertyPrice)}
                            </span>
                          </div>

                          {/* Active Standup Blocker notice if tied to this lead */}
                          {sprint.dailyBlockers.some((b) => b.leadId === lead.id && !b.isResolved) && (
                            <div className="mb-2 p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center space-x-1 text-[10px] text-red-700 dark:text-red-300 font-semibold">
                              <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                              <span className="truncate">Active Standup Blocker flagged!</span>
                            </div>
                          )}

                          {/* Action Strip: Click-and-Drop Grab button */}
                          <div className="flex items-center justify-between pt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPickedUpLead(isPickedUp ? null : lead);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer ${
                                isPickedUp
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                              }`}
                              title="Click to Pick Up & Drop into any Scrum stage"
                            >
                              <Move className="w-2.5 h-2.5" />
                              <span>{isPickedUp ? 'Selected' : 'Move'}</span>
                            </button>

                            <div className="flex items-center space-x-1.5">
                              <img
                                src={lead.assignedAgent.avatar}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                title={`Assigned: ${lead.assignedAgent.name}`}
                              />
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

      {/* 5. LOG STANDUP BLOCKER MODAL */}
      {isBlockerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-black rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Raise Standup Blocker / Bottleneck
                  </h3>
                  <p className="text-xs text-slate-500">
                    Flag an obstacle preventing closing in Sprint {sprint.number}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBlockerModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBlocker} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Blocker Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Bank private bond valuation lag on Franschhoek Estate"
                  value={newBlockerTitle}
                  onChange={(e) => setNewBlockerTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newBlockerCategory}
                    onChange={(e) => setNewBlockerCategory(e.target.value as StandupBlocker['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="deeds_office">Cape Town Deeds Office</option>
                    <option value="bond_financing">Bond & Private Banking</option>
                    <option value="fica_legal">FICA & Offshore Trust</option>
                    <option value="municipal_rates">Municipal Clearance Rates</option>
                    <option value="seller_negotiation">Seller Counter-Offer</option>
                    <option value="other">Other Conveyancing</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Severity
                  </label>
                  <select
                    value={newBlockerSeverity}
                    onChange={(e) => setNewBlockerSeverity(e.target.value as StandupBlocker['severity'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="critical">🚨 Critical (Deal At Risk)</option>
                    <option value="high">⚠️ High Priority</option>
                    <option value="moderate">ℹ️ Moderate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Associate with Lead (Optional)
                </label>
                <select
                  value={newBlockerLeadId}
                  onChange={(e) => setNewBlockerLeadId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">-- No specific lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.propertyTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBlockerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Publish Blocker
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
