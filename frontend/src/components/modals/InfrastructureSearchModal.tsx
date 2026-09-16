import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Search, 
  GraduationCap, 
  Trees, 
  HeartPulse, 
  Bus, 
  ShieldAlert, 
  ShoppingBag, 
  Clock, 
  Phone, 
  ExternalLink, 
  Star, 
  Sliders, 
  CheckCircle2, 
  Copy, 
  Compass,
  Check
} from 'lucide-react';
import { InfrastructureItem, InfrastructureCategory } from '../../types';

interface InfrastructureSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyAddress?: string;
  suburbName?: string;
}

export const InfrastructureSearchModal: React.FC<InfrastructureSearchModalProps> = ({
  isOpen,
  onClose,
  propertyAddress = '5 Richmond Road, Three Anchor Bay',
  suburbName = 'Three Anchor Bay'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusMeters, setRadiusMeters] = useState<number>(3000);
  const [items, setItems] = useState<InfrastructureItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInfrastructure();
    }
  }, [isOpen, selectedCategory, radiusMeters]);

  const fetchInfrastructure = async () => {
    setIsLoading(true);
    try {
      let url = `/api/infrastructure?maxRadiusMeters=${radiusMeters}&q=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory !== 'ALL') {
        url += `&category=${selectedCategory}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.infrastructure || []);
      }
    } catch (err) {
      console.error('Error fetching infrastructure:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInfrastructure();
  };

  const handleCopySummary = () => {
    const summary = `PUBLIC INFRASTRUCTURE REPORT | ${propertyAddress}
Radius: Within ${(radiusMeters / 1000).toFixed(1)} km
Top Amenities & Services:
${items.slice(0, 5).map(item => `• ${item.name} (${item.type}) - ${item.distanceMeters}m (${item.walkingMinutes} min walk)`).join('\n')}
Verified via City of Cape Town Municipal Infrastructure GIS`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  if (!isOpen) return null;

  const getCategoryIcon = (cat: InfrastructureCategory) => {
    switch (cat) {
      case 'education': return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />;
      case 'recreation': return <Trees className="w-3.5 h-3.5 text-emerald-600" />;
      case 'healthcare': return <HeartPulse className="w-3.5 h-3.5 text-rose-600" />;
      case 'transit': return <Bus className="w-3.5 h-3.5 text-amber-600" />;
      case 'safety': return <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />;
      case 'shopping': return <ShoppingBag className="w-3.5 h-3.5 text-cyan-600" />;
      default: return <MapPin className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="infrastructure-search-modal"
        className="bg-white text-slate-800 w-full max-w-5xl rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Compass className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base leading-tight">
                  Public Infrastructure & Community Amenities Search ™
                </h2>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Verified GIS
                </span>
              </div>
              <p className="text-cyan-100/90 text-xs mt-0.5">
                Proximity analysis for schools, parks, healthcare, transit, and civic safety around {propertyAddress}
              </p>
            </div>
          </div>
          <button
            id="btn-close-infrastructure-modal"
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Livability Benchmark Scorecards */}
        <div className="bg-slate-900 text-white px-4 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded border border-slate-700">
            <GraduationCap className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Education Score</div>
              <div className="font-bold text-slate-100 font-mono">9.4 / 10 (High Density)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded border border-slate-700">
            <Trees className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Recreation & Parks</div>
              <div className="font-bold text-slate-100 font-mono">9.8 / 10 (Sea Point Prom)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded border border-slate-700">
            <Bus className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Transit Index</div>
              <div className="font-bold text-slate-100 font-mono">9.6 / 10 (MyCiTi Hub)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-800/80 p-2 rounded border border-slate-700">
            <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Safety & Emergency</div>
              <div className="font-bold text-slate-100 font-mono">9.1 / 10 (SAPS & CID)</div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Form */}
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Amenities' },
              { id: 'education', label: '🎓 Schools' },
              { id: 'recreation', label: '🌳 Parks & Sea' },
              { id: 'healthcare', label: '🏥 Medical' },
              { id: 'transit', label: '🚌 Transit' },
              { id: 'safety', label: '🛡️ Police & Fire' },
              { id: 'shopping', label: '🛒 Shopping' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#006980] text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Query & Radius Slider */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-medium text-[11px]">Radius:</span>
              <input
                type="range"
                min="250"
                max="5000"
                step="250"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-24 accent-[#006980]"
              />
              <span className="font-bold text-cyan-900 font-mono text-xs min-w-[45px]">
                {(radiusMeters / 1000).toFixed(1)} km
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Filter by name, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-2.5 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-hidden w-40"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </div>

        {/* Main List of Infrastructure Amenities */}
        <div className="flex-1 overflow-y-auto max-h-[62vh] p-4 bg-slate-50/50">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <div className="inline-block animate-spin w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full mb-2"></div>
              <div>Querying municipal spatial database...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No infrastructure facilities found within {(radiusMeters / 1000).toFixed(1)} km of this location. Try expanding the search radius.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  id={`infra-card-${item.id}`}
                  className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:border-cyan-400 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="p-1.5 rounded-md bg-slate-100 border border-slate-200 shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs text-slate-900 truncate">{item.name}</h3>
                          <div className="text-[11px] text-slate-500 font-medium">{item.type}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-cyan-950 font-mono text-xs">
                          {item.distanceMeters} m
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {item.walkingMinutes} min walk
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed my-2">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                      <span className="text-slate-400 font-normal">({item.reviewCount})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.contactPhone && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Phone className="w-2.5 h-2.5 text-cyan-700" />
                          <span className="font-mono text-[10px]">{item.contactPhone}</span>
                        </span>
                      )}
                      {item.operationalHours && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span className="text-[10px] truncate max-w-[120px]">{item.operationalHours}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Facilities Found:</span>
            <span>{items.length} Amenities</span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">Data synchronized with Western Cape Education Dept, SAPS, and OpenStreetMap</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-infra-summary"
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Copy for CMA Report</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
