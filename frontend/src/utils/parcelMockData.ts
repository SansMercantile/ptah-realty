/**
 * PTAH Realty -- zoning-aware mock data for real cadastral parcels.
 *
 * The live cadastre feed (services/cadastre.py on the backend) gives us
 * real boundaries, erf numbers, streets, and zoning for every parcel in
 * Cape Town -- private homes, corporate/commercial land, state-owned
 * public open space, farms, industrial sites, roads, everything. It does
 * NOT give ownership, valuation, or images (that needs a paid provider
 * nobody has connected yet).
 *
 * Per explicit request, every one of those real parcels should still
 * open a populated info card when clicked -- not blank/"N/A" fields.
 * This module generates that: plausible, TYPE-APPROPRIATE mock data
 * (a private house gets a private owner and a house photo; a factory-
 * zoned parcel gets a corporate owner and a factory photo; a park gets
 * "City of Cape Town" and no sale price), driven by the REAL zoning code
 * the cadastre already returns -- not generic identical filler on every
 * parcel.
 *
 * Deterministic: the same erf always generates the same mock data (a
 * seeded hash of the erf number drives every random choice below), so
 * clicking the same parcel twice doesn't show different numbers.
 *
 * Swapping in real ownership/valuation later only means replacing the
 * call to generateParcelMockData() in RealCadastreMap.tsx's
 * buildSyntheticParcelRecord with a real API lookup -- this file and its
 * category classification stay useful either way (e.g. for choosing a
 * fallback photo when a real listing has none).
 */

export type ParcelCategory =
  | 'residential_private'
  | 'residential_complex'
  | 'commercial_corporate'
  | 'industrial_corporate'
  | 'agricultural_farm'
  | 'public_open_space'
  | 'community_institutional'
  | 'transport_road'
  | 'utility_state'
  | 'mixed_use';

interface CategoryProfile {
  label: string;
  zoningDescription: string;
  usage: string;
  accommodationType: string;
  ownerType: 'Private' | 'Corporate' | 'State / Municipal' | 'Public (no owner record)';
  hasMarketValue: boolean;
  ratePerM2Range: [number, number]; // very rough, for a plausible mock valuation only
  images: string[];
}

// --- Deterministic seeding -------------------------------------------
// Small, dependency-free string hash (djb2 variant) -- stable across
// sessions/renders, not cryptographic, just needs to be a consistent
// pseudo-random source keyed on the erf number.
function seedFromString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash) / 2147483647; // normalize to [0, 1)
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed * arr.length) % arr.length];
}

// --- Zoning classification --------------------------------------------
// Cape Town's Municipal Planning By-law zoning scheme -- these are the
// real prefixes the City's cadastre ZONING field uses. Falls back to
// residential_private for anything unrecognized (matches the existing
// GR2 fallback already used elsewhere for parcels with no zoning value).
export function classifyZoning(rawZoning: string | null | undefined): ParcelCategory {
  const z = (rawZoning || '').trim().toUpperCase();
  if (!z) return 'residential_private';

  if (z.startsWith('SR')) return 'residential_private';
  if (z.startsWith('GR')) {
    // GR1/GR2 (lower density) reads as a single house; GR3+ (higher
    // density general residential) reads as a complex/block of units.
    const density = parseInt(z.replace(/\D/g, ''), 10);
    return density >= 3 ? 'residential_complex' : 'residential_private';
  }
  if (z.startsWith('LB') || z.startsWith('GB')) return 'commercial_corporate';
  if (z.startsWith('CO')) return 'community_institutional';
  if (z.startsWith('OS')) return 'public_open_space';
  if (z.startsWith('AG')) return 'agricultural_farm';
  if (z.startsWith('GI') || z.startsWith('IN')) return 'industrial_corporate';
  if (z.startsWith('TR')) return 'transport_road';
  if (z.startsWith('UT')) return 'utility_state';
  if (z.startsWith('MU')) return 'mixed_use';
  return 'residential_private';
}

