import { PropertyRecord } from '../types';
import { generateAll196CountryOptions } from './allGlobalCountries';

export interface CityTownOption {
  id: string;
  name: string;
  suburbs: string[];
  deedsOffice: string;
  municipality: string;
  coordinates: {
    lat: number;
    lng: number;
    zoom: number;
  };
  properties: PropertyRecord[];
}

export interface ProvinceStateOption {
  id: string;
  name: string;
  code: string;
  cities: CityTownOption[];
}

export interface CountryOption {
  id: string;
  name: string;
  code: string;
  flag: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  landRegistryAuthority: string;
  legalIdentifierName: string; // e.g. "Erf / LPI Code", "Title Number", "APN / Parcel ID", "Lot / Plan", "Makani / Title Deed"
  provincesOrStatesLabel: string; // "Provinces", "States", "Nations / Counties", "Emirates", "Districts"
  citiesLabel: string; // "Cities / Towns", "Metropolitan Areas", "Boroughs / Cities"
  phoneDialCode: string;
  phonePlaceholder: string;
  idNumberPlaceholder: string;
  idFormatHint: string;
  regulatoryBody: string;
  ffcLicenseName: string;
  ffcLicensePlaceholder: string;
  statutoryAct?: string;
  regulatoryRequirements?: string;
  licenseFormatDescription?: string;
  renewalCycle?: string;
  trustAccountObligation?: string;
  defaultDateFormat: string;
  defaultUnit: string;
  complianceAuthorityName: string;
  agentTypeOptions?: string[];
  provinces: ProvinceStateOption[];
  majorPortals: {
    name: string;
    logo?: string;
    url: string;
  }[];
}

// -------------------------------------------------------------
// SOUTH AFRICA PROPERTIES (Cape Town, Johannesburg, Durban)
// -------------------------------------------------------------
const SA_CAPE_TOWN_PROPERTIES: PropertyRecord[] = [
  {
    id: 'prop-1681',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-11849201',
      url: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11849201',
      title: 'Architectural 3-Bed Heritage Home with Plunge Pool',
      askingPrice: 7750000,
      headline: 'Sensational Three Anchor Bay Sanctuary | Seamless Flow',
      description: 'Nestled on coveted Richmond Road, this meticulously updated 3-bedroom Victorian residence combines classical period elegance with contemporary Atlantic Seaboard luxury.',
      keyFeatures: [
        '3 En-Suite Bedrooms',
        'Plunge Pool & Deck',
        'Secure Garage with Direct Access',
        'Solar Inverter Backup Ready',
        'Walk to Sea Point Promenade'
      ],
      agentName: 'Sarah Jenkins',
      agentAgency: "Sotheby's International Realty",
      agentPhone: '+27 82 491 8820'
    },
    erfNo: '1681',
    lpiCode: 'C01600210000168100000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '5 RICHMOND ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: { lat: -33.90876, lng: 18.401027, formatted: '18.401027°E 33.90876°S' },
    extentM2: 201,
    cadastralExtentM2: 201,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    currentSale: {
      owner: 'PIER MANE TRUST',
      ownersId: '1895/2007',
      salePrice: 2400000,
      saleDate: '2007/07/13',
      registeredDate: '2007/10/02',
      titleDeed: 'T78896/2007',
      saleType: 'PRIVATE TREATY',
      bondHolder: 'STANDARD BANK OF SA',
      bondAmount: 1800000
    },
    historicalSales: [],
    municipalValuation: {
      totalValue: 6900000,
      valuationYear: 2023,
      ratesEstimateMonthly: 3450
    },
    accommodation: {
      type: 'House',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Victorian Pitched Roof, Solar Inverter',
      bedRooms: 3,
      bathRooms: 2,
      garages: 1,
      pool: true
    },
    contacts: {
      representativeName: 'Stephan Fridolin Muller',
      primaryPhone: '+27 82 890 3863',
      email: 'muller.stephan@intekom.co.za',
      postalAddress: '5 Richmond Road, Three Anchor Bay'
    },
    polygonPoints: [
      [500, 310],
      [570, 310],
      [570, 340],
      [500, 340]
    ]
  },
  {
    id: 'prop-1682',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-11928374',
      url: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11928374',
      title: 'Grand Victorian Villa with Ocean Views',
      askingPrice: 9850000,
      headline: 'Unrivalled Charm & Panoramic Ocean Vistas',
      description: 'Stunning double-storey Victorian residence with expansive wrap-around verandah, high pressed-steel ceilings, and landscaped terrace.',
      keyFeatures: ['4 Bedrooms', 'Double Garage', 'Staff Accommodation', 'Solar Ready'],
      agentName: 'Michael Sterling',
      agentAgency: 'Pam Golding Properties',
      agentPhone: '+27 83 220 1199'
    },
    erfNo: '1682',
    lpiCode: 'C01600210000168200000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '7 RICHMOND ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: { lat: -33.90885, lng: 18.40115, formatted: '18.401150°E 33.90885°S' },
    extentM2: 245,
    cadastralExtentM2: 245,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    currentSale: {
      owner: 'STERLING ATLANTIC INVESTMENTS',
      ownersId: '2015/091823/07',
      salePrice: 6200000,
      saleDate: '2016/11/10',
      registeredDate: '2017/02/14',
      titleDeed: 'T12098/2017',
      saleType: 'PRIVATE TREATY',
      bondHolder: 'INVESTEC BANK LTD',
      bondAmount: 4500000
    },
    historicalSales: [],
    municipalValuation: {
      totalValue: 8800000,
      valuationYear: 2023,
      ratesEstimateMonthly: 4400
    },
    accommodation: {
      type: 'House (2 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Slate Tile, Ocean Views',
      bedRooms: 4,
      bathRooms: 3,
      garages: 2,
      pool: true
    },
    contacts: {
      representativeName: 'James Alexander Sterling',
      primaryPhone: '+27 82 450 8821',
      email: 'sterling.j@atlanticcapital.co.za',
      postalAddress: '7 Richmond Road, Three Anchor Bay'
    },
    polygonPoints: [
      [570, 310],
      [640, 310],
      [640, 340],
      [570, 340]
    ]
  },
  {
    id: 'prop-1683',
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-11928375',
      url: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11928375',
      title: 'Classic Victorian Cottage with North-Facing Sun Courtyard',
      askingPrice: 6950000,
      headline: 'Sun-Drenched Coastal Haven',
      description: 'Charming three-bedroom cottage featuring original pine floorboards, high ceilings, and an entertainer courtyard.',
      keyFeatures: ['3 Bedrooms', 'Secure Off-Street Bay', 'Walk to Coast'],
      agentName: 'Sarah Jenkins',
      agentAgency: "Sotheby's International Realty",
      agentPhone: '+27 82 491 8820'
    },
    erfNo: '1683',
    lpiCode: 'C01600210000168300000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '9 RICHMOND ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: { lat: -33.90895, lng: 18.40128, formatted: '18.401280°E 33.90895°S' },
    extentM2: 218,
    cadastralExtentM2: 218,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    currentSale: {
      owner: 'HARRINGTON FAMILY TRUST',
      ownersId: 'IT4491/2012',
      salePrice: 5100000,
      saleDate: '2014/05/20',
      registeredDate: '2014/08/18',
      titleDeed: 'T44091/2014',
      saleType: 'PRIVATE TREATY',
      bondHolder: 'NEDBANK LTD',
      bondAmount: 3200000
    },
    historicalSales: [],
    municipalValuation: {
      totalValue: 7400000,
      valuationYear: 2023,
      ratesEstimateMonthly: 3700
    },
    accommodation: {
      type: 'House (Single storey)',
      usage: 'Residential',
      condition: 'GOOD',
      specialFeatures: 'Sun Courtyard, Pine Flooring',
      bedRooms: 3,
      bathRooms: 2,
      garages: 1,
      pool: false
    },
    contacts: {
      representativeName: 'Clive Harrington',
      primaryPhone: '+27 83 991 2280',
      email: 'clive.h@harringtonlaw.co.za',
      postalAddress: '9 Richmond Road, Three Anchor Bay'
    },
    polygonPoints: [
      [640, 310],
      [710, 310],
      [710, 340],
      [640, 340]
    ]
  }
];

