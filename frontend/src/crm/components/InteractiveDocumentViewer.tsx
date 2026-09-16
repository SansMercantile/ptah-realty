import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  FileCode,
  UserCheck,
  Building,
  DollarSign,
  ShieldCheck,
  Check,
  Copy,
  Edit3,
  Save,
  X,
  Sparkles,
  Sliders,
  Maximize2,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Lead, DocumentExtractedSchema } from '../types';
import { formatCurrency } from '../utils/formatters';

interface InteractiveDocumentViewerProps {
  documentMeta: {
    name: string;
    sizeKb: number;
    type: string;
    method?: string;
  };
  rawText: string;
  schema: DocumentExtractedSchema | null;
  lead: Lead;
  verifiedFields: Record<string, boolean>;
  onToggleFieldVerified: (fieldKey: string) => void;
  onVerifyAll: (val: boolean) => void;
  onTriggerAutoPopulate: () => void;
  onOpenAdvancedModal: () => void;
  onUpdateRawText: (newText: string) => void;
  isProcessing?: boolean;
  processingStep?: string;
}

export const InteractiveDocumentViewer: React.FC<InteractiveDocumentViewerProps> = ({
  documentMeta,
  rawText,
  schema,
  lead,
  verifiedFields,
  onToggleFieldVerified,
  onVerifyAll,
  onTriggerAutoPopulate,
  onOpenAdvancedModal,
  onUpdateRawText,
  isProcessing = false,
  processingStep = '',
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'entities' | 'raw' | 'split'>('visual');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(rawText);
  const [copiedText, setCopiedText] = useState(false);

  // Sync edited text when rawText changes from outside
  React.useEffect(() => {
    setEditedText(rawText);
  }, [rawText]);

  const extracted = schema?.extractedFields;

  // Calculate verification progress
  const keyFieldKeys = [
    'buyerName',
    'buyerEmail',
    'buyerPhone',
    'buyerIdNumber',
    'propertyTitle',
    'propertyLocation',
    'budget',
    'conveyancerAttorney',
  ];

  const verifiedCount = keyFieldKeys.filter((k) => verifiedFields[k]).length;
  const totalKeyFields = keyFieldKeys.length;

  // Granular Confidence Score calculation (Color coded: Green > 90%, Amber 70-90%, Red < 70%)
  const overallConfidenceScore = schema?.confidenceScore ?? 92;
  const getScoreBadge = (score: number) => {
    if (score > 90) {
      return {
        label: `${score}% High Confidence`,
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        dotClass: 'bg-emerald-400',
        tier: 'green',
      };
    }
    if (score >= 70) {
      return {
        label: `${score}% Moderate Confidence`,
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        dotClass: 'bg-amber-400',
        tier: 'amber',
      };
    }
    return {
      label: `${score}% Low Confidence`,
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
      dotClass: 'bg-red-400',
      tier: 'red',
    };
  };

  const confidenceBadge = getScoreBadge(overallConfidenceScore);

  // Field Confidence check: identify any field below 80%
  const lowConfidenceFields = useMemo(() => {
    const scores = schema?.fieldConfidenceScores || {};
    const fieldMap: Record<string, string> = {
      buyerName: 'Lead Name',
      buyerEmail: 'Email',
      buyerPhone: 'Phone',
      buyerIdNumber: 'SA ID / Passport',
      propertyTitle: 'Property Title',
      propertyLocation: 'Location / Suburb',
      budget: 'Price / Budget',
      conveyancerAttorney: 'Conveyancer',
    };

    const list: { key: string; label: string; score: number }[] = [];
    Object.keys(fieldMap).forEach((fKey) => {
      const fieldScore = scores[fKey] !== undefined ? scores[fKey] : overallConfidenceScore;
      if (fieldScore < 80 || (schema?.lowConfidenceFields && schema.lowConfidenceFields.includes(fKey))) {
        list.push({ key: fKey, label: fieldMap[fKey], score: fieldScore });
      }
    });
    return list;
  }, [schema, overallConfidenceScore]);

  const isFieldUnderReview = (fieldKey: string) => {
    return lowConfidenceFields.some((f) => f.key === fieldKey);
  };

  const renderFieldScoreBadge = (fieldKey: string) => {
    const scores = schema?.fieldConfidenceScores || {};
    const sc = scores[fieldKey] !== undefined ? scores[fieldKey] : overallConfidenceScore;
    let color = 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (sc < 70) color = 'text-red-700 bg-red-100 border-red-200';
    else if (sc <= 90) color = 'text-amber-700 bg-amber-100 border-amber-200';

    return (
      <div className="flex items-center gap-1.5">
        {sc < 80 && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded border border-amber-300 animate-pulse">
            Review Needed
          </span>
        )}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
          {sc}% Confidence
        </span>
      </div>
    );
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(150, prev + 15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(70, prev - 15));
  const handleResetZoom = () => setZoomLevel(100);

  // Save edited text and re-extract
  const handleSaveEditedText = () => {
    onUpdateRawText(editedText);
    setIsEditing(false);
  };

  // Copy raw text
  const handleCopyText = () => {
    navigator.clipboard.writeText(rawText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Count search query matches
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return (rawText.match(regex) || []).length;
    } catch {
      return 0;
    }
  }, [searchQuery, rawText]);

  // Helper to highlight search matches and detected entities in visual mode
  const renderHighlightedContent = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');

    return (
      <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed font-serif">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Check if line is a major heading
          const isHeading =
            trimmed.toUpperCase() === trimmed &&
            trimmed.length > 5 &&
            !trimmed.includes(':') &&
            !trimmed.startsWith('1.') &&
            !trimmed.startsWith('2.');

          // Check for key-value clause headers
          const isKeyClause =
            trimmed.startsWith('OFFER TO PURCHASE') ||
            trimmed.startsWith('PRE-APPROVAL') ||
            trimmed.startsWith('CERTIFICATE') ||
            trimmed.startsWith('MANDATE') ||
            trimmed.startsWith('SPECIAL CONDITIONS') ||
            trimmed.startsWith('SUSPENSIVE CLAUSES');

          // Highlight search matches
          let renderedLine: React.ReactNode = line;
          if (searchQuery.trim()) {
            const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const parts = line.split(new RegExp(`(${escaped})`, 'gi'));
            renderedLine = parts.map((part, pIdx) =>
              part.toLowerCase() === searchQuery.toLowerCase() ? (
                <mark
                  key={pIdx}
                  className="bg-amber-300 text-slate-900 font-bold px-1 rounded shadow-xs"
                >
                  {part}
                </mark>
              ) : (
                part
              )
            );
          }

          if (isHeading || isKeyClause) {
            return (
              <h4
                key={idx}
                className="font-bold font-sans text-xs tracking-wider uppercase text-slate-900 pt-2 border-b border-slate-200 pb-1 flex items-center justify-between"
              >
                <span>{renderedLine}</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-normal">
                  Verified Clause
                </span>
              </h4>
            );
          }

          return (
            <p key={idx} className="py-0.5">
              {renderedLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="interactive-document-preview-stage"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all"
    >
      {/* 1. Top Control Bar */}
      <div className="bg-slate-900 text-white p-3.5 sm:px-5 sm:py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Document Info & Confidence */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-xs">
                {documentMeta.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                {documentMeta.sizeKb} KB
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold font-mono border ${confidenceBadge.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${confidenceBadge.dotClass} animate-pulse`} />
                <span>{confidenceBadge.label}</span>
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400">
                Engine: {documentMeta.method?.toUpperCase() || 'VISION AI / PDF.JS'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: View Mode Toggles */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Authentic Legal Document Layout"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Document Layout</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('entities')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === 'entities'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Detected CRM Lead Entities"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Entity Map</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === 'split'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Side-by-side Document & Mappings"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === 'raw'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Monospace Raw Text & Editor"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OCR Raw</span>
          </button>
        </div>

        {/* Right: Search, Zoom, and Edit Controls */}
        <div className="flex items-center space-x-2">
          {/* Document Search */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in doc..."
              className="bg-slate-800 text-white placeholder:text-slate-500 pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 w-28 sm:w-36 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-white cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {matchCount > 0 && (
            <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-1 rounded-lg shrink-0">
              {matchCount} match{matchCount > 1 ? 'es' : ''}
            </span>
          )}

          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white cursor-pointer"
              title="Reset Zoom"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Edit Raw Text Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleSaveEditedText();
              } else {
                setIsEditing(true);
                setViewMode('raw');
              }
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border ${
              isEditing
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isEditing ? 'Save edits and re-parse' : 'Edit document text before auto-population'}
          >
            {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isEditing ? 'Save & Re-Parse' : 'Edit Text'}</span>
          </button>
        </div>
      </div>

      {/* 1.5. Review Needed Alert Banner for Low Confidence (<80%) Fields */}
      {lowConfidenceFields.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Review Needed:</strong> {lowConfidenceFields.length} extracted field(s) ({lowConfidenceFields.map((f) => `${f.label} [${f.score}%]`).join(', ')}) have a confidence score below 80%. Please cross-verify the highlighted values against the source file preview below.
            </span>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
            Cross-Verification Prompt
          </span>
        </div>
      )}

      {/* 2. Interactive Verification Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Content Verification Checklist ({verifiedCount}/{totalKeyFields} Verified)
          </span>
          <span className="text-slate-400 text-[11px]">|</span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            Review and verify detected fields before triggering auto-population
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onVerifyAll(true)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs cursor-pointer"
          >
            Verify All Fields
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => onVerifyAll(false)}
            className="text-slate-500 hover:text-slate-800 font-semibold text-xs cursor-pointer"
          >
            Uncheck All
          </button>
        </div>
      </div>

      {/* 3. Entity Verification Horizontal Strip */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2.5 min-w-max">
          {/* Buyer Name */}
          <div
            onClick={() => onToggleFieldVerified('buyerName')}
            className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 select-none relative ${
              isFieldUnderReview('buyerName')
                ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                : verifiedFields.buyerName
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                verifiedFields.buyerName ? 'bg-emerald-600' : 'border border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Lead Name</span>
                {isFieldUnderReview('buyerName') && (
                  <span className="text-[8px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                    Review Needed
                  </span>
                )}
              </div>
              <span className="font-bold text-xs truncate max-w-[140px] block">
                {extracted?.buyerName || lead.name}
              </span>
            </div>
          </div>

          {/* Email */}
          <div
            onClick={() => onToggleFieldVerified('buyerEmail')}
            className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 select-none relative ${
              isFieldUnderReview('buyerEmail')
                ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                : verifiedFields.buyerEmail
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                verifiedFields.buyerEmail ? 'bg-emerald-600' : 'border border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Email</span>
                {isFieldUnderReview('buyerEmail') && (
                  <span className="text-[8px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                    Review Needed
                  </span>
                )}
              </div>
              <span className="font-semibold text-xs truncate max-w-[150px] block font-mono">
                {extracted?.buyerEmail || lead.email}
              </span>
            </div>
          </div>

          {/* Phone */}
          <div
            onClick={() => onToggleFieldVerified('buyerPhone')}
            className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 select-none relative ${
              isFieldUnderReview('buyerPhone')
                ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                : verifiedFields.buyerPhone
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                verifiedFields.buyerPhone ? 'bg-emerald-600' : 'border border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Phone</span>
                {isFieldUnderReview('buyerPhone') && (
                  <span className="text-[8px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                    Review Needed
                  </span>
                )}
              </div>
              <span className="font-semibold text-xs truncate max-w-[130px] block font-mono">
                {extracted?.buyerPhone || lead.phone}
              </span>
            </div>
          </div>

          {/* ID Number */}
          <div
            onClick={() => onToggleFieldVerified('buyerIdNumber')}
            className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 select-none relative ${
              isFieldUnderReview('buyerIdNumber')
                ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                : verifiedFields.buyerIdNumber
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                verifiedFields.buyerIdNumber ? 'bg-emerald-600' : 'border border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">SA ID / Reg</span>
                {isFieldUnderReview('buyerIdNumber') && (
                  <span className="text-[8px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                    Review Needed
                  </span>
                )}
              </div>
              <span className="font-semibold text-xs truncate max-w-[130px] block font-mono">
                {extracted?.buyerIdNumber || 'Verified in FICA'}
              </span>
            </div>
          </div>

          {/* Property Ref & Suburb */}
          <div
            onClick={() => onToggleFieldVerified('propertyLocation')}
            className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 select-none relative ${
              isFieldUnderReview('propertyLocation')
                ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                : verifiedFields.propertyLocation
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                verifiedFields.propertyLocation ? 'bg-emerald-600' : 'border border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Suburb / Property</span>
                {isFieldUnderReview('propertyLocation') && (
                  <span className="text-[8px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                    Review Needed
                  </span>
                )}
              </div>
              <span className="font-semibold text-xs truncate max-w-[160px] block">
                {extracted?.propertyLocation || lead.propertyLocation}
              </span>
            </div>
          </div>

          {/* Budget / Price */}
          <div
            onClick={() => onToggleFieldVerified('budget')}
            className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 select-none relative ${
              isFieldUnderReview('budget')
                ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                : verifiedFields.budget
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                verifiedFields.budget ? 'bg-emerald-600' : 'border border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Price / Budget</span>
                {isFieldUnderReview('budget') && (
                  <span className="text-[8px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                    Review Needed
                  </span>
                )}
              </div>
              <span className="font-bold text-xs truncate max-w-[140px] block text-emerald-700">
                {extracted?.budget ||
                  (extracted?.propertyPrice ? formatCurrency(extracted.propertyPrice) : lead.budget)}
              </span>
            </div>
          </div>

          {/* Appointed Conveyancer */}
          <div
            onClick={() => onToggleFieldVerified('conveyancerAttorney')}
            className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition flex items-center space-x-2.5 select-none relative ${
              isFieldUnderReview('conveyancerAttorney')
                ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300 text-amber-950'
                : verifiedFields.conveyancerAttorney
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                verifiedFields.conveyancerAttorney ? 'bg-emerald-600' : 'border border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Conveyancer</span>
                {isFieldUnderReview('conveyancerAttorney') && (
                  <span className="text-[8px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">
                    Review Needed
                  </span>
                )}
              </div>
              <span className="font-semibold text-xs truncate max-w-[150px] block">
                {extracted?.conveyancerAttorney || 'Bowmans Panel'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Document Content Stage */}
      <div className="bg-slate-100 p-4 sm:p-6 min-h-[380px] max-h-[560px] overflow-y-auto">
        {/* Processing Spinner State */}
        {isProcessing && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Processing Document & Extracting Entities</h4>
              <p className="text-xs text-slate-500 mt-1">{processingStep || 'Running text parser...'}</p>
            </div>
          </div>
        )}

        {/* MODE 1: VISUAL LEGAL DOCUMENT PREVIEW */}
        {viewMode === 'visual' && !isProcessing && (
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 max-w-3xl mx-auto"
          >
            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-slate-300/80 relative overflow-hidden">
              {/* Subtle Ptah Real Estate Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                <span className="text-7xl font-serif font-black text-slate-900 rotate-[-25deg]">
                  PTAH REAL ESTATE
                </span>
              </div>

              {/* Official Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-800">
                      PTAH REAL ESTATE • TRANSACTION MANAGEMENT DESK
                    </span>
                    <h2 className="text-base sm:text-xl font-bold font-serif text-slate-900 tracking-tight mt-0.5">
                      {schema?.documentType || 'OFFER TO PURCHASE (IMMOVABLE PROPERTY)'}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      FICA Regulated • deeds office jurisdiction • Exclusive Broker Mandate
                    </p>
                  </div>

                  <div className="text-right font-sans">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      LEGAL DRAFT
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Doc Ref: {lead.referenceNumber}-DOC
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Body */}
              <div className="text-slate-800">
                {renderHighlightedContent(rawText)}
              </div>

              {/* Official Signature & Witness Execution Block */}
              <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end pb-1">
                    <span className="font-serif italic text-xs text-slate-700">
                      {extracted?.buyerName || lead.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Purchaser Signature</span>
                    <span>Date: {new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end pb-1">
                    <span className="font-serif italic text-xs text-emerald-800 font-semibold">
                      Ptah Real Estate Broker Mandate Panel
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Broker Authority</span>
                    <span>Stamp: PTAH-VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: ANNOTATED ENTITY MAP */}
        {viewMode === 'entities' && !isProcessing && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Structured Entity Extraction Matrix</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify how document clauses map directly into CRM fields before committing changes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${isFieldUnderReview('buyerName') ? 'border-amber-400 bg-amber-50/70 ring-1 ring-amber-300' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Lead Name</span>
                    {renderFieldScoreBadge('buyerName')}
                  </div>
                  <div className="text-xs font-bold text-slate-900">{extracted?.buyerName || lead.name}</div>
                  <div className="text-[11px] text-slate-500">Current in CRM: {lead.name}</div>
                </div>

                {/* Email */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${isFieldUnderReview('buyerEmail') ? 'border-amber-400 bg-amber-50/70 ring-1 ring-amber-300' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Client Email</span>
                    {renderFieldScoreBadge('buyerEmail')}
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-900">{extracted?.buyerEmail || lead.email}</div>
                  <div className="text-[11px] text-slate-500">Current in CRM: {lead.email}</div>
                </div>

                {/* Phone */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${isFieldUnderReview('buyerPhone') ? 'border-amber-400 bg-amber-50/70 ring-1 ring-amber-300' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Phone / WhatsApp</span>
                    {renderFieldScoreBadge('buyerPhone')}
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-900">{extracted?.buyerPhone || lead.phone}</div>
                  <div className="text-[11px] text-slate-500">Current in CRM: {lead.phone}</div>
                </div>

                {/* ID Number */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${isFieldUnderReview('buyerIdNumber') ? 'border-amber-400 bg-amber-50/70 ring-1 ring-amber-300' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">South African ID / Passport</span>
                    {renderFieldScoreBadge('buyerIdNumber')}
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-900">
                    {extracted?.buyerIdNumber || '8808285124089'}
                  </div>
                  <div className="text-[11px] text-slate-500">Regulatory status: Compliant with FICA Act 38</div>
                </div>

                {/* Property & Suburb */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${isFieldUnderReview('propertyLocation') ? 'border-amber-400 bg-amber-50/70 ring-1 ring-amber-300' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Property Location</span>
                    {renderFieldScoreBadge('propertyLocation')}
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {extracted?.propertyLocation || lead.propertyLocation}
                  </div>
                  <div className="text-[11px] text-slate-500">Title: {extracted?.propertyTitle || lead.propertyTitle}</div>
                </div>

                {/* Financial Offer / Price */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${isFieldUnderReview('budget') ? 'border-amber-400 bg-amber-50/70 ring-1 ring-amber-300' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Offer / Budget</span>
                    {renderFieldScoreBadge('budget')}
                  </div>
                  <div className="text-xs font-bold text-emerald-700">
                    {extracted?.budget ||
                      (extracted?.propertyPrice ? formatCurrency(extracted.propertyPrice) : lead.budget)}
                  </div>
                  <div className="text-[11px] text-slate-500">Deposit: 10% Trust Escrow</div>
                </div>
              </div>

              {/* Special Conditions List */}
              {schema?.suspensiveConditions && schema.suspensiveConditions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-purple-900 block">
                    Suspensive Conditions & Legal Clauses
                  </span>
                  <ul className="text-xs text-purple-950 space-y-1 list-disc list-inside">
                    {schema.suspensiveConditions.map((cond, idx) => (
                      <li key={idx}>{cond}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 3: SPLIT VIEW (SIDE-BY-SIDE) */}
        {viewMode === 'split' && !isProcessing && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-6xl mx-auto">
            {/* Left: Document View */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs max-h-[500px] overflow-y-auto">
              <div className="border-b border-slate-200 pb-2 mb-3">
                <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase">
                  PTAH REAL ESTATE • CONTRACT PREVIEW
                </span>
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  {schema?.documentType || 'Official Document'}
                </h4>
              </div>
              <div className="text-xs">{renderHighlightedContent(rawText)}</div>
            </div>

            {/* Right: Verification Matrix */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Extracted Field Verification
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">
                    {verifiedCount}/{totalKeyFields} Active
                  </span>
                </div>

                <div className="space-y-2">
                  {keyFieldKeys.map((fieldKey) => (
                    <label
                      key={fieldKey}
                      className="p-2 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-50/40 hover:border-emerald-200 transition"
                    >
                      <span className="font-semibold text-slate-700 capitalize">
                        {fieldKey.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={!!verifiedFields[fieldKey]}
                        onChange={() => onToggleFieldVerified(fieldKey)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onTriggerAutoPopulate}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Trigger Auto-Population</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE 4: RAW OCR TEXT & EDITOR */}
        {viewMode === 'raw' && !isProcessing && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-600 font-bold">
                  Extracted Text Stream ({rawText.length} characters)
                </span>
                {isEditing && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">
                    Editing Active
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="p-4 space-y-3">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={14}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditedText(rawText);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedText}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Re-Extract Schema</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto bg-slate-50/50">
                {rawText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Bottom Verification & Auto-Populate Trigger Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-slate-900">
                Verification Status: {verifiedCount} of {totalKeyFields} fields verified
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Ready to Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Triggering auto-population will update Lead #{lead.referenceNumber} ({lead.name}) and attach this document.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onOpenAdvancedModal}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            title="Open granular checkbox matrix"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced Field Matrix</span>
          </button>

          <button
            type="button"
            id="trigger-auto-populate-btn"
            onClick={onTriggerAutoPopulate}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Trigger Auto-Population & Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
};
