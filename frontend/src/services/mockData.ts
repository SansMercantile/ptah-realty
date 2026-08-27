import { PropertyRecord, SuburbStatistics, ProspectLead, ProspectScript, KYCReportRecord } from '../types';

export const SUBURBS_LIST = [
  'GREEN POINT, CITY OF CAPE TOWN',
  'THREE ANCHOR BAY, CITY OF CAPE TOWN',
  'SEA POINT EAST, CITY OF CAPE TOWN',
  'SEA POINT WEST, CITY OF CAPE TOWN',
  'FRESNAYE, CITY OF CAPE TOWN',
  'BANTRY BAY, CITY OF CAPE TOWN',
  'CLIFTON, CITY OF CAPE TOWN',
  'CAMPS BAY, CITY OF CAPE TOWN',
  'MOUILLE POINT, CITY OF CAPE TOWN',
  'V&A WATERFRONT, CITY OF CAPE TOWN',
  'CAPE TOWN CBD, CITY OF CAPE TOWN',
  'ORANJEZICHT, CITY OF CAPE TOWN',
  'TAMBOERSKLOOF, CITY OF CAPE TOWN',
  'HIGGOVALE, CITY OF CAPE TOWN',
  'RONDEBOSCH, CITY OF CAPE TOWN',
  'NEWLANDS, CITY OF CAPE TOWN',
  'CONSTANTIA, CITY OF CAPE TOWN'
];

export const SUBURB_GROUPS: Record<string, string[]> = {
  'Atlantic Seaboard Prime': ['GREEN POINT, CITY OF CAPE TOWN', 'THREE ANCHOR BAY, CITY OF CAPE TOWN', 'SEA POINT EAST, CITY OF CAPE TOWN', 'FRESNAYE, CITY OF CAPE TOWN', 'BANTRY BAY, CITY OF CAPE TOWN', 'CLIFTON, CITY OF CAPE TOWN', 'CAMPS BAY, CITY OF CAPE TOWN'],
  'Cape Town City Bowl': ['CAPE TOWN CBD, CITY OF CAPE TOWN', 'ORANJEZICHT, CITY OF CAPE TOWN', 'TAMBOERSKLOOF, CITY OF CAPE TOWN', 'HIGGOVALE, CITY OF CAPE TOWN'],
  'Southern Suburbs Prestige': ['RONDEBOSCH, CITY OF CAPE TOWN', 'NEWLANDS, CITY OF CAPE TOWN', 'CONSTANTIA, CITY OF CAPE TOWN']
};

export const PROVINCES_LIST = [
  'WESTERN CAPE',
  'GAUTENG',
  'KWAZULU-NATAL',
  'EASTERN CAPE',
  'FREE STATE',
  'LIMPOPO',
  'MPUMALANGA',
  'NORTH WEST',
  'NORTHERN CAPE'
];

