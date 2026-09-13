import React from "react";
import { UserProfile, CoachingMode } from "../types";
import {
  Settings,
  Languages,
  Shield,
  Trash2,
  CheckCircle2,
  X,
  Volume2,
} from "lucide-react";

interface SettingsModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  userProfile,
  onUpdateProfile,
  onClearHistory,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Studio Settings</h2>
              <p className="text-xs text-zinc-400">Personalization, language & privacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multilingual Support */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-400" />
            Multilingual Support
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Spoken Language (What you speak):
              </label>
              <select
                value={userProfile.preferredSpokenLanguage}
                onChange={(e) =>
                  onUpdateProfile({ preferredSpokenLanguage: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="English">English (Global)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="Hinglish">Hinglish (Hindi-English Blend)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Coaching Feedback Language:
              </label>
              <select
                value={userProfile.preferredCoachingLanguage}
                onChange={(e) =>
                  onUpdateProfile({ preferredCoachingLanguage: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
          </div>
        </div>

        {/* Default Coaching Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">
            Default Live Intervention Mode:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "silent", label: "Silent" },
              { id: "gentle", label: "Gentle" },
              { id: "active", label: "Active" },
              { id: "presentation", label: "Presentation" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onUpdateProfile({ preferredMode: m.id as CoachingMode })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  userProfile.preferredMode === m.id
                    ? "bg-indigo-950 border-indigo-600 text-indigo-200"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Disclosure */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Shield className="w-4 h-4" />
            <span>Privacy & Ephemeral Audio/Video Mandate</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Your live camera and audio streams are processed in memory to calculate rhythm and posture telemetry. Vocalis does not permanently store raw audio or video files. Speech transcripts and coaching reports are stored locally in your browser cache.
          </p>
        </div>

        {/* Data Reset & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear your local session history? This cannot be undone.")) {
                onClearHistory();
                onClose();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local History</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
