export type UrgencyLevel = "ROUTINE" | "SOON" | "URGENT" | "EMERGENCY";

export type PcosStatus = "diagnosed" | "suspected" | "curious" | "not_sure";

export type CyclePattern =
  | "regular_21_35"
  | "irregular_36_45"
  | "infrequent_46_90"
  | "absent_over_90"
  | "post_menarche_variable"
  | "not_sure"
  | "prefer_not_to_say";

export type MenarcheTiming =
  | "under_1_year"
  | "1_to_3_years"
  | "over_3_years"
  | "not_sure";

export type HyperandrogenismSign =
  | "facial_body_hair_moderate_severe"
  | "facial_body_hair_mild"
  | "cystic_inflammatory_acne"
  | "male_pattern_hair_thinning"
  | "none"
  | "prefer_not_to_say";

export type MetabolicSign =
  | "acanthosis_nigricans"
  | "rapid_unexplained_weight_gain"
  | "extreme_fatigue_post_meals"
  | "none"
  | "prefer_not_to_say";

export type MentalHealthDistress =
  | "none_or_mild"
  | "moderate_anxiety_mood"
  | "severe_distress"
  | "prefer_not_to_say";

export type UltrasoundResult =
  | "yes_polycystic"
  | "yes_normal"
  | "not_tested"
  | "not_applicable";

export interface RedFlagDefinition {
  code: string;
  label: string;
  clinicalRationale: string;
  urgency: "EMERGENCY" | "URGENT";
  reviewStatus: "needs_clinical_review";
  isMentalHealthCrisis?: boolean;
}

export interface AssessmentAnswers {
  status?: PcosStatus;
  redFlags?: string[]; // List of RF codes
  cyclePattern?: CyclePattern;
  yearsSinceMenarche?: MenarcheTiming;
  androgenSigns?: HyperandrogenismSign[];
  metabolicSigns?: MetabolicSign[];
  mentalHealth?: MentalHealthDistress;
  ultrasound?: UltrasoundResult;
}

export interface SpecialistRecommendation {
  title: string;
  specialtyKey: string;
  rationale: string;
}

export interface TriageResult {
  urgencyLevel: UrgencyLevel;
  score: number;
  rulesVersion: string;
  ruleSet: "adult" | "adolescent";
  triggeredRedFlags: RedFlagDefinition[];
  whyExplanationKey: string;
  plainLanguageReasons: string[];
  recommendedSpecialist: SpecialistRecommendation;
  questionsForDoctor: string[];
  clinicalDisclaimer: string;
  mentalHealthEscalation: boolean;
}