export const PROPERTIES_DATA: PropertyRecord[] = [
  {
    id: 'prop-1681',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-11849201",
      "url": "https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11849201",
      "title": "Architectural 3-Bed Heritage Home with Plunge Pool",
      "askingPrice": 7750000,
      "headline": "Sensational Three Anchor Bay Sanctuary | Seamless Indoor-Outdoor Flow",
      "description": "Nestled on coveted Richmond Road, this meticulously updated 3-bedroom Victorian residence combines classical period elegance with contemporary Atlantic Seaboard luxury. Features high ceilings, gourmet chef kitchen, and private plunge pool courtyard.",
      "keyFeatures": [
            "3 En-Suite Bedrooms",
            "Plunge Pool & Deck",
            "Secure Garage with Direct Access",
            "Solar Inverter Backup Ready",
            "Walk to Sea Point Promenade"
      ],
      "agentName": "Sarah Jenkins",
      "agentAgency": "Sotheby’s International Realty",
      "agentPhone": "+27 82 491 8820",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '1681',
    lpiCode: 'C01600210000168100000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '5 RICHMOND ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.90876,
      lng: 18.401027,
      formatted: "18.401027°E 33.90876°S"
    },
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
      bondHolder: undefined,
      bondAmount: 0,
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 82 491 8820',
        secondaryPhone: '+27 21 434 2200',
        email: 'piermane.trust@capeproperty.co.za',
        secondaryEmail: 'trustees@piermane.co.za',
        representativeName: 'Dr. Michael Pier (Trustee)',
        postalAddress: 'P.O. Box 44102, Sea Point, 8060',
        preferredChannel: 'PHONE',
        verifiedStatus: 'VERIFIED',
        lastContactedDate: '2026-08-10',
        notes: 'Owner is interested in an updated individual AI CMA report. Best to call before 11am.'
      }
    },
    contacts: {
      primaryPhone: '+27 82 491 8820',
      secondaryPhone: '+27 21 434 2200',
      email: 'piermane.trust@capeproperty.co.za',
      secondaryEmail: 'trustees@piermane.co.za',
      representativeName: 'Dr. Michael Pier (Trustee)',
      postalAddress: 'P.O. Box 44102, Sea Point, 8060',
      preferredChannel: 'PHONE',
      verifiedStatus: 'VERIFIED',
      lastContactedDate: '2026-08-10',
      notes: 'Owner is interested in an updated individual AI CMA report. Best to call before 11am.'
    },
    historicalSales: [
      {
        owner: 'VAN DER MERWE ESTATES CC',
        ownersId: '1998/023190/23',
        salePrice: 950000,
        saleDate: '2001/03/15',
        registeredDate: '2001/06/10',
        titleDeed: 'T32104/2001',
        bondHolder: 'STANDARD BANK OF SA LTD',
        bondAmount: 760000,
        saleType: 'PRIVATE TREATY'
      }
    ],
    municipalValuation: {
      totalValue: 6200000,
      valuationYear: 2025,
      ratesEstimateMonthly: 3338.51,
      landValue: 3800000,
      improvementsValue: 2400000
    },
    accommodation: {
      type: 'Cluster house (2 storey)',
      usage: 'Residential',
      condition: 'GOOD',
      specialFeatures: 'High ceilings, Victorian facade, renovated open plan kitchen, courtyard plunge pool.',
      smallerThanAverage: false,
      largerThanAverage: true,
      age: 101,
      buildingM2: 227,
      bedRooms: 3,
      receptionRms: 2,
      study: 1,
      bathRooms: 2,
      enSuite: 1,
      dommAccom: 0,
      garages: 1,
      pBaysCPorts: 1,
      alarm: true,
      perimSecurity: true,
      pool: true,
      garden: true,
      sprinklerSys: true,
      borehole: false,
      outsideAccom: false,
      tennisCourt: false
    },
    polygonPoints: [
      [500, 310],
      [570, 310],
      [570, 340],
      [500, 340]
    ]
  },
  {
    id: 'prop-2093',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-10029381",
      "url": "https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/10029381",
      "title": "Trophy Main Road High-Density Redevelopment Site",
      "askingPrice": 350000000,
      "headline": "Unparalleled Atlantic Seaboard Commercial / Residential Footprint",
      "description": "Major mixed-use residential development parcel with 1,441m² site extent and GR5 high-density zoning envelope. Unmatched location with sea views from upper levels.",
      "keyFeatures": [
            "1,441 m² Extent",
            "GR5 Zoning",
            "Underground Parking for 42 Bays",
            "Full Title Block",
            "High Rental Yield Profile"
      ],
      "agentName": "Gregory Smith",
      "agentAgency": "Knight Frank Commercial",
      "agentPhone": "+27 83 555 9012",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '2093',
    lpiCode: 'C01600210000209300000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '219 MAIN ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.908386,
      lng: 18.399577,
      formatted: "18.399577°E 33.908386°S"
    },
    extentM2: 1441,
    cadastralExtentM2: 1441,
    category: 'Commercial',
    usage: 'Block of Flats',
    zoning: 'GR5',
    zoningDescription: 'General Residential 5',
    servitudes: false,
    currentSale: {
      owner: 'S B G REAL ESTATE PTY LTD',
      ownersId: '201733710907',
      salePrice: 350000000,
      saleDate: '2025/11/07',
      registeredDate: '2026/05/18',
      titleDeed: 'T29887/2026',
      bondHolder: 'A B S A BANK LTD',
      bondAmount: 500000000,
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 83 555 9012',
        secondaryPhone: '+27 21 425 8000',
        email: 'investments@sbgrealestate.co.za',
        secondaryEmail: 'greg.smith@sbgcapetown.co.za',
        representativeName: 'Gregory Smith (Managing Director)',
        postalAddress: 'Suite 401, The Terraces, 34 Bree St, Cape Town',
        preferredChannel: 'EMAIL',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 83 555 9012',
      secondaryPhone: '+27 21 425 8000',
      email: 'investments@sbgrealestate.co.za',
      secondaryEmail: 'greg.smith@sbgcapetown.co.za',
      representativeName: 'Gregory Smith (Managing Director)',
      postalAddress: 'Suite 401, The Terraces, 34 Bree St, Cape Town',
      preferredChannel: 'EMAIL',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 245000000,
      valuationYear: 2025,
      ratesEstimateMonthly: 128450.00,
      landValue: 120000000,
      improvementsValue: 125000000
    },
    accommodation: {
      type: 'Block of flats',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Multi-level development block with prime frontage on Main Road, underground parking for 42 vehicles, backup power generator.',
      smallerThanAverage: false,
      largerThanAverage: true,
      age: 4,
      buildingM2: 4200,
      bedRooms: 28,
      receptionRms: 12,
      study: 4,
      bathRooms: 32,
      enSuite: 28,
      dommAccom: 4,
      garages: 42,
      pBaysCPorts: 10,
      alarm: true,
      perimSecurity: true,
      pool: true,
      garden: true,
      sprinklerSys: true,
      borehole: true,
      outsideAccom: true,
      tennisCourt: false
    },
    polygonPoints: [
      [240, 230],
      [340, 220],
      [350, 340],
      [250, 350]
    ]
  },
  {
    id: 'prop-1797',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-11294801",
      "url": "https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11294801",
      "title": "Romantic 3-Bed Freehold Cottage with Signal Hill Views",
      "askingPrice": 6850000,
      "headline": "Rare Freehold Opportunity in Quiet Coastal Cul-de-Sac",
      "description": "Charming 3-bedroom, 2-bathroom double-storey Victorian cottage at 1 Law Road. Features original Oregon pine floors, sunny north-facing entertainment deck, secure garage, and mountain views.",
      "keyFeatures": [
            "3 Bedrooms",
            "2 Bathrooms",
            "Secure Garage + Off-Street",
            "North-Facing Deck",
            "Original Victorian Fireplace"
      ],
      "agentName": "Douglas Allen & Co",
      "agentAgency": "Jawitz Properties Atlantic Seaboard",
      "agentPhone": "+27 82 774 3190",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '1797',
    lpiCode: 'C01600210000179700000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '1 LAW ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.909543,
      lng: 18.399411,
      formatted: "18.399411°E 33.909543°S"
    },
    extentM2: 226,
    cadastralExtentM2: 226,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    currentSale: {
      owner: 'ALLEN DOUGLAS JOHN 50%; ALLEN DOUGLAS JOHN 50%',
      ownersId: '6104275038081',
      salePrice: 250000,
      saleDate: '2004/01/21',
      registeredDate: '2004/08/06',
      titleDeed: 'T76363/2004 50%; T40343/2001 50%',
      bondHolder: undefined,
      bondAmount: 0,
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 82 774 3190',
        secondaryPhone: '+27 21 439 1102',
        email: 'doug.allen@netactive.co.za',
        representativeName: 'Douglas J. Allen',
        postalAddress: '1 Law Road, Three Anchor Bay, Cape Town, 8005',
        preferredChannel: 'PHONE',
        verifiedStatus: 'VERIFIED',
        notes: 'Long-term owner (22+ yrs), highly receptive to individual property valuation insights.'
      }
    },
    contacts: {
      primaryPhone: '+27 82 774 3190',
      secondaryPhone: '+27 21 439 1102',
      email: 'doug.allen@netactive.co.za',
      representativeName: 'Douglas J. Allen',
      postalAddress: '1 Law Road, Three Anchor Bay, Cape Town, 8005',
      preferredChannel: 'PHONE',
      verifiedStatus: 'VERIFIED',
      notes: 'Long-term owner (22+ yrs), highly receptive to individual property valuation insights.'
    },
    municipalValuation: {
      totalValue: 5800000,
      valuationYear: 2025,
      ratesEstimateMonthly: 3120.40,
      landValue: 3900000,
      improvementsValue: 1900000
    },
    accommodation: {
      type: 'House (2 storey)',
      usage: 'Residential',
      condition: 'GOOD',
      specialFeatures: 'Charming Victorian cottage, north-facing, original pine floorboards, deck with Signal Hill views.',
      smallerThanAverage: false,
      largerThanAverage: false,
      age: 95,
      buildingM2: 195,
      bedRooms: 3,
      receptionRms: 2,
      study: 1,
      bathRooms: 2,
      enSuite: 1,
      garages: 1,
      pBaysCPorts: 1,
      alarm: true,
      perimSecurity: true,
      pool: false,
      garden: true,
      sprinklerSys: false,
      borehole: false,
      outsideAccom: false,
      tennisCourt: false
    },
    polygonPoints: [
      [140, 520],
      [220, 510],
      [220, 570],
      [140, 580]
    ]
  },
  {
    id: 'prop-974',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-11339182",
      "url": "https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11339182",
      "title": "Boutique Sectional Title Duplex at 17 On St Bedes",
      "askingPrice": 11500000,
      "headline": "Ultra-Modern Atlantic Oasis with Private Rooftop Sun Lounge",
      "description": "Exclusive 2-unit scheme featuring bespoke minimalist interiors, high-spec imported Italian kitchen, automated tandem garages, and private rooftop views.",
      "keyFeatures": [
            "4 Bedrooms Total",
            "4 Bathrooms",
            "4 Garages",
            "Private Rooftop Terrace",
            "Biometric Security"
      ],
      "agentName": "Christian Sawyer",
      "agentAgency": "RE/MAX Premier",
      "agentPhone": "+27 84 920 4411",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '974',
    schemeName: '17 ON ST BEDES',
    isSectionalTitle: true,
    lpiCode: 'C01600210000097400000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '17 ST BEDES ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.910268,
      lng: 18.39969,
      formatted: "18.39969°E 33.910268°S"
    },
    extentM2: 381,
    cadastralExtentM2: 381,
    category: 'Sectional Title',
    usage: 'Sectional title scheme',
    zoning: 'GR2',
    zoningDescription: 'General Residential 2',
    servitudes: false,
    currentSale: {
      owner: '17 ON ST BEDES BODY CORPORATE',
      ownersId: 'SS250/2024',
      salePrice: 0,
      saleDate: '2024/02/10',
      registeredDate: '2024/05/20',
      titleDeed: 'ST250/2024',
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 84 920 4411',
        secondaryPhone: '+27 21 434 7780',
        email: 'bodycorp@17onstbedes.co.za',
        secondaryEmail: 'managingagent@propmanage.co.za',
        representativeName: 'Christian Sawyer (Trustee)',
        postalAddress: '17 St Bedes Road, Three Anchor Bay, 8005',
        preferredChannel: 'EMAIL',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 84 920 4411',
      secondaryPhone: '+27 21 434 7780',
      email: 'bodycorp@17onstbedes.co.za',
      secondaryEmail: 'managingagent@propmanage.co.za',
      representativeName: 'Christian Sawyer (Trustee)',
      postalAddress: '17 St Bedes Road, Three Anchor Bay, 8005',
      preferredChannel: 'EMAIL',
      verifiedStatus: 'VERIFIED'
    },
    sectionalUnits: [
      {
        sectionNo: 1,
        flatNo: 'Flat 1',
        ownersName: 'SAWYER CHRISTIAN',
        extentM2: 170,
        type: 'Flat',
        pqShare: 0.54,
        participationQuota: '54.6%',
        lastSalePrice: 5800000,
        lastSaleDate: '2023/11/14'
      },
      {
        sectionNo: 2,
        flatNo: 'Flat 2',
        ownersName: 'PLATINUM BERG PROP PTY LTD',
        extentM2: 141,
        type: 'Flat',
        pqShare: 0.46,
        participationQuota: '45.4%',
        lastSalePrice: 4950000,
        lastSaleDate: '2022/08/30'
      }
    ],
    municipalValuation: {
      totalValue: 10750000,
      valuationYear: 2025,
      ratesEstimateMonthly: 5850.00
    },
    accommodation: {
      type: 'Sectional title scheme',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Boutique contemporary sectional scheme comprising 2 luxury apartments with double lock-up tandem garages and private rooftop terrace.',
      buildingM2: 311,
      bedRooms: 4,
      bathRooms: 4,
      garages: 4,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [360, 480],
      [440, 480],
      [440, 550],
      [360, 550]
    ]
  },
  {
    id: 'prop-63',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-10772910",
      "url": "https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/10772910",
      "title": "Masterpiece 3-Bed Designer Villa on Blackheath",
      "askingPrice": 9200000,
      "headline": "Elevated Coastal Living with Expansive Sun Deck and Pool",
      "description": "Perched on high-demand Blackheath Road, this contemporary villa enjoys natural illumination, open plan dining and lounge, rim-flow plunge pool, and garaging for 2 vehicles.",
      "keyFeatures": [
            "3 Bed, 3 Bath",
            "Double Garage",
            "Swimming Pool",
            "Signal Hill Backdrop",
            "Full Inverter Backup"
      ],
      "agentName": "Stephan Muller",
      "agentAgency": "Chas Everitt Atlantic Seaboard",
      "agentPhone": "+27 82 331 9901",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '63',
    lpiCode: 'C01600510000006300000',
    deedsOffice: 'CAPE TOWN',
    township: 'SEA POINT EAST',
    address: '3 BLACKHEATH ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.910415,
      lng: 18.397856,
      formatted: "18.397856°E 33.910415°S"
    },
    extentM2: 258,
    cadastralExtentM2: 259,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    currentSale: {
      owner: 'MULLER STEPHAN FRIDOLIN',
      ownersId: '6703065098084',
      salePrice: 1350000,
      saleDate: '2003/10/07',
      registeredDate: '2003/12/15',
      titleDeed: 'T117440/2003',
      bondHolder: undefined,
      bondAmount: 0,
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 82 610 8834',
        email: 'stephan.muller@mullerarch.co.za',
        representativeName: 'Stephan F. Muller',
        postalAddress: '3 Blackheath Road, Three Anchor Bay, 8005',
        preferredChannel: 'WHATSAPP',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 82 610 8834',
      email: 'stephan.muller@mullerarch.co.za',
      representativeName: 'Stephan F. Muller',
      postalAddress: '3 Blackheath Road, Three Anchor Bay, 8005',
      preferredChannel: 'WHATSAPP',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 6200000,
      valuationYear: 2025,
      ratesEstimateMonthly: 3338.51
    },
    accommodation: {
      type: 'House',
      usage: 'Residential',
      condition: 'GOOD',
      specialFeatures: 'Freestanding character home with mountain views, separate laundry, landscaped front patio.',
      age: 88,
      buildingM2: 215,
      bedRooms: 3,
      bathRooms: 2,
      garages: 2,
      alarm: true,
      garden: true
    },
    polygonPoints: [
      [510, 480],
      [560, 460],
      [590, 520],
      [540, 540]
    ]
  },
  {
    id: 'prop-100',
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-10663819",
      "url": "https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/10663819",
      "title": "Grand 806m² Double Erf Estate on Mutley Road",
      "askingPrice": 7100000,
      "headline": "Substantial Parcel with Lush Landscaped Gardens",
      "description": "An expansive 806m² property providing immense privacy, mature trees, entertainer patio, and spacious master suite in central Three Anchor Bay.",
      "keyFeatures": [
            "806 m² Erf",
            "3 Bedrooms",
            "2 Bathrooms",
            "Lush Mature Garden",
            "Double Carport"
      ],
      "agentName": "Giovanni Bowman",
      "agentAgency": "Pam Golding Properties",
      "agentPhone": "+27 71 884 9201",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '100',
    lpiCode: 'C01600510000010000000',
    deedsOffice: 'CAPE TOWN',
    township: 'SEA POINT EAST',
    address: '11 MUTLEY ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.910656,
      lng: 18.396706,
      formatted: "18.396706°E 33.910656°S"
    },
    extentM2: 806,
    cadastralExtentM2: 805,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR2',
    zoningDescription: 'General Residential 2',
    servitudes: false,
    currentSale: {
      owner: 'BOWMAN GIOVANNI YORICK 50%; FOSTER HARVEY DAVID 50%',
      ownersId: '9107015112089',
      salePrice: 10200000,
      saleDate: '2023/07/22',
      registeredDate: '2023/11/10',
      titleDeed: 'T48077/2023',
      bondHolder: 'INVESTEC BANK LTD',
      bondAmount: 9200000,
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 79 388 2901',
        secondaryPhone: '+27 83 220 1845',
        email: 'giovanni.bowman@investec.co.za',
        secondaryEmail: 'harvey.foster@fosterdesign.co.za',
        representativeName: 'Giovanni Bowman & Harvey Foster',
        postalAddress: '11 Mutley Road, Three Anchor Bay, 8005',
        preferredChannel: 'PHONE',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 79 388 2901',
      secondaryPhone: '+27 83 220 1845',
      email: 'giovanni.bowman@investec.co.za',
      secondaryEmail: 'harvey.foster@fosterdesign.co.za',
      representativeName: 'Giovanni Bowman & Harvey Foster',
      postalAddress: '11 Mutley Road, Three Anchor Bay, 8005',
      preferredChannel: 'PHONE',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 11000000,
      valuationYear: 2025,
      ratesEstimateMonthly: 6150.00
    },
    accommodation: {
      type: 'House',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Extensively remodeled architectural residence, oversized level garden, heated pool, 8kW solar inverter backup.',
      buildingM2: 440,
      bedRooms: 4,
      bathRooms: 4,
      enSuite: 3,
      garages: 2,
      pBaysCPorts: 2,
      pool: true,
      alarm: true,
      perimSecurity: true,
      garden: true,
      borehole: true
    },
    polygonPoints: [
      [470, 420],
      [540, 480],
      [500, 530],
      [430, 470]
    ]
  },
  {
    id: 'prop-152',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-11119283",
      "url": "https://www.property24.com/for-sale/sea-point/cape-town/western-cape/11119283",
      "title": "Stately 4-Bed Family Residence on Hofmeyr",
      "askingPrice": 8800000,
      "headline": "Timeless Elegance in Prestigious Sea Point East",
      "description": "Expansive 497m² erf property featuring high ceilings, timber floorboards, family swimming pool, and double direct-access garaging.",
      "keyFeatures": [
            "497 m² Erf",
            "4 Bedrooms",
            "3 Bathrooms",
            "Double Garage",
            "Swimming Pool"
      ],
      "agentName": "Johann Louw",
      "agentAgency": "Seeff Atlantic Seaboard",
      "agentPhone": "+27 84 772 1933",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '152',
    lpiCode: 'C01600510000015200000',
    deedsOffice: 'CAPE TOWN',
    township: 'SEA POINT EAST',
    address: '33 HOFMEYR ROAD',
    suburb: 'SEA POINT EAST',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.911343,
      lng: 18.394775,
      formatted: "18.394775°E 33.911343°S"
    },
    extentM2: 497,
    cadastralExtentM2: 497,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR2',
    zoningDescription: 'General Residential 2',
    servitudes: false,
    currentSale: {
      owner: 'LOUW JOHANN MATTHYS 50%; LOUW LIEZEL 50%',
      ownersId: '7912195023088',
      salePrice: 3950000,
      saleDate: '2014/04/01',
      registeredDate: '2014/11/06',
      titleDeed: 'T61118/2014',
      bondHolder: 'INVESTEC BANK LTD',
      bondAmount: 3950000,
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 82 901 4455',
        secondaryPhone: '+27 21 439 6020',
        email: 'johann.louw@louwlaw.co.za',
        secondaryEmail: 'liezel.louw@sun.ac.za',
        representativeName: 'Johann & Liezel Louw',
        postalAddress: '33 Hofmeyr Road, Sea Point, 8005',
        preferredChannel: 'EMAIL',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 82 901 4455',
      secondaryPhone: '+27 21 439 6020',
      email: 'johann.louw@louwlaw.co.za',
      secondaryEmail: 'liezel.louw@sun.ac.za',
      representativeName: 'Johann & Liezel Louw',
      postalAddress: '33 Hofmeyr Road, Sea Point, 8005',
      preferredChannel: 'EMAIL',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 8700000,
      valuationYear: 2025,
      ratesEstimateMonthly: 4720.00
    },
    accommodation: {
      type: 'House',
      usage: 'Residential',
      condition: 'GOOD',
      specialFeatures: 'Spacious family home with expansive entertainment patio, established palm garden.',
      buildingM2: 290,
      bedRooms: 4,
      bathRooms: 3,
      garages: 2,
      alarm: true,
      pool: true
    },
    polygonPoints: [
      [110, 620],
      [180, 680],
      [140, 720],
      [70, 660]
    ]
  },
  {
    id: 'prop-1485',
    imageUrl: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-10554920",
      "url": "https://www.property24.com/for-sale/sea-point/cape-town/western-cape/10554920",
      "title": "Chic 3-Bed Mount Nelson Sanctuary",
      "askingPrice": 6950000,
      "headline": "Sunlit Living Just Moments from Sea Point Promenade",
      "description": "Immaculate semi-detached Victorian sanctuary with private courtyard, secure single garage, and modern open-plan dining and kitchen.",
      "keyFeatures": [
            "3 Bed, 2 Bath",
            "Garage",
            "Private Courtyard",
            "Walk to Promenade",
            "High Security"
      ],
      "agentName": "Jinty Jackson",
      "agentAgency": "Rawson Properties",
      "agentPhone": "+27 83 412 0093",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '1485',
    lpiCode: 'C01600510000148500000',
    deedsOffice: 'CAPE TOWN',
    township: 'SEA POINT EAST',
    address: '8 MOUNT NELSON ROAD',
    suburb: 'SEA POINT EAST',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.912206,
      lng: 18.393899,
      formatted: "18.393899°E 33.912206°S"
    },
    extentM2: 178,
    cadastralExtentM2: 178,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    currentSale: {
      owner: 'JACKSON JINTY ANNE 50%; RENARD BENOIT ALEXIS 50%',
      ownersId: '7311155021087',
      salePrice: 5000000,
      saleDate: '2016/09/30',
      registeredDate: '2016/11/21',
      titleDeed: 'T71383/2016',
      bondHolder: 'INVESTEC BANK LTD',
      bondAmount: 4500000,
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 83 412 8890',
        secondaryPhone: '+27 72 190 3340',
        email: 'jinty.jackson@gmail.com',
        secondaryEmail: 'benoit.renard@capemarketing.com',
        representativeName: 'Jinty Jackson & Benoit Renard',
        postalAddress: '8 Mount Nelson Road, Sea Point, 8005',
        preferredChannel: 'WHATSAPP',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 83 412 8890',
      secondaryPhone: '+27 72 190 3340',
      email: 'jinty.jackson@gmail.com',
      secondaryEmail: 'benoit.renard@capemarketing.com',
      representativeName: 'Jinty Jackson & Benoit Renard',
      postalAddress: '8 Mount Nelson Road, Sea Point, 8005',
      preferredChannel: 'WHATSAPP',
      verifiedStatus: 'VERIFIED'
    },
    reportedSale: {
      price: 6850000,
      date: '2026/03/12',
      source: 'PropSearch MLS',
      status: 'ACTIVE'
    },
    municipalValuation: {
      totalValue: 6200000,
      valuationYear: 2025,
      ratesEstimateMonthly: 3338.51
    },
    accommodation: {
      type: 'Semi-detached house (2 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Renovated double-storey semi-detached villa, sunny courtyard, balcony off master suite.',
      buildingM2: 182,
      bedRooms: 3,
      bathRooms: 2,
      garages: 1,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [480, 560],
      [530, 510],
      [560, 540],
      [510, 590]
    ]
  },
  {
    id: 'prop-aurum',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-10118833",
      "url": "https://www.property24.com/for-sale/bantry-bay/cape-town/western-cape/10118833",
      "title": "Presidential Oceanside Penthouse at Aurum",
      "askingPrice": 75000000,
      "headline": "The Ultimate Oceanfront Architectural Icon on Victoria Road",
      "description": "650m² ultra-luxury penthouse featuring private rim-flow pool hanging over the Atlantic Ocean, private funicular elevator, and 24-hour concierge.",
      "keyFeatures": [
            "650 m² Floor Extent",
            "Private Rim-Flow Pool",
            "4 En-Suite Suites",
            "4 Undercover Parking Bays",
            "Direct Beach Access"
      ],
      "agentName": "Wilhelm Von Berg",
      "agentAgency": "Dogon Group Properties",
      "agentPhone": "+27 82 300 7700",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '1988',
    schemeName: 'AURUM PRESIDENTIAL RESIDENCES',
    isSectionalTitle: true,
    lpiCode: 'C01600210000198800000',
    deedsOffice: 'CAPE TOWN',
    township: 'BANTRY BAY',
    address: 'VICTORIA ROAD',
    suburb: 'BANTRY BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.92611,
      lng: 18.37890,
      formatted: "18.37890°E 33.92611°S"
    },
    extentM2: 2850,
    cadastralExtentM2: 2850,
    category: 'Sectional Title',
    usage: 'Sectional title scheme',
    zoning: 'GR5',
    zoningDescription: 'General Residential 5',
    servitudes: true,
    servitudeDetails: 'Public coastal walkway right of way servitude K124/2018',
    currentSale: {
      owner: 'AURUM BODY CORPORATE',
      ownersId: 'SS112/2019',
      salePrice: 125000000,
      saleDate: '2019/04/18',
      registeredDate: '2019/09/25',
      titleDeed: 'ST112/2019',
      saleType: 'COMPANY TRANSFER',
      contacts: {
        primaryPhone: '+27 21 430 8900',
        secondaryPhone: '+27 82 300 7700',
        email: 'concierge@aurumbantrybay.com',
        secondaryEmail: 'trustees@aurumbantrybay.com',
        representativeName: 'Wilhelm Von Berg (Body Corporate Chair)',
        postalAddress: 'Victoria Road, Bantry Bay, 8005',
        preferredChannel: 'EMAIL',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 21 430 8900',
      secondaryPhone: '+27 82 300 7700',
      email: 'concierge@aurumbantrybay.com',
      secondaryEmail: 'trustees@aurumbantrybay.com',
      representativeName: 'Wilhelm Von Berg (Body Corporate Chair)',
      postalAddress: 'Victoria Road, Bantry Bay, 8005',
      preferredChannel: 'EMAIL',
      verifiedStatus: 'VERIFIED'
    },
    sectionalUnits: [
      {
        sectionNo: 1,
        flatNo: 'Penthouse 1',
        ownersName: 'ATLANTIC HORIZON TRUST',
        extentM2: 650,
        type: 'Penthouse',
        pqShare: 0.28,
        participationQuota: '28.0%',
        lastSalePrice: 72000000,
        lastSaleDate: '2024/04/12'
      },
      {
        sectionNo: 2,
        flatNo: 'Apartment 201',
        ownersName: 'VON BERG WILHELM',
        extentM2: 320,
        type: 'Flat',
        pqShare: 0.14,
        participationQuota: '14.0%',
        lastSalePrice: 38000000,
        lastSaleDate: '2023/10/05'
      },
      {
        sectionNo: 3,
        flatNo: 'Apartment 301',
        ownersName: 'GLOBAL CAPITAL CAPE PTY LTD',
        extentM2: 410,
        type: 'Flat',
        pqShare: 0.18,
        participationQuota: '18.0%',
        lastSalePrice: 48500000,
        lastSaleDate: '2025/01/20'
      }
    ],
    municipalValuation: {
      totalValue: 280000000,
      valuationYear: 2025,
      ratesEstimateMonthly: 154000.00
    },
    accommodation: {
      type: 'Sectional title scheme',
      usage: 'Residential',
      condition: 'EXCELLENT',
      specialFeatures: 'Ultra-luxury oceanside presidential apartments, private ocean-facing rim flow pools, 24-hour concierge, private funicular elevator.',
      buildingM2: 2450,
      bedRooms: 12,
      bathRooms: 14,
      garages: 18,
      pool: true,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [750, 80],
      [840, 80],
      [840, 160],
      [750, 160]
    ]
  },
  {
    id: 'prop-portswood',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85"
],
    property24Listing: {
      "listingNumber": "P24-10009922",
      "url": "https://www.property24.com/for-sale/green-point/cape-town/western-cape/10009922",
      "title": "Prime Mixed-Use Precinct Adjacent to V&A Waterfront",
      "askingPrice": 195000000,
      "headline": "Prestigious Portswood Road Commercial & Hospitality Block",
      "description": "48,500m² site with GB2 zoning, established commercial blue-chip tenancies, underground parking for 280 vehicles, and prime tourism corridor frontage.",
      "keyFeatures": [
            "48,500 m² Site Extent",
            "GB2 Commercial Zoning",
            "280 Undercover Parking Bays",
            "Walk to V&A Waterfront",
            "AAA-Grade Office/Retail"
      ],
      "agentName": "Clive Henderson",
      "agentAgency": "Broll Commercial Property",
      "agentPhone": "+27 82 990 1200",
      "agencyLogo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80"
},
    erfNo: '127',
    lpiCode: 'C01600210000012700000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '127 PORTSWOOD ROAD',
    suburb: 'GREEN POINT',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.90421,
      lng: 18.41120,
      formatted: "18.41120°E 33.90421°S"
    },
    extentM2: 48500,
    cadastralExtentM2: 48500,
    category: 'Commercial',
    usage: 'Mixed Use',
    zoning: 'GB2',
    zoningDescription: 'General Business 2',
    servitudes: true,
    servitudeDetails: 'Municipal power substation servitude S402/1982',
    currentSale: {
      owner: 'PORTSWOOD PROPERTIES HOLDINGS LTD',
      ownersId: '1996/004521/06',
      salePrice: 180000000,
      saleDate: '2015/06/10',
      registeredDate: '2015/10/01',
      titleDeed: 'T44521/2015',
      bondHolder: 'NEDBANK LTD',
      bondAmount: 120000000,
      saleType: 'COMPANY TRANSFER',
      contacts: {
        primaryPhone: '+27 21 408 7600',
        secondaryPhone: '+27 82 990 1200',
        email: 'assetmanagement@portswoodholdings.co.za',
        representativeName: 'Clive Henderson (Chief Investment Officer)',
        postalAddress: '127 Portswood Road, Green Point, 8005',
        preferredChannel: 'EMAIL',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 21 408 7600',
      secondaryPhone: '+27 82 990 1200',
      email: 'assetmanagement@portswoodholdings.co.za',
      representativeName: 'Clive Henderson (Chief Investment Officer)',
      postalAddress: '127 Portswood Road, Green Point, 8005',
      preferredChannel: 'EMAIL',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 310000000,
      valuationYear: 2025,
      ratesEstimateMonthly: 172000.00
    },
    accommodation: {
      type: 'Block of flats',
      usage: 'Commercial',
      condition: 'GOOD',
      specialFeatures: 'High-density precinct adjacent to V&A Waterfront and Cape Town Stadium.',
      buildingM2: 32000,
      garages: 280,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [320, 180],
      [650, 160],
      [710, 240],
      [600, 310],
      [310, 280]
    ]
  }
