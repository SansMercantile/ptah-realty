import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  Building,
  Home,
  MapPin,
  Sparkles,
  Info,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PropertyListing } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RentalYieldCalculatorProps {
  listings?: PropertyListing[];
  initialListing?: PropertyListing | null;
  onSelectListing?: (listing: PropertyListing) => void;
}

// South African SARS Transfer Duty Tax Brackets (Effective 2025/2026)
export function calculateSarsTransferDuty(propertyPrice: number): number {
  if (propertyPrice <= 1100000) return 0;
  if (propertyPrice <= 1512500) {
    return (propertyPrice - 1100000) * 0.03;
  }
  if (propertyPrice <= 2117500) {
    return 12375 + (propertyPrice - 1512500) * 0.06;
  }
  if (propertyPrice <= 2722500) {
    return 48675 + (propertyPrice - 2117500) * 0.08;
  }
  if (propertyPrice <= 12100000) {
    return 97075 + (propertyPrice - 2722500) * 0.11;
  }
  return 1128600 + (propertyPrice - 12100000) * 0.13;
}

// Typical rental market benchmark presets by luxury suburb
export const RENTAL_MARKET_PRESETS: {
  suburb: string;
  avgYield: number;
  typicalRentPerMillion: number;
  sampleMonthlyRent: number;
  notes: string;
}[] = [
  {
    suburb: 'Clifton & Bantry Bay',
    avgYield: 5.2,
    typicalRentPerMillion: 4400,
    sampleMonthlyRent: 120000,
    notes: 'Prime international high-season & luxury corporate tenancies; strong capital appreciation',
  },
  {
    suburb: 'Camps Bay',
    avgYield: 6.8,
    typicalRentPerMillion: 5500,
    sampleMonthlyRent: 95000,
    notes: 'High demand holiday villa yields, luxury short-to-medium leases',
  },
  {
    suburb: 'Sandton & Hyde Park',
    avgYield: 7.4,
    typicalRentPerMillion: 6100,
    sampleMonthlyRent: 55000,
    notes: 'Executive corporate relocations, diplomatic missions, and financial sector expat tenants',
  },
  {
    suburb: 'Franschhoek & Winelands',
    avgYield: 6.1,
    typicalRentPerMillion: 5000,
    sampleMonthlyRent: 65000,
    notes: 'Lifestyle and equestrian estates; seasonal European long-stay rentals',
  },
  {
    suburb: 'Constantia & Bishopscourt',
    avgYield: 5.8,
    typicalRentPerMillion: 4700,
    sampleMonthlyRent: 85000,
    notes: 'Consistently high occupancy by diplomatic and multinational families',
  },
  {
    suburb: 'V&A Waterfront & Foreshore',
    avgYield: 7.9,
    typicalRentPerMillion: 6400,
    sampleMonthlyRent: 48000,
    notes: 'High-density canal and yacht marina apartments with robust short-term yield',
  },
];