const SA_JOBURG_PROPERTIES: PropertyRecord[] = [
  {
    id: 'prop-sandton-101',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-8849201',
      url: 'https://www.property24.com/for-sale/sandhurst/sandton/gauteng/8849201',
      title: 'Ultra-Modern Contemporary Mansion in Sandhurst Enclosure',
      askingPrice: 24500000,
      headline: 'Architectural Masterpiece on 4,000m² Landscaped Grounds',
      description: 'Magnificent contemporary estate offering quadruple volume ceilings, smart-home automation, infinity pool, floodlit tennis court, and executive 4-car showroom garage.',
      keyFeatures: ['5 Luxury En-Suite Suites', 'Infinity Lap Pool', '4 Garages', 'Full Solar Backup', '24h Guarded Enclosure'],
      agentName: 'Jonathan Davies',
      agentAgency: 'Lew Geffen Sotheby’s Sandton',
      agentPhone: '+27 82 555 9012'
    },
    erfNo: '482',
    lpiCode: 'T0JR02410000048200000',
    deedsOffice: 'JOHANNESBURG',
    township: 'SANDHURST',
    address: '14 CORONATION ROAD',
    suburb: 'SANDHURST',
    municipality: 'CITY OF JOHANNESBURG',
    province: 'GAUTENG',
    gps: { lat: -26.1132, lng: 28.0378, formatted: '28.0378°E 26.1132°S' },
    extentM2: 3850,
    cadastralExtentM2: 3850,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'SR1',
    zoningDescription: 'Residential 1 (Low Density Luxury)',
    servitudes: false,
    currentSale: {
      owner: 'KHANYISA ASSET HOLDINGS (PTY) LTD',
      ownersId: '2018/192834/07',
      salePrice: 19800000,
      saleDate: '2019/04/12',
      registeredDate: '2019/08/25',
      titleDeed: 'T48910/2019',
      saleType: 'PRIVATE TREATY',
      bondHolder: 'FIRST NATIONAL BANK',
      bondAmount: 14000000
    },
    historicalSales: [],
    municipalValuation: {
      totalValue: 22000000,
      valuationYear: 2023,
      ratesEstimateMonthly: 9800
    },
    accommodation: {
      type: 'House (2 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Tennis Court, Showroom Garage, Full Solar Backup',
      bedRooms: 5,
      bathRooms: 5,
      garages: 4,
      pool: true
    },
    contacts: {
      representativeName: 'Thabo Mokoena',
      primaryPhone: '+27 82 770 4411',
      email: 'tmokoena@khanyisaholdings.co.za',
      postalAddress: '14 Coronation Road, Sandhurst, Sandton'
    },
    polygonPoints: [
      [480, 290],
      [600, 290],
      [600, 380],
      [480, 380]
    ]
  }
];

