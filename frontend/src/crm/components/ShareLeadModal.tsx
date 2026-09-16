import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageSquare,
  Send,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Link,
  Users
} from 'lucide-react';
import { Lead } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ShareLeadModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLeadModal: React.FC<ShareLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Build clean deep link URL using current origin + pathname + ?leadId=
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const deepLink = `${origin}${pathname}?leadId=${encodeURIComponent(lead.id)}`;

  // Formatted copy for Slack / Discord
  const slackText = `*Ptah Real Estate Luxury Lead Dossier* 
*Client:* ${lead.name} (${lead.buyerType})
*Reference:* \`${lead.referenceNumber}\` | *Lead Score:* ${lead.leadScore}/100
*Property:* ${lead.propertyTitle} — *${formatCurrency(lead.propertyPrice)}*
*Status:* ${lead.status.toUpperCase()} | *Urgency:* ${lead.urgency.toUpperCase()}
*Assigned Agent:* ${lead.assignedAgent.name}
*Direct Lead Profile:* ${deepLink}`;

  // Formatted copy for WhatsApp
  const whatsappText = `*Ptah Real Estate Lead Collaboration*\nClient: *${lead.name}*\nProperty: *${lead.propertyTitle}* (${formatCurrency(lead.propertyPrice)})\nScore: *${lead.leadScore}/100* | Stage: *${lead.status.toUpperCase()}*\nDirect Link: ${deepLink}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Share Lead for Internal Collaboration
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Deep-Link
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Share <strong className="text-slate-700">{lead.name}</strong> with colleagues in Slack, Teams, or WhatsApp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Direct Link Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Direct Lead Profile Deep-Link
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 truncate select-all">
                {deepLink}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(deepLink, 'link')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
              >
                {copiedType === 'link' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Opening this link will automatically open the CRM to {lead.name}'s profile modal.
            </p>
          </div>

          {/* Quick Collaboration Channels Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              Quick Share Channels
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Slack / Teams Formatted Copy */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-[#4A154B] text-white flex items-center justify-center text-[10px] font-bold">
                      #
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Slack & Teams
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Formatted with client specs, score ({lead.leadScore}/100), and pricing for deal channels.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(slackText, 'slack')}
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-2xs transition cursor-pointer"
                >
                  {copiedType === 'slack' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied for Slack!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Slack Markdown</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Direct Chat */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-950">
                      WhatsApp Broker Chat
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Send directly to an agent group or co-broker with pre-composed lead summary.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lead Summary Preview Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Preview of Shared Snapshot:</span>
              <span className="font-mono text-emerald-700 font-bold">{lead.referenceNumber}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{lead.name}</span>
                <span className="text-emerald-700 font-bold">{formatCurrency(lead.propertyPrice)}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{lead.propertyTitle}</p>
              <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                <span>Score: <strong className="text-purple-700">{lead.leadScore}/100</strong></span>
                <span>•</span>
                <span>Type: {lead.buyerType}</span>
                <span>•</span>
                <span>Agent: {lead.assignedAgent.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            POPIA Compliant Internal Sharing
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
