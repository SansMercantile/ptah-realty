import React from 'react';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Maximize2, 
  Tag, 
  TrendingUp, 
  ShieldCheck, 
  Bed, 
  Bath, 
  Car, 
  Sparkles,
  Layers,
  Banknote
} from 'lucide-react';
import { PropertyRecord } from '../types';

interface CadastralTooltipProps {
  property: PropertyRecord | null;
  surroundingParcel?: { erf: string; street: string } | null;
  position: { x: number; y: number } | null;
  containerBounds?: DOMRect | null;
}

export const CadastralTooltip: React.FC<CadastralTooltipProps> = ({
  property,
  surroundingParcel,
  position,
  containerBounds
}) => {
  if (!position || (!property && !surroundingParcel)) return null;

  // Format currency in ZAR
  const formatZar = (amount?: number) => {
    if (!amount || amount === 0) return 'N/A';
    return `R ${amount.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  // Format date nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unrecorded';
    // Handles 'YYYY/MM/DD' or 'YYYY-MM-DD'
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

  // Calculate clamped position within container
  const tooltipWidth = 310;
  const tooltipHeight = property ? 255 : 110;
  
  let left = position.x + 18;
  let top = position.y + 18;

  if (containerBounds) {
    if (left + tooltipWidth > containerBounds.width - 16) {
      left = position.x - tooltipWidth - 18;
    }
    if (top + tooltipHeight > containerBounds.height - 16) {
      top = position.y - tooltipHeight - 18;
    }
    if (left < 12) left = 12;
    if (top < 12) top = 12;
  }

  // Fallback for Surrounding Parcel without full record
  if (!property && surroundingParcel) {
    return (
      <div
        id="cadastral-hover-tooltip"
        className="fixed z-50 pointer-events-none transition-all duration-75 ease-out"
        style={{ left: `${left}px`, top: `${top}px` }}
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-xl p-3 text-slate-100 w-[240px]">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" /> Neighboring Cadastre
            </span>
            <span className="text-[10px] font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">
              Erf {surroundingParcel.erf}
            </span>
          </div>
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-200">{surroundingParcel.street}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Green Point / Three Anchor Bay Cadastre</div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const salePrice = property.currentSale?.salePrice;
  const saleDate = property.currentSale?.saleDate;
  const extentM2 = property.extentM2 || property.cadastralExtentM2;
  const pricePerM2 = calculatePricePerM2(salePrice, extentM2);
  const munVal = property.municipalValuation?.totalValue;
  const munYear = property.municipalValuation?.valuationYear || 2025;
  const beds = property.accommodation?.bedRooms;
  const baths = property.accommodation?.bathRooms;
  const garages = property.accommodation?.garages;

  return (
    <div
      id="cadastral-hover-tooltip"
      className="fixed z-50 pointer-events-none transition-all duration-75 ease-out"
      style={{ left: `${left}px`, top: `${top}px` }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl rounded-xl p-3.5 text-slate-100 w-[310px] space-y-2.5">
        
        {/* Header: Image thumbnail, Erf tag, Category & Address */}
        <div className="flex items-start gap-2.5 pb-2 border-b border-slate-800">
          {(property.images?.[0] || property.imageUrl) && (
            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-cyan-500/40 bg-slate-950 shadow-md">
              <img
                src={property.images?.[0] || property.imageUrl}
                alt={property.address}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-700/60 px-1.5 py-0.5 rounded text-cyan-300">
                Erf {property.erfNo}
              </span>
              <span className="text-[10px] font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {property.category}
              </span>
              <span className="text-[10px] font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                {property.zoning}
              </span>
            </div>
            <div className="font-extrabold text-sm text-slate-100 mt-1 leading-tight tracking-tight truncate">
              {property.address}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{property.suburb}</span>
            </div>
          </div>
        </div>

        {/* Primary Requested Cadastral Metrics: Price, Extent, Last Sale Date */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
          
          {/* Metric 1: Last Sale Price */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-0.5">
              <Banknote className="w-2.5 h-2.5 text-emerald-400" /> Last Sale
            </span>
            <span className="font-extrabold text-emerald-400 text-xs mt-0.5">
              {formatZar(salePrice)}
            </span>
            {pricePerM2 && (
              <span className="text-[9px] text-slate-400 font-mono truncate">
                {pricePerM2}
              </span>
            )}
          </div>

          {/* Metric 2: Square Meters / Extent */}
          <div className="flex flex-col border-l border-slate-800 pl-1.5">
            <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-0.5">
              <Maximize2 className="w-2.5 h-2.5 text-cyan-400" /> Extent
            </span>
            <span className="font-extrabold text-cyan-300 text-xs mt-0.5">
              {extentM2} m²
            </span>
            <span className="text-[9px] text-slate-400 truncate">
              Cadastral lot
            </span>
          </div>

          {/* Metric 3: Last Sale Date */}
          <div className="flex flex-col border-l border-slate-800 pl-1.5">
            <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5 text-amber-400" /> Sale Date
            </span>
            <span className="font-bold text-amber-300 text-xs mt-0.5 truncate">
              {formatDate(saleDate)}
            </span>
            <span className="text-[9px] text-slate-400 font-mono truncate">
              {property.currentSale?.titleDeed || 'Deed Reg'}
            </span>
          </div>
        </div>

        {/* Secondary Details: Municipal Valuation & Accommodation Chips */}
        <div className="space-y-1.5 pt-0.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" /> Municipal Roll ({munYear}):
            </span>
            <span className="font-bold text-slate-200">
              {formatZar(munVal)}
            </span>
          </div>

          {/* Accommodation Highlights if present */}
          {(beds !== undefined || baths !== undefined || garages !== undefined) && (
            <div className="flex items-center gap-3 pt-1 border-t border-slate-800 text-[10px] text-slate-300">
              {beds !== undefined && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3 text-cyan-400" />
                  <span>{beds} Beds</span>
                </span>
              )}
              {baths !== undefined && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3 h-3 text-cyan-400" />
                  <span>{baths} Baths</span>
                </span>
              )}
              {garages !== undefined && garages > 0 && (
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3 text-cyan-400" />
                  <span>{garages} Garage</span>
                </span>
              )}
              {property.accommodation?.pool && (
                <span className="text-cyan-300 font-medium">• Pool</span>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-cyan-400 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-300" /> Click polygon to inspect
          </span>
          <span className="text-slate-500 font-mono text-[9px]">SG Cadastre</span>
        </div>

      </div>
    </div>
  );
};
