import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Home,
  Phone,
  MessageSquare,
  FileText,
  Zap,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowUpRight,
  Filter,
  Check,
  CalendarDays,
  ListOrdered,
  LayoutGrid,
  MapPin,
  User,
  X,
  Sparkles,
  Search,
} from 'lucide-react';
import { Lead, TaskItem, UrgencyLevel } from '../types';
import { formatDate } from '../utils/formatters';

interface AgentScheduleCalendarProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onToggleTask: (leadId: string, taskId: string) => void;
  onQuickWhatsApp: (lead: Lead) => void;
  onAddTask?: (leadId: string, task: TaskItem) => void;
  onRescheduleTask?: (leadId: string, taskId: string, newDueDate: string) => void;
  className?: string;
  defaultView?: 'month' | 'week' | 'day';
}

export const AgentScheduleCalendar: React.FC<AgentScheduleCalendarProps> = ({
  leads,
  onSelectLead,
  onToggleTask,
  onQuickWhatsApp,
  onAddTask,
  onRescheduleTask,
  className = '',
  defaultView = 'month',
}) => {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>(defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 27)); // Initialized around mock data date
  const [selectedDay, setSelectedDay] = useState<Date>(new Date(2026, 7, 27));
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedEvent, setSelectedEvent] = useState<{ task: TaskItem; lead: Lead } | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulePreselectedDate, setSchedulePreselectedDate] = useState<string>('');

  // Form state for scheduling new appointment/task
  const [formLeadId, setFormLeadId] = useState<string>(leads[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<TaskItem['type']>('viewing');
  const [formDate, setFormDate] = useState('2026-08-28');
  const [formTime, setFormTime] = useState('10:00');
  const [formPriority, setFormPriority] = useState<UrgencyLevel>('high');
  const [formLocation, setFormLocation] = useState('');

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState('2026-08-28');
  const [newRescheduleTime, setNewRescheduleTime] = useState('11:00');

  // Collect all events (tasks and viewing appointments)
  const allEvents = useMemo(() => {
    const events: { task: TaskItem; lead: Lead }[] = [];
    leads.forEach((lead) => {
      lead.tasks.forEach((task) => {
        events.push({ task, lead });
      });
    });
    return events;
  }, [leads]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(({ task }) => {
      if (typeFilter !== 'all') {
        if (typeFilter === 'viewing' && task.type !== 'viewing') return false;
        if (typeFilter === 'call' && task.type !== 'call') return false;
        if (typeFilter === 'contract' && task.type !== 'contract') return false;
        if (typeFilter === 'automated' && !task.isAutomated) return false;
        if (typeFilter === 'other' && (task.type === 'viewing' || task.type === 'call' || task.type === 'contract')) return false;
      }

      if (statusFilter === 'pending' && task.status !== 'pending') return false;
      if (statusFilter === 'completed' && task.status !== 'completed') return false;

      return true;
    });
  }, [allEvents, typeFilter, statusFilter]);

  // Navigation handlers
  const handlePrev = () => {
    if (calendarView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (calendarView === 'week') {
      const next = new Date(currentDate);
      next.setDate(currentDate.getDate() - 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(currentDate.getDate() - 1);
      setCurrentDate(next);
      setSelectedDay(next);
    }
  };

  const handleNext = () => {
    if (calendarView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (calendarView === 'week') {
      const next = new Date(currentDate);
      next.setDate(currentDate.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(currentDate.getDate() + 1);
      setCurrentDate(next);
      setSelectedDay(next);
    }
  };

  const handleToday = () => {
    const today = new Date(2026, 7, 27); // matching demo reference
    setCurrentDate(today);
    setSelectedDay(today);
  };

  // Month grid generation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based: 0=Mon, 6=Sun
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete weeks (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Week days generation
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = (curr.getDay() + 6) % 7; // Monday-based
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Helper to check if two dates are the same day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Helper to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(({ task }) => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  // Selected Day's events
  const selectedDayEvents = useMemo(() => {
    return getEventsForDate(selectedDay).sort(
      (a, b) => new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime()
    );
  }, [selectedDay, filteredEvents]);

  // Type styling helper
  const getEventBadgeStyle = (task: TaskItem) => {
    if (task.status === 'completed') {
      return 'bg-slate-100 text-slate-500 border-slate-200 line-through';
    }
    switch (task.type) {
      case 'viewing':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      case 'call':
        return 'bg-blue-50 text-blue-800 border-blue-300 font-semibold';
      case 'contract':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      case 'brochure':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getEventIcon = (type: TaskItem['type']) => {
    switch (type) {
      case 'viewing':
        return <Home className="w-3 h-3 text-emerald-600 shrink-0" />;
      case 'call':
        return <Phone className="w-3 h-3 text-blue-600 shrink-0" />;
      case 'contract':
        return <FileText className="w-3 h-3 text-amber-600 shrink-0" />;
      case 'brochure':
        return <MessageSquare className="w-3 h-3 text-purple-600 shrink-0" />;
      default:
        return <Clock className="w-3 h-3 text-slate-600 shrink-0" />;
    }
  };

  // Open Schedule Modal with specific day
  const handleOpenScheduleForDate = (date: Date) => {
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
    setFormDate(formatted);
    setSchedulePreselectedDate(formatted);
    setIsScheduleModalOpen(true);
  };

  // Submit Schedule Form
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLeadId || !formTitle) return;

    const targetLead = leads.find((l) => l.id === formLeadId);
    if (!targetLead) return;

    const dueISO = new Date(`${formDate}T${formTime}:00`).toISOString();

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      leadId: targetLead.id,
      leadName: targetLead.name,
      propertyTitle: targetLead.propertyTitle,
      title: formTitle,
      dueDate: dueISO,
      priority: formPriority,
      status: 'pending',
      type: formType,
      isAutomated: false,
    };

    if (onAddTask) {
      onAddTask(targetLead.id, newTask);
    } else {
      targetLead.tasks.push(newTask);
    }

    setIsScheduleModalOpen(false);
    setFormTitle('');
    setFormLocation('');
  };

  // Handle Reschedule
  const handleSaveReschedule = () => {
    if (!selectedEvent || !onRescheduleTask) return;
    const newISO = new Date(`${newRescheduleDate}T${newRescheduleTime}:00`).toISOString();
    onRescheduleTask(selectedEvent.lead.id, selectedEvent.task.id, newISO);
    setIsRescheduling(false);
    setSelectedEvent(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {/* Calendar Top Control Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Month Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {allEvents.filter((e) => e.task.status === 'pending').length} upcoming viewing appointments & tasks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 ml-0 sm:ml-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters & View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 font-medium shadow-2xs"
            >
              <option value="all">All Events & Tasks</option>
              <option value="viewing">🏡 Viewings Only</option>
              <option value="call">📞 Calls & 15-Min SLAs</option>
              <option value="contract">📄 Contracts & OTPs</option>
              <option value="automated">⚡ Automated SLAs</option>
            </select>
          </div>

          {/* View Mode Toggle (Month / Week / Day) */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                calendarView === 'month' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                calendarView === 'week' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                calendarView === 'day' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Day Agenda</span>
            </button>
          </div>

          {/* Schedule Button */}
          <button
            onClick={() => {
              setFormDate('2026-08-28');
              setIsScheduleModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Viewing / Task</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Viewport */}
      {calendarView === 'month' && (
        <div className="p-4 sm:p-5">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map(({ date, isCurrentMonth }, idx) => {
              const dayEvents = getEventsForDate(date);
              const isToday = isSameDay(date, new Date(2026, 7, 27));
              const isSelected = isSameDay(date, selectedDay);
              const viewingsCount = dayEvents.filter((e) => e.task.type === 'viewing').length;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(date)}
                  className={`min-h-[105px] sm:min-h-[120px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    !isCurrentMonth
                      ? 'bg-slate-50/40 border-slate-100 opacity-50'
                      : isSelected
                      ? 'bg-slate-50 border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Cell Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-600 text-white font-bold'
                          : isSelected
                          ? 'bg-slate-900 text-white'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {viewingsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-0.5" title={`${viewingsCount} Viewing Appointments`}>
                        <Home className="w-2.5 h-2.5 text-emerald-700" />
                        <span>{viewingsCount}</span>
                      </span>
                    )}
                  </div>

                  {/* Events preview chips */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(({ task, lead }) => {
                      const timeStr = new Date(task.dueDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent({ task, lead });
                          }}
                          className={`text-[10px] px-1.5 py-1 rounded-md border truncate flex items-center gap-1 transition hover:scale-[1.02] shadow-2xs ${getEventBadgeStyle(
                            task
                          )}`}
                          title={`${task.title} (${task.leadName})`}
                        >
                          {getEventIcon(task.type)}
                          <span className="font-mono text-[9px] opacity-75">{timeStr}</span>
                          <span className="truncate font-medium">{task.leadName || task.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-slate-500 font-semibold px-1">
                        +{dayEvents.length - 2} more...
                      </div>
                    )}
                  </div>

                  {/* Add button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenScheduleForDate(date);
                    }}
                    className="self-end text-[10px] text-slate-400 hover:text-emerald-700 p-0.5 rounded transition opacity-60 hover:opacity-100"
                    title="Add viewing or task on this day"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {calendarView === 'week' && (
        <div className="p-4 sm:p-5 overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDays.map((date, idx) => {
              const dayEvents = getEventsForDate(date);
              const isToday = isSameDay(date, new Date(2026, 7, 27));
              const isSelected = isSameDay(date, selectedDay);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(date)}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[360px] transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 border-slate-900 ring-2 ring-slate-900/10'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-slate-200 mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span
                      className={`inline-block mt-0.5 text-sm font-bold w-7 h-7 rounded-full leading-7 ${
                        isToday
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-800'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Event list for this week day */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayEvents.length === 0 ? (
                      <div className="text-center text-[11px] text-slate-400 italic pt-6">
                        No appointments
                      </div>
                    ) : (
                      dayEvents.map(({ task, lead }) => {
                        const timeStr = new Date(task.dueDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent({ task, lead });
                            }}
                            className={`p-2 rounded-xl border text-xs space-y-1 transition hover:shadow-xs cursor-pointer ${getEventBadgeStyle(
                              task
                            )}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold">{timeStr}</span>
                              {getEventIcon(task.type)}
                            </div>
                            <div className="font-bold text-[11px] leading-tight line-clamp-2">
                              {task.title}
                            </div>
                            <div className="text-[10px] opacity-80 truncate">
                              👤 {lead.name}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenScheduleForDate(date);
                    }}
                    className="mt-2 w-full py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center space-x-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Agenda View */}
      {calendarView === 'day' && (
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daily Agenda for {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedDayEvents.length} scheduled viewing appointments and follow-up tasks
              </p>
            </div>
            <button
              onClick={() => handleOpenScheduleForDate(selectedDay)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>

          <div className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-200">
                No viewings or tasks scheduled for this day. Click "Book Appointment" to add one!
              </div>
            ) : (
              selectedDayEvents.map(({ task, lead }) => {
                const timeStr = new Date(task.dueDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                      task.status === 'completed'
                        ? 'bg-slate-50/60 border-slate-200 opacity-60'
                        : task.type === 'viewing'
                        ? 'bg-emerald-50/30 border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                        <span className="font-mono text-xs font-bold text-slate-900">{timeStr}</span>
                        <span className="text-[9px] uppercase font-bold text-emerald-700">{task.type}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </h4>
                          {task.priority === 'urgent' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-red-600" /> Urgent
                            </span>
                          )}
                          {task.isAutomated && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Automated SLA
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span
                            onClick={() => onSelectLead(lead)}
                            className="font-medium text-slate-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" /> {lead.name}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {lead.propertyTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => onToggleTask(lead.id, task.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center space-x-1 ${
                          task.status === 'completed'
                            ? 'bg-slate-100 border-slate-200 text-slate-600'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{task.status === 'completed' ? 'Done' : 'Mark Done'}</span>
                      </button>

                      <button
                        onClick={() => onQuickWhatsApp(lead)}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                        title="WhatsApp Client"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSelectLead(lead)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Open Lead Profile"
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

      {/* Selected Day Footer Summary / Quick Agenda strip (when in Month view) */}
      {calendarView === 'month' && (
        <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Selected Day Agenda: {selectedDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h4>
              <span className="text-xs text-slate-500 font-mono">({selectedDayEvents.length} items)</span>
            </div>

            <button
              onClick={() => handleOpenScheduleForDate(selectedDay)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book viewing on this day</span>
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No tasks or appointments on this date. Click "+ Book viewing on this day" to schedule.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {selectedDayEvents.map(({ task, lead }) => {
                const timeStr = new Date(task.dueDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedEvent({ task, lead })}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition shadow-2xs space-y-1.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {timeStr}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.type === 'viewing'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {task.type}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 line-clamp-1">{task.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">👤 {lead.name} • {lead.propertyTitle}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Event Details Popover Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                  {getEventIcon(selectedEvent.task.type)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedEvent.task.type === 'viewing' ? 'Viewing Appointment Details' : 'Task Reminder Details'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedEvent.lead.referenceNumber} • {selectedEvent.lead.source}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setIsRescheduling(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Title & Status */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedEvent.task.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {selectedEvent.task.status.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{selectedEvent.task.title}</h4>
              </div>

              {/* Scheduled Time & Property */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Scheduled Date & Time:</span>
                  <span className="font-bold text-slate-900">{formatDate(selectedEvent.task.dueDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Priority Level:</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedEvent.task.priority}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 font-semibold block">Client & Property:</span>
                  <span className="font-bold text-slate-900 block">{selectedEvent.lead.name}</span>
                  <span className="text-slate-600 block truncate">{selectedEvent.lead.propertyTitle}</span>
                </div>
              </div>

              {/* Rescheduling Form if triggered */}
              {isRescheduling && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                  <span className="font-bold text-amber-900 block text-xs">Reschedule Appointment Time:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 block font-semibold mb-0.5">New Date</label>
                      <input
                        type="date"
                        value={newRescheduleDate}
                        onChange={(e) => setNewRescheduleDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block font-semibold mb-0.5">New Time</label>
                      <input
                        type="time"
                        value={newRescheduleTime}
                        onChange={(e) => setNewRescheduleTime(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setIsRescheduling(false)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveReschedule}
                      className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold"
                    >
                      Save New Time
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onToggleTask(selectedEvent.lead.id, selectedEvent.task.id);
                      setSelectedEvent(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                      selectedEvent.task.status === 'completed'
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{selectedEvent.task.status === 'completed' ? 'Re-open' : 'Mark as Completed'}</span>
                  </button>

                  <button
                    onClick={() => setIsRescheduling(!isRescheduling)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                  >
                    Reschedule
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onQuickWhatsApp(selectedEvent.lead);
                      setSelectedEvent(null);
                    }}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition"
                    title="Send WhatsApp Confirmation"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectLead(selectedEvent.lead);
                      setSelectedEvent(null);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center space-x-1 transition shadow-xs"
                  >
                    <span>View Lead</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment / Task Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Schedule Viewing Appointment or Task</h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-4 text-xs">
              {/* Select Lead */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Associated Client / Lead *</label>
                <select
                  required
                  value={formLeadId}
                  onChange={(e) => setFormLeadId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.propertyTitle} ({l.source})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Presets */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Appointment / Task Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. VIP In-Person Viewing with Alexander Sterling"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'VIP In-Person Private Viewing',
                    '4K Virtual Live Video Tour',
                    '15-Min Inbound Call SLA Check',
                    'CMA & Offer to Purchase Review',
                    'Key Handover & Inspection',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormTitle(preset)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  >
                    <option value="viewing">🏡 Viewing Appointment</option>
                    <option value="call">📞 Phone / SLA Call</option>
                    <option value="contract">📄 Contract / OTP Follow-up</option>
                    <option value="brochure">✉️ Brochure & WhatsApp Specs</option>
                    <option value="followup">📋 General Follow-up Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  >
                    <option value="urgent">🔥 Urgent Priority</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Confirm & Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
