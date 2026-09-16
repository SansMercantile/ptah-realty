import { BuildingDevelopment, DevelopmentUnit } from '../types';

export const DEVELOPMENTS_DATA: BuildingDevelopment[] = [
  {
    id: 'dev-the-rubik',
    name: 'The Rubik Atlantic & Foreshore',
    developerName: 'Abland Property Developers & Nedbank CIB',
    architect: 'dhk Architects',
    suburb: 'Cape Town CBD / Atlantic Gateway',
    address: '19 Loop Street, Cape Town',
    postalCode: '8001',
    coordinates: { lat: -33.9189, lng: 18.4215 },
    zoning: 'GB7 (General Business 7 - High Density Mixed Use)',
    completionYear: 2025,
    status: 'COMPLETED_NEW',
    totalUnitsCount: 86,
    availableUnitsCount: 14,
    floorsCount: 27,
    startingPrice: 2450000,
    priceRange: { min: 2450000, max: 14950000 },
    averagePricePerM2: 54200,
    cmaMetrics: {
      projectedAppreciationPercent: 10.4,
      suburbComparativeVariancePercent: 8.2,
      grossYieldAveragePercent: 8.6,
      airbnbEstimatedOccupancyPercent: 81,
      airbnbProjectedDailyRate: 2650,
      historicalSalesCount: 72,
      offPlanDiscountRatePercent: 6.5
    },
    buildingAmenities: [
      '24/7 Concierge & Biometric Facial Access',
      'Rooftop Heated Infinity Swimming Pool & Sun Deck',
      'Full Solar & Dual Backup Diesel Generators (100% Load-Shedding Free)',
      'Executive Co-Working Lounge & Boardrooms',
      'Dedicated High-Speed Fiber Backbone',
      'Technogym Equipped Private Fitness Centre',
      'EV Charging Bays & Automated Stacked Parking',
      'Bicycle Storage & Valet Station'
    ],
    petFriendly: true,
    airbnbAllowed: true,
    greenStarRating: '5-Star Green Star SA Custom Mixed-Use v1',
    heroImageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'The Rubik stands as an iconic glass and architectural statement combining progressive cantilevered cubic volumes with panoramic Atlantic Ocean and Table Mountain vistas. Designed for modern global investors, this sectional title development features uncompromised short-term letting yields and high institutional demand.',
    units: [
      {
        id: 'unit-rubik-804',
        developmentId: 'dev-the-rubik',
        developmentName: 'The Rubik Atlantic & Foreshore',
        unitNumber: '804',
        floor: 8,
        layout: '1 Bedroom',
        bedrooms: 1,
        bathrooms: 1,
        internalM2: 48,
        balconyM2: 7,
        totalM2: 55,
        parkingBays: 1,
        storeroomM2: 4,
        askingPrice: 2850000,
        pricePerM2: 51818,
        status: 'AVAILABLE',
        monthlyLevy: 1980,
        monthlyRates: 1420,
        projectedRentalMonthly: 21500,
        projectedGrossYield: 9.05,
        views: 'Table Mountain & City Skyline',
        features: ['Designer SMEG Gas Hob', 'Engineered Oak Flooring', 'Floor-to-Ceiling Glazing', 'Air Conditioning']
      },
      {
        id: 'unit-rubik-1402',
        developmentId: 'dev-the-rubik',
        developmentName: 'The Rubik Atlantic & Foreshore',
        unitNumber: '1402',
        floor: 14,
        layout: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 2,
        internalM2: 82,
        balconyM2: 12,
        totalM2: 94,
        parkingBays: 2,
        storeroomM2: 6,
        askingPrice: 5150000,
        pricePerM2: 54787,
        status: 'AVAILABLE',
        monthlyLevy: 3380,
        monthlyRates: 2650,
        projectedRentalMonthly: 38000,
        projectedGrossYield: 8.85,
        views: 'Panoramic Atlantic Ocean & V&A Waterfront Harbour',
        features: ['Double Vanity En-Suite', 'Integrated Siemens Appliances', 'Private Balcony Terrace', 'Central Climate Control']
      },
      {
        id: 'unit-rubik-2101',
        developmentId: 'dev-the-rubik',
        developmentName: 'The Rubik Atlantic & Foreshore',
        unitNumber: '2101',
        floor: 21,
        layout: 'Penthouse',
        bedrooms: 3,
        bathrooms: 3.5,
        internalM2: 175,
        balconyM2: 45,
        totalM2: 220,
        parkingBays: 3,
        storeroomM2: 10,
        askingPrice: 13950000,
        pricePerM2: 63409,
        status: 'AVAILABLE',
        monthlyLevy: 7920,
        monthlyRates: 6800,
        projectedRentalMonthly: 95000,
        projectedGrossYield: 8.17,
        views: '360° Atlantic Seaboard, Table Mountain & Lion\'s Head Panoramas',
        features: ['Private Rooftop Plunge Pool', 'Direct Key-Card Lift Access', 'Wine Cellar Room', 'Bespoke Italian Marble Finishes']
      }
    ]
  },
  {
    id: 'dev-solstice-atlantic',
    name: 'Solstice Atlantic Point',
    developerName: 'Berman Brothers Group (BBG)',
    architect: 'Robert Silke & Partners',
    suburb: 'Three Anchor Bay',
    address: '87 Beach Road, Three Anchor Bay',
    postalCode: '8005',
    coordinates: { lat: -33.9075, lng: 18.3995 },
    zoning: 'GR4 (General Residential 4)',
    completionYear: 2026,
    status: 'LAUNCHING_OFF_PLAN',
    totalUnitsCount: 42,
    availableUnitsCount: 18,
    floorsCount: 9,
    startingPrice: 3890000,
    priceRange: { min: 3890000, max: 21500000 },
    averagePricePerM2: 68500,
    cmaMetrics: {
      projectedAppreciationPercent: 12.8,
      suburbComparativeVariancePercent: 11.5,
      grossYieldAveragePercent: 7.9,
      airbnbEstimatedOccupancyPercent: 84,
      airbnbProjectedDailyRate: 3400,
      historicalSalesCount: 24,
      offPlanDiscountRatePercent: 8.0
    },
    buildingAmenities: [
      'Front-Row Beach Road Atlantic Promenade Direct Access',
      '24/7 Security Concierge & CCTV Virtual Guard Net',
      'Solar Microgrid with Tesla Powerwall Storage',
      'Heated Saltwater Plunge Pools on Terraces',
      'Underground Secure Parking with Number Plate Recognition',
      'Private Temperature-Controlled Wine Lockers',
      'Pet Wash & Grooming Spa Room'
    ],
    petFriendly: true,
    airbnbAllowed: true,
    greenStarRating: '6-Star Green Star SA Residential Net Zero Carbon',
    heroImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'Premier seafront address on Beach Road, Three Anchor Bay. Solstice Atlantic Point delivers ultra-exclusive beachfront living framed by floor-to-ceiling double glazing, deep sun-lounging balconies, and direct uninterrupted views over the Atlantic ocean rollers.',
    units: [
      {
        id: 'unit-solstice-203',
        developmentId: 'dev-solstice-atlantic',
        developmentName: 'Solstice Atlantic Point',
        unitNumber: '203',
        floor: 2,
        layout: '1 Bedroom',
        bedrooms: 1,
        bathrooms: 1,
        internalM2: 56,
        balconyM2: 14,
        totalM2: 70,
        parkingBays: 1,
        askingPrice: 4450000,
        pricePerM2: 63571,
        status: 'AVAILABLE',
        monthlyLevy: 2450,
        monthlyRates: 2100,
        projectedRentalMonthly: 32000,
        projectedGrossYield: 8.63,
        views: 'Direct Atlantic Oceanfront Wave Horizon',
        features: ['Oggie Hardwood Floors', 'Miele Kitchen Appliance Suite', 'Ducted Inverter Aircon', 'Gas Braai Point']
      },
      {
        id: 'unit-solstice-501',
        developmentId: 'dev-solstice-atlantic',
        developmentName: 'Solstice Atlantic Point',
        unitNumber: '501',
        floor: 5,
        layout: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 2,
        internalM2: 98,
        balconyM2: 24,
        totalM2: 122,
        parkingBays: 2,
        askingPrice: 8650000,
        pricePerM2: 70901,
        status: 'AVAILABLE',
        monthlyLevy: 4280,
        monthlyRates: 4100,
        projectedRentalMonthly: 58000,
        projectedGrossYield: 8.05,
        views: 'Panoramic Sea Point Promenade & Robben Island Views',
        features: ['Frameless Glass Balustrades', 'Walk-in Dressing Room', 'Hansgrohe Matte Black Tapware']
      },
      {
        id: 'unit-solstice-ph9',
        developmentId: 'dev-solstice-atlantic',
        developmentName: 'Solstice Atlantic Point',
        unitNumber: 'PH-901',
        floor: 9,
        layout: 'Penthouse',
        bedrooms: 3,
        bathrooms: 3.5,
        internalM2: 210,
        balconyM2: 65,
        totalM2: 275,
        parkingBays: 3,
        askingPrice: 20950000,
        pricePerM2: 76181,
        status: 'AVAILABLE',
        monthlyLevy: 9600,
        monthlyRates: 9800,
        projectedRentalMonthly: 135000,
        projectedGrossYield: 7.73,
        views: 'Exclusive Rooftop Pool with 360° Ocean & Mountain Panorama',
        features: ['Infinity Plunge Pool', 'Double Private Lock-Up Garage', 'Private Sky Deck', 'Full Gas Fireplace']
      }
    ]
  },
  {
    id: 'dev-harbour-arch',
    name: 'Harbour Arch Precinct (Tower 1 & 2)',
    developerName: 'Amdec Group',
    architect: 'Boogertman + Partners',
    suburb: 'Foreshore / City Bowl',
    address: '1 Harbour Arch Boulevard, Foreshore',
    postalCode: '8001',
    coordinates: { lat: -33.9212, lng: 18.4350 },
    zoning: 'Mixed-Use 2 (MU2)',
    completionYear: 2024,
    status: 'COMPLETED_NEW',
    totalUnitsCount: 432,
    availableUnitsCount: 26,
    floorsCount: 24,
    startingPrice: 1995000,
    priceRange: { min: 1995000, max: 7450000 },
    averagePricePerM2: 46800,
    cmaMetrics: {
      projectedAppreciationPercent: 8.9,
      suburbComparativeVariancePercent: 4.8,
      grossYieldAveragePercent: 9.4,
      airbnbEstimatedOccupancyPercent: 82,
      airbnbProjectedDailyRate: 1950,
      historicalSalesCount: 380,
      offPlanDiscountRatePercent: 5.0
    },
    buildingAmenities: [
      'Elevated Central 8th Floor Piazza with Restaurants & Cafes',
      'Rooftop Residents Pool Deck & Cocktail Bar',
      'Virgin Active Gym / Athletic Fitness Hub Inside Building',
      '24-Hour Precinct Surveillance & Secure Covered Parking',
      'High-Speed Dedicated Fiber Infrastructure',
      'Convenience Retail, Woolworths & Medical Clinic on Ground Level'
    ],
    petFriendly: true,
    airbnbAllowed: true,
    greenStarRating: '5-Star Green Star SA Multi-Unit Residential',
    heroImageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'Cape Town\'s premier 5.8-hectare mega-precinct model modelled after London\'s Canary Wharf and Melbourne\'s Docklands. Offering unrivaled live-work-play urban integration with effortless access to N1/N2 freeways and Cape Town International Airport.',
    units: [
      {
        id: 'unit-ha-1105',
        developmentId: 'dev-harbour-arch',
        developmentName: 'Harbour Arch Precinct',
        unitNumber: '1105',
        floor: 11,
        layout: 'Studio',
        bedrooms: 0,
        bathrooms: 1,
        internalM2: 38,
        balconyM2: 5,
        totalM2: 43,
        parkingBays: 1,
        askingPrice: 2095000,
        pricePerM2: 48720,
        status: 'AVAILABLE',
        monthlyLevy: 1480,
        monthlyRates: 980,
        projectedRentalMonthly: 17500,
        projectedGrossYield: 10.02,
        views: 'Table Bay Harbour & Shipping Canal',
        features: ['Smart Storage Millwork', 'Bosch Kitchen Appliances', 'Fast Fiber Connection']
      },
      {
        id: 'unit-ha-1608',
        developmentId: 'dev-harbour-arch',
        developmentName: 'Harbour Arch Precinct',
        unitNumber: '1608',
        floor: 16,
        layout: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 2,
        internalM2: 74,
        balconyM2: 10,
        totalM2: 84,
        parkingBays: 2,
        askingPrice: 3850000,
        pricePerM2: 45833,
        status: 'AVAILABLE',
        monthlyLevy: 2850,
        monthlyRates: 1950,
        projectedRentalMonthly: 29500,
        projectedGrossYield: 9.19,
        views: 'Table Mountain & City Piazza',
        features: ['Open-plan Living Room', 'Master En-suite', 'Double Glazed Windows']
      }
    ]
  },
  {
    id: 'dev-the-onyx',
    name: 'The Onyx Jewel of Foreshore',
    developerName: 'Signatura & Nedbank',
    architect: 'Robert Silke & Partners',
    suburb: 'Foreshore',
    address: '57 Heerengracht Street, Cape Town',
    postalCode: '8001',
    coordinates: { lat: -33.9175, lng: 18.4280 },
    zoning: 'Mixed-Use 2',
    completionYear: 2023,
    status: 'ESTABLISHED',
    totalUnitsCount: 160,
    availableUnitsCount: 8,
    floorsCount: 14,
    startingPrice: 1850000,
    priceRange: { min: 1850000, max: 8200000 },
    averagePricePerM2: 44500,
    cmaMetrics: {
      projectedAppreciationPercent: 7.8,
      suburbComparativeVariancePercent: 3.5,
      grossYieldAveragePercent: 9.1,
      airbnbEstimatedOccupancyPercent: 85,
      airbnbProjectedDailyRate: 1800,
      historicalSalesCount: 152
    },
    buildingAmenities: [
      'Hotel-grade Valet Parking & 24h Concierge',
      'Indoor/Outdoor Heated Pool & Bar Lounge',
      'Sanctuary Signature Spa & Wellness Studio',
      'MRKT Gourmet Delicatessen on Ground Floor',
      'Fully Equipped Gymnasium'
    ],
    petFriendly: false,
    airbnbAllowed: true,
    greenStarRating: '4-Star Green Star Existing Building Performance',
    heroImageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80'
    ],
    description: 'Transformative residential luxury directly opposite the Cape Town International Convention Centre (CTICC). High short-term occupancy driven by conference delegates, corporate travelers, and luxury holidaymakers.',
    units: [
      {
        id: 'unit-onyx-604',
        developmentId: 'dev-the-onyx',
        developmentName: 'The Onyx Jewel of Foreshore',
        unitNumber: '604',
        floor: 6,
        layout: 'Studio',
        bedrooms: 0,
        bathrooms: 1,
        internalM2: 41,
        balconyM2: 4,
        totalM2: 45,
        parkingBays: 1,
        askingPrice: 1895000,
        pricePerM2: 42111,
        status: 'AVAILABLE',
        monthlyLevy: 1620,
        monthlyRates: 920,
        projectedRentalMonthly: 16800,
        projectedGrossYield: 10.64,
        views: 'Heerengracht Boulevard Fountain',
        features: ['Fully Furnished Turn-Key Package', 'Valet Parking Access', 'Keyless Digital Access']
      },
      {
        id: 'unit-onyx-1102',
        developmentId: 'dev-the-onyx',
        developmentName: 'The Onyx Jewel of Foreshore',
        unitNumber: '1102',
        floor: 11,
        layout: '2 Bedroom',
        bedrooms: 2,
        bathrooms: 2,
        internalM2: 78,
        balconyM2: 8,
        totalM2: 86,
        parkingBays: 1,
        askingPrice: 3850000,
        pricePerM2: 44767,
        status: 'AVAILABLE',
        monthlyLevy: 2950,
        monthlyRates: 1950,
        projectedRentalMonthly: 31000,
        projectedGrossYield: 9.66,
        views: 'Table Mountain & Waterfront Lights',
        features: ['Designer Smeg Appliances', 'Double Glazing', 'Air Conditioning']
      }
    ]
  }
];

