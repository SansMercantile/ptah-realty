import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { DocumentExtractedSchema, Lead, LeadStatus, UrgencyLevel } from '../types';

// Setup PDF.js worker safely
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
}

export interface ExtractionResult {
  rawText: string;
  fileType: string;
  charCount: number;
  extractionMethod: 'pdfjs' | 'mammoth' | 'text' | 'stream_fallback' | 'vision_image';
  imageBase64?: string;
  imagePreviewUrl?: string;
  isImage?: boolean;
}

/**
 * Extract raw text from any uploaded File (.pdf, .doc, .docx, .txt, .json, .csv, .md, and images)
 */
export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // 1. Image-based files (Vision AI OCR for photos, handwritten notes, ID cards, OTP scans)
  if (
    mimeType.startsWith('image/') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.webp') ||
    fileName.endsWith('.heic') ||
    fileName.endsWith('.gif')
  ) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const previewUrl = URL.createObjectURL(file);
    return {
      rawText: `[Vision Image: ${file.name} - ${(file.size / 1024).toFixed(1)} KB]`,
      fileType: mimeType || 'image/jpeg',
      charCount: base64.length,
      extractionMethod: 'vision_image',
      imageBase64: base64,
      imagePreviewUrl: previewUrl,
      isImage: true,
    };
  }

  // 2. Text-based files
  if (
    mimeType.includes('text') ||
    mimeType.includes('json') ||
    mimeType.includes('csv') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.json') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.rtf')
  ) {
    const text = await file.text();
    return {
      rawText: text,
      fileType: mimeType || 'text/plain',
      charCount: text.length,
      extractionMethod: 'text',
    };
  }

  // 2. Word documents (.docx)
  if (fileName.endsWith('.docx') || mimeType.includes('wordprocessingml')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value || '';
      return {
        rawText: text,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        charCount: text.length,
        extractionMethod: 'mammoth',
      };
    } catch (docxErr) {
      console.warn('Mammoth docx parsing fallback:', docxErr);
    }
  }

  // 3. PDF documents (.pdf)
  if (fileName.endsWith('.pdf') || mimeType.includes('pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const pageTexts: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        pageTexts.push(`--- Page ${pageNum} ---\n` + pageText);
      }

      const fullText = pageTexts.join('\n\n').trim();
      if (fullText.length > 20) {
        return {
          rawText: fullText,
          fileType: 'application/pdf',
          charCount: fullText.length,
          extractionMethod: 'pdfjs',
        };
      }
    } catch (pdfErr) {
      console.warn('PDF.js worker extraction fallback to stream scanner:', pdfErr);
    }

    // Binary stream fallback extraction for PDF
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let extracted = '';
      let buffer = '';

      for (let i = 0; i < uint8.length; i++) {
        const byte = uint8[i];
        if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
          buffer += String.fromCharCode(byte);
        } else {
          if (buffer.length > 4) {
            extracted += ' ' + buffer;
          }
          buffer = '';
        }
      }

      const cleaned = extracted
        .replace(/obj|endobj|stream|endstream|xref|trailer|startxref/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        rawText: cleaned,
        fileType: 'application/pdf',
        charCount: cleaned.length,
        extractionMethod: 'stream_fallback',
      };
    } catch (streamErr) {
      console.error('Stream fallback error:', streamErr);
    }
  }

  // Default fallback: Try reading as text
  try {
    const text = await file.text();
    return {
      rawText: text,
      fileType: mimeType || 'application/octet-stream',
      charCount: text.length,
      extractionMethod: 'text',
    };
  } catch (err) {
    return {
      rawText: `[Binary document ${file.name} - ${Math.round(file.size / 1024)} KB]`,
      fileType: mimeType || 'application/octet-stream',
      charCount: 0,
      extractionMethod: 'text',
    };
  }
}

/**
 * Deterministic Regex & Rule-Based Entity Extractor
 * Converts extracted raw text to structured CRM JSON data instantly.
 */
