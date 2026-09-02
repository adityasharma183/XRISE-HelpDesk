import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, AlertCircle } from 'lucide-react';
import { checkStatusSchema, CheckStatusFormData } from '../../tickets/schemas/ticket.schemas';
import { Input } from '../../../components/ui/Input';

interface CheckStatusCardProps {
  onSubmit: (data: CheckStatusFormData) => Promise<void> | void;
  errorMessage?: string | null;
}

export function CheckStatusCard({ onSubmit, errorMessage }: CheckStatusCardProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckStatusFormData>({
    resolver: zodResolver(checkStatusSchema),
    defaultValues: {
      ticketId: '',
      email: '',
    },
  });

  const handleQuickLookup = (ticketId: string, email: string) => {
    setValue('ticketId', ticketId, { shouldValidate: true });
    setValue('email', email, { shouldValidate: true });
  };

  return (
    <div className="glass-drop-panel p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] space-y-6">
      {errorMessage && (
        <div role="alert" className="p-4 border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ticket ID"
            required
            placeholder="e.g. XR-9A2K4B"
            className="font-mono uppercase font-semibold text-[#DFD5C6]"
            error={errors.ticketId?.message}
            {...register('ticketId')}
          />

          <Input
            label="Email address"
            type="email"
            required
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#C9B9A6]/15">
          <div className="flex items-center gap-2 text-xs text-[#9E9EA8] flex-wrap">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#70707C]">Quick Demo:</span>
            <button
              type="button"
              onClick={() => handleQuickLookup('XR-9A2K4B', 'alice.johnson@example.com')}
              className="font-mono text-[11px] text-[#C9B9A6] hover:bg-[#C9B9A6]/15 border border-[#C9B9A6]/25 bg-[#16161B] px-2.5 py-1 transition-colors cursor-pointer"
            >
              XR-9A2K4B
            </button>
            <button
              type="button"
              onClick={() => handleQuickLookup('XR-5H1L8Z', 'marcus.v@innovate.net')}
              className="font-mono text-[11px] text-[#C9B9A6] hover:bg-[#C9B9A6]/15 border border-[#C9B9A6]/25 bg-[#16161B] px-2.5 py-1 transition-colors cursor-pointer"
            >
              XR-5H1L8Z
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-8 py-3.5 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(201,185,166,0.3)] disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            {isSubmitting ? 'Checking...' : 'Check status'}
          </button>
        </div>
      </form>
    </div>
  );
}