,
  {
    id: 'prop-1680',
    erfNo: '1680',
    lpiCode: 'C01600210000168000000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '3 RICHMOND ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.90865,
      lng: 18.40112,
      formatted: "18.401120°E 33.908650°S"
    },
    extentM2: 198,
    cadastralExtentM2: 198,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-10948291',
      url: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/10948291',
      title: '3 Bedroom Freestanding Victorian House For Sale',
      askingPrice: 7450000,
      headline: 'Charming Character Home with Contemporary Upgrades',
      description: 'Step into refined Atlantic Seaboard living in this restored 3-bedroom Victorian cottage featuring original wooden floors, sash windows, and an ambient private patio.',
      keyFeatures: ['3 Bedrooms', '2 Bathrooms', 'Secure Garage', 'Private Courtyard', 'High Ceilings'],
      agentName: 'David Kitching',
      agentAgency: 'Pam Golding Properties',
      agentPhone: '+27 82 554 9011',
      agencyLogo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80'
    },
    currentSale: {
      owner: 'KLEIN BRUCE EDWARD',
      ownersId: '7203145028087',
      salePrice: 7450000,
      saleDate: '2025/11/14',
      registeredDate: '2026/02/10',
      titleDeed: 'T11409/2026',
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 82 554 9011',
        secondaryPhone: '+27 21 439 8810',
        email: 'bruce.klein@capeholdings.co.za',
        representativeName: 'Bruce Klein',
        postalAddress: '3 Richmond Road, Three Anchor Bay, 8005',
        preferredChannel: 'PHONE',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 82 554 9011',
      secondaryPhone: '+27 21 439 8810',
      email: 'bruce.klein@capeholdings.co.za',
      representativeName: 'Bruce Klein',
      postalAddress: '3 Richmond Road, Three Anchor Bay, 8005',
      preferredChannel: 'PHONE',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 6100000,
      valuationYear: 2025,
      ratesEstimateMonthly: 3280.00
    },
    accommodation: {
      type: 'House (2 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      buildingM2: 210,
      bedRooms: 3,
      bathRooms: 2,
      garages: 1,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [430, 310],
      [500, 310],
      [500, 340],
      [430, 340]
    ]
  },
  {
    id: 'prop-1682',
    erfNo: '1682',
    lpiCode: 'C01600210000168200000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '7 RICHMOND ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.90890,
      lng: 18.40095,
      formatted: "18.400950°E 33.908900°S"
    },
    extentM2: 215,
    cadastralExtentM2: 215,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-11029384',
      url: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11029384',
      title: 'Luxury 3 Bedroom Home with Rooftop Deck',
      askingPrice: 7900000,
      headline: 'Exceptional Position in Quiet Tree-Lined Cul-de-Sac',
      description: 'Modern luxury meets classic charm in this renovated Three Anchor Bay home featuring 3 ensuite bedrooms, double garage, and elevated Signal Hill outlooks.',
      keyFeatures: ['3 En-Suite Bedrooms', '2.5 Bathrooms', 'Double Garage', 'Rooftop Sundeck', 'Air Conditioning'],
      agentName: 'Jessica Stern',
      agentAgency: 'Seeff Atlantic Seaboard',
      agentPhone: '+27 83 992 4110',
      agencyLogo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80'
    },
    currentSale: {
      owner: 'STERN PROPERTIES TRUST',
      ownersId: 'IT4490/2012',
      salePrice: 7900000,
      saleDate: '2025/08/22',
      registeredDate: '2025/11/30',
      titleDeed: 'T88291/2025',
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 83 992 4110',
        secondaryPhone: '+27 21 434 9000',
        email: 'jessica@sterntrust.co.za',
        representativeName: 'Jessica Stern',
        postalAddress: '7 Richmond Road, Three Anchor Bay, 8005',
        preferredChannel: 'EMAIL',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 83 992 4110',
      secondaryPhone: '+27 21 434 9000',
      email: 'jessica@sterntrust.co.za',
      representativeName: 'Jessica Stern',
      postalAddress: '7 Richmond Road, Three Anchor Bay, 8005',
      preferredChannel: 'EMAIL',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 6450000,
      valuationYear: 2025,
      ratesEstimateMonthly: 3470.00
    },
    accommodation: {
      type: 'House (2 storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      buildingM2: 235,
      bedRooms: 3,
      bathRooms: 3,
      garages: 2,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [570, 310],
      [640, 310],
      [640, 340],
      [570, 340]
    ]
  },
  {
    id: 'prop-1675',
    erfNo: '1675',
    lpiCode: 'C01600210000167500000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: '4 RICHMOND ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.90880,
      lng: 18.40115,
      formatted: "18.401150°E 33.908800°S"
    },
    extentM2: 205,
    cadastralExtentM2: 205,
    category: 'Freehold',
    usage: 'Residential',
    zoning: 'GR4',
    zoningDescription: 'General Residential 4',
    servitudes: false,
    imageUrl: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-10884920',
      url: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/10884920',
      title: 'Architectural Designer Cottage with Pool',
      askingPrice: 7600000,
      headline: 'Sun-drenched North Facing Living in Prime Location',
      description: 'Exquisite single-level sanctuary boasting seamless indoor/outdoor entertainment flow, solar backup power, and low maintenance garden with plunge pool.',
      keyFeatures: ['3 Bedrooms', '2 Bathrooms', 'Plunge Pool', 'Solar Inverter System', 'Security Beams'],
      agentName: 'Liam O’Connor',
      agentAgency: 'Greeff Christie’s Real Estate',
      agentPhone: '+27 82 110 9944',
      agencyLogo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80'
    },
    currentSale: {
      owner: 'OCONNOR LIAM PATRICK',
      ownersId: '8005125019082',
      salePrice: 7600000,
      saleDate: '2025/12/01',
      registeredDate: '2026/02/20',
      titleDeed: 'T14902/2026',
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 82 110 9944',
        secondaryPhone: '+27 21 434 1100',
        email: 'liam.oconnor@greeff.co.za',
        representativeName: 'Liam O’Connor',
        postalAddress: '4 Richmond Road, Three Anchor Bay, 8005',
        preferredChannel: 'PHONE',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 82 110 9944',
      secondaryPhone: '+27 21 434 1100',
      email: 'liam.oconnor@greeff.co.za',
      representativeName: 'Liam O’Connor',
      postalAddress: '4 Richmond Road, Three Anchor Bay, 8005',
      preferredChannel: 'PHONE',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 6250000,
      valuationYear: 2025,
      ratesEstimateMonthly: 3360.00
    },
    accommodation: {
      type: 'House (Single storey)',
      usage: 'Residential',
      condition: 'EXCELLENT',
      buildingM2: 195,
      bedRooms: 3,
      bathRooms: 2,
      garages: 1,
      pool: true,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [500, 270],
      [570, 270],
      [570, 300],
      [500, 300]
    ]
  },
  {
    id: 'prop-2092',
    erfNo: '2092',
    schemeName: 'THE SIGNATURE',
    isSectionalTitle: true,
    lpiCode: 'C01600210000209200000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: 'UNIT 4, 217 MAIN ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.90820,
      lng: 18.40180,
      formatted: "18.401800°E 33.908200°S"
    },
    extentM2: 95,
    cadastralExtentM2: 95,
    category: 'Sectional Title',
    usage: 'Sectional title scheme',
    zoning: 'GR5',
    zoningDescription: 'General Residential 5',
    servitudes: false,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-11448201',
      url: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11448201',
      title: 'Modern 2-Bed Luxury Apartment at The Signature',
      askingPrice: 4200000,
      headline: 'Airbnb Friendly Investment with Atlantic Ocean Horizon Views',
      description: 'Prime investment opportunity in contemporary boutique development. High rental yield, 24-hr security, undercover parking bay, and short-term letting permission.',
      keyFeatures: ['2 Bedrooms', '2 Bathrooms', '1 Secure Parking Bay', 'Short-Term Letting Allowed', '24-Hour Concierge'],
      agentName: 'Claire Du Plessis',
      agentAgency: 'RE/MAX Living Atlantic Seaboard',
      agentPhone: '+27 82 884 1290',
      agencyLogo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80'
    },
    currentSale: {
      owner: 'DU PLESSIS CLAIRE MARIE',
      ownersId: '8609185012089',
      salePrice: 4200000,
      saleDate: '2025/10/05',
      registeredDate: '2025/12/18',
      titleDeed: 'ST9912/2025',
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 82 884 1290',
        secondaryPhone: '+27 21 433 2200',
        email: 'claire@remaxliving.co.za',
        representativeName: 'Claire Du Plessis',
        postalAddress: 'Unit 4, 217 Main Road, Three Anchor Bay, 8005',
        preferredChannel: 'EMAIL',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 82 884 1290',
      secondaryPhone: '+27 21 433 2200',
      email: 'claire@remaxliving.co.za',
      representativeName: 'Claire Du Plessis',
      postalAddress: 'Unit 4, 217 Main Road, Three Anchor Bay, 8005',
      preferredChannel: 'EMAIL',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 3950000,
      valuationYear: 2025,
      ratesEstimateMonthly: 1980.00
    },
    accommodation: {
      type: 'Apartment',
      usage: 'Residential',
      condition: 'EXCELLENT',
      buildingM2: 95,
      bedRooms: 2,
      bathRooms: 2,
      garages: 1,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [150, 240],
      [240, 230],
      [250, 350],
      [160, 360]
    ]
  },
  {
    id: 'prop-2094',
    erfNo: '2094',
    schemeName: 'OCEAN CREST',
    isSectionalTitle: true,
    lpiCode: 'C01600210000209400000',
    deedsOffice: 'CAPE TOWN',
    township: 'GREEN POINT',
    address: 'UNIT 12, 221 MAIN ROAD',
    suburb: 'THREE ANCHOR BAY',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    gps: {
      lat: -33.90810,
      lng: 18.40230,
      formatted: "18.402300°E 33.908100°S"
    },
    extentM2: 110,
    cadastralExtentM2: 110,
    category: 'Sectional Title',
    usage: 'Sectional title scheme',
    zoning: 'GR5',
    zoningDescription: 'General Residential 5',
    servitudes: false,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85'
    ],
    property24Listing: {
      listingNumber: 'P24-11559302',
      url: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11559302',
      title: 'Corner Penthouse Suite at Ocean Crest',
      askingPrice: 4950000,
      headline: 'Panoramic Ocean & Mountain Views with Expansive Balcony',
      description: 'Exclusive 2-bedroom corner apartment offering light-filled spaces, high-end SMEG appliances, double underground parking, and biometric building security.',
      keyFeatures: ['2 Bedrooms', '2 Bathrooms', 'Double Tandem Parking', 'Private Balcony', 'Biometric Access Control'],
      agentName: 'Marcus Venter',
      agentAgency: 'Rawson Properties Atlantic Seaboard',
      agentPhone: '+27 83 711 0033',
      agencyLogo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80'
    },
    currentSale: {
      owner: 'VENTER MARCUS ANDRE',
      ownersId: '7911045091083',
      salePrice: 4950000,
      saleDate: '2025/11/20',
      registeredDate: '2026/01/25',
      titleDeed: 'ST1124/2026',
      saleType: 'PRIVATE TREATY',
      contacts: {
        primaryPhone: '+27 83 711 0033',
        secondaryPhone: '+27 21 434 8800',
        email: 'marcus.venter@rawson.co.za',
        representativeName: 'Marcus Venter',
        postalAddress: 'Unit 12, 221 Main Road, Three Anchor Bay, 8005',
        preferredChannel: 'PHONE',
        verifiedStatus: 'VERIFIED'
      }
    },
    contacts: {
      primaryPhone: '+27 83 711 0033',
      secondaryPhone: '+27 21 434 8800',
      email: 'marcus.venter@rawson.co.za',
      representativeName: 'Marcus Venter',
      postalAddress: 'Unit 12, 221 Main Road, Three Anchor Bay, 8005',
      preferredChannel: 'PHONE',
      verifiedStatus: 'VERIFIED'
    },
    municipalValuation: {
      totalValue: 4600000,
      valuationYear: 2025,
      ratesEstimateMonthly: 2350.00
    },
    accommodation: {
      type: 'Penthouse Apartment',
      usage: 'Residential',
      condition: 'EXCELLENT',
      buildingM2: 110,
      bedRooms: 2,
      bathRooms: 2,
      garages: 2,
      alarm: true,
      perimSecurity: true
    },
    polygonPoints: [
      [340, 220],
      [430, 210],
      [440, 330],
      [350, 340]
    ]
  }
];

