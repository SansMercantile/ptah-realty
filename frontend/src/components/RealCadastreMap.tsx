import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Maximize2, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Eye, 
  EyeOff, 
  Hash, 
  Ruler, 
  Navigation,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Box,
  SlidersHorizontal
} from 'lucide-react';
import { PropertyRecord, ZoningCode, AccommodationType, PropertyUsage } from '../types';
import { extractStreetName, formatWGS84 } from '../utils/cadastralFilters';
import { ARCHITECTURAL_BUILDINGS_DATABASE, getArchitecturalBuilding, ArchitecturalBuildingBox } from '../utils/buildingGeometry';
import { getCadastralParcels, CadastralParcelFeature } from '../services/api';
import { classifyZoning, PROFILES as PARCEL_CATEGORY_PROFILES } from '../utils/parcelMockData';

// CARTO's basemaps.cartocdn.com raster tiles now require a dedicated,
// free "Basemaps API key" (request one at https://carto.com/basemaps/apikey)
// appended as a `key` query param, or tiles render with a repeated
// "API key required" watermark. NOTE: this is a different credential from
// VITE_CARTO_MAPS_API_KEY in .env -- that one is a CARTO Cloud Native v3
// API Access Token (JWT, scoped to a specific connection/dataset for the
// Maps/SQL/Tilesets APIs at gcp-us-east1.api.carto.com) and is NOT valid
// against the basemaps.cartocdn.com raster endpoint, so it won't clear the
// watermark on the Cadastral Dark / Deeds Plan Light basemaps below.
// Street GIS (OpenStreetMap) needs no key at all and is the default.
const CARTO_MAPS_API_KEY = import.meta.env.VITE_CARTO_BASEMAPS_API_KEY as string | undefined;
const CARTO_TILE_KEY_PARAM = CARTO_MAPS_API_KEY ? `?key=${CARTO_MAPS_API_KEY}` : '';

interface RealCadastreMapProps {
  properties: PropertyRecord[];
  selectedProperty: PropertyRecord | null;
  hoveredProperty: PropertyRecord | null;
  onSelectProperty: (property: PropertyRecord) => void;
  onHoverProperty: (property: PropertyRecord | null, pos: { x: number; y: number } | null) => void;
  showZoningLayer?: boolean;
  showRadiusRing?: boolean;
  radiusMeters?: number;
  cadastralLayerMode?: 'hybrid' | 'cadastre-only' | 'satellite' | 'deeds-survey';
  containerBounds?: DOMRect | null;
  visibleStreets?: Set<string>;
  showSurroundingParcels?: boolean;
  showHouseNumbers?: boolean;
  heading?: number;
  onHeadingChange?: (heading: number) => void;
  tilt?: number;
  onTiltChange?: (tilt: number) => void;
  buildingRenderMode?: 'building_boxes' | 'cadastre_lots' | 'hybrid';
  onBuildingRenderModeChange?: (mode: 'building_boxes' | 'cadastre_lots' | 'hybrid') => void;
  show3DExtrusions?: boolean;
  onToggle3DExtrusions?: (show: boolean) => void;
  onCursorCoordsChange?: (coords: { lat: number; lng: number } | null) => void;
  // Street & Cluster Filter toggle -- state and the StreetFilterControls
  // panel itself still live in CadastralMap (the parent), this is just
  // the trigger button, rendered here in the Basemap bar next to "Deeds
  // Plan Light" per the user's requested layout, rather than in
  // CadastralMap's own top bar (which is now Google Maps engine only).
  showStreetFilters?: boolean;
  onToggleStreetFilters?: () => void;
}

// Extract house number from address string
export const extractHouseNumber = (address?: string, fallback = ''): string => {
  if (!address) return fallback;
  const trimmed = address.trim();
  const match = trimmed.match(/^(\d+[A-Za-z]?(?:\/\d+)?)/);
  if (match && match[1]) {
    return match[1];
  }
  const firstWord = trimmed.split(' ')[0];
  if (firstWord && !isNaN(Number(firstWord))) {
    return firstWord;
  }
  return firstWord || fallback;
};

// Surrounding registered erven in Green Point / Three Anchor Bay cadastre with geographic coordinates
// Real cadastral parcel shape, kept identical to the old hand-authored
// SURROUNDING_GEO_PARCELS entries below so every consumer further down
// this file (filteredSurroundingGeoParcels, the SVG render loop, hover/
// click handlers) needed zero changes -- only the DATA SOURCE changed,
// from ~15 hand-vectored demo lots near one erf to every real parcel
// the City of Cape Town's Open Data cadastre returns for the current
// viewport (see api/cadastre.py / services/cadastre.py on the backend).
interface LiveSurroundingParcel {
  erf: string;
  street: string;
  zoning: string;
  extentM2: number;
  center: [number, number]; // [lng, lat]
  coords: Array<[number, number]>; // [[lng, lat], ...] -- real surveyed lot boundary
  // Real cadastre data has no building-footprint geometry (only the lot
  // boundary), unlike the old hand-drawn demo entries which had an
  // artistic inset footprint. buildingCoords here is a COSMETIC inset of
  // the real lot boundary (see insetPolygon below) purely so the
  // 'building_boxes' render mode still shows a block -- it is NOT
  // surveyed building geometry and should never be presented as such.
  buildingCoords?: Array<[number, number]>;
}

