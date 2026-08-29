import React, { useState } from 'react';
import { authHeaders } from '../../services/api';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  Lightbulb, 
  Building2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Lead } from '../types';

interface AiAdvisorDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  leads: Lead[];
}

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
  onOpen,
  onClose,
  leads,
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Hello! I am your Ptah Realty CRM AI Copilot. I'm connected to your live pipeline with ${leads.length} leads across Property 24, Private Property, and your direct website.\n\nAsk me anything about lead conversion strategies, Property 24 follow-up scripts, objection handling, or pipeline forecasting!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Closed state: a slim vertical rail rather than nothing, so there's
  // still a way back in once the panel's own close button is used --
  // the top taskbar no longer has an AI Copilot toggle (removed per
  // explicit request), so this rail is the only remaining entry point
  // besides the command palette.
  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="w-10 shrink-0 h-full flex flex-col items-center justify-center gap-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-l border-white/40 dark:border-slate-700/40 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
        title="Open AI Copilot"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] font-bold tracking-wider [writing-mode:vertical-rl] rotate-180">AI COPILOT</span>
      </button>
    );
  }

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      const crmSummary = {
        totalLeads: leads.length,
        newLeads: leads.filter((l) => l.status === 'new').length,
        property24Count: leads.filter((l) => l.source === 'Property 24').length,
        urgentCount: leads.filter((l) => l.urgency === 'urgent').length,
        dealsWon: leads.filter((l) => l.status === 'deal_won').length,
      };

      const response = await fetch('/api/gemini/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          message: textToSend,
          crmSummary,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || 'Analysis complete.' }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Apologies, I encountered an issue retrieving real-time AI insights.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How do I convert Property 24 leads within the first 15 minutes?',
    'Which lead source has the highest ROI and conversion velocity?',
    'What should I say to a luxury cash buyer who hasn’t responded in 48 hours?',
    'Suggest an automated follow-up sequence for foreign investors.',
  ];

  return (
    <div className="w-full max-w-xs lg:max-w-sm shrink-0 h-full flex flex-col bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border-l border-white/40 dark:border-slate-700/40 shadow-2xl">
      {/* Top Header */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border-b border-white/40 dark:border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ptah AI CRM Copilot</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Real estate strategy & conversion assistant</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer" title="Close AI Copilot">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-white/40 dark:border-slate-700/40">
        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Quick Strategy Inquiries:</span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition text-left cursor-pointer shadow-xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white rounded-br-none'
                  : 'bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none whitespace-pre-line shadow-xs'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing Ptah Realty pipeline & formulating advice...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white/60 dark:bg-slate-900/50 border-t border-white/40 dark:border-slate-700/40 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask AI real estate advisor anything..."
          className="flex-1 bg-white/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="p-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white rounded-xl transition disabled:opacity-40 cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
