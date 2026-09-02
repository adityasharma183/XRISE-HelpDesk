import React from 'react';
import { TicketPriority } from '../types/ticket.types';

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export function TicketPriorityBadge({ priority, className = '' }: TicketPriorityBadgeProps) {
  const config: Record<
    TicketPriority,
    { label: string; textClass: string }
  > = {
    LOW: {
      label: 'Low',
      textClass: 'text-[#9E9EA8]',
    },
    MEDIUM: {
      label: 'Medium',
      textClass: 'text-[#C9B9A6]',
    },
    HIGH: {
      label: 'High',
      textClass: 'text-orange-400 font-semibold',
    },
    URGENT: {
      label: 'Urgent',
      textClass: 'text-red-400 font-bold',
    },
  };

  const { label, textClass } = config[priority] || config.MEDIUM;

  return (
    <span
      role="status"
      aria-label={`Priority: ${label}`}
      className={`font-mono text-[10px] font-bold tracking-wider uppercase ${textClass} ${className}`}
    >
      {label}
    </span>
  );
}
