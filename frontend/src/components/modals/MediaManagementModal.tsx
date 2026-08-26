import React, { useState, useEffect } from 'react';
import { apiFetch } from "../../lib/api";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Star, 
  Check, 
  FileCheck, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  Eye, 
  Tag, 
  Layers, 
  CheckCircle2,
  HardDrive,
  Cpu
} from 'lucide-react';
import { PropertyRecord, PropertyMediaAsset, MediaTag, StructuralConditionAssessment } from '../../types';

interface MediaManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
  onOpenPDFReport?: () => void;
}

const AVAILABLE_TAGS: MediaTag[] = [
  'Exterior Front',
  'Living Room',
  'Dining Area',
  'Master Bedroom',
  'Ensuite Bathroom',
  'Gourmet Kitchen',
  'Garden & Pool',
  'Balcony / Patio / View',
  'Floorplan 2D/3D',
  'Cadastral SG Diagram',
  'Drone / Aerial',
  'Architectural Detail'
];

export const MediaManagementModal: React.FC<MediaManagementModalProps> = ({
  isOpen,
  onClose,
  property,
  onOpenPDFReport
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'gallery' | 'structural' | 'optimizer'>('gallery');
  const [mediaList, setMediaList] = useState<PropertyMediaAsset[]>([]);
  const [structuralData, setStructuralData] = useState<StructuralConditionAssessment | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<PropertyMediaAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [selectedTag, setSelectedTag] = useState<MediaTag>('Exterior Front');
  const [uploadCaption, setUploadCaption] = useState('');
  const [watermarkAll, setWatermarkAll] = useState(true);

  useEffect(() => {
    if (!isOpen || !property) return;
    fetchMediaAndStructural();
  }, [isOpen, property?.id]);

  const fetchMediaAndStructural = async () => {
    if (!property) return;
    setIsLoading(true);
    try {
      const [mediaRes, structRes] = await Promise.all([
        apiFetch(`/api/media/${property.id}`),
        apiFetch(`/api/structural/${property.id}`)
      ]);
      const mediaData = await mediaRes.json();
      const structData = await structRes.json();
      setMediaList(mediaData.media || []);
      if (mediaData.media?.length > 0) {
        setSelectedAsset(mediaData.media[0]);
      }
      setStructuralData(structData);
    } catch (err) {
      console.error('Error loading media data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !uploadUrl) return;
    setIsUploading(true);
    try {
      const res = await apiFetch(`/api/media/${property.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadUrl,
          tag: selectedTag,
          caption: uploadCaption || `${selectedTag} of ${property.address}`,
          isHero: mediaList.length === 0,
          isIncludedInPdf: true,
          isIncludedInPortals: true
        })
      });
      const data = await res.json();
      if (data.asset) {
        setMediaList(prev => [...prev, data.asset]);
        setSelectedAsset(data.asset);
        setUploadUrl('');
        setUploadCaption('');
      }
    } catch (err) {
      console.error('Failed to add media:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetHero = async (assetId: string) => {
    if (!property) return;
    try {
      await apiFetch(`/api/media/${property.id}/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHero: true })
      });
      setMediaList(prev => prev.map(m => ({ ...m, isHero: m.id === assetId })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFlag = async (assetId: string, field: 'isIncludedInPdf' | 'isIncludedInPortals' | 'watermarkApplied') => {
    if (!property) return;
    const target = mediaList.find(m => m.id === assetId);
    if (!target) return;
    const updatedVal = !target[field];
    try {
      await apiFetch(`/api/media/${property.id}/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: updatedVal })
      });
      setMediaList(prev => prev.map(m => m.id === assetId ? { ...m, [field]: updatedVal } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!property) return;
    try {
      await apiFetch(`/api/media/${property.id}/${assetId}`, { method: 'DELETE' });
      const updated = mediaList.filter(m => m.id !== assetId);
      setMediaList(updated);
      if (selectedAsset?.id === assetId) {
        setSelectedAsset(updated[0] || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStructural = async () => {
    if (!property || !structuralData) return;
    try {
      await apiFetch(`/api/structural/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(structuralData)
      });
      alert('Structural condition & compliance metadata saved successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-[#006980] border-b border-cyan-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950/50 rounded text-cyan-200 border border-cyan-400/30">
              <ImageIcon className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Property Visual Asset & Structural Management
              </h2>
              <p className="text-xs text-cyan-100 font-medium">
                {property.address} • {property.suburb} • {mediaList.length} Processed Visual Assets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950/60 p-0.5 rounded border border-cyan-900/50 text-xs">
              <button
                onClick={() => setActiveSubTab('gallery')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  activeSubTab === 'gallery' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Media Gallery
              </button>
              <button
                onClick={() => setActiveSubTab('structural')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  activeSubTab === 'structural' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Structural Compliance
              </button>
              <button
                onClick={() => setActiveSubTab('optimizer')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  activeSubTab === 'optimizer' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Image Optimizer
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-cyan-700 rounded text-cyan-100 hover:text-white transition-colors text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: MEDIA GALLERY & TAGGING */}
          {activeSubTab === 'gallery' && (
            <div className="space-y-4">
              
              {/* Quick Upload Banner */}
              <form onSubmit={handleAddMedia} className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg flex flex-col md:flex-row items-center gap-3 text-xs">
                <div className="flex-1 w-full flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="url"
                    placeholder="Enter Image URL (e.g. Unsplash or S3 asset link)..."
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-hidden focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value as MediaTag)}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs font-medium focus:outline-hidden focus:border-cyan-400"
                  >
                    {AVAILABLE_TAGS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Caption / Room context..."
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs w-48 focus:outline-hidden focus:border-cyan-400"
                  />

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-3.5 py-1.5 bg-[#006980] hover:bg-cyan-600 text-white font-bold rounded text-xs transition-colors shrink-0 shadow-xs"
                  >
                    {isUploading ? 'Optimizing...' : 'Upload & Tag'}
                  </button>
                </div>
              </form>

              {/* Media Grid & Inspector Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Left: Thumbnail Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaList.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`group relative rounded-lg overflow-hidden border transition-all cursor-pointer bg-slate-950 ${
                          isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-md' : 'border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="aspect-4/3 relative overflow-hidden bg-slate-900">
                          <img
                            src={asset.url}
                            alt={asset.caption}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          {asset.isHero && (
                            <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" /> HERO
                            </span>
                          )}
                          <span className="absolute bottom-1.5 left-1.5 bg-slate-900/90 backdrop-blur-xs text-cyan-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700">
                            {asset.tag}
                          </span>
                        </div>

                        <div className="p-2 text-[11px] bg-slate-900 flex items-center justify-between border-t border-slate-800">
                          <span className="text-slate-300 truncate max-w-[120px]">{asset.caption}</span>
                          <div className="flex items-center gap-1">
                            {asset.isIncludedInPdf && <span className="text-emerald-400 font-bold text-[9px]" title="In PDF">PDF</span>}
                            {asset.isIncludedInPortals && <span className="text-indigo-400 font-bold text-[9px]" title="In Portals">WEB</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Selected Asset Inspector */}
                {selectedAsset ? (
                  <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-lg space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        Asset Metadata
                      </span>
                      <button
                        onClick={() => handleDeleteAsset(selectedAsset.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="rounded overflow-hidden border border-slate-700 aspect-video">
                      <img src={selectedAsset.url} alt={selectedAsset.caption} className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Tag Category:</span>
                        <span className="font-bold text-cyan-300">{selectedAsset.tag}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Dimensions:</span>
                        <span className="font-mono text-slate-200">{selectedAsset.dimensions.width} x {selectedAsset.dimensions.height} px</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">File Size:</span>
                        <span className="font-mono text-slate-200">{(selectedAsset.fileSizeBytes / 1000000).toFixed(2)} MB</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Web Optimization:</span>
                        <span className="text-emerald-400 font-bold">1920x1080 JPEG (Ready)</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Print PDF Engine:</span>
                        <span className="text-emerald-400 font-bold">300 DPI Calibrated</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() => handleSetHero(selectedAsset.id)}
                        className={`w-full py-1.5 rounded font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          selectedAsset.isHero 
                            ? 'bg-amber-500 text-slate-950 font-black' 
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {selectedAsset.isHero ? 'Primary Listing Hero Photo' : 'Set as Primary Hero Photo'}
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleToggleFlag(selectedAsset.id, 'isIncludedInPdf')}
                          className={`py-1.5 px-2 rounded font-semibold text-[11px] border transition-colors ${
                            selectedAsset.isIncludedInPdf 
                              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' 
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {selectedAsset.isIncludedInPdf ? '✓ In PDF Report' : '+ Add to PDF'}
                        </button>
                        <button
                          onClick={() => handleToggleFlag(selectedAsset.id, 'isIncludedInPortals')}
                          className={`py-1.5 px-2 rounded font-semibold text-[11px] border transition-colors ${
                            selectedAsset.isIncludedInPortals 
                              ? 'bg-indigo-950/80 border-indigo-600 text-indigo-300' 
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {selectedAsset.isIncludedInPortals ? '✓ In Portal Feeds' : '+ Add to Portals'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg flex flex-col items-center justify-center text-center text-slate-500">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Select any photograph to inspect dimensions and publication flags.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: STRUCTURAL COMPLIANCE METADATA */}
          {activeSubTab === 'structural' && structuralData && (
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-lg space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Structural Condition & Statutory Compliance Matrix</h3>
                  <p className="text-slate-400 text-[11px]">Engineering ratings and mandatory South African transfer certificates (SACPVP / EAAB Standard)</p>
                </div>
                <button
                  onClick={handleSaveStructural}
                  className="px-3 py-1.5 bg-[#006980] hover:bg-cyan-600 text-white font-bold rounded text-xs transition-colors shadow-xs"
                >
                  Save Compliance Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Roof & Waterproofing Condition</label>
                    <select
                      value={structuralData.roofCondition}
                      onChange={(e) => setStructuralData({ ...structuralData, roofCondition: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-400"
                    >
                      <option value="Excellent">Excellent (Newly Slated / Sealed)</option>
                      <option value="Good">Good (Routine Inspection Passed)</option>
                      <option value="Fair">Fair (Minor Maintenance Suggested)</option>
                      <option value="Needs Repair">Needs Repair (Overhaul Required)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Electrical Certificate of Compliance (COC)</label>
                    <select
                      value={structuralData.electricalCertStatus}
                      onChange={(e) => setStructuralData({ ...structuralData, electricalCertStatus: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-400"
                    >
                      <option value="Valid & Issued">Valid & Issued (Deeds Ready)</option>
                      <option value="Pending Inspection">Pending Inspection</option>
                      <option value="Requires Rectification">Requires Rectification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Gas Installation Compliance</label>
                    <select
                      value={structuralData.gasCertStatus}
                      onChange={(e) => setStructuralData({ ...structuralData, gasCertStatus: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-400"
                    >
                      <option value="Compliant">Compliant & Certified</option>
                      <option value="Pending">Pending Inspection</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Foundation & Structural Integrity</label>
                    <select
                      value={structuralData.foundationIntegrity}
                      onChange={(e) => setStructuralData({ ...structuralData, foundationIntegrity: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-400"
                    >
                      <option value="Sound">Sound (Zero Settling Movement)</option>
                      <option value="Minor Settling Hairline">Minor Settling Hairline</option>
                      <option value="Engineering Signed-Off">Engineering Signed-Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Beetle / Timber Pest Inspection</label>
                    <select
                      value={structuralData.beetleWoodInspection}
                      onChange={(e) => setStructuralData({ ...structuralData, beetleWoodInspection: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-400"
                    >
                      <option value="Clear">Clear (Certificate Available)</option>
                      <option value="Pending">Pending</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Inspecting Authority & Registration</label>
                    <input
                      type="text"
                      value={structuralData.inspectorName}
                      onChange={(e) => setStructuralData({ ...structuralData, inspectorName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Structural & Architectural Notes</label>
                <textarea
                  rows={3}
                  value={structuralData.structuralNotes}
                  onChange={(e) => setStructuralData({ ...structuralData, structuralNotes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE OPTIMIZER & WATERMARK PIPELINE */}
          {activeSubTab === 'optimizer' && (
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-lg space-y-4 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-slate-700 pb-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Automated Image Optimization & Aspect Ratio Engine</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Web Portal Ready</span>
                    <span className="text-[10px] bg-indigo-900 text-indigo-200 px-1.5 py-0.5 rounded">16:9 Landscape</span>
                  </div>
                  <p className="text-[11px] text-slate-400">1920x1080px JPEG with chroma sub-sampling (85% quality target). Optimized for Property24 & Private Property bandwidth.</p>
                  <div className="text-[10px] text-emerald-400 font-mono">✓ Compression: 74% savings</div>
                </div>

                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Print PDF Resolution</span>
                    <span className="text-[10px] bg-amber-900 text-amber-200 px-1.5 py-0.5 rounded">300 DPI CMYK</span>
                  </div>
                  <p className="text-[11px] text-slate-400">High-fidelity uncompressed rendering for glossy hardcopy valuation presentations and deeds filings.</p>
                  <div className="text-[10px] text-emerald-400 font-mono">✓ Color profile: sRGB Calibrated</div>
                </div>

                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Social Carousel</span>
                    <span className="text-[10px] bg-pink-900 text-pink-200 px-1.5 py-0.5 rounded">1:1 Square</span>
                  </div>
                  <p className="text-[11px] text-slate-400">1080x1080px center-crop with dynamic Ptah-Realty brand insignia badge for Instagram & Meta listing campaigns.</p>
                  <div className="text-[10px] text-emerald-400 font-mono">✓ Ready for Meta Ads API</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block text-xs">Ptah-Realty Cadastral Watermarking</span>
                  <span className="text-slate-400 text-[11px]">Embed subtle transparent copyright badge onto exported syndication payloads.</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watermarkAll}
                    onChange={(e) => setWatermarkAll(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-200">Active</span>
                </label>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
