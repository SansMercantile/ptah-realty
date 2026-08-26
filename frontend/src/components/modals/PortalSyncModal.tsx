import React, { useState, useEffect } from 'react';
import { apiFetch } from "../../lib/api";
import { 
  Globe, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Code, 
  Check, 
  ShieldCheck, 
  Layers,
  Share2
} from 'lucide-react';
import { PropertyRecord, PortalListingPayload, AIGeneratedCMACopy } from '../../types';

interface PortalSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
}

export const PortalSyncModal: React.FC<PortalSyncModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const [portals, setPortals] = useState<PortalListingPayload[]>([]);
  const [selectedPortal, setSelectedPortal] = useState<PortalListingPayload | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiListingCopy, setAiListingCopy] = useState<{ headline: string; description: string; features: string[] } | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    if (!isOpen || !property) return;
    fetchPortals();
  }, [isOpen, property?.id]);

  const fetchPortals = async () => {
    if (!property) return;
    try {
      const res = await apiFetch(`/api/portals/${property.id}`);
      const data = await res.json();
      setPortals(data.portals || []);
      if (data.portals?.length > 0) {
        setSelectedPortal(data.portals[0]);
      }
    } catch (err) {
      console.error('Error fetching portals:', err);
    }
  };

  const handleSyncPortal = async (portalId: string) => {
    if (!property) return;
    try {
      const res = await apiFetch(`/api/portals/${property.id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId })
      });
      const data = await res.json();
      if (data.portal) {
        setPortals(prev => prev.map(p => p.id === portalId ? data.portal : p));
        if (selectedPortal?.id === portalId) {
          setSelectedPortal(data.portal);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncAll = async () => {
    if (!property) return;
    setIsSyncingAll(true);
    try {
      const res = await apiFetch(`/api/portals/${property.id}/sync-all`, { method: 'POST' });
      const data = await res.json();
      setPortals(data.portals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleGenerateAiListingCopy = async () => {
    if (!property) return;
    setIsGeneratingAi(true);
    try {
      const res = await apiFetch('/api/ai/listing-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property,
          tone: 'Luxury'
        })
      });
      const data = await res.json();
      setAiListingCopy(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyPayload = () => {
    if (!selectedPortal) return;
    navigator.clipboard.writeText(JSON.stringify(selectedPortal.payloadData, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="px-4 py-3 bg-[#006980] border-b border-cyan-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950/50 rounded text-cyan-200 border border-cyan-400/30">
              <Globe className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Multi-Portal Listing Syndication & API Distribution Hub
              </h2>
              <p className="text-xs text-cyan-100 font-medium">
                Single-Click Multi-Channel Publishing • {property.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-colors shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Syndicating Feeds...' : 'Sync All Portals Now'}</span>
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
          
          {/* AI Listing Copywriting Assistant Banner */}
          <div className="bg-slate-800/80 border border-cyan-900/60 p-3.5 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-100 text-xs uppercase tracking-wide">
                  Amazon Bedrock Listing Copywriting Assistant
                </span>
              </div>
              <button
                onClick={handleGenerateAiListingCopy}
                disabled={isGeneratingAi}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded flex items-center gap-1.5 transition-colors"
              >
                {isGeneratingAi ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Generate Optimized Portal Copy</span>
              </button>
            </div>

            {aiListingCopy ? (
              <div className="bg-slate-900 p-3 rounded border border-slate-700 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Optimized Portal Headline:</span>
                  <p className="font-bold text-cyan-300 text-sm">{aiListingCopy.headline}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SEO Syndication Description:</span>
                  <p className="text-slate-200 leading-relaxed text-[11px]">{aiListingCopy.description}</p>
                </div>
                {aiListingCopy.features && (
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
                Click above to draft portal copy with Amazon Bedrock, calibrated for Property24 and Private Property workflows.
              </p>
            )}
          </div>

          {/* Portals Grid & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left: Portals List */}
            <div className="lg:col-span-1 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Connected Syndication Channels
              </span>

              {portals.map((portal) => {
                const isSelected = selectedPortal?.id === portal.id;
                return (
                  <div
                    key={portal.id}
                    onClick={() => setSelectedPortal(portal)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-slate-800 border-cyan-400 shadow-md ring-1 ring-cyan-500/40' 
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-xs">{portal.portalName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        portal.syncStatus === 'LIVE' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : portal.syncStatus === 'SYNCING'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        {portal.syncStatus === 'LIVE' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {portal.syncStatus === 'SYNCING' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                        {portal.syncStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>Listing ID: {portal.externalListingId || 'Pending'}</span>
                      <span>Synced: {new Date(portal.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Portal Payload & Actions */}
            {selectedPortal ? (
              <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700 p-4 rounded-lg space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{selectedPortal.portalName} API Feed</span>
                    {selectedPortal.listingUrl && (
                      <a
                        href={selectedPortal.listingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" /> View Public Portal Listing
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyPayload}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={() => handleSyncPortal(selectedPortal.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Sync This Portal</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Portal State</span>
                    <span className="font-bold text-emerald-400">{selectedPortal.syncStatus}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Images Included</span>
                    <span className="font-mono text-cyan-300">
                      {selectedPortal.payloadData?.images?.length || 4} High-Res
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Asking Price</span>
                    <span className="font-mono text-slate-200">
                      R {selectedPortal.payloadData?.askingPrice?.toLocaleString('en-ZA')}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Mandate Type</span>
                    <span className="font-bold text-indigo-300">Sole Mandate</span>
                  </div>
                </div>

                {/* Live JSON Payload Inspector */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold flex items-center gap-1">
                      <Code className="w-3.5 h-3.5 text-cyan-400" /> Outbound API Payload (REST / XML / GraphQL)
                    </span>
                    <span>Endpoint: api.propertyportals.co.za/v3/syndicate</span>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-cyan-300 font-mono text-[10px] overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(selectedPortal.payloadData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
};
