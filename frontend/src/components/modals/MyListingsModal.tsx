import React, { useState } from 'react';
import {
  X,
  Building2,
  Plus,
  ArrowLeft,
  ArrowLeftCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Globe,
  Upload,
  FileText,
  FileCheck,
  DollarSign,
  User,
  Home,
  MapPin,
  Image as ImageIcon,
  Eye,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Trash2,
  ExternalLink,
  MessageCircle,
  Info,
  Check,
  Smartphone,
  Zap
} from 'lucide-react';
import { PropertyRecord } from '../../types';
import { PROPERTIES_DATA } from '../../services/mockData';
import { DealViewPipeline } from '../dealView/DealViewPipeline';
import { 
  DealStage, 
  ViewingAppointment, 
  OfferToPurchaseRecord, 
  AttorneyConveyancingRecord, 
  DeedsLodgementRecord 
} from '../../types/dealPipeline';
import {
  INITIAL_VIEWINGS,
  INITIAL_OTPS,
  INITIAL_CONVEYANCING,
  INITIAL_LODGEMENTS
} from '../../services/dealPipelineMockData';

interface MyListingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: PropertyRecord | null;
  onSelectProperty?: (property: PropertyRecord) => void;
  // Lifted to App.tsx so the Quick Listing shortcut (CRM header only, see
  // chat) can add to the same list from outside this modal's tree.
  listings: ListingDealRecord[];
  setListings: React.Dispatch<React.SetStateAction<ListingDealRecord[]>>;
  onOpenQuickListing?: () => void;
}

export interface ListingDealRecord {
  id: string;
  title: string;
  address: string;
  suburb: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  erfSize: number;
  sellerName: string;
  sellerId: string;
  sellerContact: string;
  sellerEmail: string;
  mandateType: 'Sole Mandate' | 'Open Mandate' | 'Joint Mandate';
  mandateStatus: 'Live on Portals' | 'Mandate Pending' | 'Under Offer' | 'Draft';
  commissionRate: number;
  photosCount: number;
  p24Synced: boolean;
  privatePropertySynced: boolean;
  views: number;
  enquiries: number;
  imageUrl: string;
}

export const INITIAL_MY_LISTINGS: ListingDealRecord[] = [
  {
    id: 'list-1',
    title: 'Contemporary Architectural Masterpiece',
    address: '5 Richmond Road',
    suburb: 'Three Anchor Bay',
    price: 12500000,
    bedrooms: 4,
    bathrooms: 4,
    erfSize: 495,
    sellerName: 'Stephan Fridolin Muller',
    sellerId: '6703065098084',
    sellerContact: '+27 82 491 8820',
    sellerEmail: 'stephan.muller@investcape.co.za',
    mandateType: 'Sole Mandate',
    mandateStatus: 'Live on Portals',
    commissionRate: 5.5,
    photosCount: 14,
    p24Synced: true,
    privatePropertySynced: true,
    views: 1420,
    enquiries: 18,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'list-2',
    title: 'Atlantic Coastal View Villa',
    address: '11 Mutley Road',
    suburb: 'Three Anchor Bay',
    price: 9800000,
    bedrooms: 3,
    bathrooms: 2,
    erfSize: 380,
    sellerName: 'Ronald Spencer Read',
    sellerId: '8303305103087',
    sellerContact: '+27 82 890 3863',
    sellerEmail: 'ron@lawrealestate.co.za',
    mandateType: 'Sole Mandate',
    mandateStatus: 'Live on Portals',
    commissionRate: 5.0,
    photosCount: 12,
    p24Synced: true,
    privatePropertySynced: false,
    views: 890,
    enquiries: 9,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'list-3',
    title: 'Luxury Sea Point Penthouse Suite',
    address: 'Suite 401, 76 Regent Road',
    suburb: 'Sea Point',
    price: 15900000,
    bedrooms: 3,
    bathrooms: 3,
    erfSize: 220,
    sellerName: 'Giovanni Yorick Bowman',
    sellerId: '9107015098089',
    sellerContact: '+27 71 884 9201',
    sellerEmail: 'giovanni@sbgrealestate.co.za',
    mandateType: 'Joint Mandate',
    mandateStatus: 'Mandate Pending',
    commissionRate: 6.0,
    photosCount: 18,
    p24Synced: false,
    privatePropertySynced: false,
    views: 310,
    enquiries: 4,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'list-4',
    title: 'Heritage Fresnaye Family Residence',
    address: '24 Avenue Bartholomew',
    suburb: 'Fresnaye',
    price: 24500000,
    bedrooms: 5,
    bathrooms: 5,
    erfSize: 760,
    sellerName: 'Eleanor Victoria Pier',
    sellerId: '6112040098083',
    sellerContact: '+27 83 221 4455',
    sellerEmail: 'eleanor.pier@gmail.com',
    mandateType: 'Sole Mandate',
    mandateStatus: 'Under Offer',
    commissionRate: 5.0,
    photosCount: 22,
    p24Synced: true,
    privatePropertySynced: true,
    views: 2840,
    enquiries: 32,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
  }
];

