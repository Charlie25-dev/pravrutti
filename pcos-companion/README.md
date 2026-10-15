# RITVYA — Holistic PCOS & Cycle Companion (PWA)

A compassionate, privacy-centric, and evidence-grounded digital companion dedicated to demystifying Polycystic Ovary Syndrome (PCOS) for adolescents and adult women (ages 13–45) in India and globally.

---

## 1. Executive Summary & Product Philosophy

- **Destigmatizing Design:** Replaces cold, intimidating clinical aesthetics with the signature **RITVYA** brand system (Creamy Blush `#FAF4F3`, Deep Mulberry/Plum `#54224A`, and Soft Dusty Rose `#C47D9A` matching the official floral icon).
- **Anti-Shaming Tracking:** Daily habit tracking features positive reinforcement without streaks, without red failure marks, and strictly without calorie counting or body-shaming weight targets.
- **Deterministic Urgency Engine (v1.0.0):** Symptom triage is 100% deterministic (pure TypeScript logic). Zero LLM hallucinations or unstructured clinical liability.
- **Age Gate & Distinct Cohort Pathways:**
  - **Adolescents (13–17):** Recognizes menstrual cycle variability within 1–3 years of menarche as normal pubertal transitions; omits ovarian ultrasound criteria; requires DPDP Act guardian consent; locks analytics off permanently.
  - **Adults (18–45):** Incorporates full Rotterdam criteria (oligo/amenorrhea, hyperandrogenism signs, and ultrasound morphology).
- **Privacy-First (India DPDP Act 2023 & GDPR):** Field-level AES-256-GCM encryption for health data, 1-click JSON data export (Right to Portability), and 1-click permanent data erasure (Right to Erasure).
- **Multilingual (5 Launch Locales):** Complete, zero-hardcoded parity across English (`en`), Hindi (`hi`), Kannada (`kn`), Tamil (`ta`), and Telugu (`te`), accompanied by Web Speech Text-to-Speech (TTS) audio narration.
- **Zero Location Tracking:** "Find Care Near Me" generates direct external links to Google Maps (`https://www.google.com/maps/search/?api=1&query=...`) without accessing device geolocation APIs.

---

## 2. Architecture & Technology Stack

```
pcos-companion/
├── public/
│   ├── manifest.json         # W3C PWA Manifest (standalone, theme colors, icons)
│   └── sw.js                 # Service worker with stale-while-revalidate offline caching
├── prisma/
│   └── schema.prisma         # PostgreSQL schema (Users, Habits, Cycles, Labs, Assessments)
├── src/
│   ├── app/
│   │   ├── globals.css       # Tailwind CSS design tokens & animations
│   │   ├── layout.tsx        # Root HTML metadata, PWA links, viewport configuration
│   │   └── page.tsx          # Single-page tab orchestrator (Tracker, Agent, Knowledge, Profile)
│   ├── components/
│   │   ├── Header.tsx        # Sticky branding, user switcher, TTS read aloud, panic screen hide
│   │   ├── Navigation.tsx    # Mobile bottom tab bar & desktop sidebar with full ARIA roles
│   │   ├── OnboardingModal.tsx # Demo personas (Priya 26y, Ananya 15y, Guest), age gate, consent
│   │   ├── TrackerView.tsx   # Habit calendar, cycle logger, Recharts lab trends, doctor export
│   │   ├── DoctorSummaryModal.tsx # Printable 1-page health summary with recent triage results
│   │   ├── AgentView.tsx     # Guided MCQ assessment, red-flag takeover, specialist referrals
│   │   ├── KnowledgeView.tsx # 1-in-5 prevalence hero, quote carousel, Myth vs Fact, topics
│   │   └── ProfileView.tsx   # Theme, language, country selector, discreet mode, PIN, DPDP data
│   ├── config/
│   │   ├── contact.ts        # Support email, hours, HQ address placeholders
│   │   └── countries.ts      # Emergency services (112, 911, 999) & mental health lifelines
│   ├── lib/
│   │   ├── auth.tsx          # Client authentication state, demo personas, age gate validation
│   │   ├── crypto.ts         # AES-256-GCM authenticated field-level encryption
│   │   ├── i18n.tsx          # 5-locale translator, locale switcher hook
│   │   └── speech.ts         # Web Speech API text-to-speech synthesis hook
│   ├── locales/
│   │   ├── en.json           # Master English translation catalog
│   │   ├── hi.json           # Hindi (हिंदी)
│   │   ├── kn.json           # Kannada (ಕನ್ನಡ)
│   │   ├── ta.json           # Tamil (தமிழ்)
│   │   └── te.json           # Telugu (తెలుగు)
│   ├── rules/
│   │   └── urgencyEngine.ts  # Versioned pure deterministic clinical triage engine (v1.0.0)
│   └── types/
│       ├── agent.ts          # Assessment answers, red flags, triage results
│       ├── auth.ts           # UserProfile, age gate evaluator, DPDP consent state
│       └── tracker.ts        # Habits, cycles, lab biomarkers, medical history
└── tests/
    ├── ageGate.test.ts       # Age eligibility (<13, 13-17, 18-45, >45) unit tests
    ├── crypto.test.ts        # AES-256-GCM encryption & decryption unit tests
    ├── i18n.test.ts          # Automated key completeness & parity audit across 5 locales
    ├── qualityAssurance.test.ts # PWA manifest, service worker, helplines, non-empty catalog tests
    └── urgencyEngine.test.ts # Red-flag overrides, adolescent vs adult pathway tests
```

