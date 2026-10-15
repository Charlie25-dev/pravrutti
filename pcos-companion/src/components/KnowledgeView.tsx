"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "../lib/i18n";
import { useTextToSpeech } from "../lib/speech";
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  Shield,
  Heart,
  ChevronRight,
  ChevronDown,
  Info,
  Sun,
  Moon,
  Activity,
  Flame,
  Feather,
  Smile,
  ArrowRight
} from "lucide-react";

interface MythFactItem {
  id: string;
  myth: string;
  fact: string;
  explanation: string;
  clinicalNote: string;
}

interface UnderstandCardItem {
  id: string;
  title: string;
  tag: string;
  icon: string;
  summary: string;
  keyPoints: string[];
  clinicalReviewNote: string;
}

const AFFIRMATIONS = [
  "I honor my body's rhythm today. I listen with curiosity, patience, and compassion.",
  "PCOS does not define my worth, my femininity, or my future.",
  "My body is not broken. It is constantly communicating with me and working to keep me safe.",
  "Progress is found in small, gentle daily choices — zero pressure, zero guilt.",
  "I deserve healthcare providers who listen to me with respect, empathy, and evidence-based care.",
  "Taking rest is not a failure; it is essential medicine for hormonal balance."
];

export function KnowledgeView() {
  const { t, locale } = useTranslation();
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech(locale);

  // Quote carousel state
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const quotes = [
    t("knowledge.confidenceQuote1"),
    t("knowledge.confidenceQuote2"),
    t("knowledge.confidenceQuote3"),
    "You are worthy of patient, non-judgmental, evidence-based healthcare."
  ];

  // Auto-rotate quotes every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  // Daily Affirmation state
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  // Myth vs Fact expanded card state
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Understand Cards expanded state
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    topic1: true // Open first topic by default
  });

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReadText = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const mythsFacts: MythFactItem[] = [
    {
      id: "myth-1",
      myth: t("knowledge.myth1"),
      fact: t("knowledge.fact1"),
      explanation:
        "While PCOS causes irregular ovulation, ovaries retain healthy eggs. With gentle lifestyle support, insulin management, and medications like letrozole or clomiphene when needed, the majority of women with PCOS achieve healthy pregnancies.",
      clinicalNote: "Ref: International Evidence-based Guideline for PCOS 2023. PLACEHOLDER: needs clinical review."
    },
    {
      id: "myth-2",
      myth: t("knowledge.myth2"),
      fact: t("knowledge.fact2"),
      explanation:
        "Severe calorie restriction or aggressive elimination diets spike cortisol and worsen hormonal imbalances. Consistent protein-rich meals, fiber from leafy vegetables, and steady carbohydrates support stable insulin levels far more sustainably.",
      clinicalNote: "Ref: Endocrine Society Clinical Guidelines. PLACEHOLDER: needs clinical review."
    },
    {
      id: "myth-3",
      myth: t("knowledge.myth3"),
      fact: t("knowledge.fact3"),
      explanation:
        "Around 20% to 30% of people with PCOS have a normal or lower BMI (commonly called 'Lean PCOS'). They can still experience irregular cycles, high androgens, and cellular insulin resistance, showing that weight is not the sole cause or symptom.",
      clinicalNote: "Ref: ICMR Task Force on PCOS in India. PLACEHOLDER: needs clinical review."
    },
    {
      id: "myth-4",
      myth: "Myth: The birth control pill is the only way to treat PCOS.",
      fact: "Fact: Birth control induces regular withdrawal bleeding, but lifestyle, nutritional, and metabolic therapies treat root factors.",
      explanation:
        "Contraceptives help prevent endometrial thickening if periods are absent, but they do not resolve insulin resistance. Long-term management works best when combining nutrition, inositol, regular movement, and stress care.",
      clinicalNote: "Ref: American College of Obstetricians and Gynecologists (ACOG). PLACEHOLDER: needs clinical review."
    }
  ];

  const understandTopics: UnderstandCardItem[] = [
    {
      id: "topic1",
      title: "1. What is PCOS? (The Underlying Biology)",
      tag: "Endocrine Condition",
      icon: "activity",
      summary:
        "Polycystic Ovary Syndrome is primarily a neuroendocrine and metabolic condition, not merely a problem of the ovaries.",
      keyPoints: [
        "In the brain, the pituitary gland produces LH (Luteinizing Hormone) and FSH (Follicle Stimulating Hormone). In PCOS, LH is frequently elevated relative to FSH.",
        "Ovarian follicles (immature eggs) begin developing each month, but without an LH surge, ovulation pauses. These harmless tiny follicles look like small pearls on an ultrasound.",
        "They are not painful cysts or tumors that burst; they are simply resting ovarian follicles.",
        "Insulin resistance frequently acts as a primary fuel, prompting the ovaries to produce extra androgens (testosterone)."
      ],
      clinicalReviewNote: "Reviewed by Dr. Ananya Rao, MD (OB/GYN) - PLACEHOLDER: needs clinical review"
    },
    {
      id: "topic2",
      title: "2. Common Signs & The Rotterdam Diagnostic Criteria",
      tag: "Clinical Diagnosis",
      icon: "flame",
      summary:
        "Under international clinical consensus, an adult diagnosis requires at least 2 out of these 3 features (with other conditions ruled out):",
      keyPoints: [
        "1. Irregular or absent ovulation (cycles longer than 35-45 days, or fewer than 6-8 periods per year).",
        "2. Clinical signs (facial/body hair, persistent acne) or blood test evidence of elevated androgens.",
        "3. Polycystic ovarian appearance on a high-resolution ultrasound (20+ small follicles per ovary).",
        "Because only 2 of 3 are required, some people have regular cycles with hirsutism, while others have irregular cycles with normal skin."
      ],
      clinicalReviewNote: "Rotterdam Consensus & NIH Criteria. PLACEHOLDER: needs clinical review"
    },
    {
      id: "topic3",
      title: "3. Supportive Daily Lifestyle Foundations",
      tag: "Daily Well-Being",
      icon: "feather",
      summary:
        "Gentle, consistent daily routines provide immense metabolic and hormonal stability without extreme deprivation.",
      keyPoints: [
        "Nourishing Protein Breakfast: Having 20-30g of protein with breakfast prevents mid-morning glucose spikes and afternoon fatigue crashes.",
        "Gentle, Mindful Movement: A 20-30 minute brisk walk, yoga session, or moderate resistance training sensitizes muscle cells to insulin without overtaxing adrenal cortisol.",
        "Prioritizing Restful Sleep: 7 to 9 hours of uninterrupted sleep lowers morning fasting insulin and stabilizes hunger hormones (ghrelin and leptin).",
        "Targeted Nutrients: Supplements such as Myo-Inositol & D-Chiro Inositol (40:1 ratio) and Vitamin D3 have clinical backing for ovulatory support."
      ],
      clinicalReviewNote: "Evidence-based lifestyle guidelines. PLACEHOLDER: needs clinical review"
    },
    {
      id: "topic4",
      title: "4. Emotional Well-Being & The Neuroendocrine Link",
      tag: "Mental Health",
      icon: "heart",
      summary:
        "PCOS has biological connections to mood, stress, and neurotransmitter balance. Your emotional health matters deeply.",
      keyPoints: [
        "Hormonal fluctuations (especially progesterone deficits from anovulatory cycles) and chronic low-grade inflammation directly influence serotonin signaling in the brain.",
        "Anxiety and depressive symptoms are significantly more common in individuals with PCOS — this is a biological reality, not a lack of willpower.",
        "Stigma surrounding body image, facial hair, or fertility can cause chronic emotional stress.",
        "Seeking supportive mental health therapy (such as CBT or mindfulness) is a vital part of comprehensive PCOS care."
      ],
      clinicalReviewNote: "American Psychological Association & WHO mental health guidelines. PLACEHOLDER: needs clinical review"
    },
    {
      id: "topic5",
      title: "5. Adolescent Puberty vs. PCOS (Ages 13–17)",
      tag: "Adolescent Health",
      icon: "smile",
      summary:
        "In teenagers, irregular cycles during the first 2 to 3 years after the first period are often completely normal.",
      keyPoints: [
        "The hypothalamic-pituitary-ovarian axis takes several years to mature after menarche. Anovulatory cycles are a natural developmental feature of puberty.",
        "Ultrasound is NOT recommended for adolescent diagnosis because healthy teenagers normally possess multifollicular ovaries.",
        "Diagnosis in adolescents requires persistent ovulatory dysfunction after 3+ years post-menarche AND clear evidence of hyperandrogenism.",
        "Early care focuses on reassurance, healthy nutrition, sleep, and positive body confidence."
      ],
      clinicalReviewNote: "Pediatric Endocrine Society Guidelines. PLACEHOLDER: needs clinical review"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            {t("knowledge.title")}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Compassionate, medically grounded, stigma-free guidance. Publicly accessible without sign-up.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          Evidence-Based Education
        </span>
      </div>

      {/* Hero Infographic: Prevalence in India & Globally */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 text-white shadow-xl relative overflow-hidden space-y-6">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <span className="text-[11px] font-bold tracking-widest uppercase text-purple-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            Epidemiology & Prevalence
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            PCOS affects 1 in 5 (20%) women of reproductive age in India
          </h3>
          <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
            {t("knowledge.prevalenceStat")} You are not alone, you are not broken, and your symptoms are shared by millions of individuals navigating hormonal health.
          </p>
        </div>

        {/* Animated 1-in-5 Silhouette Infographic */}
        <div className="relative z-10 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3, 4].map((i) => {
              const isHighlight = i === 0;
              return (
                <div
                  key={i}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${
                    isHighlight
                      ? "bg-gradient-to-tr from-teal-400 to-emerald-400 text-purple-950 font-black shadow-teal-500/30 ring-2 ring-teal-300"
                      : "bg-white/15 text-white/70"
                  }`}
                  title={isHighlight ? "1 in 5 (20%) affected" : "General population"}
                >
                  <Heart className={`w-5 h-5 ${isHighlight ? "fill-purple-950" : ""}`} />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 text-left w-full sm:w-auto">
            <div className="p-2.5 rounded-xl bg-black/20 text-xs">
              <span className="text-[10px] uppercase font-bold text-teal-300 block">India Prevalence</span>
              <span className="text-sm font-extrabold">~20% (1 in 5)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 text-xs">
              <span className="text-[10px] uppercase font-bold text-purple-300 block">Global Range</span>
              <span className="text-sm font-extrabold">8% to 13%</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] text-purple-300/80 pt-1 border-t border-white/10">
          <span>Ref: WHO & ICMR Guidelines</span>
          <span className="italic">PLACEHOLDER: needs clinical review</span>
        </div>
      </div>

      {/* Rotating Confidence Quote Carousel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm relative space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Words of Reassurance
          </span>

          <div className="flex items-center gap-1.5">
            {quotes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuoteIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentQuoteIdx
                    ? "w-6 bg-purple-600"
                    : "w-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300"
                }`}
                aria-label={`Go to quote ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <blockquote className="text-base sm:text-lg font-semibold text-stone-800 dark:text-stone-200 leading-relaxed italic min-h-[3.5rem] flex items-center">
          "{quotes[currentQuoteIdx]}"
        </blockquote>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <button
            onClick={() => handleReadText(quotes[currentQuoteIdx])}
            className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800 transition"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? "Stop Voice" : "Read Aloud"}</span>
          </button>

          <span className="text-[11px] text-stone-400">Auto-cycles every 8s</span>
        </div>
      </div>

      {/* Daily Affirmation Card with Shuffle */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-purple-700 via-purple-600 to-teal-600 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold tracking-wider text-purple-200 flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-300" />
            {t("knowledge.dailyAffirmation")}
          </span>

          <button
            onClick={() => setAffirmationIdx((prev) => (prev + 1) % AFFIRMATIONS.length)}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition text-xs flex items-center gap-1"
            title="Next gentle affirmation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">New Affirmation</span>
          </button>
        </div>

        <p className="text-base sm:text-lg font-medium leading-relaxed">
          "{AFFIRMATIONS[affirmationIdx]}"
        </p>

        <div className="flex items-center justify-between text-xs text-purple-100 pt-1">
          <button
            onClick={() => handleReadText(AFFIRMATIONS[affirmationIdx])}
            className="flex items-center gap-1.5 font-bold text-white hover:text-purple-100"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Listen
          </button>
          <span className="text-[11px] text-purple-200 opacity-80">Take a deep, kind breath for yourself</span>
        </div>
      </div>

      {/* Section: Myth vs. Fact Interactive Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {t("knowledge.mythVsFactTitle")}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Click any card to explore the scientific evidence dispelling harmful PCOS myths.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mythsFacts.map((item) => {
            const isFlipped = flippedCards[item.id] || false;
            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1C1826] border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 transition hover:border-purple-300 dark:hover:border-purple-800 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Myth Box */}
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Common Myth
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-rose-950 dark:text-rose-200 mt-1">
                      {item.myth}
                    </p>
                  </div>

                  {/* Fact Box */}
                  <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Medical Fact
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-teal-950 dark:text-teal-200 mt-1">
                      {item.fact}
                    </p>
                  </div>

                  {/* Expandable Clinical Context */}
                  {isFlipped && (
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 leading-relaxed animate-in fade-in duration-150 space-y-1.5">
                      <p>{item.explanation}</p>
                      <p className="text-[10px] text-stone-400 italic">{item.clinicalNote}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <button
                    onClick={() => toggleFlip(item.id)}
                    className="font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800 flex items-center gap-1"
                  >
                    <span>{isFlipped ? "Show Less" : "Why is this true?"}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isFlipped ? "rotate-180" : ""}`}
                    />
                  </button>

                  <button
                    onClick={() => handleReadText(`${item.myth}. ${item.fact}. ${item.explanation}`)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Understand PCOS Deep-Dive Accordion Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            {t("knowledge.understandTitle")}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Curated clinical insights explaining PCOS biology, diagnosis, nutrition, and mental health.
          </p>
        </div>

        <div className="space-y-3">
          {understandTopics.map((topic) => {
            const isExpanded = expandedTopics[topic.id] || false;
            return (
              <div
                key={topic.id}
                className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1C1826] overflow-hidden shadow-sm transition hover:border-purple-300 dark:hover:border-purple-800"
              >
                {/* Topic Header Accordion Button */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 transition hover:bg-stone-50/50 dark:hover:bg-stone-800/20"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                      {topic.icon === "activity" && <Activity className="w-5 h-5" />}
                      {topic.icon === "flame" && <Flame className="w-5 h-5" />}
                      {topic.icon === "feather" && <Feather className="w-5 h-5" />}
                      {topic.icon === "heart" && <Heart className="w-5 h-5" />}
                      {topic.icon === "smile" && <Smile className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
                        {topic.tag}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                        {topic.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-stone-400 hidden sm:inline">
                      {isExpanded ? "Collapse" : "Read Topic"}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-4 text-xs border-t border-stone-100 dark:border-stone-800 animate-in fade-in duration-150">
                    <p className="text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                      {topic.summary}
                    </p>

                    <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 block">
                        Core Takeaways:
                      </span>
                      <ul className="space-y-2">
                        {topic.keyPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span className="italic">{topic.clinicalReviewNote}</span>
                      <button
                        onClick={() =>
                          handleReadText(`${topic.title}. ${topic.summary}. ${topic.keyPoints.join(". ")}`)
                        }
                        className="flex items-center gap-1 font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Listen to Topic
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Reviewer Banner & Governance */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 text-xs text-stone-500 space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-bold text-stone-700 dark:text-stone-300">
            {t("knowledge.reviewedBy")}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Educational content is curated in accordance with the International Evidence-based Guideline for the Assessment and Management of Polycystic Ovary Syndrome (2023). All thresholds and assertions are cataloged with clinical placeholder metadata.
        </p>
      </div>
    </div>
  );
}
