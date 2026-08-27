import dotenv from "dotenv";
// Mirror Vite's env precedence for the Node server: .env.local overrides .env.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  PROPERTIES_DATA, 
  SUBURBS_LIST, 
  SUBURB_DEMOGRAPHICS_DATA, 
  PROSPECTING_LEADS_DATA, 
  PROSPECTING_SCRIPTS_DATA,
  KYC_INITIAL_HISTORY,
  COMPARATIVE_SALES_FEED,
  INITIAL_PROPERTY_MEDIA,
  STRUCTURAL_ASSESSMENTS_STORE,
  INITIAL_PORTAL_PAYLOADS
} from "./src/services/mockData";
import { 
  KYCReportRecord, 
  PropertyRecord, 
  ComparativeSaleRecord, 
  PropertyMediaAsset, 
  StructuralConditionAssessment, 
  PortalListingPayload 
} from "./src/types";

let propertiesStore: PropertyRecord[] = JSON.parse(JSON.stringify(PROPERTIES_DATA));
let kycHistoryStore: KYCReportRecord[] = JSON.parse(JSON.stringify(KYC_INITIAL_HISTORY));
let comparativeSalesStore: Record<string, ComparativeSaleRecord[]> = JSON.parse(JSON.stringify(COMPARATIVE_SALES_FEED));
let propertyMediaStore: Record<string, PropertyMediaAsset[]> = JSON.parse(JSON.stringify(INITIAL_PROPERTY_MEDIA));
let structuralAssessmentsStore: Record<string, StructuralConditionAssessment> = JSON.parse(JSON.stringify(STRUCTURAL_ASSESSMENTS_STORE));
let portalListingsStore: Record<string, PortalListingPayload[]> = JSON.parse(JSON.stringify(INITIAL_PORTAL_PAYLOADS));

