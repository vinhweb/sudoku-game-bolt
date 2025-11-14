import React, { useCallback } from 'react';
import { MiniSudokuCell } from './MiniSudokuCell';
import { getMiniCellsInSameGroup } from '../utils/mini-sudoku-generator';

interface MiniSudokuBoardProps {
  puzzle: number[][];
  currentState: number[][];
  selectedCell: { row: number; col: number } | null;
  getConflictingCells: (row: number, col: number) => Set<string>;
  onCellClick: (row: number, col: number) => void;
}

export function MiniSudokuBoard({
  puzzle,
  currentState,
  selectedCell,
  getConflictingCells,
  onCellClick,
}: MiniSudokuBoardProps) {
  const getHighlightedCells = useCallback((): Set<string> => {
    if (!selectedCell) return new Set();
    return getMiniCellsInSameGroup(selectedCell.row, selectedCell.col);
  }, [selectedCell]);

  const highlightedCells = getHighlightedCells();

  return (
    <div className="inline-block bg-slate-400 p-2 rounded-xl shadow-2xl">
      <div className="grid grid-cols-3 gap-0 bg-white">
        {currentState.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const cellKey = `${rowIndex},${colIndex}`;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isHighlighted = highlightedCells.has(cellKey);
            const isPreFilled = puzzle[rowIndex][colIndex] !== 0;
            const conflictingCells = getConflictingCells(rowIndex, colIndex);
            const isConflicting = conflictingCells.size > 0;

            return (
              <MiniSudokuCell
                key={cellKey}
                value={value}
                isPreFilled={isPreFilled}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isConflicting={isConflicting}
                onClick={() => onCellClick(rowIndex, colIndex)}
                row={rowIndex}
                col={colIndex}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
