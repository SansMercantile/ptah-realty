import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Maximize2, 
  Compass, 
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
  RotateCcw
} from 'lucide-react';
import { PropertyRecord } from '../types';
import { extractStreetName } from '../utils/cadastralFilters';

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
}

// CARTO's basemaps.cartocdn.com raster tiles now require an API key (else
// tiles render with a repeated "API key required" watermark -- see
// https://carto.com/basemaps/apikey). Appended as a `key` query param per
// CARTO's own integration docs, using the Ptah-Realty-scoped key from env.
const CARTO_MAPS_API_KEY = import.meta.env.VITE_CARTO_MAPS_API_KEY as string | undefined;
const CARTO_TILE_KEY_PARAM = CARTO_MAPS_API_KEY ? `?key=${CARTO_MAPS_API_KEY}` : '';

// Extract house number from address string (e.g., "5 RICHMOND ROAD" -> "5", "219 MAIN ROAD" -> "219")
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
  showHouseNumbers = true
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
  
  // Real GIS zoom level (15 = neighborhood, 17 = parcel detail, 18 = rooftop/deeds)
  const [zoomLevel, setZoomLevel] = useState<number>(17.4);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragCenterStart, setDragCenterStart] = useState<{ lat: number; lng: number }>(center);
  const [activeTileSource, setActiveTileSource] = useState<'carto-dark' | 'esri-satellite' | 'osm-standard' | 'carto-light'>('carto-dark');
  const [showSurveyGrid, setShowSurveyGrid] = useState(true);
  const [showLotDimensions, setShowLotDimensions] = useState(true);
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

  // When selected property changes, smoothly animate center
  useEffect(() => {
    if (selectedProperty?.gps) {
      setCenter({ lat: selectedProperty.gps.lat, lng: selectedProperty.gps.lng });
    }
  }, [selectedProperty]);

  // Convert real geographic GPS to screen pixel space relative to current center and zoom
  const projectGeoToScreen = (lat: number, lng: number): { x: number; y: number } => {
    const scale = Math.pow(2, zoomLevel);
    const centerWorld = latLngToWorld(center.lat, center.lng);
    const pointWorld = latLngToWorld(lat, lng);
    
    const pixelX = (pointWorld.x - centerWorld.x) * scale + dimensions.width / 2;
    const pixelY = (pointWorld.y - centerWorld.y) * scale + dimensions.height / 2;
    
    return { x: pixelX, y: pixelY };
  };

  // Convert screen pixels back to lat/lng for dragging
  const projectScreenToGeo = (screenX: number, screenY: number, baseCenter: { lat: number; lng: number }, baseZoom: number): { lat: number; lng: number } => {
    const scale = Math.pow(2, baseZoom);
    const centerWorld = latLngToWorld(baseCenter.lat, baseCenter.lng);
    
    const worldX = centerWorld.x + (screenX - dimensions.width / 2) / scale;
    const worldY = centerWorld.y + (screenY - dimensions.height / 2) / scale;
    
    const lng = (worldX / 256 - 0.5) * 360;
    const n = Math.PI - (2 * Math.PI * worldY) / 256;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    
    return { lat, lng };
  };

  // Tile calculation for real OpenStreetMap / CartoDB / Esri satellite raster tiles
  const visibleTiles = useMemo(() => {
    const scale = Math.pow(2, zoomLevel);
    const centerWorld = latLngToWorld(center.lat, center.lng);
    const zoomInt = Math.floor(zoomLevel);
    const tileZoomScale = Math.pow(2, zoomLevel - zoomInt);
    const tileSize = 256 * tileZoomScale;
    
    const numTiles = Math.pow(2, zoomInt);
    const centerTileX = centerWorld.x * Math.pow(2, zoomInt) / 256;
    const centerTileY = centerWorld.y * Math.pow(2, zoomInt) / 256;
    
    const minTileX = Math.floor(centerTileX - (dimensions.width / (2 * tileSize)));
    const maxTileX = Math.floor(centerTileX + (dimensions.width / (2 * tileSize))) + 1;
    const minTileY = Math.floor(centerTileY - (dimensions.height / (2 * tileSize)));
    const maxTileY = Math.floor(centerTileY + (dimensions.height / (2 * tileSize))) + 1;
    
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
          const sub = ['a', 'b', 'c', 'd'][Math.abs(tx + ty) % 4];
          
          if (activeTileSource === 'carto-dark') {
            url = `https://${sub}.basemaps.cartocdn.com/rastertiles/dark_all/${zoomInt}/${wrappedX}/${ty}.png${CARTO_TILE_KEY_PARAM}`;
          } else if (activeTileSource === 'carto-light') {
            url = `https://${sub}.basemaps.cartocdn.com/rastertiles/light_all/${zoomInt}/${wrappedX}/${ty}.png${CARTO_TILE_KEY_PARAM}`;
          } else if (activeTileSource === 'esri-satellite') {
            url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoomInt}/${ty}/${wrappedX}`;
          } else {
            url = `https://${sub}.tile.openstreetmap.org/${zoomInt}/${wrappedX}/${ty}.png`;
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
        dimensions.width / 2 - dx,
        dimensions.height / 2 - dy,
        dragCenterStart,
        zoomLevel
      );
      setCenter(newGeo);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Handle Zoom Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
    const nextZoom = Math.min(Math.max(zoomLevel + zoomDelta, 14.5), 19.5);
    setZoomLevel(nextZoom);
  };

  // Convert property record into geo polygon points
  const getPropertyGeoPolygon = (prop: PropertyRecord): Array<[number, number]> => {
    if (!prop.gps) return [];
    const { lat, lng } = prop.gps;

    if (prop.polygonPoints && prop.polygonPoints.length > 0) {
      const avgX = prop.polygonPoints.reduce((acc, p) => acc + p[0], 0) / prop.polygonPoints.length;
      const avgY = prop.polygonPoints.reduce((acc, p) => acc + p[1], 0) / prop.polygonPoints.length;
      
      const latScale = 0.0000038;
      const lngScale = 0.0000046;

      return prop.polygonPoints.map(([x, y]) => [
        lng + (x - avgX) * lngScale,
        lat - (y - avgY) * latScale
      ]);
    }

    // Default lot footprint
    const side = Math.sqrt(prop.extentM2 || 200) * 0.000008;
    return [
      [lng - side * 0.5, lat + side * 0.5],
      [lng + side * 0.5, lat + side * 0.5],
      [lng + side * 0.5, lat - side * 0.5],
      [lng - side * 0.5, lat - side * 0.5]
    ];
  };

  // Format ZAR currency
  const formatZar = (val?: number) => {
    if (!val) return 'N/A';
    return `R ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  // Compute radius in screen pixels
  const radiusPixel = useMemo(() => {
    if (!selectedProperty?.gps) return 0;
    const p1 = projectGeoToScreen(selectedProperty.gps.lat, selectedProperty.gps.lng);
    // 1 meter in degrees lat ~ 1 / 111139
    const p2 = projectGeoToScreen(selectedProperty.gps.lat + radiusMeters / 111139, selectedProperty.gps.lng);
    return Math.abs(p2.y - p1.y);
  }, [selectedProperty, radiusMeters, zoomLevel, center, dimensions]);

  return (
    <div
      ref={canvasRef}
      id="real-cadastre-map-canvas"
      className="w-full h-full relative overflow-hidden select-none bg-slate-950 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* 1. RASTER TILE LAYER (OpenStreetMap / CartoDB Dark / Esri High-Res Satellite) */}
      <div className="absolute inset-0 pointer-events-none">
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
              opacity: activeTileSource === 'esri-satellite' ? 0.85 : 0.95
            }}
          />
        ))}
      </div>

      {/* 2. CADASTRAL SURVEYOR-GENERAL OVERLAY (SVG GEOGRAPHIC VECTOR LAYER) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          {/* Neon Cadastral Glow Filter */}
          <filter id="cadastreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <pattern id="surveyHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#00bcd4" strokeWidth="1" strokeOpacity="0.25" />
          </pattern>
        </defs>

        {/* Real Cadastral Distance Radius Ring from Selected Erf Centroid */}
        {showRadiusRing && selectedProperty?.gps && (
          <g>
            <circle
              cx={projectGeoToScreen(selectedProperty.gps.lat, selectedProperty.gps.lng).x}
              cy={projectGeoToScreen(selectedProperty.gps.lat, selectedProperty.gps.lng).y}
              r={radiusPixel}
              fill="none"
              stroke="#00bcd4"
              strokeWidth="1.8"
              strokeDasharray="6 4"
              className="animate-pulse opacity-80"
            />
            {/* Radius Badge */}
            <text
              x={projectGeoToScreen(selectedProperty.gps.lat, selectedProperty.gps.lng).x}
              y={projectGeoToScreen(selectedProperty.gps.lat, selectedProperty.gps.lng).y - radiusPixel - 8}
              fill="#38bdf8"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono bg-slate-900"
            >
              {radiusMeters}m CMA Cadastral Radius
            </text>
          </g>
        )}

        {/* Surrounding Cadastral Lots (Neighbouring Registered Erven) */}
        {filteredSurroundingGeoParcels.map((parcel) => {
          const screenPoints = parcel.coords.map(([lng, lat]) => {
            const pt = projectGeoToScreen(lat, lng);
            return `${pt.x},${pt.y}`;
          }).join(' ');

          const centerPt = projectGeoToScreen(parcel.center[1], parcel.center[0]);
          const isHovered = hoveredErfNo === parcel.erf;

          return (
            <g
              key={parcel.erf}
              className="pointer-events-auto cursor-pointer transition-all duration-150"
              onMouseEnter={(e) => {
                setHoveredErfNo(parcel.erf);
                onHoverProperty(null, { x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                onHoverProperty(null, { x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => {
                setHoveredErfNo(null);
                onHoverProperty(null, null);
              }}
            >
              <polygon
                points={screenPoints}
                fill={isHovered ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.55)'}
                stroke={isHovered ? '#38bdf8' : '#475569'}
                strokeWidth={isHovered ? 2 : 1.2}
                strokeDasharray={isHovered ? 'none' : '3 2'}
              />
              
              {/* House Number on Map (Clean Cadastre identifier) */}
              {showHouseNumbers && zoomLevel >= 16.5 && (
                <g transform={`translate(${centerPt.x}, ${centerPt.y})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r={isHovered ? 10.5 : 8.5}
                    fill={isHovered ? 'rgba(2, 132, 199, 0.9)' : 'rgba(15, 23, 42, 0.8)'}
                    stroke={isHovered ? '#38bdf8' : '#475569'}
                    strokeWidth="0.9"
                  />
                  <text
                    x="0"
                    y="3"
                    fill={isHovered ? '#ffffff' : '#cbd5e1'}
                    fontSize={zoomLevel >= 18 ? "10" : "8.5"}
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-sans select-none"
                  >
                    {extractHouseNumber(parcel.street, parcel.erf)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Primary Interactive Valuated Properties */}
        {properties.map((prop) => {
          const isSelected = selectedProperty?.id === prop.id;
          const isHovered = hoveredProperty?.id === prop.id || hoveredErfNo === prop.erfNo;
          const geoPolygon = getPropertyGeoPolygon(prop);
          
          if (geoPolygon.length === 0 || !prop.gps) return null;

          const screenPoints = geoPolygon.map(([lng, lat]) => {
            const pt = projectGeoToScreen(lat, lng);
            return `${pt.x},${pt.y}`;
          }).join(' ');

          const centerPt = projectGeoToScreen(prop.gps.lat, prop.gps.lng);
          const houseNum = extractHouseNumber(prop.address, prop.erfNo);

          return (
            <g
              key={prop.id}
              id={`cadastral-lot-${prop.erfNo}`}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProperty(prop);
              }}
              onMouseEnter={(e) => {
                setHoveredErfNo(prop.erfNo);
                onHoverProperty(prop, { x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                onHoverProperty(prop, { x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => {
                setHoveredErfNo(null);
                onHoverProperty(null, null);
              }}
            >
              {/* Main Cadastral Polygon */}
              <polygon
                points={screenPoints}
                fill={
                  isSelected 
                    ? 'rgba(0, 188, 212, 0.45)' 
                    : isHovered 
                    ? 'rgba(56, 189, 248, 0.35)' 
                    : 'rgba(0, 105, 128, 0.28)'
                }
                stroke={isSelected ? '#00bcd4' : isHovered ? '#38bdf8' : '#00acc1'}
                strokeWidth={isSelected ? 3.2 : isHovered ? 2.6 : 1.8}
                filter={isSelected ? 'url(#cadastreGlow)' : undefined}
                className="transition-all duration-150"
              />

              {/* House Number Badge */}
              {showHouseNumbers && (
                <g transform={`translate(${centerPt.x}, ${centerPt.y})`}>
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
                    fill={isSelected ? '#ffffff' : isHovered ? '#ffffff' : '#f1f5f9'}
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
              {isSelected && geoPolygon.map(([lng, lat], idx) => {
                const cornerPt = projectGeoToScreen(lat, lng);
                const pegLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                return (
                  <g key={idx}>
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
          id="layer-carto-dark"
          onClick={() => setActiveTileSource('carto-dark')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
            activeTileSource === 'carto-dark' ? 'bg-[#006980] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cadastral Dark
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
          id="layer-carto-light"
          onClick={() => setActiveTileSource('carto-light')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
            activeTileSource === 'carto-light' ? 'bg-[#006980] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Deeds Plan Light
        </button>
        <button
          id="layer-osm-standard"
          onClick={() => setActiveTileSource('osm-standard')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
            activeTileSource === 'osm-standard' ? 'bg-[#006980] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Street GIS
        </button>
      </div>

      {/* 4. ON-CANVAS COMPASS & METRIC SCALE BAR */}
      <div className="absolute top-14 right-3 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {/* Real Compass */}
        <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-xl flex items-center justify-center pointer-events-auto">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Compass className="w-8 h-8 text-cyan-400 animate-spin-slow" />
            <span className="absolute text-[8px] font-extrabold text-cyan-300 font-mono -top-1">N</span>
          </div>
        </div>

        {/* Surveyor-General Precision Scale */}
        <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 shadow-lg text-[10px] font-mono text-slate-300 pointer-events-auto flex items-center gap-2">
          <Ruler className="w-3 h-3 text-cyan-400" />
          <span>Zoom: {zoomLevel.toFixed(1)}x</span>
          <span className="border-l border-slate-700 pl-2 text-cyan-300">SG 1:1,250</span>
        </div>
      </div>

      {/* 5. QUICK NAVIGATION PRESETS */}
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
