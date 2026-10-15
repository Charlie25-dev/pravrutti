"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Navigation, TabId } from "../components/Navigation";
import { TrackerView } from "../components/TrackerView";
import { AgentView } from "../components/AgentView";
import { KnowledgeView } from "../components/KnowledgeView";
import { ProfileView } from "../components/ProfileView";
import { OnboardingModal } from "../components/OnboardingModal";
import { useTranslation } from "../lib/i18n";
import {
  Activity,
  MessageSquareHeart,
  BookOpen,
  User,
  Shield,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  Lock,
  Globe2
} from "lucide-react";

export default function Home() {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("tracker");
  const [isClient, setIsClient] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Register PWA Service Worker on mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration error handled silently
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#121018] text-stone-900 dark:text-stone-100 transition-colors pb-16 md:pb-0">
      {/* Onboarding / Profile Switcher Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigateToKnowledge={() => {
          setIsOnboardingOpen(false);
          setActiveTab("knowledge");
        }}
      />

      {/* Top Header */}
      <Header
        currentSpeechText={t("common.disclaimer")}
        onNavigateToKnowledge={() => setActiveTab("knowledge")}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Page Area */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          {/* Welcome & Safety Banner */}
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-purple-100/80 via-purple-50/60 to-teal-50/80 dark:from-purple-950/40 dark:via-purple-900/20 dark:to-teal-950/20 border border-purple-200/60 dark:border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-purple-950 dark:text-purple-200">
                  {t("onboarding.welcomeTitle")}
                </h2>
                <p className="text-xs text-purple-800/80 dark:text-purple-300/80">
                  {t("onboarding.welcomeSubtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 dark:bg-purple-950/60 text-[11px] font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Shield className="w-3 h-3 text-teal-600" />
                DPDP & HIPAA Encrypted
              </span>
            </div>
          </div>

          {/* Render Active Tab Content */}
          {activeTab === "tracker" && <TrackerView />}

          {activeTab === "agent" && <AgentView />}

          {activeTab === "knowledge" && <KnowledgeView />}

          {activeTab === "profile" && (
            <ProfileView onOpenOnboarding={() => setIsOnboardingOpen(true)} />
          )}
        </main>
      </div>
    </div>
  );
}
