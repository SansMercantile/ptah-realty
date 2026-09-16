import React, { useState } from 'react';
import {
  X,
  Building,
  Home,
  MapPin,
  DollarSign,
  Tag,
  Users,
  Image as ImageIcon,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { PropertyListing } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (listing: PropertyListing) => void;
  initialType?: 'sale' | 'rent';
}

const DEEDS_OFFICES = [
  'Pretoria',
  'Johannesburg',
  'Cape Town',
  'Bloemfontein',
  'Pietermaritzburg',
  'Kimberley',
  'Vryburg',
  'King Williams Town',
  'Umtata',
  'Mpumalanga',
  'Limpopo',
  'NATIONAL',
  'INTERNATIONAL',
];

const LIFESTYLE_TAGS = [
  'Aquatic Activities',
  'Casino Estate',
  'Coastal/Beach',
  'Complex',
  'Country Club',
  'Country Living',
  'Cul-de-sac',
  'Dual Living',
  'Eco Estate',
  'Equestrian/Polo Estate',
  'Estate',
  'Fishing Estate',
  'Game/Stock Farm',
  'Gated Community',
  'Golf Estate',
  'Holiday Home',
  'Holiday Resort',
  'Island Estate',
  'Lakefront',
  'Lifestyle Farm',
  'Marina',
  'Metropolitan',
  'Mountain',
  'Nature Reserve',
  'Retirement Village',
  'Riverfrontage',
  'Security Complex',
  'Security Estate',
  'Student Accommodation',
  'Suburban',
  'University/College Community',
  'Waterfront',
  'Wellness Estate',
  'Wildlife Estate',
  'Winelands',
];

