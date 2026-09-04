import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';

// Date-format preference: set in the main app's Header dropdown > Settings
// > Preferences > Date Format, persisted to localStorage under this key
// (see UserSettingsModal.tsx's handleSavePreferences) since the CRM is
// mounted as a separate embedded app in the same page, not sharing React
// state with it directly.
const DATE_FORMAT_STORAGE_KEY = 'ptah_date_format';
const DATE_FORMAT_EVENT = 'ptah-date-format-changed';

export type DateFormatPref = 'YYYY/MM/DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export function getDateFormatPreference(): DateFormatPref {
  const stored = localStorage.getItem(DATE_FORMAT_STORAGE_KEY);
  if (stored === 'YYYY/MM/DD' || stored === 'DD/MM/YYYY' || stored === 'MM/DD/YYYY' || stored === 'YYYY-MM-DD') {
    return stored;
  }
  return 'YYYY/MM/DD';
}

// Reactive hook: re-renders if the preference changes while this
// component is mounted (Settings saved from the header while the CRM tab
// is open), without needing a page reload.
export function useDateFormatPreference(): DateFormatPref {
  const [format, setFormat] = useState<DateFormatPref>(getDateFormatPreference());
  useEffect(() => {
    const handler = () => setFormat(getDateFormatPreference());
    window.addEventListener(DATE_FORMAT_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(DATE_FORMAT_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);
  return format;
}

// Formats a date per the user's chosen preference, e.g. 08/30/26 for
// MM/DD/YYYY, 2026/08/30 for YYYY/MM/DD, etc. Two-digit year to keep it
// compact for tight card layouts (the dashboard event slideshow).
export function formatDateWithPreference(dateString: string, pref: DateFormatPref): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const yyyy = d.getFullYear();
  const yy = String(yyyy).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  switch (pref) {
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yy}`;
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'YYYY/MM/DD':
    default:
      return `${yyyy}/${mm}/${dd}`;
  }
}

function getSharedCurrency(): { code: string; locale: string } {
  const code = localStorage.getItem('ptah_currency') || 'ZAR';
  const locale = localStorage.getItem('ptah_language') || navigator.language || 'en-ZA';
  return { code, locale };
}

export function formatCurrency(amount: number, currency?: string): string {
  const preference = getSharedCurrency();
  const code = currency || preference.code;
  if (!amount) return new Intl.NumberFormat(preference.locale, { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(0);
  return new Intl.NumberFormat(preference.locale, { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount);
}

// South African ID numbers encode DOB in their first 6 digits, which is a
// real, existing mechanism this app's owner-side KYCModal already handles
// for property owners (deeds verification) -- see
// docs/roadmap-lead-kyc-linkage.md for the plan to extend that to leads,
// at which point birthday would come from a verified ID number rather than
// this plain manual date field. ageBracket is derived here, not manually
// entered, so it stays consistent with whatever birthday actually holds.
export function computeAgeBracket(birthday?: string): string | undefined {
  if (!birthday) return undefined;
  const parts = birthday.split('-');
  if (parts.length !== 3) return undefined;
  const birthYear = parseInt(parts[0], 10);
  if (!Number.isFinite(birthYear) || birthYear < 1900) return undefined;
  const age = new Date().getFullYear() - birthYear;
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 50) return '35-49';
  if (age < 65) return '50-64';
  return '65+';
}

export function formatShortCurrency(amount: number): string {
  const { code } = getSharedCurrency();
  const symbol = new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: 0 })
    .formatToParts(0).find((part) => part.type === 'currency')?.value || code;
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(0)}K`;
  }
  return `${symbol}${amount}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function triggerDealWonConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#059669', '#10b981', '#f59e0b', '#d97706', '#3b82f6'],
  });
}

export function exportLeadsToCSV(leads: any[]) {
  const headers = [
    'Reference',
    'Lead Name',
    'Email Address',
    'Phone Number',
    'WhatsApp Number',
    'Lead Source / Portal',
    'Pipeline Status',
    'Urgency Level',
    'Lead Quality Score (1-100)',
    'Property Ref',
    'Property Title',
    'Property Location',
    'Property Type',
    'Bedrooms',
    'Bathrooms',
    'Property Price (ZAR)',
    'Buyer Budget',
    'Buyer Qualification Type',
    'Purchase Timeframe',
    'Assigned Agent',
    'Agent Email',
    'Inquiry Date',
    'Last Contacted At',
    'Inquiry Snippet'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map((l) => [
    escapeCSV(l.referenceNumber),
    escapeCSV(l.name),
    escapeCSV(l.email),
    escapeCSV(l.phone),
    escapeCSV(l.whatsappNumber || l.phone),
    escapeCSV(l.source),
    escapeCSV(l.status),
    escapeCSV(l.urgency),
    l.leadScore ?? 0,
    escapeCSV(l.propertyRef || ''),
    escapeCSV(l.propertyTitle || ''),
    escapeCSV(l.propertyLocation || ''),
    escapeCSV(l.propertyType || ''),
    l.propertyBedrooms ?? '',
    l.propertyBathrooms ?? '',
    l.propertyPrice || 0,
    escapeCSV(l.budget || ''),
    escapeCSV(l.buyerType || ''),
    escapeCSV(l.timeframe || ''),
    escapeCSV(l.assignedAgent?.name || ''),
    escapeCSV(l.assignedAgent?.email || ''),
    escapeCSV(l.inquiryDate || ''),
    escapeCSV(l.lastContactedAt || ''),
    escapeCSV(l.inquiryMessage ? l.inquiryMessage.slice(0, 120) : '')
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Ptah_Realty_Leads_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