export const RentalYieldCalculator: React.FC<RentalYieldCalculatorProps> = ({
  listings = [],
  initialListing = null,
  onSelectListing,
}) => {
  // Selected Property (or Custom)
  const [selectedListingId, setSelectedListingId] = useState<string>(
    initialListing?.id || (listings.length > 0 ? listings[0].id : 'custom')
  );

  const activeListing = useMemo(() => {
    return listings.find((l) => l.id === selectedListingId) || null;
  }, [listings, selectedListingId]);

  // Acquisition Costs Inputs
  const [purchasePrice, setPurchasePrice] = useState<number>(
    initialListing?.price || (listings.length > 0 ? listings[0].price : 18500000)
  );
  const [customTransferDuty, setCustomTransferDuty] = useState<number | null>(null);
  const [conveyancingLegalFee, setConveyancingLegalFee] = useState<number>(145000);
  const [renovationCapex, setRenovationCapex] = useState<number>(250000);
  const [otherAcquisitionCosts, setOtherAcquisitionCosts] = useState<number>(35000);

  // Rental Market & Income Inputs
  const [monthlyMarketRent, setMonthlyMarketRent] = useState<number>(85000);
  const [occupancyRatePercent, setOccupancyRatePercent] = useState<number>(95);
  const [annualRentEscalationPercent, setAnnualRentEscalationPercent] = useState<number>(6.5);
  const [capitalGrowthAnnualPercent, setCapitalGrowthAnnualPercent] = useState<number>(6.0);

  // Operating Expenses Inputs (Monthly)
  const [monthlyLeviesBodyCorp, setMonthlyLeviesBodyCorp] = useState<number>(4500);
  const [monthlyRatesAndTaxes, setMonthlyRatesAndTaxes] = useState<number>(3800);
  const [propertyManagementFeePercent, setPropertyManagementFeePercent] = useState<number>(8.0);
  const [annualMaintenancePercent, setAnnualMaintenancePercent] = useState<number>(1.0); // % of property value per annum

  // Copy feedback state
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Sync state when active listing changes
  const handleSelectListing = (listingId: string) => {
    setSelectedListingId(listingId);
    if (listingId === 'custom') return;

    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      setPurchasePrice(listing.price);
      setCustomTransferDuty(null);

      // Estimate baseline rent using suburb heuristic
      const preset = RENTAL_MARKET_PRESETS.find((p) =>
        listing.suburb.toLowerCase().includes(p.suburb.toLowerCase()) ||
        p.suburb.toLowerCase().includes(listing.suburb.toLowerCase())
      ) || RENTAL_MARKET_PRESETS[0];

      const estimatedRent = Math.round((listing.price / 1000000) * preset.typicalRentPerMillion);
      setMonthlyMarketRent(estimatedRent > 0 ? estimatedRent : 75000);

      if (onSelectListing) {
        onSelectListing(listing);
      }
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    const price = Math.max(0, Number(purchasePrice) || 0);

    // 1. Statutory Transfer Duty
    const transferDuty = customTransferDuty !== null ? customTransferDuty : calculateSarsTransferDuty(price);

    // Total Acquisition Costs
    const totalAcquisitionCost = price + transferDuty + conveyancingLegalFee + renovationCapex + otherAcquisitionCosts;

    // 2. Rental Incomes
    const monthlyGrossRent = Math.max(0, Number(monthlyMarketRent) || 0);
    const occupancyFactor = Math.min(100, Math.max(0, Number(occupancyRatePercent) || 0)) / 100;
    
    // Effective Annual Gross Rental Income (factoring occupancy vacancy)
    const effectiveAnnualGrossRent = monthlyGrossRent * 12 * occupancyFactor;
    const theoretical100PercentGrossRent = monthlyGrossRent * 12;

    // 3. Operating Expenses
    const managementFeeRate = (Number(propertyManagementFeePercent) || 0) / 100;
    const monthlyManagementFee = monthlyGrossRent * managementFeeRate;

    const annualMaintenanceCost = price * ((Number(annualMaintenancePercent) || 1.0) / 100);
    const monthlyMaintenanceProvision = annualMaintenanceCost / 12;

    const totalMonthlyOperatingExpenses =
      monthlyLeviesBodyCorp +
      monthlyRatesAndTaxes +
      monthlyManagementFee +
      monthlyMaintenanceProvision;

    const totalAnnualOperatingExpenses = totalMonthlyOperatingExpenses * 12;

    // 4. Net Operating Income (NOI) & Monthly Net Cashflow
    const annualNetOperatingIncome = effectiveAnnualGrossRent - totalAnnualOperatingExpenses;
    const monthlyNetCashflow = (effectiveAnnualGrossRent / 12) - totalMonthlyOperatingExpenses;

    // 5. Core Yield Metrics
    // Gross Yield = (Annual Gross Rent / Purchase Price) * 100
    const grossRentalYield = price > 0 ? (theoretical100PercentGrossRent / price) * 100 : 0;
    const effectiveGrossYield = price > 0 ? (effectiveAnnualGrossRent / price) * 100 : 0;

    // Net Rental Yield = (Annual Net Operating Income / Total Acquisition Cost) * 100
    const netRentalYield = totalAcquisitionCost > 0 ? (annualNetOperatingIncome / totalAcquisitionCost) * 100 : 0;

    // Capitalization Rate (Cap Rate) = (Net Operating Income / Purchase Price) * 100
    const capRate = price > 0 ? (annualNetOperatingIncome / price) * 100 : 0;

    // 6. Multi-Year Projections (5-Year & 10-Year Wealth Projection)
    const capitalGrowthRate = (Number(capitalGrowthAnnualPercent) || 6.0) / 100;
    const rentEscalationRate = (Number(annualRentEscalationPercent) || 6.5) / 100;

    // 5 Years
    const futureValue5Years = price * Math.pow(1 + capitalGrowthRate, 5);
    const capitalAppreciation5Years = futureValue5Years - price;
    let cumulativeNetRent5Years = 0;
    let currentYearNetRent = annualNetOperatingIncome;
    for (let y = 1; y <= 5; y++) {
      cumulativeNetRent5Years += currentYearNetRent;
      currentYearNetRent *= (1 + rentEscalationRate);
    }
    const totalWealthGenerated5Years = capitalAppreciation5Years + cumulativeNetRent5Years;
    const totalRoi5YearsPercent = totalAcquisitionCost > 0 ? (totalWealthGenerated5Years / totalAcquisitionCost) * 100 : 0;

    // 10 Years
    const futureValue10Years = price * Math.pow(1 + capitalGrowthRate, 10);
    const capitalAppreciation10Years = futureValue10Years - price;
    let cumulativeNetRent10Years = 0;
    let currentYearNetRent10 = annualNetOperatingIncome;
    for (let y = 1; y <= 10; y++) {
      cumulativeNetRent10Years += currentYearNetRent10;
      currentYearNetRent10 *= (1 + rentEscalationRate);
    }
    const totalWealthGenerated10Years = capitalAppreciation10Years + cumulativeNetRent10Years;
    const totalRoi10YearsPercent = totalAcquisitionCost > 0 ? (totalWealthGenerated10Years / totalAcquisitionCost) * 100 : 0;

    // Investment Character Classification
    let gradeLabel = 'Balanced Luxury Core';
    let gradeBadgeColor = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    if (netRentalYield >= 6.5 || grossRentalYield >= 8.0) {
      gradeLabel = 'High-Yield Income Generator';
      gradeBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
    } else if (capitalGrowthRate >= 0.07 || (activeListing?.suburb && ['Clifton', 'Bantry Bay', 'Camps Bay'].includes(activeListing.suburb))) {
      gradeLabel = 'Prime Capital Appreciation Asset';
      gradeBadgeColor = 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
    }

    return {
      price,
      transferDuty,
      totalAcquisitionCost,
      monthlyGrossRent,
      effectiveAnnualGrossRent,
      theoretical100PercentGrossRent,
      totalMonthlyOperatingExpenses,
      totalAnnualOperatingExpenses,
      annualNetOperatingIncome,
      monthlyNetCashflow,
      grossRentalYield,
      effectiveGrossYield,
      netRentalYield,
      capRate,
      futureValue5Years,
      capitalAppreciation5Years,
      cumulativeNetRent5Years,
      totalWealthGenerated5Years,
      totalRoi5YearsPercent,
      futureValue10Years,
      capitalAppreciation10Years,
      cumulativeNetRent10Years,
      totalWealthGenerated10Years,
      totalRoi10YearsPercent,
      gradeLabel,
      gradeBadgeColor,
    };
  }, [
    purchasePrice,
    customTransferDuty,
    conveyancingLegalFee,
    renovationCapex,
    otherAcquisitionCosts,
    monthlyMarketRent,
    occupancyRatePercent,
    annualRentEscalationPercent,
    capitalGrowthAnnualPercent,
    monthlyLeviesBodyCorp,
    monthlyRatesAndTaxes,
    propertyManagementFeePercent,
    annualMaintenancePercent,
    activeListing,
  ]);

  // Handle Copy Investor Brief
  const handleCopyBrief = () => {
    const propertyTitle = activeListing?.title || 'Luxury Investment Property';
    const suburb = activeListing?.suburb || 'Prime Real Estate';
    const briefText = `🏛️ PTAH REALTY — RENTAL YIELD & INVESTMENT APPRAISAL
Property: ${propertyTitle} (${suburb})
Acquisition Price: ${formatCurrency(calculations.price)}
Total Acquisition Cost (Inc. Transfer Duty & Legal): ${formatCurrency(calculations.totalAcquisitionCost)}

📈 CORE RETURN METRICS:
• Gross Rental Yield: ${calculations.grossRentalYield.toFixed(2)}% p.a.
• Net Rental Yield: ${calculations.netRentalYield.toFixed(2)}% p.a.
• Capitalization Rate (Cap Rate): ${calculations.capRate.toFixed(2)}%
• Est. Monthly Market Rent: ${formatCurrency(calculations.monthlyGrossRent)} / month
• Monthly Net Cashflow: ${formatCurrency(calculations.monthlyNetCashflow)} / month
• Annual Net Operating Income (NOI): ${formatCurrency(calculations.annualNetOperatingIncome)}

💎 5-YEAR WEALTH PROJECTION (@ ${capitalGrowthAnnualPercent}% p.a. capital growth):
• Projected Property Value (Year 5): ${formatCurrency(calculations.futureValue5Years)}
• Cumulative Net Rental Income: ${formatCurrency(calculations.cumulativeNetRent5Years)}
• Total 5-Year Wealth Created: ${formatCurrency(calculations.totalWealthGenerated5Years)} (${calculations.totalRoi5YearsPercent.toFixed(1)}% ROI)

Investment Classification: ${calculations.gradeLabel}
Appraised by Ptah Realty Luxury Advisory | https://ptahrealty.com/`;

    navigator.clipboard.writeText(briefText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="space-y-6" id="rental-yield-calculator-root">
      {/* Header & Property Selector */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Rental Yield & Potential Return Calculator
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${calculations.gradeBadgeColor}`}>
                  {calculations.gradeLabel}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Model gross and net yields against statutory transfer duty, acquisition capex, and live market rental rates.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyBrief}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
              title="Copy Investor Executive Summary"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Investor Brief</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Property Selector Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-400" />
            Select Portfolio Listing:
          </label>
          <div className="flex-1 min-w-0">
            <select
              value={selectedListingId}
              onChange={(e) => handleSelectListing(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.referenceNumber} — {l.title} ({l.suburb}) • {formatCurrency(l.price)}
                </option>
              ))}
              <option value="custom">✏️ Custom Custom Property / Manual Simulation</option>
            </select>
          </div>

          {activeListing && (
            <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0 hidden lg:block">
              {activeListing.bedrooms} Beds • {activeListing.bathrooms} Baths • {activeListing.suburb}
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Yield Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Rental Yield */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Gross Rental Yield</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Annual Rent / Price
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {calculations.grossRentalYield.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 font-medium">p.a.</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {formatCurrency(calculations.theoretical100PercentGrossRent)} / year gross
          </p>
        </div>

        {/* Net Rental Yield */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 shadow-xs bg-emerald-50/20 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300">Net Rental Yield</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              NOI / Total Cost
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {calculations.netRentalYield.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 font-medium">p.a.</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            NOI: {formatCurrency(calculations.annualNetOperatingIncome)} / year
          </p>
        </div>

        {/* Capitalization Rate (Cap Rate) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Cap Rate</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              NOI / Price
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {calculations.capRate.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 font-medium">p.a.</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Excludes initial transfer capex
          </p>
        </div>

        {/* Monthly Net Cashflow */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Net Cashflow</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Monthly
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {formatCurrency(calculations.monthlyNetCashflow)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            After levies, rates & maintenance
          </p>
        </div>
      </div>

      {/* Two Column Layout: Detailed Financial Inputs vs Breakdown Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Acquisition Costs & Rent Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Property Acquisition Costs */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Property Acquisition Costs
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Total: {formatCurrency(calculations.totalAcquisitionCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Purchase / Listing Price (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    step={100000}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    SARS Transfer Duty
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Auto SARS Tiered
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                  <input
                    type="number"
                    value={calculations.transferDuty}
                    onChange={(e) => setCustomTransferDuty(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Based on statutory South African revenue service brackets.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Conveyancing & Deeds Registration Fees
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                  <input
                    type="number"
                    value={conveyancingLegalFee}
                    onChange={(e) => setConveyancingLegalFee(Number(e.target.value))}
                    step={5000}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Initial Capex / Renovation / Staging
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                  <input
                    type="number"
                    value={renovationCapex}
                    onChange={(e) => setRenovationCapex(Number(e.target.value))}
                    step={25000}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Current Rental Market Rates & Tenancy */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Rental Market Rates & Tenancy Terms
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Gross: {formatCurrency(calculations.effectiveAnnualGrossRent)} / yr
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Estimated Monthly Market Rental (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                  <input
                    type="number"
                    value={monthlyMarketRent}
                    onChange={(e) => setMonthlyMarketRent(Number(e.target.value))}
                    step={2500}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Occupancy Rate
                  </label>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {occupancyRatePercent}% (~{(12 * (occupancyRatePercent / 100)).toFixed(1)} mo/yr)
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={occupancyRatePercent}
                  onChange={(e) => setOccupancyRatePercent(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Annual Rent Escalation
                  </label>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {annualRentEscalationPercent}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={annualRentEscalationPercent}
                  onChange={(e) => setAnnualRentEscalationPercent(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Capital Appreciation Rate
                  </label>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {capitalGrowthAnnualPercent}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="0.5"
                  value={capitalGrowthAnnualPercent}
                  onChange={(e) => setCapitalGrowthAnnualPercent(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Suburb Benchmark Presets Strip */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Quick Market Benchmark Bench:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RENTAL_MARKET_PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.suburb}
                    type="button"
                    onClick={() => {
                      const rent = Math.round((purchasePrice / 1000000) * preset.typicalRentPerMillion);
                      setMonthlyMarketRent(rent);
                    }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-800/60 text-left transition cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {preset.suburb}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      ~{preset.avgYield}% avg yield
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Monthly Operating Expenses */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  3. Operating Expenses & Deductions
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Total: {formatCurrency(calculations.totalMonthlyOperatingExpenses)} / mo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Monthly Body Corporate / Estate Levies
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                  <input
                    type="number"
                    value={monthlyLeviesBodyCorp}
                    onChange={(e) => setMonthlyLeviesBodyCorp(Number(e.target.value))}
                    step={500}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Municipal Rates & Property Taxes (Monthly)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                  <input
                    type="number"
                    value={monthlyRatesAndTaxes}
                    onChange={(e) => setMonthlyRatesAndTaxes(Number(e.target.value))}
                    step={500}
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Property Management Fee
                  </label>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {propertyManagementFeePercent}% of rent
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={propertyManagementFeePercent}
                  onChange={(e) => setPropertyManagementFeePercent(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Maintenance & Sinking Fund Provision
                  </label>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {annualMaintenancePercent}% of property value
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={annualMaintenancePercent}
                  onChange={(e) => setAnnualMaintenancePercent(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Investment Returns Summary & Multi-Year Projection (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Executive Return Ledger */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <span>Financial Yield Breakdown</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {calculations.netRentalYield.toFixed(2)}% Net Return
              </span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Purchase Price</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(calculations.price)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>SARS Transfer Duty</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  +{formatCurrency(calculations.transferDuty)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Legal & Capex Provisions</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  +{formatCurrency(conveyancingLegalFee + renovationCapex + otherAcquisitionCosts)}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-700">
                <span>Total Capital Outlay</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(calculations.totalAcquisitionCost)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Gross Monthly Market Rent</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(calculations.monthlyGrossRent)} / mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Operating Expenses & Levies</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(calculations.totalMonthlyOperatingExpenses)} / mo
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-700">
                  <span>Monthly Net In-Pocket Cashflow</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {formatCurrency(calculations.monthlyNetCashflow)} / mo
                  </span>
                </div>
              </div>
            </div>

            {/* Yield Visual Comparison Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Gross vs Net Yield Spread:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(calculations.grossRentalYield - calculations.netRentalYield).toFixed(2)}% expense drag
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${Math.min(100, (calculations.netRentalYield / Math.max(0.1, calculations.grossRentalYield)) * 100)}%` }}
                  title="Net Yield"
                />
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${Math.max(0, 100 - (calculations.netRentalYield / Math.max(0.1, calculations.grossRentalYield)) * 100)}%` }}
                  title="Expenses Drag"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Net Yield: {calculations.netRentalYield.toFixed(2)}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Gross Yield: {calculations.grossRentalYield.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* 5-Year & 10-Year Cumulative Wealth Engine */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-900 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Multi-Year Wealth Generation
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-300">
                @{capitalGrowthAnnualPercent}% Growth
              </span>
            </div>

            {/* 5 Years Projection */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  5-Year Milestone
                </span>
                <span className="text-xs font-extrabold text-emerald-400">
                  +{calculations.totalRoi5YearsPercent.toFixed(1)}% Total ROI
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Projected Asset Value:</span>
                  <span className="font-bold text-white text-xs">{formatCurrency(calculations.futureValue5Years)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cumulative Net Rent:</span>
                  <span className="font-bold text-amber-300 text-xs">{formatCurrency(calculations.cumulativeNetRent5Years)}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 border-t border-white/5 pt-1 flex justify-between">
                <span>Total Wealth Created (Capital + Rent):</span>
                <span className="font-extrabold text-emerald-400">{formatCurrency(calculations.totalWealthGenerated5Years)}</span>
              </div>
            </div>

            {/* 10 Years Projection */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  10-Year Horizon
                </span>
                <span className="text-xs font-extrabold text-emerald-400">
                  +{calculations.totalRoi10YearsPercent.toFixed(1)}% Total ROI
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Projected Asset Value:</span>
                  <span className="font-bold text-white text-xs">{formatCurrency(calculations.futureValue10Years)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cumulative Net Rent:</span>
                  <span className="font-bold text-amber-300 text-xs">{formatCurrency(calculations.cumulativeNetRent10Years)}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 border-t border-white/5 pt-1 flex justify-between">
                <span>Total Wealth Created:</span>
                <span className="font-extrabold text-emerald-400">{formatCurrency(calculations.totalWealthGenerated10Years)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
