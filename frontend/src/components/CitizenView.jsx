import React, { useState, useRef, useEffect } from 'react';
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
import { translate } from '../translations';

export default function CitizenView({ onTicketCreated, lang = 'en', triggerToast }) {
  const t = (key) => translate(lang, key);

  // State machine: 'idle' | 'loading' | 'clarifying' | 'success'
  const [step, setStep] = useState('idle');

  // Input states
  const [complaintText, setComplaintText] = useState('');
  const [clarificationReply, setClarificationReply] = useState('');

  // AI response state
  const [aiQuestion, setAiQuestion] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingStage, setLoadingStage] = useState('citizen.loading.stage1');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const successToastFiredRef = useRef(false);

  useEffect(() => {
    if (step === 'success' && ticketData && !successToastFiredRef.current && triggerToast) {
      successToastFiredRef.current = true;
      triggerToast(`Ticket ${ticketData.id} created ✅`);
    }
  }, [step, ticketData, triggerToast]);

  // Step 1: Submit initial grievance
  const handleSubmitInitial = async (e) => {
    e?.preventDefault();
    if (!complaintText.trim()) return;

    setStep('loading');
    setErrorMessage(null);
    setLoadingStage('citizen.loading.stage2');

    try {
      const result = await analyzeComplaint(complaintText);

      if (result.needs_clarification) {
        setAiQuestion(result.question);
        setClarificationReply('');
        setStep('clarifying');
      } else {
        setTicketData(result.ticket);
        setSuccessMessage(result.citizen_response_message || '');
        setStep('success');
        if (onTicketCreated) onTicketCreated(result.ticket);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to submit grievance. Please try again.');
      setStep('idle');
    }
  };

  // Step 2: Send clarification reply (supports multiple rounds)
  const handleSendClarification = async (e) => {
    e?.preventDefault();
    if (!clarificationReply.trim()) return;

    setStep('loading');
    setErrorMessage(null);
    setLoadingStage('citizen.loading.stage3');

    try {
      const result = await clarifyComplaint(complaintText, clarificationReply);

      if (result.needs_clarification) {
        setAiQuestion(result.question);
        setClarificationReply('');
        setStep('clarifying');
      } else {
        setTicketData(result.ticket);
        setSuccessMessage(result.citizen_response_message || '');
        setStep('success');
        if (onTicketCreated) onTicketCreated(result.ticket);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to process reply. Please try again.');
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
    setErrorMessage(null);
    setSuccessMessage('');
    successToastFiredRef.current = false;
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
          <span>{t('citizen.hero.badge')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Nagrik<span className="text-blue-600">Ai</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium mt-1">
          {t('citizen.hero.brand')}
        </p>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
          {t('citizen.hero.subtitle')}
        </p>
      </div>

      {/* State Machine Views */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 transition-all">

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <p className="text-xs font-bold text-red-800">
                {t('citizen.error.title')}
              </p>
              <p className="text-xs text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ================= STEP: IDLE ================= */}
        {step === 'idle' && (
          <form onSubmit={handleSubmitInitial} className="space-y-5">
            <div className="flex items-center justify-between">
              <label htmlFor="complaint-input" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                {t('citizen.form.step1Title')}
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
                placeholder={t('citizen.form.placeholder')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder:text-slate-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none shadow-inner"
              />
            </div>

            {/* Quick Suggestion Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {t('citizen.form.presetsTitle')}
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
                    <span>{t(preset.labelKey) || preset.label}</span>
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
                  <span>{t('citizen.form.attachPhoto')}</span>
                </button>
                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <MapPin className="w-3.5 h-3.5" /> {t('citizen.form.gpsActive')}
                </span>
              </div>

              <button
                type="submit"
                id="submit-complaint-btn"
                disabled={!complaintText.trim() || step !== 'idle'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>{t('citizen.form.submit')}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP: LOADING ================= */}
        {step === 'loading' && (
          <div className="py-12 px-4 text-center space-y-6">
            {/* AI Thinking Chat Bubble */}
            <div className="flex items-start gap-2.5 justify-start max-w-md mx-auto">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-xs p-4 text-slate-800 shadow-xs space-y-2 text-left">
                <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  NagrikAi Assistant · just now
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  Analyzing your grievance...
                </p>
                <p className="text-sm text-slate-600">
                  {t(loadingStage)}
                </p>
                <div className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>

            {/* Skeleton preview bars */}
            <div className="max-w-sm mx-auto space-y-2.5 pt-2">
              <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded-full w-4/5 mx-auto animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded-full w-2/3 mx-auto animate-pulse"></div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              {t('citizen.loading.guarantee')}
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
                    {t('citizen.clarify.title')}
                  </h3>
                  <p className="text-[11px] text-slate-500">{t('citizen.clarify.subtitle')}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                {t('citizen.clarify.badge')}
              </span>
            </div>

            {/* Chat Flow Interface */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {/* User Sent Message Bubble */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs p-3.5 max-w-[85%] text-sm shadow-xs leading-relaxed">
                  <div className="text-[10px] font-semibold text-blue-200 mb-0.5 uppercase tracking-wider">
                    {t('citizen.clarify.userBubble')}
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
                    <span>{t('citizen.clarify.assistant')}</span>
                    <span className="text-slate-400 lowercase font-normal">{t('citizen.clarify.justNow')}</span>
                  </div>
                  <p className="font-medium text-slate-800">
                    {aiQuestion || t('citizen.clarify.fallbackQuestion')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick response helpers */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {t('citizen.clarify.helperTitle')}
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
                  placeholder={t('citizen.clarify.replyPlaceholder')}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
                />
                <button
                  type="submit"
                  id="send-clarification-btn"
                  disabled={!clarificationReply.trim() || step !== 'clarifying'}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('citizen.clarify.sendReply')}</span>
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
                  {t('citizen.success.ribbonBadge')}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {t('citizen.success.ribbonTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  {t('citizen.success.ribbonSubtitle')}
                </p>
              </div>
            </div>

            {/* Ticket ID Strip */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('citizen.success.ticketIdLabel')}
                </span>
                <span className="text-xl font-mono font-extrabold text-blue-700">
                  {ticketData.id}
                </span>
              </div>

              <button
                type="button"
                onClick={copyTicketId}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                title={t('citizen.success.copyTitle')}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">{t('citizen.success.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('citizen.success.copyId')}</span>
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
                  <span>{t('citizen.success.meta.category')}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{ticketData.category}</p>
                <p className="text-xs text-slate-500 truncate">{ticketData.summary}</p>
              </div>

              {/* Department */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('citizen.success.meta.department')}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{ticketData.department}</p>
                <p className="text-xs text-slate-500">{ticketData.location}</p>
              </div>

              {/* Expected Resolution Timeframe */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('citizen.success.meta.timeframe')}</span>
                </div>
                <p className="text-sm font-bold text-emerald-700">{ticketData.resolutionTimeframe}</p>
                <p className="text-xs text-slate-500">{t('citizen.success.meta.slaGuarantee')}</p>
              </div>

              {/* Field Officer */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('citizen.success.meta.unit')}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{ticketData.assignedOfficer}</p>
                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  {t('citizen.success.meta.dispatched')}
                </span>
              </div>
            </div>

            {/* Classification Reasoning Block */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Why this classification?</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {ticketData.reasoning || "Classified based on complaint content."}
              </p>
            </div>

            {/* Redressal Progress Track */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{t('citizen.success.track.title')}</span>
                <span className="text-blue-700">{t('citizen.success.track.stage2')}</span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full w-1/2 rounded-full transition-all"></div>
              </div>

              <div className="grid grid-cols-4 text-center text-[11px] font-semibold text-slate-400">
                <span className="text-blue-700">{t('citizen.success.track.submitted')}</span>
                <span className="text-blue-700">{t('citizen.success.track.aiVerified')}</span>
                <span>{t('citizen.success.track.dispatched')}</span>
                <span>{t('citizen.success.track.resolved')}</span>
              </div>
            </div>

            {/* Polite Confirmation Message */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
              <p className="font-bold text-blue-900">
                {t('citizen.success.thanks')}
              </p>
              <p className="text-slate-600">
                {successMessage || t('citizen.success.defaultMsg')}
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
                <span>{t('citizen.success.submitAnother')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
