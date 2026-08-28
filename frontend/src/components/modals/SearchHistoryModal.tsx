import React, { useState } from 'react';
import { 
  X, 
  Search, 
  History, 
  Download, 
  Calendar, 
  User, 
  Home, 
  Building2, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { KYC_INITIAL_HISTORY } from '../../services/mockData';

interface SearchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReRunSearch?: (type: string, query: string) => void;
}

export const SearchHistoryModal: React.FC<SearchHistoryModalProps> = ({
  isOpen,
  onClose,
  onReRunSearch
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [historyItems, setHistoryItems] = useState([
    {
      id: 'sh-1',
      type: 'Person',
      target: 'MULLER STEPHAN FRIDOLIN',
      query: '6703065098084',
      date: '2026-08-27 19:45',
      user: 'Ronald Read',
      status: 'VERIFIED',
      cost: 'R 11.00'
    },
    {
      id: 'sh-2',
      type: 'Address',
      target: '5 RICHMOND ROAD, THREE ANCHOR BAY',
      query: 'Erf 1681 Green Point',
      date: '2026-08-27 18:20',
      user: 'Ronald Read',
      status: 'COMPLETED',
      cost: 'R 0.00 (In Plan)'
    },
    {
      id: 'sh-3',
      type: 'Trust',
      target: 'PIER MANE TRUST',
      query: 'IT 1895/2007',
      date: '2026-08-27 15:10',
      user: 'Ronald Read',
      status: 'VERIFIED',
      cost: 'R 25.00'
    },
    {
      id: 'sh-4',
      type: 'Company',
      target: 'S B G REAL ESTATE PTY LTD',
      query: '2017/337109/07',
      date: '2026-08-26 11:30',
      user: 'Ronald Read',
      status: 'VERIFIED',
      cost: 'R 45.00'
    },
    {
      id: 'sh-5',
      type: 'Property Report',
      target: '11 MUTLEY ROAD, THREE ANCHOR BAY',
      query: 'Erf 1679 Green Point',
      date: '2026-08-25 14:05',
      user: 'Ronald Read',
      status: 'COMPLETED',
      cost: 'R 0.00 (In Plan)'
    }
  ]);

  if (!isOpen) return null;

  const filtered = historyItems.filter(item => {
    const matchesType = filterType === 'ALL' || item.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = item.target.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.query.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Type', 'Target Subject', 'Query / Reference', 'Date', 'User', 'Status', 'Cost'];
    const rows = historyItems.map(h => [
      h.id, h.type, `"${h.target}"`, `"${h.query}"`, h.date, h.user, h.status, h.cost
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Search_Audit_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div 
        id="search-history-modal"
        className="bg-white text-slate-800 w-full max-w-4xl rounded-lg border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">KYC & Search Audit History</h2>
              <span className="text-[10px] text-slate-400">
                NCR & POPIA Compliant 72-Hour Audit Log of all Deeds, IDV and Bureau Enquiries
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <input 
              type="text"
              placeholder="Search history by name, ID or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded px-3 py-1.5 w-64 text-xs focus:ring-1 focus:ring-cyan-500"
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="ALL">All Search Types</option>
              <option value="Person">Person / ID Number</option>
              <option value="Address">Address / Cadastre</option>
              <option value="Company">Company / CIPC</option>
              <option value="Trust">Trust Registry</option>
              <option value="Property">Property Report</option>
            </select>
          </div>

          <button
            onClick={exportCsv}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Audit Log</span>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Target Subject</th>
                  <th className="py-2.5 px-3">Query Identifier</th>
                  <th className="py-2.5 px-3">Cost</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-700">{item.type}</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.target}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-800 text-[11px]">
                      {item.query}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {item.cost}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          if (onReRunSearch) onReRunSearch(item.type, item.query);
                          onClose();
                        }}
                        className="text-cyan-600 hover:text-cyan-800 font-bold text-xs"
                      >
                        Re-open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex justify-between items-center text-xs">
          <span className="text-slate-500">Showing {filtered.length} recent audit logs</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
