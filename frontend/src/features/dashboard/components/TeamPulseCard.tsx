import React from 'react';
import { Sparkles, Activity } from 'lucide-react';

interface TeamPulseCardProps {
  score?: number;
}

export function TeamPulseCard({ score = 92 }: TeamPulseCardProps) {
  return (
    <div className="glass-drop-card p-5 flex flex-col justify-between h-[124px] border border-emerald-500/20 bg-[#16161B]/80 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-emerald-400/90 flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-emerald-400" />
          Team Pulse
        </span>
        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F7]">
          {score}<span className="text-sm font-medium text-emerald-400 ml-0.5">%</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 font-mono text-[10.5px] px-2 py-0.5 border text-emerald-300 bg-emerald-950/40 border-emerald-800/40 font-semibold rounded-xs">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          CSAT Satisfaction (High)
        </span>
      </div>
    </div>
  );
}
