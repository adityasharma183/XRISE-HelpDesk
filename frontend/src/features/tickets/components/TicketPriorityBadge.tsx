import React from 'react';
import { TicketPriority } from '../types/ticket.types';

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
  size?: 'sm' | 'md';
}

export function TicketPriorityBadge({ priority, className = '', size = 'md' }: TicketPriorityBadgeProps) {
  const config: Record<
    TicketPriority,
    { label: string; badgeStyle: string; indicatorDot: string }
  > = {
    LOW: {
      label: 'Low',
      badgeStyle: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/50',
      indicatorDot: 'bg-zinc-400',
    },
    MEDIUM: {
      label: 'Medium',
      badgeStyle: 'bg-[#C9B9A6]/10 text-[#DFD5C6] border-[#C9B9A6]/25',
      indicatorDot: 'bg-[#C9B9A6]',
    },
    HIGH: {
      label: 'High',
      badgeStyle: 'bg-amber-950/40 text-amber-300 border-amber-500/30 font-semibold',
      indicatorDot: 'bg-amber-400',
    },
    URGENT: {
      label: 'Urgent',
      badgeStyle: 'bg-rose-950/50 text-rose-300 border-rose-500/40 font-bold shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      indicatorDot: 'bg-rose-400 animate-pulse',
    },
  };

  const { label, badgeStyle, indicatorDot } = config[priority] || config.MEDIUM;

  const sizeStyles = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-0.5 gap-1.5';

  return (
    <span
      role="status"
      aria-label={`Priority: ${label}`}
      className={`inline-flex items-center rounded-md font-mono uppercase tracking-wider border ${badgeStyle} ${sizeStyles} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${indicatorDot}`} />
      <span>{label}</span>
    </span>
  );
}
