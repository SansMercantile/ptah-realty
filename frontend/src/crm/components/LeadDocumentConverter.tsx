import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileCheck, 
  Layers, 
  Plus, 
  ArrowRight, 
  Check, 
  Trash2, 
  Eye, 
  Download, 
  FolderOpen,
  FileCode,
  ShieldCheck,
  Building,
  DollarSign,
  UserCheck,
  Calendar,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Info,
  Copy,
  Search,
  RefreshCw,
  Sliders,
  FileSpreadsheet,
  RotateCcw,
  Camera
} from 'lucide-react';
import { Lead, LeadDocument, DocumentExtractedSchema, LeadStatus, TaskItem, ActivityLogItem, UrgencyLevel, DocumentParseEvent } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { extractTextFromFile, parseTextToStructuredData, ExtractionResult } from '../utils/documentParser';
import { InteractiveDocumentViewer } from './InteractiveDocumentViewer';
import { ClientRequestPortalModal } from './ClientRequestPortalModal';
import { CameraCaptureModal } from './CameraCaptureModal';

export interface BatchQueueItem {
  id: string;
  file?: File;
  name: string;
  sizeKb: number;
  type: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  confidenceScore?: number;
  schema?: DocumentExtractedSchema;
  rawText?: string;
  error?: string;
}

interface LeadDocumentConverterProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
  initialCapturedFile?: File | null;
  onCapturedFileProcessed?: () => void;
}

export const getEffectiveParseHistory = (currentLead: Lead): DocumentParseEvent[] => {
  if (currentLead.parseHistory && currentLead.parseHistory.length > 0) {
    return currentLead.parseHistory.slice(0, 5);
  }
  const now = Date.now();
  return [
    {
      id: `parse-${currentLead.id}-1`,
      timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
      leadId: currentLead.id,
      fileName: 'Signed_OTP_Clifton_Horizon_V3.pdf',
      fileType: 'application/pdf',
      fileSizeKb: 342,
      documentType: 'Offer to Purchase (OTP)',
      confidenceScore: 96,
      fieldConfidenceScores: {
        buyerName: 98,
        buyerEmail: 95,
        buyerPhone: 92,
        buyerIdNumber: 96,
        propertyTitle: 99,
        propertyRef: 97,
        propertyLocation: 98,
        propertyPrice: 95,
        conveyancerAttorney: 95,
      },
      extractedFields: {
        buyerName: currentLead.name,
        buyerEmail: currentLead.email,
        buyerPhone: currentLead.phone,
        buyerIdNumber: '8808285124089',
        buyerType: 'Cash Buyer',
        propertyTitle: currentLead.propertyTitle,
        propertyRef: currentLead.propertyRef,
        propertyLocation: currentLead.propertyLocation,
        propertyPrice: currentLead.propertyPrice || 42500000,
        budget: 'R 42,500,000.00',
        timeframe: 'Immediate (< 30 days)',
        conveyancerAttorney: 'Bowmans Conveyancers & Property Law Cape Town',
      },
      schema: {
        documentType: 'Offer to Purchase (OTP)',
        confidenceScore: 96,
        extractedFields: {
          buyerName: currentLead.name,
          buyerEmail: currentLead.email,
          buyerPhone: currentLead.phone,
          buyerIdNumber: '8808285124089',
          buyerType: 'Cash Buyer',
          propertyTitle: currentLead.propertyTitle,
          propertyRef: currentLead.propertyRef,
          propertyLocation: currentLead.propertyLocation,
          propertyPrice: currentLead.propertyPrice || 42500000,
          budget: 'R 42,500,000.00',
          timeframe: 'Immediate (< 30 days)',
          conveyancerAttorney: 'Bowmans Conveyancers & Property Law Cape Town',
        },
        suggestedTasks: [
          { title: 'Verify 10% cash deposit transfer to Bowmans Trust', priority: 'urgent' as UrgencyLevel, dueDate: new Date(now + 7 * 86400000).toISOString(), type: 'contract' },
          { title: 'Request Beetle & Electrical Compliance Certificates', priority: 'high' as UrgencyLevel, dueDate: new Date(now + 14 * 86400000).toISOString(), type: 'contract' }
        ],
        suggestedNotes: ['Client signed exclusive unconditional cash offer with 10% deposit.'],
        suggestedStatus: 'offer_submitted',
        documentSummary: 'Executed Offer to Purchase for Clifton luxury villa at R42.5M with 10% deposit.',
      },
      rawTextPreview: `OFFER TO PURCHASE (IMMOVABLE PROPERTY)\nPURCHASER: ${currentLead.name}\nID: 8808285124089\nPROPERTY: Erf 1409 Clifton (${currentLead.propertyTitle})\nPURCHASE PRICE: R 42,500,000.00\nDEPOSIT: 10% payable to Bowmans Conveyancers Trust Account.`,
      sourceType: 'upload',
      isApplied: true,
      appliedAt: new Date(now - 1000 * 60 * 40).toISOString(),
    },
    {
      id: `parse-${currentLead.id}-2`,
      timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      leadId: currentLead.id,
      fileName: 'Investec_Private_Bank_Facility_PreApproval.pdf',
      fileType: 'application/pdf',
      fileSizeKb: 188,
      documentType: 'Mortgage Pre-Approval',
      confidenceScore: 91,
      fieldConfidenceScores: {
        buyerName: 94,
        buyerEmail: 92,
        buyerPhone: 90,
        propertyPrice: 93,
        budget: 92,
      },
      extractedFields: {
        buyerName: currentLead.name,
        buyerEmail: currentLead.email,
        buyerPhone: currentLead.phone,
        buyerType: 'Pre-approved Mortgage',
        propertyTitle: currentLead.propertyTitle,
        propertyPrice: 35000000,
        budget: 'R 35,000,000.00 facility',
        timeframe: '1 - 3 Months',
      },
      schema: {
        documentType: 'Mortgage Pre-Approval',
        confidenceScore: 91,
        extractedFields: {
          buyerName: currentLead.name,
          buyerEmail: currentLead.email,
          buyerPhone: currentLead.phone,
          buyerType: 'Pre-approved Mortgage',
          propertyTitle: currentLead.propertyTitle,
          propertyPrice: 35000000,
          budget: 'R 35,000,000.00 facility',
          timeframe: '1 - 3 Months',
        },
        suggestedTasks: [
          { title: 'Submit signed OTP to Investec panel legal team', priority: 'high' as UrgencyLevel, dueDate: new Date(now + 10 * 86400000).toISOString(), type: 'contract' }
        ],
        suggestedNotes: ['Investec Private Bank pre-approved mortgage facility of R35M @ Prime - 1.15%.'],
        suggestedStatus: 'qualified',
        documentSummary: 'Investec Private Bank mortgage pre-approval facility certificate.',
      },
      rawTextPreview: `INVESTEC PRIVATE BANK - MORTGAGE FINANCE PRE-APPROVAL CERTIFICATE\nCLIENT: ${currentLead.name}\nFACILITY: R 35,000,000.00\nINTEREST RATE: Prime less 1.15%\nLOAN-TO-VALUE: 80%`,
      sourceType: 'upload',
      isApplied: true,
      appliedAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: `parse-${currentLead.id}-3`,
      timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      leadId: currentLead.id,
      fileName: 'FICA_ID_Document_Compliance_Dossier.pdf',
      fileType: 'application/pdf',
      fileSizeKb: 512,
      documentType: 'FICA / KYC Dossier',
      confidenceScore: 88,
      fieldConfidenceScores: {
        buyerName: 95,
        buyerIdNumber: 97,
        propertyLocation: 86,
      },
      extractedFields: {
        buyerName: currentLead.name,
        buyerIdNumber: '8808285124089',
        propertyLocation: 'Bantry Bay, Cape Town',
        buyerType: 'Cash Buyer',
      },
      schema: {
        documentType: 'FICA / KYC Dossier',
        confidenceScore: 88,
        extractedFields: {
          buyerName: currentLead.name,
          buyerIdNumber: '8808285124089',
          propertyLocation: 'Bantry Bay, Cape Town',
          buyerType: 'Cash Buyer',
        },
        suggestedTasks: [
          { title: 'Archive verified FICA ID & proof of residence in Ptah compliance vault', priority: 'medium' as UrgencyLevel, dueDate: new Date(now + 5 * 86400000).toISOString(), type: 'contract' }
        ],
        suggestedNotes: ['FICA clearance verified. Certified SA Green ID and municipal proof of address valid.'],
        suggestedStatus: 'qualified',
        documentSummary: 'FICA statutory KYC verification compliance dossier and proof of residence.',
      },
      rawTextPreview: `PTAH STATUTORY FICA & KYC COMPLIANCE CLEARANCE\nCLIENT: ${currentLead.name}\nID NUMBER: 8808285124089\nPROOF OF RESIDENCE: 12 Ocean View Drive, Bantry Bay\nRISK CATEGORY: Low Risk`,
      sourceType: 'upload',
      isApplied: false,
    },
    {
      id: `parse-${currentLead.id}-4`,
      timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      leadId: currentLead.id,
      fileName: 'Portal_Inquiry_Requirements_Sheet.txt',
      fileType: 'text/plain',
      fileSizeKb: 14,
      documentType: 'Property Inquiry Note',
      confidenceScore: 82,
      fieldConfidenceScores: {
        buyerName: 90,
        buyerEmail: 88,
        buyerPhone: 85,
        propertyTitle: 86,
        budget: 78,
      },
      extractedFields: {
        buyerName: currentLead.name,
        buyerEmail: currentLead.email,
        buyerPhone: currentLead.phone,
        propertyTitle: currentLead.propertyTitle,
        budget: currentLead.budget,
        timeframe: '1 - 3 Months',
      },
      schema: {
        documentType: 'Property Inquiry Note',
        confidenceScore: 82,
        extractedFields: {
          buyerName: currentLead.name,
          buyerEmail: currentLead.email,
          buyerPhone: currentLead.phone,
          propertyTitle: currentLead.propertyTitle,
          budget: currentLead.budget,
          timeframe: '1 - 3 Months',
        },
        suggestedNotes: ['Inbound inquiry via Property24 luxury showcase.'],
        suggestedStatus: 'contacted',
        documentSummary: 'Inbound digital inquiry form and property requirement checklist.',
      },
      rawTextPreview: `INBOUND LEAD INQUIRY: ${currentLead.name} (${currentLead.email})\nInterested in luxury properties in Atlantic Seaboard.\nBudget range: ${currentLead.budget}`,
      sourceType: 'upload',
      isApplied: false,
    },
    {
      id: `parse-${currentLead.id}-5`,
      timestamp: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      leadId: currentLead.id,
      fileName: 'Draft_Mandate_Agreement_V1.pdf',
      fileType: 'application/pdf',
      fileSizeKb: 410,
      documentType: 'Draft Mandate',
      confidenceScore: 68,
      fieldConfidenceScores: {
        buyerName: 75,
        propertyTitle: 72,
        propertyPrice: 65,
        conveyancerAttorney: 60,
      },
      extractedFields: {
        buyerName: currentLead.name,
        propertyTitle: currentLead.propertyTitle,
        propertyPrice: 40000000,
        budget: 'R 40,000,000.00',
      },
      schema: {
        documentType: 'Draft Mandate',
        confidenceScore: 68,
        extractedFields: {
          buyerName: currentLead.name,
          propertyTitle: currentLead.propertyTitle,
          propertyPrice: 40000000,
          budget: 'R 40,000,000.00',
        },
        suggestedNotes: ['Initial draft mandate with manual notes requiring agent verification.'],
        suggestedStatus: 'new',
        documentSummary: 'Preliminary draft exclusive mandate with handwritten clauses.',
      },
      rawTextPreview: `DRAFT EXCLUSIVE MANDATE AGREEMENT\nSELLER / PURCHASER: ${currentLead.name}\nPRELIMINARY ESTIMATE: R 40,000,000\nCLAUSES PENDING ATTORNEY VERIFICATION`,
      sourceType: 'upload',
      isApplied: false,
    },
  ];
};

