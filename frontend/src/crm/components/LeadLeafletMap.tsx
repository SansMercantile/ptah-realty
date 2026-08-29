import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  MapPin, 
  Building, 
  Flame, 
  DollarSign, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  Filter, 
  ShieldCheck, 
  Maximize2,
  Minimize2,
  Compass,
  CheckCircle2,
  Users,
  Activity,
  Sliders,
  Radio,
  Zap,
  TrendingUp,
  Info
} from 'lucide-react';
import { Lead, LeadSource } from '../types';
import { formatCurrency, formatShortCurrency } from '../utils/formatters';

// CARTO's basemaps.cartocdn.com raster tiles now require an API key (else
// tiles render with a repeated "API key required" watermark -- see
// https://carto.com/basemaps/apikey). Same fix already applied to
// RealCadastreMap.tsx: append as a `key` query param per CARTO's own
// integration docs, using the Ptah-Realty-scoped key from env.
const CARTO_MAPS_API_KEY = import.meta.env.VITE_CARTO_MAPS_API_KEY as string | undefined;
const CARTO_TILE_KEY_PARAM = CARTO_MAPS_API_KEY ? `?key=${CARTO_MAPS_API_KEY}` : '';

interface LeadLeafletMapProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
  defaultVisualizationMode?: 'pins' | 'heatmap' | 'hybrid';
}

// Available Tile Layers for Real Basemaps & Cadastral Overlays
type BasemapType = 'streets' | 'satellite' | 'cadastral' | 'dark';
type VisualizationMode = 'pins' | 'heatmap' | 'hybrid';
type HeatWeightMetric = 'volume' | 'value' | 'urgency';
type HeatRadiusMode = 'compact' | 'standard' | 'broad';

interface CadastralParcel {
  id: string;
  erfNumber: string;
  suburb: string;
  zoning: string; // e.g., 'SR1 (Single Residential)', 'GR2 (General Residential)', 'C1 (Commercial)'
  areaM2: number;
  marketValuation: number;
  center: [number, number]; // [lat, lng]
  polygon: [number, number][]; // [[lat, lng], ...]
  matchedLeadIds: string[];
}

// Pre-mapped South Africa Luxury Property Cadastral Parcels
const CADASTRAL_PARCELS: CadastralParcel[] = [
  {
    id: 'cad-clifton-1',
    erfNumber: 'ERF 402 Clifton',
    suburb: 'Clifton 4th Beach',
    zoning: 'SR1 (Single Residential Luxury)',
    areaM2: 850,
    marketValuation: 42500000,
    center: [-33.9382, 18.3751],
    polygon: [
      [-33.9377, 18.3745],
      [-33.9378, 18.3758],
      [-33.9388, 18.3756],
      [-33.9386, 18.3743]
    ],
    matchedLeadIds: ['lead-1', 'lead-6']
  },
  {
    id: 'cad-camps-bay-1',
    erfNumber: 'ERF 1208 Camps Bay',
    suburb: 'Camps Bay Seaboard',
    zoning: 'GR2 (General Residential / Boutique Villa)',
    areaM2: 1200,
    marketValuation: 28500000,
    center: [-33.9510, 18.3780],
    polygon: [
      [-33.9502, 18.3772],
      [-33.9505, 18.3790],
      [-33.9518, 18.3788],
      [-33.9515, 18.3770]
    ],
    matchedLeadIds: ['lead-3']
  },
  {
    id: 'cad-bantry-1',
    erfNumber: 'ERF 671 Bantry Bay',
    suburb: 'Bantry Bay Ocean Ridge',
    zoning: 'SR1 (Single Residential Luxury)',
    areaM2: 720,
    marketValuation: 35000000,
    center: [-33.9280, 18.3820],
    polygon: [
      [-33.9272, 18.3812],
      [-33.9276, 18.3828],
      [-33.9288, 18.3826],
      [-33.9284, 18.3810]
    ],
    matchedLeadIds: []
  },
  {
    id: 'cad-sandhurst-1',
    erfNumber: 'Stand 89 Sandhurst Ext 4',
    suburb: 'Sandhurst, Sandton',
    zoning: 'SR1 (Exclusive Residential Estate)',
    areaM2: 4500,
    marketValuation: 38000000,
    center: [-26.1100, 28.0400],
    polygon: [
      [-26.1088, 28.0385],
      [-26.1092, 28.0415],
      [-26.1112, 28.0410],
      [-26.1108, 28.0380]
    ],
    matchedLeadIds: ['lead-2']
  },
  {
    id: 'cad-rosebank-1',
    erfNumber: 'Stand 212 Rosebank CBD',
    suburb: 'Rosebank Central',
    zoning: 'C1 / Mixed High Density (Penthouses)',
    areaM2: 1800,
    marketValuation: 22000000,
    center: [-26.1450, 28.0440],
    polygon: [
      [-26.1440, 28.0428],
      [-26.1444, 28.0452],
      [-26.1460, 28.0448],
      [-26.1456, 28.0424]
    ],
    matchedLeadIds: ['lead-7']
  },
  {
    id: 'cad-steyn-1',
    erfNumber: 'Erf 304 Steyn City Parkland',
    suburb: 'Steyn City Eco-Estate',
    zoning: 'SR1 (Golf Estate / Parkland Villa)',
    areaM2: 2100,
    marketValuation: 24500000,
    center: [-25.9850, 27.9950],
    polygon: [
      [-25.9838, 27.9935],
      [-25.9842, 27.9965],
      [-25.9862, 27.9960],
      [-25.9858, 27.9930]
    ],
    matchedLeadIds: ['lead-5']
  },
  {
    id: 'cad-franschhoek-1',
    erfNumber: 'Portion 14 Farm Huguenot',
    suburb: 'Franschhoek Valley',
    zoning: 'Agri-1 (Historic Wine & Olive Estate)',
    areaM2: 85000,
    marketValuation: 55000000,
    center: [-33.9100, 19.1240],
    polygon: [
      [-33.9075, 19.1210],
      [-33.9085, 19.1270],
      [-33.9125, 19.1260],
      [-33.9115, 19.1200]
    ],
    matchedLeadIds: ['lead-4']
  },
  {
    id: 'cad-umhlanga-1',
    erfNumber: 'Erf 901 Umhlanga Rocks',
    suburb: 'Umhlanga Ridgeside',
    zoning: 'GR3 (Luxury Oceanfront Suites)',
    areaM2: 2400,
    marketValuation: 19500000,
    center: [-29.7280, 31.0850],
    polygon: [
      [-29.7268, 31.0838],
      [-29.7272, 31.0862],
      [-29.7292, 31.0858],
      [-29.7288, 31.0834]
    ],
    matchedLeadIds: ['lead-8']
  }
];

