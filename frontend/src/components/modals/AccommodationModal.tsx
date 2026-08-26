import React, { useState, useEffect } from 'react';
import { apiFetch } from "../../lib/api";
import { 
  X, 
  Home, 
  Save, 
  Check, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { PropertyRecord, AccommodationDetails, AccommodationType, PropertyUsage, ConditionRating } from '../../types';

interface AccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
  onSaveAccommodation: (updated: AccommodationDetails) => void;
}

export const AccommodationModal: React.FC<AccommodationModalProps> = ({
  isOpen,
  onClose,
  property,
  onSaveAccommodation
}) => {
  const [formData, setFormData] = useState<AccommodationDetails>({
    type: 'House',
    usage: 'Residential',
    condition: 'GOOD',
    specialFeatures: '',
    smallerThanAverage: false,
    largerThanAverage: false,
    age: 0,
    buildingM2: 0,
    bedRooms: 3,
    receptionRms: 2,
    study: 0,
    bathRooms: 2,
    enSuite: 1,
    dommAccom: 0,
    garages: 1,
    pBaysCPorts: 1,
    alarm: false,
    perimSecurity: false,
    pool: false,
    garden: false,
    sprinklerSys: false,
    borehole: false,
    outsideAccom: false,
    tennisCourt: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData({ ...property.accommodation });
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Call live backend API endpoint
      await apiFetch(`/api/properties/${property.id}/accommodation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      onSaveAccommodation(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      onSaveAccommodation(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="accommodation-editor-modal"
        className="bg-white text-slate-800 w-full max-w-4xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-cyan-200" />
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                Update Structural Accommodation
              </h2>
              <span className="text-[10px] text-cyan-100 block font-normal">
                {property.address} • Erf {property.erfNo}, {property.suburb}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-cyan-100 hover:text-white hover:bg-teal-700/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3 text-xs">
          {/* Top Classifications */}
          <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Accommodation Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AccommodationType })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-800 focus:outline-none"
              >
                <option value="House">House</option>
                <option value="House (2 storey)">House (2 storey)</option>
                <option value="House (3 storey)">House (3 storey)</option>
                <option value="Cluster house">Cluster house</option>
                <option value="Cluster house (2 storey)">Cluster house (2 storey)</option>
                <option value="Semi-detached house">Semi-detached house</option>
                <option value="Semi-detached house (2 storey)">Semi-detached house (2 storey)</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Bungalow (wooden holiday/beach house)">Bungalow</option>
                <option value="Sectional title scheme">Sectional title scheme</option>
                <option value="Block of flats">Block of flats</option>
                <option value="Vacant land">Vacant land</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Property Usage</label>
              <select
                value={formData.usage}
                onChange={(e) => setFormData({ ...formData, usage: e.target.value as PropertyUsage })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-800 focus:outline-none"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Block of Flats">Block of Flats</option>
                <option value="Vacant land">Vacant land</option>
                <option value="Mixed Use">Mixed Use</option>
                <option value="Sectional title scheme">Sectional title scheme</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Physical Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as ConditionRating })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-emerald-800 focus:outline-none font-bold"
              >
                <option value="EXCELLENT">EXCELLENT</option>
                <option value="GOOD">GOOD</option>
                <option value="FAIR">FAIR</option>
                <option value="POOR">POOR</option>
                <option value="UNDER RENOVATION">UNDER RENOVATION</option>
              </select>
            </div>
          </div>

          {/* Size & Room Quantities */}
          <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2.5">
            <h3 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              Dimensions & Room Quantities
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Building m²</label>
                <input
                  type="number"
                  value={formData.buildingM2 || ''}
                  onChange={(e) => setFormData({ ...formData, buildingM2: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Approx. Age (Years)</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Bed Rooms</label>
                <input
                  type="number"
                  value={formData.bedRooms ?? 0}
                  onChange={(e) => setFormData({ ...formData, bedRooms: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-cyan-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Bath Rooms</label>
                <input
                  type="number"
                  value={formData.bathRooms ?? 0}
                  onChange={(e) => setFormData({ ...formData, bathRooms: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-cyan-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">En Suite Baths</label>
                <input
                  type="number"
                  value={formData.enSuite ?? 0}
                  onChange={(e) => setFormData({ ...formData, enSuite: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Reception Rooms</label>
                <input
                  type="number"
                  value={formData.receptionRms ?? 0}
                  onChange={(e) => setFormData({ ...formData, receptionRms: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">Garages</label>
                <input
                  type="number"
                  value={formData.garages ?? 0}
                  onChange={(e) => setFormData({ ...formData, garages: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-amber-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-[11px]">P Bays / C Ports</label>
                <input
                  type="number"
                  value={formData.pBaysCPorts ?? 0}
                  onChange={(e) => setFormData({ ...formData, pBaysCPorts: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Property Enhancements & Amenities */}
          <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2.5">
            <h3 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              Security & Leisure Amenities
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'alarm', label: 'Alarm System' },
                { key: 'perimSecurity', label: 'Perimeter Security' },
                { key: 'pool', label: 'Swimming Pool' },
                { key: 'garden', label: 'Landscaped Garden' },
                { key: 'sprinklerSys', label: 'Sprinkler System' },
                { key: 'borehole', label: 'Borehole / Wellpoint' },
                { key: 'outsideAccom', label: 'Outside Domestic' },
                { key: 'tennisCourt', label: 'Tennis Court' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={!!(formData as any)[item.key]}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                    className="accent-[#006980]"
                  />
                  <span className="text-slate-800 text-xs">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Features */}
          <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
            <label className="block text-slate-600 mb-1 text-[11px] font-semibold">Special Features & Agent Remarks</label>
            <textarea
              rows={3}
              value={formData.specialFeatures || ''}
              onChange={(e) => setFormData({ ...formData, specialFeatures: e.target.value })}
              placeholder="e.g. Victorian architectural facade, high ceilings, plunge pool, mountain and ocean views..."
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold transition-colors text-xs"
            >
              No Change / Cancel
            </button>

            <button
              id="btn-save-accommodation"
              type="submit"
              disabled={isSaving}
              className="px-5 py-1.5 bg-[#006980] hover:bg-teal-700 text-white font-bold rounded flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 text-xs"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Accommodation Details'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
