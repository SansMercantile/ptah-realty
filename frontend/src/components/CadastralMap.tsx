import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Layers, 
  Map as MapIcon, 
  Navigation, 
  SlidersHorizontal
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { PropertyRecord } from '../types';
import { CadastralTooltip } from './CadastralTooltip';
import { GoogleMapPolygons } from './GoogleMapPolygons';
import { RealCadastreMap, extractHouseNumber } from './RealCadastreMap';
import { PropertyPopupCard } from './PropertyPopupCard';
import { StreetFilterControls } from './StreetFilterControls';
import { CADASTRAL_STREETS, filterPropertiesByStreet } from '../utils/cadastralFilters';

interface CadastralMapProps {
  properties: PropertyRecord[];
  selectedProperty: PropertyRecord | null;
  onSelectProperty: (property: PropertyRecord) => void;
  isSidebarOpen: boolean;
  onOpenCMAEngine?: () => void;
  onOpenPDFReport?: () => void;
  onOpenContactOwner?: (property: PropertyRecord) => void;
  onOpenPortalSync?: () => void;
}

export const CadastralMap: React.FC<CadastralMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  isSidebarOpen,
  onOpenCMAEngine,
  onOpenPDFReport,
  onOpenContactOwner,
  onOpenPortalSync
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  // Only pass a mapId to the Google Map when one is explicitly configured --
  // this is what avoids the ApiProjectMapError / "no valid Map ID" warning
  // and gates AdvancedMarker usage below (no arbitrary DEMO_MAP_ID fallback).
  const configuredMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined;

  // AWS/GIS-first default: vector cadastral mode has no third-party map key
  // requirement. Google Maps Platform remains available as a clean,
  // explicit switch when a valid API key (and optionally Map ID) is supplied.
  const [mapEngine, setMapEngine] = useState<'google' | 'vector'>('vector');
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);
  const [googleMapType, setGoogleMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [showRadiusRing, setShowRadiusRing] = useState(true);
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [showZoningLayer, setShowZoningLayer] = useState(true);
  const [infoWindowProperty, setInfoWindowProperty] = useState<PropertyRecord | null>(null);
  const [showPopupCard, setShowPopupCard] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStreetFilters, setShowStreetFilters] = useState(false);

  // Catch Google Maps global auth or project map errors and gracefully
  // fall back to the vector cadastral engine instead of a blank map.
  useEffect(() => {
    const handleGmAuthFailure = () => {
      setGoogleMapsError('Google Maps API reported an authentication error. Switched to High-Precision Cadastral GIS Engine.');
      setMapEngine('vector');
    };

    const prevHandler = (window as unknown as { gm_authFailure?: () => void }).gm_authFailure;
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = handleGmAuthFailure;

    return () => {
      (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = prevHandler;
    };
  }, []);

  // Street-level and cluster filtering state
  const [visibleStreets, setVisibleStreets] = useState<Set<string>>(
    () => new Set(CADASTRAL_STREETS.map((s) => s.name))
  );
  const [activeClusterId, setActiveClusterId] = useState<string>('all');
  const [showSurroundingParcels, setShowSurroundingParcels] = useState<boolean>(true);
  const [showHouseNumbers, setShowHouseNumbers] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FREEHOLD' | 'SECTIONAL'>('ALL');

  const handleToggleStreet = (streetName: string) => {
    setVisibleStreets((prev) => {
      const next = new Set(prev);
      if (next.has(streetName)) {
        next.delete(streetName);
      } else {
        next.add(streetName);
      }
      return next;
    });
    setActiveClusterId('custom');
  };

  // Filtered properties based on active street and category filters --
  // this is what both map engines render, so toggling a street or the
  // freehold/sectional filter actually declutters the canvas.
  const filteredProperties = useMemo(() => {
    return filterPropertiesByStreet(properties, visibleStreets, categoryFilter);
  }, [properties, visibleStreets, categoryFilter]);

  // Hover Tooltip States
  const [hoveredProperty, setHoveredProperty] = useState<PropertyRecord | null>(null);
  const [hoveredSurrounding, setHoveredSurrounding] = useState<{ erf: string; street: string } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [containerBounds, setContainerBounds] = useState<DOMRect | null>(null);

  // Vector SVG Map States (Fallback & Cadastral Mode)
  const [zoom, setZoom] = useState(1.1);
  const [pan, setPan] = useState({ x: -120, y: -80 });
  const [hoveredErf, setHoveredErf] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Center vector canvas or Google map on selection
  useEffect(() => {
    if (selectedProperty) {
      setShowPopupCard(true);
      if (selectedProperty.polygonPoints?.length > 0) {
        const avgX = selectedProperty.polygonPoints.reduce((acc, p) => acc + p[0], 0) / selectedProperty.polygonPoints.length;
        const avgY = selectedProperty.polygonPoints.reduce((acc, p) => acc + p[1], 0) / selectedProperty.polygonPoints.length;
        setPan({ x: 400 - avgX * zoom, y: 300 - avgY * zoom });
      }
      setInfoWindowProperty(selectedProperty);
    }
  }, [selectedProperty]);

  // Update container bounding box on resize
  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        setContainerBounds(containerRef.current.getBoundingClientRect());
      }
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatZar = (amount?: number) => {
    if (!amount) return '-';
    return `R ${amount.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  const currentCenter = selectedProperty?.gps 
    ? { lat: selectedProperty.gps.lat, lng: selectedProperty.gps.lng } 
    : { lat: -33.90876, lng: 18.401027 };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full relative overflow-hidden select-none bg-slate-950 flex flex-col"
    >
      {/* Floating Hover-State Tooltip for Cadastral Polygons */}
      <CadastralTooltip
        property={hoveredProperty}
        surroundingParcel={hoveredSurrounding}
        position={tooltipPosition}
        containerBounds={containerBounds}
      />

      {/* Top Map Engine Bar & Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">

        {/* Engine Switcher */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-lg text-xs">
          <button
            onClick={() => setMapEngine('google')}
            className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1.5 ${
              mapEngine === 'google'
                ? 'bg-[#006980] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-cyan-300" />
            <span>Google Maps Platform</span>
          </button>

          <button
            onClick={() => setMapEngine('vector')}
            className={`px-3 py-1 rounded font-bold transition-all flex items-center gap-1.5 ${
              mapEngine === 'vector'
                ? 'bg-[#006980] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-300" />
            <span>Vector Cadastre (SG Diagram)</span>
          </button>
        </div>

        {/* Google Map Type Switcher (When Google Maps Active) */}
        {mapEngine === 'google' && (
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-lg text-xs">
            <button
              onClick={() => setGoogleMapType('hybrid')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                googleMapType === 'hybrid' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite / Hybrid
            </button>
            <button
              onClick={() => setGoogleMapType('roadmap')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                googleMapType === 'roadmap' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cadastral Roadmap
            </button>
            <button
              onClick={() => setGoogleMapType('terrain')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                googleMapType === 'terrain' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Topography
            </button>
          </div>
        )}

        {/* Proximity Radius Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg text-xs">
          <label className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showRadiusRing}
              onChange={(e) => setShowRadiusRing(e.target.checked)}
              className="rounded text-cyan-600 focus:ring-0 w-3.5 h-3.5"
            />
            <span>CMA Radius:</span>
          </label>
          <select
            value={radiusMeters}
            onChange={(e) => setRadiusMeters(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-cyan-300 text-[11px] font-bold focus:outline-hidden"
          >
            <option value={250}>250m</option>
            <option value={500}>500m (Standard)</option>
            <option value={1000}>1.0 km</option>
            <option value={2500}>2.5 km</option>
          </select>
        </div>

        {/* Street / Precinct Filter Toggle */}
        <button
          onClick={() => setShowStreetFilters((prev) => !prev)}
          className={`flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-lg border shadow-lg text-xs font-bold transition-colors ${
            showStreetFilters
              ? 'bg-[#006980] border-cyan-500 text-white'
              : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Streets</span>
        </button>
      </div>

      {/* Street & Precinct Filter Panel */}
      {showStreetFilters && (
        <div className="absolute top-14 right-3 z-30 pointer-events-auto animate-fade-in">
          <StreetFilterControls
            properties={properties}
            visibleStreets={visibleStreets}
            onToggleStreet={handleToggleStreet}
            onSetVisibleStreets={setVisibleStreets}
            activeClusterId={activeClusterId}
            onSelectCluster={setActiveClusterId}
            showSurroundingParcels={showSurroundingParcels}
            onToggleSurroundingParcels={setShowSurroundingParcels}
            showHouseNumbers={showHouseNumbers}
            onToggleHouseNumbers={setShowHouseNumbers}
            categoryFilter={categoryFilter}
            onSetCategoryFilter={setCategoryFilter}
          />
        </div>
      )}

      {/* Property Popup Card with Gallery Carousel & Property24 Details */}
      {selectedProperty && showPopupCard && (
        <div className="absolute top-14 left-3 z-30 pointer-events-auto animate-fade-in">
          <PropertyPopupCard
            property={selectedProperty}
            onClose={() => setShowPopupCard(false)}
            onOpenCMA={onOpenCMAEngine}
            onOpenPDF={onOpenPDFReport}
            onContactOwner={() => onOpenContactOwner?.(selectedProperty)}
            onPortalSync={onOpenPortalSync}
          />
        </div>
      )}

      {/* Notification banner if Google Maps had an auth/project error */}
      {googleMapsError && (
        <div className="absolute top-14 right-3 z-30 bg-amber-950/90 border border-amber-500/80 text-amber-200 text-xs px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 max-w-md animate-fade-in pointer-events-auto">
          <Layers className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="flex-1 text-[11px]">{googleMapsError}</span>
          <button
            onClick={() => setGoogleMapsError(null)}
            className="text-amber-400 hover:text-amber-100 font-bold text-xs ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAP ENGINE RENDER */}
      {mapEngine === 'google' ? (
        apiKey ? (
          <div className="w-full h-full relative">
            <APIProvider
              apiKey={apiKey}
              onError={(err) => {
                console.warn('Google Maps API load error:', err);
                setGoogleMapsError('Google Maps API reported an issue. Using High-Precision Cadastral GIS Engine.');
                setMapEngine('vector');
              }}
            >
              <Map
                mapId={configuredMapId}
                defaultCenter={currentCenter}
                defaultZoom={16}
                mapTypeId={googleMapType}
                gestureHandling="greedy"
                disableDefaultUI={false}
                className="w-full h-full"
              >
                {/* Interactive Google Map Cadastral Polygons */}
                <GoogleMapPolygons
                  properties={filteredProperties}
                  selectedProperty={selectedProperty}
                  hoveredProperty={hoveredProperty}
                  onSelectProperty={(prop) => {
                    onSelectProperty(prop);
                    setInfoWindowProperty(prop);
                  }}
                  onHoverProperty={(prop, pos) => {
                    setHoveredProperty(prop);
                    setHoveredSurrounding(null);
                    setHoveredErf(prop ? prop.erfNo : null);
                    if (containerRef.current) {
                      setContainerBounds(containerRef.current.getBoundingClientRect());
                    }
                    setTooltipPosition(pos);
                  }}
                />

                {/* Markers only render with AdvancedMarker when a verified
                    Map ID is configured -- this is what avoids the
                    "map is initialised without a valid Map ID" warning. */}
                {configuredMapId && filteredProperties.map((prop) => {
                  const isSelected = selectedProperty?.id === prop.id;
                  const isHovered = hoveredProperty?.id === prop.id;
                  const position = prop.gps ? { lat: prop.gps.lat, lng: prop.gps.lng } : null;
                  if (!position) return null;

                  return (
                    <AdvancedMarker
                      key={prop.id}
                      position={position}
                      onClick={() => {
                        onSelectProperty(prop);
                        setInfoWindowProperty(prop);
                      }}
                    >
                      <div
                        className="cursor-pointer transition-transform duration-150 hover:scale-110"
                        onMouseEnter={(e) => {
                          setHoveredProperty(prop);
                          setHoveredSurrounding(null);
                          setHoveredErf(prop.erfNo);
                          if (containerRef.current) setContainerBounds(containerRef.current.getBoundingClientRect());
                          setTooltipPosition({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => {
                          setHoveredProperty(null);
                          setHoveredSurrounding(null);
                          setHoveredErf(null);
                          setTooltipPosition(null);
                        }}
                      >
                        <Pin
                          background={isSelected ? '#00bcd4' : isHovered ? '#38bdf8' : '#006980'}
                          borderColor={isSelected ? '#ffffff' : '#003340'}
                          glyph={extractHouseNumber(prop.address)}
                          glyphColor="#ffffff"
                          scale={isSelected ? 1.3 : isHovered ? 1.15 : 1.0}
                        />
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow for Clicked Property */}
                {infoWindowProperty && infoWindowProperty.gps && (
                  <InfoWindow
                    position={{ lat: infoWindowProperty.gps.lat, lng: infoWindowProperty.gps.lng }}
                    onCloseClick={() => setInfoWindowProperty(null)}
                  >
                    <div className="p-2 text-slate-900 max-w-[220px]">
                      <div className="font-bold text-xs text-[#006980]">{infoWindowProperty.address}</div>
                      <div className="text-[11px] text-slate-600">Erf {infoWindowProperty.erfNo} • {infoWindowProperty.suburb}</div>
                      <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                        Valuation: {formatZar(infoWindowProperty.municipalValuation?.totalValue)}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                        <span>{infoWindowProperty.extentM2} m²</span>
                        <span className="font-bold text-cyan-800">{infoWindowProperty.category}</span>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl max-w-md shadow-2xl space-y-3">
              <div className="w-12 h-12 bg-cyan-950/80 border border-cyan-500/50 rounded-xl flex items-center justify-center mx-auto text-cyan-400">
                <MapIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Google Maps API Key Not Set</h3>
              <p className="text-xs text-slate-400">
                To use Google Maps JavaScript Platform, set <code className="text-cyan-300 font-mono bg-slate-800 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code>.
                Alternatively, enjoy our built-in Surveyor-General GIS Engine with full satellite imagery and cadastral overlays.
              </p>
              <button
                onClick={() => setMapEngine('vector')}
                className="w-full py-2 bg-[#006980] hover:bg-cyan-600 text-white font-bold text-xs rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Switch to GIS Cadastre Map</span>
              </button>
            </div>
          </div>
        )
      ) : (
        /* VECTOR CADASTRAL ENGINE WITH REAL-WORLD MAP BASEMAP (SG DIAGRAM ACCURACY) */
        <RealCadastreMap
          properties={filteredProperties}
          selectedProperty={selectedProperty}
          hoveredProperty={hoveredProperty}
          onSelectProperty={(prop) => {
            onSelectProperty(prop);
            setInfoWindowProperty(prop);
          }}
          onHoverProperty={(prop, pos) => {
            setHoveredProperty(prop);
            setHoveredSurrounding(null);
            setHoveredErf(prop ? prop.erfNo : null);
            if (containerRef.current) {
              setContainerBounds(containerRef.current.getBoundingClientRect());
            }
            setTooltipPosition(pos);
          }}
          showZoningLayer={showZoningLayer}
          showRadiusRing={showRadiusRing}
          radiusMeters={radiusMeters}
          containerBounds={containerBounds}
          showSurroundingParcels={showSurroundingParcels}
          showHouseNumbers={showHouseNumbers}
        />
      )}

      {/* Bottom Map Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">

        {/* Cadastral Coordinates Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 font-mono shadow-lg flex items-center gap-2 pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>WGS84: {selectedProperty?.gps.formatted || "18.401027°E 33.90876°S"}</span>
          <span className="border-l border-slate-700 pl-2 text-slate-400 hidden sm:inline">SG Cadastre Ref: C0160021</span>
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-lg pointer-events-auto">
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.2, 3.5))}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.5))}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

    </div>
  );
};
