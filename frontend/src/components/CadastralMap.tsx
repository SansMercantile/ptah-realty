import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Crosshair, 
  Layers, 
  Ruler, 
  Printer, 
  Compass, 
  Map as MapIcon, 
  Sparkles, 
  Eye, 
  Calculator, 
  Navigation, 
  Info,
  CheckCircle2,
  Building2,
  ExternalLink
} from 'lucide-react';
import { PropertyRecord } from '../types';

interface CadastralMapProps {
  properties: PropertyRecord[];
  selectedProperty: PropertyRecord | null;
  onSelectProperty: (property: PropertyRecord) => void;
  isSidebarOpen: boolean;
  onOpenCMAEngine?: () => void;
  onOpenPDFReport?: () => void;
}

// Background surrounding cadastral lots for visual completeness in Vector Cadastre view
const SURROUNDING_PARCELS = [
  { erf: '1680', points: [[430, 310], [500, 310], [500, 340], [430, 340]], street: '3 Richmond Rd' },
  { erf: '1682', points: [[570, 310], [640, 310], [640, 340], [570, 340]], street: '7 Richmond Rd' },
  { erf: '1683', points: [[640, 310], [710, 310], [710, 340], [640, 340]], street: '9 Richmond Rd' },
  { erf: '1675', points: [[500, 270], [570, 270], [570, 300], [500, 300]], street: '4 Richmond Rd' },
  { erf: '1676', points: [[570, 270], [640, 270], [640, 300], [570, 300]], street: '6 Richmond Rd' },
  { erf: '2092', points: [[150, 240], [240, 230], [250, 350], [160, 360]], street: '217 Main Rd' },
  { erf: '2094', points: [[340, 220], [430, 210], [440, 330], [350, 340]], street: '221 Main Rd' },
  { erf: '1796', points: [[70, 530], [140, 520], [140, 580], [70, 590]], street: '3 Law Rd' },
  { erf: '1798', points: [[220, 510], [290, 500], [290, 560], [220, 570]], street: 'Law Lane' },
  { erf: '973', points: [[290, 480], [360, 480], [360, 550], [290, 550]], street: '15 St Bedes Rd' },
  { erf: '975', points: [[440, 480], [510, 480], [510, 550], [440, 550]], street: '19 St Bedes Rd' },
  { erf: '62', points: [[460, 500], [510, 480], [540, 540], [490, 560]], street: '1 Blackheath Rd' },
  { erf: '64', points: [[560, 460], [610, 440], [640, 500], [590, 520]], street: '5 Blackheath Rd' },
  { erf: '99', points: [[410, 370], [470, 420], [430, 470], [370, 420]], street: '9 Mutley Rd' },
  { erf: '101', points: [[540, 480], [600, 530], [560, 580], [500, 530]], street: '13 Mutley Rd' },
  { erf: '151', points: [[50, 570], [110, 620], [70, 660], [20, 610]], street: '31 Hofmeyr Rd' },
  { erf: '153', points: [[180, 680], [240, 730], [200, 770], [140, 720]], street: '35 Hofmeyr Rd' },
  { erf: '1484', points: [[430, 610], [480, 560], [510, 590], [460, 640]], street: '6 Mount Nelson Rd' },
  { erf: '1486', points: [[530, 510], [580, 460], [610, 490], [560, 540]], street: '10 Mount Nelson Rd' }
];

