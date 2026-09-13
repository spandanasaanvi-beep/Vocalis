import { FillerStats, LiveDeliveryMetrics } from "../types";

// Common speech filler patterns
const FILLER_PATTERNS = {
  um: /\b(um|umm|ummm)\b/gi,
  uh: /\b(uh|uhh|er|err)\b/gi,
  like: /\b(like)\b/gi,
  basically: /\b(basically)\b/gi,
  actually: /\b(actually)\b/gi,
  youKnow: /\b(you know)\b/gi,
  so: /\b(so,?\s+|so\s+basically)\b/gi,
};

export function analyzeFillers(text: string): FillerStats {
  const countMatch = (pattern: RegExp) => {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  };

  const um = countMatch(FILLER_PATTERNS.um);
  const uh = countMatch(FILLER_PATTERNS.uh);
  const like = countMatch(FILLER_PATTERNS.like);
  const basically = countMatch(FILLER_PATTERNS.basically);
  const actually = countMatch(FILLER_PATTERNS.actually);
  const youKnow = countMatch(FILLER_PATTERNS.youKnow);
  const so = countMatch(FILLER_PATTERNS.so);

  const total = um + uh + like + basically + actually + youKnow + so;

  return {
    um,
    uh,
    like,
    basically,
    actually,
    youKnow,
    so,
    total,
  };
}

export function calculateWpm(wordsCount: number, seconds: number): number {
  if (seconds <= 2) return 0;
  const minutes = seconds / 60;
  return Math.round(wordsCount / minutes);
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function evaluatePacing(wpm: number): {
  status: "too_slow" | "deliberate" | "ideal" | "fast" | "rushed";
  label: string;
  color: string;
} {
  if (wpm < 90) {
    return { status: "too_slow", label: "Very Slow / Stalled", color: "text-amber-500" };
  }
  if (wpm >= 90 && wpm < 120) {
    return { status: "deliberate", label: "Deliberate & Thoughtful", color: "text-emerald-600" };
  }
  if (wpm >= 120 && wpm <= 160) {
    return { status: "ideal", label: "Ideal Conversational Flow", color: "text-emerald-500" };
  }
  if (wpm > 160 && wpm <= 185) {
    return { status: "fast", label: "Fast / Energetic", color: "text-amber-500" };
  }
  return { status: "rushed", label: "Rushed (High cognitive load)", color: "text-rose-500" };
}

export function evaluateFillerRate(ratePerMin: number): {
  label: string;
  color: string;
} {
  if (ratePerMin <= 2) return { label: "Exceptional Polish (<2/min)", color: "text-emerald-500" };
  if (ratePerMin <= 5) return { label: "Clean & Natural (3-5/min)", color: "text-emerald-600" };
  if (ratePerMin <= 9) return { label: "Moderate Softeners (6-9/min)", color: "text-amber-500" };
  return { label: "High Verbal Softeners (10+/min)", color: "text-rose-500" };
}
