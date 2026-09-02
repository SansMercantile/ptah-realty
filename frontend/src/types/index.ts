/**
 * Real Estate Intelligence & Compliance Platform (CMA Info)
 * Core Domain Types & Schemas
 */

export type PropertyCategory = 'Freehold' | 'Sectional Title' | 'Estate' | 'Farm' | 'Commercial' | 'Industrial' | 'Public Land';

// Widened to cover Cape Town's real Municipal Planning By-law zoning
// scheme codes -- these are what the live cadastre (services/cadastre.py)
// actually returns for a parcel's ZONING field, spanning every real
// parcel type: residential, business, community, open space, farm,
// industrial, transport (roads), and utility. See
// utils/parcelMockData.ts's classifyZoning() for how these map to a
// parcel category.
export type ZoningCode =
  | 'SR1' | 'SR2'
  | 'GR1' | 'GR2' | 'GR3' | 'GR4' | 'GR5' | 'GR6'
  | 'LB1' | 'LB2'
  | 'GB1' | 'GB2' | 'GB3' | 'GB4' | 'GB5' | 'GB6' | 'GB7' | 'GB8'
  | 'CO1' | 'CO2'
  | 'OS1' | 'OS2' | 'OS3'
  | 'AG1' | 'AG2'
  | 'GI1' | 'GI2' | 'GI3' | 'GI4'
  | 'TR1' | 'TR2'
  | 'UT1' | 'UT2' | 'UT3' | 'UT4'
  | 'MU1' | 'MU2';

export type PropertyUsage = 
  | 'Residential' 
  | 'Commercial' 
  | 'Block of Flats' 
  | 'Vacant land' 
  | 'Industrial' 
  | 'Agricultural' 
  | 'Mixed Use' 
  | 'Sectional title scheme';

export type AccommodationType = 
  | 'House'
  | 'House (Single storey)'
  | 'House (2 storey)'
  | 'House (3 storey)'
  | 'House (4 storey)'
  | 'Cluster house'
  | 'Cluster house (2 storey)'
  | 'Cluster house (3 storey)'
  | 'Semi-detached house'
  | 'Semi-detached house (2 storey)'
  | 'Semi-detached house (3 storey)'
  | 'Townhouse'
  | 'Townhouse (2 storey)'
  | 'Townhouse (3 storey)'
  | 'Apartment'
  | 'Penthouse Apartment'
  | 'Bungalow (wooden holiday/beach house)'
  | 'Garage (on own erf)'
  | 'Sectional title scheme'
  | 'Share block'
  | 'Block of flats'
  | 'Vacant land'
  | 'Warehouse'
  | 'Factory'
  | 'Workshop'
  | 'Farm Homestead'
  | 'Public Open Space'
  | 'Office Block'
  | 'Shopping Centre'
  | 'School / Institution'
  | 'Unknown';

export type ConditionRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNDER RENOVATION';

export interface AccommodationDetails {
  type: AccommodationType;
  usage: PropertyUsage;
  condition: ConditionRating;
  specialFeatures?: string;
  smallerThanAverage?: boolean;
  largerThanAverage?: boolean;
  age?: number;
  buildingM2?: number;
  bedRooms?: number;
  receptionRms?: number;
  study?: number;
  bathRooms?: number;
  enSuite?: number;
  dommAccom?: number;
  garages?: number;
  pBaysCPorts?: number;
  alarm?: boolean;
  perimSecurity?: boolean;
  pool?: boolean;
  garden?: boolean;
  sprinklerSys?: boolean;
  borehole?: boolean;
  outsideAccom?: boolean;
  tennisCourt?: boolean;
}

export interface SectionalUnit {
  sectionNo: number;
  flatNo: string;
  ownersName: string;
  extentM2: number;
  type: string;
  pqShare?: number;
  participationQuota?: string;
  lastSalePrice?: number;
  lastSaleDate?: string;
}

export interface OwnerContactDetails {
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  secondaryEmail?: string;
  postalAddress?: string;
  preferredChannel?: 'PHONE' | 'EMAIL' | 'WHATSAPP';
  representativeName?: string;
  verifiedStatus?: 'VERIFIED' | 'UNVERIFIED' | 'UPDATED';
  lastContactedDate?: string;
  notes?: string;
}

export interface SaleRecord {
  owner: string;
  ownersId: string;
  salePrice: number;
  saleDate: string;
  registeredDate: string;
  titleDeed: string;
  bondHolder?: string;
  bondAmount?: number;
  saleType: 'PRIVATE TREATY' | 'AUCTION' | 'COURT ORDER' | 'ESTATE TRANSFER' | 'COMPANY TRANSFER' | 'AGREEMENT';
  contacts?: OwnerContactDetails;
}

