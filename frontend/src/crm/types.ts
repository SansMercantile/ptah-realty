export type LeadSource =
  | 'Property 24'
  | 'Private Property'
  | 'Ptah Realty Website'
  | 'Facebook / Instagram Ads'
  | 'Direct Call / Walk-in'
  | 'Competitor Syndication'
  | 'Gumtree / IOL Property';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'viewing_scheduled'
  | 'offer_submitted'
  | 'deal_won'
  | 'deal_lost';

export type UrgencyLevel = 'urgent' | 'high' | 'medium' | 'low';

export type CommunicationType = 'whatsapp' | 'email' | 'call' | 'sms' | 'meeting' | 'portal_inquiry' | 'zoom_video' | 'skype_call';

export type ConnectorCategory =
  | 'portals'
  | 'communications'
  | 'marketing_campaigns'
  | 'video_walkthroughs'
  | 'virtual_tours'
  | 'calendars'
  | 'legal_valuations'
  | 'accounting_commission'
  | 'webhooks';

export type ConnectorStatus = 'connected' | 'configured' | 'disconnected' | 'error' | 'syncing';

export interface ConnectorConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'number' | 'select' | 'toggle';
  placeholder?: string;
  helpText?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: any;
}

export interface ConnectorItem {
  id: string;
  name: string;
  slug: string;
  category: ConnectorCategory;
  description: string;
  iconName: string;
  status: ConnectorStatus;
  isEnabled: boolean;
  lastSyncAt?: string;
  healthPingMs?: number;
  syncCount?: number;
  config: Record<string, any>;
  fields: ConnectorConfigField[];
  badgeText?: string;
  webhookUrl?: string;
  documentationUrl?: string;
}

export interface ConnectorSyncEvent {
  id: string;
  connectorId: string;
  connectorName: string;
  event: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
  details: string;
  payloadSummary?: string;
}

export type ActivityEventType =
  | 'status_change'
  | 'task_created'
  | 'task_completed'
  | 'task_reopened'
  | 'note_added'
  | 'communication'
  | 'email_automation'
  | 'ai_generated'
  | 'quality_score_update'
  | 'inquiry_received'
  | 'viewing_scheduled';

export interface ActivityLogItem {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string; // ISO string
  author: string;
  authorAvatar?: string;
  metadata?: {
    fromStatus?: LeadStatus;
    toStatus?: LeadStatus;
    taskTitle?: string;
    taskId?: string;
    commType?: CommunicationType;
    emailRecipient?: string;
    outcome?: string;
    duration?: string;
    scoreChange?: { from: number; to: number };
    noteContent?: string;
    documentType?: string;
    fileName?: string;
    tag?: string;
  };
}

export interface CommunicationItem {
  id: string;
  type: CommunicationType;
  direction: 'inbound' | 'outbound';
  title: string;
  content: string;
  timestamp: string;
  author: string;
  outcome?: string;
  duration?: string;
}

export interface TaskItem {
  id: string;
  leadId: string;
  leadName: string;
  propertyTitle: string;
  title: string;
  dueDate: string;
  priority: UrgencyLevel;
  status: 'pending' | 'completed';
  type: 'call' | 'email' | 'viewing' | 'brochure' | 'contract' | 'followup';
  isAutomated?: boolean;
}

export interface EmailNotificationLog {
  id: string;
  recipientType: 'agent' | 'client';
  recipientEmail: string;
  subject: string;
  triggerReason: string;
  timestamp: string;
  status: 'delivered' | 'opened' | 'clicked' | 'sent' | 'failed';
  previewSnippet: string;
  propertyTitle?: string;
  // Which lead this notification was about -- absent on test sends
  // (api/crm.py's send_test_email isn't tied to a real lead). Lets
  // LeadActivityFeed/LeadDetailModal show a lead's own email history by
  // filtering the real top-level log instead of a per-lead field no
  // real backend write ever populated.
  leadId?: string;
  // Real SES failure reason, only present when status === 'failed' --
  // see api/crm.py's save_crm_state / send_test_email.
  error?: string;
  // Whether the agent has opened/dismissed this notification in the
  // NotificationDrawer -- absent/undefined means unread (existing
  // records created before this field existed default to unread until
  // clicked, same as a genuinely new notification).
  isRead?: boolean;
}

