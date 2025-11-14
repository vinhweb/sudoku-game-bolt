import React from 'react';

interface MiniNumberPadProps {
  onNumberClick: (num: number) => void;
  disabled: boolean;
}

export function MiniNumberPad({ onNumberClick, disabled }: MiniNumberPadProps) {
  return (
    <div className="flex gap-3 w-full max-w-md justify-center">
      {[1, 2, 3].map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          disabled={disabled}
          className={`
            w-24 h-24 rounded-xl text-3xl font-semibold
            transition-all duration-200
            ${
              disabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl'
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
          w-24 h-24 rounded-xl text-xl font-semibold
          transition-all duration-200
          ${
            disabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-500 text-white hover:bg-slate-600 active:scale-95 shadow-lg hover:shadow-xl'
          }
        `}
      >
        Clear
      </button>
    </div>
  );
}
