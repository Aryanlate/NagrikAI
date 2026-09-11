import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CitizenView from './components/CitizenView';
import DashboardView from './components/DashboardView';
import { Shield, Sparkles, Building2, Phone, ExternalLink } from 'lucide-react';
import { translate } from './translations';

export default function App() {
  // Simple state-based conditional routing as strictly requested:
  // 'citizen' | 'dashboard'
  const [currentView, setCurrentView] = useState('citizen');
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState(null);
  const [lang, setLang] = useState('en');

  const t = (key) => translate(lang, key);

  const handleTicketCreated = (ticket) => {
    setNewlyCreatedTicket(ticket);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e]">
      {/* Official Civic Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content View Container */}
      <main className="flex-1 w-full">
        {currentView === 'citizen' ? (
          <CitizenView onTicketCreated={handleTicketCreated} lang={lang} />
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
                  Nagrik<span className="text-blue-400">Ai</span> {t('footer.brand').replace(/^NagrikAi /, '')}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                {t('footer.description')}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{t('footer.triageNode')}</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2">
              <span className="text-white font-bold text-xs uppercase tracking-wider block">
                {t('footer.publicServices')}
              </span>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setCurrentView('citizen')}
                    className="hover:text-white transition-colors"
                  >
                    {t('footer.reportGrievance')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setCurrentView('dashboard')}
                    className="hover:text-white transition-colors"
                  >
                    {t('footer.staffCenter')}
                  </button>
                </li>
                <li>
                  <a href="#charter" onClick={(e) => { e.preventDefault(); alert("Karnataka Citizen's Charter 2011 (Sakala Services Act) applies to all tickets."); }} className="hover:text-white transition-colors flex items-center gap-1">
                    <span>{t('footer.citizenCharter')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Emergency Dispatch */}
            <div className="space-y-2">
              <span className="text-white font-bold text-xs uppercase tracking-wider block">
                {t('footer.emergencyHelplines')}
              </span>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('footer.bbmp')}<strong>1913</strong></span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('footer.bwssb')}<strong>1916</strong></span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('footer.bescom')}<strong>1912</strong></span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>{t('footer.copyright')}</p>
            <div className="flex items-center gap-4">
              <span>{t('footer.privacy')}</span>
              <span>{t('footer.terms')}</span>
              <span>{t('footer.sakala')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
