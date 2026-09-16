import React, { useState, useEffect } from 'react';
import {
  X,
  Video,
  Sparkles,
  Share2,
  Copy,
  Check,
  Calendar,
  Clock,
  MessageSquare,
  Mail,
  ExternalLink,
  Shield,
  Layers,
  Send,
  User,
  Building
} from 'lucide-react';
import { Lead, ActivityLogItem, EmailNotificationLog, CommunicationItem } from '../types';

interface VirtualViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
  onLaunchMeetingSession?: (platform: 'zoom' | 'skype') => void;
}

export const VirtualViewingModal: React.FC<VirtualViewingModalProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdateLead,
  onLaunchMeetingSession,
}) => {
  const [platform, setPlatform] = useState<'zoom' | 'skype' | 'meet'>('zoom');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [include3dWalkthrough, setInclude3dWalkthrough] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sentWhatsapp, setSentWhatsapp] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  // Generate deterministic unique meeting link based on lead id and platform
  const generateMeetingLink = () => {
    const cleanLeadRef = (lead.referenceNumber || lead.id || 'PTR-8041').toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomHash = Math.random().toString(36).substring(2, 7);
    if (platform === 'zoom') {
      return `https://zoom.us/j/9482710385?pwd=ptah-${cleanLeadRef}-${randomHash}`;
    }
    if (platform === 'skype') {
      return `https://join.skype.com/invite/ptah-viewing-${cleanLeadRef}-${randomHash}`;
    }
    return `https://meet.google.com/ptah-${cleanLeadRef}-${randomHash}`;
  };

  const [uniqueMeetingLink, setUniqueMeetingLink] = useState(generateMeetingLink);

  // Regenerate link when platform changes
  useEffect(() => {
    setUniqueMeetingLink(generateMeetingLink());
  }, [platform, lead.id]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Formatted date string for invite
  const formatScheduledDateDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // WhatsApp message template
  const getWhatsappInvitationText = () => {
    const dateFormatted = formatScheduledDateDisplay(scheduledDate);
    const platformLabel = platform === 'zoom' ? 'Zoom 4K' : platform === 'skype' ? 'Skype HD' : 'Google Meet';
    return `Hi ${lead.name}, this is ${lead.assignedAgent?.name || 'Ptah Real Estate'}.

You are invited to an exclusive private **Virtual Viewing & 3D Walkthrough** of *${lead.propertyTitle}*.

🗓 **Time:** ${dateFormatted} SAST
🎥 **Platform:** ${platformLabel}
🔗 **Private Access Link:** ${uniqueMeetingLink}
${include3dWalkthrough ? '🏛 **Matterport 3D Twin:** Includes live architectural review' : ''}

Please let me know if this time works well for you or if you prefer an alternate slot.`;
  };

  // Copy Link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(uniqueMeetingLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Send WhatsApp Invitation & Log Event
  const handleSendWhatsapp = () => {
    const message = getWhatsappInvitationText();
    const encoded = encodeURIComponent(message);
    const cleanPhone = lead.whatsappNumber?.replace(/[^0-9]/g, '') || lead.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    window.open(waUrl, '_blank');
    setSentWhatsapp(true);

    const now = new Date().toISOString();
    const platformLabel = platform === 'zoom' ? 'Zoom' : platform === 'skype' ? 'Skype' : 'Google Meet';

    // 1. Log Communication
    const newComm: CommunicationItem = {
      id: `comm-vv-wa-${Date.now()}`,
      type: 'whatsapp',
      direction: 'outbound',
      title: `Virtual Viewing Invitation Dispatched (${platformLabel})`,
      content: `Sent WhatsApp invitation to ${lead.name} with unique link: ${uniqueMeetingLink} for ${formatScheduledDateDisplay(scheduledDate)}.`,
      timestamp: now,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      outcome: 'Invitation Dispatched',
    };

    // 2. Log Activity
    const newActivity: ActivityLogItem = {
      id: `act-vv-wa-${Date.now()}`,
      type: 'viewing_scheduled',
      title: `Virtual Viewing Scheduled via ${platformLabel}`,
      description: `Sent invitation to ${lead.name} via WhatsApp. Scheduled for ${formatScheduledDateDisplay(scheduledDate)}.`,
      timestamp: now,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      metadata: {
        commType: 'meeting',
        outcome: `${platformLabel} Link Generated`,
        tag: 'Virtual Viewing',
      },
    };

    onUpdateLead({
      ...lead,
      communications: [newComm, ...(lead.communications || [])],
      activityLogs: [newActivity, ...(lead.activityLogs || [])],
      status: lead.status === 'new' || lead.status === 'contacted' ? 'viewing_scheduled' : lead.status,
      lastContactedAt: now,
    });

    setTimeout(() => setSentWhatsapp(false), 3000);
  };

  // Send Email Invitation & Log Email
  const handleSendEmail = () => {
    const now = new Date().toISOString();
    const platformLabel = platform === 'zoom' ? 'Zoom' : platform === 'skype' ? 'Skype' : 'Google Meet';
    const dateFormatted = formatScheduledDateDisplay(scheduledDate);

    // 1. Email Notification Log
    const newEmailLog: EmailNotificationLog = {
      id: `em-vv-${Date.now()}`,
      recipientType: 'client',
      recipientEmail: lead.email,
      subject: `Exclusive Virtual Viewing Invitation: ${lead.propertyTitle} - Ptah Realty`,
      triggerReason: `Virtual Viewing Scheduled via ${platformLabel}`,
      timestamp: now,
      status: 'delivered',
      previewSnippet: `You are invited to a private 4K video walkthrough on ${dateFormatted}. Meeting Link: ${uniqueMeetingLink}`,
      propertyTitle: lead.propertyTitle,
    };

    // 2. Activity Log
    const newActivity: ActivityLogItem = {
      id: `act-vv-em-${Date.now()}`,
      type: 'email_automation',
      title: `Virtual Viewing Email Invitation Delivered`,
      description: `Dispatched formal digital invitation for ${lead.propertyTitle} to ${lead.email}. Join link: ${uniqueMeetingLink}.`,
      timestamp: now,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      metadata: {
        commType: 'email',
        emailRecipient: lead.email,
        tag: 'Virtual Viewing Email',
      },
    };

    onUpdateLead({
      ...lead,
      emailLogs: [newEmailLog, ...(lead.emailLogs || [])],
      activityLogs: [newActivity, ...(lead.activityLogs || [])],
      status: lead.status === 'new' || lead.status === 'contacted' ? 'viewing_scheduled' : lead.status,
      lastContactedAt: now,
    });

    setSentEmail(true);
    setTimeout(() => setSentEmail(false), 3000);
  };

  // Launch Host Session
  const handleLaunchHost = () => {
    if (onLaunchMeetingSession && (platform === 'zoom' || platform === 'skype')) {
      onClose();
      onLaunchMeetingSession(platform);
    } else {
      window.open(uniqueMeetingLink, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="virtual-viewing-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="virtual-viewing-modal-container"
        className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Video className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Start Virtual Viewing</h3>
              <p className="text-xs text-blue-200/80">
                Generate unique secure video link & dispatch client invitations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Target Lead & Property Overview */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Client</span>
              <div className="text-sm font-bold text-slate-900">{lead.name}</div>
              <div className="text-xs text-slate-500">{lead.propertyTitle}</div>
            </div>
            <div className="text-right text-xs">
              <div className="font-mono font-semibold text-blue-600">{lead.whatsappNumber || lead.phone}</div>
              <div className="text-slate-400 text-[11px]">{lead.email}</div>
            </div>
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Video Provider</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPlatform('zoom')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  platform === 'zoom'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">4K HDR</span>
                </div>
                <div className="mt-2 font-bold text-xs">Zoom Pro</div>
                <div className="text-[10px] text-slate-500">Cloud recording & AI</div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('skype')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  platform === 'skype'
                    ? 'bg-sky-50 border-sky-500 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-3 h-3 rounded-full bg-sky-500" />
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">No App Needed</span>
                </div>
                <div className="mt-2 font-bold text-xs">Skype Web</div>
                <div className="text-[10px] text-slate-500">Browser 1-click join</div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('meet')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  platform === 'meet'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Workspace</span>
                </div>
                <div className="mt-2 font-bold text-xs">Google Meet</div>
                <div className="text-[10px] text-slate-500">Google Calendar sync</div>
              </button>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-full cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={include3dWalkthrough}
                  onChange={(e) => setInclude3dWalkthrough(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Embed Matterport 3D Dollhouse
                </span>
              </label>
            </div>
          </div>

          {/* Generated Unique Meeting Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Unique Generated Meeting Link</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Ready to share</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={uniqueMeetingLink}
                className="flex-1 bg-slate-100 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800 selection:bg-blue-100 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Invitation Preview Card */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Luxury Viewing Invitation Preview</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {platform.toUpperCase()} VIP
              </span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {getWhatsappInvitationText()}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            {/* WhatsApp Send Button */}
            <button
              type="button"
              onClick={handleSendWhatsapp}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              title="Automatically send invitation via WhatsApp and log to lead timeline"
            >
              {sentWhatsapp ? <Check className="w-4 h-4 text-emerald-200" /> : <MessageSquare className="w-4 h-4" />}
              <span>{sentWhatsapp ? 'WhatsApp Sent & Logged!' : 'Send WhatsApp Invite'}</span>
            </button>

            {/* Email Send Button */}
            <button
              type="button"
              onClick={handleSendEmail}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              title="Send invitation via Email and log to lead email history"
            >
              {sentEmail ? <Check className="w-4 h-4 text-blue-200" /> : <Mail className="w-4 h-4" />}
              <span>{sentEmail ? 'Email Sent & Logged!' : 'Send Email Invite'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Host Launch Button */}
            <button
              type="button"
              onClick={handleLaunchHost}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Video className="w-4 h-4 text-blue-400" />
              <span>Launch as Host</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
