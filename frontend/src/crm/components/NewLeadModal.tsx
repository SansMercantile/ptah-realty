import React, { useState, useEffect } from 'react';
import { X, Building, Plus, User, Mail, Phone, DollarSign, Tag, Calendar, Sparkles } from 'lucide-react';
import { Lead, LeadSource, UrgencyLevel, LeadStatus } from '../types';
import { INITIAL_AGENTS } from '../data/mockData';
import { computeAgeBracket } from '../utils/formatters';

interface NewLeadModalProps {
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ onClose, onAddLead }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<LeadSource>('Property 24');
  const [propertyTitle, setPropertyTitle] = useState('');
  const [propertyPrice, setPropertyPrice] = useState('15000000');
  const [propertyLocation, setPropertyLocation] = useState('Atlantic Seaboard, Cape Town');
  const [inquiryMessage, setInquiryMessage] = useState('Interested in viewing this property this week.');
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');
  const [budget, setBudget] = useState('R15M - R18M');
  const [buyerType, setBuyerType] = useState<any>('Cash Buyer');
  // Optional -- deliberately NOT tied to any ID/FICA verification yet (no
  // buyer-side KYC flow exists in this CRM; only the property-owner deeds
  // verification flow does -- see docs/roadmap-lead-kyc-linkage.md for the
  // fuller plan). Just a plain, honest, manually-entered date for now.
  const [birthday, setBirthday] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const numPrice = parseFloat(propertyPrice) || 15000000;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      referenceNumber: `PTR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      phone,
      whatsappNumber: phone,
      source,
      status: 'new',
      urgency,
      leadScore: urgency === 'urgent' ? 95 : urgency === 'high' ? 88 : 74,
      propertyTitle: propertyTitle || 'Exclusive Ptah Realty Luxury Residence',
      propertyRef: `PTR-${Math.floor(100 + Math.random() * 900)}`,
      propertyLocation,
      propertyPrice: numPrice,
      propertyType: 'House',
      inquiryMessage,
      inquiryDate: new Date().toISOString(),
      assignedAgent: INITIAL_AGENTS[0],
      budget: budget || `R${(numPrice / 1000000).toFixed(1)}M`,
      buyerType,
      birthday: birthday || undefined,
      ageBracket: computeAgeBracket(birthday),
      timeframe: 'Immediate (< 30 days)',
      notes: [`Manually captured lead from ${source}`],
      communications: [
        {
          id: `comm-${Date.now()}`,
          type: 'portal_inquiry',
          direction: 'inbound',
          title: `Initial Inquiry via ${source}`,
          content: inquiryMessage,
          timestamp: new Date().toISOString(),
          author: name,
        },
      ],
      tasks: [
        {
          id: `task-${Date.now()}`,
          leadId: `lead-${Date.now()}`,
          leadName: name,
          propertyTitle: propertyTitle || 'Luxury Residence',
          title: `Initial Discovery Call with ${name}`,
          dueDate: new Date(Date.now() + 30 * 60000).toISOString(),
          priority: urgency,
          status: 'pending',
          type: 'call',
        },
      ],
      emailLogs: [
        {
          id: `em-man-${Date.now()}`,
          recipientType: 'agent',
          recipientEmail: 'privjapan@gmail.com',
          subject: `[NEW LEAD] Manual Lead: ${name} (${source})`,
          triggerReason: 'Manual Lead Creation',
          timestamp: new Date().toISOString(),
          status: 'delivered',
          previewSnippet: `Lead created for ${propertyTitle || 'Listing'}. Contact: ${phone}`,
        },
      ],
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden my-auto">
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Create New Real Estate Lead</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Client Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jonathan Sterling"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Lead Source Portal</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                <option value="Property 24">Property 24</option>
                <option value="Private Property">Private Property</option>
                <option value="Ptah Realty Website">Ptah Realty Website</option>
                <option value="Facebook / Instagram Ads">Facebook / Instagram Ads</option>
                <option value="Competitor Syndication">Competitor Syndication</option>
                <option value="Direct Call / Walk-in">Direct Call / Walk-in</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Phone / WhatsApp *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27 82 000 0000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@email.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">
                Date of Birth <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Property of Interest Title</label>
            <input
              type="text"
              value={propertyTitle}
              onChange={(e) => setPropertyTitle(e.target.value)}
              placeholder="e.g. Clifton Oceanfront Luxury Villa"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Listing Price (ZAR)</label>
              <input
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(e.target.value)}
                placeholder="15000000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Location / Suburb</label>
              <input
                type="text"
                value={propertyLocation}
                onChange={(e) => setPropertyLocation(e.target.value)}
                placeholder="e.g. Camps Bay, Cape Town"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Urgency Priority</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                <option value="urgent">🔥 Urgent Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Buyer Profile</label>
              <select
                value={buyerType}
                onChange={(e) => setBuyerType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                <option value="Cash Buyer">Cash Buyer</option>
                <option value="Pre-approved Mortgage">Pre-approved Mortgage</option>
                <option value="Investor">Investor</option>
                <option value="First-Time Buyer">First-Time Buyer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Client Inquiry Message</label>
            <textarea
              rows={3}
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
            >
              Save & Ingest Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