export interface Lead {
  id: string;
  referenceNumber: string; // e.g. PTR-8041
  // Real link back to the main app's own "My Listings"
  // (ListingDealRecord.id in components/modals/MyListingsModal.tsx) when
  // this lead is for one of the agent's own mandates -- undefined for
  // leads on properties that aren't (e.g. a portal lead on another
  // agent's stock). propertyTitle/propertyLocation/propertyPrice below
  // stay as their own fields (a lead can exist without a linked listing,
  // and this keeps them as a display snapshot at inquiry time) -- when
  // listingId is set, prefer the live listing record for anything that
  // can change after the fact (price, mandate status).
  listingId?: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  source: LeadSource;
  status: LeadStatus;
  urgency: UrgencyLevel;
  leadScore: number; // 0 - 100
  propertyTitle: string;
  propertyRef: string;
  propertyLocation: string;
  propertyPrice: number; // in ZAR or USD
  propertyType: 'House' | 'Penthouse' | 'Apartment' | 'Villa' | 'Commercial' | 'Plot / Land';
  propertyBedrooms?: number;
  propertyBathrooms?: number;
  inquiryMessage: string;
  inquiryDate: string;
  assignedAgent: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  budget: string;
  buyerType: 'Cash Buyer' | 'Pre-approved Mortgage' | 'Investor' | 'First-Time Buyer' | 'Tenant';
  timeframe: 'Immediate (< 30 days)' | '1 - 3 Months' | '3 - 6 Months' | 'Browsing / Curious';
  notes: string[];
  activityLogs?: ActivityLogItem[];
  communications: CommunicationItem[];
  tasks: TaskItem[];
  emailLogs: EmailNotificationLog[];
  dealValue?: number;
  commissionEstimate?: number;
  lastContactedAt?: string;
  portalListingUrl?: string;
  birthday?: string; // e.g. "1988-08-28"
  ageBracket?: string; // e.g. "35-49"
  // Added from the updated demo export -- back the new document
  // parsing/conversion, client request portal, and call recording
  // components. All optional, so existing Lead records stay valid.
  documents?: LeadDocument[];
  parseHistory?: DocumentParseEvent[];
  documentRequests?: ClientDocumentRequestSession[];
  callRecordings?: CallRecording[];
  qualityScoreData?: LeadQualityScoreData;
  storyPoints?: number; // 1, 2, 3, 5, 8 story points based on transaction complexity
  sprintId?: string;
  sprintStage?: 'backlog' | 'in_progress' | 'viewing_staged' | 'negotiation' | 'done';
  blockerNotes?: string[];
}

export interface StandupBlocker {
  id: string;
  leadId?: string;
  leadName?: string;
  title: string;
  category: 'bond_financing' | 'deeds_office' | 'seller_negotiation' | 'fica_legal' | 'municipal_rates' | 'other';
  severity: 'critical' | 'high' | 'moderate';
  reportedBy: string;
  reportedAt: string;
  isResolved: boolean;
  resolutionNote?: string;
}

export interface ScrumSprint {
  id: string;
  name: string;
  number: number;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'planning' | 'completed';
  targetValueZar: number;
  targetViewings: number;
  targetDeals: number;
  totalCommittedPoints: number;
  completedPoints: number;
  dailyBlockers: StandupBlocker[];
}

export interface QualityScoreFactor {
  category: 'interactions' | 'source' | 'property' | 'readiness';
  name: string;
  score: number;
  maxScore: number;
  weightPercentage: number;
  status: 'exceptional' | 'strong' | 'moderate' | 'low';
  assessment: string;
  signals: string[];
}

export interface LeadQualityScoreData {
  score: number; // 1 - 100
  tier: 'Platinum VIP (90-100)' | 'High Intent (75-89)' | 'Moderate Intent (50-74)' | 'Early / Cold (<50)';
  tierBadgeColor: string;
  percentileRank: number; // e.g. 96th percentile
  dealWinProbability: number; // e.g. 82%
  factors: {
    interactions: QualityScoreFactor;
    source: QualityScoreFactor;
    propertyEngagement: QualityScoreFactor;
    readiness: QualityScoreFactor;
  };
  keyStrengths: string[];
  riskFlags: string[];
  engagementVelocity: {
    touchpointsTotal: number;
    preferredChannel: string;
    avgResponseSpeed: string;
    lastTouchRecency: string;
  };
  aiRecommendations: {
    priority: 'immediate' | 'high' | 'medium';
    action: string;
    expectedScoreBoost: number;
    impact: string;
  }[];
  aiExecutiveSummary: string;
  lastCalculatedAt: string;
}

