import React, { useState } from "react";
import { ScenarioChallenge } from "../types";
import {
  BookOpen,
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Target,
  Zap,
} from "lucide-react";

interface StoryLabProps {
  onSelectStoryDrill: (scenario: ScenarioChallenge) => void;
}

export const StoryLab: React.FC<StoryLabProps> = ({ onSelectStoryDrill }) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const storyPillars = [
    { title: "Hook", desc: "Arrive in media res. Give reason to care in first 6 seconds." },
    { title: "Context", desc: "Keep background minimal. Don't build a 45-second runway." },
    { title: "Curiosity", desc: "Open a knowledge gap the audience aches to close." },
    { title: "Character", desc: "Human stakes, internal motivations, flawed desires." },
    { title: "Conflict", desc: "Opposing forces creating irreversible friction." },
    { title: "Tension", desc: "Stretching the unresolved moment before the outcome." },
    { title: "Emotional Shift", desc: "Movement from one emotional state to another." },
    { title: "Sensory Detail", desc: "One tactile visual image people can see, hear, or smell." },
    { title: "Turning Point", desc: "The irreversible fulcrum where everything changes." },
    { title: "Surprise", desc: "Reversing expectation without feeling cheap." },
    { title: "Payoff", desc: "Resolving the tension with emotional resonance." },
    { title: "Ending", desc: "Ending on an image or feeling rather than lecturing the moral." },
  ];

  const storyDrills: ScenarioChallenge[] = [
    {
      id: "story-lvl1-30s",
      title: "Level 1: The Sudden 30-Second Incident",
      category: "storytelling",
      difficultyLevel: 1,
      audienceDescription: "A group of colleagues having coffee who have 30 seconds to spare",
      objective: "Hook the listener immediately and deliver a single turning point",
      scenarioPrompt: "Tell a real or hypothetical 30-second story about a day an unexpected error occurred. Start directly at the peak of the crisis—no intro.",
      targetDurationSeconds: 30,
      constraints: ["No runway sentences like 'So I was working on...'", "Must feature 1 sensory detail"],
      coachTip: "Throw the listener directly into the burning room.",
    },
    {
      id: "story-lvl2-15s",
      title: "Level 2: The 15-Second Compression Blitz",
      category: "storytelling",
      difficultyLevel: 2,
      audienceDescription: "An executive in an elevator stepping out on the 4th floor",
      objective: "Compress a complete narrative (Hook → Incident → Payoff) into 15 seconds",
      scenarioPrompt: "Take your story from Level 1 and distill it into exactly 15 seconds without losing the sensory punch.",
      targetDurationSeconds: 15,
      constraints: ["Under 40 words total", "Must preserve the turning point"],
      coachTip: "Ruthlessly cut adjective fat. Verbs carry velocity.",
    },
    {
      id: "story-lvl3-emotion",
      title: "Level 3: The High-Emotion Turning Point",
      category: "storytelling",
      difficultyLevel: 3,
      audienceDescription: "A theater of founders seeking raw, authentic leadership lessons",
      objective: "Narrate an emotional crisis where the turning point creates genuine vulnerability",
      scenarioPrompt: "Tell a 60-second story about a personal or professional failure where your assumptions were shattered.",
      targetDurationSeconds: 60,
      constraints: ["Reveal the emotional impact before the technical resolution", "End on a vivid silent pause"],
      coachTip: "Vulnerability is not oversharing; it is precision about how defeat felt.",
    },
    {
      id: "story-lvl4-technical",
      title: "Level 4: Technical Storytelling for Engineers",
      category: "storytelling",
      difficultyLevel: 4,
      audienceDescription: "A team of senior backend engineers who hate corporate fluff",
      objective: "Narrate a technical architecture breakthrough through the lens of a detective story",
      scenarioPrompt: "Explain how a stubborn memory leak or concurrency deadlock was diagnosed at 2 AM using narrative curiosity.",
      targetDurationSeconds: 60,
      constraints: ["Frame the bug as the antagonist", "Show the deductive reasoning step-by-step"],
      coachTip: "Debugging is the purest form of mystery fiction.",
    },
    {
      id: "story-lvl5-nontechnical",
      title: "Level 5: Explaining Complexity to Non-Technical Audiences",
      category: "storytelling",
      difficultyLevel: 5,
      audienceDescription: "A board of directors or city officials who don't know what an API is",
      objective: "Translate a complex technical crisis into human, financial, or operational stakes",
      scenarioPrompt: "Explain why your system crashed without using any jargon—using purely human analogies.",
      targetDurationSeconds: 60,
      constraints: ["Zero acronyms", "Use one extended physical analogy"],
      coachTip: "If they can't picture it in their kitchen, they won't remember it.",
    },
    {
      id: "story-lvl6-interruption",
      title: "Level 6: Storytelling Under Interruption & Skepticism",
      category: "storytelling",
      difficultyLevel: 6,
      audienceDescription: "An impatient investor interrupting: 'Get to the bottom line, why does this matter?'",
      objective: "Hold narrative composure, acknowledge the objection in 3 seconds, and land the punchline",
      scenarioPrompt: "Deliver a high-stakes customer story while directly addressing the skeptic in the room.",
      targetDurationSeconds: 90,
      constraints: ["No defensive tone", "Integrate the interruption into the story's climax"],
      coachTip: "Use the opponent's momentum like aikido.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Dedicated Narrative Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Story Lab: Crafting Irresistible Narrative Tension
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          The highest-leverage speaking skill in human history. We don't teach generic templates—we train you to find the natural hook, tension, and turning point in your real experiences.
        </p>
      </div>

      {/* The 12 Story Architecture Pillars Grid */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            The 12 Narrative Anatomy Pillars
          </h2>
          <span className="text-xs text-zinc-400">Vocalis Story Diagnosis Model</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {storyPillars.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1 hover:border-indigo-700/60 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-950 text-indigo-400 text-[10px] font-bold flex items-center justify-center border border-indigo-800">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-zinc-200">{p.title}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progressive Difficulty Level Drills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            Progressive Storytelling Challenges
          </h2>
          <span className="text-xs text-zinc-400">Choose a level to practice live</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {storyDrills.map((drill) => (
            <div
              key={drill.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-indigo-600/70 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Level {drill.difficultyLevel}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {drill.targetDurationSeconds}s target
                  </span>
                </div>

                <h3 className="font-bold text-base text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  {drill.title}
                </h3>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {drill.scenarioPrompt}
                </p>

                <div className="pt-1 text-[11px] text-zinc-400">
                  <strong className="text-zinc-300">Audience:</strong> {drill.audienceDescription}
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-amber-300/90 italic">
                  💡 Coach Tip: {drill.coachTip}
                </div>
              </div>

              <button
                onClick={() => onSelectStoryDrill(drill)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-indigo-600 text-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Launch in Live Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
