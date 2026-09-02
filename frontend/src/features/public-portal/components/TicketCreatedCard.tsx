import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Check, Copy, ArrowRight, Sparkles } from 'lucide-react';

interface TicketCreatedCardProps {
  ticketId: string;
  isCopied: boolean;
  onCopy: () => void;
  onReset: () => void;
}

export function TicketCreatedCard({
  ticketId,
  isCopied,
  onCopy,
  onReset,
}: TicketCreatedCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#C9B9A6]/30 bg-[#111115]/80 p-8 sm:p-12 space-y-6 text-center backdrop-blur-[24px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.12),0_0_50px_rgba(201,185,166,0.08)] text-[#F5F5F7]">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-[#C9B9A6]/10 blur-3xl pointer-events-none" />

      {/* Success Monogram */}
      <div className="mx-auto h-16 w-16 rounded-md bg-[#C9B9A6]/15 text-[#C9B9A6] flex items-center justify-center border border-[#C9B9A6]/40 shadow-[0_8px_25px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]">
        <CheckCircle2 className="h-8 w-8 text-[#DFD5C6]" />
      </div>

      <div className="space-y-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9B9A6] bg-[#C9B9A6]/10 px-3 py-1 rounded-full border border-[#C9B9A6]/25">
          <Sparkles className="h-3 w-3" />
          <span>Ticket Dispatched &amp; Live</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#F5F5F7] tracking-tight">
          Request Registered <span className="text-[#C9B9A6] italic font-serif">Successfully</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#9E9EA8] max-w-md mx-auto font-sans leading-relaxed">
          Your inquiry has been stored in our sovereign database. You can track real-time agent dispatch and AI triage using your tracking ID below.
        </p>
      </div>

      {/* Sovereign Tracking ID Badge with Glass Drop */}
      <div className="p-6 rounded-md border border-[#C9B9A6]/30 bg-[#16161C]/90 backdrop-blur-md inline-flex flex-col items-center gap-2 max-w-sm mx-auto w-full shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] relative z-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9B9A6]">
          SOVEREIGN TELEMETRY ID
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-[#DFD5C6] select-all drop-shadow-sm">
            #{ticketId}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="p-2.5 rounded-sm border border-[#C9B9A6]/30 bg-[#111114] text-[#F5F5F7] hover:border-[#C9B9A6] text-xs font-mono transition-all cursor-pointer shadow-md hover:bg-[#C9B9A6]/10"
            title="Copy Ticket ID"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-[#C9B9A6]" />}
          </button>
        </div>
      </div>

      {/* Navigation CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 relative z-10">
        <Link to="/check-status" className="w-full sm:w-auto">
          <button
            type="button"
            className="w-full sm:w-auto border border-[#C9B9A6] bg-gradient-to-r from-[#DFD5C6] via-[#C9B9A6] to-[#B3A18C] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-black px-8 py-3.5 rounded-md transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(201,185,166,0.35)] hover:shadow-[0_12px_40px_rgba(201,185,166,0.5)] active:scale-95 cursor-pointer"
          >
            <span>Track status now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto border border-[#C9B9A6]/30 bg-[#16161B]/80 hover:border-[#C9B9A6] hover:bg-[#C9B9A6]/10 text-[#F5F5F7] font-mono text-xs uppercase tracking-[0.14em] px-6 py-3.5 rounded-md backdrop-blur-md transition-colors cursor-pointer shadow-md"
        >
          Submit another request
        </button>
      </div>
    </div>
  );
}
