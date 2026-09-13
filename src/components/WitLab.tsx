import React, { useState } from "react";
import { ScenarioChallenge } from "../types";
import {
  Sparkles,
  Smile,
  ArrowRight,
  Lightbulb,
  Clock,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";

interface WitLabProps {
  onStartWitPractice: (scenario: ScenarioChallenge) => void;
}

export const WitLab: React.FC<WitLabProps> = ({ onStartWitPractice }) => {
  const [selectedTechniqueIndex, setSelectedTechniqueIndex] = useState(0);

  const witTechniques = [
    {
      name: "Expectation Reversal",
      tagline: "Set up an inevitable mental direction, then pivot to an unexpected truth.",
      seriousTopic: "Managing Software Technical Debt",
      dryVersion: "We have accrued a lot of technical debt over the last three quarters and it is slowing down our engineering velocity.",
      wittyVersion: "We spent six months borrowing against our architectural future. The good news is the loan was approved. The bad news is the interest is due tomorrow at 9 AM.",
      mechanism: "Financial metaphor + abrupt compression of abstract risk into a concrete, alarming appointment.",
      deliveryTip: "Pause for one beat right before 'The bad news is...'",
    },
    {
      name: "Controlled Self-Deprecation",
      tagline: "Lower your own ego slightly to raise audience comfort, then immediately pivot back to authority.",
      seriousTopic: "AI Agent Autonomy",
      dryVersion: "AI models sometimes hallucinate and make erroneous predictions when edge cases occur.",
      wittyVersion: "Our AI agent is extraordinarily confident. In fact, it is occasionally 100% certain about things that have never happened on this planet.",
      mechanism: "Replaces the sterile term 'hallucination' with human personality trait ('confident arrogance') that the audience recognizes.",
      deliveryTip: "Speak with a deadpan, warm tone. Never laugh at your own line.",
    },
    {
      name: "Tactile Analogy (Contrast)",
      tagline: "Compare an invisible abstract system to a ridiculous physical equivalent.",
      seriousTopic: "Cybersecurity & Passwords",
      dryVersion: "Writing passwords on sticky notes poses a severe vulnerability to network security.",
      wittyVersion: "Writing your database password on a Post-it note attached to your monitor is the corporate equivalent of locking your front door and leaving the key taped to the doorbell.",
      mechanism: "Visual juxtaposition of high-tech security defense vs. primitive physical negligence.",
      deliveryTip: "Emphasize 'taped to the doorbell' with crisp enunciation.",
    },
    {
      name: "Understatement (The Monotone Twist)",
      tagline: "Describe a catastrophic failure with deliberate, calm clinical precision.",
      seriousTopic: "Server Outage / Cloud Crash",
      dryVersion: "Our load balancers failed, all traffic dropped, and customers were furious.",
      wittyVersion: "Our load balancer decided to take an unscheduled sabbatical during Black Friday peak traffic.",
      mechanism: "Personification of automated infrastructure taking a leisurely vacation.",
      deliveryTip: "Keep your facial expression completely calm and focused on the solution.",
    },
  ];

  const currentTechnique = witTechniques[selectedTechniqueIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-violet-600 flex items-center justify-center text-zinc-950 font-black">
            <Sparkles className="w-5 h-5 fill-zinc-950" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            The Wit & Lightness Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          The Rhetorical Mechanics of Wit
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Wit is NOT telling random jokes. It is the art of injecting shared perspective into serious moments:{" "}
          <strong className="text-amber-300">SERIOUS → LIGHT → SERIOUS</strong>.
        </p>
      </div>

      {/* Core Principle Banner */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2 shadow-lg">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
          The Anti-Clown Rule
        </span>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          If you force a joke, you lose credibility. But if you describe reality with unexpected precision, timing, and contrast, the room relaxes without losing respect for your authority.
        </p>
      </div>

      {/* Interactive Anatomy Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-800 pb-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Study the Anatomy of 4 Master Wit Techniques
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {witTechniques.map((tech, i) => (
              <button
                key={i}
                onClick={() => setSelectedTechniqueIndex(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTechniqueIndex === i
                    ? "bg-amber-500 text-zinc-950 shadow-md"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tech.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Technique Deep Dive Card */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              Topic: {currentTechnique.seriousTopic}
            </span>
            <h3 className="text-xl font-bold text-zinc-100">
              {currentTechnique.name}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              {currentTechnique.tagline}
            </p>
          </div>

          {/* Side by side Before (Dry) vs After (Witty) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                Standard Dry Delivery (Forgettable):
              </span>
              <p className="text-xs sm:text-sm text-zinc-400 italic leading-relaxed">
                "{currentTechnique.dryVersion}"
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">
                Vocalis Witty Transformation (Memorable):
              </span>
              <p className="text-xs sm:text-sm text-amber-100 font-medium italic leading-relaxed">
                "{currentTechnique.wittyVersion}"
              </p>
            </div>
          </div>

          {/* The Mechanism Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-indigo-400 block">
                The Rhetorical Mechanism:
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {currentTechnique.mechanism}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">
                Physical Delivery & Timing:
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {currentTechnique.deliveryTip}
              </p>
            </div>
          </div>

          {/* Launch Practice Drill */}
          <div className="pt-2">
            <button
              onClick={() => {
                onStartWitPractice({
                  id: `wit_${Date.now()}`,
                  title: `Wit Drill: ${currentTechnique.name}`,
                  category: "wit_lab",
                  difficultyLevel: 3,
                  audienceDescription: "A serious corporate or technical audience",
                  objective: `Explain ${currentTechnique.seriousTopic} using ${currentTechnique.name} without clowning`,
                  scenarioPrompt: `Address the topic "${currentTechnique.seriousTopic}". Begin serious, introduce one moment of tasteful ${currentTechnique.name}, then pivot immediately back to disciplined execution.`,
                  targetDurationSeconds: 45,
                  constraints: ["No forced jokes", "SERIOUS → LIGHT → SERIOUS cadence"],
                  coachTip: currentTechnique.deliveryTip,
                });
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Practice This Technique Live in Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