// -------------------------------------------------------------
// UNITED KINGDOM PROPERTIES (London, Manchester, Edinburgh)
// -------------------------------------------------------------
const UK_LONDON_PROPERTIES: PropertyRecord[] = [
  {
    id: 'prop-uk-lon-101',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'RM-88192039',
      url: 'https://www.rightmove.co.uk/properties/88192039',
      title: 'Stunning Grade II Listed Townhouse with Garden Square Access',
      askingPrice: 3850000,
      headline: 'Exquisite 4-Bed Victorian Residence in Royal Borough',
      description: 'Set along the prestigious tree-lined Cadogan Square, this impeccably restored freehold townhouse boasts ornate plaster cornicing, bespoke Boffi kitchen, private south-facing terrace, and communal garden rights.',
      keyFeatures: [
        '4 Double Bedrooms',
        'Private Mews Garage',
        'Communal Gardens Access',
        'Wine Cellar & Gym',
        'Freehold Tenure'
      ],
      agentName: 'Charles Montagu',
      agentAgency: 'Savills Knightsbridge',
      agentPhone: '+44 20 7591 8600'
    },
    erfNo: 'LN-78912',
    lpiCode: 'UK01-KENS-0078912',
    deedsOffice: 'HM LAND REGISTRY (LONDON)',
    township: 'ROYAL BOROUGH OF KENSINGTON & CHELSEA',
    address: '24 CADOGAN SQUARE',
    suburb: 'KNIGHTSBRIDGE & CHELSEA',
    municipality: 'GREATER LONDON AUTHORITY',
    province: 'ENGLAND',
    gps: { lat: 51.4988, lng: -0.1598, formatted: '0.1598°W 51.4988°N' },
    extentM2: 340,
    cadastralExtentM2: 340,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR3',
    zoningDescription: 'Conservation Area Class C3 Residential',
    servitudes: true,
    currentSale: {
      owner: 'LORD ALISTAIR HAMILTON',
      ownersId: 'PASSPORT-UK-789012',
      salePrice: 3200000,
      saleDate: '2017/06/15',
      registeredDate: '2017/08/20',
      titleDeed: 'BGL129840',
      saleType: 'PRIVATE TREATY',
      bondHolder: 'BARCLAYS PRIVATE BANK',
      bondAmount: 1800000
    },
    historicalSales: [],
    municipalValuation: {
      totalValue: 3500000,
      valuationYear: 2023,
      ratesEstimateMonthly: 1200
    },
    accommodation: {
      type: 'Townhouse (3 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Grade II Listed, Wine Cellar, Private Terrace',
      bedRooms: 4,
      bathRooms: 4,
      garages: 1,
      pool: false
    },
    contacts: {
      representativeName: 'Alistair Hamilton',
      primaryPhone: '+44 7700 900123',
      email: 'a.hamilton@mayfairholdings.co.uk',
      postalAddress: '24 Cadogan Square, Knightsbridge, London'
    },
    polygonPoints: [
      [510, 300],
      [580, 300],
      [580, 350],
      [510, 350]
    ]
  }
];

// -------------------------------------------------------------
// UNITED STATES PROPERTIES (Miami, Los Angeles, New York)
// -------------------------------------------------------------
const US_MIAMI_PROPERTIES: PropertyRecord[] = [
  {
    id: 'prop-us-mia-101',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'MLS-A11492019',
      url: 'https://www.zillow.com/homedetails/482-Ocean-Blvd-Miami-Beach-FL/11492019_zpid/',
      title: 'Waterfront Modern Villa with Private Yacht Dock in Venetian Islands',
      askingPrice: 8900000,
      headline: 'Ultra-Luxury Open-Bay Waterfront Living | 100ft Deep Water Mooring',
      description: 'Brand-new organic modern masterpiece on San Marino Island featuring seamless indoor-outdoor living, rooftop sunset terrace, infinity pool, count, and dockage for 80ft yacht.',
      keyFeatures: [
        '5 Bed / 6 Bath Waterfront Villa',
        '100ft Yacht Dockage',
        'Heated Saltwater Infinity Pool',
        'Rooftop Lounge with Skyline Views',
        'Gourmet Poliform Kitchen'
      ],
      agentName: 'Elena Vance',
      agentAgency: 'The Jills Zeder Group / Coldwell Banker',
      agentPhone: '+1 305 555 0192'
    },
    erfNo: 'APN-02-3214-009-0120',
    lpiCode: 'FL-MIA-DADE-0232140090120',
    deedsOffice: 'MIAMI-DADE COUNTY RECORDER OF DEEDS',
    township: 'VENETIAN ISLANDS (SAN MARINO)',
    address: '482 SAN MARINO DRIVE',
    suburb: 'MIAMI BEACH',
    municipality: 'MIAMI-DADE COUNTY',
    province: 'FLORIDA',
    gps: { lat: 25.7907, lng: -80.1586, formatted: '80.1586°W 25.7907°N' },
    extentM2: 980,
    cadastralExtentM2: 980,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'SR1',
    zoningDescription: 'Single Family Residential Coastal Waterfront',
    servitudes: false,
    currentSale: {
      owner: 'SAN MARINO PACIFIC VENTURES LLC',
      ownersId: 'FL-DOC-L190002198',
      salePrice: 6800000,
      saleDate: '2021/03/10',
      registeredDate: '2021/04/18',
      titleDeed: 'ORB-32890-PG-1102',
      saleType: 'PRIVATE TREATY',
      bondHolder: 'JPMORGAN CHASE BANK, N.A.',
      bondAmount: 4200000
    },
    historicalSales: [],
    municipalValuation: {
      totalValue: 7200000,
      valuationYear: 2024,
      ratesEstimateMonthly: 3100
    },
    accommodation: {
      type: 'House (2 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Private Yacht Dockage, Rooftop Terrace, Saltwater Pool',
      bedRooms: 5,
      bathRooms: 6,
      garages: 2,
      pool: true
    },
    contacts: {
      representativeName: 'Marcus Bennett',
      primaryPhone: '+1 305 890 2211',
      email: 'm.bennett@sanmarinopacific.com',
      postalAddress: '482 San Marino Drive, Miami Beach, FL'
    },
    polygonPoints: [
      [500, 310],
      [620, 310],
      [620, 400],
      [500, 400]
    ]
  }
];

