import { 
  ViewingAppointment, 
  OfferToPurchaseRecord, 
  AttorneyConveyancingRecord, 
  DeedsLodgementRecord 
} from '../types/dealPipeline';

export const INITIAL_VIEWINGS: ViewingAppointment[] = [
  {
    id: 'view-1',
    listingId: 'list-1',
    propertyAddress: '5 Richmond Road, Three Anchor Bay',
    buyerName: 'Dr. Liam & Sarah Van Der Merwe',
    buyerPhone: '+27 82 770 1928',
    buyerEmail: 'liam.vdm@mediclinic.co.za',
    date: '2026-08-29',
    time: '14:30',
    type: 'Private Viewing',
    status: 'Scheduled',
    agentNotes: 'High interest in solar setup and double garage. Pre-qualified with Investec Private Bank.'
  },
  {
    id: 'view-2',
    listingId: 'list-1',
    propertyAddress: '5 Richmond Road, Three Anchor Bay',
    buyerName: 'Marcus Aurelius Sterling',
    buyerPhone: '+27 79 332 9011',
    buyerEmail: 'm.sterling@capitalgroup.com',
    date: '2026-08-30',
    time: '11:00',
    type: 'Sunday Show House',
    status: 'Scheduled',
    agentNotes: 'Looking for lock-up-and-go luxury with Atlantic views.'
  },
  {
    id: 'view-3',
    listingId: 'list-2',
    propertyAddress: '11 Mutley Road, Three Anchor Bay',
    buyerName: 'Claire Du Plessis',
    buyerPhone: '+27 83 451 9902',
    buyerEmail: 'claire.dp@horizonmedia.co.za',
    date: '2026-08-25',
    time: '16:00',
    type: 'Private Viewing',
    status: 'Completed',
    feedbackRating: 5,
    feedbackNotes: 'Loved the open-plan flow and terrace. Discussing making an offer under asking.',
    priceSentiment: 'Priced Right',
    agentNotes: 'Following up regarding OTP submission.'
  },
  {
    id: 'view-4',
    listingId: 'list-3',
    propertyAddress: 'Suite 401, 76 Regent Road, Sea Point',
    buyerName: 'Johannes Botha',
    buyerPhone: '+27 84 901 2345',
    buyerEmail: 'j.botha@techsa.io',
    date: '2026-08-26',
    time: '10:30',
    type: 'Broker Preview',
    status: 'Completed',
    feedbackRating: 4,
    feedbackNotes: 'Great rental yield potential for short-term letting.',
    priceSentiment: 'Good Value'
  }
];

export const INITIAL_OTPS: OfferToPurchaseRecord[] = [
  {
    id: 'otp-1',
    listingId: 'list-4',
    propertyAddress: '24 Avenue Bartholomew, Fresnaye',
    otpRef: 'OTP-2026-FR-0482',
    buyerName: 'Julian & Antoinette Vance',
    buyerId: '8204155098081',
    buyerPhone: '+27 82 991 3044',
    buyerEmail: 'julian@vancepartners.co.za',
    offerPrice: 23800000,
    askingPrice: 24500000,
    depositAmount: 2380000,
    depositDueDays: 7,
    bondAmountRequired: 14000000,
    bondFinanceDays: 21,
    subjectToSaleOfProperty: false,
    occupationalRent: 95000,
    occupationDate: '2026-11-01',
    status: 'Accepted & Binding',
    submittedDate: '2026-08-20',
    expiryDate: '2026-08-23',
    notes: 'Seller accepted counter-signed offer. 10% deposit successfully deposited into conveyancer trust.'
  },
  {
    id: 'otp-2',
    listingId: 'list-1',
    propertyAddress: '5 Richmond Road, Three Anchor Bay',
    otpRef: 'OTP-2026-TAB-0199',
    buyerName: 'Henrik Lindqvist',
    buyerId: '9002145102088',
    buyerPhone: '+46 70 123 4567',
    buyerEmail: 'henrik.l@nordic-invest.se',
    offerPrice: 12000000,
    askingPrice: 12500000,
    depositAmount: 1200000,
    depositDueDays: 14,
    bondAmountRequired: 0,
    bondFinanceDays: 0,
    subjectToSaleOfProperty: false,
    occupationalRent: 55000,
    occupationDate: '2026-12-01',
    status: 'Pending Seller Signature',
    submittedDate: '2026-08-27',
    expiryDate: '2026-08-30',
    notes: 'Cash offshore purchase (Forex SWIFT compliance pending). Awaiting seller mandate signature.'
  }
];

