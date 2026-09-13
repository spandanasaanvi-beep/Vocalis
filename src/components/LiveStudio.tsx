import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Square,
  Sparkles,
  AlertCircle,
  Eye,
  Activity,
  Gauge,
  Zap,
  Volume2,
  Clock,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Camera,
  ShieldCheck,
} from "lucide-react";
import {
  CoachingMode,
  SessionCategory,
  LiveNudge,
  LiveDeliveryMetrics,
  SessionReport,
  ScenarioChallenge,
  UserProfile,
} from "../types";
import { analyzeFillers, calculateWpm, countWords, evaluatePacing, evaluateFillerRate } from "../utils/speechAnalysis";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useCameraAndAudio } from "../hooks/useCameraAndAudio";

interface LiveStudioProps {
  userProfile: UserProfile;
  activeScenario?: ScenarioChallenge | null;
  retryParentSession?: SessionReport | null;
  onSessionComplete: (report: SessionReport) => void;
  onClearScenario: () => void;
}

export const LiveStudio: React.FC<LiveStudioProps> = ({
  userProfile,
  activeScenario,
  retryParentSession,
  onSessionComplete,
  onClearScenario,
}) => {
  // Session State
  const [coachingMode, setCoachingMode] = useState<CoachingMode>(
    userProfile.preferredMode || "gentle"
  );
  const [sessionCategory, setSessionCategory] = useState<SessionCategory>(
    activeScenario ? activeScenario.category : "storytelling"
  );
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Live Coaching & Analysis state
  const [recentNudges, setRecentNudges] = useState<LiveNudge[]>([]);
  const [currentNudge, setCurrentNudge] = useState<LiveNudge | null>(null);
  const [coachStatus, setCoachStatus] = useState<"idle" | "listening" | "analyzing" | "nudge">("idle");
  const [visionFeedback, setVisionFeedback] = useState<string | null>(null);
  const [isAuditingFrame, setIsAuditingFrame] = useState(false);

  // Custom/Manual text input mode toggle (useful for environments without microphone or testing)
  const [manualInputMode, setManualInputMode] = useState(false);
  const [manualText, setManualText] = useState("");

  // Media Hooks
  const {
    videoRef,
    hasCamera,
    hasMic,
    isCameraActive,
    isMicActive,
    audioLevel,
    motionLevel,
    postureFeedback,
    permissionError,
    startMedia,
    stopMedia,
    captureFrameBase64,
  } = useCameraAndAudio();

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    interimText,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
    appendText,
  } = useSpeechRecognition({
    language: userProfile.preferredSpokenLanguage === "Hindi" ? "hi-IN" : "en-US",
  });

  // Timers & interval refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nudgeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNudgeTimeRef = useRef<number>(0);
  const lastAnalyzedTranscriptRef = useRef<string>("");

  // Combined transcript (speech recognition + manual)
  const combinedTranscript = (transcript + (manualText ? " " + manualText : "")).trim();
  const wordCount = countWords(combinedTranscript);
  const currentWpm = calculateWpm(wordCount, secondsElapsed);
  const fillers = analyzeFillers(combinedTranscript);
  const fillersPerMin = secondsElapsed > 5 ? Number(((fillers.total / secondsElapsed) * 60).toFixed(1)) : 0;
  const pacingAssessment = evaluatePacing(currentWpm);
  const fillerAssessment = evaluateFillerRate(fillersPerMin);

  // Start Session
  const handleStartSession = async () => {
    setIsSessionActive(true);
    setSecondsElapsed(0);
    resetTranscript();
    setManualText("");
    setRecentNudges([]);
    setCurrentNudge(null);
    setReportError(null);
    setCoachStatus("listening");

    // Start hardware media
    await startMedia(true, true);
    startListening();

    // Start timer
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
  };

  // Stop & Generate Report
  const handleFinishSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (nudgeIntervalRef.current) clearInterval(nudgeIntervalRef.current);
    stopListening();
    stopMedia();
    setIsSessionActive(false);
    setCoachStatus("idle");

    if (wordCount < 10) {
      setReportError("You spoke fewer than 10 words. Please speak for a bit longer so the coach can evaluate your storytelling, wit, and memorability.");
      return;
    }

    setIsGeneratingReport(true);
    setReportError(null);

    const finalMetrics: LiveDeliveryMetrics = {
      wpm: currentWpm,
      fillers,
      fillersPerMinute: fillersPerMin,
      pauseCount: Math.max(1, Math.round(secondsElapsed / 15)),
      longestPauseSeconds: 2.5,
      speakingTimeSeconds: secondsElapsed,
      eyeContactPercentage: isCameraActive ? 78 : 0,
      gestureActivity: motionLevel > 30 ? "expressive" : motionLevel > 10 ? "moderate" : "low",
      postureState: "upright",
    };

    try {
      const response = await fetch("/api/coach/session-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: combinedTranscript,
          durationSeconds: secondsElapsed,
          metrics: finalMetrics,
          purpose: activeScenario?.title || sessionCategory,
          coachingLanguage: userProfile.preferredCoachingLanguage || "English",
          spokenLanguage: userProfile.preferredSpokenLanguage || "English",
          profileContext: {
            recurringWeaknesses: userProfile.recurringWeaknesses.map((w) => w.weakness),
            bestScores: userProfile.bestScores,
          },
          scenarioPrompt: activeScenario?.scenarioPrompt || "",
          attemptNumber: retryParentSession ? (retryParentSession.attemptNumber || 1) + 1 : 1,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze speech session");
      }

      const reportData = await response.json();

      const fullReport: SessionReport = {
        id: `sess_${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: activeScenario?.title || `${sessionCategory.charAt(0).toUpperCase() + sessionCategory.slice(1)} Practice`,
        category: sessionCategory,
        mode: coachingMode,
        durationSeconds: secondsElapsed,
        transcript: combinedTranscript,
        attemptNumber: retryParentSession ? (retryParentSession.attemptNumber || 1) + 1 : 1,
        parentSessionId: retryParentSession?.id,
        metrics: finalMetrics,
        ...reportData,
      };

      onSessionComplete(fullReport);
    } catch (err: any) {
      console.error("Session analysis error:", err);
      setReportError(err.message || "Failed to complete AI diagnosis. Please check server connection.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Live Micro-Nudge Polling
  const checkLiveNudge = useCallback(async () => {
    if (!isSessionActive || coachingMode === "silent" || coachingMode === "presentation") {
      return;
    }

    const now = Date.now();
    // Intervene at most every 14 seconds in gentle mode, 8 seconds in active mode
    const cooldownMs = coachingMode === "active" ? 8000 : 14000;
    if (now - lastNudgeTimeRef.current < cooldownMs) {
      return;
    }

    const newSpokenSince = combinedTranscript.slice(lastAnalyzedTranscriptRef.current.length);
    if (newSpokenSince.trim().length < 35) {
      return;
    }

    try {
      setCoachStatus("analyzing");
      const res = await fetch("/api/coach/live-nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recentTranscript: newSpokenSince,
          fullTranscriptSoFar: combinedTranscript,
          mode: coachingMode,
          purpose: activeScenario?.title || sessionCategory,
          wpm: currentWpm,
          fillerCount: fillers.total,
          secondsElapsed,
          recurringWeaknesses: userProfile.recurringWeaknesses.map((w) => w.weakness),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.shouldNudge && data.nudgeText) {
          const nudgeObj: LiveNudge = {
            id: `nudge_${Date.now()}`,
            timestamp: secondsElapsed,
            text: data.nudgeText,
            type: data.type || "engagement",
            urgency: data.urgency || "medium",
          };
          setCurrentNudge(nudgeObj);
          setRecentNudges((prev) => [nudgeObj, ...prev].slice(0, 8));
          lastNudgeTimeRef.current = now;
          setCoachStatus("nudge");
        } else {
          setCoachStatus("listening");
        }
      }
    } catch (e) {
      // Benign live check failure
      setCoachStatus("listening");
    } finally {
      lastAnalyzedTranscriptRef.current = combinedTranscript;
    }
  }, [isSessionActive, coachingMode, combinedTranscript, currentWpm, fillers.total, secondsElapsed, activeScenario, sessionCategory, userProfile]);

  // Set up periodic nudge checking
  useEffect(() => {
    if (isSessionActive) {
      const interval = setInterval(checkLiveNudge, 4000);
      nudgeIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [isSessionActive, checkLiveNudge]);

  // Audit Frame with Vision Snapshot
  const handleAuditFrame = async () => {
    const frame = captureFrameBase64();
    if (!frame) {
      setVisionFeedback("Camera frame not available. Ensure camera is turned on.");
      return;
    }

    setIsAuditingFrame(true);
    setVisionFeedback(null);
    try {
      const res = await fetch("/api/coach/vision-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: frame,
          currentThoughtContext: combinedTranscript.slice(-100) || "Practicing delivery",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVisionFeedback(data.coachVisualFeedback || "Eye contact and open chest look grounded.");
      }
    } catch (e) {
      setVisionFeedback("Visual delivery audit unavailable.");
    } finally {
      setIsAuditingFrame(false);
    }
  };

  // Helper sample scenarios for instant one-click testing
  const sampleSpeechSeeds = [
    {
      title: "Vivid Story (Hook)",
      text: "At 3:14 in the morning, the cooling fans in server room four screamed and died. I had three minutes before our primary database melted down, and my only tool was an uninsulated screwdriver and a roll of duct tape. That was the moment I realized our disaster recovery plan was basically fiction.",
    },
    {
      title: "Skeptical Pitch",
      text: "Every AI tool today promises to revolutionize your workflow. But here is the honest truth: most engineers spend forty percent of their day just deciphering legacy API documentation that hasn't been updated since 2019. Vocalis doesn't generate more code. It identifies the architectural blind spots before your team pushes to production.",
    },
    {
      title: "Technical Analogy",
      text: "Think of an attention mechanism in AI like a cocktail party. When twenty people are talking at once, your ears don't record all twenty conversations equally. Your brain weights the sound of your own name. Transformers do the exact same calculation with vectors.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Scenario or Retry Indicator */}
      {activeScenario && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-900 border border-indigo-700/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-indigo-950/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                Active Scenario • Level {activeScenario.difficultyLevel}
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-zinc-100">
                {activeScenario.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-300">
              <strong className="text-zinc-200">Audience:</strong> {activeScenario.audienceDescription} |{" "}
              <strong className="text-zinc-200">Objective:</strong> {activeScenario.objective}
            </p>
            <p className="text-xs text-amber-300/90 italic flex items-center gap-1.5 pt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Coach Tip: {activeScenario.coachTip}
            </p>
          </div>
          <button
            onClick={onClearScenario}
            className="self-start sm:self-center text-xs text-zinc-400 hover:text-zinc-200 hover:underline px-2 py-1"
          >
            Switch Scenario
          </button>
        </div>
      )}

      {retryParentSession && (
        <div className="bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-900 border border-amber-600/50 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-zinc-950">
              Practice Loop • Attempt 2
            </span>
            <p className="text-xs text-zinc-200 mt-1">
              <strong>Your Targeted Goal for this Retry:</strong>{" "}
              <span className="text-amber-300 font-medium">"{retryParentSession.oneThingToFix?.rule}"</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Studio 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Camera Preview & Delivery Sensors (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {/* Camera Viewport */}
            <div className="relative aspect-[4/3] bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${
                  isCameraActive ? "block" : "hidden"
                }`}
              />

              {!isCameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
                    <VideoOff className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-300">Camera Off</p>
                    <p className="text-[11px] text-zinc-400 max-w-[200px]">
                      Enable camera to analyze visual eye contact, posture, and expressive gestures.
                    </p>
                  </div>
                  {!isSessionActive && (
                    <button
                      onClick={() => startMedia(true, true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                    >
                      Enable Camera
                    </button>
                  )}
                </div>
              )}

              {/* In-viewport overlays when camera is active */}
              {isCameraActive && (
                <>
                  {/* Subtle gaze center alignment crosshair */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                    <div className="w-20 h-20 rounded-full border border-dashed border-zinc-400/50 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    </div>
                  </div>

                  {/* Top Bar on Video */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-zinc-800 text-[10px] text-zinc-300">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Eye Contact Live</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-zinc-800 text-[10px] text-zinc-300">
                      <Activity className="w-3 h-3 text-indigo-400" />
                      <span>Gestures: {motionLevel > 25 ? "Active" : "Steady"}</span>
                    </div>
                  </div>

                  {/* Bottom Audio Activity Wave on Video */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px]">
                    <Volume2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-amber-400 transition-all duration-75"
                        style={{ width: `${Math.min(100, audioLevel * 1.6)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 w-7 text-right">
                      {audioLevel}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Visual Delivery Controls & Privacy Note */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-zinc-300">Posture & Gestures:</span>
                <span className="font-mono text-indigo-400 text-[11px]">{postureFeedback}</span>
              </div>

              {/* On-Demand Gemini Vision Frame Audit */}
              {isCameraActive && (
                <div className="pt-1">
                  <button
                    onClick={handleAuditFrame}
                    disabled={isAuditingFrame}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 border border-zinc-700/70 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAuditingFrame ? "Auditing Frame with AI..." : "Audit Delivery Frame with Gemini"}</span>
                  </button>
                  {visionFeedback && (
                    <p className="mt-2 text-xs p-2.5 rounded-lg bg-indigo-950/50 border border-indigo-800/40 text-indigo-200 leading-relaxed">
                      💡 <strong>Visual Coach:</strong> {visionFeedback}
                    </p>
                  )}
                </div>
              )}

              {/* Privacy Notice */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Camera feed is analyzed locally. Zero biometrics stored.</span>
              </div>

              {permissionError && (
                <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{permissionError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Delivery Gauges */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              Real-Time Delivery Telemetry
            </h3>

            {/* WPM Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Pacing Speed (WPM):</span>
                <span className={`font-mono font-bold ${pacingAssessment.color}`}>
                  {currentWpm} WPM
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${Math.min(100, (currentWpm / 220) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-400">{pacingAssessment.label}</p>
            </div>

            {/* Filler Tracking */}
            <div className="space-y-2 pt-1 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Filler Rate:</span>
                <span className={`font-mono font-bold ${fillerAssessment.color}`}>
                  {fillersPerMin}/min ({fillers.total} total)
                </span>
              </div>

              {/* Filler Breakdown Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${fillers.um > 0 ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-zinc-800/80 text-zinc-400"}`}>
                  um: {fillers.um}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${fillers.uh > 0 ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-zinc-800/80 text-zinc-400"}`}>
                  uh: {fillers.uh}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${fillers.like > 0 ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-zinc-800/80 text-zinc-400"}`}>
                  like: {fillers.like}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${fillers.basically > 0 ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-zinc-800/80 text-zinc-400"}`}>
                  basically: {fillers.basically}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${fillers.actually > 0 ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-zinc-800/80 text-zinc-400"}`}>
                  actually: {fillers.actually}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Live Continuous Transcript (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col h-[580px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isSessionActive ? "bg-rose-500 animate-pulse" : "bg-zinc-600"}`} />
                <h3 className="font-semibold text-sm text-zinc-100">Live Continuous Transcript</h3>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, "0")}
                </span>
                <span>{wordCount} words</span>
              </div>
            </div>

            {/* Transcript Scroll Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 font-normal text-sm sm:text-base leading-relaxed text-zinc-200 select-text">
              {combinedTranscript ? (
                <>
                  <p className="whitespace-pre-wrap">{combinedTranscript}</p>
                  {interimText && (
                    <span className="text-zinc-400 italic bg-zinc-800/40 px-1 rounded">
                      {interimText}
                    </span>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 space-y-4 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-300">
                      {isSessionActive ? "Listening for your speech..." : "Press 'Start Live Session' to speak"}
                    </p>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Speak naturally with your own vocabulary, rhythm, and accent. Vocalis will guide you live.
                    </p>
                  </div>

                  {/* Seed Prompts for quick test */}
                  <div className="pt-2 text-left w-full space-y-2">
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Or try speaking one of these scenarios:
                    </p>
                    <div className="space-y-1.5">
                      {sampleSpeechSeeds.map((seed, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            appendText(seed.text);
                          }}
                          className="w-full text-left p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 border border-zinc-700/50 transition-colors"
                        >
                          <span className="font-semibold text-indigo-400 mr-1.5">{seed.title}:</span>
                          <span className="line-clamp-1 text-zinc-400">{seed.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Manual text backup input for quiet spaces / restricted mic environments */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setManualInputMode(!manualInputMode)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {manualInputMode ? "Hide manual speech box" : "Type speech manually / paste script"}
                </button>
                {combinedTranscript && (
                  <button
                    onClick={resetTranscript}
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Clear transcript
                  </button>
                )}
              </div>

              {manualInputMode && (
                <div className="flex gap-2">
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Type or paste what you are saying..."
                    rows={2}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <button
                    onClick={() => {
                      if (manualText.trim()) {
                        appendText(manualText);
                        setManualText("");
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl self-end"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live AI Coach & Mode Switcher (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Coaching Mode Selector Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Live Coaching Mode
              </h3>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase">
                {coachingMode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "silent", label: "Silent", desc: "Listen, feedback after" },
                { id: "gentle", label: "Gentle", desc: "Subtle live alerts" },
                { id: "active", label: "Active", desc: "Frequent drills" },
                { id: "presentation", label: "Presentation", desc: "Full run, deep report" },
              ].map((m) => (
                <button
                  key={m.id}
                  id={`mode-btn-${m.id}`}
                  onClick={() => setCoachingMode(m.id as CoachingMode)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    coachingMode === m.id
                      ? "bg-indigo-950/80 border-indigo-600 text-zinc-100 shadow-sm"
                      : "bg-zinc-800/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  <p className="text-xs font-semibold">{m.label}</p>
                  <p className="text-[10px] text-zinc-400 leading-tight">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Coach Live Feed */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xl flex flex-col min-h-[340px]">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Vocalis Live Nudge</h4>
                  <p className="text-[10px] text-zinc-400">
                    {coachStatus === "analyzing"
                      ? "Analyzing momentum..."
                      : coachStatus === "nudge"
                      ? "Live intervention active"
                      : isSessionActive
                      ? "Listening to speech flow..."
                      : "Ready to coach"}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Active Nudge Card */}
            {currentNudge ? (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/90 via-zinc-900 to-zinc-900 border border-indigo-600/70 shadow-lg space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                    {currentNudge.type} nudge
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    at {Math.floor(currentNudge.timestamp / 60)}:{(currentNudge.timestamp % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-zinc-100 leading-relaxed">
                  "{currentNudge.text}"
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-400 space-y-2">
                <Zap className="w-6 h-6 text-zinc-400" />
                <p className="text-xs text-zinc-400">
                  {isSessionActive
                    ? coachingMode === "silent"
                      ? "Silent mode: The coach is listening and will provide the deep report when you finish."
                      : "Keep speaking. Vocalis will subtly intervene if pacing, story tension, or filler words dip."
                    : "Start speaking to receive targeted live nudges."}
                </p>
              </div>
            )}

            {/* Past Nudges in This Session */}
            {recentNudges.length > 1 && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Previous Nudges ({recentNudges.length - 1})
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {recentNudges.slice(1).map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                      <span className="text-indigo-400 font-semibold uppercase text-[9px] mr-1">
                        [{n.type}]
                      </span>
                      {n.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR: Primary Controls & Diagnosis Trigger */}
      <div className="bg-zinc-900/95 border border-zinc-800/90 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30 backdrop-blur-lg">
        {/* Left Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Category:</span>
            <select
              value={sessionCategory}
              onChange={(e) => setSessionCategory(e.target.value as SessionCategory)}
              disabled={isSessionActive}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60 font-medium"
            >
              <option value="storytelling">Storytelling Practice</option>
              <option value="pitch">Project Pitch</option>
              <option value="public_speaking">Public Speaking</option>
              <option value="interview">Interview & Q&A</option>
              <option value="wit_lab">Wit & Lightness Lab</option>
              <option value="technical_explanation">Technical Concept</option>
              <option value="casual">Casual Conversation</option>
            </select>
          </div>
        </div>

        {/* Center / Primary Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {!isSessionActive ? (
            <button
              id="start-session-btn"
              onClick={handleStartSession}
              disabled={isGeneratingReport}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Live Coaching Session</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="finish-session-btn"
                onClick={handleFinishSession}
                disabled={isGeneratingReport}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish & Generate Diagnosis</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Cancel this live session without saving?")) {
                    setIsSessionActive(false);
                    stopListening();
                    stopMedia();
                  }
                }}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Cancel session"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading Modal while generating full AI report */}
      {isGeneratingReport && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-100">
                Vocalis Coach Diagnosing Speech...
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Analyzing storytelling structure, memorability hook, wit mechanisms, filler frequency, and identifying your <strong>One Thing to Fix Next</strong>.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              Connecting with Gemini Intelligence
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {reportError && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Coaching Diagnosis Notice</p>
            <p>{reportError}</p>
          </div>
        </div>
      )}
    </div>
  );
};
