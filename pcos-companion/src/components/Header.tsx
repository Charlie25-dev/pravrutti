"use client";

import React, { useState } from "react";
import { useTranslation, LOCALES, Locale } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import { Globe, EyeOff, ShieldCheck, Volume2, VolumeX, UserCircle2 } from "lucide-react";
import { useTextToSpeech } from "../lib/speech";
import { OnboardingModal } from "./OnboardingModal";

export function Header({
  currentSpeechText,
  onNavigateToKnowledge
}: {
  currentSpeechText?: string;
  onNavigateToKnowledge?: () => void;
}) {
  const { locale, setLocale, t } = useTranslation();
  const { user } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScreenHidden, setIsScreenHidden] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { isSpeaking, speak, stop, isSupported } = useTextToSpeech(locale);

  const toggleSpeech = () => {
    if (isSpeaking) {
      stop();
    } else if (currentSpeechText) {
      speak(currentSpeechText);
    }
  };

  const toggleHideScreen = () => {
    setIsScreenHidden(!isScreenHidden);
  };

  return (
    <>
      {/* Onboarding / Profile Switcher Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigateToKnowledge={() => {
          setIsOnboardingOpen(false);
          if (onNavigateToKnowledge) onNavigateToKnowledge();
        }}
      />

      {/* Panic 'Hide Screen' Privacy Cover */}
      {isScreenHidden && (
        <div className="fixed inset-0 z-50 bg-[#F4F4F5] dark:bg-[#18181B] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Privacy Mode Active
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Your screen has been hidden for discretion on shared devices.
            </p>
            <button
              onClick={toggleHideScreen}
              className="px-6 py-2.5 bg-purple-700 text-white rounded-full font-medium hover:bg-purple-800 transition shadow-sm"
            >
              Resume App
            </button>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#121018]/80 border-b border-purple-100 dark:border-purple-950/40 px-4 py-3 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-md shadow-purple-900/15 border border-purple-200/70 dark:border-purple-800 shrink-0">
              <img src="/ritvya_icon.png" alt="RITVYA" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-purple-800 via-purple-700 to-teal-600 bg-clip-text text-transparent leading-tight">
                {t("common.appName")}
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Holistic PCOS & Cycle Care
              </p>
            </div>
          </div>

          {/* Right Controls: User Profile Switcher, Read Aloud, Language Switcher, Panic Button */}
          <div className="flex items-center gap-2">
            {/* Active User Badge / Switch Profile */}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100 text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 transition"
              title="Switch user profile or create custom account"
            >
              <UserCircle2 className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
              <span className="hidden sm:inline font-bold">
                {user?.isGuest
                  ? "Guest Mode"
                  : user?.isTeen
                  ? `${user.name} (Teen 15y)`
                  : `${user?.name || "User"} (${user?.age || 26}y)`}
              </span>
              <span className="sm:hidden font-bold">
                {user?.isTeen ? "Teen" : user?.isGuest ? "Guest" : "Adult"}
              </span>
            </button>

            {/* Read Aloud Button (only visible if supported and currentSpeechText exists) */}
            {isSupported && currentSpeechText && (
              <button
                onClick={toggleSpeech}
                aria-label={t("common.readAloud")}
                title={t("common.readAloud")}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
                  isSpeaking
                    ? "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-950/60 dark:border-purple-800 dark:text-purple-300 animate-pulse"
                    : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="hidden md:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="hidden md:inline">{t("common.readAloud")}</span>
                  </>
                )}
              </button>
            )}

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                aria-label="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{LOCALES.find((l) => l.code === locale)?.nativeName}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLocale(l.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition ${
                        locale === l.code
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      <span className="text-[10px] text-zinc-400 uppercase">{l.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Hide Screen Privacy Button */}
            <button
              onClick={toggleHideScreen}
              title={t("common.hideScreen")}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
              aria-label={t("common.hideScreen")}
            >
              <EyeOff className="w-4 h-4 text-zinc-500 hover:text-red-500" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
