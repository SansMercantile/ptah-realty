import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  CreditCard, 
  Building2, 
  Search, 
  Check, 
  History,
  Lock,
  User,
  Sparkles,
  FileSpreadsheet,
  Home,
  Briefcase,
  Layers,
  MapPin,
  Phone,
  Mail,
  Info,
  ChevronRight,
  ChevronDown,
  Landmark,
  Coins,
  Share2,
  Calendar,
  Send,
  Smartphone,
  MessageSquare,
  Copy,
  ExternalLink,
  Shield,
  FileCheck,
  CheckCircle,
  RotateCcw,
  Asterisk,
  Eye,
  CheckSquare
} from 'lucide-react';
import { KYCReportRecord, KYCReportType, KYCPrescribedPurpose } from '../../types';
import { KYC_INITIAL_HISTORY, PROPERTIES_DATA } from '../../services/mockData';
import { verifyIndividualKyc, verifyCorporateKyc, queryDeeds, KycCaseResult } from '../../services/api';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOwnerName?: string;
  initialOwnerId?: string;
  onOpenCreditsModal?: () => void;
}

export type MainKYCTab = 'FICA_COMPLIANCE' | 'PERSON' | 'ADDRESS' | 'COMPANY' | 'TRUST' | 'PROPERTY_REPORTS' | 'AUDIT_HISTORY';

export interface CrmClientRecord {
  id: string;
  fullName: string;
  firstName: string;
  surname: string;
  idNumber: string;
  preferredCommunication: string;
  phone: string;
  email: string;
  address?: string;
}

export interface FicaDispatchRecord {
  id: string;
  clientName: string;
  idNumber: string;
  communicationMethod: string;
  contactTarget: string;
  dateSent: string;
  status: 'DISPATCHED' | 'VERIFIED' | 'PENDING_UPLOAD' | 'REVIEW';
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  biometricsDone: boolean;
  addressVerified: boolean;
  pepPassed: boolean;
}

const CRM_CLIENT_RECORDS: CrmClientRecord[] = [
  {
    id: 'crm-1',
    fullName: 'Stephan Fridolin Muller',
    firstName: 'Stephan',
    surname: 'Muller',
    idNumber: '6703065098084',
    preferredCommunication: 'WhatsApp (Direct Automated Link)',
    phone: '+27 82 491 8820',
    email: 'stephan.muller@investcape.co.za',
    address: '5 Richmond Road, Three Anchor Bay'
  },
  {
    id: 'crm-2',
    fullName: 'Ronald Spencer Read',
    firstName: 'Ronald',
    surname: 'Read',
    idNumber: '8303305103087',
    preferredCommunication: 'Email (Electronic Signature + ID Upload)',
    phone: '+27 82 890 3863',
    email: 'ron@lawrealestate.co.za',
    address: '11 Mutley Road, Three Anchor Bay'
  },
  {
    id: 'crm-3',
    fullName: 'Giovanni Yorick Bowman',
    firstName: 'Giovanni',
    surname: 'Bowman',
    idNumber: '9107015098089',
    preferredCommunication: 'Dual Channel (Email + SMS)',
    phone: '+27 71 884 9201',
    email: 'giovanni@sbgrealestate.co.za',
    address: 'Suite 401, 76 Regent Road, Sea Point'
  },
  {
    id: 'crm-4',
    fullName: 'Eleanor Victoria Pier',
    firstName: 'Eleanor',
    surname: 'Pier',
    idNumber: '6112040098083',
    preferredCommunication: 'SMS (Instant Mobile Verification)',
    phone: '+27 83 221 4455',
    email: 'eleanor.pier@gmail.com',
    address: '5 Richmond Road, Three Anchor Bay'
  },
  {
    id: 'crm-5',
    fullName: 'Dr. Michael Pier',
    firstName: 'Michael',
    surname: 'Pier',
    idNumber: '5809145089082',
    preferredCommunication: 'Email (Electronic Signature + ID Upload)',
    phone: '+27 82 990 1122',
    email: 'piermane.trust@capeproperty.co.za',
    address: '5 Richmond Road, Three Anchor Bay'
  }
];

