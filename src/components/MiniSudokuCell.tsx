import React from 'react';

interface MiniSudokuCellProps {
  value: number;
  isPreFilled: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isConflicting: boolean;
  onClick: () => void;
  row: number;
  col: number;
}

export function MiniSudokuCell({
  value,
  isPreFilled,
  isSelected,
  isHighlighted,
  isConflicting,
  onClick,
  row,
  col,
}: MiniSudokuCellProps) {
  const isRightBorder = col === 2;
  const isBottomBorder = row === 2;
  const isLeftBorder = col === 0;
  const isTopBorder = row === 0;

  const cellClasses = `
    aspect-square flex items-center justify-center cursor-pointer
    transition-all duration-200 ease-in-out
    ${isPreFilled ? 'bg-slate-100 font-semibold text-slate-800' : 'bg-white text-blue-600'}
    ${isSelected ? 'ring-4 ring-blue-500 ring-inset bg-blue-50' : ''}
    ${isHighlighted && !isSelected ? 'bg-blue-50' : ''}
    ${isConflicting ? 'bg-red-50 text-red-600' : ''}
    ${isRightBorder ? 'border-r-4 border-slate-400' : 'border-r-2 border-slate-300'}
    ${isBottomBorder ? 'border-b-4 border-slate-400' : 'border-b-2 border-slate-300'}
    ${isLeftBorder ? 'border-l-4 border-slate-400' : ''}
    ${isTopBorder ? 'border-t-4 border-slate-400' : ''}
    hover:bg-blue-50
  `.trim();

  return (
    <div className={cellClasses} onClick={onClick}>
      {value !== 0 && <span className="text-4xl font-medium">{value}</span>}
    </div>
  );
}
