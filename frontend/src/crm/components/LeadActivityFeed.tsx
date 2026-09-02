import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  ArrowRight,
  Plus,
  Send,
  Sparkles,
  Search,
  Filter,
  User,
  Check,
  Tag,
  TrendingUp,
  Award,
  AlertCircle,
  Building,
  RotateCcw
} from 'lucide-react';
import { Lead, ActivityLogItem, ActivityEventType, LeadStatus, CommunicationType, EmailNotificationLog } from '../types';
import { formatDate, formatRelativeTime, formatCurrency } from '../utils/formatters';

interface LeadActivityFeedProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
  // Real top-level notification log, pre-filtered to this lead's own
  // entries by the caller (see LeadDetailModal.tsx) -- lead.emailLogs
  // itself is never populated by a real backend write.
  emailLogs?: EmailNotificationLog[];
}

export const LeadActivityFeed: React.FC<LeadActivityFeedProps> = ({ lead, onUpdateLead, emailLogs = [] }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [noteCategory, setNoteCategory] = useState<string>('General Note');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);
  const [showQuickNoteForm, setShowQuickNoteForm] = useState<boolean>(true);

  // Synthesize complete chronological activity items from all sources
  const allActivities = useMemo(() => {
    const items: ActivityLogItem[] = [];

    // 1. Explicit activity logs from the lead
    if (lead.activityLogs && lead.activityLogs.length > 0) {
      items.push(...lead.activityLogs);
    }

    // 2. Inbound Portal Inquiry / Ingestion Event
    if (lead.inquiryDate) {
      items.push({
        id: `activity-inquiry-${lead.id}`,
        type: 'inquiry_received',
        title: `Inbound Portal Inquiry via ${lead.source}`,
        description: lead.inquiryMessage || `Inquired regarding ${lead.propertyTitle} (${lead.propertyRef})`,
        timestamp: lead.inquiryDate,
        author: lead.source,
        metadata: {
          tag: 'Lead Ingestion',
          noteContent: `Listing price: ${formatCurrency(lead.propertyPrice)} | Buyer Budget: ${lead.budget || 'Not specified'}`
        }
      });
    }

    // 3. Communications (Calls, WhatsApp, Emails, Meetings)
    lead.communications.forEach((comm) => {
      // check if not already in items
      if (!items.some((i) => i.id === `comm-act-${comm.id}` || i.id === comm.id)) {
        items.push({
          id: `comm-act-${comm.id}`,
          type: 'communication',
          title: comm.title,
          description: comm.content,
          timestamp: comm.timestamp,
          author: comm.author || lead.assignedAgent.name,
          metadata: {
            commType: comm.type,
            outcome: comm.outcome,
            duration: comm.duration,
            tag: comm.direction === 'outbound' ? 'Outbound Broker Action' : 'Inbound Client Response'
          }
        });
      }
    });

    // 4. Tasks (Created & Completed)
    lead.tasks.forEach((task) => {
      // Task creation event
      if (!items.some((i) => i.id === `task-create-${task.id}`)) {
        items.push({
          id: `task-create-${task.id}`,
          type: 'task_created',
          title: `Action Item Created: ${task.title}`,
          description: `Priority: ${task.priority.toUpperCase()} | Due: ${formatDate(task.dueDate)}`,
          timestamp: task.dueDate ? new Date(new Date(task.dueDate).getTime() - 86400000).toISOString() : lead.inquiryDate,
          author: task.isAutomated ? 'Ptah AI Engine' : lead.assignedAgent.name,
          metadata: {
            taskTitle: task.title,
            taskId: task.id,
            tag: task.isAutomated ? 'Automated Task' : 'Broker Task'
          }
        });
      }

      // Task completed event if completed
      if (task.status === 'completed' && !items.some((i) => i.id === `task-comp-${task.id}`)) {
        items.push({
          id: `task-comp-${task.id}`,
          type: 'task_completed',
          title: `Action Item Completed: ${task.title}`,
          description: `Task successfully fulfilled by ${lead.assignedAgent.name}.`,
          timestamp: task.dueDate || new Date().toISOString(),
          author: lead.assignedAgent.name,
          metadata: {
            taskTitle: task.title,
            taskId: task.id,
            tag: 'Task Fulfilled'
          }
        });
      }
    });

    // 5. Automated Email Notifications
    emailLogs.forEach((emailLog) => {
      if (!items.some((i) => i.id === `email-act-${emailLog.id}` || i.id === emailLog.id)) {
        items.push({
          id: `email-act-${emailLog.id}`,
          type: 'email_automation',
          title: `${emailLog.recipientType === 'agent' ? 'Broker Alert' : 'Auto-Responder'}: ${emailLog.subject}`,
          description: emailLog.previewSnippet,
          timestamp: emailLog.timestamp,
          author: 'Ptah Automation Engine',
          metadata: {
            emailRecipient: emailLog.recipientEmail,
            tag: `Status: ${emailLog.status.toUpperCase()} (${emailLog.triggerReason})`
          }
        });
      }
    });

    // 6. Private Notes
    lead.notes.forEach((note, idx) => {
      if (!items.some((i) => i.id === `note-act-${lead.id}-${idx}`)) {
        items.push({
          id: `note-act-${lead.id}-${idx}`,
          type: 'note_added',
          title: `Broker Note Recorded`,
          description: note,
          timestamp: lead.lastContactedAt || lead.inquiryDate,
          author: lead.assignedAgent.name,
          metadata: {
            noteContent: note,
            tag: 'Internal Note'
          }
        });
      }
    });

    // Deduplicate by ID
    const uniqueMap = new Map<string, ActivityLogItem>();
    items.forEach((item) => {
      uniqueMap.set(item.id, item);
    });

    // Sort strictly chronological descending (most recent first)
    return Array.from(uniqueMap.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [lead, emailLogs]);

  // Filtered list based on search and tab selection
  const filteredActivities = useMemo(() => {
    return allActivities.filter((item) => {
      // Category filter
      if (filterType !== 'all') {
        if (filterType === 'status' && item.type !== 'status_change') return false;
        if (filterType === 'tasks' && item.type !== 'task_completed' && item.type !== 'task_created' && item.type !== 'task_reopened') return false;
        if (filterType === 'notes' && item.type !== 'note_added') return false;
        if (filterType === 'comms' && item.type !== 'communication' && item.type !== 'inquiry_received') return false;
        if (filterType === 'emails' && item.type !== 'email_automation') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesAuthor = item.author.toLowerCase().includes(q);
        const matchesTag = item.metadata?.tag?.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesAuthor || matchesTag;
      }

      return true;
    });
  }, [allActivities, filterType, searchQuery]);

  // Add a new Note and log an explicit activity item
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    const now = new Date().toISOString();
    const formattedNote = `[${noteCategory}] ${newNote.trim()}`;

    const newActivity: ActivityLogItem = {
      id: `act-note-${Date.now()}`,
      type: 'note_added',
      title: `Added Note: ${noteCategory}`,
      description: newNote.trim(),
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Agent',
      metadata: {
        noteContent: newNote.trim(),
        tag: noteCategory
      }
    };

    const updatedLead: Lead = {
      ...lead,
      notes: [formattedNote, ...lead.notes],
      activityLogs: [newActivity, ...(lead.activityLogs || [])],
      lastContactedAt: now
    };

    onUpdateLead(updatedLead);
    setNewNote('');
    setIsSubmittingNote(false);
  };

  // Helper for rendering event icon and colors
  const getEventVisuals = (type: ActivityEventType, metadata?: ActivityLogItem['metadata']) => {
    switch (type) {
      case 'status_change':
        return {
          icon: <RotateCcw className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          badgeBg: 'bg-purple-100 text-purple-800',
          label: 'Stage Progression'
        };
      case 'task_completed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          label: 'Task Fulfilled'
        };
      case 'task_created':
        return {
          icon: <Clock className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800',
          label: 'Task Assigned'
        };
      case 'note_added':
        return {
          icon: <FileText className="w-4 h-4 text-indigo-600" />,
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          badgeBg: 'bg-indigo-100 text-indigo-800',
          label: 'Broker Note'
        };
      case 'communication':
        if (metadata?.commType === 'call') {
          return {
            icon: <Phone className="w-4 h-4 text-blue-600" />,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            badgeBg: 'bg-blue-100 text-blue-800',
            label: 'Phone Call'
          };
        }
        if (metadata?.commType === 'whatsapp') {
          return {
            icon: <MessageSquare className="w-4 h-4 text-emerald-600" />,
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            badgeBg: 'bg-emerald-100 text-emerald-800',
            label: 'WhatsApp Chat'
          };
        }
        return {
          icon: <Mail className="w-4 h-4 text-cyan-600" />,
          bg: 'bg-cyan-50',
          border: 'border-cyan-200',
          badgeBg: 'bg-cyan-100 text-cyan-800',
          label: 'Client Email'
        };
      case 'email_automation':
        return {
          icon: <Send className="w-4 h-4 text-teal-600" />,
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          badgeBg: 'bg-teal-100 text-teal-800',
          label: 'Automated Notification'
        };
      case 'inquiry_received':
        return {
          icon: <Sparkles className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          badgeBg: 'bg-rose-100 text-rose-800',
          label: 'Inbound Portal Inquiry'
        };
      case 'quality_score_update':
        return {
          icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          badgeBg: 'bg-purple-100 text-purple-800',
          label: 'AI Quality Score'
        };
      case 'viewing_scheduled':
        return {
          icon: <Building className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800',
          label: 'Private Viewing'
        };
      default:
        return {
          icon: <Activity className="w-4 h-4 text-slate-600" />,
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          badgeBg: 'bg-slate-100 text-slate-800',
          label: 'Activity'
        };
    }
  };

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'New / Inbound';
      case 'contacted': return 'Contacted';
      case 'qualified': return 'Qualified';
      case 'viewing_scheduled': return 'Viewing Scheduled';
      case 'offer_submitted': return 'Offer Submitted';
      case 'deal_won': return 'Deal Won (Closed)';
      case 'deal_lost': return 'Deal Lost';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Note Creator */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Comprehensive Engagement Journey</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">Lead Activity Feed</h3>
            <p className="text-xs text-slate-500">
              Chronological ledger of every status change, task completion, broker note, communication, and system automation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQuickNoteForm(!showQuickNoteForm)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showQuickNoteForm ? 'Hide Note Box' : 'Add Note to Feed'}</span>
            </button>
          </div>
        </div>

        {/* Quick Note Composer */}
        {showQuickNoteForm && (
          <form onSubmit={handleAddNoteSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Log Broker Note to Activity Feed</span>
              </span>

              {/* Note Category Selection */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Category:</span>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="General Note">General Note</option>
                  <option value="Client Feedback">Client Feedback</option>
                  <option value="Property Inspection">Property Inspection</option>
                  <option value="Offer / Price Discussion">Offer / Price Discussion</option>
                  <option value="Mortgage / Finance">Mortgage / Finance</option>
                  <option value="Legal / Conveyancing">Legal / Conveyancing</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type note details here (e.g. 'Buyer confirmed proof of funds ready for Clifton villa, requesting second viewing on Saturday with spouse')..."
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Author: <strong className="text-slate-600">{lead.assignedAgent.name}</strong>
              </span>
              <button
                type="submit"
                disabled={!newNote.trim() || isSubmittingNote}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save to Activity Feed</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Activities', count: allActivities.length },
            { id: 'status', label: 'Status Changes', count: allActivities.filter((a) => a.type === 'status_change').length },
            { id: 'tasks', label: 'Tasks', count: allActivities.filter((a) => a.type === 'task_completed' || a.type === 'task_created').length },
            { id: 'notes', label: 'Broker Notes', count: allActivities.filter((a) => a.type === 'note_added').length },
            { id: 'comms', label: 'Client Comms', count: allActivities.filter((a) => a.type === 'communication' || a.type === 'inquiry_received').length },
            { id: 'emails', label: 'Automations', count: allActivities.filter((a) => a.type === 'email_automation').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  filterType === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity feed..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredActivities.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <Activity className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No activity matching your filter</p>
            <p className="text-xs text-slate-400">Try selecting "All Activities" or clearing the search keyword.</p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => {
            const visual = getEventVisuals(activity.type, activity.metadata);

            return (
              <div key={activity.id || index} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[30px] top-1.5 w-7 h-7 rounded-full ${visual.bg} border-2 ${visual.border} flex items-center justify-center shadow-xs z-10`}
                >
                  {visual.icon}
                </div>

                {/* Timeline Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${visual.badgeBg}`}>
                        {visual.label}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{activity.title}</h4>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span title={formatDate(activity.timestamp)}>{formatRelativeTime(activity.timestamp)}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <p className="text-xs text-slate-700 leading-relaxed">{activity.description}</p>

                  {/* Special Contextual Rendering for Status Change */}
                  {activity.type === 'status_change' && activity.metadata?.fromStatus && activity.metadata?.toStatus && (
                    <div className="flex items-center space-x-2 pt-1 pb-0.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium border border-slate-200">
                        {getStatusLabel(activity.metadata.fromStatus)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[11px] font-bold border border-emerald-200">
                        {getStatusLabel(activity.metadata.toStatus)}
                      </span>
                    </div>
                  )}

                  {/* Contextual Metadata Pill / Tags / Author */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>
                        Logged by: <strong className="text-slate-700">{activity.author}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {activity.metadata?.outcome && (
                        <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          Outcome: <strong>{activity.metadata.outcome}</strong>
                        </span>
                      )}
                      {activity.metadata?.duration && (
                        <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          Duration: {activity.metadata.duration}
                        </span>
                      )}
                      {activity.metadata?.tag && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {activity.metadata.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
