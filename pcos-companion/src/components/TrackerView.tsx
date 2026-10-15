"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import {
  MedicalHistoryItem,
  LabResultItem,
  MedicationItem,
  CycleLogItem,
  DailyHabits,
  SEED_MEDICAL_HISTORY,
  SEED_LAB_RESULTS,
  SEED_MEDICATIONS,
  SEED_CYCLE_LOGS
} from "../types/tracker";
import { DoctorSummaryModal } from "./DoctorSummaryModal";
import {
  Activity,
  Calendar as CalendarIcon,
  CheckCircle2,
  PlusCircle,
  TrendingDown,
  Trash2,
  FileDown,
  Sparkles,
  Heart,
  Droplet,
  Moon,
  Apple,
  Footprints,
  Wind
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export function TrackerView() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // State with Seed Data
  const [history, setHistory] = useState<MedicalHistoryItem[]>(SEED_MEDICAL_HISTORY);
  const [medications, setMedications] = useState<MedicationItem[]>(SEED_MEDICATIONS);
  const [labs, setLabs] = useState<LabResultItem[]>(SEED_LAB_RESULTS);
  const [cycles, setCycles] = useState<CycleLogItem[]>(SEED_CYCLE_LOGS);

  // Selected Calendar Day (Default to Day 15)
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [habitsMap, setHabitsMap] = useState<Record<number, DailyHabits>>({
    12: { sleep: true, protein: true, veggies: true, hydration: true, movement: false, stress: true },
    13: { sleep: true, protein: true, veggies: false, hydration: true, movement: true, stress: false },
    14: { sleep: true, protein: true, veggies: true, hydration: true, movement: true, stress: true },
    15: { sleep: true, protein: false, veggies: true, hydration: true, movement: false, stress: false }
  });

  // Cycle Logging Form State
  const [periodStart, setPeriodStart] = useState("2026-10-14");
  const [periodEnd, setPeriodEnd] = useState("2026-10-19");
  const [flow, setFlow] = useState<"LIGHT" | "MEDIUM" | "HEAVY">("MEDIUM");
  const [painLevel, setPainLevel] = useState<number>(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Mild fatigue"]);

  // New Lab Form State
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [newTestName, setNewTestName] = useState("Total Testosterone");
  const [newTestVal, setNewTestVal] = useState("50");
  const [newTestDate, setNewTestDate] = useState("2026-10-15");

  // New History Condition Form State
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newDiagnosedYear, setNewDiagnosedYear] = useState("2025");

  // Doctor Summary Modal State
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // Toggle Habits for Selected Day
  const toggleHabit = (key: keyof DailyHabits) => {
    setHabitsMap((prev) => {
      const current = prev[selectedDay] || {
        sleep: false,
        protein: false,
        veggies: false,
        hydration: false,
        movement: false,
        stress: false
      };
      return {
        ...prev,
        [selectedDay]: {
          ...current,
          [key]: !current[key]
        }
      };
    });
  };

  const currentHabits = habitsMap[selectedDay] || {
    sleep: false,
    protein: false,
    veggies: false,
    hydration: false,
    movement: false,
    stress: false
  };

  const handleAddCycle = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: CycleLogItem = {
      id: "cyc-" + Date.now(),
      startDate: periodStart,
      endDate: periodEnd,
      flow,
      painLevel,
      symptoms: selectedSymptoms
    };
    setCycles([newEntry, ...cycles]);
  };

  const handleAddLab = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newTestVal) || 0;
    const newLab: LabResultItem = {
      id: "lab-" + Date.now(),
      testName: newTestName,
      numericVal: val,
      unit: newTestName.includes("Insulin") ? "uIU/mL" : "ng/dL",
      testedAt: newTestDate,
      status: val > 60 ? "elevated" : "normal"
    };
    setLabs([...labs, newLab]);
    setIsLabModalOpen(false);
  };

  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondition) return;
    const item: MedicalHistoryItem = {
      id: "hist-" + Date.now(),
      condition: newCondition,
      diagnosedYear: parseInt(newDiagnosedYear) || undefined
    };
    setHistory([item, ...history]);
    setNewCondition("");
    setIsConditionModalOpen(false);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  // Recharts Chart Dataset Preparation
  const chartData = [
    { date: "May 2026", testosterone: 68, insulin: 24.2, tsh: 2.8 },
    { date: "Jul 2026", testosterone: 62, insulin: 20.1, tsh: 2.7 },
    { date: "Sep 2026", testosterone: 54, insulin: 16.5, tsh: 2.5 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Doctor Summary Modal */}
      <DoctorSummaryModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        user={user}
        history={history}
        medications={medications}
        labs={labs}
        cycles={cycles}
      />

      {/* Header Banner: Title & 1-Page Doctor Summary Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-purple-600" />
            {t("tracker.title")}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {t("tracker.habitsSubtitle")}
          </p>
        </div>

        <button
          onClick={() => setIsDoctorModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-teal-600 hover:from-purple-800 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          {t("tracker.exportDoctorSummary")}
        </button>
      </div>

      {/* SECTION 1: Progress Calendar & Daily Gentle Habits (Zero Shaming) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Calendar Grid */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                October 2026 — Gentle Habits Calendar
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-teal-900/50">
              Positive Reinforcement
            </span>
          </div>

          {/* Month Day Pills Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="text-[11px] font-bold text-stone-400 py-1">
                {d}
              </span>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const h = habitsMap[day];
              const completedCount = h ? Object.values(h).filter(Boolean).length : 0;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "ring-2 ring-purple-600 bg-purple-50 dark:bg-purple-950/80 font-bold text-purple-900 dark:text-purple-100"
                      : completedCount > 3
                      ? "bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold"
                      : completedCount > 0
                      ? "bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300"
                      : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  {completedCount > 0 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Anti-Shaming Rule Notice */}
          <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center gap-2.5 text-[11px] text-purple-900 dark:text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{t("tracker.noStreakRule")}</span>
          </div>
        </div>

        {/* Selected Day Habit Checklist */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Logged Habits for Oct {selectedDay}, 2026
              </h4>
              <span className="text-xs font-semibold text-purple-600">
                {Object.values(currentHabits).filter(Boolean).length} / 6 Complete
              </span>
            </div>

            <div className="space-y-2.5 pt-3">
              {[
                { key: "sleep", label: t("tracker.sleepHabit"), icon: Moon, color: "text-indigo-500" },
                { key: "protein", label: t("tracker.proteinHabit"), icon: Apple, color: "text-purple-500" },
                { key: "veggies", label: t("tracker.veggiesHabit"), icon: Sparkles, color: "text-emerald-500" },
                { key: "hydration", label: t("tracker.hydrationHabit"), icon: Droplet, color: "text-teal-500" },
                { key: "movement", label: t("tracker.movementHabit"), icon: Footprints, color: "text-amber-500" },
                { key: "stress", label: t("tracker.stressHabit"), icon: Wind, color: "text-sky-500" }
              ].map(({ key, label, icon: Icon, color }) => {
                const isDone = currentHabits[key as keyof DailyHabits];
                return (
                  <button
                    key={key}
                    onClick={() => toggleHabit(key as keyof DailyHabits)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition ${
                      isDone
                        ? "bg-teal-50/70 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 text-teal-950 dark:text-teal-200 font-semibold"
                        : "bg-white dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/60 text-stone-600 dark:text-stone-300 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span>{label}</span>
                    </div>
                    <CheckCircle2
                      className={`w-4 h-4 transition ${
                        isDone ? "text-teal-600 fill-teal-100 dark:fill-teal-900" : "text-stone-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-[11px] text-stone-500 text-center">
            Tap any habit to mark done. Missed days show neutral encouragement.
          </div>
        </div>
      </div>

      {/* SECTION 2: Cycle & Symptom Logger */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-500" />
              {t("tracker.cycleLogging")}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Track cycle regularity and associated symptoms without judgment.
            </p>
          </div>
        </div>

        {/* Form to log cycle */}
        <form onSubmit={handleAddCycle} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
              {t("tracker.logPeriod")} Start Date
            </label>
            <input
              type="date"
              required
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              required
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
              Flow Intensity
            </label>
            <select
              value={flow}
              onChange={(e) => setFlow(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
            >
              <option value="LIGHT">{t("tracker.flowLight")}</option>
              <option value="MEDIUM">{t("tracker.flowMedium")}</option>
              <option value="HEAVY">{t("tracker.flowHeavy")}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
              Pain Scale (1 - 10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Save Cycle Log
          </button>
        </form>

        {/* Logged Cycle Table */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 text-[10px] uppercase font-bold">
              <tr>
                <th className="p-3">Period Dates</th>
                <th className="p-3">Flow</th>
                <th className="p-3">Pain Level</th>
                <th className="p-3">Logged Symptoms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {cycles.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="p-3 font-semibold text-purple-900 dark:text-purple-300">
                    {c.startDate} &rarr; {c.endDate}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                      {c.flow}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{c.painLevel} / 10</td>
                  <td className="p-3 text-stone-500 text-[11px]">{c.symptoms.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Lab Biomarkers & Recharts Trends */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-teal-600" />
              {t("tracker.labTrends")}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Monitor key metabolic and androgen values over time.
            </p>
          </div>
          <button
            onClick={() => setIsLabModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Lab Value
          </button>
        </div>

        {/* Recharts Multi-line Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="date" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(28, 24, 38, 0.95)",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  fontSize: "12px",
                  color: "#fff"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="testosterone"
                name="Total Testosterone (ng/dL)"
                stroke="#9333EA"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="insulin"
                name="Fasting Insulin (uIU/mL)"
                stroke="#14B8A6"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 4: Medical History Timeline & Active Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conditions & History Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {t("tracker.historyTimeline")}
            </h3>
            <button
              onClick={() => setIsConditionModalOpen(true)}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Entry
            </button>
          </div>

          <div className="space-y-3">
            {history.map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex justify-between items-start"
              >
                <div>
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">{h.condition}</h4>
                  {h.notes && <p className="text-[11px] text-stone-500 mt-1">{h.notes}</p>}
                  {h.diagnosedYear && (
                    <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold block mt-1">
                      Diagnosed: {h.diagnosedYear}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteHistory(h.id)}
                  className="p-1 text-stone-400 hover:text-rose-600 transition"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Medications & Supplements */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Active Medications & Supplements
            </h3>
            <span className="text-[11px] text-stone-400 font-medium">Educational Log</span>
          </div>

          <div className="space-y-3">
            {medications.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-purple-50/40 dark:bg-purple-950/20"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">{m.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                  Dosage: <span className="font-semibold">{m.dosage}</span> • {m.frequency}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Condition Modal */}
      {isConditionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Add Medical Profile Diagnosis
            </h3>
            <form onSubmit={handleAddCondition} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Condition Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mild Hirsutism or Thyroid"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Year of Diagnosis</label>
                <input
                  type="number"
                  value={newDiagnosedYear}
                  onChange={(e) => setNewDiagnosedYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConditionModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lab Modal */}
      {isLabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Log Lab Test Biomarker
            </h3>
            <form onSubmit={handleAddLab} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Test Name</label>
                <select
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                >
                  <option value="Total Testosterone">Total Testosterone (ng/dL)</option>
                  <option value="Fasting Insulin">Fasting Insulin (uIU/mL)</option>
                  <option value="TSH">TSH (uIU/mL)</option>
                  <option value="LH / FSH Ratio">LH / FSH Ratio</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Numeric Value</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newTestVal}
                  onChange={(e) => setNewTestVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Date Tested</label>
                <input
                  type="date"
                  required
                  value={newTestDate}
                  onChange={(e) => setNewTestDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLabModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
                >
                  Record Biomarker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
