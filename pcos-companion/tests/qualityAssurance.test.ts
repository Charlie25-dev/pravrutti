import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { COUNTRIES, getCountryConfig } from "../src/config/countries";
import { CONTACT_CONFIG } from "../src/config/contact";
import en from "../src/locales/en.json";
import hi from "../src/locales/hi.json";
import kn from "../src/locales/kn.json";
import ta from "../src/locales/ta.json";
import te from "../src/locales/te.json";

describe("Deliverable A8: Multilingual, Accessibility, PWA & Quality Assurance Pass", () => {
  describe("1. PWA Manifest & Offline Architecture", () => {
    it("validates public/manifest.json presence and required W3C Web App Manifest fields", () => {
      const manifestPath = path.join(__dirname, "../public/manifest.json");
      expect(fs.existsSync(manifestPath)).toBe(true);

      const raw = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(raw);

      expect(manifest.name).toBe("RITVYA");
      expect(manifest.short_name).toBe("RITVYA");
      expect(manifest.start_url).toBe("/");
      expect(manifest.display).toBe("standalone");
      expect(manifest.background_color).toBe("#FAF4F3");
      expect(manifest.theme_color).toBe("#54224A");
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

      const sizes = manifest.icons.map((i: any) => i.sizes);
      expect(sizes).toContain("192x192");
      expect(sizes).toContain("512x512");
    });

    it("validates public/sw.js presence and caching lifecycle handlers", () => {
      const swPath = path.join(__dirname, "../public/sw.js");
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, "utf-8");
      expect(swContent).toContain("CACHE_NAME");
      expect(swContent).toContain("addEventListener(\"install\"");
      expect(swContent).toContain("addEventListener(\"activate\"");
      expect(swContent).toContain("addEventListener(\"fetch\"");
      expect(swContent).toContain("caches.match");
    });
  });

  describe("2. Country Emergency & Helplines Config", () => {
    it("verifies all countries have valid emergency and mental health contacts", () => {
      const countryCodes = Object.keys(COUNTRIES);
      expect(countryCodes).toContain("IN");
      expect(countryCodes).toContain("US");
      expect(countryCodes).toContain("GB");
      expect(countryCodes).toContain("CA");
      expect(countryCodes).toContain("AU");

      for (const code of countryCodes) {
        const c = getCountryConfig(code);
        expect(c.emergencyNumber).toBeTruthy();
        expect(c.mentalHealthHelpline).toBeTruthy();
        expect(c.notes).toContain("PLACEHOLDER");
      }
    });

    it("verifies graceful fallback for unknown countries", () => {
      const unknown = getCountryConfig("XX");
      expect(unknown.emergencyNumber).toBe("112");
      expect(unknown.mentalHealthHelpline).toBeTruthy();
    });
  });

  describe("3. Contact Information & Clinical Placeholders", () => {
    it("verifies contact config fields are defined and marked with placeholders", () => {
      expect(CONTACT_CONFIG.supportEmail).toContain("support@");
      expect(CONTACT_CONFIG.supportHours).toBeTruthy();
      expect(CONTACT_CONFIG.officeAddress).toBeTruthy();
      expect(CONTACT_CONFIG.notes).toContain("PLACEHOLDER");
    });
  });

  describe("4. Multilingual Translation Integrity", () => {
    const catalogs = { en, hi, kn, ta, te };

    it("verifies none of the catalogs contain empty string values", () => {
      for (const [lang, catalog] of Object.entries(catalogs)) {
        const checkNonEmpty = (obj: Record<string, any>, path = "") => {
          for (const [k, v] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${k}` : k;
            if (typeof v === "object" && v !== null && !Array.isArray(v)) {
              checkNonEmpty(v, currentPath);
            } else if (typeof v === "string") {
              expect(v.trim().length, `Empty string at ${lang}:${currentPath}`).toBeGreaterThan(0);
            }
          }
        };
        checkNonEmpty(catalog);
      }
    });

    it("verifies clinical disclaimer is present across all 5 language catalogs", () => {
      expect(en.common.disclaimer).toBeTruthy();
      expect(hi.common.disclaimer).toBeTruthy();
      expect(kn.common.disclaimer).toBeTruthy();
      expect(ta.common.disclaimer).toBeTruthy();
      expect(te.common.disclaimer).toBeTruthy();
    });
  });
});