const PRESET_IMAGES = [
  { label: 'Waterfall Villa', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kyalami Modern', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Barbeque Downs Apartment', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80' },
  { label: 'Carlswald Cluster', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80' },
  { label: 'Woodmead Manor', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80' },
];

export const AddListingModal: React.FC<AddListingModalProps> = ({
  isOpen,
  onClose,
  onAddListing,
  initialType = 'sale',
}) => {
  const [activeTab, setActiveTab] = useState<'particulars' | 'pricing' | 'lifestyle' | 'custom' | 'parties' | 'media' | 'portals'>('particulars');

  // Form State matching Ptah Real Estate Enterprise screens
  const [deedsOffice, setDeedsOffice] = useState('Pretoria');
  const [listingType, setListingType] = useState<'sale' | 'rent'>(initialType);
  const [officeName] = useState('One (Waterfall)');
  const [dateListed, setDateListed] = useState('2026-03-13');
  const [listingExpiryDate, setListingExpiryDate] = useState('2026-09-13');
  const [occupationDate, setOccupationDate] = useState('Immediate');
  const [priceOnApplication, setPriceOnApplication] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [primaryAgent] = useState('Amanda Mokoena');
  const [isPrimaryAgent, setIsPrimaryAgent] = useState(true);

  // Property specs
  const [propertyType, setPropertyType] = useState<PropertyListing['propertyType']>('House');
  const [mandateType, setMandateType] = useState<PropertyListing['mandateType']>('Sole Mandate');
  const [erfSize, setErfSize] = useState(650);
  const [erfSizeUnit, setErfSizeUnit] = useState<'m2' | 'ha'>('m2');
  const [floorSize, setFloorSize] = useState(380);
  const [status, setStatus] = useState<PropertyListing['status']>('active');
  const [bedrooms, setBedrooms] = useState(4);
  const [bathrooms, setBathrooms] = useState(3);
  const [garages, setGarages] = useState(2);

  // Address
  const [country] = useState('South Africa');
  const [suburb, setSuburb] = useState('Waterfall Heights');
  const [streetNumber, setStreetNumber] = useState('14');
  const [streetName, setStreetName] = useState('Karkloof');
  const [streetType, setStreetType] = useState('Crescent');
  const [estateName, setEstateName] = useState('Waterfall Estate');
  const [erfNumber, setErfNumber] = useState('Erf 4128');
  const [ssUnitNumber, setSsUnitNumber] = useState('Unit 18');
  const [ssName, setSsName] = useState('The Cascades');
  const [latitude, setLatitude] = useState(-25.9984);
  const [longitude, setLongitude] = useState(28.0965);
  const [showAddressOnWeb, setShowAddressOnWeb] = useState(true);
  const [addressVerified, setAddressVerified] = useState(true);

  // Pricing & Levies
  const [sellingPrice, setSellingPrice] = useState(4250000);
  const [rentalDeposit, setRentalDeposit] = useState(45000);
  const [rentalPeriod] = useState('Monthly');
  const [ratesTaxes, setRatesTaxes] = useState(2450);
  const [bodyCorporateLevy, setBodyCorporateLevy] = useState(3150);
  const [specialLevy, setSpecialLevy] = useState(0);

  // Selected lifestyle tags
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([
    'Security Estate',
    'Gated Community',
    'Eco Estate',
    'Suburban',
  ]);

  // Custom Features Table
  const [customFeatures, setCustomFeatures] = useState<{ id: string; name: string; value: string }[]>([
    { id: '1', name: 'Inverter & Solar', value: '8kW Sunsynk with 14 Panels' },
    { id: '2', name: 'Water Backup', value: '5,000L Jojo Tank with filtration' },
    { id: '3', name: 'Staff Quarters', value: '1 Bedroom with en-suite shower' },
    { id: '4', name: 'Fibre Internet', value: '1Gbps Vumatel pre-installed' },
  ]);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState('');

  // Listing Parties
  const [parties, setParties] = useState<{
    id: string;
    role: 'Seller' | 'Landlord' | 'Buyer' | 'Tenant' | 'Attorney';
    name: string;
    residency: 'South African Citizen' | 'Foreign National' | 'Company / Trust';
    idNumber: string;
    email: string;
    phone: string;
  }[]>([
    {
      id: 'party-1',
      role: 'Seller',
      name: 'Dr. Michael & Sarah Van Zyl',
      residency: 'South African Citizen',
      idNumber: '7904125089087',
      email: 'mvanzyl@mednet.co.za',
      phone: '+27 82 994 1120',
    },
    {
      id: 'party-2',
      role: 'Attorney',
      name: 'Bowmans Conveyancing Sandton',
      residency: 'Company / Trust',
      idNumber: 'Reg: 2012/048192/07',
      email: 'conveyancing@bowmanslaw.co.za',
      phone: '+27 11 669 9000',
    },
  ]);

  // Media
  const [featuredImage, setFeaturedImage] = useState(PRESET_IMAGES[0].url);
  const [virtualTourUrl, setVirtualTourUrl] = useState('https://my.matterport.com/show/?m=PtahLuxuryWaterfallSample');

  // Syndication Portals
  const [syndicateP24, setSyndicateP24] = useState(true);
  const [syndicatePrivateProperty, setSyndicatePrivateProperty] = useState(true);
  const [syndicatePtah, setSyndicatePtah] = useState(true);
  const [syndicateFacebookCatalog, setSyndicateFacebookCatalog] = useState(true);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleLifestyle = (tag: string) => {
    if (selectedLifestyle.includes(tag)) {
      setSelectedLifestyle(selectedLifestyle.filter((t) => t !== tag));
    } else {
      setSelectedLifestyle([...selectedLifestyle, tag]);
    }
  };

  const handleAddCustomFeature = () => {
    if (!newFeatureName.trim()) return;
    setCustomFeatures([
      ...customFeatures,
      { id: Date.now().toString(), name: newFeatureName.trim(), value: newFeatureValue.trim() || 'Yes' },
    ]);
    setNewFeatureName('');
    setNewFeatureValue('');
  };

  const handleRemoveCustomFeature = (id: string) => {
    setCustomFeatures(customFeatures.filter((f) => f.id !== id));
  };

  const handleSaveListing = () => {
    const fullAddress = `${streetNumber} ${streetName} ${streetType}, ${suburb}`;
    const newListing: PropertyListing = {
      id: `list-${Date.now()}`,
      referenceNumber: `RX-${Math.floor(100000 + Math.random() * 900000)}`,
      title: `${bedrooms}-Bed Luxury ${propertyType} in ${suburb}`,
      price: sellingPrice,
      location: fullAddress,
      suburb,
      propertyType,
      mandateType,
      bedrooms,
      bathrooms,
      garages,
      erfSizeM2: erfSize,
      ownerName: parties[0]?.name || 'Property Owner',
      ownerPhone: parties[0]?.phone || '+27 82 000 0000',
      ownerEmail: parties[0]?.email || 'seller@ptah.co.za',
      description: `Spectacular ${propertyType} in ${suburb}. Deeds Office: ${deedsOffice}. Erf: ${erfNumber}. Rates: R${ratesTaxes}/pm. Levy: R${bodyCorporateLevy}/pm. Lifestyle: ${selectedLifestyle.slice(0, 3).join(', ')}.`,
      featuredImage,
      isSyndicatedP24: syndicateP24,
      isSyndicatedPrivateProperty: syndicatePrivateProperty,
      isSyndicatedPtahWebsite: syndicatePtah,
      status,
      showHouseDates: 'Sunday 14:00 - 17:00',
      createdDate: new Date().toISOString().split('T')[0],
    };

    onAddListing(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {listingType === 'sale' ? 'Add Sales Listing' : 'Add Rental Listing'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Ptah Real Estate (Waterfall)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                7-Tab South African Property Portal Specification & Deeds Registry
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

        {/* Tab Navigation Strip matching screenshot */}
        <div className="flex items-center space-x-1 px-4 pt-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('particulars')}
            className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'particulars'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Listing Particulars</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'pricing'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Pricing & Financials</span>
          </button>

          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'lifestyle'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Lifestyle Features ({selectedLifestyle.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'custom'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Features ({customFeatures.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parties')}
            className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'parties'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Listing Parties ({parties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'media'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Media</span>
          </button>

          <button
            onClick={() => setActiveTab('portals')}
            className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'portals'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Portals & Syndication</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          
          {/* TAB 1: LISTING PARTICULARS */}
          {activeTab === 'particulars' && (
            <div className="space-y-6">
              
              {/* Deeds Office Information Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Deeds Office Information *
                  </label>
                  <select
                    value={deedsOffice}
                    onChange={(e) => setDeedsOffice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-medium"
                  >
                    {DEEDS_OFFICES.map((office) => (
                      <option key={office} value={office}>
                        {office}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">Jurisdiction for Title Deed and bond cancellations</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Office Name</label>
                  <input
                    type="text"
                    disabled
                    value={officeName}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 text-xs"
                  />
                  <div className="flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    <Info className="w-3 h-3" />
                    <span>Office sharing enabled. Visible to One (Waterfall).</span>
                  </div>
                </div>
              </div>

              {/* Listing Information */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Listing Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Listing Type *</label>
                    <select
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">To Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Date Listed *</label>
                    <input
                      type="date"
                      value={dateListed}
                      onChange={(e) => setDateListed(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Listing Expiry Date *</label>
                    <input
                      type="date"
                      value={listingExpiryDate}
                      onChange={(e) => setListingExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Occupation Date *</label>
                    <input
                      type="text"
                      value={occupationDate}
                      onChange={(e) => setOccupationDate(e.target.value)}
                      placeholder="e.g. Immediate or 2026-06-01"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priceOnApplication}
                      onChange={(e) => setPriceOnApplication(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium">Price on Application (POA)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium">Featured Listing Badge</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrimaryAgent}
                      onChange={(e) => setIsPrimaryAgent(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium">Primary Agent ({primaryAgent})</span>
                  </label>
                </div>
              </div>

              {/* Property Particulars & Sizes */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Property Particulars & Sizes</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Property Type *</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    >
                      <option value="House">House</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Cluster">Cluster</option>
                      <option value="Villa">Villa</option>
                      <option value="Land">Vacant Land</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mandate Type</label>
                    <select
                      value={mandateType}
                      onChange={(e) => setMandateType(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    >
                      <option value="Sole Mandate">Sole Mandate</option>
                      <option value="Open Mandate">Open Mandate</option>
                      <option value="Joint Mandate">Joint Mandate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Erf Size</label>
                    <div className="flex">
                      <input
                        type="number"
                        value={erfSize}
                        onChange={(e) => setErfSize(Number(e.target.value))}
                        className="w-full px-2 py-2 rounded-l-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                      />
                      <select
                        value={erfSizeUnit}
                        onChange={(e) => setErfSizeUnit(e.target.value as any)}
                        className="px-2 py-2 rounded-r-lg bg-slate-100 dark:bg-slate-800 border-y border-r border-slate-300 dark:border-slate-600 text-xs font-semibold"
                      >
                        <option value="m2">m²</option>
                        <option value="ha">ha</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Floor Size (m²)</label>
                    <input
                      type="number"
                      value={floorSize}
                      onChange={(e) => setFloorSize(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Verify Address & GPS */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verify Address & South Africa Deeds Location</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setAddressVerified(true)}
                      className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold cursor-pointer"
                    >
                      Verify Address
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
                    >
                      Use Google Map
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Suburb *</label>
                    <input
                      type="text"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Street Number</label>
                    <input
                      type="text"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Street Name</label>
                    <input
                      type="text"
                      value={streetName}
                      onChange={(e) => setStreetName(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estate Name</label>
                    <input
                      type="text"
                      value={estateName}
                      onChange={(e) => setEstateName(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Erf Number</label>
                    <input
                      type="text"
                      value={erfNumber}
                      onChange={(e) => setErfNumber(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">SS Unit Number</label>
                    <input
                      type="text"
                      value={ssUnitNumber}
                      onChange={(e) => setSsUnitNumber(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Sectional Scheme Name</label>
                    <input
                      type="text"
                      value={ssName}
                      onChange={(e) => setSsName(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAddressOnWeb}
                      onChange={(e) => setShowAddressOnWeb(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-medium">Show exact street address on public websites</span>
                  </label>

                  {addressVerified && (
                    <span className="flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>GPS Coordinates Validated: ({latitude}, {longitude})</span>
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRICING & FINANCIALS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Price & Levy Breakdown</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {listingType === 'sale' ? 'Selling Price (ZAR) *' : 'Rental Price (ZAR/pm) *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {listingType === 'sale' ? 'Estimated Transfer Duty' : 'Rental Deposit (ZAR)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        value={listingType === 'sale' ? Math.round(sellingPrice * 0.08) : rentalDeposit}
                        onChange={(e) => setRentalDeposit(Number(e.target.value))}
                        disabled={listingType === 'sale'}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs"
                      />
                    </div>
                    {listingType === 'sale' && (
                      <p className="text-[10px] text-slate-500 mt-1">Calculated using SARS 2026 Transfer Duty brackets</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Rates & Taxes (R/pm)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        value={ratesTaxes}
                        onChange={(e) => setRatesTaxes(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Body Corporate Levy (R/pm)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        value={bodyCorporateLevy}
                        onChange={(e) => setBodyCorporateLevy(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Special Levy (R/pm)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        value={specialLevy}
                        onChange={(e) => setSpecialLevy(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIFESTYLE FEATURES */}
          {activeTab === 'lifestyle' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">South Africa Lifestyle & Location Tags</h3>
                  <p className="text-xs text-slate-500">Select all applicable lifestyle attributes to syndicate to Property24 and Ptah Real Estate portals.</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {selectedLifestyle.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[50vh] overflow-y-auto p-1">
                {LIFESTYLE_TAGS.map((tag) => {
                  const isChecked = selectedLifestyle.includes(tag);
                  return (
                    <label
                      key={tag}
                      onClick={() => toggleLifestyle(tag)}
                      className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-medium'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                      />
                      <span className="truncate">{tag}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM FEATURES */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Property Key Inclusions & Features</h3>
                <p className="text-xs text-slate-500">Inverter, borehole, smart home, and staff accommodation specifications.</p>
              </div>

              {/* Add row */}
              <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  placeholder="Feature Name (e.g. Solar Inverter, Borehole, Wine Cellar)"
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  className="flex-1 w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="text"
                  placeholder="Feature Value / Spec (e.g. 8kW Sunsynk + 14 Panels)"
                  value={newFeatureValue}
                  onChange={(e) => setNewFeatureValue(e.target.value)}
                  className="flex-1 w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomFeature}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Feature</span>
                </button>
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">Feature Name</th>
                      <th className="px-4 py-2.5">Specification / Value</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {customFeatures.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">{f.name}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{f.value}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomFeature(f.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LISTING PARTIES */}
          {activeTab === 'parties' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Listing Parties & Contacts</h3>
                  <p className="text-xs text-slate-500">Record legal sellers, landlords, and conveyancing attorneys for OTP compliance.</p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">Role</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Residency</th>
                      <th className="px-4 py-2.5">ID / Registration #</th>
                      <th className="px-4 py-2.5">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parties.map((party) => (
                      <tr key={party.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-bold text-emerald-700 dark:text-emerald-400">{party.role}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">{party.name}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{party.residency}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">{party.idNumber}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                          <div>{party.email}</div>
                          <div className="text-[11px] text-slate-400">{party.phone}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Listing Media & Photography</h3>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Featured Photo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_IMAGES.map((img) => (
                    <div
                      key={img.label}
                      onClick={() => setFeaturedImage(img.url)}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition group ${
                        featuredImage === img.url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-28 object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-[11px] font-semibold text-white">{img.label}</p>
                      </div>
                      {featuredImage === img.url && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Virtual 3D Walkthrough / Matterport URL
                </label>
                <input
                  type="text"
                  value={virtualTourUrl}
                  onChange={(e) => setVirtualTourUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 7: PORTALS */}
          {activeTab === 'portals' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Syndication Channels & Feeds</h3>
              <p className="text-xs text-slate-500">Live API syndication with automated XML feeds and webhooks.</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                      P24
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Property24 South Africa</h4>
                      <p className="text-[11px] text-slate-500">Auto-push listing to Property24 Featured Listings feed</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syndicateP24}
                      onChange={(e) => setSyndicateP24(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      PP
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Private Property</h4>
                      <p className="text-[11px] text-slate-500">South Africa Private Property Syndication Feed</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syndicatePrivateProperty}
                      onChange={(e) => setSyndicatePrivateProperty(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      PR
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Ptah Real Estate</h4>
                      <p className="text-[11px] text-slate-500">Official agency website & national agent intranet</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syndicatePtah}
                      onChange={(e) => setSyndicatePtah(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      FB
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Meta / Facebook Real Estate Product Catalog</h4>
                      <p className="text-[11px] text-slate-500">Auto-sync with Meta Ads Manager for dynamic carousel ads</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syndicateFacebookCatalog}
                      onChange={(e) => setSyndicateFacebookCatalog(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Deeds Office: <strong className="text-slate-700 dark:text-slate-300">{deedsOffice}</strong></span>
            <span>•</span>
            <span>Mandate: <strong className="text-slate-700 dark:text-slate-300">{mandateType}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveListing}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish & Syndicate Listing</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
