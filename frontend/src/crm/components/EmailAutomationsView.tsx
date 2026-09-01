import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  Bell, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Eye, 
  Settings, 
  Plus, 
  Sparkles,
  Building,
  UserCheck,
  Send,
  Radio,
  AlertCircle
} from 'lucide-react';
import { AutomationRule, EmailNotificationLog, Lead } from '../types';
import { formatDate } from '../utils/formatters';

interface EmailAutomationsViewProps {
  automationRules: AutomationRule[];
  onToggleRule: (ruleId: string) => void;
  emailLogs: EmailNotificationLog[];
  onTriggerTestNotification: () => void;
  latestLead?: Lead;
  onOpenConnectors?: () => void;
}

export const EmailAutomationsView: React.FC<EmailAutomationsViewProps> = ({
  automationRules,
  onToggleRule,
  emailLogs,
  onTriggerTestNotification,
  latestLead,
  onOpenConnectors,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'templates' | 'logs'>('rules');
  const [selectedTemplate, setSelectedTemplate] = useState<'agent_alert' | 'client_autoresponder'>('agent_alert');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Automated Notification Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Email Notifications & Workflows</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Automatically sends real broker email alerts to a new lead's assigned agent and client auto-responders whenever a lead arrives -- for each active rule below matching that lead's source. Real AWS SES sends: a rule with no matching source, or turned off, genuinely won't fire.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {onOpenConnectors && (
            <button
              onClick={onOpenConnectors}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Manage SMTP, Gmail, & API Connectors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Mail & API Connectors</span>
            </button>
          )}
          <button
            onClick={onTriggerTestNotification}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Email Alert</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'rules' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Active Automation Triggers ({automationRules.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'templates' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Email Template Previews</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'logs' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Dispatch History Logs ({emailLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: RULES LIST */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automationRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                rule.isActive
                  ? 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Source: {rule.sourceFilter}
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={() => onToggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{rule.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rule.description}</p>

                {/* Actions triggered */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">Actions on Trigger:</span>
                  {rule.actions.sendAgentAlert && (
                    <div className="flex items-center space-x-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant Email Alert to Agent (privjapan@gmail.com)</span>
                    </div>
                  )}
                  {rule.actions.sendClientAutoResponder && (
                    <div className="flex items-center space-x-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant Auto-Responder with digital property brochure</span>
                    </div>
                  )}
                  {rule.actions.createTasks.map((t, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Auto-task: {t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Trigger Event: {rule.triggerEvent}</span>
                <span className="text-emerald-700 font-semibold">{rule.isActive ? 'Active & Listening' : 'Paused'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: EMAIL TEMPLATE PREVIEWS */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedTemplate('agent_alert')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedTemplate === 'agent_alert'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              1. Urgent Broker Email Alert (Internal)
            </button>
            <button
              onClick={() => setSelectedTemplate('client_autoresponder')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedTemplate === 'client_autoresponder'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              2. Client Instant Auto-Responder (Outbound)
            </button>
          </div>

          {/* Email Preview Frame */}
          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl">
            {selectedTemplate === 'agent_alert' ? (
              <div className="space-y-4 font-sans">
                <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs shadow-xs">
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span><strong>To:</strong> privjapan@gmail.com</span>
                    <span><strong>From:</strong> alerts@ptahrealty.com</span>
                  </div>
                  <div className="text-slate-900 font-bold">
                    <strong>Subject:</strong> [URGENT 15-MIN SLA] New Lead from Property 24: Alexander Sterling (R42,500,000 Clifton)
                  </div>
                </div>

                <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 text-xs shadow-xs border border-slate-200">
                  <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-900">PTAH REALTY CRM</h3>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">Inbound Lead Dispatch Notification</span>
                    </div>
                    <span className="bg-red-50 text-red-700 border border-red-200 font-bold px-2.5 py-1 rounded text-[11px]">
                      HOT LEAD • Score 94/100
                    </span>
                  </div>

                  <p className="font-medium text-slate-800">
                    Hello privjapan, a high-value prospective buyer has just enquired on <strong>Property 24</strong> regarding your exclusive listing:
                  </p>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                    <div><strong>Property:</strong> The Clifton Horizon: 5-Bed Architectural Villa (R42,500,000)</div>
                    <div><strong>Client:</strong> Alexander Sterling (Cash Buyer)</div>
                    <div><strong>Phone:</strong> +27 82 443 8901 • <strong>Email:</strong> alex.sterling@luminarycap.com</div>
                    <div><strong>Inquiry:</strong> "I saw this Property 24 listing and would like to arrange an urgent private inspection this Friday afternoon. Cash funds ready."</div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href="tel:+27824438901"
                      className="inline-block bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-slate-800 transition"
                    >
                      📞 Call Alexander Immediately
                    </a>
                    <a
                      href="https://wa.me/27824438901"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-emerald-500 transition"
                    >
                      💬 Open WhatsApp Chat
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                    * Automated 15-minute follow-up task has been added to your CRM reminder queue.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                <div className="bg-white p-4 rounded-xl border border-emerald-200 text-xs shadow-xs">
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span><strong>To:</strong> [Client Email]</span>
                    <span><strong>From:</strong> concierge@ptahrealty.com</span>
                  </div>
                  <div className="text-slate-900 font-bold">
                    <strong>Subject:</strong> Thank you for your inquiry on [Property Title] - Ptah Realty Luxury Portfolio
                  </div>
                </div>

                <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 text-xs shadow-xs border border-slate-200">
                  <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-900">PTAH REALTY</h3>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">Exclusive Real Estate Advisory</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-xs">ptahrealty.com</span>
                  </div>

                  <p className="text-slate-800">
                    Dear Valued Client,
                  </p>

                  <p className="text-slate-700 leading-relaxed">
                    Thank you for contacting Ptah Realty regarding your interest. We have received your inquiry and our Senior Real Estate Principal has been directly notified.
                  </p>

                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 space-y-1.5 text-emerald-950">
                    <div className="font-bold text-emerald-900">What happens next:</div>
                    <div>1. Your dedicated broker will reach out within 15 minutes to confirm viewing availability.</div>
                    <div>2. We have attached the full digital specifications, levies breakdown, and floor plans.</div>
                  </div>

                  <p className="text-slate-700">
                    If your request is urgent, you can also reach our private client desk directly via WhatsApp at +27 82 555 0192.
                  </p>

                  <div className="pt-3 border-t border-slate-100 text-slate-600 text-[11px]">
                    Warm regards,<br />
                    <strong>Ptah Realty Senior Brokerage Team</strong><br />
                    <a href="https://ptahrealty.com/" className="text-emerald-700 font-semibold">https://ptahrealty.com/</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCH HISTORY LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-900">Live Automated Email Delivery Trail</h3>
            <span className="text-xs text-slate-500">{emailLogs.length} total dispatches</span>
          </div>

          <div className="divide-y divide-slate-100">
            {emailLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No notification dispatches logged yet.
              </div>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          log.recipientType === 'agent'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {log.recipientType === 'agent' ? 'BROKER NOTIFICATION' : 'CLIENT AUTO-RESPONDER'}
                      </span>
                      <span className="font-semibold text-xs text-slate-900">{log.subject}</span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">{formatDate(log.timestamp)}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {log.status === 'failed' && log.error ? log.error : log.previewSnippet}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Recipient: {log.recipientEmail}</span>
                    {log.status === 'failed' ? (
                      <span className="text-rose-700 flex items-center gap-1 font-sans font-semibold">
                        <AlertCircle className="w-3 h-3" /> FAILED
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1 font-sans font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> {log.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
