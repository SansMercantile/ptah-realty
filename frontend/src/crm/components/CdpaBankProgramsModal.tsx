import React, { useState } from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  Percent,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Award,
  DollarSign,
  Send,
  Check,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Phone,
  Mail,
  Clock,
  Plus,
  Building,
  Home
} from 'lucide-react';
import { CdpaBankProgram, CurrenciesDirectReferral } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CdpaBankProgramsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankPrograms: CdpaBankProgram[];
  referrals: CurrenciesDirectReferral[];
  onAddReferral?: (ref: CurrenciesDirectReferral) => void;
}

interface PtahBankMandateAssignment {
  id: string;
  reference: string;
  bankProgram: string;
  propertyTitle: string;
  address: string;
  price: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  occupantName: string;
  occupantPhone: string;
  daysRemaining: number;
  assignedDate: string;
}

interface AvailableBankProperty {
  id: string;
  reference: string;
  suburb: string;
  price: number;
  bank: string;
  program: string;
  type: string;
  erf: string;
}

export const CdpaBankProgramsModal: React.FC<CdpaBankProgramsModalProps> = ({
  isOpen,
  onClose,
  bankPrograms,
  referrals: initialReferrals,
  onAddReferral,
}) => {
  const [activeTab, setActiveTab] = useState<'cdpa_programs' | 'ptah_mandates' | 'currencies_direct'>('cdpa_programs');
  const [mandateSubTab, setMandateSubTab] = useState<'assignments' | 'available'>('assignments');
  const [referrals, setReferrals] = useState<CurrenciesDirectReferral[]>(initialReferrals);

  // Ptah Bank Mandate Quotas & Properties
  const [quotas, setQuotas] = useState({
    standardBank: { used: 3, max: 5 },
    fnb: { used: 4, max: 5 },
    saHomeLoans: { used: 3, max: 5 },
    nedbank: { used: 2, max: 5 },
  });

  const [myAssignments, setMyAssignments] = useState<PtahBankMandateAssignment[]>([
    {
      id: 'asgn-1',
      reference: 'MR639422',
      bankProgram: 'Standard Bank EasySell',
      propertyTitle: '402 San Ridge Heights',
      address: '483 6th Road, Erand Gardens, Midrand, Gauteng',
      price: 845000,
      ownerName: 'Mrs Thembekile B Mbele',
      ownerPhone: '+27 60 329 8214',
      ownerEmail: 'boikanokhoali@gmail.com',
      occupantName: 'Mr Thabo Khoali',
      occupantPhone: '+27 63 615 8598',
      daysRemaining: 7,
      assignedDate: '2026-08-28',
    },
    {
      id: 'asgn-2',
      reference: 'MR581029',
      bankProgram: 'FNB Quick Sell',
      propertyTitle: '18 Barnebush Street',
      address: 'Midridge Park, Midrand, Gauteng',
      price: 1450000,
      ownerName: 'Mr Sipho Ndlovu',
      ownerPhone: '+27 82 910 4421',
      ownerEmail: 'sipho.ndlovu@gmail.com',
      occupantName: 'Owner occupied',
      occupantPhone: '+27 82 910 4421',
      daysRemaining: 12,
      assignedDate: '2026-09-02',
    },
    {
      id: 'asgn-3',
      reference: 'MR491024',
      bankProgram: 'SA Home Loans Sell Assist',
      propertyTitle: '12 Central Avenue',
      address: 'Illovo, Sandton, Gauteng',
      price: 2950000,
      ownerName: 'David & Karen Miller',
      ownerPhone: '+27 83 441 9028',
      ownerEmail: 'miller.dk@netactive.co.za',
      occupantName: 'Tenanted (Lease ends Nov 2026)',
      occupantPhone: '+27 71 882 1049',
      daysRemaining: 5,
      assignedDate: '2026-08-20',
    },
  ]);

  const [availableBankProps, setAvailableBankProps] = useState<AvailableBankProperty[]>([
    {
      id: 'avail-1',
      reference: 'MR781029',
      suburb: 'Midridge Park, Midrand',
      price: 859000,
      bank: 'Standard Bank',
      program: 'EasySell Distressed',
      type: '2-Bed Apartment',
      erf: 'Erf 491/2',
    },
    {
      id: 'avail-2',
      reference: 'MR882910',
      suburb: 'Halfway Gardens, Midrand',
      price: 500000,
      bank: 'SA Home Loans',
      program: 'Sell Assist Program',
      type: '1-Bed Studio',
      erf: 'Erf 102/4',
    },
    {
      id: 'avail-3',
      reference: 'MR991048',
      suburb: 'Orange Grove, Johannesburg',
      price: 1800000,
      bank: 'Nedbank',
      program: 'Repossessed / Assisted',
      type: '3-Bed House',
      erf: 'Erf 820',
    },
    {
      id: 'avail-4',
      reference: 'MR610284',
      suburb: 'Primrose, Germiston',
      price: 1100000,
      bank: 'Standard Bank',
      program: 'EasySell Distressed',
      type: '3-Bed Family Home',
      erf: 'Erf 312',
    },
  ]);

  // Handle assigning an available property to agent's quota
  const handleAssignToQuota = (prop: AvailableBankProperty) => {
    if (quotas.standardBank.used >= quotas.standardBank.max) {
      alert('Your Standard Bank mandate quota is full (5/5). Complete existing sales or request an increase.');
      return;
    }

    const newAssignment: PtahBankMandateAssignment = {
      id: `asgn-${Date.now()}`,
      reference: prop.reference,
      bankProgram: `${prop.bank} ${prop.program}`,
      propertyTitle: `${prop.type} (${prop.suburb})`,
      address: `${prop.erf}, ${prop.suburb}`,
      price: prop.price,
      ownerName: 'Bank Mandate Client',
      ownerPhone: '+27 82 000 0000',
      ownerEmail: 'client.mandate@ptah.co.za',
      occupantName: 'To be confirmed upon inspection',
      occupantPhone: 'N/A',
      daysRemaining: 14,
      assignedDate: new Date().toISOString().split('T')[0],
    };

    setMyAssignments([newAssignment, ...myAssignments]);
    setAvailableBankProps(availableBankProps.filter((p) => p.id !== prop.id));
    setQuotas({
      ...quotas,
      standardBank: { ...quotas.standardBank, used: quotas.standardBank.used + 1 },
    });
    alert(`Property ${prop.reference} assigned to your active bank quota!`);
  };

  // New referral form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [transferAmount, setTransferAmount] = useState(1500000);
  const [currencyPair, setCurrencyPair] = useState<'GBP/ZAR' | 'USD/ZAR' | 'EUR/ZAR' | 'AUD/ZAR'>('GBP/ZAR');
  const [transactionType, setTransactionType] = useState<'inward' | 'outward'>('inward');
  const [submitted, setSubmitted] = useState(false);

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

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const estimatedCommission = Math.round(transferAmount * 0.0035);
    const newRef: CurrenciesDirectReferral = {
      id: `cd-${Date.now()}`,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      currencyPair,
      estimatedTransferAmountZar: transferAmount,
      transactionType,
      status: 'pending_contact',
      referralCommissionZar: estimatedCommission,
      dateReferred: new Date().toISOString().split('T')[0],
      notes: 'Submitted via Ptah CRM Forex Desk',
    };

    setReferrals([newRef, ...referrals]);
    if (onAddReferral) onAddReferral(newRef);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
    }, 2500);
  };

  const totalUsed = quotas.standardBank.used + quotas.fnb.used + quotas.saHomeLoans.used + quotas.nedbank.used;
  const totalMax = quotas.standardBank.max + quotas.fnb.max + quotas.saHomeLoans.max + quotas.nedbank.max;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">
                  CDPA Bank Programs, Ptah Mandates & Forex
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  Accredited Program
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                South African bank distressed property assistance panels, Ptah mandate quotas, and Ptah Forex Desk referrals
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

        {/* Tab Strip */}
        <div className="flex items-center space-x-2 px-4 pt-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('cdpa_programs')}
            className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'cdpa_programs'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bank CDPA Programs ({bankPrograms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ptah_mandates')}
            className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'ptah_mandates'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Ptah Mandate Quotas ({totalUsed}/{totalMax})</span>
          </button>

          <button
            onClick={() => setActiveTab('currencies_direct')}
            className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'currencies_direct'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Ptah Forex Desk ({referrals.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          
          {/* TAB 1: BANK CDPA PROGRAMS */}
          {activeTab === 'cdpa_programs' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Amanda Mokoena — Certified Distressed Property Advisor (CDPA)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Accredited with Standard Bank, FNB, ABSA, and Nedbank to represent distressed homeowners and prevent repossession / sale in execution.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-teal-600 text-white font-bold rounded-lg text-xs shadow-xs shrink-0">
                  Certified Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {prog.bankName}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {prog.programName}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {prog.status}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      {prog.description}
                    </p>

                    <div>
                      <p className="font-bold text-[11px] text-slate-700 dark:text-slate-300 mb-1">Key Program Benefits:</p>
                      <ul className="space-y-1">
                        {prog.keyBenefits.map((b, i) => (
                          <li key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Liaison: <strong className="text-slate-700 dark:text-slate-300">{prog.contactPerson}</strong></span>
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">{prog.contactEmail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PTAH MANDATE QUOTAS */}
          {activeTab === 'ptah_mandates' && (
            <div className="space-y-6">
              
              {/* Quotas Status Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ptah Bank Mandate Quotas
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bank allocations in your primary operating suburbs (Midrand & Sandton)
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-1 rounded-lg">
                    {totalUsed} of {totalMax} Quotas Assigned
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Standard Bank</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {quotas.standardBank.used} / {quotas.standardBank.max} used
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">2 slots open</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">FNB Quick Sell</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {quotas.fnb.used} / {quotas.fnb.max} used
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">1 slot open</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">SA Home Loans</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {quotas.saHomeLoans.used} / {quotas.saHomeLoans.max} used
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">2 slots open</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Nedbank Assisted</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {quotas.nedbank.used} / {quotas.nedbank.max} used
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">3 slots open</span>
                  </div>
                </div>
              </div>

              {/* Sub-nav: My Assignments vs Available in Your Areas */}
              <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                <button
                  type="button"
                  onClick={() => setMandateSubTab('assignments')}
                  className={`text-xs font-bold transition cursor-pointer ${
                    mandateSubTab === 'assignments'
                      ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 pb-2'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  My Bank Assignments ({myAssignments.length})
                </button>

                <button
                  type="button"
                  onClick={() => setMandateSubTab('available')}
                  className={`text-xs font-bold transition cursor-pointer ${
                    mandateSubTab === 'available'
                      ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 pb-2'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Available in Your Areas ({availableBankProps.length})
                </button>
              </div>

              {/* SUB-VIEW A: MY ASSIGNMENTS */}
              {mandateSubTab === 'assignments' && (
                <div className="space-y-4">
                  {myAssignments.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.propertyTitle}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-bold">
                              {item.reference}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                              {item.bankProgram}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{item.address}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                            {formatCurrency(item.price)}
                          </span>
                          <span className="block text-[10px] text-amber-600 font-semibold">
                            {item.daysRemaining} days remaining for feedback
                          </span>
                        </div>
                      </div>

                      {/* Contacts matching Screenshot 14 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Owner Contact</span>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.ownerName}</div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" /> {item.ownerPhone}
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Occupant Contact</span>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.occupantName}</div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" /> {item.occupantPhone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => alert(`Lodge feedback or issue report for: ${item.reference}`)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Report Issue
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Opening Offer submission desk for: ${item.propertyTitle}`)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Submit OTP to Bank
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUB-VIEW B: AVAILABLE IN YOUR AREAS */}
              {mandateSubTab === 'available' && (
                <div className="space-y-3">
                  {availableBankProps.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{prop.suburb}</span>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {prop.reference}
                          </span>
                          <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                            {prop.bank} • {prop.program}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {prop.type} • {prop.erf}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">
                          {formatCurrency(prop.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAssignToQuota(prop)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Assign to My Quota</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PTAH FOREX REFERRAL DESK */}
          {activeTab === 'currencies_direct' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Ptah Forex Desk Partnership
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Provide overseas buyers and expat sellers bank-beating exchange rates, zero transfer fees, and SARB clearance with dedicated Sandton exchange brokers.
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400">Agent Referral Split</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      0.35% on Transferred Volumes
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Paid directly to Ptah Real Estate upon SARB compliance completion.
                    </p>
                  </div>
                </div>

                {/* Form to submit client referral */}
                <form onSubmit={handleCreateReferral} className="md:col-span-7 space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Submit Client Forex Referral
                  </h4>

                  {submitted && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Referral dispatched to Ptah Forex Sandton desk!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Client Name</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Lord James Hamilton"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Client Email</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="james@hamilton.co.uk"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Mobile / WhatsApp</label>
                      <input
                        type="text"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+44 7911 123456"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Pair</label>
                      <select
                        value={currencyPair}
                        onChange={(e) => setCurrencyPair(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-teal-600"
                      >
                        <option value="GBP/ZAR">GBP / ZAR</option>
                        <option value="USD/ZAR">USD / ZAR</option>
                        <option value="EUR/ZAR">EUR / ZAR</option>
                        <option value="AUD/ZAR">AUD / ZAR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Direction</label>
                      <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-teal-600"
                      >
                        <option value="inward">Inward (Buying in SA)</option>
                        <option value="outward">Outward (Emigration/Disposal)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                      Estimated Volume: {formatCurrency(transferAmount)} (Referral Commission: {formatCurrency(Math.round(transferAmount * 0.0035))})
                    </label>
                    <input
                      type="range"
                      min="500000"
                      max="30000000"
                      step="500000"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(Number(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Ptah Forex Desk & Lock Commission</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            CDPA & Bank Relinquishment Panels • Ptah Mandates Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
