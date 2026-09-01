import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Upload, 
  Sparkles, 
  FileText, 
  Check, 
  Camera, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Calendar, 
  Briefcase, 
  Plus, 
  Trash2, 
  Lock, 
  Shield, 
  Sliders, 
  Eye,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Globe,
  Layers,
  Chrome,
  Smartphone,
  MessageSquare,
  Database,
  FileSpreadsheet,
  Download,
  Key,
  ShieldCheck,
  SmartphoneNfc,
  Laptop,
  CreditCard,
  Coins,
  Wallet,
  Zap,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  Printer,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  Clock,
  ShieldAlert,
  KeyRound,
  Send,
  RefreshCw,
  Hash,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  Info,
  Scale,
  BookOpen,
  FileCheck,
  Copy
} from 'lucide-react';
import { uploadAvatar, removeAvatar, uploadCompanyLogo, removeCompanyLogo, changePassword, getMyProfile, getTotpStatus, setupTotp, enableTotp, disableTotp, listPasskeys, getPasskeyRegistrationOptions, verifyPasskeyRegistration, deletePasskey, PasskeySummary, getVerificationStatus, sendEmailVerification, confirmEmailVerification, sendMobileVerification, confirmMobileVerification } from '../../services/api';
import { isWebAuthnSupported, createPasskeyCredential, describeWebAuthnError } from '../../services/webauthnClient';

import { 
  GLOBAL_COUNTRIES_DATA, 
  CountryOption, 
  ProvinceStateOption, 
  CityTownOption, 
  getJurisdictionByCode 
} from '../../services/jurisdictionsData';

export interface UserProfileData {
  title: string;
  name: string;
  surname: string;
  email: string;
  idNumber: string;
  cellPhone: string;
  officePhone: string;
  ffcNumber: string;
  companyName: string;
  yearsExperience: string;
  registrationDate: string;
  numberOfAwards: string;
  propertiesSold12Mo: string;
  highestQualification: string;
  speciality: string;
  province: string;
  agentType: string;
  aboutMe: string;
  farmingAreas: string[];
  socialMedia: { platform: string; url: string }[];
  viewOnFindAnAgent: boolean;
  profilePhotoUrl: string;
  companyLogoUrl: string;
}

const INITIAL_PROFILE: UserProfileData = {
  title: 'Mr',
  name: 'Ronald',
  surname: 'Read',
  email: 'ron@lawrealestate.co.za',
  idNumber: '8303305103087',
  cellPhone: '0828903863',
  officePhone: '021 439 7777',
  ffcNumber: '20241098234',
  companyName: 'LAW Real Estate / PTAH Realty',
  yearsExperience: '15+ Years',
  registrationDate: '2018-05-15',
  numberOfAwards: '4 - 8 Awards',
  propertiesSold12Mo: '16 - 30 Properties',
  highestQualification: 'Master Practitioner in Real Estate (MPRE / NQF 5)',
  speciality: 'Atlantic Seaboard Luxury & Sectional Schemes',
  province: 'Western Cape',
  agentType: 'Principal Property Practitioner (PPRA)',
  aboutMe: 'With over 18 years of specialized experience along Cape Town’s premier Atlantic Seaboard, Ronald Read provides unparalleled market intelligence, precision cadastral valuation, and discreet representation for bespoke residential and sectional title investments.',
  farmingAreas: ['Three Anchor Bay', 'Green Point', 'Sea Point', 'Camps Bay', 'Bantry Bay', 'Clifton'],
  socialMedia: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/ronald-read-ptah' },
    { platform: 'Instagram', url: 'https://instagram.com/ronaldread_realty' }
  ],
  viewOnFindAnAgent: true,
  profilePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  companyLogoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'
};

const SUBURB_OPTIONS = [
  'Three Anchor Bay',
  'Green Point',
  'Sea Point',
  'Fresnaye',
  'Bantry Bay',
  'Clifton',
  'Camps Bay',
  'Mouille Point',
  'V&A Waterfront',
  'Cape Town CBD',
  'Oranjezicht',
  'Tamboerskloof',
  'Higgovale',
  'Rondebosch',
  'Newlands',
  'Constantia'
];

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  flag: string;
  default?: boolean;
}

export const LANGUAGES_DATA: LanguageOption[] = [
  { code: 'en-ZA', name: 'English (South Africa)', native: 'English', flag: '🇿🇦', default: true },
  { code: 'af-ZA', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', default: false },
  { code: 'xh-ZA', name: 'isiXhosa', native: 'isiXhosa', flag: '🇿🇦', default: false },
  { code: 'zu-ZA', name: 'isiZulu', native: 'isiZulu', flag: '🇿🇦', default: false },
  { code: 'st-ZA', name: 'Sesotho', native: 'Sesotho', flag: '🇿🇦', default: false },
  { code: 'en-GB', name: 'English (United Kingdom)', native: 'English (UK)', flag: '🇬🇧', default: false },
  { code: 'en-US', name: 'English (United States)', native: 'English (US)', flag: '🇺🇸', default: false },
  { code: 'en-AU', name: 'English (Australia)', native: 'English (AU)', flag: '🇦🇺', default: false },
  { code: 'ar-AE', name: 'Arabic (United Arab Emirates)', native: 'العربية', flag: '🇦🇪', default: false },
  { code: 'de-DE', name: 'German', native: 'Deutsch', flag: '🇩🇪', default: false },
  { code: 'fr-FR', name: 'French', native: 'Français', flag: '🇫🇷', default: false }
];

export type SettingsTabType = 'profile' | 'password' | 'billing' | 'apps' | 'preferences';

export interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTabType;
  dataCredits?: number;
  ficaCredits?: number;
  trustCredits?: number;
  prepaidBalance?: number;
  onTopUpSuccess?: (dataCredits: number, ficaCredits: number, trustCredits: number, prepaidBalance?: number) => void;
  currentCountryId?: string;
  currentProvinceId?: string;
  currentCityId?: string;
  onJurisdictionChange?: (countryId: string, provinceId: string, cityId: string) => void;
  theme?: string;
  onThemeChange?: (theme: string) => void;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: number;
  vatAmount: number;
  netAmount: number;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  paymentMethod: string;
  items: { description: string; qty: number; unitPrice: number; total: number }[];
}

