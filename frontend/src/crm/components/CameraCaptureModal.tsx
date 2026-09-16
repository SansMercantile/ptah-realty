import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles,
  Upload,
  RefreshCw,
  FileText,
  ShieldCheck,
  Maximize2,
  ScanLine,
  Sliders,
  CheckCircle2,
  Eye
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (file: File, docType: string) => void;
  leadName?: string;
}

const DOCUMENT_TYPES = [
  { id: 'otp', label: 'Offer to Purchase (OTP)', description: 'Signed residential purchase agreement' },
  { id: 'fica', label: 'FICA ID & Proof of Residence', description: 'Certified South African ID, smart card or passport' },
  { id: 'bond', label: 'Bank Bond Approval', description: 'Pre-approval certificate or mortgage facility grant' },
  { id: 'mandate', label: 'Sole / Dual Mandate Agreement', description: 'Signed seller representation agreement' },
  { id: 'lease', label: 'Residential Lease Agreement', description: 'Rental contract or tenant vetting application' },
];

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptureComplete,
  leadName = 'Client',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>('otp');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isShutterFlashing, setIsShutterFlashing] = useState<boolean>(false);
  const [capturedFileSizeKb, setCapturedFileSizeKb] = useState<number>(0);

  // Start Camera Stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setIsStartingCamera(true);
    setCameraError(null);

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser or environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch((playErr) => {
          console.warn('Video play prevented:', playErr);
        });
      }
      setIsStartingCamera(false);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let message = 'Unable to access camera. Please check browser permissions or use file upload.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No video capture device found on this system.';
      } else if (err.name === 'NotReadableError') {
        message = 'Camera is currently in use by another application.';
      }
      setCameraError(message);
      setIsStartingCamera(false);
    }
  };

  // Switch between front and rear cameras
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Mount/Unmount effect
  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      startCamera(facingMode);
    } else {
      // Cleanup stream when closed
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Snap Photo from Video Stream
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Visual shutter flash effect
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);

    // Approximate size in KB
    const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
    setCapturedFileSizeKb(sizeKb);

    // Pause video track to save battery & CPU
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = false));
    }
  };

  // Retake Photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    if (stream) {
      stream.getVideoTracks().forEach((t) => (t.enabled = true));
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      startCamera(facingMode);
    }
  };

  // Fallback: Upload Photo from File Input or Simulated Sample
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedDataUrl(dataUrl);
      setCapturedFileSizeKb(Math.round(file.size / 1024));
    };
    reader.readAsDataURL(file);
  };

  // Generate Sample High-Resolution Physical OTP Contract Photo
  const handleUseSampleContractPhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background paper texture
    ctx.fillStyle = '#fbfbf8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain / borders
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Header Logo & Watermark
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('PTAH REALTY (PTY) LTD', 80, 110);

    ctx.fillStyle = '#475569';
    ctx.font = '18px sans-serif';
    ctx.fillText('STANDARD AGREEMENT OF SALE & OFFER TO PURCHASE (OTP)', 80, 145);
    ctx.fillText('REF: OTP-CLIFTON-2026-0841 | PROPERTY 24 VERIFIED TRANSACTION', 80, 175);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 200);
    ctx.lineTo(canvas.width - 80, 200);
    ctx.stroke();

    // Contract clauses text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('1. PARTIES TO THE AGREEMENT:', 80, 250);

    ctx.font = '20px sans-serif';
    ctx.fillText(`PURCHASER: ${leadName || 'Alexander Sterling'}`, 100, 290);
    ctx.fillText('IDENTITY NUMBER: 8808285124089 (RSA Certified Green ID)', 100, 325);
    ctx.fillText('MARITAL STATUS: Married out of community of property (Accrual)', 100, 360);
    ctx.fillText('EMAIL: alex.sterling@luminarycap.com  |  PHONE: +27 82 443 8901', 100, 395);

    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('2. PROPERTY DESCRIPTION & IMMOVABLE ASSET:', 80, 460);
    ctx.font = '20px sans-serif';
    ctx.fillText('PROPERTY TITLE: The Clifton Horizon: 5-Bed Architectural Villa', 100, 500);
    ctx.fillText('STREET ADDRESS: 4th Beach, Clifton, Cape Town, 8005', 100, 535);
    ctx.fillText('ERF / CADASTRAL: Erf 412 Clifton, City of Cape Town, Western Cape', 100, 570);
    ctx.fillText('TITLE DEED NUMBER: T38192/2019', 100, 605);

    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('3. PURCHASE PRICE & PAYMENT TERMS:', 80, 670);
    ctx.font = '20px sans-serif';
    ctx.fillText('PURCHASE PRICE: R 42,500,000.00 (Forty-Two Million Five Hundred Thousand ZAR)', 100, 710);
    ctx.fillText('DEPOSIT: R 4,250,000.00 (10%) payable within 7 business days of acceptance.', 100, 745);
    ctx.fillText('PAYMENT METHOD: Cash Buyer via irrevocable bank guarantee.', 100, 780);

    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('4. APPOINTED CONVEYANCING ATTORNEYS:', 80, 845);
    ctx.font = '20px sans-serif';
    ctx.fillText('CONVEYANCER: Bowmans Property & Commercial Law, Cape Town', 100, 885);
    ctx.fillText('CONTACT: conveyancing@bowmanslaw.com | +27 21 480 7800', 100, 920);

    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('5. OCCUPATION & RISK:', 80, 985);
    ctx.font = '20px sans-serif';
    ctx.fillText('VACANT OCCUPATION: On registration of transfer at the Deeds Office.', 100, 1025);
    ctx.fillText('OCCUPATIONAL RENT: R 95,000.00 per calendar month if prior occupation taken.', 100, 1060);

    // Physical Signature & Stamp simulation
    ctx.fillStyle = '#0284c7';
    ctx.font = 'italic 28px serif';
    ctx.fillText('A. Sterling [SIGNED]', 120, 1250);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 1270);
    ctx.lineTo(400, 1270);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('PURCHASER SIGNATURE & WITNESS', 100, 1300);

    // Official Stamp
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.strokeRect(700, 1200, 260, 100);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('COMMISSIONER OF OATHS', 720, 1235);
    ctx.fillText('CERTIFIED TRUE COPY', 735, 1260);
    ctx.fillText('SOUTH AFRICAN POLICE SERVICE', 712, 1285);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
    setCapturedFileSizeKb(Math.round((dataUrl.length * 3) / 4 / 1024));
  };

  // Confirm and Trigger Document Parser
  const handleConfirmAndParse = () => {
    if (!capturedDataUrl) return;

    // Convert Data URL to Blob/File
    const arr = capturedDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });

    const docTypeSuffix = selectedDocType.toUpperCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Physical_Contract_${docTypeSuffix}_${timestamp}.jpg`;
    const file = new File([blob], fileName, { type: mime });

    // Close camera stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    onCaptureComplete(file, selectedDocType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      id="camera-capture-modal-backdrop"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Shutter flash overlay */}
        {isShutterFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200 animate-fade-out" />
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Camera Contract Capture & Vision OCR
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Live Scanner
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Snap physical Offer to Purchase (OTP), FICA ID, or Mandates for instant Vision AI extraction.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Document Classification Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Document Classification:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DOCUMENT_TYPES.slice(0, 4).map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocType(doc.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedDocType === doc.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-400 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{doc.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {doc.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Viewfinder / Preview Screen */}
          <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
            {capturedDataUrl ? (
              /* Captured Review Mode */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={capturedDataUrl}
                  alt="Captured Physical Contract"
                  className="w-full h-full object-contain"
                />

                {/* Top Info Banner */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Photo Captured ({capturedFileSizeKb} KB)
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-200 text-xs font-mono shadow-md">
                    Ready for Vision OCR
                  </span>
                </div>

                {/* Retake Button Floating on Preview */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center space-x-3">
                  <button
                    onClick={handleRetake}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-sm border border-white/20 transition cursor-pointer shadow-lg"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                </div>
              </div>
            ) : cameraError ? (
              /* Error / Fallback State */
              <div className="p-6 text-center space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Camera Feed Unavailable</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => startCamera(facingMode)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Photo from Device</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={handleUseSampleContractPhoto}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                  >
                    📄 Or load realistic physical OTP contract photo for {leadName}
                  </button>
                </div>
              </div>
            ) : (
              /* Live Video Viewfinder */
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Physical Document Guide Overlay (Target Framing Corners) */}
                <div className="absolute inset-6 border-2 border-emerald-400/70 rounded-xl pointer-events-none shadow-2xl flex flex-col justify-between p-3">
                  {/* Top corners */}
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                    <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                  </div>

                  {/* Center Scanning Guide Line */}
                  <div className="text-center">
                    <span className="px-3 py-1 rounded-full bg-black/60 text-emerald-300 text-[11px] font-semibold tracking-wide backdrop-blur-xs">
                      Align contract edges inside frame
                    </span>
                  </div>

                  {/* Bottom corners */}
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                    <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                  </div>
                </div>

                {/* Top Controls Overlay */}
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition cursor-pointer"
                    title="Flip camera"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Capture Button Bar */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    id="snap-physical-contract-photo-btn"
                    className="w-16 h-16 rounded-full bg-white text-emerald-600 p-1 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer border-4 border-emerald-500"
                    title="Capture Photo"
                  >
                    <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden Canvas and File Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Helper Tips Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Vision AI automatically reads buyer signatures, OTP prices, ID numbers, and legal clauses.
              </span>
            </div>

            {!capturedDataUrl && !cameraError && (
              <button
                type="button"
                onClick={handleUseSampleContractPhoto}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold shrink-0 ml-2 cursor-pointer"
              >
                Use Sample OTP
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {capturedDataUrl ? (
              <button
                type="button"
                onClick={handleConfirmAndParse}
                id="confirm-camera-parse-btn"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upload & Parse Contract via AI →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSnapPhoto}
                disabled={!!cameraError}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Contract Photo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
