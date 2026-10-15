"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, calculateAge, evaluateAgeEligibility, GuardianConsentData } from "../types/auth";

export const DEMO_ADULT_USER: UserProfile = {
  id: "demo-adult-1845",
  email: "priya.sharma@example.com",
  name: "Priya Sharma",
  dateOfBirth: "2000-05-14",
  age: 26,
  countryCode: "IN",
  isTeen: false,
  isAdult: true,
  isEligible: true,
  consents: {
    dataStorage: true,
    symptomTracking: true,
    optionalAnalytics: true
  },
  isGuest: false
};

export const DEMO_TEEN_USER: UserProfile = {
  id: "demo-teen-1317",
  email: "ananya.verma@example.com",
  name: "Ananya Verma",
  dateOfBirth: "2011-08-20",
  age: 15,
  countryCode: "IN",
  isTeen: true,
  isAdult: false,
  isEligible: true,
  guardianConsent: {
    guardianEmail: "parent.ananya@placeholder.org",
    status: "PENDING",
    legalNoticeRef: "v1.0-dpdp-legal-counsel-review-pending"
  },
  consents: {
    dataStorage: true,
    symptomTracking: true,
    optionalAnalytics: false // Permanently disabled for adolescent privacy
  },
  isGuest: false
};

export const GUEST_USER: UserProfile = {
  id: "guest-user",
  email: "guest@pcoscompanion.org",
  name: "Guest Explorer",
  dateOfBirth: "2000-01-01",
  age: 26,
  countryCode: "IN",
  isTeen: false,
  isAdult: true,
  isEligible: true,
  consents: {
    dataStorage: false,
    symptomTracking: false,
    optionalAnalytics: false
  },
  isGuest: true
};

interface AuthContextType {
  user: UserProfile | null;
  loginAsDemoAdult: () => void;
  loginAsDemoTeen: () => void;
  loginAsGuest: () => void;
  registerUser: (data: {
    name: string;
    email: string;
    dateOfBirth: string;
    countryCode: string;
    guardianEmail?: string;
    consents: {
      dataStorage: boolean;
      symptomTracking: boolean;
      optionalAnalytics: boolean;
    };
  }) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: DEMO_ADULT_USER,
  loginAsDemoAdult: () => {},
  loginAsDemoTeen: () => {},
  loginAsGuest: () => {},
  registerUser: () => ({ success: false }),
  logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEMO_ADULT_USER);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pcos_active_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Fallback to DEMO_ADULT_USER
    }
  }, []);

  const persistUser = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem("pcos_active_user", JSON.stringify(u));
      } else {
        localStorage.removeItem("pcos_active_user");
      }
    } catch {
      // Ignore storage errors
    }
  };

  const loginAsDemoAdult = () => persistUser(DEMO_ADULT_USER);
  const loginAsDemoTeen = () => persistUser(DEMO_TEEN_USER);
  const loginAsGuest = () => persistUser(GUEST_USER);

  const registerUser = (data: {
    name: string;
    email: string;
    dateOfBirth: string;
    countryCode: string;
    guardianEmail?: string;
    consents: {
      dataStorage: boolean;
      symptomTracking: boolean;
      optionalAnalytics: boolean;
    };
  }) => {
    const age = calculateAge(data.dateOfBirth);
    const eligibility = evaluateAgeEligibility(age);

    if (!eligibility.isEligible) {
      if (eligibility.status === "UNDER_13") {
        return { success: false, error: "under13" };
      }
      return { success: false, error: "over45" };
    }

    let guardianData: GuardianConsentData | undefined = undefined;
    if (eligibility.isTeen) {
      if (!data.guardianEmail) {
        return { success: false, error: "guardianRequired" };
      }
      guardianData = {
        guardianEmail: data.guardianEmail,
        status: "PENDING",
        legalNoticeRef: "v1.0-dpdp-legal-counsel-review-pending"
      };
      // Minors have optional analytics forcibly disabled
      data.consents.optionalAnalytics = false;
    }

    const newUser: UserProfile = {
      id: "usr-" + Date.now(),
      email: data.email,
      name: data.name || (eligibility.isTeen ? "Teen User" : "Adult User"),
      dateOfBirth: data.dateOfBirth,
      age,
      countryCode: data.countryCode || "IN",
      isTeen: eligibility.isTeen,
      isAdult: eligibility.isAdult,
      isEligible: true,
      guardianConsent: guardianData,
      consents: data.consents,
      isGuest: false
    };

    persistUser(newUser);
    return { success: true };
  };

  const logout = () => persistUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsDemoAdult,
        loginAsDemoTeen,
        loginAsGuest,
        registerUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