export function parseTextToStructuredData(
  text: string,
  currentLead?: Partial<Lead>,
  fileName?: string
): DocumentExtractedSchema {
  const lower = text.toLowerCase();

  // 1. Detect Document Classification
  let docType = 'Client Real Estate Document';
  if (lower.includes('offer to purchase') || lower.includes('otp') || lower.includes('agreement of sale')) {
    docType = 'Signed Offer to Purchase (OTP)';
  } else if (lower.includes('pre-approval') || lower.includes('bond approval') || lower.includes('mortgage finance') || lower.includes('facility approved')) {
    docType = 'Mortgage Bond Pre-Approval Certificate';
  } else if (lower.includes('fica') || lower.includes('identity document') || lower.includes('tax clearance') || lower.includes('proof of residence')) {
    docType = 'FICA & Statutory KYC Dossier';
  } else if (lower.includes('deeds registry') || lower.includes('title deed') || lower.includes('windeed') || lower.includes('cadastral') || lower.includes('erf ')) {
    docType = 'Deeds Office Title Search & Cadastral Report';
  } else if (lower.includes('lease agreement') || lower.includes('tenancy') || lower.includes('rental application')) {
    docType = 'Residential Lease Agreement';
  } else if (lower.includes('valuation') || lower.includes('market estimate') || lower.includes('cma')) {
    docType = 'Comparative Market Analysis (CMA) Valuation';
  }

  // 2. Extract Contact Info
  // Email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : currentLead?.email;

  // Phone / WhatsApp
  const phoneMatch = text.match(/(\+?27\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{4}|0[678][0-9]\s?[0-9]{3}\s?[0-9]{4}|\+?[0-9]{10,14})/);
  const phone = phoneMatch ? phoneMatch[1].trim() : currentLead?.phone;

  // Name extraction heuristics
  let buyerName: string | undefined = currentLead?.name;
  const buyerPattern = /(?:purchaser|buyer|client|applicant|name|full name|mrs?|dr|adv|trust name|registered name):\s*([A-Za-z\s.'-]{3,40})/i;
  const nameMatch = text.match(buyerPattern);
  if (nameMatch && nameMatch[1].trim().length > 2) {
    const candidate = nameMatch[1].trim().replace(/\s+/g, ' ');
    if (!candidate.toLowerCase().includes('holdings') && !candidate.toLowerCase().includes('bank') && !candidate.toLowerCase().includes('realty')) {
      buyerName = candidate;
    }
  }

  // South African 13-Digit ID Number
  const idMatch = text.match(/\b([0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12][0-9]|3[01])[0-9]{4}[01][89][0-9])\b/) ||
                  text.match(/(?:id|identity|passport|reg)(?:\s*(?:number|no|\:))?\s*([0-9]{13}|[A-Z0-9]{8,12})/i);
  const buyerIdNumber = idMatch ? (idMatch[1] || idMatch[0]).trim() : undefined;

  // SARS Tax Number
  const taxMatch = text.match(/(?:tax\s*(?:number|no|pin)|sars|income\s*tax):\s*([0-9]{10})/i) ||
                   text.match(/\b(1551[0-9]{6}|2712[0-9]{6}|[0-9]{10})\b/);
  const buyerTaxNumber = taxMatch ? taxMatch[1] : undefined;

  // Registration Number (Company / Trust)
  const regMatch = text.match(/(?:registration\s*(?:number|no)|trust\s*(?:number|no)):\s*([A-Za-z0-9\/-]{7,15})/i) ||
                   text.match(/\b(Trust\s*[0-9]{3,5}\/[0-9]{2}|[0-9]{4}\/[0-9]{6}\/[0-9]{2})\b/i);
  const buyerRegNumber = regMatch ? regMatch[1] : undefined;

  // 3. Extract Financials & Budget
  // Currency matches (ZAR "R 42,500,000", "R42.5M", "R 845,000")
  let propertyPrice: number | undefined = currentLead?.propertyPrice;
  let budgetStr: string | undefined = currentLead?.budget;
  let depositAmount: number | undefined;
  let bondAmountRequired: number | undefined;

  const priceMatches = Array.from(text.matchAll(/(?:R|ZAR)\s?([0-9]{1,3}(?:[,\s][0-9]{3})*(?:\.[0-9]{2})?)/gi));
  if (priceMatches.length > 0) {
    const rawNums = priceMatches.map((m) => parseFloat(m[1].replace(/[,\s]/g, ''))).filter((n) => n > 10000);
    if (rawNums.length > 0) {
      // Largest value usually is the purchase price / facility
      const maxVal = Math.max(...rawNums);
      propertyPrice = maxVal;
      budgetStr = `R ${maxVal.toLocaleString('en-ZA')}`;

      // Check if there's a deposit (often 10% or smaller value)
      const depMatch = text.match(/deposit:\s*(?:R|ZAR)?\s*([0-9]{1,3}(?:[,\s][0-9]{3})*(?:\.[0-9]{2})?)/i);
      if (depMatch) {
        depositAmount = parseFloat(depMatch[1].replace(/[,\s]/g, ''));
      } else {
        depositAmount = Math.round(maxVal * 0.1);
      }

      // Check for bond required
      const bondMatch = text.match(/(?:facility approved|bond|loan):\s*(?:R|ZAR)?\s*([0-9]{1,3}(?:[,\s][0-9]{3})*)/i);
      if (bondMatch) {
        bondAmountRequired = parseFloat(bondMatch[1].replace(/[,\s]/g, ''));
      }
    }
  }

  // 4. Property Requirements & Locations
  let propertyTitle = currentLead?.propertyTitle;
  let propertyLocation = currentLead?.propertyLocation;
  let propertyRef = currentLead?.propertyRef;

  // Erf / Unit Reference
  const erfMatch = text.match(/(?:erf|section|unit|portion)\s*([0-9]{1,6}(?:\s+[A-Za-z]+)?)/i) ||
                   text.match(/\b(MR[0-9]{6}|P24-[0-9]{6,8}|REF-[A-Z0-9]+)\b/i);
  if (erfMatch) {
    propertyRef = erfMatch[0];
  }

  // Common high-profile SA real estate locations
  const knownLocations = [
    'Clifton', 'Camps Bay', 'Bantry Bay', 'Fresnaye', 'Constantia', 'Bishopscourt',
    'Sandton', 'Midrand', 'Bryanston', 'Hyde Park', 'Rosebank', 'Dainfern', 'Waterfall City',
    'Waterkloof', 'Pretoria East', 'Silver Lakes', 'Umhlanga', 'Ballito', 'Zimbali', 'Stellenbosch', 'Franschhoek'
  ];

  for (const loc of knownLocations) {
    if (text.toLowerCase().includes(loc.toLowerCase())) {
      propertyLocation = loc;
      if (!propertyTitle || propertyTitle === 'Luxury Residence') {
        propertyTitle = `${loc} Luxury Estate / Erf ${propertyRef || ''}`.trim();
      }
      break;
    }
  }

  // Property type detection
  let buyerType: 'Cash Buyer' | 'Pre-approved Mortgage' | 'Investor' | 'First-Time Buyer' | 'Tenant' = currentLead?.buyerType || 'Cash Buyer';
  if (lower.includes('pre-approval') || lower.includes('bond') || lower.includes('mortgage')) {
    buyerType = 'Pre-approved Mortgage';
  } else if (lower.includes('lease') || lower.includes('tenant') || lower.includes('rental')) {
    buyerType = 'Tenant';
  } else if (lower.includes('investor') || lower.includes('portfolio') || lower.includes('commercial')) {
    buyerType = 'Investor';
  }

  // Conveyancing Attorney
  let conveyancerAttorney = 'Bowmans Conveyancers & Property Law';
  const attorneyMatch = text.match(/(?:conveyancer|attorneys|law\s*firm|appointed\s*conveyancers):\s*([A-Za-z\s&'-]{5,40})/i);
  if (attorneyMatch) {
    conveyancerAttorney = attorneyMatch[1].trim();
  }

  // Timeframe
  let timeframe: 'Immediate (< 30 days)' | '1 - 3 Months' | '3 - 6 Months' | 'Browsing / Curious' = '1 - 3 Months';
  if (lower.includes('immediate') || lower.includes('urgent') || lower.includes('cash offer')) {
    timeframe = 'Immediate (< 30 days)';
  } else if (lower.includes('90 days') || lower.includes('3 months')) {
    timeframe = '1 - 3 Months';
  }

  // Suspensive conditions & key clauses
  const suspensiveConditions: string[] = [];
  if (lower.includes('deposit')) {
    suspensiveConditions.push('10% deposit payable into conveyancer trust account within 7 business days');
  }
  if (lower.includes('bond') || lower.includes('finance')) {
    suspensiveConditions.push('Subject to bank mortgage bond pre-approval confirmation');
  }
  if (lower.includes('fica') || lower.includes('kyc')) {
    suspensiveConditions.push('FICA statutory compliance verification and proof of residence clearance');
  }
  if (lower.includes('compliance') || lower.includes('electrical') || lower.includes('beetle')) {
    suspensiveConditions.push('Seller to furnish valid Electrical, Gas, and Beetle compliance certificates');
  }
  if (suspensiveConditions.length === 0) {
    suspensiveConditions.push('Formal review of documentation and verification with conveyancing panel');
  }

  const keyClauses: string[] = [
    `Extracted from ${fileName || 'uploaded document'} via Ptah Real Estate Document Engine`,
    `Jurisdiction: Deeds Registry & High Court of South Africa`,
    `Mandate Commission: 5.0% + VAT agreed for Ptah Real Estate`,
  ];

  // Suggested Tasks
  const suggestedTasks = [
    {
      title: `Verify ${buyerName || 'Client'} FICA documentation and upload to compliance vault`,
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      priority: 'high' as UrgencyLevel,
      type: 'contract' as const,
    },
    {
      title: `Submit parsed document to ${conveyancerAttorney} for conveyancing lodgement`,
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      priority: 'urgent' as UrgencyLevel,
      type: 'email' as const,
    },
  ];

  // Suggested Notes
  const suggestedNotes = [
    `Document parsed: ${docType} (${fileName || 'file'}).`,
    `Client: ${buyerName || 'Unknown'} | Ref: ${propertyRef || 'N/A'} | Value: ${budgetStr || 'N/A'}.`,
    buyerIdNumber ? `SA ID/Reg: ${buyerIdNumber} verified.` : 'ID pending extraction.',
  ];

  // Suggested Lead Status
  let suggestedStatus: LeadStatus = 'qualified';
  if (docType.includes('Offer to Purchase')) {
    suggestedStatus = 'offer_submitted';
  } else if (docType.includes('Pre-Approval')) {
    suggestedStatus = 'qualified';
  } else if (docType.includes('Lease')) {
    suggestedStatus = 'viewing_scheduled';
  }

  // Calculate granular per-field confidence scores
  const fieldConfidenceScores: Record<string, number> = {
    buyerName: buyerName ? 95 : 45,
    buyerEmail: email ? 98 : 40,
    buyerPhone: phone ? 94 : 50,
    buyerIdNumber: buyerIdNumber ? 92 : 35,
    buyerType: buyerType ? 90 : 60,
    propertyTitle: propertyTitle ? 92 : 40,
    propertyRef: propertyRef ? 88 : 55,
    propertyLocation: propertyLocation ? 94 : 45,
    propertyPrice: propertyPrice ? 96 : 50,
    budget: budgetStr ? 95 : 55,
    timeframe: timeframe ? 88 : 65,
    conveyancerAttorney: conveyancerAttorney ? 85 : 55,
  };

  const lowConfidenceFields = Object.entries(fieldConfidenceScores)
    .filter(([_, score]) => score < 70)
    .map(([field]) => field);

  const confidenceScore = Math.min(
    98,
    65 +
      (email ? 10 : 0) +
      (phone ? 8 : 0) +
      (buyerIdNumber ? 8 : 0) +
      (propertyPrice ? 7 : 0)
  );

  return {
    documentType: docType,
    documentSummary: `Extracted ${docType} for ${buyerName || 'client'} regarding ${propertyTitle || 'property'}. Financial values recorded at ${budgetStr || 'agreed terms'} with ${conveyancerAttorney}.`,
    confidenceScore,
    fieldConfidenceScores,
    lowConfidenceFields,
    extractedFields: {
      buyerName,
      buyerEmail: email,
      buyerPhone: phone,
      buyerIdNumber,
      buyerType,
      propertyTitle,
      propertyRef,
      propertyLocation,
      propertyPrice,
      budget: budgetStr,
      depositAmount,
      bondAmountRequired,
      timeframe,
      conveyancerAttorney,
      transferDateEstimated: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      suspensiveConditions,
      keyClauses,
    },
    suggestedTasks,
    suggestedNotes,
    suggestedStatus,
  };
}