// Coordinate locator for lead locations across South Africa
function getLeadCoordinates(lead: Lead, index: number): [number, number] {
  const loc = (lead.propertyLocation || '').toLowerCase();
  const title = (lead.propertyTitle || '').toLowerCase();

  // Deterministic slight offset based on index so markers on same suburb don't overlap completely
  const jitterLat = ((index % 5) - 2) * 0.0018;
  const jitterLng = (((index * 3) % 5) - 2) * 0.0018;

  if (loc.includes('clifton') || title.includes('clifton')) {
    return [-33.9382 + jitterLat, 18.3751 + jitterLng];
  }
  if (loc.includes('camps bay') || title.includes('camps bay')) {
    return [-33.9510 + jitterLat, 18.3780 + jitterLng];
  }
  if (loc.includes('bantry bay') || loc.includes('fresnaye') || title.includes('bantry')) {
    return [-33.9280 + jitterLat, 18.3820 + jitterLng];
  }
  if (loc.includes('franschhoek') || loc.includes('stellenbosch') || loc.includes('winelands')) {
    return [-33.9100 + jitterLat, 19.1240 + jitterLng];
  }
  if (loc.includes('durbanville') || loc.includes('bellville') || loc.includes('kenridge')) {
    return [-33.8340 + jitterLat, 18.6480 + jitterLng];
  }
  if (loc.includes('sandhurst') || (loc.includes('sandton') && !loc.includes('rosebank'))) {
    return [-26.1100 + jitterLat, 28.0400 + jitterLng];
  }
  if (loc.includes('rosebank') || loc.includes('houghton') || loc.includes('parkhurst') || loc.includes('melrose')) {
    return [-26.1450 + jitterLat, 28.0440 + jitterLng];
  }
  if (loc.includes('steyn city') || loc.includes('midrand') || loc.includes('waterfall') || loc.includes('fourways')) {
    return [-25.9850 + jitterLat, 27.9950 + jitterLng];
  }
  if (loc.includes('pretoria') || loc.includes('waterkloof') || loc.includes('menlyn')) {
    return [-25.7750 + jitterLat, 28.2450 + jitterLng];
  }
  if (loc.includes('umhlanga') || loc.includes('durban') || loc.includes('ballito') || loc.includes('zimbali')) {
    return [-29.7280 + jitterLat, 31.0850 + jitterLng];
  }
  if (loc.includes('plettenberg') || loc.includes('knysna') || loc.includes('garden route') || loc.includes('george')) {
    return [-34.0520 + jitterLat, 23.3710 + jitterLng];
  }

  // General Western Cape / Cape Town fallback
  return [-33.9249 + jitterLat, 18.4241 + jitterLng];
}

// Territory Clusters for South Africa Luxury Corridors
interface TerritoryCluster {
  id: string;
  name: string;
  province: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  description: string;
}

const TERRITORY_CLUSTERS: TerritoryCluster[] = [
  {
    id: 'cluster-all',
    name: 'South Africa National Overview',
    province: 'All Provinces',
    center: [-29.0, 24.5],
    zoom: 6,
    description: 'Macro syndication across Western Cape, Gauteng, and KwaZulu-Natal corridors.'
  },
  {
    id: 'cluster-atlantic-seaboard',
    name: 'Atlantic Seaboard & Clifton',
    province: 'Western Cape',
    center: [-33.938, 18.378],
    zoom: 14,
    description: 'Ultra-prime coastal strip: Clifton 4th, Camps Bay, Bantry Bay, and Fresnaye.'
  },
  {
    id: 'cluster-sandton-sandhurst',
    name: 'Sandton & Sandhurst Luxury Belt',
    province: 'Gauteng',
    center: [-26.115, 28.042],
    zoom: 14,
    description: "Africa's richest square mile, Sandhurst mansions, and Rosebank high-rise penthouses."
  },
  {
    id: 'cluster-franschhoek',
    name: 'Franschhoek & Winelands Estates',
    province: 'Western Cape',
    center: [-33.910, 19.124],
    zoom: 13,
    description: 'Boutique wine farms, equestrian estates, and historic French Huguenot valley properties.'
  },
  {
    id: 'cluster-umhlanga-kzn',
    name: 'Umhlanga Ridgeside & Durban Coast',
    province: 'KwaZulu-Natal',
    center: [-29.728, 31.085],
    zoom: 14,
    description: 'Indian Ocean subtropical coastal luxury, Zimbali golf estates, and oceanfront penthouses.'
  },
  {
    id: 'cluster-steyn-city',
    name: 'Steyn City & Midrand Eco-Estates',
    province: 'Gauteng',
    center: [-25.985, 27.995],
    zoom: 14,
    description: '2000-acre parkland luxury, helipads, championship Nicklaus golf course.'
  }
];

