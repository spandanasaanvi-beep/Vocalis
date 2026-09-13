export type CoachingMode = "silent" | "gentle" | "active" | "presentation";

export type SessionCategory =
  | "storytelling"
  | "public_speaking"
  | "pitch"
  | "interview"
  | "wit_lab"
  | "technical_explanation"
  | "casual"
  | "response_training";

export interface FillerStats {
  um: number;
  uh: number;
  like: number;
  basically: number;
  actually: number;
  youKnow: number;
  so: number;
  total: number;
}

export interface LiveDeliveryMetrics {
  wpm: number;
  fillers: FillerStats;
  fillersPerMinute: number;
  pauseCount: number;
  longestPauseSeconds: number;
  speakingTimeSeconds: number;
  eyeContactPercentage: number;
  gestureActivity: "low" | "moderate" | "expressive";
  postureState: "upright" | "slouched" | "tense";
}

export interface LiveNudge {
  id: string;
  timestamp: number;
  text: string;
  type: "pacing" | "storytelling" | "filler" | "engagement" | "pause" | "wit";
  urgency: "low" | "medium" | "high";
}

export interface WitMoment {
  userQuote: string;
  witTechnique: string;
  whyItWorks: string;
  deliveryTip: string;
}

export interface CommunicationCorrection {
  category: "critical" | "useful" | "stylistic";
  originalQuote: string;
  improvedVersion: string;
  whyItWorks: string;
  personalityPreserved?: string;
}

export interface MemorabilityReport {
  score: number;
  openingStrength: string;
  coreIdeaTiming: string;
  mentalImageCreated: string;
  reasonToCare: string;
  strength: string;
  weakness: string;
  concreteImprovement: string;
}

export interface StorytellingReport {
  score: number;
  structureDetected: string;
  hookEvaluation: string;
  tensionAndConflict: string;
  turningPoint: string;
  payoffAndEnding: string;
  feedbackNotes: string[];
}

export interface WitReport {
  score: number;
  witMoments: WitMoment[];
  lightnessBalance: string;
  opportunityToLighten: string;
}

export interface EngagementReport {
  score: number;
  momentumCurve: string;
  audienceRetentionRisk: string;
  energyObservation: string;
}

export interface DeliveryReport {
  score: number;
  pacingAssessment: string;
  pauseEffectiveness: string;
  fillerAssessment: string;
  visualPostureFeedback?: string;
}

export interface OneThingToFix {
  rule: string;
  whyCrucial: string;
  howToApplyImmediately: string;
}

export interface NextExercise {
  title: string;
  difficultyLevel: number;
  prompt: string;
  durationSeconds: number;
  targetFocus: string;
}

export interface SessionScores {
  overall: number;
  communication: number;
  storytelling: number;
  wit: number;
  engagement: number;
  delivery: number;
  memorability: number;
}

export interface SessionReport {
  id: string;
  createdAt: string;
  title: string;
  category: SessionCategory;
  mode: CoachingMode;
  durationSeconds: number;
  transcript: string;
  attemptNumber: number;
  parentSessionId?: string; // for comparison
  metrics: LiveDeliveryMetrics;
  scores: SessionScores;
  executiveSummary: string;
  strongestMoment: {
    quote: string;
    why: string;
    impact?: string;
  };
  weakestMoment: {
    quote: string;
    why: string;
    fix: string;
  };
  memorabilityAnalysis: MemorabilityReport;
  storytellingAnalysis: StorytellingReport;
  witAnalysis: WitReport;
  communicationCorrections: CommunicationCorrection[];
  engagementAnalysis: EngagementReport;
  deliveryAnalysis: DeliveryReport;
  oneThingToFix: OneThingToFix;
  nextExercise: NextExercise;
  personalStyleInsights: {
    naturalStrengths: string[];
    distinctiveVoice: string;
    recurringWeaknessIdentified?: string;
  };
}

export interface AttemptComparison {
  verdictSummary: string;
  deltaScore: number;
  keyImprovements: string[];
  whatStillNeedsWork: string;
  appliedOneThingFeedback: boolean;
  coachPraiseWithWit?: string;
}

export interface UserProfile {
  name: string;
  speakingGoals: string[];
  recurringWeaknesses: {
    weakness: string;
    occurrences: number;
    lastNoted: string;
    resolved: boolean;
  }[];
  naturalStrengths: string[];
  distinctiveVoiceDescription: string;
  bestScores: SessionScores;
  averageScores: SessionScores;
  sessionsCompleted: number;
  preferredCoachingLanguage: string;
  preferredSpokenLanguage: string;
  preferredMode: CoachingMode;
}

export interface ScenarioChallenge {
  id: string;
  title: string;
  category: SessionCategory;
  difficultyLevel: number;
  audienceDescription: string;
  objective: string;
  scenarioPrompt: string;
  targetDurationSeconds: number;
  constraints: string[];
  coachTip: string;
}