// Shrinks a polygon toward its own centroid by `factor` (0-1). Used only
// to synthesize a cosmetic buildingCoords inset from a real lot boundary
// -- see the LiveSurroundingParcel comment above.
function insetPolygon(coords: Array<[number, number]>, factor: number): Array<[number, number]> {
  if (coords.length < 3) return coords;
  const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  return coords.map(([x, y]) => [cx + (x - cx) * (1 - factor), cy + (y - cy) * (1 - factor)]);
}

// Flattens a GeoJSON Polygon/MultiPolygon's outer ring(s) into the simple
// coordinate-array shape this file's SVG renderer expects. Holes and
// additional MultiPolygon parts are dropped -- the existing render code
// only ever drew one simple ring per parcel, same limitation the old
// hand-authored data had.
function extractOuterRing(geometry: { type: string; coordinates: unknown }): Array<[number, number]> | null {
  try {
    if (geometry.type === 'Polygon') {
      const ring = (geometry.coordinates as number[][][])[0];
      return ring.map(([lng, lat]) => [lng, lat] as [number, number]);
    }
    if (geometry.type === 'MultiPolygon') {
      const ring = (geometry.coordinates as number[][][][])[0]?.[0];
      if (!ring) return null;
      return ring.map(([lng, lat]) => [lng, lat] as [number, number]);
    }
  } catch {
    return null;
  }
  return null;
}

function mapParcelFeatureToLiveParcel(feature: CadastralParcelFeature): LiveSurroundingParcel | null {
  const coords = extractOuterRing(feature.geometry);
  if (!coords || coords.length < 3) return null;
  const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  const p = feature.properties;
  const erf = p.erfNumber || p.sgCode || 'Unknown';
  const streetLabel = [p.addressNumber, p.streetName].filter(Boolean).join(' ') || p.suburb || 'Unregistered';
  return {
    erf,
    street: streetLabel,
    zoning: p.zoning || 'Unzoned',
    extentM2: p.extentM2 ?? 0,
    center: [cx, cy],
    coords,
    buildingCoords: insetPolygon(coords, 0.22),
  };
}

// Web Mercator conversions for accurate real-world GIS projection
function latLngToWorld(lat: number, lng: number): { x: number; y: number } {
  const sinY = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  return {
    x: 256 * (0.5 + lng / 360),
    y: 256 * (0.5 - Math.log((1 + sinY) / (1 - sinY)) / (4 * Math.PI))
  };
}

