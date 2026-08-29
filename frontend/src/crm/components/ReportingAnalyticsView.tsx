import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Award, 
  Percent, 
  Share2, 
  Calendar,
  Building,
  Target,
  Sparkles,
  ArrowUpRight,
  Calculator,
  Sliders,
  ShieldCheck,
  Zap,
  HelpCircle,
  Layers,
  MapPin
} from 'lucide-react';
import { Lead, LeadSource } from '../types';
import { formatCurrency, formatShortCurrency, exportLeadsToCSV } from '../utils/formatters';
import { LeadGeoHeatmap } from './LeadGeoHeatmap';
import { AgentPerformanceCard } from './AgentPerformanceCard';
import { SlaResponseEfficiencyWidget } from './SlaResponseEfficiencyWidget';

interface ReportingAnalyticsViewProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

const SOURCE_COLORS: Record<string, string> = {
  'Property 24': '#3b82f6',
  'Private Property': '#ef4444',
  'Ptah Realty Website': '#10b981',
  'Facebook / Instagram Ads': '#6366f1',
  'Competitor Syndication': '#f59e0b',
  'Direct Call / Walk-in': '#8b5cf6',
  'Gumtree / IOL Property': '#ec4899',
};

// Estimated monthly portal marketing / syndication spend in ZAR for ROI multiplier calculation
const ESTIMATED_MONTHLY_COST: Record<string, number> = {
  'Property 24': 18500,
  'Private Property': 12000,
  'Ptah Realty Website': 4500,
  'Facebook / Instagram Ads': 8000,
  'Competitor Syndication': 3500,
  'Direct Call / Walk-in': 1000,
  'Gumtree / IOL Property': 2000,
};

