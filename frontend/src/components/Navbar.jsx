import React from 'react';
import { LayoutDashboard, UserCheck, ShieldAlert, PhoneCall, Globe2 } from 'lucide-react';
import CivicLogo from './CivicLogo';

export default function Navbar({ currentView, setCurrentView, ticketCount = 10, breachedCount = 3 }) {
  return (
    <header className="sticky top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top Official Civic Strip */}
      <div className="bg-[#1E40AF] text-white text-[12px] py-1 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 sm:gap-4 truncate">
            <span className="truncate">Public Civic Redressal Portal · Urban Development Directorate</span>
            <span className="hidden md:inline-block text-blue-200">|</span>
            <span className="hidden md:inline-flex items-center gap-1 bg-blue-900/60 px-2 py-0.5 rounded text-[11px] text-blue-100">
              <PhoneCall className="w-3 h-3 text-blue-300" />
              Toll-Free Control Room: 1913
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 text-[11px] text-blue-100">
              <Globe2 className="w-3.5 h-3.5" />
              <button type="button" className="font-semibold underline decoration-blue-300 hover:text-white">EN</button>
              <span>/</span>
              <button type="button" className="hover:text-white">हिन्दी</button>
              <span>/</span>
              <button type="button" className="hover:text-white">ಕನ್ನಡ</button>
            </div>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="hidden sm:inline-block text-[11px] text-emerald-300">AI Triage 24x7 Active</span>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo & Tagline */}
        <div className="cursor-pointer" onClick={() => setCurrentView('citizen')}>
          <CivicLogo showBadge={true} />
        </div>

        {/* View Toggle Controller */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shadow-inner">
            <button
              id="citizen-view-toggle"
              type="button"
              onClick={() => setCurrentView('citizen')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentView === 'citizen'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Citizen Portal</span>
            </button>

            <button
              id="staff-dashboard-toggle"
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Staff Dashboard</span>
              {breachedCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white ring-2 ring-white">
                  {breachedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
