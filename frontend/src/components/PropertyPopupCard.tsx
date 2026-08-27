import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Banknote, 
  Maximize2, 
  Calendar, 
  ShieldCheck, 
  Bed, 
  Bath, 
  Car, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ExternalLink, 
  FileText, 
  Phone, 
  Globe, 
  Layers,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { PropertyRecord } from '../types';
import { INITIAL_PROPERTY_MEDIA } from '../services/mockData';
import { listMedia } from '../services/api';

interface PropertyPopupCardProps {
  property: PropertyRecord | null;
  onClose: () => void;
  onOpenCMA?: () => void;
  onOpenPDF?: () => void;
  onOpenContact?: () => void;
  onOpenPortalSync?: () => void;
}

export const PropertyPopupCard: React.FC<PropertyPopupCardProps> = ({
  property,
  onClose,
  onOpenCMA,
  onOpenPDF,
  onOpenContact,
  onOpenPortalSync
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [realMediaUrls, setRealMediaUrls] = useState<string[] | null>(null);

  // Reset image index when selected property changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [property?.id]);

  // Real backend properties (MongoDB ids -- not one of the mock dataset's
  // fixed 'prop-XXXX' ids) have no photos baked into mockData.ts. This
  // used to silently fall through to 3 generic stock photos regardless of
  // address -- misleading, since they look like real photos of that
  // property. Fetch the actual uploaded media for real properties instead;
  // mock demo properties are untouched (mediaAssets.length check below
  // already covers them via INITIAL_PROPERTY_MEDIA).
  useEffect(() => {
    if (!property || INITIAL_PROPERTY_MEDIA[property.id]) {
      setRealMediaUrls(null);
      return;
    }
    let cancelled = false;
    listMedia(property.id)
      .then((media) => {
        if (!cancelled) setRealMediaUrls(media.map((m: any) => m.original_url).filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) setRealMediaUrls([]);
      });
    return () => { cancelled = true; };
  }, [property?.id]);

  if (!property) return null;

  // Compile image list: from property.images, propertyMediaStore, or property.imageUrl
  const mediaAssets = INITIAL_PROPERTY_MEDIA[property.id] || [];
  const imageList: string[] = [];
  const isRealProperty = realMediaUrls !== null;

  if (property.images && property.images.length > 0) {
    imageList.push(...property.images);
  } else if (mediaAssets.length > 0) {
    imageList.push(...mediaAssets.map(a => a.url));
  } else if (isRealProperty && realMediaUrls!.length > 0) {
    imageList.push(...realMediaUrls!);
  } else if (property.imageUrl) {
    imageList.push(property.imageUrl);
  }

  // Honest empty state for a real property with no uploaded photos yet --
  // no generic stock-photo fallback here, since that would misrepresent
  // an address no one has actually photographed.
  const hasNoRealPhotos = isRealProperty && imageList.length === 0;

  // Demo/mock properties only: fallback if no images found
  if (!isRealProperty && imageList.length === 0) {
    imageList.push(
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80'
    );
  }

  const currentImage = imageList[activeImageIndex] || imageList[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  // Format currency in ZAR
  const formatZar = (amount?: number) => {
    if (!amount || amount === 0) return 'N/A';
    return `R ${amount.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  // Format date nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unrecorded';
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[monthNum - 1] || parts[1];
      return `${day} ${month} ${year}`;
    }
    return dateStr;
  };

  // Calculate Price per m²
  const calculatePricePerM2 = (price?: number, m2?: number) => {
    if (!price || !m2 || m2 <= 0) return null;
    const psm = Math.round(price / m2);
    return `R ${psm.toLocaleString('en-ZA').replace(/,/g, ' ')} / m²`;
  };

  const salePrice = property.currentSale?.salePrice;
  const saleDate = property.currentSale?.saleDate;
  const extentM2 = property.extentM2 || property.cadastralExtentM2;
  const pricePerM2 = calculatePricePerM2(salePrice, extentM2);
  const munVal = property.municipalValuation?.totalValue;
  const munYear = property.municipalValuation?.valuationYear || 2025;
  const beds = property.accommodation?.bedRooms;
  const baths = property.accommodation?.bathRooms;
  const garages = property.accommodation?.garages;
  const p24 = property.property24Listing;

  return (
    <div
      id="property-popup-card-modal"
      className="absolute top-4 left-4 z-40 w-96 max-w-[calc(100vw-32px)] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-3 flex flex-col max-h-[calc(100vh-140px)]"
    >
      {/* 1. TOP IMAGE GALLERY CAROUSEL */}
      <div className="relative w-full h-52 bg-slate-950 overflow-hidden group select-none shrink-0">
        {hasNoRealPhotos ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
            <Camera className="w-8 h-8" />
            <span className="text-xs font-semibold">No photos uploaded yet</span>
          </div>
        ) : (
          <img
            src={currentImage}
            alt={property.address}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/50 pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-property-popup"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-colors shadow-lg"
          title="Close Card"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Erf Badge & Cadastre Status Tag */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-400/70 text-cyan-300 font-mono text-[11px] font-bold shadow-md">
            Erf {property.erfNo}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Deeds Verified
          </span>
        </div>

        {/* Carousel Navigation Arrows */}
        {imageList.length > 1 && (
          <>
            <button
              id="btn-popup-prev-image"
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-all shadow-lg"
              title="Previous Photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-popup-next-image"
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-all shadow-lg"
              title="Next Photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Photo Counter Pill & Thumbnail Indicators */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1">
            {imageList.slice(0, 6).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeImageIndex ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-500/70'
                }`}
              />
            ))}
          </div>
          <div className="bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-cyan-900/50 flex items-center gap-1">
            <Camera className="w-3 h-3 text-cyan-400" />
            <span>{activeImageIndex + 1} / {imageList.length}</span>
          </div>
        </div>
      </div>

      {/* 2. PROPERTY DETAILS BODY */}
      <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Street Address & Township Header */}
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
              {property.category}
            </span>
            <span className="text-[10px] font-semibold bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
              {property.zoning} • {property.zoningDescription || 'General Residential'}
            </span>
          </div>
          <h3 className="font-extrabold text-base text-white mt-1 leading-tight tracking-tight">
            {property.address}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{property.suburb}, {property.township}</span>
          </p>
        </div>

        {/* Property24 Live Asking Price Tag (if active) */}
        {p24 && (
          <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Property24 Live Listing
              </div>
              <div className="text-xs text-slate-300 font-medium line-clamp-1 mt-0.5">
                {p24.headline || p24.title}
              </div>
            </div>
            <div className="text-right shrink-0 pl-2">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Asking</div>
              <div className="text-sm font-extrabold text-emerald-400 font-mono">
                {formatZar(p24.askingPrice)}
              </div>
            </div>
          </div>
        )}

        {/* Key Deeds & Market Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          {/* Last Sale */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
              <Banknote className="w-2.5 h-2.5 text-emerald-400" /> Last Sale
            </span>
            <span className="font-extrabold text-emerald-400 text-xs mt-0.5 font-mono">
              {formatZar(salePrice)}
            </span>
            {pricePerM2 && (
              <span className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                {pricePerM2}
              </span>
            )}
          </div>

          {/* Extent */}
          <div className="flex flex-col border-l border-slate-800 pl-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
              <Maximize2 className="w-2.5 h-2.5 text-cyan-400" /> Extent
            </span>
            <span className="font-extrabold text-cyan-300 text-xs mt-0.5 font-mono">
              {extentM2} m²
            </span>
            <span className="text-[9px] text-slate-400 truncate mt-0.5">
              Cadastral lot
            </span>
          </div>

          {/* Sale Date */}
          <div className="flex flex-col border-l border-slate-800 pl-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5 text-amber-400" /> Registered
            </span>
            <span className="font-bold text-amber-300 text-xs mt-0.5 truncate font-mono">
              {formatDate(saleDate)}
            </span>
            <span className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
              {property.currentSale?.titleDeed || 'Deed Reg'}
            </span>
          </div>
        </div>

        {/* Municipal Valuation Roll */}
        <div className="flex items-center justify-between text-xs bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Municipal Roll ({munYear}):
          </span>
          <span className="font-bold text-slate-200 font-mono">
            {formatZar(munVal)}
          </span>
        </div>

        {/* Accommodation Specs Chips */}
        {(beds !== undefined || baths !== undefined || garages !== undefined || property.accommodation?.pool) && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300 pt-0.5">
            {beds !== undefined && (
              <span className="px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700 flex items-center gap-1 text-[11px]">
                <Bed className="w-3.5 h-3.5 text-cyan-400" /> {beds} Beds
              </span>
            )}
            {baths !== undefined && (
              <span className="px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700 flex items-center gap-1 text-[11px]">
                <Bath className="w-3.5 h-3.5 text-cyan-400" /> {baths} Baths
              </span>
            )}
            {garages !== undefined && (
              <span className="px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700 flex items-center gap-1 text-[11px]">
                <Car className="w-3.5 h-3.5 text-cyan-400" /> {garages} Garages
              </span>
            )}
            {property.accommodation?.pool && (
              <span className="px-2 py-1 rounded-md bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-[11px]">
                🏊 Plunge Pool
              </span>
            )}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
          {onOpenCMA && (
            <button
              id="btn-popup-open-cma"
              onClick={onOpenCMA}
              className="flex-1 py-2 px-2.5 bg-[#006980] hover:bg-cyan-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI CMA Report</span>
            </button>
          )}

          {onOpenPDF && (
            <button
              id="btn-popup-open-pdf"
              onClick={onOpenPDF}
              className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              title="Generate PDF Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>PDF</span>
            </button>
          )}

          {onOpenContact && (
            <button
              id="btn-popup-open-contact"
              onClick={onOpenContact}
              className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              title="Contact Owner"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Owner</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