export const KYCModal: React.FC<KYCModalProps> = ({
  isOpen,
  onClose,
  initialOwnerName = '',
  initialOwnerId = '',
  onOpenCreditsModal
}) => {
  const [mainTab, setMainTab] = useState<MainKYCTab>('FICA_COMPLIANCE');
  
  // -------------------------------------------------------------
  // FICA Compliance Tab State (Matching Screenshot 2026-08-28)
  // -------------------------------------------------------------
  const [ficaCrmSearch, setFicaCrmSearch] = useState('');
  const [isFicaCrmDropdownOpen, setIsFicaCrmDropdownOpen] = useState(false);
  const [ficaFirstName, setFicaFirstName] = useState('');
  const [ficaSurname, setFicaSurname] = useState('');
  const [ficaIdNumber, setFicaIdNumber] = useState('');
  const [ficaCommunicationMethod, setFicaCommunicationMethod] = useState('');
  const [ficaHasConsent, setFicaHasConsent] = useState(true);
  const [isFicaBannerDismissed, setIsFicaBannerDismissed] = useState(false);
  const [isFicaSending, setIsFicaSending] = useState(false);
  const [ficaDispatchedResult, setFicaDispatchedResult] = useState<FicaDispatchRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [ficaRecentRequests, setFicaRecentRequests] = useState<FicaDispatchRecord[]>([
    {
      id: 'FICA-REQ-9041',
      clientName: 'Stephan Fridolin Muller',
      idNumber: '6703065098084',
      communicationMethod: 'WhatsApp (Direct Automated Link)',
      contactTarget: '+27 82 491 8820',
      dateSent: '2026-08-27 16:30',
      status: 'VERIFIED',
      riskRating: 'LOW',
      biometricsDone: true,
      addressVerified: true,
      pepPassed: true
    },
    {
      id: 'FICA-REQ-9042',
      clientName: 'Ronald Spencer Read',
      idNumber: '8303305103087',
      communicationMethod: 'Email (Electronic Signature + ID Upload)',
      contactTarget: 'ron@lawrealestate.co.za',
      dateSent: '2026-08-27 18:15',
      status: 'PENDING_UPLOAD',
      riskRating: 'LOW',
      biometricsDone: false,
      addressVerified: false,
      pepPassed: true
    }
  ]);

  // Person Tab State
  const [idNumber, setIdNumber] = useState(initialOwnerId || '6703065098084');
  const [personPurpose, setPersonPurpose] = useState<KYCPrescribedPurpose>(
    'Section 18(4) - Credit assessment / Application'
  );
  const [personResult, setPersonResult] = useState<any>(null);

  // Address Tab State
  const [addressSearch, setAddressSearch] = useState('5 RICHMOND ROAD, THREE ANCHOR BAY');
  const [addressResult, setAddressResult] = useState<any>(null);

  // Company Tab State
  const [companyRegNo, setCompanyRegNo] = useState('2017/337109/07');
  const [companyName, setCompanyName] = useState('S B G REAL ESTATE PTY LTD');
  const [companyResult, setCompanyResult] = useState<any>(null);

  // Trust Tab State
  const [trustSearchBy, setTrustSearchBy] = useState<'NUMBER' | 'NAME'>('NUMBER');
  const [trustNo, setTrustNo] = useState('IT 1895/2007');
  const [trustName, setTrustName] = useState('PIER MANE TRUST');
  const [trustResult, setTrustResult] = useState<any>(null);

  // Property Reports Tab State
  const [propReportSubTab, setPropReportSubTab] = useState<'Property' | 'Complex' | 'Sectional Scheme' | 'Estate' | 'Suburb' | 'Street' | 'Transfer' | 'History'>('Property');
  const [propSearchBy, setPropSearchBy] = useState<'Full Title' | 'Person' | 'Company' | 'Trust' | 'Title Deed' | 'ERF' | 'Farm'>('Full Title');
  const [propProvince, setPropProvince] = useState('WESTERN CAPE');
  const [propSuburb, setPropSuburb] = useState('THREE ANCHOR BAY, CITY OF CAPE TOWN');
  const [propStreet, setPropStreet] = useState('5 RICHMOND ROAD');
  const [propErf, setPropErf] = useState('1681');
  const [propPortion, setPropPortion] = useState('0');
  const [propReportResult, setPropReportResult] = useState<any>(null);

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [hasConsent, setHasConsent] = useState(true);
  const [historyList, setHistoryList] = useState<KYCReportRecord[]>(KYC_INITIAL_HISTORY);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<KYCReportRecord | null>(null);

  if (!isOpen) return null;

  // Handler: Select Client from CRM
  const handleSelectCrmClient = (client: CrmClientRecord) => {
    setFicaCrmSearch(`${client.fullName} (${client.idNumber})`);
    setFicaFirstName(client.firstName);
    setFicaSurname(client.surname);
    setFicaIdNumber(client.idNumber);
    setFicaCommunicationMethod(client.preferredCommunication);
    setIsFicaCrmDropdownOpen(false);
  };

  // Handler: Send FICA Request (Direct translation from screenshot)
  const handleSendFicaRequest = () => {
    if (!ficaHasConsent) {
      alert('Consent Required: In accordance with POPIA & FICA Section 21, you must obtain client consent before dispatching a verification request.');
      return;
    }

    if (!ficaFirstName.trim() && !ficaSurname.trim() && !ficaIdNumber.trim()) {
      alert('Please select an existing CRM Client or enter the Client Name and ID Number.');
      return;
    }

    if (!ficaCommunicationMethod || ficaCommunicationMethod === 'Select Preferred Communication') {
      alert('Please select a Preferred Communication Method to send the verification link.');
      return;
    }

    setIsFicaSending(true);
    setTimeout(() => {
      const targetName = `${ficaFirstName} ${ficaSurname}`.trim() || 'Client';
      const targetId = ficaIdNumber.trim() || '8303305103087';
      const newRecord: FicaDispatchRecord = {
        id: `FICA-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: targetName,
        idNumber: targetId,
        communicationMethod: ficaCommunicationMethod,
        contactTarget: ficaCommunicationMethod.includes('Email') ? `${ficaFirstName.toLowerCase()}@clientmail.co.za` : '+27 82 555 0192',
        dateSent: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'DISPATCHED',
        riskRating: 'LOW',
        biometricsDone: false,
        addressVerified: false,
        pepPassed: true
      };

      setFicaDispatchedResult(newRecord);
      setFicaRecentRequests(prev => [newRecord, ...prev]);

      // Add to audit trail history
      const newAudit: KYCReportRecord = {
        id: `kyc-fica-${Date.now()}`,
        reportType: 'FICA_COMPLIANCE' as any,
        targetName: targetName,
        targetIdOrReg: targetId,
        requestedBy: 'Ronald Read (Agent)',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        prescribedPurpose: 'Section 18(4) - Client Identification and Verification (FICA Act 38 of 2001)',
        searchReference: newRecord.id,
        costVatExcl: 15.00,
        status: 'COMPLETED',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
        data: {
          communicationMethod: ficaCommunicationMethod,
          dispatchStatus: 'DELIVERED',
          smartComplianceRating: 'PENDING_UPLOAD',
          sanctionsPepPreScreen: 'CLEAR'
        }
      };

      setHistoryList(prev => [newAudit, ...prev]);
      setIsFicaSending(false);
    }, 700);
  };

  // Handler: Clear FICA Form
  const handleClearFicaForm = () => {
    setFicaCrmSearch('');
    setFicaFirstName('');
    setFicaSurname('');
    setFicaIdNumber('');
    setFicaCommunicationMethod('');
    setFicaHasConsent(true);
    setFicaDispatchedResult(null);
  };

  // Person Find -- real backend round trip (services/kyc.py's
  // provider-neutral mock: real overall_status/checks, not live HANIS/
  // credit-bureau data) merged into this persona's richer local profile,
  // which the backend's simpler KycCase model doesn't carry fields for.
  const handleFindPerson = async () => {
    if (!idNumber.trim()) {
      alert('Please enter a valid 13-digit South African ID number.');
      return;
    }
    setIsLoading(true);

    let backendCase: KycCaseResult | null = null;
    try {
      backendCase = await verifyIndividualKyc(initialOwnerName || 'Subject Individual', idNumber);
    } catch (err) {
      console.error('KYC individual verification failed, showing local profile only:', err);
    }

    let mock;
    if (idNumber.includes('670306') || idNumber === '6703065098084') {
        mock = {
          fullName: 'STEPHAN FRIDOLIN MULLER',
          idNumber: '6703065098084',
          dob: '1967-03-06',
          age: 59,
          gender: 'Male',
          citizenship: 'South African (Citizen by Birth)',
          homeAffairsStatus: 'Verified Alive',
          maritalStatus: 'Married in Community of Property',
          spouseId: '7004120092081',
          spouseName: 'ANNA HELENA MULLER',
          contact: {
            mobilePrimary: '082 491 8820',
            mobileSecondary: '071 884 9201',
            email: 'stephan.muller@investcape.co.za',
            physicalAddress: '5 Richmond Road, Three Anchor Bay, Cape Town, 8005',
            previousAddress: '14 St Andrews Road, Green Point, Cape Town'
          },
          deedsProperties: [
            { erf: 'Erf 1681', suburb: 'Three Anchor Bay', share: '100%', purchaseDate: '2007/07/13', price: 'R 2 400 000', titleDeed: 'T78896/2007' },
            { erf: 'Erf 441 Unit 4', suburb: 'Green Point', share: '50%', purchaseDate: '2019/11/04', price: 'R 3 850 000', titleDeed: 'ST1944/2019' }
          ],
          cipcDirectorships: [
            { company: 'ATLANTIC HARBOUR PROPERTIES PTY LTD', regNo: '2015/098421/07', status: 'ACTIVE', role: 'Director', appointmentDate: '2015-04-12' },
            { company: 'MULLER ASSET MANAGEMENT CC', regNo: 'CK1998/011420/23', status: 'ACTIVE', role: 'Member', appointmentDate: '1998-08-01' }
          ],
          creditBureau: {
            score: 785,
            scoreBand: 'EXCELLENT / MINIMAL RISK',
            scoreRange: '0 - 999 (TransUnion / Experian Index)',
            defaults: 0,
            judgments: 0,
            notices: 0,
            debtReview: 'NO - Not Under Debt Review',
            enquiriesLast3Mo: 1
          },
          ficaAmlStatus: {
            sanctionsMatch: 'CLEAR (UN, OFSI, OFAC Passed)',
            pepStatus: 'NO MATCH (Not Politically Exposed)',
            riskRating: 'LOW RISK (FICA / FATF Compliant)'
          }
        };
      } else {
        mock = {
          fullName: 'RONALD SPENCER READ',
          idNumber: idNumber || '8303305103087',
          dob: '1983-03-30',
          age: 43,
          gender: 'Male',
          citizenship: 'South African (Citizen)',
          homeAffairsStatus: 'Verified Alive',
          maritalStatus: 'Unmarried / Single',
          contact: {
            mobilePrimary: '082 890 3863',
            mobileSecondary: '021 439 7777',
            email: 'ron@lawrealestate.co.za',
            physicalAddress: '11 Mutley Road, Three Anchor Bay, Cape Town, 8005',
            previousAddress: '22 Ocean View Drive, Sea Point, 8005'
          },
          deedsProperties: [
            { erf: 'Erf 1679', suburb: 'Three Anchor Bay', share: '50%', purchaseDate: '2023/07/22', price: 'R 7 450 000', titleDeed: 'T44901/2023' }
          ],
          cipcDirectorships: [
            { company: 'LAW REAL ESTATE ADVISORS PTY LTD', regNo: '2018/449102/07', status: 'ACTIVE', role: 'Principal Director', appointmentDate: '2018-05-15' }
          ],
          creditBureau: {
            score: 810,
            scoreBand: 'TIER 1 PRESTIGE',
            scoreRange: '0 - 999',
            defaults: 0,
            judgments: 0,
            notices: 0,
            debtReview: 'NO',
            enquiriesLast3Mo: 0
          },
          ficaAmlStatus: {
            sanctionsMatch: 'CLEAR',
            pepStatus: 'CLEAR',
            riskRating: 'LOW RISK'
          }
        };
      }

      setPersonResult({
        ...mock,
        backendVerification: backendCase
          ? { caseId: backendCase.id, overallStatus: backendCase.overall_status, checks: backendCase.checks }
          : null
      });
      setIsLoading(false);
  };

  // Address Find -- real backend round trip against the tenant's own
  // deeds/property records (services/kyc.py's query_deeds, which searches
  // this tenant's `properties` collection by erf/owner/title deed).
  const handleFindAddress = async () => {
    setIsLoading(true);

    const erfMatch = addressSearch.match(/erf\s*(\d+)/i) || addressSearch.match(/^(\d{3,5})\b/);
    let backendMatches: any[] = [];
    try {
      const result = erfMatch
        ? await queryDeeds('erf', erfMatch[1])
        : await queryDeeds('owner', addressSearch || 'PIER MANE TRUST');
      backendMatches = result.matches;
    } catch (err) {
      console.error('Deeds query failed, showing local cadastral profile only:', err);
    }

    setAddressResult({
        address: addressSearch,
        erfNo: '1681',
        portion: '0',
        suburb: 'THREE ANCHOR BAY',
        township: 'GREEN POINT',
        municipality: 'CITY OF CAPE TOWN',
        province: 'WESTERN CAPE',
        cadastralExtentM2: 201,
        zoning: 'GR4 (General Residential 4)',
        registeredOwner: 'PIER MANE TRUST',
        ownerId: '1895/2007',
        titleDeed: 'T78896/2007',
        registrationDate: '2007/10/02',
        purchasePrice: 'R 2 400 000',
        bondHolder: 'NONE (UNENCUMBERED)',
        municipalValuation: 'R 7 200 000 (2023 Roll)',
        estimatedMarketValue: 'R 7 750 000 - R 8 200 000',
        occupants: [
          { name: 'Dr. Michael Pier', role: 'Trustee / Primary Contact', phone: '082 491 8820', email: 'piermane.trust@capeproperty.co.za' }
        ],
        backendDeedsMatches: backendMatches
      });
      setIsLoading(false);
  };

  // Company Find -- real backend round trip (services/kyc.py's
  // provider-neutral mock CIPC/director/sanctions checks) merged into
  // this richer local profile.
  const handleFindCompany = async () => {
    setIsLoading(true);
    const legalName = companyName || 'S B G REAL ESTATE PTY LTD';
    const regNo = companyRegNo || '2017/337109/07';

    let backendCase: KycCaseResult | null = null;
    try {
      backendCase = await verifyCorporateKyc(legalName, regNo);
    } catch (err) {
      console.error('KYC corporate verification failed, showing local profile only:', err);
    }

    setCompanyResult({
        registeredName: companyName || 'S B G REAL ESTATE PTY LTD',
        regNo: companyRegNo || '2017/337109/07',
        status: 'In Business (Active)',
        type: 'Private Company (Pty Ltd)',
        regDate: '2017-08-14',
        financialYearEnd: 'February',
        taxStatus: 'Good Standing (SARS Compliant)',
        annualReturnStatus: 'Up to date (2025/2026)',
        registeredAddress: 'Suite 401, The Point Mall, 76 Regent Road, Sea Point, 8005',
        postalAddress: 'P.O. Box 2210, Sea Point, 8060',
        directors: [
          { name: 'GIOVANNI YORICK BOWMAN', idNumber: '9107015098089', status: 'ACTIVE', appointmentDate: '2017-08-14' },
          { name: 'HARVEY DAVID FOSTER', idNumber: '8803125199084', status: 'ACTIVE', appointmentDate: '2019-02-01' }
        ],
        propertyHoldings: [
          { erf: 'Erf 1679', township: 'Green Point', property: '11 Mutley Road, Three Anchor Bay', transferDate: '2023/07/22', price: 'R 7 450 000' }
        ],
        backendVerification: backendCase
          ? { caseId: backendCase.id, overallStatus: backendCase.overall_status, checks: backendCase.checks }
          : null
      });
      setIsLoading(false);
  };

  // Trust Find
  const handleFindTrust = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTrustResult({
        trustName: trustName || 'PIER MANE TRUST',
        trustNo: trustNo || 'IT 1895/2007',
        mastersOffice: 'Cape Town High Court',
        registrationDate: '2007-06-18',
        trustType: 'Inter Vivos Family Property Trust',
        status: 'Registered & Active',
        trustees: [
          { name: 'Dr. Michael Pier', idNumber: '5809145089082', status: 'Active Trustee', appointmentDate: '2007-06-18' },
          { name: 'Eleanor Victoria Pier', idNumber: '6112040098083', status: 'Active Trustee', appointmentDate: '2007-06-18' },
          { name: 'Cape Trustees & Fiduciary Services Pty Ltd', regNo: '2001/014890/07', status: 'Independent Corporate Trustee', appointmentDate: '2014-03-10' }
        ],
        registeredProperties: [
          { erf: 'Erf 1681 Green Point', address: '5 Richmond Road, Three Anchor Bay', titleDeed: 'T78896/2007', extent: '201 m²', purchasePrice: 'R 2 400 000' }
        ]
      });
      setIsLoading(false);
    }, 600);
  };

  // Property Report Find
  const handleFindPropertyReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPropReportResult({
        title: `Comprehensive Property Valuation & Deeds Report: ${propStreet}`,
        suburb: propSuburb,
        province: propProvince,
        erfNo: propErf,
        portion: propPortion,
        extentM2: 201,
        zoning: 'GR4',
        deedsDeedNo: 'T78896/2007',
        owner: 'PIER MANE TRUST',
        lastSalePrice: 'R 2 400 000',
        lastSaleDate: '2007/07/13',
        municipalValuation: 'R 7 200 000',
        ratesMonthly: 'R 2 850',
        marketEstimate: 'R 7 750 000',
        pricePerM2: 'R 38 557 / m²',
        vicinityMedianPrice: 'R 8 700 000',
        vicinityGrowth5Yr: '+34.2%',
        daysOnMarketAverage: '26 Days'
      });
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div 
        id="enhanced-kyc-modal"
        className="bg-white text-slate-800 w-full max-w-5xl rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar with Credits */}
        <div className="bg-[#006980] px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-700/80 flex items-center justify-center text-cyan-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span>KYC, DEEDS & VERIFICATION SUITE</span>
                <span className="bg-cyan-500/20 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-400/30">
                  NATIONAL REGISTRY
                </span>
              </h2>
              <span className="text-[10px] text-cyan-100/90 block">
                Direct Gateway to Home Affairs (HANIS), Credit Bureaus, CIPC Companies & Deeds Office
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Credits pill */}
            <div 
              onClick={onOpenCreditsModal}
              className="bg-cyan-900/80 hover:bg-cyan-950 border border-cyan-400/40 text-cyan-100 px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors"
              title="Click to buy/top-up search credits"
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span>DATA: 250 | FICA: 0 | TRUST: 0</span>
              <span className="bg-cyan-500 text-white text-[9px] font-sans px-1.5 py-0.2 rounded font-bold">
                BUY
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-cyan-100 hover:text-white hover:bg-cyan-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Tabs Navigation matching screenshots */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between text-xs overflow-x-auto">
          <div className="flex items-center gap-1 shrink-0">
            {/* 1. FICA Compliance Tab (Matching User Request) */}
            <button
              id="tab-kyc-fica"
              onClick={() => setMainTab('FICA_COMPLIANCE')}
              className={`px-4 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                mainTab === 'FICA_COMPLIANCE'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#00bcd4]" />
              <span>FICA Compliance</span>
            </button>

            {/* 2. Person Tab */}
            <button
              id="tab-kyc-person"
              onClick={() => setMainTab('PERSON')}
              className={`px-4 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                mainTab === 'PERSON'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-[#00bcd4]" />
              <span>Person</span>
            </button>

            {/* 3. Address Tab */}
            <button
              id="tab-kyc-address"
              onClick={() => setMainTab('ADDRESS')}
              className={`px-4 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                mainTab === 'ADDRESS'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Address</span>
            </button>

            {/* 4. Company Tab */}
            <button
              id="tab-kyc-company"
              onClick={() => setMainTab('COMPANY')}
              className={`px-4 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                mainTab === 'COMPANY'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Company</span>
            </button>

            {/* 5. Trust Tab */}
            <button
              id="tab-kyc-trust"
              onClick={() => setMainTab('TRUST')}
              className={`px-4 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                mainTab === 'TRUST'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-4 h-4 text-indigo-600" />
              <span>Trust</span>
            </button>

            {/* 6. Property Reports Tab */}
            <button
              id="tab-kyc-property-reports"
              onClick={() => setMainTab('PROPERTY_REPORTS')}
              className={`px-4 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                mainTab === 'PROPERTY_REPORTS'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Property Reports</span>
            </button>
          </div>

          <div className="shrink-0 py-1">
            <button
              onClick={() => setMainTab('AUDIT_HISTORY')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                mainTab === 'AUDIT_HISTORY'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-600" />
              <span>Audit History ({historyList.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
          
          {/* ============================================================ */}
          {/* 0. FICA COMPLIANCE TAB (Matches Screenshot Exactly) */}
          {/* ============================================================ */}
          {mainTab === 'FICA_COMPLIANCE' && (
            <div className="space-y-6">
              {/* Red/Coral Section Title (Exact Screenshot Styling) */}
              <h2 className="text-[#e05666] text-2xl font-normal tracking-tight">
                FICA Compliance
              </h2>

              {/* Main White Form Card */}
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs">
                {/* Header: Smart Compliance */}
                <div className="flex items-center gap-2 text-[#00bcd4] font-bold text-xs sm:text-sm uppercase tracking-wide mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#00bcd4] shrink-0" />
                  <span>SMART COMPLIANCE STARTS HERE: VERIFY YOUR CLIENTS</span>
                </div>

                {/* Dismissible Info Alert Banner */}
                {!isFicaBannerDismissed && (
                  <div className="bg-slate-100/90 border border-slate-200/90 rounded-md py-2.5 px-4 flex items-center justify-between text-xs text-slate-700 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00bcd4] font-bold text-sm leading-none">ⓘ</span>
                      <span>
                        <strong>Search</strong> for an existing CRM client, or <strong>add a new</strong> client below to send a FICA request directly.
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsFicaBannerDismissed(true)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1 rounded hover:bg-slate-200"
                      title="Dismiss notice"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Form Elements Grid (Matching Screenshot Layout and Alignment) */}
                <div className="max-w-2xl space-y-4">
                  
                  {/* Field 1: CRM Client */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-56 text-left sm:text-right text-slate-700 text-xs font-medium shrink-0">
                      CRM Client
                    </label>
                    <div className="flex-1 relative">
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={ficaCrmSearch}
                          onChange={(e) => {
                            setFicaCrmSearch(e.target.value);
                            setIsFicaCrmDropdownOpen(true);
                          }}
                          onFocus={() => setIsFicaCrmDropdownOpen(true)}
                          placeholder="Search for a Client in your CRM"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-400 pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setIsFicaCrmDropdownOpen(!isFicaCrmDropdownOpen)}
                          className="absolute right-10 text-slate-400 hover:text-slate-600 p-1"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFicaCrmDropdownOpen(!isFicaCrmDropdownOpen)}
                          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white px-3 py-2 rounded-r flex items-center justify-center transition-colors shrink-0"
                          title="Search CRM Clients"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </div>

                      {/* CRM Client Dropdown */}
                      {isFicaCrmDropdownOpen && (
                        <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto">
                          <div className="p-1.5 text-[10px] uppercase font-bold text-slate-400 bg-slate-50 border-b border-slate-100">
                            Select an existing CRM client:
                          </div>
                          {CRM_CLIENT_RECORDS.filter(c => 
                            c.fullName.toLowerCase().includes(ficaCrmSearch.toLowerCase()) ||
                            c.idNumber.includes(ficaCrmSearch)
                          ).map((client) => (
                            <div
                              key={client.id}
                              onClick={() => handleSelectCrmClient(client)}
                              className="px-3 py-2 hover:bg-cyan-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-semibold text-slate-900 block">{client.fullName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {client.idNumber} • {client.phone}</span>
                              </div>
                              <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded">
                                Select
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Field 2: Full Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-56 text-left sm:text-right text-slate-700 text-xs font-medium shrink-0">
                      Full Name
                    </label>
                    <div className="flex-1 flex items-center">
                      <input
                        type="text"
                        value={ficaFirstName}
                        onChange={(e) => setFicaFirstName(e.target.value)}
                        placeholder="Enter First Name (if new)"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-400"
                      />
                      {/* Orange Asterisk Badge matching screenshot */}
                      <div className="bg-[#fbe9e7] border border-[#ffccbc] text-[#ff5722] px-2.5 py-1.5 rounded-r flex items-center justify-center font-bold text-xs select-none shrink-0" title="Required field">
                        ✱
                      </div>
                    </div>
                  </div>

                  {/* Field 3: Surname */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-56 text-left sm:text-right text-slate-700 text-xs font-medium shrink-0">
                      Surname
                    </label>
                    <div className="flex-1 flex items-center">
                      <input
                        type="text"
                        value={ficaSurname}
                        onChange={(e) => setFicaSurname(e.target.value)}
                        placeholder="Enter Surname (if new)"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-400"
                      />
                      <div className="bg-[#fbe9e7] border border-[#ffccbc] text-[#ff5722] px-2.5 py-1.5 rounded-r flex items-center justify-center font-bold text-xs select-none shrink-0" title="Required field">
                        ✱
                      </div>
                    </div>
                  </div>

                  {/* Field 4: ID Number */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-56 text-left sm:text-right text-slate-700 text-xs font-medium shrink-0">
                      ID Number
                    </label>
                    <div className="flex-1 flex items-center">
                      <input
                        type="text"
                        value={ficaIdNumber}
                        onChange={(e) => setFicaIdNumber(e.target.value)}
                        placeholder="Enter ID Number"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 text-xs font-mono focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-400"
                      />
                      <div className="bg-[#fbe9e7] border border-[#ffccbc] text-[#ff5722] px-2.5 py-1.5 rounded-r flex items-center justify-center font-bold text-xs select-none shrink-0" title="Required field">
                        ✱
                      </div>
                    </div>
                  </div>

                  {/* Field 5: Select Communication Method */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-56 text-left sm:text-right text-slate-700 text-xs font-medium shrink-0">
                      Select Communication Method
                    </label>
                    <div className="flex-1 flex items-center">
                      <select
                        value={ficaCommunicationMethod}
                        onChange={(e) => setFicaCommunicationMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-l text-slate-800 text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                      >
                        <option value="">Select Preferred Communication</option>
                        <option value="WhatsApp (Direct Automated Link)">WhatsApp (Direct Automated Link)</option>
                        <option value="Email (Electronic Signature + ID Upload)">Email (Electronic Signature + ID Upload)</option>
                        <option value="SMS (Instant Mobile Verification)">SMS (Instant Mobile Verification)</option>
                        <option value="Dual Channel (Email + SMS)">Dual Channel (Email + SMS)</option>
                        <option value="Client Portal Link">Client Portal Link</option>
                      </select>
                      <div className="bg-[#fbe9e7] border border-[#ffccbc] text-[#ff5722] px-2.5 py-1.5 rounded-r flex items-center justify-center font-bold text-xs select-none shrink-0" title="Required field">
                        ✱
                      </div>
                    </div>
                  </div>

                  {/* Field 6: Consent Toggle Switch (Exact Screenshot Matching) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1">
                    <div className="w-full sm:w-56 text-left sm:text-right shrink-0">
                      <span className="text-slate-700 text-xs font-normal">I have obtained consent</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => setFicaHasConsent(!ficaHasConsent)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                          ficaHasConsent ? 'bg-[#00bcd4]' : 'bg-slate-300'
                        }`}
                        title="Toggle consent confirmation"
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                            ficaHasConsent ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Field 7: Action Buttons (SEND & CLEAR matching screenshot) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-2">
                    <div className="w-full sm:w-56 shrink-0 hidden sm:block"></div>
                    <div className="flex items-center gap-3">
                      <button
                        id="btn-send-fica-request"
                        type="button"
                        onClick={handleSendFicaRequest}
                        disabled={isFicaSending}
                        className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-8 py-2 rounded shadow-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                      >
                        {isFicaSending ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>SENDING...</span>
                          </>
                        ) : (
                          <span>SEND</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleClearFicaForm}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-6 py-2 rounded uppercase tracking-wider transition-colors"
                      >
                        CLEAR
                      </button>
                    </div>
                  </div>

                </div>

                {/* Dispatched Verification Result Card */}
                {ficaDispatchedResult && (
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-5">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-emerald-950">
                              FICA Request Dispatched Successfully
                            </h4>
                            <p className="text-[11px] text-emerald-800 font-mono">
                              Reference: {ficaDispatchedResult.id} • Sent via {ficaDispatchedResult.communicationMethod}
                            </p>
                          </div>
                        </div>

                        <span className="bg-emerald-200 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded">
                          Link Active
                        </span>
                      </div>

                      {/* Details & Link */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Client Name:</span>
                            <strong className="text-slate-900">{ficaDispatchedResult.clientName}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">ID Number:</span>
                            <strong className="text-slate-900 font-mono">{ficaDispatchedResult.idNumber}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Delivery Target:</span>
                            <span className="text-slate-700 font-medium">{ficaDispatchedResult.contactTarget}</span>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border border-emerald-200 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">
                            CLIENT VERIFICATION PORTAL URL:
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`https://ptah-realty.co.za/fica/verify?ref=${ficaDispatchedResult.id}`}
                              className="w-full bg-slate-50 border border-slate-200 rounded text-[11px] font-mono p-1 text-slate-700 select-all"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`https://ptah-realty.co.za/fica/verify?ref=${ficaDispatchedResult.id}`);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                              }}
                              className="bg-cyan-700 hover:bg-cyan-800 text-white p-1.5 rounded text-xs shrink-0 flex items-center gap-1"
                              title="Copy URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 5-Step Compliance Verification Pipeline */}
                      <div className="mt-4 pt-4 border-t border-emerald-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Live Automated Verification Pipeline:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                          <div className="bg-white p-2 rounded border border-emerald-200 text-emerald-700 font-bold">
                            ✓ 1. Link Dispatched
                          </div>
                          <div className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-800 font-semibold">
                            ⏳ 2. POPIA Consent
                          </div>
                          <div className="bg-slate-100 p-2 rounded border border-slate-200 text-slate-600">
                            3. Smart ID / Biometrics
                          </div>
                          <div className="bg-slate-100 p-2 rounded border border-slate-200 text-slate-600">
                            4. Proof of Address
                          </div>
                          <div className="bg-slate-100 p-2 rounded border border-slate-200 text-slate-600">
                            5. Sanctions & PEP
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Recent FICA Requests & Verifications Ledger */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <span>Recent FICA Requests & Verifications</span>
                      <span className="bg-cyan-100 text-cyan-900 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
                        {ficaRecentRequests.length} Active
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Monitor ongoing client submissions, biometric scans, and compliance certifications.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2.5">Reference</th>
                        <th className="p-2.5">Client Name</th>
                        <th className="p-2.5">ID Number</th>
                        <th className="p-2.5">Channel</th>
                        <th className="p-2.5">Date Dispatched</th>
                        <th className="p-2.5">Biometrics</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {ficaRecentRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-cyan-900">{req.id}</td>
                          <td className="p-2.5 font-medium text-slate-900">{req.clientName}</td>
                          <td className="p-2.5 font-mono text-slate-600">{req.idNumber}</td>
                          <td className="p-2.5 text-slate-700">{req.communicationMethod.split(' ')[0]}</td>
                          <td className="p-2.5 text-slate-500 font-mono">{req.dateSent}</td>
                          <td className="p-2.5">
                            {req.biometricsDone ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Passed
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium flex items-center gap-1">
                                ⏳ Pending Upload
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            {req.status === 'VERIFIED' ? (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] px-2 py-0.5 rounded font-bold">
                                FICA CERTIFIED
                              </span>
                            ) : (
                              <span className="bg-cyan-100 text-cyan-800 border border-cyan-200 text-[9px] px-2 py-0.5 rounded font-bold">
                                DISPATCHED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 1. PERSON TAB (Matches Screenshot 1) */}
          {/* ============================================================ */}
          {mainTab === 'PERSON' && (
            <div className="space-y-4">
              {/* Search Form Card */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="max-w-xl space-y-3">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">
                      ID Number <span className="text-amber-500 font-bold">*</span>
                    </label>
                    <input 
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g. 6703065098084"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-sm font-bold focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                      <Info className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>Please ensure that you have obtained the relevant OPT INS.</span>
                    </div>
                  </div>

                  {/* Demo presets for fast testing */}
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="text-slate-400 font-medium">Quick Demo Samples:</span>
                    <button 
                      type="button" 
                      onClick={() => setIdNumber('6703065098084')}
                      className="text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded font-mono font-semibold"
                    >
                      6703065098084 (S. Muller)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIdNumber('8303305103087')}
                      className="text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded font-mono font-semibold"
                    >
                      8303305103087 (R. Read)
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      id="btn-find-person"
                      onClick={handleFindPerson}
                      disabled={isLoading}
                      className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-6 py-2 rounded shadow-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      {isLoading ? 'Searching...' : 'FIND'}
                    </button>
                    <button
                      onClick={() => {
                        setIdNumber('');
                        setPersonResult(null);
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-5 py-2 rounded uppercase tracking-wider transition-colors"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
              </div>

              {/* Person Search Results Dossier */}
              {personResult && (
                <div className="bg-white rounded-lg border border-cyan-200 shadow-sm p-5 space-y-4 animate-fade-in">
                  {/* Top Bar of Result */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-sm">
                        {personResult.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{personResult.fullName}</h3>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ID: {personResult.idNumber} • DOB: {personResult.dob} ({personResult.age} Yrs) • {personResult.gender}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-1 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{personResult.homeAffairsStatus}</span>
                      </span>
                      <button
                        onClick={() => window.print()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1 rounded flex items-center gap-1 border border-slate-300"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Dossier
                      </button>
                    </div>
                  </div>

                  {/* 3-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* 1. Contact Details */}
                    <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-cyan-800">
                        <Phone className="w-3.5 h-3.5" /> Contact & Trace Information
                      </h4>
                      <div className="space-y-1 text-[11px]">
                        <div><span className="text-slate-500">Primary Mobile:</span> <strong className="font-mono text-slate-800">{personResult.contact.mobilePrimary}</strong></div>
                        <div><span className="text-slate-500">Secondary Mobile:</span> <strong className="font-mono text-slate-800">{personResult.contact.mobileSecondary}</strong></div>
                        <div><span className="text-slate-500">Verified Email:</span> <strong className="text-cyan-700">{personResult.contact.email}</strong></div>
                        <div className="pt-1 border-t border-slate-200">
                          <span className="text-slate-500 block">Verified Physical Address:</span>
                          <span className="text-slate-800 font-medium">{personResult.contact.physicalAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Credit Bureau Scorecard */}
                    <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                        <CreditCard className="w-3.5 h-3.5" /> Credit Bureau Scorecard
                      </h4>
                      <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                        <div>
                          <div className="text-xl font-black text-cyan-900 font-mono">{personResult.creditBureau.score}</div>
                          <div className="text-[10px] text-slate-500">{personResult.creditBureau.scoreRange}</div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {personResult.creditBureau.scoreBand}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between"><span className="text-slate-500">Judgments:</span> <strong className="text-emerald-700">{personResult.creditBureau.judgments} (Clear)</strong></div>
                        <div className="flex justify-between"><span className="text-slate-500">Defaults:</span> <strong className="text-emerald-700">{personResult.creditBureau.defaults} (Clear)</strong></div>
                        <div className="flex justify-between"><span className="text-slate-500">Debt Review:</span> <strong className="text-slate-800">{personResult.creditBureau.debtReview}</strong></div>
                      </div>
                    </div>

                    {/* 3. FICA & Sanctions Check */}
                    <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-indigo-800">
                        <ShieldCheck className="w-3.5 h-3.5" /> FICA, PEP & Sanctions
                      </h4>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">AML & Sanctions Match:</span>
                          <strong className="text-emerald-700">{personResult.ficaAmlStatus.sanctionsMatch}</strong>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Politically Exposed Person (PEP):</span>
                          <strong className="text-emerald-700">{personResult.ficaAmlStatus.pepStatus}</strong>
                        </div>
                        <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded text-center font-bold text-[10px] border border-emerald-200">
                          {personResult.ficaAmlStatus.riskRating}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registered Deeds Properties Table */}
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 font-bold text-xs text-slate-800 border-b border-slate-200 flex items-center justify-between">
                      <span>Deeds Office Property Holdings ({personResult.deedsProperties.length})</span>
                      <span className="text-[10px] text-slate-500 font-normal">Source: Chief Registrar of Deeds</span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2">Property ERF</th>
                          <th className="p-2">Suburb</th>
                          <th className="p-2">Share</th>
                          <th className="p-2">Transfer Date</th>
                          <th className="p-2">Purchase Price</th>
                          <th className="p-2">Title Deed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {personResult.deedsProperties.map((p: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-cyan-900">{p.erf}</td>
                            <td className="p-2 text-slate-800">{p.suburb}</td>
                            <td className="p-2 text-slate-600">{p.share}</td>
                            <td className="p-2 text-slate-600 font-mono">{p.purchaseDate}</td>
                            <td className="p-2 text-emerald-800 font-bold font-mono">{p.price}</td>
                            <td className="p-2 text-slate-700 font-mono">{p.titleDeed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* CIPC Directorships Table */}
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 font-bold text-xs text-slate-800 border-b border-slate-200 flex items-center justify-between">
                      <span>CIPC Linked Directorships & Member Interests ({personResult.cipcDirectorships.length})</span>
                      <span className="text-[10px] text-slate-500 font-normal">Source: Companies and Intellectual Property Commission</span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2">Enterprise Name</th>
                          <th className="p-2">Registration No</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Appointed</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {personResult.cipcDirectorships.map((c: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900">{c.company}</td>
                            <td className="p-2 font-mono text-cyan-800">{c.regNo}</td>
                            <td className="p-2 text-slate-700">{c.role}</td>
                            <td className="p-2 text-slate-600 font-mono">{c.appointmentDate}</td>
                            <td className="p-2">
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. ADDRESS TAB (Matches Screenshot 2) */}
          {/* ============================================================ */}
          {mainTab === 'ADDRESS' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="max-w-xl space-y-3">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1 flex items-center justify-between">
                      <span>Address <span className="text-amber-500 font-bold">*</span></span>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </label>
                    <input 
                      type="text"
                      value={addressSearch}
                      onChange={(e) => setAddressSearch(e.target.value)}
                      placeholder="e.g. 5 RICHMOND ROAD, THREE ANCHOR BAY"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm font-semibold focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                      <Info className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>Please ensure that you have obtained the relevant OPT INS.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      id="btn-find-address"
                      onClick={handleFindAddress}
                      disabled={isLoading}
                      className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-6 py-2 rounded shadow-xs uppercase tracking-wider transition-colors"
                    >
                      {isLoading ? 'Searching...' : 'FIND'}
                    </button>
                    <button
                      onClick={() => {
                        setAddressSearch('');
                        setAddressResult(null);
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-5 py-2 rounded uppercase tracking-wider transition-colors"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
              </div>

              {/* Address Search Result */}
              {addressResult && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{addressResult.address}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ERF: {addressResult.erfNo} Portion {addressResult.portion} • {addressResult.township} • {addressResult.municipality}
                      </span>
                    </div>
                    <span className="bg-cyan-100 text-cyan-800 font-bold text-xs px-2.5 py-1 rounded">
                      Extent: {addressResult.cadastralExtentM2} m²
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-cyan-900 text-[11px] uppercase">Registered Title & Owner</h4>
                      <div><span className="text-slate-500">Registered Owner:</span> <strong className="text-slate-800 block">{addressResult.registeredOwner}</strong></div>
                      <div><span className="text-slate-500">Title Deed:</span> <span className="font-mono text-cyan-800 font-bold">{addressResult.titleDeed}</span></div>
                      <div><span className="text-slate-500">Registered Date:</span> <span className="font-mono text-slate-700">{addressResult.registrationDate}</span></div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-emerald-900 text-[11px] uppercase">Valuation & Pricing</h4>
                      <div><span className="text-slate-500">Last Deeds Purchase:</span> <strong className="text-slate-800 block font-mono">{addressResult.purchasePrice}</strong></div>
                      <div><span className="text-slate-500">Municipal Valuation:</span> <span className="font-mono text-slate-700 font-semibold">{addressResult.municipalValuation}</span></div>
                      <div><span className="text-slate-500">Estimated Market Value:</span> <strong className="text-emerald-700 block font-mono">{addressResult.estimatedMarketValue}</strong></div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-indigo-900 text-[11px] uppercase">Zoning & Occupants</h4>
                      <div><span className="text-slate-500">Zoning Code:</span> <span className="font-bold text-slate-800 block">{addressResult.zoning}</span></div>
                      <div><span className="text-slate-500">Bond Encumbrance:</span> <span className="text-emerald-700 font-bold">{addressResult.bondHolder}</span></div>
                      <div><span className="text-slate-500">Primary Contact:</span> <span className="text-cyan-700 font-semibold">{addressResult.occupants[0].name} ({addressResult.occupants[0].phone})</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. COMPANY TAB (Matches Screenshot 3) */}
          {/* ============================================================ */}
          {mainTab === 'COMPANY' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="max-w-xl space-y-3">
                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">Company Registration No.</label>
                    <input 
                      type="text"
                      value={companyRegNo}
                      onChange={(e) => setCompanyRegNo(e.target.value)}
                      placeholder="e.g. 2017/337109/07"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-sm font-bold focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-semibold mb-1">Company Name</label>
                    <input 
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. S B G REAL ESTATE PTY LTD"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm font-semibold focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      id="btn-find-company"
                      onClick={handleFindCompany}
                      disabled={isLoading}
                      className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-6 py-2 rounded shadow-xs uppercase tracking-wider transition-colors"
                    >
                      {isLoading ? 'Searching...' : 'FIND'}
                    </button>
                    <button
                      onClick={() => {
                        setCompanyRegNo('');
                        setCompanyName('');
                        setCompanyResult(null);
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-5 py-2 rounded uppercase tracking-wider transition-colors"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Search Result */}
              {companyResult && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{companyResult.registeredName}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        CIPC Reg No: {companyResult.regNo} • Registered: {companyResult.regDate} • {companyResult.type}
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded">
                      {companyResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-cyan-900 text-[11px] uppercase">Compliance & Addresses</h4>
                      <div><span className="text-slate-500">Tax Status:</span> <strong className="text-emerald-700">{companyResult.taxStatus}</strong></div>
                      <div><span className="text-slate-500">Annual Return:</span> <strong className="text-slate-800">{companyResult.annualReturnStatus}</strong></div>
                      <div className="pt-1"><span className="text-slate-500 block">Registered Office:</span> <span className="text-slate-700 font-medium">{companyResult.registeredAddress}</span></div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-[11px] uppercase">Active Appointed Directors</h4>
                      {companyResult.directors.map((d: any, i: number) => (
                        <div key={i} className="flex justify-between border-b border-slate-200 pb-1 last:border-0">
                          <div>
                            <span className="font-bold text-slate-900 block">{d.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">ID: {d.idNumber}</span>
                          </div>
                          <span className="text-emerald-700 font-bold text-[10px]">{d.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. TRUST TAB (Matches Screenshots 4-5) */}
          {/* ============================================================ */}
          {mainTab === 'TRUST' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                {/* Header with Trust Credits */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-sm text-slate-800">Master of High Court Trust Registry</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded">
                      TRUST CREDITS : 0
                    </span>
                    <button 
                      onClick={onOpenCreditsModal}
                      className="bg-[#00bcd4] hover:bg-[#00acc1] text-white text-xs font-bold px-3 py-1 rounded"
                    >
                      BUY
                    </button>
                    <Info className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* SEARCH BY Sub-tabs (Number vs Name) */}
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 font-semibold uppercase text-[11px] tracking-wider">Search By</span>
                    <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
                      <button
                        onClick={() => setTrustSearchBy('NUMBER')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          trustSearchBy === 'NUMBER' ? 'bg-[#00bcd4] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Trust Number
                      </button>
                      <button
                        onClick={() => setTrustSearchBy('NAME')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          trustSearchBy === 'NAME' ? 'bg-[#00bcd4] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Trust Name
                      </button>
                    </div>
                  </div>

                  {trustSearchBy === 'NUMBER' ? (
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">
                        Trust No. <span className="text-amber-500 font-bold">*</span>
                      </label>
                      <input 
                        type="text"
                        value={trustNo}
                        onChange={(e) => setTrustNo(e.target.value)}
                        placeholder="e.g. IT 1895/2007"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-sm font-bold focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1 flex items-center justify-between">
                        <span>Trust Name <span className="text-amber-500 font-bold">*</span></span>
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                      </label>
                      <input 
                        type="text"
                        value={trustName}
                        onChange={(e) => setTrustName(e.target.value)}
                        placeholder="e.g. PIER MANE TRUST"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm font-semibold focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  )}

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 leading-relaxed">
                    <strong>Disclaimer:</strong> Trust data is sourced from third-party providers. Some records may be incomplete or unavailable. No credits are used if no data is found. Ensure required opt-ins are obtained.
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      id="btn-find-trust"
                      onClick={handleFindTrust}
                      disabled={isLoading}
                      className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-6 py-2 rounded shadow-xs uppercase tracking-wider transition-colors"
                    >
                      {isLoading ? 'Searching...' : 'FIND'}
                    </button>
                    <button
                      onClick={() => {
                        setTrustNo('');
                        setTrustName('');
                        setTrustResult(null);
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-5 py-2 rounded uppercase tracking-wider transition-colors"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Search Result */}
              {trustResult && (
                <div className="bg-white rounded-lg border border-indigo-200 shadow-xs p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{trustResult.trustName}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Trust Reference: {trustResult.trustNo} • Registered at {trustResult.mastersOffice} ({trustResult.registrationDate})
                      </span>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 font-bold text-xs px-2.5 py-1 rounded">
                      {trustResult.status}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 border-b border-slate-200">
                      Appointed Active Trustees ({trustResult.trustees.length})
                    </div>
                    <div className="divide-y divide-slate-100 p-3 space-y-2">
                      {trustResult.trustees.map((t: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{t.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {t.idNumber ? `ID: ${t.idNumber}` : `Reg: ${t.regNo}`}
                            </span>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 border-b border-slate-200">
                      Registered Trust Deeds & Immovable Assets
                    </div>
                    <div className="p-3">
                      {trustResult.registeredProperties.map((p: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-cyan-900">{p.address}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">{p.erf} • Title: {p.titleDeed}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-800">{p.purchasePrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. PROPERTY REPORTS TAB (Matches Screenshots 8-15) */}
          {/* ============================================================ */}
          {mainTab === 'PROPERTY_REPORTS' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                {/* Header with Sub-tabs */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1 overflow-x-auto text-xs">
                    {(['Property', 'Complex', 'Sectional Scheme', 'Estate', 'Suburb', 'Street', 'Transfer', 'History'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setPropReportSubTab(tab)}
                        className={`px-3 py-1 rounded font-bold transition-all ${
                          propReportSubTab === tab 
                            ? 'bg-[#00bcd4] text-white shadow-xs' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <span>Report Credits :</span>
                    <span className="font-mono text-cyan-800">149</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* SEARCH BY Row */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-600 font-bold uppercase text-[11px]">SEARCH BY</span>
                  <div className="flex flex-wrap gap-1">
                    {(['Full Title', 'Person', 'Company', 'Trust', 'Title Deed', 'ERF', 'Farm'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setPropSearchBy(s)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                          propSearchBy === s 
                            ? 'bg-slate-800 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form fields based on Search By */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Province</label>
                    <select 
                      value={propProvince}
                      onChange={(e) => setPropProvince(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800"
                    >
                      <option value="WESTERN CAPE">WESTERN CAPE</option>
                      <option value="GAUTENG">GAUTENG</option>
                      <option value="KWAZULU-NATAL">KWAZULU-NATAL</option>
                      <option value="EASTERN CAPE">EASTERN CAPE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Suburb</label>
                    <input 
                      type="text"
                      value={propSuburb}
                      onChange={(e) => setPropSuburb(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800"
                    />
                  </div>

                  {propSearchBy === 'Full Title' && (
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Street Address</label>
                      <input 
                        type="text"
                        value={propStreet}
                        onChange={(e) => setPropStreet(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-semibold"
                      />
                    </div>
                  )}

                  {propSearchBy === 'ERF' && (
                    <>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ERF Number</label>
                        <input 
                          type="text"
                          value={propErf}
                          onChange={(e) => setPropErf(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Portion</label>
                        <input 
                          type="text"
                          value={propPortion}
                          onChange={(e) => setPropPortion(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    id="btn-generate-prop-report"
                    onClick={handleFindPropertyReport}
                    disabled={isLoading}
                    className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-6 py-2 rounded shadow-xs uppercase tracking-wider transition-colors"
                  >
                    {isLoading ? 'Compiling Report...' : 'GENERATE REPORT'}
                  </button>
                </div>
              </div>

              {/* Property Report Result */}
              {propReportResult && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{propReportResult.title}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ERF {propReportResult.erfNo} Portion {propReportResult.portion} • {propReportResult.suburb}
                      </span>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="bg-[#00bcd4] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full PDF Report
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">ESTIMATED MARKET VALUE</span>
                      <strong className="text-emerald-700 font-mono text-sm block">{propReportResult.marketEstimate}</strong>
                      <span className="text-[10px] text-slate-500">{propReportResult.pricePerM2}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">LAST DEEDS SALE</span>
                      <strong className="text-slate-900 font-mono text-sm block">{propReportResult.lastSalePrice}</strong>
                      <span className="text-[10px] text-slate-500">Transferred {propReportResult.lastSaleDate}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">MUNICIPAL ROLL 2023</span>
                      <strong className="text-cyan-900 font-mono text-sm block">{propReportResult.municipalValuation}</strong>
                      <span className="text-[10px] text-slate-500">Rates: {propReportResult.ratesMonthly}/mo</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">SUBURB 5-YR GROWTH</span>
                      <strong className="text-indigo-700 font-mono text-sm block">{propReportResult.vicinityGrowth5Yr}</strong>
                      <span className="text-[10px] text-slate-500">DOM: {propReportResult.daysOnMarketAverage}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 6. AUDIT HISTORY TAB */}
          {/* ============================================================ */}
          {mainTab === 'AUDIT_HISTORY' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">National Credit Act (NCA) 72-Hour Audit Trail</h3>
                    <p className="text-[11px] text-slate-500">
                      All searches, ID verifications and deeds queries are logged pursuant to Section 70 of Act 34 of 2005.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2.5">Date/Time</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Target Subject</th>
                        <th className="p-2.5">Identifier</th>
                        <th className="p-2.5">Cost</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {historyList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-500 font-mono">{item.timestamp}</td>
                          <td className="p-2.5 font-bold text-cyan-900">{item.reportType.replace(/_/g, ' ')}</td>
                          <td className="p-2.5 font-medium text-slate-900">{item.targetName}</td>
                          <td className="p-2.5 font-mono text-slate-700">{item.targetIdOrReg}</td>
                          <td className="p-2.5 text-emerald-800 font-bold font-mono">R {item.costVatExcl.toFixed(2)}</td>
                          <td className="p-2.5">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded font-bold">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>NCR Bureau Gateway Online • POPIA Compliance Certified</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
