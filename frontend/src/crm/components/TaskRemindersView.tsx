import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Check, 
  Filter, 
  Plus, 
  ChevronRight, 
  Building, 
  Flame, 
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Lead, TaskItem, UrgencyLevel } from '../types';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { AgentScheduleCalendar } from './AgentScheduleCalendar';

interface TaskRemindersViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onToggleTask: (leadId: string, taskId: string) => void;
  onQuickWhatsApp: (lead: Lead) => void;
  onAddTask?: (leadId: string, task: TaskItem) => void;
  onRescheduleTask?: (leadId: string, taskId: string, newDueDate: string) => void;
}

export const TaskRemindersView: React.FC<TaskRemindersViewProps> = ({
  leads,
  onSelectLead,
  onToggleTask,
  onQuickWhatsApp,
  onAddTask,
  onRescheduleTask,
}) => {
  const [layoutMode, setLayoutMode] = useState<'split' | 'calendar' | 'list'>('split');
  const [filterTab, setFilterTab] = useState<'all' | 'due_today' | 'overdue' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Flatten all tasks from all leads
  const allTasks = useMemo(() => {
    const list: { task: TaskItem; lead: Lead }[] = [];
    leads.forEach((lead) => {
      lead.tasks.forEach((t) => {
        list.push({ task: t, lead });
      });
    });
    return list;
  }, [leads]);

  // Compute status buckets
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000;

  const filteredTaskList = useMemo(() => {
    return allTasks.filter(({ task, lead }) => {
      const taskTime = new Date(task.dueDate).getTime();
      const isOverdue = task.status === 'pending' && taskTime < now.getTime();
      const isDueToday = task.status === 'pending' && taskTime >= todayStart && taskTime < todayEnd;

      if (filterTab === 'overdue' && !isOverdue) return false;
      if (filterTab === 'due_today' && !isDueToday) return false;
      if (filterTab === 'completed' && task.status !== 'completed') return false;
      if (filterTab === 'all' && task.status === 'completed') return false; // Show only pending in all by default

      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (agentFilter !== 'all' && !lead.assignedAgent.name.includes(agentFilter)) return false;

      return true;
    });
  }, [allTasks, filterTab, priorityFilter, agentFilter, now, todayStart, todayEnd]);

  // Counts for tabs
  const overdueCount = useMemo(() => {
    return allTasks.filter((t) => t.task.status === 'pending' && new Date(t.task.dueDate).getTime() < now.getTime()).length;
  }, [allTasks, now]);

  const dueTodayCount = useMemo(() => {
    return allTasks.filter(
      (t) => t.task.status === 'pending' && new Date(t.task.dueDate).getTime() >= todayStart && new Date(t.task.dueDate).getTime() < todayEnd
    ).length;
  }, [allTasks, todayStart, todayEnd]);

  const completedCount = useMemo(() => {
    return allTasks.filter((t) => t.task.status === 'completed').length;
  }, [allTasks]);

  const scheduledViewingsCount = useMemo(() => {
    return allTasks.filter((t) => t.task.type === 'viewing' && t.task.status === 'pending').length;
  }, [allTasks]);

  return (
    <div className="space-y-6">
      {/* Header card with SLA info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Automated Task & SLA Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Lead Follow-Up & Viewing Schedule</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Visualize upcoming property viewing appointments alongside automated 15-minute first-touch SLAs, WhatsApp brochure follow-ups, and OTP review tasks.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Viewings</span>
              <span className="text-lg font-bold text-emerald-800">{scheduledViewingsCount}</span>
            </div>
            <div className="bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-red-700 block">Overdue</span>
              <span className="text-lg font-bold text-red-700">{overdueCount}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Due Today</span>
              <span className="text-lg font-bold text-amber-800">{dueTodayCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-700 block">Resolved</span>
              <span className="text-lg font-bold text-slate-700">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* Cadence Steps Banner */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">1</span>
              <span>15-Min Call SLA</span>
            </div>
            <p className="text-[11px] text-slate-500">Triggered instantly upon Property 24 lead arrival.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">2</span>
              <span>Brochure & WhatsApp</span>
            </div>
            <p className="text-[11px] text-slate-500">Dispatch digital specs and floor plans within 2 hours.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">3</span>
              <span>Private Viewing</span>
            </div>
            <p className="text-[11px] text-slate-500">Book in-person inspection or 4K live video tour.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">4</span>
              <span>Feedback & Offer</span>
            </div>
            <p className="text-[11px] text-slate-500">Collect post-viewing feedback and prepare OTP.</p>
          </div>
        </div>
      </div>

      {/* Main View Layout Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setLayoutMode('split')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              layoutMode === 'split' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar & Task Queue</span>
          </button>

          <button
            onClick={() => setLayoutMode('calendar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              layoutMode === 'calendar' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Full Schedule Calendar</span>
          </button>

          <button
            onClick={() => setLayoutMode('list')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              layoutMode === 'list' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks Queue Only</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-2">
          {layoutMode === 'split' && 'Interactive schedule calendar paired with priority task list'}
          {layoutMode === 'calendar' && 'Full month, week, and daily agenda schedule'}
          {layoutMode === 'list' && 'Prioritized SLA task reminders and cadence list'}
        </div>
      </div>

      {/* Render Calendar if in split or calendar mode */}
      {(layoutMode === 'split' || layoutMode === 'calendar') && (
        <AgentScheduleCalendar
          leads={leads}
          onSelectLead={onSelectLead}
          onToggleTask={onToggleTask}
          onQuickWhatsApp={onQuickWhatsApp}
          onAddTask={onAddTask}
          onRescheduleTask={onRescheduleTask}
          defaultView={layoutMode === 'calendar' ? 'month' : 'month'}
        />
      )}

      {/* Render Task List if in split or list mode */}
      {(layoutMode === 'split' || layoutMode === 'list') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Priority Task Queue & Cadence Execution</span>
            </h3>
          </div>

          {/* Task Filters & Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Bucket Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                All Pending ({allTasks.filter((t) => t.task.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilterTab('overdue')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                  filterTab === 'overdue' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Overdue ({overdueCount})</span>
              </button>
              <button
                onClick={() => setFilterTab('due_today')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'due_today' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Due Today ({dueTodayCount})
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'completed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Priority filter */}
            <div className="flex items-center space-x-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white font-medium shadow-2xs"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">🔥 Urgent Only</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTaskList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs italic shadow-xs">
                No tasks found matching your filter. Excellent job keeping the pipeline clear!
              </div>
            ) : (
              filteredTaskList.map(({ task, lead }) => {
                const isOverdue = task.status === 'pending' && new Date(task.dueDate).getTime() < now.getTime();

                return (
                  <div
                    key={task.id}
                    className={`bg-white border rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                      task.status === 'completed'
                        ? 'border-slate-200 opacity-60 bg-slate-50/50'
                        : isOverdue
                        ? 'border-red-300 bg-red-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-emerald-500'
                    }`}
                  >
                    {/* Left check & info */}
                    <div className="flex items-start space-x-3.5 flex-1">
                      <button
                        onClick={() => onToggleTask(lead.id, task.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition mt-0.5 shrink-0 cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                            : 'border-slate-300 hover:border-emerald-600 bg-white'
                        }`}
                      >
                        {task.status === 'completed' && <Check className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </span>

                          {task.type === 'viewing' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              🏡 Viewing Appointment
                            </span>
                          )}

                          {task.priority === 'urgent' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                              <Flame className="w-2.5 h-2.5 text-red-600" /> URGENT
                            </span>
                          )}

                          {task.isAutomated && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Automated SLA
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="text-slate-700 font-medium hover:text-emerald-700 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            👤 {lead.name}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500 truncate max-w-xs">{lead.propertyTitle}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-400">{lead.source}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-0.5">
                          <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-600' : 'text-slate-400'}`} />
                          <span className={isOverdue ? 'text-red-700 font-bold' : ''}>
                            {isOverdue ? 'Overdue: ' : 'Scheduled: '} {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action buttons */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => onQuickWhatsApp(lead)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>

                      <button
                        onClick={() => onSelectLead(lead)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                        title="View Full Lead Details"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
