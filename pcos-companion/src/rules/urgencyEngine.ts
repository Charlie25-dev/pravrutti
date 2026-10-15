import {
  AssessmentAnswers,
  RedFlagDefinition,
  TriageResult,
  UrgencyLevel,
  SpecialistRecommendation
} from "../types/agent";
import { UserProfile } from "../types/auth";

export const RULES_VERSION = "1.0.0";

/**
 * Standard Red Flag Definitions
 * All clinical thresholds and red-flag rules are placeholders requiring clinical review.
 */
export const RED_FLAGS: Record<string, RedFlagDefinition> = {
  "RF-001": {
    code: "RF-001",
    label: "Sudden, severe pelvic or lower abdominal pain",
    clinicalRationale: "Risk of ovarian torsion, ruptured ovarian cyst, or acute abdomen. Requires immediate emergency evaluation.",
    urgency: "EMERGENCY",
    reviewStatus: "needs_clinical_review"
  },
  "RF-002": {
    code: "RF-002",
    label: "Bleeding soaking through 1+ pads/tampons every hour for 2+ consecutive hours",
    clinicalRationale: "Risk of acute uterine hemorrhage leading to hemodynamic instability. Requires immediate emergency evaluation.",
    urgency: "EMERGENCY",
    reviewStatus: "needs_clinical_review"
  },
  "RF-003": {
    code: "RF-003",
    label: "Fainting, severe lightheadedness, or loss of consciousness with abdominal pain",
    clinicalRationale: "Signs of orthostatic hypotension or internal bleeding. Emergency department triage required.",
    urgency: "EMERGENCY",
    reviewStatus: "needs_clinical_review"
  },
  "RF-004": {
    code: "RF-004",
    label: "Known or suspected pregnancy with sharp pelvic pain or unexpected bleeding",
    clinicalRationale: "High risk of ectopic pregnancy. Requires immediate emergency ultrasound and surgical evaluation.",
    urgency: "EMERGENCY",
    reviewStatus: "needs_clinical_review"
  },
  "RF-005": {
    code: "RF-005",
    label: "Thoughts of self-harm, severe crisis, or wanting to end your life",
    clinicalRationale: "Acute psychiatric emergency. Requires immediate crisis helpline or emergency psychiatric support.",
    urgency: "EMERGENCY",
    reviewStatus: "needs_clinical_review",
    isMentalHealthCrisis: true
  },
  "RF-006": {
    code: "RF-006",
    label: "Sudden onset of severe 'thunderclap' headache or rapid vision disturbance",
    clinicalRationale: "Risk of vascular event, acute hypertension, or intracranial hypertension. Urgent clinical evaluation required within 24-48 hours.",
    urgency: "URGENT",
    reviewStatus: "needs_clinical_review"
  },
  "RF-007": {
    code: "RF-007",
    label: "Sudden chest tightness, shortness of breath, or difficulty breathing",
    clinicalRationale: "Risk of pulmonary embolism or acute cardiopulmonary compromise. Requires immediate emergency triage.",
    urgency: "EMERGENCY",
    reviewStatus: "needs_clinical_review"
  },
  "RF-008": {
    code: "RF-008",
    label: "Extreme thirst, unquenchable urination, fruity breath odor, or mental confusion",
    clinicalRationale: "Signs of acute severe hyperglycemia or ketoacidosis. Requires immediate medical emergency assessment.",
    urgency: "EMERGENCY",
    reviewStatus: "needs_clinical_review"
  }
};

export const CLINICAL_NON_DIAGNOSTIC_DISCLAIMER =
  "This tool is for informational and educational triage only and does not provide a medical diagnosis. Only a qualified healthcare provider can diagnose PCOS or prescribe clinical treatments. All thresholds: PLACEHOLDER: needs clinical review.";

/**
 * Pure deterministic clinical triage function.
 * Evaluates symptoms without any external API or LLM inference.
 */
