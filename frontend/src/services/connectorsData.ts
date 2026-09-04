/**
 * Combined connector & extension list for the main app's Settings ->
 * Connectors & Extensions tab (2026-09-03 migration).
 *
 * Previously the CRM's 17 real connectors (Property24, Gmail, WhatsApp,
 * Zoom, Xero, etc.) only showed up in the CRM's own "Agency Settings &
 * Connectors Hub" modal, while Settings had a separate, unrelated list
 * of 5 static apps (Chrome extension, mobile app, etc.). This file is
 * the single source of truth going forward -- it imports the CRM's
 * real connector data (rather than duplicating ~900 lines of config
 * field definitions) and merges in the 5 former Settings apps,
 * converted to the same ConnectorItem shape so one UI can render both.
 */

import { INITIAL_CONNECTORS } from '../crm/data/mockData';
import { ConnectorItem } from '../types/connectors';

/** The 5 items that used to live only in UserSettingsModal's local
 * APPS_LIST, now expressed as ConnectorItem so they render in the same
 * grouped list as the real CRM connectors. isStaticApp:true means the
 * shared UI shows an "Install"-style card (version/rating) instead of
 * the ping/configure controls real connectors get. */
export const STATIC_APPS: ConnectorItem[] = [
  {
    id: 'chrome-ext',
    name: 'Virtual Agent Chrome Extension',
    slug: 'chrome-ext',
    category: 'browser_mobile',
    description: 'Overlay real-time Cadastral ERF boundaries, transfer histories, and CMA valuations directly onto Property24 & Private Property while browsing.',
    iconName: 'Chrome',
    status: 'disconnected',
    isEnabled: false,
    config: {},
    fields: [],
    isStaticApp: true,
    version: 'v3.4.1',
    rating: '4.9 \u2605 (1,240 realtors)',
    badgeText: 'POPULAR',
  },
  {
    id: 'whatsapp-crm', name: 'WhatsApp FICA & Lead Assistant', slug: 'whatsapp-crm', category: 'communications',
    description: 'Automate POPIA consent, CMA snapshots, and verified ID uploads through WhatsApp.', iconName: 'MessageSquare', status: 'disconnected', isEnabled: false, config: {}, fields: [], isStaticApp: true, version: 'v2.1.0', rating: '4.8 stars (890 realtors)', badgeText: 'FICA VERIFIED'
  },
  {
    id: 'mobile-app', name: 'Ptah Mobile Field Companion', slug: 'mobile-app', category: 'browser_mobile',
    description: 'Capture site photos, locate boundary beacons, and look up deeds from the field.', iconName: 'Smartphone', status: 'disconnected', isEnabled: false, config: {}, fields: [], isStaticApp: true, version: 'v4.0.2', rating: '4.9 stars (2,100 realtors)', badgeText: 'CADASTRE GPS'
  },
  {
    id: 'deeds-api', name: 'National Deeds Office Live API', slug: 'deeds-api', category: 'legal_valuations',
    description: 'Connect title deed extraction and bond tracking to your agency workflows.', iconName: 'Database', status: 'disconnected', isEnabled: false, config: {}, fields: [], isStaticApp: true, version: 'v1.9.0', rating: '5.0 stars Enterprise', badgeText: 'LIVE SYNC'
  },
  {
    id: 'excel-addin', name: 'Excel & Google Sheets CMA Sync', slug: 'excel-addin', category: 'productivity',
    description: 'Export comparative market analyses and suburb trends to spreadsheets.', iconName: 'FileSpreadsheet', status: 'disconnected', isEnabled: false, config: {}, fields: [], isStaticApp: true, version: 'v2.0.4', rating: '4.7 stars (620 realtors)', badgeText: 'PRODUCTIVITY'
  },
];


export const CONNECTORS_AND_EXTENSIONS: ConnectorItem[] = [
  ...(INITIAL_CONNECTORS as unknown as ConnectorItem[]),
  ...STATIC_APPS,
];
