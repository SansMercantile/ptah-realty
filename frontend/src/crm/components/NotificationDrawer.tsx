import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Mail, 
  CheckCircle2, 
  Building, 
  Trash2, 
  ArrowUpRight, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Plus, 
  FileText, 
  Zap, 
  Check, 
  ChevronRight,
  ExternalLink,
  Filter
} from 'lucide-react';
import { EmailNotificationLog, Lead, TaskItem, UrgencyLevel } from '../types';
import { formatDate, formatRelativeTime, formatCurrency } from '../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: EmailNotificationLog[];
  leads: Lead[];
  onClearAllNotifications: () => void;
  onToggleTask: (leadId: string, taskId: string) => void;
  onSelectLead: (lead: Lead) => void;
  onQuickWhatsApp?: (lead: Lead) => void;
  onAddTask?: (leadId: string, task: TaskItem) => void;
  onOpenFullTasksView?: () => void;
}

type TabType = 'all' | 'tasks' | 'emails';
type TaskFilterType = 'all' | 'overdue' | 'due_today' | 'upcoming' | 'completed';

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  leads,
  onClearAllNotifications,
  onToggleTask,
  onSelectLead,
  onQuickWhatsApp,
  onAddTask,
  onOpenFullTasksView,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [taskFilter, setTaskFilter] = useState<TaskFilterType>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form fields
  const [newLeadId, setNewLeadId] = useState<string>(leads[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TaskItem['type']>('call');
  const [newPriority, setNewPriority] = useState<UrgencyLevel>('urgent');
  const [newDueDate, setNewDueDate] = useState(() => {
    // Default to +15 mins from now (15-min SLA standard)
    return new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16);
  });

  // Flatten all tasks with their respective parent lead
  const allTasksWithLead = useMemo(() => {
    const list: { task: TaskItem; lead: Lead }[] = [];
    leads.forEach((lead) => {
      (lead.tasks || []).forEach((task) => {
        list.push({ task, lead });
      });
    });
    // Sort: pending first, then by earliest due date
    return list.sort((a, b) => {
      if (a.task.status !== b.task.status) {
        return a.task.status === 'pending' ? -1 : 1;
      }
      return new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime();
    });
  }, [leads]);

  // Timestamp calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000;

  const overdueTasks = useMemo(() => {
    return allTasksWithLead.filter(
      (item) => item.task.status === 'pending' && new Date(item.task.dueDate).getTime() < now.getTime()
    );
  }, [allTasksWithLead, now]);

  const dueTodayTasks = useMemo(() => {
    return allTasksWithLead.filter((item) => {
      const t = new Date(item.task.dueDate).getTime();
      return item.task.status === 'pending' && t >= todayStart && t < todayEnd;
    });
  }, [allTasksWithLead, todayStart, todayEnd]);

  const upcomingTasks = useMemo(() => {
    return allTasksWithLead.filter((item) => {
      const t = new Date(item.task.dueDate).getTime();
      return item.task.status === 'pending' && t >= todayEnd;
    });
  }, [allTasksWithLead, todayEnd]);

  const completedTasks = useMemo(() => {
    return allTasksWithLead.filter((item) => item.task.status === 'completed');
  }, [allTasksWithLead]);

  const pendingTasks = useMemo(() => {
    return allTasksWithLead.filter((item) => item.task.status === 'pending');
  }, [allTasksWithLead]);

  // Filtered task items based on active sub-filter
  const displayedTasks = useMemo(() => {
    switch (taskFilter) {
      case 'overdue':
        return overdueTasks;
      case 'due_today':
        return dueTodayTasks;
      case 'upcoming':
        return upcomingTasks;
      case 'completed':
        return completedTasks;
      case 'all':
      default:
        return pendingTasks;
    }
  }, [taskFilter, overdueTasks, dueTodayTasks, upcomingTasks, completedTasks, pendingTasks]);

  const totalAlertsCount = pendingTasks.length + notifications.length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLeadId || !onAddTask) return;

    const targetLead = leads.find((l) => l.id === newLeadId);
    if (!targetLead) return;

    const newTask: TaskItem = {
      id: `task-notif-${Date.now()}`,
      leadId: targetLead.id,
      leadName: targetLead.name,
      propertyTitle: targetLead.propertyTitle,
      title: newTitle.trim(),
      dueDate: newDueDate ? new Date(newDueDate).toISOString() : new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      priority: newPriority,
      status: 'pending',
      type: newType,
      isAutomated: false,
    };

    onAddTask(targetLead.id, newTask);
    setNewTitle('');
    setIsAddingTask(false);
  };

  const setPresetDueDate = (offsetMinutes: number) => {
    const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
    setNewDueDate(d.toISOString().slice(0, 16));
  };

  const getTaskIcon = (type: TaskItem['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'viewing':
        return <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'contract':
        return <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'brochure':
        return <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'followup':
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'high':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'medium':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'low':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        id="notification-reminders-drawer"
        className="w-full max-w-lg bg-white dark:bg-black border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl transition-colors duration-200"
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-xs relative">
              <Bell className="w-4 h-4" />
              {overdueTasks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications & Task Reminders</h3>
                {pendingTasks.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-300">
                    {pendingTasks.length} tasks
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                15-min SLA alerts, scheduled viewings & portal notifications
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                isAddingTask
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title="Add a new quick task reminder"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Reminder</span>
            </button>

            {notifications.length > 0 && activeTab !== 'tasks' && (
              <button
                onClick={onClearAllNotifications}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Clear portal email logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="px-4 pt-3 pb-2 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-medium w-full">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Task Reminders</span>
              {pendingTasks.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  overdueTasks.length > 0 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-300'
                }`}>
                  {pendingTasks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>All Alerts</span>
              {totalAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {totalAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'emails'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Email Logs</span>
              {notifications.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-300">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Add Task Form (Expandable) */}
        {isAddingTask && (
          <form 
            onSubmit={handleCreateTask}
            className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/50 space-y-3 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1">
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Create New Task Reminder</span>
              </span>
              <button 
                type="button" 
                onClick={() => setIsAddingTask(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Related Lead / Property
              </label>
              <select
                value={newLeadId}
                onChange={(e) => setNewLeadId(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.propertyTitle} ({l.referenceNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Task Reminder Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 15-min SLA Call: Verify mortgage pre-approval..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Task Category
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TaskItem['type'])}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="call">Phone Call (15-min SLA)</option>
                  <option value="viewing">Private Inspection / Viewing</option>
                  <option value="email">Email Auto-Followup</option>
                  <option value="contract">OTP / Conveyancing Review</option>
                  <option value="brochure">Send Architectural Brochure</option>
                  <option value="followup">General Agent Followup</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Urgency Level
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as UrgencyLevel)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="urgent">Urgent (SLA)</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Due Date & SLA Timer
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(15)}
                    className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition"
                  >
                    +15m SLA
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(60)}
                    className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
                  >
                    +1 hr
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(1440)}
                    className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                type="datetime-local"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Add to Notification Reminders
            </button>
          </form>
        )}

        {/* Overdue Urgent Alert Banner */}
        {overdueTasks.length > 0 && activeTab !== 'emails' && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  {overdueTasks.length} Urgent Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                </p>
                <p className="text-[10px] text-rose-700 dark:text-rose-300">
                  15-minute lead response SLA or scheduled viewing milestones exceeded.
                </p>
              </div>
            </div>
            {taskFilter !== 'overdue' && (
              <button
                onClick={() => {
                  setActiveTab('tasks');
                  setTaskFilter('overdue');
                }}
                className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shrink-0 transition cursor-pointer"
              >
                View Overdue
              </button>
            )}
          </div>
        )}

        {/* Task Filter Chips (Visible when in tasks tab) */}
        {activeTab === 'tasks' && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => setTaskFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                taskFilter === 'all'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All Pending ({pendingTasks.length})
            </button>

            {overdueTasks.length > 0 && (
              <button
                onClick={() => setTaskFilter('overdue')}
                className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap flex items-center space-x-1 transition cursor-pointer ${
                  taskFilter === 'overdue'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>Overdue ({overdueTasks.length})</span>
              </button>
            )}

            <button
              onClick={() => setTaskFilter('due_today')}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                taskFilter === 'due_today'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Due Today ({dueTodayTasks.length})
            </button>

            <button
              onClick={() => setTaskFilter('upcoming')}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                taskFilter === 'upcoming'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Upcoming ({upcomingTasks.length})
            </button>

            <button
              onClick={() => setTaskFilter('completed')}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                taskFilter === 'completed'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/40">
          {/* TASK REMINDERS TAB */}
          {activeTab === 'tasks' && (
            <>
              {displayedTasks.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Reminders in this Filter</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    {taskFilter === 'completed' 
                      ? 'No completed tasks recorded yet.' 
                      : 'All task reminders are cleared! 15-minute SLAs and viewing cadences are up to date.'}
                  </p>
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Reminder</span>
                  </button>
                </div>
              ) : (
                displayedTasks.map(({ task, lead }) => {
                  const isCompleted = task.status === 'completed';
                  const taskTime = new Date(task.dueDate).getTime();
                  const isOverdue = !isCompleted && taskTime < now.getTime();
                  const isDueToday = !isCompleted && taskTime >= todayStart && taskTime < todayEnd;

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition shadow-2xs group ${
                        isCompleted
                          ? 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                          : isOverdue
                          ? 'bg-white dark:bg-black border-rose-300 dark:border-rose-800/80 hover:border-rose-400'
                          : 'bg-white dark:bg-black border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Interactive Task Checkbox */}
                        <button
                          type="button"
                          onClick={() => onToggleTask(lead.id, task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                          title={isCompleted ? 'Mark task as pending' : 'Mark task as completed'}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* Badges: Category, Priority, SLA Timing */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {getTaskIcon(task.type)}
                              <span className="capitalize">{task.type}</span>
                            </span>

                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getUrgencyBadge(task.priority)}`}>
                              {task.priority}
                            </span>

                            {/* Timing indicator */}
                            {isOverdue && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <Clock className="w-3 h-3 text-rose-600" />
                                <span>Overdue ({formatRelativeTime(task.dueDate)})</span>
                              </span>
                            )}

                            {isDueToday && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Due Today ({new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                              </span>
                            )}

                            {!isOverdue && !isDueToday && !isCompleted && (
                              <span className="inline-flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(task.dueDate)}</span>
                              </span>
                            )}
                          </div>

                          {/* Task Title */}
                          <h4 className={`text-xs font-semibold leading-snug ${
                            isCompleted 
                              ? 'line-through text-slate-400 dark:text-slate-500' 
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {task.title}
                          </h4>

                          {/* Associated Lead & Property */}
                          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <button
                              onClick={() => onSelectLead(lead)}
                              className="text-left font-medium hover:text-emerald-600 dark:hover:text-emerald-400 truncate max-w-[240px] flex items-center space-x-1 transition cursor-pointer"
                              title="Open lead details"
                            >
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.name}</span>
                              <span className="text-slate-400">•</span>
                              <span className="truncate text-slate-500 dark:text-slate-400">{lead.propertyTitle}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-60" />
                            </button>

                            {/* Quick Action buttons */}
                            <div className="flex items-center space-x-1 shrink-0">
                              {onQuickWhatsApp && lead.whatsappNumber && (
                                <button
                                  type="button"
                                  onClick={() => onQuickWhatsApp(lead)}
                                  className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition cursor-pointer"
                                  title={`Quick WhatsApp to ${lead.name}`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onSelectLead(lead)}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                              >
                                View Lead
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ALL ALERTS TAB (Combined view of reminders + emails) */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {/* Task Reminders section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                  <span className="flex items-center space-x-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Active Task Reminders & SLAs ({pendingTasks.length})</span>
                  </span>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-0.5"
                  >
                    <span>View all tasks</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {pendingTasks.slice(0, 4).map(({ task, lead }) => {
                  const taskTime = new Date(task.dueDate).getTime();
                  const isOverdue = taskTime < now.getTime();

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition ${
                        isOverdue
                          ? 'bg-white dark:bg-black border-rose-300 dark:border-rose-800'
                          : 'bg-white dark:bg-black border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <button
                          type="button"
                          onClick={() => onToggleTask(lead.id, task.id)}
                          className="mt-0.5 w-4 h-4 rounded border border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center shrink-0 cursor-pointer"
                          title="Mark task completed"
                        >
                          {task.status === 'completed' && <Check className="w-3 h-3 text-emerald-600" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {task.title}
                            </h5>
                            {isOverdue && (
                              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {lead.name} • {lead.propertyTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Email Alerts section */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Portal & Syndication Alerts ({notifications.length})</span>
                  </span>
                  <button
                    onClick={() => setActiveTab('emails')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5"
                  >
                    <span>View all logs</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className="bg-white dark:bg-black p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          n.recipientType === 'agent'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {n.recipientType === 'agent' ? 'BROKER ALERT' : 'CLIENT AUTO-REPLY'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(n.timestamp)}</span>
                    </div>
                    <h5 className="font-semibold text-xs text-slate-900 dark:text-white truncate">{n.subject}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{n.previewSnippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMAIL LOGS TAB */}
          {activeTab === 'emails' && (
            <>
              {notifications.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Recent Email Alerts</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Incoming leads from Property 24 and Private Property will generate real-time automated auto-responders here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          n.recipientType === 'agent'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {n.recipientType === 'agent' ? 'BROKER EMAIL ALERT' : 'CLIENT AUTO-RESPONDER'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(n.timestamp)}</span>
                    </div>

                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white leading-tight">{n.subject}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{n.previewSnippet}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800 font-mono">
                      <span>To: {n.recipientEmail}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> {n.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          {onOpenFullTasksView ? (
            <button
              onClick={onOpenFullTasksView}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Expand Full Task & SLA Cadence Board</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Synced with Ptah Realty Brokerage Telemetry
            </div>
          )}

          {activeTab === 'emails' && notifications.length > 0 && (
            <button
              onClick={onClearAllNotifications}
              className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold transition cursor-pointer border border-rose-200 dark:border-rose-800"
            >
              Clear Logs
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
