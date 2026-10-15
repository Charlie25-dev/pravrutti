"use client";

import React from "react";
import { useTranslation } from "../lib/i18n";
import { Activity, MessageSquareHeart, BookOpen, User } from "lucide-react";

export type TabId = "tracker" | "agent" | "knowledge" | "profile";

interface NavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const { t } = useTranslation();

  const tabs: { id: TabId; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "tracker", labelKey: "nav.tracker", icon: Activity },
    { id: "agent", labelKey: "nav.agent", icon: MessageSquareHeart },
    { id: "knowledge", labelKey: "nav.knowledge", icon: BookOpen },
    { id: "profile", labelKey: "nav.profile", icon: User }
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Screens < 768px) */}
      <nav
        aria-label="Mobile Navigation"
        role="navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#121018]/90 backdrop-blur-lg border-t border-purple-100 dark:border-purple-950/40 px-2 py-1.5 shadow-lg"
      >
        <div role="tablist" aria-label="Mobile Navigation Tabs" className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-label={t(tab.labelKey)}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                  isActive
                    ? "text-purple-700 dark:text-purple-300 font-semibold scale-105"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition ${
                    isActive ? "bg-purple-100 dark:bg-purple-950/60" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation (Screens >= 768px) */}
      <aside
        aria-label="Desktop Sidebar Navigation"
        className="hidden md:flex flex-col w-64 border-r border-purple-100 dark:border-purple-950/40 p-4 gap-2 bg-white/60 dark:bg-[#121018]/60 backdrop-blur-md min-h-[calc(100vh-61px)]"
      >
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 py-2">
          Navigation
        </div>

        <div role="tablist" aria-label="Desktop Sidebar Tabs" className="flex flex-col gap-1 w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-label={t(tab.labelKey)}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-100 to-teal-50 dark:from-purple-950/60 dark:to-teal-950/30 text-purple-900 dark:text-purple-200 font-semibold shadow-sm border border-purple-200/50 dark:border-purple-900/50"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl ${
                    isActive
                      ? "bg-purple-700 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Disclaimer Card in Desktop Sidebar */}
        <div className="mt-auto p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-950/40 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <p className="font-semibold text-purple-900 dark:text-purple-300 mb-1">
            Safety & Care Notice
          </p>
          <p>{t("common.disclaimer")}</p>
        </div>
      </aside>
    </>
  );
}
