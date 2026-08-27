import React from 'react';
import { 
  Kanban, 
  CheckSquare, 
  Calendar as CalendarIcon,
  Zap, 
  BarChart3, 
  Plus, 
  Radio, 
  Sparkles, 
  Bell, 
  Settings,
  Search,
  Command,
  Sun,
  Moon
} from 'lucide-react';
import { EmailNotificationLog } from '../types';

interface NavbarProps {
  currentView: 'pipeline' | 'tasks' | 'calendar' | 'automations' | 'reporting';
  setCurrentView: (view: 'pipeline' | 'tasks' | 'calendar' | 'automations' | 'reporting') => void;
  onOpenNewLead: () => void;
  onOpenSimulator: () => void;
  onToggleAiAdvisor: () => void;
  pendingTasksCount: number;
  recentNotifications: EmailNotificationLog[];
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenSettings: () => void;
  activeConnectorsCount?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenNewLead,
  onOpenSimulator,
  onToggleAiAdvisor,
  pendingTasksCount,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSettings,
  activeConnectorsCount = 8,
  darkMode,
  onToggleDarkMode,
  onOpenCommandPalette,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*
          Three-column grid, not flex justify-between: the CRM's own brand
          block (PTAH REALTY logo, "CRM Suite" badge, Property 24 &
          Syndication Hub subtitle, public-site link) was removed as
          redundant -- this Navbar only ever renders inside the main Ptah
          app's CRM tab, which already carries that branding. With a plain
          flex row, removing that left-hand block just left the nav tabs
          pinned to the left edge instead of centered (the right-hand
          action cluster is a different width, so justify-between's
          "space between two blocks" centering broke). A 3-column grid
          with equal 1fr flanks keeps the middle nav visually centered on
          the row regardless of what either side contains; the empty left
          column is the deliberate mirror of the right column's width.
        */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 gap-4">
          <div />

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 justify-self-center">
            <button
              onClick={() => setCurrentView('pipeline')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'pipeline'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Lead Pipeline</span>
            </button>

            <button
              onClick={() => setCurrentView('tasks')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition relative ${
                currentView === 'tasks'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Task Reminders</span>
              {pendingTasksCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'calendar'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Schedule Calendar</span>
            </button>

            <button
              onClick={() => setCurrentView('automations')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'automations'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Email & Automations</span>
            </button>

            <button
              onClick={() => setCurrentView('reporting')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'reporting'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports & Analytics</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 justify-self-end">
            {/* Global Command Palette Trigger (Cmd+K) */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-xs group"
              title="Global Search & Quick Actions (Press ⌘K or Ctrl+K)"
              aria-label="Open Command Palette"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
              <span className="hidden xl:inline text-slate-600 dark:text-slate-300 font-medium">Quick Search</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 shadow-2xs font-semibold">
                <span className="text-[9px]">⌘</span>K
              </kbd>
            </button>

            {/* Dark Mode Theme Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center justify-center"
              title={darkMode ? "Switch to Light Mode (Day Shift)" : "Switch to Dark Mode (Night Shift)"}
              aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-300" />
              )}
            </button>

            {/* Live Inbound Lead Simulator */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium transition cursor-pointer"
              title="Simulate incoming lead from Property 24 or competitors"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Simulate Lead</span>
              <span className="sm:hidden">Simulate</span>
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={onToggleAiAdvisor}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium transition cursor-pointer"
              title="AI CRM Strategy & Lead Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white relative transition cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Email Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Settings & Connectors Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Manage API Connectors, Property24, Gmail, Cal ID, and WhatsApp"
            >
              <Settings className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span className="hidden md:inline">Connectors</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 hidden sm:inline-block" title="All connectors active" />
            </button>

            {/* Add Lead Primary Button */}
            <button
              onClick={onOpenNewLead}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Lead</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto space-x-1">
          <button
            onClick={onOpenCommandPalette}
            className="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-1 cursor-pointer"
          >
            <Search className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Search (⌘K)</span>
          </button>
          <button
            onClick={() => setCurrentView('pipeline')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              currentView === 'pipeline' 
                ? 'bg-slate-900 dark:bg-emerald-600 text-white' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setCurrentView('tasks')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              currentView === 'tasks' 
                ? 'bg-slate-900 dark:bg-emerald-600 text-white' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Tasks ({pendingTasksCount})
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              currentView === 'calendar' 
                ? 'bg-slate-900 dark:bg-emerald-600 text-white' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setCurrentView('automations')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              currentView === 'automations' 
                ? 'bg-slate-900 dark:bg-emerald-600 text-white' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Automations
          </button>
          <button
            onClick={() => setCurrentView('reporting')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              currentView === 'reporting' 
                ? 'bg-slate-900 dark:bg-emerald-600 text-white' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Reporting
          </button>
          <button
            onClick={onOpenSettings}
            className="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800"
          >
            Connectors
          </button>
          <button
            onClick={onToggleDarkMode}
            className="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap text-slate-700 dark:text-amber-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-1"
          >
            {darkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-slate-600" />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

