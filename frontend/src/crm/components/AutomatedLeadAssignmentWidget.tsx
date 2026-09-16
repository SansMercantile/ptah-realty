import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  MapPin,
  Sliders,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building,
  UserCheck,
  ChevronRight,
  Info,
  Check,
  Zap,
  RotateCcw,
  Target,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Lead, ActivityLogItem } from '../types';
import { INITIAL_AGENTS } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

interface AgentProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  maxCapacity: number;
  suburbExpertise: string[];
}

const AGENT_PROFILES: AgentProfile[] = [
  {
    name: 'privjapan (Senior Principal)',
    email: 'privjapan@gmail.com',
    phone: '+27 82 555 0192',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Managing Principal & Luxury Director',
    maxCapacity: 15,
    suburbExpertise: ['Clifton', 'Camps Bay', 'Bantry Bay', 'Fresnaye', 'Bakoven'],
  },
  {
    name: 'Marcus Vance',
    email: 'm.vance@ptahrealty.com',
    phone: '+27 83 912 3445',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Senior Executive Broker — Gauteng Estates',
    maxCapacity: 12,
    suburbExpertise: ['Sandton', 'Sandhurst', 'Hyde Park', 'Rosebank', 'Houghton', 'Bryanston'],
  },
  {
    name: 'Elena Rostova',
    email: 'e.rostova@ptahrealty.com',
    phone: '+27 71 884 9201',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Wine Country & Oceanfront Specialist',
    maxCapacity: 14,
    suburbExpertise: ['Camps Bay', 'Constantia', 'Franschhoek', 'Bishopscourt', 'Llandudno', 'Stellenbosch'],
  },
  {
    name: 'Tariq Al-Mansoor',
    email: 't.mansoor@ptahrealty.com',
    phone: '+27 84 321 9900',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Marina & Commercial Syndication Lead',
    maxCapacity: 10,
    suburbExpertise: ['V&A Waterfront', 'Waterfront', 'De Waterkant', 'City Bowl', 'Century City', 'Foreshore'],
  },
];

interface AutomatedLeadAssignmentWidgetProps {
  leads: Lead[];
  onUpdateLead?: (lead: Lead) => void;
  onSelectLead?: (lead: Lead) => void;
}