export const INITIAL_CONVEYANCING: AttorneyConveyancingRecord[] = [
  {
    id: 'conv-1',
    listingId: 'list-4',
    propertyAddress: '24 Avenue Bartholomew, Fresnaye',
    transferAttorneyFirm: 'Smith Tabata Buchanan Boyes (STBB) - Claremont',
    conveyancerName: 'Adv. Anelise Van Zyl',
    conveyancerPhone: '+27 21 673 4700',
    conveyancerEmail: 'anelisev@stbb.co.za',
    fileReference: 'STBB/2026/CT/88410',
    bondAttorneyFirm: 'Cliffe Dekker Hofmeyr (CDH) - Nedbank Private Wealth',
    ficaBuyerStatus: 'Verified',
    ficaSellerStatus: 'Verified',
    ratesClearanceStatus: 'Paid & Issued',
    levyClearanceStatus: 'N/A',
    transferDutyStatus: 'Receipt Issued',
    complianceCerts: {
      electrical: 'Issued & Compliant',
      beetle: 'Clear & Certified',
      gas: 'Compliant',
      plumbing: 'CoCT Passed',
      electricFence: 'Certified'
    },
    overallProgress: 88,
    targetLodgementDate: '2026-09-08'
  },
  {
    id: 'conv-2',
    listingId: 'list-2',
    propertyAddress: '11 Mutley Road, Three Anchor Bay',
    transferAttorneyFirm: 'Bowmans Law - Cape Town Branch',
    conveyancerName: 'Darren Naidoo',
    conveyancerPhone: '+27 21 480 7800',
    conveyancerEmail: 'darren.naidoo@bowmanslaw.com',
    fileReference: 'BOW/PROP/9924-TAB',
    ficaBuyerStatus: 'Pending',
    ficaSellerStatus: 'Verified',
    ratesClearanceStatus: 'Applied',
    levyClearanceStatus: 'N/A',
    transferDutyStatus: 'SARS Assessment Pending',
    complianceCerts: {
      electrical: 'Pending Inspection',
      beetle: 'Pending',
      gas: 'N/A',
      plumbing: 'Pending',
      electricFence: 'N/A'
    },
    overallProgress: 42,
    targetLodgementDate: '2026-09-22'
  }
];

export const INITIAL_LODGEMENTS: DeedsLodgementRecord[] = [
  {
    id: 'lodge-1',
    listingId: 'list-4',
    propertyAddress: '24 Avenue Bartholomew, Fresnaye',
    deedsOffice: 'Cape Town Deeds Registry (90 Plein St)',
    deedsBarcode: 'T000045920/2026/CT',
    transferDeedNo: 'T 0045920 / 2026',
    sellerName: 'Eleanor Victoria Pier',
    purchaserName: 'Julian & Antoinette Vance',
    lodgementDate: '2026-08-24',
    currentStep: '5_PREP_EXECUTION',
    examinerNotes: 'Passed Junior and Senior Examiner batches. Final black books signed off. Scheduled for execution tomorrow at 10:00 AM.',
    expectedRegistrationDate: '2026-08-29',
    commissionPayable: 1190000,
    commissionPaidOut: false
  },
  {
    id: 'lodge-2',
    listingId: 'list-3',
    propertyAddress: 'Suite 401, 76 Regent Road, Sea Point',
    deedsOffice: 'Cape Town Deeds Registry (90 Plein St)',
    deedsBarcode: 'ST00018902/2026/CT',
    transferDeedNo: 'ST 0018902 / 2026',
    sellerName: 'Giovanni Yorick Bowman',
    purchaserName: 'Cape Horizon Holdings Ltd',
    lodgementDate: '2026-08-26',
    currentStep: '2_LODGED_BATCH1',
    examinerNotes: 'Batch 1 verification with Deeds Registrar junior scrutiny officer.',
    expectedRegistrationDate: '2026-09-04',
    commissionPayable: 954000,
    commissionPaidOut: false
  }
];
