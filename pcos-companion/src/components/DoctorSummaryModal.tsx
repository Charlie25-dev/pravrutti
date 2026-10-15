"use client";

import React, { useState, useEffect } from "react";
import { UserProfile } from "../types/auth";
import {
  MedicalHistoryItem,
  MedicationItem,
  LabResultItem,
  CycleLogItem
} from "../types/tracker";
import { Printer, X, FileText, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

interface DoctorSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  history: MedicalHistoryItem[];
  medications: MedicationItem[];
  labs: LabResultItem[];
  cycles: CycleLogItem[];
}

export function DoctorSummaryModal({
  isOpen,
  onClose,
  user,
  history,
  medications,
  labs,
  cycles
}: DoctorSummaryModalProps) {
  const [assessment, setAssessment] = useState<{
    date: string;
    urgencyLevel: string;
    score: number;
    ruleSet: string;
    specialist: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("pcos_latest_assessment");
        if (raw) {
          setAssessment(JSON.parse(raw));
        }
      } catch {
        // Handled silently
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header toolbar */}
        <div className="p-4 bg-purple-700 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-200" />
            <h2 className="text-sm font-bold">Doctor Visit Health Summary (1-Page PDF / Print)</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white text-purple-800 rounded-xl text-xs font-bold hover:bg-purple-50 transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="doctor-printable-sheet" className="p-8 overflow-y-auto space-y-6 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 print:p-0 print:m-0 print:shadow-none print:w-full">
          {/* Document Header */}
          <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-purple-900 dark:text-purple-300">
                RITVYA — Clinical Visit Summary
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Patient Medical History, Cycle Tracking & Biomarker Trends
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Generated:</span>{" "}
              {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Patient Name</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{user?.name || "Patient"}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Date of Birth / Age</span>
              <span className="font-semibold">{user?.dateOfBirth || "N/A"} ({user?.age || 26} yrs)</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Patient Cohort</span>
              <span className="font-semibold">{user?.isTeen ? "Adolescent (13-17)" : "Adult (18-45)"}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Country</span>
              <span className="font-semibold">{user?.countryCode || "IN"}</span>
            </div>
          </div>

          {/* Known Conditions & Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-2">
              1. Documented Diagnoses & Medical History
            </h3>
            {history.length > 0 ? (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden text-xs">
                {history.map((h) => (
                  <li key={h.id} className="p-3 bg-white dark:bg-stone-900 flex justify-between items-start">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{h.condition}</span>
                      {h.notes && <p className="text-stone-500 text-[11px] mt-0.5">{h.notes}</p>}
                    </div>
                    {h.diagnosedYear && (
                      <span className="text-stone-400 font-semibold text-[11px] shrink-0">
                        Diagnosed: {h.diagnosedYear}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">No medical history entries logged.</p>
            )}
          </div>

          {/* Current Medications & Supplements */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-2">
              2. Active Medications & Nutritional Supplements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {medications.map((m) => (
                <div key={m.id} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{m.name}</span>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Dosage: <span className="font-medium text-stone-700 dark:text-stone-300">{m.dosage}</span> • {m.frequency}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Menstrual Cycles */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-2">
              3. Recent Menstrual Cycles & Symptom Logging
            </h3>
            <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="p-2.5">Start Date</th>
                    <th className="p-2.5">End Date</th>
                    <th className="p-2.5">Flow Intensity</th>
                    <th className="p-2.5">Pain Rating (1-10)</th>
                    <th className="p-2.5">Associated Symptoms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {cycles.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2.5 font-semibold">{c.startDate}</td>
                      <td className="p-2.5">{c.endDate}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                          {c.flow}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium">{c.painLevel} / 10</td>
                      <td className="p-2.5 text-stone-500 text-[11px]">{c.symptoms.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Lab Biomarkers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-2">
              4. Key Laboratory Biomarker Trends
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {labs.slice(-4).map((l) => (
                <div key={l.id} className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800">
                  <span className="text-[10px] text-stone-400 block font-semibold">{l.testName}</span>
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                    {l.numericVal} <span className="text-[10px] font-normal text-stone-400">{l.unit}</span>
                  </span>
                  <div className="text-[10px] text-stone-500 mt-1">Date: {l.testedAt}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Guided Symptom Assessment Summary */}
          {assessment && (
            <div className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  5. Recent Urgency Triage Assessment (PCOS Symptom Agent)
                </h3>
                <span className="text-[10px] text-stone-400 font-medium">Logged: {assessment.date}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Urgency Level</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">{assessment.urgencyLevel}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Urgency Score</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{assessment.score} / 100</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Rule Pathway</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{assessment.ruleSet}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Referred Specialty</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">{assessment.specialist}</span>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 italic">
                * Evaluated by deterministic rule engine v1.0.0. PLACEHOLDER: needs clinical review.
              </p>
            </div>
          )}

          {/* Clinical Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-[11px] text-stone-500 dark:text-stone-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-purple-950 dark:text-purple-300">Clinical Notice:</strong> This summary is generated from patient-reported logs in the RITVYA educational application. It does not provide medical diagnoses or prescriptions. Please consult with your licensed gynecologist, endocrinologist, or physician for clinical care decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
