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
  Gift,
  RefreshCw,
  Share2,
  Mail,
  Send,
  Building,
  Crown
} from 'lucide-react';
import { Lead, TaskItem, UrgencyLevel, ShowHouseRecord } from '../types';
import { formatDate } from '../utils/formatters';

export type CalendarEventType =
  | 'viewing'
  | 'call'
  | 'contract'
  | 'birthday'
  | 'showhouse'
  | 'automated'
  | 'brochure'
  | 'followup'
  | 'other'
  | 'email';

export interface CalendarEventItem {
  id: string;
  type: CalendarEventType;
  title: string;
  dueDate: string; // ISO string
  lead?: Lead;
  task?: TaskItem;
  showHouse?: ShowHouseRecord;
  birthdayLead?: Lead;
  birthdayAge?: number;
  priority?: UrgencyLevel;
  status?: 'pending' | 'completed';
  isAutomated?: boolean;
  location?: string;
}

interface AgentScheduleCalendarProps {
  leads: Lead[];
  showHouses?: ShowHouseRecord[];
  onSelectLead: (lead: Lead) => void;
  onToggleTask?: (leadId: string, taskId: string) => void;
  onQuickWhatsApp: (lead: Lead) => void;
  onAddTask?: (leadId: string, task: TaskItem) => void;
  onRescheduleTask?: (leadId: string, taskId: string, newDueDate: string) => void;
  onSyncCalendars?: () => void;
  isSyncing?: boolean;
  className?: string;
  defaultView?: 'month' | 'week' | 'day';
}