// -------------------------------------------------------------
// AUSTRALIA PROPERTIES (Sydney, Melbourne, Brisbane)
// -------------------------------------------------------------
const AU_SYDNEY_PROPERTIES: PropertyRecord[] = [
  {
    id: 'prop-au-syd-101',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'DOM-991823',
      url: 'https://www.domain.com.au/property/point-piper-nsw-2027-991823',
      title: 'Harbourside Architectural Trophy Home with Panoramic Opera House Views',
      askingPrice: 12500000,
      headline: 'Prestigious Wolseley Road Enclave | Direct Deep-Water Access',
      description: 'An iconic harbourfront residence set in Sydney’s most elite position. Enjoy uninterrupted views across the Sydney Harbour Bridge, Opera House, and manicured private grounds.',
      keyFeatures: [
        '4 Luxury Bedroom Suites',
        'Private Harbourfront Pool & Jetty',
        'Internal Lift to All Levels',
        'Sub-Zero & Wolf Culinary Kitchen',
        'Double Lock-Up Garage + Turntable'
      ],
      agentName: 'Alexander Phillips',
      agentAgency: 'PPD Real Estate Sydney',
      agentPhone: '+61 2 9386 3400'
    },
    erfNo: 'Lot 14 / DP 589201',
    lpiCode: 'NSW-014-DP589201',
    deedsOffice: 'NSW LAND REGISTRY SERVICES',
    township: 'POINT PIPER',
    address: '68 WOLSELEY ROAD',
    suburb: 'POINT PIPER',
    municipality: 'WOOLLAHRA MUNICIPAL COUNCIL',
    province: 'NEW SOUTH WALES',
    gps: { lat: -33.8642, lng: 151.2514, formatted: '151.2514°E 33.8642°S' },
    extentM2: 740,
    cadastralExtentM2: 740,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'SR1',
    zoningDescription: 'R2 Low Density Residential Harbourside Heritage',
    servitudes: false,
    currentSale: {
      owner: 'WOLSELEY HARBOUR INVESTMENTS PTY LTD',
      ownersId: 'ACN 619 892 018',
      salePrice: 9900000,
      saleDate: '2020/09/14',
      registeredDate: '2020/11/02',
      titleDeed: 'CT-14/589201',
      saleType: 'PRIVATE TREATY',
      bondHolder: 'MACQUARIE BANK LIMITED',
      bondAmount: 6000000
    },
    historicalSales: [],
    municipalValuation: {
      totalValue: 11000000,
      valuationYear: 2023,
      ratesEstimateMonthly: 4100
    },
    accommodation: {
      type: 'House (3 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Private Deep-Water Jetty, Internal Lift, Opera House Views',
      bedRooms: 4,
      bathRooms: 4,
      garages: 2,
      pool: true
    },
    contacts: {
      representativeName: 'Lachlan Murdoch-Smith',
      primaryPhone: '+61 412 889 012',
      email: 'l.smith@wolseleyinv.com.au',
      postalAddress: '68 Wolseley Road, Point Piper NSW'
    },
    polygonPoints: [
      [510, 310],
      [610, 310],
      [610, 390],
      [510, 390]
    ]
  }
];

// -------------------------------------------------------------
// UAE PROPERTIES (Dubai, Abu Dhabi)
// -------------------------------------------------------------
const UAE_DUBAI_PROPERTIES: PropertyRecord[] = [
  {
    id: 'prop-uae-dxb-101',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'PF-DXB-881920',
      url: 'https://www.propertyfinder.ae/en/buy/villa-for-sale-dubai-palm-jumeirah-881920.html',
      title: 'Ultra-Luxury Signature Beachfront Villa with Private Beach',
      askingPrice: 38000000,
      headline: 'Iconic Palm Jumeirah Frond Living | Royal Atlantis Sunset Vistas',
      description: 'Magnificent custom-built contemporary villa directly situated on Frond N of Palm Jumeirah. Enjoy a private infinity pool, landscaped private beach frontage, bespoke Italian marble, and private staff quarters.',
      keyFeatures: [
        '6 En-Suite Bedrooms',
        'Private White Sand Beach Frontage',
        'Private Swimming Pool & Jacuzzi',
        'Smart Home Automation (Crestron)',
        'Full Burj Al Arab Views'
      ],
      agentName: 'Tariq Mansoor',
      agentAgency: 'Luxhabitat Sotheby’s International',
      agentPhone: '+971 4 455 0888'
    },
    erfNo: 'PLOT-PJ-FROND-N-18',
    lpiCode: 'DXB-PJ-0018-FREEHOLD',
    deedsOffice: 'DUBAI LAND DEPARTMENT (DLD)',
    township: 'PALM JUMEIRAH (FRONDS)',
    address: 'VILLA 18, FROND N, PALM JUMEIRAH',
    suburb: 'PALM JUMEIRAH',
    municipality: 'DUBAI MUNICIPALITY',
    province: 'EMIRATE OF DUBAI',
    gps: { lat: 25.1124, lng: 55.1389, formatted: '55.1389°E 25.1124°N' },
    extentM2: 1250,
    cadastralExtentM2: 1250,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR1',
    zoningDescription: 'DLD Freehold Master Community Residential',
    servitudes: false,
    currentSale: {
      owner: 'AL-MAKTOUM INVESTMENTS FZE',
      ownersId: 'DLD-DEED-2022-88192',
      salePrice: 31000000,
      saleDate: '2022/04/18',
      registeredDate: '2022/05/10',
      titleDeed: 'TD-DXB-991823/2022',
      saleType: 'PRIVATE TREATY',
      bondHolder: 'EMIRATES NBD',
      bondAmount: 18000000
    },
    historicalSales: [],
    municipalValuation: {
      totalValue: 33000000,
      valuationYear: 2024,
      ratesEstimateMonthly: 8500
    },
    accommodation: {
      type: 'House (2 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Private Beach Frontage, Crestron Automation, Full Burj Al Arab Views',
      bedRooms: 6,
      bathRooms: 7,
      garages: 3,
      pool: true
    },
    contacts: {
      representativeName: 'Rashid Al-Hassan',
      primaryPhone: '+971 50 891 2200',
      email: 'r.alhassan@almaktoumfze.ae',
      postalAddress: 'Villa 18, Frond N, Palm Jumeirah, Dubai'
    },
    polygonPoints: [
      [520, 310],
      [650, 310],
      [650, 420],
      [520, 420]
    ]
  }
];

