"use client";

import React, { useState, useId } from "react";
import { useAuth } from "../lib/auth";
import { useTranslation } from "../lib/i18n";
import { useTextToSpeech } from "../lib/speech";
import { evaluateTriage, RED_FLAGS, CLINICAL_NON_DIAGNOSTIC_DISCLAIMER } from "../rules/urgencyEngine";
import { getCountryConfig } from "../config/countries";
import {
  AssessmentAnswers,
  CyclePattern,
  HyperandrogenismSign,
  MenarcheTiming,
  MentalHealthDistress,
  MetabolicSign,
  PcosStatus,
  TriageResult,
  UltrasoundResult,
  UrgencyLevel
} from "../types/agent";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  MapPin,
  ExternalLink,
  PhoneCall,
  Heart,
  Shield,
  Copy,
  Check,
  Sparkles,
  Stethoscope,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export function AgentView() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech(locale);

  // Country emergency configuration
  const countryConfig = getCountryConfig(user?.countryCode || "IN");

  // Step state: 0 = Status, 1 = Safety Screener, 2 = Menarche (teen only), 3 = Cycle, 4 = Androgens, 5 = Metabolic, 6 = Ultrasound (adult only), 7 = Mental Health, 8 = Results
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Assessment answers state
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    status: undefined,
    redFlags: [],
    cyclePattern: undefined,
    yearsSinceMenarche: undefined,
    androgenSigns: [],
    metabolicSigns: [],
    ultrasound: undefined,
    mentalHealth: undefined
  });

  // Result state
  const [result, setResult] = useState<TriageResult | null>(null);
  const [savedToTracker, setSavedToTracker] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [showWhyAccordion, setShowWhyAccordion] = useState(false);

  // Dynamic question steps based on age/cohort
  const isTeen = user?.isTeen ?? false;

  // Question metadata
  const totalQuestions = isTeen ? 6 : 6; // Status, Red Flags, Cycle (+Menarche for teens), Androgens, Metabolic, Ultrasound (adults only), Mental Health

  // Helper for text-to-speech for current step
  const handleReadAloud = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  // Evaluate assessment
  const handleCalculateTriage = (finalAnswers: AssessmentAnswers) => {
    const res = evaluateTriage(finalAnswers, user || undefined);
    setResult(res);
    setCurrentStep(99); // Results step
  };

  // Reset assessment
  const handleRestart = () => {
    stop();
    setAnswers({
      status: undefined,
      redFlags: [],
      cyclePattern: undefined,
      yearsSinceMenarche: undefined,
      androgenSigns: [],
      metabolicSigns: [],
      ultrasound: undefined,
      mentalHealth: undefined
    });
    setResult(null);
    setSavedToTracker(false);
    setCurrentStep(0);
  };

  // Save assessment to localStorage for Tracker integration
  const handleSaveToTracker = () => {
    if (!result) return;
    try {
      const savedData = {
        date: new Date().toISOString().split("T")[0],
        urgencyLevel: result.urgencyLevel,
        score: result.score,
        ruleSet: result.ruleSet,
        specialist: result.recommendedSpecialist.title,
        answers
      };
      localStorage.setItem("pcos_latest_assessment", JSON.stringify(savedData));
      setSavedToTracker(true);
    } catch {
      // LocalStorage error handled safely
    }
  };

  // Copy questions for doctor to clipboard
  const handleCopyQuestions = () => {
    if (!result?.questionsForDoctor) return;
    const text = result.questionsForDoctor.map((q, i) => `${i + 1}. ${q}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  // Build privacy-preserving Google Maps query URL
  const getMapsUrl = (specialtyQuery: string) => {
    const q = `${specialtyQuery} near me`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  };

  // -------------------------------------------------------------
  // RENDER RESULTS STEP
  // -------------------------------------------------------------
  if (currentStep === 99 && result) {
    const isEmergency = result.urgencyLevel === "EMERGENCY";
    const isUrgent = result.urgencyLevel === "URGENT";
    const isSoon = result.urgencyLevel === "SOON";
    const isRoutine = result.urgencyLevel === "ROUTINE";

    const badgeColors = isEmergency
      ? "bg-rose-600 text-white border-rose-500"
      : isUrgent
      ? "bg-orange-500 text-white border-orange-400"
      : isSoon
      ? "bg-amber-500 text-white border-amber-400"
      : "bg-emerald-600 text-white border-emerald-500";

    const bannerBg = isEmergency
      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200"
      : isUrgent
      ? "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900 text-orange-950 dark:text-orange-200"
      : isSoon
      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200"
      : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200";

    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
        {/* EMERGENCY TAKE-OVER FULL BANNER */}
        {isEmergency && (
          <div className="p-6 rounded-3xl bg-rose-600 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">
                  IMMEDIATE MEDICAL EMERGENCY ATTENTION ADVISED
                </h3>
                <p className="text-xs text-rose-100">
                  A high-risk acute red flag was reported during your assessment.
                </p>
              </div>
            </div>

            {/* Tap-to-call buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`tel:${countryConfig.emergencyNumber}`}
                className="px-5 py-3 rounded-2xl bg-white text-rose-700 font-extrabold text-sm flex items-center gap-2 shadow-lg hover:bg-rose-50 transition active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                Call Emergency ({countryConfig.emergencyNumber})
              </a>

              {result.mentalHealthEscalation && (
                <a
                  href={`tel:${countryConfig.mentalHealthHelpline}`}
                  className="px-5 py-3 rounded-2xl bg-rose-800 text-white font-extrabold text-sm flex items-center gap-2 shadow-md hover:bg-rose-900 transition active:scale-95"
                >
                  <Heart className="w-4 h-4" />
                  Crisis Support ({countryConfig.mentalHealthHelpline})
                </a>
              )}
            </div>

            {/* Calming reassurance breathing guide */}
            <div className="p-4 rounded-2xl bg-rose-700/60 border border-rose-500/50 flex items-center gap-4 text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-white/60 animate-ping shrink-0" />
              <p className="leading-relaxed">
                Take a slow, deep breath. You are taking the right step by seeking medical care. Please contact someone you trust or reach out to local emergency services immediately.
              </p>
            </div>
          </div>
        )}

        {/* Results Header Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${bannerBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5 ${badgeColors}`}>
                  {isEmergency && <AlertTriangle className="w-3.5 h-3.5" />}
                  {isUrgent && <Clock className="w-3.5 h-3.5" />}
                  {isSoon && <AlertCircle className="w-3.5 h-3.5" />}
                  {isRoutine && <CheckCircle2 className="w-3.5 h-3.5" />}
                  Urgency Level: {result.urgencyLevel}
                </span>

                <span className="text-xs font-semibold opacity-75">
                  Cohort: {result.ruleSet === "adolescent" ? "Adolescent (13-17)" : "Adult (18-45)"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
                {t(result.whyExplanationKey as any)}
              </h2>
            </div>

            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2 hover:bg-stone-50 dark:hover:bg-stone-700 self-start sm:self-center transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restart Assessment
            </button>
          </div>

          {/* Transparent WHY Breakdown Accordion */}
          <div className="space-y-3 pt-2 border-t border-current/10">
            <button
              onClick={() => setShowWhyAccordion(!showWhyAccordion)}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider opacity-90 hover:opacity-100"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Transparent Decision Breakdown ({result.plainLanguageReasons.length} factors)
              </span>
              {showWhyAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showWhyAccordion && (
              <ul className="space-y-2 text-xs pt-1 animate-in fade-in duration-200">
                {result.plainLanguageReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recommended Specialist Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 dark:text-purple-400">
                Recommended Specialist Pathway
              </span>
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                {result.recommendedSpecialist.title}
              </h3>
            </div>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            {result.recommendedSpecialist.rationale}
          </p>

          {/* Privacy-Preserving Care Finder */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Shield className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{t("agent.mapsDisclaimer")}</span>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <a
                href={getMapsUrl("gynecologist")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                Find Gynecologists
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>

              <a
                href={getMapsUrl("endocrinologist")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                Find Endocrinologists
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>

        {/* Questions to Ask Doctor */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Suggested Questions for Your Healthcare Provider
            </h3>

            <button
              onClick={handleCopyQuestions}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
            >
              {copiedQuestions ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Questions
                </>
              )}
            </button>
          </div>

          <ol className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 list-decimal list-inside leading-relaxed">
            {result.questionsForDoctor.map((q, idx) => (
              <li key={idx} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions & Integration with Tracker */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
          <span className="text-xs text-purple-900 dark:text-purple-200 font-medium">
            Save this assessment summary to your private Tracker history for doctor visits.
          </span>

          <button
            onClick={handleSaveToTracker}
            disabled={savedToTracker}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition ${
              savedToTracker
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-purple-700 hover:bg-purple-800 text-white"
            }`}
          >
            {savedToTracker ? (
              <>
                <Check className="w-4 h-4" />
                Saved to Tracker History
              </>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                {t("agent.saveToHistory")}
              </>
            )}
          </button>
        </div>

        {/* Clinical Non-Diagnostic Disclaimer */}
        <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/50 text-[11px] text-stone-500 space-y-1">
          <p className="font-semibold text-stone-700 dark:text-stone-300">
            Clinical Governance & Disclaimer:
          </p>
          <p>{CLINICAL_NON_DIAGNOSTIC_DISCLAIMER}</p>
          <p className="text-[10px] text-stone-400">
            Rules Engine Version: {result.rulesVersion} | Deterministic Rule Set: {result.ruleSet} | Evaluated locally without AI hallucination.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 0: PCOS CURRENT STATUS
  // -------------------------------------------------------------
  if (currentStep === 0) {
    const speechText = `${t("agent.stepStatus")} Clinically diagnosed, suspecting PCOS, or curious.`;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
              Question 1 of {totalQuestions}
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              {t("agent.stepStatus")}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select the option that best describes where you are on your PCOS journey.
            </p>
          </div>

          {isSupported && (
            <button
              onClick={() => handleReadAloud(speechText)}
              className={`p-2.5 rounded-2xl border transition ${
                isSpeaking
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-purple-400"
              }`}
              title="Read Question Aloud"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: "15%" }} />
        </div>

        {/* "Why we ask this" Accordion */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Why we ask this:</strong> Understanding whether you already have a clinical diagnosis helps us tailor recommendations — focusing on symptom management versus investigative diagnostic consultation.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {[
            { id: "diagnosed", label: t("agent.diagnosed"), desc: "A physician has formally evaluated your symptoms or hormone panel." },
            { id: "suspected", label: t("agent.suspected"), desc: "You experience irregular periods, acne, or hirsutism and want clarity." },
            { id: "curious", label: t("agent.curious"), desc: "You are learning about PCOS or supporting a family member." },
            { id: "not_sure", label: "Not sure / exploring", desc: "You are simply exploring what PCOS symptoms look like." }
          ].map((opt) => {
            const isSelected = answers.status === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAnswers({ ...answers, status: opt.id as PcosStatus })}
                className={`w-full p-4 text-left rounded-2xl border transition flex items-center justify-between ${
                  isSelected
                    ? "border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] hover:border-purple-300"
                }`}
              >
                <div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100 block">
                    {opt.label}
                  </span>
                  <span className="text-xs text-stone-500 mt-0.5 block">{opt.desc}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                    isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end pt-4">
          <button
            disabled={!answers.status}
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            Next: Safety Check
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 1: SAFETY SCREENER (RED FLAGS)
  // -------------------------------------------------------------
  if (currentStep === 1) {
    const redFlagList = Object.values(RED_FLAGS).filter((rf) => {
      // Hide pregnancy red flag for adolescents if not applicable
      if (isTeen && rf.code === "RF-004") return false;
      return true;
    });

    const isNoneSelected = answers.redFlags?.length === 0;

    const toggleRedFlag = (code: string) => {
      const current = answers.redFlags || [];
      if (current.includes(code)) {
        setAnswers({ ...answers, redFlags: current.filter((c) => c !== code) });
      } else {
        setAnswers({ ...answers, redFlags: [...current, code] });
      }
    };

    const handleSelectNone = () => {
      setAnswers({ ...answers, redFlags: [] });
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400">
              Question 2 of {totalQuestions} • Urgent Safety Check
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              Are you currently experiencing any acute symptoms?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select all that apply. If you have any sudden severe warning signs, we will guide you immediately.
            </p>
          </div>

          {isSupported && (
            <button
              onClick={() => handleReadAloud("Safety check: Are you experiencing sudden severe pelvic pain, heavy bleeding, fainting, or acute symptoms?")}
              className="p-2.5 rounded-2xl border bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-purple-400"
              title="Read Question Aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: "30%" }} />
        </div>

        {/* Red Flag Warning Box */}
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Clinical Safety Protocol:</strong> If you select an acute red flag (such as intense sudden pelvic pain or extreme hemorrhage), you will be directed to emergency care without waiting.
          </p>
        </div>

        {/* Red Flag Options */}
        <div className="space-y-2.5">
          {redFlagList.map((rf) => {
            const isChecked = answers.redFlags?.includes(rf.code) || false;
            return (
              <button
                key={rf.code}
                onClick={() => toggleRedFlag(rf.code)}
                className={`w-full p-3.5 text-left rounded-2xl border transition flex items-start justify-between ${
                  isChecked
                    ? "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] hover:border-rose-300 text-stone-800 dark:text-stone-200"
                }`}
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm block">{rf.label}</span>
                  <span className="text-[11px] opacity-75 mt-0.5 block">{rf.clinicalRationale}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ml-3 mt-0.5 ${
                    isChecked ? "border-rose-600 bg-rose-600 text-white" : "border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}

          {/* None of these option */}
          <button
            onClick={handleSelectNone}
            className={`w-full p-3.5 text-left rounded-2xl border transition flex items-center justify-between ${
              isNoneSelected
                ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100"
                : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] hover:border-emerald-300 text-stone-800 dark:text-stone-200"
            }`}
          >
            <div>
              <span className="font-bold text-xs sm:text-sm block">
                None of these acute symptoms apply to me
              </span>
              <span className="text-[11px] opacity-75 mt-0.5 block">
                My symptoms are chronic, ongoing, or mild.
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ml-3 ${
                isNoneSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 dark:border-stone-700"
              }`}
            >
              {isNoneSelected && <Check className="w-3 h-3" />}
            </div>
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentStep(0)}
            className="px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={() => {
              // If red flags were selected, immediately trigger emergency triage!
              if (answers.redFlags && answers.redFlags.length > 0) {
                handleCalculateTriage(answers);
              } else {
                // Otherwise proceed to cycle step (or menarche for teens)
                setCurrentStep(2);
              }
            }}
            className="px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            {answers.redFlags && answers.redFlags.length > 0 ? "View Immediate Triage" : "Next: Cycle Patterns"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 2: MENSTRUAL CYCLE & MENARCHE
  // -------------------------------------------------------------
  if (currentStep === 2) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
              Question 3 of {totalQuestions} • Menstrual Patterns
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              How would you describe your menstrual cycle?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Cycle regularity is one of the key indicators of hormonal ovulatory signaling.
            </p>
          </div>

          {isSupported && (
            <button
              onClick={() => handleReadAloud("How would you describe your menstrual cycle over the past 6 to 12 months?")}
              className="p-2.5 rounded-2xl border bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-purple-400"
              title="Read Question Aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: "45%" }} />
        </div>

        {/* "Why we ask this" */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Why we ask this:</strong> Cycles longer than 35-45 days or absent periods often point to irregular ovulation (oligo-anovulation). In teenagers within 2-3 years of menarche, variability can be a completely normal part of puberty.
          </p>
        </div>

        {/* Teen-specific Menarche timing question */}
        {isTeen && (
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-3">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              How long ago did you have your very first period?
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "under_1_year", label: "Under 1 year ago" },
                { id: "1_to_3_years", label: "1 to 3 years ago" },
                { id: "over_3_years", label: "Over 3 years ago" },
                { id: "not_sure", label: "Not sure" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAnswers({ ...answers, yearsSinceMenarche: m.id as MenarcheTiming })}
                  className={`p-2.5 rounded-xl border text-left font-medium transition ${
                    answers.yearsSinceMenarche === m.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200"
                      : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cycle Options */}
        <div className="space-y-2.5">
          {[
            { id: "regular_21_35", label: "Regular (every 21 to 35 days)", desc: "My period arrives consistently every month." },
            { id: "irregular_36_45", label: "Somewhat irregular (every 36 to 45 days)", desc: "Cycles fluctuate slightly from month to month." },
            { id: "infrequent_46_90", label: "Infrequent / Oligomenorrhea (every 46 to 90 days)", desc: "Fewer than 6-8 periods in the last year." },
            { id: "absent_over_90", label: "Absent / Amenorrhea (no period for 90+ days)", desc: "Missed periods for 3+ consecutive months." },
            ...(isTeen
              ? [{ id: "post_menarche_variable", label: "Variable because my periods just started", desc: "My cycle has not settled into a routine yet." }]
              : []),
            { id: "not_sure", label: "Not sure / Hard to track", desc: "I haven't been keeping track consistently." },
            { id: "prefer_not_to_say", label: "Prefer not to say", desc: "Skip this question." }
          ].map((c) => {
            const isSelected = answers.cyclePattern === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setAnswers({ ...answers, cyclePattern: c.id as CyclePattern })}
                className={`w-full p-3.5 text-left rounded-2xl border transition flex items-center justify-between ${
                  isSelected
                    ? "border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] hover:border-purple-300"
                }`}
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 block">
                    {c.label}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">{c.desc}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                    isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            disabled={!answers.cyclePattern}
            onClick={() => setCurrentStep(3)}
            className="px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            Next: Androgen Signs
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 3: ANDROGEN SIGNS
  // -------------------------------------------------------------
  if (currentStep === 3) {
    const toggleAndrogen = (sign: HyperandrogenismSign) => {
      const current = answers.androgenSigns || [];
      if (sign === "none" || sign === "prefer_not_to_say") {
        setAnswers({ ...answers, androgenSigns: [sign] });
        return;
      }
      const filtered = current.filter((s) => s !== "none" && s !== "prefer_not_to_say");
      if (filtered.includes(sign)) {
        setAnswers({ ...answers, androgenSigns: filtered.filter((s) => s !== sign) });
      } else {
        setAnswers({ ...answers, androgenSigns: [...filtered, sign] });
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
              Question 4 of {totalQuestions} • Physical Signs
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              Have you noticed any of these signs?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select all that apply. These can indicate clinical or biochemical hyperandrogenism (male hormone balance).
            </p>
          </div>

          {isSupported && (
            <button
              onClick={() => handleReadAloud("Have you noticed coarse facial or body hair, persistent cystic acne, or scalp hair thinning?")}
              className="p-2.5 rounded-2xl border bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-purple-400"
              title="Read Question Aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: "60%" }} />
        </div>

        {/* "Why we ask this" */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Why we ask this:</strong> The Rotterdam criteria looks for excess androgen activity, which can manifest as coarse facial hair (hirsutism), deep cystic acne, or scalp thinning.
          </p>
        </div>

        {/* Androgen Options */}
        <div className="space-y-2.5">
          {[
            {
              id: "facial_body_hair_moderate_severe",
              label: "Noticeable coarse facial or body hair (Hirsutism)",
              desc: "Thick, dark hair on upper lip, chin, chest, belly, or inner thighs."
            },
            {
              id: "facial_body_hair_mild",
              label: "Mild peach fuzz or stray hairs",
              desc: "A few light or sporadic stray hairs."
            },
            {
              id: "cystic_inflammatory_acne",
              label: "Persistent cystic or inflammatory acne",
              desc: "Deep, painful breakouts along jawline, neck, or back that resist standard washes."
            },
            {
              id: "male_pattern_hair_thinning",
              label: "Scalp hair thinning (Androgenic alopecia)",
              desc: "Thinning noticeable at the crown or widening of the hair part."
            },
            {
              id: "none",
              label: "None of the above",
              desc: "I do not experience these symptoms."
            },
            {
              id: "prefer_not_to_say",
              label: "Prefer not to say",
              desc: "Skip this question."
            }
          ].map((a) => {
            const isChecked = answers.androgenSigns?.includes(a.id as HyperandrogenismSign) || false;
            return (
              <button
                key={a.id}
                onClick={() => toggleAndrogen(a.id as HyperandrogenismSign)}
                className={`w-full p-3.5 text-left rounded-2xl border transition flex items-start justify-between ${
                  isChecked
                    ? "border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] hover:border-purple-300"
                }`}
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 block">
                    {a.label}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">{a.desc}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ml-3 mt-0.5 ${
                    isChecked ? "border-purple-600 bg-purple-600 text-white" : "border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            disabled={!answers.androgenSigns || answers.androgenSigns.length === 0}
            onClick={() => setCurrentStep(4)}
            className="px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            Next: Metabolic Signs
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 4: METABOLIC SIGNS
  // -------------------------------------------------------------
  if (currentStep === 4) {
    const toggleMetabolic = (sign: MetabolicSign) => {
      const current = answers.metabolicSigns || [];
      if (sign === "none" || sign === "prefer_not_to_say") {
        setAnswers({ ...answers, metabolicSigns: [sign] });
        return;
      }
      const filtered = current.filter((s) => s !== "none" && s !== "prefer_not_to_say");
      if (filtered.includes(sign)) {
        setAnswers({ ...answers, metabolicSigns: filtered.filter((s) => s !== sign) });
      } else {
        setAnswers({ ...answers, metabolicSigns: [...filtered, sign] });
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
              Question 5 of {totalQuestions} • Metabolic Markers
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              Have you noticed any of these metabolic signs?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select all that apply. Up to 70% of individuals with PCOS have some degree of insulin resistance.
            </p>
          </div>

          {isSupported && (
            <button
              onClick={() => handleReadAloud("Have you noticed dark velvety patches of skin on the neck or underarms, rapid weight changes, or severe post meal fatigue?")}
              className="p-2.5 rounded-2xl border bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-purple-400"
              title="Read Question Aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: "75%" }} />
        </div>

        {/* "Why we ask this" */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Why we ask this:</strong> Dark velvety skin folds (acanthosis nigricans) and intense post-meal sleepiness are clinical markers of elevated circulating insulin, which directly stimulates ovarian androgen production.
          </p>
        </div>

        {/* Metabolic Options */}
        <div className="space-y-2.5">
          {[
            {
              id: "acanthosis_nigricans",
              label: "Dark, velvety patches of skin (Acanthosis Nigricans)",
              desc: "Usually found around the back of the neck, armpits, or groin."
            },
            {
              id: "rapid_unexplained_weight_gain",
              label: "Weight centered around the midsection / difficulty maintaining weight",
              desc: "Unexplained central weight shifts despite consistent daily habits."
            },
            {
              id: "extreme_fatigue_post_meals",
              label: "Severe energy crashes or brain fog after eating",
              desc: "Intense sluggishness or cravings 1-2 hours after carbohydrate-rich meals."
            },
            {
              id: "none",
              label: "None of the above",
              desc: "I do not experience these symptoms."
            },
            {
              id: "prefer_not_to_say",
              label: "Prefer not to say",
              desc: "Skip this question."
            }
          ].map((m) => {
            const isChecked = answers.metabolicSigns?.includes(m.id as MetabolicSign) || false;
            return (
              <button
                key={m.id}
                onClick={() => toggleMetabolic(m.id as MetabolicSign)}
                className={`w-full p-3.5 text-left rounded-2xl border transition flex items-start justify-between ${
                  isChecked
                    ? "border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] hover:border-purple-300"
                }`}
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 block">
                    {m.label}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">{m.desc}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ml-3 mt-0.5 ${
                    isChecked ? "border-purple-600 bg-purple-600 text-white" : "border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentStep(3)}
            className="px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            disabled={!answers.metabolicSigns || answers.metabolicSigns.length === 0}
            onClick={() => {
              // If adult: go to ultrasound question (step 5). If teen: skip ultrasound and go to mental health (step 6).
              if (isTeen) {
                setCurrentStep(6);
              } else {
                setCurrentStep(5);
              }
            }}
            className="px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            {isTeen ? "Next: Emotional Well-Being" : "Next: Ultrasound Findings"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 5: ULTRASOUND (ADULTS ONLY)
  // -------------------------------------------------------------
  if (currentStep === 5) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
              Question 6 of {totalQuestions} • Pelvic Ultrasound (Adult)
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              Have you ever had an ovarian ultrasound?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ultrasound morphology is one of the Rotterdam criteria for adults (not recommended for adolescents).
            </p>
          </div>

          {isSupported && (
            <button
              onClick={() => handleReadAloud("Have you ever had a pelvic ultrasound of your ovaries showing polycystic appearance?")}
              className="p-2.5 rounded-2xl border bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-purple-400"
              title="Read Question Aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: "85%" }} />
        </div>

        {/* "Why we ask this" */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Why we ask this:</strong> Polycystic ovarian morphology (usually defined as 20+ follicles or increased ovarian volume) is considered in adult diagnosis alongside ovulatory dysfunction and hyperandrogenism.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {[
            { id: "yes_polycystic", label: "Yes, it showed polycystic ovaries (multiple small follicles)", desc: "Often described as a 'string of pearls' appearance on pelvic ultrasound." },
            { id: "yes_normal", label: "Yes, but it was reported as normal", desc: "No polycystic appearance noted." },
            { id: "not_tested", label: "No, I have never had a pelvic ultrasound", desc: "I have not undergone an ovarian scan." },
            { id: "prefer_not_to_say", label: "Not sure / Prefer not to say", desc: "I do not recall or prefer not to answer." }
          ].map((u) => {
            const isSelected = answers.ultrasound === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setAnswers({ ...answers, ultrasound: u.id as UltrasoundResult })}
                className={`w-full p-3.5 text-left rounded-2xl border transition flex items-center justify-between ${
                  isSelected
                    ? "border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] hover:border-purple-300"
                }`}
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 block">
                    {u.label}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">{u.desc}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                    isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentStep(4)}
            className="px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            disabled={!answers.ultrasound}
            onClick={() => setCurrentStep(6)}
            className="px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
          >
            Next: Emotional Well-Being
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 6: MENTAL & EMOTIONAL WELL-BEING
  // -------------------------------------------------------------
  if (currentStep === 6) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
              Final Step • Emotional Health
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              How has your emotional well-being felt recently?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Hormonal and metabolic fluctuations frequently interact with mood, stress, and sleep quality.
            </p>
          </div>

          {isSupported && (
            <button
              onClick={() => handleReadAloud("How has your emotional well-being and stress felt recently?")}
              className="p-2.5 rounded-2xl border bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-purple-400"
              title="Read Question Aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: "95%" }} />
        </div>

        {/* "Why we ask this" */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Why we ask this:</strong> Research shows elevated prevalence of anxiety and depression among individuals living with PCOS. Emotional well-being is an essential dimension of holistic care.
          </p>
        </div>

        {/* Mental Health Options */}
        <div className="space-y-2.5">
          {[
            { id: "none_or_mild", label: "Generally calm / mild routine stress", desc: "No significant emotional distress impacting my days." },
            { id: "moderate_anxiety_mood", label: "Moderate anxiety, irritability, or mood swings", desc: "Noticeable stress or low periods that sometimes feel overwhelming." },
            { id: "severe_distress", label: "Elevated anxiety, deep burnout, or feeling persistently overwhelmed", desc: "My emotional health feels heavily strained right now." },
            { id: "prefer_not_to_say", label: "Prefer not to say", desc: "Skip this question." }
          ].map((m) => {
            const isSelected = answers.mentalHealth === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setAnswers({ ...answers, mentalHealth: m.id as MentalHealthDistress })}
                className={`w-full p-3.5 text-left rounded-2xl border transition flex items-center justify-between ${
                  isSelected
                    ? "border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] hover:border-purple-300"
                }`}
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 block">
                    {m.label}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">{m.desc}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                    isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => (isTeen ? setCurrentStep(4) : setCurrentStep(5))}
            className="px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            disabled={!answers.mentalHealth}
            onClick={() => handleCalculateTriage(answers)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-700 to-teal-600 hover:from-purple-800 hover:to-teal-700 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition"
          >
            Complete Assessment & View Triage
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
