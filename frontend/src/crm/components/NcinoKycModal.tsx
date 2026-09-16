import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Check,
  Download,
  ExternalLink,
  ChevronRight,
  Eye,
  Plus,
  ArrowRight,
  Layers,
  FileCheck,
  CreditCard,
  Building2,
  Users,
  Clock,
  HelpCircle,
  Bell,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { Lead } from '../types';

export interface PtahKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead;
}

export type NcinoKycModalProps = PtahKycModalProps;

interface KycCustomer {
  id: string;
  name: string;
  type: 'Trust' | 'South African Citizen' | 'Company';
  registrationNumber: string;
  incomeTaxNumber: string;
  createdOn: string;
  managedBy: string;
  riskRating: 'Low Risk' | 'Medium Risk' | 'High Risk';
  status: 'Pending Upload' | 'Approved' | 'Under Review';
  statusDate?: string;
  primaryContact: {
    firstNames: string;
    lastNames: string;
    email: string;
    mobile: string;
  };
  additionalDetails: {
    relationshipType: string;
    reason: string;
    sourceOfWealth: string;
    occupation: string;
    masterHighCourtAddress: string;
  };
  documents: {
    title: string;
    status: 'Accepted' | 'Pending' | 'Rejected';
    date: string;
  }[];
  bankDetails: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    branchCode: string;
    verified: boolean;
    checks: { label: string; passed: boolean }[];
  };
}

