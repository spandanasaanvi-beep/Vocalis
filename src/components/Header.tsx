import React from "react";
import {
  Mic,
  BookOpen,
  Sparkles,
  Award,
  BarChart3,
  Settings,
  History,
  Radio,
  Flame,
} from "lucide-react";

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isLiveRecording: boolean;
  sessionsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isLiveRecording,
  sessionsCount,
}) => {
  const navItems = [
    { id: "live", label: "Live Studio", icon: Mic, badge: isLiveRecording ? "LIVE" : null },
    { id: "story", label: "Story Lab", icon: BookOpen },
    { id: "simulator", label: "Speaking Simulator", icon: Flame },
    { id: "wit", label: "Wit & Lightness", icon: Sparkles },
    { id: "progress", label: "Progress & Profile", icon: BarChart3 },
    { id: "history", label: "Session Vault", icon: History, count: sessionsCount },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onSelectTab("live")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-zinc-100">
                Vocalis
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                Studio Coach
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Personality + Memorable Communication
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === "number" && item.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
