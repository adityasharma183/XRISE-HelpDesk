import React from 'react';
import { Sparkles } from 'lucide-react';

interface TeamPulseCardProps {
  score?: number;
}

export function TeamPulseCard({ score = 92 }: TeamPulseCardProps) {
  return (
    <div className="bg-[#0c2e28] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between h-[120px] relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-emerald-200/80">Team pulse</span>
        <Sparkles className="h-4 w-4 text-emerald-400" />
      </div>

      <div>
        <div className="text-3xl font-bold tracking-tight text-white font-sans">
          {score}%
        </div>
        <div className="text-[11px] text-emerald-200/70 font-normal">
          customer satisfaction
        </div>
      </div>
    </div>
  );
}