export const SUBURB_DEMOGRAPHICS_DATA: Record<string, SuburbStatistics> = {
  'GREEN POINT, CITY OF CAPE TOWN': {
    suburbName: 'GREEN POINT, CITY OF CAPE TOWN',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    totalProperties: 4850,
    freeholdCount: 1120,
    sectionalTitleCount: 3560,
    estateCount: 45,
    vacantLandCount: 125,
    ageDistribution: [
      { bracket: '< 35 Years', ownersCount: 820, percentage: 17 },
      { bracket: '36 - 49 Years', ownersCount: 1840, percentage: 38 },
      { bracket: '50 - 64 Years', ownersCount: 1410, percentage: 29 },
      { bracket: '65+ Years', ownersCount: 780, percentage: 16 }
    ],
    ownershipDuration: [
      { durationBracket: '< 1 Year', count: 480, percentage: 10 },
      { durationBracket: '1 - 3 Years', count: 970, percentage: 20 },
      { durationBracket: '4 - 7 Years', count: 1450, percentage: 30 },
      { durationBracket: '8 - 10 Years', count: 830, percentage: 17 },
      { durationBracket: '11+ Years', count: 1120, percentage: 23 }
    ],
    buyerAgeDemographics: [
      { bracket: '< 35 Years', buyersPercent: 28, sellersPercent: 12 },
      { bracket: '36 - 49 Years', buyersPercent: 44, sellersPercent: 28 },
      { bracket: '50 - 64 Years', buyersPercent: 22, sellersPercent: 36 },
      { bracket: '65+ Years', buyersPercent: 6, sellersPercent: 24 }
    ],
    historicalAnnualTrends: [
      { year: 2017, medianPriceFreehold: 5200000, averagePriceFreehold: 5850000, medianPriceSectional: 2650000, averagePriceSectional: 2950000, salesVolumeFreehold: 88, salesVolumeSectional: 280 },
      { year: 2018, medianPriceFreehold: 5500000, averagePriceFreehold: 6200000, medianPriceSectional: 2800000, averagePriceSectional: 3100000, salesVolumeFreehold: 92, salesVolumeSectional: 295 },
      { year: 2019, medianPriceFreehold: 5800000, averagePriceFreehold: 6550000, medianPriceSectional: 2950000, averagePriceSectional: 3250000, salesVolumeFreehold: 84, salesVolumeSectional: 270 },
      { year: 2020, medianPriceFreehold: 5650000, averagePriceFreehold: 6400000, medianPriceSectional: 2850000, averagePriceSectional: 3150000, salesVolumeFreehold: 65, salesVolumeSectional: 210 },
      { year: 2021, medianPriceFreehold: 6200000, averagePriceFreehold: 7100000, medianPriceSectional: 3100000, averagePriceSectional: 3450000, salesVolumeFreehold: 105, salesVolumeSectional: 340 },
      { year: 2022, medianPriceFreehold: 6800000, averagePriceFreehold: 7800000, medianPriceSectional: 3350000, averagePriceSectional: 3750000, salesVolumeFreehold: 112, salesVolumeSectional: 365 },
      { year: 2023, medianPriceFreehold: 7350000, averagePriceFreehold: 8400000, medianPriceSectional: 3600000, averagePriceSectional: 4100000, salesVolumeFreehold: 98, salesVolumeSectional: 320 },
      { year: 2024, medianPriceFreehold: 7900000, averagePriceFreehold: 9150000, medianPriceSectional: 3900000, averagePriceSectional: 4450000, salesVolumeFreehold: 104, salesVolumeSectional: 350 },
      { year: 2025, medianPriceFreehold: 8500000, averagePriceFreehold: 9900000, medianPriceSectional: 4250000, averagePriceSectional: 4900000, salesVolumeFreehold: 110, salesVolumeSectional: 380 },
      { year: 2026, medianPriceFreehold: 9100000, averagePriceFreehold: 10600000, medianPriceSectional: 4600000, averagePriceSectional: 5300000, salesVolumeFreehold: 72, salesVolumeSectional: 240 }
    ]
  },
  'THREE ANCHOR BAY, CITY OF CAPE TOWN': {
    suburbName: 'THREE ANCHOR BAY, CITY OF CAPE TOWN',
    municipality: 'CITY OF CAPE TOWN',
    province: 'WESTERN CAPE',
    totalProperties: 2450,
    freeholdCount: 420,
    sectionalTitleCount: 1980,
    estateCount: 10,
    vacantLandCount: 40,
    ageDistribution: [
      { bracket: '< 35 Years', ownersCount: 410, percentage: 17 },
      { bracket: '36 - 49 Years', ownersCount: 890, percentage: 36 },
      { bracket: '50 - 64 Years', ownersCount: 720, percentage: 29 },
      { bracket: '65+ Years', ownersCount: 430, percentage: 18 }
    ],
    ownershipDuration: [
      { durationBracket: '< 1 Year', count: 220, percentage: 9 },
      { durationBracket: '1 - 3 Years', count: 510, percentage: 21 },
      { durationBracket: '4 - 7 Years', count: 760, percentage: 31 },
      { durationBracket: '8 - 10 Years', count: 410, percentage: 17 },
      { durationBracket: '11+ Years', count: 550, percentage: 22 }
    ],
    buyerAgeDemographics: [
      { bracket: '< 35 Years', buyersPercent: 25, sellersPercent: 14 },
      { bracket: '36 - 49 Years', buyersPercent: 42, sellersPercent: 30 },
      { bracket: '50 - 64 Years', buyersPercent: 25, sellersPercent: 34 },
      { bracket: '65+ Years', buyersPercent: 8, sellersPercent: 22 }
    ],
    historicalAnnualTrends: [
      { year: 2017, medianPriceFreehold: 4800000, averagePriceFreehold: 5300000, medianPriceSectional: 2400000, averagePriceSectional: 2700000, salesVolumeFreehold: 42, salesVolumeSectional: 190 },
      { year: 2018, medianPriceFreehold: 5100000, averagePriceFreehold: 5700000, medianPriceSectional: 2550000, averagePriceSectional: 2850000, salesVolumeFreehold: 45, salesVolumeSectional: 205 },
      { year: 2019, medianPriceFreehold: 5400000, averagePriceFreehold: 6050000, medianPriceSectional: 2700000, averagePriceSectional: 3000000, salesVolumeFreehold: 38, salesVolumeSectional: 180 },
      { year: 2020, medianPriceFreehold: 5250000, averagePriceFreehold: 5900000, medianPriceSectional: 2600000, averagePriceSectional: 2900000, salesVolumeFreehold: 30, salesVolumeSectional: 140 },
      { year: 2021, medianPriceFreehold: 5800000, averagePriceFreehold: 6500000, medianPriceSectional: 2850000, averagePriceSectional: 3200000, salesVolumeFreehold: 50, salesVolumeSectional: 220 },
      { year: 2022, medianPriceFreehold: 6350000, averagePriceFreehold: 7200000, medianPriceSectional: 3100000, averagePriceSectional: 3500000, salesVolumeFreehold: 54, salesVolumeSectional: 245 },
      { year: 2023, medianPriceFreehold: 6900000, averagePriceFreehold: 7800000, medianPriceSectional: 3350000, averagePriceSectional: 3800000, salesVolumeFreehold: 48, salesVolumeSectional: 215 },
      { year: 2024, medianPriceFreehold: 7450000, averagePriceFreehold: 8500000, medianPriceSectional: 3650000, averagePriceSectional: 4150000, salesVolumeFreehold: 52, salesVolumeSectional: 235 },
      { year: 2025, medianPriceFreehold: 8100000, averagePriceFreehold: 9200000, medianPriceSectional: 3950000, averagePriceSectional: 4550000, salesVolumeFreehold: 55, salesVolumeSectional: 250 },
      { year: 2026, medianPriceFreehold: 8700000, averagePriceFreehold: 9900000, medianPriceSectional: 4300000, averagePriceSectional: 4950000, salesVolumeFreehold: 36, salesVolumeSectional: 160 }
    ]
  }
};

