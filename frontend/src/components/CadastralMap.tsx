import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Layers, 
  Map as MapIcon, 
  Navigation, 
  SlidersHorizontal,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { PropertyRecord } from '../types';
import { CadastralTooltip } from './CadastralTooltip';
import { GoogleMapPolygons } from './GoogleMapPolygons';
import { RealCadastreMap, extractHouseNumber } from './RealCadastreMap';
import { PropertyPopupCard } from './PropertyPopupCard';
import { StreetFilterControls } from './StreetFilterControls';
import { CompassTool } from './CompassTool';
import { CADASTRAL_STREETS, filterPropertiesByStreet, formatWGS84 } from '../utils/cadastralFilters';
import { pullProperty24RadiusListings, radiusListingToPropertyRecord, createPropertyFromRadiusListing, Property24RadiusResponse } from '../services/api';

interface CadastralMapProps {
  properties: PropertyRecord[];
  selectedProperty: PropertyRecord | null;
  onSelectProperty: (property: PropertyRecord) => void;
  isSidebarOpen: boolean;
  onOpenCMAEngine?: () => void;
  onOpenPDFReport?: () => void;
  onOpenContactOwner?: (property: PropertyRecord) => void;
  onOpenPortalSync?: () => void;
  // Bubbles newly-pulled live Property24 listings up to App.tsx so they
  // actually render as pins/polygons on the map -- previously
  // handlePullRadiusListings only showed a "Pulled N listings" toast and
  // discarded the results, so the button did nothing visible beyond that.
  onLivePropertiesAdded?: (properties: PropertyRecord[]) => void;
}

