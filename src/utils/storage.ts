import { UserProfile, SessionReport, ScenarioChallenge } from "../types";

const PROFILE_KEY = "vocalis_user_profile_v1";
const SESSIONS_KEY = "vocalis_sessions_history_v1";

export const DEFAULT_PROFILE: UserProfile = {
  name: "Speaker",
  speakingGoals: [
    "Make stories compelling from the very first sentence",
    "Eliminate hedging softeners without sounding robotic",
    "Infuse natural lightness and wit into serious technical pitches",
    "Keep skeptical audiences engaged throughout",
  ],
  recurringWeaknesses: [
    {
      weakness: "Delayed Hook (context given before reason to care)",
      occurrences: 3,
      lastNoted: "2026-09-10",
      resolved: false,
    },
    {
      weakness: "Abstract endings instead of emotional or visual payoff",
      occurrences: 2,
      lastNoted: "2026-09-11",
      resolved: false,
    },
  ],
  naturalStrengths: [
    "Vivid analogies when explaining complex concepts",
    "Warm, conversational vocal inflection",
    "Great self-awareness during unscripted Q&A",
  ],
  distinctiveVoiceDescription: "Reflective, intellectually curious, with natural conversational warmth. High potential for sharp observational wit.",
  bestScores: {
    overall: 8.2,
    communication: 8.4,
    storytelling: 8.0,
    wit: 7.6,
    engagement: 8.5,
    delivery: 8.2,
    memorability: 8.1,
  },
  averageScores: {
    overall: 7.2,
    communication: 7.5,
    storytelling: 6.9,
    wit: 6.5,
    engagement: 7.4,
    delivery: 7.1,
    memorability: 6.8,
  },
  sessionsCompleted: 4,
  preferredCoachingLanguage: "English",
  preferredSpokenLanguage: "English",
  preferredMode: "gentle",
};

export const STARTER_SCENARIOS: ScenarioChallenge[] = [
  {
    id: "story-hook-30s",
    title: "The 30-Second Sudden Hook",
    category: "storytelling",
    difficultyLevel: 1,
    audienceDescription: "An impatient dinner guest checking their phone",
    objective: "Make the listener look up within the first 6 seconds",
    scenarioPrompt: "Tell a real or imagined 30-second story about a moment everything went completely sideways. Start directly in the middle of the action—zero backstory.",
    targetDurationSeconds: 30,
    constraints: ["No 'So basically...', no 'It was a normal day when...'", "Must feature a sensory detail (sound, smell, or visual) in the first 10 seconds"],
    coachTip: "Don't build a runway. Throw the listener straight into the turbulence.",
  },
  {
    id: "pitch-skeptical-judge",
    title: "The Skeptical Hackathon Judge",
    category: "pitch",
    difficultyLevel: 3,
    audienceDescription: "A weary technical director who has heard 40 pitches today",
    objective: "Convince them your solution solves an acute, real pain point without hype",
    scenarioPrompt: "Pitch your software project or AI product in 60 seconds. Address the single most obvious doubt before they even ask it.",
    targetDurationSeconds: 60,
    constraints: ["No corporate buzzwords (synergy, revolutionize, paradigm shift)", "Must state Problem -> Real Incident -> Specific Fix"],
    coachTip: "Skeptical judges respect vulnerability and precision over grand proclamations.",
  },
  {
    id: "explain-12yo-ai",
    title: "Explain Transformers to a 12-Year-Old",
    category: "technical_explanation",
    difficultyLevel: 2,
    audienceDescription: "A smart, curious 7th grader who plays Minecraft",
    objective: "Explain how large language models predict the next word using a tactile analogy",
    scenarioPrompt: "Explain how AI systems 'understand' and write sentences without using words like 'vector embeddings', 'matrix multiplication', or 'neural network parameters'.",
    targetDurationSeconds: 45,
    constraints: ["Must use a tangible metaphor (e.g. detective, autocomplete game, recipe book)", "End with a thought-provoking question to the kid"],
    coachTip: "If you can't explain it simply, you haven't decided what actually matters.",
  },
  {
    id: "wit-serious-light",
    title: "Serious → Light → Serious Transition",
    category: "wit_lab",
    difficultyLevel: 4,
    audienceDescription: "Team members attending a high-stakes post-mortem meeting",
    objective: "Deliver a serious reality check on a recent project failure while using tasteful, controlled wit to alleviate panic",
    scenarioPrompt: "Address a major delay in your team's launch. Acknowledge the gravity, inject one sharp observational twist about human nature/tools, then pivot back to the disciplined execution plan.",
    targetDurationSeconds: 60,
    constraints: ["No random jokes or punchline-setup-giggle rhythm", "Use expectation reversal or gentle understatement"],
    coachTip: "Wit is not entertainment; it is an act of shared relief that re-centers perspective.",
  },
  {
    id: "interview-disagreement",
    title: "The Hostile Question Challenge",
    category: "interview",
    difficultyLevel: 5,
    audienceDescription: "An interviewer asking: 'Isn't your solution just copying existing tools?'",
    objective: "Answer directly, validate the question's premise without defensiveness, and highlight distinct nuance",
    scenarioPrompt: "Respond using the Answer -> Reason -> Example framework in 45 seconds.",
    targetDurationSeconds: 45,
    constraints: ["Never say 'That's a great question'", "Answer must begin with a definitive stance in under 3 seconds"],
    coachTip: "Defensiveness shrinks your status. Calm curiosity expands it.",
  },
];

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save user profile", e);
  }
}

export function loadSessionsHistory(): SessionReport[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveSessionToHistory(session: SessionReport): SessionReport[] {
  try {
    const sessions = loadSessionsHistory();
    const updated = [session, ...sessions.filter((s) => s.id !== session.id)].slice(0, 50);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));

    // Update profile averages
    const profile = loadUserProfile();
    profile.sessionsCompleted += 1;

    // Track recurring weakness
    if (session.oneThingToFix?.rule) {
      const existing = profile.recurringWeaknesses.find(
        (w) => w.weakness.toLowerCase().includes(session.oneThingToFix.rule.toLowerCase().slice(0, 15))
      );
      if (existing) {
        existing.occurrences += 1;
        existing.lastNoted = new Date().toISOString().split("T")[0];
      } else {
        profile.recurringWeaknesses.push({
          weakness: session.oneThingToFix.rule,
          occurrences: 1,
          lastNoted: new Date().toISOString().split("T")[0],
          resolved: false,
        });
      }
    }

    // Update best scores
    (Object.keys(session.scores) as (keyof typeof session.scores)[]).forEach((key) => {
      if (session.scores[key] > (profile.bestScores[key] || 0)) {
        profile.bestScores[key] = session.scores[key];
      }
    });

    saveUserProfile(profile);
    return updated;
  } catch (e) {
    console.error("Failed to save session history", e);
    return loadSessionsHistory();
  }
}

// Convenient aliases for UI consumers
export const getUserProfile = loadUserProfile;
export const getSessionHistory = loadSessionsHistory;
export const saveSessionReport = saveSessionToHistory;

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(PROFILE_KEY);
  } catch (e) {
    console.error("Failed to clear history", e);
  }
}