export interface MunicipalValuation {
  totalValue: number;
  valuationYear: number;
  ratesEstimateMonthly: number;
  landValue?: number;
  improvementsValue?: number;
}

export interface PropertyRecord {
  id: string;
  erfNo: string;
  portionNo?: string;
  lpiCode: string;
  deedsOffice: string;
  township: string;
  address: string;
  suburb: string;
  municipality: string;
  province: string;
  gps: {
    lat: number;
    lng: number;
    formatted: string;
  };
  extentM2: number;
  cadastralExtentM2: number;
  category: PropertyCategory;
  usage: PropertyUsage;
  zoning: ZoningCode;
  zoningDescription: string;
  servitudes: boolean;
  servitudeDetails?: string;
  imageUrl?: string;
  images?: string[];
  property24Listing?: {
    listingId?: string;
    listingNumber?: string;
    title: string;
    askingPrice: number;
    url: string;
    headline?: string;
    features?: string[];
    keyFeatures?: string[];
    description?: string;
    listedDate?: string;
    agentName?: string;
    agentAgency?: string;
    agentPhone?: string;
    agencyLogo?: string;
  };
  
  // Sectional Title details if applicable
  schemeName?: string;
  isSectionalTitle?: boolean;
  sectionalUnits?: SectionalUnit[];
  
  // Sales & Title
  currentSale: SaleRecord;
  historicalSales?: SaleRecord[];
  
  // Valuation
  municipalValuation: MunicipalValuation;
  
  // Accommodation
  accommodation: AccommodationDetails;
  
  // Renovations
  renovations?: {
    date: string;
    description: string;
    estimatedCost?: number;
  }[];
  
  // Reported Sales or Active listing
  reportedSale?: {
    price: number;
    date: string;
    source: string;
    status: 'ACTIVE' | 'PENDING' | 'SOLD';
  };

  // Direct Owner Contact Details
  contacts?: OwnerContactDetails;
  
  // Cadastral polygon coordinates for map drawing
  polygonPoints: [number, number][];

  // Real Surveyor-General Cadastral Lot Boundary Pegs [[lng, lat], ...]
  cadastralErfGeo?: Array<[number, number]>;

  // Real Architectural Building Box & Footprint Geometry
  buildingFootprint?: {
    footprintType: 'residential_villa' | 'commercial_block' | 'sectional_duplex' | 'cottage' | 'estate_residence';
    stories: number;
    buildingHeightM: number;
    roofType: 'hipped_tile' | 'flat_parapet' | 'pitched_slate' | 'terrace_deck';
    footprintM2: number;
    buildingGeoCoords: Array<[number, number]>; // [[lng, lat], ...]
    garageGeoCoords?: Array<[number, number]>;
    poolGeoCoords?: Array<[number, number]>;
    porchGeoCoords?: Array<[number, number]>;
    roofRidgeLines?: Array<[[number, number], [number, number]]>;
  };
}

// Suburb Demographic & Statistical Analytics
export interface SuburbStatistics {
  suburbName: string;
  municipality: string;
  province: string;
  totalProperties: number;
  freeholdCount: number;
  sectionalTitleCount: number;
  estateCount: number;
  vacantLandCount: number;
  
  // Demographics
  ageDistribution: {
    bracket: string;
    ownersCount: number;
    percentage: number;
  }[];
  
  ownershipDuration: {
    durationBracket: string;
    count: number;
    percentage: number;
  }[];
  
  buyerAgeDemographics: {
    bracket: string;
    buyersPercent: number;
    sellersPercent: number;
  }[];
  
  // Historical Trends 2017 - 2026
  historicalAnnualTrends: {
    year: number;
    medianPriceFreehold: number;
    averagePriceFreehold: number;
    medianPriceSectional: number;
    averagePriceSectional: number;
    salesVolumeFreehold: number;
    salesVolumeSectional: number;
  }[];
}

// KYC Domain Types
export type KYCPrescribedPurpose = 
  | 'Section 18(4) - Credit assessment / Application'
  | 'Section 18(4) - Fraud prevention & Anti-Money Laundering'
  | 'Section 18(4) - Prospective tenant evaluation'
  | 'Section 18(4) - Employment vetting in financial roles'
  | 'Section 18(4) - Investigation of fraud, corruption or theft';

export type KYCReportType = 
  | 'PRE_CHECK'
  | 'CREDIT_REPORT'
  | 'REAL_TIME_IDV'
  | 'FACEVIEW'
  | 'CONSUMER_TRACE'
  | 'SANCTION_SCREENING'
  | 'CIPC_REPORT'
  | 'DETAILED_BUSINESS_REPORT'
  | 'DIRECTOR_ENQUIRY'
  | 'DOTS_QUERY'
  | 'DEEDS_QUERY'
  | 'TITLE_DEED'
  | 'NATIONAL_DEEDS_SEARCH'
  | 'EUA_ENQUIRY';

