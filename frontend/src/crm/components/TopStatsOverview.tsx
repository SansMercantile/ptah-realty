import React, { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  Zap,
  Target,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Phone,
  MessageSquare,
  Search,
  X,
  ExternalLink,
  Eye,
  Filter,
  Building,
  Award,
  Layers
} from 'lucide-react';
import { Lead } from '../types';
import { formatCurrency, formatShortCurrency } from '../utils/formatters';

interface TopStatsOverviewProps {
  leads: Lead[];
  onNavigateView: (view: 'dashboard' | 'pipeline' | 'reporting' | 'scrum') => void;
  onSelectLead?: (lead: Lead) => void;
  onQuickWhatsApp?: (lead: Lead) => void;
}

interface SparklinePoint {
  label: string;
  value: number;
}

interface MiniSparklineProps {
  data: SparklinePoint[];
  color: string;
  gradientId: string;
  height?: number;
  width?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  formatter?: (val: number) => string;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color,
  gradientId,
  height = 44,
  width = 120,
  valuePrefix = '',
  valueSuffix = '',
  formatter,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const paddingX = 4;
  const paddingY = 6;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * usableWidth;
    const y = height - paddingY - ((d.value - minVal) / range) * usableHeight;
    return { x, y, ...d };
  });

  // Build SVG smooth path using Bezier curves
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${point.y} ${point.x},${point.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative flex items-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-11 overflow-visible cursor-crosshair"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Fill Area */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line Stroke */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover interaction points */}
        {points.map((p, i) => (
          <g key={i}>
            {/* Invisible larger target for easy hovering */}
            <circle
              cx={p.x}
              cy={p.y}
              r={7}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            />
            {/* Visible circle for current / last point or hovered */}
            {(i === points.length - 1 || hoveredIndex === i) && (
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 4 : 3}
                fill={color}
                stroke="#ffffff"
                strokeWidth={1.5}
                className="transition-all duration-150"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Floating Mini Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute -top-7 -translate-x-1/2 pointer-events-none z-20 px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-mono font-bold shadow-md whitespace-nowrap"
          style={{ left: `${(hoveredPoint.x / width) * 100}%` }}
        >
          {hoveredPoint.label}: {formatter ? formatter(hoveredPoint.value) : `${valuePrefix}${hoveredPoint.value}${valueSuffix}`}
        </div>
      )}
    </div>
  );
};

export type MetricDrilldownType = 'active_leads' | 'conversion_rate' | 'revenue_pipeline' | 'quality_score' | null;

export const TopStatsOverview: React.FC<TopStatsOverviewProps> = ({
  leads,
  onNavigateView,
  onSelectLead,
  onQuickWhatsApp,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeDrilldown, setActiveDrilldown] = useState<MetricDrilldownType>(null);
  const [subsetSearch, setSubsetSearch] = useState('');
  const [subStageFilter, setSubStageFilter] = useState<'all' | 'new' | 'contacted' | 'qualified' | 'viewing_scheduled' | 'offer_submitted' | 'deal_won'>('all');

  // Compute Active Leads Metrics
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter((l) => l.status !== 'deal_lost');
    const activeCount = activeLeads.length;

    const wonLeads = leads.filter((l) => l.status === 'deal_won');
    const wonCount = wonLeads.length;

    // Conversion rate calculation: won vs active + won (or historical 28.6% baseline)
    const rawConversionRate = totalLeads > 0 ? ((wonCount + 2) / (totalLeads + 2)) * 100 : 28.5;
    const conversionRate = Math.round(rawConversionRate * 10) / 10;

    // Revenue Pipeline: sum of deal value or property price for active pipeline leads
    const grossPipelineValue = activeLeads.reduce((acc, lead) => {
      const val = lead.dealValue || lead.propertyPrice || 18500000;
      return acc + val;
    }, 0);

    // Estimated commission at standard 7.5%
    const estCommission = Math.round(grossPipelineValue * 0.075);

    // Average Lead Quality Score
    const totalScore = leads.reduce((acc, l) => acc + (l.leadScore || 80), 0);
    const avgScore = totalLeads > 0 ? Math.round((totalScore / totalLeads) * 10) / 10 : 88.5;

    // Stage counts
    const newCount = leads.filter((l) => l.status === 'new').length;
    const contactedCount = leads.filter((l) => l.status === 'contacted').length;
    const qualifiedCount = leads.filter((l) => l.status === 'qualified').length;
    const viewingCount = leads.filter((l) => l.status === 'viewing_scheduled').length;
    const offerCount = leads.filter((l) => l.status === 'offer_submitted').length;

    return {
      activeCount,
      totalCount: totalLeads,
      wonCount,
      conversionRate,
      grossPipelineValue,
      estCommission,
      avgScore,
      newCount,
      contactedCount,
      qualifiedCount,
      viewingCount,
      offerCount,
      activeLeads,
      wonLeads,
    };
  }, [leads]);

  // Subset of leads contributing to current drilldown metric
  const contributingLeads = useMemo(() => {
    let subset: Lead[] = [];

    if (activeDrilldown === 'active_leads') {
      subset = leads.filter((l) => l.status !== 'deal_lost');
    } else if (activeDrilldown === 'conversion_rate') {
      subset = leads.filter((l) => l.status === 'deal_won' || l.status === 'offer_submitted');
      // If subset is small, also show qualified/viewing high-intent candidates for pipeline conversion
      if (subset.length < 3) {
        subset = leads.filter((l) => l.status === 'deal_won' || l.status === 'offer_submitted' || l.status === 'viewing_scheduled');
      }
    } else if (activeDrilldown === 'revenue_pipeline') {
      subset = leads.filter((l) => l.status !== 'deal_lost');
    } else if (activeDrilldown === 'quality_score') {
      subset = leads.filter((l) => (l.leadScore || 0) >= 80);
      if (subset.length === 0) {
        subset = leads;
      }
    }

    // Apply subStageFilter if set
    if (subStageFilter !== 'all') {
      subset = subset.filter((l) => l.status === subStageFilter);
    }

    // Apply text search
    if (subsetSearch.trim()) {
      const q = subsetSearch.toLowerCase();
      subset = subset.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.propertyTitle.toLowerCase().includes(q) ||
          l.referenceNumber.toLowerCase().includes(q) ||
          l.propertyLocation.toLowerCase().includes(q)
      );
    }

    return subset;
  }, [leads, activeDrilldown, subStageFilter, subsetSearch]);

  // Sparkline mock trend datasets based on selected timeframe
  const sparklineData = useMemo(() => {
    if (timeframe === '7d') {
      return {
        activeLeads: [
          { label: 'Day 1', value: 16 },
          { label: 'Day 2', value: 18 },
          { label: 'Day 3', value: 17 },
          { label: 'Day 4', value: 20 },
          { label: 'Day 5', value: 21 },
          { label: 'Day 6', value: 22 },
          { label: 'Today', value: metrics.activeCount },
        ],
        conversionRate: [
          { label: 'Day 1', value: 24.2 },
          { label: 'Day 2', value: 25.0 },
          { label: 'Day 3', value: 25.8 },
          { label: 'Day 4', value: 26.5 },
          { label: 'Day 5', value: 27.2 },
          { label: 'Day 6', value: 27.8 },
          { label: 'Today', value: metrics.conversionRate },
        ],
        revenuePipeline: [
          { label: 'Day 1', value: 145 },
          { label: 'Day 2', value: 152 },
          { label: 'Day 3', value: 160 },
          { label: 'Day 4', value: 168 },
          { label: 'Day 5', value: 174 },
          { label: 'Day 6', value: 180 },
          { label: 'Today', value: Math.round(metrics.grossPipelineValue / 1_000_000) },
        ],
        qualityScore: [
          { label: 'Day 1', value: 84.5 },
          { label: 'Day 2', value: 85.2 },
          { label: 'Day 3', value: 86.0 },
          { label: 'Day 4', value: 87.1 },
          { label: 'Day 5', value: 88.0 },
          { label: 'Day 6', value: 88.8 },
          { label: 'Today', value: metrics.avgScore },
        ],
      };
    }

    if (timeframe === '90d') {
      return {
        activeLeads: [
          { label: 'Wk 1', value: 10 },
          { label: 'Wk 3', value: 12 },
          { label: 'Wk 5', value: 15 },
          { label: 'Wk 7', value: 18 },
          { label: 'Wk 9', value: 19 },
          { label: 'Wk 11', value: 21 },
          { label: 'Now', value: metrics.activeCount },
        ],
        conversionRate: [
          { label: 'Wk 1', value: 21.0 },
          { label: 'Wk 3', value: 22.4 },
          { label: 'Wk 5', value: 24.1 },
          { label: 'Wk 7', value: 25.9 },
          { label: 'Wk 9', value: 26.8 },
          { label: 'Wk 11', value: 27.9 },
          { label: 'Now', value: metrics.conversionRate },
        ],
        revenuePipeline: [
          { label: 'Wk 1', value: 110 },
          { label: 'Wk 3', value: 125 },
          { label: 'Wk 5', value: 140 },
          { label: 'Wk 7', value: 158 },
          { label: 'Wk 9', value: 170 },
          { label: 'Wk 11', value: 178 },
          { label: 'Now', value: Math.round(metrics.grossPipelineValue / 1_000_000) },
        ],
        qualityScore: [
          { label: 'Wk 1', value: 81.0 },
          { label: 'Wk 3', value: 83.2 },
          { label: 'Wk 5', value: 84.9 },
          { label: 'Wk 7', value: 86.4 },
          { label: 'Wk 9', value: 87.8 },
          { label: 'Wk 11', value: 88.5 },
          { label: 'Now', value: metrics.avgScore },
        ],
      };
    }

    // Default 30d
    return {
      activeLeads: [
        { label: 'Wk 1', value: 14 },
        { label: 'Wk 2', value: 16 },
        { label: 'Wk 3', value: 19 },
        { label: 'Wk 4', value: 21 },
        { label: 'Current', value: metrics.activeCount },
      ],
      conversionRate: [
        { label: 'Wk 1', value: 23.5 },
        { label: 'Wk 2', value: 24.8 },
        { label: 'Wk 3', value: 26.4 },
        { label: 'Wk 4', value: 27.5 },
        { label: 'Current', value: metrics.conversionRate },
      ],
      revenuePipeline: [
        { label: 'Wk 1', value: 138 },
        { label: 'Wk 2', value: 152 },
        { label: 'Wk 3', value: 169 },
        { label: 'Wk 4', value: 178 },
        { label: 'Current', value: Math.round(metrics.grossPipelineValue / 1_000_000) },
      ],
      qualityScore: [
        { label: 'Wk 1', value: 83.4 },
        { label: 'Wk 2', value: 85.1 },
        { label: 'Wk 3', value: 86.8 },
        { label: 'Wk 4', value: 87.9 },
        { label: 'Current', value: metrics.avgScore },
      ],
    };
  }, [timeframe, metrics]);

  const handleOpenMetricModal = (type: MetricDrilldownType) => {
    setActiveDrilldown(type);
    setSubsetSearch('');
    setSubStageFilter('all');
  };

  return (
    <div id="top-level-statistics-section" className="space-y-3">
      {/* Sub-header with section title and timeframe filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Executive Performance Metrics
          </span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            • Click any card to drill down into contributing leads & pipeline subsets
          </span>
        </div>

        {/* Timeframe selector pills */}
        <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {(['7d', '30d', '90d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                timeframe === tf
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : 'Quarter'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 4 Key Visual Metric Cards with Mini-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Total Active Leads */}
        <div
          id="stat-card-total-active-leads"
          onClick={() => handleOpenMetricModal('active_leads')}
          className="group relative bg-white dark:bg-slate-850 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          title="Click to view all active leads subset"
        >
          {/* Top row: Title + Trend Badge */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Active Leads
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center">
                  <Eye className="w-2.5 h-2.5 mr-0.5" /> View
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metrics.activeCount}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  / {metrics.totalCount} total
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+14.8%</span>
            </div>
          </div>

          {/* Sparkline & Breakdown */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>{metrics.viewingCount} in Viewings</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {metrics.offerCount} Pending Offers • Click to inspect
              </div>
            </div>

            <div className="w-28">
              <MiniSparkline
                data={sparklineData.activeLeads}
                color="#06b6d4"
                gradientId="sparkline-leads"
                valueSuffix=" leads"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Conversion Rate */}
        <div
          id="stat-card-conversion-rate"
          onClick={() => handleOpenMetricModal('conversion_rate')}
          className="group relative bg-white dark:bg-slate-850 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          title="Click to view converted clients and closing analytics"
        >
          {/* Top row: Title + Trend Badge */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Conversion Rate
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <Eye className="w-2.5 h-2.5 mr-0.5" /> View
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metrics.conversionRate}%
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Win Rate
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+3.6%</span>
            </div>
          </div>

          {/* Sparkline & Breakdown */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Property 24: 64%</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Direct Web: 31% • Click to view deals
              </div>
            </div>

            <div className="w-28">
              <MiniSparkline
                data={sparklineData.conversionRate}
                color="#10b981"
                gradientId="sparkline-conversion"
                valueSuffix="%"
              />
            </div>
          </div>
        </div>

        {/* CARD 3: Monthly Revenue Pipeline */}
        <div
          id="stat-card-monthly-revenue-pipeline"
          onClick={() => handleOpenMetricModal('revenue_pipeline')}
          className="group relative bg-white dark:bg-slate-850 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          title="Click to view high-value pipeline opportunities"
        >
          {/* Top row: Title + Trend Badge */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Monthly Revenue Pipeline
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center">
                  <Eye className="w-2.5 h-2.5 mr-0.5" /> View
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatShortCurrency(metrics.grossPipelineValue)}
                </span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Active Value
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+21.4%</span>
            </div>
          </div>

          {/* Sparkline & Breakdown */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Est. Comm: {formatShortCurrency(metrics.estCommission)}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                7.5% Gross Advisory • Click to inspect
              </div>
            </div>

            <div className="w-28">
              <MiniSparkline
                data={sparklineData.revenuePipeline}
                color="#f59e0b"
                gradientId="sparkline-revenue"
                formatter={(val) => `R${val}M`}
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Lead Quality & Advisory Index */}
        <div
          id="stat-card-quality-velocity"
          onClick={() => handleOpenMetricModal('quality_score')}
          className="group relative bg-white dark:bg-slate-850 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          title="Click to view VIP high-intent scored leads"
        >
          {/* Top row: Title + Trend Badge */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  AI Quality Index
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center">
                  <Eye className="w-2.5 h-2.5 mr-0.5" /> View
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metrics.avgScore}
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  / 100
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Platinum</span>
            </div>
          </div>

          {/* Sparkline & Breakdown */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Speed to Lead: &lt;8m</span>
              </div>
              <div className="text-[10px] text-slate-400">
                VIP High-Intent • Click to inspect
              </div>
            </div>

            <div className="w-28">
              <MiniSparkline
                data={sparklineData.qualityScore}
                color="#6366f1"
                gradientId="sparkline-quality"
                valueSuffix=" pts"
              />
            </div>
          </div>
        </div>
      </div>

      {/* METRIC SUBSET DRILLDOWN MODAL */}
      {activeDrilldown && (
        <div
          id="metric-drilldown-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveDrilldown(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {activeDrilldown === 'active_leads' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-xs font-bold flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      <span>ACTIVE PIPELINE SUBSET</span>
                    </span>
                  )}
                  {activeDrilldown === 'conversion_rate' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span>CONVERSION & WON DEALS</span>
                    </span>
                  )}
                  {activeDrilldown === 'revenue_pipeline' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 mr-1" />
                      <span>GROSS REVENUE OPPORTUNITIES</span>
                    </span>
                  )}
                  {activeDrilldown === 'quality_score' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>PLATINUM HIGH-INTENT LEADS</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-semibold">
                    ({contributingLeads.length} matching records)
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeDrilldown === 'active_leads' && 'Total Active Leads Breakdown'}
                  {activeDrilldown === 'conversion_rate' && 'Conversion Rate & Converted Transactions'}
                  {activeDrilldown === 'revenue_pipeline' && 'Active Revenue Pipeline & Advisory Commission'}
                  {activeDrilldown === 'quality_score' && 'High-Intent Underwritten VIP Clients (Score ≥ 80)'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeDrilldown === 'active_leads' &&
                    'Comprehensive list of all ongoing buyers, investors, and qualified clients in active CRM stages.'}
                  {activeDrilldown === 'conversion_rate' &&
                    'Closed won transactions and advanced offer stages driving the 28.4% CRM conversion rate.'}
                  {activeDrilldown === 'revenue_pipeline' &&
                    'Transaction values across active buyer mandates and potential 7.5% agency commissions.'}
                  {activeDrilldown === 'quality_score' &&
                    'AI-underwritten VIP prospects scored with high purchasing capacity and immediate timeframe.'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setActiveDrilldown(null);
                    onNavigateView('pipeline');
                  }}
                  className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                >
                  <span>Open Pipeline Board</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveDrilldown(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search client name, phone, email, or property reference..."
                  value={subsetSearch}
                  onChange={(e) => setSubsetSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Stage Filter Chips */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center">
                  <Filter className="w-3 h-3 mr-0.5" /> Stage:
                </span>
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'new', label: 'New' },
                    { id: 'contacted', label: 'Contacted' },
                    { id: 'qualified', label: 'Qualified' },
                    { id: 'viewing_scheduled', label: 'Viewing' },
                    { id: 'offer_submitted', label: 'Offer' },
                    { id: 'deal_won', label: 'Won' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSubStageFilter(st.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition whitespace-nowrap ${
                      subStageFilter === st.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads List Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {contributingLeads.length > 0 ? (
                contributingLeads.map((lead) => {
                  const dealVal = lead.dealValue || lead.propertyPrice || 18500000;
                  const commVal = Math.round(dealVal * 0.075);
                  return (
                    <div
                      key={lead.id}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Lead header tags */}
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold">
                            {lead.referenceNumber || 'PTR-8041'}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                              lead.status === 'deal_won'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : lead.status === 'offer_submitted'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : lead.status === 'viewing_scheduled'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                : lead.status === 'qualified'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {lead.status.replace('_', ' ')}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-semibold">
                            {lead.source}
                          </span>

                          {lead.leadScore && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center space-x-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Score {lead.leadScore}/100</span>
                            </span>
                          )}
                        </div>

                        {/* Client details */}
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {lead.name}
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            {lead.phone}
                          </span>
                        </div>

                        {/* Interested Property */}
                        <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 truncate">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-cyan-600 dark:text-cyan-400 truncate">
                            {lead.propertyTitle}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>{lead.propertyLocation}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(lead.propertyPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Right column: Value + Action Buttons */}
                      <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(dealVal)}
                          </div>
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                            Comm: {formatCurrency(commVal)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {onQuickWhatsApp && (
                            <button
                              onClick={() => onQuickWhatsApp(lead)}
                              title="Send WhatsApp Follow-up"
                              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-2xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onSelectLead && (
                            <button
                              onClick={() => {
                                setActiveDrilldown(null);
                                onSelectLead(lead);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-2xs flex items-center space-x-1 cursor-pointer"
                            >
                              <span>Manage Lead</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 space-y-2">
                  <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No leads found matching your criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSubsetSearch('');
                      setSubStageFilter('all');
                    }}
                    className="text-xs font-bold text-cyan-600 hover:underline"
                  >
                    Clear search & filters
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Tip: Click any lead to open full client dossier, stage pipeline, and notes.
              </span>
              <button
                onClick={() => setActiveDrilldown(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
