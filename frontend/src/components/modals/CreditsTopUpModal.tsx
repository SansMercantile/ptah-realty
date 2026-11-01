import React, { useEffect, useState } from 'react';
import { X, Coins, ShieldCheck, Copy, Check, Loader2, Landmark } from 'lucide-react';
import {
  CreditPack,
  CreditPurchase,
  SettlementInstructions,
  listCreditPacks,
  getCredits,
  purchaseCredits,
} from '../../services/api';

interface CreditsTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful purchase so the parent can refresh UI state. */
  onPurchased?: (purchase: CreditPurchase) => void;
}

/**
 * Real credit-pack purchase (replaces the old setTimeout stub).
 *
 * Flow: load packs + balance -> pick a pack -> POST /billing/credits/purchase
 * -> show the FNB settlement details with the unique PTR-XXXXXXXX reference.
 * Credits unlock once the EFT is reconciled (bank statement match or admin
 * confirm); this modal never claims credits are live until the backend says so.
 */
export const CreditsTopUpModal: React.FC<CreditsTopUpModalProps> = ({ isOpen, onClose, onPurchased }) => {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchase, setPurchase] = useState<CreditPurchase | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setPurchase(null);
    (async () => {
      try {
        const [packRes, creditRes] = await Promise.all([
          listCreditPacks(),
          getCredits().catch(() => ({ balance: null as unknown as number, ledger: [] })),
        ]);
        if (cancelled) return;
        setPacks(packRes.packs);
        setBalance(Number.isFinite(creditRes.balance) ? creditRes.balance : null);
        setSelectedPackId(packRes.packs[0]?.id ?? null);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load credit packs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!selectedPackId) return;
    setIsProcessing(true);
    setLoadError(null);
    try {
      const result = await purchaseCredits(selectedPackId, 'bank_transfer');
      setPurchase(result);
      onPurchased?.(result);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not start the purchase.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyReference = async () => {
    if (!purchase?.settlement) return;
    try {
      await navigator.clipboard.writeText(purchase.settlement.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard denied -- reference is still visible on screen */
    }
  };

  const settlement: SettlementInstructions | null = purchase?.settlement ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div id="credits-topup-modal" className="bg-white text-slate-800 w-full max-w-lg rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm">Buy Report Credits</h2>
              <span className="text-[10px] text-slate-400">One credit unlocks one downloadable CMA / PDF report</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {balance !== null && (
          <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500">CURRENT BALANCE</span>
            <span className="text-base font-black text-cyan-800 font-mono">{balance} credits</span>
          </div>
        )}

        {settlement ? (
          <div className="p-5 space-y-3">
            <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                <Landmark className="w-4 h-4" /> Pay this exact amount by EFT
              </div>
              <p className="text-[11px] text-emerald-800/80 mb-3">
                Transfer <strong>R {settlement.amount_rand}</strong> to the account below using reference{' '}
                <strong>{settlement.reference}</strong>. Credits unlock automatically once the payment is matched.
              </p>
              <dl className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                <dt className="text-slate-500">Account holder</dt>
                <dd className="font-semibold text-slate-800">{settlement.account_holder}</dd>
                <dt className="text-slate-500">Bank</dt>
                <dd className="font-semibold text-slate-800">{settlement.bank}</dd>
                <dt className="text-slate-500">Account no.</dt>
                <dd className="font-semibold text-slate-800 font-mono">{settlement.account_number}</dd>
                <dt className="text-slate-500">Branch code</dt>
                <dd className="font-semibold text-slate-800 font-mono">{settlement.branch_code}</dd>
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-semibold text-slate-800 font-mono">R {settlement.amount_rand}</dd>
                <dt className="text-slate-500">Reference</dt>
                <dd className="font-semibold text-slate-900 font-mono flex items-center gap-1.5">
                  {settlement.reference}
                  <button onClick={copyReference} className="p-0.5 text-slate-400 hover:text-cyan-700" title="Copy reference">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </dd>
              </dl>
              <p className="text-[10px] text-amber-700 mt-3 font-medium">{settlement.reference_warning}</p>
            </div>
            <button onClick={onClose} className="w-full px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-3">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading packs…
                </div>
              )}
              {loadError && <div className="rounded border border-red-200 bg-red-50 p-3 text-[11px] text-red-700">{loadError}</div>}
              {!loading && !loadError && packs.map((pack) => (
                <label
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPackId === pack.id ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 font-bold text-sm">
                      {pack.credits}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800">{pack.label}</div>
                      <div className="text-[10px] text-slate-500">{pack.blurb}</div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-mono">R {pack.amount_rand}</span>
                </label>
              ))}
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pay by EFT into our FNB account</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded">
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={isProcessing || loading || !selectedPackId}
                  className="bg-[#00bcd4] hover:bg-cyan-600 text-white font-bold text-xs px-4 py-1.5 rounded flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting…</> : 'Get payment details'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
