import React, { useState, useEffect } from 'react';
import { authHeaders } from '../../services/api';
import {
  X,
  Sparkles,
  Megaphone,
  Send,
  Palette,
  Zap,
  Globe,
  Share2,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Sliders,
  Calendar,
  Eye,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  Smartphone,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  MarketingCampaign,
  PropertyListing,
  Lead,
  ConnectorItem,
  ConnectorSyncEvent,
  CampaignConnectedApp
} from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

interface CampaignsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: MarketingCampaign[];
  onAddCampaign: (campaign: MarketingCampaign) => void;
  onUpdateCampaign: (campaign: MarketingCampaign) => void;
  listings: PropertyListing[];
  leads: Lead[];
  connectors: ConnectorItem[];
  onOpenConnectorsMarketingTab: () => void;
  onAddSyncEvent: (event: ConnectorSyncEvent) => void;
}

export const CampaignsHubModal: React.FC<CampaignsHubModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  onAddCampaign,
  onUpdateCampaign,
  listings,
  leads,
  connectors,
  onOpenConnectorsMarketingTab,
  onAddSyncEvent,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [activeTab, setActiveTab] = useState<'studio' | 'registry' | 'apps'>('studio');

  // Generator form state
  const [objective, setObjective] = useState<MarketingCampaign['objective']>('show_house');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(listings[0]?.id || 'prop-1');
  const [targetAudience, setTargetAudience] = useState<string>('Cape Town & International Ultra-High-Net-Worth Cash Buyers (LSM 10+)');
  const [tone, setTone] = useState<string>('Opulent & Prestigious');
  const [selectedApps, setSelectedApps] = useState<CampaignConnectedApp[]>(['canva', 'mailchimp', 'zapier']);
  const [customInstructions, setCustomInstructions] = useState<string>('Highlight private beach funicular access, solar inverter independence, and Sunday arrival window.');

  // AI Generation status & outputs
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedCampaign, setGeneratedCampaign] = useState<Partial<MarketingCampaign> | null>(null);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [studioChannelTab, setStudioChannelTab] = useState<'email' | 'canva' | 'zapier' | 'social'>('email');

  // Dispatch state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter state for registry
  const [registryFilter, setRegistryFilter] = useState<'all' | 'sent' | 'scheduled' | 'draft'>('all');

  if (!isOpen) return null;

  const currentProperty = listings.find((p) => p.id === selectedPropertyId) || listings[0];

  // Helper to copy text to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle app selector
  const toggleApp = (app: CampaignConnectedApp) => {
    if (selectedApps.includes(app)) {
      if (selectedApps.length > 1) {
        setSelectedApps(selectedApps.filter((a) => a !== app));
      }
    } else {
      setSelectedApps([...selectedApps, app]);
    }
  };

  // Call AI Campaign Generator Endpoint
  const handleGenerateCampaign = async () => {
    setIsGenerating(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          objective,
          property: currentProperty
            ? {
                id: currentProperty.id,
                title: currentProperty.title,
                price: currentProperty.price,
                location: currentProperty.location,
                bedrooms: currentProperty.bedrooms,
                bathrooms: currentProperty.bathrooms,
                description: currentProperty.description,
              }
            : undefined,
          targetAudience,
          tone,
          connectedApps: selectedApps,
          customNotes: customInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate campaign from AI service');
      }

      const data = await response.json();

      const newCampaignDraft: Partial<MarketingCampaign> = {
        id: `cmp-ai-${Date.now()}`,
        title: data.title || (objective === 'show_house' ? 'Sunday Show House' : objective === 'birthday_greeting' ? 'VIP Birthday Greeting' : 'Exclusive Showcase') + `: ${objective === 'birthday_greeting' ? 'VIP Client' : currentProperty?.title || 'Luxury Residence'}`,
        objective,
        status: 'draft',
        propertyId: currentProperty?.id,
        propertyTitle: currentProperty?.title,
        propertyPrice: currentProperty?.price,
        propertyLocation: currentProperty?.location,
        propertyImage: currentProperty?.featuredImage,
        targetAudience,
        connectedApps: selectedApps,
        subjectLine: data.suggestedSubjectLines?.[0]?.subject || data.title,
        previewText: data.previewText || `Private viewing invitation for ${currentProperty?.title}`,
        emailBody: data.emailBody,
        socialCaption: data.socialCaption,
        canvaTemplateUrl: 'https://www.canva.com/design/DAF8831920/edit',
        canvaDesignName: data.canvaDesign?.templateName || 'Luxury Oceanfront IG Carousel & A4 Dossier',
        aiGenerated: true,
        aiSuggestedSubjectLines: data.suggestedSubjectLines || [],
        aiCanvaPalette: data.canvaDesign?.palette || [
          { name: 'Atlantic Azure', hex: '#0F766E' },
          { name: 'Champagne Gold', hex: '#D4AF37' },
          { name: 'Obsidian Slate', hex: '#0F172A' },
          { name: 'Sandstone Warm', hex: '#F8FAFC' },
        ],
        aiZapierWorkflow: data.zapierAutomation?.workflowSteps || [
          'Catch Webhook on Ptah Campaign Publish',
          'Generate High-Res Canva PDF in Brand Kit',
          'Broadcast Mailchimp Segment: High-Net-Worth Buyers',
          'Push WhatsApp Notification to Lead Broker',
        ],
        createdAt: new Date().toISOString(),
      };

      setGeneratedCampaign(newCampaignDraft);
      setSelectedSubjectIndex(0);
    } catch (err: any) {
      console.error('Error generating AI campaign:', err);
      setAiError(err.message || 'Unable to connect to AI campaign service');
    } finally {
      setIsGenerating(false);
    }
  };

  // Dispatch campaign across Canva, Mailchimp, Zapier
  const handleDispatchCampaign = async (status: 'sent' | 'scheduled') => {
    if (!generatedCampaign) return;

    setIsDispatching(true);

    try {
      const response = await fetch('/api/campaigns/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          campaignId: generatedCampaign.id,
          campaignTitle: generatedCampaign.title,
          apps: generatedCampaign.connectedApps,
          recipientsCount: 480,
        }),
      });

      const result = await response.json();

      const finalCampaign: MarketingCampaign = {
        ...(generatedCampaign as MarketingCampaign),
        status,
        sentAt: status === 'sent' ? new Date().toISOString() : undefined,
        scheduledFor: status === 'scheduled' ? '2026-08-30 09:00' : undefined,
        metrics: {
          recipientsCount: 480,
          openRate: status === 'sent' ? 51.8 : 0,
          clickRate: status === 'sent' ? 22.4 : 0,
          leadsGenerated: status === 'sent' ? 12 : 0,
        },
      };

      onAddCampaign(finalCampaign);

      // Log sync events for each connected app
      if (generatedCampaign.connectedApps?.includes('canva')) {
        onAddSyncEvent({
          id: `sync-canva-${Date.now()}`,
          connectorId: 'conn-canva',
          connectorName: 'Canva Real Estate Design Hub',
          event: 'Brand Kit Asset Pack Generated & Synced',
          status: 'success',
          timestamp: new Date().toISOString(),
          details: `Canva template "${finalCampaign.canvaDesignName}" generated and exported for ${finalCampaign.propertyTitle}.`,
        });
      }

      if (generatedCampaign.connectedApps?.includes('mailchimp')) {
        onAddSyncEvent({
          id: `sync-mc-${Date.now()}`,
          connectorId: 'conn-mailchimp',
          connectorName: 'Mailchimp VIP Audience API',
          event: status === 'sent' ? 'VIP Audience Segment Dispatched' : 'VIP Campaign Scheduled',
          status: 'success',
          timestamp: new Date().toISOString(),
          details: `Campaign "${finalCampaign.title}" ${status === 'sent' ? 'broadcasted to 480 HNW buyers' : 'scheduled for Sunday 09:00'}. Tracking enabled.`,
        });
      }

      if (generatedCampaign.connectedApps?.includes('zapier')) {
        onAddSyncEvent({
          id: `sync-zap-${Date.now()}`,
          connectorId: 'conn-zapier',
          connectorName: 'Zapier Omnichannel Engine',
          event: 'Multi-App Campaign Catch Hook Executed',
          status: 'success',
          timestamp: new Date().toISOString(),
          details: `Zapier webhook received campaign payload for ${finalCampaign.title}. Executed 4 automated actions.`,
        });
      }

      setDispatchSuccess(true);
      setTimeout(() => {
        setDispatchSuccess(false);
        setActiveTab('registry');
      }, 1500);
    } catch (e) {
      console.error('Dispatch error:', e);
    } finally {
      setIsDispatching(false);
    }
  };

  // Connected apps summary
  const canvaConn = connectors.find((c) => c.slug === 'canva-design-hub');
  const mailchimpConn = connectors.find((c) => c.slug === 'mailchimp-audiences');
  const zapierConn = connectors.find((c) => c.slug === 'zapier-automation');
  const metaConn = connectors.find((c) => c.slug === 'meta-lead-ads');

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    if (registryFilter === 'all') return true;
    return c.status === registryFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-black w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Marketing & AI Campaigns Hub
                  </h2>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>GEMINI 3.7 AI</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connected with <strong className="text-slate-300">Canva</strong>, <strong className="text-slate-300">Mailchimp</strong>, <strong className="text-slate-300">Zapier</strong> & <strong className="text-slate-300">Meta Ads</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Connectors Health Chips & Close */}
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold">Integrations:</span>
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                <span>Canva</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold">
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Mailchimp</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>Zapier</span>
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenConnectorsMarketingTab();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manage Connectors</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-black flex items-center justify-between">
          <div className="flex space-x-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('studio')}
              className={`py-3.5 flex items-center space-x-2 border-b-2 transition ${
                activeTab === 'studio'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Campaign Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('registry')}
              className={`py-3.5 flex items-center space-x-2 border-b-2 transition ${
                activeTab === 'registry'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Megaphone className="w-4 h-4 text-slate-400" />
              <span>Campaigns Registry ({campaigns.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('apps')}
              className={`py-3.5 flex items-center space-x-2 border-b-2 transition ${
                activeTab === 'apps'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Marketing Connectors (4)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            Connected to <strong>privjapan@gmail.com</strong>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/60">
          {/* TAB 1: AI CAMPAIGN STUDIO */}
          {activeTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Generator Form (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Campaign Configuration</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Live AI Ready
                    </span>
                  </div>

                  {/* Objective Preset Chips */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      1. Campaign Objective *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setObjective('show_house')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition ${
                          objective === 'show_house'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 shadow-2xs font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        🏡 Sunday Show House
                      </button>

                      <button
                        type="button"
                        onClick={() => setObjective('just_listed')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition ${
                          objective === 'just_listed'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 shadow-2xs font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        ✨ Just Listed Exclusive
                      </button>

                      <button
                        type="button"
                        onClick={() => setObjective('vip_buyer_blast')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition ${
                          objective === 'vip_buyer_blast'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 shadow-2xs font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        💎 VIP Buyer Blast
                      </button>

                      <button
                        type="button"
                        onClick={() => setObjective('price_reduction')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition ${
                          objective === 'price_reduction'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 shadow-2xs font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        📉 Price Reduction
                      </button>

                      <button
                        type="button"
                        onClick={() => setObjective('birthday_greeting')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition ${
                          objective === 'birthday_greeting'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 shadow-2xs font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        🎁 VIP Birthday Greeting
                      </button>
                    </div>
                  </div>

                  {/* Property Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      2. Bind Property Listing *
                    </label>
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      {listings.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} — {formatCurrency(p.price)} ({p.location})
                        </option>
                      ))}
                    </select>

                    {currentProperty && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center space-x-3">
                        <img
                          src={currentProperty.featuredImage}
                          alt={currentProperty.title}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {currentProperty.title}
                          </p>
                          <p className="text-amber-600 dark:text-amber-400 font-bold">
                            {formatCurrency(currentProperty.price)} • {currentProperty.bedrooms} Beds, {currentProperty.bathrooms} Baths
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {currentProperty.location}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target Audience & Tone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        3. Target Audience
                      </label>
                      <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <option value="Cape Town & International Ultra-High-Net-Worth Cash Buyers (LSM 10+)">
                          HNW Cash Buyers (LSM 10+)
                        </option>
                        <option value="Atlantic Seaboard Investors & Foreign Diaspora">
                          Atlantic Seaboard Investors
                        </option>
                        <option value="Johannesburg Executive Families Relocating to Cape Town">
                          Joburg Executive Relocators
                        </option>
                        <option value="Diplomats, Consulates & Embassy Official Residences">
                          Diplomats & Consulates
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Tone of Voice
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <option value="Opulent & Prestigious">Opulent & Prestigious</option>
                        <option value="Urgent & Exclusive">Urgent & Exclusive</option>
                        <option value="Modern & Architectural">Modern & Architectural</option>
                        <option value="Analytical & Data-Driven">Analytical & Data-Driven</option>
                      </select>
                    </div>
                  </div>

                  {/* Connected Marketing Apps Checklist */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      4. Connect Third-Party Marketing Apps *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => toggleApp('canva')}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 text-left text-xs transition cursor-pointer ${
                          selectedApps.includes('canva')
                            ? 'bg-pink-50 dark:bg-pink-950/30 border-pink-400 text-pink-900 dark:text-pink-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                        }`}
                      >
                        <Palette className="w-4 h-4 text-pink-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate">Canva Brand Kit</div>
                          <div className="text-[10px] font-normal opacity-80">Carousels & Flyers</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleApp('mailchimp')}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 text-left text-xs transition cursor-pointer ${
                          selectedApps.includes('mailchimp')
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                        }`}
                      >
                        <Send className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate">Mailchimp VIP</div>
                          <div className="text-[10px] font-normal opacity-80">HTML Blast & Stats</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleApp('zapier')}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 text-left text-xs transition cursor-pointer ${
                          selectedApps.includes('zapier')
                            ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-400 text-orange-900 dark:text-orange-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-orange-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate">Zapier Webhooks</div>
                          <div className="text-[10px] font-normal opacity-80">Omnichannel Sync</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleApp('meta_ads')}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 text-left text-xs transition cursor-pointer ${
                          selectedApps.includes('meta_ads')
                            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-400 text-blue-900 dark:text-blue-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                        }`}
                      >
                        <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate">Meta Lead Ads</div>
                          <div className="text-[10px] font-normal opacity-80">IG & FB Sponsored</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Custom Prompt Directives */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      5. Broker Custom Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g. Mention off-grid solar, borehole, and private viewing hours..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateCampaign}
                    disabled={isGenerating}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Generating Omnichannel Campaign with Gemini 3.7...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Generate Campaign with Gemini AI</span>
                      </>
                    )}
                  </button>

                  {aiError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                      {aiError}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: AI Output & Channel Previews (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {generatedCampaign ? (
                  <div className="bg-white dark:bg-slate-850 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                    {/* Top title & status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            {generatedCampaign.objective?.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                            Targeting {generatedCampaign.targetAudience?.split('(')[0]}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                          {generatedCampaign.title}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {generatedCampaign.connectedApps?.map((app) => (
                          <span
                            key={app}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize flex items-center space-x-1"
                          >
                            {app === 'canva' && <Palette className="w-3 h-3 text-pink-500" />}
                            {app === 'mailchimp' && <Send className="w-3 h-3 text-amber-500" />}
                            {app === 'zapier' && <Zap className="w-3 h-3 text-orange-500" />}
                            {app === 'meta_ads' && <Globe className="w-3 h-3 text-blue-500" />}
                            <span>{app.replace('_', ' ')}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Suggested Subject Lines with Open Rate Predictor */}
                    {generatedCampaign.aiSuggestedSubjectLines && generatedCampaign.aiSuggestedSubjectLines.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>AI-Optimized Subject Lines (Predicted Open Rates)</span>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            Click to select active subject
                          </span>
                        </label>
                        <div className="space-y-1.5">
                          {generatedCampaign.aiSuggestedSubjectLines.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedSubjectIndex(idx);
                                setGeneratedCampaign({
                                  ...generatedCampaign,
                                  subjectLine: item.subject,
                                });
                              }}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                                selectedSubjectIndex === idx
                                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-slate-900 dark:text-white font-semibold shadow-2xs'
                                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate pr-2">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    selectedSubjectIndex === idx
                                      ? 'border-amber-500 bg-amber-500 text-slate-950'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {selectedSubjectIndex === idx && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                                <span className="truncate">{item.subject}</span>
                              </div>

                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                <span>{item.predictedOpenRate}% Open</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Channel Preview Subtabs */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-black">
                      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 px-3 text-xs font-bold">
                        <button
                          onClick={() => setStudioChannelTab('email')}
                          className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
                            studioChannelTab === 'email'
                              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5 text-amber-500" />
                          <span>Mailchimp HTML</span>
                        </button>

                        <button
                          onClick={() => setStudioChannelTab('canva')}
                          className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
                            studioChannelTab === 'canva'
                              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Palette className="w-3.5 h-3.5 text-pink-500" />
                          <span>Canva Design Pack</span>
                        </button>

                        <button
                          onClick={() => setStudioChannelTab('zapier')}
                          className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
                            studioChannelTab === 'zapier'
                              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 text-orange-500" />
                          <span>Zapier Pipeline</span>
                        </button>

                        <button
                          onClick={() => setStudioChannelTab('social')}
                          className={`py-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
                            studioChannelTab === 'social'
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          <span>Meta & Social</span>
                        </button>
                      </div>

                      {/* Tab Content 1: Mailchimp Email */}
                      {studioChannelTab === 'email' && (
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <div>
                              <strong>Preheader Preview:</strong> {generatedCampaign.previewText}
                            </div>
                            <button
                              onClick={() => handleCopy(generatedCampaign.emailBody || '', 'email')}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1 transition cursor-pointer"
                            >
                              {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === 'email' ? 'Copied' : 'Copy Copy'}</span>
                            </button>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                            {generatedCampaign.emailBody}
                          </div>
                        </div>
                      )}

                      {/* Tab Content 2: Canva Design Pack */}
                      {studioChannelTab === 'canva' && (
                        <div className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                                {generatedCampaign.canvaDesignName}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Pre-loaded with Ptah Realty Brand Kit (Font: Cormorant Garamond & Plus Jakarta Sans)
                              </p>
                            </div>

                            <a
                              href={generatedCampaign.canvaTemplateUrl || 'https://www.canva.com'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Palette className="w-3.5 h-3.5" />
                              <span>Launch in Canva Editor</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Suggested Palette Swatches */}
                          {generatedCampaign.aiCanvaPalette && (
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                AI Suggested Architectural Palette
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {generatedCampaign.aiCanvaPalette.map((col, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handleCopy(col.hex, `hex-${idx}`)}
                                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs cursor-pointer hover:border-pink-400 transition"
                                  >
                                    <span
                                      className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-600 shrink-0"
                                      style={{ backgroundColor: col.hex }}
                                    ></span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      {col.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {col.hex}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                            <p className="font-bold text-slate-700 dark:text-slate-200">
                              Direct Canva Integration Features:
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                              • Auto-exports 1080x1350 Instagram portrait flyers & high-res A4 printable PDFs
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                              • Embeds verified Property24 Ref code and QR code direct to the listing page
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab Content 3: Zapier Pipeline */}
                      {studioChannelTab === 'zapier' && (
                        <div className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                                Zapier Omnichannel Webhook Automation
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Catch Hook: <code className="text-orange-500 font-mono">https://hooks.zapier.com/hooks/catch/9182390/ptah_campaigns/</code>
                              </p>
                            </div>

                            <button
                              onClick={() => handleCopy(JSON.stringify(generatedCampaign, null, 2), 'zapier-payload')}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center space-x-1 transition cursor-pointer"
                            >
                              {copiedKey === 'zapier-payload' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === 'zapier-payload' ? 'Copied JSON' : 'Copy Payload'}</span>
                            </button>
                          </div>

                          {/* Workflow Steps Visualizer */}
                          {generatedCampaign.aiZapierWorkflow && (
                            <div className="space-y-2">
                              {generatedCampaign.aiZapierWorkflow.map((step, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-xs"
                                >
                                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                    {idx + 1}
                                  </div>
                                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                                    {step}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab Content 4: Meta & Social */}
                      {studioChannelTab === 'social' && (
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Instagram, Facebook & LinkedIn Caption</span>
                            <button
                              onClick={() => handleCopy(generatedCampaign.socialCaption || '', 'social')}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1 transition cursor-pointer"
                            >
                              {copiedKey === 'social' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === 'social' ? 'Copied' : 'Copy Caption'}</span>
                            </button>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                            {generatedCampaign.socialCaption}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dispatch and Action Controls */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            Ready to Dispatch Campaign Across Connected Channels
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Will push assets to Canva, queue Mailchimp broadcast, and fire Zapier Catch Hook.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleDispatchCampaign('scheduled')}
                          disabled={isDispatching}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
                        >
                          Schedule for Sunday
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDispatchCampaign('sent')}
                          disabled={isDispatching}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isDispatching ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Dispatching...</span>
                            </>
                          ) : dispatchSuccess ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-950" />
                              <span>Dispatched!</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Dispatch Live Campaign</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty state when no campaign generated yet */
                  <div className="bg-white dark:bg-slate-850 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[420px]">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 mb-4">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      AI Campaign Studio
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
                      Select your campaign objective and property on the left, then click <strong>"Generate Campaign with Gemini AI"</strong> to create ready-to-dispatch marketing assets for Canva, Mailchimp, and Zapier.
                    </p>

                    <div className="mt-6 flex items-center space-x-2 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Canva Brand Kit Sync</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Mailchimp Segmenting</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Zapier Webhooks</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CAMPAIGNS REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-5">
              {/* Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Campaigns
                  </span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {campaigns.length}
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Omnichannel active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Audience Reach
                  </span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {campaigns.reduce((acc, c) => acc + (c.metrics?.recipientsCount || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    HNW Verified Contacts
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Avg. Open Rate
                  </span>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    55.5%
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    +24% vs. Industry Benchmark
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Inquiries Generated
                  </span>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {campaigns.reduce((acc, c) => acc + (c.metrics?.leadsGenerated || 0), 0)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Auto-ingested into CRM
                  </span>
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {(['all', 'sent', 'scheduled', 'draft'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setRegistryFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                        registryFilter === filter
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('studio')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New AI Campaign</span>
                </button>
              </div>

              {/* Campaign Cards List */}
              <div className="space-y-3">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700/60 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start space-x-3.5">
                        {campaign.propertyImage ? (
                          <img
                            src={campaign.propertyImage}
                            alt={campaign.propertyTitle}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 shrink-0">
                            <Megaphone className="w-7 h-7" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                campaign.status === 'sent'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : campaign.status === 'scheduled'
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {campaign.status}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              {campaign.sentAt
                                ? `Sent ${formatRelativeTime(campaign.sentAt)}`
                                : campaign.scheduledFor
                                ? `Scheduled for ${campaign.scheduledFor}`
                                : 'Draft'}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                            {campaign.title}
                          </h4>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xl">
                            {campaign.subjectLine || campaign.previewText}
                          </p>
                        </div>
                      </div>

                      {/* Connected Apps Badges */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {campaign.connectedApps.map((app) => (
                          <span
                            key={app}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize flex items-center space-x-1"
                          >
                            {app === 'canva' && <Palette className="w-3 h-3 text-pink-500" />}
                            {app === 'mailchimp' && <Send className="w-3 h-3 text-amber-500" />}
                            {app === 'zapier' && <Zap className="w-3 h-3 text-orange-500" />}
                            {app === 'meta_ads' && <Globe className="w-3 h-3 text-blue-500" />}
                            <span>{app.replace('_', ' ')}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metrics row */}
                    {campaign.metrics && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex items-center space-x-6">
                          <div>
                            <span className="text-slate-400">Recipients:</span>{' '}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {campaign.metrics.recipientsCount} HNW Buyers
                            </strong>
                          </div>

                          {campaign.metrics.openRate > 0 && (
                            <div>
                              <span className="text-slate-400">Open Rate:</span>{' '}
                              <strong className="text-emerald-600 dark:text-emerald-400">
                                {campaign.metrics.openRate}%
                              </strong>
                            </div>
                          )}

                          {campaign.metrics.clickRate > 0 && (
                            <div>
                              <span className="text-slate-400">CTR:</span>{' '}
                              <strong className="text-blue-600 dark:text-blue-400">
                                {campaign.metrics.clickRate}%
                              </strong>
                            </div>
                          )}

                          {campaign.metrics.leadsGenerated > 0 && (
                            <div>
                              <span className="text-slate-400">Inquiries:</span>{' '}
                              <strong className="text-amber-600 dark:text-amber-400">
                                {campaign.metrics.leadsGenerated} Leads
                              </strong>
                            </div>
                          )}
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center space-x-2">
                          {campaign.canvaTemplateUrl && (
                            <a
                              href={campaign.canvaTemplateUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1"
                            >
                              <Palette className="w-3 h-3 text-pink-500" />
                              <span>Open in Canva</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}

                          <button
                            onClick={() => {
                              handleCopy(campaign.emailBody || campaign.title, `camp-${campaign.id}`);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedKey === `camp-${campaign.id}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedKey === `camp-${campaign.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MARKETING CONNECTORS OVERVIEW */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Third-Party Marketing Connectors Architecture
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      These integrations reflect under <strong>Connectors & Integrations</strong> in agency settings.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenConnectorsMarketingTab();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Configure API Keys in Settings</span>
                </button>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Canva Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 flex items-center justify-center text-pink-500">
                        <Palette className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            Canva Real Estate Design Hub
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Connected
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Brand Kit: ptah_luxe_brand_kit_2026</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Automated show house flyer generation, luxury architectural brochures, and 1-click Canva Web Editor linking with Ptah Realty brand assets.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Synced:</span>
                      <strong className="text-slate-700 dark:text-slate-200">15 mins ago</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sync Count:</span>
                      <strong className="text-slate-700 dark:text-slate-200">342 designs created</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Export DPI:</span>
                      <strong className="text-slate-700 dark:text-slate-200">Print 300 DPI / 4K Digital</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href="https://www.canva.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1"
                    >
                      <span>Open Canva</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Mailchimp Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500">
                        <Send className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            Mailchimp VIP Audience API
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Connected
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">List: ptah_vip_investors_cpt</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Sync CRM buyers into pre-approved VIP segments, dispatch Sunday show house invitations, and collect real-time open and click metrics.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audience Size:</span>
                      <strong className="text-slate-700 dark:text-slate-200">1,480 Subscribers</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sender Verified:</span>
                      <strong className="text-slate-700 dark:text-slate-200">privjapan@gmail.com</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Telemetry:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">Real-time open & click pings</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href="https://mailchimp.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1"
                    >
                      <span>Open Mailchimp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Zapier Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-500">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            Zapier Omnichannel Automation
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Connected
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">8 Active Multi-App Zaps</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Trigger multi-app workflow pipelines across Meta Ads, Canva, Mailchimp, WhatsApp, and Google Drive simultaneously upon campaign publish.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Execution Velocity:</span>
                      <strong className="text-slate-700 dark:text-slate-200">18ms average latency</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Runs:</span>
                      <strong className="text-slate-700 dark:text-slate-200">1,240 Catch Events</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Multi-App Sync:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">WhatsApp, Drive, Social</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href="https://zapier.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1"
                    >
                      <span>Open Zapier</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Meta Ads Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-500">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            Meta Ads & Instagram Lead Sync
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Connected
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Account: act_499201948201</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Direct integration with Facebook Marketing API and Instagram Sponsored Carousels for precision demographic targeting across Cape Town and Sandton.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pixel Status:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">Active (pix_882910482)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lead Form Webhook:</span>
                      <strong className="text-slate-700 dark:text-slate-200">Real-time Graph API</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Synced Leads:</span>
                      <strong className="text-slate-700 dark:text-slate-200">415 Leads Ingested</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href="https://adsmanager.facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1"
                    >
                      <span>Open Meta Ads Manager</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
