import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Phone, 
  Mail, 
  Cake, 
  FileSpreadsheet, 
  BookOpen, 
  Copy, 
  Check, 
  Award,
  ChevronRight,
  TrendingUp,
  Wifi,
  Loader2
} from 'lucide-react';
import { PROSPECTING_SCRIPTS_DATA } from '../../services/mockData';
import { ProspectLead, ProspectScript } from '../../types';
import { getUpcomingOwnerDates, filterProspects, UpcomingOwnerDate, ProspectFilterResult } from '../../services/api';

interface ProspectingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPropertyByAddress?: (address: string) => void;
}

type ProspectingTab = 
  | 'List within Suburb'
  | 'Age of Owner'
  | 'Duration of Ownership'
  | 'For Sale: DOM'
  | 'For Sale By Owner'
  | 'Birthdays & Anniversaries'
  | 'Things to say';

export const ProspectingModal: React.FC<ProspectingModalProps> = ({
  isOpen,
  onClose,
  onSelectPropertyByAddress
}) => {
  const [activeTab, setActiveTab] = useState<ProspectingTab>('Duration of Ownership');
  const [selectedScript, setSelectedScript] = useState<ProspectScript>(PROSPECTING_SCRIPTS_DATA[0]);
  const [minAge, setMinAge] = useState<number>(35);
  const [minYears, setMinYears] = useState<number>(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [outreachSentId, setOutreachSentId] = useState<string | null>(null);

  // Live data for the two tabs with a clean real-backend equivalent:
  // Birthdays/Anniversaries -> api/prospecting.py's owner_contacts
  // (name/phone/email/event/date only -- no address/equity, that's a
  // different collection); For Sale: DOM -> real days-on-market computed
  // from this tenant's own properties. "Age of Owner" and "Duration of
  // Ownership" have no real backend equivalent at all (no owner-age or
  // transfer-date tracking exists yet), so those stay demo-only.
  const [liveBirthdays, setLiveBirthdays] = useState<UpcomingOwnerDate[] | null>(null);
  const [liveDom, setLiveDom] = useState<ProspectFilterResult[] | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'Birthdays & Anniversaries') {
      setIsLoadingLive(true);
      getUpcomingOwnerDates(30)
        .then((res) => setLiveBirthdays(res.upcoming))
        .catch((err) => { console.error('Prospecting: live birthdays fetch failed:', err); setLiveBirthdays(null); })
        .finally(() => setIsLoadingLive(false));
    } else if (activeTab === 'For Sale: DOM') {
      setIsLoadingLive(true);
      filterProspects({ domMinDays: 30, limit: 50 })
        .then((res) => setLiveDom(res.results))
        .catch((err) => { console.error('Prospecting: live DOM fetch failed:', err); setLiveDom(null); })
        .finally(() => setIsLoadingLive(false));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  let leadsList: ProspectLead[] = [...(liveDom || [])].map((lead) => ({
    id: lead.id,
    propertyAddress: lead.address_line || '',
    suburb: lead.suburb || '',
    ownerName: '',
    ownerIdMasked: '',
    contactNumber: '',
    email: '',
    ownerAge: 0,
    ownerBirthday: '',
    purchaseDate: '',
    durationYears: 0,
    purchaseAnniversary: '',
    estimatedEquity: 0,
    category: 'Freehold',
    erfExtentM2: 0,
    daysOnMarket: lead.days_on_market || 0,
    isForSaleByOwner: false,
    notes: '',
  }));

  if (activeTab === 'Age of Owner') {
    leadsList = leadsList.filter(l => l.ownerAge >= minAge);
  } else if (activeTab === 'Duration of Ownership') {
    leadsList = leadsList.filter(l => l.durationYears >= minYears);
  } else if (activeTab === 'For Sale By Owner') {
    leadsList = leadsList.filter(l => l.isForSaleByOwner);
  } else if (activeTab === 'For Sale: DOM') {
    leadsList = leadsList.filter(l => (l.daysOnMarket || 0) > 30);
  }

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDispatchOutreach = (leadId: string) => {
    setOutreachSentId(leadId);
    setTimeout(() => setOutreachSentId(null), 3000);
  };

  const formatZar = (val: number) => {
    if (!val) return 'R 0';
    return `R ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="prospecting-engine-modal"
        className="bg-white text-slate-800 w-full max-w-6xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <h2 className="font-bold text-sm tracking-tight">
              Prospecting & Mandate Lead Generation Engine
            </h2>
            {(activeTab === 'Birthdays & Anniversaries' || activeTab === 'For Sale: DOM') && (
              isLoadingLive ? (
                <Loader2 className="w-3 h-3 text-cyan-200 animate-spin ml-1" />
              ) : (
                <span
                  className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 ${
                    ((activeTab === 'Birthdays & Anniversaries' && liveBirthdays?.length) ||
                     (activeTab === 'For Sale: DOM' && liveDom?.length))
                      ? 'bg-emerald-500/30 text-emerald-100'
                      : 'bg-black/20 text-cyan-100'
                  }`}
                >
                  <Wifi className="w-2.5 h-2.5" />
                  {activeTab === 'Birthdays & Anniversaries'
                    ? (liveBirthdays?.length ? `LIVE (${liveBirthdays.length})` : 'DEMO DATA')
                    : (liveDom?.length ? `LIVE (${liveDom.length})` : 'DEMO DATA')}
                </span>
              )
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-100 hover:text-white hover:bg-teal-700/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Navigation */}
          <div className="w-full md:w-56 bg-slate-50 p-2.5 border-r border-slate-200 flex flex-col gap-0.5 shrink-0 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
              Lead Filters
            </span>

            {[
              { id: 'Duration of Ownership', label: 'Duration of Ownership (5-10+ yrs)', icon: Calendar },
              { id: 'Age of Owner', label: 'Age of Owner Demographics', icon: Users },
              { id: 'For Sale By Owner', label: 'For Sale By Owner (FSBO)', icon: Award },
              { id: 'For Sale: DOM', label: 'Days on Market (DOM > 30d)', icon: Clock },
              { id: 'Birthdays & Anniversaries', label: 'Birthdays & Anniversaries', icon: Cake },
              { id: 'Things to say', label: 'Things to Say (Scripts & Objections)', icon: BookOpen }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProspectingTab)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#006980] text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${activeTab === tab.id ? 'text-cyan-200' : 'text-slate-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Main Content */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3">
            {/* CONTENT REPOSITORY / SCRIPTS TAB */}
            {activeTab === 'Things to say' ? (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
                  <h3 className="font-bold text-xs text-slate-800 mb-0.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Content Repository: Objection Handling & Script Modules</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Empirically tested dialogue scripts designed for high-conversion cold calling, exclusive mandate acquisition, and commission defense.
                  </p>

                  {/* Script Selector Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                    {PROSPECTING_SCRIPTS_DATA.map(script => (
                      <button
                        key={script.id}
                        onClick={() => setSelectedScript(script)}
                        className={`p-2.5 rounded border text-left text-xs transition-all ${
                          selectedScript.id === script.id
                            ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[9px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold uppercase block w-fit mb-1 border border-cyan-200">
                          {script.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{script.title}</h4>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Script Dialogue Viewer */}
                <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{selectedScript.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{selectedScript.shortDescription}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    {selectedScript.scriptLines.map((line, idx) => (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded text-xs flex items-start justify-between gap-3 ${
                          line.speaker === 'Agent' 
                            ? 'bg-cyan-50/70 border border-cyan-200 text-cyan-950'
                            : line.speaker === 'Seller'
                            ? 'bg-amber-50/70 border border-amber-200 text-amber-950'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 italic'
                        }`}
                      >
                        <div>
                          <span className="font-bold uppercase text-[9px] block mb-0.5 tracking-wider opacity-80">
                            {line.speaker}
                          </span>
                          <p className="leading-relaxed text-[11px]">{line.text}</p>
                        </div>

                        <button
                          onClick={() => handleCopyText(line.text, idx)}
                          className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                          title="Copy script snippet"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* LEADS LIST VIEW */
              <div className="space-y-3">
                {/* Control bar */}
                <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  {activeTab === 'Duration of Ownership' && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Minimum Ownership Duration:</span>
                      <select
                        value={minYears}
                        onChange={(e) => setMinYears(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value={3}>3+ Years (Initial Equity Build)</option>
                        <option value={5}>5+ Years (Prime Move-Up Window)</option>
                        <option value={10}>10+ Years (High Equity Downsizing)</option>
                        <option value={15}>15+ Years (Legacy Properties)</option>
                      </select>
                    </div>
                  )}

                  {activeTab === 'Age of Owner' && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Owner Age Threshold:</span>
                      <select
                        value={minAge}
                        onChange={(e) => setMinAge(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value={30}>30+ Years</option>
                        <option value={50}>50+ Years</option>
                        <option value={60}>60+ Years (Retirement/Downsizing)</option>
                      </select>
                    </div>
                  )}

                  <span className="font-medium text-slate-700">
                    High-Intent Qualified Leads: <strong className="text-cyan-900 font-bold">{leadsList.length}</strong>
                  </span>
                </div>

                {/* Lead Cards Grid -- real data for Birthdays/DOM when
                    available (see chat: different shape than the demo
                    ProspectLead cards, so rendered separately rather than
                    force-fit into the same card layout). */}
                {activeTab === 'Birthdays & Anniversaries' && liveBirthdays && liveBirthdays.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {liveBirthdays.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center justify-between gap-2.5 text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                            {item.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-cyan-600" />{item.phone}</span>}
                            {item.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-cyan-600" />{item.email}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-bold uppercase block">
                            {item.event === 'birthday' ? 'Birthday' : 'Purchase Anniversary'}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 mt-1 block">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeTab === 'For Sale: DOM' && liveDom && liveDom.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {liveDom.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex items-center justify-between gap-2.5 text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{item.address_line || 'Address on file'}</h4>
                          <div className="text-[11px] text-slate-600 mt-0.5">{item.suburb}{item.city ? `, ${item.city}` : ''}</div>
                        </div>
                        <span className="text-[10px] bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded border border-cyan-200 font-bold shrink-0">
                          {item.days_on_market ?? '?'} days on market
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {leadsList.map(lead => (
                    <div 
                      key={lead.id}
                      className="bg-white p-3 rounded border border-slate-200 shadow-2xs hover:border-cyan-500 transition-all flex flex-col justify-between gap-2.5 text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-xs">{lead.propertyAddress}</h4>
                          <span className="text-[10px] bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded border border-cyan-200 font-bold">
                            {lead.durationYears} Yrs Owned
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Owner: <strong className="text-slate-800">{lead.ownerName}</strong> ({lead.ownerAge} yrs)
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Est. Equity Gain</span>
                            <span className="font-bold text-emerald-700">{formatZar(lead.estimatedEquity)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Anniversary</span>
                            <span className="font-bold text-amber-700">{lead.purchaseAnniversary}</span>
                          </div>
                        </div>

                        {lead.notes && (
                          <p className="mt-1.5 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
                            {lead.notes}
                          </p>
                        )}
                      </div>

                      {/* Contact & Actions */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-800">
                            <Phone className="w-3 h-3 text-cyan-600" />
                            {lead.contactNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDispatchOutreach(lead.id)}
                            className="px-2.5 py-1 bg-[#006980] hover:bg-teal-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                          >
                            {outreachSentId === lead.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-200" />
                                <span>Dispatched!</span>
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp Outreach</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>AI-Powered Deeds Office Prospecting Matrix</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