export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  triggerEvent: string;
  sourceFilter: string;
  isActive: boolean;
  actions: {
    sendAgentAlert: boolean;
    sendClientAutoResponder: boolean;
    createTasks: string[];
    priority: UrgencyLevel;
  };
}

export interface AnalyticsSummary {
  totalLeads: number;
  newLeadsToday: number;
  activeFollowups: number;
  conversionRate: number;
  pipelineValue: number;
  projectedCommission: number;
  avgResponseMinutes: number;
  sourceBreakdown: { source: LeadSource; count: number; wonCount: number; conversionRate: number; avgDealValue: number }[];
  stageBreakdown: { stage: LeadStatus; label: string; count: number; value: number }[];
  monthlyTrends: { month: string; leads: number; won: number; conversionRate: number }[];
}

export interface PropertyListing {
  id: string;
  referenceNumber: string;
  title: string;
  price: number;
  location: string;
  suburb: string;
  propertyType: 'House' | 'Penthouse' | 'Apartment' | 'Villa' | 'Commercial' | 'Plot / Land';
  status: 'active' | 'show_house' | 'under_offer' | 'sold';
  mandateType: 'Sole Mandate' | 'Dual Mandate' | 'Open Mandate';
  bedrooms: number;
  bathrooms: number;
  garages?: number;
  erfSizeM2?: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  assignedAgentName?: string;
  isSyndicatedP24: boolean;
  isSyndicatedPrivateProperty: boolean;
  isSyndicatedPtahWebsite: boolean;
  featuredImage: string;
  description?: string;
  showHouseDates?: string;
  createdDate: string;
}

export interface ShowHouseRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  ownerName: string;
  clientName?: string;
  startDate: string;
  endDate: string;
  status: 'opened' | 'closed';
  agentInCharge: string;
  attendeeCount?: number;
  notes?: string;
}

export type CampaignConnectedApp = 'canva' | 'mailchimp' | 'zapier' | 'meta_ads';

export interface MarketingCampaign {
  id: string;
  title: string;
  objective: 'show_house' | 'just_listed' | 'vip_buyer_blast' | 'price_reduction' | 'birthday_greeting' | 'market_report' | 'custom';
  status: 'draft' | 'scheduled' | 'sent' | 'syncing';
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertyLocation?: string;
  propertyImage?: string;
  targetAudience: string;
  connectedApps: CampaignConnectedApp[];
  subjectLine?: string;
  previewText?: string;
  emailBody?: string;
  socialCaption?: string;
  canvaTemplateUrl?: string;
  canvaDesignName?: string;
  mailchimpCampaignId?: string;
  zapierWebhookTriggered?: boolean;
  sentAt?: string;
  scheduledFor?: string;
  metrics?: {
    recipientsCount: number;
    openRate: number; // e.g. 52.4
    clickRate: number; // e.g. 21.8
    leadsGenerated: number;
  };
  aiGenerated: boolean;
  aiSuggestedSubjectLines?: { subject: string; predictedOpenRate: number }[];
  aiCanvaPalette?: { name: string; hex: string }[];
  aiZapierWorkflow?: string[];
  createdAt: string;
}



// ---- Added from the updated AI Studio demo export (new CRM feature set: document parsing/conversion, client request portal, call recordings, business plan, deals hub, CDPA bank programs, billing leaderboard, resource centre, virtual reports, automated lead assignment). Appended rather than replacing this file, so the existing session work above (Lead.birthday/ageBracket etc.) is preserved. ----

export interface DocumentExtractedSchema {
  documentType: string;
  documentSummary: string;
  confidenceScore: number;
  extractedFields: {
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerIdNumber?: string;
    buyerType?: 'Cash Buyer' | 'Pre-approved Mortgage' | 'Investor' | 'First-Time Buyer' | 'Tenant';
    propertyTitle?: string;
    propertyRef?: string;
    propertyLocation?: string;
    propertyPrice?: number;
    budget?: string;
    depositAmount?: number;
    bondAmountRequired?: number;
    timeframe?: 'Immediate (< 30 days)' | '1 - 3 Months' | '3 - 6 Months' | 'Browsing / Curious';
    conveyancerAttorney?: string;
    transferDateEstimated?: string;
    suspensiveConditions?: string[];
    keyClauses?: string[];
  };
  fieldConfidenceScores?: Record<string, number>;
  suspensiveConditions?: string[];
  lowConfidenceFields?: string[];
  suggestedTasks?: {
    title: string;
    dueDate?: string;
    priority: UrgencyLevel;
    type: 'call' | 'email' | 'viewing' | 'brochure' | 'contract' | 'followup';
  }[];
  suggestedNotes?: string[];
  suggestedStatus?: LeadStatus;
}

