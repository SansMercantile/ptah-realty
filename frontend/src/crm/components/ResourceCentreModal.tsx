import React, { useState } from 'react';
import {
  X,
  Folder,
  FolderOpen,
  FileText,
  Download,
  Search,
  Check,
  FileCode,
  FileArchive,
  Film,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ResourceFileItem } from '../types';

interface ResourceCentreModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ResourceFileItem[];
  folders: string[];
}

export const ResourceCentreModal: React.FC<ResourceCentreModalProps> = ({
  isOpen,
  onClose,
  files,
  folders,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('All Files');
  const [search, setSearch] = useState('');
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredFiles = files.filter((f) => {
    const matchesFolder = selectedFolder === 'All Files' || f.folderCategory === selectedFolder;
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  const handleDownload = (id: string) => {
    setDownloadedId(id);
    setTimeout(() => setDownloadedId(null), 2000);
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'zip':
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      case 'mp4':
        return <Film className="w-5 h-5 text-purple-500" />;
      default:
        return <FileCode className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Ptah Real Estate Enterprise Resource Centre</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Documents & Assets
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official PPRA compliant Offer to Purchase (OTP) contracts, corporate identity assets, and training guides
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contracts, templates, FICA checklists, logos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {filteredFiles.length} resources available
          </span>
        </div>

        {/* 2-Column Explorer: Left folders, Right files */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 text-xs">
          
          {/* Left Folder Tree */}
          <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 p-3 space-y-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30">
            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
            
            <button
              onClick={() => setSelectedFolder('All Files')}
              className={`w-full px-3 py-2 rounded-xl text-left font-semibold flex items-center space-x-2.5 transition cursor-pointer ${
                selectedFolder === 'All Files'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {selectedFolder === 'All Files' ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
              <span>All Files</span>
            </button>

            {folders.map((folder) => {
              const isSelected = selectedFolder === folder;
              const count = files.filter((f) => f.folderCategory === folder).length;
              return (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full px-3 py-2 rounded-xl text-left font-semibold flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {isSelected ? <FolderOpen className="w-4 h-4 shrink-0" /> : <Folder className="w-4 h-4 shrink-0" />}
                    <span className="truncate">{folder}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Files Grid */}
          <div className="md:col-span-8 p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{selectedFolder}</span>
              </h3>
            </div>

            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start space-x-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {file.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {file.description}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                        <span className="font-mono uppercase font-bold">{file.fileType}</span>
                        <span>•</span>
                        <span>{file.fileSize}</span>
                        <span>•</span>
                        <span>{file.downloadCount} downloads</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(file.id)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition cursor-pointer shrink-0"
                    title="Download document"
                  >
                    {downloadedId === file.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
