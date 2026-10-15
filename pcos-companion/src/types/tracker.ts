export interface MedicalHistoryItem {
  id: string;
  condition: string;
  diagnosedYear?: number;
  notes?: string;
}

export interface LabResultItem {
  id: string;
  testName: string;
  numericVal: number;
  unit: string;
  testedAt: string; // YYYY-MM-DD
  status: "normal" | "elevated" | "low";
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
}

export interface CycleLogItem {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  flow: "LIGHT" | "MEDIUM" | "HEAVY";
  painLevel: number; // 1-10
  symptoms: string[];
}

export interface DailyHabits {
  sleep: boolean;
  protein: boolean;
  veggies: boolean;
  hydration: boolean;
  movement: boolean;
  stress: boolean;
}

export const SEED_LAB_RESULTS: LabResultItem[] = [
  { id: "lab-1", testName: "Total Testosterone", numericVal: 68, unit: "ng/dL", testedAt: "2026-05-10", status: "elevated" },
  { id: "lab-2", testName: "Total Testosterone", numericVal: 62, unit: "ng/dL", testedAt: "2026-07-15", status: "elevated" },
  { id: "lab-3", testName: "Total Testosterone", numericVal: 54, unit: "ng/dL", testedAt: "2026-09-20", status: "normal" },
  { id: "lab-4", testName: "Fasting Insulin", numericVal: 24.2, unit: "uIU/mL", testedAt: "2026-05-10", status: "elevated" },
  { id: "lab-5", testName: "Fasting Insulin", numericVal: 20.1, unit: "uIU/mL", testedAt: "2026-07-15", status: "normal" },
  { id: "lab-6", testName: "Fasting Insulin", numericVal: 16.5, unit: "uIU/mL", testedAt: "2026-09-20", status: "normal" },
  { id: "lab-7", testName: "TSH", numericVal: 2.8, unit: "uIU/mL", testedAt: "2026-05-10", status: "normal" },
  { id: "lab-8", testName: "TSH", numericVal: 2.5, unit: "uIU/mL", testedAt: "2026-09-20", status: "normal" }
];

export const SEED_MEDICATIONS: MedicationItem[] = [
  { id: "med-1", name: "Inositol (Myo & D-Chiro 40:1)", dosage: "2000mg", frequency: "Daily with breakfast", active: true },
  { id: "med-2", name: "Vitamin D3", dosage: "2000 IU", frequency: "Daily", active: true }
];

export const SEED_MEDICAL_HISTORY: MedicalHistoryItem[] = [
  { id: "hist-1", condition: "PCOS (Phenotype B - Ovulatory dysfunction & Hyperandrogenism)", diagnosedYear: 2024, notes: "Diagnosed by ultrasound and hormone panel." },
  { id: "hist-2", condition: "Mild Insulin Resistance", diagnosedYear: 2024, notes: "Managing with dietary protein and daily walking." }
];

export const SEED_CYCLE_LOGS: CycleLogItem[] = [
  { id: "cyc-1", startDate: "2026-07-02", endDate: "2026-07-07", flow: "MEDIUM", painLevel: 3, symptoms: ["Mild fatigue", "Skin breakouts"] },
  { id: "cyc-2", startDate: "2026-08-08", endDate: "2026-08-13", flow: "LIGHT", painLevel: 2, symptoms: ["Bloating"] },
  { id: "cyc-3", startDate: "2026-09-18", endDate: "2026-09-23", flow: "MEDIUM", painLevel: 4, symptoms: ["Mild cramping", "Tender breasts"] }
];
