import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Building,
  User,
  CheckSquare,
  Activity,
  Zap,
  Kanban,
  Calendar,
  BarChart3,
  Sparkles,
  Radio,
  Plus,
  Moon,
  Sun,
  Settings,
  ArrowRight,
  Clock,
  ChevronRight,
  Phone,
  Mail,
  ShieldCheck,
  Flame,
  CornerDownLeft,
  X,
  Bell,
  Home,
  Megaphone
} from 'lucide-react';
import { Lead, ConnectorSyncEvent, TaskItem } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onToggleTask?: (leadId: string, taskId: string) => void;
  syncEvents: ConnectorSyncEvent[];
  onOpenSettings: () => void;
  onOpenSimulator: () => void;
  onOpenNewLead: () => void;
  onToggleAiAdvisor: () => void;
  onToggleDarkMode: () => void;
  darkMode: boolean;
  onNavigateView: (view: 'pipeline' | 'calendar' | 'automations' | 'reporting') => void;
  onOpenQuickListings?: () => void;
  onOpenNotifications?: () => void;
  onOpenCampaigns?: () => void;
}

type PaletteCategory = 'all' | 'leads' | 'tasks' | 'sync' | 'actions';

interface PaletteItem {
  id: string;
  category: 'leads' | 'tasks' | 'sync' | 'actions';
  title: string;
  subtitle: string;
  tag?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  action: () => void;
  meta?: any;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  leads,
  onSelectLead,
  onToggleTask,
  syncEvents,
  onOpenSettings,
  onOpenSimulator,
  onOpenNewLead,
  onOpenQuickListings,
  onToggleAiAdvisor,
  onToggleDarkMode,
  darkMode,
  onNavigateView,
  onOpenNotifications,
  onOpenCampaigns,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PaletteCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveCategory('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Aggregate all tasks from leads
  const allTasks: { task: TaskItem; lead: Lead }[] = useMemo(() => {
    const list: { task: TaskItem; lead: Lead }[] = [];
    leads.forEach((lead) => {
      lead.tasks?.forEach((task) => {
        list.push({ task, lead });
      });
    });
    return list;
  }, [leads]);

  // Build searchable items
  const items: PaletteItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: PaletteItem[] = [];

    // 1. Navigation & System Actions
    // NOTE: "Go to CRM Command Dashboard" / "...Scrum & Sprints Hub" entries
    // that used to be here were removed -- CRMApp.tsx's <main> only renders
    // the 5 views below ('pipeline'/'tasks'/'calendar'/'automations'/
    // 'reporting'); calling onNavigateView('dashboard'/'scrum') set state to
    // a value nothing renders for, i.e. a blank page. DashboardView.tsx and
    // ScrumSprintView.tsx exist in the repo but aren't wired into CRMApp.tsx
    // yet and have their own unrelated type errors (see chat) -- add these
    // back once that's actually finished.
    const actionItems: PaletteItem[] = [
      {
        id: 'action-quick-listings',
        category: 'actions',
        title: 'Open Quick Listings & Portal Syndication Hub',
        subtitle: 'Instant publishing to Property24, Private Property & Ptah Web, Show Houses',
        tag: 'Listings',
        badge: 'Hub',
        badgeColor: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        icon: <Home className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        action: () => {
          onClose();
          if (onOpenQuickListings) {
            onOpenQuickListings();
          }
        },
      },
      {
        id: 'action-campaigns-hub',
        category: 'actions',
        title: 'Open Marketing & AI Campaigns Hub',
        subtitle: 'Canva, Mailchimp, Zapier & Meta Ads connectors with AWS Bedrock AI studio',
        tag: 'Marketing',
        badge: 'AI Hub',
        badgeColor: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        action: () => {
          onClose();
          if (onOpenCampaigns) {
            onOpenCampaigns();
          }
        },
      },
      {
        id: 'action-pipeline',
        category: 'actions',
        title: 'Go to Pipeline Kanban Board',
        subtitle: 'Switch view to stages: Inbound, Contacted, Qualified, Viewing, Offer, Won',
        tag: 'Navigation',
        badge: 'View',
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: <Kanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        action: () => {
          onNavigateView('pipeline');
          onClose();
        },
      },
      {
        id: 'action-notifications',
        category: 'actions',
        title: 'Open Notifications & Task Reminders Center',
        subtitle: 'Review pending task reminders, 15-minute SLA alerts, and portal auto-responders',
        tag: 'Notifications',
        badge: 'Reminders',
        badgeColor: 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        action: () => {
          onClose();
          if (onOpenNotifications) {
            onOpenNotifications();
          }
        },
      },
      // "Go to Tasks & SLA Cadence View" removed -- Task Reminders no
      // longer has its own top-level view (consolidated into Schedule
      // Calendar); "Open Notifications & Task Reminders" above and
      // "Go to Agent Viewing Schedule & Calendar" below cover this.
      {
        id: 'action-calendar',
        category: 'actions',
        title: 'Go to Agent Viewing Schedule & Calendar',
        subtitle: 'View private inspections, virtual 4K walkthroughs, and CalDAV sync',
        tag: 'Navigation',
        badge: 'View',
        badgeColor: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        icon: <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        action: () => {
          onNavigateView('calendar');
          onClose();
        },
      },
      {
        id: 'action-automations',
        category: 'actions',
        title: 'Go to Email Automations & Triggers Hub',
        subtitle: 'Auto-responders, agent alerts, and SMTP relay settings',
        tag: 'Navigation',
        badge: 'View',
        badgeColor: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        action: () => {
          onNavigateView('automations');
          onClose();
        },
      },
      {
        id: 'action-reporting',
        category: 'actions',
        title: 'Go to Performance Reports & Conversion Analytics',
        subtitle: 'Source ROI, pipeline velocity, stage drop-offs, and agent commissions',
        tag: 'Navigation',
        badge: 'View',
        badgeColor: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        icon: <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        action: () => {
          onNavigateView('reporting');
          onClose();
        },
      },
      {
        id: 'action-new-lead',
        category: 'actions',
        title: 'Create New Inbound / Buyer Lead',
        subtitle: 'Manual entry for walk-ins, phone inquiries, and direct referrals',
        tag: 'Action',
        badge: 'Create',
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        icon: <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        action: () => {
          onClose();
          onOpenNewLead();
        },
      },
      {
        id: 'action-simulator',
        category: 'actions',
        title: 'Simulate Live Portal Inbound Lead',
        subtitle: 'Test 15-minute SLA timer, instant audio chime, and automated email trigger',
        tag: 'Testing',
        badge: 'Live Sim',
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />,
        action: () => {
          onClose();
          onOpenSimulator();
        },
      },
      {
        id: 'action-copilot',
        category: 'actions',
        title: 'Open Ptah AI Strategy Copilot',
        subtitle: 'Ask AI for objection scripts, closing strategies, and market comps',
        tag: 'Intelligence',
        badge: 'AI',
        badgeColor: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        action: () => {
          onClose();
          onToggleAiAdvisor();
        },
      },
      {
        id: 'action-connectors',
        category: 'actions',
        title: 'Open API Connectors, SMTP & Webhook Settings',
        subtitle: 'Manage Property24, Gmail (privjapan@gmail.com), CalDAV, and WhatsApp API',
        tag: 'Config',
        badge: 'Settings',
        badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
        icon: <Settings className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
        action: () => {
          onClose();
          onOpenSettings();
        },
      },
      {
        id: 'action-dark-mode',
        category: 'actions',
        title: darkMode ? 'Switch to Light Mode (Daytime Shift)' : 'Switch to Dark Mode (Night-Time Focus)',
        subtitle: darkMode ? 'Disable dark canvas styling' : 'Reduce eye strain during extended CRM sessions',
        tag: 'Appearance',
        badge: darkMode ? 'Day' : 'Night',
        badgeColor: darkMode ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-800 text-slate-200 border-slate-700',
        icon: darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-amber-300" />,
        action: () => {
          onToggleDarkMode();
          onClose();
        },
      },
    ];

    if (activeCategory === 'all' || activeCategory === 'actions') {
      const filteredActions = q
        ? actionItems.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.subtitle.toLowerCase().includes(q) ||
              a.tag?.toLowerCase().includes(q)
          )
        : actionItems;
      result.push(...filteredActions);
    }

