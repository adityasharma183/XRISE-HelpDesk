import React from 'react';
import { MessageSquare, Clock, ShieldCheck, User } from 'lucide-react';
import { TicketMessage, TicketEvent } from '../types/ticket.types';
import { formatDate } from '../../../lib/utils';
import { AttachmentList } from '../../../components/ui/AttachmentList';

interface TicketTimelineProps {
  messages: TicketMessage[];
  events: TicketEvent[];
}

export function TicketTimeline({ messages, events }: TicketTimelineProps) {
  return (
    <div className="space-y-6 text-[#F5F5F7]">
      {/* Activity Timeline Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#C9B9A6] flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-[#C9B9A6]" />
            <span>Conversation Activity</span>
          </h3>
          <span className="font-mono text-[11px] text-[#9E9EA8]">
            {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
          </span>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => {
            const isAgent = msg.senderType === 'AGENT';
            const initials = msg.senderName
              .trim()
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={msg.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isAgent
                    ? 'bg-[#16161D]/90 border-[#C9B9A6]/25 shadow-[0_4px_20px_rgba(0,0,0,0.4)] ml-2 sm:ml-4'
                    : 'bg-[#111115]/80 border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-3 pb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-6 w-6 rounded-md flex items-center justify-center font-mono font-bold text-[10px] ${
                        isAgent
                          ? 'bg-[#C9B9A6] text-[#0A0A0C]'
                          : 'bg-[#24221F] text-[#DFD5C6] border border-white/10'
                      }`}
                    >
                      {initials}
                    </div>
                    <span className="font-sans font-semibold text-[#F5F5F7]">{msg.senderName}</span>
                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border ${
                        isAgent
                          ? 'bg-[#C9B9A6]/15 text-[#DFD5C6] border-[#C9B9A6]/30'
                          : 'bg-white/[0.04] text-[#9E9EA8] border-white/10'
                      }`}
                    >
                      {isAgent ? 'Support Engineer' : 'Customer'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#9E9EA8]">{formatDate(msg.createdAt)}</span>
                </div>

                <p className="text-sm text-[#F5F5F7] font-sans whitespace-pre-wrap leading-relaxed">
                  {msg.body}
                </p>

                <div className="mt-3">
                  <AttachmentList attachments={msg.attachments} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Events */}
      {events.length > 0 && (
        <div className="p-4 rounded-xl bg-[#111115]/60 border border-white/[0.06] space-y-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#C9B9A6]/80">
            <Clock className="h-3 w-3 text-[#C9B9A6]" />
            <span>Audit Event Log ({events.length})</span>
          </div>

          <div className="space-y-2 text-xs">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between py-1.5 px-2 rounded bg-white/[0.02] border border-white/[0.03] text-[#9E9EA8] font-mono text-[11px]"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#C9B9A6]" />
                  <span className="font-bold text-[#DFD5C6] uppercase">{evt.type}</span>
                  <span className="text-[#6E6E78]">by {evt.actor.name}</span>
                </span>
                <span className="text-[#6E6E78]">{formatDate(evt.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
