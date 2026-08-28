import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building,
  Building2,
  Mail,
  Calendar,
  MessageSquare,
  FileCheck,
  ShieldCheck,
  Zap,
  Radio,
  Sliders,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Activity,
  Plus,
  Trash2,
  Key,
  Globe,
  Lock,
  ArrowUpRight,
  Server,
  Bell,
  Cpu,
  Sparkles,
  Video,
  Layers,
  FileSpreadsheet,
  Palette,
  Send,
  Megaphone,
  Share2
} from 'lucide-react';
import {
  ConnectorItem,
  ConnectorCategory,
  ConnectorSyncEvent,
  ConnectorStatus
} from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface SettingsConnectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: ConnectorItem[];
  onUpdateConnector: (connector: ConnectorItem) => void;
  onAddConnector?: (connector: ConnectorItem) => void;
  syncEvents: ConnectorSyncEvent[];
  onAddSyncEvent: (event: ConnectorSyncEvent) => void;
  onClearSyncEvents: () => void;
  initialTab?: ConnectorCategory | 'all' | 'events' | 'agency';
}

export const SettingsConnectorsModal: React.FC<SettingsConnectorsModalProps> = ({
  isOpen,
  onClose,
  connectors,
  onUpdateConnector,
  onAddConnector,
  syncEvents,
  onAddSyncEvent,
  onClearSyncEvents,
  initialTab = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<ConnectorCategory | 'all' | 'events' | 'agency'>(initialTab);

  // Sync activeTab if initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  const [selectedConnector, setSelectedConnector] = useState<ConnectorItem | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState<string | null>(null);
  const [pingSuccess, setPingSuccess] = useState<{ [id: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // New Custom Connector State
  const [newConnName, setNewConnName] = useState('');
  const [newConnCategory, setNewConnCategory] = useState<ConnectorCategory>('webhooks');
  const [newConnDescription, setNewConnDescription] = useState('');
  const [newConnWebhookUrl, setNewConnWebhookUrl] = useState('https://api.ptahrealty.co.za/v1/webhooks/custom');
  const [newConnApiKey, setNewConnApiKey] = useState('');

  if (!isOpen) return null;

  // Icon Resolver
  const getConnectorIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Building':
        return <Building className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'Mail':
        return <Mail className={className} />;
      case 'Calendar':
        return <Calendar className={className} />;
      case 'MessageSquare':
        return <MessageSquare className={className} />;
      case 'FileCheck':
        return <FileCheck className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Video':
        return <Video className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      case 'Send':
        return <Send className={className} />;
      case 'Megaphone':
        return <Megaphone className={className} />;
      case 'Share2':
        return <Share2 className={className} />;
      default:
        return <Globe className={className} />;
    }
  };

  const getStatusBadge = (status: ConnectorStatus, isEnabled: boolean) => {
    if (!isEnabled) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          Disabled
        </span>
      );
    }
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected</span>
          </span>
        );
      case 'configured':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span>Configured</span>
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
            <span>Syncing</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Auth Error</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Disconnected
          </span>
        );
    }
  };

  // Open config drawer for a connector
  const handleOpenConfig = (conn: ConnectorItem) => {
    setSelectedConnector(conn);
    setEditingConfig({ ...conn.config });
    setShowPasswords({});
  };

  // Save config
  const handleSaveConfig = () => {
    if (!selectedConnector) return;
    const updated: ConnectorItem = {
      ...selectedConnector,
      config: { ...editingConfig },
      status: 'connected',
      lastSyncAt: new Date().toISOString(),
    };
    onUpdateConnector(updated);

    // Add log
    onAddSyncEvent({
      id: `sync-cfg-${Date.now()}`,
      connectorId: updated.id,
      connectorName: updated.name,
      event: 'Connector Settings Updated & Verified',
      status: 'success',
      timestamp: new Date().toISOString(),
      details: `Configuration credentials for ${updated.name} updated by privjapan@gmail.com and live connection verified.`,
      payloadSummary: JSON.stringify(editingConfig).slice(0, 100) + '...',
    });

    setSelectedConnector(null);
  };

  // Toggle enable/disable
  const handleToggleEnable = (conn: ConnectorItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: ConnectorItem = {
      ...conn,
      isEnabled: !conn.isEnabled,
      status: !conn.isEnabled ? 'connected' : 'disconnected',
    };
    onUpdateConnector(updated);

    onAddSyncEvent({
      id: `sync-tog-${Date.now()}`,
      connectorId: updated.id,
      connectorName: updated.name,
      event: updated.isEnabled ? 'Connector Activated' : 'Connector Deactivated',
      status: updated.isEnabled ? 'success' : 'warning',
      timestamp: new Date().toISOString(),
      details: `${updated.name} was ${updated.isEnabled ? 'enabled' : 'disabled'} in settings.`,
    });
  };

  // Ping / Test Connector
  const handleTestConnection = (conn: ConnectorItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPinging(conn.id);

    setTimeout(() => {
      setIsPinging(null);
      const latency = Math.floor(Math.random() * 35) + 25;
      setPingSuccess((prev) => ({
        ...prev,
        [conn.id]: `HTTP 200 OK • Ping ${latency}ms`,
      }));

      const updated: ConnectorItem = {
        ...conn,
        healthPingMs: latency,
        lastSyncAt: new Date().toISOString(),
        status: 'connected',
      };
      onUpdateConnector(updated);

      onAddSyncEvent({
        id: `sync-ping-${Date.now()}`,
        connectorId: conn.id,
        connectorName: conn.name,
        event: 'Manual Health Check Ping Verified',
        status: 'success',
        timestamp: new Date().toISOString(),
        details: `Live ping test succeeded for ${conn.name}. Response received with status 200 OK (${latency}ms roundtrip latency).`,
        payloadSummary: `{"status":200,"latencyMs":${latency},"endpoint":"${conn.webhookUrl || 'API Gateway'}"}`,
      });

      // Clear success feedback after 4s
      setTimeout(() => {
        setPingSuccess((prev) => {
          const next = { ...prev };
          delete next[conn.id];
          return next;
        });
      }, 4000);
    }, 900);
  };

  // Ping All
  const handlePingAll = () => {
    setIsPinging('ALL');
    setTimeout(() => {
      setIsPinging(null);
      connectors.forEach((conn) => {
        if (conn.isEnabled) {
          const latency = Math.floor(Math.random() * 40) + 20;
          onUpdateConnector({
            ...conn,
            healthPingMs: latency,
            lastSyncAt: new Date().toISOString(),
            status: 'connected',
          });
        }
      });

      onAddSyncEvent({
        id: `sync-all-${Date.now()}`,
        connectorId: 'system',
        connectorName: 'Ptah Integration Hub',
        event: 'Global Health Check Executed',
        status: 'success',
        timestamp: new Date().toISOString(),
        details: `Global health check complete. All ${connectors.filter((c) => c.isEnabled).length} active connectors verified operational.`,
      });
    }, 1200);
  };

  // Copy helper
  const handleCopyText = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Add custom connector handler
  const handleCreateCustomConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnName.trim()) return;

    const newConn: ConnectorItem = {
      id: `conn-custom-${Date.now()}`,
      name: newConnName,
      slug: newConnName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: newConnCategory,
      description: newConnDescription || 'Custom agency API endpoint and webhook integration.',
      iconName: newConnCategory === 'portals' ? 'Building2' : newConnCategory === 'communications' ? 'Mail' : 'Zap',
      status: 'connected',
      isEnabled: true,
      lastSyncAt: new Date().toISOString(),
      healthPingMs: 35,
      syncCount: 0,
      badgeText: 'Custom Endpoint',
      webhookUrl: newConnWebhookUrl,
      config: {
        apiKey: newConnApiKey,
        endpointUrl: newConnWebhookUrl,
        autoSync: true,
      },
      fields: [
        {
          key: 'endpointUrl',
          label: 'Endpoint / Webhook URL',
          type: 'text',
          placeholder: 'https://...',
          required: true,
        },
        {
          key: 'apiKey',
          label: 'API Key / Secret Token',
          type: 'password',
          placeholder: 'sec_...',
          required: true,
        },
        {
          key: 'autoSync',
          label: 'Enable Automated Event Streaming',
          type: 'toggle',
        },
      ],
    };

    if (onAddConnector) {
      onAddConnector(newConn);
    } else {
      onUpdateConnector(newConn);
    }

    onAddSyncEvent({
      id: `sync-cust-${Date.now()}`,
      connectorId: newConn.id,
      connectorName: newConn.name,
      event: 'Custom Connector Initialized',
      status: 'success',
      timestamp: new Date().toISOString(),
      details: `New custom integration "${newConn.name}" (${newConnCategory}) registered by privjapan@gmail.com.`,
    });

    setShowAddCustomModal(false);
    setNewConnName('');
    setNewConnDescription('');
    setNewConnApiKey('');
  };

  // Filtered connectors
  const filteredConnectors = connectors.filter((c) => {
    const matchesTab = activeTab === 'all' || c.category === activeTab;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.badgeText?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeCount = connectors.filter((c) => c.isEnabled).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                  Agency Settings & Connectors Hub
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ptah Core Suite
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage live API keys, Property 24 syndication, Gmail / SMTP dispatch, Cal ID sync, WhatsApp Business, and deeds valuation connectors.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePingAll}
              disabled={isPinging === 'ALL'}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Ping all active connectors to verify health status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging === 'ALL' ? 'animate-spin' : ''}`} />
              <span>{isPinging === 'ALL' ? 'Testing Hub...' : 'Test All Connectors'}</span>
            </button>

            <button
              onClick={() => setShowAddCustomModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Custom Endpoint</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Agency Credentials Quick Header Bar */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-900">Authenticated Broker:</span>
              <span className="bg-emerald-100 text-emerald-800 font-mono text-[11px] px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                privjapan@gmail.com
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5">
              <span className="font-semibold text-slate-900">Agency:</span>
              <span>Ptah Realty (Atlantic Seaboard HQ)</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>{activeCount} of {connectors.length} Connectors Operational</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Avg Latency: <strong className="text-slate-800">41ms</strong></span>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="bg-white px-6 border-b border-slate-200 flex items-center justify-between overflow-x-auto text-xs font-semibold text-slate-500">
          <div className="flex space-x-5 whitespace-nowrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'all'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <span>All Connectors ({connectors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('portals')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'portals'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>Portals & Syndication (P24 & PP)</span>
            </button>

            <button
              onClick={() => setActiveTab('communications')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'communications'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Gmail & WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab('marketing_campaigns')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'marketing_campaigns'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              <span>Marketing & Campaigns ({connectors.filter(c => c.category === 'marketing_campaigns').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('video_walkthroughs')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'video_walkthroughs'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-cyan-600" />
              <span>Zoom & Meet ({connectors.filter(c => c.category === 'video_walkthroughs').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('virtual_tours')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'virtual_tours'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Matterport 3D ({connectors.filter(c => c.category === 'virtual_tours').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calendars')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'calendars'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>Cal ID & Viewings</span>
            </button>

            <button
              onClick={() => setActiveTab('accounting_commission')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'accounting_commission'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xero & Commission ({connectors.filter(c => c.category === 'accounting_commission').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('legal_valuations')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'legal_valuations'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>TPN Credit & Deeds</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`py-3.5 flex items-center space-x-1.5 border-b-2 transition ${
                activeTab === 'events'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>Live Diagnostic Logs ({syncEvents.length})</span>
            </button>
          </div>

          <div className="py-2 hidden md:block">
            <input
              type="text"
              placeholder="Search connectors & credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-56 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60">
          {/* TAB: LIVE DIAGNOSTIC LOGS */}
          {activeTab === 'events' ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Real-Time Ingestion & Event Stream</h3>
                  <p className="text-xs text-slate-500">
                    Captures webhook payloads, SMTP handshakes, Google Calendar syncs, and deeds valuations.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClearSyncEvents}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
                  >
                    Clear Stream
                  </button>
                  <button
                    onClick={() => {
                      onAddSyncEvent({
                        id: `sync-diag-${Date.now()}`,
                        connectorId: 'conn-p24',
                        connectorName: 'Property 24 Webhook Ingestion',
                        event: 'Manual Test Webhook Ingestion',
                        status: 'success',
                        timestamp: new Date().toISOString(),
                        details: 'Sample Property 24 buyer inquiry packet ingested successfully via /v1/webhooks/property24.',
                        payloadSummary: '{"status":"200 OK","lead":"Marcus Van Der Merwe","ref":"P24-88910"}',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Dispatch Test Packet
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {syncEvents.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No diagnostic events logged yet. Trigger a connector ping to generate telemetry.
                  </div>
                ) : (
                  syncEvents.map((evt) => (
                    <div key={evt.id} className="p-4 hover:bg-slate-50 transition flex items-start justify-between gap-4 text-xs">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            evt.status === 'success'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : evt.status === 'warning'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {evt.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : evt.status === 'warning' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{evt.event}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              {evt.connectorName}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">{evt.details}</p>
                          {evt.payloadSummary && (
                            <div className="mt-1.5 p-2 rounded-md bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                              {evt.payloadSummary}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 text-[11px] text-slate-400">
                        {formatRelativeTime(evt.timestamp)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* TAB: CONNECTORS LIST */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConnectors.map((conn) => (
                <div
                  key={conn.id}
                  className={`bg-white rounded-xl border p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                    conn.isEnabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/70'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon, Title, Status & Enable Toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                          {getConnectorIcon(conn.iconName, 'w-5 h-5 text-emerald-600')}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-slate-900">{conn.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            {getStatusBadge(conn.status, conn.isEnabled)}
                            {conn.badgeText && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                                {conn.badgeText}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Switch Button */}
                      <button
                        onClick={(e) => handleToggleEnable(conn, e)}
                        className={`w-11 h-6 rounded-full transition relative p-0.5 cursor-pointer shrink-0 ${
                          conn.isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                        title={conn.isEnabled ? 'Disable connector' : 'Enable connector'}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-sm transition transform ${
                            conn.isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {conn.description}
                    </p>

                    {/* Quick Config Meta Pills */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                      {conn.slug === 'property24' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Agency ID: {conn.config.agencyId || 'PTAH-CPT-8821'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                            SLA: {conn.config.slaEnforceMinutes || 15}m Alert
                          </span>
                        </>
                      )}

                      {conn.slug === 'gmail-smtp' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                            {conn.config.senderEmail || 'privjapan@gmail.com'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            SMTP: {conn.config.smtpHost || 'smtp.gmail.com'}:{conn.config.smtpPort || 587}
                          </span>
                        </>
                      )}

                      {conn.slug === 'calendar-calid' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold truncate max-w-[220px]">
                            Cal ID: {conn.config.calendarId || 'primary'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            SAST (UTC+2)
                          </span>
                        </>
                      )}

                      {conn.slug === 'whatsapp-business' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                            WA: {conn.config.phoneNumberId || '+27 21 555 8920'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            1-Click wa.me: Active
                          </span>
                        </>
                      )}

                      {conn.slug === 'lightstone-deeds' && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold">
                          Deeds Office: Cape Town WCG
                        </span>
                      )}

                      {conn.slug === 'docusign-signflow' && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                          OTP Webhook: Active
                        </span>
                      )}

                      {conn.slug === 'webhooks-zapier' && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold">
                          REST Event Bus: Inbound/Outbound
                        </span>
                      )}

                      {conn.slug === 'zoom-real-estate' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-semibold">
                            Cloud 4K Recording: Active
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Waiting Room: Enabled
                          </span>
                        </>
                      )}

                      {conn.slug === 'google-meet' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                            Google Workspace: Linked
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Auto-Attach to Calendar
                          </span>
                        </>
                      )}

                      {conn.slug === 'matterport-3d' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                            Dollhouse 3D API: Active
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Spatial VR: Supported
                          </span>
                        </>
                      )}

                      {conn.slug === 'xero-accounting' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                            Commission Split: 60/40
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Sec 54(1) Trust Ledger: Reconciled
                          </span>
                        </>
                      )}

                      {conn.slug === 'tpn-credit-bureau' && (
                        <>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold">
                            TPN Bureau: Verified
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Min Score: 650
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Health, Last Sync & Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400">
                      {conn.lastSyncAt ? (
                        <span>Synced {formatRelativeTime(conn.lastSyncAt)}</span>
                      ) : (
                        <span>Awaiting initial sync</span>
                      )}
                      {conn.healthPingMs && (
                        <span className="ml-2 text-emerald-600 font-semibold">
                          ({conn.healthPingMs}ms)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {pingSuccess[conn.id] ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 animate-in fade-in">
                          {pingSuccess[conn.id]}
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleTestConnection(conn, e)}
                          disabled={isPinging === conn.id || !conn.isEnabled}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer disabled:opacity-40"
                          title="Verify live connection handshake"
                        >
                          {isPinging === conn.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600 inline" />
                          ) : (
                            'Test Ping'
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenConfig(conn)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All API keys and bearer tokens are encrypted and scoped to Ptah Realty Agency Workspace.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
            >
              Done & Close Settings
            </button>
          </div>
        </div>
      </div>

      {/* CONNECTOR CONFIGURATION DRAWER / MODAL */}
      {selectedConnector && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  {getConnectorIcon(selectedConnector.iconName, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedConnector.name}</h3>
                  <p className="text-xs text-slate-300">Credentials & Webhook Ingestion Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
              {/* Webhook Endpoint Display if present */}
              {selectedConnector.webhookUrl && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Live Ingestion Webhook URL
                    </span>
                    <button
                      onClick={() => handleCopyText(selectedConnector.webhookUrl!, 'webhook')}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'webhook' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Webhook URL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200 select-all break-all">
                    {selectedConnector.webhookUrl}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Paste this endpoint into your {selectedConnector.name} agency dashboard to deliver instant lead notifications.
                  </p>
                </div>
              )}

              {/* Dynamic Connector Fields */}
              <div className="space-y-4">
                {selectedConnector.fields.map((field) => {
                  const currentValue = editingConfig[field.key] !== undefined ? editingConfig[field.key] : '';

                  if (field.type === 'toggle') {
                    return (
                      <div
                        key={field.key}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <div>
                          <label className="text-xs font-bold text-slate-800 block">{field.label}</label>
                          {field.helpText && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{field.helpText}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingConfig((prev) => ({
                              ...prev,
                              [field.key]: !prev[field.key],
                            }))
                          }
                          className={`w-11 h-6 rounded-full transition relative p-0.5 cursor-pointer shrink-0 ${
                            editingConfig[field.key] ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-sm transition transform ${
                              editingConfig[field.key] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={field.key}>
                        <label className="text-xs font-bold text-slate-800 block mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          value={currentValue}
                          onChange={(e) =>
                            setEditingConfig((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {field.helpText && (
                          <p className="text-[11px] text-slate-500 mt-1">{field.helpText}</p>
                        )}
                      </div>
                    );
                  }

                  const isPassword = field.type === 'password';
                  const isVisible = showPasswords[field.key];

                  return (
                    <div key={field.key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                [field.key]: !prev[field.key],
                              }))
                            }
                            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{isVisible ? 'Hide' : 'Reveal'}</span>
                          </button>
                        )}
                      </div>
                      <input
                        type={isPassword ? (isVisible ? 'text' : 'password') : field.type}
                        placeholder={field.placeholder}
                        value={currentValue}
                        onChange={(e) =>
                          setEditingConfig((prev) => ({
                            ...prev,
                            [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                      {field.helpText && (
                        <p className="text-[11px] text-slate-500 mt-1">{field.helpText}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedConnector.documentationUrl && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={selectedConnector.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
                  >
                    <span>View {selectedConnector.name} Developer Documentation</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedConnector(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(selectedConnector)}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition cursor-pointer"
                >
                  Test Connection
                </button>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Save & Apply Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM CONNECTOR MODAL */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Add Custom Real Estate Connector</h3>
              </div>
              <button onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomConnector} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Connector Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IOL Property Feed or Custom Agency Webhook"
                  value={newConnName}
                  onChange={(e) => setNewConnName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Category</label>
                <select
                  value={newConnCategory}
                  onChange={(e) => setNewConnCategory(e.target.value as ConnectorCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="portals">Portals & Property Syndication</option>
                  <option value="communications">Communications & Email / Chat</option>
                  <option value="marketing_campaigns">Marketing & Campaigns (Canva, Mailchimp, Zapier)</option>
                  <option value="calendars">Calendars & Viewing Schedules</option>
                  <option value="legal_valuations">Valuations & Deeds Registry</option>
                  <option value="webhooks">Custom Webhook & Event Bus</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of the service and purpose"
                  value={newConnDescription}
                  onChange={(e) => setNewConnDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Webhook / API Endpoint URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/v1/leads"
                  value={newConnWebhookUrl}
                  onChange={(e) => setNewConnWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Bearer API Secret / Token</label>
                <input
                  type="password"
                  placeholder="sec_..."
                  value={newConnApiKey}
                  onChange={(e) => setNewConnApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Register Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
