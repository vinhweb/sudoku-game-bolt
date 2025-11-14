import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Clock, Target, Lightbulb, Flame } from 'lucide-react';
import { GameStatistics } from '../types/game';
import { getUserStatistics } from '../services/game-service';

interface StatisticsProps {
  userId: string;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function Statistics({ userId, onBack }: StatisticsProps) {
  const [statistics, setStatistics] = useState<GameStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [userId]);

  const loadStatistics = async () => {
    setLoading(true);
    const stats = await getUserStatistics(userId);
    setStatistics(stats);
    setLoading(false);
  };

  const totalGamesPlayed = statistics.reduce((sum, s) => sum + s.games_played, 0);
  const totalGamesCompleted = statistics.reduce((sum, s) => sum + s.games_completed, 0);
  const maxStreak = Math.max(...statistics.map(s => s.longest_streak), 0);

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

        <h1 className="text-4xl font-bold text-slate-800 mb-8">Your Statistics</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-slate-600 font-medium">Games Played</span>
                </div>
                <p className="text-3xl font-bold text-slate-800">{totalGamesPlayed}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-slate-600 font-medium">Completed</span>
                </div>
                <p className="text-3xl font-bold text-slate-800">{totalGamesCompleted}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-slate-600 font-medium">Best Streak</span>
                </div>
                <p className="text-3xl font-bold text-slate-800">{maxStreak} days</p>
              </div>
            </div>

            <div className="space-y-4">
              {['easy', 'medium', 'hard', 'expert'].map((diff) => {
                const stat = statistics.find(s => s.difficulty === diff);

                if (!stat || stat.games_played === 0) {
                  return (
                    <div key={diff} className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-xl font-bold text-slate-800 capitalize mb-4">{diff}</h3>
                      <p className="text-slate-500">No games played yet</p>
                    </div>
                  );
                }

                const completionRate = stat.games_played > 0
                  ? Math.round((stat.games_completed / stat.games_played) * 100)
                  : 0;

                return (
                  <div key={diff} className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-slate-800 capitalize mb-4">{diff}</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <Target className="w-4 h-4" />
                          <span className="text-sm">Played</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stat.games_played}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <Trophy className="w-4 h-4" />
                          <span className="text-sm">Win Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Best Time</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {stat.best_time ? formatTime(stat.best_time) : '-'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <Lightbulb className="w-4 h-4" />
                          <span className="text-sm">Avg Hints</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">
                          {stat.games_completed > 0
                            ? Math.round(stat.total_hints_used / stat.games_completed)
                            : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
