import React, { useState, useEffect } from 'react';
import {
  Globe,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Copy,
  Code,
  Check,
} from 'lucide-react';
import { PropertyRecord } from '../../types';
import {
  getListingCopy,
  ListingCopyDraft,
  publishListing,
  PublishListingResult,
  getListingFeedXml,
  getListingSyncStatus,
  SyncJob,
  getPortalConnection,
  PortalConnectionStatus,
} from '../../services/api';

interface PortalSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
}

// Property24 and Private Property are both served through one Entegral
// Sync API account on the backend (services/property24_feed.py) -- there
// is no independent per-portal status to show, so this modal shows ONE
// real syndication channel rather than pretending several are live.
export const PortalSyncModal: React.FC<PortalSyncModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [connection, setConnection] = useState<PortalConnectionStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiListingCopy, setAiListingCopy] = useState<ListingCopyDraft | null>(null);
  const [lastResult, setLastResult] = useState<PublishListingResult | { feed_xml: string } | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !property) return;
    void refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, property?.id]);

  const refreshStatus = async () => {
    if (!property) return;
    setStatusError(null);
    try {
      const [statusRes, connRes] = await Promise.all([
        getListingSyncStatus(property.id),
        getPortalConnection('entegral_sync'),
      ]);
      setJobs(statusRes.jobs);
      setConnection(connRes);
    } catch (err) {
      console.error('Error fetching listing sync status:', err);
      setStatusError('Could not load sync status for this property.');
    }
  };

  const resolvePrice = (): number =>
    property?.currentSale?.salePrice || property?.property24Listing?.askingPrice || 0;

  const resolveDescription = (): string =>
    aiListingCopy?.description ||
    `${property?.accommodation?.type || 'Property'} at ${property?.address}, ${property?.suburb}.`;

  const handleSync = async () => {
    if (!property) return;
    const price = resolvePrice();
    if (!price) {
      setStatusError('Set an asking price on this property before syncing to portals.');
      return;
    }
    setIsSyncing(true);
    setStatusError(null);
    try {
      const result = await publishListing(property.id, resolveDescription(), price);
      setLastResult(result);
      await refreshStatus();
    } catch (err) {
      console.error('Error publishing listing:', err);
      setStatusError('Sync request failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGetFeedXml = async () => {
    if (!property) return;
    try {
      const result = await getListingFeedXml(property.id, resolveDescription(), resolvePrice());
      setLastResult(result);
    } catch (err) {
      console.error('Error generating feed XML:', err);
      setStatusError('Could not generate the feed XML.');
    }
  };

  const handleGenerateAiListingCopy = async () => {
    if (!property) return;
    setIsGeneratingAi(true);
    try {
      const data = await getListingCopy(property, 'Property24', resolvePrice() || undefined);
      setAiListingCopy(data);
    } catch (err) {
      console.error('Error generating listing copy:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyPayload = () => {
    const text = lastResult
      ? JSON.stringify(lastResult, null, 2)
      : jobs.length
      ? JSON.stringify(jobs[0], null, 2)
      : '';
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  if (!isOpen || !property) return null;

  const latestJob = jobs[0];
  const feedXml = lastResult && 'feed_xml' in lastResult ? lastResult.feed_xml : undefined;
  const publishSuccess = lastResult && 'success' in lastResult ? lastResult.success : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Top Header */}
        <div className="px-4 py-3 bg-[#006980] border-b border-cyan-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950/50 rounded text-cyan-200 border border-cyan-400/30">
              <Globe className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Portal Syndication (Property24 & Private Property)
              </h2>
              <p className="text-xs text-cyan-100 font-medium">
                via Entegral Sync • {property.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-colors shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-cyan-700 rounded text-cyan-100 hover:text-white transition-colors text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {statusError && (
            <div className="bg-amber-950/40 border border-amber-800 text-amber-200 text-xs rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusError}</span>
            </div>
          )}

          {/* AI Listing Copywriting Assistant */}
          <div className="bg-slate-800/80 border border-cyan-900/60 p-3.5 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-100 text-xs uppercase tracking-wide">
                  AI Listing Copywriting Assistant
                </span>
              </div>
              <button
                onClick={handleGenerateAiListingCopy}
                disabled={isGeneratingAi}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded flex items-center gap-1.5 transition-colors"
              >
                {isGeneratingAi ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Generate Portal Copy</span>
              </button>
            </div>

            {aiListingCopy ? (
              <div className="bg-slate-900 p-3 rounded border border-slate-700 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Headline:</span>
                  <p className="font-bold text-cyan-300 text-sm">{aiListingCopy.headline}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Description:</span>
                  <p className="text-slate-200 leading-relaxed text-[11px]">{aiListingCopy.description}</p>
                </div>
                {aiListingCopy.features?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiListingCopy.features.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-cyan-200 text-[10px] rounded border border-slate-700">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Click above to draft portal copy for this property. Used automatically as the sync description below.
              </p>
            )}
          </div>

          {/* Real Sync Status */}
          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-lg space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Entegral Connection</span>
                <span className={`font-bold ${connection?.is_configured ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {connection?.is_configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Latest Sync Status</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    latestJob?.status === 'success'
                      ? 'text-emerald-400'
                      : latestJob?.status === 'failed'
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  {latestJob?.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                  {latestJob ? latestJob.status : 'Never synced'}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Asking Price</span>
                <span className="font-mono text-slate-200">
                  {resolvePrice() ? `R ${resolvePrice().toLocaleString('en-ZA')}` : 'Not set'}
                </span>
              </div>
            </div>

            {latestJob?.status === 'failed' && latestJob.error_detail && (
              <div className="bg-red-950/40 border border-red-800 text-red-200 text-[11px] rounded p-2">
                {latestJob.error_detail}
              </div>
            )}

            {publishSuccess === false && lastResult && 'error_message' in lastResult && lastResult.error_message && (
              <div className="bg-amber-950/40 border border-amber-800 text-amber-200 text-[11px] rounded p-2">
                {lastResult.error_message}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleGetFeedXml}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Code className="w-3 h-3" />
                <span>Get Feed XML</span>
              </button>
              {(feedXml || lastResult) && (
                <button
                  onClick={handleCopyPayload}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy Result'}</span>
                </button>
              )}
            </div>

            {feedXml && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-cyan-400" /> Syndication Feed XML
                </span>
                <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-cyan-300 font-mono text-[10px] overflow-x-auto max-h-56 leading-relaxed">
                  {feedXml}
                </pre>
                <p className="text-[10px] text-slate-500">
                  No live Entegral credentials configured yet — hand this XML to your Entegral/PropData feed
                  importer, or configure credentials to enable direct sync.
                </p>
              </div>
            )}

            {lastResult && 'raw' in lastResult && lastResult.raw && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Entegral Response
                </span>
                <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-300 font-mono text-[10px] overflow-x-auto max-h-56 leading-relaxed">
                  {lastResult.raw}
                </pre>
              </div>
            )}

            {jobs.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-cyan-400" /> Sync History
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {jobs.map((j) => (
                    <div key={j.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px]">
                      <span className={j.status === 'success' ? 'text-emerald-400' : j.status === 'failed' ? 'text-red-400' : 'text-slate-400'}>
                        {j.status}
                      </span>
                      <span className="text-slate-500">
                        {new Date(j.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
