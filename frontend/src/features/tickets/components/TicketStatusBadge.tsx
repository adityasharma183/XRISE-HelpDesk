import React from 'react';
import { TicketStatus } from '../types/ticket.types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function TicketStatusBadge({ status, className = '', size = 'md' }: TicketStatusBadgeProps) {
  const config: Record<
    TicketStatus,
    { label: string; dotColor: string; badgeStyle: string; pulse?: boolean }
  > = {
    OPEN: {
      label: 'Open',
      dotColor: 'bg-rose-400',
      badgeStyle: 'bg-rose-950/40 text-rose-300 border-rose-500/30',
      pulse: true,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      dotColor: 'bg-[#C9B9A6]',
      badgeStyle: 'bg-[#C9B9A6]/15 text-[#DFD5C6] border-[#C9B9A6]/30',
      pulse: false,
    },
    RESOLVED: {
      label: 'Resolved',
      dotColor: 'bg-emerald-400',
      badgeStyle: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
      pulse: false,
    },
    CLOSED: {
      label: 'Closed',
      dotColor: 'bg-zinc-400',
      badgeStyle: 'bg-zinc-900/60 text-zinc-400 border-zinc-700/40',
      pulse: false,
    },
  };

  const { label, dotColor, badgeStyle, pulse } = config[status] || config.OPEN;

  const sizeStyles = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      role="status"
      aria-label={`Ticket status: ${label}`}
      className={`inline-flex items-center rounded-md font-mono font-medium border ${badgeStyle} ${sizeStyles} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </span>
  );
}