// --- Category profiles -------------------------------------------------
// Exported (not just used internally by generateParcelMockData below) so
// callers that only want the honest, zoning-derived classification --
// not the fabricated owner/price/date/photo -- can use it directly. See
// RealCadastreMap.tsx's buildSyntheticParcelRecord.
export const PROFILES: Record<ParcelCategory, CategoryProfile> = {
  residential_private: {
    label: 'Private Residential',
    zoningDescription: 'Single Residential',
    usage: 'Residential',
    accommodationType: 'House',
    ownerType: 'Private',
    hasMarketValue: true,
    ratePerM2Range: [35000, 95000],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  residential_complex: {
    label: 'Sectional Title / Complex',
    zoningDescription: 'General Residential',
    usage: 'Sectional title scheme',
    accommodationType: 'Apartment',
    ownerType: 'Private',
    hasMarketValue: true,
    ratePerM2Range: [25000, 50000],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  commercial_corporate: {
    label: 'Commercial',
    zoningDescription: 'General Business',
    usage: 'Commercial',
    accommodationType: 'Office Block',
    ownerType: 'Corporate',
    hasMarketValue: true,
    ratePerM2Range: [15000, 32000],
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  industrial_corporate: {
    label: 'Industrial',
    zoningDescription: 'General Industrial',
    usage: 'Industrial',
    accommodationType: 'Warehouse',
    ownerType: 'Corporate',
    hasMarketValue: true,
    ratePerM2Range: [3000, 8500],
    images: [
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1565793298595-6a879b1d3985?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  agricultural_farm: {
    label: 'Agricultural / Farm',
    zoningDescription: 'Agricultural',
    usage: 'Agricultural',
    accommodationType: 'Farm Homestead',
    ownerType: 'Private',
    hasMarketValue: true,
    ratePerM2Range: [40, 480],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  public_open_space: {
    label: 'Public Open Space',
    zoningDescription: 'Open Space',
    usage: 'Vacant land',
    accommodationType: 'Public Open Space',
    ownerType: 'State / Municipal',
    hasMarketValue: false,
    ratePerM2Range: [0, 0],
    images: [
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1519832979-6fa011b87667?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  community_institutional: {
    label: 'Community / Institutional',
    zoningDescription: 'Community Zone',
    usage: 'Mixed Use',
    accommodationType: 'School / Institution',
    ownerType: 'State / Municipal',
    hasMarketValue: false,
    ratePerM2Range: [0, 0],
    images: [
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  transport_road: {
    label: 'Transport / Road Reserve',
    zoningDescription: 'Transport Zone',
    usage: 'Vacant land',
    accommodationType: 'Public Open Space',
    ownerType: 'State / Municipal',
    hasMarketValue: false,
    ratePerM2Range: [0, 0],
    images: [
      'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  utility_state: {
    label: 'Utility / Infrastructure',
    zoningDescription: 'Utility Zone',
    usage: 'Industrial',
    accommodationType: 'Public Open Space',
    ownerType: 'State / Municipal',
    hasMarketValue: false,
    ratePerM2Range: [0, 0],
    images: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  mixed_use: {
    label: 'Mixed Use',
    zoningDescription: 'Mixed Use',
    usage: 'Mixed Use',
    accommodationType: 'Apartment',
    ownerType: 'Corporate',
    hasMarketValue: true,
    ratePerM2Range: [18000, 38000],
    images: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=85',
    ],
  },
};

const PRIVATE_SURNAMES = [
  'van der Merwe', 'Botha', 'Naidoo', 'Adams', 'Fisher', 'Petersen', 'Abrahams',
  'Cloete', 'Daniels', 'Fortuin', 'Kruger', 'Mbeki', 'Nel', 'Solomons', 'Titus',
];
const CORPORATE_SUFFIXES = ['(Pty) Ltd', 'Holdings (Pty) Ltd', 'Trading CC', 'Investments (Pty) Ltd'];
const CORPORATE_STEMS = [
  'Atlantic', 'Table Bay', 'Southern Cross', 'Peninsula', 'Cape Coastal',
  'Harbour View', 'Silverline', 'Westshore', 'Camissa', 'Fynbos',
];

export interface GeneratedParcelMockData {
  category: ParcelCategory;
  categoryLabel: string;
  zoningDescription: string;
  usage: string;
  accommodationType: string;
  ownerName: string;
  ownerType: CategoryProfile['ownerType'];
  images: string[];
  imageUrl: string;
  hasMarketValue: boolean;
  totalValue: number;
  lastSalePrice: number;
  lastSaleDate: string;
  ratesEstimateMonthly: number;
}

/**
 * Generates deterministic, zoning-appropriate mock data for a real
 * cadastral parcel. `erf` and `rawZoning` should come straight from the
 * live cadastre response (services/cadastre.py); `extentM2` drives the
 * mock valuation's rough scale.
 */
export function generateParcelMockData(
  erf: string,
  rawZoning: string | null | undefined,
  extentM2: number | null | undefined
): GeneratedParcelMockData {
  const category = classifyZoning(rawZoning);
  const profile = PROFILES[category];
  const seed = seedFromString(erf || rawZoning || 'unknown');
  const seed2 = seedFromString(`${erf}-2`);
  const seed3 = seedFromString(`${erf}-3`);

  const extent = extentM2 && extentM2 > 0 ? extentM2 : 300;
  const [rateMin, rateMax] = profile.ratePerM2Range;
  const rate = rateMin + seed2 * (rateMax - rateMin);
  const totalValue = profile.hasMarketValue ? Math.round((extent * rate) / 10000) * 10000 : 0;
  const lastSalePrice = profile.hasMarketValue ? Math.round((totalValue * (0.75 + seed3 * 0.25)) / 5000) * 5000 : 0;

  let ownerName: string;
  if (profile.ownerType === 'Private') {
    const surname = pick(PRIVATE_SURNAMES, seed);
    ownerName = category === 'agricultural_farm' ? `${surname} Boerdery Trust` : `The ${surname} Family Trust`;
  } else if (profile.ownerType === 'Corporate') {
    ownerName = `${pick(CORPORATE_STEMS, seed)} ${pick(CORPORATE_SUFFIXES, seed2)}`;
  } else if (profile.ownerType === 'State / Municipal') {
    ownerName = 'City of Cape Town';
  } else {
    ownerName = 'Public land -- no private owner on record';
  }

  // Mock sale date: somewhere in the last ~9 years, deterministic.
  const yearsAgo = Math.floor(seed3 * 9) + 1;
  const saleDate = new Date();
  saleDate.setFullYear(saleDate.getFullYear() - yearsAgo);
  saleDate.setMonth(Math.floor(seed * 12));

  return {
    category,
    categoryLabel: profile.label,
    zoningDescription: profile.zoningDescription,
    usage: profile.usage,
    accommodationType: profile.accommodationType,
    ownerName,
    ownerType: profile.ownerType,
    images: profile.images,
    imageUrl: pick(profile.images, seed),
    hasMarketValue: profile.hasMarketValue,
    totalValue,
    lastSalePrice,
    lastSaleDate: saleDate.toISOString().split('T')[0],
    ratesEstimateMonthly: profile.hasMarketValue ? Math.round((totalValue * 0.01) / 12 / 10) * 10 : 0,
  };
}