export const PROSPECTING_SCRIPTS_DATA: ProspectScript[] = [
  {
    id: 'script-1',
    category: 'Prospecting',
    title: 'CMA - Prospecting: 12 Dialogue Scripts for Cold Calling',
    shortDescription: '12 different dialogue scripts each using a unique approach when cold calling. Know what to say for different types of cold calls before you call.',
    scriptLines: [
      { speaker: 'Tip', text: 'Preparation: Pull up the owner\'s registered transfer date and CMA vicinity valuation before initiating the call.' },
      { speaker: 'Agent', text: 'Good morning, [Owner Name]. My name is [Your Name] from CMA Real Estate Intelligence. The reason for my call is that we recently concluded a high-value sale on [Adjacent Street Name] at [Sold Price], and we have three pre-qualified qualified buyers actively seeking a home of your exact erf extent in [Suburb Name].' },
      { speaker: 'Seller', text: 'We are quite happy here and not really planning on selling right now.' },
      { speaker: 'Agent', text: 'I completely respect that, [Owner Name]. Most homeowners in [Suburb] stay for 7 to 10 years. However, with the municipal valuation re-assessment and recent sectional surge, property values in your immediate street have appreciated by 14.2% over the last 18 months. Would you be open to receiving a complimentary, zero-obligation CMA Property Intelligence Dossier for your records?' },
      { speaker: 'Seller', text: 'Sure, you can send that through to my email.' },
      { speaker: 'Agent', text: 'Fantastic. I have your address as [Address]. May I confirm the best email address to dispatch the confidential report?' }
    ]
  },
  {
    id: 'script-2',
    category: 'Getting the listing',
    title: 'CMA - Getting the listing: From Prequalifying to Mandate Pitch',
    shortDescription: 'Know how to qualify the seller lead and how to convince them to grant an exclusive sole mandate based on verifiable market data.',
    scriptLines: [
      { speaker: 'Agent', text: 'Mr. & Mrs. [Surname], when evaluating marketing proposals from agents, there is a distinct difference between an enthusiastic opinion and hard deeds office empirical data. Here is the verified CMA transfer history for [Street] over the last 24 months.' },
      { speaker: 'Seller', text: 'Another agent told us they could get us R12 Million for our home.' },
      { speaker: 'Agent', text: 'Agents often "buy the listing" with inflated numbers, only for the property to languish on market for 180+ days, ultimately resulting in a distressed reduction. Let us look at Days on Market (DOM) statistics for [Suburb]: properties priced within 3% of the CMA Index sell within 28 days at 98.4% of asking price. Our sole mandate marketing matrix guarantees high-intent qualified buyer access.' }
    ]
  },
  {
    id: 'script-3',
    category: 'Listing Objections',
    title: 'CMA - Listing Objections: Overcoming Pricing and Commission Resistance',
    shortDescription: 'Handling seller objections with composure, proving why professional representation yields higher net proceeds after commission.',
    scriptLines: [
      { speaker: 'Seller', text: 'Why should I pay 6% commission when I can list privately or with a discount agency?' },
      { speaker: 'Agent', text: 'That is a very fair question. A discount broker simply uploads a listing to a portal and waits. Our team actively runs KYC pre-screening on all inquiries, verifies credit scores before private viewings to protect your family\'s security, and uses proprietary CMA vicinity buyer matching. On average, our competitive negotiation yields 8.5% higher final selling prices, meaning your net proceeds after commission are significantly higher than selling unrepresented.' }
    ]
  },
  {
    id: 'script-4',
    category: 'Prospecting Video / SMS',
    title: 'CMA - Prospecting Video / SMS: High-Conversion WhatsApp & SMS Templates',
    shortDescription: 'Templates for WhatsApp and Email introductions that generate immediate replies from property owners.',
    scriptLines: [
      { speaker: 'Agent', text: 'Hi [Owner Name], [Your Name] from CMA Info. We noticed your property at [Address] reached its [Ownership Duration] anniversary this month! We generated a custom 2026 Valuation Snapshot showing how your equity has evolved. Reply YES to receive the 1-page PDF.' }
    ]
  }
];

