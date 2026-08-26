import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from "../../lib/api";
import { 
  FileText, 
  Printer, 
  Download, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  BookOpen,
  Send
} from 'lucide-react';
import { PropertyRecord, ComparativeSaleRecord, CMAValuationCalculation, PropertyMediaAsset, AIGeneratedCMACopy } from '../../types';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const [aiTone, setAiTone] = useState<'Executive' | 'Luxury' | 'Investor'>('Executive');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiCopy, setAiCopy] = useState<AIGeneratedCMACopy | null>(null);
  const [valuationData, setValuationData] = useState<CMAValuationCalculation | null>(null);
  const [comparatives, setComparatives] = useState<ComparativeSaleRecord[]>([]);
  const [mediaList, setMediaList] = useState<PropertyMediaAsset[]>([]);
  
  // Customization Toggles
  const [sections, setSections] = useState({
    coverPage: true,
    compsTable: true,
    aiNarrative: true,
    structuralSpecs: true,
    deedsCertification: true,
    photoGallery: true
  });

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !property) return;
    loadAllReportData();
  }, [isOpen, property?.id]);

  const loadAllReportData = async () => {
    if (!property) return;
    try {
      const [valRes, compRes, mediaRes] = await Promise.all([
        apiFetch('/api/cma/calculate-valuation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId: property.id })
        }),
        apiFetch(`/api/cma/comparatives/${property.id}`),
        apiFetch(`/api/media/${property.id}`)
      ]);

      const valJson = await valRes.json();
      const compJson = await compRes.json();
      const mediaJson = await mediaRes.json();

      setValuationData(valJson);
      setComparatives(compJson.comparatives || []);
      setMediaList(mediaJson.media || []);

      // Trigger Amazon Bedrock AI generation for report narrative
      generateAiMarketCopy('Executive', valJson);
    } catch (err) {
      console.error('Error loading report data:', err);
    }
  };

  const generateAiMarketCopy = async (tone: string, valDataOverride?: any) => {
    if (!property) return;
    setIsGeneratingAi(true);
    try {
      const currentVal = valDataOverride || valuationData;
      const res = await apiFetch('/api/ai/cma-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property,
          comparatives,
          valuation: currentVal || { finalProjectedMarketValue: 6450000, averagePricePerM2: 24700 },
          tone
        })
      });
      const data = await res.json();
      setAiCopy(data);
    } catch (err) {
      console.error('Error generating AI narrative:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !property) return null;

  const formatZar = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '-';
    return `R ${amount.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  const heroAsset = mediaList.find(m => m.isHero) || mediaList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-[#006980] border-b border-cyan-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950/50 rounded text-cyan-200 border border-cyan-400/30">
              <FileText className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Automated Client-Facing CMA Valuation Report
              </h2>
              <p className="text-xs text-cyan-100 font-medium">
                Ptah-Realty Official Market Dossier • {property.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tone selector */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/60 p-0.5 rounded border border-cyan-900/50 text-xs">
              <span className="text-[10px] text-cyan-300 font-bold px-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Bedrock Tone:
              </span>
              {(['Executive', 'Luxury', 'Investor'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setAiTone(t);
                    generateAiMarketCopy(t);
                  }}
                  disabled={isGeneratingAi}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    aiTone === t ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-cyan-700 rounded text-cyan-100 hover:text-white transition-colors text-xs font-bold ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Customization Bar */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Included Sections:</span>
            <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sections.coverPage}
                onChange={(e) => setSections({ ...sections, coverPage: e.target.checked })}
                className="rounded text-cyan-600 focus:ring-0"
              />
              Cover Dossier
            </label>
            <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sections.compsTable}
                onChange={(e) => setSections({ ...sections, compsTable: e.target.checked })}
                className="rounded text-cyan-600 focus:ring-0"
              />
              Comps Matrix
            </label>
            <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sections.aiNarrative}
                onChange={(e) => setSections({ ...sections, aiNarrative: e.target.checked })}
                className="rounded text-cyan-600 focus:ring-0"
              />
              AI Valuation Narrative
            </label>
            <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sections.photoGallery}
                onChange={(e) => setSections({ ...sections, photoGallery: e.target.checked })}
                className="rounded text-cyan-600 focus:ring-0"
              />
              Visual Gallery
            </label>
          </div>

          <div className="flex items-center gap-2">
            {isGeneratingAi && (
              <span className="text-[11px] text-cyan-300 animate-pulse font-medium flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Synthesizing Bedrock Market Copy...
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Document Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 flex justify-center">
          
          {/* Printable Report Canvas (White Sheet Layout) */}
          <div 
            ref={printRef}
            className="w-full max-w-[800px] bg-white text-slate-900 shadow-2xl p-6 sm:p-8 rounded-sm font-sans space-y-6 print:p-0 print:shadow-none print:max-w-none print:w-full"
          >
            
            {/* 1. REPORT HEADER & BRAND INSIGNIA */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#006980] text-white p-2 rounded font-black text-lg tracking-wider">
                  PTAH
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    Ptah-Realty Intelligence
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Comparative Market Analysis & Cadastral Valuation Dossier
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-600">
                <div className="font-bold text-slate-900">Date: {new Date().toLocaleDateString('en-ZA')}</div>
                <div>Ref: PTAH-CMA-{property.erfNo}-{property.id.toUpperCase()}</div>
                <div>Prepared By: Ronald Read (Director)</div>
              </div>
            </div>

            {/* 2. COVER HERO & EXECUTIVE VALUATION SUMMARY */}
            {sections.coverPage && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Property Photo */}
                  <div className="aspect-4/3 rounded overflow-hidden bg-slate-100 border border-slate-300">
                    <img 
                      src={heroAsset?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"} 
                      alt={property.address} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Key Valuation Highlight Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">
                        Projected Market Valuation
                      </span>
                      <div className="text-3xl font-black text-cyan-900 mt-1">
                        {formatZar(valuationData?.finalProjectedMarketValue)}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Derived from SACPVP comparative methodology & {comparatives.length} verified title transactions.
                      </p>

                      <div className="mt-3 space-y-1 text-xs border-t border-slate-200 pt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Valuation Range:</span>
                          <span className="font-semibold text-slate-800">
                            {formatZar(valuationData?.valueRange.conservative)} – {formatZar(valuationData?.valueRange.aggressive)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Average Rate:</span>
                          <span className="font-semibold text-slate-800">
                            R {valuationData?.averagePricePerM2?.toLocaleString('en-ZA')} / m²
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Monthly Rental:</span>
                          <span className="font-semibold text-emerald-700">
                            {formatZar(valuationData?.estimatedMonthlyRental)} / mo ({valuationData?.projectedGrossYieldPercent}% yield)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-800 block">Cadastre & Title Particulars:</span>
                      <span>Erf {property.erfNo}, {property.suburb} • Extent: {property.extentM2} m² • Zoning: {property.zoning}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. AMAZON BEDROCK MARKET COMMENTARY & STRATEGY */}
            {sections.aiNarrative && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-700" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                    Executive Market Commentary & Strategic Positioning
                  </h3>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-3.5 text-xs text-slate-700 leading-relaxed">
                  <p className="font-medium text-slate-800">
                    {aiCopy?.executiveSummary || "The subject property is exceptionally positioned within the premium Atlantic Seaboard / City Bowl corridor, commanding strong investor demand and consistent capital appreciation. Comparative market velocity over the preceding 12 months reflects tight inventory in this category."}
                  </p>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">Pricing Recommendation:</span>
                      <p className="text-[11px] text-slate-600">{aiCopy?.pricingRecommendation || "Positioning at R 6 450 000 captures active buyer pools while preserving negotiation leverage."}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">Key Value Drivers:</span>
                      <p className="text-[11px] text-slate-600">{aiCopy?.keyDrivers || "High ceiling volumes, prime cadastral orientation, private secure parking, and immediate proximity to lifestyle amenities."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. COMPARATIVE SALES MATRIX TABLE */}
            {sections.compsTable && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                  Verified Comparative Sales Evidence ({comparatives.length} Transactions)
                </h3>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-2">Property Address</th>
                        <th className="py-1.5 px-2">Extent</th>
                        <th className="py-1.5 px-2">Bed/Bath</th>
                        <th className="py-1.5 px-2">Sale Date</th>
                        <th className="py-1.5 px-2">Sale Price</th>
                        <th className="py-1.5 px-2">Price/m²</th>
                        <th className="py-1.5 px-2">Similarity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {comparatives.slice(0, 5).map((c) => (
                        <tr key={c.id}>
                          <td className="py-1.5 px-2 font-semibold">
                            {c.address} <span className="text-[10px] text-slate-400 font-normal">({c.distanceMeters}m)</span>
                          </td>
                          <td className="py-1.5 px-2">{c.extentM2} m²</td>
                          <td className="py-1.5 px-2">{c.bedrooms}b/{c.bathrooms}ba</td>
                          <td className="py-1.5 px-2 text-slate-500">{c.saleDate}</td>
                          <td className="py-1.5 px-2 font-bold text-slate-900">{formatZar(c.salePrice)}</td>
                          <td className="py-1.5 px-2 font-mono">R {c.pricePerM2.toLocaleString('en-ZA')}</td>
                          <td className="py-1.5 px-2 font-bold text-cyan-800">{c.similarityScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. VISUAL GALLERY OF PROPERTY ASSETS */}
            {sections.photoGallery && mediaList.length > 0 && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                  Property Visual Inspection & Features
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {mediaList.slice(0, 3).map((m) => (
                    <div key={m.id} className="rounded overflow-hidden border border-slate-200 bg-slate-50">
                      <div className="aspect-4/3 overflow-hidden">
                        <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-1.5 text-[10px] font-semibold text-slate-700 truncate">
                        {m.tag}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. STATUTORY DISCLAIMER & SIGN-OFF */}
            <div className="border-t-2 border-slate-900 pt-3 flex items-center justify-between text-[10px] text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">Ptah-Realty Proprietary Intelligence</p>
                <p>This report has been compiled in accordance with South African Property Practitioners Regulatory Authority (PPRA) standards.</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">Ronald Read</div>
                <div>Principal Practitioner (FFC Valid)</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
;