    // 2. Leads Search
    if (activeCategory === 'all' || activeCategory === 'leads') {
      const leadItems: PaletteItem[] = leads
        .filter((lead) => {
          if (!q) return true;
          return (
            lead.name.toLowerCase().includes(q) ||
            lead.referenceNumber.toLowerCase().includes(q) ||
            lead.propertyTitle.toLowerCase().includes(q) ||
            lead.propertyLocation.toLowerCase().includes(q) ||
            lead.email.toLowerCase().includes(q) ||
            lead.phone.toLowerCase().includes(q) ||
            lead.source.toLowerCase().includes(q) ||
            lead.status.toLowerCase().includes(q) ||
            lead.assignedAgent.name.toLowerCase().includes(q)
          );
        })
        .map((lead) => {
          const isUrgent = lead.urgency === 'urgent';
          return {
            id: `lead-${lead.id}`,
            category: 'leads',
            title: `${lead.name} • ${lead.referenceNumber}`,
            subtitle: `${lead.propertyTitle} (${lead.propertyLocation}) — ${formatCurrency(lead.propertyPrice)} • Score: ${lead.leadScore}/100`,
            tag: lead.source,
            badge: lead.status.replace('_', ' ').toUpperCase(),
            badgeColor:
              lead.status === 'deal_won'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : isUrgent
                ? 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            icon: isUrgent ? (
              <Flame className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
            ) : (
              <Building className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            ),
            action: () => {
              onSelectLead(lead);
              onClose();
            },
            meta: lead,
          };
        });
      result.push(...leadItems);
    }

