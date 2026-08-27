import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Flame, 
  MessageSquare, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Phone, 
  Calendar, 
  ArrowUpRight, 
  BarChart2, 
  Layers, 
  Sliders, 
  Check,
  Clock,
  Target
} from 'lucide-react';
import { Lead, LeadQualityScoreData } from '../types';
import { calculateLeadQualityScore } from '../utils/qualityScore';
import { formatCurrency, formatDate } from '../utils/formatters';

interface LeadQualityScoreViewProps {
  lead: Lead;
  allLeads?: Lead[];
  onUpdateLead: (updatedLead: Lead) => void;
  onNavigateTab?: (tab: 'comms' | 'tasks' | 'ai' | 'emails' | 'details') => void;
}

export const LeadQualityScoreView: React.FC<LeadQualityScoreViewProps> = ({
  lead,
  allLeads = [],
  onUpdateLead,
  onNavigateTab,
}) => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [activeSimulationBoost, setActiveSimulationBoost] = useState<number>(0);
  const [boostAppliedMessage, setBoostAppliedMessage] = useState<string | null>(null);

  // Compute live quality score data or fallback
  const qualityData: LeadQualityScoreData = lead.qualityScoreData || calculateLeadQualityScore(lead, allLeads);

  const displayScore = Math.min(100, qualityData.score + activeSimulationBoost);

  // Recalculate with Gemini API
  const handleRecalculateAiScore = async () => {
    setIsRecalculating(true);
    try {
      const response = await fetch('/api/gemini/lead-quality-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          allLeadsCount: allLeads.length || 24,
        }),
      });

      const data = await response.json();

      // Recalculate deterministic baseline with AI overlays
      const updatedData = calculateLeadQualityScore(
        {
          ...lead,
          leadScore: data.score || lead.leadScore,
        },
        allLeads
      );

      if (data.aiExecutiveSummary) updatedData.aiExecutiveSummary = data.aiExecutiveSummary;
      if (data.keyStrengths && Array.isArray(data.keyStrengths)) updatedData.keyStrengths = data.keyStrengths;
      if (data.riskFlags && Array.isArray(data.riskFlags)) updatedData.riskFlags = data.riskFlags;
      if (data.aiRecommendations && Array.isArray(data.aiRecommendations)) updatedData.aiRecommendations = data.aiRecommendations;
      if (data.dealWinProbability) updatedData.dealWinProbability = data.dealWinProbability;

      const newLeadScore = data.score || updatedData.score;

      onUpdateLead({
        ...lead,
        leadScore: newLeadScore,
        qualityScoreData: updatedData,
      });

      setBoostAppliedMessage('AI Lead Quality Score successfully recalibrated with Gemini 3.7 Flash!');
      setTimeout(() => setBoostAppliedMessage(null), 3500);
    } catch (err) {
      console.error('Error recalibrating AI score:', err);
      // Fallback local refresh
      const localUpdated = calculateLeadQualityScore(lead, allLeads);
      onUpdateLead({
        ...lead,
        qualityScoreData: localUpdated,
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  // Apply Quick Score Booster action
  const handleApplyBoostAction = (actionTitle: string, boostPts: number, actionType: 'viewing' | 'whatsapp' | 'call') => {
    // Add communication or task to lead
    const timestamp = new Date().toISOString();
    let updatedLead = { ...lead };

    if (actionType === 'viewing') {
      const viewingTask = {
        id: `task-viewing-${Date.now()}`,
        leadId: lead.id,
        leadName: lead.name,
        propertyTitle: lead.propertyTitle,
        title: `VIP In-Person Viewing: ${lead.propertyTitle}`,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'urgent' as const,
        status: 'pending' as const,
        type: 'viewing' as const,
        isAutomated: false,
      };
      updatedLead = {
        ...updatedLead,
        status: lead.status === 'new' || lead.status === 'contacted' ? 'viewing_scheduled' : lead.status,
        tasks: [viewingTask, ...lead.tasks],
      };
    } else if (actionType === 'whatsapp') {
      const commItem = {
        id: `comm-${Date.now()}`,
        type: 'whatsapp' as const,
        direction: 'outbound' as const,
        title: 'Sent 4K Property Brochure & Video on WhatsApp',
        content: `Dispatched high-res specs and private video tour for ${lead.propertyTitle} to ${lead.whatsappNumber}.`,
        timestamp,
        author: lead.assignedAgent.name,
        outcome: 'Delivered',
      };
      updatedLead = {
        ...updatedLead,
        communications: [commItem, ...lead.communications],
        lastContactedAt: timestamp,
      };
    } else if (actionType === 'call') {
      const commItem = {
        id: `comm-${Date.now()}`,
        type: 'call' as const,
        direction: 'outbound' as const,
        title: 'Qualification Voice Call Conducted',
        content: 'Discussed bond pre-approval, purchase timeline, and specific property requirements.',
        timestamp,
        author: lead.assignedAgent.name,
        outcome: 'Spoke with buyer - High interest',
        duration: '8 mins',
      };
      updatedLead = {
        ...updatedLead,
        communications: [commItem, ...lead.communications],
        lastContactedAt: timestamp,
      };
    }

    // Recompute score
    const newCalculated = calculateLeadQualityScore(updatedLead, allLeads);
    updatedLead.qualityScoreData = newCalculated;
    updatedLead.leadScore = newCalculated.score;

    onUpdateLead(updatedLead);
    setBoostAppliedMessage(`Applied "${actionTitle}" (+${boostPts} Quality Score Points)!`);
    setTimeout(() => setBoostAppliedMessage(null), 3500);
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-700 bg-purple-50 border-purple-200';
    if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-700 bg-slate-100 border-slate-200';
  };

  const getProgressBarColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.85) return 'bg-purple-600';
    if (ratio >= 0.7) return 'bg-emerald-600';
    if (ratio >= 0.5) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Toast alert message if boost applied */}
      {boostAppliedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{boostAppliedMessage}</span>
          </div>
          <button
            onClick={() => setBoostAppliedMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Score Gauge & Executive Matrix Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md relative overflow-hidden">
        {/* Subtle background luxury glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Score Hero Dial */}
          <div className="flex items-center space-x-5">
            <div className="relative flex items-center justify-center shrink-0">
              {/* Circular Meter SVG */}
              <svg className="w-24 h-24 sm:w-28 sm:h-28 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className="stroke-slate-700"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className={
                    displayScore >= 90
                      ? 'stroke-purple-400'
                      : displayScore >= 75
                      ? 'stroke-emerald-400'
                      : displayScore >= 50
                      ? 'stroke-amber-400'
                      : 'stroke-slate-400'
                  }
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - displayScore / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
                  {displayScore}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  / 100
                </span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${qualityData.tierBadgeColor}`}>
                  {qualityData.tier}
                </span>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                  Top {100 - qualityData.percentileRank}% Rank
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                <span>AI Lead Quality Index</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>

              <p className="text-xs text-slate-300 mt-1 max-w-md line-clamp-2">
                Ranked <strong className="text-emerald-400 font-bold">{qualityData.percentileRank}th percentile</strong> in Ptah Realty's active buyers portfolio with an estimated <strong className="text-white">{qualityData.dealWinProbability}% deal closing conversion probability</strong>.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Gemini Recalculate Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex items-center space-x-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Deal Probability</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{qualityData.dealWinProbability}%</span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Touchpoints</span>
                <span className="text-base font-bold text-white font-mono">{qualityData.engagementVelocity.touchpointsTotal} logged</span>
              </div>
            </div>

            <button
              onClick={handleRecalculateAiScore}
              disabled={isRecalculating}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Evaluating AI Signals...' : 'Recalibrate with Gemini AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Executive Summary Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">AI Underwriting Synthesis</h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Updated {formatDate(qualityData.lastCalculatedAt)}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {qualityData.aiExecutiveSummary}
            </p>
          </div>
        </div>
      </div>

      {/* 4 CORE SCORING PILLARS (Ranked 1-100 Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Four-Pillar Score Breakdown (25 pts each)</h4>
            <p className="text-xs text-slate-500">Multifactor analysis across client interactions, channel authority, property fit, and purchasing readiness.</p>
          </div>
          <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Total Score: {qualityData.score} / 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Interactions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{qualityData.factors.interactions.name}</h5>
                  <span className="text-[10px] text-slate-400">Channels, speed, reciprocity</span>
                </div>
              </div>
              <span className="text-xs font-black font-mono text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {qualityData.factors.interactions.score} / 25 pts
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressBarColor(qualityData.factors.interactions.score, 25)}`}
                style={{ width: `${(qualityData.factors.interactions.score / 25) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-600">{qualityData.factors.interactions.assessment}</p>

            {/* Key detected signals */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Detected Signals:</span>
              <ul className="space-y-1">
                {qualityData.factors.interactions.signals.map((sig, idx) => (
                  <li key={idx} className="text-[11px] text-slate-700 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pillar 2: Source Credibility */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{qualityData.factors.source.name}</h5>
                  <span className="text-[10px] text-slate-400">Portal authority & verified leads</span>
                </div>
              </div>
              <span className="text-xs font-black font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {qualityData.factors.source.score} / 25 pts
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressBarColor(qualityData.factors.source.score, 25)}`}
                style={{ width: `${(qualityData.factors.source.score / 25) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-600">{qualityData.factors.source.assessment}</p>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Channel Telemetry:</span>
              <ul className="space-y-1">
                {qualityData.factors.source.signals.map((sig, idx) => (
                  <li key={idx} className="text-[11px] text-slate-700 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pillar 3: Property Engagement & Specificity */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{qualityData.factors.propertyEngagement.name}</h5>
                  <span className="text-[10px] text-slate-400">Budget alignment & inquiry depth</span>
                </div>
              </div>
              <span className="text-xs font-black font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {qualityData.factors.propertyEngagement.score} / 25 pts
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressBarColor(qualityData.factors.propertyEngagement.score, 25)}`}
                style={{ width: `${(qualityData.factors.propertyEngagement.score / 25) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-600">{qualityData.factors.propertyEngagement.assessment}</p>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Engagement Indicators:</span>
              <ul className="space-y-1">
                {qualityData.factors.propertyEngagement.signals.map((sig, idx) => (
                  <li key={idx} className="text-[11px] text-slate-700 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pillar 4: Buyer Readiness & Timeframe */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{qualityData.factors.readiness.name}</h5>
                  <span className="text-[10px] text-slate-400">Financing liquidity & buying window</span>
                </div>
              </div>
              <span className="text-xs font-black font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {qualityData.factors.readiness.score} / 25 pts
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressBarColor(qualityData.factors.readiness.score, 25)}`}
                style={{ width: `${(qualityData.factors.readiness.score / 25) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-600">{qualityData.factors.readiness.assessment}</p>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Readiness Markers:</span>
              <ul className="space-y-1">
                {qualityData.factors.readiness.signals.map((sig, idx) => (
                  <li key={idx} className="text-[11px] text-slate-700 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* STRENGTHS VS RISK FLAGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Strengths */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Key Buying Strengths & Drivers</span>
          </div>
          <ul className="space-y-1.5">
            {qualityData.keyStrengths.map((st, i) => (
              <li key={i} className="text-xs text-emerald-950 flex items-start space-x-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk & Friction Flags */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Conversion Vulnerabilities & Risk Flags</span>
          </div>
          <ul className="space-y-1.5">
            {qualityData.riskFlags.map((rf, i) => (
              <li key={i} className="text-xs text-amber-950 flex items-start space-x-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>{rf}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* QUICK SCORE BOOSTER PLAYBOOK */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>AI Lead Quality Booster & High-Impact Next Steps</span>
            </h4>
            <p className="text-xs text-slate-500">Execute these recommended real estate touchpoints to elevate this lead's conversion index.</p>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">1-Click CRM Execution</span>
        </div>

        <div className="space-y-2.5">
          {qualityData.aiRecommendations.map((rec, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                      rec.priority === 'immediate'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : rec.priority === 'high'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    {rec.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="text-xs font-bold text-slate-900">{rec.action}</span>
                </div>
                <p className="text-[11px] text-slate-500">{rec.impact}</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  +{rec.expectedScoreBoost} pts
                </span>

                <button
                  onClick={() => {
                    if (rec.action.toLowerCase().includes('viewing')) {
                      handleApplyBoostAction(rec.action, rec.expectedScoreBoost, 'viewing');
                    } else if (rec.action.toLowerCase().includes('whatsapp') || rec.action.toLowerCase().includes('brochure')) {
                      handleApplyBoostAction(rec.action, rec.expectedScoreBoost, 'whatsapp');
                    } else {
                      handleApplyBoostAction(rec.action, rec.expectedScoreBoost, 'call');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Apply Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE WHAT-IF SCORE SIMULATOR */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              "What-If" Pipeline Score Simulator
            </h4>
          </div>
          <button
            onClick={() => setActiveSimulationBoost(0)}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Reset Simulation
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Preview how immediate broker actions increase the lead's rank across Ptah Realty's buyer prioritization matrix:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => setActiveSimulationBoost((prev) => (prev === 12 ? 0 : 12))}
            className={`p-2.5 rounded-xl border text-left transition text-xs font-semibold cursor-pointer ${
              activeSimulationBoost === 12
                ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-400">Scenario A</div>
            <div>+ Schedule Private Viewing</div>
            <div className="text-purple-700 font-mono text-[11px] mt-0.5 font-bold">+12 Quality Pts</div>
          </button>

          <button
            onClick={() => setActiveSimulationBoost((prev) => (prev === 8 ? 0 : 8))}
            className={`p-2.5 rounded-xl border text-left transition text-xs font-semibold cursor-pointer ${
              activeSimulationBoost === 8
                ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-400">Scenario B</div>
            <div>+ Send WhatsApp Brochure</div>
            <div className="text-emerald-700 font-mono text-[11px] mt-0.5 font-bold">+8 Quality Pts</div>
          </button>

          <button
            onClick={() => setActiveSimulationBoost((prev) => (prev === 15 ? 0 : 15))}
            className={`p-2.5 rounded-xl border text-left transition text-xs font-semibold cursor-pointer ${
              activeSimulationBoost === 15
                ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-400">Scenario C</div>
            <div>+ Verify Cash Funds Proof</div>
            <div className="text-amber-700 font-mono text-[11px] mt-0.5 font-bold">+15 Quality Pts</div>
          </button>

          <button
            onClick={() => setActiveSimulationBoost((prev) => (prev === 6 ? 0 : 6))}
            className={`p-2.5 rounded-xl border text-left transition text-xs font-semibold cursor-pointer ${
              activeSimulationBoost === 6
                ? 'bg-blue-100 border-blue-400 text-blue-900 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-400">Scenario D</div>
            <div>+ 15-min First SLA Call</div>
            <div className="text-blue-700 font-mono text-[11px] mt-0.5 font-bold">+6 Quality Pts</div>
          </button>
        </div>
      </div>
    </div>
  );
};
