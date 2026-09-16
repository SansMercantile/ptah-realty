import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Link,
  Copy,
  Check,
  Send,
  Upload,
  FileText,
  Clock,
  Sparkles,
  QrCode,
  Smartphone,
  Mail,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  Camera,
  X,
  RefreshCw,
  Lock,
  Building
} from 'lucide-react';
import { Lead, ClientDocumentRequestSession, ClientDocumentRequestItem } from '../types';
import { extractTextFromFile, ExtractionResult, parseTextToStructuredData } from '../utils/documentParser';

interface ClientRequestPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Passed by LeadDocumentConverter.tsx; declared here so the two
  // demo components actually type-match each other.
  onDocumentsReceived?: (newDocs: any) => void;
  lead: Lead;
  // Optional: LeadDocumentConverter opens this modal without it and
  // handles the returned docs via onDocumentsReceived instead.
  onUpdateLead?: (updatedLead: Lead) => void;
  onDocumentUploadedAndParsed?: (parsedSchema: any, fileName: string) => void;
}

export const ClientRequestPortalModal: React.FC<ClientRequestPortalModalProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdateLead,
  onDocumentUploadedAndParsed,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [expiryHours, setExpiryHours] = useState(48);
  const [notes, setNotes] = useState('Kindly upload high-resolution or certified copies of the requested compliance documents.');
  const [items, setItems] = useState<ClientDocumentRequestItem[]>([
    {
      id: 'item-fica',
      title: 'South African ID Card or Passport',
      category: 'fica',
      description: 'Clear photograph or scan of valid green ID book, smart card (both sides), or international passport.',
      required: true,
      status: 'pending',
    },
    {
      id: 'item-address',
      title: 'Proof of Residential Address',
      category: 'address',
      description: 'Municipal utility bill, bank statement, or Telkom bill issued within the last 3 months.',
      required: true,
      status: 'pending',
    },
    {
      id: 'item-funds',
      title: 'Proof of Funds / Bank Facility Letter',
      category: 'banking',
      description: '3 months official bank statements or private wealth portfolio letter demonstrating purchase liquidity.',
      required: true,
      status: 'pending',
    },
    {
      id: 'item-tax',
      title: 'SARS Tax Compliance PIN / Clearance',
      category: 'tax',
      description: 'Official SARS eFiling Tax Compliance PIN number or good standing certificate.',
      required: false,
      status: 'pending',
    },
  ]);

  const [activeViewMode, setActiveViewMode] = useState<'invite' | 'client_preview'>('invite');
  const [sessionId, setSessionId] = useState<string>(() => `req-${lead.id.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString(36)}`);
  const [clientUploadingItem, setClientUploadingItem] = useState<string | null>(null);
  const [uploadSuccessItem, setUploadSuccessItem] = useState<string | null>(null);
  const [simulatedClientUploadedFiles, setSimulatedClientUploadedFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ptah-realty.app';
  const shareableUrl = `${originUrl}/portal/upload/${sessionId}?lead=${encodeURIComponent(lead.name)}&ref=${encodeURIComponent(lead.referenceNumber)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleItemRequired = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, required: !item.required } : item))
    );
  };

  const handleToggleItemInclude = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAndSend = () => {
    const session: ClientDocumentRequestSession = {
      id: sessionId,
      leadId: lead.id,
      leadName: lead.name,
      leadEmail: lead.email,
      leadPhone: lead.phone,
      requestedAt: new Date().toISOString(),
      requestedBy: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      status: 'pending',
      shareUrl: shareableUrl,
      items,
      notes,
    };

    const existingRequests = lead.documentRequests || [];
    const updatedLead: Lead = {
      ...lead,
      documentRequests: [session, ...existingRequests],
    };

    onUpdateLead?.(updatedLead);
    handleCopyLink();
  };

  // Client Simulation: When a file or photo is uploaded directly through the client view
  const handleClientFileUpload = async (itemId: string, file: File) => {
    setClientUploadingItem(itemId);
    try {
      const extraction: ExtractionResult = await extractTextFromFile(file);
      const parsedSchema = parseTextToStructuredData(extraction.rawText, lead, file.name);

      setSimulatedClientUploadedFiles((prev) => ({
        ...prev,
        [itemId]: file.name,
      }));

      // Update item status
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: 'uploaded', uploadedFileName: file.name, uploadedAt: new Date().toISOString() } : i))
      );

      // Create new document entry in lead
      const nowIso = new Date().toISOString();
      const newDoc = {
        id: `doc-client-${Date.now()}`,
        fileName: file.name,
        fileType: extraction.fileType,
        fileSizeKb: Math.round(file.size / 1024) || 120,
        uploadedAt: nowIso,
        uploadedBy: `Client Upload (${lead.name})`,
        category: (itemId.includes('fica') ? 'fica_id' : itemId.includes('funds') ? 'financial' : 'other') as any,
        rawTextPreview: extraction.rawText,
        imageUrl: extraction.imagePreviewUrl,
        schema: parsedSchema,
        isPopulated: true,
        populatedAt: nowIso,
      };

      const existingDocs = lead.documents || [];
      const updatedLead: Lead = {
        ...lead,
        documents: [newDoc, ...existingDocs],
      };
      onUpdateLead?.(updatedLead);

      if (onDocumentUploadedAndParsed) {
        onDocumentUploadedAndParsed(parsedSchema, file.name);
      }

      setUploadSuccessItem(itemId);
      setTimeout(() => setUploadSuccessItem(null), 4000);
    } catch (err) {
      console.error('Client upload error:', err);
    } finally {
      setClientUploadingItem(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Client Document Request Portal
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Secure Tokenized Link
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate a branded client intake portal for <strong className="text-slate-800 dark:text-slate-200">{lead.name}</strong> ({lead.referenceNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveViewMode('invite')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeViewMode === 'invite'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Broker Setup
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('client_preview')}
                className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
                  activeViewMode === 'client_preview'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Client View</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeViewMode === 'invite' ? (
            <>
              {/* Unique Secure Link Box */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Time-Sensitive Client Upload URL
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Expires in</span>
                    <select
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value={24}>24 Hours</option>
                      <option value={48}>48 Hours (Recommended)</option>
                      <option value={72}>72 Hours</option>
                      <option value={168}>7 Days</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hi ${lead.name}, here is your secure Ptah Real Estate portal link to upload your required compliance documents: ${shareableUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold hover:bg-emerald-100 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Send via WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:${lead.email}?subject=${encodeURIComponent(
                      `Ptah Real Estate: Secure Document Upload for ${lead.propertyTitle}`
                    )}&body=${encodeURIComponent(
                      `Dear ${lead.name},\n\nPlease access your secure client portal link below to upload your FICA and transaction documents:\n${shareableUrl}\n\nKind regards,\n${lead.assignedAgent?.name || 'Ptah Real Estate'}`
                    )}`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-200 transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email Link</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setActiveViewMode('client_preview')}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold hover:bg-indigo-100 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Simulate Client Upload</span>
                  </button>
                </div>
              </div>

              {/* Requested Documents Checklist Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Requested Documents & FICA Checklist
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Client can upload PDF, DOCX, and high-res photos/images
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                          {item.category === 'fica' ? (
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                          ) : item.category === 'address' ? (
                            <Building className="w-4 h-4 text-blue-600" />
                          ) : item.category === 'banking' ? (
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            {item.required ? (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                                Mandatory
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleItemRequired(item.id)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                            item.required
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200'
                          }`}
                        >
                          {item.required ? 'Make Optional' : 'Make Required'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions to Client */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Client Instructions / Security Notice
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            /* CLIENT LIVE PREVIEW / SIMULATION INTERFACE */
            <div className="space-y-6">
              {/* Branded Client Header */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">
                        Ptah Luxury Real Estate
                      </span>
                    </div>
                    <span className="flex items-center space-x-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-emerald-300 border border-emerald-400/30">
                      <Lock className="w-3 h-3" />
                      <span>256-Bit Encrypted Upload</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold pt-2">
                    Welcome, {lead.name}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    Please upload your compliance documentation for{' '}
                    <strong className="text-white">{lead.propertyTitle}</strong>. Your documents are transmitted directly into our secure underwriter repository and automatically verified.
                  </p>
                </div>
              </div>

              {/* Client Checklist & Dropzones */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Required Documentation ({items.filter((i) => i.required).length} Mandatory)
                </h4>

                <div className="space-y-3">
                  {items.map((item) => {
                    const uploadedName = simulatedClientUploadedFiles[item.id];
                    const isUploading = clientUploadingItem === item.id;
                    const isSuccess = uploadSuccessItem === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          uploadedName
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.title}
                              </span>
                              {item.required && (
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                                  *Required
                                </span>
                              )}
                              {uploadedName && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Verified in CRM</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.description}
                            </p>
                            {uploadedName && (
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-1 pt-1">
                                <FileText className="w-3 h-3" /> {uploadedName}
                              </p>
                            )}
                          </div>

                          {/* Upload Action */}
                          <div>
                            <label className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition">
                              {isUploading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Parsing Document...</span>
                                </>
                              ) : uploadedName ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Re-upload</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Choose File / Photo</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.heic"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleClientFileUpload(item.id, file);
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {isSuccess && (
                          <div className="mt-3 p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2 animate-in fade-in">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span>
                              Document automatically parsed via Vision AI & added to lead dossier!
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Encrypted transmission to Ptah CRM Underwriter API</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>

            {activeViewMode === 'invite' && (
              <button
                type="button"
                onClick={handleSaveAndSend}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Portal URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Link className="w-3.5 h-3.5" />
                    <span>Copy Portal Link & Save</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