export const PROSPECTING_LEADS_DATA: ProspectLead[] = [
  {
    id: 'lead-1',
    propertyAddress: '5 RICHMOND ROAD',
    suburb: 'THREE ANCHOR BAY',
    ownerName: 'PIER MANE TRUST',
    ownerIdMasked: '1895/2007',
    contactNumber: '082 555 1982',
    email: 'contact@piermanetrust.co.za',
    ownerAge: 62,
    ownerBirthday: '1964-09-14',
    purchaseDate: '2007-07-13',
    durationYears: 19,
    purchaseAnniversary: 'July 13',
    estimatedEquity: 3800000,
    category: 'Freehold',
    erfExtentM2: 201,
    daysOnMarket: undefined,
    isForSaleByOwner: false,
    notes: 'Long-term ownership (19 yrs). Ideal candidate for downsizing consultation or portfolio review.'
  },
  {
    id: 'lead-2',
    propertyAddress: '11 MUTLEY ROAD',
    suburb: 'THREE ANCHOR BAY',
    ownerName: 'BOWMAN GIOVANNI YORICK 50%; FOSTER HARVEY DAVID 50%',
    ownerIdMasked: '910701******',
    contactNumber: '071 884 9201',
    email: 'giovanni.bowman@designgroup.co.za',
    ownerAge: 35,
    ownerBirthday: '1991-07-01',
    purchaseDate: '2023-07-22',
    durationYears: 3,
    purchaseAnniversary: 'July 22',
    estimatedEquity: 2400000,
    category: 'Freehold',
    erfExtentM2: 806,
    daysOnMarket: undefined,
    isForSaleByOwner: false,
    notes: 'Recent renovation completed. Significant capital appreciation.'
  },
  {
    id: 'lead-3',
    propertyAddress: '8 MOUNT NELSON ROAD',
    suburb: 'SEA POINT EAST',
    ownerName: 'JACKSON JINTY ANNE 50%; RENARD BENOIT ALEXIS 50%',
    ownerIdMasked: '731115******',
    contactNumber: '083 412 0093',
    email: 'jinty.renard@voyagelimited.com',
    ownerAge: 53,
    ownerBirthday: '1973-11-15',
    purchaseDate: '2016-09-30',
    durationYears: 10,
    purchaseAnniversary: 'September 30',
    estimatedEquity: 2350000,
    category: 'Freehold',
    erfExtentM2: 178,
    daysOnMarket: 45,
    isForSaleByOwner: true,
    notes: 'Currently listed as For Sale By Owner (FSBO). Open to broker mandates.'
  },
  {
    id: 'lead-4',
    propertyAddress: '33 HOFMEYR ROAD',
    suburb: 'SEA POINT EAST',
    ownerName: 'LOUW JOHANN MATTHYS 50%; LOUW LIEZEL 50%',
    ownerIdMasked: '791219******',
    contactNumber: '084 772 1933',
    email: 'johann.louw@capefinance.co.za',
    ownerAge: 47,
    ownerBirthday: '1979-12-19',
    purchaseDate: '2014-04-01',
    durationYears: 12,
    purchaseAnniversary: 'April 01',
    estimatedEquity: 4750000,
    category: 'Freehold',
    erfExtentM2: 497,
    daysOnMarket: undefined,
    isForSaleByOwner: false,
    notes: 'High equity accumulation. Target for investment expansion.'
  }
];

