import React, { useState } from 'react';
import { 
  Compass, 
  RotateCcw, 
  RotateCw, 
  Box, 
  Layers, 
  Navigation,
  Maximize2,
  ChevronDown,
  Building,
  Check
} from 'lucide-react';

interface CompassToolProps {
  heading: number; // 0 to 360 degrees
  onHeadingChange: (heading: number) => void;
  tilt: number; // 0 (2D) to 45 (3D Isometric)
  onTiltChange: (tilt: number) => void;
  buildingRenderMode: 'building_boxes' | 'cadastre_lots' | 'hybrid';
  onBuildingRenderModeChange: (mode: 'building_boxes' | 'cadastre_lots' | 'hybrid') => void;
  show3DExtrusions: boolean;
  onToggle3DExtrusions: (show: boolean) => void;
}

export const CompassTool: React.FC<CompassToolProps> = ({
  heading,
  onHeadingChange,
  tilt,
  onTiltChange,
  buildingRenderMode,
  onBuildingRenderModeChange,
  show3DExtrusions,
  onToggle3DExtrusions
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize heading to [0, 360)
  const normalizedHeading = ((heading % 360) + 360) % 360;

  // Format cardinal direction
  const getCardinalDirection = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round((deg % 360) / 22.5) % 16;
    return directions[idx];
  };

  const handleResetNorth = () => {
    onHeadingChange(0);
  };

  const handleRotateCCW = () => {
    onHeadingChange((normalizedHeading - 15 + 360) % 360);
  };

  const handleRotateCW = () => {
    onHeadingChange((normalizedHeading + 15) % 360);
  };

  const handleSetStreetAxis = () => {
    onHeadingChange(32); // Atlantic Seaboard / Richmond Rd geographic street axis
  };

  const toggleTilt = () => {
    onTiltChange(tilt === 0 ? 45 : 0);
  };

  return (
    <div className="relative pointer-events-auto flex flex-col items-end gap-1.5">
      {/* Main Interactive Compass Button */}
      <div className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-2xl">
        
        {/* Clickable Compass Rose */}
        <button
          id="btn-compass-rose"
          onClick={handleResetNorth}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="relative w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-center transition-all group shadow-inner"
          title={`Heading: ${Math.round(normalizedHeading)}° (${getCardinalDirection(normalizedHeading)}). Click to reset True North (0°)`}
        >
          {/* Outer Compass Ring with Needle */}
          <div 
            className="w-7 h-7 relative flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${-normalizedHeading}deg)` }}
          >
            {/* North Red/Cyan Needle */}
            <div className="absolute top-0 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[9px] border-b-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]" />
            {/* South Slate Needle */}
            <div className="absolute bottom-0 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[9px] border-t-slate-500" />
            {/* Center Pivot */}
            <div className="w-1.5 h-1.5 rounded-full bg-white border border-slate-950 z-10" />
          </div>

          {/* Static North Label at Top of Button */}
          <span className="absolute -top-1 text-[8px] font-extrabold text-cyan-400 font-mono">N</span>
        </button>

        {/* Heading & Tilt Readout */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-0.5 cursor-pointer hover:bg-slate-800/80 rounded transition-colors text-left"
        >
          <div className="text-[11px] font-bold font-mono text-cyan-300 flex items-center gap-1">
            <span>{Math.round(normalizedHeading)}° {getCardinalDirection(normalizedHeading)}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          <div className="text-[9px] text-slate-400 font-sans flex items-center gap-1 font-semibold">
            <span>{tilt > 0 ? '3D Oblique' : '2D Plan'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">{buildingRenderMode === 'building_boxes' ? 'Buildings' : buildingRenderMode === 'cadastre_lots' ? 'Lots' : 'Hybrid'}</span>
          </div>
        </div>

        {/* Quick Tilt 2D/3D Button */}
        <button
          id="btn-toggle-3d-tilt"
          onClick={toggleTilt}
          className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
            tilt > 0
              ? 'bg-cyan-700/80 border-cyan-400 text-white shadow-xs'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={tilt > 0 ? "Switch to 2D Overhead Plan" : "Switch to 3D Isometric Building Perspective"}
        >
          <Box className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-[10px]">{tilt > 0 ? '3D' : '2D'}</span>
        </button>

      </div>

      {/* Expanded Compass & Building Geometry Controls Panel */}
      {isOpen && (
        <div className="w-72 bg-slate-900/95 backdrop-blur-xl p-3 rounded-xl border border-slate-700 shadow-2xl text-xs text-slate-200 animate-fade-in space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-white text-xs">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Compass & Orientation Tool</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          {/* Quick Rotation Buttons */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rotation & Bearing</label>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={handleResetNorth}
                className={`py-1 px-1 rounded text-[11px] font-bold border transition-colors ${
                  normalizedHeading === 0
                    ? 'bg-cyan-800/70 border-cyan-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                0° North
              </button>
              <button
                onClick={handleSetStreetAxis}
                className={`py-1 px-1 rounded text-[11px] font-bold border transition-colors ${
                  Math.abs(normalizedHeading - 32) < 2
                    ? 'bg-cyan-800/70 border-cyan-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Align with Richmond Rd / Atlantic Coastline (32°)"
              >
                32° Street
              </button>
              <button
                onClick={() => onHeadingChange(90)}
                className={`py-1 px-1 rounded text-[11px] font-bold border transition-colors ${
                  normalizedHeading === 90
                    ? 'bg-cyan-800/70 border-cyan-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                90° East
              </button>
              <button
                onClick={() => onHeadingChange(180)}
                className={`py-1 px-1 rounded text-[11px] font-bold border transition-colors ${
                  normalizedHeading === 180
                    ? 'bg-cyan-800/70 border-cyan-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                180° South
              </button>
            </div>

            {/* Stepped fine rotate controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleRotateCCW}
                className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" /> -15° CCW
              </button>
              <button
                onClick={handleRotateCW}
                className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1"
              >
                <RotateCw className="w-3 h-3 text-cyan-400" /> +15° CW
              </button>
            </div>
          </div>

          {/* Building Shape / Footprint Representation */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3 h-3 text-cyan-400" /> Property Shape Layer
              </label>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => onBuildingRenderModeChange('building_boxes')}
                className={`p-1.5 rounded text-[11px] font-bold border transition-all text-center ${
                  buildingRenderMode === 'building_boxes'
                    ? 'bg-[#006980] border-cyan-400 text-white shadow-xs'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Building Box
              </button>
              <button
                onClick={() => onBuildingRenderModeChange('cadastre_lots')}
                className={`p-1.5 rounded text-[11px] font-bold border transition-all text-center ${
                  buildingRenderMode === 'cadastre_lots'
                    ? 'bg-[#006980] border-cyan-400 text-white shadow-xs'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Cadastre Lot
              </button>
              <button
                onClick={() => onBuildingRenderModeChange('hybrid')}
                className={`p-1.5 rounded text-[11px] font-bold border transition-all text-center ${
                  buildingRenderMode === 'hybrid'
                    ? 'bg-[#006980] border-cyan-400 text-white shadow-xs'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Hybrid (Both)
              </button>
            </div>
          </div>

          {/* 3D Architectural Extrusion Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={show3DExtrusions}
                onChange={(e) => onToggle3DExtrusions(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-0 w-3.5 h-3.5 bg-slate-950 border-slate-700"
              />
              <span className="text-[11px] font-semibold text-slate-200">3D Building Height & Roof Facets</span>
            </label>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">
              {tilt > 0 ? '45° Active' : '2D Plan'}
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