export const RealCadastreMap: React.FC<RealCadastreMapProps> = ({
  properties,
  selectedProperty,
  hoveredProperty,
  onSelectProperty,
  onHoverProperty,
  showZoningLayer = true,
  showRadiusRing = true,
  radiusMeters = 500,
  cadastralLayerMode = 'hybrid',
  containerBounds,
  visibleStreets,
  showSurroundingParcels = true,
  showHouseNumbers = true,
  heading = 0,
  onHeadingChange,
  tilt = 0,
  onTiltChange,
  buildingRenderMode = 'building_boxes',
  onBuildingRenderModeChange,
  show3DExtrusions = false,
  onToggle3DExtrusions,
  onCursorCoordsChange,
  showStreetFilters = false,
  onToggleStreetFilters
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Real parcels for the current viewport, fetched via getCadastralParcels()
  // -- populated by the effect further down (after projectScreenPixelToGeo
  // is defined, since computing the fetch bbox needs it). Replaces the old
  // static SURROUNDING_GEO_PARCELS array entirely.
  const [liveSurroundingParcels, setLiveSurroundingParcels] = useState<LiveSurroundingParcel[]>([]);
  const [isLoadingLiveParcels, setIsLoadingLiveParcels] = useState(false);
  const [liveParcelsError, setLiveParcelsError] = useState<string | null>(null);

  // Filter surrounding registered parcels based on street visibility
  const filteredSurroundingGeoParcels = useMemo(() => {
    if (!showSurroundingParcels) return [];
    if (!visibleStreets || visibleStreets.size === 0) return liveSurroundingParcels;
    return liveSurroundingParcels.filter((parcel) => {
      const street = extractStreetName(parcel.street);
      return visibleStreets.has(street);
    });
  }, [showSurroundingParcels, visibleStreets, liveSurroundingParcels]);

  // Real-erf lookup for the mock/demo properties layer below -- when a
  // property's erfNo matches a real parcel actually fetched for the
  // current viewport, its polygon uses the REAL surveyed boundary here
  // instead of getArchitecturalBuilding()'s synthetic approximation, per
  // explicit request ("mock data attached to the specific/correct ERF").
  // Keyed off the unfiltered liveSurroundingParcels (not
  // filteredSurroundingGeoParcels) so a street-visibility filter doesn't
  // also suppress this alignment.
  const liveParcelByErf = useMemo(() => {
    const map = new Map<string, LiveSurroundingParcel>();
    for (const parcel of liveSurroundingParcels) {
      map.set(parcel.erf.trim().toLowerCase(), parcel);
    }
    return map;
  }, [liveSurroundingParcels]);

  // Reverse lookup: erf -> known PropertyRecord (mock/live-pulled listing
  // data), used by the surrounding-parcels click handler below so that
  // ANY registered erf on the map is clickable and connected to data --
  // not just the small subset that happens to have a matching
  // PropertyRecord already rendered by the `properties` layer. Previously
  // the surrounding layer (every real cadastral parcel) had no onClick at
  // all, so clicking anywhere except the handful of known listings did
  // nothing.
  const propertyByErf = useMemo(() => {
    const map = new Map<string, PropertyRecord>();
    for (const p of properties) {
      if (p.erfNo) map.set(p.erfNo.trim().toLowerCase(), p);
    }
    return map;
  }, [properties]);

  // Builds a PropertyRecord for a real cadastral parcel that has no
  // matching mock/Property24 listing, so every real parcel (private,
  // corporate, or state-owned; houses, parks, farms, factories,
  // warehouses, everything) can still be clicked and opened.
  //
  // IMPORTANT: these are REAL, identifiable Cape Town parcels (real erf
  // numbers, real streets, real coordinates from the live City of Cape
  // Town cadastre) -- not synthetic demo properties. An earlier version
  // of this function also generated a plausible-looking owner name, sale
  // price, sale date, and stock photo per parcel; that's been removed.
  // Inventing specific ownership/sale facts about a real, identifiable
  // property and presenting them with no "estimated" label anywhere in
  // the UI is a real risk of someone mistaking fabricated data for fact
  // about an actual property (see chat). The zoning-derived category
  // (private/complex/commercial/farm/etc, from classifyZoning()) IS kept
  // -- that part is honestly derived from the real zoning code the
  // cadastre returns, not invented. Ownership, valuation, and images
  // stay honestly blank until a real provider is connected -- see
  // utils/parcelMockData.ts's module docstring.
  const buildSyntheticParcelRecord = useCallback((parcel: LiveSurroundingParcel): PropertyRecord => {
    const streetName = extractStreetName(parcel.street) || parcel.street;
    const zoningCategory = classifyZoning(parcel.zoning);
    const profile = PARCEL_CATEGORY_PROFILES[zoningCategory];
    return {
      id: `cadastre-${parcel.erf}`,
      erfNo: parcel.erf,
      lpiCode: '',
      deedsOffice: 'Cape Town',
      township: streetName,
      address: `${streetName} (Erf ${parcel.erf})`,
      suburb: streetName,
      municipality: 'City of Cape Town',
      province: 'Western Cape',
      gps: {
        lat: parcel.center[1],
        lng: parcel.center[0],
        formatted: formatWGS84(parcel.center[1], parcel.center[0]),
      },
      extentM2: parcel.extentM2,
      cadastralExtentM2: parcel.extentM2,
      polygonPoints: parcel.coords,
      category: zoningCategory === 'agricultural_farm' ? 'Farm' : zoningCategory === 'commercial_corporate' || zoningCategory === 'industrial_corporate' ? 'Commercial' : 'Freehold',
      usage: profile.usage as PropertyUsage,
      zoning: (parcel.zoning as ZoningCode) || 'GR2',
      zoningDescription: parcel.zoning || profile.zoningDescription,
      servitudes: false,
      // No stock photo -- a real photo of a different house presented as
      // if it's this real address would be more misleading than no
      // photo at all, not less.
      currentSale: {
        owner: 'Not available -- no ownership provider connected',
        ownersId: '',
        salePrice: 0,
        saleDate: '',
        registeredDate: '',
        titleDeed: '',
        saleType: '',
      },
      municipalValuation: {
        totalValue: 0,
        valuationYear: new Date().getFullYear(),
        ratesEstimateMonthly: 0,
      },
      accommodation: {
        type: profile.accommodationType as AccommodationType,
        usage: profile.usage as PropertyUsage,
        condition: 'UNKNOWN',
      },
    };
  }, []);
  
  // Center coordinates (default: Three Anchor Bay / Green Point erf 1681)
  const defaultCenter = { lat: -33.90876, lng: 18.401027 };
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    selectedProperty?.gps ? { lat: selectedProperty.gps.lat, lng: selectedProperty.gps.lng } : defaultCenter
  );
  
  // Real GIS zoom level (15 = neighborhood, 17.4 = parcel detail, 18.5 = rooftop/deeds)
  const [zoomLevel, setZoomLevel] = useState<number>(18.2);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragCenterStart, setDragCenterStart] = useState<{ lat: number; lng: number }>(center);
  // Street GIS (OpenStreetMap) is the default/primary basemap -- it needs
  // no API key at all, so it always renders cleanly regardless of Carto
  // key/token state. The Carto raster basemaps (Cadastral Dark, Deeds Plan
  // Light) remain available as an explicit switch.
  const [activeTileSource, setActiveTileSource] = useState<'carto-dark' | 'esri-satellite' | 'osm-standard' | 'carto-light'>('osm-standard');
  const [hoveredErfNo, setHoveredErfNo] = useState<string | null>(null);

  // Resize observer for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width || 800, height: rect.height || 600 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When selected property changes, smoothly center map
  useEffect(() => {
    if (selectedProperty?.gps) {
      setCenter({ lat: selectedProperty.gps.lat, lng: selectedProperty.gps.lng });
    }
  }, [selectedProperty]);

  // Convert real geographic GPS to screen pixel space relative to center, heading, tilt, and height
  const projectGeoToScreen = (lat: number, lng: number, heightMeters = 0): { x: number; y: number } => {
    const scale = Math.pow(2, zoomLevel);
    const centerWorld = latLngToWorld(center.lat, center.lng);
    const pointWorld = latLngToWorld(lat, lng);
    
    let dx = (pointWorld.x - centerWorld.x) * scale;
    let dy = (pointWorld.y - centerWorld.y) * scale;
    
    // Apply heading rotation if heading !== 0
    if (heading !== 0) {
      const rad = (-heading * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rotX = dx * cos - dy * sin;
      const rotY = dx * sin + dy * cos;
      dx = rotX;
      dy = rotY;
    }
    
    let pixelX = dx + dimensions.width / 2;
    let pixelY = dy + dimensions.height / 2;

    // Apply 3D Tilt & Elevation
    if (tilt > 0) {
      const tiltRad = (tilt * Math.PI) / 180;
      const cosTilt = Math.cos(tiltRad);
      const sinTilt = Math.sin(tiltRad);

      const relY = pixelY - dimensions.height / 2;
      pixelY = dimensions.height / 2 + relY * cosTilt;

      if (heightMeters > 0 && show3DExtrusions) {
        const metersToPixels = (scale * 256) / (40075016.686 * Math.cos((center.lat * Math.PI) / 180));
        const elevationPixels = heightMeters * metersToPixels * sinTilt * 2.2;
        pixelY -= elevationPixels;
      }
    } else if (heightMeters > 0 && show3DExtrusions) {
      // Isometric 2.5D elevation in 2D mode
      const metersToPixels = (scale * 256) / (40075016.686 * Math.cos((center.lat * Math.PI) / 180));
      const elevationPixels = heightMeters * metersToPixels * 0.9;
      pixelY -= elevationPixels;
      pixelX -= elevationPixels * 0.45;
    }
    
    return { x: pixelX, y: pixelY };
  };

  // Convert screen pixels back to lat/lng for smooth natural dragging under rotation & tilt
  const projectScreenToGeo = (
    screenDx: number, 
    screenDy: number, 
    baseCenter: { lat: number; lng: number }, 
    baseZoom: number
  ): { lat: number; lng: number } => {
    let unrotDx = screenDx;
    let unrotDy = screenDy;

    if (tilt > 0) {
      const tiltRad = (tilt * Math.PI) / 180;
      unrotDy = unrotDy / Math.cos(tiltRad);
    }

    if (heading !== 0) {
      const rad = (heading * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = unrotDx * cos - unrotDy * sin;
      const ry = unrotDx * sin + unrotDy * cos;
      unrotDx = rx;
      unrotDy = ry;
    }

    const scale = Math.pow(2, baseZoom);
    const centerWorld = latLngToWorld(baseCenter.lat, baseCenter.lng);
    
    const worldX = centerWorld.x - unrotDx / scale;
    const worldY = centerWorld.y - unrotDy / scale;
    
    const lng = (worldX / 256 - 0.5) * 360;
    const n = Math.PI - (2 * Math.PI * worldY) / 256;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    
    return { lat, lng };
  };

  // Convert screen coordinates (relative to canvas container) to geographic lat/lng
  const projectScreenPixelToGeo = (screenX: number, screenY: number): { lat: number; lng: number } => {
    let unrotDx = screenX - dimensions.width / 2;
    let unrotDy = screenY - dimensions.height / 2;

    if (tilt > 0) {
      const tiltRad = (tilt * Math.PI) / 180;
      unrotDy = unrotDy / Math.cos(tiltRad);
    }

    if (heading !== 0) {
      const rad = (-heading * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      // Inverse rotation of (rotX = dx*cos - dy*sin, rotY = dx*sin + dy*cos)
      const rx = unrotDx * cos + unrotDy * sin;
      const ry = -unrotDx * sin + unrotDy * cos;
      unrotDx = rx;
      unrotDy = ry;
    }

    const scale = Math.pow(2, zoomLevel);
    const centerWorld = latLngToWorld(center.lat, center.lng);
    
    const worldX = centerWorld.x + unrotDx / scale;
    const worldY = centerWorld.y + unrotDy / scale;
    
    const lng = (worldX / 256 - 0.5) * 360;
    const n = Math.PI - (2 * Math.PI * worldY) / 256;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    
    return { lat, lng };
  };

  // Live real-parcel fetch for the current viewport. Debounced, and
  // guarded against very wide bboxes at low zoom (matches the min-zoom
  // guard the old standalone LiveCadastreMap.tsx used before it was
  // retired in favour of this merged version -- see chat).
  const MIN_ZOOM_FOR_LIVE_PARCELS = 15;
  const liveParcelFetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (liveParcelFetchDebounceRef.current) clearTimeout(liveParcelFetchDebounceRef.current);

    if (zoomLevel < MIN_ZOOM_FOR_LIVE_PARCELS) {
      setLiveSurroundingParcels([]);
      setLiveParcelsError(null);
      return;
    }

    liveParcelFetchDebounceRef.current = setTimeout(async () => {
      const corners = [
        projectScreenPixelToGeo(0, 0),
        projectScreenPixelToGeo(dimensions.width, 0),
        projectScreenPixelToGeo(0, dimensions.height),
        projectScreenPixelToGeo(dimensions.width, dimensions.height),
      ];
      const bbox = {
        minLng: Math.min(...corners.map((c) => c.lng)),
        maxLng: Math.max(...corners.map((c) => c.lng)),
        minLat: Math.min(...corners.map((c) => c.lat)),
        maxLat: Math.max(...corners.map((c) => c.lat)),
      };

      setIsLoadingLiveParcels(true);
      setLiveParcelsError(null);
      try {
        const result = await getCadastralParcels(bbox);
        const mapped = result.features
          .map(mapParcelFeatureToLiveParcel)
          .filter((p): p is LiveSurroundingParcel => p !== null);
        setLiveSurroundingParcels(mapped);
      } catch (err) {
        console.error('[RealCadastreMap] Live parcel fetch failed:', err);
        setLiveParcelsError('Unable to load live cadastral parcels for this area.');
        setLiveSurroundingParcels([]);
      } finally {
        setIsLoadingLiveParcels(false);
      }
    }, 400);

    return () => {
      if (liveParcelFetchDebounceRef.current) clearTimeout(liveParcelFetchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, zoomLevel, dimensions.width, dimensions.height, heading, tilt]);

  // Tile calculation for real OpenStreetMap / CartoDB / Esri satellite raster tiles
  const visibleTiles = useMemo(() => {
    const centerWorld = latLngToWorld(center.lat, center.lng);
    const zoomInt = Math.floor(zoomLevel);
    const tileZoomScale = Math.pow(2, zoomLevel - zoomInt);
    const tileSize = 256 * tileZoomScale;
    
    const numTiles = Math.pow(2, zoomInt);
    const centerTileX = (centerWorld.x * Math.pow(2, zoomInt)) / 256;
    const centerTileY = (centerWorld.y * Math.pow(2, zoomInt)) / 256;
    
    // Expand bounds when rotated or tilted to prevent missing tile corners
    const diagonal = Math.sqrt(dimensions.width * dimensions.width + dimensions.height * dimensions.height);
    const minTileX = Math.floor(centerTileX - (diagonal / (2 * tileSize))) - 1;
    const maxTileX = Math.floor(centerTileX + (diagonal / (2 * tileSize))) + 2;
    const minTileY = Math.floor(centerTileY - (diagonal / (2 * tileSize))) - 1;
    const maxTileY = Math.floor(centerTileY + (diagonal / (2 * tileSize))) + 2;
    
    const tiles: Array<{
      key: string;
      url: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];
    
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        const wrappedX = ((tx % numTiles) + numTiles) % numTiles;
        if (ty >= 0 && ty < numTiles) {
          let url = '';
          // OSM's tile CDN only rotates across 3 subdomains (a/b/c) --
          // using the same 4-way 'd' subdomain as Carto here would send a
          // quarter of Street GIS tile requests to a host that doesn't
          // resolve for OSM, leaving visible gaps on the default basemap.
          const cartoSub = ['a', 'b', 'c', 'd'][Math.abs(tx + ty) % 4];
          const osmSub = ['a', 'b', 'c'][Math.abs(tx + ty) % 3];

          if (activeTileSource === 'carto-dark') {
            url = `https://${cartoSub}.basemaps.cartocdn.com/rastertiles/dark_all/${zoomInt}/${wrappedX}/${ty}.png${CARTO_TILE_KEY_PARAM}`;
          } else if (activeTileSource === 'carto-light') {
            url = `https://${cartoSub}.basemaps.cartocdn.com/rastertiles/light_all/${zoomInt}/${wrappedX}/${ty}.png${CARTO_TILE_KEY_PARAM}`;
          } else if (activeTileSource === 'esri-satellite') {
            url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoomInt}/${ty}/${wrappedX}`;
          } else {
            url = `https://${osmSub}.tile.openstreetmap.org/${zoomInt}/${wrappedX}/${ty}.png`;
          }
          
          const screenX = (tx - centerTileX) * tileSize + dimensions.width / 2;
          const screenY = (ty - centerTileY) * tileSize + dimensions.height / 2;
          
          tiles.push({
            key: `${zoomInt}-${tx}-${ty}`,
            url,
            x: screenX,
            y: screenY,
            width: tileSize,
            height: tileSize
          });
        }
      }
    }
    
    return tiles;
  }, [center, zoomLevel, dimensions, activeTileSource]);

  // Handle Dragging / Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragCenterStart(center);
  };

  // Drag handling is throttled to one update per animation frame instead
  // of firing setCenter/onCursorCoordsChange on every raw mousemove event
  // (which fires far faster than the screen repaints -- often 2-4x the
  // display's refresh rate on modern mice/trackpads). Each of those
  // updates was cascading into a full visibleTiles recompute and canvas
  // redraw, which is what made panning feel slow/laggy; this was the
  // single biggest contributor to the "map is very slow" complaint.
  const dragRafIdRef = useRef<number | null>(null);
  const pendingDragEventRef = useRef<{ dx: number; dy: number; screenX: number; screenY: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    pendingDragEventRef.current = {
      dx: e.clientX - dragStart.x,
      dy: e.clientY - dragStart.y,
      screenX: rect ? e.clientX - rect.left : 0,
      screenY: rect ? e.clientY - rect.top : 0,
    };

    if (dragRafIdRef.current !== null) return; // a frame is already scheduled

    dragRafIdRef.current = requestAnimationFrame(() => {
      dragRafIdRef.current = null;
      const pending = pendingDragEventRef.current;
      if (!pending) return;

      if (isDragging) {
        const newGeo = projectScreenToGeo(pending.dx, pending.dy, dragCenterStart, zoomLevel);
        setCenter(newGeo);
      }

      if (canvasRef.current && onCursorCoordsChange) {
        const geo = projectScreenPixelToGeo(pending.screenX, pending.screenY);
        onCursorCoordsChange(geo);
      }
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseLeave = () => {
    setIsDragging(false);
    onCursorCoordsChange?.(null);
  };

  // Handle Zoom Wheel. Deliberately NOT a JSX onWheel prop: React attaches
  // its wheel listener as passive by default, so calling preventDefault()
  // there throws a console warning and doesn't reliably stop the page
  // from scrolling behind the map. A native, explicitly non-passive
  // listener (attached below in a useEffect) is what actually works.
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoomLevel((z) => Math.min(Math.max(z + zoomDelta, 14.5), 19.5));
  };

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, []);

  // Convert array of [lng, lat] points to SVG points string with optional elevation height
  const formatPointsString = (coords: Array<[number, number]>, heightMeters = 0): string => {
    return coords
      .map(([lng, lat]) => {
        const pt = projectGeoToScreen(lat, lng, heightMeters);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  };

  // Compute centroid of polygon points
  const getCentroid = (coords: Array<[number, number]>, heightMeters = 0): { x: number; y: number } => {
    if (!coords.length) return { x: dimensions.width / 2, y: dimensions.height / 2 };
    let sumX = 0;
    let sumY = 0;
    coords.forEach(([lng, lat]) => {
      const pt = projectGeoToScreen(lat, lng, heightMeters);
      sumX += pt.x;
      sumY += pt.y;
    });
    return { x: sumX / coords.length, y: sumY / coords.length };
  };

  return (
    <div
      ref={canvasRef}
      id="real-cadastre-map-canvas"
      className="w-full h-full relative overflow-hidden select-none bg-slate-950 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. RASTER TILE LAYER (OpenStreetMap / CartoDB Dark / Esri High-Res Satellite) */}
      <div 
        className="absolute inset-0 pointer-events-none origin-center transition-transform duration-200"
        style={{
          transform: heading !== 0 || tilt > 0 
            ? `perspective(1200px) rotateX(${tilt}deg) rotate(${-heading}deg)` 
            : undefined
        }}
      >
        {visibleTiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.url}
            alt="Real GIS Map Tile"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="absolute transition-opacity duration-150"
            style={{
              left: `${tile.x}px`,
              top: `${tile.y}px`,
              width: `${tile.width}px`,
              height: `${tile.height}px`,
              opacity: activeTileSource === 'esri-satellite' ? 0.88 : 0.95
            }}
          />
        ))}
      </div>

      {/* 2. CADASTRAL SURVEYOR-GENERAL & 3D ARCHITECTURAL BUILDING BOX OVERLAY */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          {/* Subtle Cadastral Pulse Animation and Glow Filters */}
          <style>{`
            @keyframes cadastrePulseLoop {
              0%, 100% {
                fill-opacity: 0.50;
                stroke-opacity: 0.90;
                stroke-width: 3.2px;
              }
              50% {
                fill-opacity: 0.72;
                stroke-opacity: 1;
                stroke-width: 4.8px;
              }
            }
            @keyframes pulseHaloExpand {
              0%, 100% {
                stroke-width: 3px;
                stroke-opacity: 0.8;
                fill-opacity: 0.15;
              }
              50% {
                stroke-width: 8px;
                stroke-opacity: 0.35;
                fill-opacity: 0.32;
              }
            }
            .cadastre-selected-pulse {
              animation: cadastrePulseLoop 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .cadastre-halo-pulse {
              animation: pulseHaloExpand 2.4s ease-in-out infinite;
            }
          `}</style>
          
          <filter id="cadastreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="buildingBoxShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.65" />
          </filter>

          <pattern id="surveyHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#00acc1" strokeWidth="1" strokeOpacity="0.25" />
          </pattern>
        </defs>

        {/* 2A. CMA PROXIMITY RADIUS RING */}
        {showRadiusRing && selectedProperty?.gps && (
          (() => {
            const pCenter = projectGeoToScreen(selectedProperty.gps.lat, selectedProperty.gps.lng);
            const pRadiusEdge = projectGeoToScreen(selectedProperty.gps.lat + radiusMeters / 111139, selectedProperty.gps.lng);
            const rPx = Math.abs(pRadiusEdge.y - pCenter.y) || 120;
            return (
              <g>
                <circle
                  cx={pCenter.x}
                  cy={pCenter.y}
                  r={rPx}
                  fill="rgba(0, 188, 212, 0.06)"
                  stroke="#00e5ff"
                  strokeWidth="1.8"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
                <text
                  x={pCenter.x + rPx * 0.707}
                  y={pCenter.y - rPx * 0.707}
                  fill="#00e5ff"
                  fontSize="11"
                  fontWeight="bold"
                  className="font-mono select-none"
                >
                  {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)} km` : `${radiusMeters}m`} CMA Radius
                </text>
              </g>
            );
          })()
        )}

        {/* 2B. SURROUNDING REGISTERED CADASTRAL ERVEN (UNREGISTERED MLS PARCELS) */}
        {filteredSurroundingGeoParcels.map((parcel) => {
          const lotPoints = formatPointsString(parcel.coords);
          const isHovered = hoveredErfNo === parcel.erf;
          const matched = propertyByErf.get(parcel.erf.trim().toLowerCase());
          const isSelected = !!matched && selectedProperty?.id === matched.id;

          // Every real fetched parcel is visible and clickable -- per
          // explicit request, this replaces both the old invisible-only
          // treatment here and properties' own separate rendering below
          // (2C), which stays hit-area-only. Three honest visual states:
          // selected (the one currently open), matched (has a real
          // listing behind it, from `properties`), or plain (a real
          // parcel with no listing -- still clickable, opens the same
          // popup via buildSyntheticParcelRecord with only real fields
          // filled in, no fabricated ownership/sale data -- see that
          // function's own comment).
          const fill = isSelected
            ? 'rgba(56, 189, 248, 0.35)'
            : isHovered
              ? 'rgba(56, 189, 248, 0.22)'
              : matched
                ? 'rgba(16, 185, 129, 0.16)'
                : 'rgba(100, 116, 139, 0.16)';
          const stroke = isSelected
            ? '#38bdf8'
            : isHovered
              ? '#7dd3fc'
              : matched
                ? '#10b981'
                : '#64748b';

          return (
            <g
              key={`surrounding-${parcel.erf}`}
              className="cursor-pointer pointer-events-auto transition-opacity"
              onClick={() => {
                onSelectProperty(matched || buildSyntheticParcelRecord(parcel));
              }}
              onMouseEnter={(e) => {
                setHoveredErfNo(parcel.erf);
                const rect = canvasRef.current?.getBoundingClientRect();
                onHoverProperty(matched || null, {
                  x: e.clientX - (rect?.left || 0),
                  y: e.clientY - (rect?.top || 0)
                });
              }}
              onMouseLeave={() => {
                setHoveredErfNo(null);
                onHoverProperty(null, null);
              }}
            >
              <polygon
                points={lotPoints}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 2 : isHovered ? 1.8 : 1.2}
              />
            </g>
          );
        })}

        {/* 2C. REGISTERED VALUATION & LISTING PROPERTIES -- invisible
            hit-area only, per explicit request (same treatment as 2B's
            surrounding parcels above): the architectural building boxes,
            colored cadastre lot fills, house-number badges, and boundary
            vertex pegs this used to render for every one of these
            parcels were the "vectors and numbers" cluttering the map and
            not scaling well. onClick/hover still resolve the exact same
            PropertyRecord (`prop`) as before, so clicking one of these
            known listings behaves identically to before -- only the
            visible drawing is gone. */}
        {properties.map((prop) => {
          const isHovered = hoveredProperty?.id === prop.id || hoveredErfNo === prop.erfNo;

          const building = getArchitecturalBuilding(prop);
          // If a real fetched parcel matches this property's erfNo, use its
          // actual surveyed boundary for the lot outline instead of
          // getArchitecturalBuilding()'s synthetic approximation -- keeps
          // the listing's hit-area attached to the correct real ERF
          // rather than a guessed shape (see liveParcelByErf above).
          const matchedLiveParcel = prop.erfNo ? liveParcelByErf.get(prop.erfNo.trim().toLowerCase()) : undefined;
          const lotGeo = matchedLiveParcel ? matchedLiveParcel.coords : building.cadastralLotGeo;
          const lotPoints = formatPointsString(lotGeo);

          return (
            <g
              key={`prop-${prop.id}`}
              className="cursor-pointer pointer-events-auto"
              onClick={() => onSelectProperty(prop)}
              onMouseEnter={(e) => {
                setHoveredErfNo(prop.erfNo);
                const rect = canvasRef.current?.getBoundingClientRect();
                onHoverProperty(prop, {
                  x: e.clientX - (rect?.left || 0),
                  y: e.clientY - (rect?.top || 0)
                });
              }}
              onMouseMove={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                onHoverProperty(prop, {
                  x: e.clientX - (rect?.left || 0),
                  y: e.clientY - (rect?.top || 0)
                });
              }}
              onMouseLeave={() => {
                setHoveredErfNo(null);
                onHoverProperty(null, null);
              }}
            >
              <polygon points={lotPoints} fill="transparent" stroke="none" />
            </g>
          );
        })}
      </svg>

      {/* 3. GIS LAYER CONTROLS (CartoDB Dark / Satellite / OpenStreetMap) --
          two visually distinct groups (basemap switcher, streets toggle)
          separated by gap-2 on the outer flex container, matching the
          gap-2 used between the CMA Radius control and the "Pull Live"
          button in the row above -- the same reference gap size applied
          consistently, rather than the old ad-hoc ml-1 that made the
          Streets toggle look too close to "Deeds Plan Light". */}
      <div className="absolute top-14 left-3 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-xl text-xs pointer-events-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-semibold px-2 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Basemap:
          </span>
          <button
            id="layer-osm-standard"
            onClick={() => setActiveTileSource('osm-standard')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              activeTileSource === 'osm-standard' ? 'bg-[#006980] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Street GIS
          </button>
          <button
            id="layer-esri-satellite"
            onClick={() => setActiveTileSource('esri-satellite')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              activeTileSource === 'esri-satellite' ? 'bg-[#006980] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            High-Res Satellite
          </button>
          <button
            id="layer-carto-dark"
            onClick={() => setActiveTileSource('carto-dark')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              activeTileSource === 'carto-dark' ? 'bg-[#006980] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadastral Dark
          </button>
          <button
            id="layer-carto-light"
            onClick={() => setActiveTileSource('carto-light')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              activeTileSource === 'carto-light' ? 'bg-[#006980] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deeds Plan Light
          </button>
        </div>

        {/* Street & Cluster Filter toggle -- moved here, next to the
            basemap switches, per the requested layout. Panel + filter
            state still live in CadastralMap (the parent); this is just
            the trigger button. */}
        {onToggleStreetFilters && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <button
              id="layer-street-cluster-filter"
              onClick={onToggleStreetFilters}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                showStreetFilters ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Streets
            </button>
          </div>
        )}
      </div>

      {/* Live cadastre fetch status -- honest indicator, not decorative:
          shows while real parcels are loading for the current viewport,
          or if that fetch failed, or if the user is zoomed out past the
          point where fetching every parcel in view would be impractical. */}
      {(isLoadingLiveParcels || liveParcelsError || zoomLevel < MIN_ZOOM_FOR_LIVE_PARCELS) && (
        <div className="absolute top-3 right-16 z-20 pointer-events-none">
          {isLoadingLiveParcels && (
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 shadow-xl text-[11px] text-cyan-300">
              <span className="w-2.5 h-2.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              Loading live cadastral parcels...
            </div>
          )}
          {!isLoadingLiveParcels && liveParcelsError && (
            <div className="bg-red-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-red-800 shadow-xl text-[11px] text-red-300">
              {liveParcelsError}
            </div>
          )}
          {!isLoadingLiveParcels && !liveParcelsError && zoomLevel < MIN_ZOOM_FOR_LIVE_PARCELS && (
            <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 shadow-xl text-[11px] text-slate-400">
              Zoom in to load live parcel boundaries
            </div>
          )}
        </div>
      )}

      {/* 4. QUICK NAVIGATION & RECENTER PRESETS */}
      <div className="absolute bottom-14 right-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-xl pointer-events-auto">
        <button
          id="btn-recenter-selection"
          onClick={() => {
            if (selectedProperty?.gps) {
              setCenter({ lat: selectedProperty.gps.lat, lng: selectedProperty.gps.lng });
              setZoomLevel(18.2);
            }
          }}
          className="px-2 py-1 text-[10px] font-bold text-cyan-300 hover:bg-slate-800 rounded flex items-center gap-1 transition-colors"
          title="Recenter on Selected Property"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" /> Recenter
        </button>
        <button
          id="btn-cadastre-zoom-in"
          onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 19.5))}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          id="btn-cadastre-zoom-out"
          onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 14.5))}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
