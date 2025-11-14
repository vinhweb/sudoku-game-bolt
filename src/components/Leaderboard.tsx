import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { LeaderboardEntry, Difficulty } from '../types/game';
import { getLeaderboard } from '../services/game-service';

interface LeaderboardProps {
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
  if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
  return <span className="text-lg font-bold text-slate-600">#{rank}</span>;
}

export function Leaderboard({ onBack }: LeaderboardProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedGameType, setSelectedGameType] = useState<'standard' | 'mini'>('standard');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedDifficulty, selectedGameType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await getLeaderboard(selectedDifficulty, selectedGameType, 100);
    setEntries(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <h1 className="text-4xl font-bold text-slate-800 mb-6">Leaderboard</h1>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedGameType('standard')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-200
                ${
                  selectedGameType === 'standard'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              Standard Sudoku (9x9)
            </button>
            <button
              onClick={() => setSelectedGameType('mini')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-200
                ${
                  selectedGameType === 'mini'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              Mini Sudoku (3x3)
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`
                  px-6 py-3 rounded-lg font-semibold capitalize transition-all duration-200
                  ${
                    selectedDifficulty === diff
                      ? selectedGameType === 'mini'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No entries yet</p>
            <p className="text-slate-500 mt-2">Be the first to complete a puzzle!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Player</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`
                        transition-colors
                        ${index < 3 ? 'bg-yellow-50/30' : 'hover:bg-slate-50'}
                      `}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-10">
                          {getRankIcon(index + 1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-800">
                          {(entry.profile as any)?.username || 'Anonymous'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">
                          {formatTime(entry.completion_time)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">
                          {new Date(entry.completed_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