export const PtahKycModal: React.FC<PtahKycModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('simic_trust');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'documents' | 'parties' | 'screening' | 'risk_rating' | 'bank_details'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditComment, setAuditComment] = useState('');

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

  // Customers data matching Screenshots 4 to 12
  const customers: KycCustomer[] = [
    {
      id: 'simic_trust',
      name: 'SIMIC TRUST',
      type: 'Trust',
      registrationNumber: 'Trust3930/06',
      incomeTaxNumber: '1551539149',
      createdOn: '20 Aug 2026',
      managedBy: 'Amanda Mokoena',
      riskRating: 'Low Risk',
      status: 'Pending Upload',
      primaryContact: {
        firstNames: 'PETEY MICHAEL',
        lastNames: 'MICHAEL',
        email: 'simictrust.st@gmail.com',
        mobile: '+27 72 061 3512',
      },
      additionalDetails: {
        relationshipType: 'Single Activity / Transaction',
        reason: 'Moving & Property Acquisition',
        sourceOfWealth: 'Trust Earnings & Capital Distribution',
        occupation: 'Director at Simic trust',
        masterHighCourtAddress: '6th St, Oukasie, Brits, 0250, North West, ZA',
      },
      documents: [
        { title: 'Trust Deed', status: 'Accepted', date: '2026-08-20' },
        { title: 'Letter of Authority issued by Master of High Court', status: 'Accepted', date: '2026-08-20' },
        { title: 'Municipal Rates and Taxes (< 3 months)', status: 'Accepted', date: '2026-08-21' },
        { title: 'SARS Document reflecting VAT and Tax Numbers', status: 'Accepted', date: '2026-08-21' },
      ],
      bankDetails: {
        bankName: 'Capitec Bank',
        accountType: 'Savings Account',
        accountNumber: '1554704187',
        branchCode: '470010',
        verified: true,
        checks: [
          { label: 'Account exists on South African clearing bureau', passed: true },
          { label: 'Account currently open and active', passed: true },
          { label: 'Accepts electronic credit transfers', passed: true },
          { label: 'Accepts debit orders and settlement pulls', passed: true },
          { label: 'Account open for more than 3 months', passed: true },
          { label: 'Account type verified against statutory trust profile', passed: true },
        ],
      },
    },
    {
      id: 'boitumelo_skosana',
      name: 'Boitumelo Skosana',
      type: 'South African Citizen',
      registrationNumber: '0306210673084',
      incomeTaxNumber: '2712424189',
      createdOn: '14 Aug 2026',
      managedBy: 'Amanda Mokoena',
      riskRating: 'Low Risk',
      status: 'Approved',
      statusDate: '2 Sep 2026',
      primaryContact: {
        firstNames: 'Boitumelo',
        lastNames: 'Skosana',
        email: 'boitumelo.skosana@outlook.com',
        mobile: '+27 83 291 4019',
      },
      additionalDetails: {
        relationshipType: 'Single Activity / Transaction',
        reason: 'Residential Primary Acquisition',
        sourceOfWealth: 'Employment Remuneration & Executive Equity',
        occupation: 'Senior Corporate Director',
        masterHighCourtAddress: 'Pretoria Master of High Court, Gauteng',
      },
      documents: [
        { title: 'South African Smart ID Card (Certified)', status: 'Accepted', date: '2026-08-14' },
        { title: 'Proof of Residential Address (Utility Bill)', status: 'Accepted', date: '2026-08-14' },
        { title: 'SARS Tax Compliance Status PIN', status: 'Accepted', date: '2026-08-15' },
      ],
      bankDetails: {
        bankName: 'Standard Bank of South Africa',
        accountType: 'Private Prestige Current Account',
        accountNumber: '0284910284',
        branchCode: '051001',
        verified: true,
        checks: [
          { label: 'Account exists on South African clearing bureau', passed: true },
          { label: 'Account currently open and active', passed: true },
          { label: 'Accepts electronic credit transfers', passed: true },
          { label: 'Accepts debit orders and settlement pulls', passed: true },
          { label: 'Account open for more than 3 months', passed: true },
          { label: 'Account type verified against statutory individual profile', passed: true },
        ],
      },
    },
    {
      id: 'alex_sterling',
      name: 'Alexander Sterling',
      type: 'South African Citizen',
      registrationNumber: '8808285124089',
      incomeTaxNumber: '1948102941',
      createdOn: '28 Aug 2026',
      managedBy: 'Amanda Mokoena',
      riskRating: 'Low Risk',
      status: 'Approved',
      statusDate: '1 Sep 2026',
      primaryContact: {
        firstNames: 'Alexander',
        lastNames: 'Sterling',
        email: 'alex.sterling@luminarycap.com',
        mobile: '+27 82 443 8901',
      },
      additionalDetails: {
        relationshipType: 'Ongoing Real Estate Mandate',
        reason: 'Luxury Property Acquisition',
        sourceOfWealth: 'Asset Management Portfolio & Equity Dividends',
        occupation: 'Managing Partner, Luminary Capital',
        masterHighCourtAddress: 'Cape Town Master of High Court, Western Cape',
      },
      documents: [
        { title: 'Certified SA Smart ID Card', status: 'Accepted', date: '2026-08-28' },
        { title: 'City of Cape Town Municipal Water & Rates', status: 'Accepted', date: '2026-08-28' },
        { title: 'SARS Good Standing Certificate PIN', status: 'Accepted', date: '2026-08-29' },
      ],
      bankDetails: {
        bankName: 'Investec Private Bank',
        accountType: 'Private Client Account',
        accountNumber: '1001294819',
        branchCode: '580105',
        verified: true,
        checks: [
          { label: 'Account exists on South African clearing bureau', passed: true },
          { label: 'Account currently open and active', passed: true },
          { label: 'Accepts electronic credit transfers', passed: true },
          { label: 'Accepts debit orders and settlement pulls', passed: true },
          { label: 'Account open for more than 3 months', passed: true },
          { label: 'Account type verified against statutory profile', passed: true },
        ],
      },
    },
  ];

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header: Ptah KYC & Compliance */}
        <div className="p-4 sm:px-6 sm:py-3.5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="font-black tracking-tight text-base text-emerald-400">Ptah</span>
              <span className="text-xs text-slate-300 font-bold tracking-wider uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                KYC & Compliance
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-xs text-slate-300">
              Logged in: <span className="font-semibold text-white">Amanda Mokoena</span> (Ptah Real Estate)
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FICA Act No. 38 of 2001 Compliant</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VIEW 1: CUSTOMERS DIRECTORY (Screenshot 4) */}
        {activeView === 'list' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Customer Compliance Registry</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory FICA due diligence, corporate trusts, sanctions screening & bank account verification
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID or tax..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-blue-500 w-56"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => alert('New FICA Applicant Onboarding Flow initiated')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Customer</span>
                </button>
              </div>
            </div>

            {/* Table matching Screenshot 4 */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-800">All Customers ({customers.length})</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-semibold">Active ({customers.length})</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-500 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Entity Type</th>
                      <th className="py-3 px-4">ID / Reg Number</th>
                      <th className="py-3 px-4">Income Tax No</th>
                      <th className="py-3 px-4">Risk Rating</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-400">Created: {c.createdOn} • By: {c.managedBy}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {c.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{c.registrationNumber}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{c.incomeTaxNumber}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {c.riskRating}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              c.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {c.status} {c.statusDate ? `on ${c.statusDate}` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setActiveView('detail');
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-semibold text-xs transition cursor-pointer"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CUSTOMER DETAIL & FICA DOSSIER (Screenshots 5 to 12) */}
        {activeView === 'detail' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation matching Screenshots 5-12 */}
            <div className="w-full md:w-60 bg-slate-50 border-r border-slate-200 p-3 flex flex-col justify-between shrink-0">
              <div>
                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold mb-3 flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Customer List
                </button>

                <div className="p-3 bg-white rounded-xl border border-slate-200 mb-3 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-900">{currentCustomer.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentCustomer.registrationNumber}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {currentCustomer.riskRating}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {[
                    { id: 'profile', label: 'Profile Information', icon: UserCheck },
                    { id: 'documents', label: 'Entity Documents', icon: FileCheck },
                    { id: 'parties', label: 'Related Parties', icon: Users },
                    { id: 'screening', label: 'Screening & PEP', icon: ShieldCheck },
                    { id: 'risk_rating', label: 'Risk Rating (13 pts)', icon: Sliders },
                    { id: 'bank_details', label: 'Bank Details Check', icon: CreditCard },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSubTab(tab.id as any)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                          activeSubTab === tab.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => alert(`Exported official FICA Compliance Dossier for ${currentCustomer.name} as PDF.`)}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF Dossier</span>
                </button>
              </div>
            </div>

            {/* SubTab Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* SUBTAB: PROFILE (Screenshots 5 & 6) */}
              {activeSubTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Profile Information</h4>
                    <p className="text-xs text-slate-500">Corporate & statutory details registered with the Master of the High Court</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Entity Names & Numbers</span>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Juristic / Trust Name</span>
                        <span className="font-bold text-slate-900 text-sm">{currentCustomer.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Registration / Trust Number</span>
                        <span className="font-mono font-bold text-slate-800">{currentCustomer.registrationNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">SARS Income Tax Number</span>
                        <span className="font-mono font-bold text-slate-800">{currentCustomer.incomeTaxNumber}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Primary Contact Information</span>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Authorized Signatory</span>
                        <span className="font-bold text-slate-900">{currentCustomer.primaryContact.firstNames} {currentCustomer.primaryContact.lastNames}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Email</span>
                        <span className="font-mono text-slate-800">{currentCustomer.primaryContact.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mobile</span>
                        <span className="font-mono text-slate-800">{currentCustomer.primaryContact.mobile}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Additional FICA Disclosures</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Business Relationship Type</span>
                        <span className="font-semibold text-slate-800">{currentCustomer.additionalDetails.relationshipType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Reason for Transaction</span>
                        <span className="font-semibold text-slate-800">{currentCustomer.additionalDetails.reason}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Source of Wealth / Capital</span>
                        <span className="font-semibold text-slate-800">{currentCustomer.additionalDetails.sourceOfWealth}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Occupation / Designation</span>
                        <span className="font-semibold text-slate-800">{currentCustomer.additionalDetails.occupation}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Master of the High Court Jurisdiction Address</span>
                      <span className="font-semibold text-slate-800">{currentCustomer.additionalDetails.masterHighCourtAddress}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: ENTITY DOCUMENTS (Screenshot 10) */}
              {activeSubTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Entity Documents & Statutory Filings</h4>
                      <p className="text-xs text-slate-500">Official verified documents under the FICA regulatory framework</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Add statutory document flow')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Document</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {currentCustomer.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300 transition"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{doc.title}</h5>
                            <span className="text-[10px] text-slate-400 font-mono">Uploaded: {doc.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {doc.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => alert(`Viewing document: ${doc.title}`)}
                            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB: RELATED PARTIES (Screenshot 7) */}
              {activeSubTab === 'parties' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Related Parties & Natural Persons</h4>
                      <p className="text-xs text-slate-500">Natural persons linked to the juristic entity who require mandatory verification</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Link new trustee or director')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Link</span>
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                          PM
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">Petey Michael (Trustee)</h5>
                          <span className="text-[11px] text-slate-500 font-mono">SA ID: 7509125192084</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Verified Trustee
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: SCREENING (Screenshots 8 & 9) */}
              {activeSubTab === 'screening' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Automated Screening & Media Watch</h4>
                    <p className="text-xs text-slate-500">Searches performed daily across global PEP, sanctions and adverse media registries</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs">
                      <span className="font-bold text-emerald-900 block text-xs">Watchlist Hits (0)</span>
                      <p className="text-emerald-800 text-[11px] mt-1">
                        No matches found across OFAC, UN Sanctions, or South African FIC Prominent Influential Persons (PIP).
                      </p>
                    </div>

                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs">
                      <span className="font-bold text-emerald-900 block text-xs">Adverse Media Search (0)</span>
                      <p className="text-emerald-800 text-[11px] mt-1">
                        Searches conducted daily across News24, Business Day, and international outlets. No negative mentions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: RISK RATING (Screenshot 11) */}
              {activeSubTab === 'risk_rating' && (
                <div className="space-y-4">
                  <div className="bg-emerald-900 text-white p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
                        FICA Statutory Matrix Result
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">Low Risk Profile Confirmed</h4>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-lg uppercase">
                      Score: 100% Passed
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      'Nationality & Residence: Domestic South African Citizen / Trust',
                      'Entity Structure: Standard registered Inter Vivos Trust with registered Master letters',
                      'Politically Exposed Person (PEP): Not a prominent public official or immediate associate',
                      'Sanctions Screening: Zero hits against UN and domestic Treasury lists',
                      'Adverse Media Check: Clean regulatory and litigation standing',
                      'Suspicion Indicator: Rational transaction proportionate to declared wealth',
                      'Engagement Channel: Verified through accredited licensed broker',
                      'Source of Funds: Clear verifiable banking audit trail',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB: BANK DETAILS (Screenshot 12) */}
              {activeSubTab === 'bank_details' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{currentCustomer.bankDetails.bankName}</h5>
                        <p className="text-[11px] text-slate-500">{currentCustomer.bankDetails.accountType}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Ready for Review & Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Account Number</span>
                        <span className="font-bold text-slate-800">{currentCustomer.bankDetails.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Universal Branch Code</span>
                        <span className="font-bold text-slate-800">{currentCustomer.bankDetails.branchCode}</span>
                      </div>
                    </div>

                    {/* Checklist matching Screenshot 12 */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Account Verification Audit
                      </span>
                      {currentCustomer.bankDetails.checks.map((check, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">Ptah Real Estate • Secure FICA / KYC Broker Gateway</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition cursor-pointer"
          >
            Close KYC Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export const NcinoKycModal = PtahKycModal;
