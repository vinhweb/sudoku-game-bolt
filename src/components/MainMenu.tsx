import React from 'react';
import { Play, Trophy, BarChart3, Calendar, LogIn, LogOut, User, Grid3x3 } from 'lucide-react';
import { Difficulty } from '../utils/sudoku-generator';

interface MainMenuProps {
  user: any;
  onNewGame: (difficulty: Difficulty) => void;
  onContinueGame: () => void;
  onDailyChallenge: () => void;
  onViewStats: () => void;
  onViewLeaderboard: () => void;
  onMiniSudoku: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onProfile: () => void;
  hasSavedGames: boolean;
}

export function MainMenu({
  user,
  onNewGame,
  onContinueGame,
  onDailyChallenge,
  onViewStats,
  onViewLeaderboard,
  onMiniSudoku,
  onSignIn,
  onSignOut,
  onProfile,
  hasSavedGames,
}: MainMenuProps) {
  const [showDifficultySelect, setShowDifficultySelect] = React.useState(false);

  const handleNewGame = (difficulty: Difficulty) => {
    setShowDifficultySelect(false);
    onNewGame(difficulty);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold text-slate-800">Sudoku</h1>
          <p className="text-slate-600">Challenge your mind with classic puzzles</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
          {user && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-800">
                  {user.email}
                </span>
              </div>
              <button
                onClick={onProfile}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Profile
              </button>
            </div>
          )}

          {!showDifficultySelect ? (
            <>
              <button
                onClick={() => setShowDifficultySelect(true)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
              >
                <Play className="w-6 h-6" />
                <span className="text-lg font-semibold">New Game</span>
              </button>

              {hasSavedGames && user && (
                <button
                  onClick={onContinueGame}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
                >
                  <Play className="w-6 h-6" />
                  <span className="text-lg font-semibold">Continue Game</span>
                </button>
              )}

              <button
                onClick={onDailyChallenge}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
              >
                <Calendar className="w-6 h-6" />
                <span className="text-lg font-semibold">Daily Challenge</span>
              </button>

              <button
                onClick={onMiniSudoku}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
              >
                <Grid3x3 className="w-6 h-6" />
                <span className="text-lg font-semibold">Mini Sudoku (3x3)</span>
              </button>

              {user && (
                <button
                  onClick={onViewStats}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-lg font-semibold">Statistics</span>
                </button>
              )}

              <button
                onClick={onViewLeaderboard}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
              >
                <Trophy className="w-6 h-6" />
                <span className="text-lg font-semibold">Leaderboard</span>
              </button>

              {!user ? (
                <button
                  onClick={onSignIn}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
                >
                  <LogIn className="w-6 h-6" />
                  <span className="text-lg font-semibold">Sign In</span>
                </button>
              ) : (
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-lg font-semibold">Sign Out</span>
                </button>
              )}
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Select Difficulty</h3>
              </div>

              <button
                onClick={() => handleNewGame('easy')}
                className="w-full p-4 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-all duration-200 font-semibold"
              >
                Easy
              </button>

              <button
                onClick={() => handleNewGame('medium')}
                className="w-full p-4 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 font-semibold"
              >
                Medium
              </button>

              <button
                onClick={() => handleNewGame('hard')}
                className="w-full p-4 rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all duration-200 font-semibold"
              >
                Hard
              </button>

              <button
                onClick={() => handleNewGame('expert')}
                className="w-full p-4 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 font-semibold"
              >
                Expert
              </button>

              <button
                onClick={() => setShowDifficultySelect(false)}
                className="w-full p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
