import React, { useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  SessionReport,
  ScenarioChallenge,
} from "./types";
import {
  getUserProfile,
  saveUserProfile,
  getSessionHistory,
  saveSessionReport,
  clearAllHistory,
} from "./utils/storage";
import { Header } from "./components/Header";
import { LiveStudio } from "./components/LiveStudio";
import { SessionReportView } from "./components/SessionReportView";
import { AttemptComparisonView } from "./components/AttemptComparisonView";
import { StoryLab } from "./components/StoryLab";
import { PublicSpeakingSimulator } from "./components/PublicSpeakingSimulator";
import { WitLab } from "./components/WitLab";
import { ProgressDashboard } from "./components/ProgressDashboard";
import { SettingsModal } from "./components/SettingsModal";

type TabType = "live" | "story" | "simulator" | "wit" | "progress" | "history" | "report" | "comparison";

function parseRoute(): { tab: TabType; openSettings: boolean } {
  if (typeof window === "undefined") return { tab: "live", openSettings: false };
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
  if (path === "/settings" || path === "/profile") {
    return { tab: "live", openSettings: true };
  }
  if (path === "/story-lab" || path === "/story") return { tab: "story", openSettings: false };
  if (path === "/public-speaking" || path === "/simulator") return { tab: "simulator", openSettings: false };
  if (path === "/wit-lab" || path === "/wit") return { tab: "wit", openSettings: false };
  if (path === "/dashboard" || path === "/progress") return { tab: "progress", openSettings: false };
  if (path === "/history") return { tab: "history", openSettings: false };
  if (path === "/comparison") return { tab: "comparison", openSettings: false };
  if (path === "/report") return { tab: "report", openSettings: false };
  return { tab: "live", openSettings: false };
}

const tabToPathMap: Record<TabType, string> = {
  live: "/live-coach",
  story: "/story-lab",
  simulator: "/public-speaking",
  wit: "/wit-lab",
  progress: "/dashboard",
  history: "/history",
  report: "/report",
  comparison: "/comparison",
};

