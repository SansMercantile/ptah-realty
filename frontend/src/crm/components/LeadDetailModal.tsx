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
  Layers,
  FolderOpen,
  Upload,
  Download,
  FileSpreadsheet,
  Share2,
  Mic,
  Scale,
  ShieldCheck,
  Camera,
  PhoneCall,
  Radio
} from 'lucide-react';
import { Lead, LeadStatus, CommunicationItem, TaskItem, UrgencyLevel, CommunicationType, ActivityLogItem, EmailNotificationLog } from '../types';
import type { ListingDealRecord } from '../../components/modals/MyListingsModal';
import { formatCurrency, formatDate, formatRelativeTime, triggerDealWonConfetti, computeAgeBracket } from '../utils/formatters';
import { LeadQualityScoreView } from './LeadQualityScoreView';
import { LeadActivityFeed } from './LeadActivityFeed';
import { SlaCountdownTimer } from './SlaCountdownTimer';
import { LeadDocumentConverter } from './LeadDocumentConverter';
import { LeadEngagementChart } from './LeadEngagementChart';
import { ShareLeadModal } from './ShareLeadModal';
import { LeadPropertyMatcher } from './LeadPropertyMatcher';
import { VoiceNoteTranscriber } from './VoiceNoteTranscriber';
import { ClientRequestPortalModal } from './ClientRequestPortalModal';
import { CameraCaptureModal } from './CameraCaptureModal';
import { MeetingCallModal } from './MeetingCallModal';
import { VoipCallModal } from './VoipCallModal';
import { TranscribeSummarizeModal } from './TranscribeSummarizeModal';
import { VirtualViewingModal } from './VirtualViewingModal';
import { CallRecordingsViewer } from './CallRecordingsViewer';
import { INITIAL_LISTINGS } from '../data/mockData';
import { calculateLeadQualityScore } from '../utils/qualityScore';

