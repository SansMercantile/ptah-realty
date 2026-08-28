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
  onClose: () => void;
  leads: Lead[];
}

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Ptah AI CRM Copilot</h3>
              <p className="text-[11px] text-slate-500">Real estate strategy & conversion assistant</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Quick Strategy Inquiries:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 transition text-left cursor-pointer shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none whitespace-pre-line shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 w-fit">
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
          className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask AI real estate advisor anything..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
