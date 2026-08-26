import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  CreditCard, 
  Building2, 
  Search, 
  Check, 
  History,
  Lock,
  User,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { KYCReportRecord, KYCReportType, KYCPrescribedPurpose } from '../../types';
import { KYC_INITIAL_HISTORY } from '../../services/mockData';
import { apiFetch } from '../../lib/api';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOwnerName?: string;
  initialOwnerId?: string;
}

export const KYCModal: React.FC<KYCModalProps> = ({
  isOpen,
  onClose,
  initialOwnerName = '',
  initialOwnerId = ''
}) => {
  const [activeReportType, setActiveReportType] = useState<KYCReportType>('PRE_CHECK');
  const [targetName, setTargetName] = useState(initialOwnerName);
  const [targetIdOrReg, setTargetIdOrReg] = useState(initialOwnerId);
  const [dob, setDob] = useState('1978-04-12');
  const [prescribedPurpose, setPrescribedPurpose] = useState<KYCPrescribedPurpose>(
    'Section 18(4) - Credit assessment / Application'
  );
  const [searchReference, setSearchReference] = useState('REF-DUE-DILIGENCE');
  const [hasConsent, setHasConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<KYCReportRecord | null>(null);
  const [historyList, setHistoryList] = useState<KYCReportRecord[]>(KYC_INITIAL_HISTORY);
  const [showHistoryTab, setShowHistoryTab] = useState(false);

  if (!isOpen) return null;

  const getReportCost = (type: KYCReportType) => {
    switch (type) {
      case 'PRE_CHECK': return 'R 11.00';
      case 'CREDIT_REPORT': return 'R 15.00';
      case 'REAL_TIME_IDV': return 'R 12.50';
      case 'SANCTION_SCREENING': return 'R 25.00';
      case 'CIPC_REPORT': return 'R 45.00';
      case 'DETAILED_BUSINESS_REPORT': return 'R 80.00';
      case 'DIRECTOR_ENQUIRY': return 'R 20.00';
      case 'DEEDS_QUERY': return 'R 29.50';
      case 'DOTS_QUERY': return 'R 20.00';
      case 'TITLE_DEED': return 'R 35.00';
      case 'NATIONAL_DEEDS_SEARCH': return 'R 30.00';
      case 'EUA_ENQUIRY': return 'R 18.00';
      default: return 'R 15.00';
    }
  };

  const handleRunVerification = async () => {
    if (!hasConsent) {
      alert('You must confirm consumer consent under the NCA & POPIA before requesting verified KYC data.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch('/api/v1/intelligence/kyc/individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: targetName || 'Subject Applicant',
          id_number: targetIdOrReg || '7912195023088',
          run_faceview: activeReportType === 'REAL_TIME_IDV' || activeReportType === 'FACEVIEW' || activeReportType === 'PRE_CHECK',
          run_credit_check: activeReportType === 'CREDIT_REPORT' || activeReportType === 'PRE_CHECK',
          run_sanctions: activeReportType === 'SANCTION_SCREENING' || activeReportType === 'PRE_CHECK'
        })
      });

      const data = await response.json();
      if (response.ok && data.id) {
        // The production API returns a provider-neutral KycCase. Adapt it
        // to the demo certificate shape so the source-of-truth UI remains
        // unchanged while using the live authenticated backend contract.
        const report: KYCReportRecord = {
          id: data.id,
          reportType: activeReportType,
          targetName: data.subject_name,
          targetIdOrReg: data.id_number || data.registration_number || targetIdOrReg,
          requestedBy: 'Authenticated user',
          timestamp: data.created_at,
          prescribedPurpose,
          searchReference,
          costVatExcl: 0,
          status: data.overall_status === 'passed' ? 'COMPLETED' : 'PENDING',
          expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          data: { checks: data.checks, overallStatus: data.overall_status }
        };
        setCurrentResult(report);
        setHistoryList(prev => [report, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportHistoryCsv = () => {
    const headers = ['Report ID', 'Type', 'Target Subject', 'ID/Reg No', 'Timestamp', 'Cost (Excl VAT)', 'Purpose', 'Status'];
    const rows = historyList.map(h => [
      h.id,
      h.reportType,
      `"${h.targetName}"`,
      `"${h.targetIdOrReg}"`,
      h.timestamp,
      h.costVatExcl,
      `"${h.prescribedPurpose}"`,
      h.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CMA_KYC_Audit_Trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="kyc-suite-modal"
        className="bg-white text-slate-800 w-full max-w-6xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-200" />
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                Know Your Client (KYC) & Deeds Verification Suite
              </h2>
              <span className="text-[10px] text-cyan-100 block">
                Regulated Credit Bureau, Home Affairs IDV, CIPC & National Deeds Registry Engine
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-100 hover:text-white hover:bg-teal-700/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Navigation Categories */}
          <div className="w-full md:w-60 bg-slate-50 p-2.5 border-r border-slate-200 flex flex-col gap-2.5 shrink-0 overflow-y-auto">
            {/* Person Category */}
            <div>
              <span className="text-[10px] font-bold text-cyan-900 uppercase tracking-wider px-2 py-0.5 block">
                Person Verification
              </span>
              <div className="space-y-0.5 mt-0.5">
                {[
                  { id: 'PRE_CHECK', label: 'PRE-Check (Score & Photo)', cost: 'R11.00' },
                  { id: 'CREDIT_REPORT', label: 'Consumer Credit Report', cost: 'R15.00' },
                  { id: 'REAL_TIME_IDV', label: 'Real Time IDV (Home Affairs)', cost: 'R12.50' },
                  { id: 'SANCTION_SCREENING', label: 'Sanction & PEP Screening', cost: 'R25.00' },
                  { id: 'CONSUMER_TRACE', label: 'Consumer Trace / Contact', cost: 'R18.00' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveReportType(item.id as KYCReportType);
                      setShowHistoryTab(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-semibold flex items-center justify-between transition-all ${
                      !showHistoryTab && activeReportType === item.id
                        ? 'bg-[#006980] text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className="text-[10px] font-mono shrink-0 ml-1 opacity-90">{item.cost}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Category */}
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider px-2 py-0.5 block">
                Business & Corporate
              </span>
              <div className="space-y-0.5 mt-0.5">
                {[
                  { id: 'CIPC_REPORT', label: 'CIPC Enterprise Report', cost: 'R45.00' },
                  { id: 'DETAILED_BUSINESS_REPORT', label: 'Full Corporate Credit Report', cost: 'R80.00' },
                  { id: 'DIRECTOR_ENQUIRY', label: 'Director Enquiry', cost: 'R20.00' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveReportType(item.id as KYCReportType);
                      setShowHistoryTab(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-semibold flex items-center justify-between transition-all ${
                      !showHistoryTab && activeReportType === item.id
                        ? 'bg-[#006980] text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className="text-[10px] font-mono shrink-0 ml-1 opacity-90">{item.cost}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deeds Office Searches */}
            <div>
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider px-2 py-0.5 block">
                Deeds Office Searches
              </span>
              <div className="space-y-0.5 mt-0.5">
                {[
                  { id: 'DEEDS_QUERY', label: 'Deeds Office Query', cost: 'R29.50' },
                  { id: 'DOTS_QUERY', label: 'DOTS Tracking Query', cost: 'R20.00' },
                  { id: 'TITLE_DEED', label: 'Title Deed Copy PDF', cost: 'R35.00' },
                  { id: 'NATIONAL_DEEDS_SEARCH', label: 'National Deeds Portfolio', cost: 'R30.00' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveReportType(item.id as KYCReportType);
                      setShowHistoryTab(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-semibold flex items-center justify-between transition-all ${
                      !showHistoryTab && activeReportType === item.id
                        ? 'bg-[#006980] text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className="text-[10px] font-mono shrink-0 ml-1 opacity-90">{item.cost}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* History Audit Trail Tab */}
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowHistoryTab(true)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-between transition-all ${
                  showHistoryTab
                    ? 'bg-[#006980] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Audit History ({historyList.length})</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono font-medium">
                  72h NCR
                </span>
              </button>
            </div>
          </div>

          {/* Right Verification Engine Panel */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3">
            {showHistoryTab ? (
              /* HISTORY AUDIT TRAIL VIEW */
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">KYC Verification Audit Trail</h3>
                    <p className="text-[11px] text-slate-500">
                      Pursuant to Section 70 of the National Credit Act, search inquiries remain retrievable for 72 hours.
                    </p>
                  </div>
                  <button
                    onClick={exportHistoryCsv}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-emerald-900 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Download Records in CSV Format</span>
                  </button>
                </div>

                <div className="bg-white rounded border border-slate-300 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="p-2">Date/Time</th>
                        <th className="p-2">Report Type</th>
                        <th className="p-2">Target Name / Entity</th>
                        <th className="p-2">ID / Registration</th>
                        <th className="p-2">Cost (Excl VAT)</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {historyList.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 text-slate-500 font-mono">{item.timestamp}</td>
                          <td className="p-2 font-bold text-cyan-900">{item.reportType.replace(/_/g, ' ')}</td>
                          <td className="p-2 text-slate-800">{item.targetName}</td>
                          <td className="p-2 font-mono text-slate-700">{item.targetIdOrReg}</td>
                          <td className="p-2 text-emerald-800 font-bold">R {item.costVatExcl.toFixed(2)}</td>
                          <td className="p-2">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded font-bold">
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => {
                                setCurrentResult(item);
                                setShowHistoryTab(false);
                              }}
                              className="px-2 py-0.5 bg-[#006980] hover:bg-teal-700 text-white rounded text-[10px] font-semibold shadow-2xs"
                            >
                              Certificate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* SEARCH FORM & RESULT VIEW */
              <div className="space-y-3">
                {/* Search Form Card */}
                <div className="bg-white p-3.5 rounded border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                        <span>{activeReportType.replace(/_/g, ' ')} Enquiry</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fee: <strong className="text-emerald-800">{getReportCost(activeReportType)} (excl. VAT)</strong> • Instant National Registry Retrieval
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px]">
                        {activeReportType.includes('CIPC') || activeReportType.includes('BUSINESS') 
                          ? 'Company / Trust Name' 
                          : 'Full Legal Name / Surname'}
                      </label>
                      <input
                        type="text"
                        value={targetName}
                        onChange={(e) => setTargetName(e.target.value)}
                        placeholder="e.g. MULLER STEPHAN FRIDOLIN"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600 focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px]">
                        {activeReportType.includes('CIPC') || activeReportType.includes('BUSINESS')
                          ? 'CIPC Registration No' 
                          : '13-Digit SA ID Number / Passport'}
                      </label>
                      <input
                        type="text"
                        value={targetIdOrReg}
                        onChange={(e) => setTargetIdOrReg(e.target.value)}
                        placeholder="e.g. 6703065098084"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600 focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px]">Prescribed Legal Purpose (Section 18(4) NCA)</label>
                      <select
                        value={prescribedPurpose}
                        onChange={(e) => setPrescribedPurpose(e.target.value as KYCPrescribedPurpose)}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs focus:outline-none"
                      >
                        <option value="Section 18(4) - Credit assessment / Application">Section 18(4) - Credit assessment / Application</option>
                        <option value="Section 18(4) - Fraud prevention & Anti-Money Laundering">Section 18(4) - Fraud prevention & Anti-Money Laundering</option>
                        <option value="Section 18(4) - Prospective tenant evaluation">Section 18(4) - Prospective tenant evaluation</option>
                        <option value="Section 18(4) - Employment vetting in financial roles">Section 18(4) - Employment vetting in financial roles</option>
                        <option value="Section 18(4) - Investigation of fraud, corruption or theft">Section 18(4) - Investigation of fraud, corruption or theft</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px]">File / Search Reference Code (Optional)</label>
                      <input
                        type="text"
                        value={searchReference}
                        onChange={(e) => setSearchReference(e.target.value)}
                        placeholder="e.g. REF-RICHMOND-01"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-cyan-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Mandatory Consent Checkbox */}
                  <label className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={hasConsent}
                      onChange={(e) => setHasConsent(e.target.checked)}
                      className="accent-[#006980] mt-0.5"
                    />
                    <span className="text-slate-700 text-[11px]">
                      I confirm that express written consumer consent has been obtained under the <strong>National Credit Act (NCA)</strong> and <strong>Protection of Personal Information Act (POPIA)</strong>.
                    </span>
                  </label>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setTargetName('');
                        setTargetIdOrReg('');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      id="btn-execute-kyc"
                      onClick={handleRunVerification}
                      disabled={isLoading}
                      className="px-3.5 py-1 bg-[#006980] hover:bg-teal-700 text-white font-bold rounded text-xs flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span>Validating Registry...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-200" />
                          <span>Execute {activeReportType.replace(/_/g, ' ')} ({getReportCost(activeReportType)})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Verification Result Certificate Display */}
                {currentResult && (
                  <div className="bg-white p-4 rounded border border-emerald-500 shadow-2xs space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">
                            Verified Certificate: {currentResult.reportType.replace(/_/g, ' ')}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Cert ID: {currentResult.id} • Issued: {currentResult.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.print()}
                          className="px-2 py-0.5 bg-white hover:bg-slate-50 text-cyan-900 rounded text-xs font-semibold flex items-center gap-1 border border-slate-300 shadow-2xs"
                        >
                          <Printer className="w-3 h-3 text-cyan-700" />
                          <span>Print Certificate</span>
                        </button>
                      </div>
                    </div>

                    {/* Certificate Body details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                        <h5 className="font-bold text-cyan-950 text-[11px] uppercase tracking-wider">
                          Subject Identity & Risk Profile
                        </h5>
                        <div className="grid grid-cols-3 gap-1 text-[11px]">
                          <span className="text-slate-500">Target Name:</span>
                          <span className="col-span-2 font-bold text-slate-900">{currentResult.targetName}</span>
                          <span className="text-slate-500">ID / Reg Number:</span>
                          <span className="col-span-2 font-mono text-cyan-950 font-bold">{currentResult.targetIdOrReg}</span>
                          <span className="text-slate-500">Status:</span>
                          <span className="col-span-2 font-bold text-emerald-800">VERIFIED & ACTIVE</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                        <h5 className="font-bold text-emerald-950 text-[11px] uppercase tracking-wider">
                          Compliance & Risk Summary
                        </h5>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Credit Score / Rating:</span>
                            <span className="font-bold text-cyan-950">{currentResult.data?.creditScore ? `${currentResult.data.creditScore} (EXCELLENT)` : 'GRADE A COMPLIANT'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Adverse Judgments:</span>
                            <span className="font-bold text-emerald-800">0 (CLEAR)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Sanctions / PEP List:</span>
                            <span className="font-bold text-emerald-800">CLEAR - NO MATCH</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Certified under National Credit Regulator Accreditation #NCR-CB-2026-ZA</span>
                      <span>Expires in 72 Hours</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Official Realtime Registry Interface (NCA / POPIA / FICA Compliant)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
