import React from 'react';
import { TicketStatus } from '../types/ticket.types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function TicketStatusBadge({ status, className = '' }: TicketStatusBadgeProps) {
  const config: Record<
    TicketStatus,
    { label: string; dotColor: string; textColor: string }
  > = {
    OPEN: {
      label: 'Open',
      dotColor: 'bg-red-400',
      textColor: 'text-red-400',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      dotColor: 'bg-[#C9B9A6]',
      textColor: 'text-[#DFD5C6]',
    },
    RESOLVED: {
      label: 'Resolved',
      dotColor: 'bg-emerald-400',
      textColor: 'text-emerald-400',
    },
    CLOSED: {
      label: 'Closed',
      dotColor: 'bg-gray-400',
      textColor: 'text-[#9E9EA8]',
    },
  };

  const { label, dotColor, textColor } = config[status] || config.OPEN;

  return (
    <span
      role="status"
      aria-label={`Ticket status: ${label}`}
      className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold ${textColor} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
