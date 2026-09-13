import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";

export const apiRouter = express.Router();

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
export function getAi(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI service configuration is missing on the server."
    );
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient multi-model generation with automatic failover
async function generateWithFallback(
  ai: GoogleGenAI,
  params: { contents: any; config?: any }
) {
  const models = ["gemini-3.8-flash", "gemini-3.6-flash"];
  let lastErr: any;
  for (const model of models) {
    try {
      return await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
    } catch (err: any) {
      lastErr = err;
      continue;
    }
  }
  throw lastErr;
}

// Health check endpoint - returns only { status: "ok" } without exposing secrets or config details
apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

/**
 * 1. LIVE NUDGE
 * Real-time low-latency intervention based on coaching mode and recent speech window
 */
apiRouter.post("/coach/live-nudge", async (req: Request, res: Response) => {
  try {
    const {
      recentTranscript,
      fullTranscriptSoFar,
      mode, // "silent" | "gentle" | "active" | "presentation"
      purpose,
      wpm,
      fillerCount,
      secondsElapsed,
      recurringWeaknesses = [],
    } = req.body;

    if (!recentTranscript || recentTranscript.trim().length < 15) {
      return res.json({ nudge: null, reason: "Transcript too brief" });
    }

    if (mode === "silent" || mode === "presentation") {
      // In silent & presentation mode, we don't interrupt live unless extreme
      return res.json({ nudge: null });
    }

    const ai = getAi();
    const systemPrompt = `You are Vocalis, an elite live communication and storytelling coach.
The speaker is currently speaking live in coaching mode: "${mode}".
Goal/Purpose: "${purpose || "General communication"}".
Pacing: ${wpm || 130} WPM. Fillers in this segment: ${fillerCount || 0}.
Elapsed: ${secondsElapsed || 30}s.
User's known recurring weaknesses: ${recurringWeaknesses.join(", ") || "None yet"}.

MODE RULES:
- "gentle": Intervene ONLY if there is an important momentum, pacing, or storytelling problem. Max 1 short sentence (under 12 words). E.g., "Slow down slightly and let that point land.", "You've given 3 concepts in a row; add a concrete image now.", "Good hook! Now introduce the conflict."
- "active": Give sharp, proactive, high-value micro-guidance. (e.g., "Pause for 2 seconds right here.", "Cut the 'basically'—state the claim with conviction.", "Drop the outcome, make them curious first.")

COACH PERSONALITY:
- Supportive mentor + tasteful wit + brutally honest + natural.
- NEVER sound like a robotic school teacher or generic motivational poster.
- Anti-cringe: Do NOT say "You're doing great! Keep shining!".
- If the current speech is flowing well, return null.

Return JSON with:
{
  "shouldNudge": boolean,
  "nudgeText": string or null,
  "type": "pacing" | "storytelling" | "filler" | "engagement" | "pause" | "wit",
  "urgency": "low" | "medium" | "high"
}`;

    const response = await generateWithFallback(ai, {
      contents: `Recent spoken window:\n"${recentTranscript}"\n\nFull speech context so far:\n"${fullTranscriptSoFar || recentTranscript}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shouldNudge: { type: Type.BOOLEAN },
            nudgeText: { type: Type.STRING },
            type: { type: Type.STRING },
            urgency: { type: Type.STRING },
          },
          required: ["shouldNudge"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in live-nudge:", err?.name || "RequestError");
    return res.status(500).json({ error: "Failed to generate live nudge. Please try again." });
  }
});

/**
 * 2. COMPREHENSIVE SESSION ANALYSIS & COACHING REPORT
 */
apiRouter.post("/coach/session-analysis", async (req: Request, res: Response) => {
  try {
    const {
      transcript,
      durationSeconds,
      metrics = {},
      purpose = "Public Speaking",
      coachingLanguage = "English",
      spokenLanguage = "English",
      profileContext = {},
      scenarioPrompt = "",
      attemptNumber = 1,
    } = req.body;

    if (!transcript || transcript.trim().length < 10) {
      return res.status(400).json({ error: "Transcript is too short to analyze." });
    }

    const ai = getAi();
    const systemPrompt = `You are Vocalis, an elite communication coach, public-speaking trainer, storytelling mentor, and wit coach.
Working Principle: "Don't just tell me what I said wrong. Teach me how to become someone people remember listening to."
Core Principle: YOUR PERSONALITY + BETTER COMMUNICATION, NOT ROBOTIC PERFECT ENGLISH.
Preserve the user's natural cadence, cultural context, authentic individuality, and humor.
Do NOT correct expressive natural phrasing just because it's informal.
Distinguish strictly between:
A. Critical corrections
B. Useful improvements
C. Optional stylistic improvements

CRITICAL ANALYSIS ENGINES TO COMPUTE:
1. STORYTELLING ENGINE: Hook, Context, Curiosity, Character, Conflict, Tension curve, Emotional movement, Specific visual details, Turning point, Surprise, Payoff, Ending, Memorability. Identify the user's natural structure and improve it!
2. MEMORABILITY ENGINE: Was there a strong opening? Did audience have a reason to care? Memorable phrase? Surprising idea? Strong mental image? Analogies? Where did the core idea appear?
3. WIT & LIGHTNESS ENGINE: Teach the exact mechanism of wit (e.g. expectation reversal, observational humor, callback, contrast, analogy, understated punchline, timing/pause). Teach WHY it works!
4. AUDIENCE ENGAGEMENT: Attention pacing, momentum dips, emotional variation, questions, transitions.
5. ONE THING TO FIX: Single highest-leverage improvement to focus on next (do NOT overwhelm with 20 items).
6. NEXT TARGETED EXERCISE: Direct follow-up drill with time limit and clear instructions.

Language requirement: Provide the coaching analysis in: "${coachingLanguage}". Spoken speech was in: "${spokenLanguage}".`;

    const userPrompt = `
Session Metadata:
- Purpose: ${purpose}
- Duration: ${durationSeconds || 60} seconds
- Scenario/Prompt: "${scenarioPrompt || "Open speech practice"}"
- Attempt #: ${attemptNumber}
- Measured Delivery Stats:
  * WPM: ${metrics.wpm || "N/A"}
  * Filler Words: ${JSON.stringify(metrics.fillers || {})}
  * Long Pauses count: ${metrics.pauseCount || 0}
  * Visual/Gaze Attention %: ${metrics.eyeContactPercentage || "N/A"}
  * Gesture Activity Level: ${metrics.gestureActivity || "N/A"}
- Speaker Profile History:
  * Recurring weaknesses: ${JSON.stringify(profileContext.recurringWeaknesses || [])}
  * Prior best scores: ${JSON.stringify(profileContext.bestScores || {})}

FULL SPEECH TRANSCRIPT:
"""
${transcript}
"""

Please produce a comprehensive, insightful, deeply practical coaching diagnosis.`;

    const response = await generateWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: "One punchy paragraph describing the user's overall performance, personality resonance, and impact.",
            },
            strongestMoment: {
              type: Type.OBJECT,
              properties: {
                quote: { type: Type.STRING },
                why: { type: Type.STRING },
                impact: { type: Type.STRING },
              },
              required: ["quote", "why"],
            },
            weakestMoment: {
              type: Type.OBJECT,
              properties: {
                quote: { type: Type.STRING },
                why: { type: Type.STRING },
                fix: { type: Type.STRING },
              },
              required: ["quote", "why", "fix"],
            },
            scores: {
              type: Type.OBJECT,
              properties: {
                overall: { type: Type.NUMBER },
                communication: { type: Type.NUMBER },
                storytelling: { type: Type.NUMBER },
                wit: { type: Type.NUMBER },
                engagement: { type: Type.NUMBER },
                delivery: { type: Type.NUMBER },
                memorability: { type: Type.NUMBER },
              },
              required: ["overall", "communication", "storytelling", "wit", "engagement", "delivery", "memorability"],
            },
            memorabilityAnalysis: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                openingStrength: { type: Type.STRING },
                coreIdeaTiming: { type: Type.STRING },
                mentalImageCreated: { type: Type.STRING },
                reasonToCare: { type: Type.STRING },
                strength: { type: Type.STRING },
                weakness: { type: Type.STRING },
                concreteImprovement: { type: Type.STRING },
              },
              required: ["score", "strength", "weakness", "concreteImprovement"],
            },
            storytellingAnalysis: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                structureDetected: { type: Type.STRING },
                hookEvaluation: { type: Type.STRING },
                tensionAndConflict: { type: Type.STRING },
                turningPoint: { type: Type.STRING },
                payoffAndEnding: { type: Type.STRING },
                feedbackNotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["score", "structureDetected", "hookEvaluation", "payoffAndEnding", "feedbackNotes"],
            },
            witAnalysis: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                witMoments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      userQuote: { type: Type.STRING },
                      witTechnique: { type: Type.STRING, description: "e.g. Expectation reversal + personification" },
                      whyItWorks: { type: Type.STRING },
                      deliveryTip: { type: Type.STRING },
                    },
                    required: ["userQuote", "witTechnique", "whyItWorks", "deliveryTip"],
                  },
                },
                lightnessBalance: { type: Type.STRING, description: "Analysis of serious -> light -> serious flow" },
                opportunityToLighten: { type: Type.STRING, description: "Where natural wit could have been inserted without being silly" },
              },
              required: ["score", "witMoments", "lightnessBalance", "opportunityToLighten"],
            },
            communicationCorrections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "critical | useful | stylistic" },
                  originalQuote: { type: Type.STRING },
                  improvedVersion: { type: Type.STRING },
                  whyItWorks: { type: Type.STRING },
                  personalityPreserved: { type: Type.STRING },
                },
                required: ["category", "originalQuote", "improvedVersion", "whyItWorks"],
              },
            },
            engagementAnalysis: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                momentumCurve: { type: Type.STRING },
                audienceRetentionRisk: { type: Type.STRING },
                energyObservation: { type: Type.STRING },
              },
              required: ["score", "momentumCurve", "audienceRetentionRisk"],
            },
            deliveryAnalysis: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                pacingAssessment: { type: Type.STRING },
                pauseEffectiveness: { type: Type.STRING },
                fillerAssessment: { type: Type.STRING },
                visualPostureFeedback: { type: Type.STRING },
              },
              required: ["score", "pacingAssessment", "pauseEffectiveness", "fillerAssessment"],
            },
            oneThingToFix: {
              type: Type.OBJECT,
              properties: {
                rule: { type: Type.STRING, description: "Short memorable principle, e.g., 'Move the payoff before the background.'" },
                whyCrucial: { type: Type.STRING },
                howToApplyImmediately: { type: Type.STRING },
              },
              required: ["rule", "whyCrucial", "howToApplyImmediately"],
            },
            nextExercise: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                difficultyLevel: { type: Type.NUMBER },
                prompt: { type: Type.STRING },
                durationSeconds: { type: Type.NUMBER },
                targetFocus: { type: Type.STRING },
              },
              required: ["title", "difficultyLevel", "prompt", "durationSeconds", "targetFocus"],
            },
            personalStyleInsights: {
              type: Type.OBJECT,
              properties: {
                naturalStrengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                distinctiveVoice: { type: Type.STRING },
                recurringWeaknessIdentified: { type: Type.STRING },
              },
              required: ["naturalStrengths", "distinctiveVoice"],
            },
          },
          required: [
            "executiveSummary",
            "strongestMoment",
            "weakestMoment",
            "scores",
            "memorabilityAnalysis",
            "storytellingAnalysis",
            "witAnalysis",
            "communicationCorrections",
            "engagementAnalysis",
            "deliveryAnalysis",
            "oneThingToFix",
            "nextExercise",
            "personalStyleInsights",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in session-analysis:", err?.name || "RequestError");
    return res.status(500).json({ error: "Failed to analyze session. Please try again." });
  }
});

/**
 * 3. COMPARE ATTEMPTS (PRACTICE LOOP)
 */
apiRouter.post("/coach/compare-attempts", async (req: Request, res: Response) => {
  try {
    const { attempt1, attempt2, exercisePrompt } = req.body;
    if (!attempt1 || !attempt2) {
      return res.status(400).json({ error: "Two attempts are required for comparison." });
    }

    const ai = getAi();
    const systemPrompt = `You are Vocalis comparing Attempt 1 vs Attempt 2 of the same exercise.
Evaluate visible growth between the two iterations:
- Hook speed & opening clarity
- Memorability shift
- Filler count & hesitation reduction
- Story tension or delivery impact
- Did the user apply the 'One Thing To Fix'?
Highlight exact concrete differences (e.g., "Your opening became 14 seconds shorter", "You cut 7 filler words", "You ended on an evocative image instead of an abstract summary").`;

    const response = await generateWithFallback(ai, {
      contents: `Exercise Prompt: "${exercisePrompt || "Speech Drill"}"\n\nATTEMPT 1:\nTranscript: "${attempt1.transcript}"\nScores: ${JSON.stringify(attempt1.scores || {})}\n\nATTEMPT 2:\nTranscript: "${attempt2.transcript}"\nScores: ${JSON.stringify(attempt2.scores || {})}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdictSummary: { type: Type.STRING },
            deltaScore: { type: Type.NUMBER, description: "Positive or negative overall score shift" },
            keyImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            whatStillNeedsWork: { type: Type.STRING },
            appliedOneThingFeedback: { type: Type.BOOLEAN },
            coachPraiseWithWit: { type: Type.STRING },
          },
          required: ["verdictSummary", "deltaScore", "keyImprovements", "whatStillNeedsWork", "appliedOneThingFeedback"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in compare-attempts:", err?.name || "RequestError");
    return res.status(500).json({ error: "Failed to compare attempts. Please try again." });
  }
});

/**
 * 4. DYNAMIC SCENARIO GENERATION (PUBLIC SPEAKING SIMULATOR & LABS)
 */
apiRouter.post("/coach/generate-scenario", async (req: Request, res: Response) => {
  try {
    const { category, difficultyLevel = 1, userWeakness = "", targetLanguage = "English" } = req.body;
    const ai = getAi();

    const systemPrompt = `You are Vocalis creating a realistic, high-stakes communication challenge.
Category requested: "${category}" (e.g., "storytelling", "public_speaking", "wit_lab", "interview", "technical_explanation", "pitch", "spontaneous").
Difficulty Level: ${difficultyLevel} (out of 10).
User's current recurring weakness to target: "${userWeakness || "general clarity"}".
Target Language: "${targetLanguage}".

Generate a creative, non-generic, immersive scenario where the user must speak directly to the audience.
Include constraints (e.g. time limit, audience attitude, interruption condition, forbidden words).`;

    const response = await generateWithFallback(ai, {
      contents: `Generate a Level ${difficultyLevel} scenario for category ${category}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            difficultyLevel: { type: Type.NUMBER },
            audienceDescription: { type: Type.STRING, description: "Who is listening? e.g. 'A skeptical venture partner who only cares about distribution'" },
            objective: { type: Type.STRING },
            scenarioPrompt: { type: Type.STRING, description: "Detailed briefing of the situation" },
            targetDurationSeconds: { type: Type.NUMBER },
            constraints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            coachTip: { type: Type.STRING },
          },
          required: ["title", "category", "difficultyLevel", "audienceDescription", "objective", "scenarioPrompt", "targetDurationSeconds", "constraints", "coachTip"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in generate-scenario:", err?.name || "RequestError");
    return res.status(500).json({ error: "Failed to generate scenario. Please try again." });
  }
});

/**
 * 5. VISION DELIVERY SNAPSHOT (Camera frame analysis)
 * Optional multimodal check of posture, gaze contact, and visible tension/energy
 */
apiRouter.post("/coach/vision-snapshot", async (req: Request, res: Response) => {
  try {
    const { imageBase64, currentThoughtContext } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image base64" });
    }

    const ai = getAi();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are a professional body language and public speaking visual delivery coach.
Analyze this single video frame snapshot of a speaker practicing.
Context: "${currentThoughtContext || "Speaker delivering a point"}".

CRITICAL SAFETY & PRIVACY RULES:
- Never make judgments about attractiveness, body shape, age, race, gender, or sensitive physical characteristics.
- Focus STRICTLY on communication-related visual signals:
  1. Camera eye-line / gaze orientation (is the speaker looking toward the lens or looking away/down?)
  2. Posture openness (upright, collapsed, tense shoulders)
  3. Facial expression alignment (expressive, frozen, tense, engaged)
  4. Visual confidence / presence
- Acknowledge that a single frame is an estimate.

Return JSON:
{
  "eyeContactEstimate": "direct" | "looking_down" | "looking_aside",
  "postureQuality": "open_and_grounded" | "slouched" | "tense_shoulders" | "casual",
  "expressionEngagement": "aligned_and_animated" | "neutral" | "tense",
  "coachVisualFeedback": string (1-2 sentences, encouraging and actionable),
  "confidenceIndicator": number (1 to 10)
}`;

    const response = await generateWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error in vision-snapshot:", err?.name || "RequestError");
    return res.status(500).json({ error: "Failed to analyze frame. Please try again." });
  }
});