export function evaluateTriage(
  answers: AssessmentAnswers,
  profile?: Partial<UserProfile>
): TriageResult {
  const isTeen = profile?.isTeen ?? (profile?.age ? profile.age >= 13 && profile.age <= 17 : false);
  const ruleSet: "adult" | "adolescent" = isTeen ? "adolescent" : "adult";

  // 1. Evaluate Red Flags First (Deterministic Override)
  const triggeredRedFlags: RedFlagDefinition[] = [];
  if (answers.redFlags && answers.redFlags.length > 0) {
    for (const code of answers.redFlags) {
      if (RED_FLAGS[code]) {
        triggeredRedFlags.push(RED_FLAGS[code]);
      }
    }
  }

  // Check for immediate EMERGENCY red flags
  const hasEmergencyFlag = triggeredRedFlags.some((rf) => rf.urgency === "EMERGENCY");
  const hasUrgentFlag = triggeredRedFlags.some((rf) => rf.urgency === "URGENT");
  const mentalHealthCrisis = triggeredRedFlags.some((rf) => rf.isMentalHealthCrisis);

  if (hasEmergencyFlag) {
    const reasons = triggeredRedFlags
      .filter((rf) => rf.urgency === "EMERGENCY")
      .map((rf) => `Critical Red Flag [${rf.code}]: ${rf.label}`);

    return {
      urgencyLevel: "EMERGENCY",
      score: 100,
      rulesVersion: RULES_VERSION,
      ruleSet,
      triggeredRedFlags,
      whyExplanationKey: "agent.urgencyEmergencyWhy",
      plainLanguageReasons: reasons,
      recommendedSpecialist: {
        title: mentalHealthCrisis ? "Crisis Mental Health / Emergency Dept" : "Emergency Department / Urgent Care",
        specialtyKey: mentalHealthCrisis ? "specialistMental" : "emergencySpecialist",
        rationale: "Immediate in-person medical evaluation is required to protect your health and safety."
      },
      questionsForDoctor: [
        "What is the source of my acute severe symptoms?",
        "Do I need urgent ultrasound, bloodwork, or emergency imaging?",
        "What are my immediate safety precautions?"
      ],
      clinicalDisclaimer: CLINICAL_NON_DIAGNOSTIC_DISCLAIMER,
      mentalHealthEscalation: mentalHealthCrisis
    };
  }

  // Check for URGENT red flags (e.g. RF-006 alone)
  if (hasUrgentFlag) {
    const reasons = triggeredRedFlags.map((rf) => `Urgent Warning Sign [${rf.code}]: ${rf.label}`);
    return {
      urgencyLevel: "URGENT",
      score: 75,
      rulesVersion: RULES_VERSION,
      ruleSet,
      triggeredRedFlags,
      whyExplanationKey: "agent.urgencyUrgentWhy",
      plainLanguageReasons: reasons,
      recommendedSpecialist: {
        title: isTeen ? "Adolescent Gynecologist / Pediatrician" : "Gynecologist / General Physician",
        specialtyKey: isTeen ? "specialistAdolescent" : "specialistGynecologist",
        rationale: "Prompt medical consultation within 24 to 48 hours is strongly recommended."
      },
      questionsForDoctor: [
        "Could my headaches or visual changes be related to hormonal or blood pressure fluctuations?",
        "What tests do you advise to evaluate these urgent signs?"
      ],
      clinicalDisclaimer: CLINICAL_NON_DIAGNOSTIC_DISCLAIMER,
      mentalHealthEscalation: false
    };
  }

  // 2. Score Calculation Based on Pathway
  let score = 0;
  const reasons: string[] = [];

  // Evaluate Cycle Patterns
  if (ruleSet === "adolescent") {
    // International adolescent guidelines: Post-menarche physiological variance
    const isEarlyPostMenarche =
      answers.yearsSinceMenarche === "under_1_year" ||
      answers.yearsSinceMenarche === "1_to_3_years" ||
      answers.cyclePattern === "post_menarche_variable";

    if (answers.cyclePattern === "absent_over_90") {
      score += 25;
      reasons.push("Cycle absent for >90 days (secondary amenorrhea in adolescence warrants clinical evaluation). (PLACEHOLDER: needs clinical review)");
    } else if (answers.cyclePattern === "infrequent_46_90") {
      if (isEarlyPostMenarche) {
        score += 5; // Minimal penalty because early anovulatory cycles are normal
        reasons.push("Variable cycles within first 1-3 years of menarche are often normal developmental variation. (PLACEHOLDER: needs clinical review)");
      } else {
        score += 20;
        reasons.push("Cycle interval longer than 45-90 days beyond the initial post-menarche transition.");
      }
    } else if (answers.cyclePattern === "irregular_36_45") {
      score += isEarlyPostMenarche ? 0 : 10;
    }
  } else {
    // Adult pathway
    if (answers.cyclePattern === "absent_over_90") {
      score += 35;
      reasons.push("Periods absent for over 90 days (amenorrhea).");
    } else if (answers.cyclePattern === "infrequent_46_90") {
      score += 30;
      reasons.push("Cycle intervals exceeding 45 days (oligomenorrhea).");
    } else if (answers.cyclePattern === "irregular_36_45") {
      score += 15;
      reasons.push("Cycles consistently irregular (36 to 45 days).");
    }
  }

  // Evaluate Hyperandrogenism Signs
  if (answers.androgenSigns && answers.androgenSigns.length > 0) {
    if (answers.androgenSigns.includes("facial_body_hair_moderate_severe")) {
      score += 35;
      reasons.push("Moderate to severe coarse facial or body hair growth (hirsutism).");
    } else if (answers.androgenSigns.includes("facial_body_hair_mild")) {
      score += 10;
      reasons.push("Mild facial or body hair changes.");
    }

    if (answers.androgenSigns.includes("cystic_inflammatory_acne")) {
      score += 20;
      reasons.push("Persistent inflammatory or cystic acne unresponsive to standard topical care.");
    }

    if (answers.androgenSigns.includes("male_pattern_hair_thinning")) {
      score += 20;
      reasons.push("Hair thinning at the crown or temples (androgenic alopecia pattern).");
    }
  }

  // Evaluate Metabolic Signs
  if (answers.metabolicSigns && answers.metabolicSigns.length > 0) {
    if (answers.metabolicSigns.includes("acanthosis_nigricans")) {
      score += 20;
      reasons.push("Dark, velvety patches of skin (acanthosis nigricans, marker of insulin resistance).");
    }
    if (answers.metabolicSigns.includes("rapid_unexplained_weight_gain")) {
      score += 15;
      reasons.push("Noticeable central weight changes despite consistent routine.");
    }
    if (answers.metabolicSigns.includes("extreme_fatigue_post_meals")) {
      score += 10;
      reasons.push("Prominent post-meal fatigue or energy slumps.");
    }
  }

  // Ultrasound (Adult only - not diagnostic for adolescents)
  if (ruleSet === "adult" && answers.ultrasound === "yes_polycystic") {
    score += 20;
    reasons.push("Ultrasound evidence of polycystic ovarian morphology reported.");
  }

  // Mental Health Distress
  let mentalHealthEscalation = false;
  if (answers.mentalHealth === "severe_distress") {
    score += 15;
    mentalHealthEscalation = true;
    reasons.push("Elevated emotional distress or anxiety significantly impacting daily well-being.");
  } else if (answers.mentalHealth === "moderate_anxiety_mood") {
    score += 5;
    reasons.push("Moderate anxiety or mood fluctuations reported.");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine Urgency Level based on score
  let urgencyLevel: UrgencyLevel = "ROUTINE";
  let whyExplanationKey = "agent.urgencyRoutineWhy";

  if (score >= 65) {
    urgencyLevel = "URGENT";
    whyExplanationKey = "agent.urgencyUrgentWhy";
  } else if (score >= 35) {
    urgencyLevel = "SOON";
    whyExplanationKey = "agent.urgencySoonWhy";
  } else {
    urgencyLevel = "ROUTINE";
    whyExplanationKey = "agent.urgencyRoutineWhy";
  }

  // Formulate Specialist Recommendation
  let recommendedSpecialist: SpecialistRecommendation;
  if (mentalHealthEscalation) {
    recommendedSpecialist = {
      title: "Mental Health Professional & Gynecologist",
      specialtyKey: "specialistMental",
      rationale: "Emotional support is just as important as hormonal care. We recommend discussing both emotional well-being and symptom management."
    };
  } else if (ruleSet === "adolescent") {
    recommendedSpecialist = {
      title: "Adolescent Gynecologist / Pediatric Endocrinologist",
      specialtyKey: "specialistAdolescent",
      rationale: "Adolescent specialists understand the unique hormonal transitions of puberty and avoid premature over-diagnosis."
    };
  } else if (answers.metabolicSigns?.includes("acanthosis_nigricans") || score >= 60) {
    recommendedSpecialist = {
      title: "Endocrinologist or Gynecologist",
      specialtyKey: "specialistEndo",
      rationale: "An endocrinologist specializes in metabolic and hormonal balance, insulin resistance, and comprehensive endocrine testing."
    };
  } else {
    recommendedSpecialist = {
      title: "Gynecologist",
      specialtyKey: "specialistGynecologist",
      rationale: "A gynecologist can review your cycle regularity, hormonal health, and overall pelvic well-being."
    };
  }

  // Tailored Questions for Doctor
  const questionsForDoctor: string[] = [];
  if (answers.cyclePattern === "absent_over_90" || answers.cyclePattern === "infrequent_46_90") {
    questionsForDoctor.push("What hormonal tests (such as LH, FSH, Total Testosterone, TSH, Prolactin) do you recommend for my cycle irregularities?");
  }
  if (answers.androgenSigns && answers.androgenSigns.length > 0 && !answers.androgenSigns.includes("none")) {
    questionsForDoctor.push("Are my symptoms (facial/body hair, acne, or scalp thinning) indicative of elevated androgen levels, and what management options are safe?");
  }
  if (answers.metabolicSigns?.includes("acanthosis_nigricans") || answers.metabolicSigns?.includes("extreme_fatigue_post_meals")) {
    questionsForDoctor.push("Should we evaluate my fasting insulin, glucose, or HbA1c to screen for insulin resistance?");
  }
  if (isTeen) {
    questionsForDoctor.push("Given my age and time since first period, how can we monitor my symptoms naturally before considering invasive tests?");
  }
  if (questionsForDoctor.length === 0) {
    questionsForDoctor.push(
      "What gentle lifestyle, nutritional, and sleep practices best support healthy hormone balance?",
      "When would you recommend a follow-up check-up if my symptoms change?"
    );
  }

  if (reasons.length === 0) {
    reasons.push("Reported symptoms fall within normal physiological variations.");
  }

  return {
    urgencyLevel,
    score,
    rulesVersion: RULES_VERSION,
    ruleSet,
    triggeredRedFlags,
    whyExplanationKey,
    plainLanguageReasons: reasons,
    recommendedSpecialist,
    questionsForDoctor,
    clinicalDisclaimer: CLINICAL_NON_DIAGNOSTIC_DISCLAIMER,
    mentalHealthEscalation
  };
}