---

## 3. Local Setup & Quickstart

### Prerequisites
- Node.js `v20.x` or higher (verified on Node `v24.x`)
- npm `v10.x` or higher

### Installation
```bash
# Navigate to the project directory
cd pcos-companion

# Install dependencies (use legacy-peer-deps for React 19 compatibility)
npm install --legacy-peer-deps

# Create environment configuration
cp .env.example .env
```

### Running the App
```bash
# Development mode with hot-reloading
npm run dev

# Or build and run production server
npm run build
npm run start -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Running Automated Tests

The application includes 34 automated unit and integration tests powered by **Vitest**:

```bash
# Run the complete test suite
npx vitest run

# Run specific test suites
npx vitest run tests/urgencyEngine.test.ts  # 14 tests: clinical urgency engine & red flags
npx vitest run tests/i18n.test.ts           # 5 tests: translation completeness audit
npx vitest run tests/ageGate.test.ts        # 5 tests: age gate & guardian consent logic
npx vitest run tests/crypto.test.ts         # 3 tests: AES-256-GCM encryption/decryption
npx vitest run tests/qualityAssurance.test.ts # 7 tests: PWA manifest, sw.js, country configs
```

---

## 5. Developer Guide: How to Add a New Language

1. **Create the translation catalog:**
   Create `src/locales/<locale_code>.json` (e.g., `src/locales/mr.json` for Marathi).
   Copy all keys from `src/locales/en.json` and translate the strings.
2. **Register the locale in `src/lib/i18n.tsx`:**
   Add your locale to the `Locale` union type and import the JSON file:
   ```typescript
   export type Locale = "en" | "hi" | "kn" | "ta" | "te" | "mr";
   import mr from "../locales/mr.json";
   ```
   Add the locale object to `LOCALES`:
   ```typescript
   { code: "mr", label: "Marathi", nativeName: "मराठी" }
   ```
3. **Register voice mapping in `src/lib/speech.ts`:**
   Add browser speech synthesis voice tags:
   ```typescript
   mr: ["mr-IN", "mr"]
   ```
4. **Verify translation completeness:**
   Run `npx vitest run tests/i18n.test.ts`. The test will automatically flag any missing keys.

---

## 6. Developer Guide: How to Update Clinical Rules & Red Flags

Clinical triage rules are strictly isolated in [`src/rules/urgencyEngine.ts`](file:///c:/Users/Sunny%20Kumar/OneDrive/Desktop/pravrutti/pcos-companion/src/rules/urgencyEngine.ts).

### Adding or Modifying a Red Flag
Add or update the entry in `RED_FLAGS`:
```typescript
"RF-009": {
  code: "RF-009",
  label: "New acute warning symptom description",
  clinicalRationale: "Risk of acute complication requiring emergency care.",
  urgency: "EMERGENCY", // or "URGENT"
  reviewStatus: "needs_clinical_review"
}
```

### Versioning Rules
Whenever clinical scoring logic or thresholds change:
1. Increment `RULES_VERSION = "1.1.0"` in `src/rules/urgencyEngine.ts`.
2. Add corresponding test cases in `tests/urgencyEngine.test.ts`.
3. Update the Clinical Review Checklist below.

---

## 7. Developer Guide: Updating Emergency Numbers & Contacts

- **Country Helplines:** Edit [`src/config/countries.ts`](file:///c:/Users/Sunny%20Kumar/OneDrive/Desktop/pravrutti/pcos-companion/src/config/countries.ts) to update ISO country codes, primary emergency numbers, and regional mental health crisis hotlines.
- **Support & HQ Contacts:** Edit [`src/config/contact.ts`](file:///c:/Users/Sunny%20Kumar/OneDrive/Desktop/pravrutti/pcos-companion/src/config/contact.ts) to update organizational email addresses, phone lines, operating hours, and legal notices.

---

## 8. Compliance, Security & Data Privacy

### India Digital Personal Data Protection (DPDP) Act 2023
- **Verifiable Parental Consent for Minors:** Adolescents aged 13–17 must enter a parent/guardian email before health data is processed.
- **Children's Data Protection:** Optional analytics and behavioral tracking are permanently hard-locked to `false` for minors.
- **Right to Data Portability (Section 12):** 1-click encrypted health export downloads a complete `.json` file of all user entries.
- **Right to Erasure (Section 12):** 1-click permanent account and data wipe removes all local storage keys and resets session to Guest mode.

### Cryptographic Security (AES-256-GCM)
Implemented in [`src/lib/crypto.ts`](file:///c:/Users/Sunny%20Kumar/OneDrive/Desktop/pravrutti/pcos-companion/src/lib/crypto.ts):
- Galois/Counter Mode (GCM) with authenticated 128-bit authentication tags.
- Unique cryptographically secure 96-bit initialization vectors (IV) generated per encrypted field.
- Prevents tampering, data leakage, and unauthorized access across health records.

---

## 9. Comprehensive Clinical Review Checklist

The following items are cataloged in the codebase with the review status `"needs_clinical_review"` and must be audited by a certified medical specialist before production deployment:

| ID | Category | Item Description | Clinical Reviewer Required | Status |
|---|---|---|---|---|
| `RF-001` | Red Flag | Sudden, severe pelvic or lower abdominal pain | Gynecologist | `needs_clinical_review` |
| `RF-002` | Red Flag | Bleeding soaking $\ge 1$ pad/tampon per hour for 2+ consecutive hours | Gynecologist | `needs_clinical_review` |
| `RF-003` | Red Flag | Fainting, severe dizziness, or loss of consciousness with abdominal pain | Emergency Medicine / GYN | `needs_clinical_review` |
| `RF-004` | Red Flag | Known or suspected pregnancy with sharp pelvic pain or spotting | Obstetrician / Gynecologist | `needs_clinical_review` |
| `RF-005` | Red Flag | Active thoughts of self-harm, severe crisis, or wanting to end life | Clinical Psychiatrist | `needs_clinical_review` |
| `RF-006` | Red Flag | Sudden severe 'thunderclap' headache or rapid vision loss | Neurologist / Physician | `needs_clinical_review` |
| `RF-007` | Red Flag | Sudden chest tightness, shortness of breath, or breathing difficulty | Emergency Physician | `needs_clinical_review` |
| `RF-008` | Red Flag | Extreme thirst, unquenchable urination, fruity breath odor, or confusion | Endocrinologist | `needs_clinical_review` |
| `AR-001` | Adolescent Rule | Cycles varying between 21–45 days in first 3 years post-menarche classified as normal pubertal variance | Adolescent Gynecologist | `needs_clinical_review` |
| `AR-002` | Adolescent Rule | Pelvic ultrasound omitted from primary diagnostic criteria for adolescents (13–17) | Pediatric Radiologist | `needs_clinical_review` |
| `TH-001` | Urgency Threshold | Cycle interval $>45$ days (Adult) or $>90$ days (Teen) scoring for oligomenorrhea/amenorrhea | Gynecologist | `needs_clinical_review` |
| `TH-002` | Lab Threshold | Total Testosterone $>70\text{ ng/dL}$ or Fasting Insulin $>25\ \mu\text{IU/mL}$ flagged as elevated | Clinical Biochemist | `needs_clinical_review` |
| `ST-001` | Prevalence Stat | "PCOS affects approximately 1 in 5 (20%) women of reproductive age in India, and 8–13% globally." | Reproductive Endocrinologist | `needs_clinical_review` |
| `HL-001` | Helpline | India Tele-MANAS (`14416`) and KIRAN (`1800-599-0019`) mental health crisis helplines | Public Health Official | `verify_before_launch` |
| `LG-001` | Legal Notice | DPDP Act Parental/Guardian consent email verification notice for minors | Legal Counsel | `needs_legal_review` |

---

## 10. Clinical Disclaimer

> **IMPORTANT CLINICAL NOTICE:**  
> PCOS Companion is an educational triage and self-care tracking tool. It **does not provide medical diagnoses, clinical prescriptions, or formal medical advice**. Only a qualified and licensed healthcare provider (such as a gynecologist or endocrinologist) can diagnose PCOS or prescribe clinical treatments. If you experience acute severe symptoms, contact emergency medical services (`112` in India, `911` in the US) immediately.