// -------------------------------------------------------------
// COMPLETE GLOBAL JURISDICTIONS DATASET
// -------------------------------------------------------------
const DETAILED_PRIMARY_COUNTRIES: CountryOption[] = [
  {
    id: 'ZA',
    name: 'South Africa',
    code: 'ZA',
    flag: '🇿🇦',
    currency: {
      code: 'ZAR',
      symbol: 'R',
      name: 'South African Rand'
    },
    landRegistryAuthority: 'Deeds Registry of South Africa (DALRRD)',
    legalIdentifierName: 'Erf / LPI Code',
    provincesOrStatesLabel: 'Provinces',
    citiesLabel: 'Cities / Metropolitan Municipalities',
    phoneDialCode: '+27',
    phonePlaceholder: '082 890 3863',
    idNumberPlaceholder: '13-Digit National ID or Passport Number',
    idFormatHint: 'Format: 8303305103087 or Foreign Passport',
    regulatoryBody: 'Property Practitioners Regulatory Authority (PPRA / EAAB)',
    ffcLicenseName: 'PPRA / EAAB Fidelity Fund Certificate (FFC)',
    ffcLicensePlaceholder: '20241098234 (Fidelity Fund Certificate)',
    statutoryAct: 'Property Practitioners Act 22 of 2019 (PPA) Section 47',
    regulatoryRequirements: 'Every practicing real estate practitioner (Principal, Non-Principal, or Candidate) must hold a valid Fidelity Fund Certificate (FFC) issued annually by the PPRA. Practicing without a valid FFC is illegal under Section 48 and prohibits claiming commission. Practitioners must maintain compliant trust account audits and log annual CPD (Continuing Professional Development) points.',
    licenseFormatDescription: '11-Digit Numeric Certificate Number (e.g. 20241098234) issued following NQF 4/5 PDE examination.',
    renewalCycle: 'Annual renewal required before October 31st for the subsequent calendar year.',
    trustAccountObligation: 'Section 54 Audited Trust Account with designated banking institution and annual Independent Auditor Report submission.',
    defaultDateFormat: 'YYYY/MM/DD',
    defaultUnit: 'Metric (m²)',
    complianceAuthorityName: 'PPRA & FICA (Financial Intelligence Centre Act)',
    agentTypeOptions: [
      'Principal Property Practitioner (PPRA)',
      'Non-Principal Property Practitioner (PPRA)',
      'Candidate Property Practitioner (Intern FFC)',
      'Master Practitioner in Real Estate (MPRE)'
    ],
    majorPortals: [
      { name: 'Property24', url: 'https://www.property24.com' },
      { name: 'Private Property', url: 'https://www.privateproperty.co.za' }
    ],
    provinces: [
      {
        id: 'WC',
        name: 'Western Cape',
        code: 'WC',
        cities: [
          {
            id: 'CPT',
            name: 'City of Cape Town (Atlantic Seaboard & City Bowl)',
            suburbs: ['Three Anchor Bay', 'Green Point', 'Sea Point', 'Camps Bay', 'Clifton', 'Bantry Bay', 'Fresnaye', 'Constantia'],
            deedsOffice: 'CAPE TOWN DEEDS OFFICE',
            municipality: 'City of Cape Town Metropolitan Municipality',
            coordinates: { lat: -33.90876, lng: 18.401027, zoom: 16 },
            properties: SA_CAPE_TOWN_PROPERTIES
          },
          {
            id: 'STELL',
            name: 'Stellenbosch & Winelands',
            suburbs: ['Stellenbosch Central', 'Franschhoek', 'Paarl Val de Vie'],
            deedsOffice: 'CAPE TOWN DEEDS OFFICE',
            municipality: 'Stellenbosch Municipality',
            coordinates: { lat: -33.9321, lng: 18.8602, zoom: 15 },
            properties: SA_CAPE_TOWN_PROPERTIES
          }
        ]
      },
      {
        id: 'GP',
        name: 'Gauteng',
        code: 'GP',
        cities: [
          {
            id: 'JHB',
            name: 'City of Johannesburg (Sandton / Rosebank / Bryanston)',
            suburbs: ['Sandhurst', 'Bryanston', 'Rosebank', 'Hyde Park', 'Houghton'],
            deedsOffice: 'JOHANNESBURG DEEDS OFFICE',
            municipality: 'City of Johannesburg Metropolitan Municipality',
            coordinates: { lat: -26.1132, lng: 28.0378, zoom: 16 },
            properties: SA_JOBURG_PROPERTIES
          },
          {
            id: 'PTA',
            name: 'City of Tshwane (Pretoria East / Waterkloof)',
            suburbs: ['Waterkloof', 'Brooklyn', 'Menlyn', 'Lynnwood'],
            deedsOffice: 'PRETORIA DEEDS OFFICE',
            municipality: 'City of Tshwane Metropolitan Municipality',
            coordinates: { lat: -25.7725, lng: 28.2411, zoom: 15 },
            properties: SA_JOBURG_PROPERTIES
          }
        ]
      },
      {
        id: 'KZN',
        name: 'KwaZulu-Natal',
        code: 'KZN',
        cities: [
          {
            id: 'DBN',
            name: 'eThekwini (Umhlanga Rocks / Durban North)',
            suburbs: ['Umhlanga Rocks', 'Durban North', 'Morningside', 'Ballito'],
            deedsOffice: 'PIETERMARITZBURG DEEDS OFFICE',
            municipality: 'eThekwini Metropolitan Municipality',
            coordinates: { lat: -29.7285, lng: 31.0844, zoom: 15 },
            properties: SA_CAPE_TOWN_PROPERTIES
          }
        ]
      }
    ]
  },
  {
    id: 'GB',
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    currency: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound Sterling'
    },
    landRegistryAuthority: 'HM Land Registry (England & Wales) / Registers of Scotland',
    legalIdentifierName: 'HM Title Number & UPRN',
    provincesOrStatesLabel: 'Nations / Counties',
    citiesLabel: 'Cities / Greater London Boroughs',
    phoneDialCode: '+44',
    phonePlaceholder: '07911 123456',
    idNumberPlaceholder: 'National Insurance (NI) / Passport Number',
    idFormatHint: 'Format: QQ 12 34 56 A or UK Passport No.',
    regulatoryBody: 'NAEA Propertymark & RICS (Royal Institution of Chartered Surveyors)',
    ffcLicenseName: 'RICS Membership / NAEA Registration #',
    ffcLicensePlaceholder: 'RICS-884920 / MNAEA-49201',
    statutoryAct: 'Estate Agents Act 1979 & Consumer Protection from Unfair Trading Regulations (CPRs)',
    regulatoryRequirements: 'Estate agents operating in the UK must register with an approved redress scheme (The Property Ombudsman - TPO or Property Redress Scheme - PRS), maintain HMRC Anti-Money Laundering supervision, and hold mandatory Client Money Protection (CMP). Professional designations require certified RICS or NAEA Propertymark registration.',
    licenseFormatDescription: 'RICS-[6-digit Member #] (e.g. RICS-884920) or MNAEA-[5-digit #] / Redress Scheme ID.',
    renewalCycle: 'Annual professional membership renewal with mandatory 20+ hours of verifiable CPD.',
    trustAccountObligation: 'Mandatory ring-fenced Client Account protected by statutory Client Money Protection (CMP) insurance.',
    defaultDateFormat: 'DD/MM/YYYY',
    defaultUnit: 'Metric (m²)',
    complianceAuthorityName: 'NAEA Propertymark & Money Laundering Regs (MLR)',
    agentTypeOptions: [
      'Chartered Surveyor (MRICS / FRICS)',
      'Licensed Estate Agent (MNAEA Propertymark)',
      'Senior Residential Valuer & Branch Director',
      'Commercial Property Consultant'
    ],
    majorPortals: [
      { name: 'Rightmove UK', url: 'https://www.rightmove.co.uk' },
      { name: 'Zoopla', url: 'https://www.zoopla.co.uk' },
      { name: 'OnTheMarket', url: 'https://www.onthemarket.com' }
    ],
    provinces: [
      {
        id: 'ENG-LON',
        name: 'Greater London (England)',
        code: 'LON',
        cities: [
          {
            id: 'LON-KENS',
            name: 'Royal Borough of Kensington & Chelsea / Westminster',
            suburbs: ['Knightsbridge', 'Mayfair', 'Chelsea', 'Kensington', 'Belgravia'],
            deedsOffice: 'HM LAND REGISTRY (LONDON REGISTRY)',
            municipality: 'Royal Borough of Kensington and Chelsea',
            coordinates: { lat: 51.4988, lng: -0.1598, zoom: 16 },
            properties: UK_LONDON_PROPERTIES
          }
        ]
      },
      {
        id: 'ENG-MAN',
        name: 'Greater Manchester (England)',
        code: 'MAN',
        cities: [
          {
            id: 'MAN-CITY',
            name: 'City of Manchester (Deansgate / Didsbury)',
            suburbs: ['Deansgate', 'Castlefield', 'Didsbury', 'Salford Quays'],
            deedsOffice: 'HM LAND REGISTRY (NORTH WEST)',
            municipality: 'Manchester City Council',
            coordinates: { lat: 53.4808, lng: -2.2426, zoom: 15 },
            properties: UK_LONDON_PROPERTIES
          }
        ]
      },
      {
        id: 'SCO-EDI',
        name: 'Midlothian (Scotland)',
        code: 'EDI',
        cities: [
          {
            id: 'EDI-CITY',
            name: 'City of Edinburgh (New Town / Stockbridge)',
            suburbs: ['New Town', 'Stockbridge', 'Old Town', 'Morningside'],
            deedsOffice: 'REGISTERS OF SCOTLAND (RoS)',
            municipality: 'City of Edinburgh Council',
            coordinates: { lat: 55.9533, lng: -3.1883, zoom: 15 },
            properties: UK_LONDON_PROPERTIES
          }
        ]
      }
    ]
  },
  {
    id: 'US',
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    currency: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar'
    },
    landRegistryAuthority: 'County Recorder of Deeds / Municipal GIS Cadastre',
    legalIdentifierName: 'Assessor Parcel Number (APN)',
    provincesOrStatesLabel: 'States',
    citiesLabel: 'Cities / Metropolitan Counties',
    phoneDialCode: '+1',
    phonePlaceholder: '(305) 555-0199',
    idNumberPlaceholder: 'SSN / State ID or Passport Number',
    idFormatHint: 'Format: 9-Digit SSN or US Passport No.',
    regulatoryBody: 'California Department of Real Estate (DRE) / State Commission',
    ffcLicenseName: 'DRE / State Real Estate Broker License #',
    ffcLicensePlaceholder: 'DRE# 02194821 / FREC-BK3489201',
    statutoryAct: 'State Real Estate Licensing Acts (e.g. CA Business & Professions Code § 10150, FL Statutes Ch. 475)',
    regulatoryRequirements: 'Real estate brokers and salespersons must hold an active license issued by their state regulatory commission (such as California DRE, Florida FREC, Texas TREC, or NY DOS). Requires accredited pre-licensing courses, passing state examinations, background fingerprint clearance, and active broker sponsorship.',
    licenseFormatDescription: '8-Digit DRE License Number (e.g. 02194821) or State Prefix + Alphanumeric ID (e.g. FREC-BK3489201).',
    renewalCycle: '2 to 4-year renewal cycle with mandatory 18–45 hours of Continuing Education (CE).',
    trustAccountObligation: 'Designated Real Estate Broker Escrow / Trust Account subject to state unannounced audits.',
    defaultDateFormat: 'MM/DD/YYYY',
    defaultUnit: 'Imperial (sq ft)',
    complianceAuthorityName: 'FinCEN Real Estate Compliance & State Licensing',
    agentTypeOptions: [
      'Licensed Real Estate Broker (DRE / Commission)',
      'Licensed Real Estate Salesperson',
      'Realtor® / Associate Managing Broker',
      'Commercial Investment Specialist (CCIM)'
    ],
    majorPortals: [
      { name: 'Zillow', url: 'https://www.zillow.com' },
      { name: 'Realtor.com', url: 'https://www.realtor.com' },
      { name: 'Redfin', url: 'https://www.redfin.com' }
    ],
    provinces: [
      {
        id: 'FL',
        name: 'Florida',
        code: 'FL',
        cities: [
          {
            id: 'MIA',
            name: 'Miami Beach & Venetian Islands (Miami-Dade County)',
            suburbs: ['Venetian Islands', 'South Beach', 'Brickell', 'Coral Gables', 'Palm Beach'],
            deedsOffice: 'MIAMI-DADE COUNTY RECORDER OF DEEDS',
            municipality: 'City of Miami Beach / Miami-Dade County',
            coordinates: { lat: 25.7907, lng: -80.1586, zoom: 16 },
            properties: US_MIAMI_PROPERTIES
          }
        ]
      },
      {
        id: 'CA',
        name: 'California',
        code: 'CA',
        cities: [
          {
            id: 'LAX',
            name: 'Los Angeles (Beverly Hills / Malibu / Santa Monica)',
            suburbs: ['Beverly Hills', 'Bel Air', 'Brentwood', 'Malibu', 'Santa Monica'],
            deedsOffice: 'LA COUNTY REGISTRAR-RECORDER',
            municipality: 'City of Los Angeles / Beverly Hills',
            coordinates: { lat: 34.0736, lng: -118.4004, zoom: 15 },
            properties: US_MIAMI_PROPERTIES
          }
        ]
      },
      {
        id: 'NY',
        name: 'New York',
        code: 'NY',
        cities: [
          {
            id: 'NYC',
            name: 'New York City (Manhattan & Brooklyn)',
            suburbs: ['Upper East Side', 'Tribeca', 'SoHo', 'West Village', 'Brooklyn Heights'],
            deedsOffice: 'NYC ACRIS (CITY REGISTER)',
            municipality: 'City of New York',
            coordinates: { lat: 40.7736, lng: -73.9632, zoom: 15 },
            properties: US_MIAMI_PROPERTIES
          }
        ]
      },
      {
        id: 'TX',
        name: 'Texas',
        code: 'TX',
        cities: [
          {
            id: 'ATX',
            name: 'Austin (Travis County)',
            suburbs: ['Downtown Austin', 'Westlake Hills', 'Zilker', 'Barton Creek'],
            deedsOffice: 'TRAVIS COUNTY CLERK',
            municipality: 'City of Austin',
            coordinates: { lat: 30.2672, lng: -97.7431, zoom: 15 },
            properties: US_MIAMI_PROPERTIES
          }
        ]
      }
    ]
  },
  {
    id: 'AU',
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    currency: {
      code: 'AUD',
      symbol: 'A$',
      name: 'Australian Dollar'
    },
    landRegistryAuthority: 'State Land Titles Offices (NSW LRS / Landgate / VicLand)',
    legalIdentifierName: 'Lot / Deposited Plan (DP)',
    provincesOrStatesLabel: 'States & Territories',
    citiesLabel: 'Cities / Local Government Areas',
    phoneDialCode: '+61',
    phonePlaceholder: '0412 345 678',
    idNumberPlaceholder: 'Driver Licence / Passport Number',
    idFormatHint: 'Format: NSW DL 12345678 or Passport',
    regulatoryBody: 'NSW Fair Trading & Real Estate Institute of Australia (REIA)',
    ffcLicenseName: 'Real Estate Agent Licence (Fair Trading / REIA)',
    ffcLicensePlaceholder: 'LIC-20491823 (Class 1 Agent)',
    statutoryAct: 'Property and Stock Agents Act 2002 (NSW) / Estate Agents Act 1980 (VIC)',
    regulatoryRequirements: 'Real estate agents must hold a valid Class 1 (Licensee-in-Charge) or Class 2 qualification issued by state fair trading authorities (e.g. NSW Fair Trading, Consumer Affairs Victoria). Requires Certificate IV/Diploma in Real Estate Practice, annual CPD completion, and strict AUSTRAC AML reporting.',
    licenseFormatDescription: 'LIC-[8-digit License #] (e.g. LIC-20491823) or State Registration ID.',
    renewalCycle: 'Annual or 3-year license renewal with mandatory annual CPD modules.',
    trustAccountObligation: 'Statutory trust account audited annually by an independent registered company auditor within 3 months of audit year-end.',
    defaultDateFormat: 'DD/MM/YYYY',
    defaultUnit: 'Metric (m²)',
    complianceAuthorityName: 'AUSTRAC AML/CTF & Fair Trading Regulations',
    agentTypeOptions: [
      'Licensed Real Estate Agent (Class 1)',
      'Registered Assistant Agent (Class 2)',
      'Principal Licensee / Agency Director',
      'Accredited Property Valuer & Auctioneer'
    ],
    majorPortals: [
      { name: 'Domain.com.au', url: 'https://www.domain.com.au' },
      { name: 'Realestate.com.au', url: 'https://www.realestate.com.au' }
    ],
    provinces: [
      {
        id: 'NSW',
        name: 'New South Wales',
        code: 'NSW',
        cities: [
          {
            id: 'SYD',
            name: 'Sydney (Eastern Suburbs & Harbourside)',
            suburbs: ['Point Piper', 'Double Bay', 'Paddington', 'Mosman', 'Bondi Beach'],
            deedsOffice: 'NSW LAND REGISTRY SERVICES',
            municipality: 'Woollahra Municipal Council',
            coordinates: { lat: -33.8642, lng: 151.2514, zoom: 16 },
            properties: AU_SYDNEY_PROPERTIES
          }
        ]
      },
      {
        id: 'VIC',
        name: 'Victoria',
        code: 'VIC',
        cities: [
          {
            id: 'MEL',
            name: 'Melbourne (Inner East / Toorak / South Yarra)',
            suburbs: ['Toorak', 'South Yarra', 'Brighton', 'East Melbourne'],
            deedsOffice: 'LAND USE VICTORIA (LUV)',
            municipality: 'City of Stonnington',
            coordinates: { lat: -37.8415, lng: 145.0118, zoom: 15 },
            properties: AU_SYDNEY_PROPERTIES
          }
        ]
      }
    ]
  },
  {
    id: 'AE',
    name: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    currency: {
      code: 'AED',
      symbol: 'AED',
      name: 'UAE Dirham'
    },
    landRegistryAuthority: 'Dubai Land Department (DLD) / Oqood Registry',
    legalIdentifierName: 'Title Deed Number & Makani',
    provincesOrStatesLabel: 'Emirates',
    citiesLabel: 'Master Communities / Freehold Zones',
    phoneDialCode: '+971',
    phonePlaceholder: '050 123 4567',
    idNumberPlaceholder: 'Emirates ID / Passport Number',
    idFormatHint: 'Format: 784-1983-1234567-1 or Passport',
    regulatoryBody: 'Real Estate Regulatory Agency (RERA / Dubai Land Department)',
    ffcLicenseName: 'RERA Broker ID (BRN) / DLD License',
    ffcLicensePlaceholder: 'BRN-48920 / ORN-29182',
    statutoryAct: 'Dubai Law No. 85 of 2006 (Regulating the Real Estate Brokers Register in the Emirate of Dubai)',
    regulatoryRequirements: 'All real estate brokers operating in Dubai and the UAE must hold an active Broker Registration Number (BRN) issued by RERA under the Dubai Land Department (DLD). Agents must pass the DREI certified exam, hold valid residency, operate under a licensed brokerage (ORN), and obtain electronic Trakheesi permits for listing advertisements.',
    licenseFormatDescription: 'BRN-[5-digit Broker ID] (e.g. BRN-48920) or ORN-[5-digit Office Registration Number] (e.g. ORN-29182).',
    renewalCycle: 'Annual renewal via DLD REST / Trakheesi portal subject to mandatory CPD modules and police clearance.',
    trustAccountObligation: 'Project Escrow Accounts supervised directly by the Dubai Land Department (DLD) Escrow Accounts Department.',
    defaultDateFormat: 'DD/MM/YYYY',
    defaultUnit: 'Metric (m²)',
    complianceAuthorityName: 'RERA & UAE Anti-Money Laundering (AML) Compliance',
    agentTypeOptions: [
      'RERA Certified Real Estate Broker (BRN)',
      'RERA Registered Property Consultant',
      'Commercial Real Estate Broker (DED)',
      'Managing Broker / Agency Director (ORN)'
    ],
    majorPortals: [
      { name: 'Property Finder UAE', url: 'https://www.propertyfinder.ae' },
      { name: 'Bayut', url: 'https://www.bayut.com' }
    ],
    provinces: [
      {
        id: 'DXB',
        name: 'Emirate of Dubai',
        code: 'DXB',
        cities: [
          {
            id: 'DXB-PALM',
            name: 'Palm Jumeirah & Dubai Marina Freehold',
            suburbs: ['Palm Jumeirah Fronds', 'Downtown Dubai', 'Dubai Marina', 'Emirates Hills'],
            deedsOffice: 'DUBAI LAND DEPARTMENT (DLD)',
            municipality: 'Dubai Municipality',
            coordinates: { lat: 25.1124, lng: 55.1389, zoom: 16 },
            properties: UAE_DUBAI_PROPERTIES
          }
        ]
      },
      {
        id: 'AUH',
        name: 'Emirate of Abu Dhabi',
        code: 'AUH',
        cities: [
          {
            id: 'AUH-SAAD',
            name: 'Saadiyat & Yas Island (Abu Dhabi)',
            suburbs: ['Saadiyat Island', 'Yas Island', 'Al Reem Island'],
            deedsOffice: 'ABU DHABI REAL ESTATE CENTRE (ADREC)',
            municipality: 'Abu Dhabi City Municipality',
            coordinates: { lat: 24.5385, lng: 54.4342, zoom: 15 },
            properties: UAE_DUBAI_PROPERTIES
          }
        ]
      }
    ]
  }
];

