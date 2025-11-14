import React from 'react';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  disabled: boolean;
}

export function NumberPad({ onNumberClick, disabled }: NumberPadProps) {
  return (
    <div className="grid grid-cols-5 gap-2 w-full max-w-md">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          disabled={disabled}
          className={`
            aspect-square rounded-lg text-2xl font-semibold
            transition-all duration-200
            ${
              disabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg'
            }
          `}
        >
          {num}
        </button>
      ))}
      <button
        onClick={() => onNumberClick(0)}
        disabled={disabled}
        className={`
          col-span-1 aspect-square rounded-lg text-lg font-semibold
          transition-all duration-200
          ${
            disabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-500 text-white hover:bg-slate-600 active:scale-95 shadow-md hover:shadow-lg'
          }
        `}
      >
        Clear
      </button>
    </div>
  );
}
