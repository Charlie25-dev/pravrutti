"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import kn from "../locales/kn.json";
import ta from "../locales/ta.json";
import te from "../locales/te.json";

export type Locale = "en" | "hi" | "kn" | "ta" | "te";

export const LOCALES: { code: Locale; label: string; nativeName: string }[] = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "hi", label: "Hindi", nativeName: "हिंदी" },
  { code: "kn", label: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ta", label: "Tamil", nativeName: "தமிழ்" },
  { code: "te", label: "Telugu", nativeName: "తెలుగు" }
];

const catalogs: Record<Locale, any> = { en, hi, kn, ta, te };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (path) => path
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pcos_locale") as Locale;
      if (saved && catalogs[saved]) {
        setLocaleState(saved);
      }
    } catch {
      // localStorage may be unavailable in some private contexts
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (catalogs[newLocale]) {
      setLocaleState(newLocale);
      try {
        localStorage.setItem("pcos_locale", newLocale);
        document.documentElement.lang = newLocale;
      } catch {
        // Ignore storage exceptions
      }
    }
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split(".");
    let current: any = catalogs[locale];

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    // Fallback to English if translation is missing in the current locale
    if (current === undefined) {
      let fallbackCurrent: any = catalogs.en;
      for (const k of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && k in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[k];
        } else {
          return path;
        }
      }
      current = fallbackCurrent;
    }

    if (typeof current !== "string") {
      return path;
    }

    if (params) {
      return Object.entries(params).reduce((str, [key, val]) => {
        return str.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
      }, current);
    }

    return current;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
