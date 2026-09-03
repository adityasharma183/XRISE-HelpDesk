import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { Search, Send, Check, Copy, Sparkles, Clock, AlertCircle } from 'lucide-react';
import {
  submitTicketSchema,
  checkStatusSchema,
  SubmitTicketFormData,
  CheckStatusFormData,
} from '../../tickets/schemas/ticket.schemas';
import { PublicTicketStatus, TicketPriority } from '../../tickets/types/ticket.types';
import { ticketApi } from '../../tickets/api/ticketApi';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { TicketStatusBadge } from '../../tickets/components/TicketStatusBadge';
import { TicketPriorityBadge } from '../../tickets/components/TicketPriorityBadge';
import { TicketProgressTracker } from '../../tickets/components/TicketProgressTracker';
import { AttachmentList } from '../../../components/ui/AttachmentList';
import { FileUploadInput } from '../../../components/ui/FileUploadInput';

interface UseCheckPublicStatusOptions {
  onSuccess?: (data: PublicTicketStatus) => void;
  onError?: (error: Error | { message?: string }) => void;
}

export const useCheckPublicStatusMutation = (
  options?: UseCheckPublicStatusOptions
): UseMutationResult<PublicTicketStatus, Error, CheckStatusFormData> => {
  return useMutation<PublicTicketStatus, Error, CheckStatusFormData>({
    mutationFn: (data: CheckStatusFormData) => ticketApi.checkPublicStatus(data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

interface UseSubmitPublicTicketOptions {
  onSuccess?: (data: { ticketId: string; subject: string }) => void;
  onError?: (error: Error | { message?: string }) => void;
}

export const useSubmitPublicTicketMutation = (
  options?: UseSubmitPublicTicketOptions
): UseMutationResult<
  { ticketId: string; subject: string },
  Error,
  SubmitTicketFormData | { data: SubmitTicketFormData; files?: File[] }
> => {
  return useMutation<
    { ticketId: string; subject: string },
    Error,
    SubmitTicketFormData | { data: SubmitTicketFormData; files?: File[] }
  >({
    mutationFn: (payload) => {
      if ('data' in payload) {
        return ticketApi.submitPublicTicket(payload.data, payload.files);
      }
      return ticketApi.submitPublicTicket(payload);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

interface CheckStatusCardProps {
  onSubmit: (data: CheckStatusFormData) => void;
  errorMessage: string | null;
}

export function CheckStatusCard({ onSubmit, errorMessage }: CheckStatusCardProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckStatusFormData>({
    resolver: zodResolver(checkStatusSchema),
    defaultValues: {
      ticketId: '',
      email: '',
    },
  });

  return (
    <div className="glass-drop-panel p-6 sm:p-8 space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs font-mono text-red-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Ticket ID"
          required
          placeholder="e.g. XR-9A2K4B"
          error={errors.ticketId?.message}
          {...register('ticketId')}
        />

        <Input
          label="Associated Email"
          type="email"
          required
          placeholder="e.g. user@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Lookup Telemetry</span>
        </Button>
      </form>
    </div>
  );
}

interface StatusResultCardProps {
  ticketStatus: PublicTicketStatus;
}

export function StatusResultCard({ ticketStatus }: StatusResultCardProps) {
  return (
    <div className="glass-drop-panel p-6 sm:p-8 space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C9B9A6]/15">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9B9A6] mb-1">
            Ticket #{ticketStatus.ticketId}
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#F5F5F7]">
            {ticketStatus.subject}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <TicketStatusBadge status={ticketStatus.status} />
          <span className="text-[#5A5A66]">·</span>
          <TicketPriorityBadge priority={ticketStatus.priority} />
        </div>
      </div>

      {/* Visual Lifecycle Progress Tracker */}
      <TicketProgressTracker status={ticketStatus.status} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-[#9E9EA8]">
        <div>
          <span className="text-[#70707C] block text-[10px] uppercase tracking-wider">Logged At</span>
          <span className="text-[#F5F5F7]">{new Date(ticketStatus.createdAt).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[#70707C] block text-[10px] uppercase tracking-wider">Last Telemetry Update</span>
          <span className="text-[#F5F5F7]">{new Date(ticketStatus.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      {ticketStatus.latestReply && (
        <div className="p-4 rounded-lg bg-[#16161B]/80 border border-[#C9B9A6]/20 space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#C9B9A6]">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Latest Response ({ticketStatus.latestReply.senderName})
            </span>
            <span className="text-[#70707C]">
              {new Date(ticketStatus.latestReply.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-[#F5F5F7] font-sans leading-relaxed whitespace-pre-wrap">
            {ticketStatus.latestReply.body}
          </p>
          <AttachmentList attachments={ticketStatus.latestReply.attachments} />
        </div>
      )}

      {!ticketStatus.latestReply && (
        <div className="p-4 rounded-lg bg-[#16161B]/50 border border-white/5 flex items-center gap-3 font-mono text-xs text-[#9E9EA8]">
          <Clock className="h-4 w-4 text-[#C9B9A6]" />
          <span>Ticket is currently in triage queue. An assigned agent or AI dispatch will respond shortly.</span>
        </div>
      )}
    </div>
  );
}

interface SubmitTicketCardProps {
  onSubmit: (data: SubmitTicketFormData, files?: File[]) => void;
  serverError: string | null;
}

export function SubmitTicketCard({ onSubmit, serverError }: SubmitTicketCardProps) {
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>('MEDIUM');
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
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

  const priorities: { value: TicketPriority; label: string }[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  return (
    <div className="glass-drop-panel p-6 sm:p-8 space-y-6">
      <form onSubmit={handleSubmit((data) => onSubmit(data, files))} className="space-y-4" noValidate>
        {serverError && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs font-mono text-red-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Sarah Connor"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. sarah@resistance.org"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <Input
          label="Subject"
          required
          placeholder="e.g. Assistance needed with telemetry node"
          error={errors.subject?.message}
          {...register('subject')}
        />

        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9B9A6]">
            Priority
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {priorities.map((p) => {
              const isSelected = selectedPriority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setSelectedPriority(p.value);
                    setValue('priority', p.value, { shouldValidate: true });
                  }}
                  className={`py-2.5 px-2 rounded-md border text-center font-mono text-xs uppercase font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#C9B9A6] bg-[#C9B9A6]/20 text-[#DFD5C6] shadow-[0_4px_16px_rgba(201,185,166,0.25)]'
                      : 'border-white/10 bg-[#16161B]/60 text-[#9E9EA8] hover:border-[#C9B9A6]/40'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <Textarea
          label="Issue Description"
          required
          rows={5}
          placeholder="Provide detailed information regarding your inquiry, error codes, or environment details..."
          error={errors.body?.message}
          {...register('body')}
        />

        <FileUploadInput
          files={files}
          onFilesChange={setFiles}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          <Send className="mr-2 h-4 w-4" />
          <span>Dispatch Support Request</span>
        </Button>
      </form>
    </div>
  );
}

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
    <div className="glass-drop-panel p-8 sm:p-10 space-y-6 text-center animate-in zoom-in-95">
      <div className="mx-auto h-12 w-12 rounded-full bg-[#C9B9A6]/15 border border-[#C9B9A6]/30 flex items-center justify-center text-[#DFD5C6]">
        <Sparkles className="h-6 w-6 text-[#C9B9A6]" />
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F5F5F7]">
          Ticket Successfully Dispatched
        </h2>
        <p className="text-xs sm:text-sm text-[#9E9EA8] max-w-md mx-auto font-sans leading-relaxed">
          Your support ticket has been received and indexed into our sovereign queue. Use your tracking ID below to check live status.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-[#111114]/90 border border-[#C9B9A6]/30 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md mx-auto shadow-inner">
        <div className="text-left font-mono">
          <span className="text-[10px] text-[#70707C] uppercase tracking-widest block">TELEMETRY TRACKING ID</span>
          <span className="text-lg sm:text-xl font-bold text-[#F5F5F7] tracking-wider">{ticketId}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="w-full sm:w-auto"
        >
          {isCopied ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              <span>Copy ID</span>
            </>
          )}
        </Button>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="font-mono text-xs uppercase tracking-wider text-[#9E9EA8] hover:text-[#DFD5C6] transition-colors cursor-pointer"
        >
          ← Submit another request
        </button>
      </div>
    </div>
  );
}
