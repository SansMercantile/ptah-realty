import React, { useState, useRef, useEffect } from 'react';
import { 
  Filter, 
  Eye, 
  EyeOff, 
  Layers, 
  MapPin, 
  Sparkles, 
  Check, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Building2,
  Home,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { 
  PRECINCT_CLUSTERS, 
  CADASTRAL_STREETS, 
  extractStreetName,
  PrecinctCluster,
  StreetFilterInfo
} from '../utils/cadastralFilters';
import { PropertyRecord } from '../types';

interface StreetFilterControlsProps {
  properties: PropertyRecord[];
  visibleStreets: Set<string>;
  onToggleStreet: (streetName: string) => void;
  onSetVisibleStreets: (streets: Set<string>) => void;
  activeClusterId: string;
  onSelectCluster: (clusterId: string) => void;
  showSurroundingParcels: boolean;
  onToggleSurroundingParcels: (show: boolean) => void;
  showHouseNumbers: boolean;
  onToggleHouseNumbers: (show: boolean) => void;
  categoryFilter: 'ALL' | 'FREEHOLD' | 'SECTIONAL';
  onSetCategoryFilter: (filter: 'ALL' | 'FREEHOLD' | 'SECTIONAL') => void;
}

export const StreetFilterControls: React.FC<StreetFilterControlsProps> = ({
  properties,
  visibleStreets,
  onToggleStreet,
  onSetVisibleStreets,
  activeClusterId,
  onSelectCluster,
  showSurroundingParcels,
  onToggleSurroundingParcels,
  showHouseNumbers,
  onToggleHouseNumbers,
  categoryFilter,
  onSetCategoryFilter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Compute counts per street
  const streetCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    CADASTRAL_STREETS.forEach(s => counts[s.name] = 0);
    
    properties.forEach(p => {
      const street = extractStreetName(p.address);
      if (counts[street] !== undefined) {
        counts[street]++;
      } else {
        counts[street] = (counts[street] || 0) + 1;
      }
    });
    return counts;
  }, [properties]);

  const allSelected = visibleStreets.size === CADASTRAL_STREETS.length;
  const isFilteringActive = visibleStreets.size < CADASTRAL_STREETS.length || !showSurroundingParcels || categoryFilter !== 'ALL';

  const handleSelectAll = () => {
    onSetVisibleStreets(new Set(CADASTRAL_STREETS.map(s => s.name)));
    onSelectCluster('all');
  };

  const handleClearAll = () => {
    // Keep at least the first one or empty
    onSetVisibleStreets(new Set());
    onSelectCluster('custom');
  };

  const handleClusterClick = (cluster: PrecinctCluster) => {
    onSelectCluster(cluster.id);
    if (cluster.id === 'all') {
      onSetVisibleStreets(new Set(CADASTRAL_STREETS.map(s => s.name)));
    } else {
      onSetVisibleStreets(new Set(cluster.streets));
    }
  };

  return (
    <div ref={panelRef} className="relative z-20 pointer-events-auto">
      {/* Trigger Button */}
      <button
        id="btn-cadastral-street-filter"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 shadow-lg transition-all ${
          isFilteringActive
            ? 'bg-cyan-950/90 border-cyan-400/80 text-cyan-200 ring-1 ring-cyan-500/50'
            : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
        }`}
        title="Toggle Street-Level Cadastral Filters"
      >
        <Filter className={`w-3.5 h-3.5 ${isFilteringActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
        <span>
          {isFilteringActive 
            ? `Filtered: ${visibleStreets.size}/${CADASTRAL_STREETS.length} Streets` 
            : 'Street & Cluster Filter'}
        </span>
        {isFilteringActive && (
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
        )}
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Popover Dropdown Panel */}
      {isOpen && (
        <div 
          id="cadastral-street-filter-panel"
          className="absolute top-10 left-0 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl p-4 text-slate-200 z-50 space-y-3.5 animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/30 rounded-lg text-cyan-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Cadastral Street Visibility</h4>
                <p className="text-[10px] text-slate-400">Toggle streets or clusters to reduce map clutter</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Precinct Cluster Presets */}
          <div>
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Precinct Clusters</span>
              <span className="text-[10px] font-normal text-cyan-400">Quick isolate</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRECINCT_CLUSTERS.map((cluster) => {
                const isClusterActive = activeClusterId === cluster.id;
                return (
                  <button
                    key={cluster.id}
                    id={`cluster-preset-${cluster.id}`}
                    onClick={() => handleClusterClick(cluster)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      isClusterActive
                        ? 'bg-cyan-950 border-cyan-500/80 text-cyan-200 shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{cluster.shortName}</span>
                      {isClusterActive && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Individual Street Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Individual Streets ({visibleStreets.size}/{CADASTRAL_STREETS.length})
              </span>
              <div className="flex items-center gap-2 text-[10px]">
                <button
                  onClick={handleSelectAll}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-slate-300 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {CADASTRAL_STREETS.map((street) => {
                const isVisible = visibleStreets.has(street.name);
                const count = streetCounts[street.name] || 0;

                return (
                  <button
                    key={street.id}
                    id={`toggle-street-${street.id.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => onToggleStreet(street.name)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[11px] transition-all ${
                      isVisible
                        ? 'bg-slate-800/90 border-slate-600 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: isVisible ? street.color : '#64748b' }}
                      />
                      <span className="truncate font-medium">{street.shortName}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {count > 0 && (
                        <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                          isVisible ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      )}
                      {isVisible ? (
                        <CheckSquare className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <Square className="w-3 h-3 text-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Layer Detail & Clutter Controls */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Density & Layers
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              {/* Surrounding unregistered parcels */}
              <label className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-md cursor-pointer hover:border-slate-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={showSurroundingParcels}
                  onChange={(e) => onToggleSurroundingParcels(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-0 w-3 h-3"
                />
                <span className="text-slate-300">Surrounding Erven</span>
              </label>

              {/* House Number badges on map */}
              <label className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-md cursor-pointer hover:border-slate-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={showHouseNumbers}
                  onChange={(e) => onToggleHouseNumbers(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-0 w-3 h-3"
                />
                <span className="text-slate-300">House Badges</span>
              </label>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => onSetCategoryFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-cyan-300 text-[11px] font-semibold px-2 py-1 rounded-md focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                <option value="FREEHOLD">Freehold Only</option>
                <option value="SECTIONAL">Sectional Title Only</option>
              </select>
            </div>
          </div>

          {/* Footer Reset & Stats */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Showing {visibleStreets.size} of {CADASTRAL_STREETS.length} streets
            </span>
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
