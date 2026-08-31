import React, { useState, useEffect, useRef } from 'react';
import { authHeaders } from '../../services/api';
import { 
  X, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  User, 
  DollarSign, 
  Send, 
  Copy, 
  ExternalLink, 
  Tag, 
  FileText, 
  Plus, 
  Flame, 
  Check, 
  ChevronRight,
  RefreshCw,
  Zap,
  Award,
  Target,
  TrendingUp,
  BarChart2,
  Activity,
  Video,
  Layers
} from 'lucide-react';
import { Lead, LeadStatus, CommunicationItem, TaskItem, UrgencyLevel, CommunicationType, ActivityLogItem } from '../types';
import { formatCurrency, formatDate, formatRelativeTime, triggerDealWonConfetti, computeAgeBracket } from '../utils/formatters';
import { LeadQualityScoreView } from './LeadQualityScoreView';
import { LeadActivityFeed } from './LeadActivityFeed';
import { calculateLeadQualityScore } from '../utils/qualityScore';

interface LeadDetailModalProps {
  lead: Lead;
  allLeads?: Lead[];
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  allLeads = [],
  onClose,
  onUpdateLead,
}) => {
  const [activeTab, setActiveTab] = useState<'score' | 'activity' | 'comms' | 'ai' | 'tasks' | 'emails' | 'details'>('activity');
  const tabNavRef = useRef<HTMLDivElement>(null);

  // Reset tab scroll to start whenever the modal opens or the lead changes
  useEffect(() => {
    if (tabNavRef.current) {
      tabNavRef.current.scrollLeft = 0;
    }
  }, [lead.id]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // New communication log state
  const [showLogCommForm, setShowLogCommForm] = useState(false);
  const [commType, setCommType] = useState<CommunicationType>('call');
  const [commDirection, setCommDirection] = useState<'inbound' | 'outbound'>('outbound');
  const [commTitle, setCommTitle] = useState('');
  const [commContent, setCommContent] = useState('');
  const [commOutcome, setCommOutcome] = useState('Spoke to client, interested');
  const [commDuration, setCommDuration] = useState('5 mins');

  // New task state
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<UrgencyLevel>('high');
  const [taskType, setTaskType] = useState<'call' | 'email' | 'viewing' | 'brochure' | 'followup'>('call');

  // AI Generator state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTone, setAiTone] = useState('Luxury, Exclusive & Polished');
  const [aiObjective, setAiObjective] = useState('Schedule a private weekend viewing & offer digital brochure');
  const [aiDraftSubject, setAiDraftSubject] = useState('');
  const [aiDraftBody, setAiDraftBody] = useState('');
  const [aiCopied, setAiCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzingLead, setAnalyzingLead] = useState(false);

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

  // Status changer handler with automatic activity logging
  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === lead.status) return;

    if (newStatus === 'deal_won' && lead.status !== 'deal_won') {
      triggerDealWonConfetti();
    }

    const now = new Date().toISOString();
    const statusActivity: ActivityLogItem = {
      id: `act-status-${Date.now()}`,
      type: 'status_change',
      title: `Pipeline Stage Updated to ${getStatusLabel(newStatus)}`,
      description: `Lead moved from "${getStatusLabel(lead.status)}" to "${getStatusLabel(newStatus)}".`,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Broker',
      metadata: {
        fromStatus: lead.status,
        toStatus: newStatus,
        tag: 'Pipeline Progression'
      }
    };

    const updated = {
      ...lead,
      status: newStatus,
      activityLogs: [statusActivity, ...(lead.activityLogs || [])],
      lastContactedAt: now
    };
    onUpdateLead(updated);
  };

  // Add communication log with activity tracking
  const handleAddCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commTitle.trim() || !commContent.trim()) return;

    const now = new Date().toISOString();
    const newComm: CommunicationItem = {
      id: `comm-${Date.now()}`,
      type: commType,
      direction: commDirection,
      title: commTitle,
      content: commContent,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Agent',
      outcome: commOutcome,
      duration: commType === 'call' ? commDuration : undefined,
    };

    const commActivity: ActivityLogItem = {
      id: `act-comm-${Date.now()}`,
      type: 'communication',
      title: `${commDirection === 'outbound' ? 'Outbound' : 'Inbound'} ${commType.toUpperCase()}: ${commTitle}`,
      description: commContent,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Agent',
      metadata: {
        commType,
        outcome: commOutcome,
        duration: commType === 'call' ? commDuration : undefined,
        tag: 'Client Interaction'
      }
    };

    const updated = {
      ...lead,
      communications: [newComm, ...lead.communications],
      activityLogs: [commActivity, ...(lead.activityLogs || [])],
      lastContactedAt: now,
      status: lead.status === 'new' ? ('contacted' as LeadStatus) : lead.status,
    };

    onUpdateLead(updated);
    setCommTitle('');
    setCommContent('');
    setShowLogCommForm(false);
  };

  // Add new task with activity logging
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const now = new Date().toISOString();
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      propertyTitle: lead.propertyTitle,
      title: taskTitle,
      dueDate: taskDueDate || new Date(Date.now() + 86400000).toISOString(),
      priority: taskPriority,
      status: 'pending',
      type: taskType,
    };

    const taskActivity: ActivityLogItem = {
      id: `act-task-new-${Date.now()}`,
      type: 'task_created',
      title: `Task Created: ${taskTitle}`,
      description: `Assigned priority: ${taskPriority.toUpperCase()} | Type: ${taskType.toUpperCase()}`,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Broker',
      metadata: {
        taskTitle,
        taskId: newTask.id,
        tag: 'Action Assigned'
      }
    };

    const updated = {
      ...lead,
      tasks: [newTask, ...lead.tasks],
      activityLogs: [taskActivity, ...(lead.activityLogs || [])]
    };

    onUpdateLead(updated);
    setTaskTitle('');
    setShowNewTaskForm(false);
  };

  // Toggle task complete with activity logging
  const handleToggleTask = (taskId: string) => {
    const task = lead.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? ('pending' as const) : ('completed' as const);
    const updatedTasks = lead.tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );

    const now = new Date().toISOString();
    const taskActivity: ActivityLogItem = {
      id: `act-task-toggle-${Date.now()}`,
      type: newStatus === 'completed' ? 'task_completed' : 'task_reopened',
      title: newStatus === 'completed' ? `Task Completed: ${task.title}` : `Task Reopened: ${task.title}`,
      description: newStatus === 'completed' ? `Marked complete by ${lead.assignedAgent.name}.` : `Reopened for further follow-up.`,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Broker',
      metadata: {
        taskTitle: task.title,
        taskId,
        tag: newStatus === 'completed' ? 'Task Completed' : 'Task Incomplete'
      }
    };

    onUpdateLead({
      ...lead,
      tasks: updatedTasks,
      activityLogs: [taskActivity, ...(lead.activityLogs || [])]
    });
  };

  // Launch Zoom 4K Virtual Walkthrough
  const handleLaunchZoom = () => {
    const zoomUrl = `https://zoom.us/start/videomeeting`;
    window.open(zoomUrl, '_blank');

    const now = new Date().toISOString();
    const commActivity: ActivityLogItem = {
      id: `act-zoom-${Date.now()}`,
      type: 'communication',
      title: `Zoom 4K Walkthrough Session Initiated`,
      description: `Launched private 4K video walkthrough with ${lead.name} for ${lead.propertyTitle}. HD cloud recording and presentation specs loaded.`,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Broker',
      metadata: {
        commType: 'meeting',
        tag: 'Zoom Virtual Walkthrough'
      }
    };

    onUpdateLead({
      ...lead,
      activityLogs: [commActivity, ...(lead.activityLogs || [])],
      lastContactedAt: now,
      status: lead.status === 'new' ? 'contacted' : lead.status
    });
  };

  // Launch Google Meet Video Bridge
  const handleLaunchMeet = () => {
    const meetUrl = `https://meet.google.com/new`;
    window.open(meetUrl, '_blank');

    const now = new Date().toISOString();
    const commActivity: ActivityLogItem = {
      id: `act-meet-${Date.now()}`,
      type: 'communication',
      title: `Google Meet Video Bridge Connected`,
      description: `Started Google Workspace video meeting with ${lead.name}. Interactive floor plan review & brochure screen share active.`,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Broker',
      metadata: {
        commType: 'meeting',
        tag: 'Google Meet Bridge'
      }
    };

    onUpdateLead({
      ...lead,
      activityLogs: [commActivity, ...(lead.activityLogs || [])],
      lastContactedAt: now,
      status: lead.status === 'new' ? 'contacted' : lead.status
    });
  };

  // Launch Matterport 3D Digital Twin Tour
  const handleLaunchMatterport = () => {
    // NOTE: this opens a fixed Matterport Showcase demo tour, not a
    // tour of this lead's specific property -- there is currently no
    // per-listing tour URL in the data model (PropertyListing has no
    // matterportTourUrl field, and Lead has no listingId to look one up
    // by even if it did). The activity log below is worded to reflect
    // that honestly rather than implying a real personalized tour.
    const matterportUrl = `https://my.matterport.com/show/?m=sB28fLpM891&play=1&qs=1&brand=0`;
    window.open(matterportUrl, '_blank');

    const now = new Date().toISOString();
    const commActivity: ActivityLogItem = {
      id: `act-mp-${Date.now()}`,
      type: 'communication',
      title: `Matterport 3D Demo Tour Shared`,
      description: `Opened a sample immersive 3D walkthrough with ${lead.name} to demonstrate the format (not a tour of ${lead.propertyTitle} specifically -- per-listing tours aren't wired up yet).`,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Realty Broker',
      metadata: {
        commType: 'meeting',
        tag: 'Matterport 3D Tour'
      }
    };

    onUpdateLead({
      ...lead,
      activityLogs: [commActivity, ...(lead.activityLogs || [])],
      lastContactedAt: now,
      status: lead.status === 'new' ? 'contacted' : lead.status
    });
  };

  // Generate AI Email
  const handleGenerateAiEmail = async () => {
    setAiGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          leadName: lead.name,
          propertyTitle: lead.propertyTitle,
          source: lead.source,
          inquiryMessage: lead.inquiryMessage,
          budget: lead.budget || formatCurrency(lead.propertyPrice),
          tone: aiTone,
          objective: aiObjective,
          agentName: lead.assignedAgent.name,
        }),
      });
      const data = await response.json();
      setAiDraftSubject(data.subject || `Inquiry update on ${lead.propertyTitle}`);
      setAiDraftBody(data.body || '');
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Analyze Lead Intent with AI
  const handleAnalyzeLead = async () => {
    setAnalyzingLead(true);
    try {
      const response = await fetch('/api/gemini/analyze-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ lead }),
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingLead(false);
    }
  };

  // Send AI Draft directly to communications log and activity feed
  const handleSendAiDraft = () => {
    if (!aiDraftBody) return;
    const now = new Date().toISOString();
    const newComm: CommunicationItem = {
      id: `comm-${Date.now()}`,
      type: 'email',
      direction: 'outbound',
      title: `Email Sent: ${aiDraftSubject}`,
      content: aiDraftBody,
      timestamp: now,
      author: lead.assignedAgent.name,
      outcome: 'Sent to client',
    };

    const aiCommActivity: ActivityLogItem = {
      id: `act-ai-sent-${Date.now()}`,
      type: 'communication',
      title: `AI Pitch Dispatched: ${aiDraftSubject}`,
      description: aiDraftBody.slice(0, 160) + '...',
      timestamp: now,
      author: lead.assignedAgent.name,
      metadata: {
        commType: 'email',
        tag: 'AI Tailored Outreach'
      }
    };

    onUpdateLead({
      ...lead,
      communications: [newComm, ...lead.communications],
      activityLogs: [aiCommActivity, ...(lead.activityLogs || [])],
      lastContactedAt: now,
      status: lead.status === 'new' ? 'contacted' : lead.status,
    });
    setActiveTab('activity');
  };

  // Copy text helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        // Close when the dark backdrop itself is clicked -- but not when
        // the click originated inside the modal card (that click still
        // bubbles up to this handler, so it's the target/currentTarget
        // check that matters, not stopping propagation on every child).
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white border border-slate-200 w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Always-visible close button, floating in the card's own
            top-right corner -- separate from the Stage/action-pill row's
            X (further down, easy to miss among WhatsApp/Call/Zoom Tour/
            etc.), so there's an unambiguous way to close this regardless
            of how that row wraps or scrolls. */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-xs transition cursor-pointer"
          title="Close"
          aria-label="Close lead details"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Modal Top Header */}
        <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                {lead.referenceNumber}
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                Source: {lead.source}
              </span>
              {lead.urgency === 'urgent' && (
                <span className="flex items-center text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  <Flame className="w-3 h-3 mr-1 text-red-600" /> URGENT LEAD
                </span>
              )}

              {/* Header Quality Score Pill (Clickable) */}
              <button
                onClick={() => setActiveTab('score')}
                className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                  lead.leadScore >= 90
                    ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
                    : lead.leadScore >= 75
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                    : lead.leadScore >= 50
                    ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title="Click to view AI Lead Quality Score Breakdown"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Quality Score: {lead.leadScore || 88}/100</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <span>{lead.name}</span>
            </h2>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 font-medium">{lead.propertyTitle}</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-700 font-semibold">{formatCurrency(lead.propertyPrice)}</span>
            </p>
          </div>

          {/* Status & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stage Selector */}
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Stage:</span>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="bg-transparent text-xs font-bold text-emerald-700 focus:outline-none cursor-pointer"
              >
                <option value="new">New / Inbound</option>
                <option value="contacted">Attempted / Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="viewing_scheduled">Viewing Scheduled</option>
                <option value="offer_submitted">Offer / Negotiation</option>
                <option value="deal_won">🏆 Deal Won / Closed</option>
                <option value="deal_lost">Deal Lost / Archived</option>
              </select>
            </div>

            {/* Direct WhatsApp Launcher */}
            <a
              href={`https://wa.me/${lead.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hi ${lead.name}, this is ${lead.assignedAgent.name} from Ptah Realty. Thank you for inquiring on ${lead.source} regarding ${lead.propertyTitle}. I'd love to share the private specifications and schedule a viewing for you.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition cursor-pointer"
              title="1-Click WhatsApp Concierge"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition cursor-pointer"
              title="Phone Call"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Call</span>
            </a>

            {/* Zoom 4K Virtual Walkthrough */}
            <button
              type="button"
              onClick={handleLaunchZoom}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-semibold transition cursor-pointer"
              title="Launch HD 4K Zoom Virtual Walkthrough"
            >
              <Video className="w-3.5 h-3.5 text-cyan-600" />
              <span>Zoom Tour</span>
            </button>

            {/* Google Meet Video Bridge */}
            <button
              type="button"
              onClick={handleLaunchMeet}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold transition cursor-pointer"
              title="Launch Google Meet Video Meeting"
            >
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>Google Meet</span>
            </button>

            {/* Matterport 3D Tour -- opens a fixed demo tour, not a
                tour of this lead's specific property (see
                handleLaunchMatterport's note). Title/label reflect
                that honestly. */}
            <button
              type="button"
              onClick={handleLaunchMatterport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition cursor-pointer"
              title="Share a sample 3D Matterport walkthrough (demo tour, not specific to this listing)"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Matterport Demo</span>
            </button>

            {/* Redundant inline Close button removed here -- the
                dedicated corner X (top-right of the card, plus
                backdrop-click and Escape) already covers closing. */}
          </div>
        </div>

        {/* Tab Navigation */}
        <div ref={tabNavRef} className="bg-white px-6 border-b border-slate-200 flex space-x-6 overflow-x-auto no-scrollbar text-xs font-semibold text-slate-500 shrink-0">
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'activity'
                ? 'border-emerald-600 text-emerald-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Activity Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('score')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'score'
                ? 'border-purple-600 text-purple-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI Quality Score ({lead.leadScore || 88}/100)</span>
          </button>

          <button
            onClick={() => setActiveTab('comms')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'comms'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Communications ({lead.communications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'ai'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>AI Pitch Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'tasks'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Task Reminders ({lead.tasks.filter((t) => t.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'emails'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Email Automations ({lead.emailLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'details'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Property & Profile</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-6">
          {/* TAB: ACTIVITY FEED */}
          {activeTab === 'activity' && (
            <LeadActivityFeed
              lead={lead}
              onUpdateLead={onUpdateLead}
            />
          )}

          {/* TAB 0: AI LEAD QUALITY SCORE (1-100) */}
          {activeTab === 'score' && (
            <LeadQualityScoreView
              lead={lead}
              allLeads={allLeads}
              onUpdateLead={onUpdateLead}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* TAB 1: COMMUNICATIONS HUB */}
          {activeTab === 'comms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Multi-Channel Communication History</h3>
                  <p className="text-xs text-slate-500">Track all WhatsApp, email, call recordings, and portal messages.</p>
                </div>

                <button
                  onClick={() => setShowLogCommForm(!showLogCommForm)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Interaction</span>
                </button>
              </div>

              {/* Inbound Initial Message Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-semibold text-amber-800 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-amber-600" /> Initial Inbound Inquiry from {lead.source}
                  </span>
                  <span>{formatDate(lead.inquiryDate)}</span>
                </div>
                <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  "{lead.inquiryMessage}"
                </p>
              </div>

              {/* Log Communication Form */}
              {showLogCommForm && (
                <form onSubmit={handleAddCommunication} className="bg-slate-50 p-4 rounded-xl border border-emerald-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Log New Client Interaction</span>
                    <button type="button" onClick={() => setShowLogCommForm(false)} className="text-slate-500 hover:text-slate-800 text-xs">
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 font-medium mb-1">Channel</label>
                      <select
                        value={commType}
                        onChange={(e) => setCommType(e.target.value as CommunicationType)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      >
                        <option value="call">📞 Phone Call</option>
                        <option value="whatsapp">💬 WhatsApp Message</option>
                        <option value="email">✉️ Email Message</option>
                        <option value="meeting">🤝 Physical / Virtual Viewing</option>
                        <option value="sms">📱 SMS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 font-medium mb-1">Direction</label>
                      <select
                        value={commDirection}
                        onChange={(e) => setCommDirection(e.target.value as 'inbound' | 'outbound')}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      >
                        <option value="outbound">Outbound (Agent to Client)</option>
                        <option value="inbound">Inbound (Client to Agent)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 font-medium mb-1">Outcome / Result</label>
                      <input
                        type="text"
                        value={commOutcome}
                        onChange={(e) => setCommOutcome(e.target.value)}
                        placeholder="e.g. Viewing booked, Sent brochure"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Subject / Summary Title</label>
                    <input
                      type="text"
                      required
                      value={commTitle}
                      onChange={(e) => setCommTitle(e.target.value)}
                      placeholder="e.g. Discussed Clifton floor plans & security"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Interaction Notes</label>
                    <textarea
                      required
                      rows={3}
                      value={commContent}
                      onChange={(e) => setCommContent(e.target.value)}
                      placeholder="Key topics discussed, client feedback, next steps agreed upon..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Save Communication Record
                    </button>
                  </div>
                </form>
              )}

              {/* Timeline List */}
              <div className="space-y-3">
                {lead.communications.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs italic">
                    No communication history logged yet. Use "Log Interaction" or the WhatsApp quick link above.
                  </div>
                ) : (
                  lead.communications.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`p-1.5 rounded-lg text-xs border ${
                              item.type === 'whatsapp'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.type === 'email'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : item.type === 'call'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {item.type === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5" />}
                            {item.type === 'email' && <Mail className="w-3.5 h-3.5" />}
                            {item.type === 'call' && <Phone className="w-3.5 h-3.5" />}
                            {item.type === 'meeting' && <Calendar className="w-3.5 h-3.5" />}
                            {item.type === 'portal_inquiry' && <Building className="w-3.5 h-3.5" />}
                          </span>

                          <span className="font-semibold text-xs text-slate-900">{item.title}</span>

                          {item.outcome && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                              {item.outcome}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400">{formatDate(item.timestamp)}</span>
                      </div>

                      <p className="text-xs text-slate-600 pl-8 whitespace-pre-line">{item.content}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pl-8 mt-2">
                        <span>Logged by: {item.author}</span>
                        {item.duration && <span>Duration: {item.duration}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI ASSISTANT & INTENT */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Lead Intelligence Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-amber-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-sm text-slate-900">AI Lead Intent & Deal Probability</h3>
                  </div>

                  <button
                    onClick={handleAnalyzeLead}
                    disabled={analyzingLead}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyzingLead ? 'animate-spin' : ''}`} />
                    <span>{analyzingLead ? 'Analyzing Lead...' : 'Refresh AI Analysis'}</span>
                  </button>
                </div>

                {aiAnalysis ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] text-slate-500 font-medium">Deal Probability</span>
                        <div className="text-lg font-bold text-emerald-700 mt-0.5">{aiAnalysis.score || lead.leadScore}%</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] text-slate-500 font-medium">Urgency Assessment</span>
                        <div className="text-lg font-bold text-amber-700 mt-0.5">{aiAnalysis.urgency || lead.urgency}</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[11px] text-slate-500 font-medium">Recommended Follow-up</span>
                        <div className="text-xs font-semibold text-slate-900 mt-1">{aiAnalysis.suggestedFollowUpDay || 'Immediate within 15 mins'}</div>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-xs">
                      <strong className="text-amber-800 block mb-1">Intent Summary:</strong>
                      {aiAnalysis.intentSummary}
                    </div>

                    {aiAnalysis.recommendedAction && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                        <strong className="text-emerald-800 block mb-1">Recommended Broker Action:</strong>
                        {aiAnalysis.recommendedAction}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    Click "Refresh AI Analysis" to evaluate this {lead.source} lead's buying intent, price sensitivity, and conversion likelihood based on the full conversation history.
                  </div>
                )}
              </div>

              {/* AI Follow-up Email Generator */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900">Generate High-Converting Follow-up Response</h3>
                  </div>

                  <span className="text-[11px] text-slate-500">Tailored for {lead.source} Inquiry</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Tone & Persona</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                    >
                      <option value="Luxury, Exclusive & Polished">Luxury, Exclusive & Polished</option>
                      <option value="Urgent & Action-Driven (15-min strike)">Urgent & Action-Driven (15-min strike)</option>
                      <option value="Warm, Welcoming & Consultative">Warm, Welcoming & Consultative</option>
                      <option value="Investor & ROI Analytical">Investor & ROI Analytical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Call-To-Action Objective</label>
                    <input
                      type="text"
                      value={aiObjective}
                      onChange={(e) => setAiObjective(e.target.value)}
                      placeholder="e.g. Book private viewing for Saturday"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateAiEmail}
                  disabled={aiGenerating}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${aiGenerating ? 'animate-spin' : ''}`} />
                  <span>{aiGenerating ? 'Drafting Custom Real Estate Pitch...' : 'Generate Follow-up Email with AWS Bedrock AI'}</span>
                </button>

                {aiDraftBody && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-500 font-mono">Subject:</span>
                      <input
                        type="text"
                        value={aiDraftSubject}
                        onChange={(e) => setAiDraftSubject(e.target.value)}
                        className="w-full font-bold text-xs text-slate-900 bg-white p-2 rounded border border-slate-300 mt-1"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 font-mono">Body:</span>
                      <textarea
                        rows={8}
                        value={aiDraftBody}
                        onChange={(e) => setAiDraftBody(e.target.value)}
                        className="w-full text-xs text-slate-800 bg-white p-3 rounded border border-slate-300 mt-1 leading-relaxed font-sans"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleCopyText(`${aiDraftSubject}\n\n${aiDraftBody}`)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs transition cursor-pointer"
                      >
                        {aiCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{aiCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                      </button>

                      <button
                        onClick={handleSendAiDraft}
                        className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log as Sent Email</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASK REMINDERS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Lead Follow-Up Tasks & Reminders</h3>
                  <p className="text-xs text-slate-500">Automated SLAs and manual reminder checklist for {lead.name}.</p>
                </div>

                <button
                  onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reminder</span>
                </button>
              </div>

              {/* New Task Form */}
              {showNewTaskForm && (
                <form onSubmit={handleAddTask} className="bg-slate-50 p-4 rounded-xl border border-emerald-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Create Task Reminder</span>
                    <button type="button" onClick={() => setShowNewTaskForm(false)} className="text-slate-500 hover:text-slate-800 text-xs">
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 font-medium mb-1">Task Type</label>
                      <select
                        value={taskType}
                        onChange={(e) => setTaskType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      >
                        <option value="call">Call Client</option>
                        <option value="email">Send Email</option>
                        <option value="viewing">Arrange Viewing</option>
                        <option value="brochure">Send Specs / Brochure</option>
                        <option value="followup">General Follow-up</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 font-medium mb-1">Priority</label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as UrgencyLevel)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      >
                        <option value="urgent">🔥 Urgent Priority</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 font-medium mb-1">Due Date & Time</label>
                      <input
                        type="datetime-local"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Task Action</label>
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Schedule Saturday viewing with estate security gate pass"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Save Task Reminder
                    </button>
                  </div>
                </form>
              )}

              {/* Task list */}
              <div className="space-y-2">
                {lead.tasks.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs italic">
                    No active tasks for this lead.
                  </div>
                ) : (
                  lead.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                            task.status === 'completed'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          {task.status === 'completed' && <Check className="w-3.5 h-3.5 font-bold" />}
                        </div>

                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> Due: {formatDate(task.dueDate)}
                            </span>
                            {task.isAutomated && (
                              <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                                Auto-Generated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          task.priority === 'urgent'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : task.priority === 'high'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL AUTOMATIONS TRAIL */}
          {activeTab === 'emails' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Automated Notifications & Delivery Trail</h3>
                <p className="text-xs text-slate-500">
                  Real-time log of instant email notifications sent to the broker and automatic client auto-responders.
                </p>
              </div>

              <div className="space-y-3">
                {lead.emailLogs.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs italic">
                    No automated notifications recorded for this lead yet.
                  </div>
                ) : (
                  lead.emailLogs.map((log) => (
                    <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.recipientType === 'agent'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {log.recipientType === 'agent' ? 'BROKER ALERT' : 'CLIENT AUTO-RESPONDER'}
                          </span>
                          <span className="font-semibold text-xs text-slate-900">{log.subject}</span>
                        </div>

                        <span className="text-[11px] text-slate-400">{formatDate(log.timestamp)}</span>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
                        <div className="text-[11px] text-slate-500 mb-1">To: {log.recipientEmail}</div>
                        <p>{log.previewSnippet}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>Trigger: {log.triggerReason}</span>
                        <span className="flex items-center text-emerald-700 gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {log.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PROPERTY & PROFILE DETAILS */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Specs */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-emerald-700 uppercase tracking-wider">Property Information</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Property Title:</span>
                    <span className="font-semibold text-slate-900">{lead.propertyTitle}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Portal Reference:</span>
                    <span className="font-mono text-slate-700">{lead.propertyRef}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Location / Suburb:</span>
                    <span className="text-slate-700">{lead.propertyLocation}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Listing Price:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(lead.propertyPrice)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Property Type:</span>
                    <span className="text-slate-700">{lead.propertyType}</span>
                  </div>
                  {lead.propertyBedrooms && (
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Bedrooms / Baths:</span>
                      <span className="text-slate-700">
                        {lead.propertyBedrooms} Beds • {lead.propertyBathrooms} Baths
                      </span>
                    </div>
                  )}
                  {lead.portalListingUrl && (
                    <div className="pt-2">
                      <a
                        href={lead.portalListingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <span>View original {lead.source} listing</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Buyer Profile */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-emerald-700 uppercase tracking-wider">Buyer / Client Profile</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Buyer Type:</span>
                    <span className="font-semibold text-slate-900">{lead.buyerType}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Date of Birth:</span>
                    {/* Plain manual entry, not tied to any ID/FICA
                        verification -- see
                        docs/roadmap-lead-kyc-linkage.md. ageBracket is kept
                        in sync automatically rather than edited separately. */}
                    <input
                      type="date"
                      value={lead.birthday || ''}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        onUpdateLead({
                          ...lead,
                          birthday: e.target.value || undefined,
                          ageBracket: computeAgeBracket(e.target.value),
                        })
                      }
                      className="text-right text-slate-700 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-900 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Budget Range:</span>
                    <span className="text-slate-700">{lead.budget}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Purchase Timeframe:</span>
                    <span className="text-slate-700">{lead.timeframe}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Assigned Broker:</span>
                    <span className="text-slate-700">{lead.assignedAgent.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Projected Commission:</span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(lead.commissionEstimate || lead.propertyPrice * 0.05)}
                    </span>
                  </div>
                </div>

                {/* Notes List */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 block mb-1 font-medium">Broker Private Notes:</span>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                    {lead.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