export function getDevelopmentById(id: string): BuildingDevelopment | undefined {
  return DEVELOPMENTS_DATA.find(d => d.id === id);
}

export function searchDevelopments(query: string, filters?: {
  suburb?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  airbnbAllowed?: boolean;
  petFriendly?: boolean;
}): BuildingDevelopment[] {
  let results = [...DEVELOPMENTS_DATA];

  if (query) {
    const q = query.toLowerCase().trim();
    results = results.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.developerName.toLowerCase().includes(q) ||
      d.suburb.toLowerCase().includes(q) ||
      d.address.toLowerCase().includes(q)
    );
  }

  if (filters?.suburb && filters.suburb !== 'ALL') {
    results = results.filter(d => d.suburb.toLowerCase().includes(filters.suburb!.toLowerCase()));
  }

  if (filters?.status && filters.status !== 'ALL') {
    results = results.filter(d => d.status === filters.status);
  }

  if (filters?.minPrice) {
    results = results.filter(d => d.startingPrice >= filters.minPrice!);
  }

  if (filters?.maxPrice) {
    results = results.filter(d => d.startingPrice <= filters.maxPrice!);
  }

  if (filters?.airbnbAllowed !== undefined) {
    results = results.filter(d => d.airbnbAllowed === filters.airbnbAllowed);
  }

  if (filters?.petFriendly !== undefined) {
    results = results.filter(d => d.petFriendly === filters.petFriendly);
  }

  return results;
}
