import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Check,
  Clock,
  User,
  Shield,
  Layers,
  FileText,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Lead, CommunicationItem, ActivityLogItem, CallRecording } from '../types';

interface VoipCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
  onOpenTranscribeSummarize?: (recordedDurationSecs: number) => void;
  defaultProvider?: 'Twilio WebRTC' | 'Telviva SA' | 'Browser VoIP';
}

export const VoipCallModal: React.FC<VoipCallModalProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdateLead,
  onOpenTranscribeSummarize,
  defaultProvider = 'Twilio WebRTC',
}) => {
  const [provider, setProvider] = useState<'Twilio WebRTC' | 'Telviva SA' | 'Browser VoIP'>(defaultProvider);
  const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'ringing' | 'connected' | 'ended'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [dialedDigits, setDialedDigits] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [callLogged, setCallLogged] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>([20, 35, 60, 45, 75, 50, 65, 40, 80, 55, 30, 70]);

  const timerRef = useRef<any>(null);
  const waveIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound generator for dial tone & DTMF keypad
  const playTone = (freq1 = 440, freq2 = 480, durationMs = 180) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freq1;
      osc2.frequency.value = freq2;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + durationMs / 1000);
      osc2.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio context might be restricted
    }
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && callStatus !== 'connected') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, callStatus, onClose]);

  // Reset and initialize call when modal opens
  useEffect(() => {
    if (isOpen) {
      setCallStatus('idle');
      setElapsedSeconds(0);
      setIsMuted(false);
      setIsSpeakerMuted(false);
      setShowKeypad(false);
      setDialedDigits('');
      setCallNotes('');
      setCallLogged(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, [isOpen]);

  // Timer while call is connected
  useEffect(() => {
    if (callStatus === 'connected') {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Animate simulated audio waveform
      waveIntervalRef.current = setInterval(() => {
        setAudioLevel(
          Array.from({ length: 14 }, () => Math.floor(Math.random() * 65) + 15)
        );
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, [callStatus]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format human-readable duration
  const formatDurationText = (secs: number) => {
    if (secs < 60) return `${secs} secs`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${m} min ${s} sec` : `${m} min`;
  };

  // Start VoIP call sequence
  const handleStartCall = () => {
    setCallStatus('dialing');
    setCallLogged(false);
    playTone(350, 440, 400); // Dial tone

    // Ringing state after 1.2s
    setTimeout(() => {
      setCallStatus('ringing');
      playTone(440, 480, 800);

      // Connected state after 2.8s
      setTimeout(() => {
        setCallStatus('connected');
      }, 1800);
    }, 1200);
  };

  // Keypad button press
  const handleKeyPress = (digit: string) => {
    setDialedDigits((prev) => prev + digit);
    // DTMF frequencies
    const freqMap: Record<string, [number, number]> = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
    };
    const [f1, f2] = freqMap[digit] || [440, 480];
    playTone(f1, f2, 150);
  };

  // End Call & Auto-Log Duration in Lead History
  const handleEndCall = () => {
    const finalSeconds = Math.max(1, elapsedSeconds);
    setCallStatus('ended');
    playTone(480, 620, 300); // Busy / call termination tone

    if (!callLogged) {
      autoLogCallToLead(finalSeconds);
    }
  };

  // Auto-log call to lead communications, activity logs, and call recordings
  const autoLogCallToLead = (durationSecs: number) => {
    const now = new Date().toISOString();
    const durationText = formatDurationText(durationSecs);
    const durationFormatted = formatTime(durationSecs);

    const commOutcome = durationSecs > 10 ? 'Call Answered & Completed' : 'Brief Call / Voicemail';
    const noteSummary = callNotes.trim()
      ? callNotes.trim()
      : `Outbound VoIP call placed to ${lead.name} (${lead.phone}) via ${provider} SIP Gateway. Discussed ${lead.propertyTitle}.`;

    // 1. Communication Log Item
    const newCommItem: CommunicationItem = {
      id: `comm-voip-${Date.now()}`,
      type: 'call',
      direction: 'outbound',
      title: `VoIP Call via ${provider}: ${lead.propertyTitle.slice(0, 30)}`,
      content: `${noteSummary} (Duration: ${durationText})`,
      timestamp: now,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      outcome: commOutcome,
      duration: durationText,
    };

    // 2. Activity Log Item
    const newActivity: ActivityLogItem = {
      id: `act-voip-${Date.now()}`,
      type: 'communication',
      title: `Outbound VoIP Call Logged (${durationText})`,
      description: noteSummary,
      timestamp: now,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      metadata: {
        commType: 'call',
        outcome: commOutcome,
        duration: durationText,
        tag: `${provider} Voice`,
      },
    };

    // 3. Call Recording Entry
    const newRecording: CallRecording = {
      id: `rec-voip-${Date.now()}`,
      timestamp: now,
      durationSeconds: durationSecs,
      durationFormatted,
      caller: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      recipient: lead.name,
      phoneNumber: lead.phone,
      provider,
      status: 'completed',
      callType: 'outbound_voip',
      sentiment: durationSecs > 60 ? 'positive' : 'neutral',
      summary: noteSummary,
      transcription: `[${provider} Voice Stream] Connected call with ${lead.name} regarding ${lead.propertyTitle}. Agent discussed acquisition timeline and requested follow-up viewing.`,
      actionItems: [
        `Follow up with ${lead.name} regarding discussed terms on ${lead.propertyTitle}`,
      ],
    };

    const updatedLead: Lead = {
      ...lead,
      communications: [newCommItem, ...(lead.communications || [])],
      activityLogs: [newActivity, ...(lead.activityLogs || [])],
      callRecordings: [newRecording, ...(lead.callRecordings || [])],
      notes: [
        `[📞 ${provider} Call (${durationText})]: ${noteSummary}`,
        ...(lead.notes || []),
      ],
      lastContactedAt: now,
      status: lead.status === 'new' ? 'contacted' : lead.status,
    };

    onUpdateLead(updatedLead);
    setCallLogged(true);
  };

  if (!isOpen) return null;

  return (
    <div
      id="voip-call-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && callStatus !== 'connected') {
          onClose();
        }
      }}
    >
      <div
        id="voip-call-modal-container"
        className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Browser VoIP Dialer</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-mono border border-blue-500/30">
                  WebRTC
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Direct 1-Click Calling for Luxury Mandates</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Switcher */}
        <div className="px-5 pt-3 pb-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">Trunk Gateway:</span>
          <div className="flex items-center space-x-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            {(['Twilio WebRTC', 'Telviva SA', 'Browser VoIP'] as const).map((prov) => (
              <button
                key={prov}
                type="button"
                disabled={callStatus === 'connected' || callStatus === 'dialing'}
                onClick={() => setProvider(prov)}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                  provider === prov
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {prov}
              </button>
            ))}
          </div>
        </div>

        {/* Main Calling Stage */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          {/* Avatar / Recipient Badge */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-slate-800 to-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-lg overflow-hidden">
              <span className="text-2xl font-black text-slate-200">
                {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            </div>

            {/* Status Pulse Ring */}
            {callStatus === 'dialing' && (
              <div className="absolute -inset-2 rounded-full border-2 border-amber-400/60 animate-ping" />
            )}
            {callStatus === 'ringing' && (
              <div className="absolute -inset-2 rounded-full border-2 border-blue-400/80 animate-pulse" />
            )}
            {callStatus === 'connected' && (
              <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/80 animate-pulse" />
            )}
          </div>

          {/* Contact Details */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white">{lead.name}</h3>
            <p className="text-sm font-mono text-blue-300 font-semibold">{lead.phone}</p>
            <p className="text-xs text-slate-400 line-clamp-1 max-w-[280px]">
              {lead.propertyTitle} • {lead.propertyLocation}
            </p>
          </div>

          {/* Call Status Indicator & Duration */}
          <div className="text-center">
            {callStatus === 'idle' && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <Radio className="w-3 h-3 text-slate-400" />
                <span>Ready to connect via {provider}</span>
              </div>
            )}

            {callStatus === 'dialing' && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs text-amber-300 animate-pulse">
                <Radio className="w-3 h-3 text-amber-400" />
                <span>Establishing SIP Trunk...</span>
              </div>
            )}

            {callStatus === 'ringing' && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-xs text-blue-300 animate-pulse">
                <PhoneCall className="w-3 h-3 text-blue-400 animate-bounce" />
                <span>Ringing Client Phone...</span>
              </div>
            )}

            {callStatus === 'connected' && (
              <div className="flex flex-col items-center space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">{formatTime(elapsedSeconds)}</span>
                  <span className="text-[10px] text-emerald-400/80">LIVE</span>
                </div>

                {/* Simulated Audio Waveform */}
                <div className="flex items-center justify-center space-x-1 h-8 px-4">
                  {audioLevel.map((height, idx) => (
                    <div
                      key={idx}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-200"
                      style={{ height: `${isMuted ? 4 : height}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {callStatus === 'ended' && (
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Call Finished ({formatDurationText(elapsedSeconds)})</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">
                  ✓ Call duration auto-logged in Lead History
                </p>
              </div>
            )}
          </div>

          {/* Interactive Keypad Section (if toggled) */}
          {showKeypad && (
            <div className="w-full bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-2 animate-in fade-in duration-150">
              <div className="text-center font-mono text-sm text-blue-300 tracking-wider h-6">
                {dialedDigits || <span className="text-slate-500 text-xs">Touch tones</span>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyPress(digit)}
                    className="py-2 rounded-xl bg-slate-700/70 hover:bg-slate-600 text-slate-200 font-bold text-sm transition active:scale-95 cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* In-Call Notes input */}
          {(callStatus === 'connected' || callStatus === 'ended') && (
            <div className="w-full space-y-1 text-left">
              <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>Quick Call Notes & Log</span>
                <span className="text-[10px] text-slate-500">Auto-saved to notes</span>
              </label>
              <textarea
                rows={2}
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Client requested weekend viewing, agreed on 10% deposit terms..."
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-5 bg-slate-800/80 border-t border-slate-700/60 flex flex-col space-y-3">
          {/* Active Call Controls */}
          {callStatus === 'connected' && (
            <div className="flex items-center justify-around py-1">
              {/* Mute Mic */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border transition cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Toggle Keypad */}
              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                className={`p-3 rounded-full border transition cursor-pointer ${
                  showKeypad
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                }`}
                title="Dialpad DTMF"
              >
                <span className="text-xs font-mono font-black">123</span>
              </button>

              {/* Mute Speaker */}
              <button
                type="button"
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className={`p-3 rounded-full border transition cursor-pointer ${
                  isSpeakerMuted
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                }`}
                title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
              >
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Hang Up Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition active:scale-95 cursor-pointer"
                title="End Call & Log Duration"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Idle: Start Call Button */}
          {callStatus === 'idle' && (
            <button
              type="button"
              onClick={handleStartCall}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
            >
              <Phone className="w-4 h-4" />
              <span>Initiate 1-Click Call to {lead.name.split(' ')[0]}</span>
            </button>
          )}

          {/* Dialing / Ringing Cancel Button */}
          {(callStatus === 'dialing' || callStatus === 'ringing') && (
            <button
              type="button"
              onClick={() => setCallStatus('idle')}
              className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition cursor-pointer"
            >
              Cancel Call
            </button>
          )}

          {/* Call Ended Options */}
          {callStatus === 'ended' && (
            <div className="space-y-2">
              {onOpenTranscribeSummarize && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTranscribeSummarize(elapsedSeconds);
                  }}
                  className="w-full py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Transcribe & Extract Action Items with Gemini AI</span>
                </button>
              )}

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Redial Call</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
                >
                  Close & View Lead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
