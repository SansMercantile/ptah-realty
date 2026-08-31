/**
 * PTAH Realty -- Live Cadastre map: real, per-parcel clickable boundaries.
 *
 * The "Vector Cadastre" engine (RealCadastreMap.tsx) draws a small set of
 * hand-authored demo polygons -- it looks good but only covers a handful
 * of streets and can't scale to "every house is clickable" (see the
 * conversation this was built from: hand-vectoring every erf isn't
 * viable). This is the real answer: it fetches actual cadastral parcel
 * boundaries from the City of Cape Town's public Open Data cadastre
 * (see backend api/cadastre.py / services/cadastre.py) for whatever the
 * map is currently looking at, and every returned parcel is a real,
 * clickable Leaflet polygon.
 *
 * What's real vs placeholder, per explicit decision: the boundary shape,
 * erf/SG26 code, street, suburb, ward, zoning, and extent are all real,
 * live data from the City's cadastre. Ownership, sale history, and
 * valuation are NOT available from that free layer -- those fields below
 * are clearly labeled placeholders until a paid provider (Lightstone,
 * PropStats, etc.) is wired in on the backend. Swapping that in later
 * only touches services/cadastre.py and the "Sale Information" /
 * "Municipal Valuation" section below -- nothing about the boundary
 * fetching or click handling changes.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Compass, Info, Loader2, ExternalLink } from 'lucide-react';
import { getCadastralParcels, CadastralParcelFeature } from '../services/api';

const CARTO_MAPS_API_KEY = import.meta.env.VITE_CARTO_MAPS_API_KEY as string | undefined;
const CARTO_TILE_KEY_PARAM = CARTO_MAPS_API_KEY ? `?key=${CARTO_MAPS_API_KEY}` : '';

interface LiveCadastreMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

// Cape Town-wide default (roughly the CBD/Atlantic Seaboard) -- callers
// pass a real center once a subject property is selected.
const DEFAULT_CENTER: [number, number] = [-33.9249, 18.4241];
const DEFAULT_ZOOM = 17;
// Below this zoom, a bbox query would pull far too many parcels (and
// exceed the backend's 0.2-degree bbox cap) -- the layer just doesn't
// render until the user zooms in, with a hint explaining why.
const MIN_ZOOM_FOR_PARCELS = 15;

export const LiveCadastreMap: React.FC<LiveCadastreMapProps> = ({
  centerLat = DEFAULT_CENTER[0],
  centerLng = DEFAULT_CENTER[1],
  zoom = DEFAULT_ZOOM,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const parcelLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const fetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchTokenRef = useRef(0);

  const [isLoadingParcels, setIsLoadingParcels] = useState(false);
  const [parcelCount, setParcelCount] = useState(0);
  const [zoomTooFar, setZoomTooFar] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<CadastralParcelFeature | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refetchParcels = useCallback(() => {
    const map = mapRef.current;
    const layerGroup = parcelLayerGroupRef.current;
    if (!map || !layerGroup) return;

    const currentZoom = map.getZoom();
    if (currentZoom < MIN_ZOOM_FOR_PARCELS) {
      setZoomTooFar(true);
      layerGroup.clearLayers();
      setParcelCount(0);
      return;
    }
    setZoomTooFar(false);

    const bounds = map.getBounds();
    const token = ++fetchTokenRef.current;
    setIsLoadingParcels(true);
    setFetchError(null);

    getCadastralParcels({
      minLng: bounds.getWest(),
      minLat: bounds.getSouth(),
      maxLng: bounds.getEast(),
      maxLat: bounds.getNorth(),
    })
      .then((fc) => {
        // A newer fetch may have started (fast pan/zoom) -- ignore this
        // stale response rather than flicker old parcels back in.
        if (token !== fetchTokenRef.current) return;

        layerGroup.clearLayers();
        fc.features.forEach((feature) => {
          if (!feature.geometry || feature.geometry.type !== 'Polygon') return;
          const rings = feature.geometry.coordinates as [number, number][][];
          const latLngs = rings.map((ring) => ring.map(([lng, lat]) => [lat, lng] as [number, number]));

          const polygon = L.polygon(latLngs, {
            color: '#22d3ee',
            weight: 1.5,
            opacity: 0.9,
            fillColor: '#0e7490',
            fillOpacity: 0.15,
          });

          polygon.on('mouseover', () => polygon.setStyle({ fillOpacity: 0.4, weight: 2.5, color: '#67e8f9' }));
          polygon.on('mouseout', () => polygon.setStyle({ fillOpacity: 0.15, weight: 1.5, color: '#22d3ee' }));
          polygon.on('click', () => setSelectedParcel(feature));

          polygon.addTo(layerGroup);
        });
        setParcelCount(fc.features.length);
        setIsLoadingParcels(false);
      })
      .catch((err) => {
        if (token !== fetchTokenRef.current) return;
        console.error('Failed to load cadastral parcels', err);
        setFetchError('Could not load parcels for this area -- pan/zoom to retry.');
        setIsLoadingParcels(false);
      });
  }, []);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${CARTO_TILE_KEY_PARAM}`, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    parcelLayerGroupRef.current = layerGroup;
    mapRef.current = map;

    const debouncedRefetch = () => {
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
      fetchDebounceRef.current = setTimeout(refetchParcels, 350);
    };
    map.on('moveend', debouncedRefetch);
    map.on('zoomend', debouncedRefetch);
    refetchParcels();

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter when the subject property changes.
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([centerLat, centerLng], Math.max(zoom, MIN_ZOOM_FOR_PARCELS), { duration: 1 });
    }
  }, [centerLat, centerLng, zoom]);

  const p = selectedParcel?.properties;

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-900 rounded-xl overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Status pill */}
      <div className="absolute top-3 left-3 z-[500] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-lg">
        {isLoadingParcels ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        ) : (
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
        )}
        {zoomTooFar ? (
          <span>Zoom in to load real parcels</span>
        ) : fetchError ? (
          <span className="text-amber-300">{fetchError}</span>
        ) : (
          <span>{parcelCount} live parcels &middot; City of Cape Town Cadastre</span>
        )}
      </div>

      {/* Parcel info panel -- opens on click */}
      {selectedParcel && p && (
        <div className="absolute top-3 right-3 z-[500] w-80 max-h-[calc(100%-1.5rem)] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>{p.erfNumber ? `Erf ${p.erfNumber}` : p.sgCode || 'Parcel'}</span>
            </div>
            <button
              onClick={() => setSelectedParcel(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 text-xs">
            {/* Property Information -- real, from the City cadastre */}
            <section>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Property Information</h4>
              <dl className="space-y-1">
                <Row label="Street" value={[p.addressNumber, p.streetName].filter(Boolean).join(' ') || '—'} />
                <Row label="Suburb" value={p.suburb || '—'} />
                <Row label="Ward" value={p.ward || '—'} />
                <Row label="SG26 Code" value={p.sgCode || '—'} mono />
                <Row label="Legal status" value={p.legalStatus || '—'} />
                <Row label="Zoning" value={p.zoning || '—'} />
                <Row label="Extent" value={p.extentM2 ? `${p.extentM2.toLocaleString()} m² (approx.)` : '—'} />
              </dl>
            </section>

            {/* Sale Information / Municipal Valuation -- placeholder until
                a paid deeds/valuation provider is wired in on the backend
                (see services/cadastre.py's module docstring). */}
            <section className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                Sale Information & Municipal Valuation
                <span title="Ownership, sale history, and valuation require a paid data provider (e.g. Lightstone, PropStats) that hasn't been connected yet -- these fields are placeholders.">
                  <Info className="w-3 h-3 text-amber-500" />
                </span>
              </h4>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 text-[11px] text-amber-800 dark:text-amber-300">
                Not available yet -- ownership, sale history, and municipal valuation require a paid deeds/valuation provider that hasn't been connected. Boundary, erf, and zoning data above is real and live.
              </div>
            </section>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${p.addressNumber || ''}+${encodeURIComponent(p.streetName || '')}+${encodeURIComponent(p.suburb || '')}+Cape+Town`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className={`text-slate-900 dark:text-slate-100 font-semibold text-right ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</dd>
  </div>
);