export const AgentScheduleCalendar: React.FC<AgentScheduleCalendarProps> = ({
  leads,
  showHouses = [],
  onSelectLead,
  onToggleTask,
  onQuickWhatsApp,
  onAddTask,
  onRescheduleTask,
  onSyncCalendars,
  isSyncing = false,
  className = '',
  defaultView = 'month',
}) => {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>(defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 28)); // August 2026 reference
  const [selectedDay, setSelectedDay] = useState<Date>(new Date(2026, 7, 28));
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Selected item modal states
  const [selectedTaskEvent, setSelectedTaskEvent] = useState<{ task: TaskItem; lead: Lead } | null>(null);
  const [selectedBirthdayLead, setSelectedBirthdayLead] = useState<{ lead: Lead; age: number; dateStr: string } | null>(null);
  const [selectedShowHouseEvent, setSelectedShowHouseEvent] = useState<ShowHouseRecord | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isBirthdayGreetingSent, setIsBirthdayGreetingSent] = useState(false);

  // Form state for scheduling new appointment/task
  const [formLeadId, setFormLeadId] = useState<string>(leads[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<TaskItem['type']>('viewing');
  const [formDate, setFormDate] = useState('2026-08-28');
  const [formTime, setFormTime] = useState('10:00');
  const [formPriority, setFormPriority] = useState<UrgencyLevel>('high');

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState('2026-08-28');
  const [newRescheduleTime, setNewRescheduleTime] = useState('11:00');

  // Collect ALL unified events: Tasks + Birthdays + Show Houses
  const allEvents = useMemo(() => {
    const events: CalendarEventItem[] = [];

    // 1. Tasks from leads
    leads.forEach((lead) => {
      lead.tasks.forEach((task) => {
        events.push({
          id: `task-${task.id}`,
          type: task.isAutomated ? 'automated' : task.type || 'other',
          title: task.title,
          dueDate: task.dueDate,
          lead,
          task,
          priority: task.priority,
          status: task.status,
          isAutomated: task.isAutomated,
          location: lead.propertyLocation,
        });
      });
    });

    // 2. Client Birthdays (projected into 2026)
    leads.forEach((lead) => {
      if (lead.birthday) {
        const parts = lead.birthday.split('-');
        if (parts.length === 3) {
          const birthYear = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          const currentYear = 2026;
          const age = currentYear - birthYear;

          // Construct 2026 birthday ISO string at 09:00 AM
          const monthStr = month < 10 ? `0${month}` : `${month}`;
          const dayStr = day < 10 ? `0${day}` : `${day}`;
          const birthdayDate = `${currentYear}-${monthStr}-${dayStr}T09:00:00Z`;

          events.push({
            id: `bday-${lead.id}`,
            type: 'birthday',
            title: `🎂 ${lead.name} (${age}th Birthday)`,
            dueDate: birthdayDate,
            birthdayLead: lead,
            birthdayAge: age,
            priority: 'urgent',
            status: 'pending',
            location: lead.propertyLocation,
          });
        }
      }
    });

    // 3. Show Houses
    showHouses.forEach((sh) => {
      events.push({
        id: `showhouse-${sh.id}`,
        type: 'showhouse',
        title: `🏠 Show House: ${sh.propertyName}`,
        dueDate: sh.startDate,
        showHouse: sh,
        priority: 'high',
        status: sh.status === 'closed' ? 'completed' : 'pending',
        location: sh.propertyLocation,
      });
    });

    return events;
  }, [leads, showHouses]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((item) => {
      if (typeFilter !== 'all') {
        if (typeFilter === 'viewing' && item.type !== 'viewing') return false;
        if (typeFilter === 'call' && item.type !== 'call') return false;
        if (typeFilter === 'contract' && item.type !== 'contract') return false;
        if (typeFilter === 'birthday' && item.type !== 'birthday') return false;
        if (typeFilter === 'showhouse' && item.type !== 'showhouse') return false;
        if (typeFilter === 'automated' && item.type !== 'automated') return false;
        if (
          typeFilter === 'other' &&
          (item.type === 'viewing' ||
            item.type === 'call' ||
            item.type === 'contract' ||
            item.type === 'birthday' ||
            item.type === 'showhouse')
        )
          return false;
      }

      if (statusFilter === 'pending' && item.status !== 'pending') return false;
      if (statusFilter === 'completed' && item.status !== 'completed') return false;

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
    const today = new Date(2026, 7, 28);
    setCurrentDate(today);
    setSelectedDay(today);
  };

  // Month grid generation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based
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

    // Next month padding to fill complete weeks
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
    const dayOfWeek = (curr.getDay() + 6) % 7;
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
    return filteredEvents.filter((item) => {
      const eventDate = new Date(item.dueDate);
      return isSameDay(eventDate, date);
    });
  };

  // Selected Day's events
  const selectedDayEvents = useMemo(() => {
    return getEventsForDate(selectedDay).sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [selectedDay, filteredEvents]);

  // Styling helper for badges
  const getEventBadgeStyle = (item: CalendarEventItem) => {
    if (item.status === 'completed') {
      return 'bg-slate-100 text-slate-500 border-slate-200 line-through';
    }
    switch (item.type) {
      case 'birthday':
        return 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
      case 'showhouse':
        return 'bg-cyan-50 text-cyan-900 border-cyan-300 font-bold';
      case 'viewing':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      case 'call':
        return 'bg-blue-50 text-blue-800 border-blue-300 font-semibold';
      case 'contract':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      case 'automated':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getEventIcon = (type: CalendarEventType) => {
    switch (type) {
      case 'birthday':
        return <Gift className="w-3 h-3 text-rose-600 shrink-0" />;
      case 'showhouse':
        return <Building className="w-3 h-3 text-cyan-600 shrink-0" />;
      case 'viewing':
        return <Home className="w-3 h-3 text-emerald-600 shrink-0" />;
      case 'call':
        return <Phone className="w-3 h-3 text-blue-600 shrink-0" />;
      case 'contract':
        return <FileText className="w-3 h-3 text-amber-600 shrink-0" />;
      case 'automated':
        return <Zap className="w-3 h-3 text-indigo-600 shrink-0" />;
      default:
        return <CheckCircle2 className="w-3 h-3 text-slate-500 shrink-0" />;
    }
  };

  const handleEventClick = (event: CalendarEventItem) => {
    if (event.type === 'birthday' && event.birthdayLead) {
      setSelectedBirthdayLead({
        lead: event.birthdayLead,
        age: event.birthdayAge || 40,
        dateStr: formatDate(event.dueDate),
      });
      setIsBirthdayGreetingSent(false);
    } else if (event.type === 'showhouse' && event.showHouse) {
      setSelectedShowHouseEvent(event.showHouse);
    } else if (event.task && event.lead) {
      setSelectedTaskEvent({ task: event.task, lead: event.lead });
      setIsRescheduling(false);
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddTask || !formTitle) return;

    const lead = leads.find((l) => l.id === formLeadId);
    const dueDateISO = new Date(`${formDate}T${formTime}:00`).toISOString();

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      leadId: formLeadId,
      leadName: lead?.name || 'Client',
      propertyTitle: lead?.propertyTitle || 'Exclusive Mandate',
      title: formTitle,
      dueDate: dueDateISO,
      priority: formPriority,
      status: 'pending',
      type: formType,
    };

    onAddTask(formLeadId, newTask);
    setIsScheduleModalOpen(false);
    setFormTitle('');
  };

  const handleSaveReschedule = () => {
    if (!selectedTaskEvent || !onRescheduleTask) return;
    const newISO = new Date(`${newRescheduleDate}T${newRescheduleTime}:00`).toISOString();
    onRescheduleTask(selectedTaskEvent.lead.id, selectedTaskEvent.task.id, newISO);
    setIsRescheduling(false);
    setSelectedTaskEvent(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden ${className}`}>
      {/* Calendar Top Control Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Month Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {allEvents.filter((e) => e.status === 'pending').length} active events, viewings & client milestones
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 ml-0 sm:ml-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters & View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter Dropdown - Includes Birthdays, Show Houses, Viewings, Calls, Contracts */}
          <div className="flex items-center space-x-1.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-semibold shadow-2xs cursor-pointer"
            >
              <option value="all">All Events & Tasks</option>
              <option value="birthday">🎂 Client Birthdays & Anniversaries</option>
              <option value="showhouse">🏠 Show Houses & Openings</option>
              <option value="viewing">🏡 Viewings & Inspections</option>
              <option value="call">📞 Calls & 15-Min SLAs</option>
              <option value="contract">📄 Contracts & OTPs</option>
              <option value="automated">⚡ Automated SLAs</option>
              <option value="other">📌 Other Tasks</option>
            </select>
          </div>

          {/* View Mode Toggle (Month / Week / Day) */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                calendarView === 'month'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                calendarView === 'week'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                calendarView === 'day'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
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
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Viewport: Month View */}
      {calendarView === 'month' && (
        <div className="p-4 sm:p-5">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
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
              const isToday = isSameDay(date, new Date(2026, 7, 28));
              const isSelected = isSameDay(date, selectedDay);
              const hasBirthday = dayEvents.some((e) => e.type === 'birthday');
              const hasShowHouse = dayEvents.some((e) => e.type === 'showhouse');

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(date)}
                  className={`min-h-[110px] sm:min-h-[125px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    !isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-40'
                      : isToday
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/20'
                      : isSelected
                      ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-900 dark:border-slate-600 ring-2 ring-slate-900/10'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Cell Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : isSelected
                          ? 'bg-slate-900 text-white'
                          : isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <div className="flex items-center space-x-1">
                      {hasBirthday && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Client Birthday" />
                      )}
                      {hasShowHouse && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500" title="Show House Event" />
                      )}
                    </div>
                  </div>

                  {/* Events preview chips */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((item) => {
                      const timeStr = new Date(item.dueDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(item);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md border truncate flex items-center gap-1 transition hover:scale-[1.02] shadow-2xs cursor-pointer ${getEventBadgeStyle(
                            item
                          )}`}
                          title={item.title}
                        >
                          {getEventIcon(item.type)}
                          <span className="font-mono text-[9px] opacity-75">{timeStr}</span>
                          <span className="truncate font-medium">{item.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold px-1">
                        +{dayEvents.length - 2} more...
                      </div>
                    )}
                  </div>

                  {/* Add button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                      setFormDate(dateString);
                      setIsScheduleModalOpen(true);
                    }}
                    className="self-end text-[10px] text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 p-0.5 rounded transition opacity-60 hover:opacity-100"
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
              const isToday = isSameDay(date, new Date(2026, 7, 28));
              const isSelected = isSameDay(date, selectedDay);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(date)}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[360px] transition cursor-pointer ${
                    isToday
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                      : isSelected
                      ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-900 dark:border-slate-600 ring-2 ring-slate-900/10'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span
                      className={`inline-block mt-0.5 text-sm font-bold w-7 h-7 rounded-full leading-7 ${
                        isToday
                          ? 'bg-amber-500 text-slate-950'
                          : isSelected
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-800 dark:text-slate-200'
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
                      dayEvents.map((item) => {
                        const timeStr = new Date(item.dueDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(item);
                            }}
                            className={`p-2 rounded-xl border text-xs space-y-1 transition hover:shadow-xs cursor-pointer ${getEventBadgeStyle(
                              item
                            )}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold">{timeStr}</span>
                              {getEventIcon(item.type)}
                            </div>
                            <div className="font-bold text-[11px] leading-tight line-clamp-2">
                              {item.title}
                            </div>
                            {item.location && (
                              <div className="text-[10px] opacity-75 truncate flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                <span>{item.location}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Agenda View */}
      {calendarView === 'day' && (
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Agenda for {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedDayEvents.length} scheduled events, viewings, and milestones
              </p>
            </div>
            <button
              onClick={() => {
                const dateString = `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, '0')}-${String(selectedDay.getDate()).padStart(2, '0')}`;
                setFormDate(dateString);
                setIsScheduleModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>

          <div className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                No viewings or tasks scheduled for this day. Click "Book Appointment" to add one!
              </div>
            ) : (
              selectedDayEvents.map((item) => {
                const timeStr = new Date(item.dueDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={item.id}
                    onClick={() => handleEventClick(item)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {getEventIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {timeStr}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase ${getEventBadgeStyle(item)}`}>
                            {item.type}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {item.title}
                        </h4>
                        {item.location && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{item.location}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Birthday Celebration Modal */}
      {selectedBirthdayLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    VIP Birthday Celebration
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedBirthdayLead.dateStr} • {selectedBirthdayLead.age}th Birthday Milestone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBirthdayLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Profile Card */}
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200/80 dark:border-rose-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedBirthdayLead.lead.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {selectedBirthdayLead.lead.propertyTitle}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  VIP Milestone
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone</span>
                  <span className="font-mono">{selectedBirthdayLead.lead.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Assigned Agent</span>
                  <span>{selectedBirthdayLead.lead.assignedAgent.name}</span>
                </div>
              </div>
            </div>

            {/* Campaign Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Automated VIP Greeting Actions
              </label>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated Champagne & Greeting Script:</span>
                </span>
                <p className="italic text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  "Dear {selectedBirthdayLead.lead.name.split(' ')[0]}, the entire executive team at Ptah Real Estate wishes you a wonderful {selectedBirthdayLead.age}th Birthday! May this year bring continued prosperity and happiness. 🍾🥂"
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  onQuickWhatsApp(selectedBirthdayLead.lead);
                  setIsBirthdayGreetingSent(true);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isBirthdayGreetingSent ? 'Greeting Sent via WhatsApp!' : 'Send WhatsApp Champagne Greeting'}</span>
              </button>

              <button
                onClick={() => {
                  onSelectLead(selectedBirthdayLead.lead);
                  setSelectedBirthdayLead(null);
                }}
                className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1 transition shadow-xs cursor-pointer"
              >
                <span>Open Lead CRM</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show House Modal */}
      {selectedShowHouseEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-700 flex items-center justify-center border border-cyan-200 dark:border-cyan-800">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Show House Event Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedShowHouseEvent.propertyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedShowHouseEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-cyan-50/50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-900 dark:text-cyan-300 text-sm">
                    {selectedShowHouseEvent.propertyName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-600 text-white text-[10px] font-bold uppercase">
                    {selectedShowHouseEvent.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-cyan-600" />
                  <span>{selectedShowHouseEvent.propertyLocation}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold">Agent In Charge</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedShowHouseEvent.agentInCharge}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold">Registered Attendees</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedShowHouseEvent.attendeeCount || 8} VIP Guests</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedShowHouseEvent(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task / Viewing Event Detail Modal */}
      {selectedTaskEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  {getEventIcon(selectedTaskEvent.task.type)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedTaskEvent.task.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDate(selectedTaskEvent.task.dueDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Lead Profile Banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Client / Buyer</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedTaskEvent.lead.name}</span>
                  <span className="text-[11px] text-slate-500 block">{selectedTaskEvent.lead.propertyTitle}</span>
                </div>
                <button
                  onClick={() => {
                    onSelectLead(selectedTaskEvent.lead);
                    setSelectedTaskEvent(null);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 flex items-center space-x-1 transition cursor-pointer"
                >
                  <span>Lead Profile</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {/* Reschedule Box */}
              {isRescheduling && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block">Reschedule Appointment</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 dark:text-slate-300 block font-semibold mb-0.5">New Date</label>
                      <input
                        type="date"
                        value={newRescheduleDate}
                        onChange={(e) => setNewRescheduleDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 dark:text-slate-300 block font-semibold mb-0.5">New Time</label>
                      <input
                        type="time"
                        value={newRescheduleTime}
                        onChange={(e) => setNewRescheduleTime(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setIsRescheduling(false)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveReschedule}
                      className="px-3 py-1 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Save New Time
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {onToggleTask && (
                    <button
                      onClick={() => {
                        onToggleTask(selectedTaskEvent.lead.id, selectedTaskEvent.task.id);
                        setSelectedTaskEvent(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        selectedTaskEvent.task.status === 'completed'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{selectedTaskEvent.task.status === 'completed' ? 'Re-open' : 'Mark as Completed'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsRescheduling(!isRescheduling)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                  >
                    Reschedule
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onQuickWhatsApp(selectedTaskEvent.lead);
                      setSelectedTaskEvent(null);
                    }}
                    className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                    title="Send WhatsApp Confirmation"
                  >
                    <MessageSquare className="w-4 h-4" />
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Viewing Appointment or Task</h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-4 text-xs">
              {/* Select Lead */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Associated Client / Lead *</label>
                <select
                  required
                  value={formLeadId}
                  onChange={(e) => setFormLeadId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
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
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Appointment / Task Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. VIP In-Person Viewing with Alexander Sterling"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
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
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Category Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="viewing">🏡 Viewing Appointment</option>
                    <option value="call">📞 Phone / SLA Call</option>
                    <option value="contract">📄 Contract / OTP Follow-up</option>
                    <option value="brochure">✉️ Brochure & WhatsApp Specs</option>
                    <option value="followup">📋 General Follow-up Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
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
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
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
