import React, { useState } from "react";
import {
  SessionReport,
  CommunicationCorrection,
  WitMoment,
} from "../types";
import {
  Sparkles,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ThumbsUp,
  Clock,
  Volume2,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  Layers,
  Smile,
  Zap,
} from "lucide-react";

interface SessionReportViewProps {
  report: SessionReport;
  onRetryExercise: (parentReport: SessionReport) => void;
  onViewComparison?: () => void;
  hasComparisonAvailable?: boolean;
}

export const SessionReportView: React.FC<SessionReportViewProps> = ({
  report,
  onRetryExercise,
  onViewComparison,
  hasComparisonAvailable = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "memorability" | "storytelling" | "wit" | "corrections" | "delivery"
  >("overview");
  const [correctionFilter, setCorrectionFilter] = useState<"all" | "critical" | "useful" | "stylistic">("all");

  const filteredCorrections = report.communicationCorrections.filter((c) => {
    if (correctionFilter === "all") return true;
    return c.category === correctionFilter;
  });

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return "text-emerald-400 border-emerald-500/40 bg-emerald-950/40";
    if (score >= 6.5) return "text-indigo-400 border-indigo-500/40 bg-indigo-950/40";
    if (score >= 5.0) return "text-amber-400 border-amber-500/40 bg-amber-950/40";
    return "text-rose-400 border-rose-500/40 bg-rose-950/40";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                Session Diagnosis • Attempt {report.attemptNumber || 1}
              </span>
              <span className="text-xs text-zinc-400">
                {new Date(report.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                {report.durationSeconds}s duration
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              {report.title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed pt-1">
              {report.executiveSummary}
            </p>
          </div>

          {/* Action CTAs: Practice Loop Retry */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              id="retry-exercise-btn"
              onClick={() => onRetryExercise(report)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Exercise (Attempt {(report.attemptNumber || 1) + 1})</span>
            </button>

            {hasComparisonAvailable && onViewComparison && (
              <button
                onClick={onViewComparison}
                className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Compare With Attempt 1</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Core Competency Score Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-zinc-800/80">
          {[
            { label: "Overall Impact", val: report.scores.overall },
            { label: "Memorability", val: report.scores.memorability },
            { label: "Storytelling", val: report.scores.storytelling },
            { label: "Wit & Lightness", val: report.scores.wit },
            { label: "Delivery Pacing", val: report.scores.delivery },
            { label: "Clarity & Force", val: report.scores.communication },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 ${getScoreColor(s.val)}`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                {s.label}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono">
                {s.val.toFixed(1)}
              </span>
              <span className="text-[9px] text-zinc-400">out of 10</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flagship: "THE ONE THING TO FIX" Golden Banner */}
      {report.oneThingToFix && (
        <div className="bg-gradient-to-r from-amber-950/70 via-zinc-900 to-indigo-950/70 border-2 border-amber-500/60 rounded-3xl p-6 lg:p-7 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
              <Lightbulb className="w-5 h-5 fill-zinc-950" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                The Coach's Central Mandate • One Thing To Fix Next
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-100">
                "{report.oneThingToFix.rule}"
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm pt-2">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                Why This Creates The Biggest Leverage:
              </span>
              <p className="text-zinc-300 leading-relaxed">
                {report.oneThingToFix.whyCrucial}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                How To Apply In Your Next Retry:
              </span>
              <p className="text-amber-100/90 leading-relaxed">
                {report.oneThingToFix.howToApplyImmediately}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Strongest Moment vs Weakest Moment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strongest Moment */}
        <div className="bg-zinc-900/90 border border-emerald-800/40 rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400">
            <ThumbsUp className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Strongest Moment in Your Speech
            </h3>
          </div>
          <blockquote className="p-3.5 rounded-xl bg-zinc-950/80 border-l-4 border-emerald-500 text-xs sm:text-sm font-medium text-zinc-200 italic">
            "{report.strongestMoment?.quote}"
          </blockquote>
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong className="text-emerald-400">Why it resonated:</strong> {report.strongestMoment?.why}
          </p>
        </div>

        {/* Weakest Moment */}
        <div className="bg-zinc-900/90 border border-rose-800/40 rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Moment of Greatest Friction / Drop
            </h3>
          </div>
          <blockquote className="p-3.5 rounded-xl bg-zinc-950/80 border-l-4 border-rose-500 text-xs sm:text-sm font-medium text-zinc-300 italic">
            "{report.weakestMoment?.quote}"
          </blockquote>
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong className="text-rose-400">The Problem:</strong> {report.weakestMoment?.why}
          </p>
          <p className="text-xs text-indigo-300 leading-relaxed">
            <strong className="text-indigo-400">The Fix:</strong> {report.weakestMoment?.fix}
          </p>
        </div>
      </div>

      {/* Diagnostic Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Exercise" },
          { id: "memorability", label: `Memorability (${report.scores.memorability})` },
          { id: "storytelling", label: `Storytelling (${report.scores.storytelling})` },
          { id: "wit", label: `Wit & Lightness (${report.scores.wit})` },
          { id: "corrections", label: `Communication (${report.communicationCorrections?.length || 0})` },
          { id: "delivery", label: "Pacing & Delivery" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview & Next Exercise */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Next Targeted Exercise Card */}
          {report.nextExercise && (
            <div className="bg-zinc-900 border border-indigo-700/50 rounded-3xl p-6 lg:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-600 text-white">
                  Prescribed Exercise • Level {report.nextExercise.difficultyLevel}
                </span>
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Target Duration: {report.nextExercise.durationSeconds}s
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-100">
                  {report.nextExercise.title}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {report.nextExercise.prompt}
                </p>
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
                  <strong>Specific Training Objective:</strong> {report.nextExercise.targetFocus}
                </div>
              </div>
            </div>
          )}

          {/* Personality & Distinctive Voice Analysis */}
          {report.personalStyleInsights && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Your Natural Speaking Style Fingerprint
                </h3>
              </div>

              <p className="text-sm text-zinc-300 italic leading-relaxed">
                "{report.personalStyleInsights.distinctiveVoice}"
              </p>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Authentic Strengths Detected (Preserve These):
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.personalStyleInsights.naturalStrengths.map((st, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60"
                    >
                      ✓ {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Memorability Engine */}
      {activeTab === "memorability" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">
                Memorability Engine Breakdown
              </h3>
              <p className="text-xs text-zinc-400">
                Evaluating whether your audience will recall your core message tomorrow morning.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-amber-400 font-mono">
                {report.memorabilityAnalysis.score.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-400 block">/ 10 Memorability Score</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Opening Strength & Hook
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                {report.memorabilityAnalysis.openingStrength}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Core Idea Timing
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                {report.memorabilityAnalysis.coreIdeaTiming}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Sensory / Mental Image Created
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                {report.memorabilityAnalysis.mentalImageCreated}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Audience Reason To Care
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                {report.memorabilityAnalysis.reasonToCare}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-zinc-900 border border-indigo-700/50 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Concrete Improvement to Double Retention:
            </h4>
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">
              "{report.memorabilityAnalysis.concreteImprovement}"
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Storytelling Engine */}
      {activeTab === "storytelling" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">
                Storytelling Architecture
              </h3>
              <p className="text-xs text-zinc-400">
                Analyzed natural narrative arc, tension curve, and visual turning points.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-400 font-mono">
                {report.storytellingAnalysis.score.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-400 block">/ 10 Story Score</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Identified Natural Structure:
            </span>
            <p className="text-sm font-semibold text-indigo-300">
              {report.storytellingAnalysis.structureDetected}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Hook & Initial Curiosity
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                {report.storytellingAnalysis.hookEvaluation}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Tension & Conflict Movement
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                {report.storytellingAnalysis.tensionAndConflict}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                The Turning Point
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                {report.storytellingAnalysis.turningPoint}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Payoff & Ending
              </span>
              <p className="text-xs sm:text-sm text-zinc-300">
                {report.storytellingAnalysis.payoffAndEnding}
              </p>
            </div>
          </div>

          {report.storytellingAnalysis.feedbackNotes?.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Specific Story Craft Observations:
              </h4>
              <ul className="space-y-2">
                {report.storytellingAnalysis.feedbackNotes.map((note, i) => (
                  <li key={i} className="text-xs sm:text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Wit & Lightness Engine */}
      {activeTab === "wit" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Wit & Lightness Engine
              </h3>
              <p className="text-xs text-zinc-400">
                Teaching the exact rhetorical mechanics of wit: Serious → Light → Serious.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-amber-400 font-mono">
                {report.witAnalysis.score.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-400 block">/ 10 Wit Score</span>
            </div>
          </div>

          {/* Lightness Balance Overview */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Serious vs. Light Flow Balance:
            </span>
            <p className="text-xs sm:text-sm text-zinc-300">
              {report.witAnalysis.lightnessBalance}
            </p>
          </div>

          {/* Detected Wit Moments & Mechanisms */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Wit Mechanics Identified:
            </h4>
            {report.witAnalysis.witMoments?.length > 0 ? (
              <div className="space-y-4">
                {report.witAnalysis.witMoments.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-gradient-to-r from-zinc-950 to-zinc-900 border border-amber-600/40 space-y-3 shadow-md"
                  >
                    <blockquote className="italic text-xs sm:text-sm text-zinc-200 font-medium">
                      "{m.userQuote}"
                    </blockquote>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                        <span className="text-[10px] font-bold uppercase text-amber-400 block">
                          Technique:
                        </span>
                        <span className="text-zinc-200 font-semibold">{m.witTechnique}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 sm:col-span-2">
                        <span className="text-[10px] font-bold uppercase text-indigo-400 block">
                          Why It Works:
                        </span>
                        <span className="text-zinc-300">{m.whyItWorks}</span>
                      </div>
                    </div>

                    <div className="text-xs text-amber-300/90 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Delivery / Timing Tip: {m.deliveryTip}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                No overt wit techniques detected in this passage. Wit is about observational contrast and timing rather than clowning.
              </div>
            )}
          </div>

          {/* Missed Opportunity to Lighten */}
          <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Where Natural Wit Could Have Relieved Tension:
            </span>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              {report.witAnalysis.opportunityToLighten}
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Communication Corrections (Distinguishing Critical, Useful, Stylistic) */}
      {activeTab === "corrections" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">
                Communication Improvements
              </h3>
              <p className="text-xs text-zinc-400">
                Preserving your authentic voice and natural vocabulary while maximizing persuasion.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              {(["all", "critical", "useful", "stylistic"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCorrectionFilter(cat)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                    correctionFilter === cat
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of Corrections */}
          <div className="space-y-4">
            {filteredCorrections.length > 0 ? (
              filteredCorrections.map((corr, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        corr.category === "critical"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : corr.category === "useful"
                          ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                          : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {corr.category} correction
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                        What you said:
                      </span>
                      "{corr.originalQuote}"
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-200">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-0.5">
                        Clearer / More Memorable Version:
                      </span>
                      "{corr.improvedVersion}"
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                    <strong className="text-indigo-400">Why this works:</strong> {corr.whyItWorks}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 text-center py-6">
                No corrections in this category.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Delivery & Pacing */}
      {activeTab === "delivery" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">
                Delivery, Rhythm & Physical Presence
              </h3>
              <p className="text-xs text-zinc-400">
                Speed of speech, tactical pauses, vocal energy, and posture telemetry.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-400 font-mono">
                {report.scores.delivery.toFixed(1)}
              </span>
              <span className="text-xs text-zinc-400 block">/ 10 Delivery Score</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Words Per Minute
              </span>
              <p className="text-xl font-bold font-mono text-zinc-100">
                {report.metrics.wpm} WPM
              </p>
              <p className="text-xs text-zinc-400">{report.deliveryAnalysis.pacingAssessment}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Filler Softener Frequency
              </span>
              <p className="text-xl font-bold font-mono text-amber-400">
                {report.metrics.fillersPerMinute} / min
              </p>
              <p className="text-xs text-zinc-400">{report.deliveryAnalysis.fillerAssessment}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Strategic Pauses
              </span>
              <p className="text-xl font-bold font-mono text-emerald-400">
                {report.metrics.pauseCount} pauses
              </p>
              <p className="text-xs text-zinc-400">{report.deliveryAnalysis.pauseEffectiveness}</p>
            </div>
          </div>

          {/* Full Transcript Review */}
          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Session Transcript:
            </h4>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-60 overflow-y-auto">
              {report.transcript}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