export const AutomatedLeadAssignmentWidget: React.FC<AutomatedLeadAssignmentWidgetProps> = ({
  leads,
  onUpdateLead,
  onSelectLead,
}) => {
  // Configurable Weights
  const [loadWeight, setLoadWeight] = useState<number>(35);
  const [performanceWeight, setPerformanceWeight] = useState<number>(35);
  const [expertiseWeight, setExpertiseWeight] = useState<number>(30);
  const [strategy, setStrategy] = useState<'hybrid' | 'performance' | 'capacity' | 'suburb'>('hybrid');
  const [autoRoutingEnabled, setAutoRoutingEnabled] = useState<boolean>(true);

  // Selected Lead for interactive testing & live assignment
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [assignedSuccessAgent, setAssignedSuccessAgent] = useState<string | null>(null);

  // Compute agent statistics dynamically from all leads in CRM
  const agentStats = useMemo(() => {
    return AGENT_PROFILES.map((agent) => {
      // All leads assigned to this agent
      const agentLeads = leads.filter(
        (l) => l.assignedAgent?.email?.toLowerCase() === agent.email.toLowerCase() ||
               l.assignedAgent?.name?.toLowerCase() === agent.name.toLowerCase()
      );

      // Active leads (not won and not lost)
      const activeLeads = agentLeads.filter(
        (l) => l.status !== 'deal_won' && l.status !== 'deal_lost'
      );

      // 'deal_won' leads
      const wonLeads = agentLeads.filter((l) => l.status === 'deal_won');
      const wonCount = wonLeads.length;
      const totalWonVolume = wonLeads.reduce((sum, l) => sum + (l.dealValue || l.propertyPrice || 0), 0);
      const totalDecided = wonCount + agentLeads.filter((l) => l.status === 'deal_lost').length;
      const winRate = totalDecided > 0 ? Math.round((wonCount / totalDecided) * 100) : wonCount > 0 ? 80 : 50;

      const capacityUsedPercent = Math.min(100, Math.round((activeLeads.length / agent.maxCapacity) * 100));

      return {
        ...agent,
        totalLeads: agentLeads.length,
        activeLeadsCount: activeLeads.length,
        wonCount,
        totalWonVolume,
        winRate,
        capacityUsedPercent,
        isAtCapacity: activeLeads.length >= agent.maxCapacity,
      };
    });
  }, [leads]);

  // Current lead under evaluation
  const targetLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || leads[0];
  }, [leads, selectedLeadId]);

  // Compute recommendations for the target lead
  const rankedRecommendations = useMemo(() => {
    if (!targetLead) return [];

    const leadLocation = (targetLead.propertyLocation || targetLead.propertyTitle || '').toLowerCase();

    return agentStats.map((agent) => {
      // 1. Current Lead Load Capacity Score (0-100)
      // Higher score when the agent has more remaining capacity
      const capacityRemaining = Math.max(0, agent.maxCapacity - agent.activeLeadsCount);
      const capacityScore = Math.min(100, Math.round((capacityRemaining / agent.maxCapacity) * 100));

      // 2. 'deal_won' Performance Score (0-100)
      // Combines won deals count, volume tier, and win conversion rate
      const wonVolumeScore = Math.min(100, Math.round((agent.totalWonVolume / 50000000) * 100));
      const wonCountScore = Math.min(100, agent.wonCount * 25);
      const performanceScore = Math.round((agent.winRate * 0.4) + (wonVolumeScore * 0.3) + (wonCountScore * 0.3));

      // 3. Local Area Expertise Score (0-100)
      // Checks if the lead's location matches the agent's designated territories
      let expertiseScore = 20; // baseline
      let matchedSuburb = '';
      for (const suburb of agent.suburbExpertise) {
        if (leadLocation.includes(suburb.toLowerCase())) {
          expertiseScore = 100;
          matchedSuburb = suburb;
          break;
        }
      }
      if (!matchedSuburb) {
        if (leadLocation.includes('cape town') && agent.suburbExpertise.some((s) => ['Clifton', 'Camps Bay', 'Constantia'].includes(s))) {
          expertiseScore = 65;
          matchedSuburb = 'Western Cape Region';
        } else if (leadLocation.includes('johannesburg') && agent.suburbExpertise.some((s) => ['Sandton', 'Sandhurst'].includes(s))) {
          expertiseScore = 65;
          matchedSuburb = 'Gauteng Region';
        }
      }

      // 4. Weighted Composite Score based on active strategy
      let finalScore = 0;
      if (strategy === 'hybrid') {
        const totalW = loadWeight + performanceWeight + expertiseWeight;
        finalScore = Math.round(
          (capacityScore * (loadWeight / totalW)) +
          (performanceScore * (performanceWeight / totalW)) +
          (expertiseScore * (expertiseWeight / totalW))
        );
      } else if (strategy === 'performance') {
        finalScore = Math.round((performanceScore * 0.6) + (expertiseScore * 0.25) + (capacityScore * 0.15));
      } else if (strategy === 'capacity') {
        finalScore = Math.round((capacityScore * 0.6) + (performanceScore * 0.2) + (expertiseScore * 0.2));
      } else if (strategy === 'suburb') {
        finalScore = Math.round((expertiseScore * 0.6) + (performanceScore * 0.25) + (capacityScore * 0.15));
      }

      // Generate human-readable AI justification
      const reasons: string[] = [];
      if (expertiseScore >= 80) {
        reasons.push(`Direct territory specialist for ${matchedSuburb}`);
      } else if (expertiseScore >= 60) {
        reasons.push(`Regional proximity match for ${matchedSuburb}`);
      }

      if (agent.wonCount >= 2) {
        reasons.push(`High 'deal_won' closure record (${agent.wonCount} won deals, ${agent.winRate}% conversion)`);
      }

      if (capacityScore >= 60) {
        reasons.push(`Balanced workload with ${capacityRemaining} open lead slots (${agent.activeLeadsCount}/${agent.maxCapacity})`);
      } else if (agent.isAtCapacity) {
        reasons.push(`⚠️ At maximum capacity limit (${agent.activeLeadsCount}/${agent.maxCapacity})`);
      }

      return {
        ...agent,
        capacityScore,
        performanceScore,
        expertiseScore,
        matchedSuburb,
        finalScore,
        reasons,
        isCurrentAssignee:
          targetLead.assignedAgent?.email?.toLowerCase() === agent.email.toLowerCase() ||
          targetLead.assignedAgent?.name?.toLowerCase() === agent.name.toLowerCase(),
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }, [targetLead, agentStats, loadWeight, performanceWeight, expertiseWeight, strategy]);

  const handleApplyAssignment = (agent: typeof rankedRecommendations[0]) => {
    if (!targetLead || !onUpdateLead) return;

    const activityLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      type: 'status_change',
      title: 'Automated Lead Assignment Executed',
      description: `Lead auto-routed to ${agent.name} based on Rule Set (Score: ${agent.finalScore}%, Suburb Match: ${agent.matchedSuburb || 'General'}, Load: ${agent.activeLeadsCount}/${agent.maxCapacity}).`,
      timestamp: new Date().toISOString(),
      author: 'Ptah Automated Assignment Engine',
    };

    const updatedLead: Lead = {
      ...targetLead,
      assignedAgent: {
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        avatar: agent.avatar,
      },
      activityLogs: [activityLog, ...(targetLead.activityLogs || [])],
    };

    onUpdateLead(updatedLead);
    setAssignedSuccessAgent(agent.name);
    setTimeout(() => setAssignedSuccessAgent(null), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900 shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                Automated Lead Assignment Rule Set
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Multi-Factor Routing Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Algorithmically routes leads based on current lead load, 'deal_won' performance, and local area expertise.
            </p>
          </div>
        </div>

        {/* Global Auto-Routing Toggle */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Auto-Route New Inbound:
          </span>
          <button
            type="button"
            onClick={() => setAutoRoutingEnabled(!autoRoutingEnabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
              autoRoutingEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                autoRoutingEnabled ? 'translate-x-4.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3 Weight Sliders & Strategy Selector */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>Algorithm Weightings & Routing Strategy</span>
          </span>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                setLoadWeight(35);
                setPerformanceWeight(35);
                setExpertiseWeight(30);
                setStrategy('hybrid');
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Slider 1: Lead Load Capacity */}
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Current Lead Load
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{loadWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={loadWeight}
              onChange={(e) => setLoadWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Favors agents with lower active lead load and open capacity.
            </p>
          </div>

          {/* Slider 2: 'deal_won' Performance */}
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> 'deal_won' Performance
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{performanceWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={performanceWeight}
              onChange={(e) => setPerformanceWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Favors agents with higher closed deals and won sales volume.
            </p>
          </div>

          {/* Slider 3: Local Area Expertise */}
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Local Area Expertise
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{expertiseWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={expertiseWeight}
              onChange={(e) => setExpertiseWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Favors agents registered as specialists in the inquiry suburb.
            </p>
          </div>
        </div>
      </div>

      {/* Agent Performance & Current Lead Load Matrix */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Active Agent Roster — Load & 'deal_won' Matrix</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {agentStats.map((agent) => (
            <div
              key={agent.email}
              className="bg-slate-50/75 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center space-x-2.5">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {agent.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{agent.role}</div>
                </div>
              </div>

              {/* Current Lead Load vs Capacity Meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Current Lead Load:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {agent.activeLeadsCount} / {agent.maxCapacity} leads
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      agent.capacityUsedPercent > 85
                        ? 'bg-rose-500'
                        : agent.capacityUsedPercent > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${agent.capacityUsedPercent}%` }}
                  />
                </div>
              </div>

              {/* 'deal_won' Performance */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">'deal_won' Records:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {agent.wonCount} won ({formatCurrency(agent.totalWonVolume)})
                </span>
              </div>

              {/* Suburb Expertise Tags */}
              <div className="pt-1">
                <div className="text-[10px] text-slate-400 mb-1">Local Area Expertise:</div>
                <div className="flex flex-wrap gap-1">
                  {agent.suburbExpertise.slice(0, 3).map((sub) => (
                    <span
                      key={sub}
                      className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                    >
                      {sub}
                    </span>
                  ))}
                  {agent.suburbExpertise.length > 3 && (
                    <span className="text-[9px] text-slate-400">
                      +{agent.suburbExpertise.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Assignment Recommender for Selected Lead */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Lead Assignment Recommender</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any CRM lead to view real-time ranked agent suggestions with composite scores.
            </p>
          </div>

          {/* Lead Selector Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Evaluate Lead:</span>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer max-w-xs truncate"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id} className="dark:bg-slate-800">
                  {l.name} — {l.propertyLocation || l.propertyTitle} ({l.source})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Evaluated Lead Summary Card */}
        {targetLead && (
          <div className="mb-4 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                {targetLead.referenceNumber.slice(-4)}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{targetLead.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {targetLead.source}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <strong>Location:</strong> {targetLead.propertyLocation || targetLead.propertyTitle} •{' '}
                  <strong>Budget:</strong> {targetLead.budget}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Currently Assigned:</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {targetLead.assignedAgent?.name || 'Unassigned'}
                </div>
              </div>
              {onSelectLead && (
                <button
                  type="button"
                  onClick={() => onSelectLead(targetLead)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  View Lead Profile
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Banner */}
        {assignedSuccessAgent && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Successfully assigned <strong>{targetLead?.name}</strong> to <strong>{assignedSuccessAgent}</strong>! Notification and SLA tasks have been synchronized.
            </span>
          </div>
        )}

        {/* Ranked Recommendations List */}
        <div className="space-y-3">
          {rankedRecommendations.map((agent, index) => {
            const isTopMatch = index === 0;

            return (
              <div
                key={agent.email}
                className={`p-4 rounded-xl border transition-all ${
                  isTopMatch
                    ? 'bg-gradient-to-r from-purple-50/50 via-white to-white dark:from-purple-950/20 dark:via-slate-800 dark:to-slate-800 border-purple-300 dark:border-purple-800 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Agent Info & Badges */}
                  <div className="flex items-start space-x-3.5">
                    <div className="relative">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 shrink-0"
                      />
                      <span
                        className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                          isTopMatch ? 'bg-purple-600 shadow-2xs' : 'bg-slate-400'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {agent.name}
                        </span>
                        {isTopMatch && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Top Suggested Match</span>
                          </span>
                        )}
                        {agent.isCurrentAssignee && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            Current Assignee
                          </span>
                        )}
                      </div>

                      {/* Rule Justifications */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {agent.reasons.map((r, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300"
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & 1-Click Action */}
                  <div className="flex items-center justify-between lg:justify-end space-x-4 shrink-0">
                    {/* Sub-scores breakdown */}
                    <div className="flex items-center space-x-3 text-center">
                      <div className="bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400">Capacity</div>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {agent.capacityScore}%
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400">Deals Won</div>
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {agent.performanceScore}%
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400">Territory</div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {agent.expertiseScore}%
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-[10px] font-bold text-purple-600 dark:text-purple-300">Composite</div>
                        <div className="text-sm font-black text-purple-700 dark:text-purple-300 font-mono">
                          {agent.finalScore}%
                        </div>
                      </div>
                    </div>

                    {/* 1-Click Assignment Button */}
                    <button
                      type="button"
                      onClick={() => handleApplyAssignment(agent)}
                      disabled={agent.isCurrentAssignee}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer ${
                        agent.isCurrentAssignee
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                          : isTopMatch
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{agent.isCurrentAssignee ? 'Assigned' : 'Assign Lead'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
