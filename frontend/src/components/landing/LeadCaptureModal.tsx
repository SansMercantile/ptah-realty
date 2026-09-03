import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Globe, 
  Briefcase, 
  Users, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  FileCheck2
} from 'lucide-react';
import { GLOBAL_COUNTRIES_DATA } from '../../services/jurisdictionsData';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchAppDirectly: () => void;
  initialPlan?: string;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  onLaunchAppDirectly,
  initialPlan = 'Principal Pro (R 1,850/mo)'
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [countryCode, setCountryCode] = useState('ZA');
  const [role, setRole] = useState('Principal Property Practitioner');
  const [teamSize, setTeamSize] = useState('1 - 5 Agents');
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [primaryInterest, setPrimaryInterest] = useState('Full Cadastre GIS & Deeds Suite');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedRef = `PTAH-${Math.floor(100000 + Math.random() * 900000)}`;
    setReferenceId(generatedRef);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  const selectedCountryObj = GLOBAL_COUNTRIES_DATA.find(c => c.id === countryCode) || GLOBAL_COUNTRIES_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        id="lead-capture-modal-card"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004d5a] via-[#006980] to-[#008ba3] px-6 py-5 text-white relative">
          <button 
            id="btn-close-lead-modal"
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 text-cyan-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-cyan-200">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-200 font-bold">PRACTITIONER ONBOARDING</div>
              <h3 className="text-xl font-bold text-white leading-tight">Get Started with Ptah Real Estate OS</h3>
            </div>
          </div>
          <p className="text-xs text-cyan-100/90 leading-relaxed">
            Provision your agency with millimeter vector cadastre boundaries, live deeds registry lookups, automated CMA valuation engines, and statutory FICA/KYC verification.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">Practitioner Account Provisioned!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Thank you, <span className="font-semibold text-slate-900">{fullName || 'Practitioner'}</span>. Your priority reference code is <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{referenceId}</span>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Jurisdiction:</span>
                  <span className="font-bold text-slate-900">{selectedCountryObj.flag} {selectedCountryObj.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Selected Package:</span>
                  <span className="font-bold text-cyan-800">{selectedPlan}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Complimentary Trial Credits:</span>
                  <span className="font-bold text-emerald-700">250 Data + 25 FICA Credits</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                An onboarding specialist has been assigned to your territory. You can start exploring the live interactive platform immediately below.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  id="btn-lead-launch-workspace"
                  onClick={() => {
                    handleResetAndClose();
                    onLaunchAppDirectly();
                  }}
                  className="px-6 py-2.5 bg-[#006980] hover:bg-[#005566] text-white font-bold rounded-lg text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Launch Live Cadastre Terminal Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-lead-close"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Return to Website
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Corporate / Agency Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@realty.com"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile / WhatsApp Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={selectedCountryObj.phonePlaceholder || '+27 82 123 4567'}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Agency Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Agency / Brokerage Firm *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="e.g. Ptah Real Estate / Sotheby's"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Sovereign Country / Jurisdiction */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Operating Sovereign Jurisdiction *</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
                    >
                      {GLOBAL_COUNTRIES_DATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.flag} {c.name} ({c.complianceAuthorityName || c.regulatoryBody})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Practitioner Role</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
                    >
                      <option value="Principal Property Practitioner">Principal Property Practitioner</option>
                      <option value="Full Status Agent / Broker">Full Status Real Estate Agent / Broker</option>
                      <option value="Registered Property Valuer">Professional Property Valuer (RICS / SACPVP)</option>
                      <option value="High Court Conveyancer">Conveyancer / Property Attorney</option>
                      <option value="Property Developer">Property Developer / Asset Manager</option>
                      <option value="Banking / Mortgage Specialist">Mortgage Originator / Risk Analyst</option>
                    </select>
                  </div>
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Agency Team Size</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
                    >
                      <option value="Individual Practitioner">Solo Practitioner (1 User)</option>
                      <option value="1 - 5 Agents">Small Agency (1 - 5 Agents)</option>
                      <option value="6 - 20 Agents">Mid-Size Brokerage (6 - 20 Agents)</option>
                      <option value="20+ Agents">Enterprise Brokerage (20+ Agents)</option>
                    </select>
                  </div>
                </div>

                {/* Plan Selection */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Interested Plan / Package</label>
                  <div className="relative">
                    <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white font-medium text-cyan-900"
                    >
                      <option value="Starter Practitioner (R 750/mo)">Starter Practitioner — R 750 / mo ($49)</option>
                      <option value="Principal Pro (R 1,850/mo)">Principal Pro (Recommended) — R 1,850 / mo ($119)</option>
                      <option value="Enterprise Brokerage (R 4,950/mo)">Enterprise Brokerage — R 4,950 / mo ($320)</option>
                      <option value="Custom National Agency Solution">Custom National Agency Multi-Branch</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message / Specific Requirements */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Specific Regional or Integration Requirements (Optional)</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Require Deeds Office direct API feed, Sectional Title scheme breakdown, and Property24 multi-agent feed..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl flex items-center justify-between text-[11px] text-cyan-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0" />
                  <span>Includes 14-day zero-risk trial with immediate sandbox workspace activation.</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-lead-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#006980] to-[#008ba3] hover:from-[#005566] hover:to-[#007387] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Provisioning Practitioner Account...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit & Activate Free Sandbox Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