export interface KYCReportRecord {
  id: string;
  reportType: KYCReportType;
  targetName: string;
  targetIdOrReg: string;
  requestedBy: string;
  timestamp: string;
  prescribedPurpose: string;
  searchReference?: string;
  costVatExcl: number;
  status: 'COMPLETED' | 'PENDING' | 'EXPIRED';
  expiresAt: string; // 72-hour NCR compliance window
  data: any;
}

// Prospecting Domain Types
export interface ProspectLead {
  id: string;
  propertyAddress: string;
  suburb: string;
  ownerName: string;
  ownerIdMasked: string;
  contactNumber?: string;
  email?: string;
  ownerAge: number;
  ownerBirthday: string;
  purchaseDate: string;
  durationYears: number;
  purchaseAnniversary: string;
  estimatedEquity: number;
  category: PropertyCategory;
  erfExtentM2: number;
  daysOnMarket?: number;
  isForSaleByOwner?: boolean;
  notes?: string;
}

export interface ProspectScript {
  id: string;
  category: 'Prospecting' | 'Getting the listing' | 'Listing Objections' | 'Prospecting Video / SMS';
  title: string;
  shortDescription: string;
  scriptLines: {
    speaker: 'Agent' | 'Seller' | 'Tip';
    text: string;
  }[];
}

// ==========================================
// 1. Data Aggregation & CMA Engine Types
// ==========================================
export interface ComparativeSaleRecord {
  id: string;
  address: string;
  suburb: string;
  erfNo: string;
  schemeName?: string;
  category: PropertyCategory;
  extentM2: number;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  salePrice: number;
  saleDate: string;
  registrationDate: string;
  distanceMeters: number;
  similarityScore: number; // 0 - 100%
  pricePerM2: number;
  source: 'Property24' | 'Deeds Office' | 'CMA Database' | 'Private Property' | 'Lightstone Feed';
  sourceListingUrl?: string;
  condition: ConditionRating;
  imageUrl: string;
  gps: {
    lat: number;
    lng: number;
  };
}

export interface CMAValuationCalculation {
  propertyId: string;
  subjectProperty: PropertyRecord;
  searchRadiusMeters: number;
  comparableCount: number;
  comparableSales: ComparativeSaleRecord[];
  averagePricePerM2: number;
  medianPricePerM2: number;
  projectedValuationBase: number;
  conditionAdjustmentPercent: number;
  finalProjectedMarketValue: number;
  valueRange: {
    conservative: number;
    recommended: number;
    aggressive: number;
  };
  confidenceScore: number; // e.g. 96.4
  estimatedMonthlyRental: number;
  projectedGrossYieldPercent: number;
  historicalSuburbAppreciationRate: number; // e.g. 7.4%
  calculatedAt: string;
}

export interface AmenityValuationAddition {
  name: string;
  value: number;
  rationale: string;
}

export interface AIPropertyValuationResponse {
  propertyId: string;
  address: string;
  erfNo: string;
  suburb: string;
  
  // 1. Individual Property Calculation (AI driven)
  individualValuation: {
    estimatedMarketValue: number;
    pricePerM2: number;
    valueRange: {
      conservative: number;
      target: number;
      aggressive: number;
    };
    confidenceScore: number; // e.g. 98%
    conditionMultiplier: number;
    buildingSizeM2: number;
    landExtentM2: number;
    valuationBreakdown: {
      landComponentValue: number;
      buildingImprovementValue: number;
      amenityValueAdditions: number;
      conditionAdjustmentValue: number;
      zoningBulkUpside: number;
    };
    amenityBreakdownList: AmenityValuationAddition[];
    keyDrivers: string[];
    aiAppraisalNarrative: string;
  };
  
  // 2. Street-Level Benchmark
  streetBenchmark: {
    streetName: string;
    propertiesInStreetCount: number;
    streetAveragePricePerM2: number;
    streetMedianValuation: number;
    varianceVsStreetPercent: number; // e.g. +8.5%
    streetPrestigeRating: string; // e.g. 'Prime Heritage Avenue'
    recentSalesInStreetCount: number;
    comparativeProperties: {
      address: string;
      extentM2: number;
      lastPrice: number;
      lastDate: string;
    }[];
  };
  