export const LeadDocumentConverter: React.FC<LeadDocumentConverterProps> = ({
  lead,
  onUpdateLead,
  initialCapturedFile,
  onCapturedFileProcessed,
}) => {
  const [activeConverterTab, setActiveConverterTab] = useState<'parser' | 'batch_queue' | 'history'>('parser');
  const [batchQueue, setBatchQueue] = useState<BatchQueueItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [isInternalCameraOpen, setIsInternalCameraOpen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [extractedSchema, setExtractedSchema] = useState<DocumentExtractedSchema | null>(null);
  const [currentFileMeta, setCurrentFileMeta] = useState<{ name: string; sizeKb: number; type: string; method?: string } | null>(null);
  const [rawTextPreview, setRawTextPreview] = useState<string>('');
  const [showSchemaPreviewModal, setShowSchemaPreviewModal] = useState(false);
  const [modalTab, setModalTab] = useState<'fields' | 'raw_text' | 'json'>('fields');
  const [viewingDoc, setViewingDoc] = useState<LeadDocument | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [rawTextSearch, setRawTextSearch] = useState('');

  // Field selection state for auto-populating
  const [selectedFields, setSelectedFields] = useState<{
    buyerName: boolean;
    buyerEmail: boolean;
    buyerPhone: boolean;
    buyerIdNumber: boolean;
    buyerType: boolean;
    propertyTitle: boolean;
    propertyRef: boolean;
    propertyLocation: boolean;
    propertyPrice: boolean;
    budget: boolean;
    timeframe: boolean;
    conveyancerAttorney: boolean;
    tasks: boolean;
    notes: boolean;
    status: boolean;
    suspensiveConditions: boolean;
  }>({
    buyerName: true,
    buyerEmail: true,
    buyerPhone: true,
    buyerIdNumber: true,
    buyerType: true,
    propertyTitle: true,
    propertyRef: true,
    propertyLocation: true,
    propertyPrice: true,
    budget: true,
    timeframe: true,
    conveyancerAttorney: true,
    tasks: true,
    notes: true,
    status: true,
    suspensiveConditions: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);

  // Field verification state for pre-population interactive verification
  const [verifiedFields, setVerifiedFields] = useState<Record<string, boolean>>({
    buyerName: true,
    buyerEmail: true,
    buyerPhone: true,
    buyerIdNumber: true,
    propertyTitle: true,
    propertyLocation: true,
    budget: true,
    conveyancerAttorney: true,
  });

  const handleToggleFieldVerified = (fieldKey: string) => {
    setVerifiedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const handleVerifyAll = (val: boolean) => {
    setVerifiedFields({
      buyerName: val,
      buyerEmail: val,
      buyerPhone: val,
      buyerIdNumber: val,
      propertyTitle: val,
      propertyLocation: val,
      budget: val,
      conveyancerAttorney: val,
    });
  };

  const handleUpdateRawText = (newText: string) => {
    setRawTextPreview(newText);
    const reExtracted = parseTextToStructuredData(newText, lead, currentFileMeta?.name || 'Document');
    setExtractedSchema(reExtracted);
    setSuccessMessage(`Document content edited. Review verified fields before triggering auto-population.`);
  };

  const handlePreviewAttachedDoc = (doc: LeadDocument) => {
    setCurrentFileMeta({
      name: doc.fileName,
      sizeKb: doc.fileSizeKb,
      type: doc.fileType,
      method: 'archive_schema',
    });
    setRawTextPreview(doc.rawTextPreview || '');
    setExtractedSchema(doc.schema || parseTextToStructuredData(doc.rawTextPreview || '', lead, doc.fileName));
    setSelectedPreset(null);
    previewAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Real estate document presets for fast 1-click testing
  const DOCUMENT_PRESETS = [
    {
      id: 'otp',
      title: 'Signed Offer to Purchase (OTP)',
      subtitle: 'Clifton Horizon - R42,500,000 (10% Deposit, 21-Day Bond Clause)',
      icon: FileCheck,
      color: 'emerald',
      badge: 'Legal Contract',
      sampleText: `OFFER TO PURCHASE (IMMOVABLE PROPERTY)
SELLER: Clifton Vista Holdings (Pty) Ltd (Reg: 2018/491023/07)
PURCHASER: Alexander Sterling (ID: 8808285124089)
EMAIL: alex.sterling@luminarycap.com
MOBILE: +27 82 443 8901
ADDRESS: 12 Ocean View Drive, Bantry Bay, Cape Town, 8005
PROPERTY: Erf 1409 Clifton, City of Cape Town, Western Cape (Known as 'The Clifton Horizon: 5-Bed Architectural Villa')
PURCHASE PRICE: R 42,500,000.00 (Forty Two Million Five Hundred Thousand Rand)
DEPOSIT: R 4,250,000.00 (10%) payable within 7 business days to Bowmans Conveyancers Trust Account.
BALANCE: Liquid private bank funds payable upon registration of transfer.
OCCUPATION DATE: On registration of transfer at Deeds Registry Cape Town.
APPOINTED CONVEYANCERS: Bowmans Conveyancers & Property Law Cape Town (Ref: BOW-CPT-8804).
SPECIAL CONDITIONS & SUSPENSIVE CLAUSES:
1. Seller to furnish valid Beetle, Electrical, Gas, and Electric Fence Compliance Certificates within 14 days.
2. Included in purchase: Bespoke Bang & Olufsen integrated AV systems, custom Roche Bobois architectural fixtures, automated wine cellar climate systems.
3. Purchaser warrants liquid funds are unencumbered and derived from registered asset management operations.
COMMISSION: 5.0% + VAT payable to Ptah Real Estate as exclusive mandate brokers.`,
    },
    {
      id: 'bond',
      title: 'Investec Private Bank Pre-Approval',
      subtitle: 'Facility: R35,000,000 @ Prime - 1.15% (Valid 90 Days)',
      icon: DollarSign,
      color: 'blue',
      badge: 'Banking & Finance',
      sampleText: `INVESTEC PRIVATE BANK - MORTGAGE FINANCE PRE-APPROVAL CERTIFICATE
DATE OF ISSUE: 2026-08-28
CLIENT NAME: Alexander Sterling (ID: 8808285124089)
CONTACT: alex.sterling@luminarycap.com | +27 82 443 8901
PRE-APPROVED MORTGAGE FACILITY: R 35,000,000.00 (Thirty Five Million Rand)
INTEREST RATE: Prime less 1.15% nominal per annum
LOAN-TO-VALUE: 80% (Client holds certified 20% liquid cash equity deposit of R10,000,000)
PREFERRED PROPERTY LOCATION: Clifton, Camps Bay, Bantry Bay, Cape Town
VALIDITY PERIOD: 90 Calendar Days from date of issue
CONDITIONS PRECEDENT:
1. Satisfactory formal valuation report from Investec Property Valuations Committee.
2. Submission of fully executed Offer to Purchase and formal conveyancer instructions to Investec panel legal team.
CREDIT UNDERWRITING STATUS: Approved (Category A1 High Net Worth Individual).`,
    },
    {
      id: 'fica',
      title: 'FICA & Statutory KYC Dossier',
      subtitle: 'Verified SA ID, SARS Tax PIN & Proof of Residence (Ptah KYC Compliant)',
      icon: ShieldCheck,
      color: 'purple',
      badge: 'FICA Compliance',
      sampleText: `PTAH REAL ESTATE STATUTORY FICA & KYC COMPLIANCE CLEARANCE CERTIFICATE
CLIENT / ENTITY NAME: Alexander Sterling (Luminary Capital Holdings)
IDENTITY NUMBER: 8808285124089
TAX REFERENCE NUMBER: 2712424189 (SARS Good Standing PIN: 8802-9910-3341)
NATIONALITY: South African
RESIDENTIAL ADDRESS: 12 Ocean View Drive, Bantry Bay, Cape Town, 8005
PROOF OF RESIDENCE: City of Cape Town Municipal Rates & Water Statement (< 60 days).
SOURCE OF WEALTH: Asset Management Earnings & Real Estate Investment Portfolio.
OCCUPATION / TITLE: Managing Partner & Founder, Luminary Capital Asset Management.
COMPLIANCE STATUS: Low Risk (Fully Verified under Financial Intelligence Centre Act No. 38 of 2001).
PEP / SANCTIONS CHECK: Clear (No adverse media hits or politically exposed ties).`,
    },
    {
      id: 'ptah_mandate',
      title: 'Ptah Bank Distress Mandate',
      subtitle: 'San Ridge Heights Midrand - R845,000 (Standard Bank EasySell)',
      icon: Building,
      color: 'amber',
      badge: 'Bank Relief / CDPA',
      sampleText: `PTAH REAL ESTATE BANK MANDATED DISTRESS PROPERTY ASSIGNMENT
REFERENCE NUMBER: MR639422
BANK PROGRAM: Standard Bank EasySell Distressed Assisted Sale
PROPERTY DESCRIPTION: Unit 402 San Ridge Heights, 483 6th Road, Erand Gardens, Midrand, Gauteng
ESTIMATED VALUATION / ASKING PRICE: R 845,000.00
PRIMARY OWNER CONTACT: Mrs Thembekile B Mbele (Phone: +27 60 329 8214, Email: boikanokhoali@gmail.com)
OCCUPANT DETAILS: Mr Thabo Khoali (Contact: +27 63 615 8598)
BANK RELIEF TERMS:
1. Standard Bank settles all outstanding municipal rates and taxes up to date of Deeds registration.
2. Zero transfer duties payable by purchaser on bank-mandated transfer.
3. 50% discount on conveyancing and bond registration fees via Standard Bank panel attorneys.
FEEDBACK DEADLINE: 14 Days from allocation.`,
    },
  ];

  // Initialize interactive preview with lead's first document or default preset
  useEffect(() => {
    if (!currentFileMeta && !extractedSchema) {
      if (lead.documents && lead.documents.length > 0) {
        const firstDoc = lead.documents[0];
        setCurrentFileMeta({
          name: firstDoc.fileName,
          sizeKb: firstDoc.fileSizeKb,
          type: firstDoc.fileType,
          method: 'archive_schema',
        });
        setRawTextPreview(firstDoc.rawTextPreview || '');
        setExtractedSchema(firstDoc.schema || parseTextToStructuredData(firstDoc.rawTextPreview || '', lead, firstDoc.fileName));
      } else {
        const preset = DOCUMENT_PRESETS[0];
        setCurrentFileMeta({
          name: `${preset.title}.pdf`,
          sizeKb: 245,
          type: 'application/pdf',
          method: 'preset_simulation',
        });
        setRawTextPreview(preset.sampleText);
        setExtractedSchema(parseTextToStructuredData(preset.sampleText, lead, `${preset.title}.pdf`));
      }
    }
  }, []);

  // Process initialCapturedFile when passed from external camera trigger
  useEffect(() => {
    if (initialCapturedFile) {
      handleProcessFile(initialCapturedFile);
      if (onCapturedFileProcessed) {
        onCapturedFileProcessed();
      }
    }
  }, [initialCapturedFile]);

  // Core processing workflow using text-extraction utility & AI API
  const processDocumentText = async (
    fileName: string,
    fileType: string,
    extractedText: string,
    sizeKb: number,
    method: string = 'text',
    presetId?: string,
    imageBase64?: string
  ) => {
    setIsProcessing(true);
    setProcessingStep('Extracting text & entities...');
    setCurrentFileMeta({ name: fileName, sizeKb, type: fileType, method });
    setRawTextPreview(extractedText);

    // 1. Instant deterministic heuristic parsing (0ms latency, works offline)
    const localStructuredSchema = parseTextToStructuredData(extractedText, lead, fileName);
    setExtractedSchema(localStructuredSchema);

    // 2. Enhance with server-side Gemini AI if available
    try {
      setProcessingStep('AI underwriter analyzing clauses & JSON schema...');
      const response = await fetch('/api/gemini/convert-document-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType,
          documentContent: extractedText,
          presetType: presetId,
          imageBase64,
          currentLead: {
            id: lead.id,
            referenceNumber: lead.referenceNumber,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            source: lead.source,
            status: lead.status,
            propertyTitle: lead.propertyTitle,
            propertyPrice: lead.propertyPrice,
            propertyLocation: lead.propertyLocation,
            budget: lead.budget,
            buyerType: lead.buyerType,
            timeframe: lead.timeframe,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.schema) {
          // Merge AI schema with local extraction for maximum fidelity
          setExtractedSchema({
            ...localStructuredSchema,
            ...data.schema,
            extractedFields: {
              ...localStructuredSchema.extractedFields,
              ...(data.schema.extractedFields || {}),
            },
          });
        }
      }
    } catch (err) {
      console.warn('Gemini endpoint offline or error, utilizing local deterministic extractor:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setSuccessMessage(`"${fileName}" loaded into interactive preview. Verify content below before triggering auto-population.`);
      setTimeout(() => {
        previewAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Process uploaded File (.pdf, .docx, .doc, .txt, .json, etc.)
  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingStep(`Parsing ${file.name} with text extraction engine...`);

    try {
      const result: ExtractionResult = await extractTextFromFile(file);
      const sizeKb = Math.max(1, Math.round(file.size / 1024));

      await processDocumentText(
        file.name,
        result.fileType,
        result.rawText,
        sizeKb,
        result.extractionMethod,
        undefined,
        result.imageBase64
      );
    } catch (err: any) {
      console.error('File parsing error:', err);
      alert('Error parsing document: ' + (err.message || 'Please check file format'));
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Handle Preset Click
  const handleSelectPreset = (preset: typeof DOCUMENT_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    processDocumentText(
      `${preset.title}.pdf`,
      'application/pdf',
      preset.sampleText,
      245,
      'preset_simulation',
      preset.id
    );
  };

  // Batch Queue Management & Multi-File Drag-and-Drop
  const handleAddFilesToBatch = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const newItems: BatchQueueItem[] = fileList.map((file, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      file,
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      type: file.type || 'application/pdf',
      status: 'queued',
      progress: 0,
    }));

    setBatchQueue((prev) => [...prev, ...newItems]);
    setActiveConverterTab('batch_queue');
    setSuccessMessage(`Added ${newItems.length} document(s) to the batch queue. Processing multi-page requirement documents...`);

    // Process batch items sequentially
    setIsProcessingBatch(true);
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      setBatchQueue((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, status: 'processing', progress: 30 } : b))
      );

      try {
        const result = await extractTextFromFile(item.file!);
        setBatchQueue((prev) =>
          prev.map((b) => (b.id === item.id ? { ...b, progress: 70, rawText: result.rawText } : b))
        );

        const structured = parseTextToStructuredData(result.rawText, lead, item.name);
        setBatchQueue((prev) =>
          prev.map((b) =>
            b.id === item.id
              ? {
                  ...b,
                  status: 'completed',
                  progress: 100,
                  confidenceScore: structured.confidenceScore,
                  schema: structured,
                  rawText: result.rawText,
                }
              : b
          )
        );
      } catch (err: any) {
        setBatchQueue((prev) =>
          prev.map((b) =>
            b.id === item.id
              ? { ...b, status: 'error', progress: 100, error: err.message || 'Text extraction failed' }
              : b
          )
        );
      }
    }
    setIsProcessingBatch(false);
  };

  // 1-Click Load Sample Multi-Document Batch (OTP + FICA + Pre-Approval)
  const handleLoadSampleBatch = () => {
    const samples: BatchQueueItem[] = [
      {
        id: `sample-batch-1-${Date.now()}`,
        name: 'Offer_To_Purchase_Executed_Clifton_42M.pdf',
        sizeKb: 384,
        type: 'application/pdf',
        status: 'completed',
        progress: 100,
        confidenceScore: 96,
        schema: parseTextToStructuredData(DOCUMENT_PRESETS[0].sampleText, lead, 'Offer_To_Purchase_Executed_Clifton_42M.pdf'),
        rawText: DOCUMENT_PRESETS[0].sampleText,
      },
      {
        id: `sample-batch-2-${Date.now()}`,
        name: 'Investec_Private_Bank_PreApproval_Facility.pdf',
        sizeKb: 192,
        type: 'application/pdf',
        status: 'completed',
        progress: 100,
        confidenceScore: 92,
        schema: parseTextToStructuredData(DOCUMENT_PRESETS[1].sampleText, lead, 'Investec_Private_Bank_PreApproval_Facility.pdf'),
        rawText: DOCUMENT_PRESETS[1].sampleText,
      },
      {
        id: `sample-batch-3-${Date.now()}`,
        name: 'Alexander_Sterling_FICA_KYC_ProofOfResidence.pdf',
        sizeKb: 450,
        type: 'application/pdf',
        status: 'completed',
        progress: 100,
        confidenceScore: 89,
        schema: parseTextToStructuredData(DOCUMENT_PRESETS[2].sampleText, lead, 'Alexander_Sterling_FICA_KYC_ProofOfResidence.pdf'),
        rawText: DOCUMENT_PRESETS[2].sampleText,
      },
    ];

    setBatchQueue((prev) => [...prev, ...samples]);
    setActiveConverterTab('batch_queue');
    setSuccessMessage('Loaded 3-document requirement batch (OTP + Pre-Approval + FICA Dossier). Ready for Bulk Apply.');
  };

  // Inspect or load a specific batch item into the interactive viewer
  const handleInspectBatchItem = (item: BatchQueueItem) => {
    if (!item.schema) return;
    setCurrentFileMeta({
      name: item.name,
      sizeKb: item.sizeKb,
      type: item.type,
      method: 'batch_queue_inspection',
    });
    setRawTextPreview(item.rawText || '');
    setExtractedSchema(item.schema);
    setActiveConverterTab('parser');
    previewAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSuccessMessage(`Loaded "${item.name}" from batch queue into the interactive preview.`);
  };

  // Remove individual batch item
  const handleRemoveBatchItem = (itemId: string) => {
    setBatchQueue((prev) => prev.filter((b) => b.id !== itemId));
  };

  // Clear entire batch queue
  const handleClearBatchQueue = () => {
    setBatchQueue([]);
  };

  // Bulk Apply All Completed Batch Documents
  const handleBulkApplyAll = () => {
    const completedItems = batchQueue.filter((b) => b.status === 'completed' && b.schema);
    if (completedItems.length === 0) {
      alert('No successfully processed documents available to apply in the batch queue.');
      return;
    }

    const nowIso = new Date().toISOString();
    let updatedLead = { ...lead };
    const newDocs: LeadDocument[] = [];
    const newParseEvents: DocumentParseEvent[] = [];

    // Aggregate extracted fields across completed batch items
    completedItems.forEach((item) => {
      const sch = item.schema!;
      const fields = sch.extractedFields;

      if (fields.buyerName) updatedLead.name = fields.buyerName;
      if (fields.buyerEmail) updatedLead.email = fields.buyerEmail;
      if (fields.buyerPhone) {
        updatedLead.phone = fields.buyerPhone;
        updatedLead.whatsappNumber = fields.buyerPhone;
      }
      if (fields.buyerType) updatedLead.buyerType = fields.buyerType as any;
      if (fields.propertyTitle) updatedLead.propertyTitle = fields.propertyTitle;
      if (fields.propertyRef) updatedLead.propertyRef = fields.propertyRef;
      if (fields.propertyLocation) updatedLead.propertyLocation = fields.propertyLocation;
      if (fields.propertyPrice) updatedLead.propertyPrice = fields.propertyPrice;
      if (fields.budget) updatedLead.budget = fields.budget;
      if (fields.timeframe) updatedLead.timeframe = fields.timeframe;
      if (sch.suggestedStatus) updatedLead.status = sch.suggestedStatus;

      // Append suggested tasks
      if (sch.suggestedTasks && sch.suggestedTasks.length > 0) {
        const tasksToAdd: TaskItem[] = sch.suggestedTasks.map((t, idx) => ({
          id: `task-batch-${Date.now()}-${idx}`,
          // leadId/leadName/propertyTitle/type are required on TaskItem but
          // were omitted by the demo -- filled from the real lead/schema
          // here rather than loosening TaskItem, so these auto-generated
          // tasks carry the same context as manually-created ones.
          leadId: lead.id,
          leadName: lead.name,
          propertyTitle: lead.propertyTitle,
          type: t.type,
          title: t.title,
          description: `Auto-generated from batch extraction (${item.name})`,
          dueDate: t.dueDate,
          priority: t.priority,
          status: 'pending',
          assignedTo: lead.assignedAgent?.name || 'Ptah Broker',
        }));
        updatedLead.tasks = [...(updatedLead.tasks || []), ...tasksToAdd];
      }

      // Add to LeadDocument library
      const newDoc: LeadDocument = {
        id: `doc-batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fileName: item.name,
        fileType: item.type,
        fileSizeKb: item.sizeKb,
        uploadedAt: nowIso,
        uploadedBy: lead.assignedAgent?.name || 'Ptah Broker',
        category: item.name.toLowerCase().includes('otp')
          ? 'otp_contract'
          : item.name.toLowerCase().includes('preapproval') || item.name.toLowerCase().includes('bond')
          ? 'bond_approval'
          : item.name.toLowerCase().includes('fica')
          ? 'fica_id'
          : 'other',
        rawTextPreview: item.rawText,
        schema: sch,
        isPopulated: true,
        populatedAt: nowIso,
      };
      newDocs.push(newDoc);

      // Create Parse History Event
      const parseEv: DocumentParseEvent = {
        id: `parse-batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: nowIso,
        leadId: lead.id,
        fileName: item.name,
        fileType: item.type,
        fileSizeKb: item.sizeKb,
        documentType: sch.documentType,
        confidenceScore: sch.confidenceScore,
        fieldConfidenceScores: sch.fieldConfidenceScores,
        extractedFields: fields,
        schema: sch,
        rawTextPreview: item.rawText || '',
        sourceType: 'upload',
        isApplied: true,
        appliedAt: nowIso,
      };
      newParseEvents.push(parseEv);
    });

    updatedLead.documents = [...newDocs, ...(lead.documents || [])];

    // Merge into parse history (keeping last 5)
    const existingHistory = lead.parseHistory && lead.parseHistory.length > 0
      ? lead.parseHistory
      : getEffectiveParseHistory(lead);
    updatedLead.parseHistory = [...newParseEvents, ...existingHistory].slice(0, 5);

    // Add activity log
    const batchActivity: ActivityLogItem = {
      id: `act-batch-${Date.now()}`,
      type: 'status_change',
      title: `Batch Processed & Applied: ${completedItems.length} Lead Documents`,
      description: `Bulk parsed ${completedItems.map((c) => c.name).join(', ')}. Aggregated buyer identity, property specs, finance details, and tasks into Ptah CRM profile.`,
      timestamp: nowIso,
      author: lead.assignedAgent?.name || 'Ptah Broker',
    };
    updatedLead.activityLogs = [batchActivity, ...(lead.activityLogs || [])];

    onUpdateLead(updatedLead);
    setSuccessMessage(`Bulk applied ${completedItems.length} documents from batch queue! Lead metadata, documents, and parse history updated.`);
  };

  // Revert lead metadata to a previous parse version
  const handleRevertToVersion = (parseEvent: DocumentParseEvent) => {
    const fields = parseEvent.extractedFields;
    const nowIso = new Date().toISOString();

    const revertedLead: Lead = {
      ...lead,
      name: fields.buyerName || lead.name,
      email: fields.buyerEmail || lead.email,
      phone: fields.buyerPhone || lead.phone,
      whatsappNumber: fields.buyerPhone || lead.whatsappNumber,
      buyerType: (fields.buyerType as any) || lead.buyerType,
      propertyTitle: fields.propertyTitle || lead.propertyTitle,
      propertyRef: fields.propertyRef || lead.propertyRef,
      propertyLocation: fields.propertyLocation || lead.propertyLocation,
      propertyPrice: fields.propertyPrice || lead.propertyPrice,
      budget: fields.budget || lead.budget,
      timeframe: fields.timeframe || lead.timeframe,
      status: parseEvent.schema.suggestedStatus || lead.status,
    };

    const revertActivity: ActivityLogItem = {
      id: `act-revert-${Date.now()}`,
      type: 'status_change',
      title: `Reverted Lead Metadata to Parse Snapshot (${parseEvent.fileName})`,
      description: `Rolled back lead profile to version captured from ${parseEvent.fileName} (${parseEvent.confidenceScore}% confidence).`,
      timestamp: nowIso,
      author: lead.assignedAgent?.name || 'Ptah Broker',
    };

    revertedLead.activityLogs = [revertActivity, ...(lead.activityLogs || [])];

    // Mark active in parse history
    const existingHistory = lead.parseHistory && lead.parseHistory.length > 0
      ? lead.parseHistory
      : getEffectiveParseHistory(lead);
    const updatedHistory = existingHistory.map((item) =>
      item.id === parseEvent.id ? { ...item, isApplied: true, appliedAt: nowIso } : { ...item, isApplied: false }
    );
    revertedLead.parseHistory = updatedHistory.slice(0, 5);

    onUpdateLead(revertedLead);

    // Also populate into the active viewer
    setCurrentFileMeta({
      name: parseEvent.fileName,
      sizeKb: parseEvent.fileSizeKb,
      type: parseEvent.fileType,
      method: 'history_rollback',
    });
    setRawTextPreview(parseEvent.rawTextPreview);
    setExtractedSchema(parseEvent.schema);
    setActiveConverterTab('parser');
    setSuccessMessage(`Successfully reverted lead metadata to parse version: "${parseEvent.fileName}".`);
  };

  // Handle File Input Change (supports single or multiple)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      handleAddFilesToBatch(files);
    } else {
      const file = files[0];
      handleProcessFile(file);
      // Also add to batch queue for seamless tracking
      const singleBatchItem: BatchQueueItem = {
        id: `batch-${Date.now()}`,
        file,
        name: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        type: file.type || 'application/pdf',
        status: 'queued',
        progress: 0,
      };
      setBatchQueue((prev) => [singleBatchItem, ...prev]);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      handleAddFilesToBatch(files);
    } else {
      const file = files[0];
      handleProcessFile(file);
      const singleBatchItem: BatchQueueItem = {
        id: `batch-${Date.now()}`,
        file,
        name: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        type: file.type || 'application/pdf',
        status: 'queued',
        progress: 0,
      };
      setBatchQueue((prev) => [singleBatchItem, ...prev]);
    }
  };

  // Toggle all checkboxes
  const handleToggleAllFields = (val: boolean) => {
    setSelectedFields({
      buyerName: val,
      buyerEmail: val,
      buyerPhone: val,
      buyerIdNumber: val,
      buyerType: val,
      propertyTitle: val,
      propertyRef: val,
      propertyLocation: val,
      propertyPrice: val,
      budget: val,
      timeframe: val,
      conveyancerAttorney: val,
      tasks: val,
      notes: val,
      status: val,
      suspensiveConditions: val,
    });
  };

  // Apply & Auto-Populate Schema into Lead record
  const handleApplyPopulate = () => {
    if (!extractedSchema || !currentFileMeta) return;

    const fields = extractedSchema.extractedFields;
    const nowIso = new Date().toISOString();

    const shouldApply = (fieldKey: string, selected: boolean) => {
      if (fieldKey in verifiedFields) {
        return selected && verifiedFields[fieldKey];
      }
      return selected;
    };

    // 1. Prepare updated lead fields based on verified check states
    const updatedLead: Lead = {
      ...lead,
      name: shouldApply('buyerName', selectedFields.buyerName) && fields.buyerName ? fields.buyerName : lead.name,
      email: shouldApply('buyerEmail', selectedFields.buyerEmail) && fields.buyerEmail ? fields.buyerEmail : lead.email,
      phone: shouldApply('buyerPhone', selectedFields.buyerPhone) && fields.buyerPhone ? fields.buyerPhone : lead.phone,
      whatsappNumber: shouldApply('buyerPhone', selectedFields.buyerPhone) && fields.buyerPhone ? fields.buyerPhone : lead.whatsappNumber,
      buyerType: shouldApply('buyerType', selectedFields.buyerType) && fields.buyerType ? fields.buyerType : lead.buyerType,
      propertyTitle: shouldApply('propertyTitle', selectedFields.propertyTitle) && fields.propertyTitle ? fields.propertyTitle : lead.propertyTitle,
      propertyRef: shouldApply('propertyRef', selectedFields.propertyRef) && fields.propertyRef ? fields.propertyRef : lead.propertyRef,
      propertyLocation: shouldApply('propertyLocation', selectedFields.propertyLocation) && fields.propertyLocation ? fields.propertyLocation : lead.propertyLocation,
      propertyPrice: shouldApply('budget', selectedFields.propertyPrice) && fields.propertyPrice ? fields.propertyPrice : lead.propertyPrice,
      budget: shouldApply('budget', selectedFields.budget) && fields.budget ? fields.budget : lead.budget,
      timeframe: shouldApply('timeframe', selectedFields.timeframe) && fields.timeframe ? fields.timeframe : lead.timeframe,
      status: shouldApply('status', selectedFields.status) && extractedSchema.suggestedStatus ? extractedSchema.suggestedStatus : lead.status,
    };

    // 2. Append suggested notes
    if (selectedFields.notes && extractedSchema.suggestedNotes && extractedSchema.suggestedNotes.length > 0) {
      const existingNotes = updatedLead.notes || [];
      const newNotes = extractedSchema.suggestedNotes.filter((n) => !existingNotes.includes(n));
      updatedLead.notes = [...existingNotes, ...newNotes];
    }

    // 3. Auto-create suggested tasks
    if (selectedFields.tasks && extractedSchema.suggestedTasks && extractedSchema.suggestedTasks.length > 0) {
      const existingTasks = updatedLead.tasks || [];
      const newCreatedTasks: TaskItem[] = extractedSchema.suggestedTasks.map((t, idx) => ({
        id: `task-doc-${Date.now()}-${idx}`,
        leadId: lead.id,
        leadName: updatedLead.name,
        propertyTitle: updatedLead.propertyTitle,
        title: t.title,
        dueDate: t.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
        priority: t.priority || ('high' as UrgencyLevel),
        status: 'pending',
        type: t.type || 'contract',
        isAutomated: true,
      }));
      updatedLead.tasks = [...newCreatedTasks, ...existingTasks];
    }

    // 4. Save document into lead.documents library
    const newDocRecord: LeadDocument = {
      id: `doc-${Date.now()}`,
      fileName: currentFileMeta.name,
      fileType: currentFileMeta.type,
      fileSizeKb: currentFileMeta.sizeKb,
      uploadedAt: nowIso,
      uploadedBy: lead.assignedAgent?.name || 'Ptah Broker',
      category: currentFileMeta.name.toLowerCase().includes('otp')
        ? 'otp_contract'
        : currentFileMeta.name.toLowerCase().includes('bond')
        ? 'bond_approval'
        : currentFileMeta.name.toLowerCase().includes('fica')
        ? 'fica_id'
        : currentFileMeta.name.toLowerCase().includes('deeds')
        ? 'deeds_search'
        : 'other',
      rawTextPreview,
      schema: extractedSchema,
      isPopulated: true,
      populatedAt: nowIso,
    };

    updatedLead.documents = [newDocRecord, ...(lead.documents || [])];

    // 5. Add Activity Log
    const docActivity: ActivityLogItem = {
      id: `act-doc-${Date.now()}`,
      type: 'status_change',
      title: `Document Parsed & Auto-Populated: ${currentFileMeta.name}`,
      description: `Extracted ${extractedSchema.documentType} using ${currentFileMeta.method || 'text-extraction library'}. Auto-populated lead profile with ${extractedSchema.confidenceScore}% confidence.`,
      timestamp: nowIso,
      author: lead.assignedAgent?.name || 'Ptah Broker',
      metadata: {
        documentType: extractedSchema.documentType,
        fileName: currentFileMeta.name,
        tag: 'Document Parser',
      },
    };

    updatedLead.activityLogs = [docActivity, ...(lead.activityLogs || [])];

    // 6. Record in Parse History (Last 5 Logs)
    const newParseEvent: DocumentParseEvent = {
      id: `parse-${Date.now()}`,
      timestamp: nowIso,
      leadId: lead.id,
      fileName: currentFileMeta.name,
      fileType: currentFileMeta.type,
      fileSizeKb: currentFileMeta.sizeKb,
      documentType: extractedSchema.documentType,
      confidenceScore: extractedSchema.confidenceScore,
      fieldConfidenceScores: extractedSchema.fieldConfidenceScores,
      extractedFields: fields,
      schema: extractedSchema,
      rawTextPreview,
      sourceType: 'upload',
      isApplied: true,
      appliedAt: nowIso,
    };

    const existingHistory = lead.parseHistory && lead.parseHistory.length > 0
      ? lead.parseHistory
      : getEffectiveParseHistory(lead);
    updatedLead.parseHistory = [newParseEvent, ...existingHistory.filter((p) => p.id !== newParseEvent.id)].slice(0, 5);

    // Commit changes
    onUpdateLead(updatedLead);
    setShowSchemaPreviewModal(false);
    setSuccessMessage(`Successfully parsed "${currentFileMeta.name}" and auto-populated lead profile!`);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    if (!extractedSchema) return;
    navigator.clipboard.writeText(JSON.stringify(extractedSchema, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Download JSON
  const handleDownloadJson = () => {
    if (!extractedSchema || !currentFileMeta) return;
    const blob = new Blob([JSON.stringify(extractedSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFileMeta.name.replace(/\.[^/.]+$/, '')}-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Remove document from lead records
  const handleDeleteDoc = (docId: string) => {
    if (!confirm('Are you sure you want to remove this document from the lead record?')) return;
    const updatedDocs = (lead.documents || []).filter((d) => d.id !== docId);
    onUpdateLead({
      ...lead,
      documents: updatedDocs,
    });
  };

  return (
    <div className="space-y-6" id="lead-document-converter-section">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3" /> Document Text Extractor & Auto-Populator
            </span>
            <span className="text-xs text-slate-400">PDF, DOCX, DOC, FICA, OTP, Cadastre</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
            <span>Drag-and-Drop Document Parser</span>
          </h3>

          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            Drop any PDF or Word document (.docx/.doc). Built-in text extraction libraries (PDF.js & Mammoth) convert unstructured real estate files into structured JSON data to auto-populate contact details, property specs, and budget in 1 click.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm hover:shadow shrink-0 cursor-pointer"
          title="Upload document from your computer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF / DOC</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.json,.csv,.rtf,.md"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between text-xs font-semibold animate-fade-in shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3 Main Converter Sub-Tabs & Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            id="converter-tab-parser"
            onClick={() => setActiveConverterTab('parser')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeConverterTab === 'parser'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Document Parser</span>
          </button>

          <button
            type="button"
            id="converter-tab-batch-queue"
            onClick={() => setActiveConverterTab('batch_queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeConverterTab === 'batch_queue'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Document Batch Queue</span>
            {batchQueue.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                activeConverterTab === 'batch_queue' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {batchQueue.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="converter-tab-parse-history"
            onClick={() => setActiveConverterTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeConverterTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Parse History</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
              activeConverterTab === 'history' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {(lead.parseHistory && lead.parseHistory.length > 0 ? lead.parseHistory : getEffectiveParseHistory(lead)).length}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="converter-camera-scanner-btn"
            onClick={() => setIsInternalCameraOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
            title="Snap photo of physical contract or FICA ID using camera for instant Vision OCR parsing"
          >
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>Camera Scanner</span>
          </button>

          <button
            type="button"
            id="converter-request-client-docs-btn"
            onClick={() => setIsClientPortalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
            title="Generate a secure time-sensitive upload link for the client"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Request Client Docs Portal</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: LIVE DOCUMENT PARSER */}
      {activeConverterTab === 'parser' && (
        <div className="space-y-6">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-white shadow-xs'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {isProcessing ? processingStep || 'Extracting Text & Structuring Schema...' : 'Drop Any PDF, Word DOCX or Contract Here'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports Offer to Purchase (OTP), Bank Pre-Approvals, FICA Dossiers, Deeds Reports, Valuation Summaries
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsInternalCameraOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Snap Physical Contract Photo</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">PDF.js Text Extractor</span>
            <span>•</span>
            <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">Mammoth DOCX Engine</span>
            <span>•</span>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">Live Camera Vision OCR</span>
            <span>•</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Auto-Populate 1-Click</span>
          </div>
        </div>
      </div>

      {/* 1-Click Document Presets for Instant Testing */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1-Click Document Presets (Instant Text-Extraction & Schema Test)
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              Click to simulate document upload
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DOCUMENT_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset === preset.id && isProcessing;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isProcessing}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer hover:shadow-md ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      preset.color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : preset.color === 'blue'
                        ? 'bg-blue-100 text-blue-800'
                        : preset.color === 'purple'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {preset.badge}
                  </span>
                </div>

                <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{preset.title}</h5>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{preset.subtitle}</p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-emerald-700">
                  <span>Parse & Auto-Populate</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive File Preview Area (Pre-Population Verification) */}
      <div ref={previewAreaRef} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Interactive Document Preview & Pre-Population Verification</span>
            </h4>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Active Document Review
            </span>
          </div>
          {currentFileMeta && (
            <button
              type="button"
              onClick={() => setShowSchemaPreviewModal(true)}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Full Field Matrix</span>
            </button>
          )}
        </div>

        {currentFileMeta ? (
          <InteractiveDocumentViewer
            documentMeta={currentFileMeta}
            rawText={rawTextPreview}
            schema={extractedSchema}
            lead={lead}
            verifiedFields={verifiedFields}
            onToggleFieldVerified={handleToggleFieldVerified}
            onVerifyAll={handleVerifyAll}
            onTriggerAutoPopulate={handleApplyPopulate}
            onOpenAdvancedModal={() => setShowSchemaPreviewModal(true)}
            onUpdateRawText={handleUpdateRawText}
            isProcessing={isProcessing}
            processingStep={processingStep}
          />
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
            <Eye className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No Document Selected for Preview</p>
            <p className="mt-0.5">Upload a document above or click a 1-click preset to preview and verify content.</p>
          </div>
        )}
      </div>

      {/* Library of Attached / Populated Documents for this Lead */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Attached Documents & Extracted Schemas ({lead.documents?.length || 0})
            </h4>
          </div>
        </div>

        {(!lead.documents || lead.documents.length === 0) ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No documents attached to this lead yet.</p>
            <p className="mt-0.5">Drop a PDF or Word document above, or click one of the presets to test text extraction and auto-population.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lead.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                    <FileCode className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="text-xs font-bold text-slate-900">{doc.fileName}</h5>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {doc.schema?.documentType || 'Schema Extracted'}
                      </span>
                      {doc.isPopulated && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Auto-Populated
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-1 max-w-xl">
                      {doc.schema?.documentSummary || 'Real estate document parsed and structured into CRM database.'}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                      <span>Size: {doc.fileSizeKb} KB</span>
                      <span>•</span>
                      <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                      <span>•</span>
                      <span>By: {doc.uploadedBy}</span>
                      {doc.schema?.confidenceScore && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold font-mono">
                            Confidence: {doc.schema.confidenceScore}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handlePreviewAttachedDoc(doc)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                    title="Open in interactive verification preview area"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview & Verify</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setViewingDoc(doc);
                      setExtractedSchema(doc.schema || null);
                      setCurrentFileMeta({
                        name: doc.fileName,
                        sizeKb: doc.fileSizeKb,
                        type: doc.fileType,
                      });
                      setRawTextPreview(doc.rawTextPreview || '');
                      setShowSchemaPreviewModal(true);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>View Matrix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Remove document from lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      )}

      {/* SUB-VIEW 2: DOCUMENT BATCH QUEUE */}
      {activeConverterTab === 'batch_queue' && (
        <div className="space-y-6">
          {/* Batch Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-white shadow-xs'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                {isProcessingBatch ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                ) : (
                  <Layers className="w-6 h-6" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isProcessingBatch ? 'Processing Multi-Document Batch Queue...' : 'Drop Multiple Documents Simultaneously into Batch Queue'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select or drag multiple files (PDF contracts, scanned FICA IDs, mortgage pre-approvals, property title deeds) to streamline multi-page lead processing.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-semibold">Simultaneous Multi-File Queue</span>
                <span>•</span>
                <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">Automated Schema Merge</span>
                <span>•</span>
                <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">1-Click Bulk Apply</span>
              </div>
            </div>
          </div>

          {/* Batch Control Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">
                Queue Status: {batchQueue.filter((b) => b.status === 'completed').length} / {batchQueue.length} Ready
              </span>
              {isProcessingBatch && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" /> Processing...
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="batch-load-samples-btn"
                onClick={handleLoadSampleBatch}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-200"
              >
                Load Sample Batch (OTP + FICA + Pre-Approval)
              </button>

              <button
                type="button"
                id="batch-bulk-apply-btn"
                onClick={handleBulkApplyAll}
                disabled={batchQueue.filter((b) => b.status === 'completed').length === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer ${
                  batchQueue.filter((b) => b.status === 'completed').length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bulk Apply All to Lead ({batchQueue.filter((b) => b.status === 'completed').length})</span>
              </button>

              {batchQueue.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearBatchQueue}
                  className="px-2.5 py-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                  title="Clear batch queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Batch Queue Items List */}
          {batchQueue.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
              <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
              <h5 className="font-bold text-slate-700 text-sm">Batch Queue is Currently Empty</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Drag and drop multiple contract files at once, or click "Load Sample Batch" to test simultaneous multi-page processing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {batchQueue.map((item) => {
                const confScore = item.confidenceScore || item.schema?.confidenceScore || 0;
                const isHighConf = confScore >= 90;
                const isMediumConf = confScore >= 70 && confScore < 90;

                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                          <span className="text-[10px] text-slate-500 font-mono">{item.sizeKb} KB</span>

                          {/* Status Badge */}
                          {item.status === 'processing' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-600" /> Extracting ({item.progress}%)
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Parsed ({item.schema?.documentType || 'Document'})
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
                            </span>
                          )}

                          {/* Confidence Score Badge */}
                          {item.status === 'completed' && confScore > 0 && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                isHighConf
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isMediumConf
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isHighConf ? 'bg-emerald-500' : isMediumConf ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                              />
                              {confScore}% Confidence
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {item.status === 'processing' && (
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}

                        {/* Extracted Entity Highlights */}
                        {item.schema && item.status === 'completed' && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {item.schema.extractedFields.buyerName && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                Buyer: {item.schema.extractedFields.buyerName}
                              </span>
                            )}
                            {item.schema.extractedFields.propertyRef && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                Ref: {item.schema.extractedFields.propertyRef}
                              </span>
                            )}
                            {item.schema.extractedFields.propertyPrice && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                                {formatCurrency(item.schema.extractedFields.propertyPrice)}
                              </span>
                            )}
                            {item.schema.extractedFields.conveyancerAttorney && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                Legal: {item.schema.extractedFields.conveyancerAttorney}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {item.status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleInspectBatchItem(item)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-emerald-200"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Inspect in Live Preview</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveBatchItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remove from batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: PARSE HISTORY (LAST 5 EXTRACTION LOGS) */}
      {activeConverterTab === 'history' && (
        <div className="space-y-6">
          {/* Informational banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" /> Audit Trail & Revert Engine
                </span>
                <span className="text-xs text-slate-400">Stores last 5 successful extraction events</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                Document Parse History & Version Rollback
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Every successful document parse is snapshotted below. Click <strong className="text-emerald-400">"Revert to this version"</strong> to instantly roll back the lead's metadata fields to that specific parse state.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveConverterTab('parser')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Parse New Document</span>
            </button>
          </div>

          {/* 5 Extraction Logs */}
          <div className="space-y-3.5">
            {(lead.parseHistory && lead.parseHistory.length > 0 ? lead.parseHistory : getEffectiveParseHistory(lead)).map((log, index) => {
              const conf = log.confidenceScore;
              const isHigh = conf >= 90;
              const isMedium = conf >= 70 && conf < 90;
              const hasLowFields = Object.values(log.fieldConfidenceScores || {}).some((score) => Number(score) < 80);

              return (
                <div
                  key={log.id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 transition shadow-xs hover:shadow-md ${
                    log.isApplied
                      ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                        <Clock className="w-5 h-5 text-emerald-600" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            Log #{index + 1}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900">{log.fileName}</h5>

                          {/* Confidence Score Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              isHigh
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isMedium
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                            />
                            {conf}% Confidence
                          </span>

                          {log.isApplied && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-700" /> Active Lead State
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                          <span>Extracted: {formatDate(log.timestamp)}</span>
                          <span>•</span>
                          <span>{log.documentType}</span>
                          <span>•</span>
                          <span>{log.fileSizeKb} KB</span>
                          {log.appliedAt && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700">Applied: {formatDate(log.appliedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        id={`revert-btn-${log.id}`}
                        onClick={() => handleRevertToVersion(log)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                          log.isApplied
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title="Roll back lead profile metadata to this version"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{log.isApplied ? 'Re-Apply This Version' : 'Revert to this version'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentFileMeta({
                            name: log.fileName,
                            sizeKb: log.fileSizeKb,
                            type: log.fileType,
                            method: 'history_inspection',
                          });
                          setRawTextPreview(log.rawTextPreview);
                          setExtractedSchema(log.schema);
                          setActiveConverterTab('parser');
                          previewAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setSuccessMessage(`Loaded "${log.fileName}" snapshot into the interactive viewer.`);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer border border-slate-200"
                        title="Load this parse into the interactive preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>

                  {/* Review prompt if low confidence fields present */}
                  {hasLowFields && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Review Needed:</strong> One or more fields in this extraction scored below 80% confidence. Cross-verify against the source document before re-applying.
                      </span>
                    </div>
                  )}

                  {/* Extracted Fields Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Buyer Name</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {log.extractedFields.buyerName || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">ID / Passport</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {log.extractedFields.buyerIdNumber || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Property Ref</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {log.extractedFields.propertyRef || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Price / Budget</span>
                      <span className="font-semibold text-emerald-700 truncate block">
                        {log.extractedFields.propertyPrice
                          ? formatCurrency(log.extractedFields.propertyPrice)
                          : log.extractedFields.budget || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Conveyancer</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {log.extractedFields.conveyancerAttorney || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Suggested Status</span>
                      <span className="font-semibold text-blue-700 truncate block">
                        {log.schema.suggestedStatus || 'qualified'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Schema Diff & Auto-Populate Preview */}
      {showSchemaPreviewModal && extractedSchema && currentFileMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Document Parsed ({extractedSchema.confidenceScore}% Confidence)
                  </span>
                  <span className="text-xs text-slate-400">
                    Engine: {currentFileMeta.method?.toUpperCase() || 'PDF.JS / MAMMOTH'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <span>{extractedSchema.documentType}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  File: <span className="font-mono text-white">{currentFileMeta.name}</span> ({currentFileMeta.sizeKb} KB)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSchemaPreviewModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-200 bg-slate-50">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setModalTab('fields')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    modalTab === 'fields'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Field Auto-Populate Matrix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('raw_text')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    modalTab === 'raw_text'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Extracted Raw Text ({rawTextPreview.length} chars)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('json')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    modalTab === 'json'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Structured JSON Schema</span>
                </button>
              </div>

              {modalTab === 'json' && (
                <div className="flex items-center space-x-2 pb-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Executive Summary Box */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                <span className="font-bold block text-emerald-900 mb-0.5">Document Summary:</span>
                <p>{extractedSchema.documentSummary}</p>
              </div>

              {/* TAB 1: FIELD AUTO-POPULATE CHECKLIST */}
              {modalTab === 'fields' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Select Fields to Sync into Lead Record
                    </span>
                    <div className="flex items-center space-x-3 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleAllFields(true)}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                      >
                        Select All
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAllFields(false)}
                        className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Buyer Name */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.buyerName}
                        onChange={(e) => setSelectedFields({ ...selectedFields, buyerName: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Lead / Buyer Name</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: {lead.name}</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Extracted: {extractedSchema.extractedFields.buyerName || '(Not extracted)'}
                        </div>
                      </div>
                    </label>

                    {/* Email */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.buyerEmail}
                        onChange={(e) => setSelectedFields({ ...selectedFields, buyerEmail: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Email Address</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: {lead.email}</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Extracted: {extractedSchema.extractedFields.buyerEmail || '(Not extracted)'}
                        </div>
                      </div>
                    </label>

                    {/* Phone */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.buyerPhone}
                        onChange={(e) => setSelectedFields({ ...selectedFields, buyerPhone: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Phone / WhatsApp Number</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: {lead.phone}</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Extracted: {extractedSchema.extractedFields.buyerPhone || '(Not extracted)'}
                        </div>
                      </div>
                    </label>

                    {/* SA ID / Passport */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.buyerIdNumber}
                        onChange={(e) => setSelectedFields({ ...selectedFields, buyerIdNumber: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">South African ID / Passport / Reg</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: Not set</div>
                        <div className="text-emerald-700 font-semibold text-[11px] font-mono">
                          Extracted: {extractedSchema.extractedFields.buyerIdNumber || '(Not extracted)'}
                        </div>
                      </div>
                    </label>

                    {/* Property Title & Ref */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.propertyTitle}
                        onChange={(e) => setSelectedFields({ ...selectedFields, propertyTitle: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Property Title & Ref</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: {lead.propertyTitle} ({lead.propertyRef})</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Extracted: {extractedSchema.extractedFields.propertyTitle || lead.propertyTitle}
                          {extractedSchema.extractedFields.propertyRef ? ` (${extractedSchema.extractedFields.propertyRef})` : ''}
                        </div>
                      </div>
                    </label>

                    {/* Suburb / Location */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.propertyLocation}
                        onChange={(e) => setSelectedFields({ ...selectedFields, propertyLocation: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Property Suburb / Location</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: {lead.propertyLocation}</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Extracted: {extractedSchema.extractedFields.propertyLocation || lead.propertyLocation}
                        </div>
                      </div>
                    </label>

                    {/* Budget & Price */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.budget}
                        onChange={(e) => setSelectedFields({ ...selectedFields, budget: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Budget / Agreed Transaction Value</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: {lead.budget}</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Extracted: {extractedSchema.extractedFields.budget || (extractedSchema.extractedFields.propertyPrice ? formatCurrency(extractedSchema.extractedFields.propertyPrice) : lead.budget)}
                          {extractedSchema.extractedFields.depositAmount ? ` (Deposit: ${formatCurrency(extractedSchema.extractedFields.depositAmount)})` : ''}
                        </div>
                      </div>
                    </label>

                    {/* Buyer Financing Type */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.buyerType}
                        onChange={(e) => setSelectedFields({ ...selectedFields, buyerType: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Buyer Financing Category</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: {lead.buyerType}</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Extracted: {extractedSchema.extractedFields.buyerType || lead.buyerType}
                        </div>
                      </div>
                    </label>

                    {/* Conveyancing Attorney */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.conveyancerAttorney}
                        onChange={(e) => setSelectedFields({ ...selectedFields, conveyancerAttorney: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Conveyancing Law Firm</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: Not assigned</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Extracted: {extractedSchema.extractedFields.conveyancerAttorney || 'Bowmans Conveyancers'}
                        </div>
                      </div>
                    </label>

                    {/* Pipeline Status */}
                    <label className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFields.status}
                        onChange={(e) => setSelectedFields({ ...selectedFields, status: e.target.checked })}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Pipeline Status Update</span>
                        <div className="text-slate-500 line-through text-[11px] mt-0.5">Current: {lead.status}</div>
                        <div className="text-emerald-700 font-semibold text-[11px] uppercase">
                          Suggested: {extractedSchema.suggestedStatus || lead.status}
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Suspensive Conditions & Clauses */}
                  {extractedSchema.extractedFields.suspensiveConditions && (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-900 block mb-1">
                        Suspensive Conditions Extracted:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {extractedSchema.extractedFields.suspensiveConditions.map((cond, i) => (
                          <li key={i}>{cond}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tasks Preview */}
                  {extractedSchema.suggestedTasks && extractedSchema.suggestedTasks.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          Automated Tasks to Create ({extractedSchema.suggestedTasks.length}):
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedFields.tasks}
                          onChange={(e) => setSelectedFields({ ...selectedFields, tasks: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                      </div>
                      <div className="space-y-1.5 mt-2">
                        {extractedSchema.suggestedTasks.map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs">
                            <span className="font-medium text-slate-800">{t.title}</span>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Priority: {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: EXTRACTED RAW TEXT PREVIEW */}
              {modalTab === 'raw_text' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Raw Text Extracted via {currentFileMeta.method?.toUpperCase() || 'LIBRARY'} ({rawTextPreview.length} characters)
                    </span>
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search inside extracted text..."
                        value={rawTextSearch}
                        onChange={(e) => setRawTextSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {rawTextPreview || '(No text extracted)'}
                  </div>
                </div>
              )}

              {/* TAB 3: STRUCTURED JSON SCHEMA */}
              {modalTab === 'json' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Standardized Real Estate CRM Schema (JSON)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ISO 8601 & Deeds Office Compliant
                    </span>
                  </div>

                  <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl max-h-96 overflow-y-auto whitespace-pre leading-relaxed border border-slate-800 shadow-inner">
                    {JSON.stringify(extractedSchema, null, 2)}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowSchemaPreviewModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleApplyPopulate}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply & Auto-Populate Lead Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Request Portal Modal */}
      {isClientPortalOpen && (
        <ClientRequestPortalModal
          isOpen={isClientPortalOpen}
          onClose={() => setIsClientPortalOpen(false)}
          lead={lead}
          onDocumentsReceived={(newDocs) => {
            const updatedLead = {
              ...lead,
              documents: [...newDocs, ...(lead.documents || [])],
            };
            onUpdateLead(updatedLead);
            setIsClientPortalOpen(false);
            setSuccessMessage(`Received ${newDocs.length} client document(s) via secure upload portal!`);
          }}
        />
      )}

      {/* Camera Capture Modal */}
      {isInternalCameraOpen && (
        <CameraCaptureModal
          isOpen={isInternalCameraOpen}
          onClose={() => setIsInternalCameraOpen(false)}
          leadName={lead.name}
          onCaptureComplete={(file) => {
            handleProcessFile(file);
          }}
        />
      )}
    </div>
  );
};
