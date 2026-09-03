import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Building2, 
  DollarSign, 
  MapPin, 
  User, 
  Check, 
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import { ListingDealRecord } from '../modals/MyListingsModal';
import { PropertyRecord } from '../../types';

interface QuickListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: PropertyRecord | null;
  onAddListing: (newListing: ListingDealRecord) => void;
}

export const QuickListingModal: React.FC<QuickListingModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  onAddListing
}) => {
  const [address, setAddress] = useState(selectedProperty?.address || '8 Richmond Road');
  const [suburb, setSuburb] = useState(selectedProperty?.suburb || 'Three Anchor Bay');
  // Only fall back to the demo placeholder price when nothing at all is
  // selected (a genuine blank-template "quick create" case). When a real
  // property/parcel IS selected but genuinely has no known sale price
  // (salePrice: 0, e.g. a real cadastral parcel with no connected
  // ownership provider -- see RealCadastreMap.tsx's
  // buildSyntheticParcelRecord), this used to silently fall back to the
  // same R11,950,000 demo number via `|| 11950000` (0 is falsy), which
  // would have been a fabricated price attached to a real, identifiable
  // property in a form that can actually publish to real portals. Left
  // blank (0) instead so the agent has to consciously enter the real
  // price before this could be submitted.
  const [price, setPrice] = useState(selectedProperty ? (selectedProperty.currentSale?.salePrice || 0) : 11950000);
  const [bedrooms, setBedrooms] = useState(selectedProperty?.accommodation?.bedRooms || 3);
  const [bathrooms, setBathrooms] = useState(selectedProperty?.accommodation?.bathRooms || 3);
  const [erfSize, setErfSize] = useState(selectedProperty?.extentM2 || 420);
  // Same reasoning as price above -- only the true blank-template case
  // gets the demo seller name.
  const [sellerName, setSellerName] = useState(selectedProperty ? (selectedProperty.currentSale?.owner || '') : 'David & Gillian Hirsch');
  const [sellerContact, setSellerContact] = useState('+27 82 555 9182');
  const [sellerEmail, setSellerEmail] = useState('d.hirsch@hirschgroup.co.za');
  const [mandateType, setMandateType] = useState<'Sole Mandate' | 'Open Mandate' | 'Joint Mandate'>('Sole Mandate');
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [syncPortals, setSyncPortals] = useState(true);

  // Sync state whenever selected property changes or modal opens
  React.useEffect(() => {
    if (selectedProperty) {
      setAddress(selectedProperty.address || '8 Richmond Road');
      setSuburb(selectedProperty.suburb || 'Three Anchor Bay');
      setPrice(selectedProperty.currentSale?.salePrice || 0);
      setBedrooms(selectedProperty.accommodation?.bedRooms || 3);
      setBathrooms(selectedProperty.accommodation?.bathRooms || 3);
      setErfSize(selectedProperty.extentM2 || 420);
      setSellerName(selectedProperty.currentSale?.owner || '');
      if (selectedProperty.contacts?.primaryPhone) {
        setSellerContact(selectedProperty.contacts.primaryPhone);
      }
      if (selectedProperty.contacts?.email) {
        setSellerEmail(selectedProperty.contacts.email);
      }
    }
  }, [selectedProperty, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ListingDealRecord = {
      id: `quick-${Date.now()}`,
      title: `${bedrooms} Bed Luxury Residence in ${suburb}`,
      address,
      suburb,
      price: Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      erfSize: Number(erfSize),
      sellerName,
      sellerId: '8205125098081',
      sellerContact,
      sellerEmail,
      mandateType,
      mandateStatus: syncPortals ? 'Live on Portals' : 'Mandate Pending',
      commissionRate: Number(commissionRate),
      photosCount: 8,
      p24Synced: syncPortals,
      privatePropertySynced: syncPortals,
      views: 1,
      enquiries: 0,
      imageUrl: selectedProperty?.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    };

    onAddListing(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="bg-[#6b827a] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-300 fill-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Quick Listing Creator</h3>
              <p className="text-[11px] text-slate-200">Fast-track mandate and instantly syndicate to portals</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-200 hover:text-white p-1 rounded hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Street Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Suburb / Enclave</label>
              <input 
                type="text" 
                value={suburb} 
                onChange={(e) => setSuburb(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Asking Price (ZAR)</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Mandate Type</label>
              <select 
                value={mandateType} 
                onChange={(e) => setMandateType(e.target.value as any)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white font-medium"
              >
                <option value="Sole Mandate">Sole Mandate</option>
                <option value="Open Mandate">Open Mandate</option>
                <option value="Joint Mandate">Joint Mandate</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Commission %</label>
              <input 
                type="number" 
                step="0.1" 
                value={commissionRate} 
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bedrooms</label>
              <input 
                type="number" 
                value={bedrooms} 
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bathrooms</label>
              <input 
                type="number" 
                value={bathrooms} 
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Erf Size (m²)</label>
              <input 
                type="number" 
                value={erfSize} 
                onChange={(e) => setErfSize(Number(e.target.value))}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Seller Full Name</label>
              <input 
                type="text" 
                value={sellerName} 
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Seller Phone / Mobile</label>
              <input 
                type="text" 
                value={sellerContact} 
                onChange={(e) => setSellerContact(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Sync Checkbox */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
            <input 
              type="checkbox" 
              id="quick-sync-portals" 
              checked={syncPortals} 
              onChange={(e) => setSyncPortals(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="quick-sync-portals" className="text-xs text-emerald-900 font-medium cursor-pointer">
              Auto-Syndicate immediately to <strong>Property24</strong> & <strong>Private Property</strong>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-bold bg-[#6b827a] hover:bg-[#596d66] text-white flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Create & Activate Listing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
