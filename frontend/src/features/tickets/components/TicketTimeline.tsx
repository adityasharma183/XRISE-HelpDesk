import React from 'react';
import { MessageSquare, Clock, Sparkles } from 'lucide-react';
import { TicketMessage, TicketEvent } from '../types/ticket.types';
import { formatDate } from '../../../lib/utils';

interface TicketTimelineProps {
  messages: TicketMessage[];
  events: TicketEvent[];
}

export function TicketTimeline({ messages, events }: TicketTimelineProps) {
  return (
    <div className="space-y-4">
      {/* Activity Timeline Stream */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
          Conversation &amp; Audit Timeline
        </h3>

        <div className="space-y-3">
          {messages.map((msg) => {
            const isAgent = msg.senderType === 'AGENT';
            return (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border transition-all ${
                  isAgent
                    ? 'bg-blue-50/40 border-blue-200/80 ml-4'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isAgent ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {msg.senderName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-900">{msg.senderName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isAgent ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isAgent ? 'Support Engineer' : 'Customer'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {msg.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Events */}
      {events.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">
            Audit Event History
          </span>
          <div className="space-y-1.5 text-xs text-gray-500">
            {events.map((evt) => (
              <div key={evt.id} className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="font-semibold text-gray-800">{evt.type}</span> by {evt.actor.name}
                </span>
                <span className="text-[10px] text-gray-400">{formatDate(evt.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
