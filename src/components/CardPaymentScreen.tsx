import React from 'react';
import { ContactIcon as ContactlessIcon, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';

interface CardPaymentScreenProps {
  amount: string;
  onCancel: () => void;
}

export function CardPaymentScreen({ amount, onCancel }: CardPaymentScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-2xl">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold mb-1">Please Pay</h2>
        <p className="text-4xl font-bold text-blue-600">{amount}</p>
      </div>

      <div className="relative w-full max-w-md aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-4">
            <ContactlessIcon className="w-12 h-12 text-white animate-pulse" />
            <CreditCard className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <img 
            src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png" 
            alt="Visa" 
            className="h-6 object-contain"
          />
          <img 
            src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png" 
            alt="Mastercard" 
            className="h-6 object-contain"
          />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm">Tap, insert, or swipe your card</p>
        <div className="flex justify-center space-x-2">
          <button
            onClick={onCancel}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm",
              "bg-gray-200 text-gray-800",
              "hover:bg-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-gray-400",
              "transition-colors"
            )}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}