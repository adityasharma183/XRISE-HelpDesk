import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { PublicTicketStatus } from '../../tickets/types/ticket.types';
import { formatDate } from '../../../lib/utils';

interface StatusResultCardProps {
  ticketStatus: PublicTicketStatus;
}

export function StatusResultCard({ ticketStatus }: StatusResultCardProps) {
  const steps = [
    { key: 'OPEN', label: 'Ticket Logged' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'OPEN': return 0;
      case 'IN_PROGRESS': return 1;
      case 'RESOLVED': return 2;
      case 'CLOSED': return 3;
      default: return 0;
    }
  };

  return (
    <div className="glass-drop-panel overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] space-y-6 text-[#F5F5F7]">
      {/* Header Bar */}
      <div className="px-6 sm:px-8 py-5 border-b border-[#C9B9A6]/15 flex flex-wrap items-center justify-between gap-3 bg-[#16161B]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-base sm:text-lg font-bold text-[#DFD5C6]">
            #{ticketStatus.ticketId}
          </span>
          <span className="font-mono text-[10.5px] font-bold uppercase px-2.5 py-0.5 bg-[#C9B9A6]/15 text-[#DFD5C6] border border-[#C9B9A6]/30">
            {ticketStatus.status}
          </span>
          <span className="font-mono text-[10.5px] font-bold uppercase px-2.5 py-0.5 bg-white/[0.04] text-[#9E9EA8] border border-white/10">
            {ticketStatus.priority}
          </span>
        </div>

        <span className="font-mono text-xs text-[#9E9EA8]">
          UPDATED: {formatDate(ticketStatus.updatedAt)}
        </span>
      </div>

      <div className="p-6 sm:p-8 pt-0 space-y-6">
        {/* Progress Lifecycle Bar */}
        <div className="space-y-3">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#C9B9A6] block">
            Resolution Lifecycle
          </span>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-1">
            {steps.map((step, idx) => {
              const currentIdx = getStepIndex(ticketStatus.status);
              const isCompleted = idx <= currentIdx;

              return (
                <div key={step.key} className="space-y-1.5 text-center">
                  <div
                    className={`h-1.5 transition-all ${
                      isCompleted ? 'bg-[#C9B9A6] shadow-[0_0_12px_rgba(201,185,166,0.5)]' : 'bg-white/10'
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] sm:text-[11px] uppercase tracking-wider block truncate ${
                      isCompleted ? 'text-[#F5F5F7] font-bold' : 'text-[#6E6E78]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject */}
        <div className="p-5 border border-[#C9B9A6]/20 bg-[#16161B]/80 space-y-1 backdrop-blur-md">
          <span className="font-mono text-[10px] font-bold uppercase text-[#C9B9A6] tracking-[0.16em] block">
            Subject
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[#F5F5F7]">{ticketStatus.subject}</h3>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs text-[#9E9EA8] py-3 border-y border-[#C9B9A6]/15">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#C9B9A6]" />
            <span>CREATED: {formatDate(ticketStatus.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#C9B9A6]" />
            <span>TELEMETRY SYNC: {formatDate(ticketStatus.updatedAt)}</span>
          </div>
        </div>

        {/* Latest Staff Response Section */}
        <div className="space-y-3">
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#C9B9A6] block">
            Latest Verified Response
          </span>

          {ticketStatus.latestReply ? (
            <div className="p-6 border border-[#C9B9A6]/30 bg-[#16161B]/90 space-y-3 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
                <span className="font-semibold text-[#F5F5F7] flex items-center gap-2 font-mono text-xs">
                  <div className="h-2 w-2 rounded-full bg-[#C9B9A6] animate-pulse" />
                  {ticketStatus.latestReply.senderName} (Verified Support Engineer)
                </span>
                <span className="font-mono text-[#9E9EA8] text-[11px]">
                  {formatDate(ticketStatus.latestReply.createdAt)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#F5F5F7] whitespace-pre-wrap leading-relaxed font-sans">
                {ticketStatus.latestReply.body}
              </p>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-[#C9B9A6]/20 bg-[#16161B]/40 text-center font-mono text-xs text-[#9E9EA8]">
              Our sovereign support engineers are actively reviewing your case telemetry and will respond shortly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
