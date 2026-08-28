import React, { useState } from 'react';
import { X, CreditCard, Coins, Check, ShieldCheck, Zap } from 'lucide-react';

interface CreditsTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataCredits?: number;
  currentFicaCredits?: number;
  currentTrustCredits?: number;
  onTopUpSuccess?: (dataCredits: number, ficaCredits: number, trustCredits: number) => void;
}

export const CreditsTopUpModal: React.FC<CreditsTopUpModalProps> = ({
  isOpen,
  onClose,
  currentDataCredits = 250,
  currentFicaCredits = 0,
  currentTrustCredits = 0,
  onTopUpSuccess
}) => {
  const [selectedPack, setSelectedPack] = useState<'fica_50' | 'fica_200' | 'data_500' | 'trust_20'>('fica_50');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      if (onTopUpSuccess) {
        if (selectedPack === 'fica_50') onTopUpSuccess(currentDataCredits, currentFicaCredits + 50, currentTrustCredits);
        else if (selectedPack === 'fica_200') onTopUpSuccess(currentDataCredits, currentFicaCredits + 200, currentTrustCredits);
        else if (selectedPack === 'data_500') onTopUpSuccess(currentDataCredits + 500, currentFicaCredits, currentTrustCredits);
        else if (selectedPack === 'trust_20') onTopUpSuccess(currentDataCredits, currentFicaCredits, currentTrustCredits + 20);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div 
        id="credits-topup-modal"
        className="bg-white text-slate-800 w-full max-w-lg rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm">Purchase Verification & FICA Credits</h2>
              <span className="text-[10px] text-slate-400">Instant credit balance allocation for Deeds & KYC searches</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balances */}
        <div className="bg-slate-100 p-4 grid grid-cols-3 gap-2 border-b border-slate-200 text-center">
          <div className="bg-white p-2.5 rounded border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 block">DATA CREDITS</span>
            <span className="text-base font-black text-cyan-800 font-mono">{currentDataCredits}</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 block">FICA / IDV CREDITS</span>
            <span className="text-base font-black text-emerald-700 font-mono">{currentFicaCredits}</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 block">TRUST CREDITS</span>
            <span className="text-base font-black text-indigo-700 font-mono">{currentTrustCredits}</span>
          </div>
        </div>

        {/* Packages */}
        <div className="p-5 space-y-3">
          <label 
            onClick={() => setSelectedPack('fica_50')}
            className={`flex items-center justify-between p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPack === 'fica_50' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                50
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">50 x FICA & Fraud Pre-Check Credits</div>
                <div className="text-[10px] text-slate-500">Includes live Home Affairs IDV & Sanctions vetting</div>
              </div>
            </div>
            <span className="text-sm font-black text-slate-900 font-mono">R 495.00</span>
          </label>

          <label 
            onClick={() => setSelectedPack('fica_200')}
            className={`flex items-center justify-between p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPack === 'fica_200' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                200
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">200 x FICA & Bureau Trace Pack</div>
                <div className="text-[10px] text-slate-500">Best value for high-volume brokerage mandates (Save 25%)</div>
              </div>
            </div>
            <span className="text-sm font-black text-slate-900 font-mono">R 1,490.00</span>
          </label>

          <label 
            onClick={() => setSelectedPack('trust_20')}
            className={`flex items-center justify-between p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPack === 'trust_20' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                20
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">20 x Master of High Court Trust Credits</div>
                <div className="text-[10px] text-slate-500">Full trust deed, registered trustee verification</div>
              </div>
            </div>
            <span className="text-sm font-black text-slate-900 font-mono">R 380.00</span>
          </label>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Instant PayFast / EFT Gateway</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="bg-[#00bcd4] hover:bg-cyan-600 text-white font-bold text-xs px-4 py-1.5 rounded flex items-center gap-1.5 shadow-xs"
            >
              {isProcessing ? 'Processing...' : success ? 'Credits Added!' : 'Top Up Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
