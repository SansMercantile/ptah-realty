import React from 'react';
import { 
  LayoutDashboard,
  Kanban, 
  Calendar as CalendarIcon,
  Zap, 
  BarChart3, 
  Plus, 
  Radio, 
  Sun,
  Moon,
  Home,
  Rows3
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'pipeline' | 'calendar' | 'automations' | 'reporting' | 'scrum';
  setCurrentView: (view: 'dashboard' | 'pipeline' | 'calendar' | 'automations' | 'reporting' | 'scrum') => void;
  onOpenNewLead: () => void;
  onOpenSimulator: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenNewLead,
  onOpenSimulator,
  darkMode,
  onToggleDarkMode,
  onOpenCommandPalette,
}) => {
  return (
    <header className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/40 dark:border-slate-700/40 text-slate-900 dark:text-slate-100 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*
          Flex justify-between, not the old three-column centered grid:
          the brand icon that used to occupy the left slot is gone (removed
          per explicit request) and the nav tabs now sit flush against the
          far left edge instead of being centered, with the action
          cluster still pinned to the right.
        */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Center Navigation Tabs -- now flush left */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

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

            <button
              onClick={() => setCurrentView('scrum')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentView === 'scrum'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Rows3 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>Sprints</span>
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

            {/*
              AI Advisor button removed from here -- AI Copilot is now
              a persistent docked side panel, open by default, with its
              own close control (see AiAdvisorDrawer.tsx / CRMApp.tsx),
              not something toggled from the top taskbar.
            */}

            {/*
              Settings & Connectors button removed from here -- reachable
              from the "Connectors" item in the main app's user dropdown
              instead (App.tsx's onOpenCRMConnectors / openConnectorsSignal).
            */}

            {/* Add Lead Primary Button */}
            <button
              onClick={onOpenNewLead}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Lead</span>
            </button>

            {/* Quick Listings & Syndication Hub shortcut removed from
                here -- redundant with the "QUICK LISTING" button already
                on the Dashboard's New Listings card (DashboardView.tsx),
                per explicit request. Still reachable via the command
                palette and Dashboard. */}

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
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Dashboard
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
            onClick={() => setCurrentView('scrum')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              currentView === 'scrum'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Sprints
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