export const CadastralMap: React.FC<CadastralMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  isSidebarOpen,
  onOpenCMAEngine,
  onOpenPDFReport
}) => {
  // AWS-first default: vector cadastral mode has no third-party map key.
  // An Amazon Location adapter can be enabled later without changing the
  // property selection and radius interaction contracts.
  const [mapEngine] = useState<'vector'>('vector');
  const [showRadiusRing, setShowRadiusRing] = useState(true);
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [showZoningLayer, setShowZoningLayer] = useState(true);
  const [infoWindowProperty, setInfoWindowProperty] = useState<PropertyRecord | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Vector SVG Map States (Fallback & Cadastral Mode)
  const [zoom, setZoom] = useState(1.1);
  const [pan, setPan] = useState({ x: -120, y: -80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredErf, setHoveredErf] = useState<string | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{ property: PropertyRecord; x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Center vector canvas or Google map on selection
  useEffect(() => {
    if (selectedProperty) {
      if (selectedProperty.polygonPoints?.length > 0) {
        const avgX = selectedProperty.polygonPoints.reduce((acc, p) => acc + p[0], 0) / selectedProperty.polygonPoints.length;
        const avgY = selectedProperty.polygonPoints.reduce((acc, p) => acc + p[1], 0) / selectedProperty.polygonPoints.length;
        setPan({ x: 400 - avgX * zoom, y: 300 - avgY * zoom });
      }
      setInfoWindowProperty(selectedProperty);
    }
  }, [selectedProperty]);

  // Vector Pan/Zoom Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.5), 3.5);
    setZoom(newZoom);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatZar = (amount?: number | { totalValue: number }) => {
    const value = typeof amount === 'number' ? amount : amount?.totalValue;
    if (!value) return '-';
    return `R ${value.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  const currentCenter = selectedProperty?.gps 
    ? { lat: selectedProperty.gps.lat, lng: selectedProperty.gps.lng } 
    : { lat: -33.90876, lng: 18.401027 };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full relative overflow-hidden select-none bg-slate-950 flex flex-col"
    >
      {/* Top Map Engine Bar & Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        
        {/* Engine Switcher */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-lg text-xs">
          <button
            disabled
            title="Amazon Location is the production map target; vector cadastral mode is active in this build."
            className="px-3 py-1 rounded font-bold flex items-center gap-1.5 text-slate-500 cursor-not-allowed"
          >
            <MapIcon className="w-3.5 h-3.5 text-orange-300" />
            <span>AWS Location (adapter)</span>
          </button>

          <button
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

      </div>

      {/* Floating Action Badge for Selected Property */}
      {selectedProperty && (
        <div className="absolute top-16 left-3 z-20 bg-slate-900/95 backdrop-blur-md border border-cyan-700/60 p-3 rounded-lg shadow-2xl max-w-sm text-xs space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-cyan-300 text-xs uppercase tracking-wide">
                Active Cadastral Target
              </span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              Erf {selectedProperty.erfNo}
            </span>
          </div>

          <div>
            <div className="font-extrabold text-slate-100 text-sm">{selectedProperty.address}</div>
            <div className="text-slate-400 text-[11px]">{selectedProperty.suburb}, {selectedProperty.township}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500 block">Extent:</span>
              <span className="font-bold text-slate-200">{selectedProperty.extentM2} m²</span>
            </div>
            <div>
              <span className="text-slate-500 block">Municipal Val:</span>
              <span className="font-bold text-emerald-400">{formatZar(selectedProperty.municipalValuation)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {onOpenCMAEngine && (
              <button
                onClick={onOpenCMAEngine}
                className="flex-1 py-1 bg-[#006980] hover:bg-cyan-600 text-white font-bold rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <Calculator className="w-3 h-3" />
                <span>Calculate CMA</span>
              </button>
            )}
            {onOpenPDFReport && (
              <button
                onClick={onOpenPDFReport}
                className="flex-1 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>PDF Dossier</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* AWS-native vector cadastral canvas. Amazon Location can replace this
          renderer later without changing property selection semantics. */}
      {(
        /* VECTOR CADASTRAL SVG CANVAS (SG DIAGRAM ACCURACY) */
        <div
          className="w-full h-full relative cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              
              {/* Surrounding cadastral lots */}
              {SURROUNDING_PARCELS.map((parcel) => (
                <g key={parcel.erf} className="transition-opacity opacity-70 hover:opacity-100">
                  <polygon
                    points={parcel.points.map(p => `${p[0]},${p[1]}`).join(' ')}
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1.2"
                  />
                  <text
                    x={(parcel.points[0][0] + parcel.points[1][0]) / 2}
                    y={(parcel.points[0][1] + parcel.points[2][1]) / 2}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {parcel.erf}
                  </text>
                </g>
              ))}

              {/* Primary Interactive Property Lots */}
              {properties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                const isHovered = hoveredErf === prop.erfNo;
                const pointsString = prop.polygonPoints?.map(p => `${p[0]},${p[1]}`).join(' ') || '';

                return (
                  <g
                    key={prop.id}
                    className="cursor-pointer transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProperty(prop);
                    }}
                    onMouseEnter={(e) => {
                      setHoveredErf(prop.erfNo);
                      const rect = containerRef.current?.getBoundingClientRect();
                      setHoverTooltip({
                        property: prop,
                        x: e.clientX - (rect?.left ?? 0),
                        y: e.clientY - (rect?.top ?? 0),
                      });
                    }}
                    onMouseMove={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      setHoverTooltip({
                        property: prop,
                        x: e.clientX - (rect?.left ?? 0),
                        y: e.clientY - (rect?.top ?? 0),
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredErf(null);
                      setHoverTooltip(null);
                    }}
                  >
                    <polygon
                      points={pointsString}
                      fill={isSelected ? '#006980' : isHovered ? '#1e293b' : '#0284c715'}
                      stroke={isSelected ? '#00bcd4' : '#0284c7'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-colors"
                    />

                    {/* Cadastral Lot Number */}
                    {prop.polygonPoints?.length > 0 && (
                      <text
                        x={prop.polygonPoints[0][0] + 30}
                        y={prop.polygonPoints[0][1] + 25}
                        fill={isSelected ? '#ffffff' : '#38bdf8'}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {prop.erfNo}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Radius ring indicator if active */}
              {showRadiusRing && selectedProperty && selectedProperty.polygonPoints?.length > 0 && (
                <circle
                  cx={selectedProperty.polygonPoints[0][0] + 30}
                  cy={selectedProperty.polygonPoints[0][1] + 25}
                  r={radiusMeters * 0.3}
                  fill="none"
                  stroke="#00bcd4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              )}

            </g>
          </svg>
        </div>
      )}

      {/* Hover tooltip: quick property glance (price, extent, last sale
          date) without needing the full selection panel/modal. Follows
          the cursor via onMouseMove on the polygon, offset so it doesn't
          sit directly under the pointer. */}
      {hoverTooltip && (
        <div
          className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-cyan-700/60 rounded-lg shadow-2xl px-3 py-2 text-xs space-y-1 min-w-[160px]"
          style={{ left: hoverTooltip.x + 14, top: hoverTooltip.y + 14 }}
        >
          <div className="font-bold text-slate-100 text-[12px] flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-cyan-400" />
            Erf {hoverTooltip.property.erfNo}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            <span className="text-slate-500">Price:</span>
            <span className="text-emerald-400 font-semibold text-right">
              {formatZar(hoverTooltip.property.currentSale?.salePrice)}
            </span>
            <span className="text-slate-500">Extent:</span>
            <span className="text-slate-200 font-semibold text-right">
              {hoverTooltip.property.extentM2} m²
            </span>
            <span className="text-slate-500">Last sale:</span>
            <span className="text-slate-200 font-semibold text-right">
              {hoverTooltip.property.currentSale?.saleDate
                ? new Date(hoverTooltip.property.currentSale.saleDate).toLocaleDateString('en-ZA', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        </div>
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
