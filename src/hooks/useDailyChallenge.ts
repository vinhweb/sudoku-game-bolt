import { useState, useEffect } from 'react';
import { DailyChallenge } from '../types/game';
import { getDailyChallenge, createDailyChallenge } from '../services/game-service';
import { generateSudokuPuzzle } from '../utils/sudoku-generator';

export function useDailyChallenge() {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const loadDailyChallenge = async () => {
    setLoading(true);
    const today = getTodayDate();
    let challenge = await getDailyChallenge(today);

    if (!challenge) {
      const { puzzle, solution } = generateSudokuPuzzle('medium');
      challenge = await createDailyChallenge(today, 'medium', puzzle, solution);
    }

    setDailyChallenge(challenge);
    setLoading(false);
  };

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  return {
    dailyChallenge,
    loading,
    todayDate: getTodayDate(),
    refresh: loadDailyChallenge,
  };
}