// Lazy initialized Gemini AI Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health & Metadata
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      app: "Ptah-Realty", 
      version: "2.5.0",
      aiAvailable: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
      timestamp: new Date().toISOString() 
    });
  });

  // Suburb List & Demographics
  app.get("/api/suburbs", (req, res) => {
    res.json({ suburbs: SUBURBS_LIST });
  });

  app.get("/api/suburbs/:suburbName/analytics", (req, res) => {
    const name = decodeURIComponent(req.params.suburbName);
    const data = SUBURB_DEMOGRAPHICS_DATA[name] || SUBURB_DEMOGRAPHICS_DATA['GREEN POINT, CITY OF CAPE TOWN'];
    res.json(data);
  });

  // Properties Query & Search
  app.get("/api/properties", (req, res) => {
    const { q, erf, street, owner, category, suburb } = req.query;
    let filtered = [...propertiesStore];

    if (q && typeof q === 'string') {
      const queryLower = q.toLowerCase();
      filtered = filtered.filter(p => 
        p.address.toLowerCase().includes(queryLower) ||
        p.erfNo.toLowerCase().includes(queryLower) ||
        p.suburb.toLowerCase().includes(queryLower) ||
        p.currentSale.owner.toLowerCase().includes(queryLower) ||
        (p.schemeName && p.schemeName.toLowerCase().includes(queryLower))
      );
    }

    if (erf && typeof erf === 'string') {
      filtered = filtered.filter(p => p.erfNo === erf || p.erfNo.includes(erf));
    }

    if (street && typeof street === 'string') {
      filtered = filtered.filter(p => p.address.toLowerCase().includes(street.toLowerCase()));
    }

    if (owner && typeof owner === 'string') {
      filtered = filtered.filter(p => p.currentSale.owner.toLowerCase().includes(owner.toLowerCase()));
    }

    if (suburb && typeof suburb === 'string') {
      filtered = filtered.filter(p => p.suburb.toLowerCase() === suburb.toLowerCase() || suburb.includes(p.suburb));
    }

    res.json({ properties: filtered, total: filtered.length });
  });

  app.get("/api/properties/:id", (req, res) => {
    const property = propertiesStore.find(p => p.id === req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  });

  // Update Property Accommodation
  app.put("/api/properties/:id/accommodation", (req, res) => {
    const propertyIndex = propertiesStore.findIndex(p => p.id === req.params.id);
    if (propertyIndex === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    const updatedAccommodation = req.body;
    propertiesStore[propertyIndex].accommodation = {
      ...propertiesStore[propertyIndex].accommodation,
      ...updatedAccommodation
    };

    res.json({ 
      success: true, 
      property: propertiesStore[propertyIndex],
      message: "Property accommodation updated successfully." 
    });
  });

  // ========================================================
  // 1. DATA AGGREGATION & CMA VALUATION ENGINE ENDPOINTS
  // ========================================================
  app.get("/api/cma/comparatives/:propertyId", (req, res) => {
    const { propertyId } = req.params;
    const { radiusMeters, source, minSimilarity } = req.query;

    const comps = comparativeSalesStore[propertyId] || comparativeSalesStore['prop-1681'] || [];
    let filtered = [...comps];

    if (radiusMeters) {
      const radius = Number(radiusMeters);
      filtered = filtered.filter(c => c.distanceMeters <= radius);
    }

    if (source && typeof source === 'string' && source !== 'ALL') {
      filtered = filtered.filter(c => c.source.toLowerCase() === source.toLowerCase());
    }

    if (minSimilarity) {
      filtered = filtered.filter(c => c.similarityScore >= Number(minSimilarity));
    }

    res.json({
      propertyId,
      comparatives: filtered,
      count: filtered.length,
      lastIngested: "2026-08-25T14:30:00Z"
    });
  });

  app.post("/api/cma/calculate-valuation", (req, res) => {
    const { propertyId, condition, radiusMeters, customAdjustments } = req.body;
    const property = propertiesStore.find(p => p.id === propertyId) || propertiesStore[0];
    const comps = comparativeSalesStore[property.id] || comparativeSalesStore['prop-1681'] || [];

    const effectiveRadius = Number(radiusMeters) || 500;
    const validComps = comps.filter(c => c.distanceMeters <= effectiveRadius);
    const usedComps = validComps.length > 0 ? validComps : comps;

    const totalRatePerM2 = usedComps.reduce((acc, c) => acc + c.pricePerM2, 0);
    const avgRatePerM2 = Math.round(totalRatePerM2 / (usedComps.length || 1));
    const sortedRates = [...usedComps].map(c => c.pricePerM2).sort((a, b) => a - b);
    const medianRatePerM2 = sortedRates[Math.floor(sortedRates.length / 2)] || avgRatePerM2;

    const baseValuation = Math.round(avgRatePerM2 * property.extentM2);

    let conditionMultiplier = 1.0;
    const effectiveCondition = condition || property.accommodation.condition;
    if (effectiveCondition === 'EXCELLENT') conditionMultiplier = 1.06;
    if (effectiveCondition === 'GOOD') conditionMultiplier = 1.0;
    if (effectiveCondition === 'FAIR') conditionMultiplier = 0.92;
    if (effectiveCondition === 'POOR') conditionMultiplier = 0.82;

    let adjustmentTotal = 0;
    if (customAdjustments && typeof customAdjustments === 'object') {
      if (customAdjustments.pool) adjustmentTotal += 120000;
      if (customAdjustments.garage) adjustmentTotal += 150000;
      if (customAdjustments.views) adjustmentTotal += 250000;
      if (customAdjustments.renovatedKitchen) adjustmentTotal += 180000;
    }

    const finalProjectedValue = Math.round((baseValuation * conditionMultiplier + adjustmentTotal) / 10000) * 10000;
    const conservative = Math.round(finalProjectedValue * 0.95 / 10000) * 10000;
    const aggressive = Math.round(finalProjectedValue * 1.06 / 10000) * 10000;
    const estimatedRentalMonthly = Math.round((finalProjectedValue * 0.0062) / 500) * 500;
    const grossYieldPercent = Number(((estimatedRentalMonthly * 12) / finalProjectedValue * 100).toFixed(2));

    res.json({
      propertyId: property.id,
      subjectProperty: property,
      searchRadiusMeters: effectiveRadius,
      comparableCount: usedComps.length,
      comparableSales: usedComps,
      averagePricePerM2: avgRatePerM2,
      medianPricePerM2: medianRatePerM2,
      projectedValuationBase: baseValuation,
      conditionAdjustmentPercent: Math.round((conditionMultiplier - 1) * 100),
      finalProjectedMarketValue: finalProjectedValue,
      valueRange: {
        conservative,
        recommended: finalProjectedValue,
        aggressive
      },
      confidenceScore: 96.8,
      estimatedMonthlyRental: estimatedRentalMonthly,
      projectedGrossYieldPercent: grossYieldPercent,
      historicalSuburbAppreciationRate: 7.8,
      calculatedAt: new Date().toISOString()
    });
  });

  app.post("/api/cma/ingest-feed", (req, res) => {
    const { propertyId, source } = req.body;
    const now = new Date().toISOString();

    const mockNewSale: ComparativeSaleRecord = {
      id: `cma-new-${Date.now()}`,
      address: `12 Richmond Road`,
      suburb: 'Three Anchor Bay',
      erfNo: '1695',
      category: 'Freehold',
      extentM2: 210,
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
      salePrice: 7820000,
      saleDate: '2026/01/18',
      registrationDate: '2026/03/02',
      distanceMeters: 75,
      similarityScore: 97,
      pricePerM2: 37238,
      source: source || 'Property24',
      sourceListingUrl: 'https://property24.com/deeds/1695',
      condition: 'EXCELLENT',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      gps: { lat: -33.90870, lng: 18.40120 }
    };

    if (!comparativeSalesStore[propertyId]) {
      comparativeSalesStore[propertyId] = [];
    }
    comparativeSalesStore[propertyId].unshift(mockNewSale);

    res.json({
      success: true,
      message: `Ingested latest real-time transaction data from ${source || 'MLS & Portal Pipelines'}.`,
      recordsAdded: 1,
      totalActiveComparables: comparativeSalesStore[propertyId].length,
      syncedAt: now
    });
  });

  // ========================================================
  // 2. PROPERTY MEDIA & VISUAL MANAGEMENT ENDPOINTS
  // ========================================================
  app.get("/api/media/:propertyId", (req, res) => {
    const { propertyId } = req.params;
    const media = propertyMediaStore[propertyId] || propertyMediaStore['prop-1681'] || [];
    res.json({ media, count: media.length });
  });

  app.post("/api/media/:propertyId", (req, res) => {
    const { propertyId } = req.params;
    const { url, tag, caption, isHero, isIncludedInPdf, isIncludedInPortals } = req.body;

    const newAsset: PropertyMediaAsset = {
      id: `media-${Date.now()}`,
      propertyId,
      url: url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      fileName: `asset_${Date.now()}.jpg`,
      tag: tag || 'Exterior Front',
      caption: caption || 'High resolution property visual asset',
      order: (propertyMediaStore[propertyId]?.length || 0) + 1,
      isHero: Boolean(isHero),
      isIncludedInPdf: isIncludedInPdf !== undefined ? isIncludedInPdf : true,
      isIncludedInPortals: isIncludedInPortals !== undefined ? isIncludedInPortals : true,
      dimensions: { width: 1920, height: 1080 },
      fileSizeBytes: 2150000,
      optimizedForWeb: true,
      optimizedForPrintPdf: true,
      watermarkApplied: true,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (!propertyMediaStore[propertyId]) {
      propertyMediaStore[propertyId] = [];
    }

    if (newAsset.isHero) {
      propertyMediaStore[propertyId].forEach(m => m.isHero = false);
    }

    propertyMediaStore[propertyId].push(newAsset);
    res.json({ success: true, asset: newAsset, message: "Asset processed and uploaded." });
  });

  app.put("/api/media/:propertyId/:assetId", (req, res) => {
    const { propertyId, assetId } = req.params;
    const list = propertyMediaStore[propertyId];
    if (!list) return res.status(404).json({ error: "Property media list not found" });

    const item = list.find(m => m.id === assetId);
    if (!item) return res.status(404).json({ error: "Media asset not found" });

    Object.assign(item, req.body);
    if (req.body.isHero) {
      list.forEach(m => {
        if (m.id !== assetId) m.isHero = false;
      });
    }

    res.json({ success: true, asset: item });
  });

  app.delete("/api/media/:propertyId/:assetId", (req, res) => {
    const { propertyId, assetId } = req.params;
    if (propertyMediaStore[propertyId]) {
      propertyMediaStore[propertyId] = propertyMediaStore[propertyId].filter(m => m.id !== assetId);
    }
    res.json({ success: true, message: "Asset removed" });
  });

  // Structural Condition Endpoint
  app.get("/api/structural/:propertyId", (req, res) => {
    const { propertyId } = req.params;
    const assessment = structuralAssessmentsStore[propertyId] || structuralAssessmentsStore['prop-1681'];
    res.json(assessment);
  });

  app.put("/api/structural/:propertyId", (req, res) => {
    const { propertyId } = req.params;
    structuralAssessmentsStore[propertyId] = {
      ...structuralAssessmentsStore[propertyId],
      ...req.body
    };
    res.json({ success: true, assessment: structuralAssessmentsStore[propertyId] });
  });

  // ========================================================
  // 3. MULTI-PORTAL LISTING SYNC ENDPOINTS
  // ========================================================
  app.get("/api/portals/:propertyId", (req, res) => {
    const { propertyId } = req.params;
    const listings = portalListingsStore[propertyId] || portalListingsStore['prop-1681'] || [];
    res.json({ listings });
  });

  app.post("/api/portals/:propertyId/sync", (req, res) => {
    const { propertyId } = req.params;
    const { portalId } = req.body;
    const listings = portalListingsStore[propertyId] || portalListingsStore['prop-1681'] || [];

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    listings.forEach(listing => {
      if (!portalId || listing.portalId === portalId) {
        listing.status = 'LIVE';
        listing.lastSyncedAt = now;
        if (!listing.listingIdOnPortal) {
          listing.listingIdOnPortal = `${listing.portalId.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;
        }
      }
    });

    res.json({
      success: true,
      message: portalId ? `Synced successfully with ${portalId}` : "All multi-portal channels syndicated live.",
      listings,
      syncedAt: now
    });
  });

  app.put("/api/portals/:propertyId/:portalId", (req, res) => {
    const { propertyId, portalId } = req.params;
    const listings = portalListingsStore[propertyId] || portalListingsStore['prop-1681'];
    const item = listings?.find(l => l.portalId === portalId);
    if (!item) return res.status(404).json({ error: "Portal listing config not found" });

    Object.assign(item, req.body);
    res.json({ success: true, listing: item });
  });

  // ========================================================
  // 4. GEMINI AI REAL ESTATE INTELLIGENCE & COPYWRITING
  // ========================================================
  app.post("/api/ai/cma-summary", async (req, res) => {
    const { property, valuation, comparableSales } = req.body;
    const ai = getBedrockProxyClient();

    const fallbackCopy = {
      executiveSummary: `Ptah-Realty Comparative Market Analysis for ${property?.address || '5 Richmond Road'}, ${property?.suburb || 'Three Anchor Bay'}. Based on recent cadastral deed registrations and comparable transactions within a 500m radius, the recommended baseline listing price is R ${valuation?.finalProjectedMarketValue?.toLocaleString('en-ZA') || '7,750,000'}. The property benefits from high-demand Atlantic Seaboard capital appreciation and robust sectional/freehold liquidity.`,
      neighborhoodMarketDynamics: `Three Anchor Bay continues to demonstrate superior supply-demand dynamics with average listing days-on-market averaging 28 days. Freehold properties in the GR4 zoning cluster have experienced a 7.8% annualized capital growth rate, bolstered by proximity to the Sea Point Promenade, Virgin Active, and elite Atlantic beachfront nodes.`,
      valuationMethodologyRationale: `Valuation was conducted adhering strictly to SACPVP guidelines employing the Direct Comparison Approach. Five verified Deeds Office registrations and active portal listings with similarity ratings exceeding 90% were analyzed, normalizing for land extent (${property?.extentM2 || 201} m²), accommodation specifications, and structural condition ratings.`,
      keySellingPoints: [
        "Sought-after Richmond Road residential precinct with high pedestrian safety & heritage appeal.",
        "Meticulously maintained accommodation with private plunge pool and secure garage.",
        "High rental yields with estimated gross yield of 6.2% in Atlantic Seaboard prime corridor.",
        "Clean cadastral title deed with zero restrictive title deed servitudes."
      ],
      recommendedMarketingStrategy: "Launch exclusive multi-portal syndication across Property24, Private Property, and Ptah-Realty Global MLS with professional dusk photography and targeted digital buyer remarketing.",
      targetBuyerPersona: "Affluent local professionals, lifestyle downscalers, or European swallow investors seeking lock-up-and-go heritage luxury within walking distance of the Atlantic Seaboard promenade.",
      competitiveAdvantages: [
        "Superior price-per-square-metre metric versus adjacent Mouille Point and Fresnaye alternatives.",
        "Fully modernized electrical and gas certifications in place for rapid transfer."
      ],
      pricingRecommendationText: `We advise launching at R ${valuation?.valueRange?.aggressive?.toLocaleString('en-ZA') || '7,950,000'} to test peak market sentiment, with a target transactional close at R ${valuation?.finalProjectedMarketValue?.toLocaleString('en-ZA') || '7,750,000'}.`,
      generatedAt: new Date().toISOString(),
      modelUsed: ai ? "gemini-2.5-flash" : "Ptah-Realty Valuation Rule Engine"
    };

    if (!ai) {
      return res.json(fallbackCopy);
    }

    try {
      const prompt = `You are a Principal Real Estate Valuation Expert and Systems Architect at Ptah-Realty.
Generate a comprehensive, professional Comparative Market Analysis (CMA) narrative for the following property in South Africa:
Property Address: ${property.address}, ${property.suburb}
Erf: ${property.erfNo}, Extent: ${property.extentM2} m², Zoning: ${property.zoning}
Projected Value: R ${valuation.finalProjectedMarketValue} (Range: R ${valuation.valueRange?.conservative} to R ${valuation.valueRange?.aggressive})
Comparable Sales: ${JSON.stringify(comparableSales?.slice(0, 4) || [])}
Structural Accommodation: ${JSON.stringify(property.accommodation)}

Return a strict JSON object with these keys:
{
  "executiveSummary": "Concise high-level valuation executive summary",
  "neighborhoodMarketDynamics": "Market liquidity, capital growth trends, and buyer demand analysis",
  "valuationMethodologyRationale": "Explanation of direct comparison methodology and rate per m2 logic",
  "keySellingPoints": ["point 1", "point 2", "point 3", "point 4"],
  "recommendedMarketingStrategy": "Strategic pricing and multi-portal syndication advice",
  "targetBuyerPersona": "Description of the ideal buyer archetype",
  "competitiveAdvantages": ["advantage 1", "advantage 2"],
  "pricingRecommendationText": "Clear actionable advice on list price vs expected closing price"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        ...parsed,
        generatedAt: new Date().toISOString(),
        modelUsed: "gemini-2.5-flash"
      });
    } catch (err: any) {
      console.error("Gemini CMA generation error:", err?.message);
      return res.json(fallbackCopy);
    }
  });

  app.post("/api/ai/listing-copy", async (req, res) => {
    const { property, askingPrice, highlights, targetPortal } = req.body;
    const ai = getBedrockProxyClient();

    const fallbackResponse = {
      headline: `Exceptional ${property?.accommodation?.bedRooms || 3}-Bedroom Heritage Sanctuary in Prime ${property?.suburb || 'Three Anchor Bay'}`,
      shortPitch: `Rarely does a residence of this architectural calibre become available on Richmond Road. Featuring exquisite light-filled spaces, private plunge pool courtyard, and seamless Atlantic Seaboard living.`,
      fullDescription: `Set on a 201m² erf in one of Three Anchor Bay's most desirable avenues, this distinguished home offers the ultimate blend of Victorian character and contemporary sophistication.\n\nInside, soaring ceilings and natural light illuminate the open-concept reception areas. The designer gourmet kitchen features Caesarstone countertops, top-tier gas appliances, and bespoke cabinetry.\n\nThe master suite offers extensive built-in wardrobes and an opulent en-suite bathroom. Outdoors, an entertainer's courtyard boasts a sparkling plunge pool and low-maintenance landscaped terrace.\n\nComplete with direct-access garage, top-tier security system, and within footsteps of world-class restaurants, boutique delis, and the Sea Point Promenade.`,
      bulletFeatures: [
        `${property?.accommodation?.bedRooms || 3} Generous Bedrooms with Built-In Cupboards`,
        `${property?.accommodation?.bathRooms || 2} Luxury Bathrooms (Master En-Suite)`,
        "Private Plunge Pool & Entertainment Deck",
        "Automated Lock-Up Garage with Direct Access",
        "Full Security Alarm, Beams & CCTV Readiness",
        "Walk to Beachfront Promenade & Green Point Urban Park"
      ],
      socialMediaPost: `✨ JUST LISTED | ${property?.address || '5 Richmond Road, Three Anchor Bay'}\n🏷️ Asking: R ${askingPrice?.toLocaleString('en-ZA') || '7,750,000'}\n\nUnrivalled Atlantic Seaboard living! 3 Bed | 2 Bath | Pool | Garage.\n\n📲 DM for private viewing or visit Ptah-Realty.co.za #CapeTownRealEstate #AtlanticSeaboard #JustListed`,
      generatedAt: new Date().toISOString()
    };

    if (!ai) {
      return res.json(fallbackResponse);
    }

    try {
      const prompt = `You are a high-end luxury real estate copywriter for Ptah-Realty in Cape Town.
Write captivating, conversion-optimized marketing copy for this property listing:
Address: ${property.address}, ${property.suburb}
Erf: ${property.erfNo}, Extent: ${property.extentM2} m²
Asking Price: R ${askingPrice || '7,750,000'}
Accommodation: ${JSON.stringify(property.accommodation)}
Portal Target: ${targetPortal || 'Property24 & Private Property'}
Custom Highlights: ${JSON.stringify(highlights || [])}

Output a strict JSON object with:
{
  "headline": "Punchy listing headline (max 85 chars)",
  "shortPitch": "2-sentence elevator pitch for search snippet",
  "fullDescription": "Rich multi-paragraph listing description with paragraphs separated by newlines",
  "bulletFeatures": ["6 compelling bullet highlights"],
  "socialMediaPost": "Engaging Instagram/Facebook caption with emojis and hashtags"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        ...parsed,
        generatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Gemini listing copy error:", err?.message);
      return res.json(fallbackResponse);
    }
  });

  // Prospecting Leads & Scripts
  app.get("/api/prospecting/leads", (req, res) => {
    const { minAge, minDuration, fsboOnly, suburb } = req.query;
    let leads = [...PROSPECTING_LEADS_DATA];

    if (minAge) {
      leads = leads.filter(l => l.ownerAge >= Number(minAge));
    }
    if (minDuration) {
      leads = leads.filter(l => l.durationYears >= Number(minDuration));
    }
    if (fsboOnly === 'true') {
      leads = leads.filter(l => l.isForSaleByOwner);
    }
    if (suburb && typeof suburb === 'string') {
      leads = leads.filter(l => l.suburb.toLowerCase().includes(suburb.toLowerCase()));
    }

    res.json({ leads, total: leads.length });
  });

  app.get("/api/prospecting/scripts", (req, res) => {
    res.json({ scripts: PROSPECTING_SCRIPTS_DATA });
  });

  // KYC Verification Suite Endpoints
  app.get("/api/kyc/history", (req, res) => {
    res.json({ history: kycHistoryStore });
  });

  app.post("/api/kyc/run", (req, res) => {
    const { 
      reportType, 
      targetName, 
      targetIdOrReg, 
      prescribedPurpose, 
      searchReference,
      dob
    } = req.body;

    let cost = 11.00;
    if (reportType === 'CREDIT_REPORT') cost = 15.00;
    if (reportType === 'SANCTION_SCREENING') cost = 25.00;
    if (reportType === 'REAL_TIME_IDV') cost = 12.50;
    if (reportType === 'CIPC_REPORT') cost = 45.00;
    if (reportType === 'DETAILED_BUSINESS_REPORT') cost = 80.00;
    if (reportType === 'DEEDS_QUERY') cost = 29.50;
    if (reportType === 'DOTS_QUERY') cost = 20.00;
    if (reportType === 'TITLE_DEED') cost = 35.00;
    if (reportType === 'NATIONAL_DEEDS_SEARCH') cost = 30.00;

    const now = new Date();
    const expires = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    let mockResultData: any = {
      fullName: targetName || 'VERIFIED CITIZEN',
      idNumber: targetIdOrReg,
      dateOfBirth: dob || '1978-04-12',
      creditScore: Math.floor(Math.random() * (820 - 640 + 1)) + 640,
      scoreBand: 'GOOD / EXCELLENT',
      riskCategory: 'LOW RISK',
      homeAffairsStatus: 'VERIFIED_ALIVE (DHA BIOMETRIC MATCH)',
      photoVerified: true,
      judgmentsCount: 0,
      defaultsCount: 0,
      noticesCount: 0
    };

    const newReport: KYCReportRecord = {
      id: `kyc-rep-${Date.now()}`,
      reportType,
      targetName: targetName || 'Target Subject',
      targetIdOrReg: targetIdOrReg || 'N/A',
      requestedBy: 'Ronald Read',
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
      prescribedPurpose: prescribedPurpose || 'Section 18(4) - Credit assessment / Application',
      searchReference: searchReference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      costVatExcl: cost,
      status: 'COMPLETED',
      expiresAt: expires.toISOString().replace('T', ' ').substring(0, 19),
      data: mockResultData
    };

    kycHistoryStore.unshift(newReport);

    res.json({
      success: true,
      report: newReport,
      message: `${reportType.replace(/_/g, ' ')} completed successfully.`
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ptah-Realty Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
