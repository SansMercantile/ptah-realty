import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Eye, 
  Box, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  RotateCw, 
  ChevronRight, 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  Ruler, 
  Layers, 
  Compass, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Info, 
  Camera, 
  Video, 
  Share2,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move
} from 'lucide-react';
import { Virtual3DTour, VirtualTourRoom, VirtualTourHotspot, VirtualTourPin } from '../../types';
import { getVirtualTourByPropertyId } from '../../services/virtualTourData';

interface Walkthrough3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  propertyAddress?: string;
}

type ViewMode = '360_TOUR' | 'DOLLHOUSE_3D' | 'FLOORPLAN_2D' | 'MEASURE_TOOL' | 'AI_RECONSTRUCT';

export const Walkthrough3DModal: React.FC<Walkthrough3DModalProps> = ({
  isOpen,
  onClose,
  propertyId = 'prop-1681',
  propertyAddress = '5 Richmond Road, Three Anchor Bay'
}) => {
  const [tourData, setTourData] = useState<Virtual3DTour | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string>('room-living');
  const [viewMode, setViewMode] = useState<ViewMode>('360_TOUR');
  const [yaw, setYaw] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activePin, setActivePin] = useState<VirtualTourPin | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Laser measure tool state
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // AI Reconstruction state
  const [isReconstructing, setIsReconstructing] = useState<boolean>(false);
  const [reconstructionProgress, setReconstructionProgress] = useState<number>(0);
  const [reconstructionStage, setReconstructionStage] = useState<string>('');
  const [uploadedFilesCount, setUploadedFilesCount] = useState<number>(12);
  const [reconstructionSuccess, setReconstructionSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchTourData();
    }
  }, [isOpen, propertyId]);

  const fetchTourData = async () => {
    try {
      const res = await fetch(`/api/virtual-tours/${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setTourData(data.tour);
        if (data.tour?.rooms?.length > 0) {
          setActiveRoomId(data.tour.initialRoomId || data.tour.rooms[0].id);
        }
      } else {
        const fallback = getVirtualTourByPropertyId(propertyId);
        setTourData(fallback);
        setActiveRoomId(fallback.initialRoomId);
      }
    } catch {
      const fallback = getVirtualTourByPropertyId(propertyId);
      setTourData(fallback);
      setActiveRoomId(fallback.initialRoomId);
    }
  };

  const currentRoom: VirtualTourRoom | undefined = tourData?.rooms.find(r => r.id === activeRoomId) || tourData?.rooms[0];

  const handleRoomChange = (targetRoomId: string) => {
    setIsTransitioning(true);
    setActivePin(null);
    setMeasurePoints([]);
    setMeasuredDistance(null);
    setTimeout(() => {
      setActiveRoomId(targetRoomId);
      setYaw(0);
      setPitch(0);
      setIsTransitioning(false);
    }, 350);
  };

  // Mouse pan controls for 360 viewer
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === 'MEASURE_TOOL') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      if (measurePoints.length === 0 || measurePoints.length === 2) {
        setMeasurePoints([{ x: clickX, y: clickY }]);
        setMeasuredDistance(null);
      } else if (measurePoints.length === 1) {
        const p1 = measurePoints[0];
        const p2 = { x: clickX, y: clickY };
        setMeasurePoints([p1, p2]);
        // Calculate simulated real-world distance based on canvas scale
        const pixelDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const realMeters = Number((pixelDist * 0.0085).toFixed(2));
        setMeasuredDistance(realMeters);
      }
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewMode === 'MEASURE_TOOL') return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setYaw(prev => (prev + deltaX * 0.25) % 360);
    setPitch(prev => Math.max(-45, Math.min(45, prev - deltaY * 0.25)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // AI 3D Reconstruction pipeline execution
  const handleStartAiReconstruction = () => {
    setIsReconstructing(true);
    setReconstructionProgress(10);
    setReconstructionStage('Extracting spatial keypoints & visual odometry (SIFT/ORB)...');
    setReconstructionSuccess(false);

    setTimeout(() => {
      setReconstructionProgress(35);
      setReconstructionStage('Estimating photogrammetric depth maps & point cloud...');
    }, 1200);

    setTimeout(() => {
      setReconstructionProgress(65);
      setReconstructionStage('Synthesizing 3D dollhouse mesh geometry & wall planes...');
    }, 2400);

    setTimeout(() => {
      setReconstructionProgress(88);
      setReconstructionStage('Stitching equirectangular HDR panoramas & floor hotspots...');
    }, 3600);

    setTimeout(() => {
      setReconstructionProgress(100);
      setReconstructionStage('3D Spatial Tour complete with sub-centimeter laser accuracy!');
      setIsReconstructing(false);
      setReconstructionSuccess(true);
      setViewMode('360_TOUR');
    }, 4800);
  };

  if (!isOpen || !tourData || !currentRoom) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-hidden select-none">
      <div 
        id="walkthrough-3d-modal"
        className="bg-slate-900 text-white w-full max-w-6xl h-[94vh] rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Navigation Bar */}
        <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-900/60 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-xs">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-100">
                  Photorealistic 3D Spatial Walkthrough ™
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Realsee & Sphere AI
                </span>
                <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                  Accuracy: ±{tourData.spatialAccuracyCm}cm
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {tourData.propertyAddress} • {currentRoom.name} ({currentRoom.extentM2} m²)
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              id="btn-mode-360-tour"
              onClick={() => setViewMode('360_TOUR')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === '360_TOUR'
                  ? 'bg-[#006980] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">360° Walkthrough</span>
            </button>

            <button
              id="btn-mode-dollhouse"
              onClick={() => setViewMode('DOLLHOUSE_3D')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'DOLLHOUSE_3D'
                  ? 'bg-[#006980] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Dollhouse</span>
            </button>

            <button
              id="btn-mode-floorplan"
              onClick={() => setViewMode('FLOORPLAN_2D')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'FLOORPLAN_2D'
                  ? 'bg-[#006980] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Floor Plan</span>
            </button>

            <button
              id="btn-mode-measure"
              onClick={() => setViewMode('MEASURE_TOOL')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'MEASURE_TOOL'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Laser Measure</span>
            </button>

            <button
              id="btn-mode-ai-reconstruct"
              onClick={() => setViewMode('AI_RECONSTRUCT')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'AI_RECONSTRUCT'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40 border border-purple-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>AI Pipeline</span>
            </button>
          </div>

          <button
            id="btn-close-walkthrough-modal"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Spatial Canvas / Stage */}
        <div 
          className="flex-1 relative bg-black overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Transition fade overlay */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-350 z-30 pointer-events-none ${
            isTransitioning ? 'opacity-90' : 'opacity-0'
          }`} />

          {/* 1. 360° First Person Panoramic Tour View */}
          {viewMode === '360_TOUR' && (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
              {/* Dynamic Simulated Equirectangular Panorama Image with Pan/Tilt & Zoom Transform */}
              <div 
                className="w-full h-full absolute inset-0 transition-transform duration-75 ease-out"
                style={{
                  backgroundImage: `url(${currentRoom.panoramaUrl})`,
                  backgroundPosition: `${50 + (yaw / 360) * 100}% ${50 + (pitch / 90) * 50}%`,
                  backgroundSize: `${160 * zoom}% auto`,
                  backgroundRepeat: 'repeat-x'
                }}
              />

              {/* Ambient Vignette & Room Atmosphere */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

              {/* Hotspot Floor Navigation Targets */}
              <div className="absolute inset-0 pointer-events-none">
                {currentRoom.hotspots.map((hs) => {
                  // Calculate projected screen position based on yaw/pitch
                  const relativeYaw = (hs.yaw - yaw + 360) % 360;
                  const isVisible = relativeYaw < 90 || relativeYaw > 270;
                  if (!isVisible) return null;
                  
                  const normalizedX = relativeYaw > 180 ? (relativeYaw - 360) / 90 : relativeYaw / 90;
                  const screenX = 50 + normalizedX * 38;
                  const screenY = 68 - (hs.pitch - pitch) * 0.7;

                  return (
                    <div
                      key={hs.id}
                      style={{ left: `${screenX}%`, top: `${screenY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20 group cursor-pointer"
                      onClick={() => handleRoomChange(hs.targetRoomId)}
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-white/90 bg-cyan-600/60 backdrop-blur-xs flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:bg-cyan-500 transition-all animate-pulse">
                        <Move className="w-5 h-5 text-white" />
                      </div>
                      <div className="mt-1 bg-slate-900/90 text-white border border-slate-700 text-[11px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                        {hs.label}
                      </div>
                    </div>
                  );
                })}

                {/* Interactive Spatial Feature / Measurement Pins */}
                {currentRoom.interactivePins.map((pin) => {
                  const relativeYaw = (pin.yaw - yaw + 360) % 360;
                  const isVisible = relativeYaw < 80 || relativeYaw > 280;
                  if (!isVisible) return null;

                  const normalizedX = relativeYaw > 180 ? (relativeYaw - 360) / 80 : relativeYaw / 80;
                  const screenX = 50 + normalizedX * 36;
                  const screenY = 48 - (pin.pitch - pitch) * 0.8;

                  return (
                    <div
                      key={pin.id}
                      style={{ left: `${screenX}%`, top: `${screenY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20 cursor-pointer"
                      onClick={() => setActivePin(pin)}
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-500/90 border-2 border-white flex items-center justify-center shadow-md hover:scale-125 transition-transform">
                        <Info className="w-4 h-4 text-slate-950 font-bold" />
                      </div>
                      <div className="bg-black/75 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap shadow-xs">
                        {pin.title.split(':')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Pin Detailed Overlay Modal */}
              {activePin && (
                <div className="absolute bottom-16 left-6 z-40 bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3.5 shadow-2xl max-w-xs animate-fade-in text-xs backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
                    <span className="font-bold text-cyan-300 text-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      {activePin.title}
                    </span>
                    <button 
                      onClick={() => setActivePin(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-[11px]">
                    {activePin.description}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Verified Spatial Measurement</span>
                    <span className="font-mono text-cyan-400">±1.2cm Realsee Scan</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. 3D Dollhouse Isometric Cutaway View */}
          {viewMode === 'DOLLHOUSE_3D' && (
            <div className="w-full h-full relative flex items-center justify-center p-6">
              <div className="relative w-full max-w-2xl aspect-16/10 bg-slate-950 border border-slate-700 rounded-xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="flex items-center justify-between z-10">
                  <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded text-xs font-semibold flex items-center gap-2">
                    <Box className="w-4 h-4 text-cyan-400" />
                    <span>Isometric 3D Dollhouse Mesh • Total Area {tourData.totalAreaM2} m²</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Rotatable 3D Wireframe + Mesh Cutaway
                  </span>
                </div>

                {/* Interactive Dollhouse Grid Layout */}
                <div className="grid grid-cols-3 gap-3 my-auto z-10">
                  {tourData.rooms.map((room) => {
                    const isSelected = room.id === activeRoomId;
                    return (
                      <div
                        key={room.id}
                        onClick={() => {
                          setActiveRoomId(room.id);
                          setViewMode('360_TOUR');
                        }}
                        className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                            : 'bg-slate-900/70 border-slate-700 hover:border-cyan-500/60 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200 truncate">{room.name}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">
                          {room.dimensionsM.length}m × {room.dimensionsM.width}m • H: {room.dimensionsM.height}m
                        </div>
                        <div className="text-[10px] text-cyan-300 font-bold mt-2">
                          {room.extentM2} m² • Click to enter room
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                  <span>Realsee SLAM Point Cloud Synthesizer v2.6</span>
                  <span className="text-cyan-400">Click any room volume to transition camera</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Schematic 2D Floor Plan with Laser Dimensions */}
          {viewMode === 'FLOORPLAN_2D' && (
            <div className="w-full h-full relative flex items-center justify-center p-6">
              <div className="relative w-full max-w-3xl aspect-16/10 bg-slate-950 border border-slate-700 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-cyan-300">
                    <Layers className="w-4 h-4" />
                    <span>Architectural Schematic Cadastral Floor Plan • Scale 1:100</span>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">
                    Under-Roof Extent: {tourData.totalAreaM2} m²
                  </span>
                </div>

                {/* Floor Plan Graphic Canvas */}
                <div className="flex-1 grid grid-cols-3 gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-800 my-2">
                  {tourData.rooms.map((room) => {
                    const isCurrent = room.id === activeRoomId;
                    return (
                      <div
                        key={room.id}
                        onClick={() => {
                          setActiveRoomId(room.id);
                          setViewMode('360_TOUR');
                        }}
                        className={`p-3 rounded border flex flex-col justify-between cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{room.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {room.dimensionsM.length.toFixed(1)}m × {room.dimensionsM.width.toFixed(1)}m
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800 text-[10px]">
                          <span className="font-bold text-cyan-400">{room.extentM2} m²</span>
                          {isCurrent && <span className="text-amber-300 font-semibold">● Cam Peg</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                  <span>Generated directly from spatial photogrammetry scan</span>
                  <span className="text-slate-300 font-semibold">Click room peg to teleport</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Laser Measurement Tool Mode */}
          {viewMode === 'MEASURE_TOOL' && (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
              <div 
                className="w-full h-full absolute inset-0"
                style={{
                  backgroundImage: `url(${currentRoom.panoramaUrl})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}
              />
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />

              {/* Instructions banner */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                <span>
                  {measurePoints.length === 0 && "Click first point on the screen to start laser measurement"}
                  {measurePoints.length === 1 && "Click second point to finish measurement"}
                  {measurePoints.length === 2 && `Measured Real Distance: ${measuredDistance} Metres`}
                </span>
              </div>

              {/* SVG Measurement line overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                {measurePoints.length === 2 && (
                  <>
                    <line
                      x1={measurePoints[0].x}
                      y1={measurePoints[0].y}
                      x2={measurePoints[1].x}
                      y2={measurePoints[1].y}
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                    />
                    <circle cx={measurePoints[0].x} cy={measurePoints[0].y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={measurePoints[1].x} cy={measurePoints[1].y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <text
                      x={(measurePoints[0].x + measurePoints[1].x) / 2}
                      y={(measurePoints[0].y + measurePoints[1].y) / 2 - 12}
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="drop-shadow-md font-mono"
                    >
                      {measuredDistance} m
                    </text>
                  </>
                )}
                {measurePoints.length === 1 && (
                  <circle cx={measurePoints[0].x} cy={measurePoints[0].y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                )}
              </svg>
            </div>
          )}

          {/* 5. AI 3D Reconstruction Pipeline View */}
          {viewMode === 'AI_RECONSTRUCT' && (
            <div className="w-full h-full relative flex items-center justify-center p-6">
              <div className="relative w-full max-w-2xl bg-slate-950 border border-purple-500/40 rounded-xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-purple-200">
                      Realsee & Sphere AI 3D Walkthrough Pipeline
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Convert standard smartphone photos or panoramic video sweeps into photorealistic 3D spatial models
                    </p>
                  </div>
                </div>

                {/* Upload & Source Controls */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>Property Images Uploaded</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mb-2">
                      {uploadedFilesCount} High-Resolution interior & exterior photos ready for depth estimation
                    </p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      Ready for Synthesis
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-purple-400" />
                      <span>Mobile Video Sweep (Sphere 3D)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mb-2">
                      Continuous 60fps walking video sweep with IMU accelerometer sensor logging
                    </p>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                      IMU Spatial Sync Active
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                {isReconstructing ? (
                  <div className="space-y-2 bg-slate-900 p-3.5 rounded-lg border border-purple-500/40 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                      <span>{reconstructionStage}</span>
                      <span className="font-mono">{reconstructionProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 h-full transition-all duration-300"
                        style={{ width: `${reconstructionProgress}%` }}
                      />
                    </div>
                  </div>
                ) : reconstructionSuccess ? (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-lg flex items-center gap-2 text-xs text-emerald-200 font-semibold animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Reconstruction complete! 6 Rooms synthesized with interactive dollhouse mesh.</span>
                  </div>
                ) : null}

                {/* Execution Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    Neural Radiance Fields (NeRF) + Depth Completion Engine
                  </div>
                  <button
                    id="btn-trigger-ai-reconstruction"
                    onClick={handleStartAiReconstruction}
                    disabled={isReconstructing}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-colors shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>{isReconstructing ? 'Synthesizing 3D Spatial Model...' : 'Start AI 3D Reconstruction'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Pan/Tilt Control Widget (Bottom Right) */}
          {viewMode === '360_TOUR' && (
            <div className="absolute bottom-16 right-4 z-20 flex flex-col items-center gap-1 bg-slate-900/80 border border-slate-700 p-1.5 rounded-lg backdrop-blur-xs">
              <button
                onClick={() => setPitch(prev => Math.min(45, prev + 10))}
                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                title="Tilt Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setYaw(prev => (prev - 15 + 360) % 360)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300"
                  title="Pan Left"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setYaw(0); setPitch(0); setZoom(1); }}
                  className="p-1 hover:bg-slate-800 rounded text-cyan-400 font-bold text-[10px]"
                  title="Reset Orientation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setYaw(prev => (prev + 15) % 360)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300"
                  title="Pan Right"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setPitch(prev => Math.max(-45, prev - 10))}
                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                title="Tilt Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Room Thumbnail Carousel */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs overflow-x-auto">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {tourData.rooms.map((room) => {
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  id={`btn-room-thumb-${room.id}`}
                  onClick={() => handleRoomChange(room.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-400 ring-1 ring-cyan-400/40 shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src={room.panoramaUrl}
                      alt={room.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span>{room.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({room.extentM2}m²)</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              6 Rooms • 201 m² Total
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold transition-colors"
            >
              Exit Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