const SAMPLE_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-08-0194',
    date: '2026/08/01',
    description: 'Principal Practitioner Pro Monthly Subscription',
    amount: 1850.00,
    vatAmount: 241.30,
    netAmount: 1608.70,
    status: 'PAID',
    paymentMethod: 'Visa •••• 4242',
    items: [
      { description: 'Principal Practitioner Pro Monthly (Includes 250 Data Credits & Unlimited CMA)', qty: 1, unitPrice: 1608.70, total: 1608.70 }
    ]
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-07-0482',
    date: '2026/07/15',
    description: '200 x FICA & Bureau Trace Pack Top-Up',
    amount: 1490.00,
    vatAmount: 194.35,
    netAmount: 1295.65,
    status: 'PAID',
    paymentMethod: 'Visa •••• 4242',
    items: [
      { description: '200 x FICA & Bureau Trace Pack (Home Affairs + Sanctions)', qty: 1, unitPrice: 1295.65, total: 1295.65 }
    ]
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-07-0012',
    date: '2026/07/01',
    description: 'Principal Practitioner Pro Monthly Subscription',
    amount: 1850.00,
    vatAmount: 241.30,
    netAmount: 1608.70,
    status: 'PAID',
    paymentMethod: 'Visa •••• 4242',
    items: [
      { description: 'Principal Practitioner Pro Monthly (Includes 250 Data Credits & Unlimited CMA)', qty: 1, unitPrice: 1608.70, total: 1608.70 }
    ]
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-06-0331',
    date: '2026/06/18',
    description: '500 x Cadastre & Data Search Credits Pack',
    amount: 1250.00,
    vatAmount: 163.04,
    netAmount: 1086.96,
    status: 'PAID',
    paymentMethod: 'Mastercard •••• 8831',
    items: [
      { description: '500 x Cadastre & Data Search Top-Up Pack', qty: 1, unitPrice: 1086.96, total: 1086.96 }
    ]
  }
];

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  dataCredits = 250,
  ficaCredits = 0,
  trustCredits = 15,
  prepaidBalance = 1250,
  onTopUpSuccess,
  currentCountryId = 'ZA',
  currentProvinceId = 'WC',
  currentCityId = 'CPT',
  onJurisdictionChange,
  theme = 'emerald',
  onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Jurisdiction cascading dropdown state
  const [selectedCountryId, setSelectedCountryId] = useState<string>(currentCountryId);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(currentProvinceId);
  const [selectedCityId, setSelectedCityId] = useState<string>(currentCityId);
  const [jurisdictionAppliedToast, setJurisdictionAppliedToast] = useState(false);

  React.useEffect(() => {
    if (currentCountryId) setSelectedCountryId(currentCountryId);
    if (currentProvinceId) setSelectedProvinceId(currentProvinceId);
    if (currentCityId) setSelectedCityId(currentCityId);
  }, [currentCountryId, currentProvinceId, currentCityId]);

  const activeCountry = GLOBAL_COUNTRIES_DATA.find(c => c.id === selectedCountryId) || GLOBAL_COUNTRIES_DATA[0];
  const availableProvinces = activeCountry.provinces;
  const activeProvince = availableProvinces.find(p => p.id === selectedProvinceId) || availableProvinces[0];
  const availableCities = activeProvince.cities;
  const activeCity = availableCities.find(c => c.id === selectedCityId) || availableCities[0];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCId = e.target.value;
    const targetC = GLOBAL_COUNTRIES_DATA.find(c => c.id === newCId) || GLOBAL_COUNTRIES_DATA[0];
    const defP = targetC.provinces[0];
    const defCity = defP.cities[0];
    setSelectedCountryId(targetC.id);
    setSelectedProvinceId(defP.id);
    setSelectedCityId(defCity.id);
    setDateFormat(targetC.defaultDateFormat);
    setMeasurementUnit(targetC.defaultUnit);
    setDefaultCadastreSuburb(defCity.suburbs[0] || '');
    setJurisdictionAppliedToast(false);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPId = e.target.value;
    const targetP = availableProvinces.find(p => p.id === newPId) || availableProvinces[0];
    const defCity = targetP.cities[0];
    setSelectedProvinceId(targetP.id);
    setSelectedCityId(defCity.id);
    setDefaultCadastreSuburb(defCity.suburbs[0] || '');
    setJurisdictionAppliedToast(false);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCityId = e.target.value;
    setSelectedCityId(newCityId);
    const targetCity = availableCities.find(c => c.id === newCityId);
    if (targetCity && targetCity.suburbs.length > 0) {
      setDefaultCadastreSuburb(targetCity.suburbs[0]);
    }
    setJurisdictionAppliedToast(false);
  };

  const handleApplyJurisdiction = () => {
    if (onJurisdictionChange) {
      onJurisdictionChange(selectedCountryId, selectedProvinceId, selectedCityId);
    }
    setJurisdictionAppliedToast(true);
    setTimeout(() => {
      setJurisdictionAppliedToast(false);
    }, 4500);
  };

  const [profile, setProfile] = useState<UserProfileData>(INITIAL_PROFILE);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [newFarmingArea, setNewFarmingArea] = useState('');
  const [customFarmingInput, setCustomFarmingInput] = useState('');

  // Real avatar/logo upload (api/user_profile.py) -- profile.profilePhotoUrl
  // and profile.companyLogoUrl above start as demo placeholders; this loads
  // whatever the account actually has saved (if anything) over them on
  // mount, and the two upload handlers below keep both in sync going
  // forward. Kept as plain profile.* fields (not a separate piece of
  // state) so every existing render/PDF/brochure use of profilePhotoUrl/
  // companyLogoUrl elsewhere in this file picks up the real image for
  // free once it's loaded.
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getMyProfile()
      .then((real) => {
        setProfile((prev) => ({
          ...prev,
          ...(real.avatarUrl ? { profilePhotoUrl: real.avatarUrl } : {}),
          ...(real.companyLogoUrl ? { companyLogoUrl: real.companyLogoUrl } : {}),
        }));
      })
      .catch(() => {
        // Not fatal -- just means this account has nothing saved yet
        // (or the backend is briefly unreachable); the demo placeholders
        // stay put either way.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file next time
    if (!file) return;
    setImageUploadError(null);
    setIsUploadingAvatar(true);
    try {
      const { avatarUrl } = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, profilePhotoUrl: avatarUrl }));
    } catch (err: any) {
      setImageUploadError(err?.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageUploadError(null);
    setIsUploadingLogo(true);
    try {
      const { companyLogoUrl } = await uploadCompanyLogo(file);
      setProfile((prev) => ({ ...prev, companyLogoUrl }));
    } catch (err: any) {
      setImageUploadError(err?.message || 'Failed to upload logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Territory-matched practitioner designation & statutory regulatory
  // dossier state -- see the "Regulatory FFC / License Number" tooltip
  // and "Full Regulatory Dossier" modal further down.
  const [showRegulatoryTooltip, setShowRegulatoryTooltip] = useState(false);
  const [isRegulatoryTooltipPinned, setIsRegulatoryTooltipPinned] = useState(false);
  const [showFullRegulatoryModal, setShowFullRegulatoryModal] = useState(false);
  const [copiedLicenseExample, setCopiedLicenseExample] = useState(false);

  const [newSocialPlatform, setNewSocialPlatform] = useState('LinkedIn');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [showAddSocial, setShowAddSocial] = useState(false);

  // Residency & Mobile OTP Verification state -- real backend
  // (api/user_verification.py), loaded on open alongside 2FA status below.
  const [isPhoneOtpVerified, setIsPhoneOtpVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessToast, setOtpSuccessToast] = useState<string | null>(null);

  const handleSendOtp = async () => {
    const fullNumber = `+${activeCountry.phoneDialCode}${(profile.cellPhone || '').replace(/\D/g, '')}`;
    setIsOtpSending(true);
    setOtpError(null);
    try {
      await sendMobileVerification(fullNumber);
      setShowOtpModal(true);
      setOtpCountdown(60);
      setOtpCode('');
    } catch (err: any) {
      setOtpError(err?.message || 'Failed to send verification SMS.');
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError('Please enter a valid verification code.');
      return;
    }
    setOtpError(null);
    try {
      await confirmMobileVerification(otpCode);
      setIsPhoneOtpVerified(true);
      setShowOtpModal(false);
      setOtpSuccessToast(`Mobile number verified for ${activeCountry.name} residency.`);
      setTimeout(() => setOtpSuccessToast(null), 4000);
    } catch (err: any) {
      setOtpError(err?.message || 'Incorrect or expired code.');
    }
  };

  // Real email verification
  const [isEmailVerifySending, setIsEmailVerifySending] = useState(false);
  const [showEmailVerifyPrompt, setShowEmailVerifyPrompt] = useState(false);
  const [emailVerifyCode, setEmailVerifyCode] = useState('');
  const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null);

  const handleSendEmailVerification = async () => {
    setIsEmailVerifySending(true);
    setEmailVerifyError(null);
    try {
      const res = await sendEmailVerification();
      if (res.alreadyVerified) {
        setIsEmailVerified(true);
      } else {
        setShowEmailVerifyPrompt(true);
        setEmailVerifyCode('');
      }
    } catch (err: any) {
      setEmailVerifyError(err?.message || 'Failed to send verification email.');
    } finally {
      setIsEmailVerifySending(false);
    }
  };

  const handleConfirmEmailVerification = async () => {
    setEmailVerifyError(null);
    try {
      await confirmEmailVerification(emailVerifyCode.trim());
      setIsEmailVerified(true);
      setShowEmailVerifyPrompt(false);
      setOtpSuccessToast('Email address verified.');
      setTimeout(() => setOtpSuccessToast(null), 4000);
    } catch (err: any) {
      setEmailVerifyError(err?.message || 'Incorrect or expired code.');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    getVerificationStatus()
      .then((r) => {
        setIsPhoneOtpVerified(r.phoneVerified);
        setIsEmailVerified(r.emailVerified);
      })
      .catch(() => {});
  }, [isOpen]);


  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Real 2FA (api/user_security.py): TOTP authenticator app + WebAuthn
  // passkeys. Loaded from the backend on open, see the effect below.
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpSetupData, setTotpSetupData] = useState<{ secret: string; otpauthUri: string; qrCodeDataUri: string } | null>(null);
  const [totpConfirmCode, setTotpConfirmCode] = useState('');
  const [totpError, setTotpError] = useState<string | null>(null);
  const [isTotpBusy, setIsTotpBusy] = useState(false);
  const [showDisableTotpPrompt, setShowDisableTotpPrompt] = useState(false);
  const [disableTotpPassword, setDisableTotpPassword] = useState('');

  const [passkeys, setPasskeys] = useState<PasskeySummary[]>([]);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getTotpStatus().then((r) => setTotpEnabled(r.enabled)).catch(() => {});
    listPasskeys().then((r) => setPasskeys(r.passkeys)).catch(() => {});
  }, [isOpen]);

  const handleStartTotpSetup = async () => {
    setTotpError(null);
    setIsTotpBusy(true);
    try {
      const data = await setupTotp();
      setTotpSetupData(data);
    } catch (err: any) {
      setTotpError(err?.message || 'Failed to start authenticator setup.');
    } finally {
      setIsTotpBusy(false);
    }
  };

  const handleConfirmTotpSetup = async () => {
    setTotpError(null);
    setIsTotpBusy(true);
    try {
      await enableTotp(totpConfirmCode.trim());
      setTotpEnabled(true);
      setTotpSetupData(null);
      setTotpConfirmCode('');
    } catch (err: any) {
      setTotpError(err?.message || 'Failed to confirm authenticator code.');
    } finally {
      setIsTotpBusy(false);
    }
  };

  const handleDisableTotp = async () => {
    setTotpError(null);
    setIsTotpBusy(true);
    try {
      await disableTotp(disableTotpPassword);
      setTotpEnabled(false);
      setShowDisableTotpPrompt(false);
      setDisableTotpPassword('');
    } catch (err: any) {
      setTotpError(err?.message || 'Failed to disable authenticator.');
    } finally {
      setIsTotpBusy(false);
    }
  };

  const handleAddPasskey = async () => {
    setPasskeyError(null);
    if (!isWebAuthnSupported()) {
      setPasskeyError('Passkeys are not supported in this browser.');
      return;
    }
    setIsRegisteringPasskey(true);
    try {
      const { options, challengeToken } = await getPasskeyRegistrationOptions();
      const credential = await createPasskeyCredential(options);
      const nickname = `${navigator.platform || 'Device'} passkey`;
      await verifyPasskeyRegistration(credential, challengeToken, nickname);
      const refreshed = await listPasskeys();
      setPasskeys(refreshed.passkeys);
    } catch (err: any) {
      setPasskeyError(describeWebAuthnError(err));
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleRemovePasskey = async (id: string) => {
    setPasskeyError(null);
    try {
      await deletePasskey(id);
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setPasskeyError(err?.message || 'Failed to remove passkey.');
    }
  };

  // Billing & Credits State
  const [billingSubTab, setBillingSubTab] = useState<'credits' | 'plans' | 'payment' | 'invoices' | 'tax'>('credits');
  const [selectedPack, setSelectedPack] = useState<string>('fica_50');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
  const [billingToast, setBillingToast] = useState<string | null>(null);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<InvoiceRecord | null>(null);
  const [selectedPlanTier, setSelectedPlanTier] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(true);
  const [autoRechargeThreshold, setAutoRechargeThreshold] = useState('20');
  const [autoRechargeAmount, setAutoRechargeAmount] = useState('500');

  // New Payment Method Form State
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [paymentMethodsList, setPaymentMethodsList] = useState([
    { id: 'pm-1', type: 'Visa', last4: '4242', exp: '09/28', isDefault: true, holder: 'Ronald Read' },
    { id: 'pm-2', type: 'Mastercard', last4: '8831', exp: '11/27', isDefault: false, holder: 'LAW Real Estate' }
  ]);

  // Company Tax info state
  const [taxVatNumber, setTaxVatNumber] = useState('4920194821');
  const [taxCompanyName, setTaxCompanyName] = useState('LAW Real Estate (Pty) Ltd t/a PTAH Realty');
  const [taxBillingEmail, setTaxBillingEmail] = useState('accounts@lawrealestate.co.za');
  const [taxAddress, setTaxAddress] = useState('Suite 402, The Equinox, 154 Main Road, Sea Point, Cape Town, 8005');
  const [taxSaved, setTaxSaved] = useState(false);

  // Language state (under Profile)
  const [selectedLanguage, setSelectedLanguage] = useState('en-ZA');
  const [isProfileLanguageOpen, setIsProfileLanguageOpen] = useState(false);
  const [languageSaved, setLanguageSaved] = useState(false);

  // Preferences state (Informed by Country & Area)
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('ptah_date_format') || activeCountry.defaultDateFormat || 'YYYY/MM/DD');
  const [measurementUnit, setMeasurementUnit] = useState(activeCountry.defaultUnit || 'Metric (m² & Hectares)');
  const [defaultCadastreSuburb, setDefaultCadastreSuburb] = useState('Three Anchor Bay');
  const [complianceAlertsEnabled, setComplianceAlertsEnabled] = useState(true);
  const [satelliteByDefault, setSatelliteByDefault] = useState(true);
  const [autoValuationArchiving, setAutoValuationArchiving] = useState(true);
  const [livePortalWebhooks, setLivePortalWebhooks] = useState(true);
  const [preferencesSavedToast, setPreferencesSavedToast] = useState<string | null>(null);

  // Apps & Extensions state
  const [installedApps, setInstalledApps] = useState<string[]>(['chrome-ext', 'deeds-api', 'whatsapp-crm']);
  const [appToast, setAppToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalCredits = dataCredits + ficaCredits + trustCredits;

  // Calculate profile completeness
  const calculateCompleteness = () => {
    let score = 0;
    const totalFields = 16;
    if (profile.title) score++;
    if (profile.name) score++;
    if (profile.surname) score++;
    if (profile.email) score++;
    if (profile.idNumber) score++;
    if (profile.cellPhone) score++;
    if (isPhoneOtpVerified) score++;
    if (profile.ffcNumber) score++;
    if (profile.companyName) score++;
    if (profile.yearsExperience) score++;
    if (profile.speciality) score++;
    if (profile.province) score++;
    if (profile.aboutMe && profile.aboutMe.length > 20) score++;
    if (profile.farmingAreas.length > 0) score++;
    if (profile.profilePhotoUrl) score++;
    if (profile.companyLogoUrl) score++;
    return Math.min(100, Math.round((score / totalFields) * 100));
  };

  const completeness = calculateCompleteness();

  const handleOpenOtpModal = () => {
    setOtpCode('');
    setOtpError(null);
    setOtpCountdown(60);
    setShowOtpModal(true);
  };

  const handleConfirmOtp = () => {
    if (!otpCode || otpCode.trim().length < 4) {
      setOtpError('Please enter a valid 6-digit SMS verification OTP code.');
      return;
    }
    setIsPhoneOtpVerified(true);
    setShowOtpModal(false);
    setOtpSuccessToast(`Mobile verification successful (+${activeCountry.phoneDialCode} ${profile.cellPhone}). Verified in ${activeCountry.name}!`);
    setTimeout(() => setOtpSuccessToast(null), 4000);
  };

  const handleAutoPopulateCitySuburbs = () => {
    if (activeCity && activeCity.suburbs.length > 0) {
      setProfile(prev => ({
        ...prev,
        farmingAreas: Array.from(new Set([...prev.farmingAreas, ...activeCity.suburbs]))
      }));
    }
  };

  const handleSavePreferences = () => {
    // Persisted to localStorage (not just this modal's local state) so
    // other embedded surfaces in the same page -- the CRM tab, mounted
    // separately -- can read the same date-format preference. The custom
    // event lets it update live if the CRM is already open when this is
    // saved, without needing a full reload.
    localStorage.setItem('ptah_date_format', dateFormat);
    window.dispatchEvent(new CustomEvent('ptah-date-format-changed', { detail: dateFormat }));
    setPreferencesSavedToast('System & regional formatting preferences saved successfully!');
    setTimeout(() => setPreferencesSavedToast(null), 3000);
  };

  const handleGenerateAiBio = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const generated = `Recognized as a leading authority in Atlantic Seaboard property acquisitions, ${profile.title} ${profile.name} ${profile.surname} brings over ${profile.yearsExperience.toLowerCase()} of verifiable deal-making acumen to ${profile.companyName}. Specializing in ${profile.speciality} across ${profile.farmingAreas.slice(0, 3).join(', ')}, ${profile.surname} utilizes rigorous cadastral intelligence, Deeds Office analysis, and an extensive private investor network to deliver record-breaking sale outcomes for discerning property owners.`;
      setProfile(prev => ({ ...prev, aboutMe: generated }));
      setIsAiGenerating(false);
    }, 900);
  };

  const handleAddFarmingArea = (suburb: string) => {
    if (suburb && !profile.farmingAreas.includes(suburb)) {
      setProfile(prev => ({
        ...prev,
        farmingAreas: [...prev.farmingAreas, suburb]
      }));
    }
  };

  const handleRemoveFarmingArea = (suburb: string) => {
    setProfile(prev => ({
      ...prev,
      farmingAreas: prev.farmingAreas.filter(s => s !== suburb)
    }));
  };

  const handleAddSocial = () => {
    if (newSocialUrl.trim()) {
      setProfile(prev => ({
        ...prev,
        socialMedia: [...prev.socialMedia, { platform: newSocialPlatform, url: newSocialUrl.trim() }]
      }));
      setNewSocialUrl('');
      setShowAddSocial(false);
    }
  };

  const handleRemoveSocial = (index: number) => {
    setProfile(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 4000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
    setLanguageSaved(true);
    setTimeout(() => setLanguageSaved(false), 2000);
  };

  const handleToggleApp = (appId: string, title: string) => {
    if (installedApps.includes(appId)) {
      setInstalledApps(prev => prev.filter(id => id !== appId));
      showAppToast(`Disconnected ${title}`);
    } else {
      setInstalledApps(prev => [...prev, appId]);
      showAppToast(`Successfully activated & linked ${title}!`);
    }
  };

  const showAppToast = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 3000);
  };

  const handlePurchaseCreditPack = (packId: string) => {
    setIsProcessingTopUp(true);
    setTimeout(() => {
      setIsProcessingTopUp(false);
      let addedData = 0;
      let addedFica = 0;
      let addedTrust = 0;
      let addedBalance = 0;
      let label = '';

      if (packId === 'fica_50') {
        addedFica = 50;
        label = '50 FICA Credits added (R 495.00)';
      } else if (packId === 'fica_200') {
        addedFica = 200;
        label = '200 FICA Credits added (R 1,490.00)';
      } else if (packId === 'data_250') {
        addedData = 250;
        label = '250 Cadastre & Deeds Data Credits added (R 750.00)';
      } else if (packId === 'data_500') {
        addedData = 500;
        label = '500 Cadastre & Deeds Data Credits added (R 1,250.00)';
      } else if (packId === 'trust_20') {
        addedTrust = 20;
        label = '20 Trust & CIPC Vetting Credits added (R 390.00)';
      } else if (packId === 'bundle_master') {
        addedData = 300;
        addedFica = 100;
        addedTrust = 30;
        label = 'Enterprise Master Bundle added (R 1,890.00)';
      }

      if (onTopUpSuccess) {
        onTopUpSuccess(dataCredits + addedData, ficaCredits + addedFica, trustCredits + addedTrust, prepaidBalance + addedBalance);
      }

      setBillingToast(`Payment processed successfully! ${label}`);
      setTimeout(() => setBillingToast(null), 4000);
    }, 850);
  };

  const handleAddNewPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardExpiry || !newCardCvv) {
      alert('Please fill in all card details.');
      return;
    }
    const last4 = newCardNumber.slice(-4) || '7890';
    const cardType = newCardNumber.startsWith('5') ? 'Mastercard' : 'Visa';
    setPaymentMethodsList(prev => [
      ...prev.map(p => ({ ...p, isDefault: false })),
      { id: `pm-${Date.now()}`, type: cardType, last4, exp: newCardExpiry, isDefault: true, holder: newCardHolder || 'Ronald Read' }
    ]);
    setShowAddPaymentModal(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvv('');
    setNewCardHolder('');
    setBillingToast('New payment method added & set as default.');
    setTimeout(() => setBillingToast(null), 3000);
  };

  const handleSaveTaxInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setTaxSaved(true);
    setTimeout(() => setTaxSaved(false), 2500);
  };

  const APPS_LIST = [
    {
      id: 'chrome-ext',
      title: 'Virtual Agent Chrome Extension',
      category: 'Browser Extension',
      icon: Chrome,
      color: 'bg-blue-500 text-white',
      badge: 'POPULAR',
      description: 'Overlay real-time Cadastral ERF boundaries, transfer histories, and CMA valuations directly onto Property24 & Private Property while browsing.',
      version: 'v3.4.1',
      rating: '4.9 ★ (1,240 realtors)'
    },
    {
      id: 'whatsapp-crm',
      title: 'WhatsApp FICA & Lead Assistant',
      category: 'CRM & Messaging',
      icon: MessageSquare,
      color: 'bg-emerald-500 text-white',
      badge: 'FICA VERIFIED',
      description: 'Automate POPIA consent disclaimers, dispatch 1-page CMA snapshots, and request verified ID copy uploads directly from clients via WhatsApp.',
      version: 'v2.1.0',
      rating: '4.8 ★ (890 realtors)'
    },
    {
      id: 'mobile-app',
      title: 'Ptah Mobile Field Companion (iOS & Android)',
      category: 'Mobile App',
      icon: Smartphone,
      color: 'bg-indigo-600 text-white',
      badge: 'CADASTRE GPS',
      description: 'Find property boundary beacons in the field using GPS accuracy, capture high-res site photos, and look up Deeds transfers on your phone.',
      version: 'v4.0.2',
      rating: '4.9 ★ (2,100 realtors)'
    },
    {
      id: 'deeds-api',
      title: 'National Deeds Office Live API Stream',
      category: 'Data Integration',
      icon: Database,
      color: 'bg-cyan-600 text-white',
      badge: 'LIVE SYNC',
      description: 'Direct high-speed gateway to Pretoria, Cape Town, and Pietermaritzburg Deeds registries for instant title deed extraction and bond tracking.',
      version: 'v1.9.0',
      rating: '5.0 ★ Enterprise'
    },
    {
      id: 'excel-addin',
      title: 'Excel & Google Sheets CMA Sync Add-In',
      category: 'Analytics & Reporting',
      icon: FileSpreadsheet,
      color: 'bg-teal-600 text-white',
      badge: 'PRODUCTIVITY',
      description: 'Export structured comparative market analyses, suburb sales trends, and municipal valuation roll data straight into Excel spreadsheets.',
      version: 'v2.0.4',
      rating: '4.7 ★ (620 realtors)'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div 
        id="user-settings-modal"
        className="bg-white text-slate-800 w-full max-w-5xl rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="bg-[#006980] px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-700/80 flex items-center justify-center text-cyan-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>SETTINGS & ACCOUNT PREFERENCES</span>
                <span className="bg-cyan-500/20 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-400/30">
                  PPRA PRACTITIONER
                </span>
              </h1>
              <span className="text-[10px] text-cyan-100/90 block">
                Manage your agent profile, security credentials, billing & credits, localization, and application extensions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 text-cyan-100 hover:text-white hover:bg-cyan-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Header: 5 Core Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between text-xs overflow-x-auto">
          <div className="flex items-center gap-1 shrink-0">
            <button
              id="tab-settings-profile"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-[#00bcd4]" />
              <span>PROFILE</span>
              <span className="text-xs">{activeCountry.flag}</span>
            </button>

            <button
              id="tab-settings-password"
              onClick={() => setActiveTab('password')}
              className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-600" />
              <span>CHANGE PASSWORD</span>
            </button>

            <button
              id="tab-settings-billing"
              onClick={() => setActiveTab('billing')}
              className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'billing'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>BILLING & CREDITS</span>
              <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                {totalCredits}
              </span>
            </button>

            <button
              id="tab-settings-apps"
              onClick={() => setActiveTab('apps')}
              className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'apps'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>APPS & EXTENSIONS</span>
            </button>

            <button
              id="tab-settings-preferences"
              onClick={() => setActiveTab('preferences')}
              className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-[#00bcd4] text-[#006980] bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-700" />
              <span>PREFERENCES</span>
            </button>
          </div>

        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
          
          {/* ============================================================ */}
          {/* 1. PROFILE TAB (Includes Country & Area, Language, Identity & Farming) */}
          {/* ============================================================ */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Completeness + Agent Card (moved out of the shared tab
                  strip above -- it only rendered on this one tab, which made
                  that strip overflow/clip on narrower widths while the other
                  4 tabs stayed clean; belongs here as this tab's own content) */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Profile Completeness</span>
                  <div className="w-36 h-5 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className="h-full bg-cyan-600 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ width: `${completeness}%` }}
                    >
                      {completeness}% Complete
                    </div>
                  </div>
                </div>

                <button
                  id="btn-generate-brochure"
                  onClick={() => setShowBrochureModal(true)}
                  className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 shadow-xs transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Agent Card</span>
                </button>
              </div>

              {/* Toast Notifications */}
              {jurisdictionAppliedToast && (
                <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-lg flex items-center justify-between gap-3 text-emerald-900 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">
                        Jurisdiction synchronized to {activeCity.name}, {activeProvince.name} ({activeCountry.name} {activeCountry.flag})!
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Map cadastre basemap, deeds registry ({activeCountry.landRegistryAuthority}), property listings, and legal title formats ({activeCountry.legalIdentifierName}) are now active.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-200/60 px-2 py-1 rounded text-emerald-900 shrink-0">
                    GPS: {activeCity.coordinates.lat.toFixed(4)}, {activeCity.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              )}

              {otpSuccessToast && (
                <div className="bg-emerald-50 border-2 border-emerald-500 p-3.5 rounded-lg flex items-center gap-2.5 text-emerald-900 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{otpSuccessToast}</span>
                </div>
              )}

              {/* Agent Photos & Branding Banner */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarFileSelected}
                />
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleLogoFileSelected}
                />

                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img 
                      src={profile.profilePhotoUrl} 
                      alt="Ronald Read" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500 shadow-sm"
                    />
                    <button 
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 cursor-pointer"
                      title="Upload a new profile photo"
                    >
                      {isUploadingAvatar ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <span>{profile.title} {profile.name} {profile.surname}</span>
                      <span className="text-base">{activeCountry.flag}</span>
                      {isPhoneOtpVerified ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Resident</span>
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Unverified Mobile</span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-cyan-700 font-semibold">{profile.agentType}</p>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {activeCountry.ffcLicenseName}: {profile.ffcNumber} • {profile.companyName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">Agency Branding Logo</span>
                    <span className="text-[10px] text-slate-400">Appears on all CMA & Valuation Reports</span>
                  </div>
                  <div className="relative group shrink-0">
                    <img 
                      src={profile.companyLogoUrl} 
                      alt="Company Logo" 
                      className="w-12 h-12 rounded object-cover border border-slate-200 p-0.5 bg-white shadow-xs"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="absolute inset-0 bg-black/40 rounded flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 cursor-pointer"
                      title="Upload a new agency logo"
                    >
                      {isUploadingLogo ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {imageUploadError && (
                <div className="bg-rose-50 border-2 border-rose-400 p-3 rounded-lg flex items-center gap-2.5 text-rose-900 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{imageUploadError}</span>
                  <button onClick={() => setImageUploadError(null)} className="ml-auto text-rose-500 hover:text-rose-700 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}


              {/* ============================================================ */}
              {/* SECTION 1: IDENTITY & RESIDENCY (Right above Country & Area / Bio) */}
              {/* ============================================================ */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Identity, Residency & Regulatory Credentials</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Compliant with {activeCountry.regulatoryBody}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  {/* Title */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Title</label>
                    <select 
                      value={profile.title} 
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-semibold shadow-2xs"
                    >
                      <option>Mr</option>
                      <option>Mrs</option>
                      <option>Ms</option>
                      <option>Dr</option>
                      <option>Adv</option>
                    </select>
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">First Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-semibold shadow-2xs"
                    />
                  </div>

                  {/* Surname */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Surname</label>
                    <input 
                      type="text" 
                      value={profile.surname} 
                      onChange={(e) => setProfile({ ...profile, surname: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-semibold shadow-2xs"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-semibold shadow-2xs"
                    />
                  </div>

                  {/* Mobile Cellphone with Country Dialing Code & OTP Verification */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-600 font-semibold flex items-center gap-1">
                        <span>Mobile Phone</span>
                        <span className="text-[10px] text-slate-400 font-normal">({activeCountry.name})</span>
                      </label>
                      {isPhoneOtpVerified ? (
                        <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenOtpModal}
                          className="text-amber-700 hover:text-amber-800 font-bold text-[10px] underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Smartphone className="w-3 h-3" /> Verify via OTP
                        </button>
                      )}
                    </div>
                    
                    <div className="flex rounded shadow-2xs">
                      <span className="inline-flex items-center px-2.5 rounded-l border border-r-0 border-slate-300 bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                        +{activeCountry.phoneDialCode}
                      </span>
                      <input 
                        type="text" 
                        value={profile.cellPhone} 
                        onChange={(e) => {
                          setProfile({ ...profile, cellPhone: e.target.value });
                        }}
                        placeholder={activeCountry.phonePlaceholder}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r text-slate-800 font-mono font-semibold"
                      />
                    </div>
                  </div>

                  {/* ID / Passport Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-600 font-semibold text-xs">ID / Passport Number</label>
                      <span className="text-[10px] text-slate-400 font-mono">{activeCountry.idFormatHint}</span>
                    </div>
                    <input 
                      type="text" 
                      value={profile.idNumber} 
                      onChange={(e) => setProfile({ ...profile, idNumber: e.target.value })}
                      placeholder={activeCountry.idNumberPlaceholder}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-mono font-semibold shadow-2xs text-xs"
                    />
                  </div>

                  {/* Regulatory FFC / License Number with Dynamic Tooltip */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <label className="text-slate-700 font-semibold truncate text-xs">
                          {activeCountry.ffcLicenseName}
                        </label>
                        <button
                          type="button"
                          id="btn-toggle-regulatory-tooltip"
                          onMouseEnter={() => setShowRegulatoryTooltip(true)}
                          onMouseLeave={() => {
                            if (!isRegulatoryTooltipPinned) setShowRegulatoryTooltip(false);
                          }}
                          onClick={() => {
                            setIsRegulatoryTooltipPinned(!isRegulatoryTooltipPinned);
                            setShowRegulatoryTooltip(!showRegulatoryTooltip);
                          }}
                          className={`p-0.5 rounded text-xs transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                            showRegulatoryTooltip || isRegulatoryTooltipPinned
                              ? 'bg-cyan-600 text-white shadow-xs ring-2 ring-cyan-300'
                              : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200'
                          }`}
                          title={`View statutory regulatory requirements for ${activeCountry.name} (${activeCountry.regulatoryBody})`}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                        {activeCountry.code}
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={profile.ffcNumber} 
                      onChange={(e) => setProfile({ ...profile, ffcNumber: e.target.value })}
                      placeholder={activeCountry.ffcLicensePlaceholder}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-mono font-semibold shadow-2xs text-xs"
                    />

                    {/* Dynamic Regulatory Requirements Popover Tooltip */}
                    {(showRegulatoryTooltip || isRegulatoryTooltipPinned) && (
                      <div 
                        id="popover-regulatory-tooltip"
                        className="absolute z-50 top-full mt-1.5 right-0 sm:left-0 w-[calc(100vw-3rem)] sm:w-[440px] max-w-[460px] bg-white border-2 border-cyan-500/80 rounded-xl shadow-2xl p-4 text-xs space-y-3 animate-fade-in text-slate-700 backdrop-blur-xs"
                        onMouseEnter={() => setShowRegulatoryTooltip(true)}
                        onMouseLeave={() => {
                          if (!isRegulatoryTooltipPinned) setShowRegulatoryTooltip(false);
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl leading-none">{activeCountry.flag}</span>
                            <div>
                              <div className="font-extrabold text-slate-900 leading-tight">
                                {activeCountry.regulatoryBody}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                Official Statutory Authority • {activeCountry.name} ({activeCountry.code})
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isRegulatoryTooltipPinned && (
                              <span className="text-[9px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded">
                                PINNED
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIsRegulatoryTooltipPinned(false);
                                setShowRegulatoryTooltip(false);
                              }}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Governing Statutory Law */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Statutory Governance & Act</span>
                          </div>
                          <div className="font-bold text-slate-800 text-[11px] leading-tight">
                            {activeCountry.statutoryAct}
                          </div>
                        </div>

                        {/* Requirements Breakdown */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Authority Licensing Requirements</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed max-h-28 overflow-y-auto pr-1">
                            {activeCountry.regulatoryRequirements}
                          </p>
                        </div>

                        {/* Format Specification */}
                        <div className="bg-cyan-50/70 border border-cyan-200 rounded-lg p-2.5 space-y-1.5">
                          <div className="text-[10px] font-bold text-cyan-950 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <FileCheck className="w-3.5 h-3.5 text-cyan-700" />
                              <span>ID & License Format Pattern</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const sample = activeCountry.ffcLicensePlaceholder.split(' / ')[0].trim();
                                setProfile({ ...profile, ffcNumber: sample });
                                setCopiedLicenseExample(true);
                                setTimeout(() => setCopiedLicenseExample(false), 2000);
                              }}
                              className="text-[10px] text-cyan-800 hover:text-cyan-950 font-bold underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" />
                              <span>{copiedLicenseExample ? 'Applied to Form!' : 'Use Format Example'}</span>
                            </button>
                          </div>
                          <div className="text-[11px] text-cyan-950 font-medium leading-tight">
                            {activeCountry.licenseFormatDescription}
                          </div>
                          <div className="font-mono text-[10px] bg-white border border-cyan-200 px-2 py-1 rounded text-cyan-900 flex items-center justify-between shadow-2xs">
                            <span>Format Example: <strong>{activeCountry.ffcLicensePlaceholder}</strong></span>
                          </div>
                        </div>

                        {/* Mandatory Renewal & Escrow/Trust rules */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-600">
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                            <div className="font-bold text-slate-800 flex items-center gap-1 mb-0.5">
                              <Clock className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span>Renewal & CPD Cycle</span>
                            </div>
                            <div className="leading-snug text-slate-600">{activeCountry.renewalCycle}</div>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                            <div className="font-bold text-slate-800 flex items-center gap-1 mb-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>Trust & Escrow Obligation</span>
                            </div>
                            <div className="leading-snug text-slate-600">{activeCountry.trustAccountObligation}</div>
                          </div>
                        </div>

                        {/* Supervisory Compliance Authority Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="truncate max-w-[240px]">Oversight: {activeCountry.complianceAuthorityName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsRegulatoryTooltipPinned(false);
                              setShowRegulatoryTooltip(false);
                              setShowFullRegulatoryModal(true);
                            }}
                            className="text-cyan-700 hover:text-cyan-900 font-bold shrink-0 underline ml-2 cursor-pointer flex items-center gap-1"
                          >
                            <span>Inspect Full Dossier</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Practitioner Designation (Territory-Matched) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-600 font-semibold flex items-center gap-1.5 text-xs">
                        <span>Practitioner Statutory Designation</span>
                        <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-normal">
                          {activeCountry.regulatoryBody}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowFullRegulatoryModal(true)}
                        className="text-[10px] text-cyan-700 hover:text-cyan-900 underline font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3 h-3" />
                        <span>Statutory Rules</span>
                      </button>
                    </div>
                    <select
                      value={profile.agentType}
                      onChange={(e) => setProfile({ ...profile, agentType: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-medium shadow-2xs text-xs"
                    >
                      {activeCountry.agentTypeOptions && activeCountry.agentTypeOptions.map((designation) => (
                        <option key={designation} value={designation}>{designation}</option>
                      ))}
                      {/* Preserve custom or previous designation if not explicitly in the list */}
                      {activeCountry.agentTypeOptions && !activeCountry.agentTypeOptions.includes(profile.agentType) && (
                        <option value={profile.agentType}>{profile.agentType} (Current)</option>
                      )}
                    </select>
                  </div>

                  {/* Office Phone */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Office Switchboard</label>
                    <input 
                      type="text" 
                      value={profile.officePhone} 
                      onChange={(e) => setProfile({ ...profile, officePhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-semibold shadow-2xs"
                    />
                  </div>

                  {/* Company / Agency Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Company / Agency Name</label>
                    <input 
                      type="text" 
                      value={profile.companyName} 
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 font-semibold shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* SECTION 2: AGENT BIO & SPECIALTY (Followed by Bio) */}
              {/* ============================================================ */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    <span>Agent Bio & Market Specialty ({activeCity.name}, {activeCountry.name})</span>
                  </h4>

                  <button
                    onClick={handleGenerateAiBio}
                    disabled={isAiGenerating}
                    className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{isAiGenerating ? 'Generating Bio...' : 'Generate with AI'}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={profile.aboutMe}
                  onChange={(e) => setProfile({ ...profile, aboutMe: e.target.value })}
                  placeholder={`Write a concise overview of your local experience in ${activeCity.name} and ${activeCountry.name}...`}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-800 text-xs leading-relaxed focus:ring-1 focus:ring-cyan-500 shadow-2xs"
                />
              </div>

              {/* ============================================================ */}
              {/* SECTION 3: COUNTRY & AREA JURISDICTION (The Agent Country & Jurisdiction) */}
              {/* ============================================================ */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-cyan-100 flex items-center justify-center text-cyan-800">
                      <Globe className="w-4 h-4 text-cyan-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <span>Country & Area Jurisdiction</span>
                        <span className="bg-cyan-50 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-200">
                          {activeCountry.code} • {activeCity.name}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Operational country, province/state, and primary municipality informing mapping, title deeds, regulatory compliance & local territory.
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-apply-jurisdiction-profile"
                    onClick={handleApplyJurisdiction}
                    className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-xs transition-colors shrink-0 uppercase tracking-wider cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-100" />
                    <span>Sync Map Basemap & Deeds</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Dropdown 1: Country */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label htmlFor="dropdown-country-select" className="font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-mono">1</span>
                        <span>Country / Sovereign Jurisdiction</span>
                      </label>
                      <span className="text-[10px] text-cyan-800 font-mono font-bold bg-cyan-100/70 px-1.5 py-0.5 rounded">
                        {GLOBAL_COUNTRIES_DATA.length} Countries
                      </span>
                    </div>
                    <select
                      id="dropdown-country-select"
                      value={selectedCountryId}
                      onChange={handleCountryChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded font-bold text-slate-900 text-xs shadow-2xs focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {GLOBAL_COUNTRIES_DATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.flag} {c.name} ({c.currency.code} - {c.currency.symbol})
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Regulatory Body:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]">{activeCountry.regulatoryBody}</span>
                    </div>
                  </div>

                  {/* Dropdown 2: Province / State */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-mono">2</span>
                      <span>Province / State / Nation</span>
                    </label>
                    <select
                      id="dropdown-province-select"
                      value={selectedProvinceId}
                      onChange={handleProvinceChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded font-bold text-slate-900 text-xs shadow-2xs focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {availableProvinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.cities.length} Municipal Cities)
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Deeds Office Branch:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]">{activeCity.deedsOffice}</span>
                    </div>
                  </div>

                  {/* Dropdown 3: City / Town */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-mono">3</span>
                      <span>City / Town / Metro Area</span>
                    </label>
                    <select
                      id="dropdown-city-select"
                      value={selectedCityId}
                      onChange={handleCityChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded font-bold text-slate-900 text-xs shadow-2xs focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {availableCities.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.name} ({ct.properties.length} Verified Properties)
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Available Suburbs:</span>
                      <span className="font-semibold text-slate-700">{activeCity.suburbs.length} Districts</span>
                    </div>
                  </div>
                </div>

                {/* Country Specifications Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Land Authority</span>
                    <span className="font-semibold text-slate-800 truncate block">{activeCountry.landRegistryAuthority}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Title Standard</span>
                    <span className="font-semibold text-slate-800 truncate block">{activeCountry.legalIdentifierName}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Currency Standard</span>
                    <span className="font-semibold text-slate-800 block">{activeCountry.currency.name} ({activeCountry.currency.symbol})</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Portals</span>
                    <span className="font-semibold text-slate-800 truncate block">{activeCountry.majorPortals.map(p => p.name).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* SECTION 4: ASSIGNED FARMING SUBURBS & TERRITORIES (Matches Country & Area) */}
              {/* ============================================================ */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      <span>Assigned Farming Suburbs & Territories</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      Territory: <strong>{activeCity.name} ({activeProvince.name}, {activeCountry.name})</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoPopulateCitySuburbs}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Auto-Add All {activeCity.name} Suburbs</span>
                    </button>
                  </div>
                </div>

                {/* Suburb Badges */}
                <div className="flex flex-wrap gap-2">
                  {profile.farmingAreas.map((area, idx) => (
                    <span 
                      key={idx}
                      className="bg-cyan-50 text-cyan-900 border border-cyan-200 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <MapPin className="w-3 h-3 text-cyan-600" />
                      <span>{area}</span>
                      <button 
                        onClick={() => handleRemoveFarmingArea(area)}
                        className="text-cyan-700 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {profile.farmingAreas.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No suburbs assigned yet. Add from the list below.</span>
                  )}
                </div>

                {/* Add Suburb Row (Matches the selected Country & Area) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={newFarmingArea}
                      onChange={(e) => setNewFarmingArea(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-medium shadow-2xs"
                    >
                      <option value="">Select Suburb in {activeCity.name}...</option>
                      {activeCity.suburbs.filter(s => !profile.farmingAreas.includes(s)).map((suburb) => (
                        <option key={suburb} value={suburb}>{suburb}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        if (newFarmingArea) {
                          handleAddFarmingArea(newFarmingArea);
                          setNewFarmingArea('');
                        }
                      }}
                      disabled={!newFarmingArea}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Selected
                    </button>

                    <span className="text-slate-300">|</span>

                    {/* Custom suburb input */}
                    <input
                      type="text"
                      value={customFarmingInput}
                      onChange={(e) => setCustomFarmingInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customFarmingInput.trim()) {
                          e.preventDefault();
                          handleAddFarmingArea(customFarmingInput.trim());
                          setCustomFarmingInput('');
                        }
                      }}
                      placeholder={`Or type custom suburb in ${activeCity.name}...`}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 font-medium shadow-2xs min-w-[200px]"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (customFarmingInput.trim()) {
                          handleAddFarmingArea(customFarmingInput.trim());
                          setCustomFarmingInput('');
                        }
                      }}
                      disabled={!customFarmingInput.trim()}
                      className="bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Custom
                    </button>

                    {profile.farmingAreas.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, farmingAreas: [] })}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-auto px-2 py-1 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400">
                      Territory suggestions for {activeCity.name}:
                    </span>
                    {activeCity.suburbs.map((sub, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddFarmingArea(sub)}
                        disabled={profile.farmingAreas.includes(sub)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          profile.farmingAreas.includes(sub)
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white hover:bg-cyan-50 text-cyan-800 border-cyan-200 cursor-pointer font-medium'
                        }`}
                      >
                        + {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* SECTION 5: APPLICATION & REPORT LANGUAGE (Single Dropdown) */}
              {/* ============================================================ */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>Application & Report Language</span>
                  </h4>
                  {languageSaved && (
                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Language preference updated
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                  <div className="max-w-md pt-1">
                    <span className="font-semibold text-slate-800 block">Default Interface & PDF Export Language</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Applied across Valuation Certificates, CMA presentation booklets, client SMS notifications, and system dialogs.
                    </p>
                  </div>

                  {/* Compact Pop-up Language Dropdown showing Selected Language & > */}
                  <div className="min-w-[300px] w-full sm:w-auto relative">
                    {(() => {
                      const activeLang = LANGUAGES_DATA.find(l => l.code === selectedLanguage) || LANGUAGES_DATA[0];
                      return (
                        <div className="space-y-1.5">
                          <button
                            id="btn-toggle-profile-language-dropdown"
                            type="button"
                            onClick={() => setIsProfileLanguageOpen(!isProfileLanguageOpen)}
                            className={`w-full px-3.5 py-2.5 bg-white border rounded text-xs flex items-center justify-between gap-2 shadow-2xs transition-all cursor-pointer ${
                              isProfileLanguageOpen 
                                ? 'border-cyan-500 ring-2 ring-cyan-100' 
                                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/70'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-base shrink-0">{activeLang.flag}</span>
                              <div className="text-left min-w-0">
                                <div className="font-bold text-slate-900 truncate">{activeLang.name}</div>
                                <div className="text-[10px] text-slate-500 font-normal truncate">{activeLang.native}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                                {activeLang.code}
                              </span>
                              <ChevronRight 
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                  isProfileLanguageOpen ? 'rotate-90 text-cyan-600' : 'text-slate-400'
                                }`} 
                              />
                            </div>
                          </button>

                          {/* Pop-up Dropdown List */}
                          {isProfileLanguageOpen && (
                            <div className="bg-white border border-slate-200 rounded-lg p-2 max-h-60 overflow-y-auto space-y-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 z-20">
                              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                                <span>Choose Application Language</span>
                                <span className="font-mono text-cyan-700 text-[9px]">{LANGUAGES_DATA.length} Available</span>
                              </div>
                              {LANGUAGES_DATA.map((lang) => {
                                const isCurrent = selectedLanguage === lang.code;
                                return (
                                  <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => {
                                      handleSelectLanguage(lang.code);
                                      setIsProfileLanguageOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-2 rounded text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                      isCurrent
                                        ? 'bg-cyan-50 text-cyan-950 font-bold border border-cyan-300 shadow-2xs'
                                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="text-lg shrink-0">{lang.flag}</span>
                                      <div className="truncate">
                                        <div className="truncate text-xs font-semibold">{lang.name}</div>
                                        <div className="text-[10px] text-slate-400 font-normal truncate">{lang.native}</div>
                                      </div>
                                    </div>
                                    {isCurrent && <Check className="w-4 h-4 text-cyan-700 shrink-0 font-bold" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. CHANGE PASSWORD TAB */}
          {/* ============================================================ */}
          {activeTab === 'password' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Change Account Password</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ensure your account uses a strong password with at least 8 alphanumeric characters.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPasswords ? 'Hide Passwords' : 'Show Passwords'}</span>
                  </button>
                </div>

                {passwordSaved && (
                  <div className="bg-emerald-100 text-emerald-800 px-4 py-2.5 rounded text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Password updated successfully! Next login will require the new credentials.</span>
                  </div>
                )}

                {passwordError && (
                  <div className="bg-rose-50 border-2 border-rose-400 text-rose-800 px-4 py-2.5 rounded text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Current Password</label>
                    <input 
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-sm focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">New Password</label>
                    <input 
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters (mixed case + symbols)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-sm focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Confirm New Password</label>
                    <input 
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-sm focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Security checklist */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1 text-slate-600">
                    <div className="font-bold text-slate-700 mb-1">Password Requirements:</div>
                    <div className="flex items-center gap-1.5">
                      <span className={newPassword.length >= 8 ? "text-emerald-600 font-bold" : "text-slate-400"}>✓</span>
                      <span>At least 8 characters in length</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[A-Z]/.test(newPassword) ? "text-emerald-600 font-bold" : "text-slate-400"}>✓</span>
                      <span>Contains at least one uppercase letter (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[0-9]/.test(newPassword) ? "text-emerald-600 font-bold" : "text-slate-400"}>✓</span>
                      <span>Contains at least one number (0-9)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-[#00bcd4] hover:bg-[#00acc1] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-2 rounded shadow-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {isChangingPassword && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isChangingPassword ? 'Updating…' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Email Verification */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEmailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Email Address</div>
                      <div className="text-[11px] text-slate-500">{profile.email}</div>
                    </div>
                  </div>

                  {isEmailVerified ? (
                    <span className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  ) : showEmailVerifyPrompt ? null : (
                    <button
                      type="button"
                      onClick={handleSendEmailVerification}
                      disabled={isEmailVerifySending}
                      className="px-3 py-1.5 rounded text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-60 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {isEmailVerifySending && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>Send Verification Code</span>
                    </button>
                  )}
                </div>

                {emailVerifyError && (
                  <div className="bg-rose-50 border-2 border-rose-400 text-rose-800 px-3 py-2 rounded text-[11px] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailVerifyError}</span>
                  </div>
                )}

                {showEmailVerifyPrompt && (
                  <div className="border-t border-slate-100 pt-3 flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={emailVerifyCode}
                      onChange={(e) => setEmailVerifyCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-28 px-3 py-2 border border-slate-300 rounded text-sm font-mono tracking-widest text-center focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmEmailVerification}
                      disabled={emailVerifyCode.length !== 6}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded transition-colors cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowEmailVerifyPrompt(false); setEmailVerifyCode(''); setEmailVerifyError(null); }}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication -- Authenticator App (TOTP) */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totpEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Authenticator App</div>
                      <div className="text-[11px] text-slate-500">Google Authenticator, Authy, or any TOTP-compatible app</div>
                    </div>
                  </div>

                  {totpEnabled ? (
                    <button
                      type="button"
                      onClick={() => setShowDisableTotpPrompt(true)}
                      className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-600 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      Enabled — Disable
                    </button>
                  ) : totpSetupData ? null : (
                    <button
                      type="button"
                      onClick={handleStartTotpSetup}
                      disabled={isTotpBusy}
                      className="px-3 py-1.5 rounded text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-60 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {isTotpBusy && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>Set Up</span>
                    </button>
                  )}
                </div>

                {totpError && (
                  <div className="bg-rose-50 border-2 border-rose-400 text-rose-800 px-3 py-2 rounded text-[11px] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{totpError}</span>
                  </div>
                )}

                {totpSetupData && (
                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-4">
                    <img
                      src={totpSetupData.qrCodeDataUri}
                      alt="Scan with your authenticator app"
                      className="w-36 h-36 border border-slate-200 rounded-lg p-1 shrink-0 mx-auto sm:mx-0"
                    />
                    <div className="flex-1 space-y-2.5">
                      <p className="text-[11px] text-slate-600">
                        Scan this QR code with your authenticator app, then enter the 6-digit code it shows.
                      </p>
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1.5">
                        <code className="text-[10px] font-mono text-slate-600 truncate flex-1">{totpSetupData.secret}</code>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(totpSetupData.secret)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                          title="Copy secret (for manual entry)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={totpConfirmCode}
                          onChange={(e) => setTotpConfirmCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="w-28 px-3 py-2 border border-slate-300 rounded text-sm font-mono tracking-widest text-center focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleConfirmTotpSetup}
                          disabled={isTotpBusy || totpConfirmCode.length !== 6}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-4 py-2 rounded transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {isTotpBusy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>Confirm & Enable</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setTotpSetupData(null); setTotpConfirmCode(''); setTotpError(null); }}
                          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showDisableTotpPrompt && (
                  <div className="border-t border-slate-100 pt-4 flex items-center gap-2">
                    <input
                      type="password"
                      value={disableTotpPassword}
                      onChange={(e) => setDisableTotpPassword(e.target.value)}
                      placeholder="Enter your password to confirm"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleDisableTotp}
                      disabled={isTotpBusy || !disableTotpPassword}
                      className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Disable 2FA
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowDisableTotpPrompt(false); setDisableTotpPassword(''); setTotpError(null); }}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication -- Passkeys (WebAuthn) */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${passkeys.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Passkeys</div>
                      <div className="text-[11px] text-slate-500">Face ID, Windows Hello, or a hardware security key</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPasskey}
                    disabled={isRegisteringPasskey}
                    className="px-3 py-1.5 rounded text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-60 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isRegisteringPasskey && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Passkey</span>
                  </button>
                </div>

                {passkeyError && (
                  <div className="bg-rose-50 border-2 border-rose-400 text-rose-800 px-3 py-2 rounded text-[11px] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passkeyError}</span>
                  </div>
                )}

                {passkeys.length > 0 && (
                  <div className="divide-y divide-slate-100 border-t border-slate-100">
                    {passkeys.map((pk) => (
                      <div key={pk.id} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Key className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{pk.nickname}</div>
                            {pk.createdAt && (
                              <div className="text-[10px] text-slate-400">
                                Added {new Date(pk.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePasskey(pk.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Remove this passkey"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. BILLING & CREDITS TAB (Requested SaaS Billing Architecture) */}
          {/* ============================================================ */}
          {activeTab === 'billing' && (
            <div className="space-y-5">
              {billingToast && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span>{billingToast}</span>
                </div>
              )}

              {/* Top Overview Cards Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
                {/* 1. Total Balance */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold mb-1 text-[11px]">
                    <span>AVAILABLE BALANCE</span>
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {totalCredits} <span className="text-xs font-normal text-slate-400">Credits</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Prepaid: R {prepaidBalance.toFixed(2)}
                  </div>
                </div>

                {/* 2. Active Plan */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold mb-1 text-[11px]">
                    <span>CURRENT PLAN</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-sm font-bold text-cyan-800">
                    Principal Practitioner Pro
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    R 1,850.00 / month
                  </div>
                </div>

                {/* 3. Next Billing Date */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold mb-1 text-[11px]">
                    <span>NEXT RENEWAL</span>
                    <Calendar className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 font-mono">
                    2026/09/28
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Auto-renews (Visa •••• 4242)
                  </div>
                </div>

                {/* 4. Auto-Recharge Status */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 font-semibold mb-1 text-[11px]">
                    <span>AUTO-TOPUP</span>
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xs font-bold text-emerald-700">
                    Active (&lt; {autoRechargeThreshold} credits)
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Recharge: R {autoRechargeAmount}.00
                  </div>
                </div>
              </div>

              {/* Billing Sub-Tabs Navigation */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 text-xs overflow-x-auto">
                  <button
                    onClick={() => setBillingSubTab('credits')}
                    className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                      billingSubTab === 'credits'
                        ? 'border-cyan-600 text-cyan-800 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>Credit Allocation & Packs</span>
                  </button>

                  <button
                    onClick={() => setBillingSubTab('plans')}
                    className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                      billingSubTab === 'plans'
                        ? 'border-cyan-600 text-cyan-800 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>Subscription Plans</span>
                  </button>

                  <button
                    onClick={() => setBillingSubTab('payment')}
                    className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                      billingSubTab === 'payment'
                        ? 'border-cyan-600 text-cyan-800 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Payment Methods</span>
                  </button>

                  <button
                    onClick={() => setBillingSubTab('invoices')}
                    className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                      billingSubTab === 'invoices'
                        ? 'border-cyan-600 text-cyan-800 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Receipt className="w-4 h-4 text-slate-600" />
                    <span>Invoices & SARS Tax Receipts</span>
                  </button>

                  <button
                    onClick={() => setBillingSubTab('tax')}
                    className={`px-3.5 py-2.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                      billingSubTab === 'tax'
                        ? 'border-cyan-600 text-cyan-800 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-cyan-700" />
                    <span>Company VAT & Invoicing Info</span>
                  </button>
                </div>

                {/* Sub-Tab Content */}
                <div className="p-4 sm:p-5">
                  
                  {/* 1. CREDITS & TOP-UP */}
                  {billingSubTab === 'credits' && (
                    <div className="space-y-5">
                      {/* Credit Categories Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-700">DATA & CADASTRE</span>
                            <span className="font-mono text-xs font-black text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                              {dataCredits} Left
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-2">
                            ERF cadastral boundaries, ownership history & transfer records.
                          </p>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-600 h-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-700">FICA & FRAUD VETTING</span>
                            <span className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                              ficaCredits > 0 ? 'text-emerald-800 bg-emerald-100' : 'text-rose-700 bg-rose-100'
                            }`}>
                              {ficaCredits} Left
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-2">
                            Home Affairs ID validation, biometric match & sanctions screening.
                          </p>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full" style={{ width: ficaCredits > 0 ? '40%' : '0%' }}></div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-700">TITLE DEEDS & TRUSTS</span>
                            <span className="font-mono text-xs font-black text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                              {trustCredits} Left
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-2">
                            Official WinDeed copies, sectional scheme rules & trust searches.
                          </p>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Top-Up Credit Packs Selection */}
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                          <span>Select Top-Up Credit Pack</span>
                          <span className="text-[10px] text-slate-400 font-normal">Immediate live credit allocation to account</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Pack 1: 50 FICA */}
                          <label
                            onClick={() => setSelectedPack('fica_50')}
                            className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                              selectedPack === 'fica_50' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                                50
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">50 x FICA & Fraud Vetting Credits</div>
                                <div className="text-[10px] text-slate-500">Live Home Affairs verification + PEP screening</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-slate-900 text-xs">R 495.00</span>
                            </div>
                          </label>

                          {/* Pack 2: 200 FICA */}
                          <label
                            onClick={() => setSelectedPack('fica_200')}
                            className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                              selectedPack === 'fica_200' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                                200
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">200 x FICA & Bureau Bulk Pack</div>
                                <div className="text-[10px] text-slate-500">Best value for active brokerage teams (Save 25%)</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-slate-900 text-xs">R 1,490.00</span>
                            </div>
                          </label>

                          {/* Pack 3: 250 Data */}
                          <label
                            onClick={() => setSelectedPack('data_250')}
                            className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                              selectedPack === 'data_250' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center shrink-0 text-xs">
                                250
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">250 x Cadastre & Deeds Data Credits</div>
                                <div className="text-[10px] text-slate-500">Deeds owner searches, ERF cadastres & historical transfers</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-slate-900 text-xs">R 750.00</span>
                            </div>
                          </label>

                          {/* Pack 4: Enterprise Master */}
                          <label
                            onClick={() => setSelectedPack('bundle_master')}
                            className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                              selectedPack === 'bundle_master' ? 'border-cyan-500 bg-cyan-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                                ★
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">Enterprise Master Agency Bundle</div>
                                <div className="text-[10px] text-slate-500">300 Data + 100 FICA + 30 Deeds & Documents</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-slate-900 text-xs">R 1,890.00</span>
                            </div>
                          </label>
                        </div>

                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="text-[11px] text-slate-500 font-mono">
                            Charged to: <strong>Visa ending in •••• 4242</strong>
                          </div>

                          <button
                            type="button"
                            disabled={isProcessingTopUp}
                            onClick={() => handlePurchaseCreditPack(selectedPack)}
                            className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-5 py-2 rounded shadow-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                          >
                            {isProcessingTopUp ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Authorizing Card...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5" />
                                <span>Top-Up Selected Pack</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Auto-Recharge Rules Box */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <div>
                              <span className="font-bold text-slate-900">Automatic Credit Recharge Trigger</span>
                              <span className="text-[11px] text-slate-500 block">Prevent workflow interruption during client presentations</span>
                            </div>
                          </div>

                          <input
                            type="checkbox"
                            checked={autoRechargeEnabled}
                            onChange={(e) => setAutoRechargeEnabled(e.target.checked)}
                            className="w-4 h-4 text-cyan-600 rounded"
                          />
                        </div>

                        {autoRechargeEnabled && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                            <div>
                              <label className="block text-slate-600 font-semibold mb-1">When credits drop below:</label>
                              <select
                                value={autoRechargeThreshold}
                                onChange={(e) => setAutoRechargeThreshold(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800"
                              >
                                <option value="10">10 Credits</option>
                                <option value="20">20 Credits (Recommended)</option>
                                <option value="50">50 Credits</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 font-semibold mb-1">Automatically purchase:</label>
                              <select
                                value={autoRechargeAmount}
                                onChange={(e) => setAutoRechargeAmount(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800"
                              >
                                <option value="495">50 FICA Credits (R 495.00)</option>
                                <option value="750">250 Data Credits (R 750.00)</option>
                                <option value="1890">Enterprise Bundle (R 1,890.00)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. SUBSCRIPTION PLANS */}
                  {billingSubTab === 'plans' && (
                    <div className="space-y-5 text-xs">
                      {/* Monthly / Annual Toggle */}
                      <div className="flex items-center justify-center gap-3 bg-slate-100 p-2 rounded-lg max-w-sm mx-auto">
                        <button
                          onClick={() => setBillingCycle('monthly')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Monthly Billing
                        </button>
                        <button
                          onClick={() => setBillingCycle('annual')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                            billingCycle === 'annual' ? 'bg-[#00bcd4] text-white shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          <span>Annual Billing</span>
                          <span className="bg-amber-300 text-slate-900 text-[9px] font-black px-1.5 py-0.2 rounded">
                            20% OFF
                          </span>
                        </button>
                      </div>

                      {/* Tier Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Tier 1: Starter */}
                        <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-sm text-slate-900">Starter Practitioner</h5>
                            <p className="text-[10px] text-slate-500 mb-3">For single-agent residential farming</p>
                            <div className="font-black text-lg text-slate-900 font-mono mb-3">
                              {billingCycle === 'monthly' ? 'R 650' : 'R 520'}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">/ month</span>
                            </div>

                            <ul className="space-y-2 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>50 Cadastre & Deeds queries / mo</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>5 FICA IDV checks / mo</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Standard CMA PDF generation</span>
                              </li>
                            </ul>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedPlanTier('starter');
                              setShowChangePlanModal(true);
                            }}
                            className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-1.5 rounded transition-colors text-xs"
                          >
                            Downgrade to Starter
                          </button>
                        </div>

                        {/* Tier 2: Pro (Current) */}
                        <div className="border-2 border-cyan-500 rounded-lg p-4 bg-cyan-50/30 flex flex-col justify-between shadow-xs relative">
                          <span className="absolute -top-2.5 right-3 bg-cyan-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            CURRENT PLAN
                          </span>

                          <div>
                            <h5 className="font-bold text-sm text-slate-900">Principal Practitioner Pro</h5>
                            <p className="text-[10px] text-slate-500 mb-3">Full Atlantic Seaboard intelligence & portals</p>
                            <div className="font-black text-lg text-cyan-800 font-mono mb-3">
                              {billingCycle === 'monthly' ? 'R 1,850' : 'R 1,480'}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">/ month</span>
                            </div>

                            <ul className="space-y-2 text-[11px] text-slate-700 border-t border-cyan-200/60 pt-3">
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span><strong>250 Cadastre & Deeds queries / mo</strong></span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>20 FICA & Fraud screening checks / mo</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span><strong>Unlimited Multi-Page CMA PDFs</strong></span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Portal Sync (Property24 & Private Property)</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>AI Agent Bio & Valuation Generator</span>
                              </li>
                            </ul>
                          </div>

                          <div className="mt-4 bg-cyan-100/70 text-cyan-900 font-bold py-1.5 rounded text-center text-xs">
                            Active Subscription
                          </div>
                        </div>

                        {/* Tier 3: Enterprise Agency */}
                        <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-sm text-slate-900">Agency Multi-Seat Enterprise</h5>
                            <p className="text-[10px] text-slate-500 mb-3">Full agency branch with dedicated API gateway</p>
                            <div className="font-black text-lg text-slate-900 font-mono mb-3">
                              {billingCycle === 'monthly' ? 'R 4,950' : 'R 3,960'}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">/ month</span>
                            </div>

                            <ul className="space-y-2 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span><strong>1,500 Cadastre queries</strong> (Shared pool)</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>150 FICA & Bureau verifications</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Up to 10 Agent Seats included</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Custom agency white-label watermark</span>
                              </li>
                            </ul>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedPlanTier('enterprise');
                              setShowChangePlanModal(true);
                            }}
                            className="mt-4 w-full bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold py-1.5 rounded transition-colors text-xs uppercase tracking-wider shadow-xs"
                          >
                            Upgrade to Enterprise
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* 3. PAYMENT METHODS */}
                  {billingSubTab === 'payment' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <h4 className="font-bold text-slate-900">Stored Cards & Payment Methods</h4>
                          <span className="text-[10px] text-slate-500">Managed via Peach Payments / PayGate 3D Secure Vault</span>
                        </div>

                        <button
                          onClick={() => setShowAddPaymentModal(true)}
                          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Payment Method</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {paymentMethodsList.map((pm) => (
                          <div 
                            key={pm.id} 
                            className={`p-3.5 rounded-lg border flex items-center justify-between transition-all ${
                              pm.isDefault ? 'border-cyan-400 bg-cyan-50/40 ring-1 ring-cyan-200' : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] font-mono shadow-xs">
                                {pm.type}
                              </div>

                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                  <span>•••• •••• •••• {pm.last4}</span>
                                  {pm.isDefault && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                      DEFAULT
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Expires {pm.exp} • {pm.holder}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!pm.isDefault && (
                                <button
                                  onClick={() => {
                                    setPaymentMethodsList(prev => prev.map(p => ({ ...p, isDefault: p.id === pm.id })));
                                    setBillingToast(`Card ending in ${pm.last4} set as default.`);
                                    setTimeout(() => setBillingToast(null), 3000);
                                  }}
                                  className="text-xs text-cyan-700 hover:text-cyan-900 font-bold hover:underline"
                                >
                                  Make Default
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  if (paymentMethodsList.length <= 1) {
                                    alert('You must keep at least one active payment method.');
                                    return;
                                  }
                                  setPaymentMethodsList(prev => prev.filter(p => p.id !== pm.id));
                                  setBillingToast('Payment method removed.');
                                  setTimeout(() => setBillingToast(null), 3000);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Instant EFT / Ozow alternative banner */}
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-slate-600 text-[11px]">
                        <div className="flex items-center gap-2">
                          <LandmarkIcon className="w-4 h-4 text-indigo-600" />
                          <span>Instant EFT (Ozow, Capitec Pay, SnapScan) available at checkout for one-off credit top-ups.</span>
                        </div>
                        <span className="text-emerald-700 font-bold">Zero Transaction Fees</span>
                      </div>
                    </div>
                  )}

                  {/* 4. INVOICES & SARS TAX RECEIPTS */}
                  {billingSubTab === 'invoices' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <h4 className="font-bold text-slate-900">SARS Compliant Tax Invoices & Receipts</h4>
                          <span className="text-[10px] text-slate-500">VAT Registration No: {taxVatNumber} • Itemized 15% South African VAT</span>
                        </div>

                        <button
                          onClick={() => alert('Downloading all annual statements (ZIP)...')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download All (ZIP)</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                              <th className="py-2.5 px-3">Invoice Number</th>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Description</th>
                              <th className="py-2.5 px-3 text-right">Amount (ZAR)</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {SAMPLE_INVOICES.map((inv) => (
                              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                                <td className="py-2.5 px-3 text-slate-500 font-mono">{inv.date}</td>
                                <td className="py-2.5 px-3 font-medium text-slate-800">{inv.description}</td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                  R {inv.amount.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-2 py-0.5 rounded">
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => setSelectedInvoiceForModal(inv)}
                                    className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold px-2.5 py-1 rounded text-[11px] border border-cyan-200 transition-colors"
                                  >
                                    View Tax Receipt
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 5. COMPANY TAX & VAT DETAILS */}
                  {billingSubTab === 'tax' && (
                    <form onSubmit={handleSaveTaxInfo} className="space-y-4 max-w-xl text-xs">
                      {taxSaved && (
                        <div className="bg-emerald-100 text-emerald-800 px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Company tax & invoicing details updated for all future SARS receipts.</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Company / Legal Entity Name</label>
                        <input
                          type="text"
                          value={taxCompanyName}
                          onChange={(e) => setTaxCompanyName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">South African VAT Registration Number</label>
                        <input
                          type="text"
                          value={taxVatNumber}
                          onChange={(e) => setTaxVatNumber(e.target.value)}
                          placeholder="e.g. 4920194821"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono font-semibold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Invoicing & Accounts Email Address</label>
                        <input
                          type="email"
                          value={taxBillingEmail}
                          onChange={(e) => setTaxBillingEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Physical Billing & Tax Address</label>
                        <textarea
                          rows={3}
                          value={taxAddress}
                          onChange={(e) => setTaxAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-5 py-2 rounded shadow-xs uppercase tracking-wider transition-colors"
                      >
                        Save Billing Details
                      </button>
                    </form>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. APPS & EXTENSIONS TAB */}
          {/* ============================================================ */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              {appToast && (
                <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 rounded shadow-xs animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{appToast}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {APPS_LIST.map((app) => {
                  const Icon = app.icon;
                  const isInstalled = installedApps.includes(app.id);

                  return (
                    <div 
                      key={app.id}
                      className={`bg-white rounded-lg border p-4 shadow-xs flex flex-col justify-between transition-all ${
                        isInstalled ? 'border-cyan-400/80 ring-1 ring-cyan-200' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Top row with icon, title, badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${app.color} flex items-center justify-center shadow-xs shrink-0`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-xs text-slate-900 leading-snug">{app.title}</h3>
                              <span className="text-[10px] text-slate-400 font-medium block">{app.category}</span>
                            </div>
                          </div>

                          <span className="bg-cyan-50 text-cyan-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-cyan-200">
                            {app.badge}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                          {app.description}
                        </p>
                      </div>

                      {/* Bottom row with ratings and Action Button */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <div className="text-[10px] text-slate-500 font-medium">
                          <span>{app.version}</span> • <span className="text-amber-600 font-bold">{app.rating}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleApp(app.id, app.title)}
                            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isInstalled
                                ? 'bg-emerald-100 hover:bg-rose-100 text-emerald-800 hover:text-rose-800 border border-emerald-300 hover:border-rose-300'
                                : 'bg-[#00bcd4] hover:bg-[#00acc1] text-white shadow-xs'
                            }`}
                          >
                            {isInstalled ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Active (Synced)</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Connect App</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Developer API Access Card */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white uppercase tracking-wider">Deeds & CMA Developer API Tokens</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Connect your agency’s bespoke CRM, website, or mobile application directly to our real-time Cadastre and Deeds Registry endpoints.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => alert('API credentials token generated: ptah_live_9984_afbc19024')}
                  className="bg-[#00bcd4] hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Generate API Key
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. PREFERENCES TAB (Context-Aware Informed by Country & Area) */}
          {/* ============================================================ */}
          {activeTab === 'preferences' && (
            <div className="max-w-3xl mx-auto space-y-5 text-xs">
              {/* Context Summary Banner */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-xl shrink-0">
                    {activeCountry.flag}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <span>Regional Context Applied:</span>
                      <span className="bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {activeCountry.name} • {activeCity.name}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Preferences are automatically informed by the selected Country & Area jurisdiction in your Profile.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="text-xs text-cyan-700 hover:text-cyan-900 font-bold underline shrink-0 cursor-pointer"
                >
                  Edit Jurisdiction →
                </button>
              </div>

              {/* Appearance & Theme Card -- luxury theme options. Each
                  swatch's two dots are the accent pair that theme
                  actually applies app-wide (see index.css); applied
                  immediately on click, not gated behind Save. */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-700" />
                    <span>Appearance & Theme</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Choose the accent palette used for buttons, active tabs, and calls to action
                    throughout the app and CRM. Every option is designed to keep the app looking
                    high-end -- pick whichever suits your brand.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { id: 'emerald', name: 'Emerald', subtitle: 'Signature', dot1: '#059669', dot2: '#f59e0b' },
                    { id: 'sapphire', name: 'Sapphire', subtitle: 'Platinum', dot1: '#2563eb', dot2: '#f59e0b' },
                    { id: 'ruby', name: 'Ruby', subtitle: 'Rose Gold', dot1: '#dc2626', dot2: '#f59e0b' },
                    { id: 'amethyst', name: 'Amethyst', subtitle: 'Royal', dot1: '#7c3aed', dot2: '#f59e0b' },
                    { id: 'onyx', name: 'Onyx', subtitle: 'Monochrome', dot1: '#52525b', dot2: '#f59e0b' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onThemeChange?.(opt.id)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        theme === opt.id
                          ? 'border-cyan-500 bg-cyan-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {theme === opt.id && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                      <span className="flex items-center -space-x-1.5">
                        <span
                          className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: opt.dot1 }}
                        />
                        <span
                          className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: opt.dot2 }}
                        />
                      </span>
                      <span className="text-center">
                        <span className="block font-bold text-xs text-slate-800">{opt.name}</span>
                        <span className="block text-[10px] text-slate-400">{opt.subtitle}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 pt-1">
                  More granular customization (per-module accents, custom brand colors) is planned
                  for a future update.
                </p>
              </div>

              {/* Preferences Configuration Card */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-700" />
                    <span>Application & Formatting Preferences</span>
                  </h2>
                  <span className="text-[10px] text-slate-400 font-mono">Territory: {activeCountry.code}</span>
                </div>

                <div className="space-y-4 divide-y divide-slate-100">
                  {/* Date Format (Informed by Country Metadata) */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">Date Format</span>
                      <span className="text-[11px] text-slate-500">
                        Controls date display on Deeds documents, valuation certificates, and CMA history.
                      </span>
                    </div>
                    <select 
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 font-mono font-semibold text-xs min-w-[240px] shadow-2xs cursor-pointer"
                    >
                      <option value="YYYY/MM/DD">YYYY/MM/DD ({activeCountry.code === 'ZAR' ? 'Deeds Office Standard' : 'ISO Standard'})</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (Commonwealth / UK Standard)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US / Regional Standard)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (Universal Standard)</option>
                    </select>
                  </div>

                  {/* Measurement Unit Standard (Informed by Country Metadata) */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">Measurement Standard & Area Units</span>
                      <span className="text-[11px] text-slate-500">
                        Default area unit for property parcels, ERF extents, and spatial geometry.
                      </span>
                    </div>
                    <select 
                      value={measurementUnit}
                      onChange={(e) => setMeasurementUnit(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 font-semibold text-xs min-w-[240px] shadow-2xs cursor-pointer"
                    >
                      <option value="Metric (m² & Hectares)">Metric (m² & Hectares)</option>
                      <option value="Imperial (sq ft & Acres)">Imperial (sq ft & Acres)</option>
                    </select>
                  </div>

                  {/* Default Cadastre Suburb (Informed by Selected City Suburbs) */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">Default Cadastre Suburb</span>
                      <span className="text-[11px] text-slate-500">
                        Auto-focus this suburb when opening new valuation sessions in {activeCity.name}.
                      </span>
                    </div>
                    <select 
                      value={defaultCadastreSuburb}
                      onChange={(e) => setDefaultCadastreSuburb(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 font-semibold text-xs min-w-[240px] shadow-2xs cursor-pointer"
                    >
                      {activeCity.suburbs.map((suburb) => (
                        <option key={suburb} value={suburb}>
                          {suburb}, {activeCity.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Regulatory Compliance & PEP/Sanctions Alerts */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">
                        {activeCountry.complianceAuthorityName} Automated Risk Notifications
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Receive real-time alerts for high PEP or sanction watchlist matches under {activeCountry.regulatoryBody} guidelines.
                      </span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-cyan-600 rounded cursor-pointer shrink-0" />
                  </div>

                  {/* Cadastre Satellite Layer Default */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">Cadastre Satellite Aerial Layer by Default</span>
                      <span className="text-[11px] text-slate-500">
                        Render high-resolution aerial satellite orthophotography automatically on map initialization.
                      </span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-cyan-600 rounded cursor-pointer shrink-0" />
                  </div>

                  {/* Valuation Archiving Statutory Compliance */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">Automatic Valuation Report Archiving</span>
                      <span className="text-[11px] text-slate-500">
                        Store generated 12-page PDF valuations in cloud repository for 7 years for statutory compliance.
                      </span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-cyan-600 rounded cursor-pointer shrink-0" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSaved(true);
                      setTimeout(() => setIsSaved(false), 3000);
                    }}
                    className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-5 py-2 rounded shadow-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Regional Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Changes saved successfully!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              id="btn-save-profile"
              onClick={handleSaveProfile}
              className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-5 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. SARS TAX INVOICE RECEIPT MODAL */}
      {selectedInvoiceForModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl border border-slate-300 relative text-slate-900 text-xs">
            <button 
              onClick={() => setSelectedInvoiceForModal(null)} 
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Tax Invoice Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">TAX INVOICE / RECEIPT</h2>
                <span className="text-[10px] text-slate-500 font-mono">Issued under Section 20(4) of the Value-Added Tax Act, 1991</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-sm text-cyan-800">PTAH Cadastre & Real Estate Intelligence</span>
                <span className="text-[10px] text-slate-500 block font-mono">VAT Reg: 4920194821</span>
              </div>
            </div>

            {/* Invoice Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">Billed To:</div>
                <div className="font-bold text-slate-900">{taxCompanyName}</div>
                <div className="text-slate-600 text-[11px]">Attn: {profile.name} {profile.surname} ({profile.email})</div>
                <div className="text-slate-500 text-[10px] font-mono mt-0.5">Customer VAT: {taxVatNumber}</div>
                <div className="text-slate-500 text-[10px]">{taxAddress}</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">Invoice Details:</div>
                <div className="font-bold font-mono text-slate-900">{selectedInvoiceForModal.invoiceNumber}</div>
                <div className="text-slate-600 text-[11px]">Date: {selectedInvoiceForModal.date}</div>
                <div className="text-slate-600 text-[11px]">Payment: {selectedInvoiceForModal.paymentMethod}</div>
                <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                  {selectedInvoiceForModal.status} (PAID IN FULL)
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs mb-4 border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                  <th className="py-2 px-3">Item & Description</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Net (ZAR)</th>
                  <th className="py-2 px-3 text-right">Total Net (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedInvoiceForModal.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3">{item.description}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.qty}</td>
                    <td className="py-2.5 px-3 text-right font-mono">R {item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">R {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Box */}
            <div className="flex justify-end mb-5">
              <div className="w-64 space-y-1 text-right font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Net):</span>
                  <span>R {selectedInvoiceForModal.netAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT (15.0%):</span>
                  <span>R {selectedInvoiceForModal.vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-1 text-sm">
                  <span>Total (Incl. VAT):</span>
                  <span className="text-cyan-800 font-black">R {selectedInvoiceForModal.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-[10px] text-slate-400">Electronic tax invoice generated for SARS eFiling compliance.</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#00bcd4] hover:bg-cyan-600 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHANGE PLAN MODAL */}
      {showChangePlanModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl border border-slate-300 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
              <h3 className="font-bold text-sm text-slate-900">Confirm Subscription Change</h3>
              <button onClick={() => setShowChangePlanModal(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 mb-4 leading-relaxed">
              You are selecting the <strong>{selectedPlanTier === 'starter' ? 'Starter Practitioner Plan (R 650/mo)' : 'Agency Multi-Seat Enterprise Plan (R 4,950/mo)'}</strong>.
              Your new quota and benefits will take effect immediately.
            </p>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-4 text-[11px]">
              <div className="font-bold text-slate-800 mb-1">Billing Summary:</div>
              <div className="text-slate-600 font-mono">Billed to: Visa ending in •••• 4242</div>
              <div className="text-slate-600 font-mono">Prorated charge: R {selectedPlanTier === 'enterprise' ? '3,100.00' : '0.00'}</div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowChangePlanModal(false);
                  setBillingToast(`Subscription updated to ${selectedPlanTier.toUpperCase()} successfully!`);
                  setTimeout(() => setBillingToast(null), 3000);
                }}
                className="px-4 py-1.5 rounded bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold shadow-xs uppercase tracking-wider"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD PAYMENT METHOD MODAL */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl border border-slate-300 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Add Stored Payment Card</span>
              </h3>
              <button onClick={() => setShowAddPaymentModal(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewPaymentMethod} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  placeholder="e.g. Ronald Read"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Card Number (16 Digits)</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  placeholder="4123 4567 8901 2345"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CVV Security Code</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={newCardCvv}
                    onChange={(e) => setNewCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Card tokenized and secured via 3D Secure 2.0 (Visa Secure & Mastercard Identity Check).</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold shadow-xs uppercase tracking-wider"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Agent Brochure Preview Modal */}
      {showBrochureModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl border border-slate-300 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowBrochureModal(false)} 
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-4 border-[#006980] p-6 bg-slate-50 text-slate-900 rounded">
              <div className="flex items-center justify-between border-b-2 border-cyan-600 pb-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black text-[#006980] tracking-tight uppercase">
                    {profile.name} {profile.surname}
                  </h2>
                  <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest block">
                    {profile.agentType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-slate-800">{profile.companyName}</span>
                  <span className="text-[10px] text-slate-500 block">FFC: {profile.ffcNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-1 flex flex-col items-center text-center">
                  <img 
                    src={profile.profilePhotoUrl} 
                    alt="Ronald Read" 
                    className="w-28 h-28 rounded-full object-cover border-2 border-cyan-500 shadow-md mb-2" 
                  />
                  <span className="text-xs font-bold text-slate-800">{profile.yearsExperience} Exp</span>
                  <span className="text-[10px] text-slate-500">{profile.numberOfAwards}</span>
                </div>

                <div className="col-span-2 text-xs space-y-2">
                  <p className="text-slate-700 leading-relaxed italic bg-white p-3 rounded border border-slate-200">
                    "{profile.aboutMe}"
                  </p>

                  <div className="bg-cyan-50 p-2.5 rounded border border-cyan-100">
                    <span className="font-bold text-cyan-900 block text-[11px]">Primary Farming Suburbs:</span>
                    <span className="text-slate-700 text-[11px]">{profile.farmingAreas.join(' • ')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-700">Mobile:</span> {profile.cellPhone}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Email:</span> {profile.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#006980] text-white p-3 rounded text-center text-xs font-semibold">
                Verified PPRA & FICA Compliance Certified • Atlantic Seaboard Intelligence
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="bg-[#00bcd4] hover:bg-cyan-600 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Mobile Phone SMS OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-300 relative text-xs space-y-4 animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowOtpModal(false)} 
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>Verify Mobile Phone Number</span>
                  <span>{activeCountry.flag}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Proof of legitimate local residency in {activeCountry.name}
                </p>
              </div>
            </div>

            {/* Explanatory Banner */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[11px] text-slate-600">
                A 6-digit authentication token has been dispatched via SMS to:
              </div>
              <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-600" />
                <span>+{activeCountry.phoneDialCode} {profile.cellPhone || activeCountry.phonePlaceholder}</span>
              </div>
            </div>

            {/* 6-Digit OTP Code Input */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 text-xs">
                Enter 6-Digit SMS Verification Code
              </label>
              <input 
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  setOtpError(null);
                  setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                }}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-xl font-extrabold py-2.5 bg-slate-50 border-2 border-cyan-400 focus:border-cyan-600 rounded-lg text-slate-900 shadow-inner"
              />
              <div className="text-[10px] text-slate-400 text-center">
                Enter the 6-digit code sent to your phone.
              </div>
            </div>

            {otpError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded text-[11px] font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* Countdown / Resend */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Didn't receive SMS?</span>
              {otpCountdown > 0 ? (
                <span className="font-mono font-medium text-slate-400">Resend code in {otpCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isOtpSending}
                  className="font-bold text-cyan-700 hover:text-cyan-900 underline cursor-pointer"
                >
                  {isOtpSending ? 'Sending...' : 'Resend SMS Code'}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold text-xs px-5 py-2 rounded shadow-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Verify & Confirm Resident</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Regulatory Dossier Modal -- opened from the FFC/License
          tooltip's "Inspect Full Dossier" link or the Practitioner
          Designation field's "Statutory Rules" link. */}
      {showFullRegulatoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-cyan-300">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-cyan-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl leading-none">{activeCountry.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-white">
                      {activeCountry.regulatoryBody}
                    </h3>
                    <span className="text-[11px] bg-cyan-900/80 text-cyan-200 border border-cyan-700 px-2 py-0.5 rounded font-mono">
                      {activeCountry.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Statutory Real Estate Licensing & Compliance Dossier • {activeCountry.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFullRegulatoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-700 text-xs">
              {/* Statutory Act Section */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-800 font-bold uppercase tracking-wider text-[11px]">
                  <Scale className="w-4 h-4 text-cyan-600" />
                  <span>Governing Statutory Act & Legislation</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {activeCountry.statutoryAct}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  This legislation serves as the supreme national property practice statute for real estate transactions, agency contracts, fiduciary obligations, and consumer protection in {activeCountry.name}.
                </p>
              </div>

              {/* Requirements & Qualifications */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                  <span>Statutory Practitioner Requirements & Qualifications</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-700 leading-relaxed text-xs space-y-2 shadow-2xs">
                  <p>{activeCountry.regulatoryRequirements}</p>
                </div>
              </div>

              {/* Grid of Key Fiduciary Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* License ID Format */}
                <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-950 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-cyan-700" />
                      <span>Licensing Identification Format</span>
                    </span>
                    <span className="text-[10px] text-cyan-800 font-mono font-bold">
                      {activeCountry.code} Standard
                    </span>
                  </div>
                  <p className="text-cyan-900 text-xs">{activeCountry.licenseFormatDescription}</p>
                  <div className="bg-white border border-cyan-200 rounded p-2 text-cyan-950 font-mono text-[11px] flex items-center justify-between shadow-2xs">
                    <span>{activeCountry.ffcLicensePlaceholder}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = activeCountry.ffcLicensePlaceholder.split(' / ')[0].trim();
                        setProfile({ ...profile, ffcNumber: sample });
                        setCopiedLicenseExample(true);
                        setTimeout(() => setCopiedLicenseExample(false), 2000);
                      }}
                      className="text-[10px] text-cyan-700 hover:text-cyan-900 font-bold underline cursor-pointer"
                    >
                      {copiedLicenseExample ? 'Applied!' : 'Apply Example'}
                    </button>
                  </div>
                </div>

                {/* Renewal & CPD Rules */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Licence Renewal & Continuing Education (CPD)</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {activeCountry.renewalCycle}
                  </p>
                </div>

                {/* Trust / Escrow Account Obligations */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Fiduciary Client Trust / Escrow Obligation</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {activeCountry.trustAccountObligation}
                  </p>
                </div>

                {/* AML / KYC Supervisory Body */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>AML/CFT Anti-Money Laundering Supervisory Body</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Supervised by <strong>{activeCountry.complianceAuthorityName}</strong> for mandatory beneficial ownership screening, suspicious transaction reporting, and source of funds verification.
                  </p>
                </div>
              </div>

              {/* Cadastral Land Registry & Portals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    <span>Cadastral Deeds & Land Registry Office</span>
                  </div>
                  <div className="font-semibold text-slate-900">{activeCountry.landRegistryAuthority}</div>
                  <div className="text-[11px] text-slate-500">
                    Legal Identifier System: <strong>{activeCountry.legalIdentifierName}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-600" />
                    <span>Authorized National Real Estate Portals</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeCountry.majorPortals.map((portal) => (
                      <a
                        key={portal.name}
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-300 hover:border-cyan-500 text-slate-800 hover:text-cyan-800 px-2 py-1 rounded shadow-2xs transition-colors"
                      >
                        <span>{portal.name}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Data verified according to national statutory provisions for <strong>{activeCountry.name}</strong>.
              </div>
              <button
                type="button"
                onClick={() => setShowFullRegulatoryModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function LandmarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}
