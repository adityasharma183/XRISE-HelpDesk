import React, { useState } from 'react';
import {
  CheckStatusCard,
  StatusResultCard,
  useCheckPublicStatusMutation,
} from '../../features/public-portal';
import {
  CheckStatusFormData,
} from '../../features/tickets/schemas/ticket.schemas';
import {
  PublicTicketStatus,
} from '../../features/tickets/types/ticket.types';
import { ScrollReveal } from '../../components/common/ScrollReveal';

export function CheckStatusPage() {
  const [ticketStatus, setTicketStatus] = useState<PublicTicketStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkMutation = useCheckPublicStatusMutation({
    onSuccess: (res) => {
      setTicketStatus(res);
    },
    onError: (err: any) => {
      setErrorMessage(
        err.message || 'No matching ticket found. Please ensure the Ticket ID and Email match exactly.'
      );
    },
  });

  const onSubmit = (formData: CheckStatusFormData) => {
    setErrorMessage(null);
    setTicketStatus(null);
    checkMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 text-[#F5F5F7]">
      {/* Sovereign Header */}
      <ScrollReveal direction="up" distance={16}>
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#C9B9A6] before:h-px before:w-[28px] before:bg-[#C25E1A] before:content-['']">
            <span>02 · TELEMETRY VERIFICATION</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F5F7] tracking-tight">
            Track ticket <span className="text-[#C9B9A6] italic font-serif">status</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9E9EA8] max-w-md mx-auto font-sans leading-relaxed">
            Enter your Ticket ID and associated email address to view real-time resolution telemetry and verified responses.
          </p>
        </div>
      </ScrollReveal>

      {/* Lookup Card Form */}
      <ScrollReveal direction="up" distance={20} delay={0.08}>
        <CheckStatusCard
          onSubmit={onSubmit}
          errorMessage={errorMessage}
        />
      </ScrollReveal>

      {/* Ticket Details Result Card */}
      {ticketStatus && (
        <ScrollReveal direction="up" distance={20} delay={0.05}>
          <StatusResultCard ticketStatus={ticketStatus} />
        </ScrollReveal>
      )}
    </div>
  );
}