// Helper: Build a 256-color thermal heatmap color lookup table
function createHeatmapGradientLookup(): Uint8ClampedArray {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Uint8ClampedArray(256 * 4);

  const grad = ctx.createLinearGradient(0, 0, 256, 1);
  grad.addColorStop(0.0, 'rgba(0, 0, 255, 0)');
  grad.addColorStop(0.15, 'rgba(0, 120, 255, 0.45)');
  grad.addColorStop(0.35, 'rgba(0, 220, 210, 0.7)');
  grad.addColorStop(0.55, 'rgba(34, 197, 94, 0.85)');
  grad.addColorStop(0.75, 'rgba(234, 179, 8, 0.92)');
  grad.addColorStop(0.90, 'rgba(249, 115, 22, 0.96)');
  grad.addColorStop(1.0, 'rgba(220, 38, 38, 0.99)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

export const LeadLeafletMap: React.FC<LeadLeafletMapProps> = ({ 
  leads, 
  onSelectLead,
  defaultVisualizationMode = 'pins'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const cadastralLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const densityHeatLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapHotspotsGroupRef = useRef<L.LayerGroup | null>(null);
  const canvasHeatmapRef = useRef<HTMLCanvasElement | null>(null);
  const gradientLookupRef = useRef<Uint8ClampedArray | null>(null);

  // States
  const [basemapType, setBasemapType] = useState<BasemapType>('cadastral');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(defaultVisualizationMode);
  const [heatWeightMetric, setHeatWeightMetric] = useState<HeatWeightMetric>('volume');
  const [heatRadiusMode, setHeatRadiusMode] = useState<HeatRadiusMode>('standard');
  const [heatIntensity, setHeatIntensity] = useState<number>(0.85); // 0.5 to 1.3
  const [showCadastralParcels, setShowCadastralParcels] = useState(true);
  const [showHeatRadiance, setShowHeatRadiance] = useState(true);
  const [selectedTerritory, setSelectedTerritory] = useState<string>('cluster-all');
  const [selectedPortal, setSelectedPortal] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [activeParcelDetails, setActiveParcelDetails] = useState<CadastralParcel | null>(null);
  const [activeLeadDetails, setActiveLeadDetails] = useState<Lead | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize gradient lookup table
  useEffect(() => {
    gradientLookupRef.current = createHeatmapGradientLookup();
  }, []);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (selectedPortal !== 'all' && lead.source !== selectedPortal) return false;
      if (selectedUrgency !== 'all' && lead.urgency !== selectedUrgency) return false;
      return true;
    });
  }, [leads, selectedPortal, selectedUrgency]);

  // Aggregate stats
  const totalMapPipelineValue = useMemo(() => {
    return filteredLeads.reduce((acc, l) => acc + (l.dealValue || l.propertyPrice || 0), 0);
  }, [filteredLeads]);

  const urgentCount = useMemo(() => {
    return filteredLeads.filter((l) => l.urgency === 'urgent').length;
  }, [filteredLeads]);

  // Regional demand concentration for top node callout
  const regionalDemandSummary = useMemo(() => {
    const nodes: Record<string, { count: number; value: number; urgent: number; name: string; center: [number, number] }> = {
      'atlantic-seaboard': { count: 0, value: 0, urgent: 0, name: 'Atlantic Seaboard & Clifton', center: [-33.938, 18.378] },
      'sandton': { count: 0, value: 0, urgent: 0, name: 'Sandton & Sandhurst Luxury Belt', center: [-26.115, 28.042] },
      'franschhoek': { count: 0, value: 0, urgent: 0, name: 'Franschhoek Winelands', center: [-33.910, 19.124] },
      'umhlanga': { count: 0, value: 0, urgent: 0, name: 'Umhlanga Ridgeside (KZN)', center: [-29.728, 31.085] },
      'steyn-city': { count: 0, value: 0, urgent: 0, name: 'Steyn City Eco-Estate', center: [-25.985, 27.995] }
    };

    filteredLeads.forEach((lead) => {
      const loc = (lead.propertyLocation + ' ' + lead.propertyTitle).toLowerCase();
      const val = lead.dealValue || lead.propertyPrice || 0;
      const isUrg = lead.urgency === 'urgent' ? 1 : 0;

      if (loc.includes('clifton') || loc.includes('camps bay') || loc.includes('bantry') || loc.includes('fresnaye') || loc.includes('atlantic')) {
        nodes['atlantic-seaboard'].count += 1;
        nodes['atlantic-seaboard'].value += val;
        nodes['atlantic-seaboard'].urgent += isUrg;
      } else if (loc.includes('sandhurst') || loc.includes('sandton') || loc.includes('rosebank') || loc.includes('houghton')) {
        nodes['sandton'].count += 1;
        nodes['sandton'].value += val;
        nodes['sandton'].urgent += isUrg;
      } else if (loc.includes('franschhoek') || loc.includes('stellenbosch') || loc.includes('winelands')) {
        nodes['franschhoek'].count += 1;
        nodes['franschhoek'].value += val;
        nodes['franschhoek'].urgent += isUrg;
      } else if (loc.includes('umhlanga') || loc.includes('durban') || loc.includes('ballito') || loc.includes('zimbali')) {
        nodes['umhlanga'].count += 1;
        nodes['umhlanga'].value += val;
        nodes['umhlanga'].urgent += isUrg;
      } else {
        nodes['steyn-city'].count += 1;
        nodes['steyn-city'].value += val;
        nodes['steyn-city'].urgent += isUrg;
      }
    });

    const sortedNodes = Object.entries(nodes).sort((a, b) => b[1].count - a[1].count || b[1].value - a[1].value);
    // Adds `id` here too (from the same entry's key) -- the demo's original
    // topNode pulled the raw pre-mapped value (sortedNodes[0]?.[1]), which
    // never had `id` at all; only allNodes' own .map() step below added it.
    // That real mismatch (not just the fallback below) is what the repo's
    // stricter tsconfig caught at the node.id comparison further down.
    const topNode = sortedNodes[0] ? { id: sortedNodes[0][0], ...sortedNodes[0][1] } : undefined;
    return {
      allNodes: sortedNodes.map(([key, data]) => ({ id: key, ...data })),
      topNode: topNode || { id: 'national-overview', name: 'National Overview', count: filteredLeads.length, value: totalMapPipelineValue, urgent: urgentCount, center: [-29.0, 24.5] as [number, number] }
    };
  }, [filteredLeads, totalMapPipelineValue, urgentCount]);

  // Tile layer URL helper
  const getTileLayerConfig = (type: BasemapType) => {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri &mdash; High-Res Satellite RealMap',
          maxZoom: 19
        };
      case 'cadastral':
        // High-contrast clean street basemap with crisp building footprints & parcel clarity
        return {
          url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${CARTO_TILE_KEY_PARAM}`,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> Cadastral / Basemap',
          maxZoom: 20
        };
      case 'dark':
        return {
          url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${CARTO_TILE_KEY_PARAM}`,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> Dark Luxury',
          maxZoom: 19
        };
      case 'streets':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        };
    }
  };

  // Draw smooth continuous canvas heatmap overlay
  const renderCanvasHeatmap = useCallback(() => {
    const map = mapInstanceRef.current;
    const canvas = canvasHeatmapRef.current;
    if (!map || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (visualizationMode === 'pins') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const size = map.getSize();
    if (canvas.width !== size.x || canvas.height !== size.y) {
      canvas.width = size.x;
      canvas.height = size.y;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (filteredLeads.length === 0) return;

    // Create an offscreen alpha canvas for Gaussian points
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    const currentZoom = map.getZoom();
    const baseRadiusPx = heatRadiusMode === 'compact' ? 32 : heatRadiusMode === 'broad' ? 75 : 50;
    const dynamicRadius = Math.max(22, Math.min(130, baseRadiusPx * Math.pow(1.18, currentZoom - 7)));

    // 1. Draw black radial gradient spots onto offscreen alpha buffer
    filteredLeads.forEach((lead, idx) => {
      const coords = getLeadCoordinates(lead, idx);
      const pt = map.latLngToContainerPoint(L.latLng(coords[0], coords[1]));

      // Skip points far outside visible container
      if (pt.x < -dynamicRadius || pt.x > size.x + dynamicRadius || pt.y < -dynamicRadius || pt.y > size.y + dynamicRadius) {
        return;
      }

      // Compute point weight based on selected metric
      let weight = 0.65;
      if (heatWeightMetric === 'value') {
        const val = lead.dealValue || lead.propertyPrice || 10000000;
        weight = Math.min(1.0, Math.max(0.35, val / 35000000));
      } else if (heatWeightMetric === 'urgency') {
        weight = lead.urgency === 'urgent' ? 1.0 : lead.urgency === 'high' ? 0.75 : 0.45;
      } else {
        weight = 0.7;
      }

      const effectiveAlpha = Math.min(1.0, weight * heatIntensity);

      const radGrad = offCtx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, dynamicRadius);
      radGrad.addColorStop(0, `rgba(0, 0, 0, ${effectiveAlpha})`);
      radGrad.addColorStop(0.35, `rgba(0, 0, 0, ${effectiveAlpha * 0.75})`);
      radGrad.addColorStop(0.7, `rgba(0, 0, 0, ${effectiveAlpha * 0.3})`);
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      offCtx.fillStyle = radGrad;
      offCtx.beginPath();
      offCtx.arc(pt.x, pt.y, dynamicRadius, 0, Math.PI * 2);
      offCtx.fill();
    });

    // 2. Colorize alpha buffer into real thermal spectrum via lookup table
    const imgData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const gradData = gradientLookupRef.current;

    if (gradData) {
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          const lutIndex = alpha * 4;
          data[i] = gradData[lutIndex];         // R
          data[i + 1] = gradData[lutIndex + 1]; // G
          data[i + 2] = gradData[lutIndex + 2]; // B
          data[i + 3] = Math.min(255, Math.floor(gradData[lutIndex + 3] * (alpha / 255) * 1.3)); // Scaled opacity
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [filteredLeads, visualizationMode, heatWeightMetric, heatRadiusMode, heatIntensity]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid duplicate initialization
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-29.0, 24.5],
        zoom: 6,
        zoomControl: false,
        attributionControl: true
      });

      // Layer groups for clean toggling
      const cadastralGroup = L.layerGroup().addTo(map);
      const densityGroup = L.layerGroup().addTo(map);
      const heatmapHotspotsGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      cadastralLayerGroupRef.current = cadastralGroup;
      densityHeatLayerGroupRef.current = densityGroup;
      heatmapHotspotsGroupRef.current = heatmapHotspotsGroup;
      markersLayerGroupRef.current = markersGroup;

      // Base tile layer
      const tileConfig = getTileLayerConfig(basemapType);
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Create and attach custom Canvas element for Heatmap
      const overlayPane = map.getPanes().overlayPane;
      const canvas = document.createElement('canvas');
      canvas.className = 'leaflet-canvas-heatmap-layer pointer-events-none';
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.zIndex = '250';
      overlayPane.appendChild(canvas);
      canvasHeatmapRef.current = canvas;

      // Reposition canvas on map events
      const updateCanvasPosition = () => {
        const topLeft = map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(canvas, topLeft);
        renderCanvasHeatmap();
      };

      map.on('move', updateCanvasPosition);
      map.on('moveend', updateCanvasPosition);
      map.on('zoomend', updateCanvasPosition);
      map.on('resize', updateCanvasPosition);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Layer when basemapType changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const tileConfig = getTileLayerConfig(basemapType);
    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [basemapType]);

  // Trigger canvas heatmap re-render whenever dependencies change
  useEffect(() => {
    renderCanvasHeatmap();
  }, [renderCanvasHeatmap]);

  // Render Markers, Density Clusters & Cadastral Parcels
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const markersGroup = markersLayerGroupRef.current;
    const densityGroup = densityHeatLayerGroupRef.current;
    const cadastralGroup = cadastralLayerGroupRef.current;
    const hotspotsGroup = heatmapHotspotsGroupRef.current;

    if (markersGroup) markersGroup.clearLayers();
    if (densityGroup) densityGroup.clearLayers();
    if (cadastralGroup) cadastralGroup.clearLayers();
    if (hotspotsGroup) hotspotsGroup.clearLayers();

    // 1. CADASTRAL PARCELS OVERLAY
    if (showCadastralParcels && cadastralGroup) {
      CADASTRAL_PARCELS.forEach((parcel) => {
        const polygon = L.polygon(parcel.polygon, {
          color: basemapType === 'dark' ? '#10b981' : '#059669',
          weight: 2,
          opacity: 0.85,
          dashArray: '4, 4',
          fillColor: basemapType === 'satellite' ? '#10b981' : '#34d399',
          fillOpacity: basemapType === 'satellite' ? 0.25 : 0.18
        });

        polygon.on('click', () => {
          setActiveParcelDetails(parcel);
          map.flyTo(parcel.center, 16, { duration: 1.2 });
        });

        polygon.bindTooltip(
          `<div class="text-[11px] font-sans font-semibold p-1">
            <div class="text-emerald-800 dark:text-emerald-400 font-bold">${parcel.erfNumber}</div>
            <div class="text-slate-600 dark:text-slate-300 text-[10px]">${parcel.zoning}</div>
            <div class="text-slate-500 font-mono text-[9px]">${parcel.areaM2.toLocaleString()} m² • Valued ${formatShortCurrency(parcel.marketValuation)}</div>
          </div>`,
          { sticky: true, opacity: 0.95 }
        );

        polygon.addTo(cadastralGroup);
      });
    }

    // 2. RADIAL DENSITY CIRCLES (If enabled in Pins or Hybrid mode)
    if (showHeatRadiance && densityGroup && visualizationMode !== 'heatmap') {
      const suburbDensities = [
        { center: [-33.9382, 18.3751] as [number, number], name: 'Clifton Atlantic Seaboard', radius: 1400, density: 'High Concentration', color: '#ef4444' },
        { center: [-33.9510, 18.3780] as [number, number], name: 'Camps Bay Coast', radius: 1600, density: 'High Concentration', color: '#f59e0b' },
        { center: [-26.1100, 28.0400] as [number, number], name: 'Sandhurst & Sandton CBD', radius: 2200, density: 'Dense Buyer Demand', color: '#10b981' },
        { center: [-26.1450, 28.0440] as [number, number], name: 'Rosebank Luxury Belt', radius: 1800, density: 'Active Inflow', color: '#06b6d4' },
        { center: [-33.9100, 19.1240] as [number, number], name: 'Franschhoek Winelands', radius: 3200, density: 'High Value Estates', color: '#8b5cf6' },
        { center: [-29.7280, 31.0850] as [number, number], name: 'Umhlanga Subtropical Coast', radius: 2000, density: 'Coastal Inquiries', color: '#3b82f6' },
        { center: [-25.9850, 27.9950] as [number, number], name: 'Steyn City Eco-Estate', radius: 2500, density: 'Eco-Estate Demand', color: '#10b981' }
      ];

      suburbDensities.forEach((sd) => {
        const circle = L.circle(sd.center, {
          radius: sd.radius,
          color: sd.color,
          weight: 1.2,
          fillColor: sd.color,
          fillOpacity: 0.12
        });

        circle.bindTooltip(
          `<div class="text-[10px] font-sans font-medium text-slate-800"><strong>${sd.name}</strong><br/>Cluster: ${sd.density}</div>`,
          { sticky: true }
        );

        circle.addTo(densityGroup);
      });
    }

    // 3. HEATMAP HOTSPOT LABELS / FOCAL HUBS (Rendered in Heatmap mode)
    if (visualizationMode === 'heatmap' && hotspotsGroup) {
      regionalDemandSummary.allNodes.forEach((node) => {
        if (node.count === 0) return;

        const isPeak = node.id === regionalDemandSummary.topNode.id;
        const hotspotHtml = `
          <div class="group cursor-pointer transform transition-transform hover:scale-115">
            <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full shadow-xl border backdrop-blur-md ${
              isPeak 
                ? 'bg-red-600/90 border-white text-white ring-2 ring-red-400/50 animate-pulse'
                : 'bg-slate-900/90 border-amber-400 text-amber-200'
            }">
              <span class="w-2 h-2 rounded-full ${isPeak ? 'bg-white animate-ping' : 'bg-amber-400'}"></span>
              <span class="text-[10px] font-extrabold font-mono tracking-tight">${node.name.split(' ')[0]}: ${node.count} Leads</span>
            </div>
          </div>
        `;

        const hotspotIcon = L.divIcon({
          html: hotspotHtml,
          className: 'custom-heatmap-hub-pin',
          iconSize: [120, 26],
          iconAnchor: [60, 13]
        });

        const marker = L.marker(node.center, { icon: hotspotIcon });
        marker.bindPopup(`
          <div class="p-2.5 max-w-[240px] font-sans">
            <div class="flex items-center justify-between text-[10px] pb-1 border-b border-slate-200 mb-1.5">
              <span class="font-bold text-red-600 uppercase tracking-wider">Demand Hotspot Node</span>
              <span class="font-mono text-slate-500">${node.count} active inquiries</span>
            </div>
            <div class="font-bold text-xs text-slate-900 mb-1">${node.name}</div>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2 space-y-1 text-[11px]">
              <div class="flex justify-between">
                <span class="text-slate-500">Pipeline Demand:</span>
                <span class="font-bold text-emerald-700 font-mono">${formatShortCurrency(node.value)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">High-Intent Leads:</span>
                <span class="font-bold text-red-600 font-mono">${node.urgent} HOT</span>
              </div>
            </div>
            <div class="text-[10px] text-slate-500 italic">
              Click to zoom into this luxury corridor for parcel and buyer details.
            </div>
          </div>
        `);

        marker.on('click', () => {
          map.flyTo(node.center, 14, { duration: 1.2 });
        });

        marker.addTo(hotspotsGroup);
      });
    }

    // 4. INDIVIDUAL PIN MARKERS (Rendered in Pins or Hybrid mode)
    if (markersGroup && (visualizationMode === 'pins' || visualizationMode === 'hybrid')) {
      filteredLeads.forEach((lead, idx) => {
        const coords = getLeadCoordinates(lead, idx);
        const isUrgent = lead.urgency === 'urgent';
        const priceFormatted = formatShortCurrency(lead.propertyPrice);

        // Custom HTML DivIcon for Luxury Real Estate Pin
        const iconHtml = `
          <div class="relative group cursor-pointer transform transition-transform hover:scale-125 duration-200">
            ${isUrgent ? '<div class="absolute -inset-1 rounded-full bg-red-500/40 animate-ping"></div>' : ''}
            <div class="relative flex items-center space-x-1 px-2 py-1 rounded-full shadow-lg border ${
              isUrgent
                ? 'bg-red-600 border-white text-white'
                : lead.status === 'deal_won'
                ? 'bg-emerald-600 border-white text-white'
                : 'bg-slate-900 border-emerald-400 text-white'
            }">
              <span class="w-2 h-2 rounded-full ${isUrgent ? 'bg-amber-300' : 'bg-emerald-400'}"></span>
              <span class="text-[10px] font-black tracking-tight font-mono">${priceFormatted}</span>
            </div>
            <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] ${
              isUrgent ? 'border-t-red-600' : lead.status === 'deal_won' ? 'border-t-emerald-600' : 'border-t-slate-900'
            } mx-auto"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-lead-marker-pin',
          iconSize: [60, 30],
          iconAnchor: [30, 28]
        });

        const marker = L.marker(coords, { icon: customIcon });

        // Popup content on marker
        const popupContent = `
          <div class="p-2.5 max-w-[260px] font-sans">
            <div class="flex items-center justify-between text-[10px] pb-1 border-b border-slate-200 mb-1.5">
              <span class="font-bold text-emerald-700 uppercase tracking-wider">${lead.source}</span>
              <span class="font-mono text-slate-500">${lead.referenceNumber}</span>
            </div>
            <div class="font-bold text-xs text-slate-900 mb-0.5 line-clamp-1">${lead.name}</div>
            <div class="text-[11px] text-slate-600 mb-1.5 line-clamp-1">${lead.propertyTitle}</div>
            <div class="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100 mb-2">
              <span class="text-slate-500">Valuation:</span>
              <span class="font-bold text-emerald-700">${formatCurrency(lead.propertyPrice)}</span>
            </div>
            <div class="text-[10px] text-slate-500 mb-2 flex items-center justify-between">
              <span>Agent: ${lead.assignedAgent.name}</span>
              <span class="font-semibold text-slate-700 capitalize">${lead.status.replace('_', ' ')}</span>
            </div>
            <button id="view-lead-btn-${lead.id}" class="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition text-center shadow-xs cursor-pointer">
              Open Full Lead Dossier
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: 'luxury-map-popup'
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-lead-btn-${lead.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectLead?.(lead);
              setActiveLeadDetails(lead);
            };
          }
        });

        marker.on('click', () => {
          setActiveLeadDetails(lead);
        });

        marker.addTo(markersGroup);
      });
    }
  }, [
    filteredLeads, 
    showCadastralParcels, 
    showHeatRadiance, 
    basemapType, 
    visualizationMode, 
    regionalDemandSummary, 
    onSelectLead
  ]);

  // Jump to territory cluster
  const handleJumpTerritory = (clusterId: string) => {
    setSelectedTerritory(clusterId);
    const cluster = TERRITORY_CLUSTERS.find((c) => c.id === clusterId);
    if (cluster && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(cluster.center, cluster.zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetMap = () => {
    handleJumpTerritory('cluster-all');
    setActiveParcelDetails(null);
    setActiveLeadDetails(null);
  };

  return (
    <div className={`relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg transition-all ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full min-h-[580px]'
    }`}>
      {/* 1. TOP HEADER & MAP VISUALIZATION TOGGLE CONTROLS BAR */}
      <div className="p-3.5 sm:p-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white flex flex-col xl:flex-row xl:items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Cadastral RealMap & Buyer Demand Heat Density Visualizer
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Leaflet GIS Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Switch between discrete luxury pin locations and continuous Gaussian thermal heatmaps to uncover territory demand density.
            </p>
          </div>
        </div>

        {/* Action Controls: Map Visualization Mode + Basemap Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PRIMARY TOGGLE: PINS VS HEAT MAP VS HYBRID */}
          <div className="flex items-center bg-emerald-950/80 p-1 rounded-xl border border-emerald-500/40 text-xs shadow-inner">
            <button
              onClick={() => setVisualizationMode('pins')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                visualizationMode === 'pins'
                  ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-white/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="View discrete property pin markers with prices and urgency pulses"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map Pins</span>
            </button>

            <button
              onClick={() => setVisualizationMode('heatmap')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                visualizationMode === 'heatmap'
                  ? 'bg-red-500 text-white shadow-md ring-1 ring-white/50 animate-pulse'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="View continuous thermal heat map representing buyer demand density"
            >
              <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>Heat Map Density</span>
            </button>

            <button
              onClick={() => setVisualizationMode('hybrid')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                visualizationMode === 'hybrid'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-white/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Overlay both thermal heat map radiance and individual pins"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Hybrid Overlay</span>
            </button>
          </div>

          {/* Basemap Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs shadow-inner">
            <button
              onClick={() => setBasemapType('cadastral')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center space-x-1 ${
                basemapType === 'cadastral'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Clean Street Basemap with Cadastral Land Parcel Overlay"
            >
              <Building className="w-3 h-3" />
              <span>Cadastral</span>
            </button>

            <button
              onClick={() => setBasemapType('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center space-x-1 ${
                basemapType === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="High-Resolution Esri Satellite RealMap"
            >
              <Layers className="w-3 h-3" />
              <span>Satellite</span>
            </button>

            <button
              onClick={() => setBasemapType('dark')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center space-x-1 ${
                basemapType === 'dark'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Dark Luxury Carto Map"
            >
              <span>Dark</span>
            </button>
          </div>

          {/* Portal Filter */}
          <select
            value={selectedPortal}
            onChange={(e) => setSelectedPortal(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
          >
            <option value="all">All Syndication Portals</option>
            <option value="Property 24">Property 24</option>
            <option value="Private Property">Private Property</option>
            <option value="Ptah Realty Website">Ptah Website</option>
            <option value="Facebook / Instagram Ads">Meta Ads</option>
          </select>

          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC HEATMAP CONTROLS & TERRITORY JUMP STRIP */}
      <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10 relative">
        {/* Left: Territory Quick-Jump Buttons */}
        <div className="flex items-center space-x-1.5 text-xs whitespace-nowrap overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Territory:</span>
          </span>
          {TERRITORY_CLUSTERS.map((cl) => {
            const isSelected = selectedTerritory === cl.id;
            return (
              <button
                key={cl.id}
                onClick={() => handleJumpTerritory(cl.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                {cl.name}
              </button>
            );
          })}
        </div>

        {/* Right: Heatmap Fine-Tuning Controls (Visible in Heat Map or Hybrid mode) */}
        {(visualizationMode === 'heatmap' || visualizationMode === 'hybrid') ? (
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
            {/* Heat Weight Metric Selector */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 px-1 font-semibold">Weight:</span>
              <button
                onClick={() => setHeatWeightMetric('volume')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  heatWeightMetric === 'volume' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Volume
              </button>
              <button
                onClick={() => setHeatWeightMetric('value')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  heatWeightMetric === 'value' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Valuation (ZAR)
              </button>
              <button
                onClick={() => setHeatWeightMetric('urgency')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  heatWeightMetric === 'urgency' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hot Priority
              </button>
            </div>

            {/* Heat Radius Selector */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 px-1 font-semibold">Radius:</span>
              {(['compact', 'standard', 'broad'] as HeatRadiusMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setHeatRadiusMode(mode)}
                  className={`px-2 py-0.5 rounded text-[10px] capitalize transition ${
                    heatRadiusMode === mode ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Intensity Level Slider */}
            <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold">Intensity:</span>
              <input
                type="range"
                min="0.4"
                max="1.4"
                step="0.1"
                value={heatIntensity}
                onChange={(e) => setHeatIntensity(parseFloat(e.target.value))}
                className="w-16 accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                title="Adjust Heatmap Thermal Density Gain"
              />
              <span className="text-[10px] font-mono text-emerald-400">{Math.round(heatIntensity * 100)}%</span>
            </div>
          </div>
        ) : (
          /* Standard Feature Toggles when in Pins Mode */
          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <label className="flex items-center space-x-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCadastralParcels}
                onChange={(e) => setShowCadastralParcels(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-emerald-400">Cadastral Parcels</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showHeatRadiance}
                onChange={(e) => setShowHeatRadiance(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-amber-400">Density Radiance</span>
            </label>
          </div>
        )}
      </div>

      {/* 3. MAIN LEAFLET MAP CANVAS CONTAINER */}
      <div className="relative w-full h-[480px] sm:h-[560px]">
        {/* Leaflet Map Target DOM */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Zoom & Reset Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetMap}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            title="Reset to Full Country View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Left: Live Cluster & Heat Density Stats HUD */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl max-w-xs text-xs text-white">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5">
              {visualizationMode === 'heatmap' ? (
                <Flame className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {visualizationMode === 'heatmap' ? 'Heatmap Demand Density' : 'Territory Inbound Metrics'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">{filteredLeads.length} Leads</span>
          </div>

          <div className="space-y-1.5">
            {/* Peak Demand Territory Indicator */}
            <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/70">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Peak Demand Node:</span>
                <span className="text-red-400 font-bold font-mono">
                  {regionalDemandSummary.topNode.urgent} HOT
                </span>
              </div>
              <div className="font-extrabold text-white text-[11px] truncate mt-0.5 flex items-center justify-between">
                <span className="truncate">{regionalDemandSummary.topNode.name}</span>
                <span className="text-emerald-400 font-mono shrink-0 ml-1">{regionalDemandSummary.topNode.count} inquiries</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Active Pipeline:</span>
                <span className="font-bold text-emerald-400 font-mono">{formatShortCurrency(totalMapPipelineValue)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Hot Inbound:</span>
                <span className="font-bold text-red-400 flex items-center gap-1 font-mono">
                  <Flame className="w-3 h-3 fill-current" />
                  {urgentCount} Leads
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Center: Heatmap Visualization Mode Notification Badge */}
        {visualizationMode === 'heatmap' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-500/40 text-white text-[11px] font-semibold flex items-center space-x-2 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>Continuous Thermal Demand Density Active</span>
              <span className="text-[10px] text-slate-400">({heatWeightMetric.toUpperCase()} Weighting)</span>
            </div>
          </div>
        )}

        {/* Side Inspector Drawer: Active Parcel / Property Inspector */}
        {activeParcelDetails && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-emerald-500/60 rounded-2xl p-4 shadow-2xl max-w-sm text-white animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Cadastral Deeds Record</span>
              </div>
              <button
                onClick={() => setActiveParcelDetails(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-2.5 space-y-2 text-xs">
              <div>
                <div className="font-extrabold text-white text-sm">{activeParcelDetails.erfNumber}</div>
                <div className="text-slate-400 text-[11px]">{activeParcelDetails.suburb}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Zoning Designation:</span>
                  <span className="font-semibold text-slate-200">{activeParcelDetails.zoning}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Registered Extent:</span>
                  <span className="font-semibold text-slate-200 font-mono">{activeParcelDetails.areaM2.toLocaleString()} m²</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Current Valuation:</span>
                  <span className="font-bold text-emerald-400 text-xs">{formatCurrency(activeParcelDetails.marketValuation)}</span>
                </div>
              </div>

              {activeParcelDetails.matchedLeadIds.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-300 block mb-1">Associated Active Inquiries:</span>
                  {leads
                    .filter((l) => activeParcelDetails.matchedLeadIds.includes(l.id))
                    .map((l) => (
                      <div
                        key={l.id}
                        onClick={() => onSelectLead?.(l)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500 transition cursor-pointer text-[11px] flex items-center justify-between"
                      >
                        <span className="font-medium text-white truncate max-w-[150px]">{l.name}</span>
                        <span className="text-emerald-400 font-bold font-mono">{formatShortCurrency(l.dealValue || l.propertyPrice)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. MAP FOOTER LEGEND & THERMAL DENSITY COLOR SPECTRUM BAR */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {visualizationMode === 'heatmap' || visualizationMode === 'hybrid' ? (
          /* Thermal Heatmap Gradient Spectrum Legend */
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Demand Spectrum:</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-blue-400">Low Inbound</span>
              <div className="w-32 sm:w-44 h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-600 shadow-inner border border-white/20" />
              <span className="text-[10px] text-red-400 font-bold">Surge Concentration</span>
            </div>
          </div>
        ) : (
          /* Standard Pin Marker Legend */
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <span className="font-semibold text-slate-300">Map Legend:</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-emerald-400" />
              <span>Standard Listing</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
              <span>Urgent / High Intent Lead</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              <span>Deal Won</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 border border-dashed border-emerald-400 bg-emerald-500/20" />
              <span>Cadastral Erf Boundary</span>
            </span>
          </div>
        )}

        <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {visualizationMode === 'heatmap' 
              ? 'Heat density dynamically recalculated on pan & zoom with Gaussian interpolation'
              : 'Click any pin marker to inspect full lead dossier and property pricing'}
          </span>
        </div>
      </div>
    </div>
  );
};
