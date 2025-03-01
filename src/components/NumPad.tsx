import React from 'react';
import { cn } from '../lib/utils';

interface NumPadProps {
  onNumberClick: (num: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function NumPad({ onNumberClick, onClear, onSubmit }: NumPadProps) {
  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-gray-50 rounded-lg">
      {buttons.map((btn) => (
        <button
          key={btn}
          onClick={() => btn === '⌫' ? onClear() : onNumberClick(btn)}
          className={cn(
            "p-3 text-lg font-semibold rounded-md transition-colors",
            "hover:bg-gray-200 active:bg-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "aria-pressed:bg-gray-300",
            btn === '⌫' ? 'text-red-600' : 'text-gray-800'
          )}
          aria-label={btn === '⌫' ? 'Backspace' : btn}
        >
          {btn}
        </button>
      ))}
      <button
        onClick={onSubmit}
        className={cn(
          "col-span-3 p-3 mt-1 text-lg font-semibold rounded-md",
          "bg-blue-600 text-white",
          "hover:bg-blue-700 active:bg-blue-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          "transition-colors"
        )}
      >
        Pay
      </button>
    </div>
  );
}