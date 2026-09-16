import React, { useState } from 'react';
import {
  X,
  Trophy,
  Medal,
  Award,
  DollarSign,
  Search,
  Filter,
  TrendingUp,
  Star,
  Users,
  ChevronUp
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BillingLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
}

export const BillingLeaderboardModal: React.FC<BillingLeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries: initialEntries,
}) => {
  const [period, setPeriod] = useState<'YTD 2026' | 'Q1 2026' | 'Last 12 Months'>('YTD 2026');
  const [category, setCategory] = useState<'overall' | 'sales' | 'rentals' | 'transactions'>('overall');
  const [search, setSearch] = useState('');

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sortedEntries = [...initialEntries]
    .filter((e) => e.agentName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (category === 'transactions') {
        return b.transactionsCount - a.transactionsCount;
      }
      return b.totalBillingZar - a.totalBillingZar;
    });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-xs">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center text-xs shadow-xs">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
          3
        </div>
      );
    }
    return <span className="text-slate-400 font-bold text-xs w-7 text-center">#{rank}</span>;
  };

  const getTierPill = (tier: string) => {
    if (tier.includes('Premier') || tier.includes('Hall of Fame')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          ★ {tier}
        </span>
      );
    }
    if (tier.includes('100%')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          {tier}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
        {tier}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Billing by Agent Leaderboard</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Ptah Real Estate (Waterfall)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official agency gross commission rankings and club recognition status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Category Tabs */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCategory('overall')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                category === 'overall' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Overall Billing
            </button>
            <button
              onClick={() => setCategory('transactions')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                category === 'transactions' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Transactions Count
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="YTD 2026">YTD 2026</option>
              <option value="Q1 2026">Q1 2026</option>
              <option value="Last 12 Months">Last 12 Months</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search agent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-44"
              />
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto p-4 text-xs">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-14 text-center">Rank</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Club Recognition Tier</th>
                  <th className="px-4 py-3 text-center">Transactions</th>
                  <th className="px-4 py-3 text-right">Total Billing (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedEntries.map((agent, index) => {
                  const isCurrentUser = agent.agentName.includes('Amanda');
                  return (
                    <tr
                      key={agent.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                        isCurrentUser ? 'bg-amber-50/60 dark:bg-amber-950/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center flex justify-center">
                        {getRankBadge(index + 1)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={agent.avatarUrl}
                            alt={agent.agentName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{agent.agentName}</span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-950">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500">{agent.officeName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getTierPill(agent.clubTier)}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {agent.transactionsCount} Deals
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {formatCurrency(agent.totalBillingZar)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