export const CadastralMap: React.FC<CadastralMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  isSidebarOpen,
  onOpenCMAEngine,
  onOpenPDFReport,
  onOpenContactOwner,
  onOpenPortalSync,
  onLivePropertiesAdded
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  // Only pass a mapId to the Google Map when one is explicitly configured --
  // this is what avoids the ApiProjectMapError / "no valid Map ID" warning
  // and gates AdvancedMarker usage below (no arbitrary DEMO_MAP_ID fallback).
  const configuredMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined;

  // AWS/GIS-first default: the merged vector+live cadastral engine (see
  // RealCadastreMap.tsx -- now backed by real getCadastralParcels() data,
  // not hand-drawn demo lots) has no third-party map key requirement and
  // is the sole map experience; the old separate "Vector Cadastre (SG
  // Diagram)" / "Live Cadastre (Every Parcel)" engine picker is gone
  // (per explicit request) since there's only one option now. Google
  // Maps Platform remains reachable programmatically (see
  // handleGmAuthFailure's fallback) but isn't user-selectable in the UI.
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

  // Compass / Orientation Tool: bearing, tilt (2D plan vs 3D oblique),
  // and building footprint render mode -- all driven into RealCadastreMap
  // as controlled props so the SVG canvas actually rotates/tilts/extrudes.
  const [mapHeading, setMapHeading] = useState(0);
  const [mapTilt, setMapTilt] = useState(0);
  const [buildingRenderMode, setBuildingRenderMode] = useState<'building_boxes' | 'cadastre_lots' | 'hybrid'>('hybrid');
  const [show3DExtrusions, setShow3DExtrusions] = useState(false);

  // Dynamic WGS84 cursor tracking -- updated by RealCadastreMap's mouse
  // move handler via inverse Web Mercator projection; falls back to the
  // selected property's coordinates when the cursor isn't over the map.
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Live Property24 radius pull (Apify, includeFullDetails -- real
  // prices, descriptions and every listing photo within the current CMA
  // radius of the selected property or map center).
  const [isPullingListings, setIsPullingListings] = useState(false);
  const [radiusPullResult, setRadiusPullResult] = useState<Property24RadiusResponse | null>(null);
  const [radiusPullError, setRadiusPullError] = useState<string | null>(null);

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

  const handlePullRadiusListings = async () => {
    setIsPullingListings(true);
    setRadiusPullError(null);
    try {
      const fallbackSuburb = selectedProperty?.suburb || 'Camps Bay';
      const fallbackCity = selectedProperty?.municipality || 'Cape Town';
      const searchLocation = selectedProperty
        ? `${selectedProperty.suburb}, ${selectedProperty.province || 'Western Cape'}`
        : 'Camps Bay, Cape Town';
      const propType = selectedProperty?.accommodation?.type?.toLowerCase().includes('apartment')
        || selectedProperty?.accommodation?.type?.toLowerCase().includes('sectional')
        ? 'apartment'
        : 'house';
      const result = await pullProperty24RadiusListings(
        currentCenter.lat,
        currentCenter.lng,
        radiusMeters,
        searchLocation,
        propType,
        40
      );
      setRadiusPullResult(result);

      // Convert every pulled listing to a real PropertyRecord and render
      // it on the map immediately -- previously this data was fetched
      // and then discarded, so the button did nothing beyond a toast.
      const known = new Set(properties.map(p => `${p.address}|${p.suburb}`.toLowerCase()));
      const newRecords = result.listings
        .filter(l => l.latitude && l.longitude)
        .map(l => radiusListingToPropertyRecord(l, fallbackSuburb, fallbackCity))
        .filter(r => !known.has(`${r.address}|${r.suburb}`.toLowerCase()));

      if (newRecords.length > 0) {
        onLivePropertiesAdded?.(newRecords);
        // Persist in the background so these survive a refresh -- errors
        // here don't affect what's already showing on the map, since the
        // records above are already in local state regardless.
        result.listings
          .filter(l => l.latitude && l.longitude)
          .forEach(l => {
            createPropertyFromRadiusListing(l, fallbackSuburb, fallbackCity).catch(err =>
              console.error('Failed to persist pulled Property24 listing:', err)
            );
          });
      }
    } catch (err: any) {
      setRadiusPullError(err?.message || 'Property24 radius pull failed.');
    } finally {
      setIsPullingListings(false);
    }
  };

  // Auto-pull real Property24 data once on load, instead of only ever
  // showing the small hand-authored PROPERTIES_DATA mock set until
  // someone finds and clicks "Pull Live Property24 Data" -- per explicit
  // request, whatever's already been pulled/cached for this area should
  // just be there by default. Cache-first on the backend (see
  // fetch_full_listings_near / property24_listings_cache), so this is
  // cheap when data already exists for the area and only spends Apify
  // credits on a genuine cache miss. Guarded to fire once (not on every
  // re-render, and not twice under React 18 StrictMode's dev double-
  // invoke) and only for the initial default view -- panning/selecting a
  // different property still goes through the manual button, same as
  // before, rather than silently re-pulling (and potentially re-spending
  // credits) on every map interaction.
  const hasAutoPulledRef = useRef(false);
  useEffect(() => {
    if (hasAutoPulledRef.current) return;
    hasAutoPulledRef.current = true;
    handlePullRadiusListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        {/* Engine Switcher removed entirely per explicit request -- with
            Google Maps already hidden from the UI (see mapEngine's own
            comment above) and "Vector Cadastre (SG Diagram)" / "Live
            Cadastre (Every Parcel)" now merged into one real-data engine
            (RealCadastreMap.tsx), there was only ever one selectable
            option left, so the picker itself is gone rather than kept
            around showing a single button. */}

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

        {/* Live Property24 Radius Pull (Apify -- real prices, descriptions, photos) */}
        <button
          onClick={handlePullRadiusListings}
          disabled={isPullingListings}
          className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg text-xs font-bold text-slate-200 hover:text-white disabled:opacity-60 transition-colors"
          title="Pull live Property24 listings (price, description, photos) within the CMA radius"
        >
          {isPullingListings ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>Pull Live Property24 Data</span>
        </button>

        {/* Street / Precinct Filter Toggle -- Google Maps engine only.
            On the vector engine this same toggle now lives inside
            RealCadastreMap's own Basemap bar, next to "Deeds Plan
            Light" (see showStreetFilters/onToggleStreetFilters props
            passed to it below), so it isn't duplicated across engines. */}
        {mapEngine !== 'vector' && (
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
        )}
      </div>

      {/* Top-right: Compass/Orientation Tool (vector engine only -- it
          drives RealCadastreMap's heading/tilt/building-render-mode
          props, which the Google Maps engine has no equivalent for) and
          Fullscreen toggle, mirroring the top-left engine bar. */}
      <div className="absolute top-3 right-3 z-20 flex items-start gap-1.5 pointer-events-auto">
        {/* CompassTool (heading/tilt/3D building controls) hidden for
            now -- keeping things simple. Re-enable by uncommenting this
            block; heading/tilt/buildingRenderMode/show3DExtrusions state
            and the props wired into RealCadastreMap below are untouched. */}
        {false && mapEngine === 'vector' && (
          <CompassTool
            heading={mapHeading}
            onHeadingChange={setMapHeading}
            tilt={mapTilt}
            onTiltChange={setMapTilt}
            buildingRenderMode={buildingRenderMode}
            onBuildingRenderModeChange={setBuildingRenderMode}
            show3DExtrusions={show3DExtrusions}
            onToggle3DExtrusions={setShow3DExtrusions}
          />
        )}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 shadow-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
            onOpenContact={() => onOpenContactOwner?.(selectedProperty)}
            onOpenPortalSync={onOpenPortalSync}
          />
        </div>
      )}

      {/* Property24 radius pull result / error banner */}
      {(radiusPullResult || radiusPullError) && (
        <div className={`absolute top-14 right-3 z-30 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 max-w-md animate-fade-in pointer-events-auto text-xs ${
          radiusPullError ? 'bg-red-950/90 border border-red-500/80 text-red-200' : 'bg-emerald-950/90 border border-emerald-500/80 text-emerald-200'
        }`}>
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-[11px]">
            {radiusPullError
              ? radiusPullError
              : `Pulled ${radiusPullResult?.count ?? 0} live Property24 listing(s) within ${((radiusPullResult?.radiusMeters ?? 0) / 1000).toFixed(2)} km.`}
          </span>
          <button
            onClick={() => { setRadiusPullResult(null); setRadiusPullError(null); }}
            className="hover:text-white font-bold text-xs ml-1"
          >
            ✕
          </button>
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
                defaultZoom={17}
                mapTypeId={googleMapType}
                gestureHandling="greedy"
                disableDefaultUI={false}
                streetViewControl={true}
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
        /* VECTOR CADASTRAL ENGINE WITH REAL-WORLD MAP BASEMAP (SG DIAGRAM
           ACCURACY) -- now backed by real, live per-parcel boundaries
           from the City of Cape Town's Open Data cadastre (see
           RealCadastreMap.tsx's own liveSurroundingParcels fetch), not
           hand-drawn demo lots. This used to be a separate "Live
           Cadastre (Every Parcel)" engine (LiveCadastreMap.tsx); that
           component has been retired and merged in here so the one
           remaining map keeps every bit of UI this file already built
           (basemap switching, CMA radius, popup card, etc.) while also
           being real data. */
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
          heading={mapHeading}
          onHeadingChange={setMapHeading}
          tilt={mapTilt}
          onTiltChange={setMapTilt}
          buildingRenderMode={buildingRenderMode}
          onBuildingRenderModeChange={setBuildingRenderMode}
          show3DExtrusions={show3DExtrusions}
          onToggle3DExtrusions={setShow3DExtrusions}
          onCursorCoordsChange={setCursorCoords}
          showStreetFilters={showStreetFilters}
          onToggleStreetFilters={() => setShowStreetFilters((prev) => !prev)}
        />
      )}

      {/* Bottom Map Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">

        {/* Cadastral Coordinates Badge -- dynamic WGS84 cursor tracking
            while hovering the vector cadastre canvas, falling back to the
            selected property's coordinates when idle or on Google Maps. */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 font-mono shadow-lg flex items-center gap-2 pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            WGS84: {cursorCoords
              ? formatWGS84(cursorCoords.lat, cursorCoords.lng)
              : (selectedProperty?.gps.formatted || '18.401027°E 33.908760°S')}
          </span>
          <span className="border-l border-slate-700 pl-2 text-slate-400 hidden sm:inline">
            SG Cadastre Ref: {hoveredErf ? `C0160021-${hoveredErf}` : 'C0160021'}
          </span>
        </div>

        {/* Fullscreen toggle moved to the top-right cluster (mirroring the
            top-left Engine Switcher) per explicit request -- was down here
            stacked with the (now-removed) redundant zoom buttons, out of
            the way of the map's other bottom-right controls. */}

      </div>

    </div>
  );
};
