import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Zap, 
  ArrowUpRight, 
  History, 
  FileText, 
  Plus, 
  TrendingUp, 
  Wallet, 
  CheckCircle2, 
  ChevronRight,
  Sliders,
  ExternalLink,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface BalanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataCredits: number;
  ficaCredits: number;
  trustCredits: number;
  prepaidBalance?: number;
  onTopUpSuccess?: (dataCredits: number, ficaCredits: number, trustCredits: number, prepaidBalance?: number) => void;
  onOpenBillingSettings?: () => void;
}

export const BalanceDetailsModal: React.FC<BalanceDetailsModalProps> = ({
  isOpen,
  onClose,
  dataCredits = 250,
  ficaCredits = 0,
  trustCredits = 15,
  prepaidBalance = 1250,
  onTopUpSuccess,
  onOpenBillingSettings
}) => {
  const [selectedPack, setSelectedPack] = useState<'fica_50' | 'fica_200' | 'data_250' | 'data_500' | 'trust_20' | 'bundle_master' | 'deposit_500'>('fica_50');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'breakdown' | 'topup' | 'history'>('breakdown');
  const [customDeposit, setCustomDeposit] = useState('500');

  if (!isOpen) return null;

  const totalCredits = dataCredits + ficaCredits + trustCredits;

  const handlePurchase = (packId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      let addedData = 0;
      let addedFica = 0;
      let addedTrust = 0;
      let addedBalance = 0;
      let desc = '';

      if (packId === 'fica_50') {
        addedFica = 50;
        desc = 'Added 50 FICA & Fraud Credits (R 495.00)';
      } else if (packId === 'fica_200') {
        addedFica = 200;
        desc = 'Added 200 FICA & Bureau Credits (R 1,490.00)';
      } else if (packId === 'data_250') {
        addedData = 250;
        desc = 'Added 250 Cadastre & Deeds Data Credits (R 750.00)';
      } else if (packId === 'data_500') {
        addedData = 500;
        desc = 'Added 500 Cadastre & Deeds Data Credits (R 1,250.00)';
      } else if (packId === 'trust_20') {
        addedTrust = 20;
        desc = 'Added 20 Trust & CIPC Vetting Credits (R 390.00)';
      } else if (packId === 'bundle_master') {
        addedData = 300;
        addedFica = 100;
        addedTrust = 30;
        desc = 'Added Enterprise Master Bundle (300 Data + 100 FICA + 30 Trust) (R 1,890.00)';
      } else if (packId === 'custom_deposit') {
        const val = parseFloat(customDeposit) || 500;
        addedBalance = val;
        desc = `Deposited R ${val.toFixed(2)} to Prepaid Wallet Funds`;
      }

      if (onTopUpSuccess) {
        onTopUpSuccess(
          dataCredits + addedData,
          ficaCredits + addedFica,
          trustCredits + addedTrust,
          prepaidBalance + addedBalance
        );
      }

      setSuccessToast(`Payment successful! ${desc}`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 900);
  };

  const RECENT_TRANSACTIONS = [
    {
      id: 'TX-9041',
      date: 'Today, 14:22',
      type: 'Cadastre Query',
      ref: 'ERF 1681 Three Anchor Bay',
      category: 'Data Credit',
      amount: '-1 Credit',
      balanceAfter: `${dataCredits} Credits`,
      status: 'Completed'
    },
    {
      id: 'TX-9038',
      date: 'Today, 11:05',
      type: 'Street View Valuation',
      ref: '5 Richmond Road, Three Anchor Bay',
      category: 'Data Credit',
      amount: '-1 Credit',
      balanceAfter: `${dataCredits + 1} Credits`,
      status: 'Completed'
    },
    {
      id: 'TX-8992',
      date: 'Yesterday, 16:40',
      type: 'Deeds Office WinDeed Extraction',
      ref: 'T48920/2021 Title Deed Copy',
      category: 'Title Deed Credit',
      amount: '-1 Credit',
      balanceAfter: `${trustCredits} Credits`,
      status: 'Completed'
    },
    {
      id: 'TX-8840',
      date: '2026/08/01, 00:00',
      type: 'Monthly Pro Subscription Allocation',
      ref: 'Principal Practitioner Pro Plan',
      category: 'Allocation',
      amount: '+250 Credits',
      balanceAfter: '250 Credits',
      status: 'Credited'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div 
        id="balance-details-modal"
        className="bg-white text-slate-800 w-full max-w-4xl rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="bg-[#006980] px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-700/80 flex items-center justify-center text-cyan-200">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>AVAILABLE FUNDS & CREDIT BALANCES</span>
                <span className="bg-cyan-500/20 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-400/30 font-mono">
                  ZAR WALLET ACTIVE
                </span>
              </h1>
              <span className="text-[10px] text-cyan-100/90 block">
                Real-time breakdown of your Deeds Data, FICA vetting, Title Deed, and Prepaid Wallet funds
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 text-cyan-100 hover:text-white hover:bg-cyan-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Balance Summary Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Combined Total Credits */}
            <div className="bg-slate-800/90 p-3.5 rounded-lg border border-slate-700/80">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>TOTAL AVAILABLE CREDITS</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                {totalCredits} <span className="text-xs font-normal text-slate-300">Credits</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Data ({dataCredits}) + FICA ({ficaCredits}) + Trust/Deeds ({trustCredits})
              </div>
            </div>

            {/* Prepaid Wallet Cash Balance */}
            <div className="bg-slate-800/90 p-3.5 rounded-lg border border-slate-700/80">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>PREPAID WALLET FUNDS</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                R {prepaidBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Available for on-demand Deeds Registry copies
              </div>
            </div>

            {/* Active Subscription Tier */}
            <div className="bg-slate-800/90 p-3.5 rounded-lg border border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                  <span>SUBSCRIPTION PLAN</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <div className="text-sm font-bold text-cyan-200">
                  Principal Practitioner Pro
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Renews: 2026/09/28 (250 credits/mo)
                </div>
              </div>

              {onOpenBillingSettings && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBillingSettings();
                  }}
                  className="mt-2 text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Manage in Billing & Invoices</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('breakdown')}
              className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeSubTab === 'breakdown'
                  ? 'border-[#00bcd4] text-[#006980] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-600" />
              <span>DETAILED BREAKDOWN</span>
            </button>

            <button
              onClick={() => setActiveSubTab('topup')}
              className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeSubTab === 'topup'
                  ? 'border-[#00bcd4] text-[#006980] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>TOP-UP & ADD CREDITS</span>
            </button>

            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeSubTab === 'history'
                  ? 'border-[#00bcd4] text-[#006980] bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-slate-600" />
              <span>USAGE & DEDUCTIONS LEDGER</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 py-1.5">
            <span className="text-[11px] text-slate-500 font-mono">Auto-Recharge: <strong className="text-emerald-700">Active (Threshold &lt; 20)</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
          
          {successToast && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* 1. BREAKDOWN VIEW */}
          {activeSubTab === 'breakdown' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* 1. Data Credits */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">Cadastre & Deeds Data Credits</h4>
                          <span className="text-[10px] text-slate-500">Deeds owner search, ERF boundaries, street view CMA</span>
                        </div>
                      </div>
                      <span className="bg-cyan-50 text-cyan-800 font-mono text-xs font-black px-2.5 py-1 rounded border border-cyan-200">
                        {dataCredits} Left
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      Allows unlimited full-title cadastral lookups across all 9 Deeds Registries in South Africa. Includes street address verification and 10-year transfer histories.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">1 Credit / Property Query</span>
                    <button
                      onClick={() => {
                        setSelectedPack('data_250');
                        setActiveSubTab('topup');
                      }}
                      className="text-cyan-700 hover:text-cyan-900 font-bold text-xs flex items-center gap-1 hover:underline"
                    >
                      <span>Buy Data Pack</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. FICA Credits */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">FICA, IDV & PEP Sanctions Credits</h4>
                          <span className="text-[10px] text-slate-500">Home Affairs live ID verification, deceased status, PEP vetting</span>
                        </div>
                      </div>
                      <span className={`font-mono text-xs font-black px-2.5 py-1 rounded border ${
                        ficaCredits > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {ficaCredits} Left
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      Required for compliance under the Property Practitioners Act and FIC Amendment Act 2017. Generates verified 1-page PDF compliance certificates.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">1 Credit / Verified Individual</span>
                    <button
                      onClick={() => {
                        setSelectedPack('fica_50');
                        setActiveSubTab('topup');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Top Up FICA (From R495)</span>
                    </button>
                  </div>
                </div>

                {/* 3. Title Deed & Document Credits */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">Title Deed & WinDeed Copies</h4>
                          <span className="text-[10px] text-slate-500">Direct Deeds Office Title Deed, bond endorsement & diagram copies</span>
                        </div>
                      </div>
                      <span className="bg-indigo-50 text-indigo-800 font-mono text-xs font-black px-2.5 py-1 rounded border border-indigo-200">
                        {trustCredits} Available
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      Official document extractions from Pretoria, Cape Town, and Pietermaritzburg Deeds registries with full legal servitudes and conditions.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">1 Credit / Full Title Deed PDF</span>
                    <button
                      onClick={() => {
                        setSelectedPack('trust_20');
                        setActiveSubTab('topup');
                      }}
                      className="text-indigo-700 hover:text-indigo-900 font-bold text-xs flex items-center gap-1 hover:underline"
                    >
                      <span>Add Document Credits</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. CMA & Automated Valuation */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">CMA & Multi-Page Valuation PDFs</h4>
                          <span className="text-[10px] text-slate-500">Branded valuation presentations, comparable sales & municipal rolls</span>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-mono text-xs font-bold px-2 py-0.5 rounded">
                        UNLIMITED
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      Included with your Principal Practitioner Pro plan. Export unlimited branded PDF valuation reports with custom agent headshot and agency logo.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-emerald-700 font-semibold">Included in Pro Subscription</span>
                    <span className="text-slate-400 text-[10px] font-mono">R 0.00 / Report</span>
                  </div>
                </div>

              </div>

              {/* Quick Actions Footer Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-[#006980] text-white p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-300" />
                    <span>Need to update billing details or view past VAT Invoices?</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Access SARS-compliant tax invoices, company VAT settings, and credit card management.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubTab('topup')}
                    className="bg-[#00bcd4] hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-1.5 rounded uppercase tracking-wider shadow-xs transition-colors"
                  >
                    Quick Top-Up
                  </button>

                  {onOpenBillingSettings && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBillingSettings();
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-1.5 rounded border border-white/20 transition-colors flex items-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Settings &gt; Billing</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. TOP UP & ADD CREDITS VIEW */}
          {activeSubTab === 'topup' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Select Credit Bundle or Deposit Funds</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Option 1: 50 FICA */}
                  <label
                    onClick={() => setSelectedPack('fica_50')}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                      selectedPack === 'fica_50' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                        50
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">50 x FICA & Fraud Vetting Credits</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Live Home Affairs ID verification + sanctions checks</div>
                        <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          R 9.90 / check
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900 text-sm">R 495.00</div>
                      <div className="text-[9px] text-slate-400">Excl. VAT</div>
                    </div>
                  </label>

                  {/* Option 2: 200 FICA Pack */}
                  <label
                    onClick={() => setSelectedPack('fica_200')}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                      selectedPack === 'fica_200' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                        200
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">200 x FICA & Bureau Bulk Pack</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">High-volume brokerage compliance pack</div>
                        <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          SAVE 25% (R 7.45 / check)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900 text-sm">R 1,490.00</div>
                      <div className="text-[9px] text-slate-400">Excl. VAT</div>
                    </div>
                  </label>

                  {/* Option 3: 250 Data Credits */}
                  <label
                    onClick={() => setSelectedPack('data_250')}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                      selectedPack === 'data_250' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center shrink-0">
                        250
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">250 x Cadastre & Deeds Data Credits</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Property records, owner lookups & suburb transfers</div>
                        <span className="inline-block mt-1 bg-cyan-100 text-cyan-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          R 3.00 / query
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900 text-sm">R 750.00</div>
                      <div className="text-[9px] text-slate-400">Excl. VAT</div>
                    </div>
                  </label>

                  {/* Option 4: 500 Data Pack */}
                  <label
                    onClick={() => setSelectedPack('data_500')}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                      selectedPack === 'data_500' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center shrink-0">
                        500
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">500 x Cadastre Pro Search Pack</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Best value for active listing agents & valuation desks</div>
                        <span className="inline-block mt-1 bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          R 2.50 / query
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900 text-sm">R 1,250.00</div>
                      <div className="text-[9px] text-slate-400">Excl. VAT</div>
                    </div>
                  </label>

                  {/* Option 5: 20 Trust & CIPC Vetting Credits */}
                  <label
                    onClick={() => setSelectedPack('trust_20')}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                      selectedPack === 'trust_20' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center shrink-0">
                        20
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">20 x Trust & CIPC Corporate Vetting</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Direct Masters Office trust deed lookups + director vetting</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900 text-sm">R 390.00</div>
                      <div className="text-[9px] text-slate-400">Excl. VAT</div>
                    </div>
                  </label>

                  {/* Option 6: Enterprise Master Bundle */}
                  <label
                    onClick={() => setSelectedPack('bundle_master')}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                      selectedPack === 'bundle_master' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                        ★
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Enterprise Master Bundle</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">300 Data + 100 FICA + 30 Deeds/Trust Documents</div>
                        <span className="inline-block mt-1 bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded">
                          POPULAR AGENCY COMBO
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900 text-sm">R 1,890.00</div>
                      <div className="text-[9px] text-slate-400">Save R 450</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method Selector & Instant Action */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-slate-900 text-white flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Charge to Primary Card</div>
                    <div className="text-[10px] text-slate-500 font-mono">Visa ending in •••• 4242 (Expires 09/28) • 3D Secure</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handlePurchase(selectedPack)}
                    className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-6 py-2.5 rounded shadow-xs uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Card...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Confirm & Top-Up Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. USAGE HISTORY / LEDGER */}
          {activeSubTab === 'history' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-700" />
                  <span>Real-Time Credit Consumption & Audit Ledger</span>
                </h4>
                <span className="text-[10px] text-slate-500">Showing last 4 transactions (NCA Section 70 compliant)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold text-[11px]">
                      <th className="py-2.5 px-3">Date / Time</th>
                      <th className="py-2.5 px-3">Service & Reference</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Debit / Credit</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {RECENT_TRANSACTIONS.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">{tx.date}</td>
                        <td className="py-2 px-3 font-semibold">
                          <div className="text-slate-900">{tx.type}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{tx.ref}</div>
                        </td>
                        <td className="py-2 px-3 text-[11px]">{tx.category}</td>
                        <td className={`py-2 px-3 text-right font-mono font-bold ${
                          tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-800'
                        }`}>
                          {tx.amount}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-600">{tx.balanceAfter}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">All transactions encrypted with 256-bit TLS & 3D Secure gateway</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-1.5 rounded transition-colors text-xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
