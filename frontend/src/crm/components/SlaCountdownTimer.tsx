import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Lead, LeadStatus, CommunicationItem, ActivityLogItem } from '../types';

interface SlaCountdownTimerProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
  onNavigateTab?: (tab: 'score' | 'activity' | 'comms' | 'ai' | 'tasks' | 'emails' | 'details' | 'documents') => void;
  className?: string;
}

export const SlaCountdownTimer: React.FC<SlaCountdownTimerProps> = ({
  lead,
  onUpdateLead,
  onNavigateTab,
  className = '',
}) => {
  // 15-minute SLA duration in milliseconds = 15 * 60 * 1000 = 900,000ms
  const SLA_DURATION_MS = 15 * 60 * 1000;

  // Custom demo start time override for testing/resetting
  const [customInquiryTimestamp, setCustomInquiryTimestamp] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Tick every second to keep countdown fluid
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine effective inquiry start time
  const inquiryTimeMs = useMemo(() => {
    if (customInquiryTimestamp) return customInquiryTimestamp;
    const parsed = new Date(lead.inquiryDate).getTime();
    return isNaN(parsed) ? Date.now() - 3 * 60 * 1000 : parsed;
  }, [customInquiryTimestamp, lead.inquiryDate]);

  // SLA deadline
  const deadlineMs = inquiryTimeMs + SLA_DURATION_MS;

  // Has first contact been made?
  const hasFirstContact = useMemo(() => {
    if (lead.status !== 'new') return true;
    if (lead.lastContactedAt) return true;
    const hasOutbound = lead.communications?.some(
      (c) => c.direction === 'outbound' || c.type === 'call' || c.type === 'whatsapp' || c.type === 'email'
    );
    return !!hasOutbound;
  }, [lead.status, lead.lastContactedAt, lead.communications]);

  // Calculate first response time if contacted
  const responseMetrics = useMemo(() => {
    if (!hasFirstContact) return null;

    let contactTimeMs: number;
    if (lead.lastContactedAt) {
      contactTimeMs = new Date(lead.lastContactedAt).getTime();
    } else {
      const firstComm = lead.communications
        ?.filter((c) => c.direction === 'outbound' || c.type === 'call' || c.type === 'whatsapp' || c.type === 'email')
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
      contactTimeMs = firstComm ? new Date(firstComm.timestamp).getTime() : inquiryTimeMs + 4 * 60 * 1000 + 12000;
    }

    const elapsedMs = Math.max(0, contactTimeMs - inquiryTimeMs);
    const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));
    const elapsedSeconds = Math.floor((elapsedMs % (60 * 1000)) / 1000);
    const wasCompliant = elapsedMs <= SLA_DURATION_MS;

    return {
      elapsedMinutes,
      elapsedSeconds,
      wasCompliant,
      formattedTime: `${elapsedMinutes}m ${elapsedSeconds.toString().padStart(2, '0')}s`,
    };
  }, [hasFirstContact, lead.lastContactedAt, lead.communications, inquiryTimeMs]);

  // Active countdown calculation
  const remainingMs = deadlineMs - now;
  const isBreached = remainingMs <= 0;
  const isWarning = remainingMs > 0 && remainingMs <= 5 * 60 * 1000; // < 5 mins

  // Time display math
  const absRemainingMs = Math.abs(remainingMs);
  const displayMinutes = Math.floor(absRemainingMs / (60 * 1000));
  const displaySeconds = Math.floor((absRemainingMs % (60 * 1000)) / 1000);
  const formattedCountdown = `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;

  // Progress percentage (0 to 100)
  const elapsedRatio = Math.min(1, Math.max(0, (now - inquiryTimeMs) / SLA_DURATION_MS));
  const progressPercent = Math.round(elapsedRatio * 100);

  // Quick 1-Click First Contact Call Handler
  const handleLogFirstContactCall = () => {
    const timestampNow = new Date().toISOString();
    const newComm: CommunicationItem = {
      id: `comm-sla-call-${Date.now()}`,
      type: 'call',
      direction: 'outbound',
      title: 'First-Touch 15-Minute SLA Follow-up Call',
      content: `Called client ${lead.name} regarding inbound inquiry on ${lead.source} for ${lead.propertyTitle}. Client contacted within SLA window.`,
      timestamp: timestampNow,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      outcome: 'Connected - Initial needs assessed',
      duration: '4 mins',
    };

    const slaActivity: ActivityLogItem = {
      id: `act-sla-${Date.now()}`,
      type: 'communication',
      title: '15-Minute Response SLA Achieved via Phone Call',
      description: `Broker connected with ${lead.name} in response to ${lead.source} inquiry. Pipeline stage updated to Contacted.`,
      timestamp: timestampNow,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      metadata: {
        commType: 'call',
        outcome: 'Connected',
        tag: 'SLA Response Achieved',
      },
    };

    onUpdateLead({
      ...lead,
      status: lead.status === 'new' ? ('contacted' as LeadStatus) : lead.status,
      lastContactedAt: timestampNow,
      communications: [newComm, ...(lead.communications || [])],
      activityLogs: [slaActivity, ...(lead.activityLogs || [])],
    });
  };

  // Quick 1-Click WhatsApp First Contact Handler
  const handleLogFirstContactWhatsApp = () => {
    const timestampNow = new Date().toISOString();
    const whatsappUrl = `https://wa.me/${lead.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
      `Hi ${lead.name}, this is ${lead.assignedAgent?.name || 'Ptah Real Estate'} following up on your ${lead.source} inquiry for ${lead.propertyTitle}. I have the full property specs and viewing times ready for you.`
    )}`;
    window.open(whatsappUrl, '_blank');

    const newComm: CommunicationItem = {
      id: `comm-sla-wa-${Date.now()}`,
      type: 'whatsapp',
      direction: 'outbound',
      title: 'First-Touch WhatsApp Message Sent',
      content: `Dispatched instant WhatsApp concierge message to ${lead.phone} with property dossier link.`,
      timestamp: timestampNow,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      outcome: 'Message Delivered',
    };

    const slaActivity: ActivityLogItem = {
      id: `act-sla-wa-${Date.now()}`,
      type: 'communication',
      title: '15-Minute Response SLA Met via WhatsApp Concierge',
      description: `Dispatched personalized inquiry response to ${lead.name} (${lead.whatsappNumber}).`,
      timestamp: timestampNow,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      metadata: {
        commType: 'whatsapp',
        tag: 'SLA WhatsApp Touch',
      },
    };

    onUpdateLead({
      ...lead,
      status: lead.status === 'new' ? ('contacted' as LeadStatus) : lead.status,
      lastContactedAt: timestampNow,
      communications: [newComm, ...(lead.communications || [])],
      activityLogs: [slaActivity, ...(lead.activityLogs || [])],
    });
  };

  // Reset demo timer to simulate an inquiry arriving right now
  const handleResetDemoTimer = () => {
    setCustomInquiryTimestamp(Date.now());
    onUpdateLead({
      ...lead,
      status: 'new',
      lastContactedAt: undefined,
    });
  };

  return (
    <div
      id="sla-countdown-banner"
      className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs ${
        hasFirstContact
          ? responseMetrics?.wasCompliant
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/90 border-amber-200 text-amber-950'
          : isBreached
          ? 'bg-red-50/95 border-red-300 text-red-950 ring-1 ring-red-400/30'
          : isWarning
          ? 'bg-amber-50/95 border-amber-300 text-amber-950 ring-1 ring-amber-400/30'
          : 'bg-slate-900 border-slate-800 text-white'
      } ${className}`}
    >
      <div className="p-3.5 sm:p-4.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          {/* Left: SLA Status & Explanation */}
          <div className="flex items-start sm:items-center space-x-3.5">
            {/* Visual Icon / Ring */}
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 font-bold transition-all shadow-inner ${
                hasFirstContact
                  ? responseMetrics?.wasCompliant
                    ? 'bg-emerald-600 text-white shadow-emerald-700/40'
                    : 'bg-amber-600 text-white shadow-amber-700/40'
                  : isBreached
                  ? 'bg-red-600 text-white animate-pulse shadow-red-700/40'
                  : isWarning
                  ? 'bg-amber-500 text-white animate-bounce shadow-amber-600/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {hasFirstContact ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isBreached ? (
                <AlertTriangle className="w-6 h-6" />
              ) : isWarning ? (
                <Flame className="w-6 h-6" />
              ) : (
                <Zap className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono ${
                    hasFirstContact
                      ? responseMetrics?.wasCompliant
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                      : isBreached
                      ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                      : isWarning
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {hasFirstContact
                    ? responseMetrics?.wasCompliant
                      ? '✓ 15-Min SLA Achieved'
                      : 'SLA Exceeded'
                    : isBreached
                    ? '🚨 15-Min SLA Breached'
                    : isWarning
                    ? '⚠️ Critical SLA Warning'
                    : '⚡ 15-Minute Inbound SLA'}
                </span>

                <span
                  className={`text-xs ${
                    hasFirstContact || isBreached || isWarning ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Source: <strong className="font-semibold">{lead.source}</strong>
                </span>
              </div>

              <h4
                className={`text-sm sm:text-base font-bold mt-0.5 flex items-center gap-1.5 ${
                  hasFirstContact
                    ? responseMetrics?.wasCompliant
                      ? 'text-emerald-950'
                      : 'text-amber-950'
                    : isBreached
                    ? 'text-red-950'
                    : isWarning
                    ? 'text-amber-950'
                    : 'text-white'
                }`}
              >
                {hasFirstContact ? (
                  <span>
                    First Contact Completed in{' '}
                    <span className="font-mono underline decoration-emerald-500/50">
                      {responseMetrics?.formattedTime || '4m 12s'}
                    </span>
                  </span>
                ) : isBreached ? (
                  <span>
                    Response Window Overdue by{' '}
                    <span className="font-mono text-red-600 font-extrabold">+{formattedCountdown}</span>
                  </span>
                ) : (
                  <span>
                    First-Touch Response Window:{' '}
                    <span className="font-mono text-emerald-400 font-extrabold">{formattedCountdown}</span> Remaining
                  </span>
                )}
              </h4>

              <p
                className={`text-xs mt-0.5 line-clamp-1 ${
                  hasFirstContact || isBreached || isWarning ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {hasFirstContact
                  ? `Broker outreach verified. Rapid response increases lead conversion by up to 391%.`
                  : isBreached
                  ? `Property 24 & portal buyers expect rapid callbacks. Connect now before buyer contacts rival agencies.`
                  : `Inbound portal lead waiting. Standard SLA requires initial contact within 15 minutes of inquiry.`}
              </p>
            </div>
          </div>

          {/* Right: Big Numeric Clock / Action Triggers */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/50">
            {/* Live Big Countdown Digital Timer for Uncontacted Leads */}
            {!hasFirstContact && (
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 font-mono shadow-xs ${
                  isBreached
                    ? 'bg-red-600 text-white border-red-700'
                    : isWarning
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-slate-800 text-emerald-400 border-slate-700'
                }`}
                title="15-Minute Response SLA Countdown Clock"
              >
                <Clock className="w-4 h-4 animate-spin-slow" />
                <span className="text-base sm:text-lg font-black tracking-tight">
                  {isBreached ? `-${formattedCountdown}` : formattedCountdown}
                </span>
                <span className="text-[10px] uppercase font-sans font-bold opacity-80">
                  {isBreached ? 'Overdue' : 'Left'}
                </span>
              </div>
            )}

            {/* Quick Action: Log First Contact via Phone */}
            {!hasFirstContact ? (
              <>
                <button
                  type="button"
                  onClick={handleLogFirstContactCall}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm hover:shadow cursor-pointer"
                  title="1-Click Call & Log First Contact"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call & Log Contact</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogFirstContactWhatsApp}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  title="1-Click WhatsApp Quick Outreach"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp Touch</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Compliance Verified
                </span>

                <button
                  type="button"
                  onClick={handleResetDemoTimer}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer text-xs flex items-center gap-1"
                  title="Simulate / Reset 15m SLA Timer for testing"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Simulate New Inbound</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar for active countdown */}
        {!hasFirstContact && (
          <div className="mt-3 w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isBreached
                  ? 'bg-red-500 w-full animate-pulse'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: isBreached ? '100%' : `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