    // 3. Tasks Search
    if (activeCategory === 'all' || activeCategory === 'tasks') {
      const taskItems: PaletteItem[] = allTasks
        .filter(({ task, lead }) => {
          if (!q) return true;
          return (
            task.title.toLowerCase().includes(q) ||
            lead.name.toLowerCase().includes(q) ||
            lead.propertyTitle.toLowerCase().includes(q) ||
            task.type.toLowerCase().includes(q) ||
            task.priority.toLowerCase().includes(q)
          );
        })
        .map(({ task, lead }) => {
          const isPending = task.status === 'pending';
          return {
            id: `task-${task.id}`,
            category: 'tasks',
            title: task.title,
            subtitle: `For ${lead.name} (${lead.propertyTitle}) • Due: ${formatRelativeTime(task.dueDate)}`,
            tag: task.priority.toUpperCase(),
            badge: isPending ? 'Pending' : 'Completed',
            badgeColor: isPending
              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            icon: (
              <CheckSquare
                className={`w-4 h-4 ${
                  isPending ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              />
            ),
            action: () => {
              onSelectLead(lead);
              onClose();
            },
            meta: { task, lead },
          };
        });
      result.push(...taskItems);
    }

    // 4. Connector Sync Events Search
    if (activeCategory === 'all' || activeCategory === 'sync') {
      const syncItems: PaletteItem[] = syncEvents
        .filter((event) => {
          if (!q) return true;
          return (
            event.event.toLowerCase().includes(q) ||
            event.connectorName.toLowerCase().includes(q) ||
            event.details.toLowerCase().includes(q) ||
            (event.payloadSummary && event.payloadSummary.toLowerCase().includes(q))
          );
        })
        .map((event) => {
          return {
            id: `sync-${event.id}`,
            category: 'sync',
            title: `${event.connectorName}: ${event.event}`,
            subtitle: `${event.details} • ${formatRelativeTime(event.timestamp)}`,
            tag: event.connectorName,
            badge: event.status.toUpperCase(),
            badgeColor:
              event.status === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : event.status === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
            icon: <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
            action: () => {
              onClose();
              onOpenSettings();
            },
            meta: event,
          };
        });
      result.push(...syncItems);
    }

    return result;
  }, [
    query,
    activeCategory,
    leads,
    allTasks,
    syncEvents,
    darkMode,
    onNavigateView,
    onClose,
    onOpenNewLead,
    onOpenSimulator,
    onToggleAiAdvisor,
    onOpenSettings,
    onToggleDarkMode,
    onSelectLead,
  ]);

  // Adjust selectedIndex bounds if item count changes
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  // Keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Cycle through categories
      const categories: PaletteCategory[] = ['all', 'leads', 'tasks', 'sync', 'actions'];
      const nextIdx = (categories.indexOf(activeCategory) + 1) % categories.length;
      setActiveCategory(categories[nextIdx]);
      setSelectedIndex(0);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-item-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-20">
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white dark:bg-black rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[82vh] transition-colors"
        >
          {/* Top Search Input Bar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-black/90">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search leads, reference #, tasks, Property24 sync, or quick actions..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1.5 py-1 rounded bg-slate-200/60 dark:bg-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scope Filter Tabs */}
          <div className="px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-black flex items-center space-x-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">
              Scope:
            </span>
            {(
              [
                { id: 'all', label: 'All Results', count: items.length },
                { id: 'leads', label: 'Leads', count: leads.length },
                { id: 'tasks', label: 'Tasks', count: allTasks.length },
                { id: 'sync', label: 'Sync Telemetry', count: syncEvents.length },
                { id: 'actions', label: 'Actions & Views' },
              ] as { id: PaletteCategory; label: string; count?: number }[]
            ).map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setSelectedIndex(0);
                    inputRef.current?.focus();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.length === 0 ? (
              <div className="p-10 text-center text-slate-400 dark:text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching results found</p>
                <p className="text-xs mt-1">
                  Try searching for a client name like "Tshepo", Property24 ref "PTR-8041", or "Simulate"
                </p>
              </div>
            ) : (
              items.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    data-item-index={idx}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white ring-1 ring-slate-300 dark:ring-slate-700'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </span>
                          {item.tag && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 hidden sm:inline-block">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            item.badgeColor ||
                            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isSelected && (
                        <div className="flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <span>Enter</span>
                          <CornerDownLeft className="w-3 h-3 ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Strip */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/90 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono shadow-2xs">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono shadow-2xs">
                  ↓
                </kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono shadow-2xs">
                  ↵
                </kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono shadow-2xs">
                  Tab
                </kbd>
                <span>Switch Scope</span>
              </span>
              <span className="flex items-center gap-1 hidden sm:inline-flex">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono shadow-2xs">
                  Esc
                </kbd>
                <span>Close</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Ptah Command Palette • {items.length} searchable items
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
