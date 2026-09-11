import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Clock,
  Building2,
  Tag,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Camera,
  ArrowRight
} from 'lucide-react';
import { analyzeComplaint, clarifyComplaint } from '../api/client';
import { QUICK_PROMPTS } from '../api/mockData';

export default function CitizenView({ onTicketCreated }) {
  // State machine: 'idle' | 'loading' | 'clarifying' | 'success'
  const [step, setStep] = useState('idle');

  // Input states
  const [complaintText, setComplaintText] = useState('');
  const [clarificationReply, setClarificationReply] = useState('');

  // AI response state
  const [aiQuestion, setAiQuestion] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Analyzing grievance syntax...');

  // Step 1: Submit initial grievance
  const handleSubmitInitial = async (e) => {
    e?.preventDefault();
    if (!complaintText.trim()) return;

    setStep('loading');
    setLoadingStage('AI Municipal Engine parsing category & jurisdiction...');

    try {
      const result = await analyzeComplaint(complaintText);

      if (result.needs_clarification) {
        setAiQuestion(result.question);
        setStep('clarifying');
      } else {
        setTicketData(result.ticket);
        setStep('success');
        if (onTicketCreated) onTicketCreated(result.ticket);
      }
    } catch (err) {
      console.error(err);
      setStep('idle');
    }
  };

  // Step 2: Send clarification reply
  const handleSendClarification = async (e) => {
    e?.preventDefault();
    if (!clarificationReply.trim()) return;

    setStep('loading');
    setLoadingStage('Synthesizing details & calculating statutory SLA...');

    try {
      const result = await clarifyComplaint(complaintText, clarificationReply);
      setTicketData(result.ticket);
      setStep('success');
      if (onTicketCreated) onTicketCreated(result.ticket);
    } catch (err) {
      console.error(err);
      setStep('clarifying');
    }
  };

  // Reset state machine
  const handleReset = () => {
    setComplaintText('');
    setClarificationReply('');
    setAiQuestion('');
    setTicketData(null);
    setCopied(false);
    setStep('idle');
  };

  const copyTicketId = () => {
    if (!ticketData?.id) return;
    navigator.clipboard.writeText(ticketData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Civic Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>BBMP Autonomous AI Civic Redressal</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Nagrik<span className="text-blue-600">Ai</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium mt-1">
          Report civic issues, get action.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
          Direct automated dispatch to municipal ward engineering units with real-time statutory SLA tracking.
        </p>
      </div>

      {/* State Machine Views */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 transition-all">

        {/* ================= STEP: IDLE ================= */}
        {step === 'idle' && (
          <form onSubmit={handleSubmitInitial} className="space-y-5">
            <div className="flex items-center justify-between">
              <label htmlFor="complaint-input" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Describe your civic issue or grievance
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                {complaintText.length}/600
              </span>
            </div>

            <div className="relative">
              <textarea
                id="complaint-input"
                rows={4}
                maxLength={600}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Describe your issue, e.g. 'No water supply in our area for three days'"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder:text-slate-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none shadow-inner"
              />
            </div>

            {/* Quick Suggestion Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Category Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setComplaintText(preset.text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-colors"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional attachment chips & submit action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => alert("Geo-tagging attached: Latitude 12.9716° N, Longitude 77.6412° E (Bengaluru)")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
                >
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Attach Photo</span>
                </button>
                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <MapPin className="w-3.5 h-3.5" /> GPS Active
                </span>
              </div>

              <button
                type="submit"
                id="submit-complaint-btn"
                disabled={!complaintText.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Submit Grievance</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP: LOADING ================= */}
        {step === 'loading' && (
          <div className="py-12 px-4 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-blue-50 flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                AI Municipal Triage in Progress
              </h3>
              <p className="text-sm text-slate-600 animate-pulse">
                {loadingStage}
              </p>
            </div>

            {/* Skeleton preview bars */}
            <div className="max-w-sm mx-auto space-y-2.5 pt-2">
              <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded-full w-4/5 mx-auto animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded-full w-2/3 mx-auto animate-pulse"></div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              BBMP Statutory SLA SLA Guarantee Engine
            </span>
          </div>
        )}

        {/* ================= STEP: CLARIFYING ================= */}
        {step === 'clarifying' && (
          <div className="space-y-6">
            {/* Context Notice */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    AI Grievance Interlocutor
                  </h3>
                  <p className="text-[11px] text-slate-500">Clarification required for accurate ward dispatch</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                Live Dialectic
              </span>
            </div>

            {/* Chat Flow Interface */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {/* User Sent Message Bubble */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs p-3.5 max-w-[85%] text-sm shadow-xs leading-relaxed">
                  <div className="text-[10px] font-semibold text-blue-200 mb-0.5 uppercase tracking-wider">
                    Your Initial Complaint
                  </div>
                  {complaintText}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* AI Received Bubble */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-xs p-4 max-w-[85%] text-sm text-slate-800 shadow-xs space-y-2 leading-relaxed">
                  <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    <span>NagrikAi Assistant</span>
                    <span className="text-slate-400 lowercase font-normal">just now</span>
                  </div>
                  <p className="font-medium text-slate-800">
                    {aiQuestion || "Which locality or street is affected, and approximately how many households are impacted?"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick response helpers */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Estimated Locations (Click to populate)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "12th Main Road, HAL 2nd Stage, Indiranagar",
                  "4th Block, near Sony World Signal, Koramangala",
                  "8th Cross, Margosa Road, Malleshwaram",
                  "27th Main, Sector 1, HSR Layout"
                ].map((loc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setClarificationReply(loc)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendClarification} className="space-y-3 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  id="clarification-reply-input"
                  value={clarificationReply}
                  onChange={(e) => setClarificationReply(e.target.value)}
                  placeholder="Type your reply (e.g., '12th Main Road, near post office, 40 houses')..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
                />
                <button
                  type="submit"
                  id="send-clarification-btn"
                  disabled={!clarificationReply.trim()}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send Reply</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP: SUCCESS ================= */}
        {step === 'success' && ticketData && (
          <div className="space-y-6">
            {/* Header Success Ribbon */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Statutory Docket Generated
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Grievance Docket Registered Successfully
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Your incident has been verified by BBMP AI and routed to the jurisdictional field engineer.
                </p>
              </div>
            </div>

            {/* Ticket ID Strip */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Ticket ID
                </span>
                <span className="text-xl font-mono font-extrabold text-blue-700">
                  {ticketData.id}
                </span>
              </div>

              <button
                type="button"
                onClick={copyTicketId}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                title="Copy Ticket ID"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Official Metadata Grid (2x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Category */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Category</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{ticketData.category}</p>
                <p className="text-xs text-slate-500 truncate">{ticketData.summary}</p>
              </div>

              {/* Department */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Department Routed</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{ticketData.department}</p>
                <p className="text-xs text-slate-500">{ticketData.location}</p>
              </div>

              {/* Expected Resolution Timeframe */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resolution Timeframe</span>
                </div>
                <p className="text-sm font-bold text-emerald-700">{ticketData.resolutionTimeframe}</p>
                <p className="text-xs text-slate-500">Tier 1 Municipal SLA Guarantee</p>
              </div>

              {/* Field Officer */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Unit</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{ticketData.assignedOfficer}</p>
                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Dispatched
                </span>
              </div>
            </div>

            {/* Redressal Progress Track */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Redressal Progression</span>
                <span className="text-blue-700">Stage 2 of 4: Dispatched</span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full w-1/2 rounded-full transition-all"></div>
              </div>

              <div className="grid grid-cols-4 text-center text-[11px] font-semibold text-slate-400">
                <span className="text-blue-700">Submitted</span>
                <span className="text-blue-700">AI Verified</span>
                <span>Dispatched</span>
                <span>Resolved</span>
              </div>
            </div>

            {/* Polite Confirmation Message */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
              <p className="font-bold text-blue-900">
                Thank you for being an active citizen.
              </p>
              <p className="text-slate-600">
                Your local ward engineering squad has received this automated dispatch. You will receive real-time SMS status updates as the crew reaches the spot.
              </p>
            </div>

            {/* Reset Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                id="reset-citizen-form-btn"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Submit Another Issue</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
