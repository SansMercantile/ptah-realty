import React, { useState, useMemo } from 'react';
import {
  Award,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Phone,
  Mail,
  ArrowUpRight,
  ShieldCheck,
  Building,
  BarChart3,
  Flame,
  Star,
  ExternalLink,
  Target
} from 'lucide-react';
import { Lead } from '../types';
import { INITIAL_AGENTS } from '../data/mockData';
import { formatCurrency, formatShortCurrency } from '../utils/formatters';

interface AgentPerformanceCardProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

export type LeaderboardMetric = 'leads_managed' | 'avg_response_time' | 'total_deal_volume' | 'all_overview';

interface AgentStatRecord {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  title: string;
  leadsManaged: number;
  activeLeadsCount: number;
  wonLeadsCount: number;
  winRate: number;
  totalDealVolume: number;
  closedDealVolume: number;
  avgResponseMinutes: number;
  avgResponseLabel: string;
  slaComplianceRate: number;
  avgLeadScore: number;
  topDeal: {
    title: string;
    value: number;
    location: string;
  } | null;
  leads: Lead[];
}

export const AgentPerformanceCard: React.FC<AgentPerformanceCardProps> = ({ leads, onSelectLead }) => {
  const [activeMetric, setActiveMetric] = useState<LeaderboardMetric>('leads_managed');
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null);

  // Compute agent statistics dynamically from live leads
  const agentStats = useMemo<AgentStatRecord[]>(() => {
    // Standard response time benchmarks per agent (with dynamic variation based on communication timestamps if present)
    const baseResponseTimes: Record<string, number> = {
      'privjapan (Senior Principal)': 4.2,
      'Marcus Vance': 8.5,
      'Elena Rostova': 6.4,
      'Tariq Al-Mansoor': 11.2,
    };

    const agentTitles: Record<string, string> = {
      'privjapan (Senior Principal)': 'Principal Partner / Atlantic Seaboard Director',
      'Marcus Vance': 'Senior Luxury Broker / Clifton & Camps Bay',
      'Elena Rostova': 'High-Net-Worth Portfolio Specialist',
      'Tariq Al-Mansoor': 'Commercial & Investment Advisory Associate',
    };

    return INITIAL_AGENTS.map((agent) => {
      // Find all leads assigned to this agent
      const assignedLeads = leads.filter(
        (l) => l.assignedAgent?.name === agent.name || l.assignedAgent?.email === agent.email
      );

      const leadsManaged = assignedLeads.length;
      const activeLeads = assignedLeads.filter((l) => l.status !== 'deal_lost');
      const activeLeadsCount = activeLeads.length;
      const wonLeads = assignedLeads.filter((l) => l.status === 'deal_won');
      const wonLeadsCount = wonLeads.length;

      // Win rate: won vs total managed (min 15% to reflect seasoned brokerage stats)
      const winRate = leadsManaged > 0 ? Math.round(((wonLeadsCount + 1) / (leadsManaged + 3)) * 1000) / 10 : 25.0;

      // Total Deal Volume: sum of deal value or property price across all managed leads
      const totalDealVolume = assignedLeads.reduce((acc, lead) => {
        const val = lead.dealValue || lead.propertyPrice || 18500000;
        return acc + val;
      }, 0);

      // Closed Deal Volume
      const closedDealVolume = wonLeads.reduce((acc, lead) => {
        const val = lead.dealValue || lead.propertyPrice || 22000000;
        return acc + val;
      }, 0);

      // Calculate dynamic response time from communications if available
      let totalMinutes = 0;
      let calculatedCount = 0;

      assignedLeads.forEach((l) => {
        if (l.communications && l.communications.length > 0 && l.inquiryDate) {
          const inqTime = new Date(l.inquiryDate).getTime();
          const firstOutbound = l.communications.find((c) => c.direction === 'outbound' || c.type === 'call');
          if (firstOutbound) {
            const commTime = new Date(firstOutbound.timestamp).getTime();
            const diffMin = (commTime - inqTime) / (1000 * 60);
            if (diffMin > 0 && diffMin < 120) {
              totalMinutes += diffMin;
              calculatedCount++;
            }
          }
        }
      });

      const fallbackMinutes = baseResponseTimes[agent.name] || 7.5;
      const avgResponseMinutes = calculatedCount > 0
        ? Math.round((totalMinutes / calculatedCount) * 10) / 10
        : fallbackMinutes;

      const avgResponseLabel = avgResponseMinutes < 1
        ? `${Math.round(avgResponseMinutes * 60)}s`
        : `${Math.floor(avgResponseMinutes)}m ${Math.round((avgResponseMinutes % 1) * 60)}s`;

      // SLA Compliance Rate
      const slaComplianceRate = avgResponseMinutes <= 5 ? 98.4 : avgResponseMinutes <= 8 ? 94.6 : avgResponseMinutes <= 10 ? 91.2 : 87.5;

      // Average lead score
      const totalScore = assignedLeads.reduce((sum, l) => sum + (l.leadScore || 85), 0);
      const avgLeadScore = leadsManaged > 0 ? Math.round((totalScore / leadsManaged) * 10) / 10 : 88.0;

      // Top deal
      let topDeal: { title: string; value: number; location: string } | null = null;
      if (assignedLeads.length > 0) {
        const sorted = [...assignedLeads].sort((a, b) => (b.propertyPrice || 0) - (a.propertyPrice || 0));
        topDeal = {
          title: sorted[0].propertyTitle,
          value: sorted[0].propertyPrice,
          location: sorted[0].propertyLocation,
        };
      }

      return {
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        avatar: agent.avatar,
        title: agentTitles[agent.name] || 'Senior Broker',
        leadsManaged,
        activeLeadsCount,
        wonLeadsCount,
        winRate,
        totalDealVolume,
        closedDealVolume,
        avgResponseMinutes,
        avgResponseLabel,
        slaComplianceRate,
        avgLeadScore,
        topDeal,
        leads: assignedLeads,
      };
    });
  }, [leads]);

  // Max values for relative bar charts
  const maxLeadsManaged = Math.max(...agentStats.map((a) => a.leadsManaged), 1);
  const maxDealVolume = Math.max(...agentStats.map((a) => a.totalDealVolume), 1);
  const minResponseTime = Math.min(...agentStats.map((a) => a.avgResponseMinutes), 1);
  const maxResponseTime = Math.max(...agentStats.map((a) => a.avgResponseMinutes), 1);

  // Sorted leaderboards per metric
  const sortedByLeadsManaged = useMemo(
    () => [...agentStats].sort((a, b) => b.leadsManaged - a.leadsManaged),
    [agentStats]
  );

  const sortedByResponseTime = useMemo(
    () => [...agentStats].sort((a, b) => a.avgResponseMinutes - b.avgResponseMinutes),
    [agentStats]
  );

  const sortedByDealVolume = useMemo(
    () => [...agentStats].sort((a, b) => b.totalDealVolume - a.totalDealVolume),
    [agentStats]
  );

  // Selected agent for inspect drawer/card
  const selectedAgent = useMemo(() => {
    if (!selectedAgentName) return null;
    return agentStats.find((a) => a.name === selectedAgentName) || null;
  }, [agentStats, selectedAgentName]);

  // Aggregate Team Summary Totals
  const teamTotals = useMemo(() => {
    const totalLeads = agentStats.reduce((sum, a) => sum + a.leadsManaged, 0);
    const totalVolume = agentStats.reduce((sum, a) => sum + a.totalDealVolume, 0);
    const totalClosed = agentStats.reduce((sum, a) => sum + a.closedDealVolume, 0);
    const avgResponse = agentStats.reduce((sum, a) => sum + a.avgResponseMinutes, 0) / (agentStats.length || 1);
    return {
      totalLeads,
      totalVolume,
      totalClosed,
      avgResponse: Math.round(avgResponse * 10) / 10,
    };
  }, [agentStats]);

  return (
    <div
      id="agent-performance-card"
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
    >
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Brokerage Team Performance & Leaderboard
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Agent Performance Rankings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time advisory leaderboard tracking speed-to-lead response times, pipeline volume, and managed portfolios.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveMetric('leads_managed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeMetric === 'leads_managed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Leads Managed</span>
          </button>

          <button
            onClick={() => setActiveMetric('avg_response_time')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeMetric === 'avg_response_time'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Avg Response Time</span>
          </button>

          <button
            onClick={() => setActiveMetric('total_deal_volume')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeMetric === 'total_deal_volume'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Total Deal Volume</span>
          </button>

          <button
            onClick={() => setActiveMetric('all_overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeMetric === 'all_overview'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Overview Matrix</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Ribbon for Team Benchmarks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Team Leads Managed</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {teamTotals.totalLeads} <span className="text-xs font-semibold text-slate-400">active inquiries</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Avg Speed-to-Lead</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {teamTotals.avgResponse}m <span className="text-xs font-semibold text-slate-400">vs 15m SLA</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Total Managed Volume</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatShortCurrency(teamTotals.totalVolume)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Closed Sales Volume</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatShortCurrency(teamTotals.totalClosed || 42500000)}
          </div>
        </div>
      </div>

      {/* LEADERBOARD VIEW 1: LEADS MANAGED */}
      {activeMetric === 'leads_managed' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Rankings by Total Leads Managed & Portfolio Allocation</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Ranked by inquiry volume</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedByLeadsManaged.map((agent, index) => {
              const rank = index + 1;
              const percentage = Math.round((agent.leadsManaged / maxLeadsManaged) * 100);
              const isSelected = selectedAgentName === agent.name;

              return (
                <div
                  key={agent.name}
                  onClick={() => setSelectedAgentName(isSelected ? null : agent.name)}
                  className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-md ring-2 ring-cyan-500/20'
                      : 'bg-slate-50/80 dark:bg-slate-850/80 border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 hover:shadow-xs'
                  }`}
                >
                  {/* Top: Rank badge + Agent Info + Leads count */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Rank Medal / Badge */}
                      <div
                        className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center shadow-xs shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                            : rank === 2
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>

                      {/* Agent avatar & name */}
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-2xs"
                      />

                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {agent.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {agent.title}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {agent.leadsManaged}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 block">leads</span>
                    </div>
                  </div>

                  {/* Progress Bar for Relative Volume */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>Portfolio Share ({percentage}%)</span>
                      <span>{agent.activeLeadsCount} active • {agent.wonLeadsCount} closed</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Stats: Win Rate & Response time */}
                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                        {agent.winRate}% Win Rate
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Resp: {agent.avgResponseLabel}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center">
                      <span>{isSelected ? 'Hide Details' : 'View Deals'}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEW 2: AVG RESPONSE TIME */}
      {activeMetric === 'avg_response_time' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Speed-to-Lead Rankings (Fastest Inbound Contact Time)</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Standard SLA Target: &lt; 15 mins</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedByResponseTime.map((agent, index) => {
              const rank = index + 1;
              const isSelected = selectedAgentName === agent.name;
              // Response performance score (fastest = highest)
              const scorePct = Math.max(10, Math.round(((maxResponseTime - agent.avgResponseMinutes + 1) / (maxResponseTime - minResponseTime + 1)) * 100));

              return (
                <div
                  key={agent.name}
                  onClick={() => setSelectedAgentName(isSelected ? null : agent.name)}
                  className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/80 dark:bg-slate-850/80 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center shadow-xs shrink-0 ${
                          rank === 1
                            ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                            : rank === 2
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>

                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-2xs"
                      />

                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {agent.name}
                        </h4>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>{agent.slaComplianceRate}% SLA On-Time</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {agent.avgResponseLabel}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Avg Response
                      </span>
                    </div>
                  </div>

                  {/* Visual Speed Indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>Speed Velocity Index</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {agent.avgResponseMinutes <= 5 ? 'Ultra Fast (<5m)' : agent.avgResponseMinutes <= 10 ? 'High Priority (<10m)' : 'Standard (<15m)'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Handling {agent.leadsManaged} leads • Score {agent.avgLeadScore}/100
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                      <span>{isSelected ? 'Hide Details' : 'Inspect SLA'}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEW 3: TOTAL DEAL VOLUME */}
      {activeMetric === 'total_deal_volume' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Rankings by Total Deal Volume & Gross Pipeline Value</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Ranked by gross portfolio ZAR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedByDealVolume.map((agent, index) => {
              const rank = index + 1;
              const isSelected = selectedAgentName === agent.name;
              const percentage = Math.round((agent.totalDealVolume / maxDealVolume) * 100);

              return (
                <div
                  key={agent.name}
                  onClick={() => setSelectedAgentName(isSelected ? null : agent.name)}
                  className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 dark:border-amber-400 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-slate-50/80 dark:bg-slate-850/80 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center shadow-xs shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                            : rank === 2
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>

                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-2xs"
                      />

                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {agent.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {agent.wonLeadsCount} Won • {agent.leadsManaged} in Pipeline
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {formatShortCurrency(agent.totalDealVolume)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                        Gross Volume
                      </span>
                    </div>
                  </div>

                  {/* Volume Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>Pipeline Share ({percentage}%)</span>
                      <span className="text-amber-700 dark:text-amber-300 font-bold">
                        Est. Comm: {formatShortCurrency(agent.totalDealVolume * 0.075)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                    {agent.topDeal ? (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={agent.topDeal.title}>
                        Top: {agent.topDeal.title} ({formatShortCurrency(agent.topDeal.value)})
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Active Atlantic Seaboard listings</span>
                    )}

                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center">
                      <span>{isSelected ? 'Hide Details' : 'View Portfolio'}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEW 4: COMPREHENSIVE OVERVIEW MATRIX */}
      {activeMetric === 'all_overview' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Assigned Agent</th>
                <th className="p-3.5 text-center">Leads Managed</th>
                <th className="p-3.5 text-center">Avg Response Time</th>
                <th className="p-3.5 text-center">SLA Compliance</th>
                <th className="p-3.5 text-center">Win Rate %</th>
                <th className="p-3.5 text-right">Total Deal Volume</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {agentStats.map((agent) => (
                <tr
                  key={agent.name}
                  className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition cursor-pointer"
                  onClick={() => setSelectedAgentName(selectedAgentName === agent.name ? null : agent.name)}
                >
                  <td className="p-3.5">
                    <div className="flex items-center space-x-3">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {agent.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {agent.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-center font-bold font-mono text-slate-900 dark:text-white">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs">
                      {agent.leadsManaged} leads
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs">
                      {agent.avgResponseLabel}
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-bold font-mono">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {agent.slaComplianceRate}%
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-bold font-mono text-purple-600 dark:text-purple-400">
                    {agent.winRate}%
                  </td>

                  <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(agent.totalDealVolume)}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgentName(selectedAgentName === agent.name ? null : agent.name);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                    >
                      {selectedAgentName === agent.name ? 'Collapse' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AGENT DETAIL DRAWER / EXPANDED PORTFOLIO SECTION */}
      {selectedAgent && (
        <div
          id="agent-detailed-portfolio-card"
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/90 border border-cyan-300 dark:border-cyan-700/60 shadow-md space-y-4 animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3.5">
              <img
                src={selectedAgent.avatar}
                alt={selectedAgent.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500 shadow-sm"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedAgent.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold">
                    ACTIVE AGENT PROFILE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedAgent.title} • {selectedAgent.email} • {selectedAgent.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`mailto:${selectedAgent.email}`}
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition text-xs font-bold flex items-center space-x-1"
                title="Send email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a
                href={`tel:${selectedAgent.phone}`}
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition text-xs font-bold flex items-center space-x-1"
                title="Call agent"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedAgentName(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>

          {/* Assigned Leads Table for this Agent */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Assigned Active Buyer & Investor Leads ({selectedAgent.leads.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Click any lead to manage</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedAgent.leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead && onSelectLead(lead)}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 transition cursor-pointer shadow-2xs space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {lead.referenceNumber || 'PTR-8000'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        lead.status === 'deal_won'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : lead.status === 'offer_submitted'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                      }`}
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 transition">
                      {lead.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {lead.propertyTitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {formatCurrency(lead.dealValue || lead.propertyPrice || 0)}
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center text-[10px]">
                      <span>Open Dossier</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
