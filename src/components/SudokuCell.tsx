import React from 'react';

interface SudokuCellProps {
  value: number;
  isPreFilled: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isConflicting: boolean;
  notes: Set<number>;
  onClick: () => void;
  row: number;
  col: number;
}

export function SudokuCell({
  value,
  isPreFilled,
  isSelected,
  isHighlighted,
  isConflicting,
  notes,
  onClick,
  row,
  col,
}: SudokuCellProps) {
  const isRightBorder = (col + 1) % 3 === 0 && col !== 8;
  const isBottomBorder = (row + 1) % 3 === 0 && row !== 8;

  const cellClasses = `
    aspect-square flex items-center justify-center cursor-pointer
    transition-all duration-200 ease-in-out
    ${isPreFilled ? 'bg-slate-100 font-semibold text-slate-800' : 'bg-white text-blue-600'}
    ${isSelected ? 'ring-3 ring-blue-500 ring-inset bg-blue-50' : ''}
    ${isHighlighted && !isSelected ? 'bg-blue-50' : ''}
    ${isConflicting ? 'bg-red-50 text-red-600' : ''}
    ${isRightBorder ? 'border-r-4 border-slate-400' : 'border-r border-slate-300'}
    ${isBottomBorder ? 'border-b-4 border-slate-400' : 'border-b border-slate-300'}
    ${col === 0 ? 'border-l-4 border-slate-400' : ''}
    ${row === 0 ? 'border-t-4 border-slate-400' : ''}
    hover:bg-blue-50
  `.trim();

  return (
    <div
      className={cellClasses}
      onClick={onClick}
    >
      {value !== 0 ? (
        <span className="text-2xl font-medium">{value}</span>
      ) : notes.size > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div
              key={num}
              className="flex items-center justify-center text-[10px] text-slate-500"
            >
              {notes.has(num) ? num : ''}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
