import { PropertyRecord } from '../types';

export interface StreetFilterInfo {
  id: string;
  name: string;
  shortName: string;
  color: string;
  clusterId: string;
}

export interface PrecinctCluster {
  id: string;
  name: string;
  shortName: string;
  description: string;
  streets: string[];
  color: string;
}

export const PRECINCT_CLUSTERS: PrecinctCluster[] = [
  {
    id: 'all',
    name: 'Entire Cadastre (All Streets)',
    shortName: 'All Precincts',
    description: 'All 8 registered streets and surrounding erven across Three Anchor Bay & Green Point',
    streets: [
      'Richmond Road',
      'Main Road',
      'Law Road',
      'St Bedes Road',
      'Blackheath Road',
      'Mutley Road',
      'Hofmeyr Road',
      'Mount Nelson Road'
    ],
    color: '#00bcd4'
  },
  {
    id: 'richmond',
    name: 'Richmond Heritage Precinct',
    shortName: 'Richmond Rd',
    description: 'Heritage Victorian villas & freehold residences (Erven 1680–1683, 1675–1676)',
    streets: ['Richmond Road'],
    color: '#38bdf8'
  },
  {
    id: 'main',
    name: 'Main Road High-Density Corridor',
    shortName: 'Main Rd Corridor',
    description: 'Mixed-use GB5 & high-density sectional title schemes (Erven 1797, 2092, 2094)',
    streets: ['Main Road'],
    color: '#818cf8'
  },
  {
    id: 'hillside',
    name: 'Upper Hillside Enclave',
    shortName: 'Upper Hillside',
    description: 'Elevated luxury view properties on St Bedes, Blackheath & Mutley Roads',
    streets: ['St Bedes Road', 'Blackheath Road', 'Mutley Road'],
    color: '#34d399'
  },
  {
    id: 'coastal',
    name: 'Coastal & Law Road Pocket',
    shortName: 'Coastal Pockets',
    description: 'Promenade-facing cottages & residential avenues (Law, Hofmeyr & Mount Nelson)',
    streets: ['Law Road', 'Hofmeyr Road', 'Mount Nelson Road'],
    color: '#fbbf24'
  }
];

export const CADASTRAL_STREETS: StreetFilterInfo[] = [
  {
    id: 'Richmond Road',
    name: 'Richmond Road',
    shortName: 'Richmond Rd',
    color: '#38bdf8',
    clusterId: 'richmond'
  },
  {
    id: 'Main Road',
    name: 'Main Road',
    shortName: 'Main Rd',
    color: '#818cf8',
    clusterId: 'main'
  },
  {
    id: 'Law Road',
    name: 'Law Road',
    shortName: 'Law Rd',
    color: '#fbbf24',
    clusterId: 'coastal'
  },
  {
    id: 'St Bedes Road',
    name: 'St Bedes Road',
    shortName: 'St Bedes Rd',
    color: '#34d399',
    clusterId: 'hillside'
  },
  {
    id: 'Blackheath Road',
    name: 'Blackheath Road',
    shortName: 'Blackheath Rd',
    color: '#a78bfa',
    clusterId: 'hillside'
  },
  {
    id: 'Mutley Road',
    name: 'Mutley Road',
    shortName: 'Mutley Rd',
    color: '#f472b6',
    clusterId: 'hillside'
  },
  {
    id: 'Hofmeyr Road',
    name: 'Hofmeyr Road',
    shortName: 'Hofmeyr Rd',
    color: '#fb923c',
    clusterId: 'coastal'
  },
  {
    id: 'Mount Nelson Road',
    name: 'Mount Nelson Road',
    shortName: 'Mt Nelson Rd',
    color: '#2dd4bf',
    clusterId: 'coastal'
  }
];

/**
 * Standardize any address string to a canonical registered street name
 */
export function extractStreetName(address?: string): string {
  if (!address) return 'Other';
  const clean = address.trim();
  const lower = clean.toLowerCase();

  if (lower.includes('richmond')) return 'Richmond Road';
  if (lower.includes('main')) return 'Main Road';
  if (lower.includes('law')) return 'Law Road';
  if (lower.includes('bede') || lower.includes('bedes')) return 'St Bedes Road';
  if (lower.includes('blackheath')) return 'Blackheath Road';
  if (lower.includes('mutley')) return 'Mutley Road';
  if (lower.includes('hofmeyr')) return 'Hofmeyr Road';
  if (lower.includes('mount nelson') || lower.includes('mt nelson') || lower.includes('nelson')) return 'Mount Nelson Road';

  // Fallback: strip leading digits
  const withoutNumber = clean.replace(/^(\d+[A-Za-z]?(?:\/\d+)?)\s+/, '');
  return withoutNumber || 'Other';
}

/**
 * Filter properties by active visible streets and category filter
 */
export function filterPropertiesByStreet(
  properties: PropertyRecord[],
  visibleStreets: Set<string>,
  categoryFilter: 'ALL' | 'FREEHOLD' | 'SECTIONAL' = 'ALL'
): PropertyRecord[] {
  return properties.filter((prop) => {
    // 1. Street match
    const street = extractStreetName(prop.address);
    const matchesStreet = visibleStreets.has(street) || visibleStreets.size === 0;

    if (!matchesStreet) return false;

    // 2. Category match
    if (categoryFilter === 'FREEHOLD') {
      return prop.category === 'Freehold';
    }
    if (categoryFilter === 'SECTIONAL') {
      return prop.category === 'Sectional Title' || !!prop.sectionalTitleScheme;
    }

    return true;
  });
}

/**
 * Filter surrounding parcels by active visible streets
 */
export function filterSurroundingParcels<T extends { street: string }>(
  parcels: T[],
  visibleStreets: Set<string>
): T[] {
  return parcels.filter((parcel) => {
    const street = extractStreetName(parcel.street);
    return visibleStreets.has(street) || visibleStreets.size === 0;
  });
}
