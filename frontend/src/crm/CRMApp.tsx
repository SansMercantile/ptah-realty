import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { PipelineBoard } from './components/PipelineBoard';
import { LeadDetailModal } from './components/LeadDetailModal';
import { AgentScheduleCalendar } from './components/AgentScheduleCalendar';
import { EmailAutomationsView } from './components/EmailAutomationsView';
import { ReportingAnalyticsView } from './components/ReportingAnalyticsView';
import { ScrumSprintView } from './components/ScrumSprintView';
import { DashboardView } from './components/DashboardView';
import { QuickListingsModal } from './components/QuickListingsModal';
import { InboundSimulatorModal } from './components/InboundSimulatorModal';
import { NewLeadModal } from './components/NewLeadModal';
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { CampaignsHubModal } from './components/CampaignsHubModal';
import {
  INITIAL_CONNECTORS,
  INITIAL_SPRINT,
  INITIAL_LISTINGS,
  INITIAL_SHOW_HOUSES,
  INITIAL_CAMPAIGNS,
} from './data/mockData';
import {
  Lead,
  LeadStatus,
  EmailNotificationLog,
  AutomationRule,
  TaskItem,
  ConnectorItem,
  ConnectorSyncEvent,
  ScrumSprint,
  PropertyListing,
  ShowHouseRecord,
  MarketingCampaign,
  ConnectorCategory,
} from './types';
import { formatCurrency, triggerDealWonConfetti } from './utils/formatters';
import { getCrmState, saveCrmState, authHeaders, getTeamMembers, TeamMember } from '../services/api';
import type { ListingDealRecord } from '../components/modals/MyListingsModal';
import { Bell, CheckCircle2, Flame, Radio, X, Calendar as CalendarIcon, Sliders, RefreshCw } from 'lucide-react';
import { useJurisdiction } from '../context/JurisdictionContext';

// Strips fake demo credentials (API keys, list IDs, webhook URLs --
// anything a real tenant would need to type in themselves) from
// INITIAL_CONNECTORS' `config`, while keeping boolean toggles at their
// sensible default. Keeps the connector *definitions* (which
// integrations are available, their field metadata) intact -- only the
// pre-filled fake values are cleared. See leads state's comment above
// for why this matters: real per-tenant backend state should never get
// seeded with fictional credentials.
function clearFakeConnectorConfig(connectors: ConnectorItem[]): ConnectorItem[] {
  return connectors.map((c) => ({
    ...c,
    config: Object.fromEntries(
      Object.entries(c.config || {}).map(([key, value]) => [key, typeof value === 'boolean' ? value : ''])
    ),
  }));
}

// A genuinely blank sprint (zeroed targets/progress, no blockers, no
// fabricated goal text) for a real tenant that hasn't set one up yet --
// NOT INITIAL_SPRINT, which is a fully fictional demo sprint with a
// specific fake goal, fake R85M target, and fake progress numbers.
const EMPTY_SPRINT: ScrumSprint = {
  id: 'sprint-1',
  name: 'Sprint 1',
  number: 1,
  goal: '',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
  status: 'planning',
  targetValueZar: 0,
  targetViewings: 0,
  targetDeals: 0,
  totalCommittedPoints: 0,
  completedPoints: 0,
  dailyBlockers: [],
};

