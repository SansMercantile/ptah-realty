import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Clock, 
  Building, 
  Navigation, 
  User, 
  CreditCard, 
  FileText, 
  MapPin, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { PropertyRecord } from '../../types';

interface PropertySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyRecord[];
  onSelectProperty: (property: PropertyRecord) => void;
}

type SearchCategory = 
  | 'Recently Viewed'
  | 'Erf / Farm'
  | 'Street Name'
  | 'Sectional Title'
  | 'Security Estate'
  | 'Owner Name'
  | 'Owner ID'
  | 'Title Deed'
  | 'GPS Coordinates';

export const PropertySearchModal: React.FC<PropertySearchModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSelectProperty
}) => {
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('Erf / Farm');
  const [searchQuery, setSearchQuery] = useState('');
  const [erfInput, setErfInput] = useState('');
  const [portionInput, setPortionInput] = useState('0');
  const [townshipInput, setTownshipInput] = useState('GREEN POINT');
  const [streetInput, setStreetInput] = useState('');
  const [streetNoInput, setStreetNoInput] = useState('');
  const [ownerInput, setOwnerInput] = useState('');
  const [idInput, setIdInput] = useState('');
  const [deedInput, setDeedInput] = useState('');
  const [gpsInput, setGpsInput] = useState('-33.90876, 18.401027');

  if (!isOpen) return null;

  // Filter properties based on current active category and inputs
  let matchedProperties = [...properties];

  if (activeCategory === 'Erf / Farm') {
    if (erfInput.trim()) {
      matchedProperties = matchedProperties.filter(p => p.erfNo.includes(erfInput.trim()));
    }
  } else if (activeCategory === 'Street Name') {
    if (streetInput.trim()) {
      matchedProperties = matchedProperties.filter(p => 
        p.address.toLowerCase().includes(streetInput.trim().toLowerCase())
      );
    }
  } else if (activeCategory === 'Owner Name') {
    if (ownerInput.trim()) {
      matchedProperties = matchedProperties.filter(p => 
        p.currentSale.owner.toLowerCase().includes(ownerInput.trim().toLowerCase())
      );
    }
  } else if (activeCategory === 'Owner ID') {
    if (idInput.trim()) {
      matchedProperties = matchedProperties.filter(p => 
        p.currentSale.ownersId.includes(idInput.trim())
      );
    }
  } else if (activeCategory === 'Title Deed') {
    if (deedInput.trim()) {
      matchedProperties = matchedProperties.filter(p => 
        p.currentSale.titleDeed.toLowerCase().includes(deedInput.trim().toLowerCase())
      );
    }
  } else if (activeCategory === 'Sectional Title') {
    matchedProperties = matchedProperties.filter(p => p.isSectionalTitle);
  }

  const handlePickProperty = (prop: PropertyRecord) => {
    onSelectProperty(prop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="property-search-modal"
        className="bg-white text-slate-800 w-full max-w-5xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-200" />
            <h2 className="font-bold text-sm tracking-tight">
              Property & Cadastre Search Engine
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-100 hover:text-white hover:bg-teal-700/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Navigation Criteria Tabs */}
          <div className="w-full md:w-56 bg-slate-50 p-2 border-r border-slate-200 flex flex-col gap-0.5 shrink-0 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
              Search Criteria
            </span>

            {[
              { id: 'Recently Viewed', label: 'Recently Viewed', icon: Clock },
              { id: 'Erf / Farm', label: 'Erf / Farm / Holding no', icon: Building },
              { id: 'Street Name', label: 'Street Name', icon: Navigation },
              { id: 'Sectional Title', label: 'Sectional Title scheme', icon: Building },
              { id: 'Owner Name', label: 'Owner Name', icon: User },
              { id: 'Owner ID', label: 'Owner ID / Reg no', icon: CreditCard },
              { id: 'Title Deed', label: 'Title Deed Number', icon: FileText },
              { id: 'GPS Coordinates', label: 'GPS Coordinates', icon: MapPin }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as SearchCategory)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all ${
                    activeCategory === tab.id
                      ? 'bg-[#006980] text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${activeCategory === tab.id ? 'text-cyan-200' : 'text-slate-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Input and Results Panel */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3">
            {/* Input Form based on Active Category */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2.5">
              <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Filter by {activeCategory}</span>
              </h3>

              {activeCategory === 'Erf / Farm' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Township / Allotment</label>
                    <input
                      type="text"
                      value={townshipInput}
                      onChange={(e) => setTownshipInput(e.target.value)}
                      placeholder="e.g. GREEN POINT"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:border-cyan-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Erf / Stand Number</label>
                    <input
                      type="text"
                      value={erfInput}
                      onChange={(e) => setErfInput(e.target.value)}
                      placeholder="e.g. 1681, 2093, 1797"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold text-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Portion Number</label>
                    <input
                      type="text"
                      value={portionInput}
                      onChange={(e) => setPortionInput(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:border-cyan-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeCategory === 'Street Name' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Street Name</label>
                    <input
                      type="text"
                      value={streetInput}
                      onChange={(e) => setStreetInput(e.target.value)}
                      placeholder="e.g. Richmond, Main, Law, St Bedes"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold text-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 text-[11px]">Street Number (Optional)</label>
                    <input
                      type="text"
                      value={streetNoInput}
                      onChange={(e) => setStreetNoInput(e.target.value)}
                      placeholder="e.g. 5, 219, 1"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:border-cyan-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeCategory === 'Owner Name' && (
                <div className="text-xs">
                  <label className="block text-slate-600 mb-1 text-[11px]">Owner Surname / Company Name</label>
                  <input
                    type="text"
                    value={ownerInput}
                    onChange={(e) => setOwnerInput(e.target.value)}
                    placeholder="e.g. PIER MANE, ALLEN, MULLER, S B G"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold text-cyan-900"
                  />
                </div>
              )}

              {activeCategory === 'Owner ID' && (
                <div className="text-xs">
                  <label className="block text-slate-600 mb-1 text-[11px]">South African 13-digit ID or CIPC Registration</label>
                  <input
                    type="text"
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    placeholder="e.g. 610427..., 1895/2007"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-mono font-bold text-cyan-900"
                  />
                </div>
              )}

              {activeCategory === 'Title Deed' && (
                <div className="text-xs">
                  <label className="block text-slate-600 mb-1 text-[11px]">Title Deed Number</label>
                  <input
                    type="text"
                    value={deedInput}
                    onChange={(e) => setDeedInput(e.target.value)}
                    placeholder="e.g. T78896/2007, T29887/2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-mono font-bold text-cyan-900"
                  />
                </div>
              )}

              {activeCategory === 'GPS Coordinates' && (
                <div className="text-xs">
                  <label className="block text-slate-600 mb-1 text-[11px]">Latitude, Longitude (Decimal or DMS)</label>
                  <input
                    type="text"
                    value={gpsInput}
                    onChange={(e) => setGpsInput(e.target.value)}
                    placeholder="-33.90876, 18.401027"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-mono font-bold text-cyan-900"
                  />
                </div>
              )}
            </div>

            {/* Matching Results List */}
            <div className="bg-white rounded border border-slate-300 overflow-hidden shadow-2xs">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Search Results ({matchedProperties.length} records found)
                </span>
                <span className="text-[11px] text-slate-500">Click row to focus Cadastre</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {matchedProperties.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No matching cadastral records found for this query.
                  </div>
                ) : (
                  matchedProperties.map(property => (
                    <div
                      key={property.id}
                      onClick={() => handlePickProperty(property)}
                      className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{property.address}</span>
                          <span className="bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-cyan-200">
                            Erf {property.erfNo}
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                            {property.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Owner: <strong className="text-slate-800">{property.currentSale.owner}</strong> • Extent: {property.extentM2} m² • Valuation: R {(property.municipalValuation.totalValue / 1000000).toFixed(1)}M
                        </div>
                      </div>

                      <button
                        className="px-2.5 py-1 bg-[#006980] hover:bg-teal-700 text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0 shadow-2xs"
                      >
                        <span>Select</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Official Deeds Office Cadastre Database</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
