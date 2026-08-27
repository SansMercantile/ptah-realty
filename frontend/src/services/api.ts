/**
 * PTAH Realty -- real backend API client + adapter layer.
 *
 * Talks to the live backend at /api/v1/realty/* (Vercel rewrites this to
 * ptahrealty-api.sansmercantile.com, see vercel.json). Every route needs
 * a Bearer token (see auth.py) -- login() stores it, authFetch() attaches
 * it automatically.
 *
 * The backend's Property document shape is intentionally simpler than
 * this app's rich PropertyRecord type (no cadastral polygon, no
 * sectional-title units, no per-owner ID numbers -- those either don't
 * exist on the backend yet or belong in the separate KYC module). The
 * adapter functions below (toPropertyRecord / toPropertyCreate) fill the
 * gaps with clearly-labelled defaults rather than inventing data. Fields
 * with no backend equivalent are marked "not yet on backend" below.
 */

import { PropertyRecord, SaleRecord, AccommodationDetails, MunicipalValuation, CMAValuationCalculation, ComparativeSaleRecord, AIPropertyValuationResponse } from '../types';

const TOKEN_KEY = 'ptah_auth_token';
const USER_KEY = 'ptah_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ---------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/v1/realty/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || 'Invalid email or password.');
  }
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api/v1/realty${path}`, { ...options, headers });
  if (res.status === 401) {
    logout();
    window.location.reload();
  }
  return res;
}

async function authJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await authFetch(path, { ...options, headers });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------
// Backend <-> frontend Property adapter
// ---------------------------------------------------------------------

// Backend's flatter Property document, as returned by GET/POST /properties.
export interface BackendProperty {
  id: string;
  address_line: string;
  suburb: string;
  city: string;
  property_type: string;
  complex_name?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  erf_size_sqm?: number | null;
  floor_size_sqm?: number | null;
  location: { type: 'Point'; coordinates: [number, number] };
  asking_price?: number | null;
  erf_number?: string | null;
  title_deed_number?: string | null;
  zoning?: string | null;
  registered_owner?: string | null;
  bond_holder?: string | null;
  municipal_valuation?: number | null;
  tenure_type?: string | null;
  garage_count?: number | null;
  has_pool?: boolean | null;
  condition_rating?: number | null;
  status: string;
  created_at: string;
}

const CONDITION_BY_RATING: AccommodationDetails['condition'][] = ['POOR', 'FAIR', 'GOOD', 'GOOD', 'EXCELLENT'];
const RATING_BY_CONDITION: Record<string, number> = { POOR: 1, FAIR: 2, GOOD: 3, EXCELLENT: 5, 'UNDER RENOVATION': 2 };

function accommodationTypeFor(propertyType: string): AccommodationDetails['type'] {
  switch (propertyType) {
    case 'house': return 'House';
    case 'townhouse': return 'Townhouse';
    case 'apartment': return 'Sectional title scheme';
    case 'commercial': return 'Block of flats';
    case 'vacant_land': return 'Vacant land';
    default: return 'Unknown';
  }
}

function propertyTypeFor(accommType: string): string {
  const t = accommType.toLowerCase();
  if (t.includes('house') || t.includes('cluster') || t.includes('semi-detached')) return 'house';
  if (t.includes('townhouse')) return 'townhouse';
  if (t.includes('sectional') || t.includes('flat')) return 'apartment';
  if (t.includes('vacant')) return 'vacant_land';
  return 'apartment';
}

/** Maps a real backend property document to the app's richer PropertyRecord
 * shape. Fields with no backend equivalent get an explicit, labelled
 * default (not fabricated data) -- see inline comments. */
export function toPropertyRecord(p: BackendProperty): PropertyRecord {
  const [lng, lat] = p.location.coordinates;
  const isSectional = p.tenure_type === 'sectional_title';

  const currentSale: SaleRecord = {
    owner: p.registered_owner || 'UNKNOWN OWNER',
    ownersId: '', // owner ID numbers live in the KYC module, not on Property -- never duplicated here unverified
    salePrice: p.asking_price ?? 0,
    saleDate: p.created_at?.slice(0, 10) || '',
    registeredDate: p.created_at?.slice(0, 10) || '',
    titleDeed: p.title_deed_number || '',
    bondHolder: p.bond_holder || undefined,
    bondAmount: 0, // not tracked on the backend yet
    saleType: 'PRIVATE TREATY',
  };

  const municipalValuation: MunicipalValuation = {
    totalValue: p.municipal_valuation ?? 0,
    valuationYear: new Date().getFullYear(),
    ratesEstimateMonthly: p.municipal_valuation ? Math.round(p.municipal_valuation * 0.00054 * 100) / 100 : 0,
  };

  const accommodation: AccommodationDetails = {
    type: accommodationTypeFor(p.property_type),
    usage: p.property_type === 'commercial' ? 'Commercial' : 'Residential',
    condition: CONDITION_BY_RATING[(p.condition_rating ?? 3) - 1] || 'GOOD',
    buildingM2: p.floor_size_sqm ?? undefined,
    bedRooms: p.bedrooms ?? undefined,
    bathRooms: p.bathrooms ?? undefined,
    garages: p.garage_count ?? undefined,
    pool: p.has_pool ?? undefined,
  };

  return {
    id: p.id,
    erfNo: p.erf_number || '',
    lpiCode: '', // not on backend yet
    deedsOffice: '', // not on backend yet
    township: p.suburb,
    address: p.address_line,
    suburb: p.suburb,
    municipality: p.city,
    province: '', // backend doesn't store province directly on Property yet
    gps: { lat, lng, formatted: `${lng.toFixed(6)}°E ${Math.abs(lat).toFixed(6)}°S` },
    extentM2: p.floor_size_sqm ?? p.erf_size_sqm ?? 0,
    cadastralExtentM2: p.erf_size_sqm ?? p.floor_size_sqm ?? 0,
    category: isSectional ? 'Sectional Title' : 'Freehold',
    usage: p.property_type === 'commercial' ? 'Commercial' : 'Residential',
    zoning: (p.zoning as PropertyRecord['zoning']) || 'GR4',
    zoningDescription: p.zoning || '',
    servitudes: false, // not on backend yet
    isSectionalTitle: isSectional,
    schemeName: p.complex_name || undefined,
    currentSale,
    municipalValuation,
    accommodation,
    polygonPoints: [], // no cadastral geometry on the backend yet -- CadastralMap won't draw a shape for real properties until this exists
  };
}

/** Maps this app's rich PropertyRecord (e.g. from mockData.ts, when
 * seeding demo properties as real backend records) down to what the
 * backend's PropertyCreate actually accepts. Fields with no backend
 * column are simply dropped, not sent. */
export function toPropertyCreate(p: PropertyRecord) {
  return {
    address_line: p.address,
    suburb: p.suburb,
    city: p.municipality,
    property_type: propertyTypeFor(p.accommodation.type),
    complex_name: p.schemeName ?? null,
    bedrooms: p.accommodation.bedRooms ?? null,
    bathrooms: p.accommodation.bathRooms ?? null,
    erf_size_sqm: p.cadastralExtentM2 ?? null,
    floor_size_sqm: p.accommodation.buildingM2 ?? p.extentM2 ?? null,
    lat: p.gps.lat,
    lng: p.gps.lng,
    asking_price: p.reportedSale?.price ?? p.currentSale.salePrice ?? null,
    erf_number: p.erfNo ?? null,
    title_deed_number: p.currentSale.titleDeed ?? null,
    zoning: p.zoning ?? null,
    registered_owner: p.currentSale.owner ?? null,
    bond_holder: p.currentSale.bondHolder ?? null,
    municipal_valuation: p.municipalValuation.totalValue ?? null,
    tenure_type: p.isSectionalTitle ? 'sectional_title' : 'freehold',
    garage_count: p.accommodation.garages ?? null,
    has_pool: p.accommodation.pool ?? null,
    condition_rating: RATING_BY_CONDITION[p.accommodation.condition] ?? null,
  };
}

// ---------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------

export async function listProperties(): Promise<PropertyRecord[]> {
  const data = await authJson<{ properties: BackendProperty[] }>('/properties');
  return data.properties.map(toPropertyRecord);
}

export async function createProperty(p: PropertyRecord): Promise<string> {
  const data = await authJson<{ id: string }>('/properties', {
    method: 'POST',
    body: JSON.stringify(toPropertyCreate(p)),
  });
  return data.id;
}

// ---------------------------------------------------------------------
// Valuation / CMA
// ---------------------------------------------------------------------

interface BackendValuation {
  id: string;
  method: string;
  radius_m: number | null;
  comparable_count: number;
  price_per_sqm: { low: number; mid: number; high: number };
  estimated_value: { low: number; mid: number; high: number };
  confidence_score: number;
  comparable_ids: string[];
  price_basis: string;
  market_context: { avg_price: number; active_listings: number | null; source_url: string } | null;
  estimated_monthly_rental: number | null;
  rental_yield_percent: number | null;
  rental_estimate_basis: string;
}

interface BackendComparable {
  id: string;
  source: string;
  address_line?: string;
  suburb?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_size_sqm?: number;
  sale_price?: number;
  list_price?: number;
  price_basis: string;
  sale_date?: string;
  price_per_sqm: number | null;
  similarity_score: number;
  distance_m: number | null;
}

/** Runs a real valuation + fetches the full comparable set, mapped into
 * this app's CMAValuationCalculation shape for the CMA Engine modal.
 * estimatedMonthlyRental / projectedGrossYieldPercent are a disclosed
 * heuristic on the backend (see valuation.py), not real rental comps --
 * there's no rental-listing ingestion pipeline yet. */
export async function runValuation(property: PropertyRecord, radiusM: number): Promise<CMAValuationCalculation> {
  const valuation = await authJson<BackendValuation>('/valuation', {
    method: 'POST',
    body: JSON.stringify({ property_id: property.id, radius_m: radiusM }),
  });

  const compsData = await authJson<{ comparables: BackendComparable[] }>(
    `/valuation/by-id/${valuation.id}/comparables`
  );

  const comparableSales: ComparativeSaleRecord[] = compsData.comparables.map((c) => ({
    id: c.id,
    address: c.address_line || 'Address unavailable',
    suburb: c.suburb || property.suburb,
    erfNo: '',
    category: 'Freehold',
    extentM2: c.floor_size_sqm ?? 0,
    bedrooms: c.bedrooms ?? 0,
    bathrooms: c.bathrooms ?? 0,
    garages: 0,
    salePrice: c.sale_price ?? c.list_price ?? 0,
    saleDate: c.sale_date?.slice(0, 10) || '',
    registrationDate: c.sale_date?.slice(0, 10) || '',
    distanceMeters: c.distance_m ?? 0,
    similarityScore: c.similarity_score,
    pricePerM2: c.price_per_sqm ?? 0,
    source: c.source === 'property24_apify' ? 'Property24' : 'CMA Database',
    condition: 'GOOD',
    imageUrl: '',
    gps: { lat: 0, lng: 0 },
  }));

  return {
    propertyId: property.id,
    subjectProperty: property,
    searchRadiusMeters: radiusM,
    comparableCount: valuation.comparable_count,
    comparableSales,
    averagePricePerM2: valuation.price_per_sqm.mid,
    medianPricePerM2: valuation.price_per_sqm.mid,
    projectedValuationBase: valuation.estimated_value.mid,
    conditionAdjustmentPercent: 0,
    finalProjectedMarketValue: valuation.estimated_value.mid,
    valueRange: {
      conservative: valuation.estimated_value.low,
      recommended: valuation.estimated_value.mid,
      aggressive: valuation.estimated_value.high,
    },
    confidenceScore: Math.round(valuation.confidence_score * 100),
    estimatedMonthlyRental: valuation.estimated_monthly_rental ?? 0,
    projectedGrossYieldPercent: valuation.rental_yield_percent ?? 0,
    historicalSuburbAppreciationRate: 0, // not computed by the backend yet
    calculatedAt: new Date().toISOString(),
  };
}

export async function triggerComparablesIngest(searchLocation: string, propertyType: string): Promise<string> {
  const data = await authJson<{ job_id: string }>('/comparables/ingest', {
    method: 'POST',
    body: JSON.stringify({ search_location: searchLocation, property_type: propertyType }),
  });
  return data.job_id;
}

// ---------------------------------------------------------------------
// AI (individual valuation & outreach) -- backed by api/ai.py, authenticated
// ---------------------------------------------------------------------

export async function getIndividualValuation(
  property: PropertyRecord,
  condition: string,
  buildingM2: number,
  extentM2: number,
  customAdjustments?: Record<string, unknown>
): Promise<AIPropertyValuationResponse> {
  return authJson<AIPropertyValuationResponse>('/ai/property-valuation', {
    method: 'POST',
    body: JSON.stringify({
      propertyId: property.id,
      property,
      condition,
      customBuildingM2: buildingM2,
      customExtentM2: extentM2,
      customAdjustments: customAdjustments || {},
    }),
  });
}

export interface OutreachEmailDraft {
  subject: string;
  body: string;
  generatedBy: 'bedrock' | 'template_fallback';
}

export async function getOutreachEmail(
  property: PropertyRecord,
  template: 'valuation' | 'buyer' | 'mandate' | 'deeds',
  ownerName?: string,
  estimatedValue?: number
): Promise<OutreachEmailDraft> {
  return authJson<OutreachEmailDraft>('/ai/outreach-email', {
    method: 'POST',
    body: JSON.stringify({
      property,
      template,
      owner_name: ownerName,
      estimated_value: estimatedValue,
    }),
  });
}

// ---------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------

export async function uploadMedia(propertyId: string, file: File, conditionNotes?: string): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  if (conditionNotes) form.append('condition_notes', conditionNotes);
  await authFetch(`/properties/${propertyId}/media`, { method: 'POST', body: form });
}

export async function listMedia(propertyId: string): Promise<any[]> {
  const data = await authJson<{ media: any[] }>(`/properties/${propertyId}/media`);
  return data.media;
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await authFetch(`/media/${mediaId}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------

