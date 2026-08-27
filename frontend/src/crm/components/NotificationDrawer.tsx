import React from 'react';
import { X, Bell, Mail, CheckCircle2, Building, Trash2, ArrowUpRight } from 'lucide-react';
import { EmailNotificationLog } from '../types';
import { formatDate } from '../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: EmailNotificationLog[];
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Live Email Notifications</h3>
              <p className="text-[11px] text-slate-500">Automated broker alerts & client auto-responders</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-slate-400 hover:text-red-600 text-xs p-1 transition cursor-pointer"
                title="Clear notification list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          {notifications.length === 0 ? (
            <div className="text-center p-12 text-slate-400 text-xs italic">
              No recent notifications. Incoming Property 24 leads will trigger real-time alerts here.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      n.recipientType === 'agent'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {n.recipientType === 'agent' ? 'BROKER EMAIL ALERT' : 'CLIENT AUTO-RESPONDER'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{formatDate(n.timestamp)}</span>
                </div>

                <h4 className="font-semibold text-xs text-slate-900 leading-tight">{n.subject}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{n.previewSnippet}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                  <span>To: {n.recipientEmail}</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-sans font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> {n.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
