"use client";

import React, { useState } from "react";
import { useTranslation } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import { calculateAge, evaluateAgeEligibility } from "../types/auth";
import { COUNTRIES } from "../config/countries";
import {
  ShieldAlert,
  UserCheck,
  Heart,
  Sparkles,
  Lock,
  X,
  AlertCircle,
  HelpCircle,
  Info
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToKnowledge: () => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onNavigateToKnowledge
}: OnboardingModalProps) {
  const { t } = useTranslation();
  const { user, loginAsDemoAdult, loginAsDemoTeen, loginAsGuest, registerUser } = useAuth();

  const [mode, setMode] = useState<"quick" | "custom">("quick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("2000-01-01");
  const [countryCode, setCountryCode] = useState("IN");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [dataConsent, setDataConsent] = useState(true);
  const [trackingConsent, setTrackingConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAge = calculateAge(dob);
  const eligibility = evaluateAgeEligibility(currentAge);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !dob) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    if (!eligibility.isEligible) {
      if (eligibility.status === "UNDER_13") {
        setErrorMsg(t("onboarding.under13Message"));
      } else {
        setErrorMsg(t("onboarding.over45Message"));
      }
      return;
    }

    if (eligibility.isTeen && !guardianEmail) {
      setErrorMsg("Parent or guardian email is required for users aged 13-17.");
      return;
    }

    const res = registerUser({
      name,
      email,
      dateOfBirth: dob,
      countryCode,
      guardianEmail: eligibility.isTeen ? guardianEmail : undefined,
      consents: {
        dataStorage: dataConsent,
        symptomTracking: trackingConsent,
        optionalAnalytics: eligibility.isTeen ? false : analyticsConsent
      }
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg("Registration failed. Please check your inputs.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1C1826] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-purple-700 to-teal-600 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-purple-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              User Onboarding & Profile Setup
            </span>
            <h2 className="text-lg font-bold mt-0.5">{t("onboarding.welcomeTitle")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white/80 hover:text-white"
            aria-label="Close onboarding modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Quick Demo Accounts vs Custom Registration */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 p-1 shrink-0">
          <button
            onClick={() => setMode("quick")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === "quick"
                ? "bg-white dark:bg-[#1C1826] text-purple-800 dark:text-purple-300 shadow-sm"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            Quick 1-Click Demo Profiles
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === "custom"
                ? "bg-white dark:bg-[#1C1826] text-purple-800 dark:text-purple-300 shadow-sm"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            Custom Sign-Up & Age Gate
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {mode === "quick" ? (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Select an pre-configured profile to test the application flows immediately:
              </p>

              {/* Demo Adult Card */}
              <div
                onClick={() => {
                  loginAsDemoAdult();
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  user?.id === "demo-adult-1845"
                    ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-600/20"
                    : "border-stone-200 dark:border-stone-800 hover:border-purple-300 bg-white dark:bg-stone-900/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                    PS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Priya Sharma
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                        Adult (26y)
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Standard adult clinical rules, lab trends, and full cycle tracking.
                    </p>
                  </div>
                </div>
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>

              {/* Demo Teen Card */}
              <div
                onClick={() => {
                  loginAsDemoTeen();
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  user?.id === "demo-teen-1317"
                    ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-600/20"
                    : "border-stone-200 dark:border-stone-800 hover:border-purple-300 bg-white dark:bg-stone-900/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                    AV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Ananya Verma
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                        Adolescent (15y)
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Adolescent clinical rule set, guardian consent placeholder, sensitive topics omitted.
                    </p>
                  </div>
                </div>
                <UserCheck className="w-5 h-5 text-teal-600" />
              </div>

              {/* Guest Card */}
              <div
                onClick={() => {
                  loginAsGuest();
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  user?.isGuest
                    ? "border-stone-600 bg-stone-100 dark:bg-stone-800 ring-2 ring-stone-600/20"
                    : "border-stone-200 dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-900/30"
                }`}
              >
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Guest Mode
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Explore knowledge articles and test the symptom checker without saving health records.
                  </p>
                </div>
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                  Read Only
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">{errorMsg}</p>
                    {!eligibility.isEligible && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToKnowledge();
                        }}
                        className="mt-2 text-xs font-bold underline hover:text-rose-950"
                      >
                        Go to Public Knowledge Guides &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>

              {/* Date of Birth (Age Gate) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t("onboarding.dobPrompt")} *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      eligibility.isAdult
                        ? "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300"
                        : eligibility.isTeen
                        ? "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                        : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300"
                    }`}
                  >
                    Age: {currentAge} ({eligibility.status})
                  </div>
                </div>
              </div>

              {/* Adolescent Guardian Consent Step if Teen (13-17) */}
              {eligibility.isTeen && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                    <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                      Parent / Guardian Consent Required (DPDP Act)
                    </h4>
                  </div>
                  <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
                    {t("onboarding.guardianConsentNotice")}
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-950 dark:text-purple-200 mb-1">
                      {t("onboarding.guardianEmail")} *
                    </label>
                    <input
                      type="email"
                      required
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-stone-800 text-xs"
                    />
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">
                      PLACEHOLDER: Email-based verification flow to be reviewed by legal counsel.
                    </p>
                  </div>
                </div>
              )}

              {/* Country Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Country / Region (for localized emergency numbers)
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                >
                  {Object.values(COUNTRIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} (Emergency: {c.emergencyNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Granular DPDP Consent Checkboxes */}
              <div className="space-y-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Data Protection & Privacy Consents
                </span>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataConsent}
                    onChange={(e) => setDataConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 accent-purple-600"
                  />
                  <span className="text-xs text-stone-700 dark:text-stone-300">
                    {t("onboarding.consentDataStorage")}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackingConsent}
                    onChange={(e) => setTrackingConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 accent-purple-600"
                  />
                  <span className="text-xs text-stone-700 dark:text-stone-300">
                    {t("onboarding.consentTracking")}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={eligibility.isTeen}
                    checked={eligibility.isTeen ? false : analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 accent-purple-600 disabled:opacity-50"
                  />
                  <span className="text-xs text-stone-600 dark:text-stone-400">
                    {t("onboarding.consentAnalytics")}{" "}
                    {eligibility.isTeen && "(Disabled for minors)"}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-4 py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-600/20 transition"
              >
                {t("onboarding.startApp")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