export const KYC_INITIAL_HISTORY: KYCReportRecord[] = [
  {
    id: 'kyc-rep-101',
    reportType: 'PRE_CHECK',
    targetName: 'MULLER STEPHAN FRIDOLIN',
    targetIdOrReg: '6703065098084',
    requestedBy: 'Mezzoforte Privilege',
    timestamp: '2026-08-24 14:15:22',
    prescribedPurpose: 'Section 18(4) - Credit assessment / Application',
    searchReference: 'REF-3BLACKHEATH',
    costVatExcl: 11.00,
    status: 'COMPLETED',
    expiresAt: '2026-08-27 14:15:22',
    data: {
      fullName: 'Stephan Fridolin Muller',
      idNumber: '6703065098084',
      dateOfBirth: '1967-03-06',
      gender: 'Male',
      creditScore: 785,
      scoreBand: 'EXCELLENT',
      riskCategory: 'LOW RISK',
      homeAffairsStatus: 'VERIFIED_ALIVE',
      photoVerified: true,
      judgmentsCount: 0,
      defaultsCount: 0,
      noticesCount: 0
    }
  },
  {
    id: 'kyc-rep-102',
    reportType: 'DEEDS_QUERY',
    targetName: '5 RICHMOND ROAD, THREE ANCHOR BAY',
    targetIdOrReg: 'Erf 1681 GREEN POINT',
    requestedBy: 'Mezzoforte Privilege',
    timestamp: '2026-08-25 09:30:10',
    prescribedPurpose: 'Section 18(4) - Property transaction due diligence',
    searchReference: 'REF-5RICHMOND',
    costVatExcl: 29.50,
    status: 'COMPLETED',
    expiresAt: '2026-08-28 09:30:10',
    data: {
      legalDescription: 'Erf 1681, GREEN POINT, CITY OF CAPE TOWN',
      address: '5 RICHMOND ROAD, THREE ANCHOR BAY',
      owner: 'PIER MANE TRUST',
      salePrice: 'R 2 400 000',
      saleDate: '2007/07/13',
      registeredDate: '2007/10/02',
      bondAmount: 'R 0',
      titleDeed: 'T78896/2007'
    }
  },
  {
    id: 'kyc-rep-103',
    reportType: 'SANCTION_SCREENING',
    targetName: 'S B G REAL ESTATE PTY LTD',
    targetIdOrReg: '201733710907',
    requestedBy: 'Mezzoforte Privilege',
    timestamp: '2026-08-25 11:45:00',
    prescribedPurpose: 'Section 18(4) - Fraud prevention & Anti-Money Laundering',
    searchReference: 'REF-219MAIN-SANCT',
    costVatExcl: 25.00,
    status: 'COMPLETED',
    expiresAt: '2026-08-28 11:45:00',
    data: {
      entityName: 'S B G REAL ESTATE PTY LTD',
      registrationNumber: '201733710907',
      sanctionStatus: 'CLEAR / NO MATCHES',
      pepStatus: 'NO PEP DIRECTORS DETECTED',
      interpolNotice: 'NONE',
      adverseMedia: 'CLEAR',
      complianceRating: 'COMPLIANT (FICA & FATF GRADE A)'
    }
  }
];

// ==========================================
// Ptah-Realty Comparative Sales Data Feed
// ==========================================
export const COMPARATIVE_SALES_FEED: Record<string, import('../types').ComparativeSaleRecord[]> = {
  'prop-1681': [
    {
      id: 'cma-101',
      address: '3 Richmond Road',
      suburb: 'Three Anchor Bay',
      erfNo: '1680',
      category: 'Freehold',
      extentM2: 198,
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
      salePrice: 7450000,
      saleDate: '2025/11/14',
      registrationDate: '2026/02/10',
      distanceMeters: 45,
      similarityScore: 98,
      pricePerM2: 37626,
      source: 'Deeds Office',
      sourceListingUrl: 'https://property24.com/cma/deeds/1680-green-point',
      condition: 'EXCELLENT',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      gps: { lat: -33.90865, lng: 18.40112 }
    },
    {
      id: 'cma-102',
      address: '7 Richmond Road',
      suburb: 'Three Anchor Bay',
      erfNo: '1682',
      category: 'Freehold',
      extentM2: 215,
      bedrooms: 3,
      bathrooms: 2.5,
      garages: 2,
      salePrice: 7900000,
      saleDate: '2025/08/22',
      registrationDate: '2025/11/30',
      distanceMeters: 60,
      similarityScore: 95,
      pricePerM2: 36744,
      source: 'Property24',
      sourceListingUrl: 'https://property24.com/for-sale/three-anchor-bay/cape-town/western-cape/10948291',
      condition: 'GOOD',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      gps: { lat: -33.90890, lng: 18.40095 }
    },
    {
      id: 'cma-103',
      address: '15 St Bedes Road',
      suburb: 'Three Anchor Bay',
      erfNo: '973',
      category: 'Freehold',
      extentM2: 220,
      bedrooms: 4,
      bathrooms: 3,
      garages: 2,
      salePrice: 8400000,
      saleDate: '2025/06/18',
      registrationDate: '2025/09/04',
      distanceMeters: 180,
      similarityScore: 91,
      pricePerM2: 38181,
      source: 'CMA Database',
      sourceListingUrl: 'https://cma.co.za/deeds/records/973-three-anchor-bay',
      condition: 'EXCELLENT',
      imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      gps: { lat: -33.90940, lng: 18.40030 }
    },
    {
      id: 'cma-104',
      address: '9 Mutley Road',
      suburb: 'Three Anchor Bay',
      erfNo: '99',
      category: 'Freehold',
      extentM2: 185,
      bedrooms: 2,
      bathrooms: 2,
      garages: 1,
      salePrice: 6650000,
      saleDate: '2025/04/10',
      registrationDate: '2025/07/15',
      distanceMeters: 290,
      similarityScore: 88,
      pricePerM2: 35945,
      source: 'Private Property',
      sourceListingUrl: 'https://privateproperty.co.za/for-sale/three-anchor-bay/t49102',
      condition: 'FAIR',
      imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
      gps: { lat: -33.91010, lng: 18.39980 }
    },
    {
      id: 'cma-105',
      address: '4 Richmond Road',
      suburb: 'Three Anchor Bay',
      erfNo: '1675',
      category: 'Freehold',
      extentM2: 205,
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
      salePrice: 7600000,
      saleDate: '2025/12/01',
      registrationDate: '2026/02/20',
      distanceMeters: 30,
      similarityScore: 97,
      pricePerM2: 37073,
      source: 'Lightstone Feed',
      sourceListingUrl: 'https://lightstoneproperty.co.za/valuation/1675',
      condition: 'EXCELLENT',
      imageUrl: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
      gps: { lat: -33.90880, lng: 18.40115 }
    }
  ],
  'prop-2093': [
    {
      id: 'cma-201',
      address: 'Unit 4, 217 Main Road',
      suburb: 'Three Anchor Bay',
      erfNo: '2092',
      schemeName: 'THE SIGNATURE',
      category: 'Sectional Title',
      extentM2: 95,
      bedrooms: 2,
      bathrooms: 2,
      garages: 1,
      salePrice: 4200000,
      saleDate: '2025/10/05',
      registrationDate: '2025/12/18',
      distanceMeters: 40,
      similarityScore: 96,
      pricePerM2: 44210,
      source: 'Property24',
      condition: 'EXCELLENT',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      gps: { lat: -33.90820, lng: 18.40180 }
    },
    {
      id: 'cma-202',
      address: 'Unit 12, 221 Main Road',
      suburb: 'Three Anchor Bay',
      erfNo: '2094',
      schemeName: 'OCEAN CREST',
      category: 'Sectional Title',
      extentM2: 110,
      bedrooms: 2,
      bathrooms: 2,
      garages: 2,
      salePrice: 4950000,
      saleDate: '2025/11/20',
      registrationDate: '2026/01/25',
      distanceMeters: 80,
      similarityScore: 94,
      pricePerM2: 45000,
      source: 'Deeds Office',
      condition: 'EXCELLENT',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      gps: { lat: -33.90810, lng: 18.40230 }
    }
  ]
};

