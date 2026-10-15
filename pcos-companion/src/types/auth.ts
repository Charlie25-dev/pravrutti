export interface UserConsentState {
  dataStorage: boolean;
  symptomTracking: boolean;
  optionalAnalytics: boolean;
}

export interface GuardianConsentData {
  guardianEmail: string;
  status: "PENDING" | "VERIFIED" | "REVOKED";
  verifiedAt?: string;
  legalNoticeRef: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string; // ISO YYYY-MM-DD
  age: number;
  countryCode: string;
  isTeen: boolean; // 13-17
  isAdult: boolean; // 18-45
  isEligible: boolean; // 13-45
  guardianConsent?: GuardianConsentData;
  consents: UserConsentState;
  isGuest: boolean;
}

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

export function evaluateAgeEligibility(age: number): {
  isEligible: boolean;
  isTeen: boolean;
  isAdult: boolean;
  status: "UNDER_13" | "TEEN" | "ADULT" | "OVER_45";
} {
  if (age < 13) {
    return { isEligible: false, isTeen: false, isAdult: false, status: "UNDER_13" };
  }
  if (age >= 13 && age <= 17) {
    return { isEligible: true, isTeen: true, isAdult: false, status: "TEEN" };
  }
  if (age >= 18 && age <= 45) {
    return { isEligible: true, isTeen: false, isAdult: true, status: "ADULT" };
  }
  return { isEligible: false, isTeen: false, isAdult: false, status: "OVER_45" };
}
