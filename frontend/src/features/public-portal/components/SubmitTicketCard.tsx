import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { AlertTriangle, Send, Loader2, Sparkles } from 'lucide-react';
import { submitTicketSchema, SubmitTicketFormData } from '../../tickets/schemas/ticket.schemas';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';

interface SubmitTicketCardProps {
  onSubmit: (data: SubmitTicketFormData) => Promise<void> | void;
  serverError?: string | null;
}

export function SubmitTicketCard({ onSubmit, serverError }: SubmitTicketCardProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubmitTicketFormData>({
    resolver: zodResolver(submitTicketSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      body: '',
      priority: 'MEDIUM',
    },
  });

  const currentPriority = watch('priority');
  const bodyText = watch('body') || '';

  const priorities = [
    { value: 'LOW', label: 'Low', desc: 'General question' },
    { value: 'MEDIUM', label: 'Medium', desc: 'Standard response' },
    { value: 'HIGH', label: 'High', desc: 'Impaired workflow' },
    { value: 'URGENT', label: 'Urgent', desc: 'Critical blocker' },
  ] as const;

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#C9B9A6]/25 bg-[#111115]/80 p-6 sm:p-10 backdrop-blur-[24px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.1),0_0_50px_rgba(201,185,166,0.06)] space-y-6">
      {/* Ambient glass drop lighting overlay */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C9B9A6]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#C25E1A]/05 blur-3xl pointer-events-none" />

      {serverError && (
        <div role="alert" className="p-4 rounded-md border border-red-500/40 bg-red-950/50 text-red-300 text-xs flex items-start gap-2.5 font-mono backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <div>{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10" noValidate>
        {/* Name & Email Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your name"
            required
            placeholder="e.g. Maya Chen"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email address"
            type="email"
            required
            placeholder="e.g. maya@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Subject Input */}
        <Input
          label="Subject"
          required
          placeholder="Brief description of the issue"
          error={errors.subject?.message}
          {...register('subject')}
        />

        {/* Priority Selector with Glass Drop Tiles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9B9A6]">
              Priority level
            </label>
            <span className="font-mono text-[10px] uppercase text-[#9E9EA8] tracking-wider">
              Selected: <strong className="text-[#DFD5C6]">{currentPriority}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {priorities.map((p) => {
              const isSelected = currentPriority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setValue('priority', p.value, { shouldValidate: true })}
                  className={`p-3.5 rounded-md border text-left transition-all duration-300 cursor-pointer backdrop-blur-md relative ${
                    isSelected
                      ? 'border-[#C9B9A6] bg-[#C9B9A6]/20 text-[#DFD5C6] shadow-[0_8px_25px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25),0_0_20px_rgba(201,185,166,0.2)]'
                      : 'border-white/10 bg-[#16161C]/60 hover:border-[#C9B9A6]/40 hover:bg-white/[0.04] text-[#9E9EA8] shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#C9B9A6] shadow-[0_0_8px_#C9B9A6]" />
                  )}
                  <div className={`text-xs font-mono font-bold ${isSelected ? 'text-[#C9B9A6]' : 'text-[#F5F5F7]'}`}>
                    {p.label}
                  </div>
                  <div className="text-[10px] text-[#7E7E8A] mt-0.5 font-sans">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Issue Description */}
        <div className="space-y-1.5">
          <Textarea
            label="Issue description"
            required
            rows={5}
            placeholder="Provide complete details, error messages, or steps to reproduce..."
            error={errors.body?.message}
            {...register('body')}
          />
          <div className="flex items-center justify-between text-[10px] text-[#70707C] font-mono">
            <span className="flex items-center gap-1 text-[#C9B9A6]/80">
              <Sparkles className="h-3 w-3 text-[#C9B9A6]" />
              AI auto-triage will evaluate intent &amp; sentiment
            </span>
            <span>{bodyText.length} / 5000 chars</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#C9B9A6]/15 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-[#9E9EA8] hover:text-[#F5F5F7] text-center transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto border border-[#C9B9A6] bg-gradient-to-r from-[#DFD5C6] via-[#C9B9A6] to-[#B3A18C] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-black px-8 py-3.5 rounded-md transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(201,185,166,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_40px_rgba(201,185,166,0.5)] disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0C]" />
                <span>Dispatching ticket...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Submit ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