// Merge detailed primary countries with full 196 global countries catalog
const all196List = generateAll196CountryOptions();

// Create map of detailed countries to preserve full multi-province & property structures
const detailedMap = new Map<string, CountryOption>();
DETAILED_PRIMARY_COUNTRIES.forEach((c) => detailedMap.set(c.id, c));

// Combine: prioritized South Africa, followed by all countries sorted alphabetically
const remainingAll = all196List.filter((c) => !detailedMap.has(c.id));
const combined = [...DETAILED_PRIMARY_COUNTRIES, ...remainingAll];

// Sort: Keep South Africa first as default, then sort alphabetically by name
export const GLOBAL_COUNTRIES_DATA: CountryOption[] = [
  combined.find(c => c.id === 'ZA') || combined[0],
  ...combined.filter(c => c.id !== 'ZA').sort((a, b) => a.name.localeCompare(b.name))
];

export function getJurisdictionByCode(countryCode: string, provinceCode?: string, cityId?: string) {
  const country = GLOBAL_COUNTRIES_DATA.find(c => c.id === countryCode) || GLOBAL_COUNTRIES_DATA[0];
  const province = country.provinces?.find(p => p.id === provinceCode) || country.provinces?.[0] || {
    id: `${country.id}-PROV-1`,
    name: `${country.name} National Region`,
    code: `${country.id}-1`,
    cities: []
  };
  const city = province.cities?.find(c => c.id === cityId) || province.cities?.[0] || {
    id: `${country.id}-CITY-1`,
    name: `${country.name} Main District`,
    suburbs: [],
    deedsOffice: country.landRegistryAuthority || 'CENTRAL REGISTRY',
    municipality: `Municipality of ${country.name}`,
    coordinates: { lat: 0, lng: 0, zoom: 14 },
    properties: []
  };
  return { country, province, city };
}
