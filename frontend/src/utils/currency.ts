// Jurisdiction-aware currency formatting for the main app.
//
// Property data in services/jurisdictionsData.ts is already correctly
// localized per country (e.g. a real ~GBP 3.85M for a Kensington
// property, not a relabeled ZAR figure) -- the gap this file closes is
// purely on the DISPLAY side, where many components hardcoded "R"/
// 'en-ZA' formatting regardless of which jurisdiction was actually
// selected. See App.tsx's `currentCurrency` (derived from the selected
// countryId via getJurisdictionByCode) for the single source of truth
// this reads from -- components should receive currencySymbol/
// currencyCode as props from there, not hardcode their own.

export interface CurrencyInfo {
  code: string;   // e.g. "ZAR", "GBP", "USD", "AUD", "AED"
  symbol: string; // e.g. "R", currency symbol, "$", "A$", "AED"
  name: string;
}

// Locale used for thousands-separator grouping per currency. Only affects
// digit grouping (1,234,567 vs 1.234.567 etc.), not which currency is
// shown -- the symbol/code passed in always wins.
const LOCALE_BY_CURRENCY: Record<string, string> = {
  ZAR: 'en-ZA',
  GBP: 'en-GB',
  USD: 'en-US',
  AUD: 'en-AU',
  AED: 'en-AE',
};

/**
 * Formats a raw number using the given currency's symbol and grouping
 * locale. Falls back to ZAR/en-ZA only if no currency info is passed at
 * all (keeps existing callers that haven't been updated yet working
 * exactly as before, rather than breaking silently).
 */
export function formatCurrency(amount: number | undefined | null, currency?: CurrencyInfo): string {
  if (amount === undefined || amount === null || !Number.isFinite(amount)) return 'N/A';
  const symbol = currency?.symbol || 'R';
  const locale = LOCALE_BY_CURRENCY[currency?.code || 'ZAR'] || 'en-ZA';
  return `${symbol} ${amount.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
}

/** Short/abbreviated form, e.g. "R2.5M" / a GBP "850K" -- same currency rules as formatCurrency. */
export function formatCurrencyShort(amount: number | undefined | null, currency?: CurrencyInfo): string {
  if (amount === undefined || amount === null || !Number.isFinite(amount)) return 'N/A';
  const symbol = currency?.symbol || 'R';
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(0)}K`;
  return `${symbol}${amount}`;
}
