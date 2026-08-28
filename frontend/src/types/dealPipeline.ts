export type DealStage = 'NEW_LISTINGS' | 'PROPERTY_VIEWING' | 'OFFER_TO_PURCHASE' | 'ATTORNEY_DOCUMENT' | 'LODGEMENTS';

export interface ViewingAppointment {
  id: string;
  listingId: string;
  propertyAddress: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  date: string;
  time: string;
  type: 'Private Viewing' | 'Sunday Show House' | 'Virtual Video Tour' | 'Broker Preview';
  status: 'Scheduled' | 'Completed' | 'Offer Pending' | 'Cancelled';
  feedbackRating?: 1 | 2 | 3 | 4 | 5;
  feedbackNotes?: string;
  priceSentiment?: 'Priced Right' | 'Slightly High' | 'Significantly Overpriced' | 'Good Value';
  agentNotes?: string;
}

export interface OfferToPurchaseRecord {
  id: string;
  listingId: string;
  propertyAddress: string;
  otpRef: string;
  buyerName: string;
  buyerId: string;
  buyerPhone: string;
  buyerEmail: string;
  offerPrice: number;
  askingPrice: number;
  depositAmount: number;
  depositDueDays: number;
  bondAmountRequired: number;
  bondFinanceDays: number;
  subjectToSaleOfProperty: boolean;
  occupationalRent: number;
  occupationDate: string;
  status: 'Draft' | 'Pending Seller Signature' | 'Counter Offered' | 'Accepted & Binding' | 'Bond Granted' | 'Lapsed';
  submittedDate: string;
  expiryDate: string;
  notes: string;
}

export interface AttorneyConveyancingRecord {
  id: string;
  listingId: string;
  propertyAddress: string;
  transferAttorneyFirm: string;
  conveyancerName: string;
  conveyancerPhone: string;
  conveyancerEmail: string;
  fileReference: string;
  bondAttorneyFirm?: string;
  ficaBuyerStatus: 'Pending' | 'Verified' | 'Exempt';
  ficaSellerStatus: 'Pending' | 'Verified' | 'Exempt';
  ratesClearanceStatus: 'Applied' | 'Figures Received' | 'Paid & Issued' | 'Pending';
  levyClearanceStatus: 'N/A' | 'Requested' | 'Certificate Issued';
  transferDutyStatus: 'Receipt Issued' | 'SARS Assessment Pending' | 'Exempt';
  complianceCerts: {
    electrical: 'Pending Inspection' | 'Issued & Compliant' | 'Rectifications Required' | 'N/A';
    beetle: 'Clear & Certified' | 'Pending' | 'N/A';
    gas: 'Compliant' | 'Pending' | 'N/A';
    plumbing: 'CoCT Passed' | 'Pending' | 'N/A';
    electricFence: 'Certified' | 'N/A';
  };
  overallProgress: number; // 0 to 100%
  targetLodgementDate: string;
}

export interface DeedsLodgementRecord {
  id: string;
  listingId: string;
  propertyAddress: string;
  deedsOffice: string; // e.g. "Cape Town Deeds Registry"
  deedsBarcode: string;
  transferDeedNo: string;
  sellerName: string;
  purchaserName: string;
  lodgementDate: string;
  currentStep: 
    | '1_PREPARATION' 
    | '2_LODGED_BATCH1' 
    | '3_EXAMINATION_BATCH2' 
    | '4_SECTION_HEAD_BATCH3' 
    | '5_PREP_EXECUTION' 
    | '6_REGISTERED';
  examinerNotes?: string;
  expectedRegistrationDate: string;
  commissionPayable: number;
  commissionPaidOut: boolean;
}
