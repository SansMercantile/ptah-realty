import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Building, 
  Send, 
  CheckCircle2, 
  Zap, 
  Flame, 
  Sparkles, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Lead, LeadSource } from '../types';
import { formatCurrency } from '../utils/formatters';

interface InboundSimulatorModalProps {
  onClose: () => void;
  onSimulateLead: (lead: Lead) => void;
}

const PRESET_SIMULATIONS = [
  {
    name: 'Property 24 Hot Buyer (Camps Bay Villa)',
    source: 'Property 24' as LeadSource,
    clientName: 'Lord Jonathan Sterling',
    email: 'j.sterling@sterlinginvest.uk',
    phone: '+27 82 991 4452',
    propertyTitle: 'The Camps Bay Sunset Horizon Villa',
    propertyRef: 'P24-1184029',
    location: 'Camps Bay, Atlantic Seaboard, Cape Town',
    price: 36000000,
    budget: 'R35M - R40M',
    type: 'Villa' as const,
    urgency: 'urgent' as const,
    score: 96,
    message: 'Hello Ptah Realty, inquiring via Property 24. We are UK cash buyers looking to finalize our Atlantic Seaboard residence this week. Please call me urgently to schedule a private viewing tomorrow.',
  },
  {
    name: 'Private Property Inbound (Sandton Penthouse)',
    source: 'Private Property' as LeadSource,
    clientName: 'Advocate Lerato Ndlovu',
    email: 'lerato.ndlovu@chambers.co.za',
    phone: '+27 83 400 9182',
    propertyTitle: 'Sandhurst Sky Penthouse with Infinity Terrace',
    propertyRef: 'PP-884910',
    location: 'Sandhurst, Sandton, Johannesburg',
    price: 24500000,
    budget: 'R22M - R26M',
    type: 'Penthouse' as const,
    urgency: 'high' as const,
    score: 90,
    message: 'Saw this listing on Private Property. Is the penthouse fully furnished and does it include 4 basement parking bays with direct lift access? Ready to view this Saturday.',
  },
  {
    name: 'Ptah Realty Website Inbound Contact Form',
    source: 'Ptah Realty Website' as LeadSource,
    clientName: 'Gareth & Claire Montgomery',
    email: 'gareth@montgomeryvineyards.com',
    phone: '+27 84 219 0041',
    propertyTitle: 'Franschhoek Boutique Olive & Wine Farm',
    propertyRef: 'PTR-WEB-771',
    location: 'Franschhoek Valley, Western Cape',
    price: 48000000,
    budget: 'R45M - R55M',
    type: 'House' as const,
    urgency: 'urgent' as const,
    score: 93,
    message: 'Direct submission from ptahrealty.com: We are looking for an agricultural lifestyle estate in Franschhoek or Stellenbosch with water rights. Please send confidential specs pack.',
  },
  {
    name: 'Competitor Network Syndication Lead',
    source: 'Competitor Syndication' as LeadSource,
    clientName: 'Dmitri & Svetlana Romanov',
    email: 'd.romanov@nordicfunds.ch',
    phone: '+41 79 123 4567',
    propertyTitle: 'Clifton 2nd Beach Luxury Oceanfront Bungalow',
    propertyRef: 'SYN-99412',
    location: 'Clifton, Cape Town',
    price: 52000000,
    budget: 'R50M - R60M',
    type: 'Villa' as const,
    urgency: 'high' as const,
    score: 88,
    message: 'Inquired from competitor syndication network: Relocating to Cape Town in November. Interested in Clifton beachfront with direct beach staircase.',
  },
];

