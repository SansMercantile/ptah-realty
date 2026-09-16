import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Shield,
  MessageSquare,
  FileText,
  Volume2,
  Maximize2,
  Minimize2,
  Plus,
  Check,
  Radio,
  Sliders,
  Award,
  AlertCircle,
  Copy
} from 'lucide-react';
import { Lead, CommunicationItem, TaskItem, ActivityLogItem } from '../types';

interface MeetingCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onUpdateLead: (updatedLead: Lead) => void;
  defaultPlatform?: 'zoom' | 'skype';
  defaultCallType?: 'video' | 'voice';
}

export const MeetingCallModal: React.FC<MeetingCallModalProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdateLead,
  defaultPlatform = 'zoom',
  defaultCallType = 'video',
}) => {
  const [platform, setPlatform] = useState<'zoom' | 'skype'>(defaultPlatform);
  const [callType, setCallType] = useState<'video' | 'voice'>(defaultCallType);
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  // Media Controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(defaultCallType === 'voice');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [virtualBg, setVirtualBg] = useState<'none' | 'luxury_office' | 'camps_bay' | 'blur'>('luxury_office');
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Call Duration Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // WebCam Stream Ref
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Real-time AI Note Taker State
  const [isAiNoteTakerActive, setIsAiNoteTakerActive] = useState(true);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [sentimentScore, setSentimentScore] = useState(88);
  const [isSyncedToCrm, setIsSyncedToCrm] = useState(false);

  // Action Items extracted by AI Note Taker
  const [actionItems, setActionItems] = useState<Array<{ id: string; text: string; completed: boolean; dueDate: string }>>([
    {
      id: 'act-1',
      text: `Email updated draft OTP with R${(lead.propertyPrice ? Math.round(lead.propertyPrice * 0.1).toLocaleString('en-ZA') : '4,250,000')} deposit condition`,
      completed: true,
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'act-2',
      text: `Confirm conveyancer appointment with Bowmans Law Cape Town`,
      completed: false,
      dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    },
    {
      id: 'act-3',
      text: `Schedule building surveyor physical inspection before final sign-off`,
      completed: false,
      dueDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    },
  ]);

  // Realistic Luxury Real Estate Dialogue Stream
  const conversationDialogue = [
    {
      speaker: 'broker',
      name: lead.assignedAgent?.name || 'privjapan (Senior Principal)',
      text: `Good day ${lead.name.split(' ')[0]}, thank you for connecting on ${platform === 'zoom' ? 'Zoom' : 'Skype'}. I have the full title deed and floor plans ready for ${lead.propertyTitle}.`,
      time: '00:03',
    },
    {
      speaker: 'client',
      name: lead.name,
      text: `Thanks for accommodating my schedule. I reviewed the digital brochure you sent. The ocean-facing terraces look spectacular, but I want to ensure the 10% deposit terms and transfer dates are clear.`,
      time: '00:15',
    },
    {
      speaker: 'broker',
      name: lead.assignedAgent?.name || 'privjapan (Senior Principal)',
      text: `Absolutely. We have structured the Offer to Purchase with Bowmans Law as appointed conveyancers. The R${(lead.propertyPrice ? Math.round(lead.propertyPrice * 0.1).toLocaleString('en-ZA') : '4,250,000')} deposit sits in an interest-bearing Section 54 trust account.`,
      time: '00:32',
    },
    {
      speaker: 'client',
      name: lead.name,
      text: `That gives us great peace of mind. If the seller accepts our R${lead.propertyPrice ? (lead.propertyPrice / 1000000).toFixed(1) : '42.5'}M offer, can we take early occupation under occupational rent by November?`,
      time: '00:54',
    },
    {
      speaker: 'broker',
      name: lead.assignedAgent?.name || 'privjapan (Senior Principal)',
      text: `Yes, the seller has agreed in principle to occupational interest at 0.8% of the purchase price monthly until deed registration. I will add that clause directly to the OTP draft.`,
      time: '01:18',
    },
    {
      speaker: 'client',
      name: lead.name,
      text: `Excellent. Send me the amended OTP via the secure client portal or DocuSign, and we will sign before 5 PM today.`,
      time: '01:45',
    },
  ];

  // Auto-connect call after 1.5s
  useEffect(() => {
    if (!isOpen) return;
    setCallState('connecting');
    setElapsedSeconds(0);
    setIsSyncedToCrm(false);

    const connectTimer = setTimeout(() => {
      setCallState('connected');
    }, 1500);

    return () => clearTimeout(connectTimer);
  }, [isOpen]);

  // Elapsed Seconds Counter
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  // Step Dialogue Stream
  useEffect(() => {
    if (callState !== 'connected') return;
    const streamInterval = setInterval(() => {
      setTranscriptIndex((prev) => Math.min(prev + 1, conversationDialogue.length));
    }, 6000);
    return () => clearInterval(streamInterval);
  }, [callState, conversationDialogue.length]);

  // Camera Access Handling
  useEffect(() => {
    if (!isOpen || callType !== 'video' || isVideoMuted) {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
      setCameraActive(false);
      return;
    }

    let activeStream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        activeStream = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      })
      .catch((err) => {
        console.warn('Camera access unavailable or declined, using simulated avatar stream', err);
        setCameraActive(false);
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, callType, isVideoMuted]);

  // Format MM:SS
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle Action Item
  const handleToggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Add new Action Item
  const handleAddActionItem = () => {
    const text = prompt('Enter follow-up task from meeting:');
    if (!text?.trim()) return;
    setActionItems((prev) => [
      ...prev,
      {
        id: `act-${Date.now()}`,
        text: text.trim(),
        completed: false,
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      },
    ]);
  };

  // Sync Meeting Notes, Communication Item & Action Items to Lead Profile
  const handleSaveAndSyncToCrm = () => {
    const meetingTitle = `${platform === 'zoom' ? 'Zoom Video Conference' : 'Skype Call'}: ${lead.propertyTitle}`;
    const durationStr = `${Math.max(1, Math.ceil(elapsedSeconds / 60))} mins (${formatCallDuration(elapsedSeconds)})`;
    const meetingTimestamp = new Date().toISOString();

    // 1. Create Communication Item
    const newCommItem: CommunicationItem = {
      id: `comm-call-${Date.now()}`,
      type: platform === 'zoom' ? 'zoom_video' : 'skype_call',
      direction: 'outbound',
      title: `${platform === 'zoom' ? 'Zoom Video Conference' : 'Skype HD Call'} with ${lead.name}`,
      content: `Completed ${platform === 'zoom' ? 'Zoom' : 'Skype'} conference call (${durationStr}). Discussed purchase offer of R${lead.propertyPrice ? (lead.propertyPrice / 1000000).toFixed(1) + 'M' : '42.5M'}, 10% trust deposit via Bowmans Law, and November occupation terms. Client sentiment: ${sentimentScore}% (High Intent).`,
      timestamp: meetingTimestamp,
      author: lead.assignedAgent?.name || 'privjapan (Senior Principal)',
      duration: durationStr,
      outcome: 'Offer Terms Agreed - Awaiting Final Signature',
    };

    // 2. Create Tasks from Action Items
    const newTasks: TaskItem[] = actionItems.map((act) => ({
      id: `task-meet-${Date.now()}-${act.id}`,
      leadId: lead.id,
      leadName: lead.name,
      propertyTitle: lead.propertyTitle,
      title: act.text,
      dueDate: act.dueDate,
      priority: 'high',
      status: act.completed ? 'completed' : 'pending',
      type: 'followup',
      isAutomated: true,
    }));

    // 3. Create Activity Log
    const newActivityLog: ActivityLogItem = {
      id: `act-call-${Date.now()}`,
      type: 'communication',
      title: `${platform === 'zoom' ? 'Zoom Video Conference' : 'Skype Call'} Completed`,
      description: `Held ${durationStr} virtual meeting with ${lead.name}. AI Note Taker extracted 3 action items and synced summary to CRM dossier.`,
      timestamp: meetingTimestamp,
      author: lead.assignedAgent?.name || 'privjapan (Senior Principal)',
      authorAvatar: lead.assignedAgent?.avatar,
      metadata: {
        commType: platform === 'zoom' ? 'zoom_video' : 'skype_call',
        duration: durationStr,
        outcome: 'High Intent Agreed',
      },
    };

    // 4. Update Lead Record
    const updatedLead: Lead = {
      ...lead,
      communications: [newCommItem, ...(lead.communications || [])],
      tasks: [...newTasks, ...(lead.tasks || [])],
      activityLogs: [newActivityLog, ...(lead.activityLogs || [])],
      notes: [
        `[${platform === 'zoom' ? 'Zoom AI Note Taker' : 'Skype AI Note Taker'} ${new Date().toLocaleDateString('en-ZA')}]: Client agreed to terms for ${lead.propertyTitle}. 10% cash deposit approved into Bowmans trust account with 30-day transfer schedule. Next touchpoint: Dispatch finalized OTP contract.`,
        ...(lead.notes || []),
      ],
      lastContactedAt: meetingTimestamp,
    };

    onUpdateLead(updatedLead);
    setIsSyncedToCrm(true);
  };

  // Copy Meeting Link
  const handleCopyMeetingLink = () => {
    const link = platform === 'zoom'
      ? `https://zoom.us/j/8492019948?pwd=PTAH${lead.referenceNumber.replace(/[^0-9]/g, '')}`
      : `https://join.skype.com/invite/ptah_${lead.referenceNumber.toLowerCase()}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
        isFullscreen ? 'h-full max-w-full' : 'max-w-6xl h-[92vh]'
      }`}>
        {/* TOP BAR: Platform Brand & Meeting Information */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Platform Selector Buttons */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPlatform('zoom')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  platform === 'zoom'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-white" />
                <span>Zoom Video</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform('skype')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  platform === 'skype'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-[9px] font-black text-sky-600">
                  S
                </div>
                <span>Skype Call</span>
              </button>
            </div>

            {/* Meeting Identifier & Security */}
            <div className="hidden md:flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Meeting ID:</span>
              <span className="font-mono font-bold text-slate-200">
                {platform === 'zoom' ? '849 2019 948' : `ptah.${lead.referenceNumber.toLowerCase()}`}
              </span>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-1 text-emerald-400 font-medium">
                <Shield className="w-3 h-3" />
                <span>256-Bit TLS Encrypted</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Call Type Toggle */}
            <div className="hidden sm:flex items-center bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setCallType('video');
                  setIsVideoMuted(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  callType === 'video' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Video Conference
              </button>
              <button
                type="button"
                onClick={() => {
                  setCallType('voice');
                  setIsVideoMuted(true);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  callType === 'voice' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Voice HD
              </button>
            </div>

            {/* Copy Meeting Link */}
            <button
              type="button"
              onClick={handleCopyMeetingLink}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Copy meeting join link to clipboard"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied Link!' : 'Invite Link'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: Grid splitting Call Stage and AI Note Taker */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-slate-950 overflow-hidden">
          {/* LEFT 7/12: Active Video / Voice Call Stage */}
          <div className="lg:col-span-7 flex flex-col bg-slate-900 border-r border-slate-800 relative overflow-hidden">
            {/* Call Status & Recording Banner */}
            <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 pointer-events-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-white font-mono">
                  {callState === 'connecting' ? 'Connecting...' : formatCallDuration(elapsedSeconds)}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] text-slate-300 font-medium">
                  {callType === 'video' ? 'HD 1080p Video' : 'OPUS 48kHz Voice'}
                </span>
              </div>

              {isRecording && (
                <div className="flex items-center space-x-1.5 bg-rose-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-700/60 text-rose-300 text-xs font-bold pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>REC (Cloud AI)</span>
                </div>
              )}
            </div>

            {/* Main Video Window: Client Feed */}
            <div className="flex-1 relative flex items-center justify-center bg-radial from-slate-850 via-slate-900 to-slate-950 p-4 overflow-hidden">
              {callType === 'video' ? (
                /* Video Presentation Stage */
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-2xl">
                  {/* Luxury Background Simulation */}
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"
                    alt="Luxury Estate"
                    className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  {/* Client Portrait / Avatar Stage */}
                  <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-3">
                    <div className="relative">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full ring-4 ring-blue-500/40 p-1 bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          alt={lead.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white" title="Speaking">
                        <Volume2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center justify-center space-x-2">
                        <span>{lead.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal border border-blue-500/30">
                          {lead.buyerType}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 font-medium">
                        {lead.propertyTitle} • <strong className="text-emerald-400">R{lead.propertyPrice ? (lead.propertyPrice / 1000000).toFixed(1) + 'M' : '42.5M'}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Cape Town, South Africa (Fiber 1Gbps • 14ms latency)
                      </p>
                    </div>

                    {/* Active Speaker Waveform Indicator */}
                    <div className="flex items-center space-x-1 h-6 pt-1">
                      {[12, 24, 18, 28, 16, 22, 14, 26, 10, 18].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-blue-400 rounded-full animate-pulse"
                          style={{
                            height: `${h}px`,
                            animationDelay: `${i * 120}ms`,
                            opacity: 0.8,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Broker Self-View PiP (Picture-in-Picture) */}
                  <div className="absolute bottom-4 right-4 z-20 w-36 sm:w-48 aspect-video rounded-xl bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-2xl">
                    {cameraActive && !isVideoMuted ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 p-2 text-center relative">
                        <img
                          src={lead.assignedAgent?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                          alt="Broker"
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500"
                        />
                        <span className="text-[10px] font-bold text-white mt-1 truncate max-w-full">
                          You (Broker)
                        </span>
                        {isVideoMuted && (
                          <span className="absolute top-1 right-1 p-1 bg-slate-950/80 rounded-md text-rose-400">
                            <VideoOff className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/75 text-[9px] font-mono text-white">
                      {isMicMuted ? 'Muted' : 'Speaking'}
                    </div>
                  </div>
                </div>
              ) : (
                /* Voice Call Audio Stage with Spectrum Waveform */
                <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 p-1.5 shadow-2xl">
                      <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          alt={lead.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute -inset-3 rounded-full border border-blue-500/30 animate-ping pointer-events-none"></div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">{lead.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{lead.phone || '+27 82 443 8901'}</p>
                    <p className="text-xs font-semibold text-emerald-400 mt-2">
                      Connected via {platform === 'zoom' ? 'Zoom High-Fidelity Audio' : 'Skype HD Voice'}
                    </p>
                  </div>

                  {/* Audio Frequency Bar Visualizer */}
                  <div className="w-full bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-center space-x-1.5 h-16">
                    {[14, 28, 42, 24, 38, 52, 34, 46, 20, 36, 48, 22, 38, 26, 18, 30].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-blue-600 to-emerald-400 rounded-full transition-all duration-150"
                        style={{
                          height: `${Math.max(6, (h * ((i % 3) + 1)) % 44)}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* IN-MEETING BOTTOM CONTROL BAR */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Microphone Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isMicMuted
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span className="hidden sm:inline">{isMicMuted ? 'Muted' : 'Mute'}</span>
                </button>

                {/* Camera Video Toggle */}
                {callType === 'video' && (
                  <button
                    type="button"
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isVideoMuted
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                    title={isVideoMuted ? 'Start Video Camera' : 'Stop Video Camera'}
                  >
                    {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-blue-400" />}
                    <span className="hidden sm:inline">{isVideoMuted ? 'Start Video' : 'Stop Video'}</span>
                  </button>
                )}

                {/* Screen Share */}
                <button
                  type="button"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isScreenSharing
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title="Share screen or property brochure"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isScreenSharing ? 'Sharing' : 'Share Screen'}</span>
                </button>

                {/* Virtual Background */}
                {callType === 'video' && (
                  <select
                    value={virtualBg}
                    onChange={(e) => setVirtualBg(e.target.value as any)}
                    className="hidden md:block bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-300 rounded-xl px-2 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="none">Normal Camera</option>
                    <option value="luxury_office">Luxury Ptah Office</option>
                    <option value="camps_bay">Camps Bay Coastline</option>
                    <option value="blur">Studio Blur</option>
                  </select>
                )}
              </div>

              {/* End Call Button */}
              <button
                type="button"
                onClick={() => {
                  setCallState('ended');
                  handleSaveAndSyncToCrm();
                  setTimeout(() => onClose(), 800);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg transition cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End & Sync CRM</span>
              </button>
            </div>
          </div>

          {/* RIGHT 5/12: REAL-TIME AI NOTE TAKER & MEETING TRANSCRIPT */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900 border-t lg:border-t-0 border-slate-800 overflow-hidden">
            {/* AI Note Taker Header */}
            <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>Ptah AI Real-Time Note Taker</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-950 text-indigo-300 font-mono border border-indigo-800">
                      Live
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Transcribing, detecting buying signals & auto-extracting follow-up tasks
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAndSyncToCrm}
                disabled={isSyncedToCrm}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSyncedToCrm
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {isSyncedToCrm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <SaveIcon className="w-3.5 h-3.5" />}
                <span>{isSyncedToCrm ? 'Synced to CRM!' : 'Sync to Lead'}</span>
              </button>
            </div>

            {/* Sentiment Meter & Executive Key Insights */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Client Intent & Sentiment</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-base font-bold text-emerald-400 font-mono">{sentimentScore}%</span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                    Very High Intent
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Purchase Offer Value</span>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-base font-bold text-white font-mono">
                    R{lead.propertyPrice ? (lead.propertyPrice / 1000000).toFixed(1) + 'M' : '42.5M'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">(10% Deposit)</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content: Live Dialogue + Auto Action Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* SECTION A: ACTION ITEMS EXTRACTED */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Extracted Action Items ({actionItems.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddActionItem}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Add follow-up task"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {actionItems.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => handleToggleActionItem(act.id)}
                      className="flex items-start space-x-2 p-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={act.completed}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${act.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}`}>
                          {act.text}
                        </p>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          Due: {new Date(act.dueDate).toLocaleDateString('en-ZA')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: LIVE TRANSCRIPTION STREAM */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>Live Conversation Transcript</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono animate-pulse">● Live Stream</span>
                </div>

                <div className="space-y-2">
                  {conversationDialogue.slice(0, Math.max(2, transcriptIndex)).map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all ${
                        item.speaker === 'broker'
                          ? 'bg-slate-950/70 border-slate-800 ml-4'
                          : 'bg-blue-950/20 border-blue-900/40 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-bold ${
                          item.speaker === 'broker' ? 'text-indigo-300' : 'text-blue-300'
                        }`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Note Taker Footer with Quick Summary */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Summary will be added to Lead Dossier upon call termination</span>
              </div>
              <span className="font-mono text-slate-300">{formatCallDuration(elapsedSeconds)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Icon
const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);