export async function generateReport(propertyId: string, valuationSnapshotId: string): Promise<{ report_id: string; pdf_path: string }> {
  return authJson('/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ property_id: propertyId, valuation_snapshot_id: valuationSnapshotId }),
  });
}

export function reportDownloadUrl(reportId: string): string {
  return `/api/v1/realty/reports/${reportId}/download`;
}

// ---------------------------------------------------------------------
// Property24 live radius pull (Apify, includeFullDetails -- real prices,
// descriptions, and every listing photo within a radius of a map center)
// ---------------------------------------------------------------------

export interface Property24RadiusListing {
  listingId: string;
  listingUrl?: string;
  headline?: string;
  description?: string;
  address?: string;
  suburb?: string;
  city?: string;
  propertyType?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  floorSizeSqm?: number;
  erfSizeSqm?: number;
  features?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
  datePosted?: string;
  distanceM?: number;
}

export interface Property24RadiusResponse {
  count: number;
  radiusMeters: number;
  center: { lat: number; lng: number };
  listings: Property24RadiusListing[];
}

export async function pullProperty24RadiusListings(
  lat: number,
  lng: number,
  radiusMeters: number,
  searchLocation: string,
  propertyType: string = 'house',
  maxItems: number = 40
): Promise<Property24RadiusResponse> {
  return authJson<Property24RadiusResponse>('/ai/property24/radius-listings', {
    method: 'POST',
    body: JSON.stringify({
      lat,
      lng,
      radiusMeters,
      searchLocation,
      propertyType,
      maxItems,
    }),
  });
}

// ---------------------------------------------------------------------
// CRM (leads pipeline, automation rules, connectors, sync events) --
// tenant-scoped, whole-state sync (see api/crm.py on the backend for why
// a single JSON blob rather than granular per-lead endpoints).
// ---------------------------------------------------------------------

export interface CrmState {
  initialized: boolean;
  leads: any[];
  automationRules: any[];
  connectors: any[];
  connectorSyncEvents: any[];
}

export async function getCrmState(): Promise<CrmState> {
  return authJson<CrmState>('/crm/state', { method: 'GET' });
}

export async function saveCrmState(state: {
  leads: any[];
  automationRules: any[];
  connectors: any[];
  connectorSyncEvents: any[];
}): Promise<{ saved: boolean }> {
  return authJson<{ saved: boolean }>('/crm/state', {
    method: 'PUT',
    body: JSON.stringify(state),
  });
}