// ==========================================
// Ptah-Realty Visual Asset Media Storage
// ==========================================
export const INITIAL_PROPERTY_MEDIA: Record<string, import('../types').PropertyMediaAsset[]> = {
  'prop-1681': [
    {
      id: 'media-1',
      propertyId: 'prop-1681',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      fileName: '5_richmond_exterior_facade.jpg',
      tag: 'Exterior Front',
      caption: 'Main entrance and restored heritage Victorian façade on Richmond Road',
      order: 1,
      isHero: true,
      isIncludedInPdf: true,
      isIncludedInPortals: true,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: 2450000,
      optimizedForWeb: true,
      optimizedForPrintPdf: true,
      watermarkApplied: true,
      uploadedAt: '2026-08-25 10:15'
    },
    {
      id: 'media-2',
      propertyId: 'prop-1681',
      url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      fileName: '5_richmond_living_room.jpg',
      tag: 'Living Room',
      caption: 'Open-concept reception lounge with original high ceilings and parquet floors',
      order: 2,
      isHero: false,
      isIncludedInPdf: true,
      isIncludedInPortals: true,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: 2100000,
      optimizedForWeb: true,
      optimizedForPrintPdf: true,
      watermarkApplied: true,
      uploadedAt: '2026-08-25 10:16'
    },
    {
      id: 'media-3',
      propertyId: 'prop-1681',
      url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85',
      fileName: '5_richmond_kitchen_modern.jpg',
      tag: 'Gourmet Kitchen',
      caption: 'Designer Caesarstone chef kitchen with gas hob and breakfast island',
      order: 3,
      isHero: false,
      isIncludedInPdf: true,
      isIncludedInPortals: true,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: 1950000,
      optimizedForWeb: true,
      optimizedForPrintPdf: true,
      watermarkApplied: true,
      uploadedAt: '2026-08-25 10:17'
    },
    {
      id: 'media-4',
      propertyId: 'prop-1681',
      url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=85',
      fileName: '5_richmond_master_bedroom.jpg',
      tag: 'Master Bedroom',
      caption: 'Spacious master suite with bespoke built-in cupboards and sash windows',
      order: 4,
      isHero: false,
      isIncludedInPdf: true,
      isIncludedInPortals: true,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: 1840000,
      optimizedForWeb: true,
      optimizedForPrintPdf: true,
      watermarkApplied: true,
      uploadedAt: '2026-08-25 10:18'
    },
    {
      id: 'media-5',
      propertyId: 'prop-1681',
      url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
      fileName: '5_richmond_courtyard_pool.jpg',
      tag: 'Garden & Pool',
      caption: 'Secluded sun-drenched plunge pool and entertainment terrace',
      order: 5,
      isHero: false,
      isIncludedInPdf: true,
      isIncludedInPortals: true,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: 2780000,
      optimizedForWeb: true,
      optimizedForPrintPdf: true,
      watermarkApplied: true,
      uploadedAt: '2026-08-25 10:19'
    }
  ]
};

// ==========================================
// Structural Assessment Data
// ==========================================
export const STRUCTURAL_ASSESSMENTS_STORE: Record<string, import('../types').StructuralConditionAssessment> = {
  'prop-1681': {
    roofCondition: 'Good',
    waterproofingCert: true,
    electricalCertStatus: 'Valid & Issued',
    gasCertStatus: 'Compliant',
    beetleWoodInspection: 'Clear',
    plumbingCondition: 'Modernized',
    glazingAndWindows: 'Standard Aluminium',
    foundationIntegrity: 'Sound',
    structuralNotes: 'Recent 2024 boundary wall damp-proofing and updated electrical distribution board. SACPVP Grade A structural sign-off.',
    lastInspectedDate: '2026-06-15',
    inspectorName: 'Cape Structural Engineers & Valuers (Reg #SA-9941)'
  }
};

// ==========================================
// Multi-Portal Listing Sync Records
// ==========================================
export const INITIAL_PORTAL_PAYLOADS: Record<string, import('../types').PortalListingPayload[]> = {
  'prop-1681': [
    {
      portalId: 'property24',
      portalName: 'Property24',
      portalLogo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=80&q=80',
      status: 'LIVE',
      listingIdOnPortal: 'P24-11849201',
      liveUrl: 'https://www.property24.com/for-sale/three-anchor-bay/cape-town/western-cape/11849201',
      lastSyncedAt: '2026-08-25 14:20:00',
      title: 'Architectural 3-Bed Heritage Home with Plunge Pool',
      askingPrice: 7750000,
      monthlyRatesLevies: { rates: 2850, levies: 0 },
      headlineCopy: 'Sensational Three Anchor Bay Sanctuary | Seamless Indoor-Outdoor Flow',
      fullDescription: 'Nestled on coveted Richmond Road, this meticulously updated 3-bedroom Victorian residence combines classical period elegance with contemporary Atlantic Seaboard luxury. Features high ceilings, gourmet chef kitchen, and private plunge pool courtyard.',
      bulletFeatures: ['3 En-Suite Bedrooms', 'Plunge Pool & Deck', 'Secure Garage with Direct Access', 'Solar Inverter Backup Ready', 'Walk to Sea Point Promenade'],
      propertyTypePortalCategory: 'House',
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
      parkingBays: 1,
      pool: true,
      garden: true,
      petFriendly: true,
      furnished: false,
      securityFeatures: ['Alarm System', 'CCTV Perimeter', 'Electric Fencing'],
      selectedMediaAssetUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85'
      ],
      agentRefCode: 'PTAH-3AB-1681'
    },
    {
      portalId: 'privateproperty',
      portalName: 'Private Property',
      portalLogo: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=80&q=80',
      status: 'LIVE',
      listingIdOnPortal: 'PP-T399120',
      liveUrl: 'https://www.privateproperty.co.za/for-sale/three-anchor-bay/cape-town/t399120',
      lastSyncedAt: '2026-08-25 14:20:00',
      title: '3 Bedroom Freestanding House For Sale in Three Anchor Bay',
      askingPrice: 7750000,
      monthlyRatesLevies: { rates: 2850, levies: 0 },
      headlineCopy: 'Character & Sophistication Steps from the Atlantic Ocean',
      fullDescription: 'Superb 201m² erf property in prime Three Anchor Bay offering unmatched lifestyle appeal, modern finishes, and supreme security.',
      bulletFeatures: ['Prime Atlantic Seaboard', '3 Bed, 2 Bath', 'Garage + Off-Street', 'Outdoor Plunge Pool'],
      propertyTypePortalCategory: 'House',
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
      parkingBays: 1,
      pool: true,
      garden: true,
      petFriendly: true,
      furnished: false,
      securityFeatures: ['Alarm', 'Perimeter Beams'],
      selectedMediaAssetUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85'
      ],
      agentRefCode: 'PTAH-3AB-1681'
    },
    {
      portalId: 'ptahrealty_mls',
      portalName: 'Ptah-Realty Direct & Global MLS',
      portalLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=80&q=80',
      status: 'LIVE',
      listingIdOnPortal: 'PTAH-GLO-8841',
      liveUrl: 'https://ptah-realty.co.za/luxury/5-richmond-road-three-anchor-bay',
      lastSyncedAt: '2026-08-25 15:10:00',
      title: '5 Richmond Road | Sovereign Atlantic Seaboard Estate',
      askingPrice: 7750000,
      monthlyRatesLevies: { rates: 2850, levies: 0 },
      headlineCopy: 'Ptah-Realty Signature Exclusive Collection',
      fullDescription: 'Representing pinnacle residential intelligence and luxury living in Three Anchor Bay.',
      bulletFeatures: ['Verified Title Deeds Cadastre', 'SACPVP Market Validated', 'Direct Agent Mandate'],
      propertyTypePortalCategory: 'Luxury Freehold',
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
      parkingBays: 1,
      pool: true,
      garden: true,
      petFriendly: true,
      furnished: false,
      securityFeatures: ['Smart Access', 'Intercom', 'Armed Response'],
      selectedMediaAssetUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85'
      ],
      agentRefCode: 'PTAH-3AB-1681'
    },
    {
      portalId: 'social_meta',
      portalName: 'Meta & Social Listing Ads',
      portalLogo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=80&q=80',
      status: 'DRAFT',
      listingIdOnPortal: 'META-CAMP-449',
      lastSyncedAt: undefined,
      title: 'Just Listed in Three Anchor Bay | 3 Bed Victorian with Pool',
      askingPrice: 7750000,
      monthlyRatesLevies: { rates: 2850, levies: 0 },
      headlineCopy: '✨ Prime Atlantic Seaboard Opportunity — 5 Richmond Road',
      fullDescription: 'Tap below to explore the interactive 3D tour, cadastral title deeds, and schedule a private sunset viewing.',
      bulletFeatures: ['3 Bed / 2 Bath', 'Pool & Garage', 'R 7,750,000'],
      propertyTypePortalCategory: 'Sponsored Carousel',
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
      parkingBays: 1,
      pool: true,
      garden: true,
      petFriendly: true,
      furnished: false,
      securityFeatures: [],
      selectedMediaAssetUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85'
      ],
      agentRefCode: 'PTAH-3AB-1681'
    }
  ]
};