export const ReportingAnalyticsView: React.FC<ReportingAnalyticsViewProps> = ({ leads, onSelectLead }) => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Forecast scenario controls
  const [forecastScenario, setForecastScenario] = useState<'conservative' | 'expected' | 'optimistic'>('expected');
  const [commissionRate, setCommissionRate] = useState<number>(5.0); // 5.0% agency standard
  const [selectedForecastSource, setSelectedForecastSource] = useState<string>('all');

  const handleDownloadReport = () => {
    setIsExporting(true);
    exportLeadsToCSV(leads);
    setTimeout(() => {
      setIsExporting(false);
    }, 1200);
  };

  // Compute breakdown by lead source
  const sourceAnalytics = useMemo(() => {
    const map: Record<string, { total: number; won: number; value: number; contacted: number; viewing: number }> = {};

    leads.forEach((l) => {
      if (!map[l.source]) {
        map[l.source] = { total: 0, won: 0, value: 0, contacted: 0, viewing: 0 };
      }
      map[l.source].total += 1;
      if (l.status !== 'new') map[l.source].contacted += 1;
      if (l.status === 'viewing_scheduled' || l.status === 'offer_submitted' || l.status === 'deal_won') {
        map[l.source].viewing += 1;
      }
      if (l.status === 'deal_won') {
        map[l.source].won += 1;
        map[l.source].value += l.dealValue || l.propertyPrice || 0;
      }
    });

    return Object.entries(map).map(([source, stats]) => ({
      source,
      totalLeads: stats.total,
      contacted: stats.contacted,
      viewings: stats.viewing,
      dealsWon: stats.won,
      conversionRate: stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : '0',
      totalRevenue: stats.value,
      color: SOURCE_COLORS[source] || '#94a3b8',
    }));
  }, [leads]);

  // Overall KPIs
  const totalLeadsCount = leads.length;
  const wonLeadsCount = leads.filter((l) => l.status === 'deal_won').length;
  const overallConversionRate = totalLeadsCount > 0 ? ((wonLeadsCount / totalLeadsCount) * 100).toFixed(1) : '0';
  const totalClosedRevenue = leads
    .filter((l) => l.status === 'deal_won')
    .reduce((acc, l) => acc + (l.dealValue || l.propertyPrice || 0), 0);
  const totalActivePipeline = leads
    .filter((l) => l.status !== 'deal_won' && l.status !== 'deal_lost')
    .reduce((acc, l) => acc + (l.propertyPrice || 0), 0);

  // PREDICTIVE 90-DAY LEAD ROI & COMMISSION FORECAST CALCULATION
  const roiForecastData = useMemo(() => {
    // Multiplier for selected scenario
    const scenarioMultiplier = forecastScenario === 'conservative' ? 0.78 : forecastScenario === 'optimistic' ? 1.28 : 1.0;

    // Stage weights for active leads
    const stageProbabilities: Record<string, number> = {
      new: 0.12,
      contacted: 0.22,
      qualified: 0.38,
      viewing_scheduled: 0.62,
      offer_submitted: 0.88,
    };

    // Partition leads by source
    const sourcesList: string[] = Array.from(new Set(leads.map((l) => l.source as string)));

    const forecastPerSource = sourcesList.map((source) => {
      const sourceLeads = leads.filter((l) => l.source === source);
      const wonLeads = sourceLeads.filter((l) => l.status === 'deal_won');
      const activeLeads = sourceLeads.filter((l) => l.status !== 'deal_won' && l.status !== 'deal_lost');

      // Historical conversion rate (floor at 14% to avoid cold-start distortions)
      const historicalWinRate = sourceLeads.length > 0 
        ? Math.max(0.14, wonLeads.length / sourceLeads.length)
        : 0.18;

      // Average active property price for this source
      const avgPrice = activeLeads.length > 0
        ? activeLeads.reduce((acc, l) => acc + (l.propertyPrice || 0), 0) / activeLeads.length
        : sourceLeads.reduce((acc, l) => acc + (l.propertyPrice || 0), 0) / (sourceLeads.length || 1);

      // Calculate stage-weighted projected won deals over next 90 days
      const stageWeightedDeals = activeLeads.reduce((sum, lead) => {
        const baseProb = stageProbabilities[lead.status] || 0.15;
        // Factor in quality score bonus
        const scoreBonus = ((lead.leadScore || 75) - 50) / 200; // -0.1 to +0.25
        return sum + Math.max(0.05, Math.min(0.95, baseProb + scoreBonus));
      }, 0);

      // 90-day velocity estimate: blends active pipeline weight with historical conversion
      const rawProjectedDeals = activeLeads.length > 0
        ? (stageWeightedDeals * 0.7 + (activeLeads.length * historicalWinRate) * 0.3)
        : (sourceLeads.length * 0.25 * historicalWinRate);

      const projectedDeals = Math.max(0.2, rawProjectedDeals * scenarioMultiplier);
      const projectedGrossSales = projectedDeals * avgPrice;
      const projectedCommission = projectedGrossSales * (commissionRate / 100);

      // Estimated 90-day cost (3 months)
      const estimatedCost90d = ((ESTIMATED_MONTHLY_COST as Record<string, number>)[source] || 5000) * 3;
      const projectedNetMargin = projectedCommission - estimatedCost90d;
      const projectedRoiMultiple = estimatedCost90d > 0 ? (projectedCommission / estimatedCost90d).toFixed(1) : '15.0';

      // Confidence score (0-100)
      const confidence = Math.min(95, Math.max(55, Math.round(70 + (sourceLeads.length * 1.5))));

      return {
        source,
        activeLeadsCount: activeLeads.length,
        totalHistoricalLeads: sourceLeads.length,
        historicalWinRate: (historicalWinRate * 100).toFixed(1),
        avgDealPrice: avgPrice,
        projectedDeals: parseFloat(projectedDeals.toFixed(1)),
        projectedGrossSales,
        projectedCommission: Math.round(projectedCommission),
        estimatedCost90d,
        projectedNetMargin: Math.round(projectedNetMargin),
        projectedRoiMultiple,
        confidence,
        color: (SOURCE_COLORS as Record<string, string>)[source] || '#94a3b8',
      };
    });

    // Sort by projected commission descending
    forecastPerSource.sort((a, b) => b.projectedCommission - a.projectedCommission);

    const totalProjectedCommission = forecastPerSource.reduce((sum, item) => sum + item.projectedCommission, 0);
    const totalProjectedGrossSales = forecastPerSource.reduce((sum, item) => sum + item.projectedGrossSales, 0);
    const totalProjectedDeals = forecastPerSource.reduce((sum, item) => sum + item.projectedDeals, 0);
    const total90dSpend = forecastPerSource.reduce((sum, item) => sum + item.estimatedCost90d, 0);
    const overallRoiMultiple = total90dSpend > 0 ? (totalProjectedCommission / total90dSpend).toFixed(1) : '12.4';
    const topSource = forecastPerSource[0] || null;

    // 30, 60, 90-Day Trajectory Curve for chart
    const trajectoryData = [
      {
        horizon: 'Current (Day 0)',
        totalCommission: 0,
        Property24: 0,
        Website: 0,
        PrivateProperty: 0,
      },
      {
        horizon: 'Day 30 (Fast Pipeline)',
        totalCommission: Math.round(totalProjectedCommission * 0.24),
        Property24: Math.round((forecastPerSource.find((s) => s.source === 'Property 24')?.projectedCommission || 0) * 0.26),
        Website: Math.round((forecastPerSource.find((s) => s.source === 'Ptah Realty Website')?.projectedCommission || 0) * 0.28),
        PrivateProperty: Math.round((forecastPerSource.find((s) => s.source === 'Private Property')?.projectedCommission || 0) * 0.20),
      },
      {
        horizon: 'Day 60 (Mid-Cycle Closing)',
        totalCommission: Math.round(totalProjectedCommission * 0.62),
        Property24: Math.round((forecastPerSource.find((s) => s.source === 'Property 24')?.projectedCommission || 0) * 0.64),
        Website: Math.round((forecastPerSource.find((s) => s.source === 'Ptah Realty Website')?.projectedCommission || 0) * 0.65),
        PrivateProperty: Math.round((forecastPerSource.find((s) => s.source === 'Private Property')?.projectedCommission || 0) * 0.58),
      },
      {
        horizon: 'Day 90 (Full Forecast Target)',
        totalCommission: totalProjectedCommission,
        Property24: forecastPerSource.find((s) => s.source === 'Property 24')?.projectedCommission || 0,
        Website: forecastPerSource.find((s) => s.source === 'Ptah Realty Website')?.projectedCommission || 0,
        PrivateProperty: forecastPerSource.find((s) => s.source === 'Private Property')?.projectedCommission || 0,
      },
    ];

    return {
      forecastPerSource,
      totalProjectedCommission,
      totalProjectedGrossSales,
      totalProjectedDeals: parseFloat(totalProjectedDeals.toFixed(1)),
      total90dSpend,
      overallRoiMultiple,
      topSource,
      trajectoryData,
    };
  }, [leads, forecastScenario, commissionRate]);

  // Funnel data
  const funnelData = useMemo(() => {
    const stageCounts = {
      'Inbound Leads': leads.length,
      'Contacted': leads.filter((l) => l.status !== 'new').length,
      'Qualified': leads.filter((l) => ['qualified', 'viewing_scheduled', 'offer_submitted', 'deal_won'].includes(l.status)).length,
      'Viewing Booked': leads.filter((l) => ['viewing_scheduled', 'offer_submitted', 'deal_won'].includes(l.status)).length,
      'Offer Submitted': leads.filter((l) => ['offer_submitted', 'deal_won'].includes(l.status)).length,
      'Deals Won': leads.filter((l) => l.status === 'deal_won').length,
    };

    return Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count,
      conversionFromTop: totalLeadsCount > 0 ? ((count / totalLeadsCount) * 100).toFixed(0) : 0,
    }));
  }, [leads, totalLeadsCount]);

  // Lead sources for Pie Chart
  const pieData = useMemo(() => {
    return sourceAnalytics.map((item) => ({
      name: item.source,
      value: item.totalLeads,
      color: item.color,
    }));
  }, [sourceAnalytics]);

  // Monthly trends simulation
  const monthlyTrendsData = [
    { month: 'Apr 2026', Property24: 12, PrivateProperty: 8, Website: 6, Won: 3 },
    { month: 'May 2026', Property24: 18, PrivateProperty: 11, Website: 9, Won: 5 },
    { month: 'Jun 2026', Property24: 24, PrivateProperty: 14, Website: 12, Won: 7 },
    { month: 'Jul 2026', Property24: 31, PrivateProperty: 19, Website: 15, Won: 9 },
    { month: 'Aug 2026', Property24: 38, PrivateProperty: 22, Website: 18, Won: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Export Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Lead Source & Conversion Performance</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Ptah Realty CRM Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare acquisition channels (Property 24, Private Property, Website, Competitor networks) and optimize conversion velocity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-75"
            title="Export all leads with source, status, and property details to CSV"
          >
            {isExporting ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>Exporting Leads...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Lead Report</span>
                <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-800 text-[10px] font-mono">
                  {leads.length}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium">Overall Conversion Rate</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{overallConversionRate}%</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <span>+4.2%</span> vs industry benchmark (18%)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium">Closed Revenue (Deals Won)</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatShortCurrency(totalClosedRevenue)}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Est. Commission: <span className="text-emerald-800 font-semibold">{formatShortCurrency(totalClosedRevenue * 0.05)}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium">Active Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatShortCurrency(totalActivePipeline)}</div>
          <p className="text-[11px] text-slate-500 mt-1">{totalLeadsCount - wonLeadsCount} active opportunities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium">Avg Response Speed</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">11.4 mins</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Under 15-min SLA threshold</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURED: PREDICTIVE LEAD ROI & COMMISSION FORECAST (NEXT 90 DAYS) CARD */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
        {/* Card Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-700" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Predictive AI Revenue Engine
              </span>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                90-Day Horizon
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <span>Lead ROI Forecast & Projected Commission Earnings</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Projects expected gross sales and commission yield per lead source by modeling active stage probabilities, historical conversion velocity, and buyer quality ratings.
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scenario Selector */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setForecastScenario('conservative')}
                className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  forecastScenario === 'conservative'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Conservative
              </button>
              <button
                onClick={() => setForecastScenario('expected')}
                className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  forecastScenario === 'expected'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expected (AI Base)
              </button>
              <button
                onClick={() => setForecastScenario('optimistic')}
                className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                  forecastScenario === 'optimistic'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Optimistic
              </button>
            </div>

            {/* Commission Rate Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-500 font-medium">Commission:</span>
              <select
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                className="bg-transparent font-bold text-emerald-800 outline-none cursor-pointer text-xs"
              >
                <option value={4.0}>4.0% Standard</option>
                <option value={5.0}>5.0% Ptah Luxury</option>
                <option value={6.0}>6.0% Exclusive Mandate</option>
                <option value={7.5}>7.5% Commercial / Sub-dev</option>
              </select>
            </div>
          </div>
        </div>

        {/* Executive 90-Day Forecast Highlight Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4.5 rounded-xl border border-slate-700 shadow-xs relative overflow-hidden">
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>90-Day Projected Commission</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {formatCurrency(roiForecastData.totalProjectedCommission)}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              At {commissionRate}% commission on <strong className="text-emerald-300">{formatShortCurrency(roiForecastData.totalProjectedGrossSales)}</strong> gross deals.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Expected Closed Deals</span>
              <Target className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              ~{roiForecastData.totalProjectedDeals} Deals
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              From {leads.filter((l) => l.status !== 'deal_won' && l.status !== 'deal_lost').length} qualified pipeline opportunities.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Top ROI Source</span>
              <Award className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 truncate">
              {roiForecastData.topSource?.source || 'Property 24'}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              {formatCurrency(roiForecastData.topSource?.projectedCommission || 0)} projected yield ({roiForecastData.topSource?.projectedRoiMultiple}x ROI)
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Aggregate Marketing ROI</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700 font-mono tracking-tight">
              {roiForecastData.overallRoiMultiple}x Return
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Est. {formatShortCurrency(roiForecastData.total90dSpend)} total 90-day syndication spend.
            </p>
          </div>
        </div>

        {/* Visual Forecast Charts & Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chart A: Projected Commission by Source (Bar) */}
          <div className="lg:col-span-7 bg-slate-50/70 rounded-xl p-4.5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Projected 90-Day Commission Yield by Acquisition Channel
                </h4>
                <p className="text-[11px] text-slate-500">Estimated agency revenue per syndication portal in ZAR</p>
              </div>
              <span className="text-[11px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {commissionRate}% Rate
              </span>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={roiForecastData.forecastPerSource}
                  margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                >
                  <XAxis
                    dataKey="source"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(val) => `R${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Projected Commission']}
                  />
                  <Bar dataKey="projectedCommission" name="Projected Commission" radius={[6, 6, 0, 0]}>
                    {roiForecastData.forecastPerSource.map((entry, index) => (
                      <Cell key={`roi-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: 90-Day Commission Cumulative Milestone Trajectory */}
          <div className="lg:col-span-5 bg-slate-50/70 rounded-xl p-4.5 border border-slate-200 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                90-Day Cumulative Revenue Trajectory
              </h4>
              <p className="text-[11px] text-slate-500">Milestone realization curve (Days 30, 60, 90)</p>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={roiForecastData.trajectoryData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis dataKey="horizon" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(val) => `R${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Cumulative Commission']}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalCommission"
                    name="Cumulative Commission"
                    stroke="#059669"
                    fill="#10b981"
                    fillOpacity={0.25}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Per-Source ROI Forecast Matrix Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Channel-by-Channel 90-Day Commission & Yield Breakdown
            </h4>
            <span className="text-[11px] text-slate-500">
              Scenario: <strong className="text-slate-800 capitalize">{forecastScenario}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Portal / Source</th>
                  <th className="p-3 text-center">Active Pipeline</th>
                  <th className="p-3 text-center">Historical Win Rate</th>
                  <th className="p-3 text-right">Avg Deal Size</th>
                  <th className="p-3 text-center">Exp. Deals (90d)</th>
                  <th className="p-3 text-right">Est. 90d Ad Cost</th>
                  <th className="p-3 text-right font-bold text-emerald-800">Projected Commission</th>
                  <th className="p-3 text-center">ROI Multiple</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {roiForecastData.forecastPerSource.map((item) => (
                  <tr key={item.source} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.source}</span>
                    </td>
                    <td className="p-3 text-center font-mono font-medium">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {item.activeLeadsCount} leads
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className="text-slate-700">{item.historicalWinRate}%</span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {formatShortCurrency(item.avgDealPrice)}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-900">
                      ~{item.projectedDeals}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500 text-[11px]">
                      {formatShortCurrency(item.estimatedCost90d)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700 font-mono text-sm">
                      {formatCurrency(item.projectedCommission)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] font-mono border ${
                          parseFloat(item.projectedRoiMultiple) >= 15
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : parseFloat(item.projectedRoiMultiple) >= 8
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.projectedRoiMultiple}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Strategic Allocation & Forecast Commentary */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 sm:p-4.5 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 text-emerald-700" />
            <span>AI Lead ROI Capital Allocation & Growth Recommendations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-950">
            <div className="bg-white/80 p-3 rounded-lg border border-emerald-100 space-y-1">
              <span className="font-bold text-emerald-900 block">1. Property 24 Featured Boost Allocation</span>
              <p className="text-slate-600 text-[11px]">
                Property 24 accounts for the largest projected commission volume ({formatCurrency(roiForecastData.forecastPerSource.find((s) => s.source === 'Property 24')?.projectedCommission || 0)}). Increasing featured listing tiers on high-ticket listings (R8M+) is projected to yield an incremental +R140k in 90-day commission.
              </p>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-emerald-100 space-y-1">
              <span className="font-bold text-emerald-900 block">2. Ptah Website Organic Luxury Dominance</span>
              <p className="text-slate-600 text-[11px]">
                Direct Ptah Realty website leads exhibit the highest net margin ({roiForecastData.forecastPerSource.find((s) => s.source === 'Ptah Realty Website')?.projectedRoiMultiple}x ROI multiple) with near-zero external acquisition cost. Prioritize SEO landing pages for Clifton, Constantia, and Camps Bay.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Performance Leaderboard Card -- brought over from the AI
          Studio demo (see chat). */}
      <AgentPerformanceCard leads={leads} onSelectLead={onSelectLead} />

      {/* SLA / Speed-to-Lead Response Efficiency -- also from the demo, but
          wasn't actually wired into anything there either (built, exported,
          never imported). Placed here alongside the other agent-facing
          performance widget since that's the closest existing precedent for
          where it belongs; this placement is my call, not something the
          demo specified. */}
      <SlaResponseEfficiencyWidget leads={leads} onSelectLead={onSelectLead} />

      {/* Geographic Lead Heatmap Visualizer */}
      <LeadGeoHeatmap leads={leads} onSelectLead={onSelectLead} />

      {/* Visual Charts: Lead Sources + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Lead Sources Volume & Conversion */}
        <div className="bg-white dark:bg-black p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Lead Volume & Deals Won by Portal Source</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total inquiries vs successfully closed buyers</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="source" tick={{ fill: '#64748b', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="totalLeads" name="Total Inquiries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dealsWon" name="Deals Won" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Full Sales Pipeline Funnel */}
        <div className="bg-white dark:bg-black p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Real Estate Conversion Funnel</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Drop-off stages from raw lead to deed registration</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, item: any) => [`${value} leads (${item.payload.conversionFromTop}%)`, 'Volume']}
                />
                <Bar dataKey="count" fill="#059669" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ea580c', '#059669'][index % 6]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3 & 4: Monthly Inbound Trajectory & Source Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Share Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Lead Share by Portal</h3>
          <p className="text-xs text-slate-500 mb-4">Traffic source distribution</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Monthly Lead Inbound & Closing Trajectory</h3>
            <p className="text-xs text-slate-500">Historical performance scaling across Property 24 and website channels</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="Property24" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="PrivateProperty" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Website" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Won" stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Source Performance Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">Channel ROI & Conversion Table</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Channel / Source</th>
                <th className="p-3.5">Total Inquiries</th>
                <th className="p-3.5">Contacted Rate</th>
                <th className="p-3.5">Viewings Arranged</th>
                <th className="p-3.5">Deals Closed</th>
                <th className="p-3.5">Conversion %</th>
                <th className="p-3.5 text-right">Closed Revenue (ZAR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sourceAnalytics.map((item) => (
                <tr key={item.source} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-semibold text-slate-900 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.source}</span>
                  </td>
                  <td className="p-3.5 font-mono">{item.totalLeads}</td>
                  <td className="p-3.5 font-mono">
                    {item.totalLeads > 0 ? `${((item.contacted / item.totalLeads) * 100).toFixed(0)}%` : '0%'}
                  </td>
                  <td className="p-3.5 font-mono">{item.viewings}</td>
                  <td className="p-3.5 font-bold text-emerald-700 font-mono">{item.dealsWon}</td>
                  <td className="p-3.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                        parseFloat(item.conversionRate) >= 20
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.conversionRate}%
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-emerald-700 font-mono">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

