import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import {
  MapPin,
  Flame,
  Building,
  DollarSign,
  TrendingUp,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Users,
  Target,
  Sparkles
} from 'lucide-react';
import { Lead } from '../types';
import { formatCurrency, formatShortCurrency } from '../utils/formatters';

interface LeadGeoHeatmapProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

// South Africa GeoJSON with 9 Provinces
const SOUTH_AFRICA_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'WC',
      properties: { name: 'Western Cape', code: 'WC', capital: 'Cape Town' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [18.3, -31.0],
            [19.2, -31.3],
            [20.0, -31.8],
            [21.5, -31.8],
            [23.5, -32.5],
            [24.2, -33.5],
            [23.8, -34.1],
            [23.4, -34.0],
            [22.5, -34.2],
            [21.8, -34.4],
            [20.0, -34.8],
            [19.4, -34.4],
            [18.4, -34.3],
            [18.3, -33.7],
            [17.9, -32.5],
            [18.3, -31.0]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'GT',
      properties: { name: 'Gauteng', code: 'GT', capital: 'Johannesburg / Pretoria' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [27.2, -25.4],
            [28.8, -25.4],
            [29.1, -26.1],
            [28.7, -26.9],
            [27.6, -26.9],
            [27.1, -26.4],
            [27.2, -25.4]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'KZN',
      properties: { name: 'KwaZulu-Natal', code: 'KZN', capital: 'Pietermaritzburg / Durban' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [29.5, -27.3],
            [31.2, -27.2],
            [32.8, -26.9],
            [32.9, -28.0],
            [32.0, -28.8],
            [31.1, -29.8],
            [30.3, -31.0],
            [29.3, -30.5],
            [29.1, -29.4],
            [28.8, -28.6],
            [29.5, -27.3]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'EC',
      properties: { name: 'Eastern Cape', code: 'EC', capital: 'Gqeberha / East London' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [24.2, -33.5],
            [23.5, -32.5],
            [24.5, -31.0],
            [27.0, -30.5],
            [29.3, -30.5],
            [30.3, -31.0],
            [29.5, -31.8],
            [28.0, -32.8],
            [26.0, -33.8],
            [24.8, -34.1],
            [24.2, -33.5]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'FS',
      properties: { name: 'Free State', code: 'FS', capital: 'Bloemfontein' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [24.6, -28.0],
            [26.8, -27.0],
            [28.8, -27.0],
            [29.5, -27.3],
            [28.8, -28.6],
            [27.5, -30.5],
            [25.5, -30.7],
            [24.5, -29.5],
            [24.6, -28.0]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'MP',
      properties: { name: 'Mpumalanga', code: 'MP', capital: 'Mbombela / Nelspruit' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [28.8, -25.4],
            [30.5, -24.5],
            [31.9, -24.5],
            [32.0, -26.0],
            [31.0, -27.3],
            [29.5, -27.3],
            [28.8, -26.9],
            [29.1, -26.1],
            [28.8, -25.4]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'LP',
      properties: { name: 'Limpopo', code: 'LP', capital: 'Polokwane' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [26.8, -24.5],
            [28.0, -22.2],
            [30.0, -22.2],
            [31.5, -22.4],
            [31.9, -24.5],
            [30.5, -24.5],
            [28.8, -25.4],
            [27.2, -25.4],
            [26.8, -24.5]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'NW',
      properties: { name: 'North West', code: 'NW', capital: 'Mahikeng' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [22.8, -26.0],
            [25.5, -25.5],
            [26.8, -24.5],
            [27.2, -25.4],
            [27.1, -26.4],
            [26.8, -27.0],
            [24.6, -28.0],
            [22.8, -27.0],
            [22.8, -26.0]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'NC',
      properties: { name: 'Northern Cape', code: 'NC', capital: 'Kimberley' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [16.4, -28.6],
            [20.0, -28.0],
            [20.0, -26.8],
            [22.8, -26.0],
            [22.8, -27.0],
            [24.6, -28.0],
            [24.5, -29.5],
            [24.5, -31.0],
            [21.5, -31.8],
            [20.0, -31.8],
            [19.2, -31.3],
            [18.3, -31.0],
            [17.0, -30.0],
            [16.4, -28.6]
          ]
        ]
      }
    }
  ]
};

// Known Coordinates for Major Luxury Hubs in South Africa
interface PropertyHub {
  id: string;
  name: string;
  suburb: string;
  provinceCode: string;
  provinceName: string;
  coordinates: [number, number]; // [longitude, latitude]
  keywords: string[];
}

// hubStats (below) maps each PropertyHub to one of these -- the actual
// per-hub lead rollup used for the leaderboard and detail card. activeHub
// holds one of these enriched objects (from a hubStats entry), not a
// bare PropertyHub, hence the separate type.
interface PropertyHubWithStats extends PropertyHub {
  leads: Lead[];
  count: number;
  totalValue: number;
  dealsWon: number;
  urgentCount: number;
  avgScore: number;
  topSource: string;
  conversionRate: string;
}

const PROPERTY_HUBS: PropertyHub[] = [
  {
    id: 'hub-clifton',
    name: 'Clifton & Atlantic Seaboard',
    suburb: 'Clifton',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    coordinates: [18.375, -33.938],
    keywords: ['clifton', 'camps bay', 'bantry bay', 'fresnaye', 'seaboard', 'atlantic seaboard', 'waterfront', 'sea point']
  },
  {
    id: 'hub-franschhoek',
    name: 'Franschhoek & Winelands',
    suburb: 'Franschhoek Valley',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    coordinates: [19.124, -33.910],
    keywords: ['franschhoek', 'stellenbosch', 'winelands', 'paarl', 'val de vie']
  },
  {
    id: 'hub-durbanville',
    name: 'Durbanville & Northern Suburbs',
    suburb: 'Durbanville',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    coordinates: [18.648, -33.834],
    keywords: ['durbanville', 'bellville', 'kenridge', 'welgemoed', 'northern suburbs']
  },
  {
    id: 'hub-sandhurst',
    name: 'Sandhurst & Sandton CBD',
    suburb: 'Sandhurst',
    provinceCode: 'GT',
    provinceName: 'Gauteng',
    coordinates: [28.040, -26.110],
    keywords: ['sandhurst', 'sandton', 'hyde park', 'bryanston', 'morningside', 'atholl', 'inanda']
  },
  {
    id: 'hub-rosebank',
    name: 'Rosebank & Parks Corridor',
    suburb: 'Rosebank',
    provinceCode: 'GT',
    provinceName: 'Gauteng',
    coordinates: [28.044, -26.145],
    keywords: ['rosebank', 'houghton', 'melrose', 'parkhurst', 'parkwood', 'craighall']
  },
  {
    id: 'hub-steyn-city',
    name: 'Steyn City & Midrand Eco-Estates',
    suburb: 'Steyn City',
    provinceCode: 'GT',
    provinceName: 'Gauteng',
    coordinates: [27.995, -25.985],
    keywords: ['steyn city', 'midrand', 'waterfall', 'fourways', 'dainfern', 'kyalami']
  },
  {
    id: 'hub-pretoria',
    name: 'Pretoria East & Waterkloof',
    suburb: 'Waterkloof',
    provinceCode: 'GT',
    provinceName: 'Gauteng',
    coordinates: [28.245, -25.775],
    keywords: ['pretoria', 'waterkloof', 'menlyn', 'brooklyn', 'silver lakes', 'woodhill']
  },
  {
    id: 'hub-umhlanga',
    name: 'Umhlanga Ridgeside & Durban Coast',
    suburb: 'Umhlanga',
    provinceCode: 'KZN',
    provinceName: 'KwaZulu-Natal',
    coordinates: [31.085, -29.728],
    keywords: ['umhlanga', 'durban', 'la lucia', 'ballito', 'zimbali', 'morningside durban', 'ridgeside']
  },
  {
    id: 'hub-garden-route',
    name: 'Garden Route & Plettenberg Bay',
    suburb: 'Plettenberg Bay',
    provinceCode: 'WC',
    provinceName: 'Western Cape',
    coordinates: [23.371, -34.052],
    keywords: ['plettenberg bay', 'knysna', 'george', 'garden route', 'mossel bay']
  }
];

export const LeadGeoHeatmap: React.FC<LeadGeoHeatmapProps> = ({ leads, onSelectLead }) => {
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'value' | 'conversion' | 'urgent'>('value');
  const [selectedPortal, setSelectedPortal] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [activeHub, setActiveHub] = useState<PropertyHubWithStats | null>(null);
  const [mapPosition, setMapPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [24.8, -29.2],
    zoom: 1
  });

  // Filter leads based on portal and province selection
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (selectedPortal !== 'all' && lead.source !== selectedPortal) return false;
      if (selectedProvince !== 'all') {
        const loc = (lead.propertyLocation || '').toLowerCase();
        if (selectedProvince === 'WC' && !loc.includes('cape') && !loc.includes('clifton') && !loc.includes('franschhoek') && !loc.includes('durbanville') && !loc.includes('bantry')) {
          return false;
        }
        if (selectedProvince === 'GT' && !loc.includes('johannesburg') && !loc.includes('sandton') && !loc.includes('rosebank') && !loc.includes('steyn city') && !loc.includes('midrand') && !loc.includes('gauteng')) {
          return false;
        }
        if (selectedProvince === 'KZN' && !loc.includes('durban') && !loc.includes('umhlanga') && !loc.includes('natal')) {
          return false;
        }
      }
      return true;
    });
  }, [leads, selectedPortal, selectedProvince]);

  // Aggregate stats per South African province
  const provinceStats = useMemo(() => {
    const map: Record<string, { leadsCount: number; totalValue: number; dealsWon: number; urgentCount: number; topSource: string; sources: Record<string, number> }> = {
      WC: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} },
      GT: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} },
      KZN: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} },
      EC: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} },
      FS: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} },
      MP: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} },
      LP: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} },
      NW: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} },
      NC: { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} }
    };

    filteredLeads.forEach((lead) => {
      const loc = (lead.propertyLocation || '').toLowerCase();
      let pCode = 'WC'; // default luxury baseline

      if (loc.includes('sandton') || loc.includes('johannesburg') || loc.includes('rosebank') || loc.includes('steyn city') || loc.includes('midrand') || loc.includes('pretoria') || loc.includes('gauteng')) {
        pCode = 'GT';
      } else if (loc.includes('durban') || loc.includes('umhlanga') || loc.includes('ballito') || loc.includes('natal')) {
        pCode = 'KZN';
      } else if (loc.includes('clifton') || loc.includes('franschhoek') || loc.includes('durbanville') || loc.includes('cape') || loc.includes('bantry') || loc.includes('plettenberg')) {
        pCode = 'WC';
      } else if (loc.includes('port elizabeth') || loc.includes('gqeberha') || loc.includes('eastern cape')) {
        pCode = 'EC';
      }

      if (!map[pCode]) {
        map[pCode] = { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0, topSource: '', sources: {} };
      }

      const p = map[pCode];
      p.leadsCount += 1;
      p.totalValue += lead.dealValue || lead.propertyPrice || 0;
      if (lead.status === 'deal_won') p.dealsWon += 1;
      if (lead.urgency === 'urgent') p.urgentCount += 1;
      p.sources[lead.source] = (p.sources[lead.source] || 0) + 1;
    });

    // Find top source per province
    Object.keys(map).forEach((k) => {
      const srcEntries = Object.entries(map[k].sources);
      if (srcEntries.length > 0) {
        srcEntries.sort((a, b) => b[1] - a[1]);
        map[k].topSource = srcEntries[0][0];
      }
    });

    return map;
  }, [filteredLeads]);

  // Aggregate stats per specific Property Hub / Suburb marker
  const hubStats = useMemo(() => {
    return PROPERTY_HUBS.map((hub) => {
      const hubLeads = filteredLeads.filter((lead) => {
        const loc = (lead.propertyLocation || '').toLowerCase();
        const title = (lead.propertyTitle || '').toLowerCase();
        return hub.keywords.some((kw) => loc.includes(kw) || title.includes(kw));
      });

      const totalValue = hubLeads.reduce((acc, l) => acc + (l.dealValue || l.propertyPrice || 0), 0);
      const dealsWon = hubLeads.filter((l) => l.status === 'deal_won').length;
      const urgentCount = hubLeads.filter((l) => l.urgency === 'urgent').length;
      const avgScore = hubLeads.length > 0 ? Math.round(hubLeads.reduce((acc, l) => acc + l.leadScore, 0) / hubLeads.length) : 0;

      // Source distribution
      const sourceCount: Record<string, number> = {};
      hubLeads.forEach((l) => {
        sourceCount[l.source] = (sourceCount[l.source] || 0) + 1;
      });
      const topSource = Object.entries(sourceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Property 24';

      return {
        ...hub,
        leads: hubLeads,
        count: hubLeads.length,
        totalValue,
        dealsWon,
        urgentCount,
        avgScore,
        topSource,
        conversionRate: hubLeads.length > 0 ? ((dealsWon / hubLeads.length) * 100).toFixed(0) : '0'
      };
    }).filter((h) => h.count > 0 || selectedProvince === 'all' || selectedProvince === h.provinceCode);
  }, [filteredLeads, selectedProvince]);

  // Max values for dynamic heat scaling
  const maxProvinceValue = useMemo(() => {
    return Math.max(...Object.values(provinceStats).map((p: { totalValue: number }) => p.totalValue), 1);
  }, [provinceStats]);

  const maxProvinceCount = useMemo(() => {
    return Math.max(...Object.values(provinceStats).map((p: { leadsCount: number }) => p.leadsCount), 1);
  }, [provinceStats]);

  // Color scale for choropleth province heat
  const colorScale = useMemo(() => {
    if (selectedMetric === 'volume') {
      return scaleLinear<string>().domain([0, maxProvinceCount || 1]).range(['#f1f5f9', '#059669']);
    } else if (selectedMetric === 'urgent') {
      return scaleLinear<string>().domain([0, 3]).range(['#f1f5f9', '#ef4444']);
    } else if (selectedMetric === 'conversion') {
      return scaleLinear<string>().domain([0, 50]).range(['#f1f5f9', '#8b5cf6']);
    }
    return scaleLinear<string>().domain([0, maxProvinceValue || 1]).range(['#f1f5f9', '#047857']);
  }, [selectedMetric, maxProvinceValue, maxProvinceCount]);

  // Dark mode color scale
  const darkColorScale = useMemo(() => {
    if (selectedMetric === 'volume') {
      return scaleLinear<string>().domain([0, maxProvinceCount || 1]).range(['#1e293b', '#059669']);
    } else if (selectedMetric === 'urgent') {
      return scaleLinear<string>().domain([0, 3]).range(['#1e293b', '#dc2626']);
    } else if (selectedMetric === 'conversion') {
      return scaleLinear<string>().domain([0, 50]).range(['#1e293b', '#7c3aed']);
    }
    return scaleLinear<string>().domain([0, maxProvinceValue || 1]).range(['#1e293b', '#065f46']);
  }, [selectedMetric, maxProvinceValue, maxProvinceCount]);

  // Handle zoom in / out
  const handleZoomIn = () => {
    setMapPosition((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 4) }));
  };

  const handleZoomOut = () => {
    setMapPosition((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 1) }));
  };

  const handleResetZoom = () => {
    setMapPosition({ coordinates: [24.8, -29.2], zoom: 1 });
    setSelectedProvince('all');
    setActiveHub(null);
  };

  // Jump to specific province
  const handleSelectProvinceFocus = (code: string) => {
    setSelectedProvince(code);
    if (code === 'WC') {
      setMapPosition({ coordinates: [19.5, -33.5], zoom: 2.2 });
    } else if (code === 'GT') {
      setMapPosition({ coordinates: [28.0, -26.0], zoom: 3.2 });
    } else if (code === 'KZN') {
      setMapPosition({ coordinates: [30.8, -29.2], zoom: 2.4 });
    } else {
      setMapPosition({ coordinates: [24.8, -29.2], zoom: 1 });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Heatmap Header & Controls Strip */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/90">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Geographic Inbound Intelligence</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>South Africa Property Lead Heatmap</span>
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {filteredLeads.length} Active Regional Inquiries
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Interactive territory visualization of luxury property inquiries, portal syndication yield, and conversion velocity across Cape Town Atlantic Seaboard, Sandton Corridor, and KZN Coastline.
          </p>
        </div>

        {/* Heatmap Metric Selector & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric mode toggle */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setSelectedMetric('value')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                selectedMetric === 'value'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pipeline Value</span>
            </button>
            <button
              onClick={() => setSelectedMetric('volume')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                selectedMetric === 'volume'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Lead Volume</span>
            </button>
            <button
              onClick={() => setSelectedMetric('urgent')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                selectedMetric === 'urgent'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hot Leads</span>
            </button>
          </div>

          {/* Portal Filter Dropdown */}
          <select
            value={selectedPortal}
            onChange={(e) => setSelectedPortal(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer font-medium shadow-2xs"
          >
            <option value="all">All Portals & Inbound Channels</option>
            <option value="Property 24">Property 24 Only</option>
            <option value="Private Property">Private Property Only</option>
            <option value="Ptah Realty Website">Ptah Website Only</option>
            <option value="Facebook / Instagram Ads">Meta Ads Only</option>
            <option value="Competitor Syndication">Competitor Syndication</option>
          </select>
        </div>
      </div>

      {/* Main Map & Territory Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Left: Interactive Map Container */}
        <div className="lg:col-span-8 p-4 sm:p-6 relative flex flex-col items-center justify-center min-h-[460px] bg-slate-50/50 dark:bg-slate-950/40">
          {/* Map Controls Floating Toolbar */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Reset View"
              aria-label="Reset Map"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Province Focus Quick Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
              Focus:
            </span>
            {[
              { code: 'all', label: 'All SA' },
              { code: 'WC', label: 'Western Cape', count: provinceStats['WC']?.leadsCount || 0 },
              { code: 'GT', label: 'Gauteng', count: provinceStats['GT']?.leadsCount || 0 },
              { code: 'KZN', label: 'KwaZulu-Natal', count: provinceStats['KZN']?.leadsCount || 0 },
            ].map((p) => {
              const isSelected = selectedProvince === p.code;
              return (
                <button
                  key={p.code}
                  onClick={() => handleSelectProvinceFocus(p.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                      : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{p.label}</span>
                  {p.count !== undefined && (
                    <span className="text-[10px] opacity-75 font-mono">({p.count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full h-[420px] sm:h-[480px] flex items-center justify-center">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1800,
                center: [24.8, -29.2],
              }}
              className="w-full h-full max-h-[480px]"
            >
              <ZoomableGroup
                zoom={mapPosition.zoom}
                center={mapPosition.coordinates}
                onMoveEnd={(position) => setMapPosition(position)}
              >
                {/* South Africa 9 Provinces Choropleth Layer */}
                <Geographies geography={SOUTH_AFRICA_GEOJSON}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const pCode = geo.id as string;
                      const stats = provinceStats[pCode] || { leadsCount: 0, totalValue: 0, dealsWon: 0, urgentCount: 0 };
                      const metricValue =
                        selectedMetric === 'volume'
                          ? stats.leadsCount
                          : selectedMetric === 'urgent'
                          ? stats.urgentCount
                          : selectedMetric === 'conversion'
                          ? stats.leadsCount > 0 ? (stats.dealsWon / stats.leadsCount) * 100 : 0
                          : stats.totalValue;

                      const isHighlighted = selectedProvince === 'all' || selectedProvince === pCode;
                      const fillColor = colorScale(metricValue);

                      return (
                        <Geography
                          key={geo.rsmKey || geo.id}
                          geography={geo}
                          onClick={() => handleSelectProvinceFocus(pCode)}
                          style={{
                            default: {
                              fill: isHighlighted ? fillColor : '#cbd5e1',
                              stroke: '#64748b',
                              strokeWidth: 0.8,
                              outline: 'none',
                              transition: 'all 250ms ease-out',
                              cursor: 'pointer',
                            },
                            hover: {
                              fill: '#10b981',
                              stroke: '#064e3b',
                              strokeWidth: 1.5,
                              outline: 'none',
                              cursor: 'pointer',
                            },
                            pressed: {
                              fill: '#059669',
                              stroke: '#064e3b',
                              strokeWidth: 1.5,
                              outline: 'none',
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>

                {/* Regional Hotspot Bubbles with Pulse Radiance */}
                {hubStats.map((hub) => {
                  const isSelected = activeHub?.id === hub.id;
                  const radius = Math.max(6, Math.min(20, Math.sqrt(hub.totalValue / 2000000) * 2.5));
                  const isHot = hub.urgentCount > 0;

                  return (
                    <Marker
                      key={hub.id}
                      coordinates={hub.coordinates}
                      onClick={() => setActiveHub(hub)}
                    >
                      {/* Pulse Ring for active or high priority hubs */}
                      <circle
                        r={radius + 8}
                        fill={isHot ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}
                        className="animate-ping"
                      />

                      {/* Outer Glow Halo */}
                      <circle
                        r={radius + 4}
                        fill={isHot ? 'rgba(239, 68, 68, 0.4)' : 'rgba(5, 150, 105, 0.4)'}
                        stroke={isHot ? '#ef4444' : '#059669'}
                        strokeWidth={1}
                      />

                      {/* Main Heat Marker Bubble */}
                      <circle
                        r={radius}
                        fill={isSelected ? '#f59e0b' : isHot ? '#dc2626' : '#047857'}
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="transition-all duration-200 hover:scale-125 cursor-pointer shadow-lg"
                      />

                      {/* Inner count badge */}
                      <text
                        textAnchor="middle"
                        y={3.5}
                        style={{
                          fontFamily: 'system-ui',
                          fill: '#ffffff',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                        }}
                      >
                        {hub.count}
                      </text>

                      {/* Suburb Name Label */}
                      <text
                        textAnchor="middle"
                        y={-radius - 6}
                        style={{
                          fontFamily: 'system-ui',
                          fill: '#0f172a',
                          fontSize: '10px',
                          fontWeight: 700,
                          paintOrder: 'stroke',
                          stroke: '#ffffff',
                          strokeWidth: '3px',
                          strokeLinejoin: 'round',
                          strokeLinecap: 'round',
                          pointerEvents: 'none',
                        }}
                      >
                        {hub.suburb}
                      </text>
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Map Legend Footer */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Territory Heat Density:</span>
              <div className="flex items-center space-x-1">
                <span className="text-[10px]">Low</span>
                <div className="w-20 h-2 rounded-full bg-gradient-to-r from-slate-200 via-emerald-400 to-emerald-700 border border-slate-300 dark:border-slate-700" />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">High Concentration</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white" />
                <span>Active Market</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white animate-pulse" />
                <span>Urgent Inbound</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                <span>Selected Suburb</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Territory Intelligence & Suburb Breakdown */}
        <div className="lg:col-span-4 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{activeHub ? activeHub.name : 'Regional Inbound Leaderboard'}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeHub
                    ? `${activeHub.provinceName} • ${activeHub.count} Registered Inquiries`
                    : 'Ranked by aggregate ZAR buyer pipeline value'}
                </p>
              </div>
              {activeHub && (
                <button
                  onClick={() => setActiveHub(null)}
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  View All Hubs
                </button>
              )}
            </div>

            {/* Active Hub Detail Card (If Clicked) */}
            {activeHub ? (
              <div className="mt-4 space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Total Pipeline:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatCurrency(activeHub.totalValue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Lead Score Avg:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {activeHub.avgScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Deals Won:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {activeHub.dealsWon} ({activeHub.conversionRate}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Top Portal:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-xs truncate block">
                        {activeHub.topSource}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Leads Inquired for {activeHub.suburb}:
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {activeHub.leads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => onSelectLead?.(lead)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">
                            {lead.name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            {formatShortCurrency(lead.dealValue || lead.propertyPrice || 0)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {lead.propertyTitle}
                        </p>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                          <span>{lead.source}</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300 capitalize">
                            {lead.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Hub Leaderboard List */
              <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {hubStats
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .map((hub, idx) => (
                    <div
                      key={hub.id}
                      onClick={() => setActiveHub(hub)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate max-w-[140px]">
                            {hub.name}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-xs">
                          {formatShortCurrency(hub.totalValue)}
                        </span>
                      </div>

                      {/* Sub-metrics bar */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{hub.count} leads</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{hub.dealsWon} won</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 truncate max-w-[90px]">
                          {hub.topSource}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Regional Summary Footer Banner */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>AI Regional Strategic Insight</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-1 leading-relaxed">
              Western Cape (Clifton & Franschhoek) commands 54% of gross pipeline volume, with Property 24 driving 72% of qualified cash inquiries. Sandton and Rosebank show the fastest 15-minute response conversion rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
