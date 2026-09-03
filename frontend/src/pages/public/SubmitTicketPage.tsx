import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  SubmitTicketCard,
  TicketCreatedCard,
  useSubmitPublicTicketMutation,
} from '../../features/public-portal';
import { SubmitTicketFormData } from '../../features/tickets/schemas/ticket.schemas';
import { ScrollReveal } from '../../components/common/ScrollReveal';

export function SubmitTicketPage() {
  const [createdTicket, setCreatedTicket] = useState<{ ticketId: string; subject: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C9B9A6', '#DFD5C6', '#0A0A0C', '#C25E1A'],
      });
    } catch {}
  };

  const submitMutation = useSubmitPublicTicketMutation({
    onSuccess: (res) => {
      setCreatedTicket(res);
      triggerConfetti();
    },
    onError: (err: any) => {
      setServerError(err.message || 'Failed to submit ticket. Please try again.');
    },
  });

  const onSubmit = (formData: SubmitTicketFormData, files?: File[]) => {
    setServerError(null);
    submitMutation.mutate({ data: formData, files });
  };

  const handleCopy = () => {
    if (!createdTicket) return;
    navigator.clipboard.writeText(createdTicket.ticketId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 text-[#F5F5F7]">
      {/* Sovereign Header */}
      <ScrollReveal direction="up" distance={16}>
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#C9B9A6] before:h-px before:w-[28px] before:bg-[#C25E1A] before:content-['']">
            <span>01 · TICKET INTAKE</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F5F7] tracking-tight">
            Submit a support <span className="text-[#C9B9A6] italic font-serif">request</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9E9EA8] max-w-md mx-auto font-sans leading-relaxed">
            Log an inquiry directly into our sovereign support queue with instant Gemini AI categorization and real-time telemetry tracking.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" distance={20} delay={0.08}>
        {createdTicket ? (
          <TicketCreatedCard
            ticketId={createdTicket.ticketId}
            isCopied={isCopied}
            onCopy={handleCopy}
            onReset={() => setCreatedTicket(null)}
          />
        ) : (
          <SubmitTicketCard
            onSubmit={onSubmit}
            serverError={serverError}
          />
        )}
      </ScrollReveal>
    </div>
  );
}