export interface DocumentParseEvent {
  id: string;
  timestamp: string;
  leadId: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  documentType: string;
  confidenceScore: number;
  fieldConfidenceScores?: Record<string, number>;
  extractedFields: DocumentExtractedSchema['extractedFields'];
  schema: DocumentExtractedSchema;
  rawTextPreview: string;
  sourceType: 'upload' | 'batch' | 'vision_photo' | 'client_portal';
  isApplied: boolean;
  appliedAt?: string;
}

export interface ClientDocumentRequestItem {
  id: string;
  title: string;
  category: 'fica' | 'address' | 'banking' | 'tax' | 'mandate' | 'other';
  description: string;
  required: boolean;
  status: 'pending' | 'uploaded' | 'accepted' | 'rejected';
  uploadedFileName?: string;
  uploadedAt?: string;
}

export interface ClientDocumentRequestSession {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  requestedAt: string;
  requestedBy: string;
  status: 'pending' | 'partial' | 'completed';
  shareUrl: string;
  items: ClientDocumentRequestItem[];
  notes?: string;
}

export interface LeadDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt: string;
  uploadedBy: string;
  category: 'otp_contract' | 'bond_approval' | 'fica_id' | 'deeds_search' | 'floor_plan' | 'financial' | 'inspection' | 'other';
  rawTextPreview?: string;
  imageUrl?: string;
  schema?: DocumentExtractedSchema;
  isPopulated: boolean;
  populatedAt?: string;
}

export interface CallRecording {
  id: string;
  timestamp: string; // ISO string
  durationSeconds: number;
  durationFormatted: string; // e.g. "02:45"
  audioUrl?: string; // audio blob URL or synthesized stream
  caller: string; // agent name
  recipient: string; // client name
  phoneNumber: string;
  provider: 'Twilio WebRTC' | 'Browser VoIP' | 'Telviva SA' | 'Ptah Voice Gateway';
  status: 'completed' | 'recorded' | 'failed';
  transcription?: string;
  summary?: string;
  actionItems?: string[];
  sentiment?: 'positive' | 'neutral' | 'negotiating' | 'urgent';
  callType?: 'outbound_voip' | 'inbound_voip' | 'virtual_viewing_audio' | 'voice_note';
}

export interface BusinessExpenseItem {
  id: string;
  name: string;
  amount: number;
  isTaxDeductible: boolean;
}

export interface SuburbTargetItem {
  id: string;
  suburbName: string;
  historicalUnits: number;
  averagePrice: number;
  targetUnits: number;
  projectedValue: number;
}

export interface BusinessPlanConfig {
  year: number;
  monthlyNetTakeHome: number;
  salesVsRentalSplit: {
    salesPercent: number;
    rentalPercent: number;
  };
  incomeTaxRatePercent: number;
  salesCommissionSplit: {
    agentSharePercent: number;
    officeSharePercent: number;
  };
  rentalCommissionSplit: {
    agentSharePercent: number;
    officeSharePercent: number;
  };
  rentalCommissionTargetAnnual: number;
  actualCommissionRateYtd: number;
  employmentType: 'independent_contractor' | 'employee';
  monthlyExpenses: BusinessExpenseItem[];
  suburbTargets: SuburbTargetItem[];
  ytdActuals: {
    unitsSold: number;
    targetUnits: number;
    salesVolume: number;
    targetSalesVolume: number;
    totalCommissionEarned: number;
    commissionRatePercent: number;
    targetCommissionRatePercent: number;
  };
  clubStatus: {
    currentClub: string;
    targetClub: string;
    targetClubThreshold: number;
    ytdCommission: number;
    percentOfTarget: number;
  };
}

export interface RealEstateDeal {
  id: string;
  dealNumber: string;
  propertyTitle: string;
  address: string;
  suburb: string;
  salesDate: string;
  transferDate?: string;
  salePrice: number;
  grossCommission: number;
  agentCommission: number;
  officeCommission: number;
  status: 'active' | 'under_offer' | 'registered' | 'collapsed' | 'pending';
  sellerName: string;
  buyerName: string;
  attorney: string;
  deedsOffice: string;
  isSelectedForScheduleE?: boolean;
  listingAgent: string;
}