export const MyListingsModal: React.FC<MyListingsModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  onSelectProperty,
  listings,
  setListings,
  onOpenQuickListing
}) => {
  // Modal View: 'LISTINGS_GRID' or 'SYNDICATION_WIZARD'
  const [currentView, setCurrentView] = useState<'LISTINGS_GRID' | 'SYNDICATION_WIZARD'>('LISTINGS_GRID');
  
  // Deal View Pipeline State
  const [activeDealStage, setActiveDealStage] = useState<DealStage>('NEW_LISTINGS');
  const [viewings, setViewings] = useState<ViewingAppointment[]>(INITIAL_VIEWINGS);
  const [otps, setOtps] = useState<OfferToPurchaseRecord[]>(INITIAL_OTPS);
  const [conveyancing, setConveyancing] = useState<AttorneyConveyancingRecord[]>(INITIAL_CONVEYANCING);
  const [lodgements, setLodgements] = useState<DeedsLodgementRecord[]>(INITIAL_LODGEMENTS);

  // Listings state now lives in App.tsx (see MyListingsModalProps) so the
  // Quick Listing shortcut in the CRM header can add to it from outside
  // this modal's tree.
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Wizard Stepper (1: Deal Details, 2: Location, 3: Property Details, 4: Media, 5: Preview)
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Accordion open/collapse states in Step 1 (Deal Details)
  const [isSellerInfoOpen, setIsSellerInfoOpen] = useState(true);
  const [isMandateInfoOpen, setIsMandateInfoOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);

  // Form Fields - Step 1: Deal Details
  const [sellerName, setSellerName] = useState(selectedProperty?.currentSale?.owner || selectedProperty?.contacts?.representativeName || '');
  const [sellerAddress, setSellerAddress] = useState(selectedProperty?.address || '');
  const [sellerIdNumber, setSellerIdNumber] = useState(selectedProperty?.currentSale?.ownersId || '');
  const [sellerContact, setSellerContact] = useState(selectedProperty?.contacts?.primaryPhone || '+27 82 491 8820');
  const [sellerEmail, setSellerEmail] = useState(selectedProperty?.contacts?.email || 'seller@capeproperties.co.za');
  const [hasCoSeller, setHasCoSeller] = useState(false);
  const [coSellerName, setCoSellerName] = useState('');
  const [coSellerId, setCoSellerId] = useState('');

  // Uploaded documents in Step 1
  const [uploadedMandate, setUploadedMandate] = useState<string | null>('Sole_Mandate_Signed.pdf');
  const [uploadedBankStatement, setUploadedBankStatement] = useState<string | null>(null);
  const [uploadedIdDoc, setUploadedIdDoc] = useState<string | null>('RSA_Smart_ID_Muller.pdf');
  const [uploadedProofOfAddress, setUploadedProofOfAddress] = useState<string | null>('Rates_Taxes_City_CT.pdf');

  // Mandate Form Fields
  const [mandateType, setMandateType] = useState<'Sole Mandate' | 'Open Mandate' | 'Joint Mandate'>('Sole Mandate');
  const [mandateStartDate, setMandateStartDate] = useState('2026-08-01');
  const [mandateEndDate, setMandateEndDate] = useState('2026-11-30');
  const [listingPrice, setListingPrice] = useState(selectedProperty?.currentSale?.salePrice || selectedProperty?.property24Listing?.askingPrice || 12500000);
  const [commissionPercent, setCommissionPercent] = useState(5.5);

  // Form Fields - Step 2: Location
  const [propProvince, setPropProvince] = useState(selectedProperty?.province || 'WESTERN CAPE');
  const [propSuburb, setPropSuburb] = useState(selectedProperty?.suburb || 'THREE ANCHOR BAY');
  const [propStreet, setPropStreet] = useState(selectedProperty?.address || 'Richmond Road');
  const [propStreetNumber, setPropStreetNumber] = useState('5');
  const [propErf, setPropErf] = useState(selectedProperty?.erfNo || '1681');

  // Form Fields - Step 3: Property Details
  const [propBedrooms, setPropBedrooms] = useState(selectedProperty?.accommodation?.bedRooms || 4);
  const [propBathrooms, setPropBathrooms] = useState(selectedProperty?.accommodation?.bathRooms || 4);
  const [propErfSize, setPropErfSize] = useState(selectedProperty?.extentM2 || 495);
  const [propFloorSize, setPropFloorSize] = useState(selectedProperty?.accommodation?.buildingM2 || 380);
  const [propLevies, setPropLevies] = useState(0);
  const [propRates, setPropRates] = useState(selectedProperty?.municipalValuation?.ratesEstimateMonthly || 4250);
  const [propType, setPropType] = useState(selectedProperty?.accommodation?.type || 'Freestanding House');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Swimming Pool',
    'Sea Views',
    'Double Garage',
    'Solar & Inverter Battery',
    '24/7 Security Alarm'
  ]);

  // Form Fields - Step 4: Media
  const [listingHeadline, setListingHeadline] = useState(
    'Contemporary Architectural Masterpiece with Panoramic Atlantic Ocean Views'
  );
  const [listingDescription, setListingDescription] = useState(
    'Positioned in the prime Atlantic Seaboard enclave of Three Anchor Bay, this immaculate residence offers four en-suite bedrooms, bespoke Italian designer kitchen, infinity pool deck, state-of-the-art security, and full off-grid solar power.'
  );
  const [virtualTourUrl, setVirtualTourUrl] = useState('https://my.matterport.com/show/?m=example3d');
  const [videoUrl, setVideoUrl] = useState('https://youtube.com/watch?v=preview');

  // Form Fields - Step 5: Portals & Publishing
  const [syncProperty24, setSyncProperty24] = useState(true);
  const [syncPrivateProperty, setSyncPrivateProperty] = useState(true);
  const [syncIol, setSyncIol] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter listings
  const filteredListings = listings.filter(item => {
    const matchesSearch =
      item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'LIVE') return matchesSearch && item.mandateStatus === 'Live on Portals';
    if (statusFilter === 'PENDING') return matchesSearch && item.mandateStatus === 'Mandate Pending';
    if (statusFilter === 'OFFER') return matchesSearch && item.mandateStatus === 'Under Offer';
    return matchesSearch;
  });

  const handleStartNewSyndication = (existingRecord?: ListingDealRecord) => {
    if (existingRecord) {
      setSellerName(existingRecord.sellerName);
      setSellerAddress(existingRecord.address);
      setSellerIdNumber(existingRecord.sellerId);
      setSellerContact(existingRecord.sellerContact);
      setSellerEmail(existingRecord.sellerEmail);
      setListingPrice(existingRecord.price);
      setMandateType(existingRecord.mandateType);
      setPropSuburb(existingRecord.suburb);
      setPropBedrooms(existingRecord.bedrooms);
      setPropBathrooms(existingRecord.bathrooms);
      setPropErfSize(existingRecord.erfSize);
    }
    setWizardStep(1);
    setPublishSuccess(false);
    setCurrentView('SYNDICATION_WIZARD');
  };

  const handleSaveAndSyndicate = () => {
    setIsPublishing(true);
    setTimeout(() => {
      const newListing: ListingDealRecord = {
        id: `list-${Date.now()}`,
        title: listingHeadline,
        address: `${propStreetNumber} ${propStreet}`,
        suburb: propSuburb,
        price: listingPrice,
        bedrooms: propBedrooms,
        bathrooms: propBathrooms,
        erfSize: propErfSize,
        sellerName: sellerName || 'Client Seller',
        sellerId: sellerIdNumber || '8303305103087',
        sellerContact: sellerContact || '+27 82 491 8820',
        sellerEmail: sellerEmail || 'seller@mail.co.za',
        mandateType: mandateType,
        mandateStatus: 'Live on Portals',
        commissionRate: commissionPercent,
        photosCount: 16,
        p24Synced: syncProperty24,
        privatePropertySynced: syncPrivateProperty,
        views: 1,
        enquiries: 0,
        imageUrl: selectedProperty?.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      };

      setListings(prev => [newListing, ...prev]);
      setIsPublishing(false);
      setPublishSuccess(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-300 relative">
        
        {/* ========================================================================= */}
        {/* VIEW 1: MY LISTINGS PORTFOLIO DASHBOARD */}
        {/* ========================================================================= */}
        {currentView === 'LISTINGS_GRID' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header Bar */}
            <div className="bg-[#006980] text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-cyan-700/50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <span>My Listings & Mandates</span>
                    <span className="bg-cyan-900/90 text-cyan-200 text-xs px-2 py-0.5 rounded font-mono font-normal">
                      {listings.length} Properties
                    </span>
                  </h2>
                  <p className="text-[11px] text-cyan-200/80">
                    Manage agency mandates, syndication pipelines to Property24 & Private Property, and deal documents.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-create-new-listing"
                  onClick={() => handleStartNewSyndication()}
                  className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Listing Syndication</span>
                </button>
                <button
                  onClick={onClose}
                  className="text-cyan-200 hover:text-white p-1 rounded hover:bg-cyan-700/50"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Deal View Pipeline Section (Matching Exact Screenshot) */}
            <DealViewPipeline
              listings={listings}
              activeStage={activeDealStage}
              onSelectStage={setActiveDealStage}
              onQuickListingClick={onOpenQuickListing}
              onStartFullSyndication={() => handleStartNewSyndication()}
              viewings={viewings}
              onAddViewing={(v) => setViewings(prev => [v, ...prev])}
              otps={otps}
              onAddOtp={(o) => setOtps(prev => [o, ...prev])}
              conveyancing={conveyancing}
              lodgements={lodgements}
              onUpdateLodgementStep={(id, step) => {
                setLodgements(prev => prev.map(item => item.id === id ? { ...item, currentStep: step } : item));
              }}
            />

            {/* If Stage 1 (New Listings) is active, show the listings portfolio grid and filters */}
            {activeDealStage === 'NEW_LISTINGS' && (
              <>
                {/* Quick Metrics Bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Active Portfolio Value</span>
                    <strong className="text-slate-900 text-sm font-mono">
                      R {(listings.reduce((acc, l) => acc + l.price, 0)).toLocaleString()}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Live on Portals</span>
                    <strong className="text-emerald-700 text-sm font-mono">
                      {listings.filter(l => l.mandateStatus === 'Live on Portals').length} Listings
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Buyer Enquiries</span>
                    <strong className="text-cyan-800 text-sm font-mono">
                      {listings.reduce((acc, l) => acc + l.enquiries, 0)} Leads
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Estimated Agency Comm</span>
                    <strong className="text-amber-800 text-sm font-mono">
                      R {Math.round(listings.reduce((acc, l) => acc + (l.price * (l.commissionRate / 100)), 0)).toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search listings by address, seller, suburb..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    <span className="text-xs text-slate-500 font-medium shrink-0">Filter Status:</span>
                    {(['ALL', 'LIVE', 'PENDING', 'OFFER'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                          statusFilter === tab
                            ? 'bg-cyan-800 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab === 'ALL' && 'All Listings'}
                        {tab === 'LIVE' && 'Live Portals'}
                        {tab === 'PENDING' && 'Pending Mandate'}
                        {tab === 'OFFER' && 'Under Offer'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listings Grid / Table */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:border-cyan-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Image & Badges */}
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
                            item.mandateStatus === 'Live on Portals'
                              ? 'bg-emerald-600 text-white'
                              : item.mandateStatus === 'Under Offer'
                              ? 'bg-amber-600 text-white'
                              : 'bg-cyan-700 text-white'
                          }`}>
                            {item.mandateStatus}
                          </span>
                          <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded border border-white/20">
                            {item.mandateType}
                          </span>
                        </div>

                        {/* Portal Sync Indicators */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          {item.p24Synced && (
                            <span className="bg-[#e30613] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs" title="Synced with Property24">
                              P24
                            </span>
                          )}
                          {item.privatePropertySynced && (
                            <span className="bg-[#0082c9] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs" title="Synced with Private Property">
                              PP
                            </span>
                          )}
                        </div>

                        {/* Bottom Info on Image */}
                        <div className="absolute bottom-2 left-3 right-3 text-white">
                          <div className="text-base font-bold font-mono">
                            R {item.price.toLocaleString()}
                          </div>
                          <div className="text-xs font-semibold truncate text-slate-100">
                            {item.address}, {item.suburb}
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-3.5 space-y-2.5 text-xs text-slate-700">
                        <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded border border-slate-100 text-center text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[9px]">Bedrooms</span>
                            <strong>{item.bedrooms} Beds</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">Bathrooms</span>
                            <strong>{item.bathrooms} Baths</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">Erf Size</span>
                            <strong>{item.erfSize} m²</strong>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Seller:</span>
                            <span className="font-semibold text-slate-900">{item.sellerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Commission ({item.commissionRate}%):</span>
                            <span className="font-mono text-emerald-800 font-bold">
                              R {Math.round(item.price * (item.commissionRate / 100)).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Performance:</span>
                            <span className="text-slate-600 font-mono">
                              👁 {item.views} views • ✉ {item.enquiries} enquiries
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="bg-slate-100 px-3.5 py-2.5 border-t border-slate-200 flex items-center justify-between">
                      <button
                        onClick={() => handleStartNewSyndication(item)}
                        className="bg-[#006980] hover:bg-[#005566] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                      >
                        <span>Edit Syndication</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => alert(`Syndication payload refreshed for ${item.address}`)}
                          className="bg-white hover:bg-slate-200 text-slate-700 p-1.5 rounded border border-slate-300 text-xs flex items-center gap-1"
                          title="Push live sync to Property24 and Private Property"
                        >
                          <Globe className="w-3.5 h-3.5 text-cyan-700" />
                          <span>Push Portals</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )}

        {/* ========================================================================= */}
        {/* VIEW 2: LISTING SYNDICATION WIZARD (MATCHING USER SCREENSHOT EXACTLY) */}
        {/* ========================================================================= */}
        {currentView === 'SYNDICATION_WIZARD' && (
          <div className="flex flex-col h-full overflow-hidden bg-slate-50">
            
            {/* Top Bar: + LISTING SYNDICATION (Left) & BACK TO LISTINGS (Right) */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-[#00bcd4] text-lg font-bold flex items-center gap-1.5">
                  <span className="text-2xl leading-none">+</span>
                  <span>LISTING SYNDICATION</span>
                </span>
              </div>

              <button
                id="btn-back-to-listings"
                onClick={() => setCurrentView('LISTINGS_GRID')}
                className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs uppercase px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ArrowLeftCircle className="w-4 h-4" />
                <span>BACK TO LISTINGS</span>
              </button>
            </div>

            {/* Stepper Bar (5 Steps matching screenshot) */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
              <div className="max-w-4xl mx-auto flex items-center justify-between relative">
                
                {/* Step 1: Deal Details */}
                <div 
                  onClick={() => setWizardStep(1)}
                  className="flex flex-col items-center cursor-pointer group z-10"
                >
                  <span className={`text-[11px] font-medium mb-1.5 ${wizardStep === 1 ? 'text-[#00bcd4] font-bold' : 'text-slate-500'}`}>
                    Deal Details
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep === 1
                      ? 'bg-[#00bcd4] text-white ring-4 ring-cyan-100'
                      : wizardStep > 1
                      ? 'bg-[#00bcd4] text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-600'
                  }`}>
                    1
                  </div>
                </div>

                <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>

                {/* Step 2: Location */}
                <div 
                  onClick={() => setWizardStep(2)}
                  className="flex flex-col items-center cursor-pointer group z-10"
                >
                  <span className={`text-[11px] font-medium mb-1.5 ${wizardStep === 2 ? 'text-[#00bcd4] font-bold' : 'text-slate-500'}`}>
                    Location
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep === 2
                      ? 'bg-[#00bcd4] text-white ring-4 ring-cyan-100'
                      : wizardStep > 2
                      ? 'bg-[#00bcd4] text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-600'
                  }`}>
                    2
                  </div>
                </div>

                <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>

                {/* Step 3: Property Details */}
                <div 
                  onClick={() => setWizardStep(3)}
                  className="flex flex-col items-center cursor-pointer group z-10"
                >
                  <span className={`text-[11px] font-medium mb-1.5 ${wizardStep === 3 ? 'text-[#00bcd4] font-bold' : 'text-slate-500'}`}>
                    Property Details
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep === 3
                      ? 'bg-[#00bcd4] text-white ring-4 ring-cyan-100'
                      : wizardStep > 3
                      ? 'bg-[#00bcd4] text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-600'
                  }`}>
                    3
                  </div>
                </div>

                <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>

                {/* Step 4: Media */}
                <div 
                  onClick={() => setWizardStep(4)}
                  className="flex flex-col items-center cursor-pointer group z-10"
                >
                  <span className={`text-[11px] font-medium mb-1.5 ${wizardStep === 4 ? 'text-[#00bcd4] font-bold' : 'text-slate-500'}`}>
                    Media
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep === 4
                      ? 'bg-[#00bcd4] text-white ring-4 ring-cyan-100'
                      : wizardStep > 4
                      ? 'bg-[#00bcd4] text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-600'
                  }`}>
                    4
                  </div>
                </div>

                <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>

                {/* Step 5: Preview */}
                <div 
                  onClick={() => setWizardStep(5)}
                  className="flex flex-col items-center cursor-pointer group z-10"
                >
                  <span className={`text-[11px] font-medium mb-1.5 ${wizardStep === 5 ? 'text-[#00bcd4] font-bold' : 'text-slate-500'}`}>
                    Preview
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    wizardStep === 5
                      ? 'bg-[#00bcd4] text-white ring-4 ring-cyan-100'
                      : 'bg-white border-2 border-slate-300 text-slate-600'
                  }`}>
                    5
                  </div>
                </div>

              </div>
            </div>

            {/* Wizard Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* ========================================================================= */}
              {/* STEP 1: DEAL DETAILS (Exact Screenshot Implementation) */}
              {/* ========================================================================= */}
              {wizardStep === 1 && (
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Notice Banner matching screenshot */}
                  <div className="bg-[#e8f0f4] border border-[#d2e3eb] rounded py-3 px-5 flex items-center gap-3 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-[#00bcd4] text-white flex items-center justify-center shrink-0 font-serif font-bold text-xs">
                      i
                    </div>
                    <span>
                      <strong>NB.</strong> Deal Details are used within TVA only and will not be sent through to the property portals.
                    </span>
                  </div>

                  {/* Accordion 1: SELLER INFORMATION (Expanded in Screenshot) */}
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                    <div 
                      onClick={() => setIsSellerInfoOpen(!isSellerInfoOpen)}
                      className="px-6 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-[#e05666] fill-[#e05666]" />
                        <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                          SELLER INFORMATION
                        </h3>
                      </div>
                      {isSellerInfoOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {isSellerInfoOpen && (
                      <div className="p-6 space-y-4">
                        <div className="max-w-2xl mx-auto space-y-3.5">
                          
                          {/* Row 1: Seller */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-full sm:w-40 text-left sm:text-right text-slate-700 text-xs font-normal shrink-0">
                              Seller
                            </label>
                            <div className="flex-1 flex items-center">
                              <input
                                type="text"
                                value={sellerName}
                                onChange={(e) => setSellerName(e.target.value)}
                                placeholder="Enter seller full name"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                              />
                              <button
                                type="button"
                                onClick={() => alert('Seller verified & attached to deal')}
                                className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-3.5 py-2 uppercase transition-colors shrink-0"
                              >
                                ADD
                              </button>
                              <div className="bg-[#fbe9e7] border border-[#ffccbc] text-[#ff5722] px-2.5 py-1.5 rounded-r flex items-center justify-center font-bold text-xs select-none shrink-0" title="Required">
                                ✱
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Address */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-full sm:w-40 text-left sm:text-right text-slate-700 text-xs font-normal shrink-0">
                              Address
                            </label>
                            <div className="flex-1 flex items-center">
                              <input
                                type="text"
                                value={sellerAddress}
                                onChange={(e) => setSellerAddress(e.target.value)}
                                placeholder="Enter seller residential address"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                              />
                              <button
                                type="button"
                                onClick={() => alert('Address linked')}
                                className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-3.5 py-2 uppercase transition-colors shrink-0"
                              >
                                ADD
                              </button>
                              <div className="bg-[#fbe9e7] border border-[#ffccbc] text-[#ff5722] px-2.5 py-1.5 rounded-r flex items-center justify-center font-bold text-xs select-none shrink-0" title="Required">
                                ✱
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Seller ID Number */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-full sm:w-40 text-left sm:text-right text-slate-700 text-xs font-normal shrink-0">
                              Seller ID Number
                            </label>
                            <div className="flex-1 flex items-center">
                              <input
                                type="text"
                                value={sellerIdNumber}
                                onChange={(e) => setSellerIdNumber(e.target.value)}
                                placeholder="Enter 13-digit RSA ID Number"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 text-xs font-mono focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                              />
                              <div className="bg-[#fbe9e7] border border-[#ffccbc] text-[#ff5722] px-2.5 py-1.5 rounded-r flex items-center justify-center font-bold text-xs select-none shrink-0" title="Required">
                                ✱
                              </div>
                            </div>
                          </div>

                          {/* Row 4: Seller Contact */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-full sm:w-40 text-left sm:text-right text-slate-700 text-xs font-normal shrink-0">
                              Seller Contact
                            </label>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={sellerContact}
                                onChange={(e) => setSellerContact(e.target.value)}
                                placeholder="Enter Mobile Number (e.g. +27 82 491 8820)"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                              />
                            </div>
                          </div>

                          {/* Row 5: Seller Email */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <label className="w-full sm:w-40 text-left sm:text-right text-slate-700 text-xs font-normal shrink-0">
                              Seller Email
                            </label>
                            <div className="flex-1">
                              <input
                                type="email"
                                value={sellerEmail}
                                onChange={(e) => setSellerEmail(e.target.value)}
                                placeholder="Enter Email Address"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                              />
                            </div>
                          </div>

                          {/* Row 6: Co-seller Toggle */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1">
                            <div className="w-full sm:w-40 text-left sm:text-right shrink-0">
                              <span className="text-slate-700 text-xs font-normal">Co-seller</span>
                            </div>
                            <div className="flex-1 flex items-center">
                              <button
                                type="button"
                                onClick={() => setHasCoSeller(!hasCoSeller)}
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                                  hasCoSeller ? 'bg-[#00bcd4]' : 'bg-slate-300'
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                    hasCoSeller ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Co-seller fields if enabled */}
                          {hasCoSeller && (
                            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                              <span className="font-bold text-slate-700 block text-[11px]">Co-Seller Details:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Co-Seller Full Name"
                                  value={coSellerName}
                                  onChange={(e) => setCoSellerName(e.target.value)}
                                  className="p-2 border border-slate-300 rounded bg-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Co-Seller ID Number"
                                  value={coSellerId}
                                  onChange={(e) => setCoSellerId(e.target.value)}
                                  className="p-2 border border-slate-300 rounded bg-white font-mono"
                                />
                              </div>
                            </div>
                          )}

                          {/* File Upload Grid matching screenshot layout */}
                          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            
                            {/* Upload Mandate */}
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-slate-700 font-normal">Upload Mandate</span>
                              <label className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-medium text-xs px-5 py-1.5 rounded cursor-pointer transition-colors shadow-2xs">
                                Upload
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) setUploadedMandate(e.target.files[0].name);
                                  }}
                                />
                              </label>
                            </div>

                            {/* Bank Statement */}
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-slate-700 font-normal">Bank Statement</span>
                              <label className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-medium text-xs px-5 py-1.5 rounded cursor-pointer transition-colors shadow-2xs">
                                Upload
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) setUploadedBankStatement(e.target.files[0].name);
                                  }}
                                />
                              </label>
                            </div>

                            {/* Upload ID */}
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-slate-700 font-normal">Upload ID</span>
                              <label className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-medium text-xs px-5 py-1.5 rounded cursor-pointer transition-colors shadow-2xs">
                                Upload
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) setUploadedIdDoc(e.target.files[0].name);
                                  }}
                                />
                              </label>
                            </div>

                            {/* Proof of Address */}
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-slate-700 font-normal">Proof of Address</span>
                              <label className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-medium text-xs px-5 py-1.5 rounded cursor-pointer transition-colors shadow-2xs">
                                Upload
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) setUploadedProofOfAddress(e.target.files[0].name);
                                  }}
                                />
                              </label>
                            </div>

                          </div>

                          {/* Uploaded Files Chips */}
                          <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
                            {uploadedMandate && (
                              <span className="bg-cyan-50 border border-cyan-200 text-cyan-800 px-2 py-1 rounded flex items-center gap-1 font-medium">
                                <FileCheck className="w-3 h-3 text-cyan-600" /> Mandate: {uploadedMandate}
                              </span>
                            )}
                            {uploadedIdDoc && (
                              <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-1 rounded flex items-center gap-1 font-medium">
                                <Check className="w-3 h-3 text-emerald-600" /> ID: {uploadedIdDoc}
                              </span>
                            )}
                            {uploadedProofOfAddress && (
                              <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded flex items-center gap-1 font-medium">
                                Proof of Res: {uploadedProofOfAddress}
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: MANDATE INFORMATION */}
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                    <div 
                      onClick={() => setIsMandateInfoOpen(!isMandateInfoOpen)}
                      className="px-6 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-[#e05666] fill-[#e05666]" />
                        <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                          MANDATE INFORMATION
                        </h3>
                      </div>
                      {isMandateInfoOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {isMandateInfoOpen && (
                      <div className="p-6 space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Mandate Agreement</label>
                            <select
                              value={mandateType}
                              onChange={(e: any) => setMandateType(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded bg-white font-medium"
                            >
                              <option value="Sole Mandate">Sole Mandate (Exclusive)</option>
                              <option value="Open Mandate">Open Mandate</option>
                              <option value="Joint Mandate">Joint Mandate</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Start Date</label>
                            <input
                              type="date"
                              value={mandateStartDate}
                              onChange={(e) => setMandateStartDate(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Expiry Date</label>
                            <input
                              type="date"
                              value={mandateEndDate}
                              onChange={(e) => setMandateEndDate(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded bg-white"
                            />
                          </div>
                        </div>

                        <div className="max-w-2xl mx-auto pt-2">
                          <label className="block text-slate-600 font-medium mb-1">Agreed Listing Asking Price (ZAR)</label>
                          <input
                            type="number"
                            value={listingPrice}
                            onChange={(e) => setListingPrice(Number(e.target.value))}
                            className="w-full p-2.5 border border-slate-300 rounded bg-white font-mono text-sm font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: COMMISSION STATEMENT */}
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                    <div 
                      onClick={() => setIsCommissionOpen(!isCommissionOpen)}
                      className="px-6 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-[#e05666] fill-[#e05666]" />
                        <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                          COMMISSION STATEMENT
                        </h3>
                      </div>
                      {isCommissionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {isCommissionOpen && (
                      <div className="p-6 space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Commission Rate (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={commissionPercent}
                              onChange={(e) => setCommissionPercent(Number(e.target.value))}
                              className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                            />
                          </div>

                          <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-center">
                            <span className="text-slate-500 text-[11px]">Total Commission (Excl VAT):</span>
                            <strong className="text-emerald-800 font-mono text-base">
                              R {Math.round(listingPrice * (commissionPercent / 100)).toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons for Step 1 */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-8 py-2.5 rounded shadow-xs uppercase tracking-wider transition-colors"
                    >
                      Continue to Location (2) →
                    </button>
                  </div>

                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: LOCATION */}
              {/* ========================================================================= */}
              {wizardStep === 2 && (
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border border-slate-200 space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                    Step 2: Property Location & Cadastre
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Province</label>
                      <input
                        type="text"
                        value={propProvince}
                        onChange={(e) => setPropProvince(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Suburb / City</label>
                      <input
                        type="text"
                        value={propSuburb}
                        onChange={(e) => setPropSuburb(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Street Address</label>
                      <input
                        type="text"
                        value={`${propStreetNumber} ${propStreet}`}
                        onChange={(e) => setPropStreet(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Erf Number / Scheme</label>
                      <input
                        type="text"
                        value={propErf}
                        onChange={(e) => setPropErf(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="bg-slate-200 text-slate-700 px-5 py-2 rounded font-bold text-xs"
                    >
                      ← Back to Deal Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="bg-[#00bcd4] text-white px-6 py-2 rounded font-bold text-xs"
                    >
                      Continue to Property Details (3) →
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: PROPERTY DETAILS */}
              {/* ========================================================================= */}
              {wizardStep === 3 && (
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border border-slate-200 space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                    Step 3: Specifications & Features
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Bedrooms</label>
                      <input
                        type="number"
                        value={propBedrooms}
                        onChange={(e) => setPropBedrooms(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Bathrooms</label>
                      <input
                        type="number"
                        value={propBathrooms}
                        onChange={(e) => setPropBathrooms(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Erf Size (m²)</label>
                      <input
                        type="number"
                        value={propErfSize}
                        onChange={(e) => setPropErfSize(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Floor Area (m²)</label>
                      <input
                        type="number"
                        value={propFloorSize}
                        onChange={(e) => setPropFloorSize(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-2">Key Amenities & Selling Points</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Swimming Pool',
                        'Sea Views',
                        'Double Garage',
                        'Solar & Inverter Battery',
                        '24/7 Security Alarm',
                        'Air Conditioning',
                        'Borehole / Water Tanks',
                        'Staff Accommodation',
                        'Wine Cellar',
                        'Gym'
                      ].map(feat => (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => {
                            if (selectedFeatures.includes(feat)) {
                              setSelectedFeatures(prev => prev.filter(f => f !== feat));
                            } else {
                              setSelectedFeatures(prev => [...prev, feat]);
                            }
                          }}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            selectedFeatures.includes(feat)
                              ? 'bg-cyan-800 text-white font-bold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {selectedFeatures.includes(feat) ? '✓ ' : '+ '}
                          {feat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="bg-slate-200 text-slate-700 px-5 py-2 rounded font-bold text-xs"
                    >
                      ← Back to Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="bg-[#00bcd4] text-white px-6 py-2 rounded font-bold text-xs"
                    >
                      Continue to Media (4) →
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 4: MEDIA & MARKETING COPY */}
              {/* ========================================================================= */}
              {wizardStep === 4 && (
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border border-slate-200 space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                    Step 4: Photography, 3D Tours & Listing Description
                  </h3>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Marketing Headline</label>
                    <input
                      type="text"
                      value={listingHeadline}
                      onChange={(e) => setListingHeadline(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Portal Description</label>
                    <textarea
                      rows={4}
                      value={listingDescription}
                      onChange={(e) => setListingDescription(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded text-slate-800 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Matterport 3D Tour URL</label>
                      <input
                        type="text"
                        value={virtualTourUrl}
                        onChange={(e) => setVirtualTourUrl(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">YouTube Video Walkthrough URL</label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="bg-slate-200 text-slate-700 px-5 py-2 rounded font-bold text-xs"
                    >
                      ← Back to Specifications
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(5)}
                      className="bg-[#00bcd4] text-white px-6 py-2 rounded font-bold text-xs"
                    >
                      Continue to Preview & Publish (5) →
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 5: PREVIEW & SYNDICATION */}
              {/* ========================================================================= */}
              {wizardStep === 5 && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4 text-xs">
                    <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                      Step 5: Portal Syndication Channels & Final Review
                    </h3>

                    {/* Preview Card */}
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col sm:flex-row gap-4">
                      <img
                        src={selectedProperty?.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                        alt="Listing Preview"
                        className="w-full sm:w-48 h-36 object-cover rounded"
                      />
                      <div className="flex-1 space-y-1.5">
                        <div className="text-base font-bold font-mono text-[#006980]">
                          R {listingPrice.toLocaleString()}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{listingHeadline}</h4>
                        <p className="text-slate-500">{propStreetNumber} {propStreet}, {propSuburb}</p>
                        <div className="flex gap-3 text-[11px] text-slate-700 pt-1 font-medium">
                          <span>🛏 {propBedrooms} Beds</span>
                          <span>🛁 {propBathrooms} Baths</span>
                          <span>📐 {propErfSize} m² Erf</span>
                          <span>🏢 {mandateType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Channel Selector */}
                    <div>
                      <span className="font-bold text-slate-800 block mb-2">Select Live Syndication Portals:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={syncProperty24}
                            onChange={(e) => setSyncProperty24(e.target.checked)}
                            className="rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="font-bold text-red-700">Property24</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={syncPrivateProperty}
                            onChange={(e) => setSyncPrivateProperty(e.target.checked)}
                            className="rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="font-bold text-blue-700">Private Property</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={syncIol}
                            onChange={(e) => setSyncIol(e.target.checked)}
                            className="rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="font-bold text-slate-800">IOL Property Network</span>
                        </label>
                      </div>
                    </div>

                    {publishSuccess && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs space-y-1">
                        <strong className="flex items-center gap-1.5 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Listing Successfully Syndicated!
                        </strong>
                        <p>
                          Your property mandate has been added to My Listings and dispatched to Property24 and Private Property.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setWizardStep(4)}
                        className="bg-slate-200 text-slate-700 px-5 py-2 rounded font-bold text-xs"
                      >
                        ← Back to Media
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentView('LISTINGS_GRID')}
                          className="bg-slate-200 text-slate-800 px-4 py-2 rounded font-bold text-xs"
                        >
                          View Listings
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAndSyndicate}
                          disabled={isPublishing}
                          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-8 py-2.5 rounded shadow-xs uppercase tracking-wider transition-colors"
                        >
                          {isPublishing ? 'PUBLISHING TO PORTALS...' : 'PUBLISH & SYNDICATE'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Floating WhatsApp Action Button (Matching screenshot bottom-right) */}
            <div className="fixed bottom-6 right-6 z-50">
              <a
                href="https://wa.me/27824918820"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-[#00bcd4] hover:bg-[#00acc1] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110"
                title="Contact Support on WhatsApp"
              >
                <MessageCircle className="w-6 h-6 fill-white" />
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
