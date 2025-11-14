export type SudokuGrid = number[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const GRID_SIZE = 9;
const BOX_SIZE = 3;

function isValidPlacement(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[row][x] === num || grid[x][col] === num) {
      return false;
    }
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (grid[boxRow + i][boxCol + j] === num) {
        return false;
      }
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

function solveSudoku(grid: SudokuGrid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;

            if (solveSudoku(grid)) {
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

function generateCompleteSolution(): SudokuGrid {
  const grid: SudokuGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  solveSudoku(grid);
  return grid;
}

function countSolutions(grid: SudokuGrid, limit: number = 2): number {
  let count = 0;

  function solve(g: SudokuGrid): boolean {
    if (count >= limit) return true;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (g[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
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

function createPuzzle(solution: SudokuGrid, cellsToRemove: number): SudokuGrid {
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

const DIFFICULTY_SETTINGS: Record<Difficulty, number> = {
  easy: 35,
  medium: 45,
  hard: 52,
  expert: 58
};

export function generateSudokuPuzzle(difficulty: Difficulty): { puzzle: SudokuGrid; solution: SudokuGrid } {
  const solution = generateCompleteSolution();
  const cellsToRemove = DIFFICULTY_SETTINGS[difficulty];
  const puzzle = createPuzzle(solution, cellsToRemove);

  return { puzzle, solution };
}

export function deepCopyGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map(row => [...row]);
}

export function isGridComplete(grid: SudokuGrid): boolean {
  return grid.every(row => row.every(cell => cell !== 0));
}

export function isValidGrid(grid: SudokuGrid): boolean {
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

export function getConflicts(grid: SudokuGrid, row: number, col: number): Set<string> {
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

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      const r = boxRow + i;
      const c = boxCol + j;
      if ((r !== row || c !== col) && grid[r][c] === num) {
        conflicts.add(`${r},${c}`);
      }
    }
  }

  return conflicts;
}

export function getCellsInSameGroup(row: number, col: number): Set<string> {
  const cells = new Set<string>();

  for (let x = 0; x < GRID_SIZE; x++) {
    if (x !== col) cells.add(`${row},${x}`);
    if (x !== row) cells.add(`${x},${col}`);
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      const r = boxRow + i;
      const c = boxCol + j;
      if (r !== row || c !== col) {
        cells.add(`${r},${c}`);
      }
    }
  }

  return cells;
}

export function getHint(puzzle: SudokuGrid, currentState: SudokuGrid, solution: SudokuGrid): { row: number; col: number; value: number } | null {
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
