import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CitizenView from './components/CitizenView';
import DashboardView from './components/DashboardView';
import { Shield, Sparkles, Building2, Phone, ExternalLink } from 'lucide-react';

export default function App() {
  // Simple state-based conditional routing as strictly requested:
  // 'citizen' | 'dashboard'
  const [currentView, setCurrentView] = useState('citizen');
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState(null);

  const handleTicketCreated = (ticket) => {
    setNewlyCreatedTicket(ticket);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e]">
      {/* Official Civic Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content View Container */}
      <main className="flex-1 w-full">
        {currentView === 'citizen' ? (
          <CitizenView onTicketCreated={handleTicketCreated} />
        ) : (
          <DashboardView setCurrentView={setCurrentView} />
        )}
      </main>

      {/* Official Civic Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 text-xs mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Authority Info */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-white font-bold text-sm tracking-tight">
                  Nagrik<span className="text-blue-400">Ai</span> Public Grievance Redressal
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Official AI-assisted civic response platform for Bengaluru Mahanagara Palike (BBMP),
                Bangalore Water Supply and Sewerage Board (BWSSB), and BESCOM. Powered by autonomous triage
                and statutory SLA compliance guarantees.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Statutory 24x7 Triage Node: Active (Ward SLA Monitoring v2.4)</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2">
              <span className="text-white font-bold text-xs uppercase tracking-wider block">
                Public Services
              </span>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setCurrentView('citizen')}
                    className="hover:text-white transition-colors"
                  >
                    Report Civic Grievance
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setCurrentView('dashboard')}
                    className="hover:text-white transition-colors"
                  >
                    Staff SLA Command Center
                  </button>
                </li>
                <li>
                  <a href="#charter" onClick={(e) => { e.preventDefault(); alert("Karnataka Citizen's Charter 2011 (Sakala Services Act) applies to all tickets."); }} className="hover:text-white transition-colors flex items-center gap-1">
                    <span>Citizen's Charter SLA</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Emergency Dispatch */}
            <div className="space-y-2">
              <span className="text-white font-bold text-xs uppercase tracking-wider block">
                Emergency Helplines
              </span>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>BBMP Control Room: <strong>1913</strong></span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>BWSSB Water Desk: <strong>1916</strong></span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>BESCOM Power Line: <strong>1912</strong></span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© 2025 Government of Karnataka. Department of Urban Development. All statutory rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Redressal</span>
              <span>Sakala Mission</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
