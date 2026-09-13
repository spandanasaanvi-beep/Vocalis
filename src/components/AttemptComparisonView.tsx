import React, { useEffect, useState } from "react";
import { SessionReport, AttemptComparison } from "../types";
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Clock,
  Layers,
  Award,
} from "lucide-react";

interface AttemptComparisonViewProps {
  attempt1: SessionReport;
  attempt2: SessionReport;
  onBackToReport: () => void;
  onRetryAgain: () => void;
}

export const AttemptComparisonView: React.FC<AttemptComparisonViewProps> = ({
  attempt1,
  attempt2,
  onBackToReport,
  onRetryAgain,
}) => {
  const [comparison, setComparison] = useState<AttemptComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchComparison() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/coach/compare-attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attempt1: {
              transcript: attempt1.transcript,
              scores: attempt1.scores,
            },
            attempt2: {
              transcript: attempt2.transcript,
              scores: attempt2.scores,
            },
            exercisePrompt: attempt1.title,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setComparison(data);
        }
      } catch (e) {
        console.error("Comparison fetch failed:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchComparison();
  }, [attempt1, attempt2]);

  const deltaOverall = (attempt2.scores.overall - attempt1.scores.overall).toFixed(1);
  const deltaMemorability = (attempt2.scores.memorability - attempt1.scores.memorability).toFixed(1);
  const deltaFillers = attempt1.metrics.fillers.total - attempt2.metrics.fillers.total;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
              Practice Loop Complete
            </span>
            <span className="text-xs text-zinc-400">Before & After Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Attempt 1 vs Attempt 2 Progression
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToReport}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
          >
            Back to Latest Report
          </button>
          <button
            onClick={onRetryAgain}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Attempt 3</span>
          </button>
        </div>
      </div>

      {/* Primary Delta Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-indigo-950/70 border-2 border-emerald-500/50 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Visible Growth Result
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
              {Number(deltaOverall) >= 0 ? `+${deltaOverall} Overall Score Lift` : `${deltaOverall} Score Shift`}
            </h2>
            <p className="text-sm text-zinc-300">
              {comparison?.verdictSummary || "Comparing your before and after delivery..."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-400 uppercase block">Memorability</span>
              <span className={`text-xl font-bold font-mono ${Number(deltaMemorability) >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {Number(deltaMemorability) >= 0 ? `+${deltaMemorability}` : deltaMemorability}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-400 uppercase block">Fillers Cut</span>
              <span className={`text-xl font-bold font-mono ${deltaFillers >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {deltaFillers >= 0 ? `-${deltaFillers}` : `+${Math.abs(deltaFillers)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Applied Golden Rule Check */}
        {comparison && (
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center gap-3 text-xs sm:text-sm">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${comparison.appliedOneThingFeedback ? "text-emerald-400" : "text-amber-400"}`} />
            <div>
              <strong className="text-zinc-200">
                {comparison.appliedOneThingFeedback ? "You successfully applied the One Thing To Fix!" : "Partially applied the target rule:"}
              </strong>
              <p className="text-zinc-400">{attempt1.oneThingToFix?.rule}</p>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Card Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attempt 1 */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Attempt 1 (Original)
            </span>
            <span className="text-lg font-bold text-zinc-300 font-mono">
              Score: {attempt1.scores.overall.toFixed(1)}
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Key Metrics:</span>
              <p className="text-zinc-300">
                Memorability: {attempt1.scores.memorability} | Storytelling: {attempt1.scores.storytelling} | WPM: {attempt1.metrics.wpm} | Fillers: {attempt1.metrics.fillers.total}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Spoken Transcript:</span>
              <p className="p-3.5 rounded-xl bg-zinc-950 text-zinc-300 leading-relaxed italic max-h-48 overflow-y-auto">
                "{attempt1.transcript}"
              </p>
            </div>
          </div>
        </div>

        {/* Attempt 2 */}
        <div className="bg-zinc-900/90 border border-indigo-700/60 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Attempt 2 (With Target Fix)
            </span>
            <span className="text-lg font-bold text-indigo-300 font-mono">
              Score: {attempt2.scores.overall.toFixed(1)}
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Key Metrics:</span>
              <p className="text-zinc-200 font-medium">
                Memorability: {attempt2.scores.memorability} | Storytelling: {attempt2.scores.storytelling} | WPM: {attempt2.metrics.wpm} | Fillers: {attempt2.metrics.fillers.total}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Spoken Transcript:</span>
              <p className="p-3.5 rounded-xl bg-zinc-950 text-indigo-100 leading-relaxed italic max-h-48 overflow-y-auto border border-indigo-900/50">
                "{attempt2.transcript}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Improvements Identified */}
      {comparison && comparison.keyImprovements?.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            What Directly Improved Between Attempts:
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comparison.keyImprovements.map((imp, i) => (
              <li key={i} className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-900/40 text-xs sm:text-sm text-zinc-200 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
