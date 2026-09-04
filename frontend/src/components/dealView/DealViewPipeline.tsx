import React, { useState } from 'react';
import {
  FileText,
  ChevronUp,
  ChevronDown,
  Info,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Plus,
  Zap,
  FileCheck,
  ShieldCheck,
  Building2,
  DollarSign,
  Scale,
  Award,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import {
  NewListingsIllustration,
  PropertyViewingIllustration,
  OfferToPurchaseIllustration,
  AttorneyDocumentIllustration,
  LodgementsIllustration
} from './DealViewIllustrations';
import { 
  DealStage, 
  ViewingAppointment, 
  OfferToPurchaseRecord, 
  AttorneyConveyancingRecord, 
  DeedsLodgementRecord 
} from '../../types/dealPipeline';
import { ListingDealRecord } from '../modals/MyListingsModal';

interface DealViewPipelineProps {
  listings: ListingDealRecord[];
  activeStage: DealStage;
  onSelectStage: (stage: DealStage) => void;
  onQuickListingClick?: () => void;
  onStartFullSyndication: () => void;
  viewings: ViewingAppointment[];
  onAddViewing: (viewing: ViewingAppointment) => void;
  otps: OfferToPurchaseRecord[];
  onAddOtp: (otp: OfferToPurchaseRecord) => void;
  conveyancing: AttorneyConveyancingRecord[];
  lodgements: DeedsLodgementRecord[];
  onUpdateLodgementStep?: (id: string, newStep: DeedsLodgementRecord['currentStep']) => void;
}

export const DealViewPipeline: React.FC<DealViewPipelineProps> = ({
  listings,
  activeStage,
  onSelectStage,
  onQuickListingClick,
  onStartFullSyndication,
  viewings,
  onAddViewing,
  otps,
  onAddOtp,
  conveyancing,
  lodgements,
  onUpdateLodgementStep
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // New Viewing Modal State
  const [isNewViewingOpen, setIsNewViewingOpen] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newViewingDate, setNewViewingDate] = useState('2026-08-29');
  const [newViewingTime, setNewViewingTime] = useState('14:00');
  const [newViewingProperty, setNewViewingProperty] = useState(listings[0]?.address || '5 Richmond Road');
  const [newViewingType, setNewViewingType] = useState<ViewingAppointment['type']>('Private Viewing');

  // New OTP Modal State
  const [isNewOtpOpen, setIsNewOtpOpen] = useState(false);
  const [otpBuyerName, setOtpBuyerName] = useState('');
  const [otpOfferPrice, setOtpOfferPrice] = useState(12000000);
  const [otpDeposit, setOtpDeposit] = useState(1200000);
  const [otpBondRequired, setOtpBondRequired] = useState(0);
  const [otpProperty, setOtpProperty] = useState(listings[0]?.address || '5 Richmond Road');

  // Calculate dynamic badge counts
  const stageCounts: Record<DealStage, number> = {
    NEW_LISTINGS: listings.length,
    PROPERTY_VIEWING: viewings.filter(v => v.status === 'Scheduled').length,
    OFFER_TO_PURCHASE: otps.length,
    ATTORNEY_DOCUMENT: conveyancing.length,
    LODGEMENTS: lodgements.length
  };

  const handleCreateViewing = (e: React.FormEvent) => {
    e.preventDefault();
    const newV: ViewingAppointment = {
      id: `view-${Date.now()}`,
      listingId: listings[0]?.id || 'list-1',
      propertyAddress: newViewingProperty,
      buyerName: newBuyerName || 'Interested Buyer',
      buyerPhone: newBuyerPhone || '+27 82 000 0000',
      buyerEmail: 'buyer@capeproperties.co.za',
      date: newViewingDate,
      time: newViewingTime,
      type: newViewingType,
      status: 'Scheduled',
      agentNotes: 'Booked via Deal View Pipeline'
    };
    onAddViewing(newV);
    setIsNewViewingOpen(false);
    setNewBuyerName('');
    setNewBuyerPhone('');
  };

  const handleCreateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const newOtp: OfferToPurchaseRecord = {
      id: `otp-${Date.now()}`,
      listingId: listings[0]?.id || 'list-1',
      propertyAddress: otpProperty,
      otpRef: `OTP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerName: otpBuyerName || 'Prospective Purchaser',
      buyerId: '8609125098084',
      buyerPhone: '+27 82 450 1199',
      buyerEmail: 'purchaser@investcapetown.co.za',
      offerPrice: Number(otpOfferPrice),
      askingPrice: Number(otpOfferPrice) * 1.05,
      depositAmount: Number(otpDeposit),
      depositDueDays: 7,
      bondAmountRequired: Number(otpBondRequired),
      bondFinanceDays: 21,
      subjectToSaleOfProperty: false,
      occupationalRent: 60000,
      occupationDate: '2026-11-01',
      status: 'Pending Seller Signature',
      submittedDate: '2026-08-28',
      expiryDate: '2026-09-02',
      notes: 'Generated via Deal View OTP Module'
    };
    onAddOtp(newOtp);
    setIsNewOtpOpen(false);
    setOtpBuyerName('');
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs select-none">
      {/* 1. Header Banner (Matching exact screenshot theme: Sage/Slate header) */}
      <div className="bg-[#748982] text-white px-4 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-100" />
          <span className="font-bold text-xs sm:text-sm tracking-wide">Deals</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-slate-100 hover:text-white font-medium flex items-center gap-1 hover:underline cursor-pointer px-1.5 py-0.5 rounded transition-colors"
          >
            <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-5 h-5 rounded-full bg-white text-[#748982] font-bold text-[11px] flex items-center justify-center hover:bg-slate-100 shadow-xs cursor-pointer"
            title="Deal View Workflow Information"
          >
            i
          </button>
        </div>
      </div>

      {/* 2. Collapsible 5-Stage Cards Container */}
      {!isCollapsed && (
        <div className="p-3.5 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            
            {/* STAGE 1: NEW LISTINGS */}
            <div
              onClick={() => onSelectStage('NEW_LISTINGS')}
              className={`relative rounded-xl p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 border ${
                activeStage === 'NEW_LISTINGS'
                  ? 'bg-gradient-to-b from-[#bfe0eb] to-[#aed4e2] border-cyan-600 shadow-md ring-2 ring-cyan-500/40'
                  : 'bg-gradient-to-b from-[#cae4ed] to-[#b6d9e5] border-[#9fc7d6] hover:shadow-md hover:border-cyan-500'
              }`}
            >
              {/* Notification Badge */}
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#df382b] text-white font-bold text-xs flex items-center justify-center shadow-md">
                {stageCounts.NEW_LISTINGS}
              </div>

              {/* Graphic */}
              <div className="w-full flex items-center justify-center my-1">
                <NewListingsIllustration className="w-full h-24 max-w-[150px]" />
              </div>

              {/* Title */}
              <span className="font-bold text-xs text-slate-800 tracking-wide uppercase mt-1">
                NEW LISTINGS
              </span>

              {/* Quick Listing Pill Action */}
              {onQuickListingClick && (
                <button
                  id="btn-quick-listing-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickListingClick();
                  }}
                  className="mt-2 px-3 py-1 bg-white/90 hover:bg-white text-[#df382b] font-bold text-[10px] tracking-wider rounded-full shadow-xs border border-red-200 hover:border-red-300 transition-all uppercase cursor-pointer"
                >
                  QUICK LISTING
                </button>
              )}
            </div>

            {/* STAGE 2: PROPERTY VIEWING */}
            <div
              onClick={() => onSelectStage('PROPERTY_VIEWING')}
              className={`relative rounded-xl p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 border ${
                activeStage === 'PROPERTY_VIEWING'
                  ? 'bg-gradient-to-b from-[#bfe0eb] to-[#aed4e2] border-cyan-600 shadow-md ring-2 ring-cyan-500/40'
                  : 'bg-gradient-to-b from-[#cae4ed] to-[#b6d9e5] border-[#9fc7d6] hover:shadow-md hover:border-cyan-500'
              }`}
            >
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#df382b] text-white font-bold text-xs flex items-center justify-center shadow-md">
                {stageCounts.PROPERTY_VIEWING}
              </div>

              <div className="w-full flex items-center justify-center my-1">
                <PropertyViewingIllustration className="w-full h-24 max-w-[150px]" />
              </div>

              <span className="font-bold text-xs text-slate-800 tracking-wide uppercase mt-1">
                PROPERTY VIEWING
              </span>

              <span className="text-[10px] font-semibold text-slate-600 mt-2">
                {viewings.length} Scheduled Visits
              </span>
            </div>

            {/* STAGE 3: OFFER TO PURCHASE */}
            <div
              onClick={() => onSelectStage('OFFER_TO_PURCHASE')}
              className={`relative rounded-xl p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 border ${
                activeStage === 'OFFER_TO_PURCHASE'
                  ? 'bg-gradient-to-b from-[#bfe0eb] to-[#aed4e2] border-cyan-600 shadow-md ring-2 ring-cyan-500/40'
                  : 'bg-gradient-to-b from-[#cae4ed] to-[#b6d9e5] border-[#9fc7d6] hover:shadow-md hover:border-cyan-500'
              }`}
            >
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#df382b] text-white font-bold text-xs flex items-center justify-center shadow-md">
                {stageCounts.OFFER_TO_PURCHASE}
              </div>

              <div className="w-full flex items-center justify-center my-1">
                <OfferToPurchaseIllustration className="w-full h-24 max-w-[150px]" />
              </div>

              <span className="font-bold text-xs text-slate-800 tracking-wide uppercase mt-1">
                OFFER TO PURCHASE
              </span>

              <span className="text-[10px] font-semibold text-slate-600 mt-2">
                {otps.filter(o => o.status === 'Accepted & Binding').length} Binding OTPs
              </span>
            </div>

            {/* STAGE 4: ATTORNEY DOCUMENT */}
            <div
              onClick={() => onSelectStage('ATTORNEY_DOCUMENT')}
              className={`relative rounded-xl p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 border ${
                activeStage === 'ATTORNEY_DOCUMENT'
                  ? 'bg-gradient-to-b from-[#bfe0eb] to-[#aed4e2] border-cyan-600 shadow-md ring-2 ring-cyan-500/40'
                  : 'bg-gradient-to-b from-[#cae4ed] to-[#b6d9e5] border-[#9fc7d6] hover:shadow-md hover:border-cyan-500'
              }`}
            >
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#df382b] text-white font-bold text-xs flex items-center justify-center shadow-md">
                {stageCounts.ATTORNEY_DOCUMENT}
              </div>

              <div className="w-full flex items-center justify-center my-1">
                <AttorneyDocumentIllustration className="w-full h-24 max-w-[150px]" />
              </div>

              <span className="font-bold text-xs text-slate-800 tracking-wide uppercase mt-1">
                ATTORNEY DOCUMENT
              </span>

              <span className="text-[10px] font-semibold text-slate-600 mt-2">
                Conveyancing & FICA
              </span>
            </div>

            {/* STAGE 5: LODGEMENTS */}
            <div
              onClick={() => onSelectStage('LODGEMENTS')}
              className={`relative rounded-xl p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 border ${
                activeStage === 'LODGEMENTS'
                  ? 'bg-gradient-to-b from-[#bfe0eb] to-[#aed4e2] border-cyan-600 shadow-md ring-2 ring-cyan-500/40'
                  : 'bg-gradient-to-b from-[#cae4ed] to-[#b6d9e5] border-[#9fc7d6] hover:shadow-md hover:border-cyan-500'
              }`}
            >
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#df382b] text-white font-bold text-xs flex items-center justify-center shadow-md">
                {stageCounts.LODGEMENTS}
              </div>

              <div className="w-full flex items-center justify-center my-1">
                <LodgementsIllustration className="w-full h-24 max-w-[150px]" />
              </div>

              <span className="font-bold text-xs text-slate-800 tracking-wide uppercase mt-1">
                LODGEMENTS
              </span>

              <span className="text-[10px] font-semibold text-slate-600 mt-2">
                Deeds Office Tracking
              </span>
            </div>

          </div>
        </div>
      )}

      {/* 3. Stage-Specific Interactive Pipeline Dashboard Panel */}
      {activeStage !== 'NEW_LISTINGS' && (
        <div className="bg-slate-100 p-4 border-b border-slate-200">
          
          {/* ========================================================================= */}
          {/* STAGE 2: PROPERTY VIEWING MANAGER */}
          {/* ========================================================================= */}
          {activeStage === 'PROPERTY_VIEWING' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-cyan-700" />
                    <span>Buyer Viewings & Show House Calendar</span>
                  </h3>
                  <p className="text-xs text-slate-500">Track prospective buyer inspections, open days, and post-viewing feedback.</p>
                </div>
                <button
                  onClick={() => setIsNewViewingOpen(true)}
                  className="bg-[#748982] hover:bg-[#5f736c] text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book New Viewing</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {viewings.map((viewing) => (
                  <div key={viewing.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs hover:border-cyan-400 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          viewing.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : viewing.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {viewing.type} • {viewing.status}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{viewing.propertyAddress}</h4>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-bold text-slate-800 block">{viewing.date}</span>
                        <span className="text-slate-500 text-[11px]">{viewing.time}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Buyer Name</span>
                        <strong className="text-slate-800">{viewing.buyerName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Contact Phone</span>
                        <span className="text-cyan-700 font-mono">{viewing.buyerPhone}</span>
                      </div>
                    </div>

                    {viewing.feedbackNotes && (
                      <div className="mt-2 bg-slate-50 p-2 rounded text-[11px] text-slate-600 border border-slate-100">
                        <span className="font-semibold text-slate-700 block text-[10px]">Buyer Feedback:</span>
                        "{viewing.feedbackNotes}"
                      </div>
                    )}

                    <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          const text = `Hi ${viewing.buyerName}, confirming your viewing on ${viewing.date} at ${viewing.time}. Looking forward to seeing you there!`;
                          const cleanNum = viewing.buyerPhone.replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px]"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Send WhatsApp Reminder</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectStage('OFFER_TO_PURCHASE');
                          setIsNewOtpOpen(true);
                          setOtpBuyerName(viewing.buyerName);
                        }}
                        className="text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Generate OTP</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: OFFER TO PURCHASE (OTP) ENGINE */}
          {/* ========================================================================= */}
          {activeStage === 'OFFER_TO_PURCHASE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-amber-700" />
                    <span>Offer to Purchase (OTP) Agreements & Suspensive Conditions</span>
                  </h3>
                  <p className="text-xs text-slate-500">Manage legal purchase agreements, 21-day bond grant terms, and deposits in trust.</p>
                </div>
                <button
                  onClick={() => setIsNewOtpOpen(true)}
                  className="bg-[#748982] hover:bg-[#5f736c] text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft New OTP</span>
                </button>
              </div>

              <div className="space-y-3">
                {otps.map((otp) => (
                  <div key={otp.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                            {otp.otpRef}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            otp.status === 'Accepted & Binding'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {otp.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{otp.propertyAddress}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Offer Price</span>
                        <strong className="text-base font-bold font-mono text-slate-900">
                          R {otp.offerPrice.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2.5 text-xs">
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-400 block text-[10px]">Purchaser</span>
                        <strong className="text-slate-800">{otp.buyerName}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-400 block text-[10px]">Deposit (10%)</span>
                        <strong className="text-emerald-700 font-mono">R {otp.depositAmount.toLocaleString()}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-400 block text-[10px]">Bond Finance</span>
                        <strong className="text-slate-800 font-mono">
                          {otp.bondAmountRequired > 0 ? `R ${otp.bondAmountRequired.toLocaleString()} (${otp.bondFinanceDays}d)` : 'Cash Deal'}
                        </strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-400 block text-[10px]">Occupation Date</span>
                        <strong className="text-slate-800">{otp.occupationDate}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2">
                      <span className="text-slate-500 text-[11px]">
                        <strong>Notes:</strong> {otp.notes}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled
                          title="No signed document has been uploaded for this OTP yet"
                          className="px-2.5 py-1 rounded bg-slate-50 text-slate-400 font-semibold text-[11px] flex items-center gap-1 cursor-not-allowed"
                        >
                          <FileText className="w-3 h-3" />
                          <span>No Signed PDF on File</span>
                        </button>
                        <button
                          onClick={() => onSelectStage('ATTORNEY_DOCUMENT')}
                          className="px-2.5 py-1 rounded bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Instruct Conveyancer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: ATTORNEY DOCUMENT & CONVEYANCING TRACKER */}
          {/* ========================================================================= */}
          {activeStage === 'ATTORNEY_DOCUMENT' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-cyan-800" />
                    <span>Conveyancing Attorney Documents & Compliance Certificates</span>
                  </h3>
                  <p className="text-xs text-slate-500">Track Transfer Attorneys, FICA verification, Rates Clearance, and mandatory COC certificates.</p>
                </div>
              </div>

              <div className="space-y-3">
                {conveyancing.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-slate-900">{item.transferAttorneyFirm}</strong>
                          <span className="text-[10px] font-mono bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200">
                            Ref: {item.fileReference}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Conveyancer: <strong>{item.conveyancerName}</strong> ({item.conveyancerPhone} • {item.conveyancerEmail})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Conveyancing Progress</span>
                        <div className="flex items-center gap-2">
                          <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.overallProgress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold font-mono text-emerald-700">{item.overallProgress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* FICA & Clearance Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px]">FICA Buyer/Seller</span>
                        <strong className="text-emerald-700">{item.ficaBuyerStatus} / {item.ficaSellerStatus}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px]">Rates Clearance (City CT)</span>
                        <strong className="text-emerald-700">{item.ratesClearanceStatus}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px]">Transfer Duty (SARS)</span>
                        <strong className="text-slate-800">{item.transferDutyStatus}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px]">Target Lodgement</span>
                        <strong className="text-cyan-800">{item.targetLodgementDate}</strong>
                      </div>
                    </div>

                    {/* Mandatory 5 Compliance Certificates Tracker */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Mandatory Transfer Compliance Certificates (COC)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                        <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                          <span className="text-slate-400 block">Electrical COC</span>
                          <strong className={item.complianceCerts.electrical === 'Issued & Compliant' ? 'text-emerald-700' : 'text-amber-700'}>
                            {item.complianceCerts.electrical}
                          </strong>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                          <span className="text-slate-400 block">Beetle Cert</span>
                          <strong className={item.complianceCerts.beetle === 'Clear & Certified' ? 'text-emerald-700' : 'text-amber-700'}>
                            {item.complianceCerts.beetle}
                          </strong>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                          <span className="text-slate-400 block">Gas Compliance</span>
                          <strong className={item.complianceCerts.gas === 'Compliant' ? 'text-emerald-700' : 'text-slate-500'}>
                            {item.complianceCerts.gas}
                          </strong>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                          <span className="text-slate-400 block">Plumbing CoCT</span>
                          <strong className={item.complianceCerts.plumbing === 'CoCT Passed' ? 'text-emerald-700' : 'text-amber-700'}>
                            {item.complianceCerts.plumbing}
                          </strong>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                          <span className="text-slate-400 block">Electric Fence</span>
                          <strong className="text-slate-700">{item.complianceCerts.electricFence}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 text-[11px]">
                        Bond Firm: {item.bondAttorneyFirm || 'Direct Cash Settlement'}
                      </span>
                      <button
                        onClick={() => onSelectStage('LODGEMENTS')}
                        className="px-3 py-1 bg-[#748982] hover:bg-[#5f736c] text-white rounded font-bold text-xs flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Track in Deeds Lodgements</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 5: LODGEMENTS (DEEDS REGISTRY TRACKER) */}
          {/* ========================================================================= */}
          {activeStage === 'LODGEMENTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>Deeds Office Lodgements & Registration Batch Monitor</span>
                  </h3>
                  <p className="text-xs text-slate-500">Live examination batches at the Cape Town Deeds Registry (90 Plein Street) to final registration.</p>
                </div>
              </div>

              <div className="space-y-3">
                {lodgements.map((lodge) => (
                  <div key={lodge.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                            Barcode: {lodge.deedsBarcode}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            Deed: {lodge.transferDeedNo}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{lodge.propertyAddress}</h4>
                        <p className="text-[11px] text-slate-500">
                          Transfer from <strong>{lodge.sellerName}</strong> to <strong>{lodge.purchaserName}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Agency Commission Release</span>
                        <strong className="text-base font-bold font-mono text-emerald-700">
                          R {lodge.commissionPayable.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Deeds Office Examination Stepper Bar */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Deeds Examination Stage
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 text-[10px] text-center">
                        {[
                          { id: '1_PREPARATION', label: '1. Prep & Lodged' },
                          { id: '2_LODGED_BATCH1', label: '2. Batch 1 (Junior)' },
                          { id: '3_EXAMINATION_BATCH2', label: '3. Batch 2 (Senior)' },
                          { id: '4_SECTION_HEAD_BATCH3', label: '4. Section Head' },
                          { id: '5_PREP_EXECUTION', label: '5. Prep Execution' },
                          { id: '6_REGISTERED', label: '6. Registered' }
                        ].map((step, idx) => {
                          const isDone = 
                            (step.id === '1_PREPARATION' && lodge.currentStep !== '1_PREPARATION') ||
                            (step.id === '2_LODGED_BATCH1' && ['3_EXAMINATION_BATCH2', '4_SECTION_HEAD_BATCH3', '5_PREP_EXECUTION', '6_REGISTERED'].includes(lodge.currentStep)) ||
                            (step.id === '3_EXAMINATION_BATCH2' && ['4_SECTION_HEAD_BATCH3', '5_PREP_EXECUTION', '6_REGISTERED'].includes(lodge.currentStep)) ||
                            (step.id === '4_SECTION_HEAD_BATCH3' && ['5_PREP_EXECUTION', '6_REGISTERED'].includes(lodge.currentStep)) ||
                            (step.id === '5_PREP_EXECUTION' && lodge.currentStep === '6_REGISTERED');
                          const isCurrent = lodge.currentStep === step.id;

                          return (
                            <div
                              key={step.id}
                              className={`p-1.5 rounded font-semibold border ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                  : isDone
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-white text-slate-400 border-slate-200'
                              }`}
                            >
                              {step.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {lodge.examinerNotes && (
                      <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded text-xs text-emerald-900">
                        <strong className="block text-[10px] uppercase font-bold text-emerald-800">Deeds Examiner Log:</strong>
                        {lodge.examinerNotes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Expected Registration Date: <strong className="text-slate-800">{lodge.expectedRegistrationDate}</strong>
                      </span>
                      <button
                        disabled
                        title="Not connected to a trust accounting system yet -- no payout has been authorized"
                        className="px-3 py-1 bg-slate-100 text-slate-400 rounded font-bold text-xs flex items-center gap-1 cursor-not-allowed"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Payout Not Yet Available</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Info Modal Popup */}
      {showInfoModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-300 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-700" />
                <span>About Deal View Pipeline</span>
              </h3>
              <button onClick={() => setShowInfoModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Deal View</strong> is an end-to-end South African real estate transaction pipeline:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li><strong>New Listings:</strong> Create mandates and auto-syndicate to Property24 & Private Property.</li>
              <li><strong>Property Viewing:</strong> Book private buyer tours and Sunday show houses with instant WhatsApp confirmations.</li>
              <li><strong>Offer to Purchase (OTP):</strong> Manage legally binding agreements and suspensive bond conditions.</li>
              <li><strong>Attorney Document:</strong> Track conveyancing firms, FICA, rates clearance, and the 5 mandatory certificates (Electrical, Beetle, Gas, Plumbing, Electric Fence).</li>
              <li><strong>Lodgements:</strong> Real-time Cape Town Deeds Registry examination batch tracking to final registration.</li>
            </ul>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-1.5 bg-[#748982] text-white text-xs font-bold rounded hover:bg-[#5f736c]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Viewing Sub-Modal */}
      {isNewViewingOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-[#748982] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Schedule Property Viewing</h3>
              <button onClick={() => setIsNewViewingOpen(false)} className="text-slate-200 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateViewing} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property</label>
                <select 
                  value={newViewingProperty} 
                  onChange={(e) => setNewViewingProperty(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 font-medium"
                >
                  {listings.map(l => (
                    <option key={l.id} value={`${l.address}, ${l.suburb}`}>{l.address}, {l.suburb}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer Full Name</label>
                <input 
                  type="text" 
                  value={newBuyerName} 
                  onChange={(e) => setNewBuyerName(e.target.value)} 
                  required 
                  placeholder="e.g. Dr. Liam Van Der Merwe"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer Phone (for WhatsApp)</label>
                <input 
                  type="text" 
                  value={newBuyerPhone} 
                  onChange={(e) => setNewBuyerPhone(e.target.value)} 
                  required 
                  placeholder="+27 82 000 0000"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newViewingDate} 
                    onChange={(e) => setNewViewingDate(e.target.value)} 
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={newViewingTime} 
                    onChange={(e) => setNewViewingTime(e.target.value)} 
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Viewing Type</label>
                <select 
                  value={newViewingType} 
                  onChange={(e) => setNewViewingType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50"
                >
                  <option value="Private Viewing">Private Viewing</option>
                  <option value="Sunday Show House">Sunday Show House</option>
                  <option value="Virtual Video Tour">Virtual Video Tour</option>
                  <option value="Broker Preview">Broker Preview</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsNewViewingOpen(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#748982] hover:bg-[#5f736c] text-white font-bold rounded">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Draft OTP Sub-Modal */}
      {isNewOtpOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-[#748982] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Draft Offer to Purchase (OTP)</h3>
              <button onClick={() => setIsNewOtpOpen(false)} className="text-slate-200 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateOtp} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property</label>
                <select 
                  value={otpProperty} 
                  onChange={(e) => setOtpProperty(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 font-medium"
                >
                  {listings.map(l => (
                    <option key={l.id} value={`${l.address}, ${l.suburb}`}>{l.address}, {l.suburb}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purchaser Full Name</label>
                <input 
                  type="text" 
                  value={otpBuyerName} 
                  onChange={(e) => setOtpBuyerName(e.target.value)} 
                  required 
                  placeholder="e.g. Julian Vance"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Offer Price (ZAR)</label>
                  <input 
                    type="number" 
                    value={otpOfferPrice} 
                    onChange={(e) => setOtpOfferPrice(Number(e.target.value))} 
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deposit (ZAR)</label>
                  <input 
                    type="number" 
                    value={otpDeposit} 
                    onChange={(e) => setOtpDeposit(Number(e.target.value))} 
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bond Finance Required (ZAR, 0 if Cash)</label>
                <input 
                  type="number" 
                  value={otpBondRequired} 
                  onChange={(e) => setOtpBondRequired(Number(e.target.value))} 
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsNewOtpOpen(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#748982] hover:bg-[#5f736c] text-white font-bold rounded">Generate OTP Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