  // 3. Area / Suburb Benchmark
  suburbBenchmark: {
    suburbName: string;
    suburbAveragePricePerM2: number;
    suburbMedianValuation: number;
    annualAppreciationRate: number; // e.g. 7.8%
    varianceVsSuburbPercent: number; // e.g. +14.2%
    marketLiquidity: 'HIGH' | 'MODERATE' | 'LOW';
    averageDaysOnMarket: number;
    totalStockCount: number;
  };
  
  // 4. Investment & Yield Metrics
  investmentMetrics: {
    estimatedMonthlyRental: number;
    annualGrossRental: number;
    grossYieldPercent: number;
    netYieldPercent: number;
    capitalGrowth5YearForecast: number;
  };
  
  calculatedAt: string;
  modelUsed: string;
}

// ==========================================
// 2. Property Media & Visual Asset Management
// ==========================================
export type MediaTag = 
  | 'Exterior Front' 
  | 'Living Room' 
  | 'Dining Area' 
  | 'Master Bedroom' 
  | 'Ensuite Bathroom' 
  | 'Gourmet Kitchen' 
  | 'Garden & Pool' 
  | 'Balcony / Patio / View' 
  | 'Floorplan 2D/3D' 
  | 'Cadastral SG Diagram' 
  | 'Drone / Aerial' 
  | 'Architectural Detail';

export interface PropertyMediaAsset {
  id: string;
  propertyId: string;
  url: string;
  fileName: string;
  tag: MediaTag;
  caption: string;
  order: number;
  isHero: boolean;
  isIncludedInPdf: boolean;
  isIncludedInPortals: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  fileSizeBytes: number;
  optimizedForWeb: boolean;
  optimizedForPrintPdf: boolean;
  watermarkApplied: boolean;
  uploadedAt: string;
}

export interface StructuralConditionAssessment {
  roofCondition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair' | 'Newly Replaced';
  waterproofingCert: boolean;
  electricalCertStatus: 'Valid & Issued' | 'Pending Inspection' | 'Requires Rectification' | 'Not Applicable';
  gasCertStatus: 'Compliant' | 'Not Applicable' | 'Pending';
  beetleWoodInspection: 'Clear' | 'Not Applicable' | 'Pending';
  plumbingCondition: 'Modernized' | 'Good' | 'Original' | 'Minor Leak Noted';
  glazingAndWindows: 'Aluminium Double Glazed' | 'Standard Aluminium' | 'Timber Sealed' | 'Mixed';
  foundationIntegrity: 'Sound' | 'Minor Settling Hairline' | 'Engineering Signed-Off';
  structuralNotes: string;
  lastInspectedDate: string;
  inspectorName: string;
}

// ==========================================
// 3. Automated PDF Report & Document Generator
// ==========================================
export interface AIGeneratedCMACopy {
  executiveSummary: string;
  neighborhoodMarketDynamics: string;
  valuationMethodologyRationale: string;
  keySellingPoints: string[];
  recommendedMarketingStrategy: string;
  targetBuyerPersona: string;
  competitiveAdvantages: string[];
  pricingRecommendationText: string;
  generatedAt: string;
  modelUsed: string;
}

export interface PDFReportConfig {
  reportTitle: string;
  clientName: string;
  clientEmail?: string;
  agentName: string;
  agentAgency: string;
  agentContact: string;
  includeDeedsOfficeCert: boolean;
  includeDemographicCharts: boolean;
  includeCadastralMap: boolean;
  includeComparableSalesTable: boolean;
  includeAiNarrative: boolean;
  includeVisualGallery: boolean;
  selectedAssetIds: string[];
  themeColor: string; // Hex e.g. #006980
}

// ==========================================
// 4. Multi-Portal Listing Sync Engine
// ==========================================
export type PortalPlatformId = 'property24' | 'privateproperty' | 'gumtree' | 'ptahrealty_mls' | 'social_meta';

export type PortalSyncStatus = 'LIVE' | 'SYNCING' | 'DRAFT' | 'NEEDS_REVIEW' | 'SYNC_FAILED' | 'PAUSED';

export interface PortalListingPayload {
  id?: string;
  portalId: PortalPlatformId;
  portalName: string;
  portalLogo: string;
  status: PortalSyncStatus;
  listingIdOnPortal?: string;
  liveUrl?: string;
  lastSyncedAt?: string;
  syncErrors?: string[];
  payloadData?: any;
  title: string;
  askingPrice: number;
  monthlyRatesLevies: {
    rates: number;
    levies: number;
  };
  headlineCopy: string;
  fullDescription: string;
  bulletFeatures: string[];
  propertyTypePortalCategory: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  parkingBays: number;
  pool: boolean;
  garden: boolean;
  petFriendly: boolean;
  furnished: boolean;
  securityFeatures: string[];
  selectedMediaAssetUrls: string[];
  agentRefCode: string;
}
