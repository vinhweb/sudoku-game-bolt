import React from 'react';
import { Play, Home } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onMainMenu: () => void;
}

export function PauseOverlay({ onResume, onMainMenu }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">Game Paused</h2>
          <p className="text-slate-600 mt-2">Take a break</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
          >
            <Play className="w-5 h-5" />
            <span className="font-semibold">Resume</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
