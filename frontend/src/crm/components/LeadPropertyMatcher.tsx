import React, { useState, useMemo } from 'react';
import {
  Home,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Building,
  BedDouble,
  Bath,
  MapPin,
  DollarSign,
  Send,
  Eye
} from 'lucide-react';
import { Lead, PropertyListing, TaskItem, ActivityLogItem } from '../types';
import { INITIAL_LISTINGS } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

interface LeadPropertyMatcherProps {
  lead: Lead;
  listings?: PropertyListing[];
  onUpdateLead?: (updatedLead: Lead) => void;
  className?: string;
}

interface MatchResult {
  listing: PropertyListing;
  matchScore: number; // 0 - 100
  attributes: {
    price: { match: boolean; partial: boolean; label: string; leadVal: string; listVal: string };
    suburb: { match: boolean; partial: boolean; label: string; leadVal: string; listVal: string };
    type: { match: boolean; partial: boolean; label: string; leadVal: string; listVal: string };
    bedrooms: { match: boolean; partial: boolean; label: string; leadVal: string; listVal: string };
    bathrooms: { match: boolean; partial: boolean; label: string; leadVal: string; listVal: string };
  };
  recommendationReason: string;
}

export const LeadPropertyMatcher: React.FC<LeadPropertyMatcherProps> = ({
  lead,
  listings = INITIAL_LISTINGS,
  onUpdateLead,
  className = '',
}) => {
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(50);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{ [id: string]: string }>({});

  // Parse lead budget values
  const budgetMinMax = useMemo(() => {
    const raw = lead.budget || '';
    // Look for numbers like 38M or 45000000
    const numbers = raw.match(/\d+(?:\.\d+)?/g);
    let min = lead.propertyPrice * 0.8;
    let max = lead.propertyPrice * 1.2;

    if (numbers && numbers.length >= 2) {
      let n1 = parseFloat(numbers[0]);
      let n2 = parseFloat(numbers[1]);
      if (raw.toLowerCase().includes('m')) {
        if (n1 < 1000) n1 *= 1000000;
        if (n2 < 1000) n2 *= 1000000;
      } else if (raw.toLowerCase().includes('k')) {
        if (n1 < 1000) n1 *= 1000;
        if (n2 < 1000) n2 *= 1000;
      }
      min = Math.min(n1, n2);
      max = Math.max(n1, n2);
    } else if (lead.propertyPrice) {
      min = lead.propertyPrice * 0.85;
      max = lead.propertyPrice * 1.15;
    }
    return { min, max };
  }, [lead.budget, lead.propertyPrice]);

  // Evaluate every listing against lead's preferred attributes
  const matchedResults: MatchResult[] = useMemo(() => {
    return listings.map((listing) => {
      let score = 0;

      // 1. Price Matching (up to 35 points)
      const listPrice = listing.price;
      const leadBudgetStr = lead.budget || `~${formatCurrency(lead.propertyPrice)}`;
      let priceMatch = false;
      let pricePartial = false;
      let priceLabel = '';

      if (listPrice >= budgetMinMax.min && listPrice <= budgetMinMax.max) {
        score += 35;
        priceMatch = true;
        priceLabel = 'Within Budget Target';
      } else if (listPrice <= budgetMinMax.max * 1.15 && listPrice >= budgetMinMax.min * 0.85) {
        score += 22;
        pricePartial = true;
        priceLabel = 'Within ±15% Budget Range';
      } else {
        score += 8;
        priceLabel = listPrice > budgetMinMax.max ? 'Above Target Budget' : 'Below Preferred Range';
      }

      // 2. Suburb / Location Matching (up to 25 points)
      const leadLoc = (lead.propertyLocation || '').toLowerCase();
      const listSuburb = (listing.suburb || '').toLowerCase();
      const listLoc = (listing.location || '').toLowerCase();
      let suburbMatch = false;
      let suburbPartial = false;
      let suburbLabel = '';

      if (leadLoc.includes(listSuburb) || listLoc.includes(listSuburb) || (listSuburb && leadLoc.includes(listSuburb))) {
        score += 25;
        suburbMatch = true;
        suburbLabel = 'Exact Suburb Match';
      } else if (
        (leadLoc.includes('cape town') && listLoc.includes('cape town')) ||
        (leadLoc.includes('sandton') && listLoc.includes('sandton')) ||
        (leadLoc.includes('atlantic') && (listSuburb.includes('camps') || listSuburb.includes('clifton') || listSuburb.includes('bantry')))
      ) {
        score += 16;
        suburbPartial = true;
        suburbLabel = 'Regional / Metro Alignment';
      } else {
        score += 5;
        suburbLabel = 'Different Metropolitan Area';
      }

      // 3. Property Type Matching (up to 20 points)
      const leadType = lead.propertyType || 'Villa';
      let typeMatch = false;
      let typePartial = false;
      let typeLabel = '';

      if (leadType.toLowerCase() === listing.propertyType.toLowerCase()) {
        score += 20;
        typeMatch = true;
        typeLabel = `Exact Match (${listing.propertyType})`;
      } else if (
        (leadType === 'Villa' && listing.propertyType === 'House') ||
        (leadType === 'Penthouse' && listing.propertyType === 'Apartment')
      ) {
        score += 12;
        typePartial = true;
        typeLabel = `Compatible Architecture (${listing.propertyType})`;
      } else {
        score += 4;
        typeLabel = `${listing.propertyType} vs ${leadType}`;
      }

      // 4. Bedrooms Matching (up to 10 points)
      const leadBeds = lead.propertyBedrooms || 4;
      let bedMatch = false;
      let bedPartial = false;
      let bedLabel = '';

      if (listing.bedrooms >= leadBeds) {
        score += 10;
        bedMatch = true;
        bedLabel = `${listing.bedrooms} Beds (Meets ${leadBeds}+ requirement)`;
      } else if (listing.bedrooms === leadBeds - 1) {
        score += 6;
        bedPartial = true;
        bedLabel = `${listing.bedrooms} Beds (1 fewer than requested)`;
      } else {
        score += 2;
        bedLabel = `${listing.bedrooms} Beds (Lead prefers ${leadBeds}+)`;
      }

      // 5. Bathrooms Matching (up to 10 points)
      const leadBaths = lead.propertyBathrooms || 3;
      let bathMatch = false;
      let bathPartial = false;
      let bathLabel = '';

      if (listing.bathrooms >= leadBaths) {
        score += 10;
        bathMatch = true;
        bathLabel = `${listing.bathrooms} Baths (Full match)`;
      } else {
        score += 5;
        bathPartial = true;
        bathLabel = `${listing.bathrooms} Baths`;
      }

      // Synthesis Recommendation Reason
      let reason = '';
      if (score >= 90) {
        reason = `Prime match! Meets ${lead.buyerType} price point (${formatCurrency(listing.price)}) in ${listing.suburb} with ${listing.bedrooms} bedrooms.`;
      } else if (score >= 70) {
        reason = `Strong contender with complementary luxury features and high suitability for ${lead.name}.`;
      } else {
        reason = `Alternative option worth proposing if ${lead.name} considers expanding location or budget parameters.`;
      }

      return {
        listing,
        matchScore: Math.min(100, score),
        attributes: {
          price: {
            match: priceMatch,
            partial: pricePartial,
            label: priceLabel,
            leadVal: leadBudgetStr,
            listVal: formatCurrency(listing.price),
          },
          suburb: {
            match: suburbMatch,
            partial: suburbPartial,
            label: suburbLabel,
            leadVal: lead.propertyLocation.split(',')[0] || lead.propertyLocation,
            listVal: `${listing.suburb} (${listing.location})`,
          },
          type: {
            match: typeMatch,
            partial: typePartial,
            label: typeLabel,
            leadVal: lead.propertyType,
            listVal: listing.propertyType,
          },
          bedrooms: {
            match: bedMatch,
            partial: bedPartial,
            label: bedLabel,
            leadVal: `${leadBeds}+ Beds`,
            listVal: `${listing.bedrooms} Beds`,
          },
          bathrooms: {
            match: bathMatch,
            partial: bathPartial,
            label: bathLabel,
            leadVal: `${leadBaths}+ Baths`,
            listVal: `${listing.bathrooms} Baths`,
          },
        },
        recommendationReason: reason,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [listings, lead, budgetMinMax]);

  // Filtered results
  const filteredMatches = useMemo(() => {
    return matchedResults.filter((m) => {
      if (m.matchScore < minMatchThreshold) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesTitle = m.listing.title.toLowerCase().includes(q);
        const matchesSuburb = m.listing.suburb.toLowerCase().includes(q);
        return matchesTitle || matchesSuburb;
      }
      return true;
    });
  }, [matchedResults, minMatchThreshold, searchFilter]);

  // WhatsApp Proposal Action
  const handleSendProposalWhatsApp = (result: MatchResult) => {
    const text = `Hi ${lead.name}, this is ${lead.assignedAgent.name} from Ptah Real Estate. Based on your preferences for ${lead.propertyType} properties in ${lead.propertyLocation}, I've identified an exceptional listing that matches your criteria (${result.matchScore}% affinity):

🏠 *${result.listing.title}*
📍 *Location:* ${result.listing.location}
💰 *Price:* ${formatCurrency(result.listing.price)}
🛏️ *Specifications:* ${result.listing.bedrooms} Beds | ${result.listing.bathrooms} Baths | ${result.listing.garages || 2} Garages
✨ *Key Highlight:* ${result.listing.description?.slice(0, 120)}...

Would you be open to reviewing the private digital brochure or arranging an exclusive viewing this week?`;

    const url = `https://wa.me/${lead.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Also log activity if onUpdateLead provided
    if (onUpdateLead) {
      const newActivity: ActivityLogItem = {
        id: `act-match-wa-${Date.now()}`,
        type: 'communication',
        title: `Shared Matched Listing via WhatsApp: ${result.listing.title}`,
        description: `Sent proposal for ${formatCurrency(result.listing.price)} listing with ${result.matchScore}% match score.`,
        timestamp: new Date().toISOString(),
        author: lead.assignedAgent.name,
        metadata: {
          commType: 'whatsapp',
          outcome: 'Matched Listing Proposed',
          tag: `${result.matchScore}% Match`
        }
      };

      onUpdateLead({
        ...lead,
        activityLogs: [newActivity, ...(lead.activityLogs || [])]
      });
    }

    setActionFeedback((prev) => ({ ...prev, [result.listing.id]: 'WhatsApp Sent! ✓' }));
    setTimeout(() => {
      setActionFeedback((prev) => {
        const copy = { ...prev };
        delete copy[result.listing.id];
        return copy;
      });
    }, 3000);
  };

  // Create Viewing Task Action
  const handleCreateViewingTask = (result: MatchResult) => {
    if (!onUpdateLead) return;

    const newTask: TaskItem = {
      id: `task-match-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      propertyTitle: result.listing.title,
      title: `Schedule Private Inspection: ${result.listing.title}`,
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
      type: 'viewing',
      isAutomated: false,
    };

    const newActivity: ActivityLogItem = {
      id: `act-task-${Date.now()}`,
      type: 'task_created',
      title: `Created Inspection Task for Matched Property`,
      description: `Targeting ${result.listing.title} (${result.matchScore}% match).`,
      timestamp: new Date().toISOString(),
      author: lead.assignedAgent.name,
    };

    onUpdateLead({
      ...lead,
      tasks: [newTask, ...(lead.tasks || [])],
      activityLogs: [newActivity, ...(lead.activityLogs || [])],
    });

    setActionFeedback((prev) => ({ ...prev, [result.listing.id]: 'Viewing Task Added! ✓' }));
    setTimeout(() => {
      setActionFeedback((prev) => {
        const copy = { ...prev };
        delete copy[result.listing.id];
        return copy;
      });
    }, 3000);
  };

  return (
    <div id="compare-interests-section" className={`space-y-4 ${className}`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  Compare Interests & Inventory Matchmaker
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {matchedResults.filter((m) => m.matchScore >= 70).length} Strong Matches
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Cross-referencing <strong className="text-white">{lead.name}'s</strong> preferred price, location, bedrooms, and property type against active Ptah listings.
              </p>
            </div>
          </div>

          {/* Lead Criteria Quick Strip */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
              💰 Budget: <strong className="text-emerald-300">{lead.budget || formatCurrency(lead.propertyPrice)}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
              📍 Area: <strong className="text-blue-300">{lead.propertyLocation.split(',')[0]}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200">
              🏡 Type: <strong className="text-amber-300">{lead.propertyType}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Match Threshold Strip */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Match Affinity:
          </span>
          <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMinMatchThreshold(80)}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                minMatchThreshold === 80
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              80%+ Best Matches
            </button>
            <button
              type="button"
              onClick={() => setMinMatchThreshold(60)}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                minMatchThreshold === 60
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              60%+ Strong
            </button>
            <button
              type="button"
              onClick={() => setMinMatchThreshold(0)}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                minMatchThreshold === 0
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Show All ({listings.length})
            </button>
          </div>
        </div>

        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter by suburb or title..."
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-60"
        />
      </div>

      {/* Matched Listings Comparison Grid */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No properties found matching {minMatchThreshold}% affinity. Try lowering the threshold or clearing filters.
          </div>
        ) : (
          filteredMatches.map((result) => {
            const isTop = result.matchScore >= 90;
            const isStrong = result.matchScore >= 75 && result.matchScore < 90;

            return (
              <div
                key={result.listing.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
                  isTop
                    ? 'border-emerald-300 ring-1 ring-emerald-500/20'
                    : isStrong
                    ? 'border-blue-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header & Media */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={result.listing.featuredImage}
                      alt={result.listing.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            isTop
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : isStrong
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{result.matchScore}% Match Score</span>
                        </span>

                        <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {result.listing.referenceNumber}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full">
                          {result.listing.mandateType}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {result.listing.title}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{result.listing.location}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-emerald-700 text-xs">
                          {formatCurrency(result.listing.price)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Feedback */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                    {actionFeedback[result.listing.id] ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {actionFeedback[result.listing.id]}
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSendProposalWhatsApp(result)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                          title="Send pre-filled proposal via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Propose on WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCreateViewingTask(result)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                          title="Add inspection task for this property"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Viewing</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Comparison Matrix */}
                <div className="p-4 sm:p-5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Attribute Comparison vs Lead Preferences</span>
                    <span className="text-slate-600 font-semibold normal-case">
                      {result.recommendationReason}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {/* Price Comparison */}
                    <div
                      className={`p-2.5 rounded-xl border text-xs ${
                        result.attributes.price.match
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : result.attributes.price.partial
                          ? 'bg-blue-50/60 border-blue-200 text-blue-950'
                          : 'bg-amber-50/60 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                        <span className="text-slate-500 uppercase">Price Target</span>
                        {result.attributes.price.match ? (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Fit
                          </span>
                        ) : (
                          <span className="text-amber-700">Notice</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">Lead: {result.attributes.price.leadVal}</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        Prop: {result.attributes.price.listVal}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium italic">
                        {result.attributes.price.label}
                      </div>
                    </div>

                    {/* Suburb Comparison */}
                    <div
                      className={`p-2.5 rounded-xl border text-xs ${
                        result.attributes.suburb.match
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : result.attributes.suburb.partial
                          ? 'bg-blue-50/60 border-blue-200 text-blue-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                        <span className="text-slate-500 uppercase">Location / Suburb</span>
                        {result.attributes.suburb.match && (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Exact
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">Lead: {result.attributes.suburb.leadVal}</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                        {result.listing.suburb}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium italic">
                        {result.attributes.suburb.label}
                      </div>
                    </div>

                    {/* Property Type Comparison */}
                    <div
                      className={`p-2.5 rounded-xl border text-xs ${
                        result.attributes.type.match
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : result.attributes.type.partial
                          ? 'bg-blue-50/60 border-blue-200 text-blue-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                        <span className="text-slate-500 uppercase">Property Type</span>
                        {result.attributes.type.match && (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Exact
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">Lead: {result.attributes.type.leadVal}</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        {result.attributes.type.listVal}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium italic">
                        {result.attributes.type.label}
                      </div>
                    </div>

                    {/* Bedrooms Comparison */}
                    <div
                      className={`p-2.5 rounded-xl border text-xs ${
                        result.attributes.bedrooms.match
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                        <span className="text-slate-500 uppercase">Bedrooms</span>
                        {result.attributes.bedrooms.match && (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Match
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">Lead: {result.attributes.bedrooms.leadVal}</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        {result.attributes.bedrooms.listVal}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium italic">
                        {result.attributes.bedrooms.label}
                      </div>
                    </div>

                    {/* Bathrooms Comparison */}
                    <div
                      className={`p-2.5 rounded-xl border text-xs ${
                        result.attributes.bathrooms.match
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                        <span className="text-slate-500 uppercase">Bathrooms</span>
                        {result.attributes.bathrooms.match && (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Match
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">Lead: {result.attributes.bathrooms.leadVal}</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        {result.attributes.bathrooms.listVal}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium italic">
                        {result.attributes.bathrooms.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