export default function App() {
  const initialRoute = parseRoute();

  // Navigation & Screen View State
  const [currentTab, setCurrentTab] = useState<TabType>(initialRoute.tab);

  // User Profile & Persistent Sessions
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [sessionHistory, setSessionHistory] = useState<SessionReport[]>(getSessionHistory());

  // Active Session / Report Context
  const [activeReport, setActiveReport] = useState<SessionReport | null>(null);
  const [comparisonAttempt1, setComparisonAttempt1] = useState<SessionReport | null>(null);
  const [comparisonAttempt2, setComparisonAttempt2] = useState<SessionReport | null>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioChallenge | null>(null);
  const [retryParentSession, setRetryParentSession] = useState<SessionReport | null>(null);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(initialRoute.openSettings);

  // Navigate with browser history support
  const navigateToTab = useCallback((tab: TabType, push = true) => {
    setCurrentTab(tab);
    if (push && typeof window !== "undefined") {
      const targetPath = tabToPathMap[tab] || "/";
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    }
  }, []);

  // Listen to popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute();
      setCurrentTab(route.tab);
      if (route.openSettings) {
        setIsSettingsOpen(true);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync profile when updated
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const next = { ...userProfile, ...updated };
    setUserProfile(next);
    saveUserProfile(next);
  };

  // When a session is completed in Live Studio
  const handleSessionComplete = (report: SessionReport) => {
    const updatedHistory = saveSessionReport(report);
    setSessionHistory(updatedHistory);
    setActiveReport(report);

    // If this was an Attempt 2 retry, set up comparison
    if (report.parentSessionId) {
      const parent = updatedHistory.find((s) => s.id === report.parentSessionId);
      if (parent) {
        setComparisonAttempt1(parent);
        setComparisonAttempt2(report);
      }
    }

    // Refresh user profile with new score metrics
    setUserProfile(getUserProfile());
    navigateToTab("report");
  };

  // Launch Practice Loop Retry
  const handleRetryExercise = (parentReport: SessionReport) => {
    setRetryParentSession(parentReport);
    setActiveScenario({
      id: `retry_${parentReport.id}`,
      title: `${parentReport.title} (Attempt ${(parentReport.attemptNumber || 1) + 1})`,
      category: parentReport.category,
      difficultyLevel: 3,
      audienceDescription: "Practice Room",
      objective: `Apply the coach rule: "${parentReport.oneThingToFix?.rule}"`,
      scenarioPrompt: parentReport.nextExercise?.prompt || parentReport.transcript.slice(0, 150),
      targetDurationSeconds: parentReport.nextExercise?.durationSeconds || 45,
      constraints: ["Apply target rule: " + (parentReport.oneThingToFix?.rule || "")],
      coachTip: parentReport.oneThingToFix?.howToApplyImmediately || "Apply the one thing to fix.",
    });
    navigateToTab("live");
  };

  // Launch Story Drill
  const handleSelectStoryDrill = (scenario: ScenarioChallenge) => {
    setRetryParentSession(null);
    setActiveScenario(scenario);
    navigateToTab("live");
  };

  // Launch Public Speaking Scenario
  const handleSelectScenario = (scenario: ScenarioChallenge) => {
    setRetryParentSession(null);
    setActiveScenario(scenario);
    navigateToTab("live");
  };

  // Launch Wit Drill
  const handleStartWitPractice = (scenario: ScenarioChallenge) => {
    setRetryParentSession(null);
    setActiveScenario(scenario);
    navigateToTab("live");
  };

  // Select a past session from history
  const handleSelectPastSession = (session: SessionReport) => {
    setActiveReport(session);
    if (session.parentSessionId) {
      const parent = sessionHistory.find((s) => s.id === session.parentSessionId);
      if (parent) {
        setComparisonAttempt1(parent);
        setComparisonAttempt2(session);
      }
    } else {
      setComparisonAttempt1(null);
      setComparisonAttempt2(null);
    }
    navigateToTab("report");
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setSessionHistory([]);
    setUserProfile(getUserProfile());
    setActiveReport(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Studio Header */}
      <Header
        currentTab={currentTab === "report" || currentTab === "comparison" ? "history" : currentTab}
        onSelectTab={(tab) => {
          if (tab === "settings") {
            setIsSettingsOpen(true);
          } else {
            navigateToTab(tab as TabType);
          }
        }}
        isLiveRecording={false}
        sessionsCount={sessionHistory.length}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentTab === "live" && (
          <LiveStudio
            userProfile={userProfile}
            activeScenario={activeScenario}
            retryParentSession={retryParentSession}
            onSessionComplete={handleSessionComplete}
            onClearScenario={() => {
              setActiveScenario(null);
              setRetryParentSession(null);
            }}
          />
        )}

        {currentTab === "report" && activeReport && (
          <SessionReportView
            report={activeReport}
            onRetryExercise={handleRetryExercise}
            hasComparisonAvailable={Boolean(comparisonAttempt1 && comparisonAttempt2)}
            onViewComparison={() => navigateToTab("comparison")}
          />
        )}

        {currentTab === "comparison" && comparisonAttempt1 && comparisonAttempt2 && (
          <AttemptComparisonView
            attempt1={comparisonAttempt1}
            attempt2={comparisonAttempt2}
            onBackToReport={() => navigateToTab("report")}
            onRetryAgain={() => handleRetryExercise(comparisonAttempt2)}
          />
        )}

        {currentTab === "story" && (
          <StoryLab onSelectStoryDrill={handleSelectStoryDrill} />
        )}

        {currentTab === "simulator" && (
          <PublicSpeakingSimulator onSelectScenario={handleSelectScenario} />
        )}

        {currentTab === "wit" && (
          <WitLab onStartWitPractice={handleStartWitPractice} />
        )}

        {(currentTab === "progress" || currentTab === "history") && (
          <ProgressDashboard
            userProfile={userProfile}
            sessionHistory={sessionHistory}
            onSelectSession={handleSelectPastSession}
            onRetrySession={handleRetryExercise}
          />
        )}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          onClearHistory={handleClearHistory}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
