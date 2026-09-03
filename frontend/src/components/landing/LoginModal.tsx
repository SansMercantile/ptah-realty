import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  UserCheck, 
  CheckCircle2, 
  Globe, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { GLOBAL_COUNTRIES_DATA } from '../../services/jurisdictionsData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user?: { name: string; email: string; role: string; countryCode: string }) => void;
  onOpenLeadModal?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenLeadModal
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'demo' | 'signup'>('signin');
  const [email, setEmail] = useState('ron@lawrealestate.co.za');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('ZA');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'Mr John Doe',
        email: email,
        role: 'Principal Property Practitioner (PPRA)',
        countryCode: selectedCountry
      });
      onClose();
    }, 600);
  };

  const handleDemoLogin = (demoRole: 'principal' | 'valuer' | 'conveyancer') => {
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      if (demoRole === 'principal') {
        onLoginSuccess({
          name: 'Mr John Doe',
          email: 'ron@lawrealestate.co.za',
          role: 'Principal Property Practitioner (PPRA)',
          countryCode: 'ZA'
        });
      } else if (demoRole === 'valuer') {
        onLoginSuccess({
          name: 'Dr Samantha Hayes',
          email: 's.hayes@globalvaluation.co.uk',
          role: 'Chartered Valuation Surveyor (RICS)',
          countryCode: 'GB'
        });
      } else {
        onLoginSuccess({
          name: 'Adv. Johan Van Der Merwe',
          email: 'johan@capetownconveyancing.co.za',
          role: 'Registered Conveyancer & Legal Counsel',
          countryCode: 'ZA'
        });
      }
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        id="login-modal-card"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#004d5a] via-[#006980] to-[#008ba3] px-6 py-5 text-white relative">
          <button 
            id="btn-close-login-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-cyan-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-cyan-200 shadow-inner">
              <Building2 className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-200 font-bold">PTAH REAL ESTATE OS</div>
              <h3 className="text-lg font-bold text-white leading-tight">Practitioner Portal Sign In</h3>
            </div>
          </div>
          <p className="text-xs text-cyan-100/90 leading-relaxed">
            Access your sovereign title deeds registry, vector cadastre GIS, automated CMA engines, and institutional KYC compliance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            id="btn-tab-signin"
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signin'
                ? 'border-[#006980] text-[#006980] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            id="btn-tab-demo"
            type="button"
            onClick={() => { setAuthMode('demo'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'demo'
                ? 'border-[#006980] text-[#006980] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-700 font-bold">1-Click Demo Sandbox</span>
          </button>

          <button
            id="btn-tab-signup"
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'border-[#006980] text-[#006980] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode 1: Standard Sign In */}
          {authMode === 'signin' && (
            <form onSubmit={handleStandardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Practitioner Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="practitioner@agency.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered practitioner email.'); }} className="text-[11px] text-cyan-700 hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Jurisdiction selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Sovereign Jurisdiction</span>
                  <span className="text-[10px] text-slate-400">196 Global Nations</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent bg-white text-slate-800 font-medium"
                  >
                    {GLOBAL_COUNTRIES_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name} ({c.complianceAuthorityName || c.regulatoryBody})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#006980] focus:ring-[#00bcd4] w-3.5 h-3.5"
                  />
                  <span>Remember my practitioner terminal</span>
                </label>
              </div>

              <button
                id="btn-submit-signin"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#006980] to-[#008ba3] hover:from-[#005566] hover:to-[#007387] text-white font-bold rounded-lg text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials & Syncing Deeds...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Practitioner Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: 1-Click Interactive Demo */}
          {authMode === 'demo' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold flex items-center gap-1 text-amber-800 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Instant Sandbox Exploration
                </span>
                Experience the live cadastral GIS map, 140M+ parcel database, automated CMA reports, and verified FICA/KYC checks instantly without registration.
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Demo Role 1 */}
                <button
                  id="btn-demo-login-principal"
                  onClick={() => handleDemoLogin('principal')}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-cyan-500 bg-white hover:bg-cyan-50/40 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs border border-cyan-200">
                      🇿🇦 RR
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-cyan-900 flex items-center gap-1.5">
                        <span>Mr John Doe</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">FFC Verified</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Principal Property Practitioner (PPRA - South Africa)</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Demo Role 2 */}
                <button
                  id="btn-demo-login-valuer"
                  onClick={() => handleDemoLogin('valuer')}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs border border-indigo-200">
                      🇬🇧 SH
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-900 flex items-center gap-1.5">
                        <span>Dr Samantha Hayes</span>
                        <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded font-bold">RICS Fellow</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Chartered Valuation Surveyor (United Kingdom)</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Demo Role 3 */}
                <button
                  id="btn-demo-login-conveyancer"
                  onClick={() => handleDemoLogin('conveyancer')}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                      ⚖️ JM
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                        <span>Adv. Johan Van Der Merwe</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">LPC Registered</span>
                      </div>
                      <div className="text-[11px] text-slate-500">High Court Conveyancer & Title Deeds Attorney</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Create Account / Lead Capture redirect */}
          {authMode === 'signup' && (
            <div className="space-y-4 text-xs animate-fade-in text-slate-600">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-950 leading-relaxed">
                <span className="font-bold block mb-1 text-cyan-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-700" /> Statutory Practitioner Onboarding
                </span>
                Ptah Real Estate verifies professional licensing status across 196 statutory land & real estate regulatory authorities.
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>14-day full platform access with 250 complimentary Title Deeds & Cadastral credits.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Integrated FICA/KYC verification, automated CMA engines & PDF generation.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Zero setup fees; activate immediately with single-sign-on or practitioner ID.</span>
                </div>
              </div>

              <button
                id="btn-signup-lead-redirect"
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenLeadModal) onOpenLeadModal();
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Complete Practitioner Registration Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Security & Regulatory footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted & POPIA / GDPR Compliant</span>
            </span>
            <span className="font-mono">v2.5.2 OS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
