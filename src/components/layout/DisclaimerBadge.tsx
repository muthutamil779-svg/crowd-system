import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface DisclaimerBadgeProps {
  compact?: boolean;
}

export const DisclaimerBadge: React.FC<DisclaimerBadgeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1 rounded-full">
        <Info className="w-3.5 h-3.5 text-amber-800 flex-shrink-0" />
        <span>AI freshness is an estimate. Manufacturer dates & sensory checks take priority.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-950/80">
      <ShieldAlert className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-900">Safety & Freshness Notice</p>
        <p className="mt-0.5 leading-relaxed">
          SmartKitchen AI estimates shelf-life using visual signals to minimize food waste. Official manufacturer use-by dates and common-sense food safety practices always supersede AI predictions.
        </p>
      </div>
    </div>
  );
};
