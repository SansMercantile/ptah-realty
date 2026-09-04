/**
 * Connector & Extension types -- shared between the main app's Settings
 * (Connectors & Extensions tab) and the CRM. Moved out of crm/types.ts
 * (2026-09-03) so the single Settings location can own the full list;
 * the CRM re-exports these for backward compatibility rather than
 * defining its own copy.
 */

export type ConnectorCategory =
  | 'portals'
  | 'communications'
  | 'marketing_campaigns'
  | 'video_walkthroughs'
  | 'virtual_tours'
  | 'calendars'
  | 'legal_valuations'
  | 'accounting_commission'
  | 'webhooks'
  | 'browser_mobile'
  | 'data_integration'
  | 'productivity';

/** Functional grouping shown in Settings -- several ConnectorCategory
 * values collapse into the same group heading (e.g. video_walkthroughs
 * and virtual_tours both live under "Marketing & Media"), since the
 * finer-grained category still matters for filtering/config but isn't
 * useful as a top-level heading on its own. */
export type ConnectorGroup =
  | 'Portals & Syndication'
  | 'Communication'
  | 'Marketing & Media'
  | 'Productivity'
  | 'Legal & Compliance'
  | 'Browser & Mobile';

export const CONNECTOR_GROUP_BY_CATEGORY: Record<ConnectorCategory, ConnectorGroup> = {
  portals: 'Portals & Syndication',
  communications: 'Communication',
  marketing_campaigns: 'Marketing & Media',
  video_walkthroughs: 'Marketing & Media',
  virtual_tours: 'Marketing & Media',
  calendars: 'Productivity',
  webhooks: 'Productivity',
  productivity: 'Productivity',
  legal_valuations: 'Legal & Compliance',
  accounting_commission: 'Legal & Compliance',
  browser_mobile: 'Browser & Mobile',
  data_integration: 'Legal & Compliance',
};

export function getConnectorGroup(category: ConnectorCategory): ConnectorGroup {
  return CONNECTOR_GROUP_BY_CATEGORY[category] || 'Productivity';
}

export type ConnectorStatus = 'connected' | 'configured' | 'disconnected' | 'error' | 'syncing';

export interface ConnectorConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'number' | 'select' | 'toggle';
  placeholder?: string;
  helpText?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: any;
}

export interface ConnectorItem {
  id: string;
  name: string;
  slug: string;
  category: ConnectorCategory;
  description: string;
  iconName: string;
  status: ConnectorStatus;
  isEnabled: boolean;
  lastSyncAt?: string;
  healthPingMs?: number;
  syncCount?: number;
  config: Record<string, any>;
  fields: ConnectorConfigField[];
  badgeText?: string;
  webhookUrl?: string;
  documentationUrl?: string;
  /** Only set on the 5 items migrated in from the old Settings
   * "Apps & Extensions" tab (Chrome extension, mobile app, etc.) --
   * these don't have real backend connector state (no ping/config),
   * so the shared UI shows them as a simpler install-style card. */
  isStaticApp?: boolean;
  version?: string;
  rating?: string;
}

export interface ConnectorSyncEvent {
  id: string;
  connectorId: string;
  connectorName: string;
  event: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
  details: string;
  payloadSummary?: string;
}
