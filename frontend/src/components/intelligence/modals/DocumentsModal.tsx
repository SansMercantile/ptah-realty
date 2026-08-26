import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  FileCode, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { PropertyRecord } from '../../types';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyRecord | null;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  if (!isOpen || !property) return null;

  const handleDownload = (docName: string) => {
    setDownloadingDoc(docName);
    setTimeout(() => {
      setDownloadingDoc(null);
      // Trigger browser download simulation
      const element = document.createElement('a');
      const file = new Blob([
        `CMA INFO PROPERTY INTELLIGENCE DOSSIER\n` +
        `======================================\n` +
        `Document: ${docName}\n` +
        `Address: ${property.address}\n` +
        `Erf Number: ${property.erfNo}\n` +
        `Suburb: ${property.suburb}\n` +
        `Township: ${property.township}\n` +
        `LPI Code: ${property.lpiCode}\n` +
        `Registered Owner: ${property.currentSale.owner}\n` +
        `Title Deed: ${property.currentSale.titleDeed}\n` +
        `Purchase Price: R ${property.currentSale.salePrice.toLocaleString()}\n` +
        `Extent: ${property.extentM2} m2\n` +
        `Municipal Valuation: R ${property.municipalValuation.totalValue.toLocaleString()}\n` +
        `Zoning: ${property.zoning} (${property.zoningDescription})\n` +
        `Deeds Registry: ${property.deedsOffice}\n` +
        `Generated: ${new Date().toISOString()}\n` +
        `Compliance: Deeds Registries Act 47 of 1937\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${property.address.replace(/\s+/g, '_')}_${docName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="documents-repository-modal"
        className="bg-white text-slate-800 w-full max-w-4xl rounded-md border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-[#006980] px-3.5 py-2.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-200" />
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                Property Documents & Official Deeds Registry
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

        {/* Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto bg-slate-100 space-y-3 text-xs">
          <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-xs text-slate-900 mb-0.5">
              Available Title Deeds & Intelligence Reports
            </h3>
            <p className="text-slate-500 text-[11px]">
              Authenticated extracts directly linked to Title Deed <strong>{property.currentSale.titleDeed}</strong> in the {property.deedsOffice} Deeds Registry.
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'deed-copy',
                title: `Official Title Deed Copy (${property.currentSale.titleDeed})`,
                desc: 'Full scanned legal title deed with historical conveyance endorsements, servitudes, and boundary caveats.',
                badge: 'OFFICIAL DEED',
                badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200'
              },
              {
                id: 'cma-dossier',
                title: 'Comprehensive CMA Property Intelligence Dossier',
                desc: 'Multi-page analytical report with demographic breakdown, historical price trends, and cadastral boundary layout.',
                badge: 'CMA DOSSIER',
                badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
              },
              {
                id: 'valuation-cert',
                title: 'SACPVP Automated Valuation Certificate',
                desc: 'Formal valuation matrix adjusted for structural accommodation condition and comparative vicinity transfers.',
                badge: 'VALUATION CERT',
                badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
              },
              {
                id: 'sg-diagram',
                title: `Surveyor General Cadastral Diagram (SG ${property.erfNo}/Cape)`,
                desc: 'Surveyor-General coordinates, boundary beacon placements, and servitude registrations.',
                badge: 'SG DIAGRAM',
                badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }
            ].map(doc => (
              <div 
                key={doc.id}
                className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${doc.badgeColor}`}>
                      {doc.badge}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{doc.title}</h4>
                  </div>
                  <p className="text-slate-500 text-[11px]">{doc.desc}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleDownload(doc.title)}
                    disabled={downloadingDoc === doc.title}
                    className="px-2.5 py-1 bg-[#006980] hover:bg-teal-700 text-white rounded font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingDoc === doc.title ? 'Generating...' : 'Download Document'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Deeds Registries Act 47 of 1937 Document Archive</span>
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
