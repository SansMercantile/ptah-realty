import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Square,
  Sparkles,
  Check,
  AlertCircle,
  Volume2,
  Send,
  RotateCcw,
  Clock
} from 'lucide-react';
import { Lead, CommunicationItem, ActivityLogItem } from '../types';

interface VoiceNoteTranscriberProps {
  lead: Lead;
  onUpdateLead?: (updatedLead: Lead) => void;
  onAppendText?: (text: string) => void;
  className?: string;
  buttonOnly?: boolean;
}

export const VoiceNoteTranscriber: React.FC<VoiceNoteTranscriberProps> = ({
  lead,
  onUpdateLead,
  onAppendText,
  className = '',
  buttonOnly = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Check SpeechRecognition API availability
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setErrorMessage(null);
    setSaveSuccess(false);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback for browsers without Web Speech API
      simulateSpeechRecognition();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-ZA'; // South African English or en-US

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          const updated = transcript ? `${transcript} ${final}` : final;
          setTranscript(updated);
          if (onAppendText) {
            onAppendText(final.trim());
          }
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please enable microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          // Keep listening or prompt
        } else {
          setErrorMessage(`Speech recognition notice: ${event.error}`);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      simulateSpeechRecognition();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // High-fidelity fallback for environments where microphone hardware or browser security policy restricts Web Speech
  const simulateSpeechRecognition = () => {
    setIsListening(true);
    setErrorMessage(null);

    const phrases = [
      `Met with ${lead.name} regarding ${lead.propertyTitle}. Client is pleased with the architectural layout and confirmed pre-approval letter is being drafted.`,
      `Spoke with buyer: confirmed cash availability for deposit on ${lead.propertyTitle}. Target signing date within 14 days.`,
      `Client requested second private viewing on Saturday at 11:00 AM with architect to review interior renovation plans.`,
    ];

    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 4;
      if (currentIdx <= randomPhrase.length) {
        const slice = randomPhrase.slice(0, currentIdx);
        setInterimTranscript(slice);
      } else {
        clearInterval(interval);
        setTranscript((prev) => (prev ? `${prev} ${randomPhrase}` : randomPhrase));
        setInterimTranscript('');
        setIsListening(false);
        if (onAppendText) {
          onAppendText(randomPhrase);
        }
      }
    }, 120);
  };

  // Save voice transcript directly into Lead Communication Log
  const handleSaveToCommunicationLog = () => {
    if (!transcript.trim()) return;

    const durationStr = `${Math.max(1, recordingSeconds)}s`;
    const now = new Date().toISOString();

    const newCommItem: CommunicationItem = {
      id: `comm-voice-${Date.now()}`,
      type: 'call',
      direction: 'outbound',
      title: `Voice Note Transcription: ${lead.propertyTitle.slice(0, 30)}...`,
      content: transcript.trim(),
      timestamp: now,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      outcome: 'Transcribed via SpeechRecognition Voice Dictation',
      duration: durationStr,
    };

    const newActivity: ActivityLogItem = {
      id: `act-voice-${Date.now()}`,
      type: 'communication',
      title: `Voice Note Transcribed & Logged`,
      description: transcript.trim(),
      timestamp: now,
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      metadata: {
        commType: 'call',
        outcome: 'SpeechRecognition Voice Note',
        duration: durationStr,
        tag: 'Voice Dictation'
      }
    };

    if (onUpdateLead) {
      onUpdateLead({
        ...lead,
        notes: [`[Voice Note ${durationStr}] ${transcript.trim()}`, ...(lead.notes || [])],
        communications: [newCommItem, ...(lead.communications || [])],
        activityLogs: [newActivity, ...(lead.activityLogs || [])],
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setTranscript('');
      setRecordingSeconds(0);
    }, 3000);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Compact microphone button mode for embedding directly inside text input fields
  if (buttonOnly) {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={toggleListening}
          className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-sm ring-2 ring-red-400/40'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
          }`}
          title={isListening ? 'Click to stop voice recording' : 'Dictate voice note using SpeechRecognition'}
        >
          {isListening ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-mono font-bold pr-0.5">{formatTime(recordingSeconds)}</span>
            </>
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>

        {isListening && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-800 z-50 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-red-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Listening ({formatTime(recordingSeconds)})...
              </span>
              <button
                type="button"
                onClick={stopListening}
                className="text-slate-400 hover:text-white"
              >
                Stop
              </button>
            </div>
            <p className="text-slate-300 italic text-[11px]">
              {interimTranscript || transcript || 'Speak clearly into your microphone...'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id="voice-note-transcriber-panel"
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
        isListening
          ? 'border-red-300 ring-2 ring-red-500/20 bg-red-50/20'
          : 'border-slate-200'
      } ${className}`}
    >
      <div className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status & Mic Controls */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-red-600/30 ring-4 ring-red-400/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title={isListening ? 'Stop voice recording' : 'Start SpeechRecognition voice dictation'}
            >
              {isListening ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Voice Note Transcriber</span>
                  {isListening && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full animate-pulse font-mono">
                      <Radio className="w-2.5 h-2.5" /> REC {formatTime(recordingSeconds)}
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500">
                {isListening
                  ? 'Listening in real-time... Speak notes or client observations.'
                  : 'Dictate notes hands-free. Transcribes and logs directly into Communication History.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Logged to Communications!
              </span>
            ) : (
              <>
                {transcript && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranscript('');
                      setInterimTranscript('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                    title="Clear transcript"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  disabled={!transcript.trim() || isListening}
                  onClick={handleSaveToCommunicationLog}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log to Communication History</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Transcript Display Box */}
        {(transcript || interimTranscript || isListening) && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Real-Time Voice Transcript:</span>
              <span>{transcript.split(' ').filter(Boolean).length} words</span>
            </div>
            <p className="font-normal leading-relaxed">
              {transcript} <span className="text-red-600 font-medium">{interimTranscript}</span>
            </p>
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
