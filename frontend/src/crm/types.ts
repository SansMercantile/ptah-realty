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

export type CommunicationType = 'whatsapp' | 'email' | 'call' | 'sms' | 'meeting' | 'portal_inquiry';

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
  // Real SES failure reason, only present when status === 'failed' --
  // see api/crm.py's save_crm_state / send_test_email.
  error?: string;
}

export interface Lead {
  id: string;
  referenceNumber: string; // e.g. PTR-8041
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


