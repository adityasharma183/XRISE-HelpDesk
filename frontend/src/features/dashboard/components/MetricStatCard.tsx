import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricStatCardProps {
  title: string;
  count: number | string;
  changeText: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  valueUnit?: string;
}

export function MetricStatCard({
  title,
  count,
  changeText,
  changeType = 'positive',
  valueUnit,
}: MetricStatCardProps) {
  const isPositive = changeType === 'positive';

  return (
    <div className="glass-drop-card p-5 flex flex-col justify-between h-[124px]">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#C9B9A6]/80">{title}</span>
        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F7]">
          {count}
          {valueUnit && <span className="text-sm font-medium text-[#C9B9A6] ml-0.5">{valueUnit}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 font-mono text-[10.5px] px-2 py-0.5 border ${
            isPositive
              ? 'text-[#DFD5C6] bg-[#C9B9A6]/15 border-[#C9B9A6]/30 font-semibold'
              : 'text-amber-300 bg-amber-950/40 border-amber-800/40 font-semibold'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-[#C9B9A6]" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {changeText}
        </span>
      </div>
    </div>
  );
}
