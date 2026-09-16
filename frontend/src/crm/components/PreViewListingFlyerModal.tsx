import React, { useState } from 'react';
import {
  X,
  Eye,
  Download,
  Share2,
  Check,
  Building,
  BedDouble,
  Bath,
  Car,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Smartphone
} from 'lucide-react';
import { PropertyListing } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PreViewListingFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings?: PropertyListing[];
}

export const PreViewListingFlyerModal: React.FC<PreViewListingFlyerModalProps> = ({
  isOpen,
  onClose,
  listings = [],
}) => {
  const [selectedListingId, setSelectedListingId] = useState<string>(listings[0]?.id || 'custom');
  
  // Custom Flyer parameters matching screenshot
  const [flyerImage, setFlyerImage] = useState<string>(
    listings[0]?.featuredImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80'
  );
  const [listingType, setListingType] = useState<'For Sale' | 'To Rent'>('For Sale');
  const [propertyType, setPropertyType] = useState('House');
  const [beds, setBeds] = useState(4);
  const [baths, setBaths] = useState(3.5);
  const [garages, setGarages] = useState(2);
  const [price, setPrice] = useState(4250000);
  const [mandateType, setMandateType] = useState('Sole Mandate');
  const [suburb, setSuburb] = useState('Waterfall Heights');
  const [address, setAddress] = useState('14 Karkloof Crescent');
  const [showAddress, setShowAddress] = useState(true);
  const [agentName] = useState('Amanda Mokoena');
  const [agentPhone] = useState('+27 82 555 0192');
  const [agentEmail] = useState('amanda.m@ptah.co.za');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // When selected listing changes
  const handleSelectListing = (id: string) => {
    setSelectedListingId(id);
    const found = listings.find((l) => l.id === id);
    if (found) {
      setFlyerImage(found.featuredImage);
      setPropertyType(found.propertyType);
      setBeds(found.bedrooms);
      setBaths(found.bathrooms);
      setGarages(found.garages);
      setPrice(found.price);
      setMandateType(found.mandateType);
      setSuburb(found.suburb);
      setAddress(found.location);
    }
  };

  // Close on escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Pre-View Listing Flyer & Teaser Generator</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
                  Social Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate branded promotional teaser flyers for WhatsApp Status, Instagram, and client email broadcasts
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

        {/* Body Split */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          
          {/* Left: Flyer Parameters */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Flyer Configuration</h3>

            {listings.length > 0 && (
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Load From Existing Listing
                </label>
                <select
                  value={selectedListingId}
                  onChange={(e) => handleSelectListing(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({formatCurrency(l.price)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Listing Type</label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                >
                  <option value="For Sale">For Sale</option>
                  <option value="To Rent">To Rent</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Property Type</label>
                <input
                  type="text"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  value={baths}
                  onChange={(e) => setBaths(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Garages</label>
                <input
                  type="number"
                  value={garages}
                  onChange={(e) => setGarages(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Price (ZAR)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mandate Type</label>
                <select
                  value={mandateType}
                  onChange={(e) => setMandateType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                >
                  <option value="Sole Mandate">Sole Mandate</option>
                  <option value="Exclusive Mandate">Exclusive Mandate</option>
                  <option value="Open Mandate">Open Mandate</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Suburb</label>
                <input
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showAddress}
                onChange={(e) => setShowAddress(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium">Display street address on flyer card</span>
            </label>
          </div>

          {/* Right: Live Interactive Flyer Teaser Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
            
            {/* The Flyer Graphic Card */}
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition duration-300 hover:shadow-2xl">
              
              {/* Image banner with overlay badges */}
              <div className="relative h-56 overflow-hidden">
                <img src={flyerImage} alt={propertyType} className="w-full h-full object-cover" />
                
                {/* Top badges */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-600 text-white uppercase tracking-wider shadow-sm">
                    {listingType}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
                    {mandateType}
                  </span>
                </div>

                <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-900 dark:text-white shadow-xs">
                  Ptah Real Estate
                </div>

                {/* Bottom gradient bar with price */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 flex items-end justify-between">
                  <div>
                    <p className="text-white text-lg sm:text-xl font-black drop-shadow-sm">
                      {formatCurrency(price)}
                    </p>
                    <p className="text-slate-200 text-xs font-semibold drop-shadow-sm">
                      {suburb}{showAddress ? `, ${address}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specs pill strip */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-around text-center">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-200">
                  <BedDouble className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">{beds}</span>
                  <span className="text-slate-400">Beds</span>
                </div>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-200">
                  <Bath className="w-4 h-4 text-blue-600" />
                  <span className="font-bold">{baths}</span>
                  <span className="text-slate-400">Baths</span>
                </div>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-200">
                  <Car className="w-4 h-4 text-purple-600" />
                  <span className="font-bold">{garages}</span>
                  <span className="text-slate-400">Garages</span>
                </div>
              </div>

              {/* Agent contact footer */}
              <div className="p-4 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt={agentName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{agentName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Ptah Real Estate (Waterfall)</p>
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{agentPhone}</p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>

            </div>

            {/* Action buttons below card */}
            <div className="flex items-center space-x-3 mt-4 w-full max-w-md">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs"
              >
                {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>{downloaded ? 'Flyer Downloaded!' : 'Download High-Res Flyer'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Share WhatsApp'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
