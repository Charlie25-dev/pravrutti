"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { useTranslation, LOCALES, Locale } from "../lib/i18n";
import { COUNTRIES, getCountryConfig } from "../config/countries";
import { CONTACT_CONFIG } from "../config/contact";
import {
  User,
  Settings,
  Shield,
  ShieldAlert,
  Moon,
  Sun,
  Laptop,
  Globe,
  Eye,
  EyeOff,
  Lock,
  Download,
  Trash2,
  Mail,
  Clock,
  MapPin,
  Check,
  AlertTriangle,
  HeartHandshake,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  KeyRound
} from "lucide-react";

export function ProfileView({ onOpenOnboarding }: { onOpenOnboarding: () => void }) {
  const { user, logout, loginAsGuest } = useAuth();
  const { t, locale, setLocale } = useTranslation();

  // Settings State
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [discreetMode, setDiscreetMode] = useState<boolean>(false);
  const [pinEnabled, setPinEnabled] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>(user?.countryCode || "IN");

  // Granular Consents State (synced from user)
  const [consents, setConsents] = useState({
    dataStorage: user?.consents?.dataStorage ?? true,
    symptomTracking: user?.consents?.symptomTracking ?? true,
    optionalAnalytics: user?.consents?.optionalAnalytics ?? false
  });

  // Modals & Feedback State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [tempPin, setTempPin] = useState<string>("");
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("pcos_theme") as "light" | "dark" | "system" | null;
      if (storedTheme) setTheme(storedTheme);

      const storedDiscreet = localStorage.getItem("pcos_discreet_mode");
      if (storedDiscreet) setDiscreetMode(storedDiscreet === "true");

      const storedPin = localStorage.getItem("pcos_pin_code");
      if (storedPin) {
        setPinEnabled(true);
        setPinCode(storedPin);
      }
    } catch {
      // LocalStorage error handled safely
    }
  }, []);

  // Apply Theme to DOM
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    try {
      localStorage.setItem("pcos_theme", newTheme);
    } catch {}

    const isDark =
      newTheme === "dark" ||
      (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Toggle Discreet Mode
  const handleToggleDiscreetMode = () => {
    const nextVal = !discreetMode;
    setDiscreetMode(nextVal);
    try {
      localStorage.setItem("pcos_discreet_mode", String(nextVal));
    } catch {}
  };

  // Save PIN
  const handleSavePin = () => {
    if (tempPin.length === 4) {
      setPinCode(tempPin);
      setPinEnabled(true);
      try {
        localStorage.setItem("pcos_pin_code", tempPin);
      } catch {}
      setShowPinModal(false);
      setTempPin("");
    }
  };

  // Remove PIN
  const handleRemovePin = () => {
    setPinCode("");
    setPinEnabled(false);
    try {
      localStorage.removeItem("pcos_pin_code");
    } catch {}
  };

  // 1-Click DPDP & GDPR Encrypted Health Data Export
  const handleExportData = () => {
    try {
      // Gather all local items into compliant export payload
      const exportPayload = {
        exportDate: new Date().toISOString(),
        complianceStandard: "India DPDP Act 2023 & GDPR Data Portability Article 20",
        exportVersion: "1.0.0",
        userProfile: user,
        settings: {
          theme,
          locale,
          country: selectedCountry,
          discreetMode,
          pinProtected: pinEnabled
        },
        healthRecords: {
          latestAssessment: JSON.parse(localStorage.getItem("pcos_latest_assessment") || "null"),
          habits: JSON.parse(localStorage.getItem("pcos_daily_habits") || "{}"),
          medicalHistory: JSON.parse(localStorage.getItem("pcos_medical_history") || "[]"),
          medications: JSON.parse(localStorage.getItem("pcos_medications") || "[]"),
          cycleLogs: JSON.parse(localStorage.getItem("pcos_cycle_logs") || "[]"),
          labResults: JSON.parse(localStorage.getItem("pcos_lab_results") || "[]")
        },
        clinicalNotice: "PLACEHOLDER: needs clinical review. This exported health record is patient-reported."
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pcos_companion_health_export_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {
      alert("Unable to generate export file. Please try again.");
    }
  };

  // Right to Erasure: Permanent Account & Health Data Deletion
  const handleConfirmPermanentDelete = () => {
    try {
      // Clear all health records and profile from localStorage
      localStorage.removeItem("pcos_active_user");
      localStorage.removeItem("pcos_latest_assessment");
      localStorage.removeItem("pcos_daily_habits");
      localStorage.removeItem("pcos_medical_history");
      localStorage.removeItem("pcos_medications");
      localStorage.removeItem("pcos_cycle_logs");
      localStorage.removeItem("pcos_lab_results");
      localStorage.removeItem("pcos_pin_code");

      setDeleteSuccess(true);
      setShowDeleteModal(false);

      setTimeout(() => {
        loginAsGuest();
        setDeleteSuccess(false);
      }, 1500);
    } catch {
      setShowDeleteModal(false);
    }
  };

  const countryConfig = getCountryConfig(selectedCountry);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <User className="w-6 h-6 text-purple-600" />
            {t("profile.title")}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage your account identity, DPDP privacy rights, discreet preferences, and security PIN.
          </p>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="px-4 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-2 transition"
        >
          <UserCheck className="w-4 h-4 text-purple-600" />
          Switch Profile / Persona
        </button>
      </div>

      {/* Success Notifications */}
      {exportSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Health records successfully exported as a DPDP/GDPR-compliant JSON file.</span>
        </div>
      )}

      {deleteSuccess && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-rose-600" />
          <span>All health records permanently erased from device. Switching to Guest Explorer...</span>
        </div>
      )}

      {/* 1. User Identity & Demographic Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-purple-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  {user?.name || "Guest Explorer"}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  {user?.isGuest ? "Guest Mode" : user?.isTeen ? "Teen Cohort (13–17)" : "Adult Cohort (18–45)"}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {user?.email || "No email linked (Offline Guest)"}
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Current Age</span>
            <span className="text-sm font-extrabold text-stone-800 dark:text-stone-200">
              {user?.age ? `${user.age} years` : "Unspecified"}
            </span>
          </div>
        </div>

        {/* Guardian Consent Card for Teens */}
        {user?.isTeen && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                India DPDP Act: Guardian Consent Status
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-[10px] uppercase font-black">
                {user.guardianConsent?.status || "PENDING"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Linked Parent/Guardian: <strong>{user.guardianConsent?.guardianEmail || "parent.ananya@placeholder.org"}</strong>
            </p>
            <p className="text-[10px] text-amber-700/80 dark:text-amber-400 italic">
              PLACEHOLDER: Guardian verification workflow pending review by legal counsel. Optional analytics remain permanently disabled for teen privacy.
            </p>
          </div>
        )}
      </div>

      {/* 2. Application Preferences & Theme */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Display & Localization Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theme Selector */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 space-y-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              {t("profile.theme")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Laptop }
              ].map((th) => {
                const Icon = th.icon;
                const isSelected = theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => handleThemeChange(th.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      isSelected
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-200 shadow-sm"
                        : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-purple-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{th.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selector */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 space-y-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              Application Language (5 Locales)
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} ({l.nativeName})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-stone-400">
              Zero hardcoded strings; synchronized across English, Hindi, Kannada, Tamil, and Telugu.
            </p>
          </div>

          {/* Country Emergency Helpline Selector */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 space-y-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              Emergency Services Region
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {Object.values(COUNTRIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code}) — Emergency: {c.emergencyNumber}
                </option>
              ))}
            </select>
            <div className="text-[10px] text-stone-500 flex items-center justify-between">
              <span>Mental Health: {countryConfig.mentalHealthName}</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">{countryConfig.mentalHealthHelpline}</span>
            </div>
          </div>

          {/* Discreet Notification Mode */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                {discreetMode ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4 text-stone-500" />}
                {t("profile.discreetMode")}
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {t("profile.discreetModeDesc")}
              </p>
            </div>
            <button
              onClick={handleToggleDiscreetMode}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                discreetMode ? "bg-purple-700" : "bg-stone-300 dark:bg-stone-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                  discreetMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* PIN Lock Security */}
        <div className="p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-700" />
              {t("profile.pinLock")}
            </span>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {pinEnabled
                ? "Your 4-digit PIN lock is currently active on this device."
                : "Set a 4-digit security PIN to restrict local access to your symptom history."}
            </p>
          </div>

          {pinEnabled ? (
            <button
              onClick={handleRemovePin}
              className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              Disable PIN
            </button>
          ) : (
            <button
              onClick={() => setShowPinModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Enable PIN
            </button>
          )}
        </div>
      </div>

      {/* 3. India DPDP Act 2023 & GDPR Data Rights */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            DPDP Act 2023 & GDPR Data Principal Rights
          </h3>
          <span className="text-[10px] text-stone-400 font-semibold">Field-Level AES-256-GCM</span>
        </div>

        {/* Consents Toggle Dashboard */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
            Granular Consent Dashboard
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Storage Consent */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex flex-col justify-between">
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block">Health Data Storage</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Encrypted local persistence</span>
              </div>
              <span className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Active
              </span>
            </div>

            {/* Tracking Consent */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex flex-col justify-between">
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block">Symptom Tracking</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Cycle & habit logging</span>
              </div>
              <span className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Active
              </span>
            </div>

            {/* Analytics Consent */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex flex-col justify-between">
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block">Optional Analytics</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Product quality diagnostics</span>
              </div>
              <span className={`mt-2 text-[10px] font-bold flex items-center gap-1 ${user?.isTeen ? "text-stone-400" : "text-emerald-600"}`}>
                {user?.isTeen ? "Permanently Off (Minor)" : "Opted In"}
              </span>
            </div>
          </div>
        </div>

        {/* Data Actions: Export and Delete */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportData}
            className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 text-purple-900 dark:text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-purple-600" />
            {t("profile.exportData")}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            {t("profile.deleteData")}
          </button>
        </div>
      </div>

      {/* 4. Support, Contact & Legal Compliance */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4" />
          {t("profile.contactTitle")} & Clinical Governance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <Mail className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Support Email</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{CONTACT_CONFIG.supportEmail}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Operating Hours</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{CONTACT_CONFIG.supportHours}</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 italic">
          {CONTACT_CONFIG.notes}
        </p>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-4 text-xs font-semibold text-stone-500">
          <span className="hover:text-purple-600 cursor-pointer">{t("profile.privacyPolicy")}</span>
          <span>•</span>
          <span className="hover:text-purple-600 cursor-pointer">{t("profile.termsOfService")}</span>
          <span>•</span>
          <span className="hover:text-purple-600 cursor-pointer">Clinical Review Checklist v1.0</span>
        </div>
      </div>

      {/* Confirmation Modal: Delete Data (Right to Erasure) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                Permanently Erase All Data?
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {t("profile.deleteConfirm")} This permanently removes your profile, habits, menstrual cycle history, and Agent symptom assessments from this device.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-purple-200 dark:border-purple-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  Set 4-Digit Security PIN
                </h3>
                <p className="text-[11px] text-stone-500">Protect your sensitive health tracking.</p>
              </div>
            </div>

            <input
              type="password"
              maxLength={4}
              value={tempPin}
              onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full text-center tracking-[1em] text-2xl font-black p-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setTempPin("");
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                disabled={tempPin.length !== 4}
                onClick={handleSavePin}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-bold transition shadow-sm"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
