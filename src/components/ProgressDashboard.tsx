import React from "react";
import { UserProfile, SessionReport } from "../types";
import {
  BarChart3,
  Award,
  Clock,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Flame,
  Layers,
} from "lucide-react";

interface ProgressDashboardProps {
  userProfile: UserProfile;
  sessionHistory: SessionReport[];
  onSelectSession: (session: SessionReport) => void;
  onRetrySession: (session: SessionReport) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  userProfile,
  sessionHistory,
  onSelectSession,
  onRetrySession,
}) => {
  const totalSpeakingMins = Math.round(
    sessionHistory.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
  );

  const avgOverall = sessionHistory.length
    ? (
        sessionHistory.reduce((acc, s) => acc + s.scores.overall, 0) /
        sessionHistory.length
      ).toFixed(1)
    : "0.0";

  const competencies = [
    { name: "Memorability", score: userProfile.bestScores.memorability, target: 8.5 },
    { name: "Storytelling", score: userProfile.bestScores.storytelling, target: 8.5 },
    { name: "Wit & Lightness", score: userProfile.bestScores.wit, target: 8.0 },
    { name: "Delivery Pacing", score: userProfile.bestScores.delivery, target: 9.0 },
    { name: "Communication Clarity", score: userProfile.bestScores.communication, target: 9.0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Performance Intelligence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Speaking Progression & Skill Profile
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Tracking your evolution into someone people remember listening to.
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Total Sessions
          </span>
          <p className="text-2xl sm:text-3xl font-black text-zinc-100 font-mono">
            {sessionHistory.length}
          </p>
          <span className="text-[11px] text-indigo-400">Practiced drills</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Speaking Time
          </span>
          <p className="text-2xl sm:text-3xl font-black text-zinc-100 font-mono">
            {totalSpeakingMins} <span className="text-sm font-normal text-zinc-400">mins</span>
          </p>
          <span className="text-[11px] text-zinc-400">Total studio runtime</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Average Score
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {avgOverall}
          </p>
          <span className="text-[11px] text-zinc-400">Across all sessions</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Peak Memorability
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {userProfile.bestScores.memorability.toFixed(1)}
          </p>
          <span className="text-[11px] text-emerald-400">Best performance</span>
        </div>
      </div>

      {/* Competency Mastery Bars */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Mastery Breakdown by Pillar
        </h2>

        <div className="space-y-4">
          {competencies.map((c, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-zinc-200">{c.name}</span>
                <span className="font-mono text-zinc-400">
                  <strong className="text-zinc-100">{c.score.toFixed(1)}</strong> / 10
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (c.score / 10) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recurring Weakness Monitor */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Recurring Weakness Watchlist
          </h2>
          <span className="text-xs text-zinc-400">Auto-detected speech habits</span>
        </div>

        {userProfile.recurringWeaknesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userProfile.recurringWeaknesses.map((rw, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-200">{rw.weakness}</p>
                  <p className="text-[11px] text-zinc-400">
                    Flagged in {rw.occurrences} sessions • Last noticed{" "}
                    {new Date(rw.lastNoted).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/60 shrink-0">
                  Watch
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            No recurring weaknesses detected yet. Keep practicing in Live Studio!
          </p>
        )}
      </div>

      {/* Session Vault / Recent History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          Recent Session Reports ({sessionHistory.length})
        </h2>

        {sessionHistory.length > 0 ? (
          <div className="space-y-3">
            {sessionHistory.map((sess) => (
              <div
                key={sess.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                      Attempt {sess.attemptNumber || 1} • {sess.category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(sess.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                    {sess.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {sess.oneThingToFix?.rule || sess.executiveSummary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-indigo-400">
                      {sess.scores.overall.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">Overall Score</span>
                  </div>

                  <button
                    onClick={() => onSelectSession(sess)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                  >
                    View Diagnosis
                  </button>

                  <button
                    onClick={() => onRetrySession(sess)}
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
                    title="Retry Exercise"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
            <p className="text-sm font-semibold text-zinc-300">No sessions recorded yet</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Jump into the Live Studio and deliver your first story or presentation. Your reports and retry progressions will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
