import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Phone,
  PhoneCall,
  Mic,
  Clock,
  User,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ListPlus,
  FileText,
  Search,
  Filter,
  Shield,
  Layers,
  Radio,
  Plus
} from 'lucide-react';
import { Lead, CallRecording, TaskItem, ActivityLogItem } from '../types';

interface CallRecordingsViewerProps {
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
  onOpenVoipCall: () => void;
  onOpenTranscribeSummarize: () => void;
}

export const CallRecordingsViewer: React.FC<CallRecordingsViewerProps> = ({
  lead,
  onUpdateLead,
  onOpenVoipCall,
  onOpenTranscribeSummarize,
}) => {
  const recordings = lead.callRecordings || [];

  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(
    recordings.length > 0 ? recordings[0].id : null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 100
  const [currentPlaySecs, setCurrentPlaySecs] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [notesAppended, setNotesAppended] = useState(false);
  const [tasksCreated, setTasksCreated] = useState(false);

  // Audio & synthesis refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Select first recording if none selected and recordings change
  useEffect(() => {
    if (recordings.length > 0 && (!selectedRecordingId || !recordings.some((r) => r.id === selectedRecordingId))) {
      setSelectedRecordingId(recordings[0].id);
    }
  }, [recordings, selectedRecordingId]);

  const selectedRecording = recordings.find((r) => r.id === selectedRecordingId) || recordings[0];

  // Stop playback when recording changes
  useEffect(() => {
    stopPlayback();
    setPlaybackProgress(0);
    setCurrentPlaySecs(0);
  }, [selectedRecordingId]);

  // Audio synthesis for mock recordings that don't have a real Blob file
  const playSynthesizedVoiceTone = (pitch = 440) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      gain.gain.setValueAtTime(isVolumeMuted ? 0 : 0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Audio context may be restricted
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const startPlayback = () => {
    if (!selectedRecording) return;
    setIsPlaying(true);

    if (selectedRecording.audioUrl && audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = isVolumeMuted;
      audioRef.current.play().catch(() => {
        simulatePlaybackProgression();
      });
    } else {
      simulatePlaybackProgression();
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  // Simulated playback stepper for voice recordings
  const simulatePlaybackProgression = () => {
    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    const totalSecs = selectedRecording?.durationSeconds || 60;

    synthIntervalRef.current = setInterval(() => {
      setCurrentPlaySecs((prev) => {
        const next = prev + 1;
        if (next >= totalSecs) {
          stopPlayback();
          setPlaybackProgress(100);
          return totalSecs;
        }
        setPlaybackProgress(Math.round((next / totalSecs) * 100));

        // Soft speech synthesis blip every 2 seconds
        if (next % 2 === 0) {
          const pitches = [260, 320, 440, 380, 510, 480];
          playSynthesizedVoiceTone(pitches[next % pitches.length]);
        }

        return next;
      });
    }, 1000 / playbackRate);
  };

  // Progress scrubber change
  const handleScrub = (newPercent: number) => {
    setPlaybackProgress(newPercent);
    const totalSecs = selectedRecording?.durationSeconds || 60;
    const targetSec = Math.round((newPercent / 100) * totalSecs);
    setCurrentPlaySecs(targetSec);

    if (audioRef.current && selectedRecording?.audioUrl) {
      audioRef.current.currentTime = targetSec;
    }
  };

  // Copy transcript
  const handleCopyTranscript = () => {
    if (!selectedRecording?.transcription) return;
    navigator.clipboard.writeText(selectedRecording.transcription);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  // Append summary to lead notes
  const handleAppendToNotes = () => {
    if (!selectedRecording) return;
    const noteText = `📞 [${selectedRecording.provider} Call Recording (${selectedRecording.durationFormatted})]: ${
      selectedRecording.summary || selectedRecording.transcription
    }`;

    onUpdateLead({
      ...lead,
      notes: [noteText, ...(lead.notes || [])],
    });

    setNotesAppended(true);
    setTimeout(() => setNotesAppended(false), 2500);
  };

  // Convert action items to tasks
  const handleConvertActionItemsToTasks = () => {
    if (!selectedRecording?.actionItems || selectedRecording.actionItems.length === 0) return;

    const newTasks: TaskItem[] = selectedRecording.actionItems.map((item, idx) => ({
      id: `task-rec-${Date.now()}-${idx}`,
      leadId: lead.id,
      leadName: lead.name,
      propertyTitle: lead.propertyTitle,
      title: item,
      dueDate: new Date(Date.now() + (idx + 1) * 24 * 3600 * 1000).toISOString(),
      priority: idx === 0 ? 'urgent' : 'high',
      status: 'pending',
      type: 'followup',
      isAutomated: true,
    }));

    const activity: ActivityLogItem = {
      id: `act-rec-task-${Date.now()}`,
      type: 'task_created',
      title: `Created ${newTasks.length} follow-up tasks from Call Recording`,
      description: `Tasks extracted from call recording with ${lead.name}`,
      timestamp: new Date().toISOString(),
      author: lead.assignedAgent?.name || 'Ptah Real Estate Broker',
      metadata: {
        commType: 'call',
        tag: 'Call Intelligence',
      },
    };

    onUpdateLead({
      ...lead,
      tasks: [...newTasks, ...(lead.tasks || [])],
      activityLogs: [activity, ...(lead.activityLogs || [])],
    });

    setTasksCreated(true);
    setTimeout(() => setTasksCreated(false), 2500);
  };

  // Filter recordings by search
  const filteredRecordings = recordings.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.provider.toLowerCase().includes(q) ||
      (r.transcription && r.transcription.toLowerCase().includes(q)) ||
      (r.summary && r.summary.toLowerCase().includes(q)) ||
      r.caller.toLowerCase().includes(q)
    );
  });

  const formatSecsDisplay = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="call-recordings-viewer" className="space-y-6">
      {/* Top Banner & Action Trigger Bar */}
      <div className="bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 rounded-3xl text-white shadow-md flex flex-wrap items-center justify-between gap-4 border border-blue-900/50">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40">
              <PhoneCall className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold">VoIP Calling & Audio Intelligence</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
              Twilio WebRTC
            </span>
          </div>
          <p className="text-xs text-slate-300">
            One-click browser voice calling, live speech transcription, and AI action-item summaries for {lead.name}.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* 1-Click VoIP Call Trigger */}
          <button
            type="button"
            id="voip-call-trigger-btn"
            onClick={onOpenVoipCall}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Make VoIP Call</span>
          </button>

          {/* Transcribe & Summarize Trigger */}
          <button
            type="button"
            id="transcribe-summarize-trigger-btn"
            onClick={onOpenTranscribeSummarize}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record & Transcribe</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Recordings List, Right = Audio Player & AI Insights */}
      {recordings.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">No Call Recordings Logged Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Initiate a one-click browser VoIP call or click "Record & Transcribe" to capture voice notes and extract action items with Gemini AI.
            </p>
          </div>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              type="button"
              onClick={onOpenVoipCall}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Start VoIP Call
            </button>
            <button
              type="button"
              onClick={onOpenTranscribeSummarize}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Record Audio Memo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Call Recordings List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Call History</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold font-mono">
                  {recordings.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-40">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter calls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredRecordings.map((rec) => {
                const isSelected = rec.id === selectedRecording?.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecordingId(rec.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="p-1 rounded-lg bg-blue-100 text-blue-700 text-xs">
                          <Phone className="w-3 h-3" />
                        </span>
                        <span className="text-xs font-bold text-slate-900">{rec.provider}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {rec.durationFormatted || formatSecsDisplay(rec.durationSeconds)}
                        </span>
                        {rec.sentiment && (
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              rec.sentiment === 'positive'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.sentiment === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.sentiment}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {rec.summary || rec.transcription || 'VoIP audio call recording.'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>By: {rec.caller.split(' ')[0]}</span>
                      <span>{new Date(rec.timestamp).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Audio Playback Stage & AI Insights */}
          {selectedRecording && (
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              {/* Active Recording Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">
                      {selectedRecording.provider} Voice Recording
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      Verified Audio Stream
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Caller: {selectedRecording.caller} • Recipient: {selectedRecording.recipient} ({selectedRecording.phoneNumber})
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div>{new Date(selectedRecording.timestamp).toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <div className="font-mono text-slate-600 font-semibold">
                    {new Date(selectedRecording.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} SAST
                  </div>
                </div>
              </div>

              {/* Master Audio Player Interface */}
              <div className="bg-linear-to-b from-slate-900 to-slate-950 p-5 rounded-2xl text-white space-y-3.5 shadow-inner">
                {/* Audio Element if URL exists */}
                {selectedRecording.audioUrl && (
                  <audio
                    ref={audioRef}
                    src={selectedRecording.audioUrl}
                    onEnded={() => {
                      setIsPlaying(false);
                      setPlaybackProgress(100);
                    }}
                    onTimeUpdate={() => {
                      if (audioRef.current) {
                        const current = audioRef.current.currentTime;
                        const duration = audioRef.current.duration || selectedRecording.durationSeconds || 60;
                        setCurrentPlaySecs(Math.round(current));
                        setPlaybackProgress(Math.round((current / duration) * 100));
                      }
                    }}
                    className="hidden"
                  />
                )}

                {/* Waveform Visualizer */}
                <div className="flex items-center justify-center space-x-1.5 h-12 px-4 bg-slate-800/60 rounded-xl">
                  {Array.from({ length: 24 }).map((_, idx) => {
                    const isPlayed = (idx / 24) * 100 <= playbackProgress;
                    const randomH = Math.sin(idx + (isPlaying ? currentPlaySecs : 1)) * 30 + 50;
                    return (
                      <div
                        key={idx}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isPlayed ? 'bg-blue-400' : 'bg-slate-600'
                        }`}
                        style={{ height: `${Math.max(15, Math.min(95, randomH))}%` }}
                      />
                    );
                  })}
                </div>

                {/* Progress Bar / Scrubber */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={playbackProgress}
                    onChange={(e) => handleScrub(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>{formatSecsDisplay(currentPlaySecs)}</span>
                    <span>{selectedRecording.durationFormatted || formatSecsDisplay(selectedRecording.durationSeconds)}</span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between pt-1">
                  {/* Playback Speed Multiplier */}
                  <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => {
                          setPlaybackRate(rate);
                          if (audioRef.current) audioRef.current.playbackRate = rate;
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          playbackRate === rate ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Play / Pause Primary Button */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition transform active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  {/* Volume Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsVolumeMuted(!isVolumeMuted);
                      if (audioRef.current) audioRef.current.muted = !isVolumeMuted;
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    {isVolumeMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Gemini AI Summary Box */}
              {selectedRecording.summary && (
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Executive Call Summary (Gemini AI)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAppendToNotes}
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 underline flex items-center space-x-1 cursor-pointer"
                    >
                      {notesAppended ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                      <span>{notesAppended ? 'Appended to Lead Notes!' : 'Append to Notes'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                    {selectedRecording.summary}
                  </p>
                </div>
              )}

              {/* Extracted Action Items */}
              {selectedRecording.actionItems && selectedRecording.actionItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                      <ListPlus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Action Items from Call</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleConvertActionItemsToTasks}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition cursor-pointer flex items-center space-x-1"
                    >
                      {tasksCreated ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                      <span>{tasksCreated ? 'Tasks Created!' : 'Convert to CRM Tasks'}</span>
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {selectedRecording.actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-start space-x-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="flex-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Speech-to-Text Transcription */}
              {selectedRecording.transcription && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Full Call Transcription</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedTranscript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 max-h-44 overflow-y-auto leading-relaxed font-sans select-text">
                    {selectedRecording.transcription}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
