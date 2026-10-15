export interface CountryInfo {
  code: string;
  name: string;
  emergencyNumber: string;
  mentalHealthHelpline: string;
  mentalHealthName: string;
  notes: string;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  IN: {
    code: "IN",
    name: "India",
    emergencyNumber: "112",
    mentalHealthHelpline: "1800-599-0019",
    mentalHealthName: "KIRAN / Tele-MANAS (14416)",
    notes: "PLACEHOLDER: verify before launch. National Emergency 112, Tele-MANAS 14416."
  },
  US: {
    code: "US",
    name: "United States",
    emergencyNumber: "911",
    mentalHealthHelpline: "988",
    mentalHealthName: "Suicide & Crisis Lifeline (988)",
    notes: "PLACEHOLDER: verify before launch."
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    emergencyNumber: "999",
    mentalHealthHelpline: "111",
    mentalHealthName: "NHS Mental Health Services (111)",
    notes: "PLACEHOLDER: verify before launch."
  },
  CA: {
    code: "CA",
    name: "Canada",
    emergencyNumber: "911",
    mentalHealthHelpline: "988",
    mentalHealthName: "Suicide Crisis Helpline (988)",
    notes: "PLACEHOLDER: verify before launch."
  },
  AU: {
    code: "AU",
    name: "Australia",
    emergencyNumber: "000",
    mentalHealthHelpline: "13 11 14",
    mentalHealthName: "Lifeline Australia (13 11 14)",
    notes: "PLACEHOLDER: verify before launch."
  }
};

export const DEFAULT_COUNTRY = "IN";

export function getCountryConfig(code: string): CountryInfo {
  return (
    COUNTRIES[code.toUpperCase()] || {
      code: "UNKNOWN",
      name: "International / Other",
      emergencyNumber: "112",
      mentalHealthHelpline: "Call local emergency services",
      mentalHealthName: "Local Mental Health Services",
      notes: "PLACEHOLDER: fallback to local emergency number."
    }
  );
}
