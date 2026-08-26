import React from 'react';
import { 
  X, 
  Building, 
  Layers, 
  Printer, 
  Phone, 
  FileText, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { PropertyRecord, SectionalUnit } from '../../types';

interface SectionalTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
  onOpenKYCForOwner: (ownerName: string, id: string) => void;
}

export const SectionalTitleModal: React.FC<SectionalTitleModalProps> = ({
  isOpen,
  onClose,
  property,
  onOpenKYCForOwner
}) => {
  if (!isOpen || !property) return null;

  const units: SectionalUnit[] = property.sectionalUnits || [];

  const formatZar = (val?: number) => {
    if (!val) return '-';
    return `R ${val.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="sectional-units-modal"
        className="bg-white text-slate-800 w-full max-w-5xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-200" />
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                Sectional Title Scheme Units: {property.schemeName || property.address}
              </h2>
              <span className="text-[10px] text-cyan-100 block">
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

        {/* Units Table */}
        <div className="p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3">
          <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Registered Units in Scheme</span>
              <strong className="text-sm text-cyan-950 font-bold">{units.length} Registered Units</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-cyan-900 border border-slate-300 rounded font-semibold flex items-center gap-1.5 transition-colors shadow-2xs text-xs"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-700" />
                <span>Print Sectional Register</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded border border-slate-300 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-2">Section No</th>
                  <th className="p-2">Door / Flat No</th>
                  <th className="p-2">Registered Owner</th>
                  <th className="p-2 text-right">Extent (m²)</th>
                  <th className="p-2">PQ Share</th>
                  <th className="p-2 text-right">Last Recorded Sale</th>
                  <th className="p-2">Sale Date</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {units.map((unit) => (
                  <tr key={unit.sectionNo} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 font-bold text-cyan-900 font-mono">Sec {unit.sectionNo}</td>
                    <td className="p-2 font-semibold text-slate-900">{unit.flatNo}</td>
                    <td className="p-2 font-bold text-slate-800">{unit.ownersName}</td>
                    <td className="p-2 text-right text-emerald-800 font-bold">{unit.extentM2} m²</td>
                    <td className="p-2 text-slate-600 font-mono">{unit.participationQuota || `${((unit.pqShare || 0) * 100).toFixed(1)}%`}</td>
                    <td className="p-2 text-right font-bold text-cyan-900">{formatZar(unit.lastSalePrice)}</td>
                    <td className="p-2 text-slate-600">{unit.lastSaleDate || '-'}</td>
                    <td className="p-2">
                      <button
                        onClick={() => onOpenKYCForOwner(unit.ownersName, '7900000000000')}
                        className="px-2 py-0.5 bg-[#006980] hover:bg-teal-700 text-white rounded text-[10px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>KYC</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Sectional Titles Act 95 of 1986 Schedule Registry</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
