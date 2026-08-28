import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import { PropertyRecord } from '../types';
import { extractStreetName } from '../utils/cadastralFilters';
import { ARCHITECTURAL_BUILDINGS_DATABASE, getArchitecturalBuilding, ArchitecturalBuildingBox } from '../utils/buildingGeometry';

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
const SURROUNDING_GEO_PARCELS: Array<{
  erf: string;
  street: string;
  zoning: string;
  extentM2: number;
  center: [number, number]; // [lng, lat]
  coords: Array<[number, number]>; // [[lng, lat], ...]
  buildingCoords?: Array<[number, number]>;
}> = [
  {
    erf: '1680',
    street: '3 Richmond Rd',
    zoning: 'GR4',
    extentM2: 195,
    center: [18.40078, -33.90886],
    coords: [
      [18.40068, -33.90880],
      [18.40088, -33.90878],
      [18.40086, -33.90892],
      [18.40066, -33.90894]
    ],
    buildingCoords: [
      [18.40070, -33.90882],
      [18.40085, -33.90880],
      [18.40084, -33.90890],
      [18.40069, -33.90891]
    ]
  },
  {
    erf: '1682',
    street: '7 Richmond Rd',
    zoning: 'GR4',
    extentM2: 205,
    center: [18.40124, -33.90872],
    coords: [
      [18.40114, -33.90866],
      [18.40134, -33.90864],
      [18.40132, -33.90878],
      [18.40112, -33.90880]
    ],
    buildingCoords: [
      [18.40116, -33.90868],
      [18.40131, -33.90866],
      [18.40129, -33.90876],
      [18.40115, -33.90877]
    ]
  },
  {
    erf: '1683',
    street: '9 Richmond Rd',
    zoning: 'GR4',
    extentM2: 210,
    center: [18.40146, -33.90868],
    coords: [
      [18.40136, -33.90862],
      [18.40156, -33.90860],
      [18.40154, -33.90874],
      [18.40134, -33.90876]
    ],
    buildingCoords: [
      [18.40138, -33.90864],
      [18.40153, -33.90862],
      [18.40151, -33.90872],
      [18.40137, -33.90873]
    ]
  },
  {
    erf: '1675',
    street: '4 Richmond Rd',
    zoning: 'GR4',
    extentM2: 215,
    center: [18.40098, -33.90852],
    coords: [
      [18.40088, -33.90846],
      [18.40108, -33.90844],
      [18.40106, -33.90858],
      [18.40086, -33.90860]
    ],
    buildingCoords: [
      [18.40090, -33.90848],
      [18.40105, -33.90846],
      [18.40104, -33.90856],
      [18.40089, -33.90857]
    ]
  },
  {
    erf: '1676',
    street: '6 Richmond Rd',
    zoning: 'GR4',
    extentM2: 218,
    center: [18.40120, -33.90848],
    coords: [
      [18.40110, -33.90842],
      [18.40130, -33.90840],
      [18.40128, -33.90854],
      [18.40108, -33.90856]
    ],
    buildingCoords: [
      [18.40112, -33.90844],
      [18.40127, -33.90842],
      [18.40125, -33.90852],
      [18.40111, -33.90853]
    ]
  },
  {
    erf: '2092',
    street: '217 Main Rd',
    zoning: 'GB5',
    extentM2: 950,
    center: [18.39920, -33.90845],
    coords: [
      [18.39900, -33.90835],
      [18.39940, -33.90830],
      [18.39938, -33.90855],
      [18.39898, -33.90860]
    ],
    buildingCoords: [
      [18.39904, -33.90838],
      [18.39936, -33.90833],
      [18.39934, -33.90852],
      [18.39902, -33.90856]
    ]
  },
  {
    erf: '2094',
    street: '221 Main Rd',
    zoning: 'GB5',
    extentM2: 1120,
    center: [18.39995, -33.90830],
    coords: [
      [18.39975, -33.90820],
      [18.40015, -33.90815],
      [18.40013, -33.90840],
      [18.39973, -33.90845]
    ],
    buildingCoords: [
      [18.39980, -33.90823],
      [18.40010, -33.90818],
      [18.40008, -33.90837],
      [18.39978, -33.90841]
    ]
  },
  {
    erf: '1796',
    street: '3 Law Rd',
    zoning: 'GR2',
    extentM2: 340,
    center: [18.39965, -33.90940],
    coords: [
      [18.39950, -33.90930],
      [18.39980, -33.90926],
      [18.39978, -33.90950],
      [18.39948, -33.90954]
    ],
    buildingCoords: [
      [18.39954, -33.90933],
      [18.39976, -33.90930],
      [18.39974, -33.90947],
      [18.39952, -33.90950]
    ]
  },
  {
    erf: '973',
    street: '15 St Bedes Rd',
    zoning: 'SR1',
    extentM2: 410,
    center: [18.40040, -33.90920],
    coords: [
      [18.40025, -33.90910],
      [18.40055, -33.90908],
      [18.40053, -33.90930],
      [18.40023, -33.90932]
    ],
    buildingCoords: [
      [18.40028, -33.90913],
      [18.40051, -33.90911],
      [18.40050, -33.90927],
      [18.40026, -33.90928]
    ]
  },
  {
    erf: '62',
    street: '1 Blackheath Rd',
    zoning: 'SR1',
    extentM2: 480,
    center: [18.40085, -33.90935],
    coords: [
      [18.40065, -33.90925],
      [18.40105, -33.90920],
      [18.40100, -33.90945],
      [18.40060, -33.90950]
    ],
    buildingCoords: [
      [18.40070, -33.90928],
      [18.40098, -33.90924],
      [18.40095, -33.90942],
      [18.40066, -33.90945]
    ]
  }
];

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
  show3DExtrusions = true,
  onToggle3DExtrusions,
  onCursorCoordsChange,
  showStreetFilters = false,
  onToggleStreetFilters
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Filter surrounding registered parcels based on street visibility
  const filteredSurroundingGeoParcels = useMemo(() => {
    if (!showSurroundingParcels) return [];
    if (!visibleStreets || visibleStreets.size === 0) return SURROUNDING_GEO_PARCELS;
    return SURROUNDING_GEO_PARCELS.filter((parcel) => {
      const street = extractStreetName(parcel.street);
      return visibleStreets.has(street);
    });
  }, [showSurroundingParcels, visibleStreets]);
  
  // Center coordinates (default: Three Anchor Bay / Green Point erf 1681)
  const defaultCenter = { lat: -33.90876, lng: 18.401027 };
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    selectedProperty?.gps ? { lat: selectedProperty.gps.lat, lng: selectedProperty.gps.lng } : defaultCenter
  );
  
  // Real GIS zoom level (15 = neighborhood, 17.4 = parcel detail, 18.5 = rooftop/deeds)
  const [zoomLevel, setZoomLevel] = useState<number>(17.4);
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      const newGeo = projectScreenToGeo(
        dx,
        dy,
        dragCenterStart,
        zoomLevel
      );
      setCenter(newGeo);
    }

    if (canvasRef.current && onCursorCoordsChange) {
      const rect = canvasRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const geo = projectScreenPixelToGeo(screenX, screenY);
      onCursorCoordsChange(geo);
    }
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
          const isHovered = hoveredErfNo === parcel.erf;
          const lotPoints = formatPointsString(parcel.coords);
          const centerPt = getCentroid(parcel.coords);

          return (
            <g
              key={`surrounding-${parcel.erf}`}
              className="cursor-pointer pointer-events-auto transition-opacity"
              onMouseEnter={(e) => {
                setHoveredErfNo(parcel.erf);
                const rect = canvasRef.current?.getBoundingClientRect();
                onHoverProperty(null, {
                  x: e.clientX - (rect?.left || 0),
                  y: e.clientY - (rect?.top || 0)
                });
              }}
              onMouseLeave={() => {
                setHoveredErfNo(null);
                onHoverProperty(null, null);
              }}
            >
              {/* Cadastral Lot Boundary */}
              {(buildingRenderMode === 'cadastre_lots' || buildingRenderMode === 'hybrid') && (
                <polygon
                  points={lotPoints}
                  fill={isHovered ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.28)'}
                  stroke={isHovered ? '#38bdf8' : '#475569'}
                  strokeWidth={isHovered ? 1.8 : 1.2}
                  strokeDasharray="3 3"
                />
              )}

              {/* Building Footprint Box for surrounding parcels */}
              {(buildingRenderMode === 'building_boxes' || buildingRenderMode === 'hybrid') && parcel.buildingCoords && (
                <polygon
                  points={formatPointsString(parcel.buildingCoords, 4)}
                  fill={isHovered ? 'rgba(56, 189, 248, 0.45)' : 'rgba(71, 85, 105, 0.35)'}
                  stroke={isHovered ? '#7dd3fc' : '#64748b'}
                  strokeWidth={1.4}
                  filter="url(#buildingBoxShadow)"
                />
              )}

              {/* Surrounding Erf Badge */}
              {showHouseNumbers && (
                <text
                  x={centerPt.x}
                  y={centerPt.y + 3}
                  fill={isHovered ? '#38bdf8' : '#94a3b8'}
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                  className="font-mono select-none"
                >
                  Erf {parcel.erf}
                </text>
              )}
            </g>
          );
        })}

        {/* 2C. REGISTERED VALUATION & LISTING PROPERTIES (FULL ARCHITECTURAL BUILDING BOXES & CADASTRE) */}
        {properties.map((prop) => {
          const isSelected = selectedProperty?.id === prop.id;
          const isHovered = hoveredProperty?.id === prop.id || hoveredErfNo === prop.erfNo;
          const houseNum = extractHouseNumber(prop.address, prop.erfNo);
          
          const building = getArchitecturalBuilding(prop);
          const lotPoints = formatPointsString(building.cadastralLotGeo);
          const centerPt = getCentroid(building.cadastralLotGeo);

          // 3D Building extrusion geometry points
          const groundBldgPoints = formatPointsString(building.mainBuildingGeo, 0);
          const roofBldgPoints = formatPointsString(building.mainBuildingGeo, building.heightMeters);
          const bldgCenterPt = getCentroid(building.mainBuildingGeo, building.heightMeters);

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
              {/* Subtle outer pulse halo for selected cadastral parcel */}
              {isSelected && (
                <polygon
                  points={lotPoints}
                  fill="rgba(0, 229, 255, 0.22)"
                  stroke="#00e5ff"
                  strokeWidth="6"
                  filter="url(#cadastreGlow)"
                  className="cadastre-halo-pulse"
                />
              )}

              {/* LAYER 1: CADASTRAL ERF LOT BOUNDARY (SURVEYOR-GENERAL PEGS) */}
              {(buildingRenderMode === 'cadastre_lots' || buildingRenderMode === 'hybrid') && (
                <g>
                  <polygon
                    points={lotPoints}
                    fill={
                      isSelected 
                        ? 'rgba(0, 188, 212, 0.28)' 
                        : isHovered 
                        ? 'rgba(56, 189, 248, 0.22)' 
                        : 'rgba(0, 105, 128, 0.16)'
                    }
                    stroke={isSelected ? '#00e5ff' : isHovered ? '#38bdf8' : '#00acc1'}
                    strokeWidth={isSelected ? 3.0 : isHovered ? 2.2 : 1.6}
                    strokeDasharray={buildingRenderMode === 'hybrid' ? '4 3' : undefined}
                    filter={isSelected ? 'url(#cadastreGlow)' : undefined}
                    className={isSelected ? 'cadastre-selected-pulse transition-all duration-300' : 'transition-all duration-150'}
                  />
                  
                  {/* Lot Hatch in Cadastre-Only Mode */}
                  {buildingRenderMode === 'cadastre_lots' && (
                    <polygon
                      points={lotPoints}
                      fill="url(#surveyHatch)"
                      stroke="none"
                    />
                  )}
                </g>
              )}

              {/* LAYER 2: REAL ARCHITECTURAL BUILDING BOX & FOOTPRINT */}
              {(buildingRenderMode === 'building_boxes' || buildingRenderMode === 'hybrid') && (
                <g filter="url(#buildingBoxShadow)">
                  
                  {/* 2.1 Porch / Veranda Structure */}
                  {building.porchGeo && (
                    <polygon
                      points={formatPointsString(building.porchGeo, Math.min(building.heightMeters * 0.4, 2.5))}
                      fill={isSelected ? 'rgba(56, 189, 248, 0.70)' : 'rgba(148, 163, 184, 0.60)'}
                      stroke={isSelected ? '#00e5ff' : '#cbd5e1'}
                      strokeWidth={1.2}
                    />
                  )}

                  {/* 2.2 Garage / Outbuilding Structure */}
                  {building.garageGeo && (
                    <polygon
                      points={formatPointsString(building.garageGeo, Math.min(building.heightMeters * 0.5, 3.2))}
                      fill={isSelected ? 'rgba(14, 116, 144, 0.85)' : 'rgba(51, 65, 85, 0.80)'}
                      stroke={isSelected ? '#38bdf8' : '#94a3b8'}
                      strokeWidth={1.4}
                    />
                  )}

                  {/* 2.3 Pool / Courtyard Feature */}
                  {building.poolGeo && (
                    <polygon
                      points={formatPointsString(building.poolGeo, 0)}
                      fill="#0284c7"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                    />
                  )}

                  {/* 2.4 3D Extruded Building Walls (Depth Faces) */}
                  {(tilt > 0 || show3DExtrusions) && (
                    <g>
                      {building.mainBuildingGeo.map(([lng1, lat1], idx) => {
                        const nextIdx = (idx + 1) % building.mainBuildingGeo.length;
                        const [lng2, lat2] = building.mainBuildingGeo[nextIdx];
                        
                        const gPt1 = projectGeoToScreen(lat1, lng1, 0);
                        const gPt2 = projectGeoToScreen(lat2, lng2, 0);
                        const rPt1 = projectGeoToScreen(lat1, lng1, building.heightMeters);
                        const rPt2 = projectGeoToScreen(lat2, lng2, building.heightMeters);
                        
                        const wallFace = `${gPt1.x},${gPt1.y} ${gPt2.x},${gPt2.y} ${rPt2.x},${rPt2.y} ${rPt1.x},${rPt1.y}`;
                        const faceShade = (idx % 2 === 0) ? 0.85 : 0.65;

                        return (
                          <polygon
                            key={`wall-${idx}`}
                            points={wallFace}
                            fill={isSelected ? `rgba(0, 188, 212, ${faceShade})` : `rgba(30, 41, 59, ${faceShade})`}
                            stroke={isSelected ? '#00e5ff' : '#475569'}
                            strokeWidth={1.0}
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* 2.5 Main Elevated Roof Box / Footprint */}
                  <polygon
                    points={roofBldgPoints}
                    fill={
                      isSelected
                        ? '#00bcd4'
                        : isHovered
                        ? '#0284c7'
                        : building.roofColor || '#334155'
                    }
                    stroke={isSelected ? '#00e5ff' : isHovered ? '#38bdf8' : '#64748b'}
                    strokeWidth={isSelected ? 3.0 : isHovered ? 2.2 : 1.6}
                    className={isSelected ? 'cadastre-selected-pulse transition-all duration-300' : 'transition-all duration-150'}
                  />

                  {/* 2.6 Roof Ridge Line & Pitch Facets */}
                  {building.roofRidge?.map(([p1, p2], idx) => {
                    const r1 = projectGeoToScreen(p1[1], p1[0], building.heightMeters * 1.15);
                    const r2 = projectGeoToScreen(p2[1], p2[0], building.heightMeters * 1.15);
                    return (
                      <line
                        key={`ridge-${idx}`}
                        x1={r1.x}
                        y1={r1.y}
                        x2={r2.x}
                        y2={r2.y}
                        stroke={isSelected ? '#ffffff' : '#94a3b8'}
                        strokeWidth={2.0}
                      />
                    );
                  })}

                </g>
              )}

              {/* House Number Badge */}
              {showHouseNumbers && (
                <g transform={`translate(${bldgCenterPt.x}, ${bldgCenterPt.y})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 14 : isHovered ? 13 : 11}
                    fill={isSelected ? '#006980' : isHovered ? '#0284c7' : '#0f172a'}
                    stroke={isSelected ? '#00e5ff' : isHovered ? '#38bdf8' : '#334155'}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 1.1}
                    className="shadow-xl transition-all duration-150"
                    filter={isSelected ? 'url(#cadastreGlow)' : undefined}
                  />
                  <text
                    x="0"
                    y="3.5"
                    fill="#ffffff"
                    fontSize={isSelected ? "11" : isHovered ? "11" : "10"}
                    fontWeight="800"
                    textAnchor="middle"
                    className="font-sans select-none"
                  >
                    {houseNum}
                  </text>
                </g>
              )}

              {/* Boundary vertex markers for Deeds Office precision */}
              {isSelected && building.cadastralLotGeo.map(([lng, lat], idx) => {
                const cornerPt = projectGeoToScreen(lat, lng, 0);
                const pegLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                return (
                  <g key={`peg-${idx}`}>
                    <circle
                      cx={cornerPt.x}
                      cy={cornerPt.y}
                      r="4.5"
                      fill="#00bcd4"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cornerPt.x + 8}
                      y={cornerPt.y - 6}
                      fill="#00e5ff"
                      fontSize="10"
                      fontWeight="extrabold"
                      className="font-mono"
                    >
                      {pegLetters[idx] || idx + 1}
                    </text>
                  </g>
                );
              })}

            </g>
          );
        })}
      </svg>

      {/* 3. GIS LAYER CONTROLS (CartoDB Dark / Satellite / OpenStreetMap) */}
      <div className="absolute top-14 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-xl text-xs pointer-events-auto">
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

        {/* Street & Cluster Filter toggle -- moved here, next to the
            basemap switches, per the requested layout. Panel + filter
            state still live in CadastralMap (the parent); this is just
            the trigger button. */}
        {onToggleStreetFilters && (
          <button
            id="layer-street-cluster-filter"
            onClick={onToggleStreetFilters}
            className={`ml-1 pl-2 border-l border-slate-700 flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              showStreetFilters ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Streets
          </button>
        )}
      </div>

      {/* 4. QUICK NAVIGATION & RECENTER PRESETS */}
      <div className="absolute bottom-14 right-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-xl pointer-events-auto">
        <button
          id="btn-recenter-selection"
          onClick={() => {
            if (selectedProperty?.gps) {
              setCenter({ lat: selectedProperty.gps.lat, lng: selectedProperty.gps.lng });
              setZoomLevel(17.4);
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
