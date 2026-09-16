import React, { useState, useMemo } from 'react';
import {
  Target,
  TrendingUp,
  DollarSign,
  Percent,
  Award,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building,
  Home,
  MapPin,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Check,
  AlertTriangle,
  Sliders,
  BarChart3,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { BusinessPlanConfig, BusinessExpenseItem, SuburbTargetItem, Lead } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ClientPortalSummaryWidget } from './ClientPortalSummaryWidget';
import { AutomatedLeadAssignmentWidget } from './AutomatedLeadAssignmentWidget';

interface BusinessPlanViewProps {
  plan: BusinessPlanConfig;
  onUpdatePlan: (updatedPlan: BusinessPlanConfig) => void;
  onNavigateView?: (view: any) => void;
  leads?: Lead[];
  onSelectLead?: (lead: Lead) => void;
  onUpdateLead?: (lead: Lead) => void;
}

export const BusinessPlanView: React.FC<BusinessPlanViewProps> = ({
  plan,
  onUpdatePlan,
  onNavigateView,
  leads = [],
  onSelectLead,
  onUpdateLead,
}) => {
  const [activeTab, setActiveTab] = useState<'budget' | 'projections' | 'expenses' | 'suburbs' | 'portals' | 'lead_assignment' | 'history'>('budget');
  const [selectedYear, setSelectedYear] = useState<number>(plan.year || 2026);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Local editable form state
  const [monthlyNetTakeHome, setMonthlyNetTakeHome] = useState<number>(plan.monthlyNetTakeHome);
  const [salesPercent, setSalesPercent] = useState<number>(plan.salesVsRentalSplit.salesPercent);
  const [taxRate, setTaxRate] = useState<number>(plan.incomeTaxRatePercent);
  const [salesAgentShare, setSalesAgentShare] = useState<number>(plan.salesCommissionSplit.agentSharePercent);
  const [salesOfficeShare, setSalesOfficeShare] = useState<number>(plan.salesCommissionSplit.officeSharePercent);
  const [rentalAgentShare, setRentalAgentShare] = useState<number>(plan.rentalCommissionSplit.agentSharePercent);
  const [rentalOfficeShare, setRentalOfficeShare] = useState<number>(plan.rentalCommissionSplit.officeSharePercent);
  const [actualCommissionRateYtd, setActualCommissionRateYtd] = useState<number>(plan.actualCommissionRateYtd);
  const [employmentType, setEmploymentType] = useState<'independent_contractor' | 'employee'>(plan.employmentType);
  const [expenses, setExpenses] = useState<BusinessExpenseItem[]>(plan.monthlyExpenses);
  const [suburbs, setSuburbs] = useState<SuburbTargetItem[]>(plan.suburbTargets);

  // Add new suburb modal state
  const [isAddSuburbOpen, setIsAddSuburbOpen] = useState(false);
  const [newSuburbName, setNewSuburbName] = useState('');
  const [newSuburbAvgPrice, setNewSuburbAvgPrice] = useState(2500000);
  const [newSuburbHistoricalUnits, setNewSuburbHistoricalUnits] = useState(50);
  const [newSuburbTargetUnits, setNewSuburbTargetUnits] = useState(2);

  // Add new expense state
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState(1500);

  // Real-time Calculations matching Ptah Real Estate Business Plan Engine
  const calculations = useMemo(() => {
    const monthlyNet = Number(monthlyNetTakeHome) || 0;
    const annualNet = monthlyNet * 12;

    const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const totalAnnualExpenses = totalMonthlyExpenses * 12;

    // Gross income needed before tax (Net + Expenses) / (1 - TaxRate)
    const effectiveTaxRate = (Number(taxRate) || 30) / 100;
    const monthlyGrossIncomeNeeded = effectiveTaxRate < 1 
      ? (monthlyNet + totalMonthlyExpenses) / (1 - effectiveTaxRate) 
      : (monthlyNet + totalMonthlyExpenses);
    const annualGrossIncomeNeeded = monthlyGrossIncomeNeeded * 12;
    const monthlyTaxProvision = monthlyGrossIncomeNeeded - monthlyNet - totalMonthlyExpenses;
    const annualTaxProvision = monthlyTaxProvision * 12;

    // Split between Sales and Rental
    const salesRatio = (Number(salesPercent) || 90) / 100;
    const rentalRatio = 1 - salesRatio;

    const agentSalesShareRatio = (Number(salesAgentShare) || 70) / 100;
    const agentRentalShareRatio = (Number(rentalAgentShare) || 70) / 100;

    // Gross Commission Needed by the Office/Agent to achieve Agent's Gross Income
    const salesCommissionPortion = annualGrossIncomeNeeded * salesRatio;
    const rentalCommissionPortion = annualGrossIncomeNeeded * rentalRatio;

    const requiredSalesCommission = agentSalesShareRatio > 0 ? salesCommissionPortion / agentSalesShareRatio : 0;
    const requiredRentalCommission = agentRentalShareRatio > 0 ? rentalCommissionPortion / agentRentalShareRatio : 0;
    const requiredAnnualCommission = requiredSalesCommission + requiredRentalCommission;
    const requiredMonthlyCommission = requiredAnnualCommission / 12;

    // Sales Volume Needed (Required Sales Commission / Commission Rate)
    const commRateRatio = (Number(actualCommissionRateYtd) || 3.34) / 100;
    const requiredSalesVolume = commRateRatio > 0 ? requiredSalesCommission / commRateRatio : 0;

    // Suburb Projected Totals
    const totalProjectedUnits = suburbs.reduce((sum, s) => sum + (Number(s.targetUnits) || 0), 0);
    const totalProjectedSalesVolume = suburbs.reduce((sum, s) => sum + (Number(s.projectedValue) || 0), 0);
    const projectedAnnualCommission = totalProjectedSalesVolume * commRateRatio * agentSalesShareRatio;

    const volumeDeficitOrSurplus = totalProjectedSalesVolume - requiredSalesVolume;

    return {
      monthlyNet,
      annualNet,
      totalMonthlyExpenses,
      totalAnnualExpenses,
      monthlyGrossIncomeNeeded,
      annualGrossIncomeNeeded,
      monthlyTaxProvision,
      annualTaxProvision,
      requiredMonthlyCommission,
      requiredAnnualCommission,
      requiredSalesCommission,
      requiredRentalCommission,
      requiredSalesVolume,
      totalProjectedUnits,
      totalProjectedSalesVolume,
      projectedAnnualCommission,
      volumeDeficitOrSurplus,
    };
  }, [
    monthlyNetTakeHome,
    expenses,
    taxRate,
    salesPercent,
    salesAgentShare,
    rentalAgentShare,
    actualCommissionRateYtd,
    suburbs,
  ]);

  // Historical CRM statistics based on 'deal_won' leads
  const crmConversionMetrics = useMemo(() => {
    const totalLeads = leads.length;
    const wonLeads = leads.filter((l) => l.status === 'deal_won');
    const wonCount = wonLeads.length;
    const wonRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 16.7;

    const wonPrices = wonLeads.filter((l) => l.propertyPrice && l.propertyPrice > 0).map((l) => l.propertyPrice!);
    const allPrices = leads.filter((l) => l.propertyPrice && l.propertyPrice > 0).map((l) => l.propertyPrice!);
    const avgPrice = wonPrices.length > 0
      ? Math.round(wonPrices.reduce((a, b) => a + b, 0) / wonPrices.length)
      : allPrices.length > 0
      ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
      : 4850000;

    return {
      totalLeads,
      wonCount,
      wonRate: Math.round(wonRate * 10) / 10,
      avgPrice,
      activePipelineCount: leads.filter((l) => l.status !== 'deal_lost' && l.status !== 'deal_won').length,
    };
  }, [leads]);

  // Dynamic simulation inputs for Projected Revenue
  const [simulatedConversionRate, setSimulatedConversionRate] = useState<number>(() => crmConversionMetrics.wonRate || 16.7);
  const [simulatedAvgPrice, setSimulatedAvgPrice] = useState<number>(() => crmConversionMetrics.avgPrice || 4850000);
  const [simulatedMonthlyLeads, setSimulatedMonthlyLeads] = useState<number>(12);
  const [projectionChartMode, setProjectionChartMode] = useState<'monthly' | 'cumulative'>('monthly');

  // Reset to live CRM stats
  const handleResetToCrmStats = () => {
    setSimulatedConversionRate(crmConversionMetrics.wonRate || 16.7);
    setSimulatedAvgPrice(crmConversionMetrics.avgPrice || 4850000);
    setSimulatedMonthlyLeads(12);
  };

  // Commission & Revenue Projection calculations
  const projectedRevenueMetrics = useMemo(() => {
    const commRate = (Number(actualCommissionRateYtd) || 3.5) / 100;
    const agentSplit = (Number(salesAgentShare) || 70) / 100;
    const conversionDecimal = (Number(simulatedConversionRate) || 16.7) / 100;
    const monthlyLeads = Number(simulatedMonthlyLeads) || 12;
    const avgPrice = Number(simulatedAvgPrice) || 4850000;

    // Expected deals won per month
    const expectedMonthlyDealsWon = monthlyLeads * conversionDecimal;
    const expectedAnnualDealsWon = expectedMonthlyDealsWon * 12;

    // Commission per deal
    const grossCommissionPerDeal = avgPrice * commRate;
    const agentNetCommissionPerDeal = grossCommissionPerDeal * agentSplit;
    const officeCommissionPerDeal = grossCommissionPerDeal * (1 - agentSplit);

    // Monthly & Annual projected commission income
    const monthlyProjectedCommission = expectedMonthlyDealsWon * agentNetCommissionPerDeal;
    const annualProjectedCommission = monthlyProjectedCommission * 12;

    // Comparison against Required Target Sales Commission
    const requiredAnnualCommission = calculations.requiredSalesCommission || calculations.requiredAnnualCommission;
    const requiredMonthlyCommission = calculations.requiredMonthlyCommission;
    const annualSurplusOrDeficit = annualProjectedCommission - requiredAnnualCommission;
    const attainmentPercent = requiredAnnualCommission > 0
      ? Math.round((annualProjectedCommission / requiredAnnualCommission) * 100)
      : 100;

    // 12-Month Seasonal Trend projection data
    const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const SEASONAL_FACTORS = [0.95, 1.05, 1.10, 0.90, 0.85, 0.80, 0.85, 0.95, 1.10, 1.20, 1.25, 1.00];

    let runningProjected = 0;
    let runningTarget = 0;

    const trendData = MONTH_LABELS.map((month, idx) => {
      const seasonalMultiplier = SEASONAL_FACTORS[idx];
      const monthlyProjected = Math.round(monthlyProjectedCommission * seasonalMultiplier);
      const targetBenchmark = Math.round(requiredMonthlyCommission);

      runningProjected += monthlyProjected;
      runningTarget += targetBenchmark;

      return {
        month,
        projectedCommission: monthlyProjected,
        targetBenchmark: targetBenchmark,
        cumulativeProjected: runningProjected,
        cumulativeTarget: runningTarget,
        dealsWonProjected: Math.round(expectedMonthlyDealsWon * seasonalMultiplier * 10) / 10,
      };
    });

    return {
      commRatePercent: commRate * 100,
      agentSplitPercent: agentSplit * 100,
      expectedMonthlyDealsWon: Math.round(expectedMonthlyDealsWon * 10) / 10,
      expectedAnnualDealsWon: Math.round(expectedAnnualDealsWon * 10) / 10,
      grossCommissionPerDeal,
      agentNetCommissionPerDeal,
      officeCommissionPerDeal,
      monthlyProjectedCommission,
      annualProjectedCommission,
      annualSurplusOrDeficit,
      attainmentPercent,
      trendData,
    };
  }, [
    simulatedConversionRate,
    simulatedAvgPrice,
    simulatedMonthlyLeads,
    actualCommissionRateYtd,
    salesAgentShare,
    calculations.requiredSalesCommission,
    calculations.requiredAnnualCommission,
    calculations.requiredMonthlyCommission,
  ]);

  // Handle unit target changes in suburbs table
  const handleSuburbTargetChange = (id: string, targetUnits: number) => {
    setSuburbs((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const validUnits = Math.max(0, targetUnits);
          return {
            ...s,
            targetUnits: validUnits,
            projectedValue: validUnits * s.averagePrice,
          };
        }
        return s;
      })
    );
  };

  // Add custom suburb
  const handleAddSuburb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuburbName.trim()) return;

    const newSub: SuburbTargetItem = {
      id: `sub-${Date.now()}`,
      suburbName: newSuburbName.trim(),
      historicalUnits: newSuburbHistoricalUnits,
      averagePrice: newSuburbAvgPrice,
      targetUnits: newSuburbTargetUnits,
      projectedValue: newSuburbTargetUnits * newSuburbAvgPrice,
    };

    setSuburbs((prev) => [newSub, ...prev]);
    setNewSuburbName('');
    setIsAddSuburbOpen(false);
  };

  // Remove suburb
  const handleDeleteSuburb = (id: string) => {
    setSuburbs((prev) => prev.filter((s) => s.id !== id));
  };

  // Add new business expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName.trim()) return;

    const newExp: BusinessExpenseItem = {
      id: `exp-${Date.now()}`,
      name: newExpenseName.trim(),
      amount: Number(newExpenseAmount) || 0,
      isTaxDeductible: true,
    };

    setExpenses((prev) => [...prev, newExp]);
    setNewExpenseName('');
    setNewExpenseAmount(1500);
  };

  // Delete business expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Toggle tax deductible on expense
  const handleToggleDeductible = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isTaxDeductible: !e.isTaxDeductible } : e))
    );
  };

  // Reset Changes
  const handleReset = () => {
    setMonthlyNetTakeHome(plan.monthlyNetTakeHome);
    setSalesPercent(plan.salesVsRentalSplit.salesPercent);
    setTaxRate(plan.incomeTaxRatePercent);
    setSalesAgentShare(plan.salesCommissionSplit.agentSharePercent);
    setSalesOfficeShare(plan.salesCommissionSplit.officeSharePercent);
    setRentalAgentShare(plan.rentalCommissionSplit.agentSharePercent);
    setRentalOfficeShare(plan.rentalCommissionSplit.officeSharePercent);
    setActualCommissionRateYtd(plan.actualCommissionRateYtd);
    setEmploymentType(plan.employmentType);
    setExpenses(plan.monthlyExpenses);
    setSuburbs(plan.suburbTargets);
  };

  // Save changes and persist
  const handleSave = () => {
    const updated: BusinessPlanConfig = {
      ...plan,
      year: selectedYear,
      monthlyNetTakeHome,
      salesVsRentalSplit: {
        salesPercent,
        rentalPercent: 100 - salesPercent,
      },
      incomeTaxRatePercent: taxRate,
      salesCommissionSplit: {
        agentSharePercent: salesAgentShare,
        officeSharePercent: salesOfficeShare,
      },
      rentalCommissionSplit: {
        agentSharePercent: rentalAgentShare,
        officeSharePercent: rentalOfficeShare,
      },
      rentalCommissionTargetAnnual: calculations.requiredRentalCommission,
      actualCommissionRateYtd,
      employmentType,
      monthlyExpenses: expenses,
      suburbTargets: suburbs,
      clubStatus: {
        ...plan.clubStatus,
        percentOfTarget: Math.round((plan.clubStatus.ytdCommission / calculations.requiredAnnualCommission) * 100) || 12,
      },
    };

    onUpdatePlan(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Ptah Club Tier Check
  const getClubTierName = (commission: number) => {
    if (commission >= 5000000) return "Diamond Club (R 5,000,000+)";
    if (commission >= 3000000) return "Chairman's Club (R 3,000,000+)";
    if (commission >= 2000000) return "Platinum Club (R 2,000,000+)";
    if (commission >= 1000000) return "Gold Club (R 1,000,000+)";
    if (commission >= 500000) return "Silver Club (R 500,000+)";
    return "Bronze Club (Requires R 231,000+)";
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Header Row with Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Business Plan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              Ptah Real Estate Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personal financial targets, gross commission modeling, suburb volume planning, and awards tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Plan year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved to CRM!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Business Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ptah AI Sidekick Info Banner */}
      <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800/80 dark:via-indigo-950/30 dark:to-slate-800/80 border border-blue-200/80 dark:border-blue-800/50 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
            <span className="font-bold text-blue-700 dark:text-blue-300">My Business Plan</span> will power the{' '}
            <span className="font-bold text-indigo-700 dark:text-indigo-300">Ptah AI Sidekick</span> coming soon!
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time suburb analysis, proactive task coaching, and predictive commission pacing.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Metrics (Matching Screenshot 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Units Sold (YTD) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold">Units Sold (YTD)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              +{plan.ytdActuals.unitsSold - plan.ytdActuals.targetUnits}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {plan.ytdActuals.unitsSold}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / Target: {plan.ytdActuals.targetUnits}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Actual vs planned registered deeds transfers
          </p>
        </div>

        {/* Card 2: Sales Volume (YTD) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold">Sales Volume (YTD)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              +{formatCurrency(plan.ytdActuals.salesVolume)}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              R {(plan.ytdActuals.salesVolume / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / Target: R {(plan.ytdActuals.targetSalesVolume / 1000).toFixed(0)}k
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Total transactional sales registered
          </p>
        </div>

        {/* Card 3: Total Commission Earned (YTD) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold">Total Commission Earned (YTD)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              -R {Math.round((calculations.requiredAnnualCommission - plan.ytdActuals.totalCommissionEarned) / 1000)}k
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              R {(plan.ytdActuals.totalCommissionEarned / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / Target: R {(calculations.requiredAnnualCommission / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((plan.ytdActuals.totalCommissionEarned / calculations.requiredAnnualCommission) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Card 4: Commission Rate % (YTD) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold">Commission Rate % (YTD)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {(actualCommissionRateYtd - 3.68).toFixed(2)}%
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {actualCommissionRateYtd}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / Target: 3.68%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Calculated from registered sales transactions
          </p>
        </div>
      </div>

      {/* Ptah Club Status Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ptah Club Status:</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Current: -</span>
                <span className="text-slate-400">→</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Target: {getClubTierName(calculations.requiredAnnualCommission)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Current YTD: <strong className="text-slate-900 dark:text-white">{formatCurrency(plan.ytdActuals.totalCommissionEarned)}</strong>{' '}
                ({Math.round((plan.ytdActuals.totalCommissionEarned / 231000) * 100)}% of target)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Bronze Club</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">Silver Club</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">Gold Club</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">Platinum</span>
          </div>
        </div>

        {/* Visual Progress Bar to Target */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(8, Math.round((plan.ytdActuals.totalCommissionEarned / 231000) * 100)))}%` }}
          />
        </div>
      </div>

      {/* Executive Client Document Portal Summary Widget */}
      <ClientPortalSummaryWidget
        leads={leads}
        onSelectLead={onSelectLead}
        onUpdateLead={onUpdateLead}
      />

      {/* Main Tabs Navigation - Robust, Scrollbar-Free and Non-Shrinking */}
      <div className="bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0 select-none">
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'budget'
              ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Budget & Income</span>
        </button>
        <button
          onClick={() => setActiveTab('projections')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'projections'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Projected Revenue</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
            Trend Line
          </span>
        </button>
        <button
          onClick={() => setActiveTab('lead_assignment')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'lead_assignment'
              ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs border border-purple-200 dark:border-purple-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Lead Assignment Rules</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">
            Auto
          </span>
        </button>
        <button
          onClick={() => setActiveTab('portals')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'portals'
              ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Document Portals</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Business Expenses</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-mono">
            {expenses.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('suburbs')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'suburbs'
              ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Suburb Targets</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
            {suburbs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-900'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Monthly History</span>
        </button>
      </div>

      {/* TAB 1: BUDGET & INCOME (Matching Screenshots 3 & 4) */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Variable Inputs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
              {/* Section 1: Personal Income Needed */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  Personal Income Needed
                </label>
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Required Monthly Take-Home (Net):
                  </span>
                  <div className="relative mt-1 max-w-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-400 font-bold">
                      R
                    </span>
                    <input
                      type="number"
                      value={monthlyNetTakeHome}
                      onChange={(e) => setMonthlyNetTakeHome(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Sales vs Rental Income Split */}
              <div className="border-t border-slate-100 dark:border-slate-700/80 pt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Sales vs Rental Income Split
                  </label>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Sales: <strong className="text-blue-600">{salesPercent}%</strong> • Rental:{' '}
                    <strong className="text-rose-500">{100 - salesPercent}%</strong>
                  </span>
                </div>

                {/* Dual Color Segmented Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex mb-3">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${salesPercent}%` }}
                    title={`Sales: ${salesPercent}%`}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${100 - salesPercent}%` }}
                    title={`Rental: ${100 - salesPercent}%`}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={salesPercent}
                    onChange={(e) => setSalesPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              {/* Section 3: Income Tax Rate */}
              <div className="border-t border-slate-100 dark:border-slate-700/80 pt-5">
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  Income Tax Rate
                </label>
                <div className="flex items-center space-x-3 max-w-sm">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="45"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Estimated effective SARS tax bracket
                  </span>
                </div>
              </div>

              {/* Section 4: Sales Commission Split */}
              <div className="border-t border-slate-100 dark:border-slate-700/80 pt-5">
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Sales Commission Split
                </label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Agent Share (%)</span>
                    <input
                      type="number"
                      value={salesAgentShare}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSalesAgentShare(val);
                        setSalesOfficeShare(100 - val);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Office Share (%)</span>
                    <input
                      type="number"
                      value={salesOfficeShare}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Rental Commission Split */}
              <div className="border-t border-slate-100 dark:border-slate-700/80 pt-5">
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Rental Commission Split
                </label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Agent Share (%)</span>
                    <input
                      type="number"
                      value={rentalAgentShare}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRentalAgentShare(val);
                        setRentalOfficeShare(100 - val);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Office Share (%)</span>
                    <input
                      type="number"
                      value={rentalOfficeShare}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Key Commission Benchmarks */}
              <div className="border-t border-slate-100 dark:border-slate-700/80 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Rental Commission Target (Annual):
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(calculations.requiredRentalCommission)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Actual Commission Rate (YTD):
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <input
                      type="number"
                      step="0.01"
                      value={actualCommissionRateYtd}
                      onChange={(e) => setActualCommissionRateYtd(Number(e.target.value))}
                      className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-semibold text-slate-500">%</span>
                  </div>
                </div>
              </div>

              {/* Calculation Summary Row (Matching Screenshot 3) */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Monthly Cash Flow Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Net income needed:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(calculations.monthlyNet)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Business expenses:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(calculations.totalMonthlyExpenses)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Tax provision:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(calculations.monthlyTaxProvision)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Gross income needed:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(calculations.monthlyGrossIncomeNeeded)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save and Reset Action Buttons (Matching Screenshot 3) */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Reset Changes
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Business Plan</span>
                </button>
              </div>
            </div>

            {/* Financial Estimates Disclaimer (Expandable matching Screenshot 4) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setShowDisclaimer(!showDisclaimer)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Financial Estimates Disclaimer</span>
                </div>
                {showDisclaimer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDisclaimer && (
                <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2 leading-relaxed">
                  <p>
                    The financial estimates generated in this Business Plan are projections for planning purposes only and
                    do not constitute legal, tax, or financial advice. Commission splits, tax provisions, and sales volume
                    calculations are based upon user inputs and historical deeds office averages.
                  </p>
                  <p>
                    Independent contractors and registered estate agents operating under the Property Practitioners
                    Regulatory Authority (PPRA) and South African Revenue Service (SARS) remain responsible for their own
                    provisional tax payments, VAT registrations, and operational business expense audits.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Target Cards & Annual Summary (Matching Screenshots 3 & 4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Required Monthly Commission Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Required Monthly Commission
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(calculations.requiredMonthlyCommission)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Based on personal income and commission split model
              </p>
            </div>

            {/* Required Annual Commission Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Required Annual Commission
              </span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(calculations.requiredAnnualCommission)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Annual target to meet required lifestyle net income
              </p>
            </div>

            {/* Projected Annual Commission Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Projected Annual Commission
              </span>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(calculations.projectedAnnualCommission)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Calculated from active suburb targets: {calculations.totalProjectedUnits} units
              </p>
            </div>

            {/* Target Club Status Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Target Club Status
              </span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                <Award className="w-5 h-5" />
                <span>{getClubTierName(calculations.requiredAnnualCommission)}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Official Ptah Real Estate qualification tier
              </p>
            </div>

            {/* Annual Summary Card (Matching Screenshot 4) */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Calculator className="w-4 h-4" />
                <span>Annual Summary</span>
              </h4>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Net income (target):</span>
                  <span className="font-semibold text-white">{formatCurrency(calculations.annualNet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax provision:</span>
                  <span className="font-semibold text-white">{formatCurrency(calculations.annualTaxProvision)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Business expenses:</span>
                  <span className="font-semibold text-white">{formatCurrency(calculations.totalAnnualExpenses)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Total commission needed:</span>
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(calculations.requiredAnnualCommission)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sales volume needed:</span>
                  <span className="font-bold text-blue-300">
                    {formatCurrency(calculations.requiredSalesVolume)}
                  </span>
                </div>
              </div>
            </div>

            {/* Projected Revenue Teaser Card in Budget Tab */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 rounded-2xl border border-emerald-200/90 dark:border-emerald-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Commission Projection Engine
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  {crmConversionMetrics.wonRate}% Conversion
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(projectedRevenueMetrics.annualProjectedCommission)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Paced at <strong>{projectedRevenueMetrics.expectedMonthlyDealsWon} deals/mo</strong> @ avg {formatCurrency(simulatedAvgPrice)}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('projections')}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Open Projected Revenue Trend Line</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROJECTED REVENUE & COMMISSION TREND LINE */}
      {activeTab === 'projections' && (
        <div className="space-y-6 animate-fade-in" id="projected-revenue-section">
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>AI Revenue & Commission Forecaster</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Projected Commission Revenue & Deal Conversion Model
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Automatically calculates potential commission income by combining real CRM <strong className="text-emerald-700 dark:text-emerald-300">deal_won</strong> lead conversion rates ({crmConversionMetrics.wonRate}%), registered property sales values (avg {formatCurrency(crmConversionMetrics.avgPrice)}), and commission split structures.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleResetToCrmStats}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                title="Reset simulation parameters to match live CRM statistics"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to CRM Actuals</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Projections</span>
              </button>
            </div>
          </div>

          {/* Top 4 Core Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Deal Won Conversion Rate */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Deal Won Rate</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  CRM Actual: {crmConversionMetrics.wonRate}%
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1.5">
                <span>{simulatedConversionRate}%</span>
                <span className="text-xs font-medium text-slate-400">conversion</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Yields <strong>{projectedRevenueMetrics.expectedMonthlyDealsWon} deals/mo</strong> from {simulatedMonthlyLeads} inbound leads
              </p>
            </div>

            {/* Card 2: Average Property Price */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Avg Property Price</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {formatCurrency(crmConversionMetrics.avgPrice)}
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(simulatedAvgPrice)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Benchmark based on {crmConversionMetrics.wonCount} won transactions & active stock
              </p>
            </div>

            {/* Card 3: Commission Per Deal */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Agent Commission / Deal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {salesAgentShare}% Split
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(projectedRevenueMetrics.agentNetCommissionPerDeal)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Gross: {formatCurrency(projectedRevenueMetrics.grossCommissionPerDeal)} @ {actualCommissionRateYtd}% comm
              </p>
            </div>

            {/* Card 4: Projected Annual Commission */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Projected Annual</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  projectedRevenueMetrics.attainmentPercent >= 100
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {projectedRevenueMetrics.attainmentPercent}% of Target
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(projectedRevenueMetrics.annualProjectedCommission)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Target: {formatCurrency(calculations.requiredAnnualCommission)} ({projectedRevenueMetrics.annualSurplusOrDeficit >= 0 ? '+' : ''}{formatCurrency(projectedRevenueMetrics.annualSurplusOrDeficit)})
              </p>
            </div>
          </div>

          {/* Interactive Sensitivity Controls & Scenario Sliders */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>Pipeline Sensitivity & Scenario Planner</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Adjust lead conversion efficiency, price point, or lead volume to forecast commission variance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Target Net Take-Home: <strong className="text-slate-900 dark:text-white">{formatCurrency(monthlyNetTakeHome)}/mo</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              {/* Slider 1: Lead Conversion Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span>'Deal Won' Conversion Rate:</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono">
                    {simulatedConversionRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="0.5"
                  value={simulatedConversionRate}
                  onChange={(e) => setSimulatedConversionRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>2% (Low pipeline)</span>
                  <span>CRM: {crmConversionMetrics.wonRate}%</span>
                  <span>40% (Top Producer)</span>
                </div>
              </div>

              {/* Slider 2: Average Property Price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Average Property Price:</span>
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 font-mono">
                    {formatCurrency(simulatedAvgPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="25000000"
                  step="250000"
                  value={simulatedAvgPrice}
                  onChange={(e) => setSimulatedAvgPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>R1.0M</span>
                  <span>Actual: R{(crmConversionMetrics.avgPrice / 1000000).toFixed(1)}M</span>
                  <span>R25.0M</span>
                </div>
              </div>

              {/* Slider 3: Inbound Leads Volume */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>Monthly Inbound Leads:</span>
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 font-mono">
                    {simulatedMonthlyLeads} leads/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={simulatedMonthlyLeads}
                  onChange={(e) => setSimulatedMonthlyLeads(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>2 leads</span>
                  <span>Avg: 12 leads</span>
                  <span>50 leads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Line Chart Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>12-Month Projected Commission Trend Line</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visualising potential commission earnings against monthly target benchmark across seasonal luxury cycles.
                </p>
              </div>

              {/* View Switcher: Monthly vs Cumulative */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-750 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setProjectionChartMode('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    projectionChartMode === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly Commission
                </button>
                <button
                  type="button"
                  onClick={() => setProjectionChartMode('cumulative')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    projectionChartMode === 'cumulative'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Cumulative Trajectory
                </button>
              </div>
            </div>

            {/* Recharts Trend Line Chart */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {projectionChartMode === 'monthly' ? (
                  <LineChart data={projectedRevenueMetrics.trendData} margin={{ top: 15, right: 25, left: 15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(val) => `R${(val / 1000).toFixed(0)}k`}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), '']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <ReferenceLine
                      y={calculations.requiredMonthlyCommission}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: 'Target Pace', fill: '#f59e0b', fontSize: 10, position: 'top' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedCommission"
                      name="Projected Commission (ZAR)"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#059669' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="targetBenchmark"
                      name="Target Benchmark"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={projectedRevenueMetrics.trendData} margin={{ top: 15, right: 25, left: 15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(val) => `R${(val / 1000).toFixed(0)}k`}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), '']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Area
                      type="monotone"
                      dataKey="cumulativeProjected"
                      name="Cumulative Projected Commission"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorProjected)"
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeTarget"
                      name="Cumulative Target Commission"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorTarget)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Monthly Forecast Table Grid */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">Month</th>
                    <th className="p-2.5">Estimated Deals</th>
                    <th className="p-2.5">Projected Commission</th>
                    <th className="p-2.5">Target Benchmark</th>
                    <th className="p-2.5">Monthly Variance</th>
                    <th className="p-2.5 text-right rounded-r-xl">Cumulative Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {projectedRevenueMetrics.trendData.map((row, i) => {
                    const variance = row.projectedCommission - row.targetBenchmark;
                    return (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{row.month} 2026</td>
                        <td className="p-2.5 font-mono">{row.dealsWonProjected} deals</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(row.projectedCommission)}
                        </td>
                        <td className="p-2.5 font-mono text-slate-500">
                          {formatCurrency(row.targetBenchmark)}
                        </td>
                        <td className="p-2.5 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            variance >= 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}>
                            {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(row.cumulativeProjected)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Business Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track operational overheads, desk fees, fuel, marketing, and tax-deductible expenses.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Employment type:</span>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="independent_contractor">Independent Contractor</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Expense Name</th>
                  <th className="p-3">Monthly Amount (ZAR)</th>
                  <th className="p-3">Tax Deductible</th>
                  <th className="p-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                      No expenses added yet. Click &quot;Add Expense&quot; below.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{exp.name}</td>
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleDeductible(exp.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer ${
                            exp.isTaxDeductible
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300'
                          }`}
                        >
                          {exp.isTaxDeductible ? 'Yes (Tax Deductible)' : 'No'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Expense Inline Form */}
          <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              placeholder="e.g. Desk fee, Vehicle maintenance, Portal listings"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-400 font-bold">
                R
              </span>
              <input
                type="number"
                placeholder="Monthly amount"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </form>

          {/* Expenses Total Summary */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-6 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Total Monthly Business Expenses:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(calculations.totalMonthlyExpenses)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Total Annual Business Expenses:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(calculations.totalAnnualExpenses)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Save Expenses
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SUBURB TARGETS (Matching Screenshots 5 & 6) */}
      {activeTab === 'suburbs' && (
        <div className="space-y-4">
          {/* Blue Top Banner (Matching Screenshot 5) */}
          <div className="p-4 rounded-2xl bg-blue-600 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-100 uppercase font-semibold">Annual Sales Volume Required:</span>
                <span className="text-lg font-extrabold text-white">
                  R {(calculations.requiredSalesVolume / 1000000).toFixed(2)}M
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Target sales volume needed across your focus suburbs to achieve required commission
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-blue-700/80 px-4 py-2.5 rounded-xl border border-blue-500/60">
              <div>
                <span className="text-[11px] text-blue-200 block">Your Projection:</span>
                <span className="text-base font-bold text-white">
                  R {(calculations.totalProjectedSalesVolume / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="border-l border-blue-500/80 pl-3">
                {calculations.volumeDeficitOrSurplus < 0 ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/40 text-rose-200 border border-rose-400/50">
                    Below target by R {(Math.abs(calculations.volumeDeficitOrSurplus) / 1000000).toFixed(2)}M
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/40 text-emerald-200 border border-emerald-400/50">
                    On track (+R {(calculations.volumeDeficitOrSurplus / 1000000).toFixed(2)}M)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Suburbs Table Card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Midrand & Johannesburg Northern Suburbs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set your annual unit sales targets by suburb to project total gross sales volume.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSuburbOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Suburb</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Targets</span>
                </button>
              </div>
            </div>

            {/* Suburbs Table (Matching Screenshot 5 & 6) */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto no-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Suburb</th>
                    <th className="p-3">Historical Units & Avg Price</th>
                    <th className="p-3 w-32">Units Target</th>
                    <th className="p-3">Projected Value</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {suburbs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-750 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{sub.suburbName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {sub.historicalUnits > 0 ? (
                          <span>
                            {sub.historicalUnits} units •{' '}
                            <strong>{formatCurrency(sub.averagePrice)} avg</strong>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">0 units (New focus area)</span>
                        )}
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          value={sub.targetUnits}
                          onChange={(e) => handleSuburbTargetChange(sub.id, Number(e.target.value))}
                          className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(sub.projectedValue)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteSuburb(sub.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                          title="Remove suburb"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                Total Target Units:{' '}
                <strong className="text-blue-600 dark:text-blue-400">{calculations.totalProjectedUnits} units</strong>
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                Total Projected Sales Value:{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(calculations.totalProjectedSalesVolume)}
                </strong>
              </span>
            </div>
          </div>

          {/* Add Suburb Modal */}
          {isAddSuburbOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add Focus Suburb</h4>

                <form onSubmit={handleAddSuburb} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-semibold mb-1">Suburb Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Waterfall Country Estate, Dainfern"
                      value={newSuburbName}
                      onChange={(e) => setNewSuburbName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold mb-1">Average Price (ZAR)</label>
                      <input
                        type="number"
                        required
                        value={newSuburbAvgPrice}
                        onChange={(e) => setNewSuburbAvgPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold mb-1">Units Target</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newSuburbTargetUnits}
                        onChange={(e) => setNewSuburbTargetUnits(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddSuburbOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                    >
                      Add to Suburbs
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MONTHLY HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Pacing & Registered Deeds History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                12-month performance tracking against required monthly commission benchmarks.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Required Monthly Pace: <strong className="text-blue-600">{formatCurrency(calculations.requiredMonthlyCommission)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Month</th>
                  <th className="p-3">Units Sold</th>
                  <th className="p-3">Sales Volume</th>
                  <th className="p-3">Commission Earned</th>
                  <th className="p-3">Target Pace</th>
                  <th className="p-3 text-right rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {[
                  { month: 'January 2026', units: 0, volume: 0, comm: 0, status: 'Behind' },
                  { month: 'February 2026', units: 0, volume: 0, comm: 0, status: 'Behind' },
                  { month: 'March 2026', units: 1, volume: 655000, comm: 26913.04, status: 'Registered' },
                  { month: 'April 2026 (Projected)', units: 1, volume: 1520000, comm: 35500, status: 'Pipeline' },
                  { month: 'May 2026 (Projected)', units: 2, volume: 3800000, comm: 88900, status: 'Pipeline' },
                  { month: 'June 2026 (Projected)', units: 1, volume: 2420000, comm: 56600, status: 'Pipeline' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.month}</td>
                    <td className="p-3">{row.units} units</td>
                    <td className="p-3 font-mono">{formatCurrency(row.volume)}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(row.comm)}
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {formatCurrency(calculations.requiredMonthlyCommission)}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'Registered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : row.status === 'Pipeline'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AUTOMATED LEAD ASSIGNMENT */}
      {activeTab === 'lead_assignment' && (
        <div className="space-y-6">
          <AutomatedLeadAssignmentWidget
            leads={leads}
            onUpdateLead={onUpdateLead}
            onSelectLead={onSelectLead}
          />
        </div>
      )}

      {/* TAB: CLIENT DOCUMENT PORTALS */}
      {activeTab === 'portals' && (
        <div className="space-y-6">
          <ClientPortalSummaryWidget
            leads={leads}
            onSelectLead={onSelectLead}
            onUpdateLead={onUpdateLead}
          />
        </div>
      )}
    </div>
  );
};
