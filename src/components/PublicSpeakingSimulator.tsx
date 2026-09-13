import React, { useState } from "react";
import { ScenarioChallenge } from "../types";
import { STARTER_SCENARIOS } from "../utils/storage";
import {
  Flame,
  Sparkles,
  ArrowRight,
  Clock,
  Shuffle,
  ShieldAlert,
  HelpCircle,
  Layers,
  CheckCircle2,
  Users,
} from "lucide-react";

interface PublicSpeakingSimulatorProps {
  onSelectScenario: (scenario: ScenarioChallenge) => void;
}

export const PublicSpeakingSimulator: React.FC<PublicSpeakingSimulatorProps> = ({
  onSelectScenario,
}) => {
  const [scenarios, setScenarios] = useState<ScenarioChallenge[]>(STARTER_SCENARIOS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customCategory, setCustomCategory] = useState<string>("pitch");
  const [difficulty, setDifficulty] = useState<number>(3);

  // Response Structures
  const frameworks = [
    { name: "Answer → Reason → Example", desc: "Best for direct high-pressure Q&A and skeptical judges" },
    { name: "Point → Explanation → Evidence", desc: "Best for technical justifications and executive updates" },
    { name: "Claim → Story → Lesson", desc: "Best for keynote speeches and inspirational addresses" },
    { name: "Problem → Insight → Solution", desc: "Best for product pitches and hackathon presentations" },
  ];

  const handleGenerateCustomScenario = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/coach/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: customCategory,
          difficultyLevel: difficulty,
          userWeakness: "delayed hook and abstract endings",
        }),
      });

      if (res.ok) {
        const newScenario: ScenarioChallenge = {
          id: `dyn_${Date.now()}`,
          ...(await res.json()),
        };
        setScenarios((prev) => [newScenario, ...prev]);
        onSelectScenario(newScenario);
      }
    } catch (e) {
      console.error("Failed to generate scenario", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            High-Stakes Speaking Simulator
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Realistic Pressure Scenarios
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Train under real human constraints: impatient judges, hostile questioners, confused 12-year-olds, and 60-second elevator rides.
        </p>
      </div>

      {/* Response Frameworks reference card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-3 shadow-lg">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Recommended Mental Architectures for Answers:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {frameworks.map((fw, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
              <span className="text-xs font-bold text-indigo-300 block">{fw.name}</span>
              <p className="text-[11px] text-zinc-400">{fw.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Scenario Generator Bar */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-zinc-900 to-zinc-900 border border-indigo-700/60 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Generate Custom AI Scenario on the Fly
            </h3>
            <p className="text-xs text-zinc-400">
              Vocalis designs tailored, high-pressure constraints matching your exact target difficulty.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="pitch">Hackathon Pitch</option>
              <option value="interview">Skeptical Interviewer</option>
              <option value="technical_explanation">Complex Concept to Layman</option>
              <option value="spontaneous">Impromptu 2-Minute Speech</option>
              <option value="storytelling">Hostile Q&A Handling</option>
            </select>

            <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-300">
              <span>Diff:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="bg-transparent text-indigo-400 font-bold focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-zinc-950">
                    Lvl {lvl}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateCustomScenario}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? "Synthesizing Scenario..." : "Generate & Practice"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Realistic Speaking Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map((scen) => (
          <div
            key={scen.id}
            className="bg-zinc-900 border border-zinc-800 hover:border-indigo-600/70 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Level {scen.difficultyLevel} • {scen.category}
                </span>
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {scen.targetDurationSeconds}s
                </span>
              </div>

              <h3 className="font-bold text-base text-zinc-100">
                {scen.title}
              </h3>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {scen.scenarioPrompt}
              </p>

              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1 text-xs">
                <div className="text-zinc-400">
                  <strong className="text-zinc-200">Target Audience:</strong> {scen.audienceDescription}
                </div>
                <div className="text-zinc-400">
                  <strong className="text-zinc-200">Objective:</strong> {scen.objective}
                </div>
              </div>

              {scen.constraints?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Constraints:
                  </span>
                  <ul className="text-[11px] text-zinc-400 space-y-0.5">
                    {scen.constraints.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectScenario(scen)}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-indigo-600 text-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <span>Take Challenge in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
