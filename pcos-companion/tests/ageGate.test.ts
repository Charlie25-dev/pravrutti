import { describe, it, expect } from "vitest";
import { calculateAge, evaluateAgeEligibility } from "../src/types/auth";

describe("Age Gate & Minor Consent Policy Verification", () => {
  it("rejects user under 13 with UNDER_13 status", () => {
    const eligibility = evaluateAgeEligibility(12);
    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.status).toBe("UNDER_13");
    expect(eligibility.isTeen).toBe(false);
  });

  it("identifies ages 13 to 17 as TEEN requiring guardian consent", () => {
    const teen13 = evaluateAgeEligibility(13);
    const teen15 = evaluateAgeEligibility(15);
    const teen17 = evaluateAgeEligibility(17);

    expect(teen13.isEligible).toBe(true);
    expect(teen13.isTeen).toBe(true);
    expect(teen13.isAdult).toBe(false);

    expect(teen15.isEligible).toBe(true);
    expect(teen15.isTeen).toBe(true);

    expect(teen17.isEligible).toBe(true);
    expect(teen17.isTeen).toBe(true);
  });

  it("identifies ages 18 to 45 as standard ADULT", () => {
    const adult18 = evaluateAgeEligibility(18);
    const adult28 = evaluateAgeEligibility(28);
    const adult45 = evaluateAgeEligibility(45);

    expect(adult18.isEligible).toBe(true);
    expect(adult18.isAdult).toBe(true);
    expect(adult18.isTeen).toBe(false);

    expect(adult28.isEligible).toBe(true);
    expect(adult28.isAdult).toBe(true);

    expect(adult45.isEligible).toBe(true);
    expect(adult45.isAdult).toBe(true);
  });

  it("rejects users over 45 with OVER_45 status redirecting to knowledge", () => {
    const over46 = evaluateAgeEligibility(46);
    const over55 = evaluateAgeEligibility(55);

    expect(over46.isEligible).toBe(false);
    expect(over46.status).toBe("OVER_45");

    expect(over55.isEligible).toBe(false);
    expect(over55.status).toBe("OVER_45");
  });

  it("correctly calculates age from ISO date of birth strings", () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Exactly 20 years ago
    const dob20 = `${currentYear - 20}-01-01`;
    expect(calculateAge(dob20)).toBe(20);

    // Exactly 15 years ago
    const dob15 = `${currentYear - 15}-01-01`;
    expect(calculateAge(dob15)).toBe(15);
  });
});
