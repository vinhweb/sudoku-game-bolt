import React, { useCallback } from 'react';
import { SudokuCell } from './SudokuCell';
import { getCellsInSameGroup } from '../utils/sudoku-generator';

interface SudokuBoardProps {
  puzzle: number[][];
  currentState: number[][];
  selectedCell: { row: number; col: number } | null;
  getConflictingCells: (row: number, col: number) => Set<string>;
  getCellNotes: (row: number, col: number) => Set<number>;
  onCellClick: (row: number, col: number) => void;
}

export function SudokuBoard({
  puzzle,
  currentState,
  selectedCell,
  getConflictingCells,
  getCellNotes,
  onCellClick,
}: SudokuBoardProps) {
  const getHighlightedCells = useCallback((): Set<string> => {
    if (!selectedCell) return new Set();
    return getCellsInSameGroup(selectedCell.row, selectedCell.col);
  }, [selectedCell]);

  const highlightedCells = getHighlightedCells();

  return (
    <div className="inline-block bg-slate-400 p-1 rounded-lg shadow-2xl">
      <div className="grid grid-cols-9 gap-0 bg-white">
        {currentState.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const cellKey = `${rowIndex},${colIndex}`;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isHighlighted = highlightedCells.has(cellKey);
            const isPreFilled = puzzle[rowIndex][colIndex] !== 0;
            const conflictingCells = getConflictingCells(rowIndex, colIndex);
            const isConflicting = conflictingCells.size > 0;
            const notes = getCellNotes(rowIndex, colIndex);

            return (
              <SudokuCell
                key={cellKey}
                value={value}
                isPreFilled={isPreFilled}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isConflicting={isConflicting}
                notes={notes}
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
