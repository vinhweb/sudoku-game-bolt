export type MiniSudokuGrid = number[][];
export type MiniDifficulty = 'easy' | 'medium' | 'hard';

const GRID_SIZE = 3;

function isValidPlacement(grid: MiniSudokuGrid, row: number, col: number, num: number): boolean {
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[row][x] === num || grid[x][col] === num) {
      return false;
    }
  }
  return true;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function solveMiniSudoku(grid: MiniSudokuGrid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3]);

        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;

            if (solveMiniSudoku(grid)) {
              return true;
            }

            grid[row][col] = 0;
          }
        }

        return false;
      }
    }
  }

  return true;
}

function generateCompleteSolution(): MiniSudokuGrid {
  const grid: MiniSudokuGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  solveMiniSudoku(grid);
  return grid;
}

function countSolutions(grid: MiniSudokuGrid, limit: number = 2): number {
  let count = 0;

  function solve(g: MiniSudokuGrid): boolean {
    if (count >= limit) return true;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (g[row][col] === 0) {
          for (let num = 1; num <= 3; num++) {
            if (isValidPlacement(g, row, col, num)) {
              g[row][col] = num;

              if (solve(g)) {
                g[row][col] = 0;
                return true;
              }

              g[row][col] = 0;
            }
          }
          return false;
        }
      }
    }

    count++;
    return count >= limit;
  }

  const gridCopy = grid.map(row => [...row]);
  solve(gridCopy);
  return count;
}

function createPuzzle(solution: MiniSudokuGrid, cellsToRemove: number): MiniSudokuGrid {
  const puzzle = solution.map(row => [...row]);
  let removed = 0;
  const attempts: Set<string> = new Set();

  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    const key = `${row},${col}`;

    if (attempts.has(key) || puzzle[row][col] === 0) {
      continue;
    }

    attempts.add(key);
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const solutions = countSolutions(puzzle, 2);

    if (solutions === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }

    if (attempts.size >= GRID_SIZE * GRID_SIZE) {
      break;
    }
  }

  return puzzle;
}

const MINI_DIFFICULTY_SETTINGS: Record<MiniDifficulty, number> = {
  easy: 2,
  medium: 4,
  hard: 5
};

export function generateMiniSudokuPuzzle(difficulty: MiniDifficulty): { puzzle: MiniSudokuGrid; solution: MiniSudokuGrid } {
  const solution = generateCompleteSolution();
  const cellsToRemove = MINI_DIFFICULTY_SETTINGS[difficulty];
  const puzzle = createPuzzle(solution, cellsToRemove);

  return { puzzle, solution };
}

export function deepCopyMiniGrid(grid: MiniSudokuGrid): MiniSudokuGrid {
  return grid.map(row => [...row]);
}

export function isMiniGridComplete(grid: MiniSudokuGrid): boolean {
  return grid.every(row => row.every(cell => cell !== 0));
}

export function isValidMiniGrid(grid: MiniSudokuGrid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] !== 0) {
        const num = grid[row][col];
        grid[row][col] = 0;

        if (!isValidPlacement(grid, row, col, num)) {
          grid[row][col] = num;
          return false;
        }

        grid[row][col] = num;
      }
    }
  }

  return true;
}

export function getMiniConflicts(grid: MiniSudokuGrid, row: number, col: number): Set<string> {
  const conflicts = new Set<string>();
  const num = grid[row][col];

  if (num === 0) return conflicts;

  for (let x = 0; x < GRID_SIZE; x++) {
    if (x !== col && grid[row][x] === num) {
      conflicts.add(`${row},${x}`);
    }
    if (x !== row && grid[x][col] === num) {
      conflicts.add(`${x},${col}`);
    }
  }

  return conflicts;
}

export function getMiniCellsInSameGroup(row: number, col: number): Set<string> {
  const cells = new Set<string>();

  for (let x = 0; x < GRID_SIZE; x++) {
    if (x !== col) cells.add(`${row},${x}`);
    if (x !== row) cells.add(`${x},${col}`);
  }

  return cells;
}

export function getMiniHint(puzzle: MiniSudokuGrid, currentState: MiniSudokuGrid, solution: MiniSudokuGrid): { row: number; col: number; value: number } | null {
  const emptyCells: Array<{ row: number; col: number }> = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (puzzle[row][col] === 0 && currentState[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) return null;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  return {
    row: randomCell.row,
    col: randomCell.col,
    value: solution[randomCell.row][randomCell.col]
  };
}