export interface CdpaBankProgram {
  id: string;
  bankName: string;
  programName: string;
  badgeColor: string;
  shortDescription: string;
  benefits: string[];
  sellerCommissionPaidPercent: number;
  debtWriteOffEligible: boolean;
  typicalTurnaroundDays: number;
  mandatedPropertiesCount: number;
  // Referenced by CdpaBankProgramsModal.tsx, missing from the demo's own
  // type (same pre-existing demo mismatch pattern).
  status?: string;
  description?: string;
  keyBenefits?: string[];
  contactPerson?: string;
  contactEmail?: string;
}

export interface CurrenciesDirectReferral {
  id: string;
  clientName?: string;
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail: string;
  clientPhone: string;
  direction?: 'inflow_purchase' | 'outflow_emigration' | 'expat_landlord';
  transactionType?: string;
  currencyPair?: string;
  estimatedAmountZar?: number;
  estimatedTransferAmountZar?: number;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  referralCommissionZar?: number;
  dateReferred?: string;
  notes: string;
  status: 'submitted' | 'under_compliance' | 'funds_cleared' | 'completed' | 'pending_contact';
  submittedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  agentName: string;
  roleTitle: string;
  avatar: string;
  office: string;
  region: string;
  clubStatus: 'Double Diamond' | 'Diamond Club' | "Chairman's Club" | "Millionaire's Club" | 'Bronze Club' | 'Silver Club' | 'Gold Club';
  previousClubStatus: string;
  ytdCommission: number;
  dealsCount: number;
  reachedMillionaireMilestone: boolean;
  milestoneMonth?: string;
  nationalRank: number;
  // The five below are referenced by BillingLeaderboardModal.tsx but were
  // missing from the demo's own LeaderboardEntry -- a real pre-existing
  // mismatch in the demo export (components use fields its types don't
  // declare). Added as optional so nothing already building breaks.
  transactionsCount?: number;
  totalBillingZar?: number;
  avatarUrl?: string;
  officeName?: string;
  clubTier?: string;
  officeRank: number;
}

export interface ResourceFileItem {
  id: string;
  folderId: string;
  title: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'zip' | 'png';
  sizeKb: number;
  updatedAt: string;
  downloadsCount: number;
  // Referenced by ResourceCentreModal.tsx, missing from the demo's own
  // type (same pre-existing demo mismatch pattern as LeaderboardEntry).
  fileSize?: string;
  downloadCount?: number;
  folderCategory?: string;
  description?: string;
  tags?: string[];
  isNew?: boolean;
}

export interface VirtualPropertyReport {
  id: string;
  schemeOrEstateName?: string;
  propertyAddress?: string;
  suburb: string;
  deedsOffice?: string;
  propertyCategory?: 'Complex' | 'Sectional Scheme' | 'Estate' | 'Suburb' | 'Street';
  unitsInScheme?: number;
  averageSalesPrice?: number;
  annualTurnoverPercent?: number;
  lastTransferDate: string;
  lastTransferPrice?: number;
  erfNumber: string;
  streetName?: string;
  municipalValuation?: number;
  municipalValuationZar?: number;
  estimatedMarketValueZar?: number;
  valuationLowZar?: number;
  valuationHighZar?: number;
  lastDeedsTransferPriceZar?: number;
  comparableSalesRecent?: { address: string; soldPrice: number; saleDate: string; beds: number }[];
  suburbGrowthRateAnnualPercent?: number;
  amenitiesNearby?: string[];
  generatedDate?: string;
  demographicProfile?: {
    averageAgeOwners: number;
    periodOfOwnershipYears: number;
    priceGrowth5YrPercent: number;
  };
}

export interface AgentAssignmentRuleConfig {
  capacityWeight: number; // 0 - 100
  dealWonWeight: number; // 0 - 100
  expertiseWeight: number; // 0 - 100
  strategy: 'hybrid' | 'performance_first' | 'capacity_balancer' | 'suburb_specialist';
  maxActiveLeadsPerAgent: number;
  minVipLeadScoreThreshold: number;
  autoAssignNewInbound: boolean;
}

export interface AgentAssignmentScore {
  agentName: string;
  agentEmail: string;
  agentAvatar: string;
  role: string;
  suburbs: string[];
  activeLeadsCount: number;
  maxCapacity: number;
  capacityUtilizationPercent: number;
  dealsWonCount: number;
  totalSalesVolumeZar: number;
  winRatePercent: number;
  scores: {
    capacityScore: number;
    dealWonScore: number;
    expertiseScore: number;
    compositeScore: number;
  };
  reasoning: string[];
  isRecommended: boolean;
}

