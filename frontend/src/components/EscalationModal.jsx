import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Send, CheckCircle2 } from 'lucide-react';

export default function EscalationModal({ ticket, onClose, onConfirm }) {
  const [authority, setAuthority] = useState('Zonal Commissioner (BBMP Central)');
  const [notes, setNotes] = useState('Immediate statutory intervention required due to SLA breach. Field response delayed past charter limit.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onConfirm(ticket.id, `${authority}: ${notes}`);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Emergency SLA Escalation
              </h3>
              <p className="text-xs text-red-100">
                Statutory Municipal Intervention Notice
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-800">
                Ticket {ticket.id}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-200 text-red-900 uppercase">
                {ticket.slaRemaining}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {ticket.summary}
            </p>
            <p className="text-xs text-slate-500">
              {ticket.location} · {ticket.department}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Escalate Directly To:
            </label>
            <select
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="Zonal Commissioner (BBMP Central)">Zonal Commissioner (BBMP Central)</option>
              <option value="Chief Engineer (Operations & Maintenance)">Chief Engineer (Operations & Maintenance)</option>
              <option value="Special Commissioner (Grievance Redressal)">Special Commissioner (Grievance Redressal)</option>
              <option value="Ward Vigilance Directorate">Ward Vigilance Directorate</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Escalation Directive / Memo:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Escalating...' : 'Dispatch Escalation Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