export const InboundSimulatorModal: React.FC<InboundSimulatorModalProps> = ({
  onClose,
  onSimulateLead,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const activePreset = PRESET_SIMULATIONS[selectedPresetIndex];

  const handleRunSimulation = async () => {
    setIsSimulating(true);

    try {
      // Call backend webhook to test server processing
      const response = await fetch('/api/leads/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: activePreset.source,
          leadData: activePreset,
        }),
      });
      const data = await response.json();
      setSimulationResult(data);

      // Create new Lead object
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        referenceNumber: data.leadId || `PTR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: activePreset.clientName,
        email: activePreset.email,
        phone: activePreset.phone,
        whatsappNumber: activePreset.phone,
        source: activePreset.source,
        status: 'new',
        urgency: activePreset.urgency,
        leadScore: activePreset.score,
        propertyTitle: activePreset.propertyTitle,
        propertyRef: activePreset.propertyRef,
        propertyLocation: activePreset.location,
        propertyPrice: activePreset.price,
        propertyType: activePreset.type,
        inquiryMessage: activePreset.message,
        inquiryDate: new Date().toISOString(),
        assignedAgent: {
          name: 'privjapan (Senior Principal)',
          email: 'privjapan@gmail.com',
          phone: '+27 82 555 0192',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
        budget: activePreset.budget,
        buyerType: 'Cash Buyer',
        timeframe: 'Immediate (< 30 days)',
        notes: [`Ingested via ${activePreset.source} Live Webhook Simulator.`],
        communications: [
          {
            id: `comm-sim-1-${Date.now()}`,
            type: 'portal_inquiry',
            direction: 'inbound',
            title: `${activePreset.source} Inbound Ingestion`,
            content: `Live lead payload received for ${activePreset.propertyTitle}. Inquiry: "${activePreset.message}"`,
            timestamp: new Date().toISOString(),
            author: `${activePreset.source} Webhook API`,
          },
          {
            id: `comm-sim-2-${Date.now()}`,
            type: 'email',
            direction: 'outbound',
            title: 'Automated Instant Auto-Responder Dispatched',
            content: `Sent auto-responder to ${activePreset.email} with digital brochure and broker contact.`,
            timestamp: new Date().toISOString(),
            author: 'Ptah Automation Engine',
            outcome: 'Delivered',
          },
        ],
        tasks: [
          {
            id: `task-sim-1-${Date.now()}`,
            leadId: `lead-${Date.now()}`,
            leadName: activePreset.clientName,
            propertyTitle: activePreset.propertyTitle,
            title: `15-Min Call SLA: Call ${activePreset.clientName} regarding ${activePreset.source} inquiry`,
            dueDate: new Date(Date.now() + 15 * 60000).toISOString(),
            priority: 'urgent',
            status: 'pending',
            type: 'call',
            isAutomated: true,
          },
          {
            id: `task-sim-2-${Date.now()}`,
            leadId: `lead-${Date.now()}`,
            leadName: activePreset.clientName,
            propertyTitle: activePreset.propertyTitle,
            title: `Send digital specs & floor plans for ${activePreset.propertyTitle} via WhatsApp`,
            dueDate: new Date(Date.now() + 120 * 60000).toISOString(),
            priority: 'high',
            status: 'pending',
            type: 'brochure',
            isAutomated: true,
          },
        ],
        emailLogs: [
          {
            id: `em-log-1-${Date.now()}`,
            recipientType: 'agent',
            recipientEmail: 'privjapan@gmail.com',
            subject: `[URGENT] New Lead from ${activePreset.source}: ${activePreset.clientName} (${formatCurrency(activePreset.price)})`,
            triggerReason: `${activePreset.source} Inbound Webhook`,
            timestamp: new Date().toISOString(),
            status: 'delivered',
            previewSnippet: `New high-value lead received. Phone: ${activePreset.phone}. Inquiry: ${activePreset.message}`,
            propertyTitle: activePreset.propertyTitle,
          },
          {
            id: `em-log-2-${Date.now()}`,
            recipientType: 'client',
            recipientEmail: activePreset.email,
            subject: `Your inquiry on ${activePreset.propertyTitle} - Ptah Realty Luxury Portfolio`,
            triggerReason: 'Automatic Client Auto-responder',
            timestamp: new Date().toISOString(),
            status: 'delivered',
            previewSnippet: `Thank you for contacting Ptah Realty. We have received your inquiry...`,
            propertyTitle: activePreset.propertyTitle,
          },
        ],
      };

      setTimeout(() => {
        onSimulateLead(newLead);
        setIsSimulating(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setIsSimulating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Inbound Portal Lead Simulator</h2>
              <p className="text-xs text-slate-500">Test incoming webhooks from Property 24, Private Property & Ptah Website</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Presets Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Portal Ingestion Preset:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_SIMULATIONS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedPresetIndex(index);
                    setSimulationResult(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedPresetIndex === index
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {preset.source}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">{formatCurrency(preset.price)}</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900">{preset.clientName}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{preset.propertyTitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Payload Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="text-slate-700 font-semibold flex justify-between">
              <span>Incoming Webhook Payload Details:</span>
              <span className="text-emerald-700 font-mono font-bold">Lead Score: {activePreset.score}/100</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div><strong className="text-slate-500">Buyer:</strong> <span className="text-slate-900 font-medium">{activePreset.clientName}</span></div>
              <div><strong className="text-slate-500">Phone:</strong> <span className="text-slate-900 font-medium">{activePreset.phone}</span></div>
              <div><strong className="text-slate-500">Email:</strong> <span className="text-slate-900 font-medium">{activePreset.email}</span></div>
              <div><strong className="text-slate-500">Portal Ref:</strong> <span className="text-slate-900 font-medium">{activePreset.propertyRef}</span></div>
            </div>

            <div className="text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 italic shadow-xs">
              "{activePreset.message}"
            </div>
          </div>

          {/* Trigger Automations Overview */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl space-y-1.5 text-xs text-emerald-900">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Automations that will instantly fire upon ingestion:</span>
            </div>
            <div className="text-[11px] text-slate-600 pl-5 space-y-1">
              <div>• ✉️ Dispatches instant urgent broker email alert to <strong>privjapan@gmail.com</strong></div>
              <div>• 📤 Dispatches personalized luxury auto-responder email to client</div>
              <div>• ⏰ Automatically provisions 15-minute first-touch SLA call task</div>
              <div>• 📑 Pre-generates WhatsApp property specs and floor plans package</div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
          >
            <Radio className={`w-4 h-4 ${isSimulating ? 'animate-ping' : ''}`} />
            <span>{isSimulating ? 'Ingesting Inbound Lead & Firing Automations...' : `Trigger Live ${activePreset.source} Lead Ingestion`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
