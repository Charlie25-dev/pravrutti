import { describe, it, expect } from "vitest";
import { evaluateTriage, RED_FLAGS, RULES_VERSION } from "../src/rules/urgencyEngine";
import { AssessmentAnswers } from "../src/types/agent";

describe("Deterministic Urgency Engine (v1.0.0)", () => {
  it("exports correct version and non-empty red flag definitions", () => {
    expect(RULES_VERSION).toBe("1.0.0");
    expect(Object.keys(RED_FLAGS).length).toBe(8);
    for (const [code, flag] of Object.entries(RED_FLAGS)) {
      expect(flag.code).toBe(code);
      expect(flag.reviewStatus).toBe("needs_clinical_review");
      expect(flag.label).toBeTruthy();
    }
  });

  describe("Red-Flag Immediate Overrides", () => {
    it("RF-001 (Sudden severe pelvic pain) immediately escalates to EMERGENCY regardless of other answers", () => {
      const answers: AssessmentAnswers = {
        redFlags: ["RF-001"],
        cyclePattern: "regular_21_35",
        androgenSigns: ["none"],
        metabolicSigns: ["none"]
      };

      const result = evaluateTriage(answers, { isAdult: true, age: 26 });
      expect(result.urgencyLevel).toBe("EMERGENCY");
      expect(result.score).toBe(100);
      expect(result.triggeredRedFlags.length).toBe(1);
      expect(result.triggeredRedFlags[0].code).toBe("RF-001");
      expect(result.whyExplanationKey).toBe("agent.urgencyEmergencyWhy");
    });

    it("RF-002 (Bleeding >1 pad/hr for 2+ hours) triggers EMERGENCY", () => {
      const answers: AssessmentAnswers = {
        redFlags: ["RF-002"]
      };
      const result = evaluateTriage(answers, { isAdult: true, age: 30 });
      expect(result.urgencyLevel).toBe("EMERGENCY");
      expect(result.score).toBe(100);
    });

    it("RF-005 (Self-harm thoughts) triggers EMERGENCY with mental health crisis flag", () => {
      const answers: AssessmentAnswers = {
        redFlags: ["RF-005"]
      };
      const result = evaluateTriage(answers, { isAdult: true, age: 22 });
      expect(result.urgencyLevel).toBe("EMERGENCY");
      expect(result.mentalHealthEscalation).toBe(true);
      expect(result.recommendedSpecialist.specialtyKey).toBe("specialistMental");
    });

    it("RF-006 (Thunderclap headache) escalates to URGENT", () => {
      const answers: AssessmentAnswers = {
        redFlags: ["RF-006"]
      };
      const result = evaluateTriage(answers, { isAdult: true, age: 28 });
      expect(result.urgencyLevel).toBe("URGENT");
      expect(result.score).toBe(75);
      expect(result.whyExplanationKey).toBe("agent.urgencyUrgentWhy");
    });

    it("multiple red flags are all cataloged in result", () => {
      const answers: AssessmentAnswers = {
        redFlags: ["RF-001", "RF-003"]
      };
      const result = evaluateTriage(answers, { isAdult: true, age: 25 });
      expect(result.urgencyLevel).toBe("EMERGENCY");
      expect(result.triggeredRedFlags.length).toBe(2);
      expect(result.triggeredRedFlags.map((r) => r.code)).toEqual(["RF-001", "RF-003"]);
    });
  });

  describe("Adolescent Pathway (Ages 13-17)", () => {
    it("treats post-menarche cycle variation as normal physiological transition without high score", () => {
      const answers: AssessmentAnswers = {
        cyclePattern: "infrequent_46_90",
        yearsSinceMenarche: "1_to_3_years",
        androgenSigns: ["none"],
        metabolicSigns: ["none"]
      };

      const result = evaluateTriage(answers, { isTeen: true, age: 15 });
      expect(result.ruleSet).toBe("adolescent");
      expect(result.urgencyLevel).toBe("ROUTINE");
      expect(result.score).toBeLessThan(35);
      expect(result.recommendedSpecialist.specialtyKey).toBe("specialistAdolescent");
      expect(result.plainLanguageReasons.some((r) => r.includes("normal developmental variation"))).toBe(true);
    });

    it("escalates adolescent with prolonged amenorrhea (>90d) and severe hirsutism to adolescent specialist", () => {
      const answers: AssessmentAnswers = {
        cyclePattern: "absent_over_90",
        yearsSinceMenarche: "over_3_years",
        androgenSigns: ["facial_body_hair_moderate_severe", "cystic_inflammatory_acne"],
        metabolicSigns: ["acanthosis_nigricans"]
      };

      const result = evaluateTriage(answers, { isTeen: true, age: 16 });
      expect(result.ruleSet).toBe("adolescent");
      expect(result.score).toBeGreaterThanOrEqual(65);
      expect(result.urgencyLevel).toBe("URGENT");
      expect(result.recommendedSpecialist.specialtyKey).toBe("specialistAdolescent");
    });
  });

  describe("Adult Pathway (Ages 18-45)", () => {
    it("classifies classic adult Rotterdam presentation as URGENT", () => {
      const answers: AssessmentAnswers = {
        cyclePattern: "infrequent_46_90",
        androgenSigns: ["facial_body_hair_moderate_severe"],
        metabolicSigns: ["acanthosis_nigricans"],
        ultrasound: "yes_polycystic"
      };

      const result = evaluateTriage(answers, { isAdult: true, age: 26 });
      expect(result.ruleSet).toBe("adult");
      expect(result.urgencyLevel).toBe("URGENT");
      expect(result.score).toBeGreaterThanOrEqual(65);
      expect(result.questionsForDoctor.length).toBeGreaterThan(0);
    });

    it("classifies mild irregular cycles as SOON", () => {
      const answers: AssessmentAnswers = {
        cyclePattern: "irregular_36_45",
        androgenSigns: ["facial_body_hair_mild"],
        metabolicSigns: ["extreme_fatigue_post_meals"]
      };

      const result = evaluateTriage(answers, { isAdult: true, age: 24 });
      expect(result.urgencyLevel).toBe("SOON");
      expect(result.score).toBeGreaterThanOrEqual(35);
      expect(result.score).toBeLessThan(65);
    });

    it("classifies healthy regular cycle without symptoms as ROUTINE", () => {
      const answers: AssessmentAnswers = {
        cyclePattern: "regular_21_35",
        androgenSigns: ["none"],
        metabolicSigns: ["none"],
        mentalHealth: "none_or_mild"
      };

      const result = evaluateTriage(answers, { isAdult: true, age: 29 });
      expect(result.urgencyLevel).toBe("ROUTINE");
      expect(result.score).toBe(0);
    });
  });

  describe("Edge cases and missing answers", () => {
    it("handles completely empty answers safely", () => {
      const answers: AssessmentAnswers = {};
      const result = evaluateTriage(answers);
      expect(result.urgencyLevel).toBe("ROUTINE");
      expect(result.score).toBe(0);
      expect(result.clinicalDisclaimer).toContain("PLACEHOLDER: needs clinical review");
    });

    it("handles prefer_not_to_say options without error", () => {
      const answers: AssessmentAnswers = {
        cyclePattern: "prefer_not_to_say",
        androgenSigns: ["prefer_not_to_say"],
        metabolicSigns: ["prefer_not_to_say"],
        mentalHealth: "prefer_not_to_say"
      };
      const result = evaluateTriage(answers, { isAdult: true });
      expect(result.urgencyLevel).toBe("ROUTINE");
      expect(result.score).toBe(0);
    });

    it("recommends mental health specialist when severe distress is selected without red flags", () => {
      const answers: AssessmentAnswers = {
        mentalHealth: "severe_distress"
      };
      const result = evaluateTriage(answers, { isAdult: true, age: 27 });
      expect(result.mentalHealthEscalation).toBe(true);
      expect(result.recommendedSpecialist.specialtyKey).toBe("specialistMental");
    });
  });
});
