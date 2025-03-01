import React from 'react';
import { Shield, ShieldCheck, Lock } from 'lucide-react';

export function SecurityIndicator() {
  return (
    <div className="flex items-center justify-center space-x-2 p-1 bg-gray-50 rounded-md">
      <div className="flex items-center text-green-600">
        <ShieldCheck className="w-3 h-3" />
        <span className="text-xs ml-1">PCI</span>
      </div>
      <div className="flex items-center text-green-600">
        <Lock className="w-3 h-3" />
        <span className="text-xs ml-1">SSL</span>
      </div>
      <div className="flex items-center text-green-600">
        <Shield className="w-3 h-3" />
        <span className="text-xs ml-1">Secure</span>
      </div>
    </div>
  );
}