import React from 'react';
import { 
  Building2, 
  Kanban, 
  Calendar as CalendarIcon,
  Zap, 
  BarChart3, 
  Plus, 
  Radio, 
  Sparkles, 
  Sun,
  Moon,
  Home
} from 'lucide-react';

interface NavbarProps {
  currentView: 'pipeline' | 'tasks' | 'calendar' | 'automations' | 'reporting';
  setCurrentView: (view: 'pipeline' | 'tasks' | 'calendar' | 'automations' | 'reporting') => void;
  onOpenNewLead: () => void;
  onOpenQuickListing?: () => void;
  onOpenSimulator: () => void;
  onToggleAiAdvisor: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenNewLead,
  onOpenQuickListing,
  onOpenSimulator,
  onToggleAiAdvisor,
  darkMode,
  onToggleDarkMode,
  onOpenCommandPalette,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 sticky top-0 z-20 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setCurrentView('pipeline')}
              className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center shadow-sm ring-1 ring-slate-800 dark:ring-slate-700 hover:ring-emerald-500 transition cursor-pointer"
              title="Return to Lead Pipeline"
              aria-label="Home"
            >
              <Building2 className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrentView('pipeline')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentView === 'tasks'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Task Reminders</span>
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/*
              Quick Search / Command Palette trigger removed from here --
              consolidated into the main app header's single Quick Search
              button, which opens this same command palette while on the
              CRM tab (see App.tsx's crmOpenCommandPaletteSignal / this
              component's onOpenCommandPalette prop, still called directly
              by Cmd+K in CRMApp.tsx).
            */}

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

            {/*
              Settings & Connectors button removed from here -- reachable
              from the "Connectors" item in the main app's user dropdown
              instead (App.tsx's onOpenCRMConnectors / openConnectorsSignal).
            */}

            {/* Quick Listing shortcut */}
            {onOpenQuickListing && (
              <button
                onClick={onOpenQuickListing}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xs ring-1 ring-emerald-400/60"
                title="Quick Listing Creator: Auto-fill property details, asking price & 1-click syndicate"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span className="hidden sm:inline">Quick Listing</span>
              </button>
            )}

            {/* Add Lead Primary Button */}
            <button
              onClick={onOpenNewLead}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Lead</span>
            </button>

            {/* Dark Mode Theme Toggle -- far right, per explicit request.
                The Notification Bell that used to sit next to this has
                been removed entirely (not just repositioned): the main
                app header's own bell now reaches this CRM's notification
                drawer directly while on the CRM tab (see
                openNotificationsSignal in CRMApp.tsx / Header.tsx), so
                there is deliberately no second bell here to reposition. */}
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
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto space-x-1">
          <button
            onClick={onOpenCommandPalette}
            className="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-1 cursor-pointer"
          >
            <Home className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Search (⌘K)</span>
          </button>
          <button
            onClick={() => setCurrentView('pipeline')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              currentView === 'pipeline'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setCurrentView('tasks')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              currentView === 'tasks'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              currentView === 'calendar'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setCurrentView('automations')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              currentView === 'automations'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Automations
          </button>
          <button
            onClick={() => setCurrentView('reporting')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              currentView === 'reporting'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Reporting
          </button>
          <button
            onClick={onToggleDarkMode}
            className="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap text-slate-700 dark:text-amber-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-1 cursor-pointer"
          >
            {darkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-slate-600" />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
