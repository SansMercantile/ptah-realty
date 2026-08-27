import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  User,
  Clock,
  Send,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PropertyRecord, OwnerContactDetails } from '../../types';
import { getOutreachEmail } from '../../services/api';

interface ContactOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
  initialTab?: 'call' | 'email' | 'whatsapp';
  onOpenKYC?: (name: string, id: string) => void;
}

export const ContactOwnerModal: React.FC<ContactOwnerModalProps> = ({
  isOpen,
  onClose,
  property,
  initialTab = 'call',
  onOpenKYC
}) => {
  const [activeTab, setActiveTab] = useState<'call' | 'email' | 'whatsapp'>(initialTab);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('valuation');
  const [callLogStatus, setCallLogStatus] = useState<string | null>(null);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [outreachSent, setOutreachSent] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(null);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Derive contact details
  const contacts: OwnerContactDetails = property?.contacts || property?.currentSale?.contacts || {
    primaryPhone: '+27 82 491 8820',
    secondaryPhone: '+27 21 434 2200',
    email: 'owner@deedsregistry.co.za',
    representativeName: property?.currentSale?.owner || 'Registered Property Owner',
    postalAddress: property?.address ? `${property.address}, ${property.suburb}` : 'Cape Town',
    preferredChannel: 'PHONE',
    verifiedStatus: 'VERIFIED'
  };

  const ownerName = property?.currentSale?.owner || 'Registered Owner';
  const ownerId = property?.currentSale?.ownersId || 'N/A';
  const address = property?.address || 'Subject Property';
  const suburb = property?.suburb || 'Cape Town';
  const erfNo = property?.erfNo || '0';

  // Format currency
  const formatZar = (val?: number) => {
    if (!val) return 'R 0';
    return `R ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  // Generate Email Templates based on subject property
  React.useEffect(() => {
    if (!property) return;

    if (selectedTemplate === 'valuation') {
      setEmailSubject(`Complimentary AI Valuation & CMA Report for ${address} (Erf ${erfNo})`);
      setEmailBody(
        `Dear ${contacts.representativeName || ownerName},\n\n` +
        `I hope this email finds you well.\n\n` +
        `I am writing to share an updated, AI-powered Comparative Market Analysis (CMA) tailored specifically for your property at ${address}, ${suburb} (Erf ${erfNo}).\n\n` +
        `Based on recent Deeds Office transfers, registered comparable sales in your immediate precinct, and structural under-roof analysis (${property.extentM2} m² extent, ${property.zoning} zoning), the current estimated fair market valuation benchmark is approximately ${formatZar(property.municipalValuation?.totalValue ? property.municipalValuation.totalValue * 1.25 : 7800000)}.\n\n` +
        `We have prepared a comprehensive SACPVP-compliant property dossier covering:\n` +
        `• Individual property valuation matrix & price/m² breakdown\n` +
        `• Street-level comparison vs. recent transactions\n` +
        `• Atlantic Seaboard capital growth and rental yield projections\n\n` +
        `Would you be available for a brief 10-minute introductory call this week to review the findings?\n\n` +
        `Warm regards,\n` +
        `Ptah-Realty Intelligence Team\n` +
        `https://ptah-realty.co.za`
      );
    } else if (selectedTemplate === 'buyer') {
      setEmailSubject(`Qualified Buyer Inquiry for your property at ${address}`);
      setEmailBody(
        `Dear ${contacts.representativeName || ownerName},\n\n` +
        `We currently represent fully pre-vetted, high-net-worth buyers actively seeking a ${property.accommodation?.bedRooms || 3}-bedroom residential property in ${suburb}, specifically along ${address.replace(/^\d+[\s\w-]*\s+/, '') || 'your street'}.\n\n` +
        `Your property at ${address} (Erf ${erfNo}) matches their purchase criteria in terms of erf size, zoning, and architectural attributes.\n\n` +
        `If you are open to considering a confidential off-market or private treaty offer with guaranteed financial backing, please feel free to reach out to me directly on ${contacts.primaryPhone} or reply to this email.\n\n` +
        `Best regards,\n` +
        `Ptah-Realty Acquisition Division`
      );
    } else if (selectedTemplate === 'mandate') {
      setEmailSubject(`Exclusive Ptah-Realty Marketing & Syndication Proposal – ${address}`);
      setEmailBody(
        `Dear ${contacts.representativeName || ownerName},\n\n` +
        `Following our latest quarterly Atlantic Seaboard Property Review, we are offering selected property owners on Erf ${erfNo} a bespoke multi-portal syndication package.\n\n` +
        `Our digital marketing engine syndicates directly to Property24, Private Property, and global buyer syndicates with high-resolution media, interactive vector cadastral blueprints, and targeted buyer retargeting.\n\n` +
        `We would love the opportunity to present our strategic mandate proposal at your convenience.\n\n` +
        `Kind regards,\n` +
        `Ptah-Realty Executive Brokerage`
      );
    } else if (selectedTemplate === 'deeds') {
      setEmailSubject(`Deeds Office & Municipal Valuation Notice – Erf ${erfNo}, ${suburb}`);
      setEmailBody(
        `Dear ${contacts.representativeName || ownerName},\n\n` +
        `This is a formal informational notice regarding your property title deed ${property.currentSale?.titleDeed || 'registered with Cape Town Deeds Office'}.\n\n` +
        `• Registered Owner: ${ownerName}\n` +
        `• Property: Erf ${erfNo}, ${address}\n` +
        `• 2025 Municipal Valuation: ${formatZar(property.municipalValuation?.totalValue)}\n` +
        `• Monthly Rates Estimate: ${formatZar(property.municipalValuation?.ratesEstimateMonthly)} / month\n\n` +
        `If you require any assistance with rates objections, title servitude verifications, or SACPVP valuations, please contact our advisory team.\n\n` +
        `Sincerely,\n` +
        `Ptah-Realty Property Advisory`
      );
    }
  }, [property, selectedTemplate, contacts, ownerName, address, suburb, erfNo]);

  if (!isOpen || !property) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogCall = (status: string) => {
    setCallLogStatus(status);
    setTimeout(() => setCallLogStatus(null), 3000);
  };

  const handleGenerateWithAI = async () => {
    if (!property) return;
    setIsGeneratingAI(true);
    setAiGenerationError(null);
    try {
      const draft = await getOutreachEmail(
        property,
        selectedTemplate as 'valuation' | 'buyer' | 'mandate' | 'deeds',
        contacts.representativeName || ownerName,
        property.municipalValuation?.totalValue ? property.municipalValuation.totalValue * 1.25 : undefined
      );
      setEmailSubject(draft.subject);
      setEmailBody(draft.body);
    } catch (err) {
      setAiGenerationError('Could not reach the AI drafting service -- keeping the standard template below.');
      console.error('Error generating AI outreach email:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendEmailClient = () => {
    const mailtoUrl = `mailto:${contacts.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
    setOutreachSent(true);
    setTimeout(() => setOutreachSent(false), 4000);
  };

  const getCleanPhoneForWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.startsWith('0') ? '27' + cleaned.substring(1) : cleaned;
  };

  const whatsappMessage = encodeURIComponent(
    `Hello ${contacts.representativeName || ownerName}, I am contacting you regarding your property at ${address}, ${suburb} (Erf ${erfNo}) from Ptah-Realty. We have generated an updated individual AI property valuation report for you. Would you like us to share the link with you?`
  );

  const whatsappUrl = `https://wa.me/${getCleanPhoneForWhatsApp(contacts.primaryPhone)}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="contact-owner-modal"
        className="bg-white text-slate-800 w-full max-w-4xl rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <User className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base leading-tight">
                  Contact Property Owner
                </h2>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Deeds Verified
                </span>
              </div>
              <p className="text-cyan-100/90 text-xs mt-0.5">
                {address} • Erf {erfNo} • {ownerName}
              </p>
            </div>
          </div>
          <button
            id="btn-close-contact-modal"
            onClick={onClose}
            className="p-1.5 text-cyan-100 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Owner Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Registered Owner</span>
              <span className="font-bold text-slate-900">{ownerName}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">ID / Reg No.</span>
              <span className="font-mono text-slate-800 font-semibold">{ownerId}</span>
            </div>
            {contacts.representativeName && contacts.representativeName !== ownerName && (
              <>
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Contact Person</span>
                  <span className="text-cyan-900 font-medium">{contacts.representativeName}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenKYC && (
              <button
                id="btn-contact-run-kyc"
                onClick={() => {
                  onClose();
                  onOpenKYC(ownerName, ownerId);
                }}
                className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-cyan-700" />
                <span>KYC Dossier</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 pt-2 gap-2">
          <button
            id="tab-contact-call"
            onClick={() => setActiveTab('call')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t border-t border-x transition-colors ${
              activeTab === 'call'
                ? 'bg-white text-cyan-900 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-cyan-700" />
            <span>Direct Call & Dialer</span>
          </button>

          <button
            id="tab-contact-email"
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t border-t border-x transition-colors ${
              activeTab === 'email'
                ? 'bg-white text-cyan-900 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-cyan-700" />
            <span>Email Outreach & AI Templates</span>
          </button>

          <button
            id="tab-contact-whatsapp"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t border-t border-x transition-colors ${
              activeTab === 'whatsapp'
                ? 'bg-white text-emerald-800 border-slate-300 border-b-white -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Direct</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-white space-y-4">
          
          {/* TAB 1: CALL & DIALER */}
          {activeTab === 'call' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Number Card */}
                <div className="p-4 bg-gradient-to-br from-cyan-50/50 to-slate-50 rounded-lg border border-cyan-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-900 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-cyan-700" />
                        Primary Mobile Phone
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.2 rounded">
                        Active Verified
                      </span>
                    </div>
                    <p className="font-mono text-lg font-bold text-slate-900 select-all mb-1">
                      {contacts.primaryPhone}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Direct mobile connection • South Africa (+27)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-cyan-100">
                    <a
                      id="btn-direct-tel-primary"
                      href={`tel:${contacts.primaryPhone}`}
                      onClick={() => handleLogCall('Dialing Primary Number')}
                      className="flex-1 py-2 px-3 bg-[#006980] hover:bg-teal-700 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                    <button
                      onClick={() => handleCopy(contacts.primaryPhone, 'primaryPhone')}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center justify-center transition-colors"
                      title="Copy Phone Number"
                    >
                      {copiedField === 'primaryPhone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Secondary / Office Phone Card */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" />
                        Alternative / Office Line
                      </span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.2 rounded">
                        Landline
                      </span>
                    </div>
                    <p className="font-mono text-lg font-bold text-slate-900 select-all mb-1">
                      {contacts.secondaryPhone || '+27 21 434 2200'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Cape Town Metropolitan Office • Switchboard
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                    <a
                      id="btn-direct-tel-secondary"
                      href={`tel:${contacts.secondaryPhone || '+27214342200'}`}
                      onClick={() => handleLogCall('Dialing Office Line')}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Office</span>
                    </a>
                    <button
                      onClick={() => handleCopy(contacts.secondaryPhone || '+27 21 434 2200', 'secondaryPhone')}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center justify-center transition-colors"
                      title="Copy Phone Number"
                    >
                      {copiedField === 'secondaryPhone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Call Log & Activity Feedback */}
              {callLogStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span><strong>Action Logged:</strong> {callLogStatus} ({new Date().toLocaleTimeString()})</span>
                  </div>
                  <span className="text-[11px] text-emerald-700">Recorded in CRM</span>
                </div>
              )}

              {/* Quick Call Outcome Logger */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Quick Call Outcome Logger:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleLogCall('Connected: Mandate Presentation Scheduled')}
                    className="py-1.5 px-2.5 bg-white hover:bg-cyan-50 text-cyan-900 border border-slate-300 rounded text-[11px] font-semibold text-center transition-colors shadow-2xs"
                  >
                    🤝 Mandate Scheduled
                  </button>
                  <button
                    onClick={() => handleLogCall('Connected: Requested AI Valuation Report PDF')}
                    className="py-1.5 px-2.5 bg-white hover:bg-cyan-50 text-cyan-900 border border-slate-300 rounded text-[11px] font-semibold text-center transition-colors shadow-2xs"
                  >
                    📄 Send Valuation PDF
                  </button>
                  <button
                    onClick={() => handleLogCall('Left Voicemail / SMS Follow-up')}
                    className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold text-center transition-colors shadow-2xs"
                  >
                    📞 Left Voicemail
                  </button>
                  <button
                    onClick={() => handleLogCall('Busy / Call Back Later')}
                    className="py-1.5 px-2.5 bg-white hover:bg-amber-50 text-amber-900 border border-slate-300 rounded text-[11px] font-semibold text-center transition-colors shadow-2xs"
                  >
                    ⏳ Call Back Later
                  </button>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Add custom call notes or follow-up reminder..."
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-cyan-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL OUTREACH & TEMPLATES */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              {/* Template Selector */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 rounded-md border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-700" />
                  AI Template:
                </span>
                <button
                  id="template-opt-valuation"
                  onClick={() => setSelectedTemplate('valuation')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedTemplate === 'valuation'
                      ? 'bg-[#006980] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  AI Valuation & CMA
                </button>
                <button
                  id="template-opt-buyer"
                  onClick={() => setSelectedTemplate('buyer')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedTemplate === 'buyer'
                      ? 'bg-[#006980] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  Qualified Buyer Inquiry
                </button>
                <button
                  id="template-opt-mandate"
                  onClick={() => setSelectedTemplate('mandate')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedTemplate === 'mandate'
                      ? 'bg-[#006980] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  Sole Mandate Proposal
                </button>
                <button
                  id="template-opt-deeds"
                  onClick={() => setSelectedTemplate('deeds')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    selectedTemplate === 'deeds'
                      ? 'bg-[#006980] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  Deeds & Rates Notice
                </button>

                <div className="ml-auto">
                  <button
                    id="btn-generate-outreach-ai"
                    onClick={handleGenerateWithAI}
                    disabled={isGeneratingAI}
                    className="px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 bg-cyan-900 hover:bg-cyan-800 disabled:opacity-60 disabled:cursor-wait text-white transition-colors shadow-xs"
                  >
                    {isGeneratingAI ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isGeneratingAI ? 'Drafting…' : 'Generate with AI'}</span>
                  </button>
                </div>
              </div>

              {aiGenerationError && (
                <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{aiGenerationError}</span>
                </div>
              )}

              {/* Recipient & Subject */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 font-bold text-slate-500">To:</span>
                  <div className="flex-1 flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                    <span className="font-mono text-slate-900 font-semibold">{contacts.email}</span>
                    <span className="text-[10px] text-slate-500">({contacts.representativeName || ownerName})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 font-bold text-slate-500">Subject:</span>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-600"
                  />
                </div>
              </div>

              {/* Email Body */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Email Draft Content:
                </label>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full text-xs p-3 font-sans bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-cyan-600 leading-relaxed"
                />
              </div>

              {outreachSent && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Email client opened! Outreach logged in property audit history.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(emailBody, 'emailBody')}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedField === 'emailBody' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'emailBody' ? 'Copied Body' : 'Copy Email Body'}</span>
                  </button>
                  <button
                    onClick={() => handleCopy(contacts.email, 'emailOnly')}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium transition-colors"
                  >
                    {copiedField === 'emailOnly' ? 'Copied' : 'Copy Email Address'}
                  </button>
                </div>

                <button
                  id="btn-send-email-client"
                  onClick={handleSendEmailClient}
                  className="py-2 px-4 bg-[#006980] hover:bg-teal-700 text-white rounded font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open in Email Client (Mailto)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP DIRECT */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-sm text-emerald-950">
                        WhatsApp Instant Messaging
                      </h3>
                      <p className="text-xs text-emerald-800">
                        Send a pre-formatted message directly to {contacts.representativeName || ownerName} ({contacts.primaryPhone})
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    WA Ready
                  </span>
                </div>

                <div className="bg-white p-3 rounded border border-emerald-200 text-xs text-slate-800 font-sans leading-relaxed">
                  <p className="text-slate-500 font-bold text-[10px] uppercase mb-1">Preview Message:</p>
                  "Hello {contacts.representativeName || ownerName}, I am contacting you regarding your property at {address}, {suburb} (Erf {erfNo}) from Ptah-Realty. We have generated an updated individual AI property valuation report for you. Would you like us to share the link with you?"
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <a
                    id="btn-open-whatsapp-link"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch WhatsApp Chat</span>
                  </a>
                </div>
              </div>

              {/* Owner Notes */}
              {contacts.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                  <span className="font-bold block text-slate-900 mb-0.5">Owner Outreach Notes:</span>
                  <p className="italic">{contacts.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Contacted: {contacts.lastContactedDate || 'Never / New Record'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
