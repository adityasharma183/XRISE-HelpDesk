import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from '../types/ticket.types';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { formatRelativeTime } from '../../../lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  categoryName?: string;
}

export function TicketCard({ ticket, categoryName }: TicketCardProps) {
  const getCategory = () => {
    if (categoryName) return categoryName;
    const sub = ticket.subject.toLowerCase();
    if (sub.includes('invoice') || sub.includes('charge') || sub.includes('billing')) return 'Billing';
    if (sub.includes('sso') || sub.includes('domain') || sub.includes('saml')) return 'Technical';
    return 'Account';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Link
      to={`/agent/tickets/${ticket.ticketId}`}
      className="group block relative glass-drop-card p-4 sm:p-5 transition-all text-[#F5F5F7]"
    >
      {/* Active Dark Beige line indicator on hover */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-[#C9B9A6] opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-bold text-[#DFD5C6]">
          #{ticket.ticketId}
        </span>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Subject */}
      <h4 className="text-sm font-semibold text-[#F5F5F7] group-hover:text-[#C9B9A6] line-clamp-1 mb-3 transition-colors font-sans">
        {ticket.subject}
      </h4>

      {/* Bottom Metadata Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#9E9EA8] pt-2 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Avatar circle */}
          <div className="h-5 w-5 bg-[#C9B9A6] text-[#0A0A0C] flex items-center justify-center font-mono font-bold text-[10px] shrink-0 rounded-xs shadow-xs">
            {getInitials(ticket.customer.name)}
          </div>
          <span className="font-medium text-[#F5F5F7] truncate max-w-[140px] sm:max-w-none">{ticket.customer.name}</span>
          <span className="text-[#5A5A66]">•</span>
          <span className="text-[#C9B9A6] font-mono text-[11px] uppercase">{getCategory()}</span>
          <span className="text-[#5A5A66]">•</span>
          <span className="text-[#9E9EA8] font-mono text-[11px]">{formatRelativeTime(ticket.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {ticket.assignee ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold text-[#DFD5C6] bg-[#16161B] px-2.5 py-0.5 border border-[#C9B9A6]/25">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9B9A6]" />
              {ticket.assignee.name.split(' ')[0]}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5">
              Unassigned
            </span>
          )}
          <TicketPriorityBadge priority={ticket.priority} />
        </div>
      </div>
    </Link>
  );
}