export default function App({
  openConnectorsSignal,
  openCommandPaletteSignal,
  openNotificationsSignal,
  onOpenQuickListing,
  myListings,
  viewListingSignal,
  viewListingId,
  onViewListingInMain,
  onOpenSettings,
  appContext,
}: {
  openConnectorsSignal?: number;
  openCommandPaletteSignal?: number;
  openNotificationsSignal?: number;
  myListings?: ListingDealRecord[];
  viewListingSignal?: number;
  viewListingId?: string | null;
  onViewListingInMain?: (listingId: string) => void;
  onOpenQuickListing?: () => void;
  onOpenSettings?: () => void;
  appContext?: Record<string, unknown>;
}) {
  const { theme, setTheme } = useJurisdiction();
  // Load from local storage, or start empty -- NEVER fall back to
  // INITIAL_LEADS (fictional demo people) for a genuinely new/empty
  // real tenant. That fallback previously ran on every brand-new
  // browser session (no localStorage yet), showed fake leads
  // immediately, and then the debounced save effect below would
  // persist those fake leads into the tenant's REAL backend record
  // the moment anything else in the app touched leads state -- so a
  // first-time real user's actual CRM data got silently seeded with
  // fictional people. See conversation notes 2026-09-02.
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('ptah_crm_leads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Real registered team members on this tenant, for lead-assignment
  // pickers (PipelineBoard's reassign action, NewLeadModal,
  // AgentPerformanceCard, SlaResponseEfficiencyWidget) -- these
  // previously all pulled from INITIAL_AGENTS, four fictional people
  // (mockData.ts), which meant a real team could never actually assign
  // or reassign leads to themselves. See api/crm.py's list_team_members.
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  useEffect(() => {
    getTeamMembers()
      .then(setTeamMembers)
      .catch((err) => console.error('CRM: failed to load team members:', err));
  }, []);

  // Server-authored notification log -- see services/api.ts's CrmState
  // docstring. Populated from GET /crm/state and refreshed after any
  // save that reports emailsSent > 0 (the PUT response doesn't include
  // the entries themselves, just a count, since those are written
  // server-side by AutomationRule dispatch during that same request).
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>([]);

  // Read/unread state for the notification bell -- kept separately from
  // emailLogs itself rather than mutating those objects' isRead field,
  // since emailLogs is server-authored and isn't part of the debounced
  // save's payload (see that effect below): anything written onto the
  // log entries themselves would be silently lost the next time this
  // loads fresh from GET /crm/state. This survives refreshes the same
  // way leads/rules/connectors do -- its own localStorage key.
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('ptah_crm_read_notifications');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('ptah_crm_read_notifications', JSON.stringify([...readNotificationIds]));
  }, [readNotificationIds]);

  const handleMarkNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  const handleMarkAllNotificationsRead = () => {
    setReadNotificationIds(new Set(emailLogs.map((n) => n.id)));
  };

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem('ptah_crm_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Connectors State & Ingestion Events
  //
  // The connector *slots* themselves (Mailchimp/Zapier/Canva available
  // to configure) are legitimate default scaffolding -- but
  // INITIAL_CONNECTORS' `config` values are fake demo credentials
  // (a fabricated Mailchimp API key, audience list id, etc.), which a
  // real tenant should never see pre-filled as if they were real and
  // already connected. Strips config values (keeping boolean toggles
  // at their sensible default, clearing strings) while keeping the
  // connector definitions/fields metadata intact.
  const [connectors, setConnectors] = useState<ConnectorItem[]>(() => {
    const saved = localStorage.getItem('ptah_crm_connectors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return clearFakeConnectorConfig(INITIAL_CONNECTORS);
      }
    }
    return clearFakeConnectorConfig(INITIAL_CONNECTORS);
  });

  useEffect(() => {
    const handleConnectorChange = (event: Event) => {
      const changed = (event as CustomEvent<ConnectorItem[]>).detail;
      if (Array.isArray(changed)) {
        setConnectors(changed.filter((connector) => !(connector as ConnectorItem & { isStaticApp?: boolean }).isStaticApp));
      }
    };
    window.addEventListener('ptah-connectors-changed', handleConnectorChange);
    return () => window.removeEventListener('ptah-connectors-changed', handleConnectorChange);
  }, []);

  const isDarkMode = theme === 'onyx';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'emerald' : 'onyx');

  const handleAiTask = (task: { type: string; target?: string }) => {
    if (task.type === 'navigate' && ['pipeline', 'calendar', 'automations', 'reporting', 'scrum'].includes(task.target || '')) {
      setCurrentView(task.target as typeof currentView);
    } else if (task.type === 'open_settings') onOpenSettings?.();
    else if (task.type === 'open_new_lead') setIsNewLeadOpen(true);
    else if (task.type === 'open_notifications') setIsNotificationsOpen(true);
    else if (task.type === 'open_search') setIsCommandPaletteOpen(true);
    else if (task.type === 'open_listings') setIsQuickListingsOpen(true);
    else if (task.type === 'open_campaigns') setIsCampaignsModalOpen(true);
  };

  // Real sync events only -- see leads state's comment above for why
  // fake demo data must never be a fallback here.
  const [connectorSyncEvents, setConnectorSyncEvents] = useState<ConnectorSyncEvent[]>(() => {
    const saved = localStorage.getItem('ptah_crm_connector_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('ptah_crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('ptah_crm_rules', JSON.stringify(automationRules));
  }, [automationRules]);

  useEffect(() => {
    localStorage.setItem('ptah_crm_connectors', JSON.stringify(connectors));
  }, [connectors]);

  useEffect(() => {
    localStorage.setItem('ptah_crm_connector_events', JSON.stringify(connectorSyncEvents));
  }, [connectorSyncEvents]);

  // Scrum Sprint State
  const [sprint, setSprint] = useState<ScrumSprint>(() => {
    const saved = localStorage.getItem('ptah_crm_sprint');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return EMPTY_SPRINT;
      }
    }
    return EMPTY_SPRINT;
  });

  useEffect(() => {
    localStorage.setItem('ptah_crm_sprint', JSON.stringify(sprint));
  }, [sprint]);

  // Property Listings State -- real listings only, see leads state's
  // comment above.
  const [listings, setListings] = useState<PropertyListing[]>(() => {
    const saved = localStorage.getItem('ptah_crm_listings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ptah_crm_listings', JSON.stringify(listings));
  }, [listings]);

  // Show Houses State -- real show houses only, see leads state's
  // comment above.
  const [showHouses, setShowHouses] = useState<ShowHouseRecord[]>(() => {
    const saved = localStorage.getItem('ptah_crm_show_houses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ptah_crm_show_houses', JSON.stringify(showHouses));
  }, [showHouses]);

  // Campaigns State -- real campaigns only, see leads state's comment
  // above.
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const saved = localStorage.getItem('ptah_crm_campaigns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ptah_crm_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // ---------------------------------------------------------------------
  // Backend persistence -- loads the tenant's saved CRM state on mount
  // (falling back to the localStorage/mock data above if the backend has
  // nothing yet or is unreachable), then debounce-saves the whole state
  // back to it on every change. Ptah's backend is the source of truth;
  // localStorage remains a same-browser cache/offline fallback only.
  // ---------------------------------------------------------------------
  const [crmSyncStatus, setCrmSyncStatus] = useState<'loading' | 'synced' | 'saving' | 'offline'>('loading');
  const isInitialCrmLoadRef = useRef(true);
  const crmSaveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The sync pill is intentionally NOT a permanent fixture -- it only
  // flashes on screen around an actual save-after-changes event (both
  // when the debounced save kicks off and again once its outcome is
  // known, which also refreshes the auto-hide window so it doesn't
  // vanish mid-save), then auto-hides a few seconds later. The initial
  // load on mount below never calls this, so it stays invisible until
  // the person actually changes something.
  const [showSyncBadge, setShowSyncBadge] = useState(false);
  const syncBadgeHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashSyncBadge = () => {
    setShowSyncBadge(true);
    if (syncBadgeHideTimeoutRef.current) clearTimeout(syncBadgeHideTimeoutRef.current);
    syncBadgeHideTimeoutRef.current = setTimeout(() => setShowSyncBadge(false), 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        const state = await getCrmState();
        if (state.initialized) {
          if (state.leads?.length) setLeads(state.leads);
          setAutomationRules(state.automationRules || []);
          if (state.connectors?.length) setConnectors(state.connectors);
          if (state.connectorSyncEvents?.length) setConnectorSyncEvents(state.connectorSyncEvents);
          if (state.sprint && Object.keys(state.sprint).length) setSprint(state.sprint);
          if (state.listings?.length) setListings(state.listings);
          if (state.showHouses?.length) setShowHouses(state.showHouses);
          if (state.campaigns?.length) setCampaigns(state.campaigns);
          if (state.emailLogs?.length) setEmailLogs(state.emailLogs);
        }
        setCrmSyncStatus('synced');
      } catch (err) {
        console.error('CRM: failed to load saved state from backend, continuing on local data:', err);
        setCrmSyncStatus('offline');
      }
    })();
  }, []);

  useEffect(() => {
    if (crmSyncStatus === 'loading') return; // wait for the initial load above to resolve
    if (isInitialCrmLoadRef.current) {
      // Skip the save this effect's own dependency change from the
      // initial load above would otherwise immediately trigger.
      isInitialCrmLoadRef.current = false;
      return;
    }
    if (crmSaveDebounceRef.current) clearTimeout(crmSaveDebounceRef.current);
    crmSaveDebounceRef.current = setTimeout(() => {
      setCrmSyncStatus('saving');
      flashSyncBadge();
      saveCrmState({ leads, automationRules, connectors, connectorSyncEvents, sprint, listings, showHouses, campaigns })
        .then((result) => {
          setCrmSyncStatus('synced');
          // New leads saved in this batch may have triggered real
          // AutomationRule email dispatch server-side -- the PUT
          // response only reports a count, not the entries themselves
          // (those are server-authored), so refresh from GET to pick
          // them up for the notification bell / Email Automations view.
          if (result.emailsSent > 0) {
            getCrmState()
              .then((state) => { if (state.emailLogs) setEmailLogs(state.emailLogs); })
              .catch((err) => console.error('CRM: failed to refresh email logs after save:', err));
          }
        })
        .catch((err) => {
          console.error('CRM: failed to save state to backend (kept in localStorage only):', err);
          setCrmSyncStatus('offline');
        })
        .finally(() => flashSyncBadge());
    }, 800);
    return () => {
      if (crmSaveDebounceRef.current) clearTimeout(crmSaveDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, automationRules, connectors, connectorSyncEvents, sprint, listings, showHouses, campaigns, crmSyncStatus]);

  // Views & Modal States
  const [currentView, setCurrentView] = useState<'dashboard' | 'pipeline' | 'calendar' | 'automations' | 'reporting' | 'scrum'>('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isQuickListingsOpen, setIsQuickListingsOpen] = useState(false);
  const [isCampaignsModalOpen, setIsCampaignsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<ConnectorCategory>('portals');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(true); // side panel, open by default per explicit request
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Google Calendar sync -- moved here from DashboardView.tsx, since the
  // button now lives in the Schedule Calendar tab's header instead of
  // the Dashboard.
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSyncSuccess, setCalendarSyncSuccess] = useState(false);
  const handleSyncGoogleCalendar = () => {
    setIsSyncingCalendar(true);
    setTimeout(() => {
      setIsSyncingCalendar(false);
      setCalendarSyncSuccess(true);
      setTimeout(() => setCalendarSyncSuccess(false), 3500);
    }, 1200);
  };
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Opens the Settings/Connectors modal when the outer app's header
  // "Connectors" dropdown item is clicked (see App.tsx's
  // handleOpenCRMConnectors / crmOpenConnectorsSignal). Connectors no
  // longer has its own top-level button in this app's Navbar -- it's
  // reached from there instead, so this signal is now the only trigger
  // besides EmailAutomationsView's contextual link and the command
  // palette. Guarded so signal 0 (the initial/default prop value) never
  // fires this on mount.
  const isInitialConnectorsSignalRef = useRef(true);
  useEffect(() => {
    if (isInitialConnectorsSignalRef.current) {
      isInitialConnectorsSignalRef.current = false;
      return;
    }
    if (openConnectorsSignal) onOpenSettings?.();
  }, [openConnectorsSignal, onOpenSettings]);

  // Same signal pattern as openConnectorsSignal above, for the main app
  // header's consolidated Quick Search button -- CRM no longer has its
  // own separate Quick Search entry point in the Navbar, so this is the
  // only remaining way the command palette opens by click (Cmd+K below
  // still works independently).
  const isInitialCommandPaletteSignalRef = useRef(true);
  useEffect(() => {
    if (isInitialCommandPaletteSignalRef.current) {
      isInitialCommandPaletteSignalRef.current = false;
      return;
    }
    if (openCommandPaletteSignal) setIsCommandPaletteOpen(true);
  }, [openCommandPaletteSignal]);

  // Same signal pattern again, for the main app header's bell icon --
  // the unified Notifications & Reminders drawer opens directly from
  // there while on the CRM tab; Navbar no longer has its own bell (see
  // Navbar.tsx's removal comment).
  const isInitialNotificationsSignalRef = useRef(true);
  useEffect(() => {
    if (isInitialNotificationsSignalRef.current) {
      isInitialNotificationsSignalRef.current = false;
      return;
    }
    if (openNotificationsSignal) setIsNotificationsOpen(true);
  }, [openNotificationsSignal]);

  // Same signal pattern, for "View Leads" on a listing in the main app's
  // My Listings (see chat) -- jumps into the Pipeline view filtered to
  // just the leads linked to that listing.
  const [activeListingFilter, setActiveListingFilter] = useState<string | null>(null);
  const isInitialViewListingSignalRef = useRef(true);
  useEffect(() => {
    if (isInitialViewListingSignalRef.current) {
      isInitialViewListingSignalRef.current = false;
      return;
    }
    if (viewListingSignal && viewListingId) {
      setActiveListingFilter(viewListingId);
      setCurrentView('pipeline');
    }
  }, [viewListingSignal]);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Toast Notification
  const [toastAlert, setToastAlert] = useState<{
    title: string;
    message: string;
    type: 'lead' | 'email' | 'task';
    lead?: Lead;
  } | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => setToastAlert(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  // Real server-authored notification log, newest first -- was
  // previously flattened from a per-lead `emailLogs` field that no real
  // backend write ever populated (the backend logs live on the
  // top-level crm_state document, not nested per-lead).
  const allNotifications = useMemo(() => {
    return [...emailLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((n) => ({ ...n, isRead: readNotificationIds.has(n.id) }));
  }, [emailLogs, readNotificationIds]);

  // Pending tasks count
  const pendingTasksCount = useMemo(() => {
    let count = 0;
    leads.forEach((l) => {
      count += l.tasks.filter((t) => t.status === 'pending').length;
    });
    return count;
  }, [leads]);

  // Handlers
  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    if (newStatus === 'deal_won') {
      triggerDealWonConfetti();
    }
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  };

  const handleBulkReassignAgent = (leadIds: string[], newAgent: any) => {
    setLeads((prev) =>
      prev.map((l) => (leadIds.includes(l.id) ? { ...l, assignedAgent: newAgent } : l))
    );
    setToastAlert({
      title: 'Bulk Reassignment Completed',
      message: `Reassigned ${leadIds.length} lead${leadIds.length > 1 ? 's' : ''} to ${newAgent.name}.`,
      type: 'lead',
    });
  };

  const handleBulkChangeStatus = (leadIds: string[], newStatus: LeadStatus) => {
    if (newStatus === 'deal_won') {
      triggerDealWonConfetti();
    }
    setLeads((prev) =>
      prev.map((l) => (leadIds.includes(l.id) ? { ...l, status: newStatus } : l))
    );
    setToastAlert({
      title: 'Bulk Status Updated',
      message: `Moved ${leadIds.length} lead${leadIds.length > 1 ? 's' : ''} to stage: ${newStatus.replace('_', ' ')}.`,
      type: 'task',
    });
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    setSelectedLead(updatedLead);
  };

  const handleAddNewLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    setToastAlert({
      title: `New Lead Ingested (${newLead.source})`,
      message: `${newLead.name} - ${newLead.propertyTitle}`,
      type: 'lead',
      lead: newLead,
    });
  };

  const handleSimulateInboundLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    setIsSimulatorOpen(false);

    // Audio chime feedback
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}

    // Record telemetry in connector sync events
    const now = new Date().toISOString();
    const isP24 = newLead.source === 'Property 24';
    const targetConnectorId = isP24 ? 'conn-p24' : 'conn-privateprop';
    const targetConnectorName = isP24 ? 'Property 24 Agent API' : 'Private Property API';

    const newSyncEvent: ConnectorSyncEvent = {
      id: `sync-auto-${Date.now()}`,
      connectorId: targetConnectorId,
      connectorName: targetConnectorName,
      event: `Inbound Webhook Payload Ingested (${newLead.source})`,
      status: 'success',
      timestamp: now,
      details: `Received inbound buyer inquiry for ${newLead.propertyTitle} (${newLead.budget || formatCurrency(newLead.propertyPrice)}). Assigned to ${newLead.assignedAgent.name}, 15-min SLA timer active.`,
      payloadSummary: JSON.stringify({
        source: newLead.source,
        buyer: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        property: newLead.propertyTitle,
        budget: newLead.budget,
        timestamp: now,
      }),
    };

    setConnectorSyncEvents((prev) => [newSyncEvent, ...prev]);

    // Increment connector sync count
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === targetConnectorId
          ? {
              ...c,
              lastSyncAt: now,
              syncCount: (c.syncCount || 0) + 1,
            }
          : c
      )
    );

    setToastAlert({
      title: `⚡ [${newLead.source} Inbound Ingested]`,
      message: `Alert sent to ${newLead.assignedAgent.email} & 15-min SLA task created for ${newLead.name}`,
      type: 'lead',
      lead: newLead,
    });
  };

  // Connector handlers
  const handleUpdateConnector = (updatedConnector: ConnectorItem) => {
    setConnectors((prev) =>
      prev.map((c) => (c.id === updatedConnector.id ? updatedConnector : c))
    );
  };

  const handleAddConnector = (newConnector: ConnectorItem) => {
    setConnectors((prev) => [newConnector, ...prev]);
  };

  const handleAddSyncEvent = (event: ConnectorSyncEvent) => {
    setConnectorSyncEvents((prev) => [event, ...prev]);
  };

  const handleClearSyncEvents = () => {
    setConnectorSyncEvents([]);
  };

  const handleToggleTask = (leadId: string, taskId: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const updatedTasks = lead.tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: t.status === 'completed' ? ('pending' as const) : ('completed' as const) }
            : t
        );
        return { ...lead, tasks: updatedTasks };
      })
    );
  };

  const handleAddTask = (leadId: string, task: TaskItem) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, tasks: [task, ...l.tasks] } : l))
    );
    setToastAlert({
      title: task.type === 'viewing' ? 'Viewing Appointment Scheduled' : 'New Task Scheduled',
      message: `${task.title} for ${task.leadName}`,
      type: 'task',
    });
  };

  const handleRescheduleTask = (leadId: string, taskId: string, newDueDate: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const updated = lead.tasks.map((t) =>
          t.id === taskId ? { ...t, dueDate: newDueDate } : t
        );
        return { ...lead, tasks: updated };
      })
    );
    setToastAlert({
      title: 'Appointment / Task Rescheduled',
      message: `Updated to ${new Date(newDueDate).toLocaleString('en-ZA')}`,
      type: 'task',
    });
  };

  const handleToggleRule = (ruleId: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  // Previously entirely fake -- fabricated a local log entry with a
  // hardcoded 'delivered' status and never made a real network call.
  // Now calls the real backend send (api/crm.py's /automations/send-test,
  // genuine AWS SES), and reflects whatever it actually reports --
  // success or a real failure -- rather than always claiming delivery.
  const handleTriggerTestEmail = async () => {
    const recipientEmail = 'privjapan@gmail.com';
    try {
      const response = await fetch('/api/v1/realty/crm/automations/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ recipientType: 'agent', recipientEmail }),
      });
      const result: { ok: boolean; error: string | null; logEntry: EmailNotificationLog } = await response.json();

      // Appends to the real top-level emailLogs state (see chat: this
      // used to mutate leads[0].emailLogs, a field no real backend write
      // ever populated). The backend also pushed this same entry onto
      // crm_state.emailLogs server-side, so this is just an optimistic
      // local update for immediate feedback -- next load/refresh will
      // agree with it either way.
      setEmailLogs((prev) => [result.logEntry, ...prev]);

      setToastAlert(
        result.ok
          ? { title: 'Email Notification Test Dispatched', message: `Broker alert sent to ${recipientEmail}`, type: 'email' }
          : { title: 'Test Email Failed', message: result.error || 'SES rejected the send -- check sender/recipient verification.', type: 'email' }
      );
    } catch (e) {
      console.error('Test email send failed:', e);
      setToastAlert({ title: 'Test Email Failed', message: 'Could not reach the backend.', type: 'email' });
    }
  };

  const handleQuickWhatsApp = (lead: Lead) => {
    const text = `Hi ${lead.name}, this is ${lead.assignedAgent.name} from Ptah Realty. Thank you for your inquiry on ${lead.source} regarding ${lead.propertyTitle}. I would love to share the private specs and arrange a private viewing for you.`;
    const cleanNum = lead.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Property Listings & Show House Handlers
  const handleAddListing = (newListing: PropertyListing) => {
    setListings((prev) => [newListing, ...prev]);
    setToastAlert({
      title: 'Quick Listing Published & Syndicated!',
      message: `${newListing.title} (${newListing.referenceNumber}) is active on Property24 & Private Property.`,
      type: 'lead',
    });
  };

  const handleUpdateListing = (updatedListing: PropertyListing) => {
    setListings((prev) => prev.map((l) => (l.id === updatedListing.id ? updatedListing : l)));
  };

  const handleAddShowHouse = (newShowHouse: ShowHouseRecord) => {
    setShowHouses((prev) => [newShowHouse, ...prev]);
    // Also mark property status as show_house
    setListings((prev) =>
      prev.map((l) => (l.id === newShowHouse.propertyId ? { ...l, status: 'show_house' } : l))
    );
    setToastAlert({
      title: 'Show House Scheduled!',
      message: `${newShowHouse.propertyName} is opened for Sunday inspection.`,
      type: 'task',
    });
  };

  const handleUpdateShowHouse = (updated: ShowHouseRecord) => {
    setShowHouses((prev) => prev.map((sh) => (sh.id === updated.id ? updated : sh)));
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-100 via-emerald-50/50 to-slate-200 dark:from-slate-950 dark:via-emerald-950/25 dark:to-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Backend sync status pill -- transient, not a permanent fixture:
          only rendered while showSyncBadge is true (flashed on around an
          actual save-after-changes event above, auto-hiding a few
          seconds later), per explicit request. Never shown for the
          initial mount-time load, only for genuine subsequent saves. */}
      {showSyncBadge && (
        <div
          className={`fixed bottom-3 right-3 z-[100] flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-md transition-colors animate-in fade-in slide-in-from-bottom-1 duration-200 ${
            crmSyncStatus === 'offline'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
              : crmSyncStatus === 'saving'
              ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
          }`}
          title={
            crmSyncStatus === 'offline'
              ? 'Could not reach the backend -- changes are only saved in this browser (localStorage) until it recovers.'
              : 'CRM data is persisted to the backend.'
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              crmSyncStatus === 'offline' ? 'bg-amber-500' : crmSyncStatus === 'saving' ? 'bg-slate-400 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          {crmSyncStatus === 'saving' && 'Saving…'}
          {crmSyncStatus === 'synced' && 'Synced'}
          {crmSyncStatus === 'offline' && 'Saved locally only'}
        </div>
      )}
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        darkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* AI Copilot is now a persistent docked side panel (see
          AiAdvisorDrawer.tsx), not a full-screen modal overlay -- this
          row splits into <main> + the panel as flex siblings instead of
          the panel being position:fixed on top of everything. */}
      <div className="flex flex-1 min-h-0">
      {/* Main View Area -- widened from max-w-7xl (1280px), which was
          crushing the 6-column Kanban board on any real monitor, to
          max-w-[1920px] so it fills wide screens while still centering
          with breathing room on ultra-wide ones. */}
      <main className="flex-1 min-w-0 overflow-y-auto max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {currentView === 'dashboard' && (
          <DashboardView
            leads={leads}
            listings={listings}
            showHouses={showHouses}
            onOpenQuickListings={() => setIsQuickListingsOpen(true)}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onNavigateView={(view) => setCurrentView(view)}
            onAddShowHouse={handleAddShowHouse}
            onUpdateShowHouse={handleUpdateShowHouse}
            onQuickWhatsApp={handleQuickWhatsApp}
            onOpenCampaigns={() => setIsCampaignsModalOpen(true)}
          />
        )}

        {currentView === 'pipeline' && (
          <>
            {activeListingFilter && (
              <div className="flex items-center justify-between gap-3 bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2.5 mb-3 text-sm">
                <span className="text-cyan-900">
                  Showing leads for{' '}
                  <span className="font-bold">
                    {myListings?.find((l) => l.id === activeListingFilter)?.title
                      || myListings?.find((l) => l.id === activeListingFilter)?.address
                      || 'this listing'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveListingFilter(null)}
                  className="text-cyan-700 hover:text-cyan-900 font-semibold text-xs underline cursor-pointer shrink-0"
                >
                  Clear filter
                </button>
              </div>
            )}
            <PipelineBoard
              leads={activeListingFilter ? leads.filter((l) => l.listingId === activeListingFilter) : leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onOpenQuickWhatsApp={handleQuickWhatsApp}
              onBulkReassignAgent={handleBulkReassignAgent}
              onBulkChangeStatus={handleBulkChangeStatus}
              teamMembers={teamMembers}
            />
          </>
        )}

        {/* Task Reminders no longer has its own top-level view/nav tab --
            consolidated into Schedule Calendar (the "Task Reminders &
            SLAs" button below opens the same NotificationDrawer Task
            Reminders tab this view used to render standalone). */}

        {currentView === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-black p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
              <div>
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Interactive Schedule & Viewing Dispatch</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agent Viewing & Appointment Calendar</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  Manage in-person private inspections, live 4K virtual tours, 15-minute SLA calls, and OTP contract review milestones across all syndication channels.
                </p>
              </div>

              <div className="flex flex-col items-stretch sm:items-end gap-2">
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                  title="Open Notifications & Task Reminders"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Task Reminders & SLAs ({pendingTasksCount})</span>
                </button>

                {/* Moved here from the Dashboard's action-pills row --
                    calendar sync belongs with the calendar. */}
                <button
                  onClick={handleSyncGoogleCalendar}
                  disabled={isSyncingCalendar}
                  className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold border border-cyan-200 dark:border-cyan-800 transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                  title="Sync scheduled events with Google Calendar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
                  <span>{calendarSyncSuccess ? 'Synced to Google!' : 'Sync Google Calendar'}</span>
                </button>
              </div>
            </div>

            <AgentScheduleCalendar
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onToggleTask={handleToggleTask}
              onQuickWhatsApp={handleQuickWhatsApp}
              onAddTask={handleAddTask}
              onRescheduleTask={handleRescheduleTask}
              defaultView="month"
            />
          </div>
        )}

        {currentView === 'automations' && (
          <EmailAutomationsView
            automationRules={automationRules}
            onToggleRule={handleToggleRule}
            emailLogs={allNotifications}
            onTriggerTestNotification={handleTriggerTestEmail}
            latestLead={leads[0]}
            onOpenConnectors={() => onOpenSettings?.()}
          />
        )}

        {currentView === 'reporting' && (
          <ReportingAnalyticsView
            leads={leads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            teamMembers={teamMembers}
          />
        )}

        {currentView === 'scrum' && (
          <ScrumSprintView
            leads={leads}
            sprint={sprint}
            onUpdateSprint={setSprint}
            onUpdateLead={handleUpdateLead}
            onSelectLead={(lead) => setSelectedLead(lead)}
          />
        )}
      </main>

        <AiAdvisorDrawer
          isOpen={isAiAdvisorOpen}
          onOpen={() => setIsAiAdvisorOpen(true)}
          onClose={() => setIsAiAdvisorOpen(false)}
          leads={leads}
          appContext={{
            ...appContext,
            currentSurface: 'crm',
            crmView: currentView,
            teamMemberCount: teamMembers.length,
            connectorCount: connectors.length,
            enabledConnectorCount: connectors.filter((connector) => connector.isEnabled).length,
            listingCount: myListings?.length || 0,
          }}
          onTask={handleAiTask}
        />
      </div>

      {/* Interactive Modals & Drawers */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          allLeads={leads}
          emailLogs={allNotifications}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          linkedListing={myListings?.find((l) => l.id === selectedLead.listingId)}
          onViewListing={
            selectedLead.listingId
              ? () => onViewListingInMain?.(selectedLead.listingId!)
              : undefined
          }
        />
      )}

      {isNewLeadOpen && (
        <NewLeadModal
          onClose={() => setIsNewLeadOpen(false)}
          onAddLead={handleAddNewLead}
          teamMembers={teamMembers}
        />
      )}

      {isSimulatorOpen && (
        <InboundSimulatorModal
          onClose={() => setIsSimulatorOpen(false)}
          onSimulateLead={handleSimulateInboundLead}
        />
      )}

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={allNotifications}
        leads={leads}
        onClearAllNotifications={() => {
          // Clears the local view only -- crm_state.emailLogs is
          // server-authored (see save_crm_state's docstring: the client
          // can't overwrite it), so this is a per-session dismiss, not a
          // deletion of the real send audit trail. Reloading will bring
          // the real history back, same as any "clear" on a synced inbox.
          setEmailLogs([]);
        }}
        onToggleTask={handleToggleTask}
        onSelectLead={(lead) => setSelectedLead(lead)}
        onQuickWhatsApp={handleQuickWhatsApp}
        onAddTask={handleAddTask}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onOpenFullTasksView={() => {
          setIsNotificationsOpen(false);
          setCurrentView('calendar');
        }}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        leads={leads}
        onSelectLead={(lead) => setSelectedLead(lead)}
        onToggleTask={handleToggleTask}
        syncEvents={connectorSyncEvents}
        onOpenSettings={() => onOpenSettings?.()}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenQuickListings={() => setIsQuickListingsOpen(true)}
        onOpenCampaigns={() => setIsCampaignsModalOpen(true)}
        onToggleAiAdvisor={() => setIsAiAdvisorOpen(!isAiAdvisorOpen)}
        onToggleDarkMode={toggleDarkMode}
        darkMode={isDarkMode}
        onNavigateView={(view) => setCurrentView(view)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      <QuickListingsModal
        isOpen={isQuickListingsOpen}
        onClose={() => setIsQuickListingsOpen(false)}
        listings={listings}
        onAddListing={handleAddListing}
        onUpdateListing={handleUpdateListing}
        leads={leads}
        onStartShowHouseForProperty={(property) => {
          handleAddShowHouse({
            id: `sh-${Date.now()}`,
            propertyId: property.id,
            propertyName: property.title,
            propertyLocation: property.location,
            ownerName: property.ownerName || 'Direct Principal',
            startDate: '2026-08-30 14:00',
            endDate: '2026-08-30 17:00',
            status: 'opened',
            agentInCharge: 'privjapan (Senior Principal)',
            attendeeCount: 0,
            notes: 'Opened via Quick Listing',
          });
        }}
      />

      <CampaignsHubModal
        isOpen={isCampaignsModalOpen}
        onClose={() => setIsCampaignsModalOpen(false)}
        campaigns={campaigns}
        onAddCampaign={(newCampaign) => {
          setCampaigns((prev) => [newCampaign, ...prev]);
          setToastAlert({
            title: 'Marketing Campaign Saved & Dispatched!',
            message: `${newCampaign.title} synced across ${newCampaign.connectedApps.join(', ')}.`,
            type: 'email',
          });
        }}
        onUpdateCampaign={(updatedCampaign) => {
          setCampaigns((prev) => prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c)));
        }}
        listings={listings}
        leads={leads}
        connectors={connectors}
          onOpenConnectorsMarketingTab={() => onOpenSettings?.()}
        onAddSyncEvent={handleAddSyncEvent}
      />

      {/* Toast Inbound Lead Alert */}
      {toastAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white dark:bg-black border border-emerald-500 text-slate-900 dark:text-slate-100 p-4 rounded-2xl shadow-xl flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Radio className="w-4 h-4 animate-ping" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{toastAlert.title}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{toastAlert.message}</p>
            {toastAlert.lead && (
              <button
                onClick={() => {
                  setSelectedLead(toastAlert.lead!);
                  setToastAlert(null);
                }}
                className="mt-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline"
              >
                Open Lead Details & Communications →
              </button>
            )}
          </div>
          <button
            onClick={() => setToastAlert(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
