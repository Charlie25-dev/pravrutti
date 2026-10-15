import { describe, it, expect } from "vitest";
import en from "../src/locales/en.json";
import hi from "../src/locales/hi.json";
import kn from "../src/locales/kn.json";
import ta from "../src/locales/ta.json";
import te from "../src/locales/te.json";

function getDeepKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      keys = keys.concat(getDeepKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n Completeness Verification", () => {
  const masterKeys = getDeepKeys(en);

  it("verifies en.json contains all expected domain keys", () => {
    expect(masterKeys.length).toBeGreaterThan(50);
  });

  it("proves Hindi (hi.json) matches every English key without omissions", () => {
    const hiKeys = new Set(getDeepKeys(hi));
    const missingKeys = masterKeys.filter((k) => !hiKeys.has(k));
    expect(missingKeys).toEqual([]);
  });

  it("proves Kannada (kn.json) matches every English key without omissions", () => {
    const knKeys = new Set(getDeepKeys(kn));
    const missingKeys = masterKeys.filter((k) => !knKeys.has(k));
    expect(missingKeys).toEqual([]);
  });

  it("proves Tamil (ta.json) matches every English key without omissions", () => {
    const taKeys = new Set(getDeepKeys(ta));
    const missingKeys = masterKeys.filter((k) => !taKeys.has(k));
    expect(missingKeys).toEqual([]);
  });

  it("proves Telugu (te.json) matches every English key without omissions", () => {
    const teKeys = new Set(getDeepKeys(te));
    const missingKeys = masterKeys.filter((k) => !teKeys.has(k));
    expect(missingKeys).toEqual([]);
  });
});
