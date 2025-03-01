import React from 'react';
import { CreditCard, Zap, Coins } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaymentMethodProps {
  onSelect: (method: string) => void;
  selected: string;
}

export function PaymentMethod({ onSelect, selected }: PaymentMethodProps) {
  const methods = [
    { 
      id: 'card', 
      label: 'Card', 
      icon: CreditCard,
      baseColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      selectedColor: 'bg-gradient-to-br from-purple-100 to-purple-200',
      iconColor: 'text-purple-600',
      borderColor: 'hover:border-purple-400',
      selectedBorder: 'border-purple-500'
    },
    { 
      id: 'digital', 
      label: 'Digital Wallet', 
      icon: Zap,
      baseColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      selectedColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      borderColor: 'hover:border-blue-400',
      selectedBorder: 'border-blue-500'
    },
    { 
      id: 'cash', 
      label: 'eCash', 
      icon: Coins,
      baseColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      selectedColor: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      iconColor: 'text-emerald-600',
      borderColor: 'hover:border-emerald-400',
      selectedBorder: 'border-emerald-500'
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-0.5 p-0.5">
      {methods.map(({ id, label, icon: Icon, baseColor, selectedColor, iconColor, borderColor, selectedBorder }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={cn(
            "flex flex-col items-center p-1.5 rounded-md transition-all",
            "border-2",
            borderColor,
            selected === id
              ? cn(selectedColor, selectedBorder)
              : cn(baseColor, "border-transparent"),
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "transform hover:scale-105 transition-transform duration-200"
          )}
        >
          <Icon className={cn(
            "w-5 h-5 mb-0.5",
            iconColor
          )} />
          <span className={cn(
            "text-xs font-medium",
            iconColor
          )}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}