import React, { useState, useEffect } from 'react';
import {
  X,
  Home,
  Plus,
  Building2,
  MapPin,
  CheckCircle2,
  Calendar,
  Eye,
  Share2,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  ExternalLink,
  Smartphone,
  Check,
  Flame,
  Radio,
  Tag
} from 'lucide-react';
import { PropertyListing, Lead } from '../types';
import { formatCurrency } from '../utils/formatters';

interface QuickListingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: PropertyListing[];
  onAddListing: (listing: PropertyListing) => void;
  onUpdateListing: (listing: PropertyListing) => void;
  leads: Lead[];
  onStartShowHouseForProperty?: (property: PropertyListing) => void;
}

const PRESET_IMAGES = [
  { label: 'Atlantic Villa', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sandton Penthouse', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80' },
  { label: 'Franschhoek Manor', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80' },
  { label: 'Bantry Modern', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80' },
  { label: 'Botanical Estate', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pretoria Ridge', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80' },
];

export const QuickListingsModal: React.FC<QuickListingsModalProps> = ({
  isOpen,
  onClose,
  listings,
  onAddListing,
  onUpdateListing,
  leads,
  onStartShowHouseForProperty,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [activeTab, setActiveTab] = useState<'inventory' | 'create'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'show_house' | 'under_offer' | 'sold'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for creating a new listing
  const [formData, setFormData] = useState({
    title: '',
    price: 18500000,
    location: '',
    suburb: 'Clifton',
    propertyType: 'House' as PropertyListing['propertyType'],
    mandateType: 'Sole Mandate' as PropertyListing['mandateType'],
    bedrooms: 4,
    bathrooms: 4,
    garages: 2,
    erfSizeM2: 850,
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    description: '',
    featuredImage: PRESET_IMAGES[0].url,
    isSyndicatedP24: true,
    isSyndicatedPrivateProperty: true,
    isSyndicatedPtahWebsite: true,
    status: 'active' as PropertyListing['status'],
    showHouseDates: 'Sunday 14:00 - 17:00',
  });

  if (!isOpen) return null;

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ownerName && item.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newListing: PropertyListing = {
      id: `prop-${Date.now()}`,
      referenceNumber: `PTR-${Math.floor(100000 + Math.random() * 900000)}`,
      title: formData.title,
      price: Number(formData.price),
      location: formData.location || `${formData.suburb}, South Africa`,
      suburb: formData.suburb,
      propertyType: formData.propertyType,
      status: formData.status,
      mandateType: formData.mandateType,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      garages: Number(formData.garages),
      erfSizeM2: Number(formData.erfSizeM2),
      ownerName: formData.ownerName || 'Direct Ptah Exclusive',
      ownerPhone: formData.ownerPhone || '+27 82 555 0192',
      ownerEmail: formData.ownerEmail || 'privjapan@gmail.com',
      assignedAgentName: 'privjapan (Senior Principal)',
      isSyndicatedP24: formData.isSyndicatedP24,
      isSyndicatedPrivateProperty: formData.isSyndicatedPrivateProperty,
      isSyndicatedPtahWebsite: formData.isSyndicatedPtahWebsite,
      featuredImage: formData.featuredImage,
      description: formData.description || 'Exclusive luxury residence listed with Ptah Realty.',
      showHouseDates: formData.status === 'show_house' ? formData.showHouseDates : undefined,
      createdDate: new Date().toISOString(),
    };

    onAddListing(newListing);
    setActiveTab('inventory');
  };

  const handleCopyShareLink = (listing: PropertyListing) => {
    const url = `https://ptahrealty.com/listings/${listing.referenceNumber.toLowerCase()}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(listing.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOwnerSelect = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setFormData((prev) => ({
        ...prev,
        ownerName: lead.name,
        ownerPhone: lead.phone,
        ownerEmail: lead.email,
        title: prev.title || `${lead.propertyLocation || lead.name + ' Residence'}`,
        location: prev.location || lead.propertyLocation || '',
      }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-5xl bg-white dark:bg-black rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Quick Listings & Syndication Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {listings.length} Properties
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant portal distribution to Property24, Private Property & Ptah Web with Show House management.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher Tabs */}
            <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'inventory'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Inventory ({listings.length})
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'create'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Quick Listing</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {activeTab === 'inventory' ? (
            <div className="space-y-6">
              {/* Top Banner with Quick Listing card (Screenshot 1 visual motif) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Visual card matching Screenshot 1 */}
                <div className="relative rounded-2xl p-5 bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-slate-800 dark:to-black border border-sky-200 dark:border-slate-700 flex flex-col items-center text-center overflow-hidden">
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
                    {listings.filter((l) => l.status === 'active' || l.status === 'show_house').length}
                  </div>
                  <div className="w-24 h-24 mb-3 flex items-center justify-center">
                    <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-sm">
                      {/* House body */}
                      <polygon points="35,45 60,25 85,45" fill="#475569" />
                      <rect x="40" y="45" width="40" height="40" rx="3" fill="#334155" />
                      <rect x="53" y="62" width="14" height="23" rx="7" fill="#ffffff" />
                      {/* Windows */}
                      <rect x="44" y="50" width="8" height="8" rx="1" fill="#fef08a" />
                      <rect x="68" y="50" width="8" height="8" rx="1" fill="#fef08a" />
                      {/* Tree */}
                      <circle cx="20" cy="50" r="14" fill="#10b981" />
                      <rect x="18" y="55" width="4" height="25" fill="#78350f" />
                      {/* For sale sign */}
                      <rect x="94" y="50" width="22" height="13" rx="1.5" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
                      <text x="105" y="59" fontSize="4.5" fontWeight="bold" fill="#dc2626" textAnchor="middle">
                        FOR SALE
                      </text>
                      <line x1="105" y1="63" x2="105" y2="85" stroke="#475569" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    NEW LISTINGS
                  </span>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-2 px-5 py-1.5 rounded-full bg-slate-200/90 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-red-600 dark:text-red-400 font-bold text-xs transition cursor-pointer shadow-2xs"
                  >
                    QUICK LISTING
                  </button>
                </div>

                {/* Live Syndication Metrics */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Portfolio Value</span>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {formatCurrency(listings.reduce((acc, curr) => acc + curr.price, 0))}
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      Across {listings.length} properties
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Show Houses</span>
                    <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                      {listings.filter((l) => l.status === 'show_house').length} On Show
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Sunday open inspections
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between col-span-2 sm:col-span-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Syndication Status</span>
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Property24 Sync 100%</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Real-time webhook active
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, suburb, ref..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
                  {(['all', 'active', 'show_house', 'under_offer', 'sold'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer capitalize ${
                        statusFilter === st
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {st === 'show_house' ? 'On Show' : st === 'under_offer' ? 'Under Offer' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listings Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                  >
                    {/* Property Image & Badges */}
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={listing.featuredImage}
                        alt={listing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs">
                          {listing.mandateType}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          listing.status === 'show_house'
                            ? 'bg-cyan-500 text-white'
                            : listing.status === 'under_offer'
                            ? 'bg-amber-500 text-white'
                            : listing.status === 'sold'
                            ? 'bg-purple-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {listing.status === 'show_house' ? 'On Show' : listing.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-black/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {listing.referenceNumber}
                      </div>

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                        <div>
                          <div className="text-lg font-extrabold tracking-tight">
                            {formatCurrency(listing.price)}
                          </div>
                          <div className="text-[11px] text-slate-200 flex items-center space-x-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-emerald-400" />
                            <span className="truncate">{listing.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {listing.description}
                        </p>
                      </div>

                      {/* Property Specs */}
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 py-2 border-y border-slate-100 dark:border-slate-800">
                        <span className="flex items-center space-x-1" title="Bedrooms">
                          <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                          <span>{listing.bedrooms} Beds</span>
                        </span>
                        <span className="flex items-center space-x-1" title="Bathrooms">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span>{listing.bathrooms} Baths</span>
                        </span>
                        {listing.garages && (
                          <span className="flex items-center space-x-1" title="Garages">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                            <span>{listing.garages} Garages</span>
                          </span>
                        )}
                        {listing.erfSizeM2 && (
                          <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                            <span>{listing.erfSizeM2.toLocaleString()} m²</span>
                          </span>
                        )}
                      </div>

                      {/* Syndication Indicators & Actions */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Syndication:</span>
                          <div className="flex items-center space-x-1 font-mono">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                              listing.isSyndicatedP24 ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' : 'bg-slate-100 text-slate-400'
                            }`}>
                              P24
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                              listing.isSyndicatedPrivateProperty ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400' : 'bg-slate-100 text-slate-400'
                            }`}>
                              PP
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                              listing.isSyndicatedPtahWebsite ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' : 'bg-slate-100 text-slate-400'
                            }`}>
                              Web
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1.5 pt-1">
                          <button
                            onClick={() => handleCopyShareLink(listing)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1"
                            title="Copy Public Listing URL"
                          >
                            {copiedId === listing.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Share</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              const newStatus = listing.status === 'show_house' ? 'active' : 'show_house';
                              onUpdateListing({ ...listing, status: newStatus });
                              if (newStatus === 'show_house' && onStartShowHouseForProperty) {
                                onStartShowHouseForProperty(listing);
                              }
                            }}
                            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                              listing.status === 'show_house'
                                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                            title="Toggle Show House Status"
                          >
                            <Radio className={`w-3.5 h-3.5 ${listing.status === 'show_house' ? 'animate-pulse text-cyan-600' : ''}`} />
                            <span>{listing.status === 'show_house' ? 'On Show' : 'Show House'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* + New Quick Listing Form */
            <form onSubmit={handleCreateSubmit} className="space-y-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Property24 & Private Property Direct Gateway
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Listings created here are immediately formatted for instant XML feed and API syndication.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & Suburb */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. The Clifton Oceanview: 4-Bed Luxury Villa"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asking Price (ZAR) *
                  </label>
                  <input
                    type="number"
                    required
                    step={500000}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {formatCurrency(formData.price)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Suburb / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.suburb}
                    onChange={(e) => setFormData({ ...formData, suburb: e.target.value, location: `${e.target.value}, South Africa` })}
                    placeholder="e.g. Clifton, Camps Bay, Sandhurst"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Property Type & Mandate */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Property Type
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Villa">Villa</option>
                    <option value="House">House</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot / Land">Plot / Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mandate Type
                  </label>
                  <select
                    value={formData.mandateType}
                    onChange={(e) => setFormData({ ...formData, mandateType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Sole Mandate">Sole Mandate</option>
                    <option value="Dual Mandate">Dual Mandate</option>
                    <option value="Open Mandate">Open Mandate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Link to Existing Client / Seller */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Associate with Client / Seller from CRM
                </label>
                <select
                  onChange={(e) => handleOwnerSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose existing client or enter manual owner --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.phone}) - {l.propertyLocation || l.propertyTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Featured Property Visual
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, featuredImage: img.url })}
                      className={`relative rounded-xl overflow-hidden h-16 border-2 transition cursor-pointer ${
                        formData.featuredImage === img.url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 text-[9px] text-white text-center py-0.5 truncate px-1">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Syndication Channels */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Automated Multi-Portal Syndication Channels:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSyndicatedP24}
                      onChange={(e) => setFormData({ ...formData, isSyndicatedP24: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Property 24 API</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSyndicatedPrivateProperty}
                      onChange={(e) => setFormData({ ...formData, isSyndicatedPrivateProperty: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Private Property</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSyndicatedPtahWebsite}
                      onChange={(e) => setFormData({ ...formData, isSyndicatedPtahWebsite: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ptah Realty Web</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Quick Listing</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
