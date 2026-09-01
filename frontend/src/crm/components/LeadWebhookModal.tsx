import React, { useState, useEffect } from 'react';
import { X, Copy, Check, RefreshCw, Loader2, ExternalLink, ShieldAlert, Zap } from 'lucide-react';
import { getLeadWebhookConfig, rotateLeadWebhookSecret, WebhookConfig } from '../../services/api';

interface LeadWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Property24 (and every other SA property portal) has no public self-
// serve leads API -- the real, working integration path is: the portal
// already emails the agent a lead notification on every enquiry, and a
// dedicated email-parsing service (Parseur, Mailparser.io) turns that
// email into structured fields and POSTs them to the URL this modal
// shows. Same URL works for any source -- Property24, Private Property,
// IOL Property, a website form -- differentiated by a `source` field in
// what the parser sends.
export const LeadWebhookModal: React.FC<LeadWebhookModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<WebhookConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [copiedField, setCopiedField] = useState<'url' | 'secret' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    getLeadWebhookConfig()
      .then(setConfig)
      .catch((err) => setError(err?.message || 'Failed to load webhook configuration.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const handleCopy = (field: 'url' | 'secret', value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRotate = async () => {
    if (!confirm('Rotating the secret will break any Parseur/Zapier integration already using the old one. Continue?')) return;
    setIsRotating(true);
    try {
      const next = await rotateLeadWebhookSecret();
      setConfig(next);
    } catch (err: any) {
      setError(err?.message || 'Failed to rotate secret.');
    } finally {
      setIsRotating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-850 rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lead Ingestion Webhook</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Property24 and other portals don't offer a public API for pulling leads directly. The reliable way to
            get their enquiry emails into this CRM automatically is an email-parsing service — set your Property24
            (or other portal) lead notifications to forward to a parsing inbox at{' '}
            <a href="https://parseur.com" target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-0.5">
              Parseur <ExternalLink className="w-2.5 h-2.5" />
            </a>{' '}
            or{' '}
            <a href="https://mailparser.io" target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-0.5">
              Mailparser.io <ExternalLink className="w-2.5 h-2.5" />
            </a>
            , then point its webhook output at the URL below. Same URL works for any portal or a website contact form —
            just set the <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">source</code> field to match.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : config ? (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Webhook URL</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 break-all">
                    {config.webhookUrl}
                  </code>
                  <button
                    onClick={() => handleCopy('url', config.webhookUrl)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
                  >
                    {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Authorization Header (set this exactly in Parseur/Zapier)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 break-all">
                    {config.authHeader}
                  </code>
                  <button
                    onClick={() => handleCopy('secret', config.authHeader)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
                  >
                    {copiedField === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 mb-2">
                  Anyone with this secret can create leads in your CRM. Rotate it if it's ever exposed — this will break
                  any integration already configured with the old value.
                </p>
                <button
                  onClick={handleRotate}
                  disabled={isRotating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-60"
                >
                  {isRotating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Rotate Secret</span>
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
