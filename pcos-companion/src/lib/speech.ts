"use client";

import { useState, useEffect, useCallback } from "react";
import { Locale } from "./i18n";

const LOCALE_VOICE_MAP: Record<Locale, string[]> = {
  en: ["en-IN", "en-GB", "en-US", "en"],
  hi: ["hi-IN", "hi"],
  kn: ["kn-IN", "kn"],
  ta: ["ta-IN", "ta-LK", "ta"],
  te: ["te-IN", "te"]
};

export function useTextToSpeech(locale: Locale) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || typeof window === "undefined" || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Gentle, clear pacing
      utterance.pitch = 1.0;

      // Find best matching voice for locale
      const preferredCodes = LOCALE_VOICE_MAP[locale] || ["en-US"];
      const matchedVoice = availableVoices.find((voice) =>
        preferredCodes.some((code) => voice.lang.toLowerCase().startsWith(code.toLowerCase()))
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = preferredCodes[0];
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, availableVoices, locale]
  );

  const stop = useCallback(() => {
    if (isSupported && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    speak,
    stop
  };
}