interface LeadDetailModalProps {
  lead: Lead;
  allLeads?: Lead[];
  // Real top-level notification log (see chat: was previously read from
  // lead.emailLogs, a per-lead field no real backend write populates --
  // the backend logs live on the whole crm_state document, correlated
  // back to a lead via EmailNotificationLog.leadId). Filtered to this
  // lead's own entries below.
  emailLogs?: EmailNotificationLog[];
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  // Real listing this lead is linked to (see Lead.listingId), if any --
  // resolved by the caller (CRMApp) rather than looked up in here, since
  // it needs the main app's `listings` state, not CRM's own data.
  linkedListing?: ListingDealRecord;
  onViewListing?: () => void;
  onOpenPtahKyc?: () => void;
  onOpenNcinoKyc?: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  allLeads = [],
  emailLogs = [],
  onClose,
  onUpdateLead,
  linkedListing,
  onViewListing,
  onOpenPtahKyc,
  onOpenNcinoKyc,
}) => {
  const leadEmailLogs = emailLogs.filter((log) => log.leadId === lead.id);
  const [activeTab, setActiveTab] = useState<'score' | 'activity' | 'comms' | 'recordings' | 'ai' | 'tasks' | 'emails' | 'details' | 'documents' | 'matches'>('activity');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [capturedContractFile, setCapturedContractFile] = useState<File | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingPlatform, setMeetingPlatform] = useState<'zoom' | 'skype'>('zoom');
  const [meetingCallType, setMeetingCallType] = useState<'video' | 'voice'>('video');
  const [isVoipModalOpen, setIsVoipModalOpen] = useState(false);
  const [isTranscribeModalOpen, setIsTranscribeModalOpen] = useState(false);
  const [isVirtualViewingModalOpen, setIsVirtualViewingModalOpen] = useState(false);
  const [initialRecordedDuration, setInitialRecordedDuration] = useState(0);
  const tabNavRef = React.useRef<HTMLDivElement>(null);

  // Reset tab scroll to start whenever modal opens or lead changes
  useEffect(() => {
    if (tabNavRef.current) {
      tabNavRef.current.scrollLeft = 0;
    }
  }, [lead.id]);

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
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
      author: lead.assignedAgent.name || 'Ptah Real Estate Broker',
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

  // Comprehensive CSV export of lead profile, full communication log, activity history, and tasks
  const handleExportLeadCsv = () => {
    setIsExportingCsv(true);

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows: string[] = [];

    // Header Banner
    rows.push(['PTAH REAL ESTATE CLIENT INTELLIGENCE CRM - COMPLETE LEAD EXPORT DOSSIER'].map(escapeCsv).join(','));
    rows.push([`Export Generated: ${new Date().toLocaleString()}`, `Lead ID: ${lead.id}`, `Lead Name: ${lead.name}`].map(escapeCsv).join(','));
    rows.push('');

    // 1. LEAD PROFILE & CONTACT INFORMATION
    rows.push(['--- 1. CONTACT INFORMATION & BUYER PROFILE ---'].map(escapeCsv).join(','));
    rows.push(['Field', 'Value'].map(escapeCsv).join(','));
    rows.push(['Full Name', lead.name].map(escapeCsv).join(','));
    rows.push(['Email Address', lead.email].map(escapeCsv).join(','));
    rows.push(['Phone Number', lead.phone].map(escapeCsv).join(','));
    rows.push(['WhatsApp Number', lead.whatsappNumber].map(escapeCsv).join(','));
    rows.push(['Pipeline Stage / Status', getStatusLabel(lead.status)].map(escapeCsv).join(','));
    rows.push(['Inquiry Source', lead.source].map(escapeCsv).join(','));
    rows.push(['Lead Quality Score', `${lead.leadScore || 88} / 100`].map(escapeCsv).join(','));
    rows.push(['Urgency Level', (lead.urgency || 'medium').toUpperCase()].map(escapeCsv).join(','));
    rows.push(['Initial Inquiry Date', lead.inquiryDate || 'N/A'].map(escapeCsv).join(','));
    rows.push(['Last Contacted Date', lead.lastContactedAt || 'N/A'].map(escapeCsv).join(','));
    rows.push(['Assigned Agent', `${lead.assignedAgent.name} (${lead.assignedAgent.email})`].map(escapeCsv).join(','));
    rows.push(['Target Property Title', lead.propertyTitle].map(escapeCsv).join(','));
    rows.push(['Target Property Price', formatCurrency(lead.propertyPrice)].map(escapeCsv).join(','));
    rows.push(['Buyer Budget', lead.budget || 'N/A'].map(escapeCsv).join(','));
    rows.push(['Purchase Timeframe', lead.timeframe || 'Immediate (< 30 days)'].map(escapeCsv).join(','));
    rows.push(['Pre-Approved Bond / Financial Qualification', lead.buyerType === 'Pre-approved Mortgage' ? 'Pre-Approved Bond' : 'Cash Buyer / Self-Financed'].map(escapeCsv).join(','));
    rows.push(['Tags', (lead.tags || []).join('; ')].map(escapeCsv).join(','));
    rows.push(['Profile Notes', (lead.notes || []).join(' | ')].map(escapeCsv).join(','));
    rows.push('');

    // 2. COMMUNICATIONS LOG
    rows.push(['--- 2. COMMUNICATION LOG & INTERACTIONS ---'].map(escapeCsv).join(','));
    rows.push(['Comm ID', 'Timestamp', 'Channel Type', 'Direction', 'Subject / Title', 'Message Content / Notes', 'Outcome / Result', 'Duration', 'Agent'].map(escapeCsv).join(','));
    if (lead.communications && lead.communications.length > 0) {
      lead.communications.forEach((comm) => {
        rows.push([
          comm.id,
          comm.timestamp,
          comm.type.toUpperCase(),
          comm.direction || 'outbound',
          comm.title,
          comm.content,
          comm.outcome || 'N/A',
          comm.duration || 'N/A',
          comm.author
        ].map(escapeCsv).join(','));
      });
    } else {
      rows.push(['No communication records logged yet', '', '', '', '', '', '', '', ''].map(escapeCsv).join(','));
    }
    rows.push('');

    // 3. FULL ACTIVITY TIMELINE & AUDIT HISTORY
    rows.push(['--- 3. FULL ACTIVITY TIMELINE & AUDIT HISTORY ---'].map(escapeCsv).join(','));
    rows.push(['Activity ID', 'Timestamp', 'Event Type', 'Title', 'Description', 'Author', 'Metadata Details'].map(escapeCsv).join(','));
    if (lead.activityLogs && lead.activityLogs.length > 0) {
      lead.activityLogs.forEach((act) => {
        rows.push([
          act.id,
          act.timestamp,
          act.type,
          act.title,
          act.description,
          act.author,
          act.metadata ? JSON.stringify(act.metadata) : ''
        ].map(escapeCsv).join(','));
      });
    } else {
      rows.push(['No activity logs available', '', '', '', '', '', ''].map(escapeCsv).join(','));
    }
    rows.push('');

    // 4. ACTION TASKS & SLA REMINDERS
    rows.push(['--- 4. ACTION TASKS & SLA REMINDERS ---'].map(escapeCsv).join(','));
    rows.push(['Task ID', 'Title', 'Due Date', 'Priority', 'Type', 'Completed Status'].map(escapeCsv).join(','));
    if (lead.tasks && lead.tasks.length > 0) {
      lead.tasks.forEach((t) => {
        rows.push([
          t.id,
          t.title,
          t.dueDate,
          t.priority.toUpperCase(),
          t.type,
          t.status === 'completed' ? 'COMPLETED' : 'PENDING'
        ].map(escapeCsv).join(','));
      });
    } else {
      rows.push(['No tasks assigned', '', '', '', '', ''].map(escapeCsv).join(','));
    }
    rows.push('');

    // 5. ATTACHED DOCUMENTS & EXTRACTED SCHEMAS
    if (lead.documents && lead.documents.length > 0) {
      rows.push(['--- 5. LEGAL DOCUMENTS & AI EXTRACTED SCHEMAS ---'].map(escapeCsv).join(','));
      rows.push(['Document ID', 'File Name', 'Category', 'Uploaded At', 'Document Type', 'Summary', 'Agreed Price', 'Conveyancer Attorney', 'Suspensive Conditions'].map(escapeCsv).join(','));
      lead.documents.forEach((doc) => {
        rows.push([
          doc.id,
          doc.fileName,
          doc.category,
          doc.uploadedAt,
          doc.schema?.documentType || 'N/A',
          doc.schema?.documentSummary || 'N/A',
          doc.schema?.extractedFields?.propertyPrice ? formatCurrency(doc.schema.extractedFields.propertyPrice) : 'N/A',
          doc.schema?.extractedFields?.conveyancerAttorney || 'N/A',
          doc.schema?.extractedFields?.suspensiveConditions?.join('; ') || 'N/A'
        ].map(escapeCsv).join(','));
      });
      rows.push('');
    }

    // Trigger CSV File Download
    const csvContent = rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedName = lead.name.replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `PtahRealty_Lead_${sanitizedName}_FullExport_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportingCsv(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3500);
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
      author: lead.assignedAgent.name || 'Ptah Real Estate Agent',
      outcome: commOutcome,
      duration: commType === 'call' ? commDuration : undefined,
    };

    const commActivity: ActivityLogItem = {
      id: `act-comm-${Date.now()}`,
      type: 'communication',
      title: `${commDirection === 'outbound' ? 'Outbound' : 'Inbound'} ${commType.toUpperCase()}: ${commTitle}`,
      description: commContent,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Real Estate Agent',
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
      author: lead.assignedAgent.name || 'Ptah Real Estate Broker',
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
      author: lead.assignedAgent.name || 'Ptah Real Estate Broker',
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
      author: lead.assignedAgent.name || 'Ptah Real Estate Broker',
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
      author: lead.assignedAgent.name || 'Ptah Real Estate Broker',
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
    // Standard Matterport Showcase interactive tour 3D viewer
    const matterportUrl = `https://my.matterport.com/show/?m=sB28fLpM891&play=1&qs=1&brand=0`;
    window.open(matterportUrl, '_blank');

    const now = new Date().toISOString();
    const commActivity: ActivityLogItem = {
      id: `act-mp-${Date.now()}`,
      type: 'communication',
      title: `Matterport 3D Dollhouse Tour Launched`,
      description: `Opened immersive 3D spatial walkthrough for ${lead.propertyTitle} with ${lead.name}. Interactive floorplan and measurement dollhouse active.`,
      timestamp: now,
      author: lead.assignedAgent.name || 'Ptah Real Estate Broker',
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
      const response = await fetch('/api/ptah/generate-email', {
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
      const response = await fetch('/api/ptah/analyze-lead', {
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
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-slate-200 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="relative bg-slate-50 p-4 sm:p-5 pr-14 sm:pr-16 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shrink-0">
          {/* Standard Top-Right Modal Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition cursor-pointer z-10"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

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
              {/* Editable in place -- was a plain <span>, no way to fix a
                  misspelled/mistyped name after intake. Same size/weight
                  as before, just editable now. */}
              <input
                type="text"
                value={lead.name}
                onChange={(e) => onUpdateLead({ ...lead, name: e.target.value })}
                className="bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none"
                style={{ width: `${Math.max(lead.name.length, 4)}ch` }}
              />
            </h2>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 font-medium">{lead.propertyTitle}</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-700 font-semibold">{formatCurrency(lead.propertyPrice)}</span>
            </p>

            {linkedListing && (
              <button
                type="button"
                onClick={onViewListing}
                className="mt-1.5 inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Open this listing in My Listings"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Linked Listing: {linkedListing.mandateStatus}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>
            )}
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
                `Hi ${lead.name}, this is ${lead.assignedAgent.name} from Ptah Real Estate. Thank you for inquiring on ${lead.source} regarding ${lead.propertyTitle}. I'd love to share the private specifications and schedule a viewing for you.`
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

            {/* VoIP Call via Twilio WebRTC */}
            <button
              type="button"
              id="lead-voip-call-btn"
              onClick={() => setIsVoipModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Initiate 1-Click browser voice call via Twilio WebRTC"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>VoIP Call (Twilio)</span>
            </button>

            {/* Start Virtual Viewing with Unique Link & WhatsApp/Email Invite */}
            <button
              type="button"
              id="lead-start-virtual-viewing-btn"
              onClick={() => setIsVirtualViewingModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Generate unique video call link and automatically send invitation via WhatsApp or Email"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Start Virtual Viewing</span>
            </button>

            {/* Transcribe & Summarize Call / Voice Note */}
            <button
              type="button"
              id="lead-transcribe-summarize-btn"
              onClick={() => {
                setInitialRecordedDuration(0);
                setIsTranscribeModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 text-xs font-semibold transition shadow-xs cursor-pointer"
              title="Record call audio with microphone, transcribe speech, and extract action items with Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Transcribe & Summarize</span>
            </button>

            {/* Zoom / Skype Call with AI Note Taker */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMeetingPlatform('zoom');
                  setMeetingCallType('video');
                  setIsMeetingModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Launch Zoom Video Conference with Live AI Note Taker"
              >
                <Video className="w-3.5 h-3.5 text-white" />
                <span>Zoom AI</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMeetingPlatform('skype');
                  setMeetingCallType('voice');
                  setIsMeetingModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Launch Skype Call with Live AI Note Taker"
              >
                <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center text-[8px] font-black text-sky-600">
                  S
                </div>
                <span>Skype</span>
              </button>
            </div>

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

            {/* Matterport 3D Tour */}
            <button
              type="button"
              onClick={handleLaunchMatterport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition cursor-pointer"
              title="Explore 3D Matterport Dollhouse & Virtual Walkthrough"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Matterport 3D</span>
            </button>

            {/* Add File / Convert Document to Schema Quick Action */}
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Add File & Convert to Schema"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add File</span>
              {lead.documents && lead.documents.length > 0 && (
                <span className="bg-emerald-800 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {lead.documents.length}
                </span>
              )}
            </button>

            {/* Export Lead Data Button (CSV Download) */}
            <button
              type="button"
              id="export-lead-data-btn"
              onClick={handleExportLeadCsv}
              disabled={isExportingCsv}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer ${
                exportSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
              title="Export Lead's full history, contact info, and communication log to CSV"
            >
              {exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300 animate-in zoom-in-50 duration-200" />
                  <span>Exported CSV!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export Lead Data</span>
                </>
              )}
            </button>

            {/* Share Lead Deep-Link Button */}
            <button
              type="button"
              id="share-lead-btn"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition shadow-xs cursor-pointer"
              title="Generate and copy deep-link for Slack, Teams, or WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Share Lead</span>
            </button>

            {/* Camera Capture Contract Photo Button */}
            <button
              type="button"
              id="lead-camera-capture-btn"
              onClick={() => setIsCameraModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition shadow-xs cursor-pointer"
              title="Snap photo of physical contract or FICA ID using browser camera for instant Vision OCR parsing"
            >
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>Camera Scanner</span>
            </button>

            {/* Client Request Portal Modal Trigger */}
            <button
              type="button"
              id="lead-request-client-docs-btn"
              onClick={() => setIsClientPortalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition shadow-xs cursor-pointer"
              title="Generate a secure, time-sensitive unique link for client document uploads (FICA, OTP, Pre-Approval)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Request Client Docs</span>
            </button>

            {/* Ptah KYC & Compliance / FICA Clearance */}
            {(onOpenPtahKyc || onOpenNcinoKyc) && (
              <button
                type="button"
                id="lead-ptah-kyc-btn"
                onClick={onOpenPtahKyc || onOpenNcinoKyc}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition shadow-xs cursor-pointer"
                title="Open Ptah KYC — FICA Regulatory Clearance & Bank Verification"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Ptah FICA / KYC</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation - Robust, Clean, Scrollbar-Free and Non-Shrinking */}
        <div
          ref={tabNavRef}
          className="bg-slate-100/80 border-b border-slate-200 px-3 sm:px-5 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2 shrink-0 select-none"
        >
          {/* TAB 1: Activity Feed */}
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'activity'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200 font-bold ring-1 ring-emerald-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Activity Feed</span>
          </button>

          {/* TAB 2: AI Quality Score */}
          <button
            type="button"
            onClick={() => setActiveTab('score')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'score'
                ? 'bg-white text-purple-950 shadow-xs border border-purple-200 font-bold ring-1 ring-purple-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Quality Score</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono bg-purple-100 text-purple-800 border border-purple-200">
              {lead.leadScore || 88}
            </span>
          </button>

          {/* TAB 3: Communications Hub */}
          <button
            type="button"
            onClick={() => setActiveTab('comms')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'comms'
                ? 'bg-white text-blue-950 shadow-xs border border-blue-200 font-bold ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Communications</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200">
              {lead.communications.length}
            </span>
          </button>

          {/* TAB: VoIP & Call Recordings */}
          <button
            type="button"
            id="tab-voip-recordings-btn"
            onClick={() => setActiveTab('recordings')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'recordings'
                ? 'bg-white text-blue-950 shadow-xs border border-blue-200 font-bold ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>VoIP & Recordings</span>
            {(lead.callRecordings?.length || 0) > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200">
                {lead.callRecordings?.length}
              </span>
            )}
          </button>

          {/* TAB 4: AI Pitch Generator */}
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'ai'
                ? 'bg-white text-amber-950 shadow-xs border border-amber-200 font-bold ring-1 ring-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Pitch Generator</span>
          </button>

          {/* TAB 5: Task Reminders */}
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-white text-indigo-950 shadow-xs border border-indigo-200 font-bold ring-1 ring-indigo-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Task Reminders</span>
            {lead.tasks.filter((t) => t.status === 'pending').length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono bg-slate-200 text-slate-700">
                {lead.tasks.filter((t) => t.status === 'pending').length}
              </span>
            )}
          </button>

          {/* TAB 6: Email Automations */}
          <button
            type="button"
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'emails'
                ? 'bg-white text-teal-950 shadow-xs border border-teal-200 font-bold ring-1 ring-teal-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-teal-600" />
            <span>Email Automations</span>
            {leadEmailLogs.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono bg-slate-200 text-slate-700">
                {leadEmailLogs.length}
              </span>
            )}
          </button>

          {/* TAB 7: Property & Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'details'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-300 font-bold ring-1 ring-slate-400/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Property & Profile</span>
          </button>

          {/* TAB 8: Documents & AI Schema */}
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'documents'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200 font-bold ring-1 ring-emerald-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Documents & Schema</span>
            {lead.documents && lead.documents.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono bg-emerald-100 text-emerald-800">
                {lead.documents.length}
              </span>
            )}
          </button>

          {/* TAB 9: Compare Interests & Inventory Matchmaker */}
          <button
            type="button"
            id="tab-compare-interests-btn"
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition cursor-pointer shrink-0 ${
              activeTab === 'matches'
                ? 'bg-white text-indigo-950 shadow-xs border border-indigo-200 font-bold ring-1 ring-indigo-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Compare Interests</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono bg-indigo-100 text-indigo-800">
              Matches
            </span>
          </button>
        </div>

        {/* Tab Contents - Scrollable with min-h-0 for Flexbox safety */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-6">
          {/* Universal 15-Minute SLA Visual Countdown Timer */}
          <SlaCountdownTimer
            lead={lead}
            onUpdateLead={onUpdateLead}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />

          {/* Inline 30-Day Engagement Frequency Line Chart */}
          <LeadEngagementChart lead={lead} />

          {/* TAB: ACTIVITY FEED */}
          {activeTab === 'activity' && (
            <LeadActivityFeed
              lead={lead}
              onUpdateLead={onUpdateLead}
              emailLogs={leadEmailLogs}
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

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingPlatform('zoom');
                      setMeetingCallType('video');
                      setIsMeetingModalOpen(true);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Zoom Meeting (AI Notes)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingPlatform('skype');
                      setMeetingCallType('voice');
                      setIsMeetingModalOpen(true);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-[9px] font-black text-sky-600">
                      S
                    </div>
                    <span>Skype Call (AI Notes)</span>
                  </button>
                  <button
                    onClick={() => setShowLogCommForm(!showLogCommForm)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Interaction</span>
                  </button>
                </div>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-600 font-medium">Interaction Notes</label>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-400">Voice Dictation:</span>
                        <VoiceNoteTranscriber
                          lead={lead}
                          buttonOnly={true}
                          onUpdateLead={onUpdateLead}
                          onAppendText={(text) => {
                            setCommContent((prev) => (prev ? `${prev} ${text}` : text));
                          }}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <textarea
                        required
                        rows={3}
                        value={commContent}
                        onChange={(e) => setCommContent(e.target.value)}
                        placeholder="Key topics discussed, client feedback, or click microphone to transcribe speech..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
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

              {/* Quick SpeechRecognition Voice Note Transcriber Bar */}
              <VoiceNoteTranscriber
                lead={lead}
                onUpdateLead={onUpdateLead}
              />

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

          {/* TAB: VOIP & CALL RECORDINGS */}
          {activeTab === 'recordings' && (
            <CallRecordingsViewer
              lead={lead}
              onUpdateLead={onUpdateLead}
              onOpenVoipCall={() => setIsVoipModalOpen(true)}
              onOpenTranscribeSummarize={() => {
                setInitialRecordedDuration(0);
                setIsTranscribeModalOpen(true);
              }}
            />
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
                  <span>{aiGenerating ? 'Drafting Custom Real Estate Pitch...' : 'Generate Follow-up Email with Gemini AI'}</span>
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
                {leadEmailLogs.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs italic">
                    No automated notifications recorded for this lead yet.
                  </div>
                ) : (
                  leadEmailLogs.map((log) => (
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

                {/* Document & Schema Quick Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lead.documents?.length || 0} Attached Document Schemas</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition cursor-pointer"
                  >
                    Manage Files & Schemas →
                  </button>
                </div>

                {/* Compare Interests & Inventory Matching Card */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-indigo-50/50 p-3 rounded-xl border border-indigo-200/80">
                  <div>
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Compare Preferred Attributes vs Database Listings
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Cross-reference {lead.propertyType} preferences against active inventory.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('matches')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
                  >
                    <span>View Matches →</span>
                  </button>
                </div>

                {/* Export Lead Data Card */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Complete Lead Dossier Export</span>
                    <span className="text-[11px] text-slate-500 block">Download full history, contact info, and communication log to CSV</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportLeadCsv}
                    disabled={isExportingCsv}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENTS & AI SCHEMA CONVERTER */}
          {activeTab === 'documents' && (
            <LeadDocumentConverter
              lead={lead}
              onUpdateLead={onUpdateLead}
              initialCapturedFile={capturedContractFile}
              onCapturedFileProcessed={() => setCapturedContractFile(null)}
            />
          )}

          {/* TAB 9: COMPARE INTERESTS & INVENTORY MATCHMAKER */}
          {activeTab === 'matches' && (
            <LeadPropertyMatcher
              lead={lead}
              listings={INITIAL_LISTINGS}
              onUpdateLead={onUpdateLead}
            />
          )}
        </div>
      </div>

      {/* Share Lead Profile Deep-Link Modal */}
      <ShareLeadModal
        lead={lead}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Client Document Request Portal Modal */}
      {isClientPortalOpen && (
        <ClientRequestPortalModal
          isOpen={isClientPortalOpen}
          onClose={() => setIsClientPortalOpen(false)}
          lead={lead}
          onUpdateLead={onUpdateLead}
        />
      )}

      {/* Camera Capture Physical Contract Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          leadName={lead.name}
          onCaptureComplete={(file) => {
            setCapturedContractFile(file);
            setActiveTab('documents');
          }}
        />
      )}

      {/* Zoom / Skype Video & Voice Conference with AI Note Taker */}
      {isMeetingModalOpen && (
        <MeetingCallModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
          lead={lead}
          onUpdateLead={onUpdateLead}
          defaultPlatform={meetingPlatform}
          defaultCallType={meetingCallType}
        />
      )}

      {/* VoIP Browser Calling Modal (Twilio WebRTC) */}
      <VoipCallModal
        isOpen={isVoipModalOpen}
        onClose={() => setIsVoipModalOpen(false)}
        lead={lead}
        onUpdateLead={onUpdateLead}
        onOpenTranscribeSummarize={(duration) => {
          setInitialRecordedDuration(duration);
          setIsTranscribeModalOpen(true);
        }}
      />

      {/* Transcribe & Summarize Feature (Gemini 3.8 Flash) */}
      <TranscribeSummarizeModal
        isOpen={isTranscribeModalOpen}
        onClose={() => setIsTranscribeModalOpen(false)}
        lead={lead}
        onUpdateLead={onUpdateLead}
        initialDurationSecs={initialRecordedDuration}
      />

      {/* Start Virtual Viewing Modal (Unique Video Link & WhatsApp/Email Invitations) */}
      <VirtualViewingModal
        isOpen={isVirtualViewingModalOpen}
        onClose={() => setIsVirtualViewingModalOpen(false)}
        lead={lead}
        onUpdateLead={onUpdateLead}
        onLaunchMeetingSession={(platform) => {
          setMeetingPlatform(platform);
          setMeetingCallType('video');
          setIsMeetingModalOpen(true);
        }}
      />
    </div>
  );
};
